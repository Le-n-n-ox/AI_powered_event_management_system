require('dotenv').config();
const OpenAI = require('openai');

const provider = process.env.AI_PROVIDER || 'ollama';

let aiClient;
let modelName;

if (provider === 'gemini') {
    aiClient = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });
    modelName = "gemini-1.5-flash";
    console.log("☁️ AI Mode Active: Cloud Gemini");
} else {
    // Local Ollama with a strict timeout so it never hangs indefinitely
    aiClient = new OpenAI({
        apiKey: "ollama",
        baseURL: "http://localhost:11434/v1",
        timeout: 6000 // 6 second max timeout for local generation
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
            messages: [
                { 
                    role: "system", 
                    content: `You are a helpful event assistant for the Women in Tech Hackathon. Use these facts to answer: ${EVENT_KNOWLEDGE_BASE}. Keep your answer short and direct. If you don't know, say you don't know.`
                },
                { role: "user", content: userMessage }
            ]
        });

        const reply = response.choices[0].message.content.trim();
        return { isEmergency: false, reply };

    } catch (error) {
        console.warn(`⚠️ AI Timeout or Error (${provider}). Using instant fallback response.`);
        
        // Instant smart keyword fallback if local AI takes too long
        let fallbackReply = "Welcome to the Women in Tech Hackathon! Registration is at the Main Lobby.";
        if (lowerMsg.includes('wifi') || lowerMsg.includes('password')) {
            fallbackReply = "The Wi-Fi password is 'HackTheFuture'.";
        } else if (lowerMsg.includes('lunch') || lowerMsg.includes('food')) {
            fallbackReply = "Lunch is served at 1:00 PM in the Courtyard.";
        } else if (lowerMsg.includes('hall b') || lowerMsg.includes('where')) {
            fallbackReply = "Hall B is on the 2nd floor, opposite the elevators.";
        }

        return { 
            isEmergency: false, 
            reply: fallbackReply
        };
    }
}

module.exports = { processMessageWithAI };