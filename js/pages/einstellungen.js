

function renderEinstellungen(){
  const e=currentAccount();
  return`\n    <div class="section-header"><div><h2>Einstellungen</h2><div class="sub">Konto verwalten</div></div></div>\n    <div class="row-2">\n      <div class="card">\n        <h3 style="font-size:15px; font-weight:700; margin-bottom:16px;">Profil</h3>\n        <div class="form-group"><label>Anzeigename</label><input id="settingsName" class="form-input" value="${esc(e.displayName)}"></div>\n        <div class="form-group"><label>E-Mail</label><input class="form-input" value="${esc(e.email)}" disabled></div>\n        <button class="btn btn-primary" onclick="saveProfileName()">Speichern</button>\n      </div>\n      <div class="card">\n        <h3 style="font-size:15px; font-weight:700; margin-bottom:16px;">Passwort ändern</h3>\n        <div class="form-error" id="pwError"></div>\n        <div class="form-group"><label>Aktuelles Passwort</label><input id="pwCurrent" type="password" class="form-input"></div>\n        <div class="form-group"><label>Neues Passwort</label><input id="pwNew" type="password" class="form-input"></div>\n        <button class="btn btn-primary" onclick="changePassword()">Passwort ändern</button>\n        <div style="margin-top:22px; padding-top:18px; border-top:1px solid var(--border);">\n          <button class="btn btn-outline btn-block" onclick="logout()">Abmelden</button>\n        </div>\n      </div>\n    </div>`
}

async function saveProfileName(){
  const e=document.getElementById("settingsName").value.trim();
  e&&(currentAccount().displayName=e,await persist("accounts"),updateTopbarUser(),renderSidebar(),renderPage())
}

async function changePassword(){
  const e=document.getElementById("pwCurrent").value,t=document.getElementById("pwNew").value,n=currentAccount(),a=document.getElementById("pwError");
  return n.password!==e?(a.textContent="Aktuelles Passwort ist falsch.",void a.classList.add("show")):!t||t.length<4?(a.textContent="Neues Passwort muss mindestens 4 Zeichen haben.",void a.classList.add("show")):(a.classList.remove("show"),n.password=t,await persist("accounts"),alert("Passwort wurde geändert."),document.getElementById("pwCurrent").value="",void(document.getElementById("pwNew").value=""))
}
