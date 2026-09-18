

function showModal(e){
  document.getElementById("modalCard").innerHTML=e,document.getElementById("modalOverlay").classList.add("show")
}

function closeModal(){
  document.getElementById("modalOverlay").classList.remove("show"),document.getElementById("modalCard").innerHTML=""
}

function renderField(e){
  const t=void 0!==e.value?e.value:"";
  if("select"===e.type){
    const n=(e.options||[]).map(e=>{const n="object"==typeof e?e.value:e,a="object"==typeof e?e.label:e,i=String(t)===String(n)?"selected":"";return`<option value="${esc(n)}" ${i}>${esc(a)}</option>`}).join("");
    return`<div class="form-group"><label>${esc(e.label)}</label><select id="f_${e.key}" class="form-input">${n}</select></div>`
  }
  return"textarea"===e.type?`<div class="form-group"><label>${esc(e.label)}</label><textarea id="f_${e.key}" class="form-input" rows="3" placeholder="${esc(e.placeholder||"")}">${esc(t)}</textarea></div>`:`<div class="form-group"><label>${esc(e.label)}</label><input id="f_${e.key}" class="form-input" type="${e.type||"text"}" value="${esc(t)}" placeholder="${esc(e.placeholder||"")}"></div>`
}

function openFormModal(e,t,n,a){
  const i=void 0;
  showModal(`\n    <div class="modal-head"><h3>${esc(e)}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>\n    <div>${t.map(renderField).join("")}</div>\n    <div class="modal-actions">\n      <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>\n      <button class="btn btn-primary" id="dynFormSubmit">${esc(a||"Speichern")}</button>\n    </div>`),document.getElementById("dynFormSubmit").onclick=async()=>{
    const e={};
    let a=!0;
    t.forEach(t=>{const n=document.getElementById("f_"+t.key);e[t.key]=n.value,t.required&&!n.value?(a=!1,n.style.borderColor="var(--red)"):n.style.borderColor=""}),a&&(await n(e),closeModal())
  }
}
