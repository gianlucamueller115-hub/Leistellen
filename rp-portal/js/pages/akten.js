

function renderAkten(){
  const e=(window.__aktenQuery||"").toLowerCase(),t=DB.akten.filter(t=>!e||t.name.toLowerCase().includes(e)||(t.wohnort||"").toLowerCase().includes(e));
  return`\n    <div class="section-header"><div><h2>Akten System</h2><div class="sub">Personenakten</div></div>\n      <button class="btn btn-primary" onclick="openAkteForm()" ${canWrite("Polizei")?"":'disabled title=" Polizei-Charaktere können Akten anlegen"'}>\n        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>\n        Neue Akte\n      </button>\n    </div>\n    <div class="card">\n      <div class="akten-toolbar">\n        <div class="akten-search">\n          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>\n          <input type="text" placeholder="Akte nach Name oder Wohnort durchsuchen …" value="${esc(window.__aktenQuery||"")}" oninput="filterAkten(this.value)">\n        </div>\n        <div class="akten-count">${t.length} von ${DB.akten.length} Akten</div>\n      </div>\n      ${t.length?`<div class="akten-grid">\n        ${t.map(e=>`\n          <div class="akte-card" onclick="openAkteDetail('${e.id}')">\n            <div class="akte-card-top">\n              <div class="avatar-sm" style="background:linear-gradient(135deg,var(--blue),var(--violet));">${esc(initials(e.name))}</div>\n              <div class="akte-card-name">\n                <div class="n">${esc(e.name)}</div>\n                <div class="m">${e.wohnort?esc(e.wohnort):"Wohnort unbekannt"}${e.geburtsdatum?" · "+fmtDateShort(e.geburtsdatum):""}</div>\n              </div>\n              <span class="status-pill ${"Geschlossen"===e.status?"off":"on"}">${esc(e.status||"Offen")}</span>\n            </div>\n            <div class="akte-card-tags">\n              <span class="badge ${akteTypBadge(e.typ)}">${esc(e.typ||"Sonstige Person")}</span>\n              <span class="badge gray">${e.vermerke.length} Vermerk${1===e.vermerke.length?"":"e"}</span>\n            </div>\n            ${e.info?`<p class="akte-card-info">${esc(e.info)}</p>`:""}\n          </div>`).join("")}\n      </div>`:`<div class="empty-state">${DB.akten.length?"Keine Akten gefunden.":"Noch keine Akten angelegt."}</div>`}\n    </div>`
}

function filterAkten(e){
  window.__aktenQuery=e;
  const t=document.getElementById("pageRoot");
  t&&(t.innerHTML=renderAkten()),setTimeout(()=>{const e=document.querySelector(".akten-search input");e&&(e.focus(),e.selectionStart=e.selectionEnd=e.value.length)},0)
}

function akteTypBadge(e){
  return"Straftäter"===e?"red":"Verdächtiger"===e?"orange":"Opfer"===e?"violet":"Zeuge"===e?"blue":"gray"
}

function openAkteForm(){
  canWrite("Polizei")?openFormModal("Neue Akte anlegen",[{key:"name",label:"Name der Person",required:!0,placeholder:"Vorname Nachname"},{key:"geburtsdatum",label:"Geburtsdatum",type:"date"},{key:"wohnort",label:"Wohnort",placeholder:"Liberty City"},{key:"typ",label:"Typ",type:"select",options:["Sonstige Person","Zeuge","Verdächtiger","Straftäter","Opfer"]},{key:"info",label:"Beschreibung / Anmerkung",type:"textarea",placeholder:"Auffälligkeiten, Merkmale, erste Angaben …"}],async e=>{DB.akten.unshift({id:genId(),name:e.name,geburtsdatum:e.geburtsdatum,wohnort:e.wohnort,typ:e.typ,status:"Offen",info:e.info,vermerke:[],createdBy:currentAccount().displayName}),await persist("akten"),logActivity(`Neue Akte "${e.name}" angelegt.`),renderPage()},"Anlegen"):alert("")
}

