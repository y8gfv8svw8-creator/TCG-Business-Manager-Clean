# TCG Business Manager – Market History 5.1.0

Diese Version aktiviert die dauerhafte lokale SQLite-Datenbank.

## Speicherort

Die Daten liegen unabhängig vom Programmordner unter:

`Dokumente\TCG Business Manager\Daten\tcg_business_manager.sqlite`

Automatische Tagesbackups liegen unter:

`Dokumente\TCG Business Manager\Backups\Automatisch`

## Start

1. Einmal `INSTALLIEREN.bat` ausführen.
2. Danach `STARTEN.bat` öffnen.

Beim ersten Start wird der vorhandene lokale Programmstand automatisch in SQLite übernommen. Künftige Änderungen werden weiterhin lokal gespeichert und zusätzlich sofort in SQLite geschrieben. Cardmarket-Produkt- und Preisimporte werden für die spätere Marktanalyse ebenfalls in SQLite abgelegt.


## Neu in 5.1.0

- Historische Preisabfragen lesen direkt aus SQLite.
- Marktübersicht mit echten 7-/30-/90-/180-/365-Tage-Vergleichen.
- Top-Anstiege und Top-Rückgänge mit absoluter und prozentualer Veränderung.
- Cardmarket-Sicherungen werden beim Wiederherstellen auch in SQLite übernommen.
- „Cardmarket-Daten löschen“ entfernt nun ebenfalls die SQLite-Marktdaten.
- Tagesstand-Zusammenfassungen bereiten spätere Datenqualitäts- und Liquiditätsanalysen vor.
