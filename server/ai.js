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
    const nameLine = attendeeName
        ? `The attendee you are talking to is named ${attendeeName}. Address them by their first name naturally.`
        : `You don't know the attendee's name, so don't guess one.`;
    return `You are a helpful event assistant. ${nameLine} Use ONLY these facts to answer:\n${knowledge}\n\nKeep your answer short and direct (under 300 characters, since this is an SMS). If the answer isn't in the facts, say you don't know.`;
}

async function processMessageWithAI(userMessage, knowledgeBase, attendeeName, chatHistory = []) {
    const emergency = detectEmergency(userMessage);

    if (emergency.isEmergency) {
        console.log(`🚨 Emergency rule matched: ${emergency.matched}`);
        return {
            isEmergency: true,
            reply: "Medical or security assistance needed."
        };
    }

    const knowledge = knowledgeBase || "No event information available.";
    const systemPrompt = buildSystemPrompt(knowledge, attendeeName);

    try {
        console.log(`🤖 Processing message with \({provider}: "\){userMessage}"`);
        let replyText = "";

        if (provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

            // Map standard chat history to Gemini's specific role format
            const contents = chatHistory.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
            
            // Add the new user message
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

            if (data.error) {
                throw new Error(data.error.message);
            }

            replyText = data.candidates[0].content.parts[0].text.trim();

        } else {
            // OpenAI format (used by NVIDIA and Ollama)
            const messages = [
                { role: "system", content: systemPrompt },
                ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
                { role: "user", content: userMessage }
            ];
            
            const modelToUse = provider === 'nvidia' 
                ? (process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct") 
                : "llama3.2";

            const response = await aiClient.chat.completions.create({
                model: modelToUse, 
                messages: messages
            });
            replyText = response.choices[0].message.content.trim();
        }

        return { isEmergency: false, reply: replyText };

    } catch (error) {
        console.error(`❌ DETAILED AI ERROR (${provider}):`, error.message || error);
        return {
            isEmergency: false,
            reply: "Sorry, I couldn't process that right now. Please try again shortly."
        };
    }
}


// ---------------------------------------------------------------------
// Event field extraction, for the organizer's "Magic Auto-Fill" upload.
// Takes raw text from an uploaded file and asks the AI to pull out
// structured event fields as JSON. Used by POST /api/extract-event.
// ---------------------------------------------------------------------

const EXTRACT_SYSTEM_PROMPT = `You extract event details from raw text (a poster, agenda or flyer, possibly messy).
Respond with ONLY a JSON object, no markdown fences, no commentary, in exactly this shape:
{
  "name": string or null,
  "description": string or null,
  "venueName": string or null,
  "venueAddress": string or null,
  "startDate": string or null,
  "endDate": string or null,
  "isPaid": boolean,
  "ticketPrice": string or null,
  "capacity": string or null
}
Rules:
- startDate and endDate MUST be in the exact format YYYY-MM-DDTHH:mm (24-hour, no timezone, no seconds). If no end time is stated, estimate a reasonable end (e.g. start + a few hours).
- If a field truly cannot be determined from the text, use null (or false for isPaid).
- Never invent a venue, date or price that isn't implied by the text.
- ticketPrice and capacity are numbers as strings, digits only (no currency symbols, no commas).`;

function stripJsonFences(raw) {
    return raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

async function extractEventFromText(rawText) {
    const text = (rawText || '').slice(0, 20000); // guard against huge uploads
    if (!text.trim()) {
        throw new Error('No text provided to extract from.');
    }

    let raw;

    if (provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${EXTRACT_SYSTEM_PROMPT}\n\nText to extract from:\n${text}` }] }],
                generationConfig: { responseMimeType: 'application/json' }
            })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        raw = data.candidates[0].content.parts[0].text;

    } else {
        const model = provider === 'nvidia'
            ? (process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct')
            : 'llama3.2';

        const response = await aiClient.chat.completions.create({
            model,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: EXTRACT_SYSTEM_PROMPT },
                { role: 'user', content: text }
            ]
        });
        raw = response.choices[0].message.content;
    }

    let parsed;
    try {
        parsed = JSON.parse(stripJsonFences(raw));
    } catch (e) {
        console.error('❌ Extraction JSON parse failed. Raw output was:', raw);
        throw new Error('The AI did not return valid JSON for extraction.');
    }

    // Always return every field, even if the model omitted one
    return {
        name: parsed.name ?? null,
        description: parsed.description ?? null,
        venueName: parsed.venueName ?? null,
        venueAddress: parsed.venueAddress ?? null,
        startDate: parsed.startDate ?? null,
        endDate: parsed.endDate ?? null,
        isPaid: !!parsed.isPaid,
        ticketPrice: parsed.ticketPrice ?? null,
        capacity: parsed.capacity ?? null,
    };
}

module.exports = { processMessageWithAI, extractEventFromText };