function openAkteDetail(e){
  const t=DB.akten.find(t=>t.id===e);
  if(!t)return;
  const n=canWrite("Polizei");
  showModal(`\n    <div class="modal-head">\n      <div style="display:flex; align-items:center; gap:12px; min-width:0;">\n        <div class="avatar-sm" style="background:linear-gradient(135deg,var(--blue),var(--violet)); flex-shrink:0;">${esc(initials(t.name))}</div>\n        <div style="min-width:0;">\n          <h3 style="overflow-wrap:anywhere;">${esc(t.name)}</h3>\n          <div style="font-size:11.5px; color:var(--muted);">${t.wohnort?esc(t.wohnort):"Wohnort unbekannt"}${t.geburtsdatum?" · "+fmtDateShort(t.geburtsdatum):""}</div>\n        </div>\n      </div>\n      <button class="modal-close" onclick="closeModal()">✕</button>\n    </div>\n    <div class="akte-meta-row">\n      <span class="badge ${akteTypBadge(t.typ)}">${esc(t.typ||"Sonstige Person")}</span>\n      <span class="status-pill ${"Geschlossen"===t.status?"off":"on"}">${esc(t.status||"Offen")}</span>\n      ${n?`<button class="btn btn-ghost btn-sm" style="margin-left:auto;" onclick="toggleAkteStatus('${e}')">${"Geschlossen"===t.status?"Wieder öffnen":"Fall schließen"}</button>`:""}\n    </div>\n    ${t.info?`<div class="akte-meta">${esc(t.info)}</div>`:""}\n    <div class="vermerke-list">\n      ${t.vermerke.length?t.vermerke.map(e=>`<div class="vermerk"><div class="vermerk-head"><span class="vk-dot" style="background:${vermerkColor(e.kategorie)}"></span><b>${esc(e.kategorie||"Vermerk")}</b><span class="vk-author">${esc(e.author)}</span><span>${fmtDate(e.date)}</span></div><p>${esc(e.text)}</p></div>`).join(""):'<div class="empty-state small">Noch keine Vermerke.</div>'}\n    </div>\n    ${n?`\n      <div class="form-group"><label>Kategorie</label>\n        <select id="newVermerkKategorie" class="form-input">\n          <option>Vernehmung</option><option>Festnahme</option><option>Observation</option><option>Anzeige</option><option>Sonstiges</option>\n        </select>\n      </div>\n      <div class="form-group"><label>Neuer Vermerk</label><textarea id="newVermerkText" class="form-input" rows="3" placeholder="Vermerk eintragen ..."></textarea></div>\n      <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Schließen</button>${canDelete("Polizei")?`<button class="btn btn-danger" onclick="deleteAkte('${e}')">Akte löschen</button>`:""}<button class="btn btn-primary" onclick="addVermerk('${e}')">Vermerk speichern</button></div>`:`<div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Schließen</button>${canDelete("Polizei")?`<button class="btn btn-danger" onclick="deleteAkte('${e}')">Akte löschen</button>`:""}</div>`}\n  `)
}

function vermerkColor(e){
  return{Festnahme:"var(--red)",Vernehmung:"var(--blue)",Observation:"var(--violet)",Anzeige:"var(--orange)"}[e]||"var(--gray)"
}

async function toggleAkteStatus(e){
  const t=DB.akten.find(t=>t.id===e);
  t&&(t.status="Geschlossen"===t.status?"Offen":"Geschlossen",await persist("akten"),openAkteDetail(e))
}

async function addVermerk(e){
  const t=document.getElementById("newVermerkKategorie").value,n=document.getElementById("newVermerkText").value.trim();
  if(!n)return;
  const a=DB.akten.find(t=>t.id===e);
  a.vermerke.unshift({text:n,kategorie:t,author:currentAccount().displayName,date:(new Date).toISOString()}),await persist("akten"),logActivity(`Neuer Vermerk (${t}) zu Akte "${a.name}".`),openAkteDetail(e)
}

async function deleteAkte(e){
  canDelete("Polizei")&&confirm("Akte wirklich löschen?")&&(DB.akten=DB.akten.filter(t=>t.id!==e),await persist("akten"),closeModal(),renderPage())
}
