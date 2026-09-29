require('dotenv').config();
const OpenAI = require('openai');
const { detectEmergency } = require('./emergency');

const provider = process.env.AI_PROVIDER || 'ollama';

let aiClient;
if (provider === 'gemini') {
    console.log("☁️ AI Mode Active: Cloud Gemini (Native API - 3.5 Flash)");
} else if (provider === 'nvidia') {
    aiClient = new OpenAI({
        apiKey: process.env.NVIDIA_API_KEY,
        baseURL: "https://integrate.api.nvidia.com/v1",
        timeout: 60000
    });
    console.log("🟢 AI Mode Active: Cloud NVIDIA NIM API");
} else {
    aiClient = new OpenAI({
        apiKey: "ollama",
        baseURL: process.env.OLLAMA_URL || "http://localhost:11434/v1",
        timeout: 60000 
    });
    console.log("🦙 AI Mode Active: Local Llama 3.2"); 
}

function buildSystemPrompt(knowledge, attendeeName) {
    const nameLine = attendeeName ? `The attendee you are talking to is named ${attendeeName}.` : `You don't know the attendee's name.`;
    return `You are a helpful event assistant. ${nameLine} 
Use the static knowledge below OR your available function tools to answer questions.
Static Knowledge:
${knowledge}

Keep your final answer short and direct (under 160 characters).`;
}

// ---------------------------------------------------------------------
// 1. DEFINE THE TOOLS (What the AI is allowed to do)
// ---------------------------------------------------------------------
const aiTools = [
    {
        type: "function",
        function: {
            name: "check_current_schedule",
            description: "Check the database for schedule items happening right now or coming up next.",
            parameters: { type: "object", properties: {}, required: [] }
        }
    },
    {
        type: "function",
        function: {
            name: "check_task_status",
            description: "Check the live status of an operational task by its ID.",
            parameters: {
                type: "object",
                properties: {
                    task_id: { type: "number", description: "The task ID to check (e.g. 3)" }
                },
                required: ["task_id"]
            }
        }
    }
];

// ---------------------------------------------------------------------
// 2. EXECUTE THE TOOLS (Running the actual code when AI asks)
// ---------------------------------------------------------------------
async function executeToolCall(functionName, functionArgs, liveContext) {
    console.log(`🛠️ AI triggered tool: ${functionName} with args:`, functionArgs);
    
    if (functionName === 'check_task_status') {
        const taskId = parseInt(functionArgs.task_id);
        const task = liveContext.tasks.find(t => t.id === taskId);
        if (!task) return JSON.stringify({ error: `Task #${taskId} does not exist.` });
        return JSON.stringify({ task_id: task.id, description: task.description, is_completed: task.completed });
    }
    
    if (functionName === 'check_current_schedule') {
        if (!liveContext.eventId) return JSON.stringify({ error: "No specific event ID found for this attendee." });
        
        const now = new Date().toISOString(); 
        const { data, error } = await liveContext.supabase
            .from('schedule_items')
            .select('title, speaker, location, start_time, end_time')
            .eq('event_id', liveContext.eventId)
            .gte('end_time', now) // Only fetch things that haven't ended yet
            .order('start_time', { ascending: true })
            .limit(2); // Just get the current/next 2 items
            
        if (error) return JSON.stringify({ error: error.message });
        if (!data || data.length === 0) return JSON.stringify({ status: "No upcoming sessions found on the schedule." });
        return JSON.stringify(data);
    }
    
    return JSON.stringify({ error: "Unknown tool." });
}

