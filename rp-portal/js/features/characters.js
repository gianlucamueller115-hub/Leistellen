

let pendingProfilbild={};

function characterFormFieldsHTML(e){
  return`\n    <div class="form-group"><label>Vorname</label><input id="${e}Vorname" class="form-input"></div>\n    <div class="form-group"><label>Nachname</label><input id="${e}Nachname" class="form-input"></div>\n    <div class="form-group"><label>Geburtsdatum</label><input id="${e}Geburtsdatum" type="date" class="form-input" onchange="autoCalcAge('${e}')"></div>\n    <div class="form-group"><label>Alter</label><input id="${e}Alter" type="number" min="0" class="form-input" placeholder="wird automatisch berechnet"></div>\n    <div class="form-group"><label>Wohnort</label><input id="${e}Wohnort" class="form-input"></div>\n    <div class="form-group"><label>Beruf</label>\n      <select id="${e}Beruf" class="form-input">\n        <option value="Bürger">Bürger</option>\n        <option value="Polizei">Polizei</option>\n        <option value="Feuerwehr">Feuerwehr</option>\n        <option value="Medical Service">Medical Service (Rettungsdienst)</option>\n        <option value="ADAC">ADAC</option>\n      </select>\n    </div>\n    <div class="form-group"><label>Profilbild (optional)</label>\n      <input id="${e}Bild" type="file" accept="image
function characterNameTaken(vorname, nachname, excludeId) {
  const v = (vorname || '').trim().toLowerCase();
  const n = (nachname || '').trim().toLowerCase();
  return DB.characters.some(c =>
    c.id !== excludeId &&
    (c.vorname || '').trim().toLowerCase() === v &&
    (c.nachname || '').trim().toLowerCase() === n
  );
}
