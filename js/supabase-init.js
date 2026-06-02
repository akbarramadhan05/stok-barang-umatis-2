/**
 * Stokbar Umatis — Supabase client
 */
let _supabaseClient = null;

function isSupabaseConfigured() {
  const url = window.SUPABASE_URL || "";
  const key = window.SUPABASE_ANON_KEY || "";
  return (
    url.includes("supabase.co") &&
    !url.includes("XXXXXXXX") &&
    key.length > 20 &&
    !key.includes("ISI_ANON") &&
    (key.startsWith("eyJ") || key.startsWith("sb_publishable_"))
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
