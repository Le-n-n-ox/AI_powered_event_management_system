const rateLimit = require('express-rate-limit');

// Generic strict limiter for anything that costs money or is a common abuse target
function makeLimiter({ windowMs, max, message }) {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: message },
        // Keyed by IP by default — fine for a hackathon-scale app.
        // If you later sit behind a proxy (Render, Vercel, etc.), make sure
        // `app.set('trust proxy', 1)` is set in index.js so the real client
        // IP is used instead of the proxy's.
    });
}

// SMS/USSD webhooks: AT itself won't hammer you, but this caps damage if
// someone discovers your webhook URL and credentials
const webhookLimiter = makeLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: 'Too many webhook requests, slow down.',
});

// Document extraction: each call burns Gemini quota and costs money
const extractLimiter = makeLimiter({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: 'Too many extraction requests. Try again in a few minutes.',
});

// Admin actions: suspend/unsuspend shouldn't be hammered either
const adminLimiter = makeLimiter({
    windowMs: 60 * 1000,
    max: 20,
    message: 'Too many admin requests, slow down.',
});

module.exports = { webhookLimiter, extractLimiter, adminLimiter };