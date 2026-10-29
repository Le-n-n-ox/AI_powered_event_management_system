const axios = require('axios');

async function test() {
    const url = 'http://localhost:3000/webhook/incoming?token=my_super_secret_event_token_123';
    const payload = {
        from: '+254114796633',
        text: 'The projector in Hall B is not working and it is very frustrating!',
        id: 'test-id-123',
        date: new Date().toISOString()
    };

    try {
        console.log('🚀 Sending simulated complaint...');
        const res = await axios.post(url, payload);
        console.log('✅ Server Response:', res.status, res.data);
    } catch (err) {
        console.error('❌ Request failed:', err.response ? err.response.data : err.message);
    }
}

test();
