# Automatische Kartenflächen-Erkennung 6.12.0

## Zweck und klare Grenze

Die Funktion sucht in einem bereits gespeicherten Sammlungsfoto nach Bildbereichen, in denen wahrscheinlich eine TCG-Karte liegt. Das Ergebnis besteht ausschließlich aus prüfbaren, normalisierten Bounding-Box-Vorschlägen.

Sie erkennt bewusst **keinen Kartennamen**, **keinen exakten Print**, **keinen Preis** und erstellt **weder Einkauf noch Bestand**. Mehrere Fotos derselben physischen Karte werden ebenfalls nicht automatisch zusammengeführt.

Die drei Sicherheitsstufen bleiben unabhängig:

- **Detection-Confidence:** Wie sicher ist das System, dass dort überhaupt eine Karte liegt?
- **Name-Confidence:** Wie sicher ist der Kartenname?
- **Print-Confidence:** Wie sicher ist die konkrete Cardmarket-Druckvariante?

Ein hoher Detection-Wert darf Name oder Print niemals bestätigen.

## Wiederverwendete Pipeline

Die Implementierung erweitert die vorhandene Canvas-/RGBA-Verarbeitung in `scanner-image-processing.js`. Bilder werden für die Analyse proportional verkleinert; die gespeicherten Ergebnisse sind weiterhin auf das Originalfoto normalisiert. Dadurch bleibt die Funktion Electron-kompatibel und benötigt weder OpenCV noch eine neue native Abhängigkeit.

## Erkennungsmerkmale

Mehrere nachvollziehbare Signale fließen in einen Score ein:

- horizontale und vertikale Kantenstärke,
- Kontinuität und Ausgeglichenheit der vier Außenkanten,
- Rechteck- und Seitenverhältnisnähe einer typischen TCG-Karte,
- relative Flächengröße,
- zusammenhängende Kanten- und Kontrastregionen,
- lokale Mehrskalen-Rechtecksuche,
- geschätzte Rotation,
- optional regelmäßige Größen und Abstände mehrerer Kandidaten.

Kein einzelnes Signal gilt als sicherer Kartennachweis. Unplausible oder schwache Bilder dürfen deshalb 0 Vorschläge ergeben.

## Duplikatunterdrückung

Kandidaten werden nach Score sortiert. Überlappt ein schwächerer Kandidat einen bereits behaltenen Kandidaten mit einer Intersection over Union (IoU) von mindestens **0,45**, wird der schwächere verworfen. Beim erneuten Scan gilt zusätzlich eine Abdeckungsschwelle von **0,50** gegenüber allen vorhandenen Beobachtungen. Das schützt auch manuelle, bestätigte und bewusst ignorierte Bereiche.

Diese Prüfung gilt nur innerhalb desselben Fotos. Sie ist keine Duplikaterkennung physischer Karten über mehrere Fotos.

## Binder- und Rasterhinweise

Sind mehrere Vorschläge ähnlich groß und regelmäßig verteilt, werden geometrisch plausible Reihen und Spalten vorgeschlagen. Das Raster ist nur ein Zusatzsignal. Ohne erkannte Karten werden niemals automatisch neun Binderfelder erzeugt.

## Bildqualität

Für das gesamte Foto werden einfache technische Indikatoren gespeichert und angezeigt:

- mittlere Helligkeit,
- Kontrast,
- Kantenschärfe,
- Anteil sehr dunkler und überbelichteter Pixel,
- Warnungen für sehr dunkle, überbelichtete, kontrastarme, möglicherweise unscharfe oder zu kleine Bilder.

Einzelne Vorschläge tragen außerdem Signale für kleine Regionen, stärkere Rotation und mögliche Perspektivprobleme. Diese Hinweise bestätigen oder verwerfen keine Karte und beeinflussen keinen wirtschaftlichen Wert.

## Bedienung und Persistenz

„Karten automatisch erkennen“ analysiert nur das aktuelle Foto. Automatische Vorschläge erscheinen getrennt von manuellen Bereichen und können bestätigt, verschoben, über die Koordinatenfelder skaliert, ignoriert oder gelöscht werden. Löschen eines automatischen Vorschlags speichert eine unsichtbare Ablehnung, damit ein erneuter Scan ihn nicht sofort wieder erzeugt. Manuelle Bereiche werden tatsächlich entfernt.

Schema 12 reicht aus: Foto- und Beobachtungsdatensätze besitzen bereits ein dauerhaftes Rohdatenfeld. Dort bleiben `observationSource`, `detectionConfidence`, `detectionScore`, `detectionSignals`, `detectionReviewState`, Fotoqualität und Analysezeitpunkt über Save/Load erhalten. Eine Migration war nicht erforderlich.

## Evaluation

`evaluateCollectionDetections` vergleicht erwartete und erkannte normalisierte Boxen mit einem dokumentierten IoU-Trefferschwellenwert. Ausgegeben werden:

- erwartete und erkannte Karten,
- True Positives, False Positives und False Negatives,
- IoU je Treffer und mittlere IoU,
- Precision, Recall und F1.

Der automatisierte Electron-Smoke-Test erzeugt temporär leeres Bild, Einzelkarte, vier Karten, 3x3-Anordnung und eine um 7 Grad gedrehte Karte. Die Bilder werden nach dem Test entfernt und nicht eingecheckt.

## Bekannte Grenzen

Die synthetischen Messwerte belegen die deterministische Geometrie, sind aber keine Behauptung über reale eBay- oder Kleinanzeigen-Fotos. Starke Folienreflexion, Teilverdeckung, extreme Perspektive, ähnliche Hintergrundfarben, sehr kleine Karten und unruhige Binderseiten bleiben schwierig. Für künftige Verbesserungen sollten rechtlich unproblematische, repräsentative Fotos mit manuell markierten Referenzboxen über dasselbe Evaluations-Harness verglichen werden. Wenn die regelbasierte Pipeline dort nicht ausreichend robust ist, ist ein separat bewertetes Modell sinnvoller als immer weitere bildspezifische Sonderregeln.
