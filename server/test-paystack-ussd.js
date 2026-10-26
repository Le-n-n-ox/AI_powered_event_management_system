const test = require('node:test');
const assert = require('node:assert/strict');
const { initializeUssdPaystackCheckout } = require('./lib/paystack');

function createSupabaseStub() {
    const state = { transaction: null, failureUpdate: null };
    return {
        state,
        from(table) {
            assert.equal(table, 'transactions');
            return {
                insert(row) {
                    state.transaction = row;
                    return {
                        select() {
                            return { single: async () => ({ data: { id: 'transaction-1' }, error: null }) };
                        },
                    };
                },
                update(patch) {
                    state.failureUpdate = patch;
                    return { eq: async () => ({ error: null }) };
                },
            };
        },
    };
}

const ATTENDEE = { id: 'attendee-1', full_name: 'Jane Doe' };
const EVENT = {
    id: 'event-1',
    organizer_id: 'organizer-1',
    name: 'Product Summit',
    is_paid: true,
    ticket_price: 500,
};

test('USSD Paystack checkout uses test mode and stores a pending KES ledger entry', async () => {
    const supabase = createSupabaseStub();
    let request;
    const authorizationUrl = 'https://checkout.paystack.test/authorize/ref';
    const result = await initializeUssdPaystackCheckout({
        supabase,
        attendee: ATTENDEE,
        event: EVENT,
        phone: '+254712345678',
        secretKey: 'sk_test_example',
        callbackUrl: 'https://help.example/api/payments/paystack/callback',
        fetchImpl: async (url, options) => {
            request = { url, options };
            return { ok: true, json: async () => ({ status: true, data: { authorization_url: authorizationUrl } }) };
        },
        createReference: () => 'ussd_test-reference',
    });

    assert.equal(result, authorizationUrl);
    assert.equal(supabase.state.transaction.event_id, EVENT.id);
    assert.equal(supabase.state.transaction.attendee_id, ATTENDEE.id);
    assert.equal(supabase.state.transaction.amount, 500);
    assert.equal(supabase.state.transaction.currency, 'KES');
    assert.equal(supabase.state.transaction.status, 'pending');
    assert.equal(supabase.state.transaction.method, 'paystack');
    assert.equal(supabase.state.transaction.provider_reference, 'ussd_test-reference');
    assert.equal(request.url, 'https://api.paystack.co/transaction/initialize');
    assert.equal(request.options.headers.Authorization, 'Bearer sk_test_example');
    assert.equal(JSON.parse(request.options.body).callback_url, 'https://help.example/api/payments/paystack/callback');
    assert.equal(JSON.parse(request.options.body).amount, 50000);
});

test('USSD checkout refuses a live Paystack key before creating a transaction', async () => {
    const supabase = createSupabaseStub();
    await assert.rejects(
        initializeUssdPaystackCheckout({
            supabase,
            attendee: ATTENDEE,
            event: EVENT,
            phone: '+254712345678',
            secretKey: 'sk_live_not-for-ussd',
            callbackUrl: 'https://help.example/api/payments/paystack/callback',
            fetchImpl: async () => { throw new Error('should not be called'); },
        }),
        /test key/,
    );
    assert.equal(supabase.state.transaction, null);
});

test('failed Paystack initialization marks the pending ledger row failed', async () => {
    const supabase = createSupabaseStub();
    await assert.rejects(
        initializeUssdPaystackCheckout({
            supabase,
            attendee: ATTENDEE,
            event: EVENT,
            phone: '+254712345678',
            secretKey: 'sk_test_example',
            callbackUrl: 'https://help.example/api/payments/paystack/callback',
            fetchImpl: async () => ({ ok: false, json: async () => ({ status: false }) }),
            createReference: () => 'ussd_failed-reference',
        }),
        /checkout URL/,
    );
    assert.deepEqual(supabase.state.failureUpdate, { status: 'failed' });
});
