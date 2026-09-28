require('dotenv').config();
const OpenAI = require('openai');

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

async function processMessageWithAI(userMessage, knowledgeBase) {
    const lowerMsg = userMessage.toLowerCase();

    const isEmergency = lowerMsg.includes('help') ||
                        lowerMsg.includes('collapsed') ||
                        lowerMsg.includes('injury') ||
                        lowerMsg.includes('fire') ||
                        lowerMsg.includes('security');

    if (isEmergency) {
        return {
            isEmergency: true,
            reply: "Medical or security assistance needed."
        };
    }

    const knowledge = knowledgeBase || "No event information available.";

    try {
        console.log(`🤖 Processing message with \({provider}: "\){userMessage}"`);
        let replyText = "";

        if (provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a helpful event assistant. Use these facts to answer: \({knowledge}. Keep your answer short and direct. If you don't know, say you don't know.\n\nUser query:\){userMessage}`
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
                        content: `You are a helpful event assistant. Use these facts to answer: ${knowledge}. Keep your answer short and direct. If you don't know, say you don't know.`
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
                        content: `You are a helpful event assistant. Use these facts to answer: ${knowledge}. Keep your answer short and direct. If you don't know, say you don't know.`
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