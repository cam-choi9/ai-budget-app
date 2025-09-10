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

// Ensure opts are merged first, then set headers LAST (so they can't be overwritten)
export function postJSON(path, body, opts = {}) {
  const finalBody = typeof body === "string" ? body : JSON.stringify(body);
  return fetch(joinURL(API_BASE, path), {
    method: "POST",
    credentials: "include",
    ...opts, // <- spread first
    headers: { ...(opts.headers ?? {}), "Content-Type": "application/json" }, // <- last; keeps JSON
    body: finalBody,
  }).then(handle);
}

export function getJSON(path, opts = {}) {
  return fetch(joinURL(API_BASE, path), {
    credentials: "include",
    ...opts,
    headers: { ...(opts.headers ?? {}) }, // no default CT for GET
  }).then(handle);
}

export function putJSON(path, body, opts = {}) {
  return fetch(joinURL(API_BASE, path), {
    method: "PUT",
    credentials: "include",
    ...opts,
    headers: { ...(opts.headers ?? {}), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(handle);
}

export function patchJSON(path, body, opts = {}) {
  return fetch(joinURL(API_BASE, path), {
    method: "PATCH",
    credentials: "include",
    ...opts,
    headers: { ...(opts.headers ?? {}), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(handle);
}

export function delJSON(path, opts = {}) {
  return fetch(joinURL(API_BASE, path), {
    method: "DELETE",
    credentials: "include",
    ...opts,
    headers: { ...(opts.headers ?? {}) },
  }).then(handle);
}

export function postForm(path, formObj, opts = {}) {
  const body = new URLSearchParams(formObj);
  return fetch(joinURL(API_BASE, path), {
    method: "POST",
    credentials: "include",
    ...opts,
    headers: {
      ...(opts.headers ?? {}),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  }).then(handle);
}
