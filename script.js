// ===== Formular "absenden" (nur Demo, es wird nichts wirklich gesendet) =====
const formular = document.querySelector("form");
const meldung = document.getElementById("meldung");
const button = formular.querySelector("button");

formular.addEventListener("submit", function (event) {
  event.preventDefault(); // Seite nicht neu laden / nichts senden

  // Button kurz auf "Wird gesendet..." stellen
  button.disabled = true;
  button.textContent = "Wird gesendet...";

  setTimeout(function () {
    const firma = document.getElementById("firmenname").value;

    meldung.textContent = "✓ Danke, " + firma + "! Ihre Sponsoring-Anfrage wurde erfolgreich gesendet.";
    meldung.className = "meldung erfolg";
    meldung.hidden = false;
    meldung.scrollIntoView({ behavior: "smooth", block: "center" });

    formular.reset();
    button.disabled = false;
    button.textContent = "Absenden";
  }, 1000);
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
