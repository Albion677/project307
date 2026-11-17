-- Tabelle für die Sponsoring-Pakete
CREATE TABLE IF NOT EXISTS pakete (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT    NOT NULL,
    preis   INTEGER NOT NULL                           -- in CHF pro Saison
);

-- Die drei Pakete (OR IGNORE: nicht doppelt einfügen)
INSERT OR IGNORE INTO pakete (id, name, preis) VALUES
    (1, 'Junioren-Partner', 200),
    (2, 'Banden-Partner', 500),
    (3, 'Trikot-Partner', 1000);

-- Tabelle für die Sponsoring-Anfragen
CREATE TABLE IF NOT EXISTS anfragen (
    id              INTEGER PRIMARY KEY AUTOINCREMENT, -- Primärschlüssel, zählt automatisch hoch
    firmenname      TEXT    NOT NULL,                  -- Pflichtfeld
    ansprechperson  TEXT    NOT NULL,                  -- Pflichtfeld
    email           TEXT    NOT NULL,                  -- Pflichtfeld
    branche         TEXT    NOT NULL,                  -- Pflichtfeld
    paket_id        INTEGER,                           -- freiwillig, leer = kein Paket
    nachricht       TEXT,                              -- freiwillig
    betrag          INTEGER,                           -- in CHF, freiwillig
    datenschutz     INTEGER NOT NULL,                  -- 1 = akzeptiert
    erstellt_am     TEXT    DEFAULT CURRENT_TIMESTAMP, -- Datum/Zeit der Anfrage
    FOREIGN KEY (paket_id) REFERENCES pakete(id)       -- Fremdschlüssel auf pakete
);
