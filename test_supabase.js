
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Keys missing in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing connection to:", supabaseUrl);
  const { data, error } = await supabase.from('organizations').select('*');
  if (error) {
    console.error("❌ Error fetching organizations:", error);
  } else {
    console.log("✅ Connection Successful! Found", data.length, "organizations in the database.");
    console.log(data);
  }
}

testConnection();
