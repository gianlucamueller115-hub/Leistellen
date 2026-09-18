

import { client } from './core/appwrite-client.js';


function showConfigWarning(text) {
  const bar = document.createElement('div');
  bar.style.cssText =
    'position:fixed; top:0; left:0; right:0; z-index:400; padding:11px 44px 11px 16px;' +
    'background:#b91c1c; color:#fff; font-size:13px; font-weight:600; line-height:1.4;' +
    "font-family:'Inter',system-ui,sans-serif; box-shadow:0 4px 18px rgba(0,0,0,.25);";
  bar.textContent = text;

  const close = document.createElement('button');
  close.textContent = '×';
  close.setAttribute('aria-label', 'Hinweis schließen');
  close.style.cssText =
    'position:absolute; top:6px; right:10px; color:#fff; font-size:20px; line-height:1;' +
    'background:none; border:none; cursor:pointer;';
  close.onclick = () => bar.remove();

  bar.appendChild(close);
  document.body.appendChild(bar);
}

async function boot() {
  await loadEnv();
  AppwriteDB.init();

  try {
    await client.ping();
    console.info('[EinsatzPORTAL] Appwrite SDK verbunden.');
  } catch (err) {
    console.warn('[EinsatzPORTAL] Appwrite SDK-Ping fehlgeschlagen:', err.message);
  }

  if (AppwriteDB.isConfigured()) {
    const status = await AppwriteDB.check();
    if (!status.ok) {
      AppwriteDB.ready = false;
      showConfigWarning('Appwrite antwortet nicht richtig – gespeichert wird nur lokal. ' + status.message);
      console.error('[EinsatzPORTAL] Appwrite-Prüfung fehlgeschlagen:', status.message);
    } else {
      console.info('[EinsatzPORTAL] Appwrite verbunden.');
    }
  }

  await loadTheme();

  for (const key of DB_KEYS) {
    DB[key] = await loadKey(key);
  }
  setupRealtimeSync(window.AppwriteClient);
  window.setInterval(refreshSharedData, 60000);
  await ensureAdminAccount();

  session = await loadSession();
  document.getElementById('loadingScreen').style.display = 'none';

  const account = session ? DB.accounts[session.email] : null;
  if (account && !account.locked) {
    showApp();
  } else {
    session = null;
    showAuth();
  }
}

boot();
