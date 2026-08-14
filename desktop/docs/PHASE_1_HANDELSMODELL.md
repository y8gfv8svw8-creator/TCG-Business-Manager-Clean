# Phase 1: Handels-, Kapital- und Preisdatenmodell

## Umfang

Phase 1 ergänzt das bestehende Programm ohne Dashboard-Umbau und ohne neue
Lageralter-Automatik. Enthalten sind Schema 9, sichere Migration, Kapitaljournal,
Inseratspreis-Verlauf, eindeutiger EK-Status, Halteprofil-Grunddaten,
Mindestgewinn und eine kleine Bedienoberfläche in Bestand und Einstellungen.

## Führende Quelle, Ableitung und Cache

| Fachwert | Führende Quelle | Normalisierte Sicht / Ableitung | Cache |
|---|---|---|---|
| Kartenexemplar, Status, Druckdaten | `app_state.inventory` / `privateCollection` | `inventory_assets` | Renderer-Arbeitskopie |
| Vollständiger EK und EK-Status | Kartenexemplar im `app_state` bzw. Wareneingangsaufteilung | `inventory_assets.acquisition_cost(_status)` | keine eigene Wahrheit |
| Einkaufs-Kartenpreis, Versand- und Zusatzkostenanteil | Einkauf und Wareneingangsposition im `app_state` | `purchase_receipt_lines` und `trade_lines` | keine |
| Tatsächlicher VK, Gebühren, Porto, Material, Erstattung | Verkauf im `app_state` | `trade_orders` und `trade_lines` | keine |
| Aktueller Inseratspreis, ursprüngliches Ziel, Halteprofil | Kartenexemplar im `app_state` | Spalten in `inventory_assets` | keine |
| Inseratspreis-Verlauf | `item.listingHistory` im `app_state` | `inventory_listing_history` | keine |
| Kapital-Konten und Buchungen | `app_state.capitalAccounts` / `capitalEntries` | `capital_accounts` / `capital_ledger_entries` | keine |
| Marktpreise | SQLite-Markttabellen je Quelle und Datum | Marktbeobachtungen und Preisempfehlungen | IndexedDB nur für schnelle Anzeige |
| Gewinn, Marge und ROI | aus realisiertem Nettoerlös und bekanntem EK abgeleitet | Abfrage-/UI-Ergebnis | nicht dauerhaft als konkurrierender Wert gespeichert |

Alle normalisierten App-State-Tabellen werden beim Speichern innerhalb derselben
SQLite-Transaktion aktualisiert. Ein fehlgeschlagener Schreibvorgang ändert
weder `app_state` noch die materialisierten Handelsdaten.

## Kapitalmodell ohne Doppelzählung

Kontenarten: Cardmarket-Guthaben, Bank, Kasse und Sonstiges. Der Kontostand ist
immer die Summe der nicht archivierten Journalbuchungen. Es gibt keinen
fest einprogrammierten Startbetrag. Der Nutzer legt pro Konto Startstand und
Stichtag selbst fest.

Eine Umbuchung besteht aus zwei verbundenen Einträgen mit gleicher
`transfer_id`: Abgang auf dem Quellkonto und Zugang auf dem Zielkonto. Dadurch
ändert eine Umbuchung das gesamte liquide Handelskapital nicht.

Bestehende Einkäufe und Verkäufe werden in Phase 1 nicht rückwirkend automatisch
in das Kapitaljournal gebucht. Das verhindert Doppelzählungen mit bereits
manuell gepflegten Zahlungsständen. Kapitalbuchungen sind bewusst und getrennt
von den fachlichen Einkaufs-/Verkaufsdatensätzen anzulegen.

Die Kennzahlen sind getrennt:

