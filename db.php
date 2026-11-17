<?php
function verbindeDatenbank(): PDO
{
    $pdo = new PDO('sqlite:' . __DIR__ . '/anfragen.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA foreign_keys = ON'); // gilt pro Verbindung
    return $pdo;
}
