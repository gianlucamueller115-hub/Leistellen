

const NAV_ITEMS=[{page:"dashboard",label:"Startseite",icon:'<path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v9.5a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1V15a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4.5a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V10"/>'},{page:"leitstelle",label:"Leitstelle",icon:'<path d="M12 19v-6"/><path d="M9 10.5a3.2 3.2 0 0 1 6 0"/><path d="M6.5 7.2a7 7 0 0 1 11 0"/><circle cx="12" cy="13" r="1.4" fill="currentColor" stroke="none"/>'},{page:"persoenlich",label:"Persönliche Akte",icon:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20v-1a7 7 0 0 1 14 0v1"/><path d="M9 3.5h6"/>'},{page:"akten",label:"Akten System",icon:'<path d="M3.5 7.2a1.6 1.6 0 0 1 1.6-1.6h4l1.7 2h7.7A1.6 1.6 0 0 1 20.1 9.2v8.2a1.6 1.6 0 0 1-1.6 1.6H5.1a1.6 1.6 0 0 1-1.6-1.6z"/>'},{page:"fahndung",label:"Fahndung",icon:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.7-4.7"/>'},{page:"waffenschein",label:"Waffenschein System",icon:'<path d="M13.5 9.5l4-4 2 2-1.2 1.2"/><path d="M15.7 7.3 18.7 10.3"/><path d="M13.5 9.5 4.8 18.2a1.4 1.4 0 0 0 2 2l1-1"/><path d="M9 14l2 2"/><path d="M7 16l1.6 1.6"/>'},{page:"fuehrerschein",label:"Führerschein System",icon:'<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 10.2h6M13 13.8h4"/>'},{page:"medical",label:"Medical Service",icon:'<path d="M12 4v16M4 12h16"/>'},{page:"feuerwehr",label:"Fire Department",icon:'<path d="M12 2.5c1.2 3-2.6 4.3-2.6 8.2a2.6 2.6 0 0 0 5.2 0c0-1.7-.9-2-.9-3.4 1.7 1 3 3.6 3 5.7a4.7 4.7 0 0 1-9.4 0c0-4 3.4-6 4.7-10.5z"/>'},{page:"strafenkatalog",label:"Strafenkatalog",icon:'<path d="M6.5 3h8l3 3v15h-11z"/><path d="M9 9.5h6M9 13h6M9 16.5h3.5"/>'},{page:"charaktere",label:"Charakter Verwaltung",icon:'<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20v-1.2A5.2 5.2 0 0 1 10 13.6h4a5.2 5.2 0 0 1 5.2 5.2V20"/>'},{page:"einstellungen",label:"Einstellungen",icon:'<circle cx="12" cy="12" r="2.8"/><path d="M12 3v2.2M12 18.8V21M4.6 6.6l1.6 1.6M17.8 15.8l1.6 1.6M3 12h2.2M18.8 12H21M4.6 17.4l1.6-1.6M17.8 8.2l1.6-1.6"/>'}];

function renderSidebar(){
  const e=DB.duty_log.filter(e=>"Im Dienst"===e.status).length;
  let t=NAV_ITEMS.filter(e=>canView(e.page)).map((t,n)=>{let a="";return"leitstelle"===t.page&&e>0&&(a=`<span class="nav-badge">${e}</span>`),`<div class="nav-item ${currentPage===t.page?"active":""}" onclick="nav('${t.page}')">\n      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>\n      ${esc(t.label)} ${a}\n    </div>`}).join("");
  isAdmin()&&(t+=`<div class="nav-item ${"admin"===currentPage?"active":""}" onclick="nav('admin')">\n      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/></svg>\n      Admin Panel\n    </div>`),document.getElementById("navList").innerHTML=t
}

function updateTopbarUser(){
  const e=currentAccount();
  if(!e)return;
  document.getElementById("topAvatar").textContent=initials(e.displayName),document.getElementById("topName").textContent=e.displayName;
  const t=activeCharacter();
  document.getElementById("topRole").textContent=e.isAdmin?"Administrator":t?charName(t)+" · "+t.fraktion:"Kein aktiver Charakter",document.getElementById("bellDot").style.display=DB.activity_log.length?"block":"none"
}

function nav(e){
  "admin"===e||canView(e)||(e="dashboard"),currentPage=e,hideAllDropdowns(),renderSidebar(),renderPage(),window.scrollTo(0,0),window.innerWidth<=760&&closeMenu()
}

function renderPage(){
  updateTopbarUser();
  const e=document.getElementById("pageRoot"),t=void 0,n={dashboard:renderDashboard,leitstelle:renderLeitstelle,akten:renderAkten,persoenlich:renderPersoenlich,fahndung:renderFahndung,waffenschein:()=>renderLizenzSeite("waffenschein"),fuehrerschein:()=>renderLizenzSeite("fuehrerschein"),medical:renderMedical,feuerwehr:renderFeuerwehr,strafenkatalog:renderStrafenkatalog,charaktere:renderCharaktere,einstellungen:renderEinstellungen,admin:()=>isAdmin()?renderAdmin():renderNoAccess()}[currentPage]||renderDashboard;
  e.innerHTML=n()
}

function renderNoAccess(){
  return'<div class="card"><div class="empty-state">Kein Zugriff auf diesen Bereich.</div></div>'
}

const sidebarEl=document.getElementById("sidebar"),overlayEl=document.getElementById("overlay");

function openMenu(){
  sidebarEl.classList.add("open"),overlayEl.classList.add("show")
}

function closeMenu(){
  sidebarEl.classList.remove("open"),overlayEl.classList.remove("show")
}