- liquides Handelskapital: Summe des Kapitaljournals,
- Bestand zum EK: Summe der bekannten vollständigen Einstandspreise,
- aktueller Inseratswert: Summe der aktuellen eigenen Inseratspreise,
- Handelsvermögen zum EK: liquides Kapital plus Bestand zum bekannten EK,
- realisierter Gewinn: abgeschlossene Verkäufe abzüglich Erstattungen,
  Gebühren, Porto, Material und bekanntem Wareneinsatz.

Price Guide und Inseratswert werden nicht als liquides Kapital oder realisierter
Gewinn gezählt.

## EK, VK, Marge und unbekannte Werte

`costStatus` unterscheidet:

- `known`: EK ist bekannt und kann größer als 0 sein,
- `confirmed_zero`: 0 € ist fachlich bestätigt,
- `unknown`: EK fehlt; Gewinn und ROI sind deshalb unbekannt.

Ein unbekannter EK wird nie als 0 € Gewinnbasis verwendet. Der vollständige EK
eines Wareneingangs besteht aus Kartenpreis plus zugeteiltem Einkaufsversand und
Zusatzkosten. Ein realisierter Nettoerlös besteht aus Karten-VK plus bezahltem
Versand minus Erstattungen, Gebühren, tatsächlichem Porto und Material.

Der maximale EK wird durch beide Regeln begrenzt: eingestellter Mindestgewinn in
Euro und Mindest-ROI in Prozent. Der VK wird dadurch nicht künstlich über den
Marktpreis angehoben.

## Spätere Entscheidungs-/Grenzkosten (nicht Teil des Phase-3-Referenzfixes)

Für eine spätere Einkaufsentscheidung soll zwischen Kartenpreis, vollständigem
Vollkosten-EK und reinen Entscheidungs-/Grenzkosten unterschieden werden. Das
kann insbesondere bei günstigen Warenkorbfüllern helfen. Der vollständige EK
bleibt dabei unverändert die verbindliche Grundlage für Bestand, realisierten
Gewinn und ROI. Ein späterer Entscheidungswert darf ihn weder überschreiben noch
rückwirkend verändern. In diesem Referenzpreis-Fix wird noch kein solcher Wert
berechnet oder gespeichert.

## Inseratspreis-Verlauf und Halteprofil

Gespeichert werden ursprüngliches VK-Ziel, Erstinserat, aktueller Preis,
Zeitpunkt, alter und neuer Wert, manuell/empfohlen/importiert sowie ein Grund.
Ein Vorschlag ändert den Preis nie automatisch; erst die Bestätigung des Nutzers
schreibt Preis und Verlauf.

`holdingProfile` und `longTermHold` sind in Phase 1 reine Grunddaten. Sie lösen
noch keine Lageralter-Warnung oder automatische Preisänderung aus.

## Sichere Migration

Vor dem Wechsel auf Schema 9 erstellt der Manager eine vollständige
SQLite-Migrationssicherung. Die Migration ergänzt Felder konservativ:

- positiver vorhandener EK wird `known`,
- ein belegter Einkauf mit 0 € wird `confirmed_zero`,
- sonst bleibt 0 € `unknown`,
- ein vorhandener Inseratspreis erhält einen `baseline`-Verlaufseintrag,
- bestehende IDs, Druckvarianten, Verkäufe und Reservierungen bleiben erhalten.

## Spätere Sammlungs-/Fotoanalyse (nicht Phase 1)

Vor einer Vollumsetzung ist ein kleiner Proof of Concept vorgesehen. Das spätere
Modell soll Sammlungs-/Foto-ID, Bild, Kartenrahmen, Zeile/Spalte, Kandidaten,
Erkennungssicherheit, wirtschaftliche Relevanz und manuelle Korrektur speichern.
Die Oberfläche muss Bild und erkannte Liste in beide Richtungen verbinden,
Mehrfachexemplare sichtbar machen und in der Kartendetailansicht alle Fundfotos
anzeigen. In Phase 1 werden weder Bilder noch Erkennungsergebnisse gespeichert.
