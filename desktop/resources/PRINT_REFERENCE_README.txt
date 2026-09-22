LOKALE PRINT-REFERENZ
====================

Datei: print-reference.sqlite
Referenzschema: 1 (separat vom Manager-Schema 12)

Quellen:
- YGOPRODeck Card Information API v7, Englisch und Deutsch
  Datenbankrevision 147.04, Stand 2026-09-16 00:05:12
- vorhandener Cardmarket-Produktkatalog products_singles_3.json

Enthalten:
- 14.567 Metakarten
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

Setcodes werden über Setpräfix und Collector Number gesucht. Sprachkennungen wie
DE/EN beziehungsweise historische G/E-Kennungen gehören nicht zum einzigen
Positionsschlüssel. Mehrere Raritäten derselben Setposition bleiben getrennte
Print-Kandidaten.
