# Handelsdatenbank und Cardmarket-Quellen

## Was automatisch gespeichert wird

Der vollständige Programmstand bleibt wie bisher in SQLite erhalten. Zusätzlich
speichert Schema v6 bei jedem Speichern in derselben Transaktion:

- Erstellen, Bearbeiten und Löschen von Einkäufen, Verkäufen und Bestandskarten
  als unveränderliche Ereignisse (`business_events`).
- Abfragbare Bestellungen und Kartenpositionen einschließlich Cardmarket-
  Produkt-ID, Artikel-ID, Menge, Sprache, Zustand, Stückpreis, Versandanteil,
  echtem Einstand und Nettoerlös (`trade_orders`, `trade_lines`).
- Entfernte Handelszeilen als archiviert. Ihre vorherigen Inhalte bleiben zudem
  vollständig im Ereignisprotokoll erhalten.
- Price-Guide-Stände und spätere weitere Quellen getrennt voneinander
  (`market_observations`). Mehrere Quellen können dieselbe Produkt-ID am selben
  Tag speichern, ohne sich gegenseitig zu überschreiben.
- Importierte Cardmarket-Abrechnungen und ihre zugeordneten Einzelbuchungen
  (`settlement_imports`, `settlement_entries`). Getrennte Gebühren- und
  Gutschriftzeilen derselben Bestellung werden vor dem Vergleich summiert.

Vor der automatischen Migration wird eine exakte SQLite-Sicherung unter
`Dokumente\TCG Business Manager\Backups\Migrationen` erstellt. Die vorhandenen
Cardmarket-Produkt-IDs, Druckvarianten und Nutzerdaten werden übernommen.

## Automatische Preisempfehlungen

Die Handelsdatenbank berechnet je Cardmarket-Druckvariante:

- den eigenen durchschnittlichen Einstand einschließlich zugeteilter Einkaufs-
  versandkosten und Zusatzkosten,
- den eigenen durchschnittlichen realisierten Verkaufspreis,
- eine Marktpreisreferenz aus den gespeicherten Ständen,
- einen empfohlenen Verkaufspreis,
- einen maximalen Einkaufspreis unter Beachtung von Gebühr, Verpackung,
  Sicherheitsabschlag, Mindestgewinn und Mindest-ROI,
- eine sichtbare Sicherheitseinstufung anhand der verfügbaren Datenmenge.

Die Werte erscheinen unter **Berichte → Handelsdatenbank** und zusätzlich in der
Cardmarket-Suche beziehungsweise Kaufanalyse. Empfehlungen mit wenig eigenen
Verkäufen werden ausdrücklich als niedrig oder mittel sicher markiert.

## Price Guide

Wenn **Marktpreise automatisch** aktiviert ist, lädt die geöffnete Anwendung
höchstens einmal pro Kalendertag die offizielle Yu-Gi-Oh!-Price-Guide-Datei. Der
manuelle Button und der automatische Lauf teilen sich denselben Vorgang, sodass
kein doppelter paralleler Import entstehen kann. Die Anwendung muss dafür geöffnet
sein und eine Internetverbindung haben.

## Spätere Cardmarket-API

`cardmarket_api` ist bereits als deaktivierte Datenquelle angelegt. Der Adapter
kennt die neue Basisadresse `https://apiv2.cardmarket.com/ws/v2.0` und normalisiert
externe Bestell-, Artikel- und Produkt-IDs. Er führt derzeit bewusst keine
Netzwerkabfragen aus.

Wenn ein API-Zugang verfügbar ist, fehlen nur noch:

1. ein sicherer Credential-Provider außerhalb von SQLite,
2. die aktivierte Transport- und Synchronisationsroutine,
3. die Zuordnung der API-Antworten zu `external_entity_links`, `sync_runs` und den
   bestehenden Handelszeilen.

CSV-/HTML-Importe bleiben auch danach nutzbar. Die Quellen werden über externe IDs
dedupliziert und können gemeinsam in die Empfehlungen einfließen.
Abrechnungsdaten aus der API können dieselben Tabellen wie der heutige CSV-Import
verwenden; die `source_id` hält die Herkunft weiterhin eindeutig fest.
