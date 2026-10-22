const express = require('express');
const crypto = require('crypto');
const { requireAuth, loadManageableEvent, supabaseAdmin } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimits');
const mpesa = require('../lib/mpesa');

const router = express.Router();

/**
 * Normalises a Kenyan phone number to the +254XXXXXXXXX form Daraja expects.
 */
function toMsisdn(raw) {
    const digits = String(raw || '').replace(/\D/g, '');

    if (digits.startsWith('254')) return `+${digits}`;
    if (digits.startsWith('0')) return `+254${digits.slice(1)}`;
    if (digits.startsWith('7')) return `+254${digits}`;
    if (digits.length === 9) return `+254${digits}`;
    return `+${digits}`;
}

/**
 * The paybill an event's money should land in.
 *
 * The organizer can set their own accno on the event; when they have not, the
 * platform's own shortcode takes the money.
 */
function paybillFor(event) {
    const accno = String(event?.mpesa_accno || '').trim();
    return accno || null;
}

/**
 * Opens (or reuses) the ledger entry for a ticket and pushes the STK prompt.
 *
 * Shared by the organizer-initiated and the attendee-initiated flows - the
 * only difference is who is allowed to call it.
 *
 * @returns {Promise<{transaction: object, checkoutRequestId: string, paybill: string|null}>}
 */
async function pushPaymentFor({ event, attendee, paymentToken }) {
    const amount = Number(event.ticket_price || 0);
    if (!amount || amount <= 0) {
        throw Object.assign(new Error('This event has no ticket price set.'), { status: 400 });
    }

    const phone = toMsisdn(attendee.phone_number);
    if (!/^\+2547\d{8}$/.test(phone)) {
        throw Object.assign(new Error('That phone number is not a valid M-Pesa number.'), { status: 400 });
    }

    const paybill = paybillFor(event);

    if (!mpesa.isConfigured(paybill)) {
        throw Object.assign(
            new Error(
                paybill
                    ? 'M-Pesa is not configured for this paybill.'
                    : 'M-Pesa is not configured on this server.',
            ),
            { status: 503, code: 'mpesa_not_configured' },
        );
    }

    // Reuse an open ledger entry for this attendee so we don't stack prompts.
    const { data: open } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('attendee_id', attendee.id)
        .eq('status', 'pending')
        .maybeSingle();

    let transaction = open;

    if (!transaction) {
        const { data: created, error: createError } = await supabaseAdmin
            .from('transactions')
            .insert({
                event_id: event.id,
                attendee_id: attendee.id,
                organizer_id: event.organizer_id,
                amount,
                currency: 'KES',
                status: 'pending',
                method: 'mpesa',
                provider: 'mpesa',
                payer_name: attendee.full_name,
                phone_number: phone,
                paybill,
            })
            .select()
            .single();

        if (createError) {
            throw Object.assign(new Error(createError.message), { status: 500 });
        }
        transaction = created;
    }

    try {
        const push = await mpesa.stkPush({
            phone,
            amount,
            accountReference: transaction.id.replace(/-/g, '').slice(0, 12),
            description: `Ticket ${event.name}`.slice(0, 13),
            paybill,
        });

        const { data: updated } = await supabaseAdmin
            .from('transactions')
            .update({
                provider_reference: push.checkoutRequestId,
                paybill: push.paybill || paybill,
                // The token is only written once - it is the attendee's key to
                // poll this payment, so it must not change under them.
                ...(transaction.payment_token ? {} : { payment_token: paymentToken }),
            })
            .eq('id', transaction.id)
            .select()
            .single();

        return {
            transaction: updated || transaction,
            checkoutRequestId: push.checkoutRequestId,
            paybill: push.paybill || paybill,
        };
    } catch (err) {
        // A rejected push is not a crash - record why and let them retry.
        await supabaseAdmin
            .from('transactions')
            .update({ status: 'failed' })
            .eq('id', transaction.id);

        throw Object.assign(
            new Error(err.message || 'M-Pesa could not start the payment.'),
            { status: 502 },
        );
    }
}

