// ===== Formular per fetch an anfrage.php senden =====
// Datenfluss: Formular -> FormData -> fetch POST -> anfrage.php -> db.php -> INSERT -> JSON -> Meldung
const formular = document.querySelector("form");
const meldung = document.getElementById("meldung");
const button = formular.querySelector("button[type=submit]");

// Meldung anzeigen (textContent statt innerHTML: kein HTML aus der Antwort ausführen)
function zeigeMeldung(text, art) {
  meldung.textContent = text;
  meldung.className = "meldung " + art;
  meldung.hidden = false;
  meldung.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Alle Felder wieder als gültig markieren
function fehlerZuruecksetzen() {
  formular.querySelectorAll("[aria-invalid]").forEach(function (feld) {
    feld.removeAttribute("aria-invalid");
  });
}

formular.addEventListener("submit", async function (event) {
  event.preventDefault(); // Seite nicht neu laden, wir senden selbst

  fehlerZuruecksetzen();
  button.disabled = true; // Doppeltes Absenden verhindern
  button.textContent = "Wird gesendet...";

  try {
    const antwort = await fetch(formular.action, {
      method: "POST",
      body: new FormData(formular)
    });
    const daten = await antwort.json();

    if (antwort.ok) {
      // 201: gespeichert
      zeigeMeldung("✓ " + daten.message, "erfolg");
      formular.reset();
    } else {
      // 422 (Eingabefehler) oder 500 (Serverfehler)
      zeigeMeldung("✗ " + daten.message, "fehler");
      if (daten.fehler) {
        Object.keys(daten.fehler).forEach(function (name) {
          const feld = formular.elements[name];
          if (feld) feld.setAttribute("aria-invalid", "true");
        });
      }
    }
  } catch (fehler) {
    // Netzwerkfehler oder keine gültige JSON-Antwort
    zeigeMeldung("✗ Die Anfrage konnte nicht gesendet werden. Bitte später erneut versuchen.", "fehler");
  } finally {
    button.disabled = false;
    button.textContent = "Absenden";
  }
});

// Wenn ein Pflichtfeld fehlt: rote Fehlermeldung zeigen
formular.addEventListener("invalid", function () {
  meldung.textContent = "✗ Fehler: Bitte alle Pflichtfelder (*) korrekt ausfüllen.";
  meldung.className = "meldung fehler";
  meldung.hidden = false;
}, true);

// ===== Klick auf ein Paket: Betrag im Formular eintragen =====
document.querySelectorAll(".paket").forEach(function (paket) {
  paket.addEventListener("click", function () {
    const preis = paket.querySelector(".preis").textContent; // z.B. "500 CHF"
    document.getElementById("betrag").value = parseInt(preis);
    document.getElementById("anfrage").scrollIntoView({ behavior: "smooth" });
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
