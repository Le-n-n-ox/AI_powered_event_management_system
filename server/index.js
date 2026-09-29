require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
const express = require('express');
const cors = require('cors'); // Required for React frontend communication
const { processMessageWithAI } = require('./ai');


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



let tasks = [
    { id: 1, description: "Check main lobby sound system", completed: false },
    { id: 2, description: "Deliver water bottles to Hall B speakers", completed: false },
    { id: 3, description: "Restock registration badges at Main Desk", completed: false }
];

// Attendees are in Nairobi, but the server (e.g. Render) runs in UTC.
// Without this, a 9am event shows up to the AI as "6am".
const EVENT_TZ = process.env.EVENT_TIMEZONE || 'Africa/Nairobi';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-KE', { timeZone: EVENT_TZ, dateStyle: 'medium', timeStyle: 'short' }) : 'TBD';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-KE', { timeZone: EVENT_TZ, timeStyle: 'short' }) : 'TBD';

app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'online', 
        message: 'Operations Engine API is running smoothly!' 
    });
});

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
    // Fetch ALL registrations for this phone number
    const { data: attendeeRecords } = await supabase
        .from('attendees')
        .select('*')
        .eq('phone_number', from);

    // Grab the name from their most recent registration
    const latestRecord = attendeeRecords && attendeeRecords.length > 0 
        ? attendeeRecords.sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at))[0] 
        : null;
        
    const fullName = latestRecord?.name || latestRecord?.attendee_name || latestRecord?.full_name || null;
    const attendeeName = fullName ? fullName.trim().split(' ')[0] : null;

    let knowledgeBase = "No event information available.";

    if (attendeeRecords && attendeeRecords.length > 0) {
        // Extract all unique event IDs they are registered for
        const eventIds = [...new Set(attendeeRecords.map(record => record.event_id))];

        // Fetch all data for ALL their events at once using .in()
        const { data: eventsData } = await supabase
            .from('events')
            .select('*')
            .in('id', eventIds);

        const { data: scheduleData } = await supabase
            .from('schedule_items')
            .select('event_id, title, speaker, location, start_time, end_time')
            .in('event_id', eventIds)
            .order('start_time', { ascending: true });

        const { data: venueData } = await supabase
            .from('venue_locations')
            .select('event_id, label, description')
            .in('event_id', eventIds);

        // Build a combined knowledge base
        knowledgeBase = (eventsData || []).map(event => {
            const eventSchedule = (scheduleData || []).filter(s => s.event_id === event.id)
                    .map(s => `- ${s.title}${s.speaker ? ` by ${s.speaker}` : ''} at ${fmtTime(s.start_time)}${s.location ? ` in ${s.location}` : ''}`)
                .join('\n');

            const eventVenues = (venueData || []).filter(v => v.event_id === event.id)
                    .map(v => `- ${v.label}: ${v.description || 'No additional details'}`)
                .join('\n');

            const priceText = event.is_paid ? `Paid event, ticket price ${event.ticket_price ?? 'TBD'}` : 'Free event';

            return `
--- EVENT: ${event.name || 'Unknown'} ---
About: ${event.description || 'No description provided.'}
Venue: ${event.venue_name || 'TBD'}${event.venue_address ? `, ${event.venue_address}` : ''}
Starts: ${fmtDateTime(event.start_date)}
Ends: ${fmtDateTime(event.end_date)}
Registration deadline: ${event.registration_deadline ? fmtDateTime(event.registration_deadline) : 'None stated'}
Capacity: ${event.capacity ?? 'Not stated'}
Tickets: ${priceText}

Schedule:
${eventSchedule || 'No schedule items yet.'}

Venue Locations:
${eventVenues || 'No venue locations added yet.'}

Organizer's uploaded documents (agenda, FAQ, rules, etc.):
${event.knowledge_text || 'None uploaded.'}
`.trim();
        }).join('\n\n');

        // If registered for multiple events, append a strict routing instruction for the AI
        if (eventsData && eventsData.length > 1) {
            knowledgeBase = `[CRITICAL SYSTEM INSTRUCTION: The attendee is registered for MULTIPLE events. If their question is vague (e.g., "where is parking?" or "what time is lunch?"), you MUST politely ask them which event they are asking about. If they specify the event, answer using that specific event's details.]\n\n` + knowledgeBase;
        }
    }

    console.log("🧠 Knowledge base sent to AI:\n", knowledgeBase);
    const aiResult = await processMessageWithAI(cleanText, knowledgeBase, attendeeName);
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

        replyMessage = `🚨 EMERGENCY LOGGED${attendeeName ? `, ${attendeeName}` : ''}: Floor security has been dispatched via phone call and SMS alert.`;
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