/**
 * POST /api/payments/stk-push
 * Body: { eventId, attendeeId }
 *
 * Opens a ledger entry for the ticket and pushes an M-Pesa STK prompt to the
 * attendee's phone. The ledger row is created *before* the push so we always
 * have something to reconcile the callback against. This is the organizer's
 * "send a reminder" button.
 */
router.post('/stk-push', requireAuth, paymentLimiter, async (req, res) => {
    const { eventId, attendeeId } = req.body || {};

    if (!eventId || !attendeeId) {
        return res.status(400).json({ error: 'eventId and attendeeId are required.' });
    }

    const event = await loadManageableEvent(req, res);
    if (!event) return;

    if (!event.is_paid) {
        return res.status(400).json({ error: 'This event is free - there is nothing to charge.' });
    }

    const { data: attendee } = await supabaseAdmin
        .from('attendees')
        .select('*')
        .eq('id', attendeeId)
        .eq('event_id', event.id)
        .maybeSingle();

    if (!attendee) {
        return res.status(404).json({ error: 'Attendee not found for this event.' });
    }

    if (attendee.payment_status === 'paid') {
        return res.status(409).json({ error: 'This ticket has already been paid for.' });
    }

    try {
        const result = await pushPaymentFor({
            event,
            attendee,
            paymentToken: crypto.randomBytes(24).toString('hex'),
        });

        res.json({
            transaction: result.transaction,
            checkoutRequestId: result.checkoutRequestId,
            paybill: result.paybill,
            message: 'Payment request sent. The attendee should confirm on their phone.',
        });
    } catch (err) {
        res.status(err.status || 502).json({
            error: err.message || 'M-Pesa could not start the payment.',
            ...(err.code ? { code: err.code } : {}),
        });
    }
});

/**
 * POST /api/payments/attendee-stk-push
 * Body: { attendeeId, phone? }
 *
 * The attendee side of a paid event: right after registering, the attendee
 * asks for their own payment prompt. The money is credited to the paybill
 * the organizer set on the event.
 *
 * The attendee is not necessarily signed in, so the caller proves they are
 * the attendee by knowing the phone number on the registration.
 */
