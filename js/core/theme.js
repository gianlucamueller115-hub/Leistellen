

let currentTheme = 'light';

function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

async function loadTheme() {
  try {
    const entry = await Store.get('theme', false);
    currentTheme = entry ? JSON.parse(entry.value) : 'light';
  } catch (err) {
    currentTheme = 'light';
  }
  applyTheme();
}

async function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme();
  try {
    await Store.set('theme', JSON.stringify(currentTheme), false);
  } catch (err) {
    console.warn('[EinsatzPORTAL] Design konnte nicht gespeichert werden.');
  }
}
