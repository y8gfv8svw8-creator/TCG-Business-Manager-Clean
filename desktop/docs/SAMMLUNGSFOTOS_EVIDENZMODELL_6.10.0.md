# Sammlungsfotos und Evidenzmodell – Version 6.10.0

## Zweck und klare Grenze

Dieser Entwicklungsblock speichert Sammlungsfotos als prüfbare Belege und
ermöglicht die manuelle Markierung sichtbarer Karten. Er führt **keine**
automatische Mehrkartenerkennung, keine automatische Binder-Segmentierung,
keine KI-Bewertung und keine automatische Kauf- oder Bestandsbuchung aus.

Ein Foto ist ein Beleg. Eine Kartenbeobachtung ist eine unsichere Aussage zu
einem Bildbereich. Erst eine bewusst gepflegte Kartenposition bleibt die
wirtschaftliche Berechnungsgrundlage der Sammlungsanalyse.

## Datenmodell

- `collection_purchase_photos`: Metadaten eines verwalteten Bildes, Reihenfolge,
  optionale Binder-Seite, relativer Pfad, Typ, Größe, Abmessungen und SHA-256.
- `collection_card_observations`: normalisierte Bounding Box, optionale
  Binder-Reihe/-Spalte, getrennte Kandidaten und Confidence für Kartenname und
  Print, Erkennungssignale, wirtschaftliche Relevanz, Detailfoto- und
  Prüfstatus.
- `collection_physical_cards`: manuell angelegte physische Exemplare. Mehrere
  Beobachtungen dürfen auf dasselbe Exemplar zeigen. Zwei gleiche Prints können
  trotzdem zwei verschiedene physische Exemplare bleiben.

`app_state` bleibt führend. Die drei Tabellen werden zusammen mit den bisherigen
Sammlungsankaufstabellen in derselben SQLite-Transaktion materialisiert.

## Bedeutung von Unsicherheit

Kartenname und Print sind zwei getrennte Prüfschritte. Beide besitzen eigene
Kandidatenlisten und eine eigene Confidence. Ein Kartenname kann sicher erkannt
sein, während der Print unbekannt bleibt. Ein gelesener Setcode wird nur als
Signal gespeichert. Ohne bewusst ausgewählte Cardmarket-Produkt-ID kann ein
Print nicht auf „bestätigt“ gesetzt werden.

Die Stufen sind `unknown`, `low`, `medium`, `high` und `confirmed`. Unbekannte
Werte bleiben unbekannt; das System erzeugt keine scheinpräzise Sicherheit.

## Physische Karten und Duplikate

Die Verknüpfung zu einer physischen Karte ist ausschließlich manuell:

1. Für eine Beobachtung wird ein physisches Exemplar angelegt oder ein bereits
   angelegtes ausgewählt.
2. Beobachtungen auf weiteren Fotos können auf dasselbe Exemplar verweisen.
3. Eine wirtschaftliche Kartenposition kann zusätzlich bewusst mit dem
   physischen Exemplar verknüpft werden.

Bildhash, gleicher Print oder ähnlicher Bildausschnitt gelten nicht als Beweis
für dieselbe physische Karte. Es gibt keine versteckte Zusammenführung.
Beobachtungen erhöhen nie selbstständig Menge, Wert, Max-EK oder Bestand.

## Bildspeicher und Sicherheit

Normale Installation:

`Dokumente/TCG Business Manager/Daten/Sammlungsfotos`

Gespeichert werden nur JPEG, PNG und WebP bis 15 MB. Dateityp und Bildinhalt
werden gegengeprüft, Abmessungen begrenzt, Dateinamen intern zufällig erzeugt
und SHA-256 gespeichert. In App-Daten liegen nur stabile relative Pfade. Absolute
Pfade und Pfadwechsel aus dem verwalteten Ordner werden abgewiesen.

Das Schreiben erfolgt über eine temporäre Datei mit anschließendem Umbenennen.
Das Anlegen wird bei fehlgeschlagener SQLite-Speicherung zurückgerollt. Beim
Löschen wird die Datei zuerst gestuft verschoben, anschließend der App-Zustand
gespeichert und erst danach endgültig entfernt. So entstehen weder absichtlich
verwaiste Bilder noch kaputte Referenzen.

## Sicherung und Wiederherstellung

- Die normale tägliche JSON-Sicherung wird am aktuellen Tag atomar aktualisiert.
- Zugehörige Bilder werden in einem datierten Anlagenordner unter
  `Backups/Automatisch` gesichert und besitzen ein Manifest.
- Die manuelle Vollsicherung verwendet das Format
  `tcg-business-manager-backup-v2` und enthält Zustand plus gehashte Anlagen.
- Bei der Wiederherstellung werden Pfad, Typ, Größe und Hash jedes Bildes vor
  dem Speichern geprüft. Schlägt danach die SQLite-Speicherung fehl, werden neu
  angelegte Bilddateien wieder entfernt.
- Die Schema-11-auf-12-Migration erstellt vorab die vorhandene SQLite-
  Migrationssicherung. Schema 11 kann noch keine Sammlungsfoto-Referenzen
  enthalten.

## Dokumentierter UI-Smoke-Test

Der automatisierte Oberflächentest `scripts/qa-phase6-electron-smoke.js` nutzt
ausschließlich einen temporären Datenordner und prüft diesen Ablauf:

1. Sammlungsanalyse anlegen.
2. Zwei Fotos speichern und zwischen ihnen wechseln.
3. Drei Bounding Boxes über beide Fotos speichern.
4. Kartenname-Kandidat und Name-Confidence getrennt vom Print speichern.
5. Einen Print ausdrücklich bestätigen; bei einem reinen Setcode-Signal bleibt
   der Print unbekannt.
6. Zwei Beobachtungen mit derselben physischen Karte verbinden.
7. Eine zweite physische Karte desselben Prints separat erhalten.
8. Zustand aus SQLite neu laden und Foto-/Beobachtungs-/Verknüpfungszahlen
   prüfen.
9. Bestätigen, dass weder Einkauf noch Bestand automatisch erzeugt wurden.

## Bewusst nicht umgesetzt

- automatische Mehrkarten- oder Binder-Erkennung
- automatische Perspektivkorrektur und Segmentierung
- automatische Erkennung physischer Duplikate
- ML-/KI-Modelltraining oder externe Bilderkennungsdienste
- automatische Bewertung, Kaufentscheidung oder Bestandsübernahme aus Fotos

Diese Grenzen verhindern, dass schlechte Marktplatzfotos oder unsichere OCR-
Signale als sichere Handelsdaten behandelt werden.
