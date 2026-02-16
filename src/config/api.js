/**
 * Cliente API para conectar con el backend en Render.
 * La URL se toma de VITE_API_URL en .env
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://droclven-back.onrender.com'

function getApiUrl(path) {
  const p = path.startsWith('/') ? path : '/' + path
  return API_BASE_URL + p
}

export async function apiGet(path) {
  const url = getApiUrl(path)
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json().catch(() => ({}))
}

export async function apiPost(path, body) {
  const url = getApiUrl(path)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json().catch(() => ({}))
}
