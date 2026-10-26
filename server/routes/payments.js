const express = require('express');
const { requireAuth, supabaseAdmin } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimits');
const { settlePaystackTransaction } = require('../lib/paystack');

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

/**
 * POST /api/payments/paystack/init
 * Body: { attendeeId, phone, amount }
 * 
 * Creates a pending ledger entry in Supabase and initializes the transaction
 * with Paystack to generate the access_code needed for the frontend popup.
 */
router.post('/paystack/init', paymentLimiter, async (req, res) => {
    const { attendeeId, phone, amount } = req.body || {};

    if (!attendeeId || !amount) {
        return res.status(400).json({ error: 'attendeeId and amount are required.' });
    }

    if (!PAYSTACK_SECRET_KEY || !PAYSTACK_PUBLIC_KEY) {
        return res.status(503).json({ error: 'Payment gateway is not configured on this server.' });
    }

    const { data: attendee } = await supabaseAdmin
        .from('attendees')
        .select('*')
        .eq('id', attendeeId)
        .maybeSingle();

    if (!attendee) {
        return res.status(404).json({ error: 'Registration not found.' });
    }

    if (attendee.payment_status === 'paid') {
        return res.status(409).json({ error: 'This ticket has already been paid for.' });
    }

    const { data: event } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('id', attendee.event_id)
        .maybeSingle();

    if (!event || !event.is_paid) {
        return res.status(400).json({ error: 'This event is free - there is nothing to charge.' });
    }

    // Generate a unique reference for this specific payment attempt
    const reference = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const email = `${String(phone).replace(/\D/g, "")}@guest.eventos.app`; // Fallback email for Paystack

    // 1. Create the pending ledger entry first
    const { data: transaction, error: createError } = await supabaseAdmin
        .from('transactions')
        .insert({
            event_id: event.id,
            attendee_id: attendee.id,
            organizer_id: event.organizer_id,
            amount: Number(amount),
            currency: 'KES',
            status: 'pending',
            method: 'paystack',
            provider: 'paystack',
            payer_name: attendee.full_name,
            phone_number: phone,
            provider_reference: reference
        })
        .select()
        .single();

    if (createError) {
        return res.status(500).json({ error: 'Could not create transaction ledger entry.' });
    }

    // 2. Ask Paystack for an access code
    try {
        const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                amount: Number(amount) * 100, // Paystack requires cents/kobo
                currency: 'KES',
                reference: reference
            })
        });

        const paystackData = await paystackRes.json();

        if (!paystackData.status) {
            throw new Error(paystackData.message);
        }

        res.json({
            accessCode: paystackData.data.access_code,
            reference: reference,
            publicKey: PAYSTACK_PUBLIC_KEY
        });

    } catch (err) {
        // Mark as failed if we couldn't even reach Paystack
        await supabaseAdmin
            .from('transactions')
            .update({ status: 'failed' })
            .eq('id', transaction.id);

        res.status(502).json({ error: 'Could not initialize payment with Paystack.' });
    }
});

/**
 * POST /api/payments/paystack/verify/:reference
 * 
 * Called by the frontend immediately after the Paystack popup succeeds.
 * Verifies the payment cryptographically with Paystack and settles the DB ledger.
 */
router.post('/paystack/verify/:reference', paymentLimiter, async (req, res) => {
    const { reference } = req.params;

    try {
        const result = await settlePaystackTransaction({ supabase: supabaseAdmin, reference });
        if (!result.success) {
            return res.status(400).json({ error: 'Payment was not successful according to Paystack.' });
        }
        return res.json({ success: true });
    } catch (error) {
        const status = error.message === 'Payment reference not found.' ? 404 : 502;
        return res.status(status).json({ error: 'Could not verify payment with Paystack server.' });
    }
});

/**
 * GET /api/payments/paystack/callback?reference=...
 * Paystack returns here after its hosted checkout. Always verify server-side
 * before granting access to a paid event.
 */
router.get('/paystack/callback', async (req, res) => {
    const reference = String(req.query.reference || '');
    if (!reference) {
        return res.status(400).type('text/plain').send('Missing payment reference.');
    }

    try {
        const result = await settlePaystackTransaction({ supabase: supabaseAdmin, reference });
        if (!result.success) {
            return res.status(402).type('text/plain').send('Payment is not confirmed. No paid access was granted.');
        }
        return res.type('text/plain').send('Payment verified. Your event registration is confirmed; you may return to the help desk.');
    } catch (error) {
        console.error('Paystack callback verification failed:', error.message);
        const status = error.message === 'Payment reference not found.' ? 404 : 502;
        return res.status(status).type('text/plain').send('Could not verify payment. Please contact the event help desk.');
    }
});

/**
 * GET /api/payments/transactions?eventId=...
 * The organizer's ledger. Reads go through the service role so the screen
 * works whether or not the RLS policies from migration 002 are in place.
 */
router.get('/transactions', requireAuth, async (req, res) => {
    const { eventId } = req.query;

    let query = supabaseAdmin
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (req.profile.role === 'admin') {
        if (eventId) query = query.eq('event_id', eventId);
    } else {
        query = query.eq('organizer_id', req.profile.id);
        if (eventId) query = query.eq('event_id', eventId);
    }

    const { data, error } = await query.limit(500);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ transactions: data || [] });
});

/**
 * PATCH /api/payments/transactions/:id
 * Body: { status: 'paid' | 'refunded' | 'cancelled' }
 * Manual reconciliation (cash payments, refunds, chargebacks).
 */
router.patch('/transactions/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!['paid', 'refunded', 'cancelled', 'pending', 'failed'].includes(status)) {
        return res.status(400).json({ error: 'Unsupported transaction status.' });
    }

    const { data: transaction } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    const isOwner = transaction.organizer_id === req.profile.id;
    if (!isOwner && req.profile.role !== 'admin') {
        return res.status(403).json({ error: 'You can only manage your own transactions.' });
    }

    const patch = { status };
    if (status === 'paid' && !transaction.paid_at) {
        patch.paid_at = new Date().toISOString();
    }

    const { data: updated, error } = await supabaseAdmin
        .from('transactions')
        .update(patch)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    // Keep the attendee's payment status in step with the ledger.
    if (transaction.attendee_id) {
        const attendeeStatus = status === 'paid' ? 'paid' : status === 'refunded' ? 'refunded' : 'unpaid';
        await supabaseAdmin
            .from('attendees')
            .update({ payment_status: attendeeStatus })
            .eq('id', transaction.attendee_id);
    }

    res.json({ transaction: updated });
});

module.exports = router;