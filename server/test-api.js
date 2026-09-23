// test-api.js
async function testRoutes() {
    const BASE_URL = 'http://localhost:3000/api';
    
    // Use a unique email timestamp so we don't hit duplicate user errors if you run this multiple times
    const testEmail = `organizer${Date.now()}@tech.com`; 
    const testPassword = 'securepassword123';
    let token = '';
    let userId = null;
    let eventId = null;

    console.log("🚀 Starting API Tests...\n");

    try {
        // --- 1. TEST REGISTRATION ---
        console.log(`1️⃣ Testing POST /api/auth/register...`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test Organizer",
                email: testEmail,
                password: testPassword,
                role: "organizer"
            })
        });
        const regData = await regRes.json();
        console.log("Response:", regData);
        if (regData.error) throw new Error(regData.error);
        
        userId = regData.user.id;
        console.log("✅ Registration passed.\n");

        // --- 2. TEST LOGIN ---
        console.log(`2️⃣ Testing POST /api/auth/login...`);
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: testPassword })
        });
        const loginData = await loginRes.json();
        console.log("Response:", loginData);
        if (loginData.error) throw new Error(loginData.error);
        
        token = loginData.token;
        console.log("✅ Login passed.\n");

        // --- 3. TEST CREATE EVENT ---
        console.log(`3️⃣ Testing POST /api/events...`);
        const createEventRes = await fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                title: "AI Hackathon 2026",
                description: "Building the future with AI.",
                category: "Technology",
                event_date: "2026-10-15",
                event_time: "09:00 AM",
                venue: "Nairobi Tech Hub",
                capacity: 200,
                organizer_id: userId
            })
        });
        const eventData = await createEventRes.json();
        console.log("Response:", eventData);
        if (eventData.error) throw new Error(eventData.error);
        
        eventId = eventData.id;
        console.log("✅ Event Creation passed.\n");

        // --- 4. TEST FETCH EVENTS ---
        console.log(`4️⃣ Testing GET /api/events...`);
        const getEventsRes = await fetch(`${BASE_URL}/events`);
        const getEventsData = await getEventsRes.json();
        console.log(`Response: Found ${getEventsData.length} event(s).`);
        console.log("✅ Fetch Events passed.\n");

        // --- 5. TEST ATTENDEE REGISTRATION ---
        console.log(`5️⃣ Testing POST /api/events/${eventId}/register...`);
        const attendeeRes = await fetch(`${BASE_URL}/events/${eventId}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                attendee_name: "Jane Doe",
                // Randomize phone to prevent duplicate entry errors on multiple runs
                attendee_phone: `+2547${Math.floor(10000000 + Math.random() * 90000000)}` 
            })
        });
        const attendeeData = await attendeeRes.json();
        console.log("Response:", attendeeData);
        if (attendeeData.error) throw new Error(attendeeData.error);
        
        console.log("✅ Attendee Registration passed.\n");

        console.log("🎉 ALL API TESTS PASSED! Your database and backend are fully working.");

    } catch (err) {
        console.error("\n❌ TEST FAILED:", err.message);
    }
}

testRoutes();