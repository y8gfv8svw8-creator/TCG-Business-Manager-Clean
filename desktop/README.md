# TCG Business Manager – Analysecenter 5.2.0

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

Dateiimporte werden grundsätzlich zuerst als Vorschau angezeigt. Auch der überwachte Importordner speichert neue Dateien erst nach einer Bestätigung. Dadurch können Einkäufe und Verkäufe vor dem Einlesen kontrolliert und Duplikate abgefangen werden.

Cardmarket-Abrechnungen können als CSV über den Universal-Import eingelesen werden. Bestellnummer und Betrag werden mit den erwarteten Nettoauszahlungen verglichen und dauerhaft in SQLite gespeichert. Die vorbereitete Cardmarket-API kann später dieselbe Datenstruktur verwenden.


## Wichtige Funktionen

- Historische Preisabfragen lesen direkt aus SQLite.
- Marktübersicht mit echten 7-/30-/90-/180-/365-Tage-Vergleichen.
- Top-Anstiege und Top-Rückgänge mit absoluter und prozentualer Veränderung.
- Cardmarket-Sicherungen werden beim Wiederherstellen auch in SQLite übernommen.
- „Cardmarket-Daten löschen“ entfernt nun ebenfalls die SQLite-Marktdaten.
- Tagesstand-Zusammenfassungen bereiten spätere Datenqualitäts- und Liquiditätsanalysen vor.
- Datenqualität, Preiswarnungen, automatische Ablaufprüfung und Sicherungsstatus.
- Kartengenaue Berichte nach Karte, Set, Verkäufer, Kunde und Lageralter.
