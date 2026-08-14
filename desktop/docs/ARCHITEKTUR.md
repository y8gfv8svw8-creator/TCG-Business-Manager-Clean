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
Programmstand enthält Schema v9 eine append-only Änderungshistorie,
normalisierte Handelszeilen, quellengetrennte Marktbeobachtungen, ein
Kapitaljournal, einen Inseratspreis-Verlauf und berechnete EK-/VK-Empfehlungen.

Der Renderer hält während der Laufzeit eine Arbeitskopie. `localStorage` und
IndexedDB sind ausschließlich Oberflächen-Caches. Beim Desktop-Start gewinnt
immer der in SQLite gespeicherte Stand. Ein Cache darf weder Nutzerdaten noch
Felder in `app_state` überschreiben.

Die spätere Cardmarket-API wird als zusätzliche Datenquelle angebunden. Externe
IDs bleiben dabei erhalten; Zugangsdaten gehören in einen sicheren Credential-
Provider und ausdrücklich nicht in die SQLite-Datenbank.
