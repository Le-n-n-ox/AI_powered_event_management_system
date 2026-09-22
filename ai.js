require('dotenv').config();
const OpenAI = require('openai');

const aiClient = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const EVENT_KNOWLEDGE_BASE = `
- The event is the Women in Tech Hackathon.
- Registration is at the Main Lobby.
- Hall B is on the 2nd floor, opposite the elevators.
- Lunch is served at 1:00 PM in the Courtyard.
- Wi-Fi password is 'HackTheFuture'.
`;

async function processMessageWithAI(userMessage) {
    try {
        console.log(`🧠 Gemini is analyzing: "${userMessage}"`);

        const response = await aiClient.chat.completions.create({
            model: "gemini-3.8-flash",
            response_format: { type: "json_object" },
            messages: [
                { 
                    role: "system", 
                    content: `You are the AI Event Assistant. Answer the user's query using ONLY these facts: ${EVENT_KNOWLEDGE_BASE}. 
                    If the user asks something not in the facts, say you don't know.
                    CRITICAL: If the user mentions injury, fire, security, medical, or uses urgent language, set "isEmergency" to true.
                    
                    Respond strictly in this JSON format:
                    {
                        "isEmergency": boolean,
                        "reply": "your text response"
                    }`
                },
                { role: "user", content: userMessage }
            ]
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        return { isEmergency: false, reply: "Sorry, the help desk is currently restarting." };
    }
}

module.exports = { processMessageWithAI };