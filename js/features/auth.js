

function showAuth() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('gateScreen').style.display = 'none';
  document.getElementById('authScreen').style.display = 'flex';
}

function showApp() {
  if (isAdmin() || activeCharacter()) enterApp();
  else showGate();
}

function enterApp() {
  document.getElementById('gateScreen').style.display = 'none';
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  currentPage = 'dashboard';
  renderSidebar();
  updateTopbarUser();
  renderPage();
}


function greetingName() {
  const character = activeCharacter();
  if (character) return charName(character);
  const account = currentAccount();
  return account ? (account.displayName || account.email) : 'Kollege';
}

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tabLoginBtn').classList.toggle('active', isLogin);
  document.getElementById('tabRegisterBtn').classList.toggle('active', !isLogin);
  document.getElementById('loginForm').style.display = isLogin ? 'block' : 'none';
  document.getElementById('registerForm').style.display = isLogin ? 'none' : 'block';
  document.getElementById('authTitle').textContent = isLogin ? 'Willkommen zurück' : 'Konto erstellen';
  document.getElementById('authSubtitle').textContent = isLogin
    ? 'Melde dich an, um deinen Dienst anzutreten.'
    : 'Registriere dich und lege direkt los.';
  document.getElementById('loginError').classList.remove('show');
  document.getElementById('regError').classList.remove('show');
}

function showAuthError(id, message) {
  const box = document.getElementById(id);
  box.textContent = message;
  box.classList.add('show');
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const visible = input.type === 'text';
  input.type = visible ? 'password' : 'text';
  button.classList.toggle('is-visible', !visible);
  input.focus();
}


function showWelcome(name, afterwards) {
  const screen = document.getElementById('welcomeScreen');
  document.getElementById('welcomeName').textContent = name;
  screen.classList.add('show');
  window.setTimeout(() => {
    screen.classList.remove('show');
    if (afterwards) afterwards();
  }, 1900);
}

function clearAuthFields() {
  ['loginEmail', 'loginPassword', 'regName', 'regEmail', 'regPassword'].forEach(id => {
    const field = document.getElementById(id);
    if (field) field.value = '';
  });
}

async function handleLogin() {
  const email = normEmail(document.getElementById('loginEmail').value);
  const password = document.getElementById('loginPassword').value;
  const adminEmail = normEmail(envValue('ADMIN_EMAIL'));
  const adminPassword = envValue('ADMIN_PASSWORD');
  const isConfiguredAdmin = email === adminEmail && password === adminPassword && adminEmail && adminPassword;
  let account = DB.accounts[email] || Object.values(DB.accounts).find(item => normEmail(item.email) === email);

  if (!email || !password) return showAuthError('loginError', 'Bitte E-Mail und Passwort eingeben.');
  if (account && !DB.accounts[email]) DB.accounts[email] = account;
  if (isConfiguredAdmin && !account) {
    account = {
      email: adminEmail,
      password: adminPassword,
      isAdmin: true,
      chiefOf: null,
      locked: false,
      displayName: envValue('ADMIN_NAME') || 'Administrator'
    };
    DB.accounts[adminEmail] = account;
    await persist('accounts');
  }
  if (isConfiguredAdmin && account) {
    account.email = adminEmail;
    account.password = adminPassword;
    account.isAdmin = true;
    account.locked = false;
    account.displayName = envValue('ADMIN_NAME') || account.displayName || 'Administrator';
    await persist('accounts');
  }
  if (!account || (!isConfiguredAdmin && account.password !== password)) return showAuthError('loginError', 'E-Mail oder Passwort ist falsch.');
  if (account.locked) return showAuthError('loginError', 'Dieses Konto wurde gesperrt. Wende dich an einen Admin.');

  document.getElementById('loginError').classList.remove('show');
  await saveSession({ email });
  clearAuthFields();
  showWelcome(account.displayName || account.email, showApp);
}

async function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = normEmail(document.getElementById('regEmail').value);
  const password = document.getElementById('regPassword').value;

  if (!name || !email || !password) return showAuthError('regError', 'Bitte alle Felder ausfüllen.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAuthError('regError', 'Bitte eine gültige E-Mail-Adresse angeben.');
  if (password.length < 6) return showAuthError('regError', 'Das Passwort muss mindestens 6 Zeichen haben.');
  if (DB.accounts[email]) return showAuthError('regError', 'Für diese E-Mail existiert bereits ein Konto.');

  document.getElementById('regError').classList.remove('show');
  DB.accounts[email] = { email, password, isAdmin: false, chiefOf: null, locked: false, displayName: name };
  await persist('accounts');
  await saveSession({ email });
  clearAuthFields();
  showWelcome(name, showApp);
}

async function logout() {
  await saveSession(null);
  session = null;
  clearAuthFields();
  switchAuthTab('login');
  showAuth();
}
