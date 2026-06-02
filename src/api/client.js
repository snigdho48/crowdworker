import axios from 'axios'

const API_BASE = "https://crowdwork360.com";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

export async function login(username, password) {
  const { data } = await api.post('/auth/token/', {
    username,
    password,
  })
  localStorage.setItem('access', data.access)
  localStorage.setItem('refresh', data.refresh)
}

export function logout() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}

export async function refreshMe() {
  const { data } = await api.get('/accounts/me/')
  return data
}
