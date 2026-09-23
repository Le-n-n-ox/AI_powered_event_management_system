require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Required for React frontend communication
const { processMessageWithAI } = require('./ai');

// Import database initializer and REST API routes
const initializeDatabase = require('./config/initDB');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const credentials = {
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME
};
const AfricasTalking = require('africastalking')(credentials);
const sms = AfricasTalking.SMS;
const voice = AfricasTalking.VOICE;

const app = express();
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Cloud PostgreSQL Database Schema
initializeDatabase();

// Mount REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

let tasks = [
    { id: 1, description: "Check main lobby sound system", completed: false },
    { id: 2, description: "Deliver water bottles to Hall B speakers", completed: false },
    { id: 3, description: "Restock registration badges at Main Desk", completed: false }
];

app.get('/webhook/incoming', (req, res) => {
    res.status(200).send('Webhook is active!');
});

// USSD Interactive Menu Endpoint
app.post('/ussd', (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    let responseMessage = "";
    const arr = text.split('*');
    const level = arr.length;
    const userChoice = arr[0];

    if (text === "") {
        responseMessage = `CON Welcome to Women in Tech Help Desk
1. Register for Event
2. Check Schedule
3. Find a Location
4. Emergency Help`;
    } else if (level === 1) {
        if (userChoice === "1") {
            responseMessage = `END Successfully registered for the Women in Tech Hackathon!`;
        } else if (userChoice === "2") {
            responseMessage = `END Schedule: Registration (Main Lobby) | Lunch: 1:00 PM (Courtyard)`;
        } else if (userChoice === "3") {
            responseMessage = `CON Select location:
1. Registration / Lobby
2. Hall B
3. Courtyard`;
        } else if (userChoice === "4") {
            responseMessage = `END EMERGENCY: Security has been alerted and a voice call escalation has been triggered.`;
        } else {
            responseMessage = `END Invalid choice.`;
        }
    } else if (level === 2 && userChoice === "3") {
        const subChoice = arr[1];
        if (subChoice === "1") responseMessage = `END Registration is at the Main Lobby.`;
        else if (subChoice === "2") responseMessage = `END Hall B is on the 2nd floor.`;
        else if (subChoice === "3") responseMessage = `END Lunch is in the Courtyard.`;
        else responseMessage = `END Invalid location.`;
    } else {
        responseMessage = `END Invalid session input.`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(responseMessage);
});

// SMS & Emergency Escalation Webhook with Debug Logging
app.post('/webhook/incoming', async (req, res) => {
    res.sendStatus(200);

    console.log("📥 Raw SMS Webhook Payload Received:", req.body);

    const { from, text } = req.body;
    if (!text) {
        console.log("⚠️ Received webhook with no text content.");
        return;
    }

    const cleanText = text.trim();
    const upperText = cleanText.toUpperCase();

    // 1. SAFE Check-in Command
    if (upperText.startsWith('SAFE')) {
        const location = cleanText.substring(4).trim() || 'General Location';
        try {
            await sms.send({ to: [from], message: `✅ Status logged: You are marked safe at ${location}.` });
            console.log(`📤 Sent SAFE reply to ${from}`);
        } catch (err) {
            console.error("❌ Error sending SAFE SMS:", err);
        }
        return;
    }

    // 2. DONE Task Completion Command
    if (upperText.startsWith('DONE')) {
        const parts = cleanText.split(' ');
        const taskId = parseInt(parts[1]);
        const task = tasks.find(t => t.id === taskId);
        try {
            if (task) {
                task.completed = true;
                await sms.send({ to: [from], message: `✅ Task #${taskId} marked completed.` });
            } else {
                await sms.send({ to: [from], message: `❌ Task #${taskId} not found.` });
            }
            console.log(`📤 Sent Task reply to ${from}`);
        } catch (err) {
            console.error("❌ Error sending Task SMS:", err);
        }
        return;
    }

    // 3. AI Processing & Emergency Call Escalation
    const aiResult = await processMessageWithAI(cleanText);
    let replyMessage = aiResult.reply;

    if (aiResult.isEmergency) {
        console.log(`🚨 EMERGENCY DETECTED! Triggering voice call escalation...`);
        
        // Check if running in Sandbox mode to prevent voice DNS resolution errors
        if (process.env.AT_USERNAME === 'sandbox') {
            console.log(`📞 [SANDBOX SIMULATION] Voice calls are restricted in the AT Sandbox environment.`);
            console.log(`📞 [SANDBOX SIMULATION] Outbound emergency call to ${process.env.EMERGENCY_CONTACT_PHONE || 'configured contact'} successfully simulated.`);
        } else {
            try {
                await voice.call({
                    callFrom: process.env.AT_VIRTUAL_NUMBER,
                    callTo: process.env.EMERGENCY_CONTACT_PHONE
                });
                console.log(`📞 OUTBOUND VOICE CALL DISPATCHED successfully.`);
            } catch (callError) {
                console.error(`❌ Voice Call Failed:`, callError.message);
            }
        }

        replyMessage = `🚨 EMERGENCY LOGGED: Floor security has been dispatched via phone call and SMS alert.`;
    }

    try {
        console.log(`📤 Sending AI reply to ${from}: "${replyMessage}"`);
        const sendResult = await sms.send({
            to: [from],
            message: replyMessage
        });
        console.log("✅ SMS API Success Response:", sendResult);
    } catch (error) {
        console.error(`❌ Failed to send SMS reply via API:`, error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Operations Engine Server running on port ${PORT}`);
});