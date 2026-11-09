-- Tabelle für die Sponsoring-Anfragen
CREATE TABLE IF NOT EXISTS anfragen (
    id              INTEGER PRIMARY KEY AUTOINCREMENT, -- Primärschlüssel, zählt automatisch hoch
    firmenname      TEXT    NOT NULL,                  -- Pflichtfeld
    ansprechperson  TEXT    NOT NULL,                  -- Pflichtfeld
    email           TEXT    NOT NULL,                  -- Pflichtfeld
    branche         TEXT    NOT NULL,                  -- Pflichtfeld
    nachricht       TEXT,                              -- freiwillig
    betrag          INTEGER,                           -- in CHF, freiwillig
    datenschutz     INTEGER NOT NULL,                  -- 1 = akzeptiert
    erstellt_am     TEXT    DEFAULT CURRENT_TIMESTAMP  -- Datum/Zeit der Anfrage
);