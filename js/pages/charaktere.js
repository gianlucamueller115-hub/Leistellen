

function renderCharaktere(){
  const e=void 0;
  return`\n    <div class="section-header"><div><h2>Charakter Verwaltung</h2><div class="sub">Erstelle Charaktere und wähle deinen aktiven Charakter</div></div></div>\n    <div class="char-grid">\n      ${myCharacters().map(e=>`\n        <div class="char-card ${e.active?"is-active":""}">\n          <div class="cc-top">${avatarHTML(e,"avatar-lg","width:44px;height:44px;font-size:15px;")}<div><div class="cc-name">${esc(charName(e))}</div><span class="badge ${badgeClassFor(e.fraktion)}">${esc(e.fraktion)}</span></div></div>\n          <div style="font-size:12px; color:var(--muted); margin-bottom:12px; line-height:1.5;">\n            ${e.alter?`${esc(e.alter)} Jahre`:""}${e.wohnort?` · ${esc(e.wohnort)}`:""}\n          </div>\n          <div class="stat-grid">\n            <div class="stat-box"><div class="v">${e.level}</div><div class="l">Level</div></div>\n            <div class="stat-box"><div class="v">${e.spielzeit}h</div><div class="l">Spielzeit</div></div>\n            <div class="stat-box"><div class="v">${e.geld} $</div><div class="l">Geld</div></div>\n          </div>\n          <div class="cc-actions">\n            ${e.active?'<button class="btn btn-outline btn-sm" disabled>Aktiv</button>':`<button class="btn btn-primary btn-sm" onclick="setActiveCharacter('${e.id}')">Spielen</button>`}\n            <button class="btn btn-danger btn-sm" onclick="deleteCharacter('${e.id}')">Löschen</button>\n          </div>\n        </div>`).join("")}\n      <div class="add-char-tile" onclick="openCharacterForm()">\n        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>\n        Charakter erstellen\n      </div>\n    </div>`
}

function openCharacterForm(){
  delete pendingProfilbild.modal,showModal(`\n    <div class="modal-head"><h3>Charakter erstellen</h3><button class="modal-close" onclick="closeModal()">✕</button></div>\n    <div class="form-error" id="modalCharError"></div>\n    ${characterFormFieldsHTML("modal")}\n    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Abbrechen</button><button class="btn btn-primary" onclick="submitModalCreate()">Erstellen</button></div>\n  `)
}

async function submitModalCreate(){
  const e=document.getElementById("modalCharError"),t=collectCharacterForm("modal");
  if(!t.vorname||!t.nachname||!t.fraktion)return e.textContent="Bitte mindestens Vorname, Nachname und Beruf ausfüllen.",void e.classList.add("show");
  if(characterNameTaken(t.vorname,t.nachname))return e.textContent="Diesen Namen gibt es bereits. Bitte wähle einen anderen Vor- oder Nachnamen.",void e.classList.add("show");
  const n=0===myCharacters().length;
  DB.characters.push({id:genId(),ownerEmail:session.email,vorname:t.vorname,nachname:t.nachname,geburtsdatum:t.geburtsdatum,alter:t.alter,wohnort:t.wohnort,fraktion:t.fraktion,profilbild:t.profilbild,level:1,spielzeit:0,geld:0,onDuty:!1,active:n}),await persist("characters"),logActivity(`${currentAccount().displayName} hat den Charakter "${charName({vorname:t.vorname,nachname:t.nachname})}" erstellt.`),closeModal(),nav("charaktere")
}

async function setActiveCharacter(e){
  DB.characters.forEach(t=>{t.ownerEmail===session.email&&(t.active=t.id===e)}),await persist("characters"),nav("charaktere")
}

async function deleteCharacter(e){
  confirm("Charakter wirklich löschen?")&&(DB.characters=DB.characters.filter(t=>t.id!==e),await persist("characters"),nav("charaktere"))
}
