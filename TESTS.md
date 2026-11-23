# Testprotokoll Sponsoring-Anfrage FC Presheva

Getestet am 23.11.2026 · Chromium (Browser-Fenster in der Claude-App) und curl · 320 px, 375 px und Desktop

Server: `php -S localhost:8000` (mit pdo_sqlite und mbstring)

## Formular im Browser

| Nr | Testfall | Erwartet | Status |
|----|----------|----------|--------|
| 1 | alles leer absenden | 5 Fehler als Liste unter dem Button, 5 Felder rot, kein Request | OK |
| 2 | E-Mail `lea@` | Browser meldet E-Mail, kein Request | OK |
| 3 | E-Mail `a@b` | Browser lässt durch, PHP lehnt ab (422), E-Mail rot | OK |
| 4 | Betrag `1.5` | Fehler beim Betrag, kein Request | OK |
| 5 | Datenschutz nicht angehakt | Datenschutz-Zeile rot, kein Request | OK |
| 6 | markiertes Feld korrigieren | rot verschwindet sofort | OK (nach Fix) |
| 7 | gültige Anfrage | grüne Meldung direkt unter dem Button und im Bild, Formular leer, Button zeigt kurz „Wird gesendet ...“ und ist gesperrt | OK |
| 8 | nur Tastatur (Tab, Pfeiltasten, Leertaste, Enter) | bis zur grünen Meldung, Fokus immer sichtbar | OK |

## Direkt an PHP mit curl (Browser-Prüfung umgangen)

| Nr | Testfall | Erwartet | Status |
|----|----------|----------|--------|
| 9 | alles leer | 422, 5 Fehler | OK |
| 10 | `email=a@b` | 422, „Bitte gib eine gültige E-Mail-Adresse ein.“ | OK |
| 11 | `branche=xyz` | 422, „Bitte wähle eine Branche.“ | OK |
| 12 | `paket_id=99` und `paket_id=abc` | 422, „Dieses Paket kennen wir nicht.“ | OK |
| 13 | `betrag=-5` und `betrag=1.5` | 422, Fehler beim Betrag | OK |
| 14 | ohne `datenschutz` | 422, Fehler beim Datenschutz | OK |
| 15 | Firmenname 101 × „ä“ | 422, höchstens 100 Zeichen | OK |
| 16 | Firmenname 100 × „ä“ (200 Bytes) | 201, wird gespeichert | OK |
| 17 | Zeilen in `anfragen` vor und nach den Fehlversuchen | Anzahl gleich | OK (0 vorher, 0 nachher) |

Beispiel:

```
curl -X POST -F firmenname=Test -F ansprechperson=Lea -F email=lea@example.ch -F branche=it -F datenschutz=1 -F paket_id=99 localhost:8000/anfrage.php
sqlite3 anfragen.db "SELECT COUNT(*) FROM anfragen;"
```

## Umlaute und Sonderzeichen

| Nr | Testfall | Erwartet | Status |
|----|----------|----------|--------|
| 18 | `Müller-Lüdenscheidt` / `Zoë` | genau so in der DB, `length()` = 19 / 3 | OK |
| 19 | `Çelik GmbH` / `Ayşe` | genau so in der DB, `length()` = 10 / 4 | OK |
| 20 | `<b>fett</b>` / `O'Brien` | als Text gespeichert und angezeigt, Apostroph kein Problem | OK |
| 21 | E-Mail `jörg@bärn.ch` | Browser und PHP lehnen ab (bekannte Grenze) | OK |
| 22 | JSON-Antwort | „ä“ statt `ä` | OK |

```
sqlite3 anfragen.db "SELECT firmenname, ansprechperson, length(firmenname) FROM anfragen ORDER BY id DESC LIMIT 3;"
```

## Handy

| Nr | Testfall | Erwartet | Status |
|----|----------|----------|--------|
| 23 | 375 px, ganz unten leer absenden | Fehlerliste unter dem Button ist im Bild, Felder rot | OK |
| 24 | 320 px | kein seitliches Scrollen | OK |
| 25 | 375 px, Paket über die Liste wählen | passende Karte wird hervorgehoben, Betrag wird eingetragen | OK |
| 26 | Paket über die Karte wählen | Liste zeigt das gleiche Paket | OK |
| 27 | Schrift in Feldern | 16 px (kein Zoom auf dem iPhone) | OK |

## Gefundene Fehler

- Test 1: Es kam nur ein Satz, die Datenschutz-Checkbox war nicht markiert und auf dem Handy lag die Meldung ausserhalb vom Bildschirm.
  Fix: `zeigeFehler()` baut eine Liste, `markiere()` markiert bei der Checkbox die ganze Zeile `.check`, `scrollIntoView()` holt die Meldung ins Bild. Nochmals getestet: OK
- Test 6: Nach dem Korrigieren blieb das Feld rot, bis man nochmals absendet.
  Fix: `input`-Listener im Formular entfernt `aria-invalid` beim Tippen. Danach Tests 1 bis 8 wiederholt (Regressionstest): OK
- Test 15/16: PHP hat die Länge nicht geprüft. Fix: `mb_strlen()` statt `strlen()` (sonst gilt „ä“ als 2 Zeichen). Nochmals getestet: OK
- Test 22: JSON hat Umlaute als `ä` geschickt. Fix: `JSON_UNESCAPED_UNICODE` und `charset=utf-8` im Header. Nochmals getestet: OK

## Hinweise

- curl unter Windows schickt Umlaute aus der Kommandozeile nicht als UTF-8. Für Umlaut-Tests mit curl den Wert aus einer UTF-8-Datei lesen (`-F "firmenname=<datei.txt"`) oder im Browser testen.
- Kontrast grauer Hinweistext `#6b6b6b` auf Weiss: 5,3 : 1 (mindestens 4,5 : 1).
- Für später: Daten bei der Ausgabe in HTML mit `htmlspecialchars()` absichern.
