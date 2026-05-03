import api from './axios';

/*
 * Endpoint sırası: önce backend'in gerçek yolu, ardından fallback'ler.
 * index.js'de /api/register tanımlı olduğu için bu ilk sırada.
 */
const REGISTER_PATHS = ['/api/register', '/api/auth/register', '/api/users/register'];
const VERIFY_PATHS   = ['/api/verify-otp', '/api/auth/verify-otp', '/api/auth/verify'];
const RESEND_PATHS   = ['/api/resend-otp', '/api/auth/resend-otp'];
const LOGIN_PATHS    = ['/api/login',  '/api/auth/login',  '/api/users/login'];

/* ──────────────────────────────────────────
   Extract a readable error from any backend
   response shape (Express / MSSQL / generic)
────────────────────────────────────────── */
export function extractError(err) {
  if (!err.response) {
    return 'Sunucuya bağlanılamıyor. Backend\'i başlatın (port 3000).';
  }
  const d = err.response.data;
  const msg =
    d?.message ?? d?.Message ??
    d?.error   ?? d?.Error   ??
    d?.msg     ?? d?.detail  ??
    null;
  if (typeof msg === 'string' && msg.trim()) return msg.trim();
  if (typeof d   === 'string' && d.trim())   return d.trim();
  return `Sunucu hatası — HTTP ${err.response.status}`;
}

/* ──────────────────────────────────────────
   Register payload — maps to SQL column names:
     StudentMail  ← email
     StudentKey   ← password
     UserName     ← first name  (from full name)
     UserSurname  ← last name
     Interests    ← interest areas array
   Also sends camelCase aliases so any REST
   wrapper the backend may add still works.
────────────────────────────────────────── */
function buildRegisterBody(p) {
  const nameParts = (p.name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName  = nameParts.slice(1).join(' ') || nameParts[0] || '';

  return {
    /* ── SQL column names (primary) ── */
    StudentMail:  p.email,
    StudentKey:   p.password,
    UserName:     firstName,          // SQL column: UserName
    UserSurname:  lastName,           // SQL column: UserSurname
    Interests:    p.interests,        // SQL table: Interests.InterestName
    GoodAt:       p.goodAt,
    WantToLearn:  p.wantToLearn,
    Learnership:  p.learnership,

    /* ── camelCase aliases (fallback) ── */
    name:         p.name,
    email:        p.email,
    password:     p.password,
    interests:    p.interests,
    goodAt:       p.goodAt,
    wantToLearn:  p.wantToLearn,
    learnership:  p.learnership,
  };
}

/* ──────────────────────────────────────────
   Try each path in order; skip 404s.
────────────────────────────────────────── */
async function tryPaths(paths, method, body) {
  let lastErr;
  for (const path of paths) {
    try {
      const { data } = await api[method](path, body);
      if (process.env.NODE_ENV === 'development') {
        console.info(`[auth] ✓ ${method.toUpperCase()} ${path}`, data);
      }
      return data;
    } catch (err) {
      lastErr = err;
      if (!err.response)               throw err; // network error — stop
      if (err.response.status !== 404) throw err; // real server error — stop
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[auth] 404 ${path} → next`);
      }
    }
  }
  throw lastErr;
}

/* ── Public API ── */

export const registerUser = (payload) =>
  tryPaths(REGISTER_PATHS, 'post', buildRegisterBody(payload));

export const verifyOTP = (email, otp) =>
  tryPaths(VERIFY_PATHS, 'post', {
    /* both naming conventions */
    email,     UserEmail: email,
    otp,       OTP: otp,  Code: otp,  code: otp,
  });

export const resendOTP = (email) =>
  tryPaths(RESEND_PATHS, 'post', { email, UserEmail: email });

export const loginUser = (email, password) =>
  tryPaths(LOGIN_PATHS, 'post', {
    email,    UserEmail:    email,
    password, UserPassword: password,
    StudentMail: email,
    StudentKey:  password,
  });
