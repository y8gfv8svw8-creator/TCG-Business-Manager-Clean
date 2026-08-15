# PHASE 4 – Datenmodell und Berechnungsregeln

## Source of Truth

`app_state` bleibt die einzige führende Quelle für bearbeitbare Anwendungsdaten. `trade_orders`, `trade_lines`, `purchase_receipt_lines`, `inventory_assets` und `inventory_listing_history` sind normalisierte, transaktional neu aufbaubare Projektionen. `business_events` protokolliert Änderungen zusätzlich append-only. Die PHASE-4-Verkaufsanalyse erzeugt keine zweite dauerhafte Verkaufsquelle.

## Neue Fakten in Schema 10

| Feld | Source of Truth | Art | Herkunft / Qualität |
| --- | --- | --- | --- |
| `pendingItems[].confirmedTargetSellPrice` / `purchase_receipt_lines.confirmed_target_sell_price` | `app_state` | bestätigter Fakt | Vom Benutzer beim Wareneingang bestätigt; fehlend bleibt `NULL`. |
| `inventory[].targetSell` / `inventory_assets.current_target_sell` | `app_state` | bestätigter Fakt | Vom Benutzer gesetzt oder geändert; keine automatische Übernahme. |
| `inventory[].originalTargetSell` / `inventory_assets.original_target_sell` | `app_state` | historischer Fakt | Erster bestätigter Ziel-VK; wird später nicht überschrieben. |
| `listingHistory[]` / `inventory_listing_history` | `app_state` | Historie | Jede bestätigte Ziel-VK-Änderung wird mit Zeitpunkt, Alt-/Neuwert und Modus protokolliert. |
| `pendingItems[].cartFillerStatus` / `purchase_receipt_lines.cart_filler_status` | `app_state` | bestätigter Fakt | `yes`, `no` oder `unknown`; Altbestand bleibt `unknown`. |
| `incrementalShippingCost` | `app_state` | bestätigter Fakt | Tatsächlich durch Karte/Gruppe zusätzlich ausgelöster Versand; fehlend bleibt `NULL`. |
| `incrementalDirectCost` | `app_state` | bestätigter Fakt | Weitere direkte Grenzkosten; fehlend bleibt `NULL`. |
| `decisionCostStatus` | `app_state` | Qualitätsstatus | Nur `known`, wenn Warenkorbstatus sowie beide Grenzkosten ausdrücklich vorliegen; sonst `unknown`. |

## Drei EK-Sichten

- **Kartenpreis:** Preis der einzelnen Karte ohne anteiligen Bestellversand.
- **Vollkosten-EK:** Kartenpreis plus sachgerecht verteilter Einkaufsversand und Zusatzkosten. Dieser Wert bleibt alleinige Kostenbasis für realisierten Gewinn und ROI.
- **Entscheidungs-EK:** Kartenpreis plus ausdrücklich bestätigter zusätzlicher Versand und weitere direkte Grenzkosten. Er dient nur der Warenkorb-/Ankaufentscheidung.

Ein unbekannter Entscheidungs-EK wird nie aus Altbestand abgeleitet. Insbesondere wird der Kartenpreis nicht automatisch als bestätigter Entscheidungs-EK übernommen.

## Eigene Verkaufserfahrung

Die Auswertung wird zur Laufzeit printgenau über `product_id` aus `trade_orders`, `trade_lines`, `inventory_assets` und `inventory_listing_history` berechnet. Sie durchsucht weder `business_events` noch `market_prices` oder das vollständige `app_state` pro Renderdurchlauf. Ein Index auf Verkauf, Print, Eigentum und Archivstatus unterstützt die Zuordnung.

Verwendet werden nur abgeschlossene beziehungsweise abgerechnete Verkäufe. Verkaufsanzahl, Stückzahl und Frequenz dürfen auch bei unbekanntem EK berechnet werden. Gewinn, ROI und durchschnittlicher EK verwenden ausschließlich Verkäufe mit bekanntem Vollkosten-EK.

Liegedauer beginnt bevorzugt am belegten Erstinserierdatum. Nur wenn fachlich belegt, wird das Bestands-/Verkaufsfreigabedatum verwendet. Ohne belastbaren Beginn bleibt die Liegedauer unbekannt und wird nicht in Median oder Durchschnitt einbezogen.

## Datenqualität und Umschlag

- 0 Verkäufe: `KEINE DATEN`
- 1 Verkauf: `SEHR GERINGE DATENBASIS`
- 2 Verkäufe: `GERINGE DATENBASIS`
- 3–4 Verkäufe: `EINGESCHRÄNKTE DATENBASIS`
- ab 5 Verkäufen: `AUSREICHENDE EIGENE DATEN`

Umschlag nach Median-Liegedauer:

- bis 7 Tage: `SEHR SCHNELL`
- 8–21 Tage: `SCHNELL`
- 22–45 Tage: `NORMAL`
- 46–90 Tage: `LANGSAM`
- über 90 Tage: `SEHR LANGSAM`

Unter fünf Verkäufen wird die Klasse nur als Tendenz gezeigt. Es gibt bewusst keinen scheinpräzisen Liquiditätsscore von 0 bis 100.

## Trennung vom Markt und Automatik

PHASE-3-Markttrend und PHASE-4-Eigenhistorie bleiben getrennte Aussagen. Sie dürfen gemeinsam einen nachvollziehbaren Einkaufshinweis bilden, werden aber nicht zu einem undurchsichtigen Score vermischt. Es gibt keine automatische Preisänderung, Bestellung, Händlersuche oder Cardmarket-Aktion.
