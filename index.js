require('dotenv').config();
const express = require('express');
const { processMessageWithAI } = require('./ai');

const credentials = {
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME
};
const AfricasTalking = require('africastalking')(credentials);
const sms = AfricasTalking.SMS;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock In-Memory Database for Tasks
let tasks = [
    { id: 1, description: "Check main lobby sound system", completed: false },
    { id: 2, description: "Deliver water bottles to Hall B speakers", completed: false },
    { id: 3, description: "Restock registration badges at Main Desk", completed: false }
];

app.get('/webhook/incoming', (req, res) => {
    res.status(200).send('Webhook is active!');
});

// ──────────────────────────────────────────────
// USSD MENU ENDPOINT
// ──────────────────────────────────────────────
app.post('/ussd', (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    console.log(`\n📱 USSD SESSION [${sessionId}] from ${phoneNumber} | Input: "${text}"`);

    let responseMessage = "";
    const arr = text.split('*');
    const level = arr.length;
    const userChoice = arr[0];

    // Level 0: Main Menu (When text is empty)
    if (text === "") {
        responseMessage = `CON Welcome to Women in Tech Help Desk
1. Register for Event
2. Check Schedule
3. Find a Location
4. Emergency Help`;
    } 
    // Level 1: Sub-menus based on main choice
    else if (level === 1) {
        if (userChoice === "1") {
            responseMessage = `END Thank you! You are successfully registered for the Women in Tech Hackathon. See you at the Main Lobby!`;
        } 
        else if (userChoice === "2") {
            responseMessage = `END Event Schedule:
- Registration: Main Lobby
- Lunch: 1:00 PM (Courtyard)
- Keynote: Hall B (2nd Floor)`;
        } 
        else if (userChoice === "3") {
            responseMessage = `CON Select location to find:
1. Registration / Lobby
2. Hall B
3. Courtyard Lunch area`;
        } 
        else if (userChoice === "4") {
            responseMessage = `END EMERGENCY: Floor security and medics have been alerted to your network location. Stay calm, help is on the way.`;
        } 
        else {
            responseMessage = `END Invalid choice. Please dial again.`;
        }
    } 
    // Level 2: Sub-menu handling (e.g., choosing a location)
    else if (level === 2 && userChoice === "3") {
        const subChoice = arr[1];
        if (subChoice === "1") {
            responseMessage = `END Registration is at the Main Lobby.`;
        } else if (subChoice === "2") {
            responseMessage = `END Hall B is on the 2nd floor, opposite the elevators.`;
        } else if (subChoice === "3") {
            responseMessage = `END Lunch is served at 1:00 PM in the Courtyard.`;
        } else {
            responseMessage = `END Invalid location choice.`;
        }
    } else {
        responseMessage = `END Invalid session input.`;
    }

    // Send the USSD response back with proper content type
    res.set('Content-Type', 'text/plain');
    res.send(responseMessage);
});

// ──────────────────────────────────────────────
// SMS WEBHOOK ENDPOINT (AI & Rules Engine)
// ──────────────────────────────────────────────
app.post('/webhook/incoming', async (req, res) => {
    res.sendStatus(200);

    const { from, text } = req.body;
    console.log(`\n📨 SMS INCOMING FROM ${from}: "${text}"`);

    const cleanText = text.trim();
    const upperText = cleanText.toUpperCase();

    // RULE 1: SAFE KEYWORD INTERCEPTION
    if (upperText.startsWith('SAFE')) {
        const location = cleanText.substring(4).trim() || 'General Location';
        console.log(`🛡️ SAFE CHECK-IN: Attendee at "${location}" marked safe.`);
        try {
            await sms.send({
                to: [from],
                message: `✅ Status logged: Organizers recorded that you are safe at ${location}.`
            });
            console.log(`📤 SENT SAFE CONFIRMATION TO ${from}`);
        } catch (error) {
            console.error(`❌ Failed to send safe confirmation SMS:`, error);
        }
        return;
    }

    // RULE 2: TASK MANAGEMENT INTERCEPTION (`DONE <number>`)
    if (upperText.startsWith('DONE')) {
        const parts = cleanText.split(' ');
        const taskId = parseInt(parts[1]);

        if (!isNaN(taskId)) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = true;
                console.log(`✅ TASK COMPLETED: Task #${taskId} ("${task.description}") marked done.`);
                await sms.send({
                    to: [from],
                    message: `✅ Success: Task #${taskId} ("${task.description}") marked as completed.`
                });
            } else {
                await sms.send({
                    to: [from],
                    message: `❌ Error: Task #${taskId} not found in current logs.`
                });
            }
        } else {
            await sms.send({
                to: [from],
                message: `❌ Format error. Reply with "DONE <task_number>" (e.g., DONE 1).`
            });
        }
        return;
    }

    // RULE 3: AI PROCESSING (Q&A and Emergencies)
    const aiResult = await processMessageWithAI(cleanText);
    console.log(`🤖 AI DECISION:`, aiResult);

    let replyMessage = aiResult.reply;
    if (aiResult.isEmergency) {
        console.log(`🚨 EMERGENCY DETECTED! Upgrading response priority...`);
        replyMessage = `🚨 EMERGENCY LOGGED: Floor security has been dispatched to your location. (${aiResult.reply})`;
    }

    try {
        await sms.send({
            to: [from],
            message: replyMessage
        });
        console.log(`📤 SENT REPLY TO ${from}`);
    } catch (error) {
        console.error(`❌ Failed to send SMS:`, error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Operations Engine Server running on port ${PORT}`);
});