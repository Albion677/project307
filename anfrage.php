<?php
require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

function antwort($status, $daten)
{
    http_response_code($status);
    // Umlaute als ä statt ä ausgeben
    echo json_encode($daten, JSON_UNESCAPED_UNICODE);
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

// mb_strlen zählt Zeichen, strlen würde Bytes zählen (ä = 2 Bytes)
if ($firmenname === '') {
    $fehler['firmenname'] = 'Bitte gib einen Firmennamen ein.';
} elseif (mb_strlen($firmenname) > 100) {
    $fehler['firmenname'] = 'Der Firmenname darf höchstens 100 Zeichen haben.';
}
if ($ansprechperson === '') {
    $fehler['ansprechperson'] = 'Bitte gib eine Ansprechperson ein.';
} elseif (mb_strlen($ansprechperson) > 100) {
    $fehler['ansprechperson'] = 'Die Ansprechperson darf höchstens 100 Zeichen haben.';
}
if (!filter_var($mail, FILTER_VALIDATE_EMAIL) || mb_strlen($mail) > 254) {
    $fehler['email'] = 'Bitte gib eine gültige E-Mail-Adresse ein.';
}
if (!in_array($branche, ['gastro', 'handel', 'handwerk', 'it', 'andere'], true)) {
    $fehler['branche'] = 'Bitte wähle eine Branche.';
}
if (mb_strlen($nachricht) > 1000) {
    $fehler['nachricht'] = 'Die Nachricht darf höchstens 1000 Zeichen haben.';
}
if ($betrag !== '' && !filter_var($betrag, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])) {
    $fehler['betrag'] = 'Der Betrag muss eine ganze Zahl ab 1 sein.';
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
        if (!ctype_digit($paketId) || $stmt->fetchColumn() == 0) {
            $fehler['paket_id'] = 'Dieses Paket kennen wir nicht.';
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
