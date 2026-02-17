/**
 * Cliente API para el backend (FastAPI en Render).
 * IMPORTANTE: Define VITE_API_URL en Vercel (Variables de entorno) para que el frontend
 * se conecte al backend. Ej: VITE_API_URL=https://droclven-back.onrender.com
 * Todas las llamadas usan: fetch(`${import.meta.env.VITE_API_URL}/ruta`, ...)
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://droclven-back.onrender.com'

function getApiUrl(path) {
  const p = path.startsWith('/') ? path : '/' + path
  return API_BASE_URL + p
}

function getHeaders(token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export function getRif() {
  return localStorage.getItem('rif')
}

export function setRif(rif) {
  if (rif) localStorage.setItem('rif', rif)
  else localStorage.removeItem('rif')
}

export async function apiGet(path, token = null) {
  const url = getApiUrl(path)
  const res = await fetch(url, {
    method: 'GET',
    headers: getHeaders(token ?? getToken()),
  })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json().catch(() => ({}))
}

export async function apiPost(path, body, token = null) {
  const url = getApiUrl(path)
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(token ?? getToken()),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json().catch(() => ({}))
}

export async function apiPut(path, body, token = null) {
  const url = getApiUrl(path)
  const res = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(token ?? getToken()),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json().catch(() => ({}))
}

export async function apiPatch(path, body, token = null) {
  const url = getApiUrl(path)
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders(token ?? getToken()),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json().catch(() => ({}))
}

export async function apiDelete(path, token = null) {
  const url = getApiUrl(path)
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(token ?? getToken()),
  })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json().catch(() => ({}))
}
