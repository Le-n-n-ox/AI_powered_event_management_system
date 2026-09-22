require('dotenv').config();
const express = require('express');
const { processMessageWithAI } = require('./ai');

const credentials = {
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME
};
const AfricasTalking = require('africastalking')(credentials);
const sms = AfricasTalking.SMS;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/webhook/incoming', (req, res) => {
    res.status(200).send('Webhook is active!');
});

app.post('/webhook/incoming', async (req, res) => {
    res.sendStatus(200);

    const { from, text } = req.body;
    console.log(`\n📨 INCOMING FROM ${from}: "${text}"`);

    // 1. Process with Gemini AI
    const aiResult = await processMessageWithAI(text);
    console.log(`🤖 AI DECISION:`, aiResult);

    // 2. Send the AI's reply back via SMS
    try {
        await sms.send({
            to: [from],
            message: aiResult.reply
        });
        console.log(`📤 SENT REPLY TO ${from}`);
    } catch (error) {
        console.error(`❌ Failed to send SMS:`, error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Step 2 Server running on port ${PORT}`);
});