/**
 * M-Pesa Daraja (Safaricom) client.
 *
 * Handles the three things the app needs from Daraja:
 *   1. an OAuth token (short lived, ~1h)
 *   2. an STK Push, so an attendee can pay from their phone
 *   3. a transaction status query, used to verify callbacks (Daraja does not
 *      sign its callbacks, so we never trust the payload on its own)
 *
 * Everything is env driven so the same code runs against the sandbox and
 * production:
 *
 *   MPESA_ENVIRONMENT=sandbox
 *   MPESA_CONSUMER_KEY=...
 *   MPESA_CONSUMER_SECRET=...
 *   MPESA_SHORTCODE=174379
 *   MPESA_PASSKEY=...
 *   MPESA_CALLBACK_URL=https://your-host/api/payments/callback
 *
 * Organizers can credit the money to their own paybill (accno) instead of
 * the platform's. Two cases are supported:
 *
 *   1. The accno is a paybill under the platform's shortcode. Nothing else
 *      is needed — the paybill becomes PartyB and the money lands there.
 *
 *   2. The organizer has their own Daraja account (their own shortcode,
 *      passkey and consumer keys). Register it in MPESA_PAYBILL_CREDENTIALS:
 *
 *        MPESA_PAYBILL_CREDENTIALS='{"522533":{"shortcode":"522533","passkey":"...","consumerKey":"...","consumerSecret":"..."}}'
 *
 *      A push to that accno then uses the organizer's own credentials.
 */

const DEFAULTS = {
    sandbox: {
        baseUrl: 'https://sandbox.safaricom.co.ke',
        shortcode: '174379',
        passkey: 'passkey',
        timestamp: '20191213',
    },
    production: {
        baseUrl: 'https://api.safaricom.co.ke',
        shortcode: '',
        passkey: '',
        timestamp: '',
    },
};

/**
 * The callback URL, cleaned up.
 *
 * Daraja only accepts a bare http(s) URL. A value pasted out of a Markdown
 * link ("[https://x](https://x)") or wrapped in quotes is rejected by the API
 * with an opaque error, so pull the first URL out of whatever was configured.
 *
 * @param {string} raw
 * @returns {string} a bare URL, or '' when there is not one
 */
function normaliseCallbackUrl(raw) {
    const value = String(raw || '').trim();
    if (!value) return '';

    // Markdown link: [label](https://x) — checked first, because the bare
    // pattern below would otherwise match across the brackets.
    const markdown = value.match(/\]\(\s*(https?:\/\/[^\s)]+)\s*\)/i);
    if (markdown) return markdown[1];

    // Angle brackets: <https://x>
    const angled = value.match(/<(https?:\/\/[^>\s]+)>/i);
    if (angled) return angled[1];

    // A bare URL, possibly with trailing punctuation from a sentence.
    const bare = value.match(/(https?:\/\/[^\s"'<>\]]+)/i);
    if (bare) return bare[1].replace(/[.,;:)]+$/, '');

    return '';
}

function settings() {
    const environment = (process.env.MPESA_ENVIRONMENT || 'sandbox').toLowerCase();
    const fallback = DEFAULTS[environment] || DEFAULTS.sandbox;

    return {
        environment,
        baseUrl: process.env.MPESA_BASE_URL || fallback.baseUrl,
        consumerKey: process.env.MPESA_CONSUMER_KEY || '',
        consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
        shortcode: process.env.MPESA_SHORTCODE || fallback.shortcode,
        passkey: process.env.MPESA_PASSKEY || fallback.passkey,
        timestamp: process.env.MPESA_TIMESTAMP || fallback.timestamp,
        callbackUrl: normaliseCallbackUrl(process.env.MPESA_CALLBACK_URL),
    };
}

/**
 * The per-paybill credentials, if the operator registered any.
 * Malformed JSON is ignored rather than fatal — the platform's own
 * credentials still work.
 */
function paybillCredentials() {
    const raw = process.env.MPESA_PAYBILL_CREDENTIALS;
    if (!raw) return {};

    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        console.warn('⚠️ MPESA_PAYBILL_CREDENTIALS is not valid JSON — ignoring it.');
        return {};
    }
}

/**
 * The credentials a push to `paybill` should use.
 *
 * With no paybill, or a paybill the platform has no credentials for, this is
 * the platform's own set. Otherwise it is the organizer's own set, so the
 * money is credited to their shortcode.
 */
function credentialsFor(paybill) {
    const s = settings();
    const own = paybillCredentials()[paybill];

    if (!own) {
        return {
            ...s,
            paybill: paybill || s.shortcode,
            usesOwnAccount: false,
        };
    }

    return {
        environment: s.environment,
        baseUrl: s.baseUrl,
        consumerKey: own.consumerKey || '',
        consumerSecret: own.consumerSecret || '',
        shortcode: own.shortcode || paybill,
        passkey: own.passkey || '',
        timestamp: own.timestamp || s.timestamp,
        callbackUrl: s.callbackUrl,
        paybill: paybill || own.shortcode || s.shortcode,
        usesOwnAccount: true,
    };
}

