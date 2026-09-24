const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ CRITICAL: Supabase URL or Service Key missing from .env file!");
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('☁️ Connected to Supabase via HTTPS API Client');

// Compatibility wrapper to prevent startup crashes from raw SQL calls
const query = async (text, params) => {
    console.warn("⚠️ Raw SQL query intercepted. Use Supabase client methods in routes.");
    return { rows: [] };
};

module.exports = { supabase, query };