const form = document.querySelector('#anfrage-form');
const meldung = document.querySelector('#meldung');
const button = form.querySelector('button[type="submit"]');

function zeigeMeldung(text, art) {
  meldung.textContent = text;
  meldung.className = 'meldung ' + art;
  meldung.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // alte Fehler-Markierungen entfernen
  form.querySelectorAll('[aria-invalid]').forEach((feld) => feld.removeAttribute('aria-invalid'));
  button.disabled = true;

  try {
    const antwort = await fetch('anfrage.php', {
      method: 'POST',
      body: new FormData(form),
    });
    const daten = await antwort.json();

    if (antwort.ok && daten.ok) {
      zeigeMeldung(daten.meldung, 'erfolg');
      form.reset();
    } else {
      zeigeMeldung(daten.meldung, 'fehler');
      for (const name in daten.fehler) {
        form.elements[name].setAttribute('aria-invalid', 'true');
      }
    }
  } catch (fehler) {
    zeigeMeldung('Keine Verbindung zum Server.', 'fehler');
  }

  button.disabled = false;
});

// Paket auswählen: id und Preis ins Formular übernehmen
document.querySelectorAll('.paket-waehlen').forEach((knopf) => {
  knopf.addEventListener('click', () => {
    form.elements['paket_id'].value = knopf.dataset.dbId;
    form.elements['betrag'].value = knopf.dataset.preis;
    document.querySelector('#anfrage').scrollIntoView();
  });
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
