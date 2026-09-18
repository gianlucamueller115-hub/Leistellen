

function currentAccount(){
  return session?DB.accounts[session.email]:null
}

function isAdmin(){
  const e=currentAccount();
  return!(!e||!e.isAdmin)
}

function myCharacters(){
  return session?DB.characters.filter(e=>e.ownerEmail===session.email):[]
}

function activeCharacter(){
  return session&&DB.characters.find(e=>e.ownerEmail===session.email&&e.active)||null
}

function canWrite(e){
  if(isAdmin())return!0;
  const t=activeCharacter();
  return!(!t||t.fraktion!==e)
}

function canDelete(e){
  if(isAdmin())return!0;
  const t=currentAccount();
  return!(!t||t.chiefOf!==e)
}

function domainForPage(e){
  const t=void 0;
  return{akten:"Polizei",waffenschein:"Polizei",fuehrerschein:"Polizei",strafenkatalog:"Polizei",fahndung:"Polizei",feuerwehr:"Feuerwehr",medical:"Medical Service"}[e]||null
}

function canView(e){
  if(isAdmin())return!0;
  const t=domainForPage(e);
  if(!t)return!0;
  const n=activeCharacter();
  return!!n&&("Polizei"===n.fraktion||n.fraktion===t)
}

function leitstelleTabVisible(e){
  if("uebersicht"===e)return!0;
  if(isAdmin())return!0;
  const t=activeCharacter();
  return!!t&&("Polizei"===t.fraktion||("feuerwehr"===e?"Feuerwehr"===t.fraktion:"medical"===e?"Medical Service"===t.fraktion:"adac"===e&&"ADAC"===t.fraktion))
}

function roleLabel(e){
  return e.isAdmin?'<span class="badge violet">Admin</span>':e.chiefOf?`<span class="badge ${badgeClassFor(e.chiefOf)}">Chief · ${esc(e.chiefOf)}</span>`:'<span class="badge gray">Mitglied</span>'
}
