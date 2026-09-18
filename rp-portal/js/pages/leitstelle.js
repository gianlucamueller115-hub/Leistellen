

function setLeitstelleTab(e){
  leitstelleTab=e,renderPage()
}

function renderLeitstelle(){
  leitstelleTabVisible(leitstelleTab)||(leitstelleTab="uebersicht");
  const e=[{id:"uebersicht",label:"Übersicht"},{id:"polizei",label:"Polizei"},{id:"feuerwehr",label:"Feuerwehr"},{id:"medical",label:"Medical Service"},{id:"adac",label:"ADAC"}].filter(e=>leitstelleTabVisible(e.id));
  let t="";
  return"uebersicht"===leitstelleTab?t=renderDutyTable(DB.duty_log,isAdmin()||activeCharacter()&&"Bürger"!==activeCharacter().fraktion,null):"polizei"===leitstelleTab?t=renderPoliceBoard():"feuerwehr"===leitstelleTab?t=renderDutyTable(DB.duty_log.filter(e=>"Feuerwehr"===e.fraktion),isAdmin()||canWrite("Feuerwehr"),"Feuerwehr"):"medical"===leitstelleTab?t=renderDutyTable(DB.duty_log.filter(e=>"Medical Service"===e.fraktion),isAdmin()||canWrite("Medical Service"),"Medical Service"):"adac"===leitstelleTab&&(t=renderDutyTable(DB.duty_log.filter(e=>"ADAC"===e.fraktion),isAdmin()||canWrite("ADAC"),"ADAC")),`\n    <div class="section-header"><div><h2>Leitstelle</h2><div class="sub">Dienstplan &amp; Einsatzverwaltung aller Fraktionen</div></div></div>\n    <div class="tabs">${e.map(e=>`<div class="tab-btn ${leitstelleTab===e.id?"active":""}" onclick="setLeitstelleTab('${e.id}')">${esc(e.label)}</div>`).join("")}</div>\n    <div class="card">${t}</div>`
}

function renderDutyTable(e,t,n){
  return`\n   <div class="card-head">\n     <div class="card-title"><h3>${n?esc(n)+" Dienstplan":"Alle Diensteinträge"}</h3></div>\n     <button class="btn btn-primary" onclick="openDutyForm()" ${t?"":'disabled title="Du benötigst einen passenden Charakter"'}>+ Dienst eintragen</button>\n   </div>\n   ${e.length?`<div class="table-scroll"><table><thead><tr><th>Name</th><th>Fraktion</th><th>Beginn</th><th>Ende</th><th>Status</th><th></th></tr></thead><tbody>\n     ${e.map(e=>`<tr><td><div class="person"><span class="p-dot ${"Im Dienst"===e.status?"":"off"}"></span>${esc(e.name)}</div></td><td><span class="badge ${badgeClassFor(e.fraktion)}">${esc(e.fraktion)}</span></td><td>${esc(e.start)}</td><td>${esc(e.end)}</td><td><span class="status-pill ${"Im Dienst"===e.status?"on":"off"}">${esc(e.status)}</span></td><td>${canDelete(e.fraktion)?`<button class="btn btn-ghost btn-sm" onclick="deleteDuty('${e.id}')">Löschen</button>`:""}</td></tr>`).join("")}\n   </tbody></table></div>`:'<div class="empty-state">Noch keine Diensteinträge.</div>'}`
}

function openDutyForm(){
  const e=isAdmin()?DB.characters.filter(e=>"Bürger"!==e.fraktion):myCharacters().filter(e=>"Bürger"!==e.fraktion);
  0!==e.length?openFormModal("Dienst eintragen",[{key:"characterId",label:"Charakter",type:"select",required:!0,options:e.map(e=>({value:e.id,label:`${charName(e)} (${e.fraktion})`}))},{key:"start",label:"Dienstbeginn",type:"time",required:!0,value:"08:00"},{key:"end",label:"Dienstende",type:"time",required:!0,value:"16:00"},{key:"status",label:"Status",type:"select",options:["Im Dienst","Nicht im Dienst"],value:"Im Dienst"}],async t=>{const n=e.find(e=>e.id===t.characterId);n&&(DB.duty_log.unshift({id:genId(),characterId:n.id,name:charName(n),fraktion:n.fraktion,start:t.start,end:t.end,status:t.status}),await persist("duty_log"),logActivity(`${charName(n)} (${n.fraktion}) hat einen Dienst eingetragen.`),renderSidebar(),renderPage())},"Eintragen"):alert("Du benötigst einen Charakter mit Fraktion (Polizei, Feuerwehr oder Medical Service), um einen Dienst einzutragen.")
}

async function deleteDuty(e){
  const t=DB.duty_log.find(t=>t.id===e);
  t&&canDelete(t.fraktion)&&confirm("Diesen Diensteintrag wirklich löschen?")&&(DB.duty_log=DB.duty_log.filter(t=>t.id!==e),await persist("duty_log"),renderSidebar(),renderPage())
}

