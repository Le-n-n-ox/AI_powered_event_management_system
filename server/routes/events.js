const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');

// GET /api/events
router.get('/', async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .order('event_date', { ascending: true });

        if (error) throw error;
        res.json(events);
    } catch (err) {
        console.error("Fetch events error:", err.message);
        res.status(500).json({ error: "Failed to load events" });
    }
});

// POST /api/events
router.post('/', async (req, res) => {
    const { title, description, event_date, event_time, venue, capacity, organizer_id } = req.body;
    try {
        const { data: newEvent, error } = await supabase
            .from('events')
            .insert([{ title, description, event_date, event_time, venue, capacity, organizer_id }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(newEvent);
    } catch (err) {
        console.error("Create event error:", err.message);
        res.status(500).json({ error: "Failed to create event" });
    }
});

// POST /api/events/:id/register
router.post('/:id/register', async (req, res) => {
    const { attendee_name, attendee_phone } = req.body;
    try {
        const qrToken = `TICKET-${req.params.id}-${Date.now()}`;
        const { data: reg, error } = await supabase
            .from('registrations')
            .insert([{ 
                event_id: req.params.id, 
                attendee_name, 
                attendee_phone, 
                qr_code_token: qrToken 
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(reg);
    } catch (err) {
        console.error("Registration error:", err.message);
        res.status(500).json({ error: "Registration failed" });
    }
});

module.exports = router;