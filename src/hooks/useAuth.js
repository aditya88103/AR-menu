// Simple auth — no Firebase, no backend
// Session stored in localStorage

const SESSION_KEY = 'biggies_admin_session';

export function isLoggedIn() {
  return localStorage.getItem(SESSION_KEY) === 'true';
}

export function login() {
  localStorage.setItem(SESSION_KEY, 'true');
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
