LOKALE PRINT-REFERENZ
====================

Datei: print-reference.sqlite
Referenzschema: 2 (separat vom Manager-Schema 12)

Quellen:
- YGOPRODeck Card Information API v7, Englisch und Deutsch
  Datenbankrevision 147.07, Stand 2026-09-23 00:02:22
- vorhandener Cardmarket-Produktkatalog products_singles_3.json

Enthalten:
- 14.572 Metakarten
- 44.545 Print-Datensätze
- 37.172 kartenspezifische Setpositionen
- 215 eindeutig zugeordnete Cardmarket-Produkt-IDs
- 43.893 wahrscheinliche Metakarten-Zuordnungen ohne behauptete Produkt-ID
- 437 vollständig ungelöste Zuordnungen

Wichtig:
Die Cardmarket-Produktdatei enthält keine Setnamen oder Raritäten. Eine konkrete
Produkt-ID wird deshalb ausschließlich gespeichert, wenn Kartenname, Metakarte
und der einzige vorhandene Print eindeutig zusammenpassen. Bei mehreren
Cardmarket-Produkten bleibt die Produkt-ID leer; ihre Reihenfolge wird nicht als
Printbeweis verwendet.

Setcodes werden zuerst als vollständiger Code geprüft. Nur wenn kein exakter
Vollcode existiert, folgen bekannte historische Sprach-/Legacy-Aliase und zuletzt
Setpräfix plus Collector Number als vorsichtiger Fallback. Dadurch werden
PSV-093, PSV-E093 und PSV-EN093 nicht mehr gleichwertig behandelt.

Rarität und Treatment/Variante sind getrennte Felder. Treatment wird nur aus
einem ausdrücklich vorhandenen Quellfeld übernommen; andernfalls bleibt es
"unknown". Der verwendete YGOPRODeck-Snapshot enthält derzeit keine separaten
Treatment-Felder, deshalb bleiben alle 44.545 Treatments unbekannt. Es wird
weder "normal" noch "overframe" aus Rarität, Bild oder Produktreihenfolge geraten.
