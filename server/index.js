require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
const express = require('express');
const cors = require('cors'); // Required for React frontend communication
const { processMessageWithAI, extractEventFromText, draftBroadcastMessage } = require('./ai');
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

// Chunk organizer documents and rank paragraphs by keyword matches to the SMS.
function getRelevantChunks(text, query, maxChunks = 3) {
    if (!text) return 'None uploaded.';

    const stopWords = new Set(['what', 'where', 'when', 'how', 'who', 'is', 'are', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'my', 'i', 'can']);
    const keywords = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 2 && !stopWords.has(word));
    const chunks = text.split(/\n\n+/).map(chunk => chunk.trim()).filter(Boolean);

    if (keywords.length === 0) return chunks.slice(0, maxChunks).join('\n\n');

    const scored = chunks.map(chunk => {
        const lowerChunk = chunk.toLowerCase();
        const score = keywords.reduce((total, word) => total + (lowerChunk.includes(word) ? 1 : 0), 0);
        return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxChunks).map(item => item.chunk).join('\n\n...\n\n');
}

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

// Proactive AI Broadcast Endpoint
app.post('/api/broadcast-update', async (req, res) => {
    const { eventId, eventName, updateType, changeDetails } = req.body;

    if (!eventId || !eventName) {
        return res.status(400).json({ error: 'Missing event details' });
    }

    try {
        const { data: attendees, error } = await supabase
            .from('attendees')
            .select('phone_number')
            .eq('event_id', eventId);

        if (error) throw error;
        if (!attendees || attendees.length === 0) {
            return res.json({ message: 'No attendees to notify.' });
        }

        const message = await draftBroadcastMessage(eventName, updateType, changeDetails);
        console.log(`📢 Broadcasting AI update for ${eventName}: "${message}"`);

        const phoneNumbers = [...new Set(attendees.map(attendee => attendee.phone_number).filter(Boolean))];
        if (phoneNumbers.length === 0) {
            return res.json({ message: 'No attendees to notify.' });
        }

        if (process.env.AT_USERNAME === 'sandbox') {
            console.log(`📱 [SANDBOX] Simulated broadcast to ${phoneNumbers.length} attendees.`);
        } else {
            await sms.send({ to: phoneNumbers, message });
        }

        res.json({ success: true, message: 'Broadcast sent successfully', draftedText: message });
    } catch (err) {
        console.error('❌ Broadcast Error:', err);
        res.status(500).json({ error: 'Failed to send broadcast' });
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

    // 3. Remove this sender's messages older than 30 minutes.
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { error: cleanupError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('phone_number', from)
        .lt('created_at', thirtyMinsAgo);
    if (cleanupError) {
        console.error('❌ Chat history cleanup failed:', cleanupError.message);
    }

    // Fetch the latest six messages, then restore chronological order for the model.
    const { data: historyData, error: historyError } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('phone_number', from)
        .order('created_at', { ascending: false })
        .limit(6);
    if (historyError) {
        console.error('❌ Chat history lookup failed:', historyError.message);
    }
    const chatHistory = (historyData || []).reverse();

    // 4. Build context for every event this attendee is registered for.
    const { data: attendeeRecords, error: attendeeError } = await supabase
        .from('attendees')
        .select('*')
        .eq('phone_number', from);
    if (attendeeError) {
        console.error('❌ Attendee lookup failed:', attendeeError.message);
    }

    const latestRecord = attendeeRecords && attendeeRecords.length > 0
        ? attendeeRecords.sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at))[0]
        : null;
    const fullName = latestRecord?.name || latestRecord?.attendee_name || latestRecord?.full_name || null;
    const attendeeName = fullName ? fullName.trim().split(' ')[0] : null;

    let knowledgeBase = "No event information available.";

    if (attendeeRecords && attendeeRecords.length > 0) {
        const eventIds = [...new Set(attendeeRecords.map(record => record.event_id).filter(Boolean))];

        const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .in('id', eventIds);
        const { data: scheduleData, error: scheduleError } = await supabase
            .from('schedule_items')
            .select('event_id, title, speaker, location, start_time, end_time')
            .in('event_id', eventIds)
            .order('start_time', { ascending: true });
        const { data: venueData, error: venueError } = await supabase
            .from('venue_locations')
            .select('event_id, label, description')
            .in('event_id', eventIds);

        if (eventsError) console.error('❌ Event lookup failed:', eventsError.message);
        if (scheduleError) console.error('❌ Schedule lookup failed:', scheduleError.message);
        if (venueError) console.error('❌ Venue lookup failed:', venueError.message);

        knowledgeBase = (eventsData || []).map(event => {
            const eventSchedule = (scheduleData || [])
                .filter(item => item.event_id === event.id)
                .map(item => `- ${item.title}${item.speaker ? ` by ${item.speaker}` : ''} at ${fmtTime(item.start_time)}${item.location ? ` in ${item.location}` : ''}`)
                .join('\n');
            const eventVenues = (venueData || [])
                .filter(venue => venue.event_id === event.id)
                .map(venue => `- ${venue.label}: ${venue.description || 'No additional details'}`)
                .join('\n');
            const priceText = event.is_paid ? `Paid event, ticket price ${event.ticket_price ?? 'TBD'}` : 'Free event';
            const relevantDocs = getRelevantChunks(
                (event.knowledge_text || '').slice(0, MAX_DOC_CHARS),
                cleanText,
            );

            return `
--- EVENT: ${event.name || 'Unknown'} ---
About: ${event.description || 'No description provided.'}
Venue: ${event.venue_name || 'TBD'}${event.venue_address ? `, ${event.venue_address}` : ''}
Starts: ${fmtDateTime(event.start_date)}
Ends: ${fmtDateTime(event.end_date)}
Tickets: ${priceText}
Schedule:
${eventSchedule || 'No schedule items yet.'}
Venue Locations:
${eventVenues || 'No venue locations added yet.'}
Organizer Documents (Relevant Excerpts):
${relevantDocs}`.trim();
        }).join('\n\n');

        if (eventsData && eventsData.length > 1) {
            knowledgeBase = `[CRITICAL SYSTEM INSTRUCTION: The attendee is registered for MULTIPLE events. If their question is vague, politely ask them which event they are asking about.]\n\n${knowledgeBase}`;
        }
    }

    console.log("🧠 Knowledge base sent to AI:\n", knowledgeBase);
    const aiResult = await processMessageWithAI(cleanText, knowledgeBase, attendeeName, chatHistory);
    let replyMessage = aiResult.reply;

    if (aiResult.isEmergency) {
        console.log('🚨 EMERGENCY DETECTED! Triggering voice call escalation...');
        if (process.env.AT_USERNAME === 'sandbox') {
            console.log(`📞 [SANDBOX SIMULATION] Outbound emergency call to ${process.env.EMERGENCY_CONTACT_PHONE || 'configured contact'} successfully simulated.`);
        } else {
            try {
                await voice.call({
                    callFrom: process.env.AT_VIRTUAL_NUMBER,
                    callTo: process.env.EMERGENCY_CONTACT_PHONE
                });
            } catch (callError) {
                console.error('❌ Voice Call Failed:', callError.message);
            }
        }
        replyMessage = `🚨 EMERGENCY LOGGED${attendeeName ? `, ${attendeeName}` : ''}: Floor security has been dispatched via phone call and SMS alert.`;
    } else {
        const { error: saveHistoryError } = await supabase.from('chat_messages').insert([
            { phone_number: from, role: 'user', content: cleanText },
            { phone_number: from, role: 'assistant', content: replyMessage }
        ]);
        if (saveHistoryError) {
            console.error('❌ Saving chat history failed:', saveHistoryError.message);
        }
    }

    try {
        await sms.send({ to: [from], message: replyMessage });
        console.log(`📤 Sent AI reply to ${from}`);
    } catch (error) {
        console.error('❌ Failed to send SMS reply via API:', error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Operations Engine Server running on port ${PORT}`);
});