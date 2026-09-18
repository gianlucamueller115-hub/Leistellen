

let session = null;

async function loadSession() {
  try {
    const value = sessionStorage.getItem('rp-portal:session');
    localStorage.removeItem('rp-portal:session');
    return value ? JSON.parse(value) : null;
  } catch (err) {
    return null;
  }
}

async function saveSession(value) {
  session = value;
  try {
    if (value) sessionStorage.setItem('rp-portal:session', JSON.stringify(value));
    else sessionStorage.removeItem('rp-portal:session');
    localStorage.removeItem('rp-portal:session');
  } catch (err) {
    console.warn('[EinsatzPORTAL] Sitzung konnte nicht gespeichert werden:', err.message);
  }
}

