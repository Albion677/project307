<?php
// ===== Sponsoring-Anfrage entgegennehmen und speichern =====
// Ablauf: POST-Daten lesen -> prüfen -> INSERT (Prepared Statement) -> JSON-Antwort

header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/db.php";

// Hilfsfunktion: JSON mit Statuscode senden und beenden
function antwort(int $status, array $daten): void
{
    http_response_code($status);
    echo json_encode($daten, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

// Nur POST erlauben
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    antwort(405, ["ok" => false, "meldung" => "Nur POST ist erlaubt."]);
}

// ----- 1. Daten lesen (trim entfernt Leerzeichen am Rand) -----
$firmenname     = trim($_POST["firmenname"] ?? "");
$ansprechperson = trim($_POST["ansprechperson"] ?? "");
$email          = trim($_POST["email"] ?? "");
$branche        = trim($_POST["branche"] ?? "");
$nachricht      = trim($_POST["nachricht"] ?? "");
$betrag         = trim($_POST["betrag"] ?? "");
$datenschutz    = isset($_POST["datenschutz"]) ? 1 : 0;

// ----- 2. Serverseitig prüfen (dem Browser nie blind vertrauen) -----
$fehler = [];
$erlaubteBranchen = ["gastro", "handel", "handwerk", "it", "andere"];

if ($firmenname === "") {
    $fehler["firmenname"] = "Bitte einen Firmennamen angeben.";
}
if ($ansprechperson === "") {
    $fehler["ansprechperson"] = "Bitte eine Ansprechperson angeben.";
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $fehler["email"] = "Bitte eine gültige E-Mail-Adresse angeben.";
}
if (!in_array($branche, $erlaubteBranchen, true)) {
    $fehler["branche"] = "Bitte eine Branche auswählen.";
}
if ($betrag !== "" && filter_var($betrag, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]) === false) {
    $fehler["betrag"] = "Der Betrag muss eine ganze Zahl ab 1 sein.";
}
if ($datenschutz !== 1) {
    $fehler["datenschutz"] = "Bitte den Datenschutz akzeptieren.";
}

if (count($fehler) > 0) {
    // 422 = Daten sind unvollständig oder ungültig
    antwort(422, [
        "ok"      => false,
        "meldung" => "Bitte die markierten Felder korrigieren.",
        "fehler"  => $fehler
    ]);
}

// ----- 3. Speichern mit Prepared Statement (schützt vor SQL-Injection) -----
try {
    $pdo = verbindeDatenbank();
    $stmt = $pdo->prepare("
        INSERT INTO anfragen (firmenname, ansprechperson, email, branche, nachricht, betrag, datenschutz)
        VALUES (:firmenname, :ansprechperson, :email, :branche, :nachricht, :betrag, :datenschutz)
    ");
    $stmt->execute([
        ":firmenname"     => $firmenname,
        ":ansprechperson" => $ansprechperson,
        ":email"          => $email,
        ":branche"        => $branche,
        ":nachricht"      => $nachricht === "" ? null : $nachricht,
        ":betrag"         => $betrag === "" ? null : (int) $betrag,
        ":datenschutz"    => $datenschutz
    ]);

    // 201 = neuer Datensatz wurde erstellt
    antwort(201, [
        "ok"      => true,
        "meldung" => "Danke, " . $firmenname . "! Ihre Sponsoring-Anfrage wurde gespeichert.",
        "id"      => (int) $pdo->lastInsertId()
    ]);
} catch (PDOException $e) {
    // 500 = Fehler auf dem Server (Details nicht an den Browser geben)
    error_log($e->getMessage());
    antwort(500, ["ok" => false, "meldung" => "Serverfehler: Die Anfrage konnte nicht gespeichert werden."]);
}