function renderPoliceBoard(){
  const e=isAdmin()||canWrite("Polizei"),t=DB.police_board,n=DB.characters.filter(e=>"Polizei"===e.fraktion);
  return`\n   <div class="card-head"><div class="card-title"><h3>State Protection Service – Operations Center</h3><div class="sub">Polizei-Leitstelle</div></div></div>\n   <div class="leadership-grid">\n     ${t.leadership.map((t,a)=>`\n       <div class="leadership-box">\n         <label>${esc(t.rolle)}</label>\n         <select ${e?"":"disabled"} onchange="setLeadership(${a}, this.value)">\n           <option value="">Nicht besetzt</option>\n           ${n.map(e=>`<option value="${esc(charName(e))}" ${t.besetztVon===charName(e)?"selected":""}>${esc(charName(e))}</option>`).join("")}\n         </select>\n       </div>`).join("")}\n   </div>\n   <div class="kpi-grid">\n     <div class="kpi-box"><label>Highspeed Unit</label><input type="number" min="0" value="${t.unitCounts.highspeed}" ${e?"":"disabled"} onchange="setUnitCount('highspeed', this.value)"></div>\n     <div class="kpi-box"><label>Traffic Unit</label><input type="number" min="0" value="${t.unitCounts.traffic}" ${e?"":"disabled"} onchange="setUnitCount('traffic', this.value)"></div>\n     <div class="kpi-box"><label>Highrank</label><input type="number" min="0" value="${t.unitCounts.highrank}" ${e?"":"disabled"} onchange="setUnitCount('highrank', this.value)"></div>\n     <div class="kpi-box"><label>Straßen Unit</label><input type="number" min="0" value="${t.unitCounts.strassen}" ${e?"":"disabled"} onchange="setUnitCount('strassen', this.value)"></div>\n     <div class="kpi-box"><label>Offroad Unit</label><input type="number" min="0" value="${t.unitCounts.offroad}" ${e?"":"disabled"} onchange="setUnitCount('offroad', this.value)"></div>\n     <div class="kpi-box"><label>Adam Unit</label><input type="number" min="0" value="${t.unitCounts.adam}" ${e?"":"disabled"} onchange="setUnitCount('adam', this.value)"></div>\n   </div>\n   <div class="form-group" style="max-width:280px;">\n     <label>Gerichtsstatus</label>\n     <select class="form-input" ${e?"":"disabled"} onchange="setGerichtsstatus(this.value)">\n       <option ${"Verhandlungsfähig"===t.gerichtsstatus?"selected":""}>Verhandlungsfähig</option>\n       <option ${"Nicht Verhandlungsfähig"===t.gerichtsstatus?"selected":""}>Nicht Verhandlungsfähig</option>\n     </select>\n   </div>\n   <h4 style="font-size:14px; font-weight:700; margin:22px 0 10px;">Aktive Patrol Unit</h4>\n   ${renderUnitTable("patrolUnits",t.patrolUnits,e)}\n   <h4 style="font-size:14px; font-weight:700; margin:24px 0 10px;">Criminal Investigation Unit</h4>\n   ${renderUnitTable("ciuUnits",t.ciuUnits,e)}`
}

function renderUnitTable(e,t,n){
  return`<div class="table-scroll"><table><thead><tr><th>Nr.</th><th>Besatzung</th><th>Funkname</th><th>Funknr.</th><th>Status</th><th>Gebiet</th><th>Fahrzeugtyp</th></tr></thead><tbody>\n    ${t.map((t,a)=>`<tr>\n      <td class="mono-id">${esc(t.nr)}</td>\n      <td><input class="table-input" value="${esc(t.besatzung)}" ${n?"":"disabled"} onchange="setUnitField('${e}',${a},'besatzung',this.value)"></td>\n      <td><input class="table-input" value="${esc(t.funkname)}" ${n?"":"disabled"} onchange="setUnitField('${e}',${a},'funkname',this.value)"></td>\n      <td><input class="table-input" value="${esc(t.funknummer)}" ${n?"":"disabled"} onchange="setUnitField('${e}',${a},'funknummer',this.value)"></td>\n      <td><input class="table-input" value="${esc(t.status)}" placeholder="z. B. 10-8" ${n?"":"disabled"} onchange="setUnitField('${e}',${a},'status',this.value)"></td>\n      <td><input class="table-input" value="${esc(t.gebiet)}" ${n?"":"disabled"} onchange="setUnitField('${e}',${a},'gebiet',this.value)"></td>\n      <td><input class="table-input" value="${esc(t.fahrzeugtyp)}" ${n?"":"disabled"} onchange="setUnitField('${e}',${a},'fahrzeugtyp',this.value)"></td>\n    </tr>`).join("")}\n  </tbody></table></div>`
}

async function setLeadership(e,t){
  DB.police_board.leadership[e].besetztVon=t,await persist("police_board")
}

async function setUnitCount(e,t){
  DB.police_board.unitCounts[e]=parseInt(t)||0,await persist("police_board")
}

async function setGerichtsstatus(e){
  DB.police_board.gerichtsstatus=e,await persist("police_board")
}

async function setUnitField(e,t,n,a){
  DB.police_board[e][t][n]=a,await persist("police_board")
}

async function toggleOwnDuty(){
  const e=activeCharacter();
  if(e&&"Bürger"!==e.fraktion){
    if(e.onDuty){
      e.onDuty=!1;
      const t=DB.duty_log.find(t=>t.characterId===e.id&&"Im Dienst"===t.status&&!t.end);
      t&&(t.end=nowHHMM(),t.status="Nicht im Dienst")
    }else e.onDuty=!0,DB.duty_log.unshift({id:genId(),characterId:e.id,name:charName(e),fraktion:e.fraktion,start:nowHHMM(),end:"",status:"Im Dienst"});
    await persist("characters"),await persist("duty_log"),logActivity(`${charName(e)} ist jetzt ${e.onDuty?"im Dienst":"nicht mehr im Dienst"}.`),renderSidebar(),renderPage()
  }else alert("Nur Charaktere mit Fraktion (Polizei, Feuerwehr, Medical Service, ADAC) können in den Dienst gehen.")
}
