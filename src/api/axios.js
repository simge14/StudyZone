import axios from 'axios';

/*
 * Development: baseURL is '' (relative). CRA proxy in package.json tunnels
 *   /api/* → http://localhost:3000/api/*  — no CORS issues.
 * Production:  baseURL comes from REACT_APP_API_URL env var.
 */
const base =
  process.env.NODE_ENV === 'development'
    ? ''
    : (process.env.REACT_APP_API_URL || '');

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/* Attach JWT from localStorage to every outgoing request header */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sz_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* Broadcast online/offline status; auto-redirect on 401 (expired token) */
api.interceptors.response.use(
  (res) => {
    window.dispatchEvent(new CustomEvent('sz-server-online'));
    return res;
  },
  (err) => {
    if (!err.response) {
      /* Network error — backend unreachable */
      window.dispatchEvent(new CustomEvent('sz-server-offline'));
    } else if (err.response.status === 401) {
      /* Token expired or invalid — clear session and force re-login */
      localStorage.removeItem('sz_token');
      localStorage.removeItem('sz_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
