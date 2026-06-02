/**
 * Generate js/supabase-config.js dari environment variable Vercel
 */
const fs = require("fs");
const path = require("path");

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_ANON_KEY || "";

if (!url || !key) {
  console.warn("SUPABASE_URL / SUPABASE_ANON_KEY kosong — pakai placeholder.");
}

const content = `/**
 * Auto-generated saat deploy Vercel — jangan edit manual di production
 */
window.SUPABASE_URL = ${JSON.stringify(url || "https://XXXXXXXX.supabase.co")};
window.SUPABASE_ANON_KEY = ${JSON.stringify(key || "ISI_ANON_KEY")};
`;

const out = path.join(__dirname, "..", "js", "supabase-config.js");
fs.writeFileSync(out, content, "utf8");
console.log("Written:", out);
