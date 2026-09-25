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
- 20.453 eindeutig zugeordnete Cardmarket-Produkt-IDs
- 24.043 wahrscheinliche Metakarten-Zuordnungen ohne behauptete Produkt-ID
- 49 vollständig ungelöste Zuordnungen

Wichtig:
Die Cardmarket-Produktdatei enthält keine Setnamen oder Raritäten. Eine konkrete
Produkt-ID wird deshalb ausschließlich gespeichert, wenn Kartenname/Metakarte
eindeutig sind und entweder nur ein einziger Gesamtprint existiert oder folgende
vollständige Beweiskette gilt: Die Metakarten-Menge eines Setpräfixes entspricht
exakt der Metakarten-Menge genau einer Cardmarket-Expansion, diese Signatur ist
auf beiden Seiten einmalig, und für die konkrete Metakarte gibt es dort genau
einen Referenzprint sowie genau ein Cardmarket-Produkt. 373 Expansionen erfüllen
diese vollständige, beidseitig eindeutige Signaturregel. Bei mehreren Prints
oder Produkten bleibt die Zuordnung likely. Produktnummernfolgen werden nicht
als Printbeweis verwendet.

Zusätzlich wurden 3.010 Prints aus 33 Setpräfixen über eine konservative
Kontextregel eindeutig zugeordnet: Die bereits bekannten Metakarten passen
exakt zu genau einer Expansion, sämtliche bislang fehlenden Metakarten lassen
sich dort über normalisierte englische Namen vollständig und 1:1 den übrigen
Cardmarket-Metakarten zuordnen, keine zweite Referenz beansprucht dieselbe
Expansion, und für den konkreten Print existieren genau ein Referenzprint und
genau ein Cardmarket-Produkt. Eindeutig verdoppelte Anführungszeichen im
Cardmarket-Export werden dabei normalisiert. Datum, Ähnlichkeitswerte,
Produktreihenfolge, Raritätsraten und vermutete Treatments werden nicht als
Beweis verwendet.

Von den zuvor 437 vollständig ungelösten Prints wurden zunächst ausschließlich
die 340 im Audit eindeutig belegten Fälle aufgelöst: 125 über die vollständige
1:1-Zuordnung der in einer Expansion verbleibenden Metakarten, 102 über eine
beidseitig eindeutige kompakte Zeichen-/Abstandsnormalisierung und 113 über
einen eindeutigen "(Skill)"-Namenszusatz bei ausschließlich in Speed-Duel-Sets
vorkommenden Karten.

Aus den anschliessend auditierten 97 Restfaellen wurden weitere exakt 48 lokal
belegte Prints aufgeloest: 29 eindeutige Symbol-, Tippfehler- oder
Grammatikabweichungen, 3 historische Muko-/Null-and-Void-Faelle, 4 ueber den
Expansionskontext eindeutig getrennte gleichnamige Metakarten und 12 eindeutige
Skill-/Speed-Duel-Faelle. Ueber beide Auditstufen konnten damit 97 Prints genau
einem Cardmarket-Produkt zugeordnet werden; 291 bleiben ohne behauptete
Produkt-ID likely. Die verbleibenden 49 Prints bleiben unveraendert unresolved,
darunter ausdruecklich SBCB-ENS08 "Spell of Mask (Skill Card)".

Setcodes werden zuerst als vollständiger Code geprüft. Nur wenn kein exakter
Vollcode existiert, folgen bekannte historische Sprach-/Legacy-Aliase und zuletzt
Setpräfix plus Collector Number als vorsichtiger Fallback. Dadurch werden
PSV-093, PSV-E093 und PSV-EN093 nicht mehr gleichwertig behandelt.

Rarität und Treatment/Variante sind getrennte Felder. Treatment wird nur aus
einem ausdrücklich vorhandenen Quellfeld übernommen; andernfalls bleibt es
"unknown". Der verwendete YGOPRODeck-Snapshot enthält derzeit keine separaten
Treatment-Felder, deshalb bleiben alle 44.545 Treatments unbekannt. Es wird
weder "normal" noch "overframe" aus Rarität, Bild oder Produktreihenfolge geraten.

Bekannte Setcode-/Raritäts-Kollisionen
--------------------------------------
Diese neun Gruppen bleiben bei einer reinen Suche nach Setcode plus Rarität
mehrdeutig und müssen zusätzlich über die Kartenidentität unterschieden werden:

- BLCR-EN012 / Secret Rare: Advanced Crystal Beast Emerald Tortoise; Advanced Crystal Beast Topaz Tiger
- BLCR-EN013 / Secret Rare: Advanced Crystal Beast Emerald Tortoise; Advanced Crystal Beast Topaz Tiger
- BLCR-EN015 / Secret Rare: Advanced Crystal Beast Cobalt Eagle; Advanced Crystal Beast Sapphire Pegasus
- BLCR-EN016 / Secret Rare: Advanced Crystal Beast Cobalt Eagle; Advanced Crystal Beast Sapphire Pegasus
- LDS3-EN063 / Common: Gimmick Puppet Bisque Doll; Number 15: Gimmick Puppet Giant Grinder
- SBCB-ENS08 / Common: Spell of Mask; Spell of Mask (Skill Card)
- SGX3-ENA11 / Common: Dark Ruler Ha Des; Dark Fusion
- SGX3-ENE10 / Common: D.D. Crow; Mist Archfiend
- SGX3-ENI25 / Common: Elemental HERO Shining Flare Wingman; Terrorking Salmon
