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

    await logAdminAction(req.adminUser.id, 'account_suspended', 'profile',
        `Account ${suspended ? 'suspended' : 'reinstated'} (user ${id})`);

    res.json({ success: true });
});

const ROLES = ['admin', 'organizer', 'attendee', 'floor_manager'];

/**
 * POST /api/admin/users/:id/role
 * Body: { role: 'admin' | 'organizer' | 'attendee' | 'floor_manager' }
 *
 * Promotes or demotes an account. Admins cannot demote themselves — that
 * would leave the platform without an administrator.
 */
router.post('/users/:id/role', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!ROLES.includes(role)) {
        return res.status(400).json({ error: `Role must be one of: ${ROLES.join(', ')}` });
    }

    if (id === req.adminUser.id && role !== 'admin') {
        return res.status(400).json({ error: 'You cannot remove your own admin role.' });
    }

    const { data: before } = await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('id', id)
        .maybeSingle();

    if (!before) {
        return res.status(404).json({ error: 'No profile for that user.' });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ role })
        .eq('id', id)
        .select('id, role, full_name')
        .single();

    if (updateError) {
        return res.status(500).json({ error: updateError.message });
    }

    await logAdminAction(req.adminUser.id, 'role_changed', 'profile',
        `${before.role} -> ${role} (user ${id})`);

    res.json({ success: true, profile: updated });
});

/**
 * Writes a row to admin_audit_log. Never fails the request — the audit trail
 * is useful, but not worth blocking an admin action over.
 */
async function logAdminAction(actorId, action, targetType, detail) {
    try {
        await supabaseAdmin.from('admin_audit_log').insert({
            action,
            target_type: targetType,
            detail,
            actor_id: actorId,
        });
    } catch (err) {
        console.error('Failed to write audit log entry:', err.message);
    }
}

module.exports = router;