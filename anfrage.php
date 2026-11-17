<?php
require __DIR__ . '/db.php';

header('Content-Type: application/json');

function antwort($status, $daten)
{
    http_response_code($status);
    echo json_encode($daten);
    exit;
}

$firmenname     = trim($_POST['firmenname'] ?? '');
$ansprechperson = trim($_POST['ansprechperson'] ?? '');
$mail           = trim($_POST['email'] ?? '');
$branche        = $_POST['branche'] ?? '';
$paketId        = $_POST['paket_id'] ?? '';
$nachricht      = trim($_POST['nachricht'] ?? '');
$betrag         = $_POST['betrag'] ?? '';
$datenschutz    = isset($_POST['datenschutz']) ? 1 : 0;

$fehler = [];

if ($firmenname === '') {
    $fehler['firmenname'] = 'Bitte gib einen Firmennamen ein.';
}
if ($ansprechperson === '') {
    $fehler['ansprechperson'] = 'Bitte gib eine Ansprechperson ein.';
}
if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    $fehler['email'] = 'Bitte gib eine gültige Mail ein.';
}
if (!in_array($branche, ['gastro', 'handel', 'handwerk', 'it', 'andere'])) {
    $fehler['branche'] = 'Bitte wähle eine Branche.';
}
if ($betrag !== '' && !filter_var($betrag, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])) {
    $fehler['betrag'] = 'Der Betrag muss eine ganze Zahl sein.';
}
if ($datenschutz !== 1) {
    $fehler['datenschutz'] = 'Bitte akzeptiere den Datenschutz.';
}

try {
    $pdo = verbindeDatenbank();

    // Paket ist freiwillig, aber wenn eins gewählt ist, muss es in der Tabelle pakete existieren
    if ($paketId !== '') {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM pakete WHERE id = :id');
        $stmt->execute([':id' => (int) $paketId]);
        if ($stmt->fetchColumn() == 0) {
            $fehler['paket_id'] = 'Bitte wähle ein gültiges Paket.';
        }
    }

    if ($fehler) {
        antwort(422, ['ok' => false, 'meldung' => 'Bitte korrigiere die markierten Felder.', 'fehler' => $fehler]);
    }

    $stmt = $pdo->prepare('INSERT INTO anfragen
        (firmenname, ansprechperson, email, branche, paket_id, nachricht, betrag, datenschutz)
        VALUES (:firmenname, :ansprechperson, :mail, :branche, :paket_id, :nachricht, :betrag, :datenschutz)');
    $stmt->execute([
        ':firmenname'     => $firmenname,
        ':ansprechperson' => $ansprechperson,
        ':mail'           => $mail,
        ':branche'        => $branche,
        ':paket_id'       => $paketId === '' ? null : (int) $paketId,
        ':nachricht'      => $nachricht === '' ? null : $nachricht,
        ':betrag'         => $betrag === '' ? null : (int) $betrag,
        ':datenschutz'    => $datenschutz,
    ]);

    antwort(201, ['ok' => true, 'meldung' => 'Danke, deine Anfrage wurde gespeichert.', 'id' => (int) $pdo->lastInsertId()]);
} catch (PDOException $e) {
    antwort(500, ['ok' => false, 'meldung' => 'Serverfehler, bitte später nochmals versuchen.']);
}