// ---------------------------------------------------------------------
// 3. MAIN AI PROCESSING LOOP
// ---------------------------------------------------------------------
async function processMessageWithAI(userMessage, knowledgeBase, attendeeName, chatHistory = [], liveContext = {}) {
    const emergency = detectEmergency(userMessage);
    if (emergency.isEmergency) {
        return { isEmergency: true, reply: "Medical or security assistance needed." };
    }

    const systemPrompt = buildSystemPrompt(knowledgeBase, attendeeName);

    try {
        console.log(`🤖 Processing message with ${provider}...`);

        if (provider === 'gemini') {
            // (Note: Raw REST function calling for Gemini requires a heavily modified payload. 
            // For now, Gemini will just read the static context, while NVIDIA/Ollama use the tools.)
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const contents = chatHistory.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
            contents.push({ role: 'user', parts: [{ text: userMessage }] });

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: contents
                })
            });
            const data = await response.json();
            return { isEmergency: false, reply: data.candidates[0].content.parts[0].text.trim() };
        } 
        
        // --- NVIDIA / OLLAMA TOOL CALLING LOOP ---
        const messages = [
            { role: "system", content: systemPrompt },
            ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: userMessage }
        ];
        
        const modelToUse = provider === 'nvidia' ? (process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct") : "llama3.2";

        // Turn 1: Send the message and our tools to the AI
        const response1 = await aiClient.chat.completions.create({
            model: modelToUse,
            messages: messages,
            tools: aiTools,
            tool_choice: "auto" // Let the AI decide if it needs to call a tool
        });

        const responseMessage = response1.choices[0].message;

        // Check if the AI decided it needs to use a tool
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            // Append the AI's tool call request to the history
            messages.push(responseMessage); 

            // Execute the actual functions (e.g., query Supabase)
            for (const toolCall of responseMessage.tool_calls) {
                const args = JSON.parse(toolCall.function.arguments);
                const result = await executeToolCall(toolCall.function.name, args, liveContext);
                
                // Append the live data back into the history
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: result
                });
            }

            // Turn 2: Let the AI read the live data and write a final SMS
            const response2 = await aiClient.chat.completions.create({
                model: modelToUse,
                messages: messages
            });
            return { isEmergency: false, reply: response2.choices[0].message.content.trim() };
        }

        // If it didn't need a tool, just return the standard reply
        return { isEmergency: false, reply: responseMessage.content.trim() };

    } catch (error) {
        console.error(`❌ DETAILED AI ERROR (${provider}):`, error.message || error);
        return { isEmergency: false, reply: "Sorry, I couldn't process that right now. Please try again shortly." };
    }
}

// ---------------------------------------------------------------------
// Utility Functions (Extraction & Broadcasting)
// ---------------------------------------------------------------------
const EXTRACT_SYSTEM_PROMPT = `You extract event details from raw text. Respond with ONLY a JSON object: {"name": string|null, "description": string|null, "venueName": string|null, "venueAddress": string|null, "startDate": string|null, "endDate": string|null, "isPaid": boolean, "ticketPrice": string|null, "capacity": string|null}`;

function stripJsonFences(raw) { return raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim(); }

async function extractEventFromText(rawText) {
    const text = (rawText || '').slice(0, 20000); 
    if (!text.trim()) throw new Error('No text provided to extract from.');
    let raw;

    if (provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `\({EXTRACT_SYSTEM_PROMPT}\n\nText to extract from:\n\){text}` }] }],
                generationConfig: { responseMimeType: 'application/json' }
            })
        });
        const data = await response.json();
        raw = data.candidates[0].content.parts[0].text;
    } else {
        const model = provider === 'nvidia' ? (process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct') : 'llama3.2';
        const response = await aiClient.chat.completions.create({
            model,
            response_format: { type: 'json_object' },
            messages: [{ role: 'system', content: EXTRACT_SYSTEM_PROMPT }, { role: 'user', content: text }]
        });
        raw = response.choices[0].message.content;
    }

    let parsed;
    try { parsed = JSON.parse(stripJsonFences(raw)); } catch (e) { throw new Error('The AI did not return valid JSON.'); }
    return {
        name: parsed.name ?? null, description: parsed.description ?? null, venueName: parsed.venueName ?? null,
        venueAddress: parsed.venueAddress ?? null, startDate: parsed.startDate ?? null, endDate: parsed.endDate ?? null,
        isPaid: !!parsed.isPaid, ticketPrice: parsed.ticketPrice ?? null, capacity: parsed.capacity ?? null,
    };
}

async function draftBroadcastMessage(eventName, updateType, changeDetails) {
    const prompt = `You are a friendly event assistant for "\({eventName}". The organizer updated the\){updateType}. Details: ${changeDetails}. Draft a quick SMS (under 160 chars) notifying attendees. No placeholders.`;
    try {
        if (provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text.trim();
        } else {
            const modelToUse = provider === 'nvidia' ? (process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct") : "llama3.2";
            const response = await aiClient.chat.completions.create({ model: modelToUse, messages: [{ role: "user", content: prompt }] });
            return response.choices[0].message.content.trim();
        }
    } catch (error) {
        return `Update for \({eventName}: The\){updateType} has been changed. Reply with questions!`;
    }
}

module.exports = { processMessageWithAI, extractEventFromText, draftBroadcastMessage };