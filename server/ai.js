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
    const nameLine = attendeeName ? `The user's first name is ${attendeeName}.` : ``;

    return `You are a professional, welcoming, and concise event concierge for the event described below. ${nameLine}

CRITICAL RULES:
1. Answer the user's question using ONLY the event data provided below.
2. EVENT IS ALREADY LOCKED IN: You are currently discussing ONE specific event. You are STRICTLY FORBIDDEN from asking "Which event are you asking about?" or mentioning other events.
3. If the user asks a follow-up question (like parking, wifi, etc.), use the event data below and chat history to answer it immediately.
4. Keep answers under 200 characters (SMS format).
5. FALLBACK: If the answer is not in the provided data, politely ask the user to contact the help desk at +254 700 000 000 or visit the registration desk.

EXAMPLES OF PERFECT RESPONSES:
- User: "Where is lunch?" -> AI: "Lunch is being served in the Courtyard from 1:00 PM to 2:00 PM! 🥗"
- User: "Who is speaking next?" -> AI: " up next is Jane Doe discussing AI Ethics in Hall B at 2:30 PM."
- User: "Wifi password?" -> AI: "The wifi is 'EventGuest2026' with password 'Welcome2026!'"

EVENT DATA:
${knowledge}`;
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
    },
    {
        type: "function",
        function: {
            name: "get_venue_details",
            description: "Get detailed descriptions or directions for a specific venue location.",
            parameters: {
                type: "object",
                properties: {
                    location_label: { type: "string", description: "The name of the location to look up (e.g. 'Main Lobby', 'Hall B')" }
                },
                required: ["location_label"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "check_attendee_registration",
            description: "Verify if the current attendee is registered for a specific session or the event.",
            parameters: {
                type: "object",
                properties: {
                    session_title: { type: "string", description: "The title of the session to check registration for (optional)" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "report_issue",
            description: "Report a facility or operational issue (e.g., cleaning, technical failure) to the help desk.",
            parameters: {
                type: "object",
                properties: {
                    location: { type: "string", description: "The location where the issue is occurring (e.g., 'Hall B', 'Main Lobby')" },
                    description: { type: "string", description: "A detailed description of the issue" }
                },
                required: ["location", "description"]
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

    if (functionName === 'get_venue_details') {
        if (!liveContext.eventId) return JSON.stringify({ error: "No specific event ID found." });
        const { data, error } = await liveContext.supabase
            .from('venue_locations')
            .select('label, description')
            .eq('event_id', liveContext.eventId)
            .ilike('label', `%${functionArgs.location_label}%`);
        if (error) return JSON.stringify({ error: error.message });
        if (!data || data.length === 0) return JSON.stringify({ error: `Could not find details for ${functionArgs.location_label}.` });
        return JSON.stringify(data[0]);
    }

    if (functionName === 'check_attendee_registration') {
        const phoneNumber = liveContext.attendeePhone;
        if (!phoneNumber) return JSON.stringify({ error: "Attendee phone number not provided in context." });

        const { data, error } = await liveContext.supabase
            .from('attendees')
            .select('event_id')
            .eq('phone_number', phoneNumber);

        if (error) return JSON.stringify({ error: error.message });
        if (!data || data.length === 0) return JSON.stringify({ status: "User is not registered for this event." });

        return JSON.stringify({ status: "Registered", event_id: data[0].event_id });
    }

    if (functionName === 'report_issue') {
        const phoneNumber = liveContext.attendeePhone;
        const eventId = liveContext.eventId;
        if (!phoneNumber) return JSON.stringify({ error: "Attendee phone number not provided in context." });
        if (!eventId) return JSON.stringify({ error: "No event ID found in context." });

        const { data, error } = await liveContext.supabase
            .from('issues')
            .insert([
                {
                    event_id: eventId,
                    attendee_phone: phoneNumber,
                    location: functionArgs.location,
                    description: functionArgs.description,
                    status: 'open'
                }
            ])
            .select();

        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ status: "Success", message: "Issue reported successfully. The team has been notified." });
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

    // Summarize history if it's getting too long to keep the AI focused
    if (chatHistory.length > 10) {
        const recent = chatHistory.slice(-6);
        const older = chatHistory.slice(0, -6);
        const summaryPrompt = `Summarize the following conversation history into a concise paragraph, preserving key facts (like mentioned events or specific requests):\n\n${older.map(m => `${m.role}: ${m.content}`).join('\n')}`;

        try {
            const summaryResponse = await aiClient.chat.completions.create({
                model: provider === 'nvidia' ? (process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct") : "llama3.2",
                messages: [{ role: "user", content: summaryPrompt }]
            });
            const summary = summaryResponse.choices[0].message.content.trim();
            chatHistory = [{ role: "system", content: `Previous conversation summary: ${summary}` }, ...recent];
        } catch (e) {
            console.error("❌ History summarization failed:", e.message);
        }
    }

    const systemPrompt = buildSystemPrompt(knowledgeBase, attendeeName);

    // ADDITION: The "Ghost Organizer" prompt for internal insights
    const insightPrompt = `You are an Operational Intelligence Agent. Analyze the user's message: "${userMessage}".
    Does this indicate a pattern, a complaint, or a predictive issue that an organizer should know about?

    If YES, respond ONLY with a JSON object:
    {"type": "CROWD_ALERT" | "PREDICTION" | "FEEDBACK", "location": string|null, "issue": string, "severity": "low" | "medium" | "high", "suggestion": string|null}

    If NO, respond with the word "NONE".`;

    try {
        console.log(`🤖 Processing message with ${provider}...`);

        if (provider === 'gemini') {
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

            const insightRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: insightPrompt }] }] })
            });
            const insightData = await insightRes.json();
            const insightText = insightData.candidates[0].content.parts[0].text.trim();
            let insight = null;
            try { insight = insightText === "NONE" ? null : JSON.parse(insightText); } catch(e) {}

            return { isEmergency: false, reply: data.candidates[0].content.parts[0].text.trim(), insight };
        }

        const messages = [
            { role: "system", content: systemPrompt },
            ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: userMessage }
        ];

        const modelToUse = provider === 'nvidia' ? (process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct") : "llama3.2";

        const response1 = await aiClient.chat.completions.create({
            model: modelToUse,
            messages: messages,
            tools: aiTools,
            tool_choice: "auto"
        });

        const responseMessage = response1.choices[0].message;

        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            messages.push(responseMessage);
            for (const toolCall of responseMessage.tool_calls) {
                const args = JSON.parse(toolCall.function.arguments);
                const result = await executeToolCall(toolCall.function.name, args, liveContext);
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: result
                });
            }
            const response2 = await aiClient.chat.completions.create({
                model: modelToUse,
                messages: messages
            });
            const finalReply = response2.choices[0].message.content.trim();

            const insightRes = await aiClient.chat.completions.create({
                model: modelToUse,
                messages: [{ role: "user", content: insightPrompt }]
            });
            const insightText = insightRes.choices[0].message.content.trim();
            let insight = null;
            try { insight = insightText === "NONE" ? null : JSON.parse(insightText); } catch(e) {}

            return { isEmergency: false, reply: finalReply, insight };
        }

        const insightRes = await aiClient.chat.completions.create({
            model: modelToUse,
            messages: [{ role: "user", content: insightPrompt }]
        });
        const insightText = insightRes.choices[0].message.content.trim();
        let insight = null;
        try { insight = insightText === "NONE" ? null : JSON.parse(insightText); } catch(e) {}

        return { isEmergency: false, reply: responseMessage.content.trim(), insight };

    } catch (error) {
        console.error(`❌ DETAILED AI ERROR (${provider}):`, error.message || error);
        return { isEmergency: false, reply: "Sorry, I couldn't process that right now. Please try again shortly.", insight: null };
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
