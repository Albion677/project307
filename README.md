# project307

Sponsoring-Seite FC Presheva (Modul 307).

## Starten

```
sqlite3 anfragen.db < schema.sql
php -S localhost:8000
```

PHP braucht die Erweiterungen `pdo_sqlite` und `mbstring`. Ohne php.ini so starten:

```
php -d extension_dir="<PHP-Ordner>/ext" -d extension=pdo_sqlite -d extension=mbstring -S localhost:8000
```

Danach http://localhost:8000 öffnen (nicht Live Server, der kann kein PHP).
