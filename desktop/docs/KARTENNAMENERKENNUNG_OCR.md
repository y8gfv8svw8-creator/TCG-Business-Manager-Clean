# Kartennamenerkennung aus Kartenflächen

## Zweck und Sicherheitsgrenzen

Die Funktion erzeugt aus einer vorhandenen Kartenbeobachtung ausschließlich unbestätigte Namenskandidaten. Sie bestätigt weder Cardmarket-Produkt-ID noch Set, Rarität, Edition, Sprache des physischen Prints, Preis, Einkauf, Bestand oder physische Kartenidentität.

Die drei Sicherheiten bleiben unabhängig:

- Detection-Confidence: Liegt hier eine Karte?
- Name-Confidence: Welche Metakarte ist das?
- Print-Confidence: Welcher konkrete Druck ist es?

Ein hoher Namenswert verändert Detection- oder Print-Confidence nicht. Ein bereits manuell bestätigter Name wird bei erneuter Erkennung nicht überschrieben.

## Pipeline

1. Die bereits gespeicherte Bounding Box beziehungsweise das Quadrilateral wird aus dem Ursprungsfoto gelesen.
2. Die vier Kartenecken werden relativ zum Originalbild bestimmt. Ein vorhandenes Quadrilateral dient der perspektivischen Normalisierung; andernfalls wird die Bounding Box verwendet.
3. Hochkant- und wahrscheinlich seitlich liegende Karten werden in zwei plausiblen Ausrichtungen geprüft.
4. Aus der normalisierten Kartenfläche werden wenige relative Namensbereiche entnommen: Standard, etwas höher, etwas tiefer und ein breiterer Bereich. Ein vorsichtiger adaptiver Schieflagenausgleich wird nur auf dem breiten Namensbereich versucht. Die Koordinaten sind nicht an eine feste Fotoauflösung gebunden.
5. Helligkeits-, lokale Kontrast- und Schwellwertvarianten werden mit passenden Tesseract-Modi für einzelne Zeilen beziehungsweise sparse Text gelesen. Zusätzlich werden Setcode- und Passcode-Bereiche getrennt verarbeitet. Pro Ausrichtung bleibt die Zahl der Läufe bewusst begrenzt.
6. Ein wiederverwendeter lokaler Tesseract-Worker liest Deutsch und Englisch gemeinsam. Separate Sprachläufe und zusätzliche Farbkanäle wurden an den realen Fehlerfällen geprüft, aber wegen fehlenden messbaren Nutzens nicht in die Produktionspipeline aufgenommen.
7. OCR-Zeilen werden vorsichtig normalisiert. Groß-/Kleinschreibung, Leerraum, typografische Bindestriche, Apostrophe, Umlaute und wenige allgemeine OCR-Verwechslungen werden beim Vergleich berücksichtigt. Kurzer Randmüll darf für zusätzliche Suchvarianten entfernt werden; vertauschte Wörter erzeugen dagegen keinen falsch starken Treffer.
8. Die Texte werden gegen den bestehenden zweisprachigen Kartenkatalog aus `card_name_mappings`, `card_aliases` und `products` bewertet. Zeichen-, Trigramm-, geordnete Wort- und Teilübereinstimmungen werden kombiniert. Ein gelesener Setcode ist nur ein kleines unterstützendes Signal.
9. Ein eindeutig einer Metakarte zugeordneter achtstelliger Passcode kann den Namen stark unterstützen, bestätigt aber niemals einen Print. Unbekannte Passcodes bleiben wirkungslos; ein Widerspruch zur Namens-OCR senkt die Confidence und wird als Konflikt gespeichert.
10. Zwei relative Artwork-Bereiche liefern leichte Fingerprints aus dHash, Farbhistogramm und einem normalisierten Helligkeitsraster. Vorhandene bestätigte Referenzen werden im Speicher wiederverwendet. Artwork allein darf keine hohe Name-Confidence erzeugen und es wird kein Webzugriff zur Laufzeit erzwungen.
11. Das Ranking fusioniert OCR, Passcode, Artwork, Alias-Konsistenz, mehrere OCR-Läufe und Kandidatenabstand. Es liefert mehrere Metakarten-Kandidaten mit Score und Begründung. Konflikte werden abgewertet; unlesbare oder zu kurze Signale dürfen `unknown` ergeben.
12. Erst die ausdrückliche Benutzeraktion „Diesen Namen bestätigen“ setzt den Namen auf manuell bestätigt.

