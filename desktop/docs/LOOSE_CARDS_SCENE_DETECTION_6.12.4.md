# Loose Cards & Scene Detection Hardening (6.12.4)

## Ziel und Sicherheitsgrenze

Version 6.12.4 ergänzt den geschützten Binder-Pfad um eine konservative Erkennung frei liegender, gedrehter und teilweise überlappender Karten. Das Ergebnis bleibt ausschließlich ein prüfbarer geometrischer Vorschlag. Kartenname, Print, Preis, Kaufentscheidung, Bestand und Verknüpfung einer physischen Karte werden nicht automatisch gesetzt.

Eine komplexe Szene darf bewusst unvollständig erkannt werden. Das ist sicherer als eine große falsche Box, die mehrere physische Karten zusammenfasst.

## Adaptive Pipeline

1. Bildqualität wird wie bisher aus Helligkeit, Kontrast und Kantenschärfe bestimmt.
2. Eine getrennte Szenenanalyse bewertet Rasterstruktur, Größenähnlichkeit, Rotationsverteilung, Überlappung und Orientierungsunordnung.
3. Regelmäßige Raster mit starker axialer Kantenstruktur verwenden den bestehenden Binder-Pfad.
4. Lose oder unklare Szenen verwenden Multi-Scale-Kandidaten, orientierte Komponenten und polygonbasierte Deduplizierung.
5. Große Kandidaten, die mehrere plausible Unterkarten enthalten, werden abgewertet oder verworfen.

Die Szenenklassen `binder_grid`, `loose_cards` und `mixed_or_uncertain` sind Hinweise, keine Tatsachen. `sceneConfidence` und `sceneSignals` machen die Entscheidung nachvollziehbar.

## Rotation, Perspektive und Persistenz

Ein Vorschlag kann zusätzlich zur normalisierten achsenparallelen Bounding Box enthalten:

- vier normalisierte Eckpunkte (`quadrilateral`),
- geschätzten Rotationswinkel,
- Kanten-, Kontrast- und Orientierungsindizien.

Die vorhandene Bounding-Box-Bearbeitung bleibt unverändert nutzbar. Die Zusatzdaten werden im bestehenden JSON-Evidenzmodell gespeichert; Schema 12 bleibt bestehen. Die Eckpunkte sind eine Grundlage für spätere perspektivische Normalisierung, starten aber ausdrücklich noch keine OCR.

## Überlappung und Deduplizierung

Die Deduplizierung verwendet neben der normalen Box-IoU auch Polygon-IoU, Mittelpunkt, Größe und Winkel. Fast identische Vorschläge derselben gedrehten Karte werden zusammengeführt. Zwei überlappende Karten mit plausibel unterschiedlichen Winkeln dürfen getrennt bleiben. Eine stark verdeckte Karte kann bewusst fehlen, wenn ihre sichtbaren Kanten keine sichere vollständige Fläche ergeben.

## UI-Verhalten

Die Oberfläche zeigt Szenentyp, Szenen-Confidence, Szenenkomplexität und bei einem ausgewählten automatischen Vorschlag den erkannten Winkel. Bildqualität und Szenenkomplexität bleiben getrennte Aussagen. Bei hoher Komplexität erscheint der Hinweis:

> Komplexe Kartenszene – automatische Erkennung möglicherweise unvollständig.

Fehlende Karten können weiterhin manuell markiert, falsche Vorschläge ignoriert und Boxen korrigiert werden.

## Reproduzierbare Evaluation

`scripts/evaluate-collection-detection-real-photos.js` unterstützt SHA-256-basierte lokale Bildsätze, Development-/Holdout-Splits und getrennte Kategorien:

- Binder
- Loose-Easy
- Loose-Rotated
- Loose-Overlap
- Loose-Chaotic

Ground Truth kann Bounding Boxes oder Quadrilaterale enthalten. `occluded` und `visibleFraction` dokumentieren Teilverdeckung. Ausgegeben werden TP, FP, FN, Precision, Recall, F1, IoU, Coverage, Flächenverhältnis und – soweit annotiert – Polygon-IoU. Stark verdeckte Karten dürfen nur transparent gekennzeichnet aus einer harten Recall-Bewertung herausgenommen werden.

Der lokale Realfoto-Satz bleibt außerhalb des Repositorys. Für die derzeit verfügbaren echten Stressfotos existiert noch keine verlässlich manuell annotierte Ground Truth. Deshalb werden für diese Bilder keine erfundenen Precision-/Recall-Zahlen ausgewiesen; stattdessen werden Erkennungsanzahl, Szenenklasse, Komplexität und das Auftreten großer Sammelboxen dokumentiert. Die automatisierten Geometriemetriken stammen aus reproduzierbaren synthetischen Bildern mit bekannter Ground Truth.

## OpenCV-Bewertung

OpenCV bietet für diese Fehlerklasse klare technische Vorteile: `findContours`, `approxPolyDP`, `minAreaRect`, Hough-Linien, Morphologie und Perspective Transform würden Konturen und Eckpunkte robuster liefern und später die Entzerrung für OCR erleichtern.

Eine Integration in 6.12.4 ist dennoch nicht gerechtfertigt:

- Ein natives Modul erhöht Windows-Installer-, ABI- und Update-Risiken erheblich.
- OpenCV.js/WASM erhöht Paketgröße, Startaufwand und Speicherbedarf und benötigt eine belastbare asynchrone Initialisierung.
- Ohne ausreichend großen manuell annotierten Loose-Card-Holdout-Satz wäre ein messbarer Vorteil gegenüber der JS-Pipeline nicht seriös belegbar.
- Das aktuelle Sicherheitsziel – Binder schützen, Gruppenboxen unterdrücken und Unsicherheit offen melden – ist ohne neue Laufzeitabhängigkeit erreichbar.

Empfohlener nächster Forschungsblock ist daher ein isolierter OpenCV.js/WASM-Prototyp gegen denselben annotierten Holdout-Satz. Integration erst, wenn Recall und Polygon-IoU bei Loose-Rotated/Overlap messbar steigen, ohne Binder-Regression und ohne unvertretbare Installer-/Laufzeitkosten.

## Bekannte Grenzen

- Fächer und dichte Stapel können weiterhin weniger Karten liefern als sichtbar sind.
- Sehr stark verdeckte Außenkanten werden nicht zu einer erfundenen Vollkarte ergänzt.
- Perspektivische Quadrilaterale werden als Evidenz gespeichert, aber noch nicht entzerrt.
- Die Szenenklasse ist konservativ und kann bei widersprüchlichen Signalen `mixed_or_uncertain` bleiben.
- Ohne manuelle Ground Truth sind reale Precision-/Recall-Aussagen nicht zulässig.
