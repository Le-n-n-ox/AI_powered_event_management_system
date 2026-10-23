const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Verifies the caller's JWT and loads their profile.
 * Attaches `req.user` (the auth user) and `req.profile` (the profiles row).
 */
async function requireAuth(req, res, next) {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' });
    }

    const token = auth.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, role, suspended, full_name')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile) {
        return res.status(403).json({ error: 'No profile for this account.' });
    }

    if (profile.suspended) {
        return res.status(403).json({ error: 'This account is suspended.' });
    }

    req.user = user;
    req.profile = profile;
    next();
}

/** Admins only. */
function requireAdmin(req, res, next) {
    if (req.profile?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin only' });
    }
    next();
}

/**
 * Loads an event and checks the caller is allowed to manage it.
 * Admins can manage every event; organizers only their own.
 * Returns the event on success, or null after sending the error response.
 */
async function loadManageableEvent(req, res) {
    const { id } = req.params;
    const eventId = req.body?.eventId || id;

    if (!eventId) {
        res.status(400).json({ error: 'Missing event id' });
        return null;
    }

    const { data: event, error } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

    if (error) {
        res.status(500).json({ error: error.message });
        return null;
    }

    if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return null;
    }

    const isOwner = event.organizer_id === req.profile.id;
    const isAdmin = req.profile.role === 'admin';

    if (!isOwner && !isAdmin) {
        res.status(403).json({ error: 'You can only manage events you created.' });
        return null;
    }

    return event;
}

module.exports = { supabaseAdmin, requireAuth, requireAdmin, loadManageableEvent };
