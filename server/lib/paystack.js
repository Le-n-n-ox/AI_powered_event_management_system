const { randomUUID } = require('node:crypto');

async function initializeUssdPaystackCheckout({
    supabase,
    attendee,
    event,
    phone,
    secretKey = process.env.PAYSTACK_SECRET_KEY,
    callbackUrl,
    fetchImpl = fetch,
    createReference = () => `ussd_${randomUUID()}`,
}) {
    if (!secretKey || !secretKey.startsWith('sk_test_')) {
        throw new Error('USSD payments require a Paystack test key.');
    }
    if (!attendee?.id || !event?.id || !event?.organizer_id || !callbackUrl) {
        throw new Error('Attendee, event, organizer, and callback URL are required.');
    }

    const amount = Number(event.ticket_price);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('The event ticket price is invalid.');
    }

    const reference = createReference();
    const { data: transaction, error: insertError } = await supabase
        .from('transactions')
        .insert({
            event_id: event.id,
            attendee_id: attendee.id,
            organizer_id: event.organizer_id,
            amount,
            currency: 'KES',
            status: 'pending',
            method: 'paystack',
            provider: 'paystack',
            payer_name: attendee.full_name,
            phone_number: phone,
            provider_reference: reference,
            ...(event.mpesa_accno ? { paybill: event.mpesa_accno } : {}),
        })
        .select('id')
        .single();

    if (insertError || !transaction) {
        throw new Error('Could not create the payment ledger entry.');
    }

    try {
        const response = await fetchImpl('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: `${phone.replace(/\D/g, '')}@guest.eventos.app`,
                amount: Math.round(amount * 100),
                currency: 'KES',
                reference,
                callback_url: callbackUrl,
            }),
        });
        const result = await response.json();
        const authorizationUrl = result?.data?.authorization_url;
        if (!response.ok || !result?.status || !authorizationUrl) {
            throw new Error('Paystack did not return a checkout URL.');
        }
        return authorizationUrl;
    } catch (error) {
        await supabase
            .from('transactions')
            .update({ status: 'failed' })
            .eq('id', transaction.id);
        throw error;
    }
}

async function verifyPaystackReference(reference, {
    secretKey = process.env.PAYSTACK_SECRET_KEY,
    fetchImpl = fetch,
} = {}) {
    if (!secretKey) throw new Error('Paystack is not configured.');
    const response = await fetchImpl(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
    });
    const result = await response.json();
    if (!response.ok || !result?.status || !result?.data) {
        throw new Error('Paystack could not verify this reference.');
    }
    return result.data;
}

async function settlePaystackTransaction({
    supabase,
    reference,
    secretKey = process.env.PAYSTACK_SECRET_KEY,
    fetchImpl = fetch,
    now = () => new Date().toISOString(),
}) {
    const { data: transaction, error: lookupError } = await supabase
        .from('transactions')
        .select('*')
        .eq('provider_reference', reference)
        .maybeSingle();

    if (lookupError) throw new Error('Could not load the payment record.');
    if (!transaction || transaction.provider !== 'paystack' || transaction.method !== 'paystack') {
        throw new Error('Payment reference not found.');
    }

    const verified = await verifyPaystackReference(reference, { secretKey, fetchImpl });
    const expectedAmount = Math.round(Number(transaction.amount) * 100);
    if (
        verified.reference !== reference ||
        verified.status !== 'success' ||
        Number(verified.amount) !== expectedAmount ||
        verified.currency !== transaction.currency
    ) {
        return { success: false };
    }

    const { error: transactionError } = await supabase
        .from('transactions')
        .update({
            status: 'paid',
            receipt_number: verified.receipt_number || reference,
            paid_at: verified.paid_at || now(),
        })
        .eq('id', transaction.id);
    if (transactionError) throw new Error('Could not update the payment record.');

    if (transaction.attendee_id) {
        const { error: attendeeError } = await supabase
            .from('attendees')
            .update({ payment_status: 'paid' })
            .eq('id', transaction.attendee_id);
        if (attendeeError) throw new Error('Could not update the attendee registration.');
    }

    return { success: true };
}

module.exports = { initializeUssdPaystackCheckout, verifyPaystackReference, settlePaystackTransaction };