router.post('/attendee-stk-push', paymentLimiter, async (req, res) => {
    const { attendeeId, phone } = req.body || {};

    if (!attendeeId) {
        return res.status(400).json({ error: 'attendeeId is required.' });
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

    // The prompt always goes to the number on the registration. Sending a
    // different one would let anyone prompt a stranger's phone.
    if (phone && toMsisdn(phone) !== toMsisdn(attendee.phone_number)) {
        return res.status(403).json({
            error: 'That phone number does not match the registration.',
        });
    }

    const { data: event } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('id', attendee.event_id)
        .maybeSingle();

    if (!event) {
        return res.status(404).json({ error: 'Event not found.' });
    }

    if (!event.is_paid) {
        return res.status(400).json({ error: 'This event is free - there is nothing to charge.' });
    }

    const paymentToken = crypto.randomBytes(24).toString('hex');

    try {
        const result = await pushPaymentFor({ event, attendee, paymentToken });

        res.json({
            transactionId: result.transaction.id,
            checkoutRequestId: result.checkoutRequestId,
            paymentToken: result.transaction.payment_token || paymentToken,
            amount: Number(event.ticket_price || 0),
            currency: 'KES',
            paybill: result.paybill,
            phone: toMsisdn(attendee.phone_number),
            message: 'Check your phone and enter your M-Pesa PIN to pay.',
        });
    } catch (err) {
        res.status(err.status || 502).json({
            error: err.message || 'M-Pesa could not start the payment.',
            ...(err.code ? { code: err.code } : {}),
        });
    }
});

/**
 * How often we are allowed to ask Daraja about the same payment.
 *
 * The attendee polls every few seconds and Daraja rate-limits the status
 * query, so one lookup per payment per window is plenty.
 */
const DARJA_SYNC_INTERVAL_MS = 10_000;

/** The last time we asked Daraja about each payment, in memory. */
const lastDarjaSync = new Map();

/**
 * Confirms a pending payment with Daraja.
 *
 * The callback is the fast path, but it only arrives if the public callback URL
 * is reachable. When it is not, the attendee has paid and the ledger still
 * says "pending" — so the poll asks Daraja directly and settles the row
 * itself. Without this a paid ticket would never be released.
 *
 * @param {object} transaction
 * @returns {Promise<object>} the transaction, settled if Daraja confirms it
 */
async function syncWithDaraja(transaction) {
    if (!transaction?.provider_reference) return transaction;
    if (transaction.status !== 'pending') return transaction;

    const last = lastDarjaSync.get(transaction.id) || 0;
    if (Date.now() - last < DARJA_SYNC_INTERVAL_MS) return transaction;
    lastDarjaSync.set(transaction.id, Date.now());

    // The map is a throttle, not a ledger — drop entries that have gone cold
    // so a long-running server does not hold on to every payment forever.
    if (lastDarjaSync.size > 500) {
        const cutoff = Date.now() - 60 * 60 * 1000;
        for (const [key, at] of lastDarjaSync) {
            if (at < cutoff) lastDarjaSync.delete(key);
        }
    }

    let status;

    try {
        status = await mpesa.queryTransaction(
            transaction.provider_reference,
            transaction.paybill,
        );
    } catch (err) {
        // A payment that is still settling is not an error — try again later.
        console.warn('⚠️ Could not confirm the M-Pesa payment:', err.message);
        return transaction;
    }

    if (status.resultCode === 0) {
        const { data: paid } = await supabaseAdmin
            .from('transactions')
            .update({
                status: 'paid',
                receipt_number: status.receiptNumber,
                paid_at: status.paidAt
                    ? new Date(status.paidAt).toISOString()
                    : new Date().toISOString(),
            })
            .eq('id', transaction.id)
            .select()
            .single();

        if (paid && transaction.attendee_id) {
            await supabaseAdmin
                .from('attendees')
                .update({ payment_status: 'paid' })
                .eq('id', transaction.attendee_id);
        }

        console.log(`✅ M-Pesa payment confirmed for transaction ${transaction.id}`);
        return paid || transaction;
    }

    // 1032 is the user declining the prompt — that is a final answer.
    if (status.resultCode === 1032) {
        const { data: failed } = await supabaseAdmin
            .from('transactions')
            .update({ status: 'failed' })
            .eq('id', transaction.id)
            .select()
            .single();

        return failed || transaction;
    }

    return transaction;
}

/**
 * GET /api/payments/status/:transactionId?token=...
 *
 * Polls one payment. The token is the secret handed out with the push, so an
 * attendee can follow their own payment without being signed in.
 */
router.get('/status/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    const token = String(req.query.token || '');

    const { data: found } = await supabaseAdmin
        .from('transactions')
        .select('id, status, amount, currency, receipt_number, paid_at, paybill, provider_reference, payment_token, attendee_id')
        .eq('id', transactionId)
        .maybeSingle();

    if (!found) {
        return res.status(404).json({ error: 'Payment not found.' });
    }

    if (!token || !found.payment_token || found.payment_token !== token) {
        return res.status(403).json({ error: 'Invalid payment token.' });
    }

    // The callback may never have arrived — settle the payment with Daraja
    // before answering, so a paid ticket is released either way.
    const transaction = await syncWithDaraja(found);

    res.json({
        status: transaction.status,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        receiptNumber: transaction.receipt_number,
        paidAt: transaction.paid_at,
        paybill: transaction.paybill,
    });
});

