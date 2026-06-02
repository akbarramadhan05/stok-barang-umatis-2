/**
 * Generate js/supabase-config.js dari environment variable Vercel.
 * Jika env kosong, pertahankan file yang sudah ada (jangan timpa dengan placeholder).
 */
const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "..", "js", "supabase-config.js");
const DEFAULT_URL = "https://klblycxszklteapdfwyf.supabase.co";

function normalizeUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim().replace(/\/+$/, "");
  try {
    const u = new URL(trimmed);
    if (!u.hostname.includes("supabase.co")) return "";
    return u.origin;
  } catch {
    return "";
  }
}

function normalizeKey(raw) {
  if (!raw || typeof raw !== "string") return "";
  return raw.trim().replace(/^["']|["']$/g, "");
}

function readExisting() {
  if (!fs.existsSync(out)) return { url: "", key: "" };
  const text = fs.readFileSync(out, "utf8");
  const urlMatch = text.match(/SUPABASE_URL\s*=\s*["']([^"']+)["']/);
  const keyMatch = text.match(/SUPABASE_ANON_KEY\s*=\s*["']([^"']+)["']/);
  return {
    url: urlMatch ? normalizeUrl(urlMatch[1]) : "",
    key: keyMatch ? normalizeKey(keyMatch[1]) : "",
  };
}

const envUrl = normalizeUrl(process.env.SUPABASE_URL || "");
const envKey = normalizeKey(process.env.SUPABASE_ANON_KEY || "");
const existing = readExisting();

const url = envUrl || existing.url || DEFAULT_URL;
const key = envKey || existing.key;

if (!envUrl && !envKey) {
  console.warn(
    "SUPABASE_URL / SUPABASE_ANON_KEY tidak di-set di Vercel — memakai nilai di js/supabase-config.js"
  );
}

if (!key || key.includes("ISI_ANON")) {
  console.warn(
    "SUPABASE_ANON_KEY belum valid — isi di Vercel atau js/supabase-config.js (anon public eyJ... dari Supabase)"
  );
}

const content = `/**
 * Supabase credentials — di-generate saat deploy jika env Vercel di-set.
 */
window.SUPABASE_URL = ${JSON.stringify(url)};
window.SUPABASE_ANON_KEY = ${JSON.stringify(key || "")};
`;

fs.writeFileSync(out, content, "utf8");
console.log("Written:", out);
