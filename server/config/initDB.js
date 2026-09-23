const db = require('./db');

const createTablesSQL = `
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'attendee' CHECK (role IN ('organizer', 'attendee', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'General',
    event_date DATE NOT NULL,
    event_time VARCHAR(20) NOT NULL,
    venue VARCHAR(150) NOT NULL,
    capacity INT DEFAULT 100,
    organizer_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Event Schedules / Agenda Table
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    time_slot VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    speaker VARCHAR(100),
    location VARCHAR(100)
);

-- 4. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    attendee_name VARCHAR(100),
    attendee_phone VARCHAR(20) NOT NULL,
    qr_code_token VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'cancelled')),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, attendee_phone)
);

-- 5. Emergency Logs Table (for Socket.IO and AT Voice integrations)
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id SERIAL PRIMARY KEY,
    sender_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function initializeDatabase() {
    try {
        await db.query(createTablesSQL);
        console.log('✅ Database tables verified/created successfully.');
    } catch (error) {
        console.error('❌ Failed to initialize database schema:', error.message);
    }
}

module.exports = initializeDatabase;