/**
 * GET /api/payments/attendee-status?attendeeId=...&phone=...
 *
 * Where an attendee's ticket stands. Used after a page refresh to find out
 * whether the ticket is released yet, and to pick a pending payment back up.
 *
 * As with the STK push, the phone number on the registration is the proof that
 * the caller is the attendee.
 */
router.get('/attendee-status', async (req, res) => {
    const { attendeeId, phone } = req.query;

    if (!attendeeId) {
        return res.status(400).json({ error: 'attendeeId is required.' });
    }

    const { data: attendee } = await supabaseAdmin
        .from('attendees')
        .select('id, event_id, phone_number, payment_status')
        .eq('id', attendeeId)
        .maybeSingle();

    if (!attendee) {
        return res.status(404).json({ error: 'Registration not found.' });
    }

    if (!phone || toMsisdn(phone) !== toMsisdn(attendee.phone_number)) {
        return res.status(403).json({
            error: 'That phone number does not match the registration.',
        });
    }

    // The most recent attempt is the one that matters.
    const { data: transaction } = await supabaseAdmin
        .from('transactions')
        .select('id, status, amount, currency, receipt_number, paid_at, paybill, provider_reference, payment_token')
        .eq('attendee_id', attendeeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    const settled = transaction ? await syncWithDaraja(transaction) : null;
    const paid = attendee.payment_status === 'paid' || settled?.status === 'paid';

    res.json({
        paid,
        paymentStatus: paid ? 'paid' : attendee.payment_status || 'unpaid',
        amount: settled ? Number(settled.amount) : null,
        currency: settled?.currency || 'KES',
        paybill: settled?.paybill || null,
        receiptNumber: settled?.receipt_number || null,
        paidAt: settled?.paid_at || null,
        // The token lets the attendee pick a pending payment back up.
        transactionStatus: settled?.status || null,
        transactionId: settled?.id || null,
        paymentToken: settled?.payment_token || null,
    });
});

/**
 * POST /api/payments/callback
 * Daraja posts here after the attendee confirms (or declines) the payment.
 *
 * The callback body is not signed, so we never trust it: we ask Daraja for the
 * transaction status and only mark the ticket paid when Daraja agrees.
 */
router.post('/callback', async (req, res) => {
    const body = req.body || {};
    const checkoutRequestId = body.CheckoutRequestID;

    if (!checkoutRequestId) {
        return res.status(400).json({ error: 'Missing CheckoutRequestID' });
    }

    const { data: transaction } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('provider_reference', checkoutRequestId)
        .maybeSingle();

    if (!transaction) {
        // Acknowledge so Safaricom stops retrying, but log it.
        console.warn('⚠️ M-Pesa callback for an unknown checkout request:', checkoutRequestId);
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (transaction.status === 'paid') {
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    let status = { resultCode: 0, resultCodeDesc: 'Accepted' };

    try {
        status = await mpesa.queryTransaction(checkoutRequestId, transaction.paybill);
    } catch (err) {
        console.error('❌ Could not verify M-Pesa transaction:', err.message);
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (status.resultCode !== 0) {
        await supabaseAdmin
            .from('transactions')
            .update({ status: 'failed' })
            .eq('id', transaction.id);

        console.log(`💸 M-Pesa payment failed for transaction ${transaction.id}: ${status.resultCodeDesc}`);
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const { data: paid } = await supabaseAdmin
        .from('transactions')
        .update({
            status: 'paid',
            receipt_number: status.receiptNumber,
            paid_at: status.paidAt ? new Date(status.paidAt).toISOString() : new Date().toISOString(),
        })
        .eq('id', transaction.id)
        .select()
        .single();

    if (transaction.attendee_id) {
        await supabaseAdmin
            .from('attendees')
            .update({ payment_status: 'paid' })
            .eq('id', transaction.attendee_id);
    }

    console.log(`✅ M-Pesa payment captured for transaction ${transaction.id}`);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted', transaction: paid });
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