function isConfigured(paybill) {
    const s = credentialsFor(paybill);
    return Boolean(s.consumerKey && s.consumerSecret && s.shortcode && s.passkey);
}

let cachedToken = null; // { key, token, expiresAt }

/**
 * Fetches (and caches) a Daraja OAuth token.
 * @returns {Promise<string>}
 */
async function getAccessToken(credentials) {
    const s = credentials || settings();

    if (!s.consumerKey || !s.consumerSecret || !s.shortcode || !s.passkey) {
        throw new Error('M-Pesa is not configured. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET.');
    }

    // Tokens are per credential set, so a second paybill gets its own.
    const key = `${s.consumerKey}:${s.shortcode}`;

    if (cachedToken && cachedToken.key === key && cachedToken.expiresAt > Date.now() + 60_000) {
        return cachedToken.token;
    }

    const basic = Buffer.from(`${s.consumerKey}:${s.consumerSecret}`).toString('base64');
    const url = `${s.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;

    const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Basic ${basic}` },
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok || !body.access_token) {
        throw new Error(body.error_description || body.error || 'Could not get an M-Pesa access token.');
    }

    cachedToken = {
        key,
        token: body.access_token,
        // Daraja tokens last an hour; refresh a minute early.
        expiresAt: Date.now() + 55 * 60 * 1000,
    };

    return cachedToken.token;
}

/**
 * Sends an STK Push to the attendee's phone.
 *
 * @param {object} opts
 * @param {string} opts.phone            MSISDN, e.g. +2547XXXXXXXX
 * @param {number} opts.amount           Amount in whole KES
 * @param {string} opts.accountReference  Unique reference (we use the transaction id)
 * @param {string} opts.description      Prompt shown on the phone
 * @param {string} [opts.callbackUrl]    Overrides MPESA_CALLBACK_URL
 * @param {string} [opts.paybill]        The accno to credit (organizer's paybill)
 * @returns {Promise<{checkoutRequestId: string, providerReference: string, paybill: string}>}
 */
async function stkPush({ phone, amount, accountReference, description, callbackUrl, paybill }) {
    const s = credentialsFor(paybill);
    const token = await getAccessToken(s);

    // Daraja rejects a missing or malformed callback with an opaque error, so
    // catch it here where the message can say what to fix.
    const resolvedCallback = normaliseCallbackUrl(callbackUrl || s.callbackUrl);
    if (!resolvedCallback) {
        throw new Error(
            'MPESA_CALLBACK_URL is not set to a valid http(s) URL. Daraja needs a bare URL to call back on.',
        );
    }

    const body = {
        BusinessShortCode: s.shortcode,
        Password: s.passkey,
        Timestamp: s.timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: phone,
        // PartyB is the receiving account — the paybill the money is credited to.
        PartyB: s.paybill,
        PhoneNumber: phone,
        CallBackURL: resolvedCallback,
        AccountReference: String(accountReference).slice(0, 13),
        TransactionDesc: String(description || 'Event ticket').slice(0, 13),
    };

    const response = await fetch(`${s.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.ResponseCode !== 0) {
        const message = result.ResponseDescription || result.errorMessage || 'M-Pesa rejected the payment request.';
        const error = new Error(message);
        error.code = result.ResponseCode;
        error.resultCode = result.ResultCode;
        throw error;
    }

    return {
        checkoutRequestId: result.CheckoutRequestID,
        providerReference: result.MerchantRequestID || result.CheckoutRequestID,
        paybill: s.paybill,
    };
}

/**
 * Asks Daraja what actually happened to a CheckoutRequestID.
 * This is how we verify an incoming callback — the callback body is not signed.
 *
 * @param {string} checkoutRequestId
 * @param {string} [paybill] The paybill the push went to, so the query uses
 *   the same credentials the push did.
 * @returns {Promise<{resultCode: number, resultCodeDesc: string, receiptNumber: string|null, amount: number|null, paidAt: string|null}>}
 */
async function queryTransaction(checkoutRequestId, paybill) {
    const s = credentialsFor(paybill);
    const token = await getAccessToken(s);

    const response = await fetch(`${s.baseUrl}/mpesa/transaction/status/v1/query`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ CheckoutRequestID: checkoutRequestId }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.errorMessage || 'Could not verify the M-Pesa transaction.');
    }

    return {
        resultCode: result.ResultCode,
        resultCodeDesc: result.ResultDesc || '',
        receiptNumber: result.ReceiptNumber || null,
        amount: result.Amount ?? null,
        paidAt: result.TransactionDate || null,
    };
}

module.exports = {
    isConfigured,
    getAccessToken,
    stkPush,
    queryTransaction,
    /** The credentials a push to this paybill would use (for the UI). */
    credentialsFor,
};
