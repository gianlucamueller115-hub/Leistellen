

function renderMedical(){
  const e=void 0;
  return`\n    <div class="section-header"><div><h2>Medical Service</h2><div class="sub">Behandlungsberichte – nur Medical Service kann Berichte erstellen</div></div>\n      <button class="btn btn-primary" onclick="openMedicalForm()" ${canWrite("Medical Service")?"":"disabled"}>+ Neuer Bericht</button>\n    </div>\n    <div class="card">\n      ${DB.medical_reports.length?`<div class="table-scroll"><table><thead><tr><th>Patient</th><th>Diagnose</th><th>Behandlung</th><th>Von</th><th>Datum</th>${canDelete("Medical Service")?"<th></th>":""}</tr></thead><tbody>\n        ${DB.medical_reports.map(e=>`<tr><td>${esc(e.patient)}</td><td>${esc(e.diagnose)}</td><td>${esc(e.behandlung)}</td><td>${esc(e.author)}</td><td>${fmtDateShort(e.datum)}</td>${canDelete("Medical Service")?`<td><button class="btn btn-ghost btn-sm" onclick="deleteMedical('${e.id}')">Löschen</button></td>`:""}</tr>`).join("")}\n      </tbody></table></div>`:'<div class="empty-state">Noch keine Berichte vorhanden.</div>'}\n    </div>`
}

function openMedicalForm(){
  canWrite("Medical Service")?openFormModal("Neuer Medical-Bericht",[{key:"patient",label:"Patient",required:!0},{key:"diagnose",label:"Diagnose",required:!0},{key:"behandlung",label:"Behandlung",type:"textarea"}],async e=>{DB.medical_reports.unshift({id:genId(),patient:e.patient,diagnose:e.diagnose,behandlung:e.behandlung,author:currentAccount().displayName,datum:(new Date).toISOString()}),await persist("medical_reports"),logActivity(`Medical-Bericht für ${e.patient} erstellt.`),renderPage()},"Speichern"):alert("Nur Medical-Service-Charaktere können Berichte erstellen.")
}

async function deleteMedical(e){
  canDelete("Medical Service")&&confirm("Bericht wirklich löschen?")&&(DB.medical_reports=DB.medical_reports.filter(t=>t.id!==e),await persist("medical_reports"),renderPage())
}
