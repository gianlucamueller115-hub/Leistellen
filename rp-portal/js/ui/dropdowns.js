

function hideAllDropdowns(){
  document.getElementById("notifDropdown").classList.remove("show"),document.getElementById("userDropdown").classList.remove("show"),document.getElementById("searchResults").style.display="none"
}

function toggleNotif(e){
  e.stopPropagation(),document.getElementById("userDropdown").classList.remove("show");
  const t=document.getElementById("notifDropdown"),n=!t.classList.contains("show");
  if(n){
    const e=DB.activity_log.slice(0,8);
    t.innerHTML='<div class="dropdown-head">Aktivitäten</div>'+(e.length?e.map(e=>`<div class="notif-item">${esc(e.text)}<div class="t">${fmtDate(e.time)}</div></div>`).join(""):'<div class="notif-empty">Noch keine Aktivitäten.</div>')
  }
  t.classList.toggle("show",n)
}

function toggleUserMenu(e){
  e.stopPropagation(),document.getElementById("notifDropdown").classList.remove("show"),document.getElementById("userDropdown").classList.toggle("show")
}

document.addEventListener("click",e=>{if(e.target.closest(".user-wrap")||document.getElementById("userDropdown")?.classList.remove("show"),e.target.closest(".bell-wrap")||document.getElementById("notifDropdown")?.classList.remove("show"),!e.target.closest(".search-wrap")){const e=document.getElementById("searchResults");e&&(e.style.display="none")}});
