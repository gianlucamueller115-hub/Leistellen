

function onSearchInput(e){
  const t=e.target.value.trim().toLowerCase(),n=document.getElementById("searchResults");
  if(!t)return n.style.display="none",void(n.innerHTML="");
  const a=[];
  DB.akten.filter(e=>e.name.toLowerCase().includes(t)).slice(0,4).forEach(e=>a.push({label:e.name,type:"Akte",action:`goToAkte('${e.id}')`})),DB.fahndungen.filter(e=>"Aktiv"===e.status&&e.bezeichnung.toLowerCase().includes(t)).slice(0,4).forEach(e=>a.push({label:e.bezeichnung,type:"Fahndung",action:"nav('fahndung')"})),DB.characters.filter(e=>charName(e).toLowerCase().includes(t)).slice(0,4).forEach(e=>a.push({label:`${charName(e)} (${e.fraktion})`,type:"Charakter",action:"nav('charaktere')"})),Object.values(DB.accounts).filter(e=>e.displayName.toLowerCase().includes(t)).slice(0,3).forEach(e=>a.push({label:e.displayName,type:"Konto",action:"isAdmin() && nav('admin')"})),n.innerHTML=a.length?a.map(e=>`<div class="search-result" onclick="${e.action}; clearSearch();"><span>${esc(e.label)}</span><span class="sr-type">${esc(e.type)}</span></div>`).join(""):`<div class="search-empty">Keine Treffer für „${esc(e.target.value)}"</div>`,n.style.display="block"
}

function clearSearch(){
  document.getElementById("searchInput").value="",document.getElementById("searchResults").style.display="none"
}

function goToAkte(e){
  nav("akten"),setTimeout(()=>openAkteDetail(e),0)
}
