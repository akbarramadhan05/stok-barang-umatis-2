/**
 * Stokbar Umatis — Supabase client
 */
let _supabaseClient = null;

function isSupabaseConfigured() {
  return (
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_URL.includes("XXXXXXXX") &&
    !window.SUPABASE_ANON_KEY.includes("ISI_ANON")
  );
}

function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!_supabaseClient && window.supabase) {
    _supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
  return _supabaseClient;
}

const USE_SUPABASE = isSupabaseConfigured();

async function testSupabaseConnection() {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase belum dikonfigurasi (supabase-config.js)");
  const { error } = await sb.from("settings").select("setting_key").limit(1);
  if (error) throw error;
  return true;
}
