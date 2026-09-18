# EinsatzPORTAL

Verwaltungsportal für Roleplay: Leitstelle, Akten, Fahndungen, Lizenzen,
Einsatzberichte, Charaktere und Adminbereich.

---

## 1. Starten

Das Portal muss über einen Webserver laufen, sonst darf der Browser die
`.env` nicht lesen (Doppelklick auf `index.html` reicht nicht).

```bash
# im Projektordner
python3 -m http.server 8080
```

Danach im Browser öffnen: <http://localhost:8080>

Alternativen: die Erweiterung „Live Server" in VS Code, `npx serve`,
oder jeder normale Webspace (Apache, nginx, Netlify, Vercel …).

---

## 2. Appwrite verbinden

### 2.1 In Appwrite anlegen

1. Projekt anlegen (oder ein vorhandenes öffnen) → **Projekt-ID** notieren.
2. Unter **Databases** eine Datenbank anlegen → **Datenbank-ID** notieren.
3. In der Datenbank eine **Collection** anlegen, z. B. `portal_state`
   → **Collection-ID** notieren.
4. In der Collection ein Attribut anlegen:

   | Feld      | Wert                                   |
   |-----------|----------------------------------------|
   | Typ       | String                                 |
   | Key       | `payload`                              |
   | Size      | `1000000` (ruhig groß wählen)          |
   | Required  | nein                                   |

5. Unter **Settings → Permissions** der Collection Lese- und Schreibrechte
   vergeben. Für den einfachen Start: Rolle **Any** mit
   `create`, `read`, `update`, `delete`.
6. Unter **Projekt → Settings → Platforms** eine **Web-App** hinzufügen und
   dort die Domain eintragen, unter der das Portal läuft
   (z. B. `localhost` oder `portal.deine-domain.de`).

### 2.2 In die `.env` eintragen

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=dein_projekt
APPWRITE_DATABASE_ID=deine_datenbank
APPWRITE_COLLECTION_ID=portal_state
APPWRITE_PAYLOAD_ATTRIBUTE=payload
APPWRITE_API_KEY=
```

Mehr ist nicht nötig. Seite neu laden – ab jetzt liegen alle Daten in
Appwrite und sind für alle Nutzer gleich.

Solange die Felder leer sind, läuft das Portal weiter, speichert aber nur
lokal im Browser (localStorage).

### 2.3 Hinweise

- **API-Key:** nur setzen, wenn die Collection keine `Any`-Berechtigungen
  hat. Die `.env` wird vom Browser geladen, der Key ist damit für jeden
  sichtbar, der die Seite öffnet.
- **Server blockiert `.env`?** Manche Webserver (z. B. Apache, nginx)
  liefern Dateien mit Punkt am Anfang nicht aus. Dann die Datei einfach in
  `config.env` umbenennen – das Portal sucht automatisch auch danach.
- **Datenaufbau:** jeder Bereich (`akten`, `characters`, `duty_log` …) wird
  als ein Dokument gespeichert, die Dokument-ID ist der Bereichsname, der
  Inhalt steht als JSON im Attribut `payload`.
- **Design und Sitzung** (hell/dunkel, „eingeloggt bleiben") bleiben
  absichtlich lokal im Browser.

---

## 3. Administratorkonto

Steht ebenfalls in der `.env` und wird beim ersten Start angelegt, falls es
das Konto noch nicht gibt:

```env
ADMIN_EMAIL=Admin@FireDesign.eu
ADMIN_PASSWORD=Admin2026!
ADMIN_NAME=Administrator
```

Das Passwort nach dem ersten Login unter **Einstellungen** ändern. Ein
späteres Ändern der `.env` überschreibt ein vorhandenes Konto **nicht**.

---

## 4. Doppelte Charakternamen

Ein Charakter kann nur einmal mit derselben Kombination aus Vor- und
Nachname angelegt werden – serverweit, nicht nur pro Konto. Ist entweder
der Vor- oder der Nachname anders, gilt der Name als frei. Die Prüfung
läuft in `js/features/characters.js` (`characterNameTaken`) und wird
sowohl bei der ersten Charaktererstellung nach dem Login als auch in der
Charakterverwaltung aufgerufen.

## 5. Aufbau der Dateien

```
rp-portal/
├── index.html              Grundgerüst, Login- und Portalansicht
├── .env                    Deine Konfiguration
├── .env.example            Vorlage
├── assets/
│   ├── logo.webp           Logo (Login, Sidebar, Charakterauswahl)
│   ├── favicon-32.png      Browser-Tab-Icon
│   └── favicon-180.png     Icon für Startbildschirm/Lesezeichen
├── css/
│   ├── base.css            Farben, Reset, Ladebildschirm
│   ├── auth.css            Login, Registrierung, Begrüßung
│   ├── components.css      Buttons, Karten, Tabellen, Badges, Modal
│   ├── layout.css          Sidebar, Topbar, Responsive
│   └── pages.css           Hero, Dashboard, Akten, Charaktere
└── js/
    ├── core/
    │   ├── env.js          liest die .env
    │   ├── appwrite.js     Appwrite-REST-Anbindung
    │   ├── storage.js      Appwrite oder localStorage
    │   ├── db.js           Datenbereiche, Startwerte, Speichern
    │   ├── session.js      angemeldeter Nutzer
    │   ├── theme.js        hell/dunkel
    │   ├── utils.js        Helfer (Datum, Escaping, Avatare)
    │   └── permissions.js  Rechte und Sichtbarkeit
    ├── features/
    │   ├── auth.js         Login, Registrierung, Begrüßung
    │   ├── characters.js   Charakterformular
    │   └── gate.js         Charakterauswahl nach dem Login
    ├── ui/
    │   ├── shell.js        Sidebar, Navigation, Routing
    │   ├── modal.js        modale Fenster
    │   ├── dropdowns.js    Benachrichtigungen, Benutzermenü
    │   └── search.js       globale Suche
    ├── pages/              je eine Datei pro Seite
    └── main.js             Start des Portals
```

Die Dateien werden in `index.html` in fester Reihenfolge eingebunden
(erst `core`, dann `features`, `ui`, `pages`, zuletzt `main.js`).
Wer eine neue Seite hinzufügt: Datei unter `js/pages/` anlegen, in
`index.html` einbinden und in `renderPage()` (`js/ui/shell.js`) sowie in
`NAV_ITEMS` eintragen.
