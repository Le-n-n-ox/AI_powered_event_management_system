function webhookAuth(req, res, next) {
    // 1. Check for a secret token in the query string (Recommended for Africa's Talking)
    const token = req.query.token;
    if (token && token === process.env.WEBHOOK_TOKEN) {
        return next();
    }

    // 2. Fallback to Basic Auth (for other integrated services)
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Basic ')) {
        const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
        const [user, pass] = decoded.split(':');

        if (user === process.env.WEBHOOK_USER && pass === process.env.WEBHOOK_PASS) {
            return next();
        }
    }

    console.warn('⚠️ Webhook request rejected: missing or invalid token/auth');
    return res.status(401).send('Unauthorized');
}

module.exports = webhookAuth;