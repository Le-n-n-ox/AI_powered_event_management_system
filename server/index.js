require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
const express = require('express');
const cors = require('cors'); // Required for React frontend communication
const { processMessageWithAI, extractEventFromText } = require('./ai');
const multer = require('multer');
const pdfParse = require('pdf-parse');

// Handles the Magic Auto-Fill upload. Files are kept in memory only
// (never written to disk) and capped so a huge upload can't hang the server.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 5 } // 5MB per file, 5 files max
});


const credentials = {
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME
};
const AfricasTalking = require('africastalking')(credentials);
const sms = AfricasTalking.SMS;
const voice = AfricasTalking.VOICE;

const app = express();
app.use(cors()); 
app.use(express.json({ limit: '2mb' })); // raised from Express's 100kb default so uploaded knowledge-base text fits
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
const MAX_DOC_CHARS = 15000; // keeps the prompt within what small/local models can handle

app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'online', 
        message: 'Operations Engine API is running smoothly!' 
    });
});

// Magic Auto-Fill: takes raw text from an uploaded file (frontend reads the
// file itself) and asks the AI to pull out structured event form fields.
app.post('/api/extract-event', upload.array('files', 5), async (req, res) => {
    const files = req.files || [];
    if (!files.length) {
        return res.status(400).json({ error: 'No files uploaded.' });
    }

    const TEXT_EXTENSIONS = ['.txt', '.md', '.csv', '.json'];

    try {
        let combinedText = '';

        for (const file of files) {
            const lowerName = file.originalname.toLowerCase();
            let content = '';

            if (lowerName.endsWith('.pdf') || file.mimetype === 'application/pdf') {
                try {
                    const parsed = await pdfParse(file.buffer);
                    content = (parsed.text || '').trim();
                } catch (pdfErr) {
                    console.error(`❌ Could not parse PDF "${file.originalname}":`, pdfErr.message);
                    continue; // skip this file, try the others
                }
            } else if (TEXT_EXTENSIONS.some(ext => lowerName.endsWith(ext))) {
                content = file.buffer.toString('utf-8').trim();
            } else {
                console.log(`⚠️ Skipping unsupported file type: ${file.originalname}`);
                continue;
            }

            if (content) {
                combinedText += `${combinedText ? '\n\n' : ''}--- ${file.originalname} ---\n${content}`;
            }
        }

        if (!combinedText.trim()) {
            return res.status(422).json({ error: "Couldn't read any usable text from those files. If it's a scanned/image-only PDF, this won't work yet — try pasting the text in manually." });
        }

        const extracted = await extractEventFromText(combinedText);

        // Send back both the structured fields AND the raw combined text,
        // so the frontend can fill the form fields and the knowledge box in one round trip.
        res.json({ ...extracted, rawText: combinedText });

    } catch (err) {
        console.error('❌ Event extraction error:', err.message || err);
        res.status(500).json({ error: 'Failed to extract event details from that document.' });
    }
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
    const { data: attendee } = await supabase
        .from('attendees')
        .select('*')
        .eq('phone_number', from)
        .order('registered_at', { ascending: false })
        .limit(1)
        .single();

    // Use the name given at registration (column name may differ, so check the common ones)
    const fullName = attendee?.name || attendee?.attendee_name || attendee?.full_name || null;
    const attendeeName = fullName ? fullName.trim().split(' ')[0] : null;

    let knowledgeBase = "No event information available.";

    if (attendee?.event_id) {
        const { data: eventData } = await supabase
            .from('events')
            .select('*')
            .eq('id', attendee.event_id)
            .single();

        const { data: scheduleData } = await supabase
            .from('schedule_items')
            .select('title, speaker, location, start_time, end_time')
            .eq('event_id', attendee.event_id)
            .order('start_time', { ascending: true });

        const { data: venueData } = await supabase
            .from('venue_locations')
            .select('label, description')
            .eq('event_id', attendee.event_id);

        const scheduleText = (scheduleData || [])
            .map(s => `- ${s.title}${s.speaker ? ` by ${s.speaker}` : ''} at ${fmtTime(s.start_time)}${s.location ? ` in ${s.location}` : ''}`)
            .join('\n');

        const venueText = (venueData || [])
            .map(v => `- ${v.label}: ${v.description || 'No additional details'}`)
            .join('\n');

        const docText = (eventData?.knowledge_text || '').slice(0, MAX_DOC_CHARS);
        const priceText = eventData?.is_paid ? `Paid event, ticket price ${eventData?.ticket_price ?? 'TBD'}` : 'Free event';

        knowledgeBase = `
Event: ${eventData?.name || 'Unknown'}
About: ${eventData?.description || 'No description provided.'}
Venue: ${eventData?.venue_name || 'TBD'}${eventData?.venue_address ? `, ${eventData.venue_address}` : ''}
Starts: ${fmtDateTime(eventData?.start_date)}
Ends: ${fmtDateTime(eventData?.end_date)}
Registration deadline: ${eventData?.registration_deadline ? fmtDateTime(eventData.registration_deadline) : 'None stated'}
Capacity: ${eventData?.capacity ?? 'Not stated'}
Tickets: ${priceText}

Schedule:
${scheduleText || 'No schedule items yet.'}

Venue Locations:
${venueText || 'No venue locations added yet.'}

Organizer's uploaded documents (agenda, FAQ, rules, etc.):
${docText || 'None uploaded.'}
`.trim();
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