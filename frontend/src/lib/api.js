// frontend/src/lib/api.js
const rawBase = (import.meta.env.VITE_API_BASE_URL || "").trim();

function normalizeBase(u) {
  if (!u) return "http://localhost:10000"; // dev fallback
  let base = u;
  if (/^\d+$/.test(base)) base = `http://localhost:${base}`; // "10000" → http://localhost:10000
  if (!/^https?:\/\//i.test(base)) base = `http://${base}`; // "localhost:10000" → http://localhost:10000
  return base.replace(/\/+$/, ""); // strip trailing slash
}

function joinURL(base, path) {
  if (/^https?:\/\//i.test(path)) return path; // ← pass full URLs through
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const API_BASE = normalizeBase(rawBase);
console.log("[API_BASE]", API_BASE); // TEMP: verify in console during dev

async function handle(res) {
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export function getJSON(path, opts = {}) {
  return fetch(joinURL(API_BASE, path), {
    credentials: "include",
    ...opts,
  }).then(handle);
}

export function postJSON(path, body, opts = {}) {
  return fetch(joinURL(API_BASE, path), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
    body: JSON.stringify(body),
    credentials: "include",
    ...opts,
  }).then(handle);
}
export function postForm(path, formObj, opts = {}) {
  const body = new URLSearchParams(formObj);
  return fetch(joinURL(API_BASE, path), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(opts.headers ?? {}),
    },
    body,
    credentials: "include",
    ...opts,
  }).then(handle);
}
export function putJSON(path, body, opts = {}) {
  return fetch(joinURL(API_BASE, path), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
    body: JSON.stringify(body),
    credentials: "include",
    ...opts,
  }).then(handle);
}
export function patchJSON(path, body, opts = {}) {
  return fetch(joinURL(API_BASE, path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
    body: JSON.stringify(body),
    credentials: "include",
    ...opts,
  }).then(handle);
}
export function delJSON(path, opts = {}) {
  return fetch(joinURL(API_BASE, path), {
    method: "DELETE",
    credentials: "include",
    ...opts,
  }).then(handle);
}
