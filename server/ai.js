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

async function processMessageWithAI(userMessage, knowledgeBase, attendeeName) {
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
        console.log(`🤖 Processing message with ${provider}: "${userMessage}"`);
        let replyText = "";

        if (provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${systemPrompt}

User query: ${userMessage}`
                        }]
                    }]
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            replyText = data.candidates[0].content.parts[0].text.trim();

        } else if (provider === 'nvidia') {
            const response = await aiClient.chat.completions.create({
                model: process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct", 
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    { role: "user", content: userMessage }
                ]
            });
            replyText = response.choices[0].message.content.trim();
            
        } else {
            const response = await aiClient.chat.completions.create({
                model: "llama3.2", 
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    { role: "user", content: userMessage }
                ]
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

module.exports = { processMessageWithAI };