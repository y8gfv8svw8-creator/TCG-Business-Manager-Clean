# Architektur

- `app/main`: sicherer Electron-Hauptprozess und Preload-Brücke
- `app/renderer`: bestehende Benutzeroberfläche
- `database`: versioniertes SQLite-Schema
- `resources`: Test- und Importdaten
- Benutzerdateien: außerhalb des Programmordners unter Dokumente/TCG Business Manager

SQLite ist die dauerhafte Datenbasis. `app_state.state_json` ist die führende
Quelle für bearbeitbare App-Daten. Die normalisierten Tabellen werden beim
Speichern in derselben Transaktion daraus materialisiert und sind abfragbare
Projektionen, keine zweite konkurrierende Wahrheit. Neben dem vollständigen
Programmstand enthält das aktuelle Schema eine append-only Änderungshistorie,
normalisierte Handelszeilen, quellengetrennte Marktbeobachtungen, ein
Kapitaljournal, einen Inseratspreis-Verlauf und berechnete EK-/VK-Empfehlungen.

Schema 12 ergänzt die Sammlungsanalyse um ein Evidenzmodell. Bilddateien liegen
nicht als BLOB oder Base64 in `app_state`, sondern in einem verwalteten Ordner
unter `Daten/Sammlungsfotos`. SQLite speichert nur Metadaten, normalisierte
Bounding Boxes, getrennte Namens-/Print-Kandidaten und bewusst gesetzte Links
zu physischen Karten. Einzelheiten stehen in
`docs/SAMMLUNGSFOTOS_EVIDENZMODELL_6.10.0.md`.

Der Renderer hält während der Laufzeit eine Arbeitskopie. `localStorage` und
IndexedDB sind ausschließlich Oberflächen-Caches. Beim Desktop-Start gewinnt
immer der in SQLite gespeicherte Stand. Ein Cache darf weder Nutzerdaten noch
Felder in `app_state` überschreiben.

Die spätere Cardmarket-API wird als zusätzliche Datenquelle angebunden. Externe
IDs bleiben dabei erhalten; Zugangsdaten gehören in einen sicheren Credential-
Provider und ausdrücklich nicht in die SQLite-Datenbank.
