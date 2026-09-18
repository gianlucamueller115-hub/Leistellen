

function renderFahndung(){
  const e=canWrite("Polizei"),t=DB.fahndungen.filter(e=>"Aktiv"===e.status),n=DB.fahndungen.filter(e=>"Aktiv"!==e.status);
  return`\n    <div class="section-header"><div><h2>Fahndung</h2><div class="sub">Personen- &amp; Fahrzeugfahndungen – nur Polizei kann Einträge anlegen</div></div>\n      <button class="btn btn-primary" onclick="openFahndungForm()" ${e?"":"disabled"}>+ Fahndung ausschreiben</button>\n    </div>\n    <div class="card" style="margin-bottom:24px;">\n      <h3 style="font-size:15px; font-weight:700; margin-bottom:14px;">Aktive Fahndungen (${t.length})</h3>\n      ${t.length?`<div class="table-scroll"><table><thead><tr><th>Typ</th><th>Bezeichnung</th><th>Grund</th><th>Stufe</th><th>Von</th>${canWrite("Polizei")?"<th></th>":""}</tr></thead><tbody>\n        ${t.map(e=>`<tr><td><span class="badge blue">${esc(e.typ)}</span></td><td>${esc(e.bezeichnung)}</td><td>${esc(e.grund)}</td><td><span class="badge ${"Bewaffnet & Gefährlich"===e.stufe?"red":"Bewaffnet"===e.stufe?"orange":"gray"}">${esc(e.stufe)}</span></td><td>${esc(e.erstelltVon)}</td>${canWrite("Polizei")?`<td class="row-actions"><button class="btn btn-ghost btn-sm" onclick="closeFahndung('${e.id}')">Erledigt</button>${canDelete("Polizei")?`<button class="btn btn-ghost btn-sm" onclick="deleteFahndung('${e.id}')">Löschen</button>`:""}</td>`:""}</tr>`).join("")}\n      </tbody></table></div>`:'<div class="empty-state">Keine aktiven Fahndungen.</div>'}\n    </div>\n    ${n.length?`<div class="card">\n      <h3 style="font-size:15px; font-weight:700; margin-bottom:14px;">Erledigt</h3>\n      <div class="table-scroll"><table><thead><tr><th>Typ</th><th>Bezeichnung</th><th>Grund</th><th>Von</th>${canDelete("Polizei")?"<th></th>":""}</tr></thead><tbody>\n        ${n.map(e=>`<tr><td><span class="badge gray">${esc(e.typ)}</span></td><td>${esc(e.bezeichnung)}</td><td>${esc(e.grund)}</td><td>${esc(e.erstelltVon)}</td>${canDelete("Polizei")?`<td><button class="btn btn-ghost btn-sm" onclick="deleteFahndung('${e.id}')">Löschen</button></td>`:""}</tr>`).join("")}\n      </tbody></table></div>`:""}`
}

function openFahndungForm(){
  canWrite("Polizei")?openFormModal("Fahndung ausschreiben",[{key:"typ",label:"Typ",type:"select",options:["Person","Fahrzeug"]},{key:"bezeichnung",label:"Name / Kennzeichen",required:!0},{key:"grund",label:"Grund",required:!0},{key:"stufe",label:"Stufe",type:"select",options:["Unbewaffnet","Bewaffnet","Bewaffnet & Gefährlich"]}],async e=>{DB.fahndungen.unshift({id:genId(),typ:e.typ,bezeichnung:e.bezeichnung,grund:e.grund,stufe:e.stufe,status:"Aktiv",erstelltVon:currentAccount().displayName,datum:(new Date).toISOString()}),await persist("fahndungen"),logActivity(`Fahndung nach ${e.bezeichnung} ausgeschrieben.`),renderPage()},"Ausschreiben"):alert("Nur Polizei-Charaktere können Fahndungen ausschreiben.")
}

async function closeFahndung(e){
  if(!canWrite("Polizei"))return;
  const t=DB.fahndungen.find(t=>t.id===e);
  t&&(t.status="Erledigt",await persist("fahndungen"),renderPage())
}

async function deleteFahndung(e){
  canDelete("Polizei")&&confirm("Fahndung wirklich löschen?")&&(DB.fahndungen=DB.fahndungen.filter(t=>t.id!==e),await persist("fahndungen"),renderPage())
}
