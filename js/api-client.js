/**
 * Stokbar Umatis — HTTP client ke API PHP + MySQL
 */

// Production: set di login.html atau Vercel env → window.STOKBAR_API_URL
// Contoh: https://stokbar-umatis.onrender.com/api/index.php
const API_URL = window.STOKBAR_API_URL || 'api/index.php';

const USE_API =
  (typeof USE_SUPABASE === 'undefined' || !USE_SUPABASE) &&
  window.location.protocol !== 'file:' &&
  !window.STOKBAR_FORCE_LOCAL &&
  (window.STOKBAR_API_URL || !window.location.hostname.endsWith('.vercel.app'));

async function apiRequest(action, options = {}) {
  const { method = 'GET', body = null, query = {} } = options;
  const params = new URLSearchParams({ action, ...query });
  const url = `${API_URL}?${params.toString()}`;

  const fetchOpts = {
    method,
    credentials: 'same-origin',
    headers: {},
  };

  if (body && method !== 'GET') {
    fetchOpts.headers['Content-Type'] = 'application/json';
    fetchOpts.body = JSON.stringify(body);
  }

  const res = await fetch(url, fetchOpts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok && !data.message) {
    throw new Error('Server error (' + res.status + ')');
  }
  if (data.success === false) {
    throw new Error(data.message || 'Permintaan gagal');
  }
  return data;
}

async function apiGet(action, query = {}) {
  return apiRequest(action, { method: 'GET', query });
}

async function apiPost(action, body = {}, query = {}) {
  return apiRequest(action, { method: 'POST', body, query });
}

async function apiPing() {
  try {
    await apiGet('ping');
    return true;
  } catch {
    return false;
  }
}
