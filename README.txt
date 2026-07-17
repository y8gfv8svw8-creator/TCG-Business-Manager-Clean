TCG BUSINESS MANAGER 4.5.0

Start
1. ZIP vollständig entpacken.
2. index.html in Chrome oder Edge öffnen.
3. Unter Importe das vorhandene JSON-Backup einlesen.

NEU IN 4.1.0 – VERSANDARBEITSPLATZ
- Offene Bestellungen werden direkt über den Verkäufen als Pack-Warteschlange angezeigt.
- Arbeitsstufen: Offen/Bezahlt → Kommissioniert → Verpackt → Versendet → Abgeschlossen.
- Jede Bestellung besitzt einen Packmodus mit Karten-, Adress-, Porto- und Materialprüfung.
- Versandmaterial wird erst beim Speichern der Packdaten verbindlich ausgebucht.
- Eine Versandvorlage verändert den Bestand nicht mehr vorzeitig.
- Negative Materialbestände werden blockiert.
- Doppelte Materialzeilen einer Bestellung werden beim Speichern zusammengeführt.
- Porto, Materialkosten und Bestellgewinn werden während der Eingabe aktualisiert.
- „Speichern & versendet“ verlangt die Bestätigung von Karten/Versionen und Empfänger/Versandart.

PRAXISTEST
Die Version ist für den Test mit den offenen Cardmarket-Bestellungen gedacht. Öffne im Versandarbeitsplatz jede Bestellung, trage das tatsächlich verwendete Material und Porto ein und schließe sie über „Speichern & versendet“ ab.

Datenschutz
Alle Daten bleiben lokal im Browser. Regelmäßig ein JSON-Backup exportieren.


VERSION 4.5.0 – KONSERVATIVE KALKULATION & SETDATEN
------------------------------------------------
1. Im Menü „Cardmarket-Datencenter“ zuerst products_singles_3.json importieren.
2. Danach price_guide_3.json importieren.
3. In der Kaufanalyse erscheint ein Hinweis, solange deutsche Kartendaten noch nicht geladen sind.
4. „Deutsche Namen jetzt laden“ verbindet deutsche und englische Kartennamen und speichert sie lokal.
5. Der Score wird nur aus vorhandenen Daten berechnet. Fehlende Historie sowie fehlende Set-/Seltenheitsdaten begrenzen die Bewertung.
6. Δ 1/7/30 sind echte Unterschiede zwischen gespeicherten Preisständen. Der erste Import kann deshalb noch keinen Verlauf zeigen.
7. Set und Seltenheit werden nur angezeigt, wenn die Druckvariante eindeutig zugeordnet werden kann.
8. Große Cardmarket-Daten liegen in IndexedDB; Bestand, Käufe und Verkäufe bleiben im bisherigen lokalen Warenwirtschafts-Stand.
9. Über „Cardmarket-Daten sichern“ kann die komplette Produkt- und Preishistorie separat exportiert werden.


VERSION 4.5.0 – WICHTIGE ÄNDERUNGEN
- Negative Nettoerlöse werden nicht mehr auf 0 gekappt.
- Verlust, ROI und Marge berücksichtigen Gebühren und Verpackung vollständig.
- Nicht kostendeckende Karten werden eindeutig markiert.
- Max-EK-Grenzen werden immer auf volle Cent abgerundet.
- Nicht kostendeckende Karten erhalten Score 0; Verlustgeschäfte höchstens Score 5.
- Die Set-/Seltenheitszuordnung nutzt eine vorsichtige Expansion-ID-Mehrheitsanalyse.
- Nach dem Update einmal „Deutsche Kartendaten aktualisieren“ anklicken.
