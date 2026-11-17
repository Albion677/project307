<?php
// ===== Datenbank-Verbindung (PDO + SQLite) =====
// Wird von anfrage.php mit require eingebunden.

function db(): PDO
{
    $pdo = new PDO("sqlite:" . __DIR__ . "/anfragen.db");

    // Fehler als Exception werfen und Zeilen als assoziatives Array liefern
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Fremdschlüssel in SQLite einschalten (ist standardmässig AUS)
    $pdo->exec("PRAGMA foreign_keys = ON");

    // Tabelle anlegen, falls die Datenbank noch leer ist
    $pdo->exec(file_get_contents(__DIR__ . "/schema.sql"));

    return $pdo;
}
