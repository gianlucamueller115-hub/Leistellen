

function renderStrafenkatalog(){
  return`\n    <div class="section-header"><div><h2>Strafenkatalog</h2><div class="sub">Bußgelder &amp; Punkte für LEO-Fraktionen</div></div>\n      ${isAdmin()?'<button class="btn btn-primary" onclick="openStrafenForm()">+ Eintrag hinzufügen</button>':""}\n    </div>\n    <div class="card">\n      ${DB.strafenkatalog.length?`<div class="table-scroll"><table><thead><tr><th>Vergehen</th><th>Strafe</th><th>Punkte</th>${isAdmin()?"<th></th>":""}</tr></thead><tbody>\n        ${DB.strafenkatalog.map(e=>`<tr><td>${esc(e.vergehen)}</td><td class="amount">${esc(e.strafe)} $</td><td class="points">${esc(e.punkte)}</td>${isAdmin()?`<td class="row-actions"><button class="btn btn-ghost btn-sm" onclick="openStrafenForm('${e.id}')">Bearbeiten</button><button class="btn btn-ghost btn-sm" onclick="deleteStrafenEintrag('${e.id}')">Löschen</button></td>`:""}</tr>`).join("")}\n      </tbody></table></div>`:'<div class="empty-state">Noch keine Einträge im Strafenkatalog.</div>'}\n    </div>`
}

function openStrafenForm(e){
  const t=e?DB.strafenkatalog.find(t=>t.id===e):null;
  openFormModal(t?"Eintrag bearbeiten":"Neuer Strafenkatalog-Eintrag",[{key:"vergehen",label:"Vergehen",required:!0,value:t?t.vergehen:""},{key:"strafe",label:"Strafe ($)",type:"number",required:!0,value:t?t.strafe:""},{key:"punkte",label:"Punkte",type:"number",required:!0,value:t?t.punkte:""}],async e=>{t?(t.vergehen=e.vergehen,t.strafe=Number(e.strafe),t.punkte=Number(e.punkte)):DB.strafenkatalog.push({id:genId(),vergehen:e.vergehen,strafe:Number(e.strafe),punkte:Number(e.punkte)}),await persist("strafenkatalog"),renderPage()},"Speichern")
}

async function deleteStrafenEintrag(e){
  confirm("Eintrag wirklich löschen?")&&(DB.strafenkatalog=DB.strafenkatalog.filter(t=>t.id!==e),await persist("strafenkatalog"),renderPage())
}
