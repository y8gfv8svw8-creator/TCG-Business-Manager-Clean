# PHASE 5 – Sammlungsankauf und Max-EK

Eine Sammlungsanalyse ist zunächst nur eine Händleranalyse. Erst eine ausdrücklich
bestätigte Übernahme erzeugt einen normalen Einkauf; Bestand entsteht weiterhin
erst durch den bestehenden Wareneingang.

## Datenquellen und Grenzen

- Printpreise werden ausschließlich über konkrete Cardmarket-Produkt-IDs oder
  offen ausgewiesene plausible Print-Kandidaten zugeordnet.
- Der Cardmarket Price Guide ist ein gespeicherter Referenzwert und kein
  Live-Angebotsmarkt.
- Eigene Verkaufsdaten verändern Faktoren erst ab belastbarer Datenbasis stark.
- Marktanstiege erzeugen keinen FOMO-Aufschlag.
- Unbekannte Prints und Zustände bleiben als Unsicherheit sichtbar.

## Führende Daten

`app_state.collectionPurchaseAnalyses` ist die führende Quelle. Die Tabellen
`collection_purchase_analyses`, `collection_purchase_items` und
`collection_purchase_decision_snapshots` materialisieren diesen Stand für
Abfragen und spätere Auswertungen. `trade_orders` entstehen erst nach der
ausdrücklichen Ankaufbestätigung.

## Vorbereitung für eine spätere, getrennt freizugebende Fotophase

PHASE 5 implementiert keine Foto- oder Bilderkennung. Für einen späteren
Proof-of-Concept bleiben folgende Anforderungen dokumentiert: mehrere Fotos je
Sammlung, Foto-ID, Bildnummer, Bounding Box, Reihe/Spalte, Kartenname-Kandidat,
Print-Kandidaten, Confidence, wirtschaftliche Relevanz, manuelle Korrektur,
Dublettenerkennung und Detailfoto-Liste.
