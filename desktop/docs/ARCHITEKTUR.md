# Architektur

- `app/main`: sicherer Electron-Hauptprozess und Preload-Brücke
- `app/renderer`: bestehende Benutzeroberfläche
- `database`: versioniertes SQLite-Schema
- `resources`: Test- und Importdaten
- Benutzerdateien: außerhalb des Programmordners unter Dokumente/TCG Business Manager

SQLite ist die dauerhafte Datenbasis. Neben dem vollständigen Programmstand enthält
Schema v5 eine append-only Änderungshistorie, normalisierte Handelszeilen,
quellengetrennte Marktbeobachtungen und berechnete EK-/VK-Empfehlungen.

Die spätere Cardmarket-API wird als zusätzliche Datenquelle angebunden. Externe
IDs bleiben dabei erhalten; Zugangsdaten gehören in einen sicheren Credential-
Provider und ausdrücklich nicht in die SQLite-Datenbank.
