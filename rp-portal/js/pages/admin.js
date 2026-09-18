

function renderAdmin(){
  const e=Object.values(DB.accounts);
  return`\n    <div class="section-header"><div><h2>Admin Panel</h2><div class="sub">Konten &amp; Inhalte verwalten</div></div>\n      <button class="btn btn-primary" onclick="openCreateAccountForm()">+ Konto anlegen</button>\n    </div>\n    <div class="card" style="margin-bottom:24px;">\n      <h3 style="font-size:15px; font-weight:700; margin-bottom:16px;">Konten (${e.length})</h3>\n      <div class="table-scroll"><table><thead><tr><th>Name</th><th>E-Mail</th><th>Rolle</th><th></th></tr></thead><tbody>\n        ${e.map(e=>`<tr${e.locked?' style="opacity:.55;"':""}><td>${esc(e.displayName)} ${e.locked?'<span class="badge red">Gesperrt</span>':""}</td><td>${esc(e.email)}</td><td>${roleLabel(e)}</td>\n          <td class="row-actions">\n            <button class="btn btn-ghost btn-sm" onclick="openEditRoleForm('${esc(e.email)}')" ${e.email===session.email?"disabled":""}>Rolle ändern</button>\n            <button class="btn btn-ghost btn-sm" onclick="toggleLockAccount('${esc(e.email)}')" ${e.email===session.email?"disabled":""}>${e.locked?"Entsperren":"Sperren"}</button>\n            <button class="btn btn-ghost btn-sm" onclick="resetPassword('${esc(e.email)}')">PW zurücksetzen</button>\n            <button class="btn btn-danger btn-sm" onclick="deleteAccount('${esc(e.email)}')" ${e.email===session.email?"disabled":""}>Löschen</button>\n          </td></tr>`).join("")}\n      </tbody></table></div>\n    </div>\n    <div class="card">\n      <div class="card-head"><h3 style="font-size:15px; font-weight:700;">Server Updates &amp; Neuigkeiten</h3><button class="btn btn-outline btn-sm" onclick="openNewsForm()">+ Neu</button></div>\n      ${DB.news.length?`<div class="news-list">${DB.news.map(e=>`<div class="news-item"><span class="news-dot" style="background:${e.color||"var(--blue)"}"></span><div class="news-body"><div class="news-top"><h4>${esc(e.title)}${e.category?` <span class="badge gray" style="margin-left:6px;">${esc(e.category)}</span>`:""}</h4><span class="news-date">${fmtDateShort(e.date)}</span></div><p>${esc(e.text)}</p></div><button class="btn btn-ghost btn-sm" onclick="deleteNews('${e.id}')">Löschen</button></div>`).join("")}</div>`:'<div class="empty-state small">Noch keine Neuigkeiten.</div>'}\n    </div>`
}

document.getElementById("menuToggle").addEventListener("click",()=>{sidebarEl.classList.contains("open")?closeMenu():openMenu()}),overlayEl.addEventListener("click",closeMenu);

const ROLE_OPTIONS=[{value:"member",label:"Mitglied"},{value:"admin",label:"Admin"},{value:"chief_polizei",label:"Chief · Polizei"},{value:"chief_feuerwehr",label:"Chief · Feuerwehr"},{value:"chief_medical",label:"Chief · Medical Service"},{value:"chief_adac",label:"Chief · ADAC"}];

function roleToFields(e){
  return"admin"===e?{isAdmin:!0,chiefOf:null}:"chief_polizei"===e?{isAdmin:!1,chiefOf:"Polizei"}:"chief_feuerwehr"===e?{isAdmin:!1,chiefOf:"Feuerwehr"}:"chief_medical"===e?{isAdmin:!1,chiefOf:"Medical Service"}:"chief_adac"===e?{isAdmin:!1,chiefOf:"ADAC"}:{isAdmin:!1,chiefOf:null}
}

function fieldsToRole(e){
  return e.isAdmin?"admin":"Polizei"===e.chiefOf?"chief_polizei":"Feuerwehr"===e.chiefOf?"chief_feuerwehr":"Medical Service"===e.chiefOf?"chief_medical":"ADAC"===e.chiefOf?"chief_adac":"member"
}

function openCreateAccountForm(){
  openFormModal("Konto anlegen",[{key:"name",label:"Anzeigename",required:!0},{key:"email",label:"E-Mail",type:"email",required:!0},{key:"password",label:"Passwort",type:"password",required:!0},{key:"role",label:"Rolle",type:"select",options:ROLE_OPTIONS,value:"member"}],async e=>{const t=normEmail(e.email);if(DB.accounts[t])return void alert("Für diese E-Mail existiert bereits ein Konto.");const n=roleToFields(e.role);DB.accounts[t]={email:t,password:e.password,displayName:e.name,locked:!1,isAdmin:n.isAdmin,chiefOf:n.chiefOf},await persist("accounts"),renderPage()},"Anlegen")
}

function openEditRoleForm(e){
  const t=DB.accounts[e];
  t&&openFormModal("Rolle bearbeiten – "+t.displayName,[{key:"role",label:"Rolle",type:"select",options:ROLE_OPTIONS,value:fieldsToRole(t)}],async e=>{const n=roleToFields(e.role);t.isAdmin=n.isAdmin,t.chiefOf=n.chiefOf,await persist("accounts"),renderPage()},"Speichern")
}

async function toggleLockAccount(e){
  e!==session.email?(DB.accounts[e].locked=!DB.accounts[e].locked,await persist("accounts"),logActivity(`Konto ${DB.accounts[e].displayName} wurde ${DB.accounts[e].locked?"gesperrt":"entsperrt"}.`),renderPage()):alert("Du kannst dein eigenes Konto nicht sperren.")
}

async function deleteAccount(e){
  e!==session.email?confirm("Konto wirklich löschen?")&&(delete DB.accounts[e],await persist("accounts"),renderPage()):alert("Du kannst dein eigenes Konto hier nicht löschen.")
}

async function resetPassword(e){
  const t=prompt("Neues Passwort für "+e+":");
  t&&(DB.accounts[e].password=t,await persist("accounts"),alert("Passwort wurde aktualisiert."))
}

function openNewsForm(){
  openFormModal("Neuigkeit veröffentlichen",[{key:"title",label:"Titel",required:!0},{key:"text",label:"Text",type:"textarea",required:!0},{key:"category",label:"Kategorie",type:"select",options:["Server Update","Regeländerung","Event","Sonstiges"]},{key:"color",label:"Farbe",type:"select",options:[{value:"var(--green)",label:"Grün"},{value:"var(--red)",label:"Rot"},{value:"var(--violet)",label:"Violett"},{value:"var(--blue)",label:"Blau"}]}],async e=>{DB.news.unshift({id:genId(),title:e.title,text:e.text,category:e.category,color:e.color,date:(new Date).toISOString()}),await persist("news"),renderPage()},"Veröffentlichen")
}

async function deleteNews(e){
  confirm("Neuigkeit wirklich löschen?")&&(DB.news=DB.news.filter(t=>t.id!==e),await persist("news"),renderPage())
}
