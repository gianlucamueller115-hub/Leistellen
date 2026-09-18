

const DB_KEYS = [
  'accounts', 'characters', 'duty_log', 'akten', 'waffenschein', 'fuehrerschein',
  'medical_reports', 'feuerwehr_reports', 'strafenkatalog', 'news', 'police_board',
  'activity_log', 'fahndungen'
];

function emptyUnit(nummer) {
  return { nr: 'T-' + nummer, besatzung: '', funkname: '', funknummer: '', status: '', gebiet: '', fahrzeugtyp: '' };
}

const DEFAULTS = {
  accounts: {},
  characters: [],
  duty_log: [],
  akten: [],
  waffenschein: [],
  fuehrerschein: [],
  medical_reports: [],
  feuerwehr_reports: [],
  strafenkatalog: [],
  news: [],
  police_board: {
    leadership: [
      { rolle: 'Verhandlungsführer', besetztVon: '' },
      { rolle: 'Verhandlungsführer 2', besetztVon: '' },
      { rolle: 'Einsatzleiter Taktik', besetztVon: '' },
      { rolle: 'Einsatzleiter Verfolgungsjagd', besetztVon: '' }
    ],
    unitCounts: { highspeed: 0, traffic: 0, highrank: 0, strassen: 0, offroad: 0, adam: 0 },
    gerichtsstatus: 'Nicht Verhandlungsfähig',
    patrolUnits: Array.from({ length: 18 }, (unused, i) => emptyUnit(i + 1)),
    ciuUnits: Array.from({ length: 10 }, (unused, i) => emptyUnit(i + 1))
  },
  activity_log: [],
  fahndungen: []
};

let DB = {};
let currentPage = 'dashboard';
let leitstelleTab = 'uebersicht';
let syncInProgress = false;
let stopRealtimeSync = null;

function defaultsFor(key) {
  return JSON.parse(JSON.stringify(DEFAULTS[key]));
}

async function loadKey(key) {
  try {
    const entry = await Store.get(key, true);
    if (entry) return JSON.parse(entry.value);
  } catch (err) {
    console.warn('[EinsatzPORTAL] Konnte "' + key + '" nicht laden:', err.message);
  }
  const fresh = defaultsFor(key);
  try { await Store.set(key, JSON.stringify(fresh), true); } catch (err) {  }
  return fresh;
}

async function persist(key) {
  try {
    await Store.set(key, JSON.stringify(DB[key]), true);
  } catch (err) {
    console.error('[EinsatzPORTAL] Speichern fehlgeschlagen (' + key + '):', err.message);
    console.warn('[EinsatzPORTAL] Der Bereich wird beim nächsten Sync erneut gespeichert (' + key + ').');
  }
}

async function refreshSharedData() {
  if (syncInProgress || !AppwriteDB.isConfigured()) return;
  syncInProgress = true;
  try {
    for (const key of DB_KEYS) {
      if (Store.hasPendingWrite(key)) continue;
      const entry = await Store.get(key, true);
      if (!entry) continue;
      try { DB[key] = JSON.parse(entry.value); } catch (err) {  }
    }
    if (typeof renderPage === 'function' && session) renderPage();
  } finally {
    syncInProgress = false;
  }
}

async function refreshSharedKey(key) {
  if (syncInProgress || Store.hasPendingWrite(key) || !AppwriteDB.isConfigured()) return;
  try {
    const entry = await Store.get(key, true);
    DB[key] = entry ? JSON.parse(entry.value) : defaultsFor(key);
    if (typeof renderPage === 'function' && session) renderPage();
  } catch (err) {
    console.warn('[EinsatzPORTAL] Realtime-Sync fehlgeschlagen (' + key + '):', err.message);
  }
}

function setupRealtimeSync(client) {
  if (!client || !AppwriteDB.isConfigured()) return;
  const channel = 'databases.' + AppwriteDB.databaseId +
    '.collections.' + AppwriteDB.collectionId + '.documents';
  try {
    stopRealtimeSync = client.subscribe(channel, event => {
      const key = event.payload && event.payload.$id;
      if (key && DB_KEYS.includes(key)) refreshSharedKey(key);
    });
    console.info('[EinsatzPORTAL] Appwrite Realtime verbunden.');
  } catch (err) {
    console.warn('[EinsatzPORTAL] Realtime nicht verfügbar, Fallback-Sync aktiv:', err.message);
  }
}

function logActivity(text) {
  DB.activity_log.unshift({ text, time: new Date().toISOString() });
  DB.activity_log = DB.activity_log.slice(0, 40);
  persist('activity_log');
}

async function ensureAdminAccount() {
  const email = envValue('ADMIN_EMAIL');
  const password = envValue('ADMIN_PASSWORD');
  if (!email || !password) return;

  const id = normEmail(email);
  const existing = DB.accounts[id] || Object.values(DB.accounts).find(account => normEmail(account.email) === id);
  if (existing) {
    if (!existing.isAdmin) {
      existing.isAdmin = true;
      await persist('accounts');
    }
    return;
  }
  DB.accounts[id] = {
    email,
    password,
    isAdmin: true,
    chiefOf: null,
    locked: false,
    displayName: envValue('ADMIN_NAME') || 'Administrator'
  };
  await persist('accounts');
}
