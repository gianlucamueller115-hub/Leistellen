

function esc(e){
  return(null==e?"":String(e)).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[e]))
}

function genId(){
  return Date.now().toString(36)+Math.random().toString(36).slice(2,7)
}

function fmtDate(e){
  try{
    return new Date(e).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})
  }catch(t){
    return e||""
  }
}

function fmtDateShort(e){
  try{
    return new Date(e).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})
  }catch(t){
    return e||""
  }
}

function normEmail(e){
  return(e||"").trim().toLowerCase()
}

function initials(e){
  if(!e)return"?";
  const t=e.trim().split(/\s+/);
  return((t[0]?.[0]||"")+(t[1]?.[0]||"")).toUpperCase()||"?"
}

function badgeClassFor(e){
  return"Polizei"===e?"blue":"Feuerwehr"===e?"orange":"Medical Service"===e?"red":"ADAC"===e?"violet":"gray"
}

function charName(e){
  return e?((e.vorname||"")+" "+(e.nachname||"")).trim()||"Unbenannt":""
}

function avatarHTML(e,t,n){
  const a="object-fit:cover;"+(n||"");
  return e&&e.profilbild?`<img src="${e.profilbild}" class="${t}" alt="" style="${a}">`:`<div class="${t}"${n?` style="${n}"`:""}>${initials(charName(e))}</div>`
}

function calcAge(e){
  if(!e)return"";
  const t=new Date(e);
  if(isNaN(t.getTime()))return"";
  const n=new Date;
  let a=n.getFullYear()-t.getFullYear();
  const i=n.getMonth()-t.getMonth();
  return(i<0||0===i&&n.getDate()<t.getDate())&&a--,a>=0?a:""
}

function nowHHMM(){
  const e=new Date;
  return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")
}
