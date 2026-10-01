const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Verifies the caller's JWT and that they're an admin
async function requireAdmin(req, res, next) {
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
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (profile?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin only' });
    }

    req.adminUser = user;
    next();
}

router.post('/users/:id/suspend', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { suspended } = req.body; // true or false

    const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ suspended })
        .eq('id', id);

    if (updateError) {
        return res.status(500).json({ error: updateError.message });
    }

    if (suspended) {
        // Kills every active session for this user immediately —
        // their next request with the old token fails, forcing re-login
        const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(id, 'global');
        if (signOutError) {
            console.error('Failed to revoke sessions:', signOutError.message);
        }
    }

    res.json({ success: true });
});

module.exports = router;