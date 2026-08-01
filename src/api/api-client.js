const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function getToken() {
  return window.localStorage.getItem('fokus_access_token')
}

function normalizeApiError(payload, status) {
  const message = payload?.message || 'So‘rovni bajarib bo‘lmadi'
  return new ApiError(message, status, payload?.errors)
}

export async function apiRequest(path, options = {}) {
  if (!API_URL) throw new ApiError('API manzili sozlanmagan', 0)

  const token = getToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    signal: options.signal,
  })

  if (response.status === 401) {
    // Future session refresh or logout handling belongs here.
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw normalizeApiError(payload, response.status)
  }

  return response.status === 204 ? null : response.json()
}

