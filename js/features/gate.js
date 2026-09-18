

let gateForceCreate=!1;

function showGate(){
  gateForceCreate=!1,document.getElementById("authScreen").style.display="none",document.getElementById("app").style.display="none",document.getElementById("gateScreen").style.display="flex",renderGateScreen()
}

function showGateCreateForm(){
  gateForceCreate=!0,renderGateScreen()
}

function backToGateSelect(){
  gateForceCreate=!1,renderGateScreen()
}

function renderGateScreen(){
  delete pendingProfilbild.gate;
  const e=myCharacters(),t=0===e.length||gateForceCreate?gateCreateHTML(e.length>0):gateSelectHTML(e);
  document.getElementById("gateScreen").innerHTML=t
}

function gateCreateHTML(e){
  return`\n    <div class="auth-card" style="max-width:460px;">\n      <div class="auth-logo"><img src="assets/logo.webp" class="brand-logo brand-logo-lg" alt="STATELIFE Leitstellen"></div>\n      <h3 style="text-align:center; font-size:16px; font-weight:800; margin-bottom:4px;">Charakter erstellen</h3>\n      <p style="text-align:center; font-size:12.5px; color:var(--muted); margin-bottom:18px;">Bevor es losgeht, erstelle deinen RP-Charakter.</p>\n      <div class="form-error" id="gateError"></div>\n      ${characterFormFieldsHTML("gate")}\n      <button class="btn btn-primary btn-block" onclick="submitGateCreate()">Charakter erstellen &amp; loslegen</button>\n      ${e?'<button class="btn btn-outline btn-block" style="margin-top:10px;" onclick="backToGateSelect()">Zurück zur Auswahl</button>':""}\n    </div>`
}

function gateSelectHTML(e){
  return`\n    <div class="auth-card" style="max-width:460px;">\n      <div class="auth-logo"><img src="assets/logo.webp" class="brand-logo brand-logo-lg" alt="STATELIFE Leitstellen"></div>\n      <h3 style="text-align:center; font-size:16px; font-weight:800; margin-bottom:4px;">Charakter auswählen</h3>\n      <p style="text-align:center; font-size:12.5px; color:var(--muted); margin-bottom:18px;">Wähle, als wer du spielen möchtest.</p>\n      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">\n        ${e.map(e=>`\n          <button class="acc-row" style="border:1px solid var(--border); border-radius:12px; gap:12px;" onclick="selectGateCharacter('${e.id}')">\n            ${avatarHTML(e,"avatar-sm")}\n            <span style="flex:1; text-align:left;">\n              <div style="font-weight:700; color:var(--text);">${esc(charName(e))}</div>\n              <div style="font-size:11.5px; color:var(--muted);">${esc(e.fraktion)}</div>\n            </span>\n          </button>`).join("")}\n      </div>\n      <button class="btn btn-outline btn-block" onclick="showGateCreateForm()">+ Neuen Charakter erstellen</button>\n    </div>`
}

async function submitGateCreate(){
  const e=document.getElementById("gateError"),t=collectCharacterForm("gate");
  if(!t.vorname||!t.nachname||!t.fraktion)return e.textContent="Bitte mindestens Vorname, Nachname und Beruf ausfüllen.",void e.classList.add("show");
  if(characterNameTaken(t.vorname,t.nachname))return e.textContent="Diesen Namen gibt es bereits. Bitte wähle einen anderen Vor- oder Nachnamen.",void e.classList.add("show");
  e.classList.remove("show"),DB.characters.forEach(e=>{e.ownerEmail===session.email&&(e.active=!1)}),DB.characters.push({id:genId(),ownerEmail:session.email,vorname:t.vorname,nachname:t.nachname,geburtsdatum:t.geburtsdatum,alter:t.alter,wohnort:t.wohnort,fraktion:t.fraktion,profilbild:t.profilbild,level:1,spielzeit:0,geld:0,onDuty:!1,active:!0}),await persist("characters"),logActivity(`${currentAccount().displayName} spielt jetzt als ${t.vorname} ${t.nachname} (${t.fraktion}).`),gateForceCreate=!1,enterApp()
}

async function selectGateCharacter(e){
  DB.characters.forEach(t=>{t.ownerEmail===session.email&&(t.active=t.id===e)}),await persist("characters"),enterApp()
}
