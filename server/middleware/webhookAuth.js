function webhookAuth(req, res, next) {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith('Basic ')) {
        console.warn('⚠️ Webhook request rejected: missing auth header');
        return res.status(401).send('Unauthorized');
    }

    const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const [user, pass] = decoded.split(':');

    if (user !== process.env.WEBHOOK_USER || pass !== process.env.WEBHOOK_PASS) {
        console.warn('⚠️ Webhook request rejected: bad credentials');
        return res.status(401).send('Unauthorized');
    }

    next();
}

module.exports = webhookAuth;