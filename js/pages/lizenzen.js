

function renderLizenzSeite(e){
  const t="waffenschein"===e,n=t?DB.waffenschein:DB.fuehrerschein,a=canWrite("Polizei"),i=void 0,s=t?"Typ":"Klasse";
  return`\n    <div class="section-header"><div><h2>${t?"Waffenschein System":"Führerschein System"}</h2><div class="sub">Ausstellung nur durch Polizei</div></div>\n      <button class="btn btn-primary" onclick="openLizenzForm('${e}')" ${a?"":"disabled"}>+ Ausstellen</button>\n    </div>\n    <div class="card">\n      ${n.length?`<div class="table-scroll"><table><thead><tr><th>Name</th><th>${s}</th><th>Datum</th><th>Ausgestellt von</th>${canDelete("Polizei")?"<th></th>":""}</tr></thead><tbody>\n        ${n.map(n=>`<tr><td>${esc(n.name)}</td><td><span class="badge blue">${esc(t?n.typ:n.klasse)}</span></td><td>${fmtDateShort(n.datum)}</td><td>${esc(n.ausgestelltVon)}</td>${canDelete("Polizei")?`<td><button class="btn btn-ghost btn-sm" onclick="deleteLizenz('${e}','${n.id}')">Löschen</button></td>`:""}</tr>`).join("")}\n      </tbody></table></div>`:'<div class="empty-state">Noch keine Einträge.</div>'}\n    </div>`
}

function openLizenzForm(e){
  if(!canWrite("Polizei"))return void alert("Nur Polizei-Charaktere können das ausstellen.");
  const t="waffenschein"===e,n=[{key:"name",label:"Name der Person",required:!0},t?{key:"typ",label:"Typ",type:"select",options:["Kleiner Waffenschein","Großer Waffenschein"]}:{key:"typ",label:"Klasse",type:"select",options:["B","BE","C","CE","M"]},{key:"datum",label:"Datum",type:"date",value:(new Date).toISOString().slice(0,10)}];
  openFormModal(t?"Waffenschein ausstellen":"Führerschein ausstellen",n,async e=>{const n={id:genId(),name:e.name,datum:e.datum,ausgestelltVon:currentAccount().displayName};t?(n.typ=e.typ,DB.waffenschein.unshift(n),await persist("waffenschein")):(n.klasse=e.typ,DB.fuehrerschein.unshift(n),await persist("fuehrerschein")),logActivity(`${t?"Waffenschein":"Führerschein"} für ${e.name} ausgestellt.`),renderPage()},"Ausstellen")
}

async function deleteLizenz(e,t){
  canDelete("Polizei")&&confirm("Eintrag wirklich löschen?")&&("waffenschein"===e?(DB.waffenschein=DB.waffenschein.filter(e=>e.id!==t),await persist("waffenschein")):(DB.fuehrerschein=DB.fuehrerschein.filter(e=>e.id!==t),await persist("fuehrerschein")),renderPage())
}
