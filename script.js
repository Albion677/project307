const form = document.querySelector('#anfrage-form');
const meldung = document.querySelector('#meldung');
const button = form.querySelector('button[type="submit"]');
const buttonText = button.textContent;

function zeigeMeldung(text, art) {
  meldung.textContent = text;
  meldung.className = 'meldung ' + art;
  meldung.hidden = false;
}

// Gleiche Regeln und Texte wie in anfrage.php (Feldname -> Text).
// Nur Komfort: PHP prüft trotzdem alles nochmals.
function pruefeImBrowser() {
  const fehler = {};
  const f = form.elements;

  if (!f.firmenname.value.trim()) {
    fehler.firmenname = 'Bitte gib einen Firmennamen ein.';
  }
  if (!f.ansprechperson.value.trim()) {
    fehler.ansprechperson = 'Bitte gib eine Ansprechperson ein.';
  }
  if (!f.email.checkValidity()) {
    fehler.email = 'Bitte gib eine gültige E-Mail-Adresse ein.';
  }
  if (!f.branche.value) {
    fehler.branche = 'Bitte wähle eine Branche.';
  }
  if (!f.betrag.checkValidity()) {
    fehler.betrag = 'Der Betrag muss eine ganze Zahl ab 1 sein.';
  }
  if (!f.datenschutz.checked) {
    fehler.datenschutz = 'Bitte akzeptiere den Datenschutz.';
  }
  return fehler;
}

// Alle Fehler als Liste anzeigen und die Felder rot markieren
function zeigeFehler(fehler, titel = 'Bitte prüfe deine Angaben:') {
  zeigeMeldung(titel, 'fehler');
  const liste = document.createElement('ul');
  for (const [feld, text] of Object.entries(fehler)) {
    const punkt = document.createElement('li');
    punkt.textContent = text; // textContent, nicht innerHTML
    liste.append(punkt);
    markiere(feld);
  }
  meldung.append(liste);
  // auf dem Handy liegt die Meldung sonst ausserhalb vom Bildschirm
  meldung.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function markiere(feld) {
  // bei der Checkbox die ganze Zeile markieren, das Häkchen allein sieht man kaum
  const gruppe = { datenschutz: '.check' };
  const element = gruppe[feld] ? form.querySelector(gruppe[feld]) : form.elements[feld];
  element?.setAttribute('aria-invalid', 'true');
}

// Rot wegnehmen, sobald man ein markiertes Feld korrigiert
form.addEventListener('input', (event) => {
  event.target.removeAttribute('aria-invalid');
  event.target.closest('.check')?.removeAttribute('aria-invalid');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // alte Fehler-Markierungen entfernen
  form.querySelectorAll('[aria-invalid]').forEach((feld) => feld.removeAttribute('aria-invalid'));

  const fehlerBrowser = pruefeImBrowser();
  if (Object.keys(fehlerBrowser).length > 0) {
    zeigeFehler(fehlerBrowser);
    return; // kein Request an den Server
  }

  button.disabled = true;
  button.textContent = 'Wird gesendet ...';

  try {
    const antwort = await fetch('anfrage.php', {
      method: 'POST',
      body: new FormData(form),
    });
    const daten = await antwort.json();

    if (antwort.ok && daten.ok) {
      zeigeMeldung(daten.meldung, 'erfolg');
      form.reset();
      zeigePaket('');
    } else if (daten.fehler) {
      zeigeFehler(daten.fehler, daten.meldung);
    } else {
      zeigeMeldung(daten.meldung, 'fehler');
    }
  } catch (fehler) {
    zeigeMeldung('Keine Verbindung zum Server.', 'fehler');
  } finally {
    button.disabled = false;
    button.textContent = buttonText;
  }
});

// ===== Paket wählen: über die Karten oder über die Liste im Formular =====
const paketListe = form.elements['paket_id'];
const paketKnoepfe = document.querySelectorAll('.paket-waehlen');

// passende Karte hervorheben
function zeigePaket(id) {
  paketKnoepfe.forEach((knopf) => {
    const gewaehlt = knopf.dataset.dbId === id;
    knopf.closest('.paket').classList.toggle('gewaehlt', gewaehlt);
    knopf.textContent = gewaehlt ? 'Ausgewählt' : 'Auswählen';
  });
}

paketKnoepfe.forEach((knopf) => {
  knopf.addEventListener('click', () => {
    paketListe.value = knopf.dataset.dbId;
    form.elements['betrag'].value = knopf.dataset.preis;
    zeigePaket(knopf.dataset.dbId);
    document.querySelector('#anfrage').scrollIntoView();
  });
});

paketListe.addEventListener('change', () => {
  zeigePaket(paketListe.value);
  const knopf = document.querySelector(`.paket-waehlen[data-db-id="${paketListe.value}"]`);
  if (knopf) {
    form.elements['betrag'].value = knopf.dataset.preis;
  }
});

// ===== Cookie-Banner =====
const cookieBanner = document.getElementById("cookie-banner");
const cookieEinstellungen = document.getElementById("cookie-einstellungen");
const einstellungenBtn = document.getElementById("cookie-einstellungen-btn");

// Banner nur zeigen, wenn noch keine Wahl gespeichert ist
if (!localStorage.getItem("cookieWahl")) {
  cookieBanner.hidden = false;
}

function cookieSpeichern(wahl) {
  localStorage.setItem("cookieWahl", JSON.stringify(wahl));
  cookieBanner.hidden = true;
}

document.getElementById("cookie-akzeptieren").addEventListener("click", function () {
  cookieSpeichern({ statistik: true, marketing: true });
});

document.getElementById("cookie-ablehnen").addEventListener("click", function () {
  cookieSpeichern({ statistik: false, marketing: false });
});

einstellungenBtn.addEventListener("click", function () {
  if (cookieEinstellungen.hidden) {
    // Einstellungen aufklappen
    cookieEinstellungen.hidden = false;
    einstellungenBtn.textContent = "Auswahl speichern";
  } else {
    // Gewählte Häkchen speichern
    cookieSpeichern({
      statistik: document.getElementById("cookie-statistik").checked,
      marketing: document.getElementById("cookie-marketing").checked
    });
  }
});

// Link im Footer: Banner nochmals öffnen
document.getElementById("cookie-oeffnen").addEventListener("click", function (event) {
  event.preventDefault();
  cookieEinstellungen.hidden = true;
  einstellungenBtn.textContent = "Einstellungen";
  cookieBanner.hidden = false;
});
