require('dotenv').config();
const OpenAI = require('openai');

// Check the environment variable (defaults to 'ollama' if not specified)
const provider = process.env.AI_PROVIDER || 'ollama';

let aiClient;
let modelName;

if (provider === 'gemini') {
    // Configuration for Cloud Gemini
    aiClient = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });
    modelName = "gemini-1.5-flash";
    console.log("☁️ AI Mode Active: Cloud Gemini");
} else {
    // Configuration for Local Llama 3 via Ollama
    aiClient = new OpenAI({
        apiKey: "ollama",
        baseURL: "http://localhost:11434/v1"
    });
    modelName = "llama3";
    console.log("🦙 AI Mode Active: Local Llama 3");
}

const EVENT_KNOWLEDGE_BASE = `
- The event is the Women in Tech Hackathon.
- Registration is at the Main Lobby.
- Hall B is on the 2nd floor, opposite the elevators.
- Lunch is served at 1:00 PM in the Courtyard.
- Wi-Fi password is 'HackTheFuture'.
`;

async function processMessageWithAI(userMessage) {
    const lowerMsg = userMessage.toLowerCase();
    
    // Safety check for emergencies first (rules before AI)
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

    try {
        console.log(`🤖 Processing message with ${provider}: "${userMessage}"`);

        const response = await aiClient.chat.completions.create({
            model: modelName,
            response_format: { type: "json_object" },
            messages: [
                { 
                    role: "system", 
                    content: `You are the AI Event Assistant. Answer the user's query using ONLY these facts: ${EVENT_KNOWLEDGE_BASE}. 
                    If the user asks something not in the facts, say you don't know.
                    
                    Respond strictly in this JSON format:
                    {
                        "isEmergency": false,
                        "reply": "your text response"
                    }`
                },
                { role: "user", content: userMessage }
            ]
        });

        return JSON.parse(response.choices[0].message.content);

    } catch (error) {
        console.error(`❌ AI Error (${provider}):`, error.message || error);
        return { 
            isEmergency: false, 
            reply: "Welcome to the Women in Tech Hackathon! Registration is at the Main Lobby and Wi-Fi is 'HackTheFuture'." 
        };
    }
}

module.exports = { processMessageWithAI };