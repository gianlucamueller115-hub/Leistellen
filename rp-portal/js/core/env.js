

const ENV = {};

function parseEnvFile(text) {
  text.split(/\r?\n/).forEach(line => {
    const raw = line.trim();
    if (!raw || raw.startsWith('#')) return;
    const eq = raw.indexOf('=');
    if (eq < 1) return;
    const key = raw.slice(0, eq).trim();
    let value = raw.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    ENV[key] = value;
  });
}


const ENV_FILES = ['.env', 'config.env'];

async function loadEnv() {
  let lastError = 'nicht gefunden';
  for (const file of ENV_FILES) {
    try {
      const res = await fetch(file + '?v=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      if (text.trim().startsWith('<')) throw new Error('Keine Konfiguration erhalten');
      parseEnvFile(text);
      return ENV;
    } catch (err) {
      lastError = err.message;
    }
  }
  console.warn(
    '[EinsatzPORTAL] Konfiguration konnte nicht geladen werden (' + lastError + '). ' +
    'Das Portal laeuft solange nur mit lokalem Speicher. ' +
    'Starte das Projekt ueber einen Webserver, z. B. "python3 -m http.server".'
  );
  return ENV;
}

function envValue(key) {
  const value = ENV[key];
  return typeof value === 'string' ? value.trim() : '';
}
