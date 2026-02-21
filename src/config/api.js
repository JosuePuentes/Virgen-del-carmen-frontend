/**
 * Cliente API para el backend (FastAPI en Render).
 * IMPORTANTE: Define VITE_API_URL en Vercel (Variables de entorno) para que el frontend
 * se conecte al backend. Ej: VITE_API_URL=https://droclven-back.onrender.com
 * Todas las llamadas usan: fetch(`${import.meta.env.VITE_API_URL}/ruta`, ...)
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://droclven-back.onrender.com'

export function getApiUrl(path) {
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
  if (token) {
    localStorage.setItem('token', token)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_modulos')
  } else {
    localStorage.removeItem('token')
  }
}

export function getRif() {
  return localStorage.getItem('rif')
}

export function setRif(rif) {
  if (rif) localStorage.setItem('rif', rif)
  else localStorage.removeItem('rif')
}

/* Área administrativa */
export function getAdminToken() {
  return localStorage.getItem('admin_token')
}

export function setAdminToken(token) {
  if (token) {
    localStorage.setItem('admin_token', token)
    localStorage.removeItem('token')
    localStorage.removeItem('rif')
  } else {
    localStorage.removeItem('admin_token')
  }
}

export function getAdminUser() {
  try {
    const u = localStorage.getItem('admin_user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

export function setAdminUser(user) {
  if (user) localStorage.setItem('admin_user', JSON.stringify(user))
  else localStorage.removeItem('admin_user')
}

export function getAdminModulos() {
  try {
    const m = localStorage.getItem('admin_modulos')
    const modulos = m ? JSON.parse(m) : []
    return modulos
  } catch {
    return []
  }
}

/** true si el usuario tiene permiso para el módulo. Si modulos incluye "master" o "*", tiene todo. Si modulos está vacío (legacy/backend sin permisos), tiene todo. */
export function hasModulo(modulo) {
  const modulos = getAdminModulos()
  if (!modulos || modulos.length === 0) return true
  if (modulos.includes('master') || modulos.includes('*')) return true
  return modulos.includes(modulo)
}

export function setAdminModulos(modulos) {
  if (modulos?.length) localStorage.setItem('admin_modulos', JSON.stringify(modulos))
  else localStorage.removeItem('admin_modulos')
}

export function isAdminLoggedIn() {
  return !!getAdminToken()
}

export function logoutAdmin() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  localStorage.removeItem('admin_modulos')
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

/** Login cliente: devuelve { ok, data, error } para manejar 403 (pendiente/rechazado) */
export async function loginCliente(email, password) {
  const url = getApiUrl('login/')
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (res.ok) return { ok: true, data }
  if (res.status === 403) {
    const msg = Array.isArray(data.detail) ? data.detail[0]?.msg || data.detail[0] : data.detail || 'Acceso denegado'
    return { ok: false, error: typeof msg === 'string' ? msg : JSON.stringify(msg) }
  }
  return { ok: false, error: data.detail || data.message || 'Error al iniciar sesión' }
}

/**
 * Login unificado: intenta cliente primero, luego admin.
 * El backend identifica si es cliente (email) o admin (usuario).
 * Devuelve { ok, data, rol: 'client'|'admin', error }
 */
export async function loginUnificado(identificador, password) {
  const resCliente = await fetch(getApiUrl('login/'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email: identificador, password }),
  })
  const dataCliente = await resCliente.json().catch(() => ({}))
  if (resCliente.ok && dataCliente.access_token) {
    return { ok: true, data: dataCliente, rol: 'client' }
  }
  if (resCliente.status === 403) {
    const msg = Array.isArray(dataCliente.detail) ? dataCliente.detail[0]?.msg || dataCliente.detail[0] : dataCliente.detail || 'Acceso denegado'
    return { ok: false, error: typeof msg === 'string' ? msg : JSON.stringify(msg) }
  }
  const resAdmin = await fetch(getApiUrl('login/admin/'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ usuario: identificador, password }),
  })
  const dataAdmin = await resAdmin.json().catch(() => ({}))
  if (resAdmin.ok && dataAdmin.access_token) {
    return { ok: true, data: dataAdmin, rol: 'admin' }
  }
  return { ok: false, error: dataAdmin.detail || dataCliente.detail || 'Usuario o contraseña incorrectos' }
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

/** POST con FormData (archivos). No incluye Content-Type para que el navegador lo establezca con boundary. */
export async function apiPostForm(path, formData, token = null) {
  const url = getApiUrl(path)
  const headers = {}
  if (token ?? getToken()) headers['Authorization'] = `Bearer ${token ?? getToken()}`
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json().catch(() => ({}))
}