## Oberfläche und Batch

Eine einzelne Kartenfläche kann erkannt, erneut erkannt oder verworfen werden. Kandidaten und technische OCR-Rohdaten werden getrennt von der vorhandenen manuellen Suche angezeigt.

„Namen im Bild erkennen“ verarbeitet nur die geeigneten Beobachtungen des aktuell geöffneten Fotos. Fortschritt und Position werden angezeigt. Abbruch beendet den Stapel nach der gerade laufenden Karte. Der OCR-Worker und der vorbereitete Namenskatalog werden wiederverwendet; der Stapel wird am Ende gemeinsam gespeichert. Bestätigte Namen bleiben geschützt; Print-, Preis- und Bestandsdaten werden nicht verändert.

## Persistenz und Schema

Schema 12 reicht aus. Kandidaten, Name-Confidence und Recognition-Signale werden in der vorhandenen Foto-Evidenzstruktur gespeichert. Es ist keine Migration erforderlich.

## Evaluation und bekannte Grenzen

Die Realfoto-Auswertung akzeptiert ausschließlich explizit bereitgestellte Bilder und Ground Truth. Der Kartenkatalog wird read-only geöffnet. Development- und Holdout-Split, Top-1, Top-3, Unknown, False-Confident, Laufzeit sowie Gruppen nach Sprache und Szene werden getrennt berichtet. Benutzerfotos, Ground Truth und Debug-Crops gehören nicht ins Repository.

Finale lokale Evaluation auf 24 real annotierten Binderkarten:

- Development (12): Top-1 83,33 %, Top-3 91,67 %, Unknown 16,67 %, falsch-sicher 0 %, durchschnittlich 3,26 Sekunden je Karte.
- Holdout (12, erst nach Abschluss der Anpassungen ausgewertet): Top-1 75,00 %, Top-3 75,00 %, Unknown 8,33 %, falsch-sicher 0 %, durchschnittlich 2,89 Sekunden je Karte.
- Insgesamt: Top-1 79,17 %, Top-3 83,33 %. Der messbare Top-3-Vorteil entsteht durch einen englischen Realfall im Development-Split.
- Deutsch im Development-Split: 7/8 Top-1 und 7/8 Top-3.
- Englisch im Development-Split: 3/4 Top-1 und 4/4 Top-3. Ein eigener englischer Holdout-Split ist mit den vorhandenen bestätigten Fotos noch nicht möglich.

Die Realfoto-Ablationen waren in diesem Bestand identisch zu OCR-only, weil in den ausgewerteten Fotos kein verlässlich erkanntes Passcode-Signal mit Katalogtreffer und noch keine allgemeine lokale Artwork-Referenzsammlung vorlag. Nutzen und Konfliktverhalten von Passcode und Artwork sind deshalb automatisiert mit synthetischen Fingerprints beziehungsweise kontrollierten Katalogdaten abgesichert, aber noch nicht als eigener Realfoto-Gewinn belegt.

Stark beschnittene, reflektierende oder unlesbare Karten dürfen sinnvollerweise `unknown` oder niedrige Confidence ergeben. Es liegen weiterhin keine ausreichenden bestätigten Loose-Card-Ground-Truth-Fälle für eine getrennte Realfoto-Quote vor. Die Erkennung unterstützt nur die Metakarte; ein konkreter Print muss immer manuell bestätigt werden.
