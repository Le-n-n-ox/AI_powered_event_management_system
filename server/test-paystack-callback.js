const test = require('node:test');
const assert = require('node:assert/strict');
const { settlePaystackTransaction } = require('./lib/paystack');

function createSupabaseStub(transaction) {
    const state = { transactionPatch: null, attendeePatch: null };
    return {
        state,
        from(table) {
            if (table === 'transactions') {
                return {
                    select: () => ({
                        eq: () => ({ maybeSingle: async () => ({ data: transaction, error: null }) }),
                    }),
                    update: (patch) => {
                        state.transactionPatch = patch;
                        return { eq: async () => ({ error: null }) };
                    },
                };
            }
            assert.equal(table, 'attendees');
            return {
                update: (patch) => {
                    state.attendeePatch = patch;
                    return { eq: async () => ({ error: null }) };
                },
            };
        },
    };
}

const TRANSACTION = {
    id: 'transaction-1',
    attendee_id: 'attendee-1',
    provider: 'paystack',
    method: 'paystack',
    provider_reference: 'ussd_ref-1',
    amount: 500,
    currency: 'KES',
    status: 'pending',
};

function paystackReply(overrides = {}) {
    return {
        reference: TRANSACTION.provider_reference,
        status: 'success',
        amount: 50000,
        currency: 'KES',
        receipt_number: 'RCP-1',
        paid_at: '2030-06-01T12:00:00.000Z',
        ...overrides,
    };
}

test('verified Paystack callback marks the ledger and attendee paid', async () => {
    const supabase = createSupabaseStub(TRANSACTION);
    const result = await settlePaystackTransaction({
        supabase,
        reference: TRANSACTION.provider_reference,
        secretKey: 'sk_test_example',
        fetchImpl: async () => ({ ok: true, json: async () => ({ status: true, data: paystackReply() }) }),
    });

    assert.equal(result.success, true);
    assert.equal(supabase.state.transactionPatch.status, 'paid');
    assert.equal(supabase.state.transactionPatch.receipt_number, 'RCP-1');
    assert.deepEqual(supabase.state.attendeePatch, { payment_status: 'paid' });
});

test('Paystack callbacks with an amount mismatch do not unlock the registration', async () => {
    const supabase = createSupabaseStub(TRANSACTION);
    const result = await settlePaystackTransaction({
        supabase,
        reference: TRANSACTION.provider_reference,
        secretKey: 'sk_test_example',
        fetchImpl: async () => ({ ok: true, json: async () => ({ status: true, data: paystackReply({ amount: 1 }) }) }),
    });

    assert.equal(result.success, false);
    assert.equal(supabase.state.transactionPatch, null);
    assert.equal(supabase.state.attendeePatch, null);
});
