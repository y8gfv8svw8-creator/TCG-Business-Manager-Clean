# Architektur

- `app/main`: sicherer Electron-Hauptprozess und Preload-Brücke
- `app/renderer`: bestehende Benutzeroberfläche
- `database`: versioniertes SQLite-Schema
- `resources`: Test- und Importdaten
- Benutzerdateien: außerhalb des Programmordners unter Dokumente/TCG Business Manager

Nächster technischer Meilenstein: kontrollierte SQLite-Anbindung mit Migration aus dem bisherigen Browser-Backup.
