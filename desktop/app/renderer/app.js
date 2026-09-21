const DB_KEY = "tcgWawiState_v31";
const LEGACY_DB_KEYS = ["tcgWawiState_v28","tcgWawiState_v30"];
const DESKTOP_UPDATED_KEY = "tcgWawiState_v31_updatedAt";
const BUILTIN_PRODUCT_CATALOG = {"769915":{"name":"Antimagischer Duft (V.3 - Secret Rare)","set":"RA02","setName":"25th Anniversary Rarity Collection II","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection-II/Anti-Spell-Fragrance-V3-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"769808":{"name":"Buch des Mondes (V.2 - Ultra Rare)","set":"RA02","setName":"25th Anniversary Rarity Collection II","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection-II/Book-of-Moon-V2-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"769759":{"name":"D.D. Krähe (V.2 - Ultra Rare)","set":"RA02","setName":"25th Anniversary Rarity Collection II","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection-II/DD-Crow-V2-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"769836":{"name":"Ernste Warnung (V.2 - Ultra Rare)","set":"RA02","setName":"25th Anniversary Rarity Collection II","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection-II/Solemn-Warning-V2-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"769755":{"name":"Ernste Warnung (V.1 - Super Rare)","set":"RA02","setName":"25th Anniversary Rarity Collection II","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection-II/Solemn-Warning-V1-Super-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"769754":{"name":"Kräfte rauben (V.1 - Super Rare)","set":"RA02","setName":"25th Anniversary Rarity Collection II","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection-II/Skill-Drain-V1-Super-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"769806":{"name":"Mystischer Raum-Taifun (V.2 - Ultra Rare)","set":"RA02","setName":"25th Anniversary Rarity Collection II","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection-II/Mystical-Space-Typhoon-V2-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"769725":{"name":"Mystischer Raum-Taifun (V.1 - Super Rare)","set":"RA02","setName":"25th Anniversary Rarity Collection II","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection-II/Mystical-Space-Typhoon-V1-Super-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"769843":{"name":"Schädelmeister (V.3 - Secret Rare)","set":"RA02","setName":"25th Anniversary Rarity Collection II","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection-II/Skull-Meister-V3-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"769818":{"name":"Zwillings-Twister (V.2 - Ultra Rare)","set":"RA02","setName":"25th Anniversary Rarity Collection II","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection-II/Twin-Twisters-V2-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"788476":{"name":"Chaotischer Antiker Antriebsriese","set":"MP24","setName":"25th Anniversary Tin: Dueling Mirrors","rarity":"Quarter Century Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Tin-Dueling-Mirrors/Chaos-Ancient-Gear-Giant?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"785139":{"name":"Kashtiratheosis","set":"MP24","setName":"25th Anniversary Tin: Dueling Mirrors","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Tin-Dueling-Mirrors/Kashtiratheosis?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"788480":{"name":"Trickstar-Lichtbühne","set":"MP24","setName":"25th Anniversary Tin: Dueling Mirrors","rarity":"Quarter Century Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Tin-Dueling-Mirrors/Trickstar-Light-Stage?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"737220":{"name":"Xyz-Panzerungsfestung","set":"AGOV","setName":"Age of Overlord","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Age-of-Overlord/Xyz-Armor-Fortress?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"737219":{"name":"Xyz-Panzerungstorpedo","set":"AGOV","setName":"Age of Overlord","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Age-of-Overlord/Xyz-Armor-Torpedo?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889948":{"name":"Adreus, Hüter der Götterdämmerung (V.1 - Secret Rare)","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Adreus-Keeper-of-Armageddon-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889942":{"name":"Armades, Hüter der Grenzen (V.1 - Secret Rare)","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Armades-Keeper-of-Boundaries-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889961":{"name":"Band zwischen Lehrer und Schüler","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Bond-Between-Teacher-and-Student?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889863":{"name":"Dracheneinheit Quirinus","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Dragunity-Quirinus?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889865":{"name":"Dracheneinheit-Ritter - Areus","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Dragunity-Knight-Areus?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889858":{"name":"El Schattenpuppe Konstrukt (V.1 - Secret Rare)","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/El-Shaddoll-Construct-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889964":{"name":"El Schattenpuppen-Fusion","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/El-Shaddoll-Fusion?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889906":{"name":"Ersatzkröte","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Substitoad?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889912":{"name":"Fixsternritter Altair","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Satellarknight-Altair?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889911":{"name":"Fixsternritter Deneb","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Satellarknight-Deneb?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889953":{"name":"Galaxieaugen-Cipher-X-Drache","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Galaxy-Eyes-Cipher-X-Dragon?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889883":{"name":"Gefallener Engel in Dunkelheit","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Fallen-Angel-in-Darkness?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889894":{"name":"Genni, die Maid von Endymion","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Genni-the-Maid-of-Endymion?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889970":{"name":"Glühen der Dracheneinheit","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Dragunity-Glow?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889977":{"name":"Grabwächters Inschrift","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Gravekeepers-Inscription?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889956":{"name":"Kartenzerstörung","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Card-Destruction?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889949":{"name":"Königin Dragoondschinn","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Queen-Dragun-Djinn?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889859":{"name":"Legendäre Sechs Samurai - Shi En (V.1 - Secret Rare)","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Legendary-Six-Samurai-Shi-En-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889878":{"name":"Lernende Elfe","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Learning-Elf?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889887":{"name":"Puls des Champions","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Champions-Pulse?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889987":{"name":"Raigeki-Brecher","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Raigeki-Break?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889926":{"name":"Reeschattenpuppe Wendi","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Reeshaddoll-Wendi?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889875":{"name":"Reeschattenpuppe Wendikuruhu","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Reeshaddoll-Wendikuruhu?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889955":{"name":"Requiem des Unterweltlerschmieds","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Fiendsmiths-Requiem?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889880":{"name":"Spiegelbarriere","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Mirror-Barrier?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889872":{"name":"Sternennova-Band (V.1 - Secret Rare)","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Stellarnova-Binding-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889973":{"name":"Sternenstaub-Illumination","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Stardust-Illumination?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889861":{"name":"Sternzeichen-Kundler Ptolemy M7 (V.1 - Secret Rare)","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Constellar-Ptolemy-M7-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889873":{"name":"Tohuschattenpuppe Grysta","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Tohushaddoll-Grysta?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889907":{"name":"Täuschungsfrosch","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Dupe-Frog?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889862":{"name":"Wandelsternritter Delteros (V.1 - Secret Rare)","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Stellarknight-Delteros-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889950":{"name":"Wandelsternritter Triverr","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Stellarknight-Triverr?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"889893":{"name":"Überraschungsfusion (V.1 - Secret Rare)","set":"BLGG","setName":"Battles of Legend: Glorious Gallery","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Glorious-Gallery/Surprise-Fusion-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774191":{"name":"Antiker Antriebsdrache","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Ancient-Gear-Dragon?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774235":{"name":"Eisjade-Gymir Aegirine","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Icejade-Gymir-Aegirine?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774226":{"name":"Eisjade-Ran Aegirine","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Icejade-Ran-Aegirine?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774225":{"name":"Flammende Cartesia, die Tugendhafte","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Blazing-Cartesia-the-Virtuous?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774151":{"name":"Flick-Genex-Überwacher (V.1 - Secret Rare)","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Repair-Genex-Controller-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774160":{"name":"Geistungeheuer Ulti-Nochiudrago","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Ritual-Beast-Ulti-Nochiudrago?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774186":{"name":"Himmelsjäger-Ass - Azalea Temperance","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Sky-Striker-Ace-Azalea-Temperance?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774211":{"name":"Infernoid Pirmais","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Infernoid-Pirmais?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774194":{"name":"Inkarnation der legendären Exodia (V.1 - Secret Rare)","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/The-Legendary-Exodia-Incarnate-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774247":{"name":"Leerenimagination (V.1 - Secret Rare)","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Void-Imagination-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774261":{"name":"Lubellion der sengende Drache (V.1 - Ultra Rare)","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Lubellion-the-Searing-Dragon-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774259":{"name":"Markierte Vergeltung","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Branded-Retribution?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774256":{"name":"Markierter Verlust","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Branded-Lost?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774244":{"name":"Medaillon der Eisbarriere (V.2 - Ultra Rare)","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Medallion-of-the-Ice-Barrier-V2-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774165":{"name":"Spielzeugkiste","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Toy-Box?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774164":{"name":"Spielzeugpanzer","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Toy-Tank?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774163":{"name":"Spielzeugsoldat","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Toy-Soldier?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774220":{"name":"Spright Blau","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Spright-Blue?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774223":{"name":"Spright Rot","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Spright-Red?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774221":{"name":"Spright Strahl","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Spright-Jet?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774254":{"name":"Springans Kitt","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Springans-Kitt?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774144":{"name":"Voll gepanzerter Utopischstrahl-Lanzenträger","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Full-Armored-Utopic-Ray-Lancer?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774150":{"name":"Waffen von Genex Return Zero","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Arms-of-Genex-Return-Zero?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"774216":{"name":"Wahrsagerin des Herolds (V.1 - Ultra Rare)","set":"BLTR","setName":"Battles of Legend: Terminal Revenge","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Battles-of-Legend-Terminal-Revenge/Diviner-of-the-Herald-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"885467":{"name":"Clowntrupp-Jonglage","set":"BLZD","setName":"Blazing Dominion","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Blazing-Dominion/Clown-Crew-Malabarisme?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"885415":{"name":"Enneawerk - Atil.SPIA","set":"BLZD","setName":"Blazing Dominion","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Blazing-Dominion/Enneacraft-AtilSPIA?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"885508":{"name":"GMX-Labor Nr. 5","set":"BLZD","setName":"Blazing Dominion","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Blazing-Dominion/GMX-Lab-5?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"885462":{"name":"Gesperrtes Machtpatron-Portal - Terminus","set":"BLZD","setName":"Blazing Dominion","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Blazing-Dominion/Prohibited-Power-Patron-Portal-Terminus?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"885443":{"name":"Kewl-Empfang B2B","set":"BLZD","setName":"Blazing Dominion","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Blazing-Dominion/Kewl-Tune-B2B?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"885398":{"name":"Nachtzug Blauer Reisender","set":"BLZD","setName":"Blazing Dominion","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Blazing-Dominion/Night-Train-Blue-Traveler?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"885438":{"name":"Roter Hypernova-Drache","set":"BLZD","setName":"Blazing Dominion","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Blazing-Dominion/Red-Hypernova-Dragon?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"885397":{"name":"Schwer gepanzerter Ritter Babeldecker","set":"BLZD","setName":"Blazing Dominion","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Blazing-Dominion/Heavy-Armored-Knight-Babeldecker?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"885446":{"name":"Superkanonen-Panzerzug Schwebwerfer (V.1 - Ultra Rare)","set":"BLZD","setName":"Blazing Dominion","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Blazing-Dominion/Superdreadnought-Rail-Cannon-Flying-Launcher-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"885431":{"name":"Weberin der Märchenschweife","set":"BLZD","setName":"Blazing Dominion","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Blazing-Dominion/Weaver-of-Fairy-Tails?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"894733":{"name":"Aiwass, göttlicher Geist des Gesetzes","set":"CORI","setName":"Chaos Origins","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Chaos-Origins/Aiwass-Divine-Spirit-of-the-Law?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"894776":{"name":"Befreiung der heiligen Ungeheuer","set":"CORI","setName":"Chaos Origins","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Chaos-Origins/Sacred-Beasts-Released?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"894837":{"name":"Die drei Schwertseelen","set":"CORI","setName":"Chaos Origins","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Chaos-Origins/The-Three-Champions-of-Swordsoul?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"894829":{"name":"Engelechy Destrier","set":"CORI","setName":"Chaos Origins","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Chaos-Origins/Angelechy-Destrier?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"894706":{"name":"Inferno der heiligen Ungeheuer - Uria, Herr der reißenden Flammen (V.1 - Super Rare)","set":"CORI","setName":"Chaos Origins","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Chaos-Origins/Inferno-of-the-Sacred-Beasts-Uria-Lord-of-Searing-Flames-V1-Super-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"894709":{"name":"Katastrophe der heiligen Ungeheuer - Hamon, Herr des tosenden Donners (V.1 - Super Rare)","set":"CORI","setName":"Chaos Origins","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Chaos-Origins/Calamity-of-the-Sacred-Beasts-Hamon-Lord-of-Striking-Thunder-V1-Super-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"894687":{"name":"Schädel-Erzunterweltler des Chaos (V.1 - Super Rare)","set":"CORI","setName":"Chaos Origins","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Chaos-Origins/Skull-Archfiend-of-Chaos-V1-Super-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"894713":{"name":"Unendlichkeit der heiligen Ungeheuer - Raviel, Herr der Phantome (V.1 - Super Rare)","set":"CORI","setName":"Chaos Origins","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Chaos-Origins/Infinity-of-the-Sacred-Beasts-Raviel-Lord-of-Phantasms-V1-Super-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"679345":{"name":"Kashtira Shangri-Ira","set":"DABL","setName":"Darkwing Blast","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Darkwing-Blast/Kashtira-Shangri-Ira?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652680":{"name":"Aluber der Narr von Despia","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/Aluber-the-Jester-of-Despia?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652725":{"name":"D/D/D-Duo-Dämmerungskönig Kali Yuga","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/DDD-Duo-Dawn-King-Kali-Yuga?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652743":{"name":"Domäne der wahren Monarchen","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/Domain-of-the-True-Monarchs?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652712":{"name":"Fossilkrieger Schädelritter","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/Fossil-Warrior-Skull-Knight?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652590":{"name":"Majestät Hyperion","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/Majesty-Hyperion?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652672":{"name":"Mardel, Generaider-Boss des Lichts","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/Mardel-Generaider-Boss-of-Light?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652697":{"name":"Nekrowelt-Banshee","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/Necroworld-Banshee?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652726":{"name":"Nummer 38: Hoffnungsvorbote Drachentitanengalaxie","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/Number-38-Hope-Harbinger-Dragon-Titanic-Galaxy?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652711":{"name":"Plünderpatrouillen-Schiff Lys","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/Plunder-Patrollship-Lys?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652729":{"name":"Primathemech Laplace","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/Primathmech-Laplacian?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652710":{"name":"Quintettmagier","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/Quintet-Magician?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"652633":{"name":"Sendbotin der Rätsel - Erde","set":"GFP2","setName":"Ghosts From the Past: The 2nd Haunting","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/2022-Ghosts-From-the-Past/The-Agent-of-Mystery-Earth?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"707456":{"name":"Aufschlagen","set":"IOC-25TH","setName":"Invasion of Chaos (25th Anniversary Edition)","rarity":"Common","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Invasion-of-Chaos-25th-Anniversary-Edition/Smashing-Ground?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"707386":{"name":"Chaos Hexer","set":"IOC-25TH","setName":"Invasion of Chaos (25th Anniversary Edition)","rarity":"Common","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Invasion-of-Chaos-25th-Anniversary-Edition/Chaos-Sorcerer?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"707364":{"name":"Gelber Ojama","set":"IOC-25TH","setName":"Invasion of Chaos (25th Anniversary Edition)","rarity":"Common","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Invasion-of-Chaos-25th-Anniversary-Edition/Ojama-Yellow?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"707384":{"name":"Gigantes","set":"IOC-25TH","setName":"Invasion of Chaos (25th Anniversary Edition)","rarity":"Common","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Invasion-of-Chaos-25th-Anniversary-Edition/Gigantes?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"707387":{"name":"Gren Maju Da Eiza","set":"IOC-25TH","setName":"Invasion of Chaos (25th Anniversary Edition)","rarity":"Common","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Invasion-of-Chaos-25th-Anniversary-Edition/Gren-Maju-Da-Eiza?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"707415":{"name":"Kettenverschwinden","set":"IOC-25TH","setName":"Invasion of Chaos (25th Anniversary Edition)","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Invasion-of-Chaos-25th-Anniversary-Edition/Chain-Disappearance?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"707376":{"name":"Rasender Gorilla","set":"IOC-25TH","setName":"Invasion of Chaos (25th Anniversary Edition)","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Invasion-of-Chaos-25th-Anniversary-Edition/Berserk-Gorilla?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"707365":{"name":"Schwarzer Ojama","set":"IOC-25TH","setName":"Invasion of Chaos (25th Anniversary Edition)","rarity":"Common","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Invasion-of-Chaos-25th-Anniversary-Edition/Ojama-Black?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"706795":{"name":"Böse Drachenkämpferin","set":"LOB-25TH","setName":"Legend of Blue Eyes White Dragon (25th Anniversary Edition)","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Legend-of-Blue-Eyes-White-Dragon-25th-Anniversary-Edition/Dragoness-the-Wicked-Knight?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"706777":{"name":"Sensenmann der Karten","set":"LOB-25TH","setName":"Legend of Blue Eyes White Dragon (25th Anniversary Edition)","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Legend-of-Blue-Eyes-White-Dragon-25th-Anniversary-Edition/Reaper-of-the-Cards?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"706691":{"name":"Totenkopfdiener","set":"LOB-25TH","setName":"Legend of Blue Eyes White Dragon (25th Anniversary Edition)","rarity":"Common","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Legend-of-Blue-Eyes-White-Dragon-25th-Anniversary-Edition/Skull-Servant?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782132":{"name":"Band der Wiedergeburt (V.2 - Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Ribbon-of-Rebirth-V2-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782083":{"name":"Ersatzkröte (V.2 - Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Substitoad-V2-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782082":{"name":"Finstere Valkyre (V.2 - Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Dark-Valkyria-V2-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782163":{"name":"Flammengeist Ignis (V.2 - Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Flame-Spirit-Ignis-V2-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782149":{"name":"Froschiges Kraftfeld (V.2 - Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Froggy-Forcefield-V2-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782136":{"name":"Heldenexplosion (V.2 - Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Hero-Blast-V2-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782172":{"name":"Helios Trio Megistus (V.2 - Super Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Helios-Trice-Megistus-V2-Super-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782058":{"name":"Jinzo - Lord (V.2 - Super Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Jinzo-Lord-V2-Super-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782127":{"name":"Licht der Erlösung (V.2 - Super Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Light-of-Redemption-V2-Super-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782118":{"name":"Lichtbarriere (V.2 - Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Light-Barrier-V2-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782074":{"name":"Lumina, Lichtverpflichtete Beschwörerin (V.2 - Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Lumina-Lightsworn-Summoner-V2-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782146":{"name":"Prächtige Illusion (V.2 - Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Glorious-Illusion-V2-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782099":{"name":"Simorgh, Vogel der Ahnen (V.2 - Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Simorgh-Bird-of-Ancestry-V2-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"782148":{"name":"Zerstörungsstörung (V.2 - Rare)","set":"LODT","setName":"Light of Destruction","rarity":"Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Light-of-Destruction/Destruction-Jammer-V2-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"753965":{"name":"Aromalilith Magnolie","set":"PHNI","setName":"Phantom Nightmare","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Phantom-Nightmare/Aromalilith-Magnolia?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"753985":{"name":"Aufstiegs-Rangsteigerungszauber Überfallraptor-Kraft","set":"PHNI","setName":"Phantom Nightmare","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Phantom-Nightmare/Rise-Rank-Up-Magic-Raidraptors-Force?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"754026":{"name":"Goblin-Biker Dugg Angreifer (V.1 - Ultra Rare)","set":"PHNI","setName":"Phantom Nightmare","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Phantom-Nightmare/Goblin-Biker-Dugg-Charger-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"752818":{"name":"Held der in Asche gelegten Stadt","set":"PHNI","setName":"Phantom Nightmare","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Phantom-Nightmare/Hero-of-the-Ashened-City?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"753995":{"name":"Mauern der kaiserlichen Gruft","set":"PHNI","setName":"Phantom Nightmare","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Phantom-Nightmare/Walls-of-the-Imperial-Tomb?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"752820":{"name":"Obsidim, die in Asche gelegte Stadt","set":"PHNI","setName":"Phantom Nightmare","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Phantom-Nightmare/Obsidim-the-Ashened-City?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"753930":{"name":"Überfallraptor - Blütegeier","set":"PHNI","setName":"Phantom Nightmare","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Phantom-Nightmare/Raidraptor-Bloom-Vulture?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"753973":{"name":"Überfallraptor - Tapferer Kauz","set":"PHNI","setName":"Phantom Nightmare","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Phantom-Nightmare/Raidraptor-Brave-Strix?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"669171":{"name":"Dracho-utopische Aura","set":"POTE","setName":"Power of the Elements","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/Draco-Utopian-Aura?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"669404":{"name":"EN - Neoraum aktivieren","set":"POTE","setName":"Power of the Elements","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/EN-Engage-Neo-Space?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"669405":{"name":"EN-Welle","set":"POTE","setName":"Power of the Elements","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/EN-Wave?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"669415":{"name":"Loris, Dame des Jammers","set":"POTE","setName":"Power of the Elements","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/Loris-Lady-of-Lament?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"669403":{"name":"P.U.N.K. JAM Drachen-Drive","set":"POTE","setName":"Power of the Elements","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/PUNK-JAM-Dragon-Drive?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"669410":{"name":"P.U.N.K. JAM Extreme Session","set":"POTE","setName":"Power of the Elements","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/PUNK-JAM-Extreme-Session?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"668779":{"name":"Riesen-Spright","set":"POTE","setName":"Power of the Elements","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/Gigantic-Spright?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"669413":{"name":"Shif, Fee des Ghoti","set":"POTE","setName":"Power of the Elements","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/Shif-Fairy-of-the-Ghoti?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"668776":{"name":"Spright Strahl","set":"POTE","setName":"Power of the Elements","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/Spright-Jet?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"669383":{"name":"Therion Ungleicher","set":"POTE","setName":"Power of the Elements","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/Therion-Irregular?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"669170":{"name":"Ultimativer Schlächter (V.1 - Secret Rare)","set":"POTE","setName":"Power of the Elements","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/Ultimate-Slayer-V1-Secret-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"669416":{"name":"Werkzeug-Tapferdrache","set":"POTE","setName":"Power of the Elements","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Power-of-the-Elements/Power-Tool-Braver-Dragon?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881400":{"name":"Albtraumlehrling (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Nightmare-Apprentice-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881319":{"name":"Astellar vom Weißen Wald (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Astellar-of-the-White-Forest-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881356":{"name":"Auslöschungsinformant (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Crossout-Designator-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881392":{"name":"Dimensionsverschieber (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Dimension-Shifter-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881259":{"name":"Dunkler Magier (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Dark-Magician-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881366":{"name":"Erhebe dich, Centur-Ion! (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Stand-Up-Centur-Ion-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881377":{"name":"Ernste Warnung (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Solemn-Warning-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881304":{"name":"Geistertrauernde und Mondeskälte (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Ghost-Mourner-Moonlit-Chill-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881295":{"name":"Himmelsjäger-Ass - Raye (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Sky-Striker-Ace-Raye-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881394":{"name":"Himmelsjäger-Ass - Roze (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Sky-Striker-Ace-Roze-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881329":{"name":"I:P Maskerena (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/IP-Masquerena-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881315":{"name":"Liebliches Labrynth von der Silberburg (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Lovely-Labrynth-of-the-Silver-Castle-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881278":{"name":"Neo-Weltraum Aqua Dolphin (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Neo-Spacian-Aqua-Dolphin-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881299":{"name":"Nibiru, das Urwesen (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Nibiru-the-Primal-Being-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881333":{"name":"Prometheische Prinzessin, Verteilerin der Flammen (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Promethean-Princess-Bestower-of-Flames-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881339":{"name":"Raigeki (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Raigeki-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"882204":{"name":"Raigeki (V.3 - Super Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Super Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Raigeki-V3-Super-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881270":{"name":"Rotäugiger schwarzer Drache (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Red-Eyes-Black-Dragon-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881347":{"name":"Topf der Trägheit (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Pot-of-Avarice-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881275":{"name":"Totenkopfdiener (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Skull-Servant-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881409":{"name":"Törichtes Begräbnis (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Foolish-Burial-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881414":{"name":"Unendliche Unbeständigkeit (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Infinite-Impermanence-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881335":{"name":"Wiedergeburt (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Monster-Reborn-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"881374":{"name":"Zwangsevakuierungsgerät (V.1 - Ultra Rare)","set":"RA05","setName":"Rarity Collection 5","rarity":"Ultra Rare","language":"Englisch","condition":"NM","collectorNumber":"","productUrl":"https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Compulsory-Evacuation-Device-V1-Ultra-Rare?sellerCountry=1,2,3,35,5,6,8,9,11,12,7,14,15,16,17,21,19,20,22,23,25,26,27,31,30,10,28&language=1,3&minCondition=2"},"741275":{"name":"Nibiru, das Urwesen","set":"RA01","setName":"25th Anniversary Rarity Collection","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"RA01-EN015","productUrl":""},"264454":{"name":"Raigeki","set":"LCJW","setName":"Legendary Collection 4: Joey's World","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"LCJW-EN057","productUrl":""},"770055":{"name":"Polymerisation","set":"RA02","setName":"25th Anniversary Rarity Collection II","rarity":"Quarter Century Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"RA02-EN047","productUrl":""},"741203":{"name":"Aschenblüte & Freudiger Frühling","set":"RA01","setName":"25th Anniversary Rarity Collection","rarity":"Secret Rare","language":"Englisch","condition":"NM","collectorNumber":"RA01-EN008","productUrl":""}};

const WATCHLIST_REFERENCE = {
  "Aschenblüte & Freudiger Frühling": {productId:"741203", productUrl:"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection/Ash-Blossom-Joyous-Spring-V3-Secret-Rare", currentBuy:3.20, trend:6.00, avg30:6.06},
  "Unendliche Unbeständigkeit": {productUrl:"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection/Infinite-Impermanence-V3-Secret-Rare", currentBuy:3.99, trend:5.27, avg30:5.97},
  "Nibiru, das Urwesen": {productId:"741275", productUrl:"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection/Nibiru-the-Primal-Being-V3-Secret-Rare", currentBuy:1.25, trend:3.93, avg30:3.84},
  "Effektverschleierin": {productUrl:"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection/Effect-Veiler-V3-Secret-Rare", currentBuy:2.30, trend:4.67, avg30:4.65},
  "Ausgeglichener Zweikampf": {productUrl:"https://www.cardmarket.com/de/YuGiOh/Products/Singles/25th-Anniversary-Rarity-Collection/Evenly-Matched-V3-Secret-Rare", currentBuy:2.29, trend:"", avg30:""}
};

const DEFAULT_SETTINGS = window.TcgAppConfig?.DEFAULT_SETTINGS || {
  feePercent: 5, packaging: 0.12, minProfit: 0, minRoi: 25, targetRoi: 30,
  expectedCardsPerOrder: 3, pricingModelVersion: "market-roi-v2-minprofit",
  priceAgeDays: 7, condition: "NM", languages: "DE/EN", targetStock: 3,
  safetyPercent: 5, themeMode: "system", density: "comfortable", startView: "dashboard"
};

const defaultState = {
  settings: structuredClone(DEFAULT_SETTINGS),
  inventory: [],
  privateCollection: [],
  purchases: [],
  sales: [],
  watchlist: [
    {id: (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`), priority:"A", name:"Aschenblüte & Freudiger Frühling", set:"RA01", version:"V.3 – Secret Rare", stock:0, target:3, maxBuy:4.00, targetSell:5.99, ...WATCHLIST_REFERENCE["Aschenblüte & Freudiger Frühling"], reprint:"Mittel", banlist:"Niedrig", priceDate:"2026-07-16"},
    {id: (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`), priority:"A", name:"Unendliche Unbeständigkeit", set:"RA01", version:"V.3 – Secret Rare", stock:0, target:3, maxBuy:4.00, targetSell:5.49, ...WATCHLIST_REFERENCE["Unendliche Unbeständigkeit"], reprint:"Mittel", banlist:"Niedrig", priceDate:"2026-07-16"},
    {id: (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`), priority:"A", name:"Nibiru, das Urwesen", set:"RA01", version:"V.3 – Secret Rare", stock:0, target:3, maxBuy:2.00, targetSell:3.49, ...WATCHLIST_REFERENCE["Nibiru, das Urwesen"], reprint:"Mittel", banlist:"Niedrig", priceDate:"2026-07-16"},
    {id: (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`), priority:"A", name:"Effektverschleierin", set:"RA01", version:"V.3 – Secret Rare", stock:0, target:3, maxBuy:2.75, targetSell:4.29, ...WATCHLIST_REFERENCE["Effektverschleierin"], reprint:"Mittel", banlist:"Niedrig", priceDate:"2026-07-16"},
    {id: (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`), priority:"B", name:"Ausgeglichener Zweikampf", set:"RA01", version:"V.3 – Secret Rare", stock:0, target:3, maxBuy:2.25, targetSell:3.49, ...WATCHLIST_REFERENCE["Ausgeglichener Zweikampf"], reprint:"Mittel", banlist:"Niedrig", priceDate:"2026-07-16"}
  ],
  purchaseDrafts: [],
  collectionPurchaseAnalyses: [],
  activeCollectionAnalysisId: "",
  activePurchaseDraftId: "",
  wantlists: [],
  demandRadar: {records:[], source:"", importedAt:"", sourceDate:""},
  sellers: [],
  customers: [],
  imports: [],
  expenses: [],
  materials: [],
  materialTemplates: [],
  movements: [],
  reconciliations: [],
  capitalAccounts: [],
  capitalEntries: [],
  scannerMappings: [],
  scannerHistory: [],
  cardNamePasscodes: [],
  sync: {autoFolder:true, autoPrices:true, lastPriceUpdate:"", processedFiles:{}, pendingFiles:[]},
  partnerExclusions: {sellers: [], customers: []},
  productCatalog: structuredClone(BUILTIN_PRODUCT_CATALOG)
};

let state = loadState();
let systemThemeQuery = window.matchMedia?.("(prefers-color-scheme: dark)") || null;
let modalHandler = null;
let cardNameLookup = new Map();
let cardNameByNormalizedName = new Map();
let cardNameLookupSignature = "";
let cardNameLookupPromise = null;
let activePerformanceReport = "cards";
let businessHealthDatabaseStatus = null;
let businessHealthStatusPromise = null;
let scannerSessionMode = "business";
let scannerSessionActive = false;
let scannerReviewActive = false;
let scannerSubmissionQueue = [];
let scannerSubmissionProcessing = false;
let scannerDialogSuspended = false;
let saleAllocationShowAll = false;
let saleAllocationDraftSelections = new Map();
let pendingPurchasePriceImport = null;

const views = {
  private: ["Privatsammlung", "Private Karten getrennt vom Geschaeftsbestand verwalten."],
  dashboard: ["Dashboard", "Zentrale Übersicht über Bestand, Käufe, Verkäufe und Gewinn."],
  inventory: ["Bestand", "Jede physische Karte wird einzeln geführt."],
  purchases: ["Einkäufe", "Bestellungen, Lieferstatus, Versand und Einstand."],
  sales: ["Verkäufe", "Verkaufsbestellungen, Gebühren und tatsächlicher Gewinn."],
  salesanalysis: ["Verkaufsanalyse", "Eigene Umschlaggeschwindigkeit, realisierte Preise und Einkaufslernen je Druckvariante."],
  materials: ["Versandmaterial", "Materialbestand, Stückkosten, Mindestbestände und eigene Versandvorlagen."],
  expenses: ["Ausgaben", "Sonstige Betriebsausgaben und Materialeinkäufe nachvollziehbar erfassen."],
  capital: ["Kapital", "Liquide Handelskonten, Kontostände und nachvollziehbarer Buchungsverlauf."],
  slowmovers: ["Langsamdreher", "Gebundenes Kapital nach Alter, Profil und Preisgruppe gezielt prüfen."],
    watchlist: ["Marktbeobachtung", "Wantlisten, Kaufgrenzen, Marktpreise und Preisprüfungen."],
  buying: ["Einkaufsplanung & Nachfrage", "Warenkorb prüfen, Einkaufsentwürfe speichern und gefragte Karten erkennen."],
  collectionpurchases: ["Sammlungsankauf", "Sammlungen als Händler kalkulieren, Risiken prüfen und einen nachvollziehbaren Max-EK bestimmen."],
  partners: ["Händler & Kunden", "Kontakte, Bewertungen, Bestellungen und Umsatz."],
  imports: ["Importe", "Cardmarket-Einkäufe, Verkäufe, Marktpreise und Backups."],
  reports: ["Auswertungen", "Gewinn, ROI, Lagerdauer und Leistung nach Monat."],
  settings: ["Einstellungen", "Gebühren, Grenzwerte und Standardwerte."]
};

function cleanProductId(value) {
  const match = String(value ?? "").match(/\d+/);
  return match ? match[0] : "";
}

function installTextFieldErgonomics(){
  const clearButton=document.createElement("button");
  clearButton.type="button";clearButton.className="active-field-clear";clearButton.textContent="×";clearButton.setAttribute("aria-label","Eingabe leeren");clearButton.hidden=true;
  document.body.appendChild(clearButton);
  let activeField=null,hideTimer=null;
  const isTextField=field=>{
    if(!field||field.disabled||field.readOnly)return false;
    if(field instanceof HTMLTextAreaElement)return true;
    if(!(field instanceof HTMLInputElement))return false;
    return !["button","checkbox","color","date","datetime-local","file","hidden","image","month","radio","range","reset","submit","time","week"].includes(String(field.type||"text").toLowerCase());
  };
  const placeButton=()=>{
    if(!activeField||document.activeElement!==activeField||!activeField.value){clearButton.hidden=true;return;}
    const rect=activeField.getBoundingClientRect();
    if(rect.width<44||rect.height<24){clearButton.hidden=true;return;}
    clearButton.hidden=false;
    clearButton.style.left=`${Math.max(4,rect.right-31)}px`;
    clearButton.style.top=`${Math.max(4,rect.top+(Math.min(rect.height,46)-26)/2)}px`;
  };
  document.addEventListener("focusin",event=>{
    if(!isTextField(event.target))return;
    activeField=event.target;clearTimeout(hideTimer);
    requestAnimationFrame(()=>{
      if(document.activeElement!==activeField)return;
      try{if(activeField.value)activeField.select();}catch(_error){}
      placeButton();
    });
  });
  document.addEventListener("input",event=>{if(event.target===activeField)placeButton();});
  document.addEventListener("focusout",event=>{if(event.target!==activeField)return;hideTimer=setTimeout(()=>{clearButton.hidden=true;activeField=null;},100);});
  clearButton.addEventListener("pointerdown",event=>event.preventDefault());
  clearButton.addEventListener("click",()=>{
    if(!activeField)return;
    activeField.value="";
    activeField.dispatchEvent(new Event("input",{bubbles:true}));
    activeField.dispatchEvent(new Event("change",{bubbles:true}));
    activeField.focus();clearButton.hidden=true;
  });
  window.addEventListener("resize",placeButton);
  document.addEventListener("scroll",placeButton,true);
}

function collectUserProductIds() {
  const ids = new Set();
  const visit = (value, depth = 0) => {
    if (!value || depth > 5) return;
    if (Array.isArray(value)) {
      value.forEach(item => visit(item, depth + 1));
      return;
    }
    if (typeof value !== "object") return;
    const productId = cleanProductId(value.productId);
    if (productId) ids.add(productId);
    ["pendingItems", "items"].forEach(key => visit(value[key], depth + 1));
  };
  [state.inventory, state.privateCollection, state.purchases, state.sales, state.watchlist, state.wantlists, state.collectionPurchaseAnalyses].forEach(value => visit(value));
  return [...ids].sort((a, b) => Number(a) - Number(b));
}

async function refreshCardNameLookup(force = false) {
  if (!window.desktopApp?.getCardNamesForProducts) return 0;
  const productIds = collectUserProductIds();
  const signature = productIds.join(",");
  if (!force && signature === cardNameLookupSignature) return cardNameLookup.size;
  if (cardNameLookupPromise) return cardNameLookupPromise;
  cardNameLookupPromise = (async () => {
    const [rows,backup] = await Promise.all([
      window.desktopApp.getCardNamesForProducts({productIds}),
      window.desktopApp.getCardNameBackup ? window.desktopApp.getCardNameBackup() : null
    ]);
    cardNameLookup = new Map((rows || []).map(row => [String(row.productId), row]));
    const mappingsByMetacard = new Map((backup?.mappings || []).map(row => [String(row.metacardId),{
      metacardId:String(row.metacardId),
      germanName:String(row.nameDe || ""),
      englishName:String(row.nameEn || ""),
      aliases:[]
    }]));
    for (const row of backup?.aliases || []) {
      const mapping=mappingsByMetacard.get(String(row.metacardId));
      if (mapping && row.alias) mapping.aliases.push({language:row.language,alias:String(row.alias)});
    }
    const nameCandidates = new Map();
    for (const mapping of mappingsByMetacard.values()) {
      const names=[mapping.germanName,mapping.englishName,...mapping.aliases.map(row => row.alias)];
      for (const name of names) {
        const key=window.TcgCardSearch?.normalizeSpaced(name) || String(name || "").toLocaleLowerCase("de-DE").trim();
        if (!key) continue;
        if (!nameCandidates.has(key)) nameCandidates.set(key,new Map());
        nameCandidates.get(key).set(mapping.metacardId,mapping);
      }
    }
    cardNameByNormalizedName = new Map([...nameCandidates].flatMap(([key,candidates]) =>
      candidates.size === 1 ? [[key,[...candidates.values()][0]]] : []
    ));
    cardNameLookupSignature = signature;
    return cardNameLookup.size;
  })();
  try {
    return await cardNameLookupPromise;
  } finally {
    cardNameLookupPromise = null;
  }
}

function scheduleCardNameLookupRefresh() {
  clearTimeout(scheduleCardNameLookupRefresh.timer);
  scheduleCardNameLookupRefresh.timer = setTimeout(() => {
    refreshCardNameLookup(false).then(count => {
      if (count) renderAll();
    }).catch(error => console.error("Zweisprachige Kartennamen konnten nicht geladen werden:", error));
  }, 0);
}

function mergeCatalog(base={}, extra={}) {
  return {...base, ...extra};
}

function resolveProduct(productId, fallback={}) {
  const id = cleanProductId(productId);
  const c = catalogCardData({productId:id});
  return {
    productId: id,
    metacardId: c.metacardId || fallback.metacardId || "",
    name: c.germanName || c.name || fallback.name || (id ? `Unbekannte Karte (CM ${id})` : "Unbekannte Karte"),
    germanName: c.germanName || fallback.germanName || "",
    englishName: c.englishName || c.officialBaseName || c.officialName || fallback.englishName || "",
    set: c.set || fallback.set || "",
    setName: c.setName || fallback.setName || "",
    variant: c.variant || fallback.variant || "",
    rarity: c.rarity || fallback.rarity || "",
    language: c.language || fallback.language || state?.settings?.languages || "DE/EN",
    condition: c.condition || fallback.condition || state?.settings?.condition || "NM",
    collectorNumber: c.collectorNumber || fallback.collectorNumber || "",
    productUrl: c.productUrl || fallback.productUrl || ""
  };
}

function businessPrintMetadata(product={}) {
  const fullCode=String(product.collectorNumber||product.setCode||"").trim();
  const setPrefix=String(product.set||(!fullCode.includes("-")?fullCode:fullCode.split("-")[0])||"").trim();
  const rarityParts=[product.variant,product.rarity].map(value=>String(value||"").trim()).filter((value,index,array)=>value&&array.indexOf(value)===index);
  return {
    name:String(product.germanName||product.name||product.officialBaseName||product.officialName||"").trim(),
    germanName:String(product.germanName||"").trim(),englishName:String(product.englishName||product.officialBaseName||product.officialName||product.name||"").trim(),
    metacardId:cleanProductId(product.metacardId),set:setPrefix,setName:String(product.setName||"").trim(),
    collectorNumber:fullCode.includes("-")?fullCode:"",rarity:rarityParts.join(" · "),
    productUrl:String(product.productUrl||"").trim(),
    printDataSource:String(product.setDataSource||product.source||"Cardmarket-Katalog").trim(),
    printDataUpdatedAt:String(product.updatedAt||state.cardmarket?.cardDataImportedAt||new Date().toISOString()).trim()
  };
}

function missingBusinessPrintField(field,value) {
  const text=String(value||"").trim();
  if(!text||text==="-")return true;
  if(field==="name"&&/^Unbekannte Karte|^CM Produkt/i.test(text))return true;
  if(field==="set"&&/^Expansion\s+\d+$/i.test(text))return true;
  if(field==="collectorNumber"&&!text.includes("-"))return true;
  return /unbekannt|fehlt/i.test(text);
}

function applyBusinessProductMetadata(products=[]) {
  const byId=new Map((Array.isArray(products)?products:[]).map(product=>[cleanProductId(product.productId||product.idProduct),product]).filter(([id])=>id));
  if(!byId.size)return 0;
  let changed=0;
  const apply=(record,product,watchlist=false)=>{
    if(!record||!product)return;
    const metadata=businessPrintMetadata(product);
    const mapping=watchlist?{name:"name",germanName:"germanName",englishName:"englishName",set:"set",rarity:"version",productUrl:"productUrl"}:{name:"name",germanName:"germanName",englishName:"englishName",metacardId:"metacardId",set:"set",setName:"setName",collectorNumber:"collectorNumber",rarity:"rarity",productUrl:"productUrl"};
    let metadataApplied=false;
    Object.entries(mapping).forEach(([source,target])=>{
      const value=metadata[source];
      if(!value||!missingBusinessPrintField(source,record[target]))return;
      record[target]=value;changed++;metadataApplied=true;
    });
    if(watchlist){
      [["setName",metadata.setName],["collectorNumber",metadata.collectorNumber],["rarity",metadata.rarity]].forEach(([field,value])=>{
        if(value&&missingBusinessPrintField(field,record[field])){record[field]=value;changed++;metadataApplied=true;}
      });
    }
    if(metadataApplied){record.printDataSource=metadata.printDataSource;record.printDataUpdatedAt=metadata.printDataUpdatedAt;}
  };
  const records=[];
  (state.inventory||[]).forEach(record=>records.push(record));
  (state.privateCollection||[]).forEach(record=>records.push(record));
  (state.purchases||[]).forEach(order=>(order.pendingItems||[]).forEach(record=>records.push(record)));
  (state.sales||[]).forEach(order=>(order.items||[]).forEach(record=>records.push(record)));
  records.forEach(record=>apply(record,byId.get(cleanProductId(record.productId))));
  (state.watchlist||[]).forEach(record=>apply(record,byId.get(cleanProductId(record.productId)),true));
  (state.wantlists||[]).forEach(list=>(list.entries||[]).forEach(record=>apply(record,byId.get(cleanProductId(record.productId)),true)));

  const usedIds=new Set([...records,...(state.watchlist||[]),...(state.wantlists||[]).flatMap(list=>list.entries||[])].map(record=>cleanProductId(record.productId)).filter(Boolean));
  usedIds.forEach(productId=>{
    const product=byId.get(productId);if(!product)return;
    const current=state.productCatalog[productId]||{productId};
    const metadata=businessPrintMetadata(product);
    Object.entries(metadata).forEach(([field,value])=>{
      if(!value||!missingBusinessPrintField(field,current[field]))return;
      current[field]=value;changed++;
    });
    state.productCatalog[productId]=current;
  });
  return changed;
}

window.tcgApplyBusinessProductMetadata=applyBusinessProductMetadata;

function inventoryVariantKey(item={}) {
  const language = mapLanguage(item.language || "").trim().toUpperCase();
  const condition = mapCondition(item.condition || "").trim().toUpperCase();
  return [cleanProductId(item.productId), language, condition].join("|");
}

function pendingOpenPurchaseQuantities(purchases=[]) {
  const pending = new Map();
  purchases
    .filter(p => p && !["Eingetroffen", "Storniert"].includes(p.status))
    .forEach(p => (Array.isArray(p.pendingItems) ? p.pendingItems : []).forEach((item,index) => {
      const key = inventoryVariantKey(item);
      if (!cleanProductId(item.productId)) return;
      const open=window.TcgBusinessAutomation?.normalizePurchaseReceiptLine?.(item,index).open ?? Math.max(0,Number(item.quantity||0));
      pending.set(key, (pending.get(key) || 0) + Math.max(0,Number(open||0)));
    }));
  return pending;
}

function removeStockCopiesCoveredByOpenPurchases(inventory=[], purchases=[]) {
  const pending = pendingOpenPurchaseQuantities(purchases);
  if (!pending.size) return inventory;

  // Nur automatisch aus einer Bestands-CSV erzeugte Sammlungskarten anfassen.
  // Manuell angelegte Karten und bereits verkaufte Historie bleiben unberührt.
  const candidates = inventory
    .map((item, index) => ({item, index}))
    .filter(({item}) => item.status !== "Verkauft" &&
      (/^STOCK-/i.test(item.importKey || item.lotId || "") || item.source === "Eigene Sammlung / Packpull"));

  const removeIndexes = new Set();
  candidates.forEach(({item, index}) => {
    const key = inventoryVariantKey(item);
    const remaining = pending.get(key) || 0;
    if (remaining <= 0) return;
    removeIndexes.add(index);
    pending.set(key, remaining - 1);
  });
  return inventory.filter((_, index) => !removeIndexes.has(index));
}


function normalizePartnerRecord(record={}, kind="seller") {
  const base = {
    id: record.id || crypto.randomUUID(),
    name: record.name || "",
    cardmarketName: record.cardmarketName || record.name || "",
    externalId: record.externalId || record.cardmarketId || "",
    realName: record.realName || "",
    country: record.country || "",
    language: record.language || "",
    email: record.email || "",
    phone: record.phone || "",
    status: record.status || "Aktiv",
    favorite: Boolean(record.favorite),
    blocked: Boolean(record.blocked),
    note: record.note || "",
    createdAt: record.createdAt || new Date().toISOString().slice(0,10)
  };
  if (kind === "seller") return {
    ...base,
    rating: record.rating || "",
    communication: record.communication || "",
    shippingSpeed: record.shippingSpeed || "",
    packagingQuality: record.packagingQuality || "",
    conditionAccuracy: record.conditionAccuracy || "",
    complaints: Number(record.complaints || 0)
  };
  return {
    ...base,
    rating: record.rating || "Offen",
    preferredShipping: record.preferredShipping || "",
    trackingRequired: Boolean(record.trackingRequired),
    complaints: Number(record.complaints || 0)
  };
}

function ensurePartnerRecords() {
  const excludedSellers = new Set((state.partnerExclusions?.sellers||[]).map(x=>String(x).toLowerCase()));
  const excludedCustomers = new Set((state.partnerExclusions?.customers||[]).map(x=>String(x).toLowerCase()));
  const sellerByName = new Map(state.sellers.map(s => [String(s.name||"").toLowerCase(), s]));
  state.purchases.forEach(p => {
    const name = String(p.seller||"").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (excludedSellers.has(key)) return;
    if (!sellerByName.has(key)) {
      const seller = normalizePartnerRecord({name, cardmarketName:name, country:p.country||""}, "seller");
      state.sellers.push(seller); sellerByName.set(key, seller);
    }
  });
  const customerByName = new Map(state.customers.map(c => [String(c.name||"").toLowerCase(), c]));
  state.sales.forEach(s => {
    const name = String(s.customer||"").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (excludedCustomers.has(key)) return;
    if (!customerByName.has(key)) {
      const customer = normalizePartnerRecord({name, cardmarketName:name, country:s.country||""}, "customer");
      state.customers.push(customer); customerByName.set(key, customer);
    }
  });
}

function sellerStats(seller) {
  const orders = state.purchases.filter(p => String(p.seller||"").toLowerCase() === String(seller.name||"").toLowerCase());
  const cards = orders.reduce((sum,p)=>sum+Number(p.items||0),0);
  const cardValue = orders.reduce((sum,p)=>sum+Number(p.cardValue||0),0);
  const shipping = orders.reduce((sum,p)=>sum+Number(p.shipping||0),0);
  const extra = orders.reduce((sum,p)=>sum+Number(p.extra||0),0);
  const total = cardValue + shipping + extra;
  const dates = orders.map(p=>p.date).filter(Boolean).sort();
  return {orders,cards,cardValue,shipping,extra,total,avgShipping:orders.length?shipping/orders.length:0,first:dates[0]||"",last:dates.at(-1)||""};
}

function customerStats(customer) {
  const orders = state.sales.filter(s => String(s.customer||"").toLowerCase() === String(customer.name||"").toLowerCase());
  const cards = orders.reduce((sum,s)=>sum+Number(s.quantity||0),0);
  const realized=orders.filter(s=>["Abgeschlossen","Abgerechnet","Erstattet","Rückgabe eingetroffen"].includes(s.status));
  const revenue = realized.reduce((sum,s)=>sum+Math.max(0,Number(s.revenue||0)-Number(s.refund||0)),0);
  const knownProfitSales=realized.map(s=>calculateSaleProfit(s)).filter(result=>result.profitKnown!==false);
  const profit = knownProfitSales.reduce((sum,result)=>sum+result.profit,0);
  const dates = orders.map(s=>s.date).filter(Boolean).sort();
  return {orders,cards,revenue,profit,avgOrder:realized.length?revenue/realized.length:0,first:dates[0]||"",last:dates.at(-1)||""};
}

function migrateState(data) {
  const migrated = {...structuredClone(defaultState), ...data};
  const settingsInput={...(data.settings||{})};
  if(settingsInput.pricingModelVersion!=="market-roi-v2-minprofit"){
    settingsInput.minProfit=Math.max(0,Number(settingsInput.minProfit||0));
    settingsInput.minRoi=Math.max(25,Number(settingsInput.minRoi||0));
    settingsInput.targetRoi=Math.max(30,Number(settingsInput.targetRoi||0));
    settingsInput.expectedCardsPerOrder=Math.max(1,Number(settingsInput.expectedCardsPerOrder||3));
    settingsInput.pricingModelVersion="market-roi-v2-minprofit";
  }
  migrated.settings = window.TcgAppConfig?.normalizeSettings
    ? window.TcgAppConfig.normalizeSettings(settingsInput)
    : {...defaultState.settings, ...settingsInput};
  migrated.inventory = Array.isArray(data.inventory) ? data.inventory : [];
  migrated.privateCollection = Array.isArray(data.privateCollection) ? data.privateCollection : [];
  migrated.purchases = Array.isArray(data.purchases) ? data.purchases : [];
  migrated.sales = Array.isArray(data.sales) ? data.sales : [];
  migrated.watchlist = Array.isArray(data.watchlist) ? data.watchlist : structuredClone(defaultState.watchlist);
  migrated.purchaseDrafts = Array.isArray(data.purchaseDrafts) ? data.purchaseDrafts : [];
  migrated.activePurchaseDraftId = String(data.activePurchaseDraftId||"");
  migrated.collectionPurchaseAnalyses = (Array.isArray(data.collectionPurchaseAnalyses) ? data.collectionPurchaseAnalyses : []).map((analysis,index)=>{
    const photoEvidence=window.TcgCollectionPhotoModel?.normalizeAnalysisPhotoEvidence?.(analysis)||{photos:[],photoObservations:[],physicalCards:[]};
    return {
    id:String(analysis?.id||`collection-analysis-${index}`), title:"", sourceType:"Kleinanzeigen", sellerName:"", url:"", date:todayISO(),
    sellerPrice:0, shipping:0, extra:0, notes:"", items:[], decisionSnapshots:[], ...analysis,...photoEvidence,
    items:(Array.isArray(analysis?.items)?analysis.items:[]).map((item,itemIndex)=>({
      ...item,id:String(item?.id||`${analysis?.id||`collection-analysis-${index}`}:item:${itemIndex}`), quantity:Math.max(1,Math.round(Number(item?.quantity||1))),
      condition:item?.condition||"UNBEKANNT", language:item?.language||"", printConfidence:["confirmed","likely","unknown"].includes(item?.printConfidence)?item.printConfidence:"unknown"
    })),
    decisionSnapshots:Array.isArray(analysis?.decisionSnapshots)?analysis.decisionSnapshots:[]
  };});
  migrated.activeCollectionAnalysisId = String(data.activeCollectionAnalysisId||"");
  migrated.wantlists = (Array.isArray(data.wantlists) ? data.wantlists : []).map(list=>({
    ...list,
    purpose:list.purpose||"Geschäftsbestand",
    entries:(Array.isArray(list.entries)?list.entries:[]).map(entry=>({history:[],archived:false,...entry}))
  }));
  migrated.demandRadar = {...defaultState.demandRadar,...(data.demandRadar||{})};
  migrated.demandRadar.records = Array.isArray(data.demandRadar?.records) ? data.demandRadar.records : [];
  migrated.expenses = Array.isArray(data.expenses) ? data.expenses : [];
  migrated.materials = Array.isArray(data.materials) ? data.materials : [];
  migrated.materialTemplates = Array.isArray(data.materialTemplates) ? data.materialTemplates : [];
  migrated.movements = Array.isArray(data.movements) ? data.movements : [];
  migrated.reconciliations = Array.isArray(data.reconciliations) ? data.reconciliations : [];
  migrated.capitalAccounts = Array.isArray(data.capitalAccounts) ? data.capitalAccounts : [];
  migrated.capitalEntries = Array.isArray(data.capitalEntries) ? data.capitalEntries : [];
  migrated.scannerMappings = Array.isArray(data.scannerMappings) ? data.scannerMappings : [];
  migrated.scannerHistory = Array.isArray(data.scannerHistory) ? data.scannerHistory.slice(-200) : [];
  migrated.cardNamePasscodes = (Array.isArray(data.cardNamePasscodes) ? data.cardNamePasscodes : []).map(row=>({metacardId:String(row?.metacardId||""),passcode:String(row?.passcode||"")})).filter(row=>/^\d+$/.test(row.metacardId)&&/^\d{8}$/.test(row.passcode));
  migrated.sellers = (Array.isArray(data.sellers) ? data.sellers : []).map(s=>normalizePartnerRecord(s,"seller"));
  migrated.customers = (Array.isArray(data.customers) ? data.customers : []).map(c=>normalizePartnerRecord(c,"customer"));
  migrated.imports = Array.isArray(data.imports) ? data.imports : [];
  migrated.sync = {...defaultState.sync, ...(data.sync||{})};
  migrated.sync.processedFiles = {...((data.sync||{}).processedFiles||{})};
  migrated.sync.pendingFiles = [];
  migrated.partnerExclusions = {sellers:[...((data.partnerExclusions||{}).sellers||[])], customers:[...((data.partnerExclusions||{}).customers||[])]};
  migrated.productCatalog = mergeCatalog(BUILTIN_PRODUCT_CATALOG, data.productCatalog||{});

  migrated.inventory.forEach(i=>{
    i.productId = cleanProductId(i.productId);
    const p = migrated.productCatalog[i.productId] || {};
    if (!i.name || /^Produkt\s*=|^Produkt\s+\d+$/i.test(i.name)) i.name = p.name || (i.productId ? `Unbekannte Karte (CM ${i.productId})` : "Unbekannte Karte");
    if (!i.set) i.set = p.set || "";
    if (!i.rarity) i.rarity = p.rarity || "";
    if (!i.language || /^\d+$/.test(i.language)) i.language = p.language || mapLanguage(i.language);
    if (!i.condition || /^\d+$/.test(i.condition)) i.condition = p.condition || mapCondition(i.condition);
    if (!i.productUrl) i.productUrl = p.productUrl || "";
    if (!i.status) i.status = "Im Bestand";
    if(!["known","confirmed_zero","unknown"].includes(i.costStatus)){
      const originalCost=i.cost;
      i.costStatus=Number(originalCost)>0?"known":(i.purchaseId&&(i.purchaseLineKey||i.costConfirmed===true)?"confirmed_zero":"unknown");
    }
    i.cost = Number(i.cost||0);
    i.listingPrice = Number(i.listingPrice||0);
    if (i.listed === undefined) i.listed = i.listingPrice > 0;
    i.originalTargetSell=i.originalTargetSell===""||i.originalTargetSell==null?null:Number(i.originalTargetSell);
    i.targetSell=i.targetSell===""||i.targetSell==null?null:Number(i.targetSell);
    if(String(i.holdingProfile||"").toLowerCase()==="long_term")i.longTermHold=true;
    i.holdingProfile=window.TcgBusinessAutomation?.normalizeHoldingProfile?.(i.holdingProfile)||"UNKLASSIFIZIERT";
    i.longTermHold=Boolean(i.longTermHold);
    i.listingHistory=Array.isArray(i.listingHistory)?i.listingHistory:[];
    if(i.listingPrice>0&&!i.listingHistory.length){
      i.listingHistory.push({id:`legacy-listing:${i.id||crypto.randomUUID()}`,eventType:"baseline",changedAt:i.listedAt||i.purchaseDate||new Date().toISOString(),oldPrice:null,newPrice:i.listingPrice,changeMode:"legacy",reason:"Bestehender Inseratspreis bei Datenmodell-Umstieg"});
    }
    if (i.status === "Verkauft" && !i.saleId && !i.saleOrderNo && /^IMPORT-/.test(i.lotId||"")) {
      i.status = "Im Bestand";
      delete i.saleDate;
    }
  });

  // Karten aus noch nicht eingetroffenen Einkäufen dürfen nicht im Bestand stehen.
  // Ältere Backups werden dabei automatisch in offene Wareneingangspositionen umgewandelt.
  // Bis Patch 9 wurden vollstaendige Cardmarket-Bestandsexporte teilweise wie
  // einzelne Zugaenge addiert. Eindeutig erkennbare, noch freie Alt-Snapshots
  // werden einmalig auf den neuesten Stand zusammengefuehrt. Reservierte,
  // verkaufte, manuell erfasste und einkaufsbezogene Exemplare bleiben erhalten.
  const legacyCleanup=window.TcgBusinessAutomation?.planLegacyStockSnapshotCleanup?.(migrated.inventory);
  if(legacyCleanup?.removedCount){
    const removeIds=new Set(legacyCleanup.removeIds);
    legacyCleanup.groups.forEach(group=>{
      const removed=migrated.inventory.filter(item=>group.removeIds.includes(item.id));
      removed.forEach(item=>{
        if(item.movementRecorded)return;
        migrated.movements.push({
          id:(globalThis.crypto?.randomUUID?.()||`migration-${Date.now()}-${Math.random()}`),timestamp:item.purchaseDate||new Date().toISOString(),type:"Historischer Bestandseintrag",quantity:1,
          productId:cleanProductId(item.productId),inventoryGroupKey:inventoryGroupKey(item),inventoryItemId:item.id,
          reference:item.importKey||item.lotId||"Früherer Bestand",note:item.location||""
        });
      });
      const example=removed[0]||migrated.inventory.find(item=>inventoryVariantKey(item)===group.variantKey);
      migrated.movements.push({
        id:(globalThis.crypto?.randomUUID?.()||`migration-${Date.now()}-${Math.random()}`),timestamp:new Date().toISOString(),type:"Automatische Korrektur doppelter Bestandssnapshots",
        quantity:-group.removeIds.length,productId:cleanProductId(example?.productId),
        inventoryGroupKey:example?inventoryGroupKey(example):"",reference:"Bestandsmigration",
        note:`${group.sourceKeys.length} alte Vollsnapshots erkannt; der neueste Stand bleibt erhalten.`,
        removedIds:[...group.removeIds],systemRepair:true
      });
    });
    migrated.inventory=migrated.inventory.filter(item=>!removeIds.has(item.id));
  }

  // Aeltere Bestandsimporte konnten ein bereits aus einem Einkauf vorhandenes
  // Exemplar noch einmal als reines Cardmarket-Snapshot-Exemplar anlegen. Die
  // Inseratsdaten werden auf das Einkaufsexemplar uebertragen; die zusaetzliche
  // Snapshot-Kopie wird entfernt. Verkaufs- und Reservierungsdaten sind durch
  // den gemeinsamen Planer ausdruecklich geschuetzt.
  const stockPurchaseRepair=window.TcgBusinessAutomation?.planStockPurchaseDuplicateReconciliation?.(migrated.inventory);
  if(stockPurchaseRepair?.mergedCount){
    const pairsByVariant=new Map();
    stockPurchaseRepair.pairs.forEach(pair=>{
      const target=migrated.inventory.find(item=>item.id===pair.targetId);
      const duplicate=migrated.inventory.find(item=>item.id===pair.duplicateId);
      if(!target||!duplicate)return;
      [
        "articleId","stockIdentity","lastStockSnapshot","listed","listingPrice",
        "productUrl","germanName","englishName","set","setName","variant",
        "rarity","collectorNumber","language","condition","edition"
      ].forEach(field=>{
        if(duplicate[field]!==undefined&&duplicate[field]!==null&&duplicate[field]!=="")target[field]=duplicate[field];
      });
      if(!pairsByVariant.has(pair.variantKey))pairsByVariant.set(pair.variantKey,[]);
      pairsByVariant.get(pair.variantKey).push({target,duplicate});
    });
    const removeIds=new Set(stockPurchaseRepair.removeIds);
    migrated.inventory=migrated.inventory.filter(item=>!removeIds.has(item.id));
    pairsByVariant.forEach(pairs=>{
      const example=pairs[0]?.target;
      migrated.movements.push({
        id:(globalThis.crypto?.randomUUID?.()||`migration-${Date.now()}-${Math.random()}`),timestamp:new Date().toISOString(),
        type:"Automatische Zusammenfuehrung von Cardmarket-Inseraten",quantity:-pairs.length,
        productId:cleanProductId(example?.productId),inventoryGroupKey:example?inventoryGroupKey(example):"",
        reference:"Bestandsmigration",note:"Cardmarket-Snapshot mit vorhandenem Einkaufsexemplar verbunden; der Einstand bleibt erhalten.",
        removedIds:pairs.map(pair=>pair.duplicate.id),systemRepair:true
      });
    });
  }

  const purchaseById = Object.fromEntries(migrated.purchases.map(p=>[p.id,p]));
  migrated.purchases.forEach(p=>{
    if (!Array.isArray(p.pendingItems)) p.pendingItems = [];

    // Anzahl und Kartenwert immer aus den tatsächlichen Positionen neu berechnen.
    // Cardmarket liefert eine CSV-Zeile je Artikelposition, die Menge steht in groupCount.
    if (p.pendingItems.length) {
      const recalculatedItems = p.pendingItems.reduce((sum,item)=>sum + Math.max(0, Number(item.quantity||0)), 0);
      const recalculatedCardValue = p.pendingItems.reduce((sum,item)=>
        sum + Math.max(0, Number(item.quantity||0)) * Number(item.unitPrice||0), 0);
      if (recalculatedItems > 0) p.items = recalculatedItems;
      if (recalculatedCardValue > 0) p.cardValue = recalculatedCardValue;
    }

    // Korrektur der bereits importierten Bestellung aus dem bisherigen Backup.
    // Diese Werte stammen aus der Cardmarket-Bestellübersicht des Nutzers.
    if (String(p.orderNo||"").replace(/\D/g,"") === "1288396380") {
      p.items = 8;
      p.cardValue = 25.10;
      if (!Number(p.shipping||0)) p.shipping = 3.95;
      if (!Number(p.extra||0)) p.extra = 0.26;
      if (!p.seller || p.seller === "Aus CSV") p.seller = "Niklas Kandler";
    }

    const linked = migrated.inventory.filter(i=>i.purchaseId===p.id && i.status!=="Verkauft");
    if (p.status!=="Eingetroffen" && linked.length && !p.pendingItems.length) {
      const grouped={};
      linked.forEach(i=>{
        const key=[i.productId,i.name,i.set,i.rarity,i.language,i.condition,i.cost].join("|");
        grouped[key] ??= {
          productId:i.productId,name:i.name,set:i.set,setName:i.setName||"",rarity:i.rarity,
          language:i.language,condition:i.condition,collectorNumber:i.collectorNumber||"",
          productUrl:i.productUrl||"",quantity:0,unitPrice:Number(i.cost||0),sourceRow:i.sourceRow
        };
        grouped[key].quantity++;
      });
      p.pendingItems=Object.values(grouped);
    }
  });
  migrated.inventory = migrated.inventory.filter(i=>{
    const purchase = purchaseById[i.purchaseId];
    if (!purchase) return true;
    if (["Eingetroffen","Teilweise eingetroffen"].includes(purchase.status)) return true;
    return i.status === "Verkauft"; // Bereits verkaufte Historie niemals automatisch entfernen.
  });
  // Auch Karten aus einem Cardmarket-Bestandsimport dürfen offene Bestellungen
  // nicht vorzeitig materialisieren. Entsprechende Mengen werden automatisch entfernt.
  migrated.inventory = removeStockCopiesCoveredByOpenPurchases(migrated.inventory, migrated.purchases);

  migrated.purchases.forEach(p=>{
    p.inventoryCreated = migrated.inventory.some(i=>i.purchaseId===p.id);
    p.costAllocationMethod = p.costAllocationMethod === "quantity" ? "quantity" : "value";
    (p.pendingItems||[]).forEach((item,index)=>{
      item.receiptLineKey ||= window.TcgBusinessAutomation?.purchaseLineKey?.(item,index) || String(item.articleId||item.sourceRow||`${item.productId||"unknown"}:${index}`);
      const lineKey=`${p.id}:${item.receiptLineKey}`;
      const linkedBusiness=migrated.inventory.filter(asset=>asset.purchaseId===p.id && asset.status!=="Beschädigt" && (asset.purchaseLineKey===lineKey || (!asset.purchaseLineKey&&cleanProductId(asset.productId)===cleanProductId(item.productId)))).length;
      const linkedPrivate=migrated.privateCollection.filter(asset=>asset.purchaseId===p.id && (asset.purchaseLineKey===lineKey || (!asset.purchaseLineKey&&cleanProductId(asset.productId)===cleanProductId(item.productId)))).length;
      item.receivedBusiness=Math.max(Number(item.receivedBusiness||0),linkedBusiness);
      item.materializedBusiness=Math.max(Number(item.materializedBusiness||0),linkedBusiness);
      item.receivedPrivate=Math.max(Number(item.receivedPrivate||0),linkedPrivate);
      item.materializedPrivate=Math.max(Number(item.materializedPrivate||0),linkedPrivate);
      item.receivedDamaged=Number(item.receivedDamaged||0);
      item.materializedDamaged=Number(item.materializedDamaged||0);
      item.cancelledQuantity=Number(item.cancelledQuantity||0);
      item.cartFillerStatus=["yes","no"].includes(item.cartFillerStatus)?item.cartFillerStatus:"unknown";
      item.incrementalShippingCost=item.incrementalShippingCost===""||item.incrementalShippingCost==null?null:Number(item.incrementalShippingCost);
      item.incrementalDirectCost=item.incrementalDirectCost===""||item.incrementalDirectCost==null?null:Number(item.incrementalDirectCost);
      item.decisionCostStatus=item.decisionCostStatus==="known"?"known":"unknown";
      item.confirmedTargetSellPrice=item.confirmedTargetSellPrice===""||item.confirmedTargetSellPrice==null?null:Number(item.confirmedTargetSellPrice);
    });
    if(p.pendingItems?.length)p.inventoryCreated=p.pendingItems.every((item,index)=>(window.TcgBusinessAutomation?.normalizePurchaseReceiptLine?.(item,index).open??1)===0);
  });

  // Remove the old bug where a Cardmarket stock CSV was imported as one fake sale.
  migrated.sales = migrated.sales.filter(s => !(/cardmarket-stock/i.test(s.note||"") && Number(s.revenue||0)===0));
  migrated.imports = migrated.imports.filter(i => !(i.type==="sale" && /cardmarket-stock/i.test(i.file||"")));
  // Kontakte aus vorhandenen Bestellungen und Verkäufen ergänzen.
  const sellerKeys = new Set(migrated.sellers.map(s=>String(s.name||"").toLowerCase()));
  migrated.purchases.forEach(p=>{
    const name=String(p.seller||"").trim(); if(!name || sellerKeys.has(name.toLowerCase())) return;
    migrated.sellers.push(normalizePartnerRecord({name,cardmarketName:name,country:p.country||""},"seller"));
    sellerKeys.add(name.toLowerCase());
  });
  const customerKeys = new Set(migrated.customers.map(c=>String(c.name||"").toLowerCase()));
  migrated.sales.forEach(s=>{
    const name=String(s.customer||"").trim(); if(!name || customerKeys.has(name.toLowerCase())) return;
    migrated.customers.push(normalizePartnerRecord({name,cardmarketName:name,country:s.country||""},"customer"));
    customerKeys.add(name.toLowerCase());
  });
  migrated.watchlist.forEach(w=>{
    const ref=WATCHLIST_REFERENCE[w.name]; if(!ref) return;
    if(!cleanProductId(w.productId) && ref.productId) w.productId=ref.productId;
    if(!w.productUrl) w.productUrl=ref.productUrl;
    if(w.currentBuy==="" || w.currentBuy===undefined || w.currentBuy===null) w.currentBuy=ref.currentBuy;
    if(w.trend==="" || w.trend===undefined || w.trend===null) w.trend=ref.trend;
    if(w.avg30==="" || w.avg30===undefined || w.avg30===null) w.avg30=ref.avg30;
    if(!w.priceDate) w.priceDate="2026-07-16";
  });
  migrated.purchases.forEach(p=>{ if(!Array.isArray(p.pendingItems)) p.pendingItems=[]; });
  migrated.privateCollection.forEach(item=>{
    item.status=item.status||"Privatsammlung";
    if(!["known","confirmed_zero","unknown"].includes(item.costStatus))item.costStatus=Number(item.cost)>0?"known":"unknown";
    item.cost=Number(item.cost||0);
    item.listingPrice=Number(item.listingPrice||0);
    item.originalTargetSell=item.originalTargetSell===""||item.originalTargetSell==null?null:Number(item.originalTargetSell);
    item.targetSell=item.targetSell===""||item.targetSell==null?null:Number(item.targetSell);
    if(String(item.holdingProfile||"").toLowerCase()==="long_term")item.longTermHold=true;
    item.holdingProfile=window.TcgBusinessAutomation?.normalizeHoldingProfile?.(item.holdingProfile)||"UNKLASSIFIZIERT";
    item.longTermHold=Boolean(item.longTermHold);
    item.listingHistory=Array.isArray(item.listingHistory)?item.listingHistory:[];
    if(item.listingPrice>0&&!item.listingHistory.length)item.listingHistory.push({id:`legacy-listing:${item.id||crypto.randomUUID()}`,eventType:"baseline",changedAt:item.listedAt||item.purchaseDate||new Date().toISOString(),oldPrice:null,newPrice:item.listingPrice,changeMode:"legacy",reason:"Bestehender Inseratspreis bei Datenmodell-Umstieg"});
  });
  migrated.sales.forEach(s=>{ if(!Array.isArray(s.items)) s.items=[]; if(!Array.isArray(s.itemIds)) s.itemIds=[]; if(!Array.isArray(s.materialUsage)) s.materialUsage=[]; if(!s.workflowStage) s.workflowStage = s.status==="Bezahlt" ? "Kommissioniert" : (["Kommissioniert","Verpackt","Versendet","Abgeschlossen"].includes(s.status) ? s.status : "Offen"); if(!Array.isArray(s.pickedItems)) s.pickedItems=[]; });
  return migrated;
}

function loadState() {
  try {
    let raw = localStorage.getItem(DB_KEY);
    if(!raw && typeof LEGACY_DB_KEYS!=="undefined") {
      for(const key of LEGACY_DB_KEYS){ raw=localStorage.getItem(key); if(raw) break; }
    }
    raw = raw || localStorage.getItem("tcgWawiState_v2") || localStorage.getItem("tcgWawiState_v1");
    return raw ? migrateState(JSON.parse(raw)) : structuredClone(defaultState);
  } catch (error) {
    console.error(error);
    return structuredClone(defaultState);
  }
}

let tradeInsightsCache = null;
let tradeInsightsPromise = null;
let marketDecisionHistoryByProduct = {};
let marketDecisionHistoryPromise = null;
let marketDecisionHistorySignature = '';
let ownSalesExperienceCache = { calculatedAt:'', summary:{}, records:[] };
let ownSalesExperienceByProduct = new Map();
let ownSalesExperiencePromise = null;

function ownSalesExperienceFor(productId){
  return ownSalesExperienceByProduct.get(cleanProductId(productId)) || null;
}

function refreshOwnSalesExperience(force=false){
  if(!window.desktopApp?.getOwnSalesExperience)return Promise.resolve(ownSalesExperienceCache);
  if(ownSalesExperiencePromise)return ownSalesExperiencePromise;
  if(!force&&ownSalesExperienceCache.calculatedAt)return Promise.resolve(ownSalesExperienceCache);
  ownSalesExperiencePromise=window.desktopApp.getOwnSalesExperience({asOf:new Date().toISOString()}).then(result=>{
    ownSalesExperienceCache=result||{calculatedAt:'',summary:{},records:[]};
    ownSalesExperienceByProduct=new Map((ownSalesExperienceCache.records||[]).map(row=>[cleanProductId(row.productId),row]));
    renderAll();
    return ownSalesExperienceCache;
  }).catch(error=>{
    console.error('Eigene Verkaufserfahrung konnte nicht geladen werden:',error);
    return ownSalesExperienceCache;
  }).finally(()=>{ownSalesExperiencePromise=null;});
  return ownSalesExperiencePromise;
}

function marketDecisionHistoryRequest() {
  const targetDates = {};
  const productIds = [];
  phase2CurrentInventory().forEach(item => {
    const productId = cleanProductId(item.productId);
    if (!productId) return;
    productIds.push(productId);
    targetDates[productId] ||= [];
    const purchaseDate = window.TcgBusinessAutomation?.inventoryStartDate?.(item);
    const listingDate = window.TcgBusinessAutomation?.listingStartDate?.(item);
    [purchaseDate, listingDate].filter(Boolean).forEach(date => targetDates[productId].push(String(date).slice(0, 10)));
  });
  (state.collectionPurchaseAnalyses||[]).flatMap(analysis=>analysis.items||[]).forEach(item=>{
    const productId=cleanProductId(item.productId);if(!productId)return;
    productIds.push(productId);targetDates[productId]||=[];
  });
  Object.keys(targetDates).forEach(productId => { targetDates[productId] = [...new Set(targetDates[productId])]; });
  return { productIds: [...new Set(productIds)], targetDates, recentDays: 45 };
}

function refreshMarketDecisionHistory(force = false) {
  if (!window.desktopApp?.getMarketDecisionHistory || marketDecisionHistoryPromise) return marketDecisionHistoryPromise;
  const request = marketDecisionHistoryRequest();
  const signature = JSON.stringify(request);
  if (!force && signature === marketDecisionHistorySignature) return Promise.resolve(marketDecisionHistoryByProduct);
  marketDecisionHistoryPromise = window.desktopApp.getMarketDecisionHistory(request).then(result => {
    marketDecisionHistoryByProduct = result?.histories || {};
    marketDecisionHistorySignature = signature;
    renderAll();
    return marketDecisionHistoryByProduct;
  }).catch(error => {
    console.error('Price-Guide-Historie für PHASE 3 konnte nicht geladen werden:', error);
    return marketDecisionHistoryByProduct;
  }).finally(() => { marketDecisionHistoryPromise = null; });
  return marketDecisionHistoryPromise;
}

function scheduleMarketDecisionHistoryRefresh() {
  clearTimeout(scheduleMarketDecisionHistoryRefresh.timer);
  scheduleMarketDecisionHistoryRefresh.timer = setTimeout(() => refreshMarketDecisionHistory(false), 120);
}

function saveState({ allowDestructiveReset = false } = {}) {
  const savedAt = new Date().toISOString();
  const serialized = JSON.stringify(state);
  localStorage.setItem(DB_KEY, serialized);
  localStorage.setItem(DESKTOP_UPDATED_KEY, savedAt);
  scheduleCardNameLookupRefresh();
  scheduleMarketDecisionHistoryRefresh();

  const el = document.getElementById("saveStatus");
  const sequence = (saveState.sequence || 0) + 1;
  saveState.sequence = sequence;
  clearTimeout(saveState.t);

  if (!window.desktopApp?.saveState) {
    if (el) el.textContent = "Lokal gespeichert";
    saveState.t = setTimeout(() => { if (el) el.textContent = "Bereit"; }, 1200);
    return;
  }

  if (el) el.textContent = "Speichere in SQLite …";
  const desktopSave = allowDestructiveReset && window.desktopApp?.resetState
    ? window.desktopApp.resetState(state)
    : window.desktopApp.saveState(state);
  desktopSave.then(result => {
    tradeInsightsCache = null;
    ownSalesExperienceCache = { calculatedAt:'', summary:{}, records:[] };
    ownSalesExperienceByProduct = new Map();
    refreshOwnSalesExperience(true);
    if (document.getElementById("view-reports")?.classList.contains("active")) renderTradeDatabaseInsights(true);
    if (sequence !== saveState.sequence) return;
    const confirmedAt = result?.updatedAt || savedAt;
    localStorage.setItem(DESKTOP_UPDATED_KEY, confirmedAt);
    if (el) el.textContent = "SQLite gespeichert";
    saveState.t = setTimeout(() => { if (el && sequence === saveState.sequence) el.textContent = "Bereit"; }, 1400);
  }).catch(error => {
    console.error("SQLite-Speicherung fehlgeschlagen:", error);
    if (sequence !== saveState.sequence) return;
    if (el) el.textContent = "Lokal gespeichert · SQLite-Fehler";
  });
}

const money = n => new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(Number(n||0));
const pct = n => `${Number(n||0).toFixed(1).replace(".",",")} %`;
const fmtDate = v => v ? new Intl.DateTimeFormat("de-DE").format(new Date(v)) : "";
// Wird bereits waehrend des initialen SQLite-Abgleichs in migrateState verwendet.
// Als Funktionsdeklaration ist der Helfer vor der ersten Zustandsmigration verfuegbar.
function todayISO() { return new Date().toISOString().slice(0,10); }
const daysBetween = (a,b=new Date()) => a ? Math.max(0, Math.floor((new Date(b)-new Date(a))/86400000)) : 0;
const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `tcg-${Date.now()}-${Math.random().toString(16).slice(2)}`);

function statusBadge(status) {
  const s = String(status||"");
  let c = "blue";
  if (["FRISCH","AUSREICHEND","STABIL","STEIGEND","STARK STEIGEND","GEWINNZIEL WEITERHIN REALISTISCH","GEWINNZIEL ÜBERTROFFEN / MARKT GESTIEGEN","TOP DEAL","KAUFEN","Stark kaufen","Kaufgrenze passend","Sehr guter EK","Lohnt sich","HALTEN","LANGFRISTIG HALTEN","MARKT GESTIEGEN","Verkauft","Abgeschlossen","Abgerechnet","Eingetroffen","Rückgabe eingetroffen","Verkaufsbereit","Gebucht"].includes(s)) c="green";
  if (["EINGESCHRÄNKT","BEOBACHTEN","PRÜFEN","KAPITALBINDUNG","PREIS PRÜFEN","VK ERHÖHUNG PRÜFEN","KAPITALBINDUNG PRÜFEN","BREAK-EVEN PRÜFEN","GEWINNZIEL GEFÄHRDET","UNZUREICHENDE HANDELSDATEN","LANGSAMDREHER","ALTER UNBEKANNT","KEINE PREISDATEN","Preis prüfen","Marktpreis prüfen","Preisdaten fehlen","Preisstand erneuern","Druckvariante prüfen","Keine Preisdaten","Privater Bedarf","Im Bestand","Offen","Unterwegs","Bestellt","Teilweise eingetroffen","Teilweise erstattet","Vielleicht"].includes(s)) c="yellow";
  if (["UNZUREICHEND","UNZUREICHENDE DATEN","GEWINNZIEL AKTUELL NICHT REALISTISCH","ENTSCHEIDUNG ERFORDERLICH","MARKT GEFALLEN","STOP","NICHT KAUFEN","Nicht kaufen","Preisgrenze senken","FALLEND","STARK FALLEND","Storniert","Beschädigt","Verlustverkauf","Erstattet"].includes(s)) c="red";
  if (["Reserviert","Bezahlt","Kommissioniert","Verpackt","Versendet","Rückgabe offen","Rückgabe unterwegs","Nicht verkaufen"].includes(s)) c="purple";
  return `<span class="badge ${c}">${escapeHtml(s||"-")}</span>`;
}

function escapeHtml(v) {
  return String(v??"").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}


function normalizeSearchTerm(value) {
  return window.TcgCardSearch?.normalizeSpaced(value) || String(value ?? "").toLocaleLowerCase("de-DE").trim();
}

function catalogCardData(item={}) {
  const productId = cleanProductId(item.productId);
  const nameValues=[item.germanName,item.englishName,item.officialName,item.officialBaseName,item.name].flatMap(value => {
    const raw=String(value || "").trim();
    const base=raw.replace(/\s*\(V\.?\s*\d+\s*[-–—]\s*[^)]+\)\s*$/i,"").trim();
    return raw === base ? [raw] : [raw,base];
  });
  let bilingualByName={};
  for (const value of nameValues) {
    const key=normalizeSearchTerm(value);
    if (key && cardNameByNormalizedName.has(key)) { bilingualByName=cardNameByNormalizedName.get(key); break; }
  }
  if (!productId) return bilingualByName;
  const legacy = state.productCatalog?.[productId] || BUILTIN_PRODUCT_CATALOG[productId] || {};
  const bilingual = cardNameLookup.get(productId) || {};
  return {
    ...legacy,
    metacardId:bilingual.metacardId || bilingualByName.metacardId || legacy.metacardId || "",
    germanName:bilingual.germanName || bilingualByName.germanName || legacy.germanName || "",
    englishName:bilingual.englishName || bilingualByName.englishName || legacy.englishName || "",
    officialBaseName:bilingual.englishName || bilingualByName.englishName || legacy.officialBaseName || legacy.officialName || "",
    aliases:Array.isArray(bilingual.aliases) ? bilingual.aliases : (bilingualByName.aliases || [])
  };
}

function cardDisplayNames(item={}) {
  const catalog = catalogCardData(item);
  const german = String(item.germanName || catalog.germanName || item.name || catalog.name || "Unbekannte Karte").trim();
  const english = String(item.englishName || catalog.officialBaseName || catalog.officialName || catalog.name || "").trim();
  return {
    primary: german || english || "Unbekannte Karte",
    secondary: english && normalizeSearchTerm(english) !== normalizeSearchTerm(german) ? english : ""
  };
}

function cardRecordSearchValues(record={}) {
  if (!record || typeof record !== "object") return [];
  const catalog = catalogCardData(record);
  const values = [];
  const directFields = [
    "name","germanName","englishName","officialName","officialBaseName",
    "set","setName","rarity","version","collectorNumber","cardNumber",
    "productId","orderNo","seller","customer","country","status","note",
    "articleId","location","source","category","recommendation","reason"
  ];
  directFields.forEach(key => {
    const value = record[key];
    if (value !== undefined && value !== null && value !== "") values.push(String(value));
  });
  [
    catalog.germanName, catalog.name, catalog.officialName, catalog.officialBaseName,
    catalog.set, catalog.setName, catalog.rarity, catalog.variant,
    catalog.collectorNumber, catalog.productId
  ].forEach(value => { if (value !== undefined && value !== null && value !== "") values.push(String(value)); });
  (catalog.aliases || []).forEach(value => {
    const alias = typeof value === "string" ? value : value?.alias;
    if (alias) values.push(String(alias));
  });

  ["pendingItems","items"].forEach(key => {
    if (Array.isArray(record[key])) record[key].forEach(item => values.push(...cardRecordSearchValues(item)));
  });
  if (Array.isArray(record.itemIds)) {
    const ids = new Set(record.itemIds);
    state.inventory.filter(item => ids.has(item.id)).forEach(item => values.push(...cardRecordSearchValues(item)));
  }
  return values;
}

function cardRecordMatchesSearch(record, query) {
  if (!window.TcgCardSearch) {
    const normalizedQuery = normalizeSearchTerm(query);
    if (!normalizedQuery) return true;
    const haystack = normalizeSearchTerm(cardRecordSearchValues(record).join(" "));
    return normalizedQuery.split(/\s+/).every(term => haystack.includes(term));
  }
  return window.TcgCardSearch.matchesSearch(
    window.TcgCardSearch.buildSearchDocument(cardRecordSearchValues(record)),
    query
  );
}

function isCardmarketSearchUrl(url) {
  return /cardmarket\.com\/(?:de|en|fr|es|it)\/YuGiOh\/Products\/Search/i.test(String(url || ""));
}

function cardmarketUrl(item) {
  const productId = cleanProductId(item?.productId);
  const catalogUrl = productId
    ? String(state?.productCatalog?.[productId]?.productUrl || BUILTIN_PRODUCT_CATALOG[productId]?.productUrl || "").trim()
    : "";
  const itemUrl = String(item?.productUrl || "").trim();

  // Eine gespeicherte echte Produktseite hat Vorrang. Alte Backups enthalten teils
  // nur Suchlinks; diese dürfen eine eindeutige Produkt-ID nicht mehr überschreiben.
  if (/^https?:\/\//i.test(catalogUrl) && !isCardmarketSearchUrl(catalogUrl)) return catalogUrl;
  if (/^https?:\/\//i.test(itemUrl) && !isCardmarketSearchUrl(itemUrl)) return itemUrl;

  // Cardmarket unterstützt direkte Produktlinks über idProduct. Dadurch wird auch
  // ohne bekannten Seitenslug immer exakt die richtige Kartenvariante geöffnet.
  if (productId) return `https://www.cardmarket.com/de/YuGiOh/Products?idProduct=${encodeURIComponent(productId)}`;

  const term = [item?.name, item?.set, item?.rarity || item?.version].filter(Boolean).join(" ");
  return `https://www.cardmarket.com/de/YuGiOh/Products/Search?searchString=${encodeURIComponent(term)}`;
}

function isSameMonth(dateValue, year, month) {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  return !Number.isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month;
}

function monthLabel(year, month) {
  return new Intl.DateTimeFormat("de-DE", {month:"long", year:"numeric"}).format(new Date(year, month, 1));
}

function saleMaterialCost(sale){
  if(Array.isArray(sale?.materialUsage) && sale.materialUsage.length){
    return sale.materialUsage.reduce((sum,u)=>sum+Number(u.quantity||0)*Number(u.unitCost||0),0);
  }
  return sale?.packaging!==undefined && sale.packaging!=="" ? Number(sale.packaging) : 0;
}
function calculateSaleProfit(sale) {
  const shared=window.TcgBusinessAutomation?.calculateSaleProfit?.(sale,state.settings);
  if(shared)return shared;
  const gross = Number(sale.revenue||0);
  const refund = Math.max(0,Number(sale.refund||0));
  const feeBase = Number(sale.cardValue||Math.max(0,gross-Number(sale.shippingPaid||0)));
  const fee = sale.fee !== undefined && sale.fee !== "" ? Number(sale.fee) : feeBase * state.settings.feePercent/100;
  const packaging = saleMaterialCost(sale);
  const postage = Number(sale.postage||0);
  const cost = sale.status==="Rückgabe eingetroffen"?0:Number(sale.cost||0);
  return {gross,refund,netRevenue:gross-refund,fee, packaging, postage, cost, profit:gross-refund-fee-packaging-postage-cost};
}

function packagingAllocation(){
  return window.TcgBusinessAutomation?.estimatePackagingPerCard?.(state,state.settings)||{
    perCard:Number(state.settings.packaging||0)/Math.max(1,Number(state.settings.expectedCardsPerOrder||3)),
    perOrder:Number(state.settings.packaging||0),averageCardsPerOrder:Number(state.settings.expectedCardsPerOrder||3),sampleCount:0,source:"fallback"
  };
}

function forwardPricingSettings(){
  return {...state.settings,minProfit:Number(state.settings.minProfit||0),packaging:Number(packagingAllocation().perCard||0)};
}

function marketRecordForProduct(record={}){
  const productId=cleanProductId(record.productId);
  const catalog=productId?(state.productCatalog?.[productId]||{}):{};
  const firstPositive=(...values)=>values.find(value=>Number(value)>0)??"";
  return {
    ...record,...catalog,
    productId:productId||cleanProductId(catalog.productId),
    name:catalog.germanName||catalog.name||record.name||"",
    germanName:catalog.germanName||record.germanName||"",
    englishName:catalog.englishName||catalog.officialBaseName||catalog.officialName||record.englishName||"",
    set:catalog.set||record.set||"",setName:catalog.setName||record.setName||"",
    collectorNumber:catalog.collectorNumber||record.collectorNumber||"",
    rarity:catalog.rarity||catalog.variant||record.rarity||record.version||"",
    version:catalog.rarity||catalog.variant||record.version||record.rarity||"",
    productUrl:catalog.productUrl||record.productUrl||"",
    low:firstPositive(catalog.low,catalog.marketLow,record.low,record.currentBuy),
    currentBuy:firstPositive(catalog.low,catalog.marketLow,record.low,record.currentBuy),
    trend:firstPositive(catalog.trend,record.trend),avg1:firstPositive(catalog.avg1,record.avg1),
    avg7:firstPositive(catalog.avg7,record.avg7),avg30:firstPositive(catalog.avg30,record.avg30),
    priceDate:catalog.priceDate||catalog.date||record.priceDate||""
  };
}

function automaticWatchTargets(w={}){
  const pricingSettings=forwardPricingSettings();
  const market=marketRecordForProduct(w);
  const shared=window.TcgBusinessAutomation?.calculateAutomaticPriceTargets?.(market,pricingSettings);
  if(shared)return {targetSell:Number(shared.recommendedSell||0),maxBuy:Number(shared.maxBuy||0)};
  const low=Number(w.low||w.currentBuy||0),trend=Number(w.trend||0),avg7=Number(w.avg7||0),avg30=Number(w.avg30||0),avg1=Number(w.avg1||0);
  const weighted=[];if(trend>0)weighted.push([trend,.45]);if(avg7>0)weighted.push([avg7,.35]);if(avg30>0)weighted.push([avg30,.20]);if(!weighted.length&&avg1>0)weighted.push([avg1,1]);if(!weighted.length&&low>0)weighted.push([low,1]);
  const totalWeight=weighted.reduce((sum,row)=>sum+row[1],0);
  const weightedSell=totalWeight?weighted.reduce((sum,row)=>sum+row[0]*row[1],0)/totalWeight:0;
  const targetSell=Math.round(Math.max(low,weightedSell)*100)/100;
  const safeSell=targetSell*Math.max(0,1-Number(pricingSettings.safetyPercent||0)/100);
  const net=safeSell*(1-Number(pricingSettings.feePercent||0)/100)-Number(pricingSettings.packaging||0);
  const minRoi=Math.max(0,Number(pricingSettings.minRoi||25))/100;
  const byRoi=net/Math.max(1,1+minRoi);
  const maxBuy=targetSell>0?Math.max(0,Math.floor(byRoi*100)/100):0;
  return {targetSell,maxBuy};
}

function syncAutomaticWatchPrices(){
  let changed=false;
  state.watchlist.forEach(w=>{
    if(w.archived)return;
    const market=marketRecordForProduct(w);
    ["low","currentBuy","trend","avg1","avg7","avg30","priceDate","set","setName","collectorNumber","version","productUrl","germanName","englishName"].forEach(field=>{
      if(market[field]!==undefined&&market[field]!==""&&String(w[field]??"")!==String(market[field])){w[field]=market[field];changed=true;}
    });
    if(w.pricingMode==="manual")return;
    const next=automaticWatchTargets(w);if(!next.targetSell)return;
    if(Number(w.targetSell||0)!==next.targetSell||Number(w.maxBuy||0)!==next.maxBuy){w.targetSell=next.targetSell;w.maxBuy=next.maxBuy;w.pricingMode="automatic";w.pricingUpdatedAt=new Date().toISOString();changed=true;}
  });
  if(changed){clearTimeout(syncAutomaticWatchPrices.timer);syncAutomaticWatchPrices.timer=setTimeout(()=>saveState(),50);}
}

function calculateWatch(w) {
  const pricingSettings=forwardPricingSettings();
  const market=marketRecordForProduct(w);
  const buy = Number(market.low||market.currentBuy||0);
  const sell = Number(w.targetSell||0);
  const fee = sell * pricingSettings.feePercent/100;
  const net = sell - fee - pricingSettings.packaging;
  const profit = buy ? net-buy : 0;
  const roi = buy ? profit/buy*100 : 0;
  let status = "BEOBACHTEN";
  const exactVariant=Boolean(cleanProductId(w.productId)&&(market.set||market.setName)&&(market.version||market.rarity||market.collectorNumber));
  const stale=!market.priceDate||daysBetween(market.priceDate)>Number(state.settings.priceAgeDays||7);
  if(!exactVariant)status="KEINE PREISDATEN";
  else if (w.reprint==="Hoch" || w.banlist==="Hoch") status="STOP";
  else if (w.stock >= w.target && w.target>0) status="STOP";
  else if (!buy || !sell) status="KEINE PREISDATEN";
  else if(stale)status="BEOBACHTEN";
  else if (Number(market.trend||0)>0&&Number(market.avg30||0)>0&&Number(market.trend)<Number(market.avg30)*0.9) status="FALLEND";
  else if (buy && buy <= Number(w.maxBuy||0) && profit >= 0 && roi >= pricingSettings.minRoi) {
    status = buy <= Number(w.maxBuy||0)*0.8 ? "TOP DEAL" : "KAUFEN";
  } else if(Number(w.maxBuy||0)>0&&buy<=Number(w.maxBuy||0)*1.08)status="BEOBACHTEN";
  else status="NICHT KAUFEN";
  return {profit,roi,status,market,exactVariant,stale};
}

const navigationBackStack=[];
const navigationForwardStack=[];
let currentViewName="";

function updateNavigationButtons(){
  const back=document.getElementById("navBackBtn"),forward=document.getElementById("navForwardBtn");
  if(back)back.disabled=navigationBackStack.length===0;
  if(forward)forward.disabled=navigationForwardStack.length===0;
}

function showView(name,options={}) {
  if(!views[name]||!document.getElementById(`view-${name}`))return;
  const keepHistory=options.history!==false;
  if(currentViewName&&currentViewName!==name&&keepHistory){
    navigationBackStack.push({name:currentViewName,scrollY:window.scrollY});
    if(navigationBackStack.length>100)navigationBackStack.shift();
    navigationForwardStack.length=0;
  }
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById(`view-${name}`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active", b.dataset.view===name));
  document.getElementById("pageTitle").textContent = views[name][0];
  document.getElementById("pageSubtitle").textContent = views[name][1];
  currentViewName=name;
  updateNavigationButtons();
  renderAll();
  if(name==="buying")setTimeout(()=>refreshActivePurchaseDraftPrices(false),0);
}

function closeTopDialog(){
  const dialogs=[...document.querySelectorAll("dialog[open]")];
  const dialog=dialogs.at(-1);
  if(!dialog)return false;
  dialog.close();
  return true;
}

function navigateBack(){
  if(closeTopDialog())return;
  const target=navigationBackStack.pop();if(!target)return;
  if(currentViewName)navigationForwardStack.push({name:currentViewName,scrollY:window.scrollY});
  showView(target.name,{history:false});
  requestAnimationFrame(()=>window.scrollTo({top:Number(target.scrollY||0),behavior:"auto"}));
}

function navigateForward(){
  const target=navigationForwardStack.pop();if(!target)return;
  if(currentViewName)navigationBackStack.push({name:currentViewName,scrollY:window.scrollY});
  showView(target.name,{history:false});
  requestAnimationFrame(()=>window.scrollTo({top:Number(target.scrollY||0),behavior:"auto"}));
}

let globalSearchActions=[];
function renderGlobalSearch(query){
  const target=document.getElementById("globalSearchResults");if(!target)return;
  const term=String(query||"").trim();
  if(term.length<2){target.hidden=true;target.innerHTML="";globalSearchActions=[];return;}
  const rows=[];
  const push=(kind,title,subtitle,action)=>{if(rows.length<30)rows.push({kind,title,subtitle,action});};
  getInventoryGroups().filter(group=>cardRecordMatchesSearch(group.first,term)).slice(0,8).forEach(group=>push("Bestand",cardDisplayNames(group.first).primary,[group.first.setName||group.first.set,group.first.collectorNumber,group.first.rarity,`${group.quantity}×`].filter(Boolean).join(" · "),()=>{showView("inventory");document.getElementById("inventorySearch").value=term;renderAll();}));
  state.privateCollection.filter(row=>cardRecordMatchesSearch(row,term)).slice(0,5).forEach(row=>push("Privat",cardDisplayNames(row).primary,[row.setName||row.set,row.collectorNumber,row.rarity].filter(Boolean).join(" · "),()=>{showView("private");document.getElementById("privateSearch").value=term;renderAll();}));
  state.purchases.filter(row=>cardRecordMatchesSearch(row,term)).slice(0,5).forEach(row=>push("Einkauf",`#${row.orderNo||"–"}`,`${row.seller||"Unbekannter Händler"} · ${fmtDate(row.date)}`,()=>openOrderDetails("purchase",row.id)));
  state.sales.filter(row=>cardRecordMatchesSearch(row,term)).slice(0,5).forEach(row=>push("Verkauf",`#${row.orderNo||"–"}`,`${row.customer||"Unbekannter Kunde"} · ${fmtDate(row.date)}`,()=>openOrderDetails("sale",row.id)));
  [...state.sellers.map(row=>({row,kind:"Händler"})),...state.customers.map(row=>({row,kind:"Kunde"}))].filter(({row})=>cardRecordMatchesSearch(row,term)).slice(0,5).forEach(({row,kind})=>push(kind,row.cardmarketName||row.name,[row.realName,row.country].filter(Boolean).join(" · "),()=>{showView("partners");kind==="Händler"?showSellerDetails(row.id):showCustomerDetails(row.id);}));
  state.materials.filter(row=>cardRecordMatchesSearch(row,term)).slice(0,3).forEach(row=>push("Material",row.name,`${Number(row.stock||0)} ${row.unit||"Stück"}`,()=>{showView("materials");document.getElementById("materialSearch").value=term;renderAll();}));
  (state.collectionPurchaseAnalyses||[]).filter(row=>cardRecordMatchesSearch(row,term)||(row.items||[]).some(item=>cardRecordMatchesSearch(item,term))).slice(0,5).forEach(row=>push("Sammlungsankauf",row.title||"Unbenannte Analyse",`${row.sellerName||row.sourceType||"Quelle unbekannt"} · ${money(row.sellerPrice)}`,()=>{state.activeCollectionAnalysisId=row.id;showView("collectionpurchases");}));
  globalSearchActions=rows.map(row=>row.action);
  target.innerHTML=rows.length?rows.map((row,index)=>`<button type="button" data-global-result="${index}"><span><strong>${escapeHtml(row.title)}</strong><small>${escapeHtml(row.subtitle||"")}</small></span><span class="global-search-kind">${escapeHtml(row.kind)}</span></button>`).join(""):'<div class="empty">Keine passenden Daten gefunden.</div>';
  target.hidden=false;
}

function applyAppearanceSettings() {
  const settings = state?.settings || DEFAULT_SETTINGS;
  const resolved = window.TcgAppConfig?.resolveTheme
    ? window.TcgAppConfig.resolveTheme(settings.themeMode, Boolean(systemThemeQuery?.matches))
    : (settings.themeMode === "dark" ? "dark" : "light");
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = settings.themeMode || "system";
  document.body.dataset.density = settings.density || "comfortable";
  const toggle = document.getElementById("themeToggleBtn");
  if (toggle) {
    toggle.textContent = resolved === "dark" ? "Sonne" : "Mond";
    toggle.title = resolved === "dark" ? "Zum hellen Modus wechseln" : "Zum dunklen Grau-Modus wechseln";
    toggle.setAttribute("aria-label", toggle.title);
  }
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme || "light";
  state.settings = window.TcgAppConfig?.normalizeSettings
    ? window.TcgAppConfig.normalizeSettings({...state.settings, themeMode:current === "dark" ? "light" : "dark"})
    : {...state.settings, themeMode:current === "dark" ? "light" : "dark"};
  applyAppearanceSettings();
  renderSettings();
  saveState();
}

const viewRenderers = {
  dashboard: renderDashboard,
  inventory: renderInventory,
  private: renderPrivateCollection,
  purchases: renderPurchases,
  sales: renderSales,
  salesanalysis: renderSalesAnalysis,
  materials: renderMaterials,
  expenses: renderExpenses,
  capital: renderCapitalView,
  slowmovers: renderSlowMovers,
  watchlist: renderWatchlist,
  buying: renderBuyingPlanner,
  collectionpurchases: renderCollectionPurchases,
  partners: renderPartners,
  imports: renderImports,
  reports: renderReports,
  settings: renderSettings
};

function renderCurrentView(name = currentViewName || document.querySelector(".view.active")?.id?.replace(/^view-/, "") || "dashboard") {
  syncWatchStock();
  syncAutomaticWatchPrices();
  viewRenderers[name]?.();
}

// Bestehende Aufrufer behalten den Namen. Tatsächlich wird bewusst nur noch
// die sichtbare Seite aktualisiert; andere Seiten werden beim Öffnen frisch
// aus demselben Programmstand aufgebaut.
function renderAll() {
  renderCurrentView();
}

function initializeUiDisclosures(){
  state.settings.filterPanelsOpen=state.settings.filterPanelsOpen&&typeof state.settings.filterPanelsOpen==="object"?state.settings.filterPanelsOpen:{};
  state.settings.collapsedPanels=state.settings.collapsedPanels&&typeof state.settings.collapsedPanels==="object"?state.settings.collapsedPanels:{};
  document.querySelectorAll(".filter-panel").forEach((panel,index)=>{
    if(panel.dataset.filterDisclosureReady)return;
    const view=panel.closest(".view")?.id||"view";
    const key=`${view}:${panel.getAttribute("aria-label")||index}`;
    const button=document.createElement("button");
    button.type="button";button.className="secondary filter-toggle";button.innerHTML="<span aria-hidden=\"true\">⚙</span> Filter";
    button.setAttribute("aria-label","Filter ein- oder ausblenden");
    const setOpen=open=>{panel.hidden=!open;button.classList.toggle("active",open);button.setAttribute("aria-expanded",String(open));};
    setOpen(Boolean(state.settings.filterPanelsOpen[key]));
    button.onclick=()=>{const open=panel.hidden;state.settings.filterPanelsOpen[key]=open;setOpen(open);saveState();};
    const head=panel.closest(".panel")?.querySelector(":scope > .panel-head");
    if(head){let actions=head.querySelector(":scope > .row-actions, :scope > .panel-head-actions");if(!actions){actions=document.createElement("div");actions.className="row-actions";head.append(actions);}actions.prepend(button);}else panel.before(button);
    panel.dataset.filterDisclosureReady="true";
  });
  document.querySelectorAll("main .panel").forEach((panel,index)=>{
    if(panel.dataset.panelDisclosureReady)return;
    const head=panel.querySelector(":scope > .panel-head");if(!head)return;
    const title=head.querySelector("h2,h3")?.textContent?.trim()||`Bereich ${index+1}`;
    const view=panel.closest(".view")?.id||"view";
    const key=`${view}:${title}`;
    let actions=head.querySelector(":scope > .row-actions, :scope > .panel-head-actions");
    if(!actions){actions=document.createElement("div");actions.className="row-actions";head.append(actions);}
    const button=document.createElement("button");button.type="button";button.className="secondary panel-collapse-toggle";button.setAttribute("aria-label",`${title} auf- oder zuklappen`);
    const setCollapsed=collapsed=>{panel.classList.toggle("panel-collapsed",collapsed);button.textContent=collapsed?"▸ Öffnen":"▾ Einklappen";button.setAttribute("aria-expanded",String(!collapsed));};
    setCollapsed(Boolean(state.settings.collapsedPanels[key]));
    button.onclick=()=>{const collapsed=!panel.classList.contains("panel-collapsed");state.settings.collapsedPanels[key]=collapsed;setCollapsed(collapsed);saveState();};
    actions.append(button);panel.dataset.panelDisclosureReady="true";
  });
}

function syncWatchStock() {
  state.watchlist.forEach(w=>{
    w.stock = state.inventory.filter(i => i.status!=="Verkauft" && ((w.productId && i.productId===w.productId) || (!w.productId && i.name===w.name))).length;
  });
}

function monthlyBusinessFigures(year,month){
  const monthNumber=String(month+1).padStart(2,"0");
  const lastDay=String(new Date(year,month+1,0).getDate()).padStart(2,"0");
  const summary=window.TcgBusinessAutomation?.buildFinancialSummary?.(state,{from:`${year}-${monthNumber}-01`,to:`${year}-${monthNumber}-${lastDay}`});
  if(summary){
    const saleIds=new Set(summary.entries.filter(row=>row.category==="sale_receipt").map(row=>String(row.sourceId||"")));
    const purchaseIds=new Set(summary.entries.filter(row=>row.category==="card_purchase").map(row=>String(row.sourceId||"")));
    const categoryOut=name=>Number(summary.byCategory?.[name]?.cashOut||0);
    const cardPurchases=categoryOut("card_purchase");
    const saleCosts=categoryOut("sale_fee")+categoryOut("sale_postage")+categoryOut("customer_refund");
    const other=categoryOut("material_purchase")+categoryOut("direct_expense")+categoryOut("overhead");
    return {
      ...summary,
      sales:state.sales.filter(row=>saleIds.has(String(row.id||""))),
      purchases:state.purchases.filter(row=>purchaseIds.has(String(row.id||""))),
      income:summary.cashIn,cardPurchases,saleCosts,other,expenses:summary.cashOut,profit:summary.cashflow
    };
  }
  return {sales:[],purchases:[],entries:[],income:0,cardPurchases:0,saleCosts:0,other:0,expenses:0,profit:0,realizedProfit:0,overhead:0,operatingResult:0};
}

function financeCardDescription(record, type) {
  const rows=type==="purchase"?(record.pendingItems||[]):(record.items||[]);
  if(rows.length){
    const names=rows.slice(0,4).map(item=>`${Number(item.quantity||1)}× ${item.name||"Unbekannte Karte"}`);
    if(rows.length>4)names.push(`+ ${rows.length-4} weitere Positionen`);
    return names.join(", ");
  }
  if(record.cardNames)return String(record.cardNames);
  const quantity=Number(record.quantity||record.items||0);
  return quantity?`${quantity} Karte${quantity===1?"":"n"}`:"Keine Kartenbeschreibung hinterlegt";
}

function monthlyFinanceDetails(type,year,month){
  const figures=monthlyBusinessFigures(year,month);
  const rows=[];
  const add=(date,category,reference,description,amount,orderType="",orderId="")=>{
    const value=Number(amount||0);
    if(!value)return;
    rows.push({date,category,reference,description,amount:value,orderType,orderId});
  };
  if(type==="income"){
    figures.entries.filter(entry=>entry.category==="sale_receipt").forEach(entry=>{
      const sale=state.sales.find(row=>String(row.id||"")===String(entry.sourceId||""))||{};
      const totalIncome=Math.max(0,Number(entry.cashIn||0));
      // Cardmarket-Importe speichern den Käufer-Versand bereits im Gesamtumsatz.
      // Für die Anzeige wird er abgezogen und separat ausgewiesen; die Summe
      // bleibt dadurch unverändert und wird nicht doppelt gezählt.
      const customerShipping=Math.min(totalIncome,Math.max(0,Number(sale.shippingPaid||0)));
      const cardIncome=Math.max(0,totalIncome-customerShipping);
      const reference=`Bestellung ${sale.orderNo||"–"}`;
      const description=`${sale.customer||"Unbekannter Kunde"} · ${financeCardDescription(sale,"sale")}`;
      add(entry.date,"Kartenverkauf",reference,description,cardIncome,"sale",sale.id);
      add(entry.date,"Versand vom Käufer",reference,`${sale.customer||"Unbekannter Kunde"} · vom Käufer bezahlter Versand`,customerShipping,"sale",sale.id);
    });
  }else{
    const categoryLabels={card_purchase:"Geschäftlicher Wareneingang",customer_refund:"Kundenerstattung",sale_fee:"Verkaufsgebühr",sale_postage:"Verkaufsporto",material_purchase:"Versandmaterial-Einkauf",direct_expense:"Direkte Ausgabe",overhead:"Betriebsausgabe"};
    figures.entries.filter(entry=>Number(entry.cashOut||0)>0).forEach(entry=>{
      if(entry.sourceType==="purchase"){
        const purchase=state.purchases.find(row=>String(row.id||"")===String(entry.sourceId||""))||{};
        add(entry.date,categoryLabels[entry.category]||"Einkauf",`Einkauf ${purchase.orderNo||"–"}`,`${purchase.seller||"Unbekannter Händler"} · ${financeCardDescription(purchase,"purchase")} · geschäftlicher Anteil`,entry.cashOut,"purchase",purchase.id);
        return;
      }
      if(entry.sourceType==="sale"){
        const sale=state.sales.find(row=>String(row.id||"")===String(entry.sourceId||""))||{};
        add(entry.date,categoryLabels[entry.category]||"Verkaufskosten",`Verkauf ${sale.orderNo||"–"}`,financeCardDescription(sale,"sale"),entry.cashOut,"sale",sale.id);
        return;
      }
      const expense=(state.expenses||[]).find(row=>String(row.id||"")===String(entry.sourceId||""))||{};
      add(entry.date,categoryLabels[entry.category]||expense.category||"Sonstiges",expense.description||entry.label||"Sonstige Ausgabe",expense.note||"Manuell erfasste Ausgabe",entry.cashOut);
    });
  }
  rows.sort((a,b)=>new Date(b.date)-new Date(a.date)||a.category.localeCompare(b.category,"de"));
  return {figures,rows,total:type==="income"?figures.income:figures.expenses};
}

function openMonthlyFinanceDetails(type){
  const now=new Date();
  const year=now.getFullYear(),month=now.getMonth();
  const data=monthlyFinanceDetails(type,year,month);
  const dialog=document.getElementById("monthlyFinanceDialog");
  const isIncome=type==="income";
  document.getElementById("monthlyFinanceTitle").textContent=isIncome?"Einnahmen im Detail":"Ausgaben im Detail";
  document.getElementById("monthlyFinanceSubtitle").textContent=monthLabel(year,month);
  const categoryTotals=new Map();
  data.rows.forEach(row=>categoryTotals.set(row.category,(categoryTotals.get(row.category)||0)+row.amount));
  const cards=isIncome
    ? [
        {label:"Gesamteinnahmen",value:data.total,isMoney:true},
        {label:"Kartenverkäufe",value:categoryTotals.get("Kartenverkauf")||0,isMoney:true},
        {label:"Versand vom Käufer",value:categoryTotals.get("Versand vom Käufer")||0,isMoney:true},
        {label:"Bezahlte Verkäufe",value:data.figures.sales.length,isMoney:false},
        {label:"Verkaufte Karten",value:data.figures.sales.reduce((sum,sale)=>sum+Number(sale.quantity||(sale.items||[]).reduce((n,item)=>n+Number(item.quantity||1),0)||0),0),isMoney:false}
      ]
    : [{label:"Gesamtausgaben",value:data.total,isMoney:true},...Array.from(categoryTotals.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([label,value])=>({label,value,isMoney:true}))];
  const summary=cards.map(card=>`<div><small>${escapeHtml(card.label)}</small><strong>${card.isMoney?money(card.value):Number(card.value).toLocaleString("de-DE")}</strong></div>`).join("");
  const rows=data.rows.map(row=>`<tr>
    <td>${fmtDate(row.date)||"–"}</td>
    <td>${escapeHtml(row.category)}</td>
    <td><strong>${escapeHtml(row.reference)}</strong><br><small>${escapeHtml(row.description)}</small>${row.orderId?`<br><button type="button" class="link-button finance-order-link" data-finance-order-type="${row.orderType}" data-finance-order-id="${escapeHtml(row.orderId)}">Bestellung öffnen</button>`:""}</td>
    <td class="finance-detail-amount"><strong>${money(row.amount)}</strong></td>
  </tr>`).join("");
  document.getElementById("monthlyFinanceContent").innerHTML=`
    <div class="order-summary-grid finance-detail-summary">${summary}</div>
    <div class="order-items finance-detail-table"><table>
      <thead><tr><th>Datum</th><th>${isIncome?"Art":"Kostenart"}</th><th>Wofür berechnet</th><th>Betrag</th></tr></thead>
      <tbody>${rows||`<tr><td colspan="4" class="empty">Für diesen Monat sind noch keine ${isIncome?"Einnahmen":"Ausgaben"} vorhanden.</td></tr>`}</tbody>
      <tfoot><tr><td colspan="3"><strong>Summe laut Monatsübersicht</strong></td><td class="finance-detail-amount"><strong>${money(data.total)}</strong></td></tr></tfoot>
    </table></div>`;
  showDialogSafely(dialog);
}
function phase2CurrentInventory(){
  return (state.inventory||[]).filter(item=>item.ownership!=="private"&&!['Verkauft','Privat','Abgegeben','Storniert'].includes(item.status));
}

function phase2CapitalOverview(){
  return window.TcgBusinessAutomation?.buildCapitalOverview?.(state,state.productCatalog||{})||{byType:{cardmarket:0,bank:0,cash:0,other:0},liquid:0,knownStockCost:0,listingValue:0,unknownListingValue:0,referenceValue:0,tradingWealthAtCost:0,physicalCards:0,positions:0,knownCostCount:0,unknownCostCount:0,accounts:[]};
}

function phase2InventoryAnalysis(item){
  const productId=cleanProductId(item.productId);
  const analysis=window.TcgBusinessAutomation?.analyzeInventoryItem?.(item,state.productCatalog?.[productId]||{},forwardPricingSettings(),new Date(),marketDecisionHistoryByProduct[productId]||[])||{};
  const experience=ownSalesExperienceFor(productId);
  return window.TcgBusinessAutomation?.combineAgingWithOwnSales?.(analysis,experience,analysis.marketDecision?.trend?.status)||analysis;
}

function marketChangeText(change){
  if(!change?.available)return "–";
  const sign=Number(change.absolute)>=0?"+":"";
  const gap=change.point?.gapDays?` · nächster Stand ${fmtDate(change.point.date)}`:"";
  return `${sign}${money(change.absolute)} · ${sign}${pct(change.percent)}${gap}`;
}

function marketChangeClass(change){
  return !change?.available?"muted":Number(change.percent)>0?"money-positive":Number(change.percent)<0?"money-negative":"muted";
}

function renderDashboard() {
  const activeInv = phase2CurrentInventory();
  const capital=phase2CapitalOverview();
  const now = new Date();
  const month = now.getMonth(), year = now.getFullYear();
  const figures=monthlyBusinessFigures(year,month);
  const inventoryListingValue = capital.listingValue;
  const investedCapital = capital.knownStockCost;
  const openPurchases = state.purchases.filter(p=>!["Eingetroffen","Storniert"].includes(p.status)).length;
  const opp = state.watchlist.filter(w=>!w.archived && ["TOP DEAL","KAUFEN"].includes(calculateWatch(w).status)).length;

  document.getElementById("mInventoryCount").textContent = activeInv.length;
  document.getElementById("mInventoryValue").textContent = money(inventoryListingValue);
  document.getElementById("mInvestedCapital").textContent = money(investedCapital);
  document.getElementById("mMonthlyRevenue").textContent = money(figures.income);
  document.getElementById("mMonthlyExpenses").textContent = money(figures.expenses);
  document.getElementById("mMonthlyProfit").textContent = money(figures.profit);
  document.getElementById("mMonthlyProfit").className = figures.profit >= 0 ? "money-positive" : "money-negative";
  document.getElementById("mRealizedProfit").textContent = money(figures.realizedProfit);
  document.getElementById("mRealizedProfit").className = figures.realizedProfit >= 0 ? "money-positive" : "money-negative";
  document.getElementById("mOperatingResult").textContent = money(figures.operatingResult);
  document.getElementById("mOperatingResult").className = figures.operatingResult >= 0 ? "money-positive" : "money-negative";
  document.getElementById("mOpenPurchases").textContent = openPurchases;
  document.getElementById("mBuyOpportunities").textContent = opp;
  const realizedSales=(state.sales||[]).filter(sale=>["Abgeschlossen","Abgerechnet"].includes(sale.status));
  const realizedRows=realizedSales.map(calculateSaleProfit);
  const realizedRevenue=realizedRows.reduce((sum,row)=>sum+Number(row.netRevenue??row.gross??0),0);
  const knownRealized=realizedRows.filter(row=>row.profitKnown!==false);
  const knownRevenue=knownRealized.reduce((sum,row)=>sum+Number(row.netRevenue??row.gross??0),0);
  const knownProfit=knownRealized.reduce((sum,row)=>sum+Number(row.profit||0),0);
  document.getElementById("mLiquidCapital").textContent=money(capital.liquid);
  document.getElementById("mTradingWealth").textContent=money(capital.tradingWealthAtCost);
  document.getElementById("mRealizedRevenue").textContent=money(realizedRevenue);
  document.getElementById("mRealizedMargin").textContent=knownRevenue>0?pct(knownProfit/knownRevenue*100):"–";
  document.getElementById("mRealizedSalesCount").textContent=realizedSales.length;
  const dashboardCapital=document.getElementById("dashboardCapitalSummary");
  if(dashboardCapital)dashboardCapital.innerHTML=`
    <div><small>Cardmarket</small><strong>${money(capital.byType.cardmarket)}</strong></div>
    <div><small>Bank</small><strong>${money(capital.byType.bank)}</strong></div>
    <div><small>Kasse</small><strong>${money(capital.byType.cash)}</strong></div>
    <div><small>Sonstiges</small><strong>${money(capital.byType.other)}</strong></div>
    <div><small>Bekannter Bestands-EK</small><strong>${money(capital.knownStockCost)}</strong><small>${capital.knownCostCount} bekannt · ${capital.unknownCostCount} unbekannt</small></div>
    <div><small>Inseratswert</small><strong>${money(capital.listingValue)}</strong><small>davon ${money(capital.unknownListingValue)} mit unbekanntem EK</small></div>
    <div><small>Price-Guide-Referenzwert</small><strong>${money(capital.referenceValue)}</strong><small>gespeicherter Preisstand</small></div>
    <div><small>Physische Karten / Positionen</small><strong>${capital.physicalCards} / ${capital.positions}</strong></div>`;
  const decisions=activeInv.map(item=>({item,analysis:phase2InventoryAnalysis(item)}));
  const decisionRows={
    "price-review":decisions.filter(row=>["PREIS PRÜFEN","BREAK-EVEN PRÜFEN","GEWINNZIEL GEFÄHRDET","KAPITALBINDUNG PRÜFEN"].includes(row.analysis.marketDecision?.recommendation)),
    falling:decisions.filter(row=>["FALLEND","STARK FALLEND"].includes(row.analysis.marketDecision?.trend?.status)),
    rising:decisions.filter(row=>["STEIGEND","STARK STEIGEND"].includes(row.analysis.marketDecision?.trend?.status)),
    target:decisions.filter(row=>["GEWINNZIEL GEFÄHRDET","GEWINNZIEL AKTUELL NICHT REALISTISCH"].includes(row.analysis.marketDecision?.profitTargetStatus))
  };
  const flaggedIds=new Set(Object.values(decisionRows).flat().map(row=>row.item.id));
  const boundCost=activeInv.filter(item=>flaggedIds.has(item.id)&&["known","confirmed_zero"].includes(item.costStatus)).reduce((sum,item)=>sum+Number(item.cost||0),0);
  const dashboardMarket=document.getElementById("dashboardMarketDecisionSummary");
  if(dashboardMarket)dashboardMarket.innerHTML=`
    <button type="button" data-phase3-filter="price-review"><small>Preis prüfen</small><strong>${decisionRows["price-review"].length}</strong><span>inkl. Break-even und Kapitalbindung</span></button>
    <button type="button" data-phase3-filter="falling"><small>Markt fallend</small><strong class="money-negative">${decisionRows.falling.length}</strong><span>gespeicherter Price-Guide-Trend</span></button>
    <button type="button" data-phase3-filter="rising"><small>Markt steigend</small><strong class="money-positive">${decisionRows.rising.length}</strong><span>gespeicherter Price-Guide-Trend</span></button>
    <button type="button" data-phase3-filter="target"><small>Gewinnziel gefährdet</small><strong>${decisionRows.target.length}</strong><span>regelbasierte Prüfung</span></button>
    <button type="button" data-phase3-filter="all"><small>Gebundener EK dieser Hinweise</small><strong>${money(boundCost)}</strong><span>nur bekannter EK</span></button>`;
  const ownRows=(ownSalesExperienceCache.records||[]).map(row=>{
    const item=activeInv.find(asset=>cleanProductId(asset.productId)===cleanProductId(row.productId));
    const trend=item?phase2InventoryAnalysis(item).marketDecision?.trend?.status:"";
    return {...row,purchaseHint:TcgBusinessAutomation.ownSalesPurchaseHint(row,trend)};
  });
  const ownDashboard=document.getElementById("dashboardOwnSalesSummary");
  if(ownDashboard){
    const sufficient=ownRows.filter(row=>row.dataQuality?.sufficient);
    const fast=sufficient.filter(row=>["very-fast","fast"].includes(row.turnoverClass?.key));
    const slow=sufficient.filter(row=>["slow","very-slow"].includes(row.turnoverClass?.key));
    const repurchase=ownRows.filter(row=>/WIEDERANKAUF PRÜFEN/.test(row.purchaseHint));
    const capital=ownRows.filter(row=>["slow","very-slow"].includes(row.turnoverClass?.key)&&row.averageFullCost!=null);
    const topProfit=[...ownRows].filter(row=>row.totalProfit!=null).sort((a,b)=>b.totalProfit-a.totalProfit).slice(0,5).reduce((sum,row)=>sum+row.totalProfit,0);
    ownDashboard.innerHTML=`<button type="button" data-view-jump="salesanalysis"><small>Schnelle Dreher</small><strong class="money-positive">${fast.length}</strong><span>nur ausreichende Daten</span></button><button type="button" data-view-jump="salesanalysis"><small>Langsame Dreher</small><strong>${slow.length}</strong><span>nur ausreichende Daten</span></button><button type="button" data-view-jump="salesanalysis"><small>Ausreichende eigene Daten</small><strong>${sufficient.length}</strong><span>ab ${TcgBusinessAutomation.SALES_DATA_QUALITY_THRESHOLDS.sufficient} Verkäufen</span></button><button type="button" data-view-jump="salesanalysis"><small>Wiederankauf prüfen</small><strong>${repurchase.length}</strong><span>regelbasierter Hinweis</span></button><button type="button" data-view-jump="salesanalysis"><small>Langsame Prints mit EK</small><strong>${capital.length}</strong><span>Kapitalbindung beachten</span></button><button type="button" data-view-jump="salesanalysis"><small>Gewinn Top-5-Prints</small><strong>${money(topProfit)}</strong><span>nur bekannter Vollkosten-EK</span></button>`;
  }

  const monthlyRows = [];
  for (let offset=11; offset>=0; offset--) {
    const d = new Date(year, month-offset, 1);
    const y=d.getFullYear(), m=d.getMonth();
    const f=monthlyBusinessFigures(y,m);
    monthlyRows.push({label:monthLabel(y,m),income:f.income,purchaseExpense:f.cardPurchases,sellingExpense:f.saleCosts+f.other,totalExpense:f.expenses,cashflow:f.profit});
  }
  const monthlyOverview = document.getElementById("monthlyOverview");
  if (monthlyOverview) monthlyOverview.innerHTML = monthlyRows.map(r=>`<tr>
    <td>${escapeHtml(r.label)}</td><td>${money(r.income)}</td><td>${money(r.purchaseExpense)}</td>
    <td>${money(r.sellingExpense)}</td><td>${money(r.totalExpense)}</td>
    <td class="${r.cashflow>=0?"money-positive":"money-negative"}">${money(r.cashflow)}</td>
  </tr>`).join("");

  const openOps = [
    ...state.purchases.filter(p=>!["Eingetroffen","Storniert"].includes(p.status)).map(p=>({title:`Einkauf ${p.orderNo}`, sub:`${p.seller||"Unbekannt"} · ${p.items||0} Karten`, status:p.status})),
    ...state.sales.filter(s=>!["Abgeschlossen","Abgerechnet","Erstattet","Rückgabe eingetroffen","Storniert"].includes(s.status)).map(s=>({title:`Verkauf ${s.orderNo}`, sub:`${s.customer||"Unbekannt"} · ${money(Math.max(0,Number(s.revenue||0)-Number(s.refund||0)))}`, status:s.status}))
  ].slice(0,6);
  document.getElementById("openOperations").innerHTML = openOps.length ? `<div class="list">${openOps.map(x=>`<div class="list-row"><div><strong>${escapeHtml(x.title)}</strong><br><small>${escapeHtml(x.sub)}</small></div>${statusBadge(x.status)}</div>`).join("")}</div>` : `<div class="empty">Keine offenen Vorgänge</div>`;

  const deals = state.watchlist.filter(w=>!w.archived).map(w=>({...w,...calculateWatch(w)})).filter(w=>["TOP DEAL","KAUFEN"].includes(w.status)).sort((a,b)=>b.roi-a.roi).slice(0,6);
  document.getElementById("topDeals").innerHTML = deals.length ? `<div class="list">${deals.map(w=>{
    const url = cardmarketUrl(w);
    return `<div class="list-row"><div><a class="card-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(w.name)}</strong><span class="external-link">↗</span></a><br><small>${money(w.currentBuy)} → ${money(w.targetSell)} · ROI ${pct(w.roi)}</small></div>${statusBadge(w.status)}</div>`;
  }).join("")}</div>` : `<div class="empty">Noch keine konkreten Einkaufspreise eingetragen</div>`;

  const age=window.TcgBusinessAutomation?.buildAgingSummary?.(activeInv,state.productCatalog||{},state.settings)||[];
  document.getElementById("ageSummary").innerHTML = age.length?`<div class="table-wrap compact-table"><table><thead><tr><th>Stufe</th><th>Karten</th><th>bekannter EK</th><th>Inserat</th><th>Referenz</th></tr></thead><tbody>${age.map(row=>`<tr><td><strong>${escapeHtml(row.status)}</strong><br><small>${escapeHtml(row.label)}</small></td><td>${row.count}</td><td>${money(row.knownCost)}</td><td>${money(row.listingValue)}</td><td>${money(row.referenceValue)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">Noch kein aktueller Geschäftsbestand.</div>`;

  const recent = [...state.sales].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  document.getElementById("recentSales").innerHTML = recent.length ? `<div class="list">${recent.map(s=>{const calc=calculateSaleProfit(s); return `<div class="list-row"><div><strong>${escapeHtml(s.orderNo)}</strong><br><small>${fmtDate(s.date)} · ${escapeHtml(s.customer||"")}</small></div>${calc.profitKnown===false?'<span class="badge yellow">EK klären</span>':`<span class="${calc.profit>=0?"money-positive":"money-negative"}">${money(calc.profit)}</span>`}</div>`}).join("")}</div>` : `<div class="empty">Noch keine Verkäufe</div>`;
  renderAutomationOverview();
}

function renderAutomationOverview() {
  const taskTarget=document.getElementById("workflowTasksOverview");
  const warningTarget=document.getElementById("automationWarnings");
  const automationTarget=document.getElementById("automationStatus");
  if((!taskTarget&&!warningTarget&&!automationTarget)||!window.TcgBusinessAutomation)return;
  const workflow=TcgBusinessAutomation.buildWorkflowStatus(state);
  const tasks=TcgBusinessAutomation.buildWorkflowTasks(state);
  const issues=TcgBusinessAutomation.buildDataQualityIssues(state);
  const alerts=TcgBusinessAutomation.buildPriceAlerts(state);
  const important=[...issues,...alerts].filter(row=>row.severity!=="info");
  if(taskTarget)taskTarget.innerHTML=tasks.length?`<div class="workflow-task-list">${tasks.map(task=>`<button type="button" class="workflow-task" data-dashboard-task-kind="${escapeHtml(task.kind)}" data-dashboard-task-id="${escapeHtml(task.recordId)}"><span><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.details)}</small></span><span>${escapeHtml(task.actionLabel)} →</span></button>`).join("")}</div>`:`<div class="success"><strong>Keine offene Aufgabe</strong><br>Aktuell muss nichts kommissioniert, verpackt, versendet oder als Wareneingang aufgeteilt werden.</div>`;
  if(warningTarget)warningTarget.innerHTML=`<div class="automation-alert-list">${important.length?important.slice(0,8).map(row=>businessIssueButton(row,false)).join(""):`<div class="success"><strong>Keine dringende Warnung</strong><br>Daten- und Preisprüfungen melden derzeit keinen Handlungsbedarf.</div>`}${important.length>8?`<button type="button" class="secondary" data-view-jump="reports">${important.length-8} weitere Warnung(en) anzeigen</button>`:""}</div>`;
  if(automationTarget){
    const priceDate=state.sync?.lastPriceUpdate?new Date(state.sync.lastPriceUpdate).toLocaleString("de-DE"):"noch kein Lauf";
    const cards=[
      ["Ordner-Synchronisierung",state.sync?.autoFolder?"Aktiv":"Aus","imports"],
      ["Preisprüfung",state.sync?.autoPrices?"Aktiv":"Manuell","cardmarket"],
      ["Letzte Preisdaten",priceDate,"cardmarket"],
      ["SQLite-Speicher",window.desktopApp?"Bereit":"Browsermodus","settings"]
    ];
    automationTarget.innerHTML=`<div class="automation-status-grid">${cards.map(([label,value,view])=>`<button type="button" data-view-jump="${view}"><span>${escapeHtml(label)}</span><strong class="automation-value">${escapeHtml(value)}</strong></button>`).join("")}</div><small class="muted">Offene Vorgänge: ${workflow.purchasesInTransit} Einkauf/Einkäufe unterwegs · ${workflow.salesOpen} Verkauf/Verkäufe offen · ${workflow.salesShipped} versendet.</small>`;
  }
}

function businessIssueButton(row,showCategory=true){
  const action=row.action?`data-repair-action="${escapeHtml(row.action)}" data-record-id="${escapeHtml(row.recordId||"")}"`:`data-view-jump="${escapeHtml(row.target||"reports")}" data-filter-query="${escapeHtml(row.searchTerm||"")}"`;
  const title=showCategory?`${row.category||row.type||"Hinweis"}: ${row.title}`:row.title;
  return `<button type="button" class="business-issue ${escapeHtml(row.severity)}" ${action}><span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(row.details||row.type||"")}</small></span><span>${row.action?"Reparieren":"Öffnen"} →</span></button>`;
}

function repairWorkflowConsistency(showResult=true) {
  let synchronized=0;
  const pendingReceipts=state.purchases.filter(purchase=>purchase.status==="Eingetroffen"&&!purchase.inventoryCreated&&purchase.pendingItems?.length);
  state.sales.forEach(sale=>{
    const before=saleInventoryItems(sale).map(item=>`${item.id}:${item.status}`).join("|");
    syncSaleInventoryStatus(sale);
    const after=saleInventoryItems(sale).map(item=>`${item.id}:${item.status}`).join("|");
    if(before!==after)synchronized++;
  });
  if(synchronized){
    addMovement({type:"Automatikprüfung",quantity:0,reference:"Bestands- und Versandabläufe",note:`${synchronized} Verkaufszuordnung(en) korrigiert`});
    saveState();renderAll();
  }
  if(showResult)alert(pendingReceipts.length||synchronized?`${pendingReceipts.length} Wareneingang/-eingänge müssen noch auf Geschäft und Privat aufgeteilt werden. ${synchronized} Verkaufszuordnung(en) wurden berichtigt.`:"Alle Einkaufs-, Bestands- und Verkaufsabläufe sind bereits stimmig.");
  return {pendingReceipts:pendingReceipts.length,synchronized};
}

function distributeHistoricalSaleCost(sale,totalCost){
  const items=Array.isArray(sale.items)?sale.items:[];
  if(!items.length)return;
  const weights=items.map(item=>Math.max(1,Number(item.quantity||1))*Math.max(0,Number(item.unitPrice||0)));
  const fallbackWeights=items.map(item=>Math.max(1,Number(item.quantity||1)));
  const totalWeight=weights.reduce((sum,value)=>sum+value,0);
  const selectedWeights=totalWeight>0?weights:fallbackWeights;
  const divisor=selectedWeights.reduce((sum,value)=>sum+value,0)||1;
  let allocated=0;
  items.forEach((item,index)=>{
    const quantity=Math.max(1,Number(item.quantity||1));
    const lineCost=index===items.length-1?Math.max(0,totalCost-allocated):Math.round(totalCost*selectedWeights[index]/divisor*100)/100;
    allocated+=lineCost;
    item.cost=Math.round(lineCost/quantity*10000)/10000;
    item.allocatedCost=Math.round(lineCost*100)/100;
    item.costSource="historical_manual";
    delete item.costUnknown;
  });
}

function openHistoricalCostRepair(saleId){
  const sale=state.sales.find(row=>row.id===saleId);if(!sale)return;
  const currentStatus=String(sale.historicalCostStatus||"").toLowerCase();
  openModal(`Wareneinsatz reparieren – Verkauf #${sale.orderNo||"-"}`,[
    {name:"resolution",label:"Wie soll der alte Einstand behandelt werden?",type:"select",full:true,options:[
      {value:"confirmed",label:"Tatsächlichen Gesamt-Wareneinsatz nachtragen"},
      {value:"unknown",label:"Einstand ist nicht mehr zuverlässig ermittelbar"}
    ]},
    {name:"totalCost",label:"Gesamter Einstand der verkauften Karten (€)",type:"number",step:"0.01",full:true},
    {name:"note",label:"Nachweis / Grund der Korrektur",required:true,full:true}
  ],{
    resolution:currentStatus==="unknown"?"unknown":"confirmed",
    totalCost:currentStatus==="confirmed"||Number(sale.cost||0)>0?Number(sale.cost||0):"",
    note:sale.historicalCostNote||""
  },data=>{
    const note=String(data.note||"").trim();
    if(!note){alert("Bitte einen kurzen Nachweis oder Grund für die Korrektur eintragen.");return false;}
    if(data.resolution==="confirmed"){
      if(data.totalCost===""||!Number.isFinite(Number(data.totalCost))||Number(data.totalCost)<0){alert("Bitte den tatsächlichen Gesamt-Wareneinsatz als Betrag ab 0,00 € eintragen.");return false;}
      sale.cost=Math.round(Number(data.totalCost)*100)/100;
      sale.historicalCostStatus="confirmed";
      sale.costSource="historical_manual";
      sale.excludeCostFromLearning=false;
      distributeHistoricalSaleCost(sale,sale.cost);
    }else{
      sale.cost=0;
      sale.historicalCostStatus="unknown";
      sale.costSource="unknown_confirmed";
      sale.excludeCostFromLearning=true;
      (sale.items||[]).forEach(item=>{delete item.cost;delete item.allocatedCost;item.costUnknown=true;item.costSource="unknown_confirmed";});
    }
    sale.historicalCostNote=note;
    sale.historicalCostConfirmedAt=new Date().toISOString();
    addMovement({type:"Historischer Wareneinsatz",quantity:0,saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:data.resolution==="confirmed"?`Wareneinsatz ${money(sale.cost)} manuell bestätigt · ${note}`:`Einstand als unbekannt bestätigt · ${note}`});
    return true;
  });
}

let cardRepairRowsByKey=new Map();
let cardRepairAreaFilter="";
let cardRepairIssueFilter="";
let cardRepairSearch="";

function collectCardAssignmentRepairs(){
  const rows=[];
  const add=(area,areaLabel,key,record,context={})=>{
    if(!record||typeof record!=="object")return;
    const productId=cleanProductId(record.productId);
    const rawCatalog=productId?(state.productCatalog?.[productId]||BUILTIN_PRODUCT_CATALOG[productId]):null;
    const catalog=rawCatalog?{productId,...rawCatalog,...catalogCardData({productId})}:null;
    const inspection=window.TcgBusinessAutomation?.inspectCardAssignment?.(record,catalog,{catalogReady:Object.keys(state.productCatalog||{}).length>0});
    if(!inspection?.needsReview)return;
    rows.push({area,areaLabel,key,record,context,inspection,catalog});
  };
  (state.inventory||[]).forEach(item=>add("inventory","Bestand",`inventory:${item.id}`,item,{itemId:item.id}));
  (state.privateCollection||[]).forEach(item=>add("private","Privatsammlung",`private:${item.id}`,item,{itemId:item.id}));
  (state.purchases||[]).forEach(purchase=>(purchase.pendingItems||[]).forEach((item,index)=>add("purchase","Einkauf",`purchase:${purchase.id}:${index}`,item,{purchase,index,orderNo:purchase.orderNo})));
  (state.sales||[]).forEach(sale=>(sale.items||[]).forEach((item,index)=>add("sale","Verkauf",`sale:${sale.id}:${index}`,item,{sale,index,orderNo:sale.orderNo})));
  (state.watchlist||[]).filter(item=>!item.archived).forEach(item=>add("watch","Marktbeobachtung",`watch:${item.id}`,item,{watchId:item.id}));
  (state.wantlists||[]).forEach(list=>(list.entries||[]).filter(entry=>!entry.archived).forEach(entry=>add("want","Wantlist",`want:${list.id}:${entry.id}`,entry,{list,listId:list.id,entryId:entry.id})));
  cardRepairRowsByKey=new Map(rows.map(row=>[row.key,row]));
  return rows;
}

function cardRepairReference(row){
  if(row.area==="purchase")return `Einkauf #${row.context.orderNo||"-"}`;
  if(row.area==="sale")return `Verkauf #${row.context.orderNo||"-"}`;
  if(row.area==="want")return row.context.list?.name||"Wantlist";
  return row.areaLabel;
}

function dataRepairRecords(){
  const assignmentRows=collectCardAssignmentRepairs();
  const sales=(state.sales||[]).filter(sale=>{
    const calc=calculateSaleProfit(sale);
    const requested=(sale.items||[]).length?(sale.items||[]).reduce((sum,item)=>sum+Math.max(1,Number(item.quantity||1)),0):Math.max(0,Number(sale.quantity||0));
    const historicalResolution=["confirmed","unknown","linked"].includes(String(sale.historicalCostStatus||"").toLowerCase());
    const missingLots=requested>new Set(sale.itemIds||[]).size;
    return sale.status!=="Storniert"&&sale.status!=="Rückgabe eingetroffen"&&requested>0&&!historicalResolution&&(!calc.costKnown||missingLots);
  });
  return {assignmentRows,sales};
}

function renderDataRepairCenter(){
  const target=document.getElementById("dataRepairContent");if(!target)return;
  const records=dataRepairRecords();
  const unknownConfirmed=(state.sales||[]).filter(sale=>sale.historicalCostStatus==="unknown").length;
  const section=(title,count,body)=>`<section class="repair-section"><div class="repair-section-head"><div><h3>${escapeHtml(title)}</h3><small>${count} offen</small></div></div>${body}</section>`;
  const areaCounts=records.assignmentRows.reduce((map,row)=>(map[row.area]=(map[row.area]||0)+1,map),{});
  const criticalCount=records.assignmentRows.filter(row=>row.inspection.issues.some(issue=>issue.severity==="danger")).length;
  const filtered=records.assignmentRows.filter(row=>(!cardRepairAreaFilter||row.area===cardRepairAreaFilter)&&(!cardRepairIssueFilter||row.inspection.issues.some(issue=>issue.code===cardRepairIssueFilter))&&(!cardRepairSearch||cardRecordMatchesSearch(row.record,cardRepairSearch)||normalizeSearchTerm(cardRepairReference(row)).includes(normalizeSearchTerm(cardRepairSearch))));
  const issueOptions=[...new Map(records.assignmentRows.flatMap(row=>row.inspection.issues).map(issue=>[issue.code,issue.label])).entries()];
  const assignmentBody=records.assignmentRows.length?`<div class="repair-toolbar card-repair-toolbar"><input id="cardRepairSearch" placeholder="Karte, Setnummer oder Bestellung suchen …" value="${escapeHtml(cardRepairSearch)}"><select id="cardRepairAreaFilter"><option value="">Alle Bereiche</option>${[["inventory","Bestand"],["private","Privatsammlung"],["purchase","Einkäufe"],["sale","Verkäufe"],["watch","Marktbeobachtung"],["want","Wantlisten"]].map(([value,label])=>`<option value="${value}" ${cardRepairAreaFilter===value?"selected":""}>${label} (${areaCounts[value]||0})</option>`).join("")}</select><select id="cardRepairIssueFilter"><option value="">Alle Hinweise</option>${issueOptions.map(([value,label])=>`<option value="${escapeHtml(value)}" ${cardRepairIssueFilter===value?"selected":""}>${escapeHtml(label)}</option>`).join("")}</select><button type="button" class="secondary" id="repairAssignmentProposalBtn">Sichere CM-IDs vorschlagen</button><button type="button" class="secondary" id="repairMetadataBtn">Eindeutige Druckdaten ergänzen</button></div><div class="repair-result-count">${filtered.length} von ${records.assignmentRows.length} Zuordnungen angezeigt</div><div class="repair-list card-assignment-repair-list">${filtered.slice(0,200).map(row=>{const names=cardDisplayNames(row.record);return `<div class="repair-row ${row.inspection.issues.some(issue=>issue.severity==="danger")?"repair-row-danger":""}"><div><span class="repair-area-badge">${escapeHtml(row.areaLabel)}</span><strong>${escapeHtml(names.primary||"Unbekannte Karte")}</strong><small>${escapeHtml(cardRepairReference(row))} · ${escapeHtml([row.record.setName||row.record.set,row.record.collectorNumber,row.record.rarity||row.record.version,`CM ${row.inspection.productId||"fehlt"}`].filter(Boolean).join(" · "))}</small><div class="repair-issue-list">${row.inspection.issues.map(issue=>`<span class="repair-issue ${issue.severity}">${escapeHtml(issue.label)}</span>`).join("")}</div></div><button type="button" class="secondary" data-card-repair-key="${escapeHtml(row.key)}">Zuordnung prüfen</button></div>`;}).join("")||'<div class="empty">Für diesen Filter gibt es keine offenen Zuordnungen.</div>'}</div>`:`<div class="success">Alle Karten in allen Bereichen sind vollständig und plausibel zugeordnet.</div>`;
  const salesBody=records.sales.length?`<div class="repair-list">${records.sales.map(sale=>`<div class="repair-row"><div><strong>Verkauf #${escapeHtml(sale.orderNo||"-")}</strong><small>${Number(sale.quantity||0)} Karte(n) · der bisher angezeigte Gewinn ist nicht belastbar</small></div><div class="row-actions"><button type="button" class="secondary" data-repair-sale-allocation="${escapeHtml(sale.id)}">Lose suchen</button><button type="button" class="primary" data-repair-sale-cost="${escapeHtml(sale.id)}">Wareneinsatz klären</button></div></div>`).join("")}</div>`:`<div class="success">Alle abgeschlossenen Verkäufe besitzen einen bestätigten Wareneinsatz.</div>`;
  target.innerHTML=`<div class="repair-summary"><div><small>Kartenzuordnungen offen</small><strong>${records.assignmentRows.length}</strong></div><div><small>Widersprüchliche IDs</small><strong class="${criticalCount?"money-negative":"money-positive"}">${criticalCount}</strong></div><div><small>Verkäufe zu klären</small><strong>${records.sales.length}</strong></div><div><small>Bewusst unbekannt</small><strong>${unknownConfirmed}</strong></div></div><div class="info repair-safety-note"><strong>Sicherheitsregel:</strong> Eine bestätigte Kartenzuordnung ändert nur Namen, Cardmarket-ID und Druckdaten. Mengen, Besitzart, Einstand, Inseratspreis, Reservierungen und Verkäufe bleiben unverändert. Verknüpfte Einkaufs-, Bestands- und Verkaufsdatensätze werden gemeinsam berichtigt.</div>${section("Karten- und Druckzuordnung in allen Bereichen",records.assignmentRows.length,assignmentBody)}${section("Historischen Wareneinsatz klären",records.sales.length,salesBody)}`;
}

function purchaseRepairLinkKey(purchase,line,index){
  return `${purchase.id}:${line.receiptLineKey||TcgBusinessAutomation.purchaseLineKey(line,index)}`;
}

function linkedCardRepairTargets(row){
  const targets=[];
  const recordsSeen=new Set();
  const linkKeys=new Set();
  const assetIds=new Set();
  const add=(record,label,area)=>{
    if(!record||recordsSeen.has(record))return;
    recordsSeen.add(record);targets.push({record,label,area});
  };
  add(row.record,cardRepairReference(row),row.area);
  if(["inventory","private"].includes(row.area)){
    if(row.record.id)assetIds.add(row.record.id);
    if(row.record.purchaseLineKey)linkKeys.add(row.record.purchaseLineKey);
  }
  if(row.area==="purchase")linkKeys.add(purchaseRepairLinkKey(row.context.purchase,row.record,row.context.index));
  if(row.area==="sale")(row.record.matchedItemIds||[]).forEach(id=>assetIds.add(id));

  const assets=[...(state.inventory||[]),...(state.privateCollection||[])];
  for(let pass=0;pass<2;pass++)assets.forEach(asset=>{
    if((asset.id&&assetIds.has(asset.id))||(asset.purchaseLineKey&&linkKeys.has(asset.purchaseLineKey))){
      add(asset,asset.ownership==="private"?"Privatsammlung":"Bestand",asset.ownership==="private"?"private":"inventory");
      if(asset.id)assetIds.add(asset.id);
      if(asset.purchaseLineKey)linkKeys.add(asset.purchaseLineKey);
    }
  });
  (state.purchases||[]).forEach(purchase=>(purchase.pendingItems||[]).forEach((line,index)=>{
    if(linkKeys.has(purchaseRepairLinkKey(purchase,line,index)))add(line,`Einkauf #${purchase.orderNo||"-"}`,"purchase");
  }));
  (state.sales||[]).forEach(sale=>(sale.items||[]).forEach(line=>{
    if((line.matchedItemIds||[]).some(id=>assetIds.has(id)))add(line,`Verkauf #${sale.orderNo||"-"}`,"sale");
  }));
  return targets;
}

function applyCardRepairIdentity(row,data,reason){
  const targets=linkedCardRepairTargets(row);
  const productId=cleanProductId(data.productId);
  if(!productId)return 0;
  const sourceIdentity=window.TcgCardSearch?.parseVariantLabel?.(row.record.name||"")||{};
  const patch={
    productId,metacardId:cleanProductId(data.metacardId),name:String(data.name||"").trim(),
    germanName:String(data.germanName||data.name||"").trim(),englishName:String(data.englishName||"").trim(),
    set:String(data.set||row.record.set||"").trim(),setName:String(data.setName||row.record.setName||"").trim(),
    variant:String(data.variant||data.inferredVariant||row.record.variant||sourceIdentity.variant||"").trim(),
    rarity:String(data.rarity||row.record.rarity||row.record.version||"").trim(),collectorNumber:String(data.collectorNumber||row.record.collectorNumber||"").trim(),
    productUrl:String(data.productUrl||row.record.productUrl||"").trim(),cardPasscode:String(data.cardPasscode||row.record.cardPasscode||"").trim()
  };
  const previousIds=[...new Set(targets.map(target=>cleanProductId(target.record.productId)||"fehlt"))];
  targets.forEach(target=>{
    if(target.area==="want"){
      target.record.history=Array.isArray(target.record.history)?target.record.history:[];
      target.record.history.push({at:new Date().toISOString(),productId:target.record.productId||"",name:target.record.name||"",set:target.record.set||target.record.setName||"",version:target.record.version||target.record.rarity||"",collectorNumber:target.record.collectorNumber||"",action:"Druckzuordnung im Reparaturcenter korrigiert"});
      target.record.history=target.record.history.slice(-100);
    }
    Object.assign(target.record,patch);
    if(target.area==="watch"||target.area==="want"||Object.prototype.hasOwnProperty.call(target.record,"version"))target.record.version=patch.rarity;
    if(target.area==="want")target.record.manuallyAssignedAt=new Date().toISOString();
  });
  state.productCatalog[productId]={...(state.productCatalog[productId]||{}),...patch,productId};
  const touchedPurchases=new Set();
  targets.forEach(target=>{
    if(target.area==="purchase"){
      const purchase=(state.purchases||[]).find(order=>(order.pendingItems||[]).includes(target.record));
      if(purchase)touchedPurchases.add(purchase);
    }
  });
  touchedPurchases.forEach(purchase=>refreshPurchaseAssetCosts(purchase));
  addMovement({type:"Kartenzuordnung korrigiert",quantity:0,productId,reference:cardRepairReference(row),note:`CM ${previousIds.join("/")} → ${productId} · ${targets.length} verknüpfte Datensätze · ${String(reason||"").trim()}`});
  return targets.length;
}

function openCardAssignmentRepair(row){
  if(!row)return;
  const targets=linkedCardRepairTargets(row);
  inventoryCardSearchSequence++;inventoryPriceSequence++;
  document.getElementById("modalTitle").textContent=`${row.areaLabel}: Karte und Druckvariante zuordnen`;
  const wrap=document.getElementById("modalFields");
  const current=[row.record.setName||row.record.set,row.record.collectorNumber,row.record.rarity||row.record.version,`CM ${cleanProductId(row.record.productId)||"fehlt"}`].filter(Boolean).join(" · ");
  wrap.innerHTML=`
    <div class="info full-width"><strong>Aktuell:</strong> ${escapeHtml(row.record.name||"Unbekannte Karte")}<br>${escapeHtml(current||"Noch keine Druckdaten")}<br><strong>${targets.length} Datensatz${targets.length===1?"":"sätze"}</strong> ${targets.length===1?"wird":"werden"} sicher gemeinsam berichtigt. Mengen, Preise und Status bleiben unverändert.</div>
    <label class="full-width inventory-card-search-label">Kartenname oder Setnummer suchen<input id="inventoryCardSearch" autocomplete="off" placeholder="Deutsch, Englisch oder Setnummer" value="${escapeHtml(row.record.collectorNumber||row.record.name||"")}"><div id="inventoryCardResults" class="inventory-card-results"></div></label>
    <div id="inventorySelectedCard" class="inventory-selected-card full-width"><span>Bitte die richtige Cardmarket-Druckvariante auswählen.</span></div>
    ${["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","cardPasscode"].map(name=>`<input type="hidden" name="${name}">`).join("")}
    <label>Set<input id="inventorySetDisplay" readonly></label><label>Setnummer<input id="inventoryNumberDisplay" readonly></label>
    <label class="full-width">Version / Seltenheit<input id="inventoryRarityDisplay" readonly></label>
    <input name="suggestedSell" type="hidden"><div id="inventoryPriceSuggestion" class="inventory-price-suggestion full-width"><span>Der Preis wird hier nicht verändert.</span></div>
    <label class="full-width">Grund der Korrektur<input name="reason" value="Fehlende oder falsche Karten- und Druckzuordnung korrigiert" required></label>`;
  wrap.dataset.inventorySelection="required";
  modalHandler=data=>{
    if(!data.productId||!data.name){alert("Bitte zuerst die richtige Druckvariante aus der Ergebnisliste auswählen.");return false;}
    if(!String(data.reason||"").trim()){alert("Bitte einen kurzen Grund für die Korrektur eintragen.");return false;}
    applyCardRepairIdentity(row,data,data.reason);
    setTimeout(openDataRepairCenter,0);
    return true;
  };
  let searchTimer;
  wrap.oninput=event=>{if(event.target.id!=="inventoryCardSearch")return;clearTimeout(searchTimer);inventoryCardSearchSequence++;wrap.dataset.inventorySelection="required";["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","cardPasscode","suggestedSell"].forEach(name=>{const field=wrap.querySelector(`[name="${name}"]`);if(field)field.value="";});document.getElementById("inventorySelectedCard").innerHTML="<span>Bitte die richtige Druckvariante auswählen.</span>";searchTimer=setTimeout(()=>renderInventoryCardSearch(event.target.value,row.record),220);};
  wrap.onclick=event=>{handleInventoryProductChoice(event);};
  inventoryModalVariants=new Map();configureModalAction({submitLabel:"Zuordnung übernehmen"});showDialogSafely(document.getElementById("modal"));
  const query=row.record.collectorNumber||row.record.name||row.record.germanName||row.record.englishName||"";
  if(query)setTimeout(()=>renderInventoryCardSearch(query,row.record),0);
}

async function openSafeCardAssignmentProposals(){
  const rows=dataRepairRecords().assignmentRows.filter(row=>!cleanProductId(row.record.productId));
  const proposals=[];
  const coveredRecords=new Set();
  const candidateCache=new Map();
  for(const row of rows){
    if(coveredRecords.has(row.record))continue;
    const source=window.TcgCardSearch?.parseVariantLabel?.(row.record.name||row.record.germanName||row.record.englishName||"")||{};
    const urlSource=window.TcgCardSearch?.parseCardmarketProductUrl?.(row.record.productUrl||"")||{};
    const cacheKey=[source.baseName,source.variant,row.record.setName||row.record.set||urlSource.setSlug,row.record.rarity||row.record.version||source.rarity,urlSource.productBase].map(normalizeCardName).join("|");
    if(!candidateCache.has(cacheKey))candidateCache.set(cacheKey,await safeCatalogVariantFor(row.record));
    const candidate=candidateCache.get(cacheKey);
    if(!candidate)continue;
    const targets=linkedCardRepairTargets(row);
    targets.forEach(target=>coveredRecords.add(target.record));
    proposals.push({row,candidate,targets});
  }
  if(!proposals.length){
    alert("Es wurden keine weiteren sicheren CM-ID-Vorschläge gefunden. Die übrigen Fälle benötigen eine manuelle Prüfung über den Cardmarket-Link.");
    renderDataRepairCenter();
    return;
  }
  document.getElementById("dataRepairDialog").close();
  document.getElementById("modalTitle").textContent="Sichere CM-ID-Vorschläge prüfen";
  const wrap=document.getElementById("modalFields");
  wrap.oninput=null;wrap.onclick=null;delete wrap.dataset.inventorySelection;
  wrap.innerHTML=`<div class="info full-width"><strong>${proposals.length} sichere Zuordnung${proposals.length===1?"":"en"} gefunden.</strong><br>Verglichen wurden Kartenname, Set und die Cardmarket-Versionsnummer. Bitte kontrolliere die Vorschläge; erst „Ausgewählte übernehmen“ speichert sie. Mengen, Einstand, Status und Reservierungen bleiben unverändert.</div><div class="bulk-card-assignment-list full-width">${proposals.map((proposal,index)=>{const source=window.TcgCardSearch?.parseVariantLabel?.(proposal.row.record.name||"")||{};return `<label class="bulk-card-assignment-row"><input type="checkbox" data-safe-card-proposal="${index}" checked><span><strong>${escapeHtml(proposal.row.record.name||inventoryVariantName(proposal.candidate))}</strong><small>${escapeHtml(cardRepairReference(proposal.row))}</small></span><span><strong>CM ${escapeHtml(proposal.candidate.productId)}</strong><small>${escapeHtml([proposal.candidate.setName||proposal.candidate.set,proposal.candidate.collectorNumber||proposal.candidate.setCode,proposal.candidate.variant||proposal.candidate.inferredVariant,proposal.candidate.rarity||proposal.row.record.rarity||source.rarity].filter(Boolean).join(" · "))}</small></span></label>`;}).join("")}</div>`;
  modalHandler=()=>{
    const selected=[...wrap.querySelectorAll("[data-safe-card-proposal]:checked")].map(field=>proposals[Number(field.dataset.safeCardProposal)]).filter(Boolean);
    if(!selected.length){alert("Bitte mindestens einen Vorschlag auswählen oder den Dialog abbrechen.");return false;}
    selected.forEach(({row,candidate})=>{
      const source=window.TcgCardSearch?.parseVariantLabel?.(row.record.name||"")||{};
      applyCardRepairIdentity(row,{
        ...candidate,
        name:candidate.germanName||candidate.name||row.record.name,
        variant:candidate.variant||candidate.inferredVariant||source.variant||"",
        rarity:candidate.rarity||row.record.rarity||row.record.version||source.rarity||"",
        set:candidate.setCode||candidate.set||row.record.set||"",
        setName:candidate.setName||row.record.setName||"",
        collectorNumber:candidate.collectorNumber||candidate.setCode||row.record.collectorNumber||""
      },"Sicherer Abgleich aus Kartenname, Set und Versionsnummer bestätigt");
    });
    setTimeout(openDataRepairCenter,0);
    return true;
  };
  configureModalAction({submitLabel:`Ausgewählte übernehmen (${proposals.length})`});
  showDialogSafely(document.getElementById("modal"));
}

function openDataRepairCenter(){
  repairWorkflowConsistency(false);
  renderDataRepairCenter();
  showDialogSafely(document.getElementById("dataRepairDialog"));
}


function addMovement(entry={}) {
  state.movements ||= [];
  state.movements.unshift({id:uid(), timestamp:new Date().toISOString(), ...entry});
}
function movementRowClass(movement={}){
  if(movement.cancelledAt)return "movement-row-cancelled";
  const quantity=Number(movement.quantity||0);
  return quantity>0?"movement-row-positive":quantity<0?"movement-row-negative":"movement-row-neutral";
}
function canCancelInventoryMovement(movement={}){
  return Boolean(movement.id&&!movement.cancelledAt&&!movement.reversalOf&&Number(movement.quantity||0)!==0&&["Bestandskorrektur","Manueller Bestand"].includes(movement.type));
}
function inventoryItemsForMovement(movement={}){
  const exact=movement.inventoryGroupKey?state.inventory.filter(item=>inventoryGroupKey(item)===movement.inventoryGroupKey):[];
  if(exact.length)return exact;
  const productId=cleanProductId(movement.productId);
  const matches=state.inventory.filter(item=>productId&&cleanProductId(item.productId)===productId);
  const keys=new Set(matches.map(inventoryGroupKey));
  return keys.size<=1?matches:[];
}
function cancelInventoryMovement(movementId){
  const movement=(state.movements||[]).find(row=>row.id===movementId);
  if(!canCancelInventoryMovement(movement)){alert("Diese Bewegung kann nicht einzeln storniert werden. Automatische Buchungen werden über den zugehörigen Import oder Auftrag korrigiert.");return;}
  const matchingItems=inventoryItemsForMovement(movement);
  const plan=TcgBusinessAutomation.planInventoryMovementReversal(matchingItems,movement);
  if(!plan.valid){alert(plan.reason);return;}
  const reason=prompt(`Grund für die Stornierung von „${movement.type} ${Number(movement.quantity)>0?"+":""}${Number(movement.quantity)}“:`,"Fehlbuchung");
  if(reason===null)return;
  if(!String(reason).trim()){alert("Bitte einen Grund für die Stornierung eingeben.");return;}
  if(!confirm("Die Bewegung wird nicht gelöscht, sondern mit einer nachvollziehbaren Gegenbuchung storniert. Fortfahren?"))return;

  const reversalAddedIds=[];
  const reversalRemovedItems=[];
  if(plan.removeIds.length){
    const ids=new Set(plan.removeIds);
    state.inventory.filter(item=>ids.has(item.id)).forEach(item=>{
      reversalRemovedItems.push(structuredClone(item));
      adjustPurchaseOwnershipForAsset(item,purchaseBucketForAsset(item,"business"),null);
    });
    state.inventory=state.inventory.filter(item=>!ids.has(item.id));
  }
  if(plan.addCount){
    const stored=Array.isArray(movement.removedItems)?movement.removedItems:[];
    const fallback=movement.inventorySnapshot||matchingItems[0]||state.productCatalog?.[cleanProductId(movement.productId)];
    if(!fallback){alert("Die ursprünglichen Kartendaten fehlen. Bitte den Bestand stattdessen über „Bestand korrigieren“ berichtigen.");return;}
    for(let index=0;index<plan.addCount;index++){
      const source=stored[index]||stored[0]||fallback;
      const restored={...structuredClone(source),id:source.id&&!state.inventory.some(item=>item.id===source.id)?source.id:uid(),status:"Im Bestand",movementRecorded:true};
      delete restored.saleId;delete restored.saleOrderNo;delete restored.saleDate;delete restored.saleImportKey;
      state.inventory.push(restored);reversalAddedIds.push(restored.id);
      adjustPurchaseOwnershipForAsset(restored,null,purchaseBucketForAsset(restored,"business"));
    }
  }
  const reversalId=uid();
  movement.cancelledAt=new Date().toISOString();movement.cancelReason=String(reason).trim();movement.cancelledByMovementId=reversalId;
  addMovement({
    id:reversalId,type:`Stornierung: ${movement.type}`,quantity:-Number(movement.quantity||0),productId:cleanProductId(movement.productId),
    inventoryGroupKey:movement.inventoryGroupKey||inventoryGroupKey(state.inventory.find(item=>reversalAddedIds.includes(item.id))||matchingItems[0]||{}),
    reference:`Gegenbuchung zu ${fmtDate(movement.timestamp)}`,note:String(reason).trim(),reversalOf:movement.id,
    addedIds:reversalAddedIds,removedIds:plan.removeIds,removedItems:reversalRemovedItems
  });
  saveState();renderAll();
  const nextGroup=getInventoryGroups().find(group=>group.key===(movement.inventoryGroupKey||""))||getInventoryGroups().find(group=>cleanProductId(group.first.productId)===cleanProductId(movement.productId));
  if(nextGroup)openInventoryDetails(nextGroup.key);else document.getElementById("orderDetailDialog")?.close();
}
function adjustPurchaseOwnershipForAsset(asset,fromBucket,toBucket){
  if(!asset?.purchaseId||!asset.purchaseLineKey||fromBucket===toBucket)return;
  const purchase=state.purchases.find(row=>row.id===asset.purchaseId);if(!purchase)return;
  const line=(purchase.pendingItems||[]).find((row,index)=>`${purchase.id}:${TcgBusinessAutomation.purchaseLineKey(row,index)}`===asset.purchaseLineKey);if(!line)return;
  const fields={business:["receivedBusiness","materializedBusiness"],private:["receivedPrivate","materializedPrivate"],damaged:["receivedDamaged","materializedDamaged"]};
  (fields[fromBucket]||[]).forEach(field=>line[field]=Math.max(0,Number(line[field]||0)-1));
  (fields[toBucket]||[]).forEach(field=>line[field]=Number(line[field]||0)+1);
  purchase.inventoryCreated=(purchase.pendingItems||[]).every((item,index)=>TcgBusinessAutomation.normalizePurchaseReceiptLine(item,index).open===0);
}
function purchaseBucketForAsset(asset,ownership=asset?.ownership){
  if(ownership==="private")return "private";
  return asset?.status==="Beschädigt"?"damaged":"business";
}
function saleInventoryItems(sale){
  const ids=new Set(Array.isArray(sale?.itemIds)?sale.itemIds:[]);
  return state.inventory.filter(i=>ids.has(i.id));
}
function reserveSaleInventory(sale){
  if(!sale || sale.reservationCreated) return;
  sale.reservationCreated=true;
  sale.paidDate=sale.paidDate||todayISO();
  recordWorkflowChange(sale,"Zahlungsstatus",sale.paymentStatus||"Offen","Bezahlt");
  sale.paymentStatus="Bezahlt";
  syncSaleInventoryStatus(sale);
}
function inventoryGroupStats(group){
  const items=group.ids.map(id=>state.inventory.find(i=>i.id===id)).filter(Boolean);
  const shared=window.TcgBusinessAutomation?.calculateInventoryBuckets?.(items);
  if(shared)return {...shared,items};
  const currentItems=items.filter(i=>!["Verkauft","Storniert"].includes(i.status));
  const reservedItems=currentItems.filter(i=>i.status==="Reserviert");
  return {total:currentItems.length,reserved:reservedItems.length,available:Math.max(0,currentItems.length-reservedItems.length),unavailable:0,sold:items.length-currentItems.length,currentItems,reservedItems,availableItems:currentItems.filter(i=>i.status!=="Reserviert"),items};
}
function inventoryLotDetail(item){
  const purchase=state.purchases.find(row=>row.id===item.purchaseId);
  const lineIndex=purchase?.pendingItems?.findIndex((row,index)=>`${purchase.id}:${TcgBusinessAutomation.purchaseLineKey(row,index)}`===item.purchaseLineKey)??-1;
  const allocation=lineIndex>=0?TcgBusinessAutomation.allocatePurchaseCosts(purchase,purchase.costAllocationMethod||"value")[lineIndex]:null;
  const sale=state.sales.find(row=>row.id===item.saleId);
  const saleLine=(sale?.items||[]).find(row=>(row.matchedItemIds||[]).includes(item.id));
  const salePrice=Number(saleLine?.unitPrice||0);
  const costStatus=item.costStatus||((Number(item.cost)>0||allocation)?"known":"unknown");
  const cost=Number(item.cost||allocation?.unitCost||0);
  const saleQuantity=Math.max(1,(sale?.items||[]).reduce((sum,row)=>sum+Number(row.quantity||1),0)||Number(sale?.quantity||1));
  const saleResult=sale?calculateSaleProfit(sale):null;
  const netSale=salePrice&&saleResult?salePrice+(Number(sale.shippingPaid||0)-Number(saleResult.fee||0)-Number(saleResult.packaging||0)-Number(saleResult.postage||0)-Number(saleResult.refund||0))/saleQuantity:0;
  const profitKnown=costStatus!=="unknown"&&Boolean(salePrice);
  const profit=profitKnown?netSale-cost:null;
  const purchaseLine=lineIndex>=0?purchase.pendingItems[lineIndex]:null;
  const decision=TcgBusinessAutomation.decisionCostBreakdown({cardPrice:item.cardPrice??allocation?.unitPrice,fullCost:cost,cartFiller:item.cartFillerStatus??purchaseLine?.cartFillerStatus,incrementalShippingCost:item.incrementalShippingCost??purchaseLine?.incrementalShippingCost,incrementalDirectCost:item.incrementalDirectCost??purchaseLine?.incrementalDirectCost,decisionCostStatus:item.decisionCostStatus??purchaseLine?.decisionCostStatus});
  return {purchase,purchaseLine,allocation,decision,sale,salePrice,cost,costStatus,netSale,profit,profitKnown,roi:profitKnown&&cost>0?profit/cost*100:null};
}

function appendListingChange(item,{listed,price,mode="manual",reason=""}){
  item.listingHistory=Array.isArray(item.listingHistory)?item.listingHistory:[];
  const oldListed=Boolean(item.listed&&Number(item.listingPrice||0)>0);
  const oldPrice=oldListed?Number(item.listingPrice):null;
  const newListed=Boolean(listed&&Number(price)>0);
  const newPrice=newListed?Number(price):null;
  if(oldListed===newListed&&oldPrice===newPrice)return;
  const priorConfirmedListing=item.listingHistory.some(entry=>["first_listing","price_change"].includes(entry.eventType));
  const eventType=!newListed?"unlisted":!oldListed?"first_listing":priorConfirmedListing?"price_change":"price_change";
  item.listingHistory.push({id:uid(),eventType,changedAt:new Date().toISOString(),oldPrice,newPrice,changeMode:mode,reason:reason||(!newListed?"Inserat beendet":mode==="suggested"?"VK-Vorschlag übernommen":"Manuelle Änderung")});
}
function openInventoryDetails(groupKey){
  const group=getInventoryGroups(true).find(g=>g.key===groupKey);
  if(!group){ alert("Die Bestandsposition konnte nicht geöffnet werden. Bitte die Ansicht neu laden."); return; }
  const i=group.first, stats=inventoryGroupStats(group);
  const related=(state.movements||[]).filter(m=>{
    if(m.inventoryGroupKey===groupKey) return true;
    if(m.productId && cleanProductId(m.productId)===cleanProductId(i.productId)) return true;
    return false;
  });
  const inferred=stats.items.filter(item=>!item.movementRecorded).map(item=>({timestamp:item.purchaseDate||todayISO(),type:"Wareneingang / Bestand",quantity:1,reference:item.purchaseId?`Einkauf ${item.purchaseId}`:(item.lotId||"Bestand"),note:item.location||""}));
  const inferredSales=stats.items.filter(item=>item.status==="Verkauft"&&!item.saleMovementRecorded).map(item=>({timestamp:item.saleDate||item.purchaseDate||todayISO(),type:"Bestandsabgang / Verkauf",quantity:-1,reference:`Bestellung ${item.saleOrderNo||"-"}`,note:"Verkauftes Exemplar"}));
  const rows=[...related,...inferred,...inferredSales].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  const reservations=new Map();
  stats.items.filter(item=>item.status==="Reserviert").forEach(item=>{
    const sale=state.sales.find(s=>s.id===item.saleId);
    const key=item.saleId||item.saleOrderNo||"unbekannt";
    const current=reservations.get(key)||{saleId:item.saleId,orderNo:item.saleOrderNo||sale?.orderNo||"-",status:sale?.status||"Reserviert",quantity:0};
    current.quantity+=1; reservations.set(key,current);
  });
  const reservationRows=[...reservations.values()];
  const listingEvents=stats.items.flatMap((item,index)=>(item.listingHistory||[]).map(entry=>({...entry,copy:index+1}))).sort((a,b)=>new Date(b.changedAt||0)-new Date(a.changedAt||0));
  const detailItem=stats.currentItems[0]||i;
  const detailAnalysis=phase2InventoryAnalysis(detailItem);
  const decision=detailAnalysis.marketDecision||{};
  const ownExperience=ownSalesExperienceFor(i.productId);
  const ownHint=ownExperience?TcgBusinessAutomation.ownSalesPurchaseHint(ownExperience,decision.trend?.status):"ZU WENIG EIGENE DATEN";
  const priceGuide=decision.priceGuide||{};
  const decisionThresholds=decision.thresholds||{};
  const scenarioRows=(decision.scenarios||[]).map(row=>`<tr><td><strong>${escapeHtml(row.label)}</strong></td><td>${row.result?.price?money(row.result.price):"–"}</td><td>${row.result?.calculable?money(row.result.grossMargin):"nicht vollständig berechenbar"}</td><td>${row.result?.calculable?`<span class="${row.result.expectedProfit>=0?"money-positive":"money-negative"}">${row.result.expectedProfit>=0?"+":""}${money(row.result.expectedProfit)}</span>`:"nicht vollständig berechenbar"}</td><td>${row.result?.calculable&&row.result.roi!=null?pct(row.result.roi):"–"}</td></tr>`).join("");
  const detailPurchase=state.purchases.find(row=>row.id===detailItem.purchaseId);
  const lotRows=[...stats.items].sort((a,b)=>String(a.purchaseDate||"").localeCompare(String(b.purchaseDate||""))).map((item,index)=>{
    const lot=inventoryLotDetail(item);
    const purchaseReference=lot.purchase?`#${lot.purchase.orderNo||"-"}`:(item.source||item.lotId||"Manuelle Erfassung");
    const history=lot.sale?`Verkauf #${lot.sale.orderNo||"-"}${lot.salePrice?` · VK ${money(lot.salePrice)}`:""}`:item.status;
    const costText=lot.costStatus==="unknown"?'<span class="muted">unbekannt</span>':`<strong>${money(lot.cost)}</strong>${lot.costStatus==="confirmed_zero"?'<br><small>0 € bestätigt</small>':""}`;
    const resultText=lot.salePrice?(lot.profitKnown?`<br><small class="${lot.profit>=0?"money-positive":"money-negative"}">${lot.profit>=0?"+":""}${money(lot.profit)} · ${pct(lot.roi)}</small>`:'<br><small class="muted">Gewinn unbekannt: EK fehlt</small>'):"";
    return `<tr><td>${index+1}</td><td>${fmtDate(item.purchaseDate)||"–"}</td><td>${lot.purchase?`<button type="button" class="link-button" data-show-purchase="${escapeHtml(lot.purchase.id)}">${escapeHtml(purchaseReference)}</button>`:escapeHtml(purchaseReference)}${lot.purchase?.seller?`<br><small>${escapeHtml(lot.purchase.seller)}</small>`:""}</td><td>${lot.decision.cardPrice==null?"unbekannt":money(lot.decision.cardPrice)}${lot.allocation?`<br><small>+ ${money(lot.allocation.allocatedShipping)} Versand · ${money(lot.allocation.allocatedExtra)} Zusatz</small>`:""}</td><td>${costText}</td><td>${lot.decision.decisionCost==null?'<span class="muted">unbekannt</span>':`<strong>${money(lot.decision.decisionCost)}</strong><br><small>${lot.decision.cartFiller?"Warenkorbfüller":"kein Warenkorbfüller"} · + ${money(lot.decision.incrementalShipping)} Versand · ${money(lot.decision.incrementalDirect)} direkt</small>`}</td><td>${item.targetSell!=null?`<strong>${money(item.targetSell)}</strong>`:"Ziel fehlt"}${item.originalTargetSell!=null?`<br><small>ursprünglich ${money(item.originalTargetSell)}</small>`:""}<br><small>VK ${item.listed&&Number(item.listingPrice||0)>0?money(item.listingPrice):"nicht inseriert"}</small></td><td>${escapeHtml(history)}${resultText}<br><small>${item.longTermHold?"Langfristig halten":escapeHtml(item.holdingProfile||"Standard")}</small></td></tr>`;
  }).join("");
  const dialog=document.getElementById("orderDetailDialog");
  document.getElementById("orderDetailTitle").textContent="Bestand & Bewegungen";
  document.getElementById("orderDetailContent").innerHTML=`
    <div class="inventory-detail-head"><div><h3>${escapeHtml(i.name)}</h3><small>${escapeHtml(i.setName||i.set||"Set fehlt")} · ${escapeHtml(i.collectorNumber||i.set||"Setnummer fehlt")} · ${escapeHtml(i.rarity||"Version/Seltenheit fehlt")} · CM ${escapeHtml(i.productId||"-")}</small></div><div class="row-actions"><button type="button" class="secondary" data-correct-inventory="${escapeHtml(group.key)}">Bestand korrigieren</button>${stats.available?`<button type="button" class="secondary" data-business-to-private="${escapeHtml(group.key)}">1 Exemplar privat</button>`:""}<a class="button secondary" href="${escapeHtml(cardmarketUrl(i))}" target="_blank" rel="noopener noreferrer">Cardmarket öffnen ↗</a></div></div>
    <div class="inventory-stock-grid"><div><small>Gesamtbestand</small><strong>${stats.total}</strong></div><div><small>Reserviert</small><strong>${stats.reserved}</strong></div><div><small>Verfügbar</small><strong>${stats.available}</strong></div>${stats.unavailable?`<div><small>Nicht verfügbar</small><strong>${stats.unavailable}</strong></div>`:""}</div>
    <section class="market-decision-block"><div class="panel-head"><div><h3>MEINE VERKAUFSERFAHRUNG</h3><small>Printgenau aus deinen abgeschlossenen Verkäufen für CM ${escapeHtml(cleanProductId(i.productId)||"–")}.</small></div>${statusBadge(ownExperience?.dataQuality?.label||"KEINE DATEN")}</div>
      <div class="collection-summary inventory-analysis-summary">
        <div><small>Eigene Verkäufe / Stück</small><strong>${ownExperience?.saleCount||0} / ${ownExperience?.soldQuantity||0}</strong><small>${ownExperience?`${ownExperience.durationKnownCount} von ${ownExperience.soldQuantity} mit belastbarer Liegedauer`:"noch keine Daten"}</small></div>
        <div><small>Median / Ø Liegedauer</small><strong>${ownExperience?.medianDays==null?"unbekannt":`${ownExperience.medianDays} Tage`} / ${ownExperience?.averageDays==null?"unbekannt":`${ownExperience.averageDays} Tage`}</strong><small>${ownExperience?.minimumDays==null?"":`${ownExperience.minimumDays}–${ownExperience.maximumDays} Tage`}</small></div>
        <div><small>Letzter Verkauf</small><strong>${ownExperience?.lastSale?fmtDate(ownExperience.lastSale):"–"}</strong><small>30/90/180 Tage: ${ownExperience?.sales30||0} / ${ownExperience?.sales90||0} / ${ownExperience?.sales180||0}</small></div>
        <div><small>Ø / Median VK</small><strong>${ownExperience?.averageSellPrice==null?"unbekannt":money(ownExperience.averageSellPrice)} / ${ownExperience?.medianSellPrice==null?"unbekannt":money(ownExperience.medianSellPrice)}</strong></div>
        <div><small>Ø Gewinn / Ø ROI</small><strong>${ownExperience?.averageProfit==null?"EK unbekannt":money(ownExperience.averageProfit)} / ${ownExperience?.averageRoi==null?"–":pct(ownExperience.averageRoi)}</strong><small>${ownExperience?`${ownExperience.knownCostQuantity} von ${ownExperience.soldQuantity} mit bekanntem EK`:""}</small></div>
        <div><small>Eigene Umschlagklasse</small><strong>${escapeHtml(ownExperience?.turnoverClass?.displayLabel||"NICHT BEWERTBAR")}</strong></div>
        <div><small>Einkaufshinweis</small><strong>${escapeHtml(ownHint)}</strong><small>keine automatische Bestellung</small></div>
      </div>
    </section>
    <section class="market-decision-block"><div class="panel-head"><div><h3>MARKT</h3><small>Cardmarket Price Guide · gespeicherte Tageswerte für genau CM ${escapeHtml(decision.productId||i.productId||"–")}. Sprache und Zustand des Bestands werden angezeigt, aber nicht künstlich in den Price Guide hineingerechnet.</small></div>${statusBadge(decision.dataQuality||"UNZUREICHEND")}</div>
      <div class="collection-summary inventory-analysis-summary">
        <div><small>Aktuelle Referenz</small><strong>${decision.currentReference?money(decision.currentReference):"fehlt"}</strong><small>${escapeHtml(decision.referenceSource||"Keine Price-Guide-Referenz")} · ${decision.currentDate?fmtDate(decision.currentDate):"ohne Datum"}</small>${decision.priceExplanation?`<small>${escapeHtml(decision.priceExplanation)}</small>`:""}</div>
        <div><small>Price Guide Low / Low EX+</small><strong>${priceGuide.low?money(priceGuide.low):"–"} / ${priceGuide.lowEx?money(priceGuide.lowEx):"–"}</strong>${decision.lowOutlierExplanation?`<small class="money-warning">${escapeHtml(decision.lowOutlierExplanation)}</small>`:""}</div>
        <div><small>1 / 7 / 30 Tage</small><strong>${priceGuide.avg1?money(priceGuide.avg1):"–"} / ${priceGuide.avg7?money(priceGuide.avg7):"–"} / ${priceGuide.avg30?money(priceGuide.avg30):"–"}</strong><small>Trend ${priceGuide.trend?money(priceGuide.trend):"–"}</small></div>
        <div><small>Seit gestern</small><strong class="${marketChangeClass(decision.changes?.day1)}">${marketChangeText(decision.changes?.day1)}</strong></div>
        <div><small>7 Tage</small><strong class="${marketChangeClass(decision.changes?.day7)}">${marketChangeText(decision.changes?.day7)}</strong></div>
        <div><small>30 Tage</small><strong class="${marketChangeClass(decision.changes?.day30)}">${marketChangeText(decision.changes?.day30)}</strong></div>
        <div><small>Seit Einkauf</small><strong class="${marketChangeClass(decision.sincePurchase)}">${marketChangeText(decision.sincePurchase)}</strong><small>${decision.purchaseReference?`Referenz damals ${money(decision.purchaseReference)}`:"Kaufdatum oder passender Preisstand fehlt"}</small></div>
        <div><small>Seit Erstinserierung</small><strong class="${marketChangeClass(decision.sinceListing)}">${marketChangeText(decision.sinceListing)}</strong><small>${decision.listingReference?`Referenz damals ${money(decision.listingReference)}`:"keine belegte Erstinserierung oder kein Preisstand"}</small></div>
        <div><small>Markttrend</small><strong>${escapeHtml(decision.trend?.status||"UNZUREICHENDE DATEN")}</strong><small>${decision.trend?.weightedPercent==null?"keine belastbare Mehrperioden-Auswertung":`${decision.trend.weightedPercent>=0?"+":""}${pct(decision.trend.weightedPercent)} gewichtet · ${decision.historyPointCount||0} Stände`}</small></div>
      </div>
    </section>
    <section class="market-decision-block"><div class="panel-head"><div><h3>MEIN HANDEL</h3><small>Rechenhilfe auf Basis deiner Daten. Keine automatische Marktprognose und keine automatische Preisänderung.</small></div>${statusBadge(decision.recommendation||detailAnalysis.recommendation||"BEOBACHTEN")}</div>
      <div class="collection-summary inventory-analysis-summary">
        <div><small>EK / Einkaufsdatum</small><strong>${detailAnalysis.costKnown?money(detailAnalysis.cost):"unbekannt"}</strong><small>${fmtDate(detailItem.purchaseDate)||"Datum unbekannt"} · ${escapeHtml(detailPurchase?.seller||detailItem.source||"Quelle unbekannt")}</small></div>
        <div><small>Ziel-VK / aktueller VK</small><strong>${decision.originalTarget?money(decision.originalTarget):"Ziel fehlt"} / ${detailAnalysis.currentPrice?money(detailAnalysis.currentPrice):"nicht inseriert"}</strong><small>${detailItem.originalTargetSell!=null?`ursprünglicher Ziel-VK ${money(detailItem.originalTargetSell)}`:"kein historischer Ziel-VK belegt"}</small></div>
        <div><small>Mindestgewinn / Mindest-ROI</small><strong>${money(state.settings.minProfit)} / ${pct(state.settings.minRoi)}</strong></div>
        <div><small>Break-even</small><strong>${decisionThresholds.calculable?money(decisionThresholds.breakEven):"nicht vollständig berechenbar"}</strong><small>Mindestgewinn ${decisionThresholds.calculable?money(decisionThresholds.minimumProfitPrice):"–"} · Mindest-ROI ${decisionThresholds.calculable?money(decisionThresholds.minimumRoiPrice):"–"}</small></div>
        <div><small>Preisposition</small><strong>${escapeHtml(decision.pricePosition?.status||"NICHT BERECHENBAR")}</strong><small>${decision.pricePosition?.percent==null?"kein eigener VK oder keine Referenz":`${decision.pricePosition.percent>=0?"+":""}${pct(decision.pricePosition.percent)} zur gespeicherten Referenz`}</small></div>
        <div><small>Gewinnziel</small><strong>${escapeHtml(decision.profitTargetStatus||"NICHT BERECHENBAR")}</strong></div>
        <div><small>Bestand / Inserat</small><strong>${detailAnalysis.inventoryAgeDays==null?"unbekannt":`${detailAnalysis.inventoryAgeDays} Tage`} / ${detailAnalysis.listingAgeDays==null?"unbekannt":`${detailAnalysis.listingAgeDays} Tage`}</strong><small>${escapeHtml(detailAnalysis.profile||"UNKLASSIFIZIERT")}${detailAnalysis.longTerm?" · langfristig halten":""}</small></div>
        <div><small>Empfehlung</small><strong>${escapeHtml(decision.recommendation||detailAnalysis.recommendation||"BEOBACHTEN")}</strong><small>${escapeHtml(decision.priceAction||"KEINE AUTOMATISCHE PREISÄNDERUNG")}</small></div>
      </div>
      <div class="market-decision-reasons"><strong>Begründung</strong><ul>${(decision.reasons||detailAnalysis.factors||[]).map(reason=>`<li>${escapeHtml(reason)}</li>`).join("")||"<li>Keine ausreichenden Daten.</li>"}</ul></div>
      <div class="table-wrap"><table><thead><tr><th>Szenario</th><th>Preis</th><th>Rohmarge</th><th>Erwarteter Gewinn</th><th>ROI</th></tr></thead><tbody>${scenarioRows||'<tr><td colspan="5" class="empty">Szenarien sind nicht vollständig berechenbar.</td></tr>'}</tbody></table></div>
    </section>
    <h3>Einkaufslosen &amp; Einstand je Exemplar</h3>
    <div class="table-wrap"><table><thead><tr><th>Exemplar</th><th>Einkauf</th><th>Bestellung / Händler</th><th>Kartenpreis + Anteil</th><th>Vollkosten-EK</th><th>Entscheidungs-EK</th><th>Ziel-VK / aktueller VK</th><th>Status / Ergebnis</th></tr></thead><tbody>${lotRows||`<tr><td colspan="8" class="empty">Keine Einkaufshistorie vorhanden.</td></tr>`}</tbody></table></div>
    <h3>Inseratspreis-Verlauf</h3>
    <div class="table-wrap"><table><thead><tr><th>Datum</th><th>Exemplar</th><th>Art</th><th>Alt</th><th>Neu</th><th>Quelle / Grund</th></tr></thead><tbody>${listingEvents.length?listingEvents.map(entry=>`<tr><td>${fmtDate(entry.changedAt)}</td><td>${entry.copy}</td><td>${escapeHtml({original_target:"Ursprüngliches Ziel",first_listing:"Erstinserat",price_change:"Preisänderung",unlisted:"Nicht mehr inseriert",baseline:"Übernommener Altstand"}[entry.eventType]||entry.eventType)}</td><td>${entry.oldPrice==null?"–":money(entry.oldPrice)}</td><td>${entry.newPrice==null?"–":money(entry.newPrice)}</td><td>${escapeHtml(entry.changeMode||"")}<br><small>${escapeHtml(entry.reason||"")}</small></td></tr>`).join(""):`<tr><td colspan="6" class="empty">Noch keine Preisänderung gespeichert.</td></tr>`}</tbody></table></div>
    <h3>Reserviert für</h3>
    <div class="table-wrap"><table><thead><tr><th>Bestellung</th><th>Menge</th><th>Status</th></tr></thead><tbody>${reservationRows.length?reservationRows.map(r=>`<tr><td>${r.saleId?`<button class="link-button" data-show-sale="${escapeHtml(r.saleId)}">#${escapeHtml(r.orderNo)}</button>`:`#${escapeHtml(r.orderNo)}`}</td><td><strong>${r.quantity}</strong></td><td>${statusBadge(r.status)}</td></tr>`).join(""):`<tr><td colspan="3" class="empty">Aktuell keine Reservierungen.</td></tr>`}</tbody></table></div>
    <h3>Bewegungsverlauf</h3>
    <div class="table-wrap"><table class="movement-table"><thead><tr><th>Datum</th><th>Bewegung</th><th>Menge</th><th>Referenz</th><th>Info</th><th>Aktion</th></tr></thead><tbody>${rows.length?rows.map(m=>`<tr class="${movementRowClass(m)}"><td>${fmtDate(m.timestamp)}</td><td>${escapeHtml(m.type||"Bewegung")}${m.cancelledAt?`<br><small>Storniert: ${escapeHtml(m.cancelReason||"Gegenbuchung erstellt")}</small>`:""}</td><td class="${Number(m.quantity||0)>0?"money-positive":Number(m.quantity||0)<0?"money-negative":""}"><strong>${Number(m.quantity||0)>0?"+":""}${Number(m.quantity||0)}</strong></td><td>${escapeHtml(m.reference||"-")}</td><td>${escapeHtml(m.note||"")}</td><td>${canCancelInventoryMovement(m)?`<button type="button" class="secondary compact-button" data-cancel-movement="${escapeHtml(m.id)}">Stornieren</button>`:"–"}</td></tr>`).join(""):`<tr><td colspan="6" class="empty">Noch keine Bewegungen protokolliert.</td></tr>`}</tbody></table></div>`;
  dialog.dataset.saleId="";
  if(dialog.open) dialog.close();
  showDialogSafely(dialog);
}

function moveBusinessInventoryToPrivate(groupKey){
  const group=getInventoryGroups().find(row=>row.key===groupKey);if(!group)return;
  const item=inventoryGroupStats(group).availableItems[0];if(!item){alert("Es ist kein freies Exemplar vorhanden. Reservierte, beschädigte oder zurückgesendete Karten können nicht verschoben werden.");return;}
  if(!confirm(`Ein freies Exemplar von „${item.name||"dieser Karte"}“ in die Privatsammlung verschieben?`))return;
  adjustPurchaseOwnershipForAsset(item,purchaseBucketForAsset(item,"business"),"private");
  state.inventory=state.inventory.filter(row=>row.id!==item.id);
  state.privateCollection.push({...item,ownership:"private",status:"Privatsammlung",listed:false,listingPrice:0});
  addMovement({type:"Geschäftsbestand → Privat",quantity:-1,productId:cleanProductId(item.productId),reference:"Eigentumswechsel",note:item.name||"Karte"});
  saveState();renderAll();document.getElementById("orderDetailDialog")?.close();
}

function deletePrivateCard(itemId){
  const item=state.privateCollection.find(row=>row.id===itemId);if(!item)return;
  openModal(`Private Karte löschen – ${item.name||"Karte"}`,[
    {name:"reason",label:"Grund der Korrektur",required:true,full:true}
  ],{reason:"Fehlerhafte Erfassung"},data=>{
    const current=state.privateCollection.find(row=>row.id===itemId);if(!current)return true;
    adjustPurchaseOwnershipForAsset(current,"private",null);
    state.privateCollection=state.privateCollection.filter(row=>row.id!==itemId);
    addMovement({type:"Privatkorrektur",quantity:-1,productId:cleanProductId(current.productId),reference:"Privatsammlung",note:String(data.reason||"Fehlerhafte Erfassung").trim()});
    return true;
  },{submitLabel:"Karte löschen",destructive:true});
}

function inventoryDisplayStatus(item) {
  if (item.status === "Verkauft") return "Verkauft";
  if (item.listed && Number(item.listingPrice || 0) > 0) return "Inseriert";
  if (item.status === "Im Bestand") return "Nicht inseriert";
  return item.status || "Im Bestand";
}

function inventoryGroupDisplayStatus(group) {
  const stats=inventoryGroupStats(group);
  if(stats.reserved===stats.total&&stats.total>0)return "Reserviert";
  if(stats.reserved>0)return "Teilweise reserviert";
  const listed=stats.currentItems.filter(item=>item.listed&&Number(item.listingPrice||0)>0).length;
  if(listed===stats.total&&stats.total>0)return "Inseriert";
  if(listed>0)return "Teilweise inseriert";
  return inventoryDisplayStatus(stats.currentItems[0]||group.first);
}

function inventoryGroupKey(item) {
  const article = String(item.articleId || "").trim();
  if (article) return `article:${article}`;
  return [
    item.productId || "",
    item.name || "",
    item.set || "",
    item.rarity || "",
    item.language || "",
    item.condition || ""
  ].join("|");
}

function getInventoryGroups(includeZero=false) {
  const map = new Map();
  state.inventory.forEach(item => {
    const key = inventoryGroupKey(item);
    if (!map.has(key)) {
      map.set(key, {
        key,
        ids: [],
        first: item,
        quantity: 0,
        oldestDate: item.purchaseDate || todayISO()
      });
    }
    const group = map.get(key);
    group.ids.push(item.id);
    if(!["Verkauft","Storniert"].includes(item.status))group.quantity += 1;
    if(["Verkauft","Storniert"].includes(group.first.status)&&!["Verkauft","Storniert"].includes(item.status))group.first=item;
    if (new Date(item.purchaseDate || todayISO()) < new Date(group.oldestDate || todayISO())) {
      group.oldestDate = item.purchaseDate || todayISO();
    }
  });
  const groups=[...map.values()];
  return includeZero?groups:groups.filter(group=>group.quantity>0);
}

function syncFilterOptions(id, values, emptyLabel) {
  const select=document.getElementById(id);if(!select)return;
  const current=select.value;
  const options=[...new Set(values.map(value=>String(value||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"de",{numeric:true,sensitivity:"base"}));
  select.innerHTML=`<option value="">${escapeHtml(emptyLabel)}</option>${options.map(value=>`<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
  if(options.includes(current))select.value=current;
}

function inventoryPrintComplete(item={}) {
  return Boolean(cleanProductId(item.productId)&&String(item.setName||item.set||"").trim()&&String(item.collectorNumber||"").trim()&&String(item.rarity||"").trim());
}

function inventoryGroupPricing(group){
  const stats=inventoryGroupStats(group);
  const items=stats.currentItems||[];
  const knownCosts=items.filter(item=>["known","confirmed_zero"].includes(item.costStatus)).map(item=>Number(item.cost||0));
  const averageCost=knownCosts.length?knownCosts.reduce((sum,value)=>sum+value,0)/knownCosts.length:0;
  const minCost=knownCosts.length?Math.min(...knownCosts):0;
  const maxCost=knownCosts.length?Math.max(...knownCosts):0;
  const productId=cleanProductId(group.first?.productId);
  const catalog=state.productCatalog?.[productId]||{};
  const prices={...catalog,...group.first,cost:averageCost};
  const calculated=window.TcgBusinessAutomation?.calculateOwnedCardPriceTargets?.(prices,forwardPricingSettings())||{suggestedSell:0,marketSell:0,priceFloor:0,expectedProfit:0};
  const listed=items.filter(item=>item.listed&&Number(item.listingPrice||0)>0);
  const listingPrice=listed.length?listed.reduce((sum,item)=>sum+Number(item.listingPrice||0),0)/listed.length:0;
  const suggestedSell=Number(calculated.suggestedSell||0);
  const difference=suggestedSell&&listingPrice?suggestedSell-listingPrice:0;
  const threshold=listingPrice?Math.max(0.05,listingPrice*0.05):0.05;
  const explicitDailyChange=catalog.dailyChange===null||catalog.dailyChange===undefined||catalog.dailyChange===""?Number.NaN:Number(catalog.dailyChange);
  const dailyChange=Number.isFinite(explicitDailyChange)
    ? explicitDailyChange
    : Number(catalog.trend||0)-Number(catalog.previousTrend??catalog.trend??0);
  const trendBase=Number(catalog.previousTrend||0);
  const changePercent=trendBase?dailyChange/trendBase*100:0;
  const unprofitableAtMarket=Boolean(averageCost>0&&suggestedSell>0&&!calculated.profitableAtMarket);
  const expectedRoi=Number(calculated.expectedRoi||0);
  const traffic=!knownCosts.length||!suggestedSell?"gray":calculated.meetsTargetRoi?"green":calculated.profitableAtMarket?"yellow":"red";
  const marketDecisions=items.map(item=>phase2InventoryAnalysis(item).marketDecision).filter(Boolean);
  const decisionReview=marketDecisions.some(decision=>["PREIS PRÜFEN","BREAK-EVEN PRÜFEN","GEWINNZIEL GEFÄHRDET","KAPITALBINDUNG PRÜFEN","VK ERHÖHUNG PRÜFEN"].includes(decision.recommendation));
  const hasDecisionHistory=Boolean(marketDecisionHistoryByProduct[productId]?.length);
  return {averageCost,minCost,maxCost,knownCostCount:knownCosts.length,missingCostCount:Math.max(0,items.length-knownCosts.length),listingPrice,listedCount:listed.length,itemCount:items.length,suggestedSell,difference,expectedRoi,traffic,needsReprice:hasDecisionHistory?decisionReview:Boolean(listed.length&&suggestedSell&&Math.abs(difference)>=threshold),unprofitableAtMarket,dailyChange:Number.isFinite(dailyChange)?dailyChange:0,changePercent:Number.isFinite(changePercent)?changePercent:0,priceDate:catalog.priceDate||"",marketLow:Number(catalog.low||0),marketTrend:Number(catalog.trend||0),calculated,marketDecisions};
}

function inventoryAgeMatches(days, filter) {
  if(!filter)return true;
  if(filter==="0-30")return days<=30;
  if(filter==="31-60")return days>=31&&days<=60;
  if(filter==="61-90")return days>=61&&days<=90;
  return filter==="91+"?days>=91:true;
}

function renderInventory() {
  const q = document.getElementById("inventorySearch").value;
  const f = document.getElementById("inventoryStatusFilter").value;
  const groups=getInventoryGroups(true);
  groups.forEach(group=>group.pricing=inventoryGroupPricing(group));
  syncFilterOptions("inventorySetFilter",groups.map(group=>group.first.setName||group.first.set),"Alle Sets");
  syncFilterOptions("inventoryRarityFilter",groups.map(group=>group.first.rarity),"Alle Seltenheiten");
  syncFilterOptions("inventoryLanguageFilter",groups.map(group=>group.first.language),"Alle Sprachen");
  syncFilterOptions("inventoryConditionFilter",groups.map(group=>group.first.condition),"Alle Zustände");
  const setFilter=document.getElementById("inventorySetFilter")?.value||"";
  const rarityFilter=document.getElementById("inventoryRarityFilter")?.value||"";
  const languageFilter=document.getElementById("inventoryLanguageFilter")?.value||"";
  const conditionFilter=document.getElementById("inventoryConditionFilter")?.value||"";
  const stockFilter=document.getElementById("inventoryStockFilter")?.value||"current";
  const ageFilter=document.getElementById("inventoryAgeFilter")?.value||"";
  const qualityFilter=document.getElementById("inventoryQualityFilter")?.value||"";
  const profitFilter=document.getElementById("inventoryProfitFilter")?.value||"";
  const sort=document.getElementById("inventorySort")?.value||"name";
  const rows = groups.filter(group => {
    const i = group.first;
    const stats=inventoryGroupStats(group);
    const displayStatus = inventoryGroupDisplayStatus(group);
    const complete=inventoryPrintComplete(i);
    const qualityMatches=!qualityFilter||(qualityFilter==="complete"&&complete)||(qualityFilter==="incomplete"&&!complete)||(qualityFilter==="unpriced"&&!stats.currentItems.some(item=>item.listed&&Number(item.listingPrice||0)>0))||(qualityFilter==="reprice"&&group.pricing.needsReprice);
    const profitMatches=!profitFilter||(profitFilter==="missing-cost"&&group.pricing.missingCostCount>0)||(profitFilter==="green"&&group.pricing.traffic==="green")||(profitFilter==="yellow"&&group.pricing.traffic==="yellow")||(profitFilter==="red"&&group.pricing.traffic==="red");
    const stockMatches=stockFilter==="all"||(stockFilter==="zero"?stats.total===0:stats.total>0);
    return stockMatches&&cardRecordMatchesSearch({...i, status:displayStatus, quantity:group.quantity}, q)
      && (!f || displayStatus === f || stats.currentItems.some(item=>item.status===f))
      && (!setFilter||String(i.setName||i.set||"")===setFilter)
      && (!rarityFilter||String(i.rarity||"")===rarityFilter)
      && (!languageFilter||String(i.language||"")===languageFilter)
      && (!conditionFilter||String(i.condition||"")===conditionFilter)
      && inventoryAgeMatches(daysBetween(group.oldestDate),ageFilter)
      && qualityMatches&&profitMatches;
  }).sort((a,b)=>{
    if(sort==="set")return String(a.first.setName||a.first.set||"").localeCompare(String(b.first.setName||b.first.set||""),"de",{numeric:true,sensitivity:"base"})||String(a.first.name||"").localeCompare(String(b.first.name||""),"de",{sensitivity:"base"});
    if(sort==="age-desc")return daysBetween(b.oldestDate)-daysBetween(a.oldestDate);
    if(sort==="age-asc")return daysBetween(a.oldestDate)-daysBetween(b.oldestDate);
    if(sort==="value-desc")return Number(b.first.listingPrice||0)-Number(a.first.listingPrice||0);
    if(sort==="cost-desc")return b.pricing.averageCost-a.pricing.averageCost;
    if(sort==="cost-asc")return a.pricing.averageCost-b.pricing.averageCost;
    if(sort==="roi-desc")return b.pricing.expectedRoi-a.pricing.expectedRoi;
    if(sort==="quantity-desc")return b.quantity-a.quantity;
    return cardDisplayNames(a.first).primary.localeCompare(cardDisplayNames(b.first).primary,"de",{numeric:true,sensitivity:"base"});
  });

  const visibleStats=rows.map(inventoryGroupStats);
  const summary=document.getElementById("inventorySummary");
  if(summary)summary.innerHTML=`
    <div><small>Angezeigte Druckvarianten</small><strong>${rows.length}</strong></div>
    <div><small>Gesamtbestand</small><strong>${visibleStats.reduce((sum,row)=>sum+row.total,0)}</strong></div>
    <div><small>Verfügbar</small><strong class="money-positive">${visibleStats.reduce((sum,row)=>sum+row.available,0)}</strong></div>
    <div><small>Reserviert</small><strong>${visibleStats.reduce((sum,row)=>sum+row.reserved,0)}</strong></div>
    <div><small>Gebundenes Kapital</small><strong>${money(rows.reduce((sum,group)=>sum+inventoryGroupStats(group).currentItems.filter(item=>["known","confirmed_zero"].includes(item.costStatus)).reduce((part,item)=>part+Number(item.cost||0),0),0))}</strong></div>
    <div><small>EK fehlt</small><strong class="${rows.some(group=>group.pricing.missingCostCount)?"money-negative":"money-positive"}">${rows.reduce((sum,group)=>sum+group.pricing.missingCostCount,0)}</strong></div>
    <div><small>Unvollständige Druckdaten</small><strong class="${rows.some(group=>!inventoryPrintComplete(group.first))?"money-negative":"money-positive"}">${rows.filter(group=>!inventoryPrintComplete(group.first)).length}</strong></div>`;

  document.getElementById("inventoryTable").innerHTML = rows.length ? rows.map(group => {
    const i = group.first;
    const stats=inventoryGroupStats(group);
    const names = cardDisplayNames(i);
    const displayStatus = inventoryGroupDisplayStatus(group);
    const url = cardmarketUrl(i);
    const exactLink = /^https?:\/\//i.test(String(i.productUrl || state.productCatalog?.[cleanProductId(i.productId)]?.productUrl || ""));
    const pricing=group.pricing||inventoryGroupPricing(group);
    const itemAnalyses=stats.currentItems.map(item=>({item,analysis:phase2InventoryAnalysis(item)}));
    const representative=itemAnalyses.sort((a,b)=>(b.analysis.inventoryAgeDays??-1)-(a.analysis.inventoryAgeDays??-1))[0]||{item:i,analysis:phase2InventoryAnalysis(i)};
    const analysis=representative.analysis;
    const profiles=[...new Set(stats.currentItems.map(item=>window.TcgBusinessAutomation?.normalizeHoldingProfile?.(item.holdingProfile)||"UNKLASSIFIZIERT"))];
    const profileText=profiles.length===1?profiles[0]:`${profiles.length} Profile`;
    const currentMarginKnown=pricing.missingCostCount===0&&pricing.listingPrice>0;
    const currentMargin=currentMarginKnown?pricing.listingPrice-pricing.averageCost:null;
    const currentRoi=currentMarginKnown&&pricing.averageCost>0?currentMargin/pricing.averageCost*100:null;
    const price=pricing.listedCount&&pricing.listingPrice
      ? `${money(pricing.listingPrice)}${pricing.listedCount!==pricing.itemCount?`<br><small>${pricing.listedCount} Exemplar${pricing.listedCount===1?"":"e"} inseriert</small>`:""}`
      : '<span class="muted">Nicht inseriert</span>';
    const changeClass=pricing.dailyChange>0?"money-positive":pricing.dailyChange<0?"money-negative":"muted";
    const rowClass=`inventory-profit-${pricing.traffic} ${pricing.needsReprice||pricing.unprofitableAtMarket?"inventory-price-review":""}`;
    return `<tr class="${rowClass}">
      <td><a class="card-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="${exactLink ? "Genaue Kartenvariante auf Cardmarket öffnen" : "Cardmarket-Suche für diese Variante öffnen"}"><strong>${escapeHtml(names.primary)}</strong><span class="external-link">↗</span></a>${names.secondary?`<br><small>Englisch: ${escapeHtml(names.secondary)}</small>`:""}<br><small>CM ${escapeHtml(i.productId||"-")}</small></td>
      <td>${escapeHtml(i.setName||i.set||"-")}${i.setName&&i.set?`<br><small>${escapeHtml(i.set)}</small>`:""}${i.collectorNumber?`<br><small>${escapeHtml(i.collectorNumber)}</small>`:""}</td>
      <td>${escapeHtml(i.rarity || "-")}</td>
      <td><button class="stock-detail-button" data-inventory-details="${escapeHtml(group.key)}"><strong>${stats.total}</strong><span>${stats.total===0&&stats.sold?`${stats.sold} verkauft`:stats.reserved?`${stats.available} verfügbar · ${stats.reserved} reserviert`:`${stats.available} verfügbar`}</span></button></td>
      <td>${pricing.knownCostCount?`<strong>${money(pricing.averageCost)}</strong><br><small>${pricing.minCost!==pricing.maxCost?`${money(pricing.minCost)}–${money(pricing.maxCost)} · `:""}${pricing.knownCostCount}/${pricing.itemCount} bekannt</small>`:'<span class="muted">unbekannt</span>'}</td>
      <td>${price}</td>
      <td>${currentMarginKnown?`<span class="${currentMargin>=0?"money-positive":"money-negative"}"><strong>${currentMargin>=0?"+":""}${money(currentMargin)}</strong></span><br><small>${currentRoi==null?"ROI nicht berechenbar":pct(currentRoi)}</small>`:'<span class="muted">EK oder VK fehlt</span>'}</td>
      <td><span class="profit-light profit-light-${pricing.traffic}" title="Grün: Ziel-ROI · Gelb: mindestens profitabel · Rot: nicht rentabel · Grau: Daten fehlen"></span>${pricing.suggestedSell?`<strong>${money(pricing.suggestedSell)}</strong><br><small>Marktbasierter VK · ${pct(pricing.expectedRoi)} ROI</small>${pricing.unprofitableAtMarket?'<br><small class="money-negative">Zum Marktpreis nicht rentabel</small>':""}<br><button type="button" class="link-button compact-button" data-apply-group-price="${escapeHtml(group.key)}">Übernehmen</button>`:'<span class="muted">Keine Preisdaten</span>'}</td>
      <td>${pricing.priceDate?`<span class="${changeClass}"><strong>${pricing.dailyChange>0?"+":""}${money(pricing.dailyChange)}</strong></span><br><small>${pricing.changePercent?`${pricing.changePercent>0?"+":""}${pricing.changePercent.toFixed(1)} % · `:""}Price Guide ${fmtDate(pricing.priceDate)}</small>${pricing.needsReprice?'<br><span class="badge yellow">Preis prüfen</span>':""}`:'<span class="muted">Kein Preisstand</span>'}</td>
      <td><strong>${escapeHtml(analysis.priceGroup?.key||"–")}</strong><br><small>${escapeHtml(analysis.priceGroup?.label||"")}</small></td>
      <td>${escapeHtml(profileText)}${stats.currentItems.some(item=>item.longTermHold)?'<br><span class="badge blue">langfristig</span>':""}</td>
      <td><strong>${analysis.inventoryAgeDays==null?"unbekannt":`${analysis.inventoryAgeDays} Tage`}</strong><br><small>Inserat: ${analysis.listingAgeDays==null?"unbekannt":`${analysis.listingAgeDays} Tage`}</small></td>
      <td>${statusBadge(analysis.marketDecision?.recommendation||analysis.recommendation||"BEOBACHTEN")}<br><small>${escapeHtml(analysis.marketDecision?.trend?.status||analysis.marketSignal||"UNZUREICHENDE DATEN")}</small></td>
      <td>${statusBadge(displayStatus)}</td>
      <td>${stats.total>0?`<div class="row-actions"><button class="icon-button" data-edit-inventory-group="${escapeHtml(group.key)}">Bearbeiten</button><button class="icon-button" data-delete-inventory-group="${escapeHtml(group.key)}">Löschen</button></div>`:'<span class="muted">Historie</span>'}</td>
    </tr>`;
  }).join("") : `<tr><td colspan="15" class="empty">Keine Karten gefunden</td></tr>`;
}

const importMoney = value => value === null || value === undefined
  ? "–"
  : `${new Intl.NumberFormat("de-DE", {minimumFractionDigits:2, maximumFractionDigits:8}).format(Number(value))} €`;

function purchaseImportOldValues(summary) {
  const values=(summary?.distinct||[]).map(value=>value==="unknown"?"unbekannt":importMoney(Number(value)));
  return values.length?values.join(" / "):"unbekannt";
}

function purchaseImportIssueRows(rows=[]) {
  return rows.map(row=>`<tr><td>${escapeHtml(row.collectorNumber||"–")}</td><td>${escapeHtml(row.name||"–")}</td><td>${Number(row.quantity||0)||"–"}</td><td>${Number(row.foundQuantity??0)}</td><td>${escapeHtml(row.reason||"Prüfung erforderlich")}</td><td>${escapeHtml([row.sheet,row.rowNumber?`Zeile ${row.rowNumber}`:""].filter(Boolean).join(" · "))}</td></tr>`).join("");
}

function renderPurchasePriceImportPreview(preview, fileNames=[]) {
  const content=document.getElementById("purchasePriceImportContent");
  const confirmButton=document.getElementById("purchasePriceImportConfirm");
  if(!content||!confirmButton)return;
  const difference=Number(preview.controlDifference||0);
  const exact=Math.abs(difference)<0.0000001;
  const controlText=exact
    ? `Kontrollsumme stimmt exakt: ${importMoney(preview.sourceAllocatedCost)}.`
    : `Tabellensumme ${importMoney(preview.sourceAllocatedCost)} · Kontrollwert ${importMoney(preview.controlTotal)} · Abweichung ${difference>0?"+":""}${importMoney(difference)}. Es wird nichts automatisch korrigiert.`;
  const matchedRows=preview.matched.map(row=>`<tr>
    <td><strong>${escapeHtml(row.collectorNumber)}</strong><br><small>${escapeHtml(row.sourceRows.map(source=>source.sheet).filter((value,index,array)=>array.indexOf(value)===index).join(" / "))}</small></td>
    <td>${escapeHtml(row.name)}</td>
    <td>${purchaseImportOldValues(row.oldCost)}</td>
    <td><strong>${row.newCostPerItem===null?"unverändert":importMoney(row.newCostPerItem)}</strong>${row.allocatedCost!==null&&row.quantity>1?`<br><small>${importMoney(row.allocatedCost)} gesamt ÷ ${row.quantity}</small>`:""}</td>
    <td>${purchaseImportOldValues(row.oldExpectedSell)}</td>
    <td><strong>${row.expectedSell===null?"unverändert":importMoney(row.expectedSell)}</strong><br><small>Spalte „Erwarteter VK je Karte“</small></td>
    <td>${row.foundQuantity}<br><small>${escapeHtml(row.matchBasis||"Eindeutige Zuordnung")}</small></td>
  </tr>`).join("");
  content.innerHTML=`
    <div class="purchase-import-summary">
      <div><small>Datei${fileNames.length===1?"":"en"}</small><strong>${escapeHtml(fileNames.join(", "))}</strong></div>
      <div><small>Eindeutige Treffer</small><strong>${preview.matched.length} Positionen / ${preview.matchedQuantity} Karten</strong></div>
      <div><small>Nicht gefunden</small><strong>${preview.missing.length}</strong></div>
      <div><small>Mehrdeutig</small><strong>${preview.ambiguous.length}</strong></div>
      <div><small>Fehler / leere Zeilen</small><strong>${preview.errors.length} / ${preview.skipped.length}</strong></div>
      <div><small>EK-Summe der eindeutigen Treffer</small><strong>${importMoney(preview.sumImportedEk)}</strong></div>
    </div>
    ${preview.detectedCohort?`<div class="purchase-import-control ok"><strong>Zusammengehörigen Ankauf erkannt</strong><br>${preview.detectedCohort.date?`Bestandsdatum ${escapeHtml(fmtDate(preview.detectedCohort.date))} · `:""}${preview.detectedCohort.matchedGroups} von ${preview.detectedCohort.businessGroups} geschäftlichen Tabellenpositionen passen eindeutig zu diesem Importlos. Ältere gleichnamige Karten werden nicht verwendet.</div>`:""}
    <div class="purchase-import-control ${preview.controlWithinTolerance?"ok":"warning"}"><strong>${preview.controlWithinTolerance?"Kontrollsumme plausibel":"Kontrollsumme außerhalb der Toleranz"}</strong><br>${escapeHtml(controlText)}${preview.missingRequiredSheets.length?`<br><strong>Fehlende Blätter: ${escapeHtml(preview.missingRequiredSheets.join(", "))}</strong>`:""}</div>
    <section class="purchase-import-section"><h3>Diese Werte werden übernommen</h3>
      ${matchedRows?`<div class="table-wrap"><table class="purchase-import-table"><thead><tr><th>Kartennummer</th><th>Kartenname</th><th>Alter EK</th><th>Neuer EK je Exemplar</th><th>Alter erwarteter VK</th><th>Neuer erwarteter VK</th><th>Gefundene Menge</th></tr></thead><tbody>${matchedRows}</tbody></table></div>`:'<div class="warning">Keine eindeutigen Treffer vorhanden.</div>'}
    </section>
    ${preview.ambiguous.length?`<section class="purchase-import-section"><h3>Mehrdeutige Treffer – nicht verändern</h3><div class="table-wrap"><table><thead><tr><th>Kartennummer</th><th>Kartenname</th><th>Menge Tabelle</th><th>Gefunden</th><th>Grund</th><th>Quelle</th></tr></thead><tbody>${purchaseImportIssueRows(preview.ambiguous)}</tbody></table></div></section>`:""}
    ${preview.missing.length?`<section class="purchase-import-section"><h3>Nicht gefundene Karten – nicht verändern</h3><div class="table-wrap"><table><thead><tr><th>Kartennummer</th><th>Kartenname</th><th>Menge Tabelle</th><th>Gefunden</th><th>Grund</th><th>Quelle</th></tr></thead><tbody>${purchaseImportIssueRows(preview.missing)}</tbody></table></div></section>`:""}
    ${preview.errors.length?`<section class="purchase-import-section"><h3>Fehlerhafte Tabellenzeilen – nicht verändern</h3><div class="table-wrap"><table><thead><tr><th>Kartennummer</th><th>Kartenname</th><th>Menge Tabelle</th><th>Gefunden</th><th>Grund</th><th>Quelle</th></tr></thead><tbody>${purchaseImportIssueRows(preview.errors)}</tbody></table></div></section>`:""}
    ${preview.skipped.length?`<section class="purchase-import-section"><h3>Übersprungen</h3><p class="muted">${preview.skipped.length} Zeile${preview.skipped.length===1?" wurde":"n wurden"} wegen leerer Menge oder Menge 0 nicht berücksichtigt.</p></section>`:""}`;
  confirmButton.disabled=!preview.canApply;
}

async function openPurchasePriceImport(files) {
  const dialog=document.getElementById("purchasePriceImportDialog");
  const content=document.getElementById("purchasePriceImportContent");
  const confirmButton=document.getElementById("purchasePriceImportConfirm");
  if(!dialog||!content||!confirmButton)return;
  dialog.showModal();
  confirmButton.disabled=true;
  content.innerHTML='<div class="info">Tabelle wird gelesen und sicher mit dem Geschäftsbestand abgeglichen …</div>';
  try{
    if(!window.desktopApp?.parsePurchasePriceFile)throw new Error("Der Tabellenimport ist nur in der installierten Desktop-App verfügbar.");
    const parsedFiles=[];
    for(const file of files){
      const data=await file.arrayBuffer();
      parsedFiles.push(await window.desktopApp.parsePurchasePriceFile({fileName:file.name,data}));
    }
    const preview=window.TcgPurchasePriceImport.buildPreview(parsedFiles,state.inventory);
    pendingPurchasePriceImport={parsedFiles,fileNames:files.map(file=>file.name),preview};
    renderPurchasePriceImportPreview(preview,pendingPurchasePriceImport.fileNames);
  }catch(error){
    console.error("EK-/Ziel-VK-Import konnte nicht vorbereitet werden:",error);
    pendingPurchasePriceImport=null;
    content.innerHTML=`<div class="warning"><strong>Die Tabelle konnte nicht geprüft werden.</strong><br>${escapeHtml(error?.message||String(error))}</div>`;
  }
}

async function confirmPurchasePriceImport() {
  if(!pendingPurchasePriceImport)return;
  const content=document.getElementById("purchasePriceImportContent");
  const confirmButton=document.getElementById("purchasePriceImportConfirm");
  confirmButton.disabled=true;
  try{
    const currentPreview=window.TcgPurchasePriceImport.buildPreview(pendingPurchasePriceImport.parsedFiles,state.inventory);
    pendingPurchasePriceImport.preview=currentPreview;
    if(!currentPreview.canApply){renderPurchasePriceImportPreview(currentPreview,pendingPurchasePriceImport.fileNames);throw new Error("Die Zuordnung hat sich geändert. Bitte die aktuelle Vorschau prüfen.");}
    const applied=window.TcgPurchasePriceImport.applyPreview(currentPreview,state.inventory,{makeId:uid});
    const nextState={...state,inventory:applied.inventory};
    if(window.desktopApp?.saveState){
      const saved=await window.desktopApp.saveState(nextState);
      localStorage.setItem(DESKTOP_UPDATED_KEY,saved?.updatedAt||new Date().toISOString());
    }
    state=nextState;
    localStorage.setItem(DB_KEY,JSON.stringify(state));
    tradeInsightsCache=null;
    scheduleMarketDecisionHistoryRefresh();
    renderAll();
    const summary=applied.summary;
    content.innerHTML=`<div class="purchase-import-result"><strong>Import abgeschlossen</strong><br>${summary.matched} eindeutige Positionen mit ${summary.matchedQuantity} Karten übernommen · ${summary.skipped} übersprungen · ${summary.errors} fehlerhaft.<br>Importierte EK-Summe: <strong>${importMoney(summary.importedCost)}</strong>.<br><small>Bestände, Mengen, Einkäufe und Verkäufe wurden nicht verändert.</small></div>`;
    pendingPurchasePriceImport=null;
  }catch(error){
    console.error("EK-/Ziel-VK-Import fehlgeschlagen:",error);
    if(pendingPurchasePriceImport)renderPurchasePriceImportPreview(pendingPurchasePriceImport.preview,pendingPurchasePriceImport.fileNames);
    const warning=document.createElement("div");warning.className="warning";warning.innerHTML=`<strong>Nichts wurde übernommen.</strong><br>${escapeHtml(error?.message||String(error))}`;content.prepend(warning);
  }
}

function renderSlowMovers(){
  const target=document.getElementById("slowMoverTable");if(!target)return;
  const q=document.getElementById("slowMoverSearch")?.value||"";
  const ageFilter=document.getElementById("slowMoverAgeFilter")?.value||"";
  const priceGroupFilter=document.getElementById("slowMoverPriceGroup")?.value||"";
  const profileFilter=document.getElementById("slowMoverProfile")?.value||"";
  const costFilter=document.getElementById("slowMoverCost")?.value||"";
  const longFilter=document.getElementById("slowMoverLongTerm")?.value||"";
  const languageFilter=document.getElementById("slowMoverLanguage")?.value||"";
  const conditionFilter=document.getElementById("slowMoverCondition")?.value||"";
  const trendFilter=document.getElementById("slowMoverTrend")?.value||"";
  const recommendationFilter=document.getElementById("slowMoverRecommendation")?.value||"";
  const profitTargetFilter=document.getElementById("slowMoverProfitTarget")?.value||"";
  const minPriceRaw=document.getElementById("slowMoverPriceMin")?.value||"";
  const maxPriceRaw=document.getElementById("slowMoverPriceMax")?.value||"";
  const minPrice=minPriceRaw===""?null:Number(minPriceRaw),maxPrice=maxPriceRaw===""?null:Number(maxPriceRaw);
  const sort=document.getElementById("slowMoverSort")?.value||"age-desc";
  const rows=getInventoryGroups().map(group=>{
    const stats=inventoryGroupStats(group),pricing=inventoryGroupPricing(group);
    const analyzed=stats.currentItems.map(item=>({item,analysis:phase2InventoryAnalysis(item)})).sort((a,b)=>(b.analysis.inventoryAgeDays??-1)-(a.analysis.inventoryAgeDays??-1));
    const representative=analyzed[0]||{item:group.first,analysis:phase2InventoryAnalysis(group.first)};
    const profiles=[...new Set(stats.currentItems.map(item=>window.TcgBusinessAutomation?.normalizeHoldingProfile?.(item.holdingProfile)||"UNKLASSIFIZIERT"))];
    const longTerm=stats.currentItems.some(item=>item.longTermHold);
    const referenceValue=stats.currentItems.reduce((sum,item)=>sum+Number(phase2InventoryAnalysis(item).referencePrice||0),0);
    const listingValue=stats.currentItems.filter(item=>item.listed).reduce((sum,item)=>sum+Number(item.listingPrice||0),0);
    const knownCost=stats.currentItems.filter(item=>["known","confirmed_zero"].includes(item.costStatus)).reduce((sum,item)=>sum+Number(item.cost||0),0);
    return {group,stats,pricing,representative,profiles,longTerm,referenceValue,listingValue,knownCost,missingCost:stats.currentItems.filter(item=>!["known","confirmed_zero"].includes(item.costStatus)).length};
  }).filter(row=>row.representative.analysis.inventoryAgeDays==null||row.representative.analysis.inventoryAgeDays>Number(state.settings.agingObserveMaxDays??30));
  syncFilterOptions("slowMoverProfile",rows.flatMap(row=>row.profiles),"Alle Profile");
  syncFilterOptions("slowMoverLanguage",rows.map(row=>row.representative.item.language),"Alle Sprachen");
  syncFilterOptions("slowMoverCondition",rows.map(row=>row.representative.item.condition),"Alle Zustände");
  const filtered=rows.filter(row=>{
    const item=row.representative.item,analysis=row.representative.analysis;
    const value=row.pricing.listingPrice||analysis.referencePrice||0;
    const sharedMatches=window.TcgBusinessAutomation?.matchesSlowMoverFilters?.({...analysis,costKnown:row.missingCost===0,longTerm:row.longTerm,currentPrice:value},item,{ageKey:ageFilter,priceGroup:priceGroupFilter,cost:costFilter,longTerm:longFilter,language:languageFilter,condition:conditionFilter,minPrice,maxPrice})!==false;
    const decision=analysis.marketDecision||{};
    const trendStatus=decision.trend?.status||"UNZUREICHENDE DATEN";
    const trendMatches=!trendFilter||(trendFilter==="rising"&&["STEIGEND","STARK STEIGEND"].includes(trendStatus))||(trendFilter==="stable"&&trendStatus==="STABIL")||(trendFilter==="falling"&&["FALLEND","STARK FALLEND"].includes(trendStatus))||(trendFilter==="insufficient"&&trendStatus==="UNZUREICHENDE DATEN");
    const recommendationMatches=!recommendationFilter||(recommendationFilter==="review"&&["PREIS PRÜFEN","BREAK-EVEN PRÜFEN","GEWINNZIEL GEFÄHRDET","KAPITALBINDUNG PRÜFEN"].includes(decision.recommendation))||decision.recommendation===recommendationFilter;
    const targetMatches=!profitTargetFilter||(profitTargetFilter==="risk"&&["GEWINNZIEL GEFÄHRDET","GEWINNZIEL AKTUELL NICHT REALISTISCH"].includes(decision.profitTargetStatus))||decision.profitTargetStatus===profitTargetFilter;
    return sharedMatches&&trendMatches&&recommendationMatches&&targetMatches&&cardRecordMatchesSearch(item,q)&&(!profileFilter||row.profiles.includes(profileFilter));
  }).sort((a,b)=>{
    if(sort==="value-desc")return b.listingValue-a.listingValue;
    if(sort==="cost-desc")return b.knownCost-a.knownCost;
    if(sort==="name")return cardDisplayNames(a.representative.item).primary.localeCompare(cardDisplayNames(b.representative.item).primary,"de",{numeric:true,sensitivity:"base"});
    return (b.representative.analysis.inventoryAgeDays??Number.MAX_SAFE_INTEGER)-(a.representative.analysis.inventoryAgeDays??Number.MAX_SAFE_INTEGER);
  });
  const summary=document.getElementById("slowMoverSummary");
  if(summary)summary.innerHTML=`<div><small>Druckvarianten</small><strong>${filtered.length}</strong></div><div><small>Physische Karten</small><strong>${filtered.reduce((sum,row)=>sum+row.stats.total,0)}</strong></div><div><small>Bekannter EK</small><strong>${money(filtered.reduce((sum,row)=>sum+row.knownCost,0))}</strong></div><div><small>Inseratswert</small><strong>${money(filtered.reduce((sum,row)=>sum+row.listingValue,0))}</strong></div><div><small>Price-Guide-Referenzwert</small><strong>${money(filtered.reduce((sum,row)=>sum+row.referenceValue,0))}</strong></div><div><small>EK unbekannt</small><strong>${filtered.reduce((sum,row)=>sum+row.missingCost,0)}</strong></div>`;
  target.innerHTML=filtered.length?filtered.map(row=>{
    const item=row.representative.item,analysis=row.representative.analysis,names=cardDisplayNames(item);
    const marginKnown=row.missingCost===0&&row.pricing.listingPrice>0;
    const rawMargin=marginKnown?row.pricing.listingPrice-row.pricing.averageCost:null;
    const rawRoi=marginKnown&&row.pricing.averageCost>0?rawMargin/row.pricing.averageCost*100:null;
    const decision=analysis.marketDecision||{};
    return `<tr><td><a class="card-link" href="${escapeHtml(cardmarketUrl(item))}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(names.primary)}</strong><span class="external-link">↗</span></a>${names.secondary?`<br><small>Englisch: ${escapeHtml(names.secondary)}</small>`:""}<br><small>${escapeHtml(item.setName||item.set||"–")} · ${escapeHtml(item.collectorNumber||"–")} · ${escapeHtml(item.rarity||"–")} · CM ${escapeHtml(cleanProductId(item.productId)||"fehlt")}</small><br><button class="link-button" data-inventory-details="${escapeHtml(row.group.key)}">Bestanddetails</button></td><td>${escapeHtml(item.language||"–")}<br><small>${escapeHtml(item.condition||"–")}</small></td><td>${row.stats.total}<br><small>${row.stats.available} verfügbar · ${row.stats.reserved} reserviert</small></td><td>${row.pricing.knownCostCount?money(row.pricing.averageCost):"unbekannt"}<br><small>${row.missingCost?`${row.missingCost}× EK unbekannt`:"EK vollständig"}</small></td><td>${row.pricing.listingPrice?money(row.pricing.listingPrice):"nicht inseriert"}<br><small>${row.pricing.listedCount}/${row.stats.total} inseriert</small></td><td>${marginKnown?`<span class="${rawMargin>=0?"money-positive":"money-negative"}">${rawMargin>=0?"+":""}${money(rawMargin)}</span><br><small>${rawRoi==null?"ROI nicht berechenbar":pct(rawRoi)}</small>`:'<span class="muted">EK oder VK fehlt</span>'}</td><td>${decision.currentReference?money(decision.currentReference):"fehlt"}<br><small>${escapeHtml(decision.referenceSource||"gespeicherter Price Guide")}</small></td><td>${statusBadge(decision.trend?.status||"UNZUREICHENDE DATEN")}<br><small>${escapeHtml(decision.dataQuality||"UNZUREICHEND")}</small></td><td class="${marketChangeClass(decision.changes?.day30)}">${marketChangeText(decision.changes?.day30)}</td><td class="${marketChangeClass(decision.sincePurchase)}">${marketChangeText(decision.sincePurchase)}</td><td>${statusBadge(decision.pricePosition?.status||"NICHT BERECHENBAR")}<br><small>${decision.pricePosition?.percent==null?"–":`${decision.pricePosition.percent>=0?"+":""}${pct(decision.pricePosition.percent)}`}</small></td><td>${statusBadge(decision.profitTargetStatus||"NICHT BERECHENBAR")}</td><td><strong>${analysis.inventoryAgeDays==null?"unbekannt":`${analysis.inventoryAgeDays} Tage`}</strong></td><td>${analysis.listingAgeDays==null?"unbekannt":`${analysis.listingAgeDays} Tage`}<br><small>${analysis.firstListingAt?fmtDate(analysis.firstListingAt):"keine belegte Erstinserierung"}</small></td><td>${statusBadge(analysis.inventoryBucket?.status||"ALTER UNBEKANNT")}</td><td><strong>${escapeHtml(analysis.priceGroup?.key||"–")}</strong><br><small>${escapeHtml(analysis.priceGroup?.label||"")}</small></td><td>${escapeHtml(row.profiles.join(" / "))}${row.longTerm?'<br><span class="badge blue">langfristig</span>':""}</td><td title="${escapeHtml((decision.reasons||analysis.factors||[]).join(" · "))}">${statusBadge(decision.recommendation||analysis.recommendation||"BEOBACHTEN")}<br><small>keine automatische Preisänderung</small></td></tr>`;
  }).join(""):`<tr><td colspan="18" class="empty">Keine Karten passen zu diesen Langsamdreher-Filtern.</td></tr>`;
}

function editInventoryGroup(groupKey, suggestedPrice=0) {
  const group = getInventoryGroups().find(g => g.key === groupKey);
  if (!group) return;
  const first = group.first;
  const initial = {
    listingStatus: suggestedPrice>0||first.listed ? "Inseriert" : "Nicht inseriert",
    listingPrice: Number(suggestedPrice||first.listingPrice||0),
    status: "Unverändert",
    location: first.location || "",
    note: first.note || "",
    costStatus:"Unverändert",cost:Number(first.cost||0),
    targetSell:first.targetSell??first.originalTargetSell??"",
    holdingProfile:window.TcgBusinessAutomation?.normalizeHoldingProfile?.(first.holdingProfile)||"UNKLASSIFIZIERT",longTermHold:Boolean(first.longTermHold)
  };
  openModal(`${group.quantity} Karte${group.quantity===1?"":"n"} bearbeiten`,[
    {name:"listingStatus",label:"Cardmarket-Inserat",type:"select",options:["Nicht inseriert","Inseriert"]},
    {name:"listingPrice",label:"Inseratspreis pro Stück (€)",type:"number",step:"0.01"},
    {name:"targetSell",label:"Aktueller Ziel-VK (€)",type:"number",step:"0.01"},
    {name:"costStatus",label:"EK-Datenstatus",type:"select",options:[{value:"Unverändert",label:"Unverändert (EK-Wert darf trotzdem geändert werden)"},{value:"known",label:"EK bekannt"},{value:"confirmed_zero",label:"0 € bestätigt"},{value:"unknown",label:"EK unbekannt"}]},
    {name:"cost",label:"Vollständiger EK pro Exemplar (€) – Änderung setzt den EK-Status automatisch",type:"number",step:"0.01",min:"0"},
    {name:"holdingProfile",label:"Halteprofil",type:"select",options:(window.TcgBusinessAutomation?.HOLDING_PROFILES||["UNKLASSIFIZIERT"]).map(value=>({value,label:value}))},
    {name:"longTermHold",label:"Bewusst langfristig halten",type:"checkbox"},
    {name:"status",label:"Bestandsstatus",type:"select",options:["Unverändert","Im Bestand","Beschädigt"]},
    {name:"location",label:"Lagerort"},
    {name:"note",label:"Notiz",full:true}
  ], initial, data => {
    const costValidation=window.TcgBusinessAutomation?.applyInventoryCostEdit?.(
      {cost:first.cost,costStatus:first.costStatus},data,{initialCost:initial.cost}
    );
    if(costValidation?.ok===false){alert("Bitte einen gültigen vollständigen EK ab 0,00 € eingeben.");return false;}
    const ids = new Set(inventoryGroupStats(group).currentItems.map(item=>item.id));
    state.inventory.forEach(item => {
      if (!ids.has(item.id)) return;
      const nextListed=data.listingStatus === "Inseriert";
      const nextPrice=nextListed?Number(data.listingPrice||0):0;
      appendListingChange(item,{listed:nextListed,price:nextPrice,mode:suggestedPrice>0?"suggested":"manual"});
      item.listed = nextListed;
      item.listingPrice = nextPrice;
      applyConfirmedTargetSell(item,data.targetSell===""?null:Number(data.targetSell),suggestedPrice>0?"suggested":"manual");
      window.TcgBusinessAutomation?.applyInventoryCostEdit?.(item,data,{initialCost:initial.cost});
      item.holdingProfile=window.TcgBusinessAutomation?.normalizeHoldingProfile?.(data.holdingProfile)||"UNKLASSIFIZIERT";
      item.longTermHold=Boolean(data.longTermHold);
      if(data.status!=="Unverändert"&&item.status!=="Reserviert"){
        const beforeBucket=purchaseBucketForAsset(item,"business");item.status = data.status || "Im Bestand";
        adjustPurchaseOwnershipForAsset(item,beforeBucket,purchaseBucketForAsset(item,"business"));
      }
      item.location = data.location || "";
      item.note = data.note || "";
    });
  });
}

function correctInventoryGroup(groupKey) {
  const group=getInventoryGroups().find(row=>row.key===groupKey);
  if(!group)return;
  const stats=inventoryGroupStats(group);
  const first=stats.currentItems[0]||group.first;
  document.getElementById("orderDetailDialog")?.close();
  openModal("Bestand und Druckdaten korrigieren",[
    {name:"desiredTotal",label:`Gewünschter Gesamtbestand (davon ${stats.reserved} reserviert)`,type:"number",required:true},
    {name:"set",label:"Set / Setkürzel"},
    {name:"setName",label:"Setname"},
    {name:"collectorNumber",label:"Setnummer"},
    {name:"rarity",label:"Version / Seltenheit"},
    {name:"reason",label:"Grund der Korrektur",required:true,full:true}
  ],{
    desiredTotal:stats.total,set:first.set||"",setName:first.setName||"",
    collectorNumber:first.collectorNumber||"",rarity:first.rarity||"",reason:""
  },data=>{
    const currentGroup=getInventoryGroups().find(row=>row.key===groupKey)||group;
    const currentStats=inventoryGroupStats(currentGroup);
    const candidates=[...currentStats.items].sort((a,b)=>{
      const aImport=/^STOCK-/i.test(String(a.importKey||a.lotId||""))?0:1;
      const bImport=/^STOCK-/i.test(String(b.importKey||b.lotId||""))?0:1;
      return aImport-bImport || new Date(b.purchaseDate||0)-new Date(a.purchaseDate||0);
    });
    const plan=window.TcgBusinessAutomation?.planInventoryTotalCorrection?.(candidates,data.desiredTotal);
    if(!plan?.valid){alert(plan?.reason||"Diese Bestandskorrektur ist nicht möglich.");return false;}
    const desiredMetadata={set:String(data.set||"").trim(),setName:String(data.setName||"").trim(),collectorNumber:String(data.collectorNumber||"").trim(),rarity:String(data.rarity||"").trim()};
    const metadataChanged=Object.entries(desiredMetadata).some(([field,value])=>String(first[field]||"")!==value);
    const removeIds=new Set(plan.removeIds||[]);
    const removedItems=currentStats.items.filter(item=>removeIds.has(item.id)).map(item=>structuredClone(item));
    recordLegacyInventoryEntries(currentStats.items.filter(item=>removeIds.has(item.id)));
    currentStats.items.filter(item=>removeIds.has(item.id)).forEach(item=>adjustPurchaseOwnershipForAsset(item,purchaseBucketForAsset(item,"business"),null));
    if(removeIds.size)state.inventory=state.inventory.filter(item=>!removeIds.has(item.id));
    state.inventory.forEach(item=>{
      if(!currentGroup.ids.includes(item.id))return;
      Object.assign(item,desiredMetadata);
    });
    const addedIds=[];
    const correctionLot=`CORRECTION-${Date.now()}`;
    for(let index=0;index<Number(plan.addCount||0);index++){
      const copy={...first,...desiredMetadata,id:uid(),status:"Im Bestand",purchaseDate:todayISO(),source:"Manuelle Bestandskorrektur",importKey:"",lotId:correctionLot,stockIdentity:first.stockIdentity||stockInventoryIdentity(first),movementRecorded:true};
      delete copy.saleId;delete copy.saleOrderNo;delete copy.saleDate;delete copy.saleImportKey;delete copy.purchaseId;
      state.inventory.push(copy);addedIds.push(copy.id);
    }
    const productId=cleanProductId(first.productId);
    const exactMetadata=Object.fromEntries(Object.entries(desiredMetadata).filter(([,value])=>value));
    if(productId){
      state.inventory.filter(item=>cleanProductId(item.productId)===productId).forEach(item=>Object.assign(item,exactMetadata));
      state.purchases.forEach(order=>(order.pendingItems||[]).filter(item=>cleanProductId(item.productId)===productId).forEach(item=>Object.assign(item,exactMetadata)));
      state.sales.forEach(order=>(order.items||[]).filter(item=>cleanProductId(item.productId)===productId).forEach(item=>Object.assign(item,exactMetadata)));
      state.watchlist.filter(item=>cleanProductId(item.productId)===productId).forEach(item=>{if(exactMetadata.set)item.set=exactMetadata.set;if(exactMetadata.rarity)item.version=exactMetadata.rarity;});
    }
    if(productId){const current=state.productCatalog[productId]||{};state.productCatalog[productId]={...current,...exactMetadata,productId,name:first.name||current.name||"",germanName:first.germanName||current.germanName||"",englishName:first.englishName||current.englishName||"",productUrl:first.productUrl||current.productUrl||""};}
    const delta=Number(plan.addCount||0)-removeIds.size;
    addMovement({type:delta?"Bestandskorrektur":metadataChanged?"Druckdatenkorrektur":"Bestandsprüfung",quantity:delta,productId,inventoryGroupKey:inventoryGroupKey({...first,...desiredMetadata}),reference:"Manuelle Korrektur",note:String(data.reason||"").trim(),addedIds,removedIds:[...removeIds],removedItems,inventorySnapshot:{...first,...desiredMetadata},previousTotal:currentStats.total,desiredTotal:Number(data.desiredTotal)});
  });
}

function renderPrivateCollection(){
  const target=document.getElementById("privateTable");if(!target)return;
  const q=String(document.getElementById("privateSearch")?.value||"");
  const all=state.privateCollection||[];
  syncFilterOptions("privateSetFilter",all.map(item=>item.setName||item.set),"Alle Sets");
  syncFilterOptions("privateRarityFilter",all.map(item=>item.rarity),"Alle Seltenheiten");
  syncFilterOptions("privateLanguageFilter",all.map(item=>item.language),"Alle Sprachen");
  syncFilterOptions("privateConditionFilter",all.map(item=>item.condition),"Alle Zustände");
  const setFilter=document.getElementById("privateSetFilter")?.value||"",rarityFilter=document.getElementById("privateRarityFilter")?.value||"";
  const languageFilter=document.getElementById("privateLanguageFilter")?.value||"",conditionFilter=document.getElementById("privateConditionFilter")?.value||"";
  const saleIntentFilter=document.getElementById("privateSaleIntentFilter")?.value||"";
  const rows=all.filter(item=>cardRecordMatchesSearch(item,q)&&(!setFilter||String(item.setName||item.set||"")===setFilter)&&(!rarityFilter||String(item.rarity||"")===rarityFilter)&&(!languageFilter||String(item.language||"")===languageFilter)&&(!conditionFilter||String(item.condition||"")===conditionFilter)&&(!saleIntentFilter||String(item.saleIntent||"Nicht verkaufen")===saleIntentFilter));
  const capital=rows.reduce((sum,item)=>sum+Number(item.cost||0),0);
  const saleReady=rows.filter(item=>item.saleIntent==="Verkaufsbereit").length;
  const summary=document.getElementById("privateSummary");
  if(summary)summary.innerHTML=`<div><small>Angezeigte private Karten</small><strong>${rows.length}</strong></div><div><small>Dokumentierter Einstand</small><strong>${money(capital)}</strong></div><div><small>Verkaufsbereit</small><strong>${saleReady}</strong></div><div><small>Geschäftsauswertung</small><strong>nicht enthalten</strong></div>`;
  target.innerHTML=rows.length?rows.map(item=>{const names=cardDisplayNames(item);return `<tr>
    <td><strong>${escapeHtml(names.primary)}</strong>${names.secondary?`<br><small>Englisch: ${escapeHtml(names.secondary)}</small>`:""}</td>
    <td>${escapeHtml(item.setName||item.set||"-")}<br><small>${escapeHtml(item.collectorNumber||"-")}</small></td>
    <td>${escapeHtml(item.rarity||"-")}</td><td>${escapeHtml(item.language||"-")} · ${escapeHtml(item.condition||"-")}</td>
    <td>${money(item.cost)}</td><td>${statusBadge(item.saleIntent||"Nicht verkaufen")}${Number(item.desiredSalePrice||0)>0?`<br><small>Wunsch ${money(item.desiredSalePrice)}</small>`:""}</td><td>${escapeHtml(item.location||"-")}</td><td><div class="row-actions"><button class="icon-button" data-edit-private="${item.id}">Bearbeiten</button><button class="icon-button" data-private-to-business="${item.id}">In Geschäftsbestand</button><button class="icon-button" data-delete-private="${item.id}">Löschen</button></div></td>
  </tr>`}).join(""):`<tr><td colspan="8" class="empty">Noch keine privaten Karten gespeichert.</td></tr>`;
}

function renderPurchases() {
  const q = document.getElementById("purchaseSearch").value;
  const f = document.getElementById("purchaseStatusFilter").value;
  syncFilterOptions("purchaseSellerFilter",state.purchases.map(row=>row.seller),"Alle Händler");
  const sellerFilter=document.getElementById("purchaseSellerFilter")?.value||"";
  const paymentFilter=document.getElementById("purchasePaymentFilter")?.value||"";
  const allocationFilter=document.getElementById("purchaseAllocationFilter")?.value||"";
  const paymentState=p=>p.status==="Storniert"?"Storniert":p.paymentStatus||(Number(p.refund||0)>=Number(p.cardValue||0)+Number(p.shipping||0)+Number(p.extra||0)&&Number(p.refund||0)>0?"Erstattet":Number(p.refund||0)>0?"Teilweise erstattet":"Bezahlt");
  const allocationState=p=>{
    if(!p.pendingItems?.length)return "business";
    const totals=purchaseOwnershipTotals(p);
    if(totals.open>0)return "open";
    if(totals.cancelled>0||totals.damaged>0)return "cancelled";
    if(totals.private>0)return "mixed";
    return "business";
  };
  const rows = state.purchases.filter(p=>cardRecordMatchesSearch(p,q) && (!f || p.status===f)&&(!sellerFilter||p.seller===sellerFilter)&&(!paymentFilter||paymentState(p)===paymentFilter)&&(!allocationFilter||allocationState(p)===allocationFilter));
  const purchaseSummary=document.getElementById("purchaseSummary");
  if(purchaseSummary)purchaseSummary.innerHTML=`<div><small>Angezeigte Einkäufe</small><strong>${rows.length}</strong></div><div><small>Geschäftlicher Zahlungsabfluss</small><strong>${money(rows.reduce((sum,row)=>sum+purchaseBusinessCost(row),0))}</strong></div><div><small>Unterwegs</small><strong>${rows.filter(row=>["Bestellt","Unterwegs","Teilweise eingetroffen"].includes(row.status)).length}</strong></div><div><small>Karten noch aufzuteilen</small><strong>${rows.reduce((sum,row)=>sum+Number(purchaseOwnershipTotals(row).open||0),0)}</strong></div>`;
  document.getElementById("purchaseTable").innerHTML = rows.length ? rows.map(p=>`
    <tr><td><strong>${escapeHtml(p.orderNo)}</strong></td><td>${fmtDate(p.date)}</td><td>${escapeHtml(p.seller||"")}</td>
    <td>${escapeHtml(p.country||"")}</td><td>${Number(p.items||0)}</td><td>${money(p.cardValue)}</td><td>${money(p.shipping)}</td>
    <td>${money(p.extra)}</td><td title="Abzüglich ${money(p.refund||0)} Gutschrift">${money(Math.max(0,Number(p.cardValue||0)+Number(p.shipping||0)+Number(p.extra||0)-Number(p.refund||0)))}</td><td>${statusBadge(paymentState(p))}</td><td>${statusBadge(p.status)}</td>
    <td><div class="row-actions"><button class="icon-button" data-show-purchase="${p.id}">Bestellung öffnen</button>${p.pendingItems?.length?`<button class="icon-button" data-receive-purchase="${p.id}">Wareneingang</button>`:""}<button class="icon-button" data-edit-purchase="${p.id}">Bearbeiten</button><button class="icon-button" data-delete-purchase="${p.id}">Löschen</button></div></td></tr>`).join("") : `<tr><td colspan="12" class="empty">Keine Einkäufe gefunden</td></tr>`;
}

function renderSales() {
  const q = document.getElementById("salesSearch").value;
  const f = document.getElementById("salesStatusFilter").value;
  syncFilterOptions("salesCustomerFilter",state.sales.map(row=>row.customer),"Alle Kunden");
  const customerFilter=document.getElementById("salesCustomerFilter")?.value||"";
  const paymentFilter=document.getElementById("salesPaymentFilter")?.value||"";
  const profitFilter=document.getElementById("salesProfitFilter")?.value||"";
  const paymentState=s=>s.status==="Storniert"?"Storniert":s.status==="Erstattet"||Number(s.refund||0)>=Number(s.revenue||0)&&Number(s.refund||0)>0?"Erstattet":s.paymentStatus||(["Offen"].includes(s.status)?"Offen":"Bezahlt");
  const rows = state.sales.filter(s=>{
    const calc=calculateSaleProfit(s);
    const profitMatches=!profitFilter||(profitFilter==="profit"&&calc.profitKnown!==false&&calc.profit>=0)||(profitFilter==="loss"&&calc.profitKnown!==false&&calc.profit<0)||(profitFilter==="incomplete"&&["incomplete","unknown"].includes(calc.quality));
    return cardRecordMatchesSearch(s,q)&&(!f||s.status===f)&&(!customerFilter||s.customer===customerFilter)&&(!paymentFilter||paymentState(s)===paymentFilter)&&profitMatches;
  });
  const realized=rows.filter(row=>["Abgeschlossen","Abgerechnet","Erstattet","Rückgabe eingetroffen"].includes(row.status));
  const knownRealized=realized.map(row=>calculateSaleProfit(row)).filter(calc=>calc.profitKnown!==false);
  const knownRealizedProfit=knownRealized.reduce((sum,calc)=>sum+calc.profit,0);
  const salesSummary=document.getElementById("salesSummary");
  if(salesSummary)salesSummary.innerHTML=`<div><small>Angezeigte Verkäufe</small><strong>${rows.length}</strong></div><div><small>Offene Vorgänge</small><strong>${rows.filter(row=>!["Abgeschlossen","Abgerechnet","Erstattet","Rückgabe eingetroffen","Storniert"].includes(row.status)).length}</strong></div><div><small>Bekannter realisierter Gewinn</small><strong class="${knownRealizedProfit>=0?"money-positive":"money-negative"}">${money(knownRealizedProfit)}</strong></div><div><small>Einstand zu klären</small><strong class="${rows.some(row=>calculateSaleProfit(row).profitKnown===false)?"money-negative":"money-positive"}">${rows.filter(row=>calculateSaleProfit(row).profitKnown===false).length}</strong></div>`;
  document.getElementById("salesTable").innerHTML = rows.length ? rows.map(s=>{const calc=calculateSaleProfit(s); return `
    <tr><td><strong>${escapeHtml(s.orderNo)}</strong></td><td>${fmtDate(s.date)}</td><td>${escapeHtml(s.customer||"")}</td>
    <td>${Number(s.quantity||0)}</td><td>${money(s.revenue)}</td><td>${money(calc.fee)}</td>
    <td class="${calc.profitKnown===false?"muted":calc.profit>=0?"money-positive":"money-negative"}" title="Datenqualität: ${escapeHtml(calc.quality||"unbekannt")}">${calc.profitKnown===false?'<span class="badge yellow">EK unbekannt</span>':money(calc.profit)}</td><td>${statusBadge(paymentState(s))}</td><td>${statusBadge(s.status)}</td>
    <td><div class="row-actions"><button class="icon-button" data-show-sale="${s.id}">Packen</button><button class="icon-button" data-edit-sale="${s.id}">Bearbeiten</button><button class="icon-button" data-delete-sale="${s.id}">Löschen</button></div></td></tr>`}).join("") : `<tr><td colspan="10" class="empty">Keine Verkäufe gefunden</td></tr>`;
  renderShippingWorkbench();
}

function renderSalesAnalysis(){
  const table=document.getElementById("salesAnalysisTable");if(!table)return;
  const all=[...(ownSalesExperienceCache.records||[])];
  syncFilterOptions("salesAnalysisSet",all.map(row=>row.setName),"Alle Sets");
  syncFilterOptions("salesAnalysisRarity",all.map(row=>row.rarity),"Alle Raritäten");
  syncFilterOptions("salesAnalysisProfile",all.map(row=>row.holdingProfile),"Alle Profile");
  const q=document.getElementById("salesAnalysisSearch")?.value||"";
  const minSales=Math.max(0,Number(document.getElementById("salesAnalysisMinSales")?.value||0));
  const quality=document.getElementById("salesAnalysisQuality")?.value||"";
  const turnover=document.getElementById("salesAnalysisTurnover")?.value||"";
  const profile=document.getElementById("salesAnalysisProfile")?.value||"";
  const set=document.getElementById("salesAnalysisSet")?.value||"";
  const rarity=document.getElementById("salesAnalysisRarity")?.value||"";
  const minRoi=document.getElementById("salesAnalysisMinRoi")?.value;
  const minAverageProfit=document.getElementById("salesAnalysisMinAverageProfit")?.value;
  const minTotalProfit=document.getElementById("salesAnalysisMinTotalProfit")?.value;
  const lastSaleFrom=document.getElementById("salesAnalysisLastSaleFrom")?.value||"";
  const priceMin=document.getElementById("salesAnalysisPriceMin")?.value;
  const priceMax=document.getElementById("salesAnalysisPriceMax")?.value;
  const sort=document.getElementById("salesAnalysisSort")?.value||"sales-desc";
  const enriched=all.map(row=>{
    const item=phase2CurrentInventory().find(asset=>cleanProductId(asset.productId)===cleanProductId(row.productId));
    const marketTrend=item?phase2InventoryAnalysis(item).marketDecision?.trend?.status:"";
    return {...row,marketTrend,purchaseHint:TcgBusinessAutomation.ownSalesPurchaseHint(row,marketTrend)};
  });
  const rows=enriched.filter(row=>cardRecordMatchesSearch(row,q)&&row.saleCount>=minSales&&(!quality||row.dataQuality?.key===quality)&&(!turnover||row.turnoverClass?.key===turnover)&&(!profile||row.holdingProfile===profile)&&(!set||row.setName===set)&&(!rarity||row.rarity===rarity)&&(minRoi===""||minRoi==null||row.averageRoi!=null&&row.averageRoi>=Number(minRoi))&&(minAverageProfit===""||minAverageProfit==null||row.averageProfit!=null&&row.averageProfit>=Number(minAverageProfit))&&(minTotalProfit===""||minTotalProfit==null||row.totalProfit!=null&&row.totalProfit>=Number(minTotalProfit))&&(!lastSaleFrom||String(row.lastSale||"")>=lastSaleFrom)&&(priceMin===""||priceMin==null||row.averageSellPrice!=null&&row.averageSellPrice>=Number(priceMin))&&(priceMax===""||priceMax==null||row.averageSellPrice!=null&&row.averageSellPrice<=Number(priceMax))).sort((a,b)=>{
    if(sort==="duration-asc")return (a.medianDays??Number.MAX_SAFE_INTEGER)-(b.medianDays??Number.MAX_SAFE_INTEGER);
    if(sort==="profit-desc")return (b.totalProfit??-Number.MAX_SAFE_INTEGER)-(a.totalProfit??-Number.MAX_SAFE_INTEGER);
    if(sort==="recent-desc")return String(b.lastSale||"").localeCompare(String(a.lastSale||""));
    if(sort==="name")return String(a.name||a.germanName||a.englishName).localeCompare(String(b.name||b.germanName||b.englishName),"de",{sensitivity:"base",numeric:true});
    return b.saleCount-a.saleCount||b.soldQuantity-a.soldQuantity;
  });
  const summary=document.getElementById("salesAnalysisSummary");
  if(summary)summary.innerHTML=`<div><small>Angezeigte Prints</small><strong>${rows.length}</strong></div><div><small>Eigene Verkäufe / Stück</small><strong>${rows.reduce((sum,row)=>sum+row.saleCount,0)} / ${rows.reduce((sum,row)=>sum+row.soldQuantity,0)}</strong></div><div><small>Ausreichende Daten</small><strong>${rows.filter(row=>row.dataQuality?.sufficient).length}</strong></div><div><small>Liegedauer bekannt</small><strong>${rows.reduce((sum,row)=>sum+row.durationKnownCount,0)}</strong></div><div><small>EK bekannt</small><strong>${rows.reduce((sum,row)=>sum+row.knownCostQuantity,0)}</strong></div><div><small>Bekannter Gesamtgewinn</small><strong>${money(rows.reduce((sum,row)=>sum+Number(row.totalProfit||0),0))}</strong></div>`;
  table.innerHTML=rows.length?rows.map(row=>{
    const primary=row.germanName||row.name||row.englishName||`CM ${row.productId}`;
    const secondary=row.englishName&&row.englishName!==primary?row.englishName:"";
    return `<tr><td><strong>${escapeHtml(primary)}</strong>${secondary?`<br><small>Englisch: ${escapeHtml(secondary)}</small>`:""}<br><small>${escapeHtml(row.setName||"Set unbekannt")} · ${escapeHtml(row.rarity||"Rarität unbekannt")} · CM ${escapeHtml(row.productId)}</small></td><td><strong>${row.saleCount}</strong><br><small>${row.observationDays} Beobachtungstage</small></td><td>${row.soldQuantity}</td><td>${row.lastSale?fmtDate(row.lastSale):"–"}</td><td>${row.sales30} / ${row.sales90} / ${row.sales180}</td><td><strong>${row.medianDays==null?"unbekannt":`${row.medianDays} Tage`}</strong><br><small>${row.durationKnownCount} von ${row.soldQuantity} belastbar</small></td><td>${row.averageDays==null?"–":`${row.averageDays} Tage`}<br><small>${row.minimumDays==null?"–":`${row.minimumDays} / ${row.maximumDays} Tage`}</small></td><td>${row.averageFullCost==null?'<span class="muted">EK unbekannt</span>':money(row.averageFullCost)}<br><small>${row.knownCostQuantity}/${row.soldQuantity} bekannt</small></td><td>${row.averageSellPrice==null?"–":money(row.averageSellPrice)} / ${row.medianSellPrice==null?"–":money(row.medianSellPrice)}<br><small>${row.minimumSellPrice==null?"":`${money(row.minimumSellPrice)}–${money(row.maximumSellPrice)}`}</small></td><td>${row.averageProfit==null?'<span class="muted">nicht berechenbar</span>':money(row.averageProfit)} / ${row.medianProfit==null?"–":money(row.medianProfit)}</td><td>${row.averageRoi==null?"–":pct(row.averageRoi)}</td><td class="${row.totalProfit==null?"muted":row.totalProfit>=0?"money-positive":"money-negative"}">${row.totalProfit==null?"nicht berechenbar":money(row.totalProfit)}</td><td>${statusBadge(row.dataQuality?.label||"KEINE DATEN")}</td><td>${escapeHtml(row.turnoverClass?.displayLabel||"NICHT BEWERTBAR")}</td><td>${statusBadge(row.purchaseHint)}${row.marketTrend?`<br><small>Markt getrennt: ${escapeHtml(row.marketTrend)}</small>`:""}<br><small>keine automatische Bestellung</small></td></tr>`;
  }).join(""):`<tr><td colspan="15" class="empty">Keine Verkaufsdaten passen zu diesen Filtern.</td></tr>`;
}

function shippingStageRank(status){
  return ({Offen:0,Bezahlt:0,Kommissioniert:1,Verpackt:2,Versendet:3,Abgeschlossen:4,Storniert:9})[status] ?? 0;
}
function materialShortageForSale(sale){
  const grouped=new Map();
  (sale.materialUsage||[]).forEach(u=>grouped.set(u.materialId,(grouped.get(u.materialId)||0)+Number(u.quantity||0)));
  return [...grouped].filter(([id,qty])=>qty>Number(state.materials.find(m=>m.id===id)?.stock||0));
}
function renderShippingWorkbench(){
  const queue=state.sales.filter(s=>!["Versendet","Abgeschlossen","Storniert"].includes(s.status))
    .sort((a,b)=>shippingStageRank(b.status)-shippingStageRank(a.status) || new Date(a.date)-new Date(b.date));
  const count=statuses=>queue.filter(s=>statuses.includes(s.status)).length;
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
  set("shippingOpenCount",count(["Offen","Bezahlt"]));
  set("shippingPickedCount",count(["Kommissioniert"]));
  set("shippingPackedCount",count(["Verpackt"]));
  set("shippingMaterialWarnings",state.materials.filter(m=>Number(m.stock||0)<=Number(m.minStock||0)).length);
  const host=document.getElementById("shippingQueue"); if(!host)return;
  host.innerHTML=queue.length?queue.map(s=>{
    const materialCost=saleMaterialCost(s);
    const next=s.status==="Kommissioniert"?"Verpackt":s.status==="Verpackt"?"Versendet":"Kommissioniert";
    return `<article class="shipping-card">
      <div class="shipping-card-main"><div><small>#${escapeHtml(s.orderNo||"-")} · ${fmtDate(s.date)||"-"}</small><strong>${escapeHtml(s.customer||"Unbekannter Kunde")}</strong><span>${Number(s.quantity||0)} Karten · ${money(s.cardValue||0)}</span></div>
      <div>${statusBadge(s.status)}</div></div>
      <div class="shipping-card-meta"><span>Versand: ${money(s.shippingPaid)}</span><span>Porto: ${money(s.postage)}</span><span>Material: ${money(materialCost)}</span></div>
      <div class="shipping-card-actions"><button class="primary" data-show-sale="${s.id}">Bestellung öffnen & weiter</button></div>
    </article>`;
  }).join(""):'<div class="empty">Keine offenen Versandbestellungen.</div>';
}

function renderMaterials(){
  const table=document.getElementById("materialTable"); if(!table) return;
  const q=(document.getElementById("materialSearch")?.value||"").toLowerCase();
  const rows=(state.materials||[]).filter(m=>!q||JSON.stringify(m).toLowerCase().includes(q));
  const now=new Date();
  const monthCost=state.sales.filter(s=>isSameMonth(s.date,now.getFullYear(),now.getMonth())&&s.status!=="Storniert").reduce((sum,s)=>sum+saleMaterialCost(s),0);
  document.getElementById("materialKinds").textContent=state.materials.length;
  document.getElementById("materialValue").textContent=money(state.materials.reduce((a,m)=>a+Number(m.stock||0)*Number(m.unitCost||0),0));
  document.getElementById("materialLowCount").textContent=state.materials.filter(m=>Number(m.stock||0)<=Number(m.minStock||0)).length;
  document.getElementById("materialMonthCost").textContent=money(monthCost);
  const cutoff=Date.now()-30*86400000;
  const materialPlan=m=>{const consumed=Math.abs((state.movements||[]).filter(row=>row.materialId===m.id&&Number(row.quantity||0)<0&&new Date(row.timestamp||row.date||0).getTime()>=cutoff).reduce((sum,row)=>sum+Number(row.quantity||0),0));const daily=consumed/30;const coverage=daily>0?Math.floor(Number(m.stock||0)/daily):Infinity;const target=Math.max(Number(m.minStock||0)*2,Math.ceil(daily*60));const reorder=Math.max(0,Math.ceil(target-Number(m.stock||0)));return{consumed,coverage,reorder};};
  table.innerHTML=rows.length?rows.map(m=>{const low=Number(m.stock||0)<=Number(m.minStock||0),plan=materialPlan(m),critical=low||plan.coverage<Number(m.leadTimeDays||7);return `<tr><td><button class="material-name-link" type="button" data-show-material="${m.id}"><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.unit||"Stück")} · Verlauf anzeigen</small></button></td><td>${Number(m.stock||0)}</td><td>${money(m.unitCost)}</td><td>${money(Number(m.stock||0)*Number(m.unitCost||0))}</td><td>${Number(m.minStock||0)}</td><td>${plan.consumed}</td><td>${Number.isFinite(plan.coverage)?`${plan.coverage} Tage`:"noch ohne Verbrauch"}</td><td class="${critical?'stock-low':'stock-ok'}">${critical?`Nachbestellen${plan.reorder?` · Vorschlag ${plan.reorder}`:""}`:"Ausreichend"}</td><td><div class="row-actions"><button class="icon-button" data-buy-material="${m.id}">Einkaufen</button><button class="icon-button" data-edit-material="${m.id}">Bearbeiten</button><button class="icon-button" data-delete-material="${m.id}">Löschen</button></div></td></tr>`}).join(""):'<tr><td colspan="9" class="empty">Noch kein Versandmaterial angelegt</td></tr>';
  const list=document.getElementById("templateList");
  list.innerHTML=state.materialTemplates.length?state.materialTemplates.map(t=>`<div class="template-chip"><div><strong>${escapeHtml(t.name)}</strong><small>${escapeHtml(t.shippingType||"Keine Versandart")} · ${(t.items||[]).map(i=>`${Number(i.quantity||0)}× ${escapeHtml(state.materials.find(m=>m.id===i.materialId)?.name||"Material")}`).join(", ")||"Keine Materialien"}</small></div><div class="row-actions"><button class="icon-button" data-edit-template="${t.id}">Bearbeiten</button><button class="icon-button" data-delete-template="${t.id}">Löschen</button></div></div>`).join(""):'<div class="empty">Noch keine Versandvorlagen gespeichert</div>';
}
function showMaterialHistory(materialId){
  const material=state.materials.find(row=>row.id===materialId);if(!material)return;
  const explicit=(state.movements||[]).filter(row=>row.materialId===materialId);
  const recordedExpenses=new Set(explicit.map(row=>row.expenseId).filter(Boolean));
  const legacy=(state.expenses||[]).filter(row=>row.materialId===materialId&&!recordedExpenses.has(row.id)).map(row=>({
    id:`expense-${row.id}`,timestamp:row.date,type:"Materialeinkauf",quantity:Number(String(row.description||"").match(/^\s*(\d+(?:[.,]\d+)?)/)?.[1]?.replace(",",".")||0),materialId,expenseId:row.id,reference:row.description||"Materialeinkauf",note:`${money(row.amount)}${row.note?` · ${row.note}`:""}`
  }));
  const movements=[...explicit,...legacy].sort((a,b)=>new Date(b.timestamp||b.date||0)-new Date(a.timestamp||a.date||0));
  const incoming=movements.filter(row=>Number(row.quantity||0)>0).reduce((sum,row)=>sum+Number(row.quantity||0),0);
  const outgoing=Math.abs(movements.filter(row=>Number(row.quantity||0)<0).reduce((sum,row)=>sum+Number(row.quantity||0),0));
  const dialog=document.getElementById("orderDetailDialog");
  if(dialog.open)dialog.close();
  dialog.dataset.saleId="";
  document.getElementById("orderDetailTitle").textContent=`Materialverlauf · ${material.name}`;
  document.getElementById("orderDetailContent").innerHTML=`<div class="order-summary-grid"><div><small>Aktueller Bestand</small><strong>${Number(material.stock||0)} ${escapeHtml(material.unit||"Stück")}</strong></div><div><small>Stückkosten</small><strong>${money(material.unitCost)}</strong></div><div><small>Buchungen</small><strong>${movements.length}</strong></div><div><small>Zugänge im Verlauf</small><strong>+${incoming}</strong></div><div><small>Verbrauch im Verlauf</small><strong>−${outgoing}</strong></div></div><div class="table-wrap material-history-table"><table class="movement-table"><thead><tr><th>Zeitpunkt</th><th>Bewegung</th><th>Menge</th><th>Wofür</th><th>Information</th></tr></thead><tbody>${movements.length?movements.map(row=>`<tr class="${movementRowClass(row)}"><td>${row.timestamp?new Date(row.timestamp).toLocaleString("de-DE"):fmtDate(row.date)}</td><td>${escapeHtml(row.type||"Bewegung")}</td><td class="${Number(row.quantity||0)>=0?"money-positive":"money-negative"}"><strong>${Number(row.quantity||0)>0?"+":""}${Number(row.quantity||0)}</strong></td><td>${row.saleId&&state.sales.some(sale=>sale.id===row.saleId)?`<button class="link-button" type="button" data-show-sale="${escapeHtml(row.saleId)}">${escapeHtml(row.reference||"Bestellung öffnen")}</button>`:escapeHtml(row.reference||"–")}</td><td>${escapeHtml(row.note||"")}</td></tr>`).join(""):`<tr><td colspan="5" class="empty">Noch keine Bewegungen protokolliert.</td></tr>`}</tbody></table></div>`;
  showDialogSafely(dialog);
}
function renderExpenses(){
  const table=document.getElementById("expenseTable"); if(!table) return;
  const q=(document.getElementById("expenseSearch")?.value||"").toLowerCase(); const f=document.getElementById("expenseCategoryFilter")?.value||"";const typeFilter=document.getElementById("expenseTypeFilter")?.value||"";
  const expenseType=e=>e.category==="Versandmaterial"?"inventory":e.costType==="direct"||e.saleId?"direct":"overhead";
  const rows=(state.expenses||[]).filter(e=>(!q||JSON.stringify(e).toLowerCase().includes(q))&&(!f||e.category===f)&&(!typeFilter||expenseType(e)===typeFilter)).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const now=new Date(); const monthRows=state.expenses.filter(e=>isSameMonth(e.date,now.getFullYear(),now.getMonth())&&e.status!=="Storniert");
  const total=monthRows.reduce((a,e)=>a+Number(e.amount||0),0); const material=monthRows.filter(e=>expenseType(e)==="inventory").reduce((a,e)=>a+Number(e.amount||0),0);const direct=monthRows.filter(e=>expenseType(e)==="direct").reduce((a,e)=>a+Number(e.amount||0),0);const overhead=monthRows.filter(e=>expenseType(e)==="overhead").reduce((a,e)=>a+Number(e.amount||0),0);
  document.getElementById("expenseMonthTotal").textContent=money(total); document.getElementById("expenseMaterialMonth").textContent=money(material); document.getElementById("expenseOtherMonth").textContent=money(overhead);document.getElementById("expenseDirectMonth").textContent=money(direct);
  const typeLabel={inventory:"Materialeinkauf",direct:"Direkte Verkaufskosten",overhead:"Allgemeine Betriebsausgabe"};
  table.innerHTML=rows.length?rows.map(e=>{const type=expenseType(e),cancelled=e.status==="Storniert";return `<tr class="expense-row-${cancelled?"cancelled":type}"><td>${fmtDate(e.date)}</td><td>${escapeHtml(e.category||"Sonstiges")}</td><td>${escapeHtml(typeLabel[type])}</td><td>${escapeHtml(e.description||"")}</td><td class="${cancelled?"muted":"money-negative"}">${money(e.amount)}</td><td>${e.saleId?`Verkauf ${escapeHtml(state.sales.find(s=>s.id===e.saleId)?.orderNo||e.saleId)}<br>`:""}${escapeHtml(e.note||"")}</td><td>${statusBadge(cancelled?"Storniert":"Gebucht")}</td><td><div class="row-actions">${cancelled?"":`<button class="icon-button" data-edit-expense="${e.id}">Bearbeiten</button>`}<button class="icon-button" data-toggle-expense="${e.id}">${cancelled?"Storno aufheben":"Stornieren"}</button></div></td></tr>`}).join(""):'<tr><td colspan="8" class="empty">Keine Ausgaben gefunden</td></tr>';
}
function addMaterial(initial={}){openModal(initial.id?"Material bearbeiten":"Material anlegen",[
  {name:"name",label:"Materialname",required:true},{name:"unit",label:"Einheit",value:"Stück"},{name:"stock",label:"Aktueller Bestand",type:"number"},{name:"unitCost",label:"Stückkosten (€)",type:"number",step:"0.001"},{name:"minStock",label:"Mindestbestand",type:"number"},{name:"leadTimeDays",label:"Übliche Lieferzeit (Tage)",type:"number",value:7},{name:"supplier",label:"Bevorzugter Lieferant"},{name:"note",label:"Notiz",full:true}
],initial,data=>{const obj={...data,stock:Number(data.stock||0),unitCost:Number(data.unitCost||0),minStock:Number(data.minStock||0),leadTimeDays:Math.max(0,Number(data.leadTimeDays||0))};if(initial.id){const material=state.materials.find(x=>x.id===initial.id);const difference=obj.stock-Number(material?.stock||0);Object.assign(material,obj);if(difference)addMovement({type:"Bestandskorrektur",quantity:difference,materialId:initial.id,reference:"Manuelle Materialkorrektur",note:data.note||data.name});}else{const material={...obj,id:uid()};state.materials.push(material);if(material.stock)addMovement({type:"Anfangsbestand",quantity:material.stock,materialId:material.id,reference:"Material angelegt",note:material.name});}});}
function buyMaterial(materialId=""){
  if(!state.materials.length){alert("Bitte zuerst ein Material anlegen.");return;}
  const initial={materialId:materialId||state.materials[0].id,date:todayISO()};
  openModal("Material einkaufen",[{name:"materialId",label:"Material",type:"select",options:state.materials.map(m=>({value:m.id,label:`${m.name} (${Number(m.stock||0)} ${m.unit||"Stück"} vorhanden)`}))},{name:"date",label:"Datum",type:"date",value:todayISO()},{name:"quantity",label:"Menge",type:"number",required:true},{name:"totalCost",label:"Gesamtpreis (€)",type:"number",step:"0.01",required:true},{name:"note",label:"Notiz",full:true}],initial,data=>{
    const m=state.materials.find(x=>x.id===data.materialId); if(!m)return false; const qty=Number(data.quantity||0),cost=Number(data.totalCost||0); if(qty<=0||cost<0){alert("Menge und Preis prüfen.");return false;}
    const oldStock=Number(m.stock||0),oldValue=oldStock*Number(m.unitCost||0); m.stock=oldStock+qty; m.unitCost=m.stock?(oldValue+cost)/m.stock:0;
    const expense={id:uid(),date:data.date||todayISO(),category:"Versandmaterial",costType:"inventory",sourceType:"automatic",status:"Gebucht",description:`${qty} ${m.unit||"Stück"} ${m.name}`,amount:cost,note:data.note||"",materialId:m.id};
    state.expenses.push(expense);
    addMovement({type:"Materialeinkauf",quantity:qty,materialId:m.id,expenseId:expense.id,reference:`Einkauf ${fmtDate(data.date||todayISO())}`,note:`${m.name} · ${money(cost)}${data.note?` · ${data.note}`:""}`});
  });
}
function addExpense(initial={}){
  const derivedType=initial.category==="Versandmaterial"?"inventory":initial.costType==="direct"||initial.saleId?"direct":"overhead";
  openModal(initial.id?"Ausgabe bearbeiten":"Ausgabe erfassen",[
    {name:"date",label:"Datum",type:"date",value:todayISO()},
    {name:"category",label:"Kategorie",type:"select",options:["Versandmaterial","Porto","Verkaufsgebühr","Lagerausstattung","Software","Bürobedarf","Werbung","Bank / Zahlungsdienst","Steuerberatung","Reisekosten","Sonstiges"]},
    {name:"costType",label:"Kostenart",type:"select",options:[{value:"overhead",label:"Allgemeine Betriebsausgabe – kein Einfluss auf Karten-EK/VK"},{value:"direct",label:"Direkt einem Verkauf zugeordnet"},{value:"inventory",label:"Materialeinkauf / Lagerwert"}]},
    {name:"saleId",label:"Zugehöriger Verkauf",type:"select",options:[{value:"",label:"Keine Verkaufszuordnung"},...state.sales.map(sale=>({value:sale.id,label:`${sale.orderNo||"Ohne Nummer"} · ${sale.customer||"Unbekannter Kunde"}`}))]},
    {name:"description",label:"Beschreibung",required:true},{name:"amount",label:"Betrag (€)",type:"number",step:"0.01",required:true},{name:"note",label:"Notiz / Belegnummer",full:true}
  ],{...initial,costType:derivedType},data=>{
    if(data.costType==="direct"&&!data.saleId){alert("Direkte Kosten bitte einem Verkauf zuordnen. Ein Regal, Software oder allgemeines Material gehören zu den allgemeinen Betriebsausgaben.");return false;}
    if(data.category==="Versandmaterial")data.costType="inventory";
    if(data.costType!=="direct")data.saleId="";
    const obj={...data,amount:Math.max(0,Number(data.amount||0)),sourceType:initial.sourceType||"manual",status:initial.status||"Gebucht"};
    if(initial.id)Object.assign(state.expenses.find(x=>x.id===initial.id),obj);else state.expenses.push({...obj,id:uid()});
    return true;
  });
}
function addTemplate(initial={}){
  const compact=(initial.items||[]).map(i=>`${i.materialId}:${i.quantity}`).join(",");
  openModal(initial.id?"Versandvorlage bearbeiten":"Versandvorlage anlegen",[{name:"name",label:"Vorlagenname",required:true},{name:"shippingType",label:"Versandart"},{name:"postage",label:"Porto (€)",type:"number",step:"0.01"},{name:"itemsText",label:"Materialien – Format Material-ID:Menge, ...",value:compact,full:true}],{...initial,itemsText:compact},data=>{const items=String(data.itemsText||"").split(",").map(x=>x.trim()).filter(Boolean).map(x=>{const [materialId,q]=x.split(":");return{materialId,quantity:Number(q||0)}}).filter(x=>state.materials.some(m=>m.id===x.materialId)&&x.quantity>0);const obj={name:data.name,shippingType:data.shippingType||"",postage:Number(data.postage||0),items};if(initial.id)Object.assign(state.materialTemplates.find(x=>x.id===initial.id),obj);else state.materialTemplates.push({...obj,id:uid()});});
}
function applyTemplateToEditor(templateId){
  const t=state.materialTemplates.find(x=>x.id===templateId); if(!t)return;
  document.getElementById("saleShippingType").value=t.shippingType||"";
  document.getElementById("salePostage").value=Number(t.postage||0);
  const options=state.materials.map(m=>`<option value="${m.id}">${escapeHtml(m.name)} (${Number(m.stock||0)} verfügbar)</option>`).join("");
  document.getElementById("saleMaterialUsage").innerHTML=(t.items||[]).map((i,idx)=>{const m=state.materials.find(x=>x.id===i.materialId);return materialUsageRow({materialId:i.materialId,quantity:i.quantity,unitCost:Number(m?.unitCost||0)},idx,options)}).join("");
  updateSaleMaterialPreview();
}
function planMaterialStockChanges(oldUsage,newUsage){
  return window.TcgBusinessAutomation.planMaterialUsageChanges(state.materials,oldUsage,newUsage);
}
function applyMaterialStockPlan(plan){
  return (plan.changes||[]).map(change=>{
    const material=state.materials.find(row=>String(row.id)===String(change.materialId));
    if(!material)return null;
    material.stock=change.stockAfter;
    return {material,quantity:change.quantity};
  }).filter(Boolean);
}
function saleMaterialEditor(sale){
  const options=state.materials.map(m=>`<option value="${m.id}">${escapeHtml(m.name)} (${Number(m.stock||0)} verfügbar)</option>`).join("");
  const templateOptions='<option value="">Vorlage auswählen…</option>'+state.materialTemplates.map(t=>`<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("");
  const stage=sale.workflowStage||"Offen";
  const orderItems=(sale.items||[]).length?sale.items:[{name:sale.cardNames||`${sale.quantity||0} Karten`,quantity:sale.quantity||1}];
  if(stage==="Offen") return `<div class="workflow-panel"><h3>Bestellübersicht</h3><p>Die Bestellung ist offen. Mit „Weiter“ wird sie als bezahlt markiert, die Ware reserviert und direkt die Kommissionierung geöffnet.</p><div class="order-detail-actions"><button class="primary" id="saleWorkflowNext">Weiter zur Kommissionierung</button></div></div>`;
  if(stage==="Kommissioniert") {
    const picked=new Set(sale.pickedItems||[]),pickedCount=orderItems.filter((item,index)=>picked.has(index)).length;
    return `<div class="workflow-panel"><div class="workflow-title-row"><div><h3>Kommissionieren</h3><p class="muted">Alle Positionen aus dem Lager holen und abhaken. Mit „Alle auswählen“ bestätigst du die komplette Liste auf einmal.</p></div><button class="secondary" type="button" id="salePickAllBtn">Alle auswählen</button></div><details class="pick-list-details" id="salePickListDetails" open><summary>Kartenliste · <span id="salePickProgress">${pickedCount}/${orderItems.length} ausgewählt</span></summary><div class="pick-list">${orderItems.map((item,idx)=>`<label class="pick-row"><input type="checkbox" data-pick-item="${idx}" ${picked.has(idx)?"checked":""}><span><strong>${Number(item.quantity||1)}× ${escapeHtml(item.name||"Unbekannte Karte")}</strong><small>${escapeHtml([item.set,item.rarity,item.language,item.condition].filter(Boolean).join(" · "))}</small></span></label>`).join("")}</div></details><div class="order-detail-actions"><button class="primary" id="saleWorkflowNext">Weiter zum Verpacken</button></div></div>`;
  }
  if(stage==="Verpackt") {const packed=sale.status==="Verpackt";return `<div class="material-editor"><h3>${packed?"Verpackt":"Verpacken"}</h3><p class="muted">${packed?"Die Verpackung ist gespeichert. Änderungen können noch erfasst werden; der Versand erfolgt erst über die eigene Schaltfläche.":"Versandart, tatsächliches Porto und verwendetes Material erfassen. Danach zunächst als verpackt speichern."}</p>
    <div class="material-editor-grid"><label>Versandart<select id="saleShippingType"><option value="">Bitte auswählen…</option>${["Standardbrief","Kompaktbrief","Großbrief","Maxibrief","Warensendung"].map(x=>`<option ${sale.shippingType===x?"selected":""}>${x}</option>`).join("")}</select></label><label>Tatsächliches Porto (€)<input id="salePostage" type="number" min="0" step="0.01" value="${Number(sale.postage||0)}"></label><label>Vorlage<select id="saleTemplateSelect">${templateOptions}</select></label><button class="secondary" type="button" id="applySaleTemplateBtn">Vorlage laden</button></div>
    <div id="saleMaterialUsage" class="material-usage-list">${(sale.materialUsage||[]).map((u,idx)=>materialUsageRow(u,idx,options)).join("")}</div>
    <div class="template-save-row"><input id="saleTemplateName" placeholder="Name für neue Vorlage"><button class="secondary" type="button" id="saveSaleAsTemplateBtn">Als Vorlage speichern</button></div>
    <div class="order-detail-actions"><button class="secondary" type="button" id="addSaleMaterialBtn">+ Material</button><button class="secondary" type="button" id="createDeliveryNoteBtn">Lieferschein</button><button class="secondary" type="button" id="createShippingLabelBtn">Versandlabel</button><button class="${packed?"secondary":"primary"}" type="button" id="saveSaleMaterialsBtn">${packed?"Änderungen speichern":"Verpackung speichern"}</button>${packed?'<button class="primary" type="button" id="saveAndShipSaleBtn">Jetzt als versendet markieren</button>':""}</div>
    <div class="financial-summary"><div><small>Materialkosten</small><strong id="saleMaterialCostPreview">${money(saleMaterialCost(sale))}</strong></div><div><small>Porto</small><strong id="salePostagePreview">${money(sale.postage)}</strong></div><div><small>Gewinn Bestellung</small><strong id="saleProfitPreview">${money(calculateSaleProfit(sale).profit)}</strong></div></div></div>`;
  }
  if(stage==="Versendet") return `<div class="workflow-panel"><h3>Versendet</h3><p>Die Bestellung wurde versendet. Die Einnahme ist gebucht; bis zur Empfangsbestätigung bleibt sie als noch nicht abgeschlossen gekennzeichnet.</p><div class="order-detail-actions"><button class="secondary" id="createDeliveryNoteBtn">Lieferschein</button><button class="primary" id="saleCompleteBtn">Ankunft bestätigt – abschließen</button></div></div>`;
  return `<div class="workflow-panel"><h3>Abgeschlossen</h3><p>Der Kunde hat den Erhalt bestätigt.</p><div class="order-detail-actions"><button class="secondary" id="createDeliveryNoteBtn">Lieferschein</button></div></div>`;
}
function materialUsageRow(u={},idx=0,options=""){return `<div class="material-usage-row" data-usage-row><select data-material-id><option value="">Material wählen</option>${options.replace(`value="${u.materialId}"`,`value="${u.materialId}" selected`)}</select><input data-material-qty type="number" min="0" step="1" value="${Number(u.quantity||1)}"><span data-usage-cost>${money(Number(u.quantity||1)*Number(u.unitCost||0))}</span><button type="button" class="icon-button" data-remove-usage>×</button></div>`;}
function updateSalePickUi(collapseWhenComplete=false){
  const boxes=[...document.querySelectorAll("[data-pick-item]")];
  const checked=boxes.filter(box=>box.checked).length;
  const progress=document.getElementById("salePickProgress");if(progress)progress.textContent=`${checked}/${boxes.length} ausgewählt`;
  const button=document.getElementById("salePickAllBtn");if(button)button.textContent=boxes.length&&checked===boxes.length?"Auswahl zurücksetzen":"Alle auswählen";
  if(collapseWhenComplete&&boxes.length&&checked===boxes.length){const details=document.getElementById("salePickListDetails");if(details)details.open=false;}
}
function readSaleMaterialRows(){
  const grouped=new Map();
  [...document.querySelectorAll('#saleMaterialUsage [data-usage-row]')].forEach(row=>{
    const materialId=row.querySelector('[data-material-id]').value; const quantity=Number(row.querySelector('[data-material-qty]').value||0);
    if(materialId&&quantity>0)grouped.set(materialId,(grouped.get(materialId)||0)+quantity);
  });
  return [...grouped].map(([materialId,quantity])=>{const m=state.materials.find(x=>x.id===materialId);return{materialId,name:m?.name||"Material",quantity,unitCost:Number(m?.unitCost||0)}});
}
function updateSaleMaterialPreview(){
  const dlg=document.getElementById("orderDetailDialog"); const sale=state.sales.find(s=>s.id===dlg.dataset.saleId); if(!sale)return;
  document.querySelectorAll('#saleMaterialUsage [data-usage-row]').forEach(row=>{const id=row.querySelector('[data-material-id]').value;const qty=Number(row.querySelector('[data-material-qty]').value||0);const m=state.materials.find(x=>x.id===id);const out=row.querySelector('[data-usage-cost]');if(out)out.textContent=money(qty*Number(m?.unitCost||0));});
  const usage=readSaleMaterialRows(); const draft={...sale,materialUsage:usage,postage:Number(document.getElementById("salePostage")?.value||0)};
  const m=document.getElementById("saleMaterialCostPreview"),p=document.getElementById("salePostagePreview"),g=document.getElementById("saleProfitPreview");
  if(m)m.textContent=money(saleMaterialCost(draft)); if(p)p.textContent=money(draft.postage); if(g)g.textContent=money(calculateSaleProfit(draft).profit);
}
function saveSalePacking(sale,markShipped=false){
  const old=sale.materialUsage||[]; const usage=readSaleMaterialRows();
  const shippingType=document.getElementById("saleShippingType")?.value||"";
  if(markShipped&&!shippingType){alert("Bitte zuerst eine Versandart auswählen.");return false;}
  const stockPlan=planMaterialStockChanges(old,usage);
  if(!stockPlan.valid){const shortage=stockPlan.shortages[0];alert(`${shortage.name}: Es fehlen ${shortage.missing} ${shortage.unit}.`);return false;}
  const stockChanges=applyMaterialStockPlan(stockPlan); sale.materialUsage=usage; sale.shippingType=shippingType; sale.postage=Math.max(0,Number(document.getElementById("salePostage")?.value||0));
  stockChanges.forEach(change=>addMovement({type:change.quantity<0?"Materialverbrauch":"Materialkorrektur",quantity:change.quantity,materialId:change.material.id,saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:change.quantity<0?`${change.material.name} für Verpackung verwendet`:`${change.material.name} aus Verpackung entfernt`}));
  if(markShipped){
    const previousStatus=sale.status;sale.status="Versendet"; sale.workflowStage="Versendet"; sale.shippedDate=todayISO();recordWorkflowChange(sale,"Vorgangsstatus",previousStatus,"Versendet",sale.trackingNumber||""); syncSaleInventoryStatus(sale);
    addMovement({type:"Versand",quantity:-Number(sale.quantity||sale.itemIds?.length||0),saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:`${sale.shippingType}; Porto ${money(sale.postage)}`});
    addMovement({type:"Einnahme",quantity:Number(sale.revenue||0),saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:"Nach Versand als Einnahme gebucht"});
  }else{
    const firstPacking=sale.status!=="Verpackt";
    const previousStatus=sale.status;sale.status="Verpackt";sale.workflowStage="Verpackt";sale.packedDate=sale.packedDate||todayISO();recordWorkflowChange(sale,"Vorgangsstatus",previousStatus,"Verpackt");
    if(firstPacking)addMovement({type:"Status",quantity:0,saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:"Verpackung gespeichert · bereit zum Versand"});
  }
  saveState(); renderAll();
  if(markShipped)document.getElementById("orderDetailDialog").close();else openOrderDetails("sale",sale.id);
  return true;
}
function printSaleDocument(sale,kind){
  const items=(sale.items||[]).map(i=>`<tr><td>${Number(i.quantity||1)}×</td><td>${escapeHtml(i.name||"Karte")}</td><td>${escapeHtml(i.set||"")}</td><td>${money(i.unitPrice||i.price||0)}</td></tr>`).join("");
  const title=kind==="label"?"Versandlabel":"Lieferschein";
  const body=`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial;padding:32px}h1{margin-bottom:24px}.label{border:2px solid #111;padding:30px;max-width:600px;font-size:20px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #ccc;text-align:left}</style></head><body><h1>${title}</h1>${kind==="label"?`<div class="label"><strong>${escapeHtml(sale.customer||"Empfänger")}</strong><p>${escapeHtml(sale.address||"Adresse bitte später ergänzen")}</p><small>${escapeHtml(sale.shippingType||"")}</small></div>`:`<p>Bestellung #${escapeHtml(sale.orderNo||"-")} · ${fmtDate(sale.date)}</p><p>Kunde: ${escapeHtml(sale.customer||"-")}</p><table><thead><tr><th>Menge</th><th>Karte</th><th>Set</th><th>Preis</th></tr></thead><tbody>${items||`<tr><td colspan="4">${Number(sale.quantity||0)} Karten</td></tr>`}</tbody></table>`}</body></html>`;
  const w=window.open("","_blank"); if(!w){alert("Pop-up wurde blockiert.");return;} w.document.write(body);w.document.close();w.focus();setTimeout(()=>w.print(),200);
}


function analysisIdentity(item={}) {
  const productId=cleanProductId(item.productId);
  if(productId) return `pid:${productId}`;
  return `txt:${normalizeCardName(item.name||"")}|${String(item.set||item.setName||"").toUpperCase()}|${String(item.version||item.rarity||"").toLowerCase()}`;
}
function analysisMatches(a={},b={}) {
  const aId=cleanProductId(a.productId), bId=cleanProductId(b.productId);
  if(aId&&bId) return aId===bId;
  const an=normalizeCardName(a.name||""), bn=normalizeCardName(b.name||"");
  if(!an||!bn||an!==bn) return false;
  const aset=String(a.set||a.setName||"").toUpperCase(), bset=String(b.set||b.setName||"").toUpperCase();
  return !aset||!bset||aset===bset;
}
function collectAnalysisCards() {
  const cards=new Map();
  const add=item=>{
    if(!item || (!item.name&&!item.productId)) return;
    const key=analysisIdentity(item);
    const current=cards.get(key)||{};
    cards.set(key,{...current,...item,productId:cleanProductId(item.productId)||current.productId||"",name:item.name||current.name||"Unbekannte Karte",set:item.set||item.setName||current.set||"",rarity:item.rarity||item.version||current.rarity||""});
  };
  // Gesamtkatalog zuerst laden; eigene Daten überschreiben und ergänzen anschließend.
  Object.entries(state.productCatalog||{}).forEach(([productId,item])=>add({...item,productId}));
  state.watchlist.filter(w=>!w.archived).forEach(add);
  state.inventory.forEach(add);
  state.purchases.forEach(p=>(p.pendingItems||[]).forEach(add));
  state.sales.forEach(s=>(s.items||[]).forEach(add));
  return [...cards.values()];
}
function cardPurchaseRows(card) {
  const rows=[];
  state.purchases.forEach(p=>(p.pendingItems||[]).forEach(item=>{
    if(!analysisMatches(card,item)) return;
    rows.push({date:p.date||"",quantity:Number(item.quantity||1),unitPrice:Number(item.unitPrice||item.price||0),reference:p.orderNo||"-",seller:p.seller||"-"});
  }));
  // Older/manual inventory records may not have a purchase position. Include their cost once.
  state.inventory.filter(i=>analysisMatches(card,i)&&Number(i.cost||0)>0).forEach(i=>{
    if(rows.some(r=>i.purchaseId && state.purchases.find(p=>p.id===i.purchaseId&&p.orderNo===r.reference))) return;
    rows.push({date:i.purchaseDate||"",quantity:1,unitPrice:Number(i.cost||0),reference:i.lotId||"Bestand",seller:i.source||"-"});
  });
  return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
function cardSaleRows(card) {
  const rows=[];
  state.sales.forEach(s=>{
    const explicit=(s.items||[]).filter(item=>analysisMatches(card,item));
    if(explicit.length){
      explicit.forEach(item=>rows.push({date:s.date||"",quantity:Number(item.quantity||1),unitPrice:Number(item.unitPrice||item.price||0),reference:s.orderNo||"-",customer:s.customer||"-"}));
      return;
    }
    const ids=new Set(s.itemIds||[]);
    const count=state.inventory.filter(i=>ids.has(i.id)&&analysisMatches(card,i)).length;
    if(count){
      const totalQty=Math.max(1,Number(s.quantity||ids.size||count));
      rows.push({date:s.date||"",quantity:count,unitPrice:Number(s.revenue||0)/totalQty,reference:s.orderNo||"-",customer:s.customer||"-"});
    }
  });
  return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
function weightedAverage(rows=[]) {
  const qty=rows.reduce((sum,r)=>sum+Number(r.quantity||0),0);
  return qty?rows.reduce((sum,r)=>sum+Number(r.quantity||0)*Number(r.unitPrice||0),0)/qty:0;
}
function cardAnalysis(card) {
  const watch=state.watchlist.find(w=>!w.archived&&analysisMatches(card,w));
  const catalog=state.productCatalog?.[cleanProductId(card.productId)]||{};
  const purchases=cardPurchaseRows(card), sales=cardSaleRows(card);
  const active=state.inventory.filter(i=>analysisMatches(card,i)&&i.status!=="Verkauft");
  const reserved=active.filter(i=>i.status==="Reserviert"||i.reserved||i.reservedFor||i.saleId).length;
  const total=active.length, available=Math.max(0,total-reserved);
  const buyValues=purchases.map(r=>r.unitPrice).filter(v=>v>0), sellValues=sales.map(r=>r.unitPrice).filter(v=>v>0);
  const bestBuy=buyValues.length?Math.min(...buyValues):0, avgBuy=weightedAverage(purchases);
  const bestSell=sellValues.length?Math.max(...sellValues):0, avgSell=weightedAverage(sales);
  const marketLow=Number(watch?.currentBuy||watch?.low||catalog.low||catalog.LOW||0);
  const marketTrend=Number(watch?.trend||catalog.trend||catalog.TREND||0);
  const marketAvg1=Number(watch?.avg1||catalog.avg1||catalog.AVG1||0);
  const marketAvg7=Number(watch?.avg7||catalog.avg7||catalog.AVG7||0);
  const marketAvg30=Number(watch?.avg30||catalog.avg30||catalog.AVG30||0);
  const pricingSettings=forwardPricingSettings();
  const marketTargets=TcgBusinessAutomation.calculateAutomaticPriceTargets({low:marketLow,trend:marketTrend,avg1:marketAvg1,avg7:marketAvg7,avg30:marketAvg30},pricingSettings);
  const marketPrice=marketLow||marketAvg1||marketAvg7||marketAvg30||marketTrend;
  const expectedSell=marketTargets.recommendedSell;
  const safety=Math.max(0,Number(pricingSettings.safetyPercent||0))/100;
  const safeSell=expectedSell*(1-safety);
  const netBeforeBuy=safeSell*(1-Number(pricingSettings.feePercent||0)/100)-Number(pricingSettings.packaging||0);
  const maxByRoi=Math.max(0,netBeforeBuy/(1+Number(pricingSettings.minRoi||25)/100));
  const calculatedMaxBuy=expectedSell?maxByRoi:0;
  const maxBuy=Number(watch?.maxBuy||0)||calculatedMaxBuy;
  const estimatedProfit=maxBuy?netBeforeBuy-maxBuy:0;
  const estimatedMargin=maxBuy?estimatedProfit/maxBuy*100:0;
  let recommendation="KEINE PREISDATEN";
  if(expectedSell){
    if(marketPrice&&marketPrice<=maxBuy*.9) recommendation="KAUFEN";
    else if(marketPrice&&marketPrice<=maxBuy*1.05) recommendation="BEOBACHTEN";
    else recommendation="NICHT KAUFEN";
  }
  const soldQty=sales.reduce((a,r)=>a+r.quantity,0), boughtQty=purchases.reduce((a,r)=>a+r.quantity,0);
  const realizedRevenue=sales.reduce((a,r)=>a+r.quantity*r.unitPrice,0);
  return {watch,catalog,purchases,sales,total,reserved,available,bestBuy,avgBuy,bestSell,avgSell,marketPrice,marketLow,marketTrend,marketAvg1,marketAvg7,marketAvg30,marketReferenceSource:marketTargets.marketReferenceSource,expectedSell,maxBuy,calculatedMaxBuy,estimatedProfit,estimatedMargin,recommendation,soldQty,boughtQty,profit:realizedRevenue-soldQty*avgBuy};
}
function renderPurchaseAnalysis() {
  const el=document.getElementById("purchaseAnalysis"); if(!el)return;
  const q=String(document.getElementById("watchSearch")?.value||"").trim();
  if(q.length<2){el.innerHTML='<div class="purchase-analysis-empty"><strong>Gesamtkatalog durchsuchen</strong><br>Mindestens zwei Zeichen eingeben. Eigene Daten und berechnete Einkaufswerte werden zusammen angezeigt.</div>';return;}
  const cards=collectAnalysisCards().filter(c=>cardRecordMatchesSearch(c,q)).slice(0,40);
  if(!cards.length){el.innerHTML='<div class="purchase-analysis-empty">Keine passende Karte im Gesamtkatalog gefunden. Für weitere Karten zuerst einen aktuellen Produktkatalog importieren.</div>';return;}
  el.innerHTML=`<div class="analysis-grid">${cards.map(card=>{
    const a=cardAnalysis(card), cls=a.recommendation==="KAUFEN"?"money-positive":a.recommendation==="NICHT KAUFEN"?"money-negative":"";
    const names=cardDisplayNames(card);
    const purchaseRows=a.purchases.slice(0,15).map(r=>`<tr><td>${fmtDate(r.date)||"-"}</td><td>${r.quantity}×</td><td>${money(r.unitPrice)}</td><td>${escapeHtml(r.seller)}</td><td>${escapeHtml(r.reference)}</td></tr>`).join("");
    const saleRows=a.sales.slice(0,15).map(r=>`<tr><td>${fmtDate(r.date)||"-"}</td><td>${r.quantity}×</td><td>${money(r.unitPrice)}</td><td>${escapeHtml(r.customer)}</td><td>${escapeHtml(r.reference)}</td></tr>`).join("");
    return `<article class="analysis-card"><div class="analysis-card-head"><div><h3><a class="card-link" href="${escapeHtml(cardmarketUrl(card))}" target="_blank" rel="noopener noreferrer">${escapeHtml(names.primary)} <span class="external-link">↗</span></a></h3>${names.secondary?`<small>Englisch: ${escapeHtml(names.secondary)}</small><br>`:""}<small>${escapeHtml(card.set||"Set unbekannt")} · ${escapeHtml(card.rarity||"Version unbekannt")} · CM ${escapeHtml(card.productId||"-")}</small></div>${a.watch?statusBadge(calculateWatch(a.watch).status):`<button class="secondary" data-analysis-add-watch="${escapeHtml(card.productId||"")}">+ Watchlist</button>`}</div>
      <div class="analysis-metrics">
        <div class="analysis-metric"><span>Price-Guide Low</span><strong>${a.marketPrice?money(a.marketPrice):"-"}</strong></div><div class="analysis-metric"><span>Gespeicherte Preisreferenz</span><strong>${a.expectedSell?money(a.expectedSell):"-"}</strong><small>${escapeHtml(a.marketReferenceSource||"")}</small></div><div class="analysis-metric"><span>Sichere Kaufgrenze</span><strong>${a.calculatedMaxBuy?money(a.calculatedMaxBuy):"-"}</strong></div>
        <div class="analysis-metric"><span>Eigene Kaufgrenze</span><strong>${a.watch?.maxBuy?money(a.watch.maxBuy):"-"}</strong></div><div class="analysis-metric"><span>Bester eigener EK</span><strong>${a.bestBuy?money(a.bestBuy):"Keine Daten"}</strong></div><div class="analysis-metric"><span>Ø eigener EK</span><strong>${a.avgBuy?money(a.avgBuy):"Keine Daten"}</strong></div>
        <div class="analysis-metric"><span>Bester eigener VK</span><strong>${a.bestSell?money(a.bestSell):"Keine Daten"}</strong></div><div class="analysis-metric"><span>Ø eigener VK</span><strong>${a.avgSell?money(a.avgSell):"Keine Daten"}</strong></div><div class="analysis-metric"><span>Geschätzter Gewinn</span><strong class="${a.estimatedProfit>=0?'money-positive':'money-negative'}">${a.expectedSell?money(a.estimatedProfit):"-"}</strong></div>
        <div class="analysis-metric"><span>Geschätzte Marge</span><strong>${a.expectedSell?pct(a.estimatedMargin):"-"}</strong></div><div class="analysis-metric"><span>Bestand / reserviert</span><strong>${a.total} / ${a.reserved}</strong></div><div class="analysis-metric"><span>Verfügbar</span><strong>${a.available}</strong></div>
      </div><div class="analysis-recommendation"><span class="muted">Einkaufsempfehlung</span><br><strong class="${cls}">${escapeHtml(a.recommendation)}</strong><div class="analysis-note">Berechnung mit ${Number(state.settings.feePercent||0).toFixed(1).replace('.',',')} % Gebühr, ${money(packagingAllocation().perCard)} anteiliger Verpackung, ${Number(state.settings.minRoi||25)} % Mindest-ROI und ${Number(state.settings.safetyPercent||0)} % Sicherheitsabschlag.</div></div>
      <div class="analysis-history"><details><summary>Eigene Historie (${a.purchases.length} Einkäufe / ${a.sales.length} Verkäufe)</summary><h4>Einkäufe</h4><div class="table-wrap"><table><thead><tr><th>Datum</th><th>Menge</th><th>EK</th><th>Händler</th><th>Bestellung</th></tr></thead><tbody>${purchaseRows||'<tr><td colspan="5" class="empty">Keine Einkäufe gespeichert</td></tr>'}</tbody></table></div><h4>Verkäufe</h4><div class="table-wrap"><table><thead><tr><th>Datum</th><th>Menge</th><th>VK</th><th>Kunde</th><th>Bestellung</th></tr></thead><tbody>${saleRows||'<tr><td colspan="5" class="empty">Keine Verkäufe gespeichert</td></tr>'}</tbody></table></div></details></div></article>`;
  }).join("")}</div>`;
}

function canonicalCardmarketProductPath(value=""){
  try{
    const url=new URL(String(value),"https://www.cardmarket.com");
    return decodeURIComponent(url.pathname).replace(/^\/(?:de|en|fr|es|it)(?=\/)/i,"").replace(/\/$/,"").toLowerCase();
  }catch{return "";}
}

let cardmarketProductUrlIndexCache={catalog:null,importedAt:"",size:0,index:new Map()};
function cardmarketProductUrlIndex(){
  const catalog=state.productCatalog||{},entries=Object.entries(catalog),importedAt=String(state.cardmarket?.productImportedAt||"");
  if(cardmarketProductUrlIndexCache.catalog===catalog&&cardmarketProductUrlIndexCache.importedAt===importedAt&&cardmarketProductUrlIndexCache.size===entries.length)return cardmarketProductUrlIndexCache.index;
  const index=new Map();
  entries.forEach(([productId,product])=>{const path=canonicalCardmarketProductPath(product.productUrl);if(path&&!index.has(path))index.set(path,{productId,...product});});
  cardmarketProductUrlIndexCache={catalog,importedAt,size:entries.length,index};
  return index;
}

function productFromCardmarketLink(productUrl=""){
  const direct=cleanProductId((String(productUrl).match(/[?&]idProduct=(\d+)/i)||[])[1]);
  if(direct)return state.productCatalog?.[direct]?{productId:direct,...state.productCatalog[direct]}:resolveProduct(direct,{productUrl});
  const path=canonicalCardmarketProductPath(productUrl);if(!path)return null;
  return cardmarketProductUrlIndex().get(path)||null;
}

function exactLocalWantProduct(raw={}){
  const normalized=window.TcgBusinessAutomation?.normalizeWantlistEntry?.(raw)||raw;
  const linked=productFromCardmarketLink(normalized.productUrl);
  if(linked)return linked;
  if(normalized.productId)return marketRecordForProduct(normalized);
  const wantedNames=[normalized.name,normalized.germanName,normalized.englishName].map(normalizeCardName).filter(Boolean);
  if(!wantedNames.length)return null;
  const wantedSet=normalizeSearchTerm(normalized.set||normalized.setName||"");
  const wantedVersion=normalizeSearchTerm(normalized.version||normalized.rarity||"");
  const candidates=Object.entries(state.productCatalog||{}).filter(([,product])=>{
    const names=[product.name,product.germanName,product.englishName,product.officialName,product.officialBaseName].map(normalizeCardName);
    if(!wantedNames.some(name=>names.includes(name)))return false;
    if(wantedSet&&!normalizeSearchTerm([product.set,product.setName,product.collectorNumber].join(" ")).includes(wantedSet))return false;
    if(wantedVersion&&!normalizeSearchTerm([product.rarity,product.variant].join(" ")).includes(wantedVersion))return false;
    return true;
  });
  return candidates.length===1?{productId:candidates[0][0],...candidates[0][1]}:null;
}

function enrichWantlistRow(raw={},index=0){
  const normalized=window.TcgBusinessAutomation.normalizeWantlistEntry(raw,index);
  const product=exactLocalWantProduct(normalized);
  return product?{...normalized,...product,productId:cleanProductId(product.productId),maxPrice:normalized.maxPrice,quantity:normalized.quantity,language:normalized.language||product.language||"",condition:normalized.condition||product.condition||"",foil:normalized.foil,priority:normalized.priority,note:normalized.note,sourceEntryId:normalized.sourceEntryId,sourceKey:normalized.sourceKey}:{...normalized};
}

function wantlistTextValue(container,selectors=[],patterns=[]){
  for(const selector of selectors){const field=container.querySelector?.(selector);const value=field?.value||field?.getAttribute?.("value")||field?.textContent;if(String(value||"").trim())return String(value).trim();}
  const text=String(container.textContent||"").replace(/\s+/g," ");
  for(const pattern of patterns){const match=text.match(pattern);if(match?.[1])return match[1].trim();}
  return "";
}

function parseWantlistHtml(text,fileName="Wantlist"){
  const doc=new DOMParser().parseFromString(text,"text/html");
  const title=String(doc.querySelector("h1")?.textContent||doc.title||fileName.replace(/\.[^.]+$/,"")).replace(/\s+/g," ").trim();
  const anchors=[...doc.querySelectorAll('a[href*="/YuGiOh/Products/Singles/"],a[href*="idProduct="]')];
  const rows=[];const seen=new Set();
  anchors.forEach((link,index)=>{
    const container=link.closest("tr,article,li,[data-product-id],[data-id-product],.row")||link.parentElement;
    if(!container)return;
    const productUrl=new URL(link.getAttribute("href")||"","https://www.cardmarket.com").href;
    const productId=cleanProductId(container.dataset?.productId||container.dataset?.idProduct||(productUrl.match(/[?&]idProduct=(\d+)/i)||[])[1]);
    const name=String(link.textContent||container.dataset?.name||"").replace(/\s+/g," ").trim();
    if(!name)return;
    const quantity=wantlistTextValue(container,['input[name*="amount" i]','input[name*="quantity" i]','select[name*="amount" i]'],[/(?:Menge|Quantity|Amount|Qty)\s*:?\s*(\d+)/i]);
    const maxPrice=wantlistTextValue(container,['input[name*="price" i]'],[/(?:Max(?:imal)?preis|Max\.?\s*Price|Buy Price|Kaufpreis)\s*:?\s*([\d.,]+)\s*€/i]);
    const language=wantlistTextValue(container,['select[name*="language" i] option:checked','[data-language]'],[/(?:Sprache|Language)\s*:?\s*([A-Za-zÄÖÜäöü/]+)/i]);
    const condition=wantlistTextValue(container,['select[name*="condition" i] option:checked','[data-condition]'],[/(?:Zustand|Condition)\s*:?\s*([A-Z]{2,3})/i]);
    const key=productId||canonicalCardmarketProductPath(productUrl)||`${normalizeCardName(name)}:${index}`;
    if(seen.has(key))return;seen.add(key);
    rows.push({idProduct:productId,ProductName:name,ProductUrl:productUrl,Quantity:quantity||1,MaxPrice_EUR:maxPrice,Language:language,MinCondition:condition});
  });
  return [{name:title||"Cardmarket-Wantlist",externalListId:"",rows}];
}

function groupWantlistRows(rows=[],fallbackName="Cardmarket-Wantlist"){
  const groups=new Map();
  rows.forEach(row=>{
    const name=String(getAny(row,["WantListName","WantsListName","Listenname","Liste"])||fallbackName).trim();
    const externalListId=cleanProductId(getAny(row,["idWantsList","idWantList","WantListId"]));
    const key=externalListId?`id:${externalListId}`:`name:${normalizeSearchTerm(name)}`;
    if(!groups.has(key))groups.set(key,{name,externalListId,rows:[]});groups.get(key).rows.push(row);
  });
  return [...groups.values()];
}

async function parseWantlistFile(file){
  const text=await file.text();
  if(/\.html?$/i.test(file.name)||/<html|\/YuGiOh\/Products\/Singles\//i.test(text))return parseWantlistHtml(text,file.name);
  if(/\.json$/i.test(file.name)||/^\s*[\[{]/.test(text)){
    const payload=JSON.parse(text);const rows=Array.isArray(payload)?payload:payload.entries||payload.cards||payload.items||payload.wantlist||payload.wantlists||[];
    if(Array.isArray(payload.wantlists))return payload.wantlists.map((list,index)=>({name:list.name||`Wantlist ${index+1}`,externalListId:cleanProductId(list.id||list.idWantsList),rows:list.entries||list.cards||[]}));
    return groupWantlistRows(rows,payload.name||file.name.replace(/\.[^.]+$/, ""));
  }
  return groupWantlistRows(parseCsv(text),file.name.replace(/\.[^.]+$/, ""));
}

async function importWantlistFile(file){
  const purpose=document.getElementById("wantlistImportPurpose")?.value||"Geschäftsbestand";
  const groups=await parseWantlistFile(file);if(!groups.length)throw new Error("Keine Wantlist gefunden.");
  let totalRows=0,created=0,updated=0,archived=0,unmatched=0;
  for(const group of groups){
    const enriched=group.rows.map(enrichWantlistRow).filter(row=>row.name||row.productId||row.productUrl);
    if(!enriched.length)continue;
    unmatched+=enriched.filter(row=>!cleanProductId(row.productId)).length;
    const existing=state.wantlists.find(list=>(group.externalListId&&String(list.externalListId||"")===group.externalListId)||(!group.externalListId&&normalizeSearchTerm(list.name)===normalizeSearchTerm(group.name)));
    const merged=window.TcgBusinessAutomation.mergeWantlistSnapshot(existing||{},enriched,{name:group.name||"Cardmarket-Wantlist",externalListId:group.externalListId,purpose,sourceFile:file.name,sourceType:/\.html?$/i.test(file.name)?"Cardmarket HTML":/\.json$/i.test(file.name)?"JSON":"CSV",completeSnapshot:true});
    if(existing)Object.assign(existing,merged.list);else state.wantlists.push(merged.list);
    totalRows+=merged.stats.rows;created+=merged.stats.created;updated+=merged.stats.updated;archived+=merged.stats.archived;
  }
  if(!totalRows)throw new Error("Die Datei enthielt keine erkennbaren Kartenpositionen.");
  addMovement({type:"Wantlist-Import",quantity:0,reference:file.name,note:`${totalRows} Einträge · ${created} neu · ${updated} geändert · ${archived} archiviert · ${unmatched} ohne eindeutige CM-ID`});
  saveState();renderAll();
  return {totalRows,created,updated,archived,unmatched};
}

function wantlistMarketRows(){
  const salesByProduct={},demandByProduct={};
  state.sales.forEach(sale=>(sale.items||[]).forEach(item=>{const id=cleanProductId(item.productId);if(id)salesByProduct[id]=(salesByProduct[id]||0)+Number(item.quantity||1);}));
  demandRadarRows().forEach(row=>{const id=cleanProductId(row.productId);if(id)demandByProduct[id]=Math.max(demandByProduct[id]||0,Number(row.score||0));});
  return (state.wantlists||[]).flatMap(list=>(list.entries||[]).map(entry=>{
    const market=marketRecordForProduct(entry),productId=cleanProductId(market.productId);
    const usePrivate=["Private Sammlung","Konkretes Deck"].includes(list.purpose);
    const stock=(usePrivate?state.privateCollection:state.inventory).filter(item=>!item.archived&&!['Verkauft','Storniert','Abgegeben'].includes(item.status)&&((productId&&cleanProductId(item.productId)===productId)||(!productId&&normalizeCardName(item.name)===normalizeCardName(entry.name)))).length;
    const evaluation=window.TcgBusinessAutomation.evaluateMarketCandidate({...market,maxPrice:entry.maxPrice,quantity:entry.quantity,target:entry.quantity,stock,ownSales:salesByProduct[productId]||0,demandScore:demandByProduct[productId]||0},forwardPricingSettings());
    if(usePrivate&&evaluation.recommendation!=="Druckvariante prüfen"&&evaluation.recommendation!=="Keine Preisdaten"&&evaluation.recommendation!=="Preisstand erneuern"){
      evaluation.recommendation=evaluation.missing?"Privater Bedarf":"Sollbestand erreicht";
      evaluation.reason=evaluation.missing?"Privater Bedarf wird nicht als geschäftliche Renditeentscheidung gewertet.":"Die gewünschte private Menge ist bereits vorhanden.";
    }
    return {list,entry,market,...evaluation,productId};
  }));
}

function renderWantlists(){
  const table=document.getElementById("wantlistTable");if(!table)return;
  const listFilter=document.getElementById("wantlistFilter"),selected=listFilter?.value||"";
  if(listFilter){listFilter.innerHTML=`<option value="">Alle Wantlisten</option>${(state.wantlists||[]).map(list=>`<option value="${escapeHtml(list.id)}" ${selected===list.id?"selected":""}>${escapeHtml(list.name)}</option>`).join("")}`;}
  const purpose=document.getElementById("wantlistPurposeFilter")?.value||"",recommendation=document.getElementById("wantlistRecommendationFilter")?.value||"",showArchived=document.getElementById("wantlistShowArchived")?.checked;
  const all=wantlistMarketRows();
  const rows=all.filter(row=>(!selected||row.list.id===selected)&&(!purpose||row.list.purpose===purpose)&&(!recommendation||row.recommendation===recommendation)&&(showArchived||!row.entry.archived)).sort((a,b)=>Number(a.entry.archived)-Number(b.entry.archived)||b.score-a.score||String(a.entry.name).localeCompare(String(b.entry.name),"de"));
  const active=all.filter(row=>!row.entry.archived),missingQty=active.reduce((sum,row)=>sum+row.missing,0),buyable=active.filter(row=>["Stark kaufen","Kaufgrenze passend"].includes(row.recommendation)).length,unmatched=active.filter(row=>!row.exactVariant).length;
  document.getElementById("wantlistSummary").innerHTML=`<div><small>Wantlisten</small><strong>${state.wantlists.length}</strong></div><div><small>Aktive Kartenwünsche</small><strong>${active.length}</strong></div><div><small>Fehlende Exemplare</small><strong>${missingQty}</strong></div><div><small>Kaufgrenze passend</small><strong class="money-positive">${buyable}</strong></div><div><small>Druckvariante offen</small><strong class="${unmatched?"money-negative":"money-positive"}">${unmatched}</strong></div>`;
  table.innerHTML=rows.length?rows.map(row=>{const names=cardDisplayNames(row.market);const dataClass=row.confidence>=70?"high":row.confidence>=45?"medium":"low";return `<tr class="${row.entry.archived?"wantlist-archived":""}"><td><strong>${escapeHtml(row.list.name)}</strong><br><small>${escapeHtml(row.list.purpose)} · ${escapeHtml(row.list.sourceType||"Import")}<br>${row.list.importedAt?new Date(row.list.importedAt).toLocaleString("de-DE"):"–"}</small></td><td><a class="card-link" href="${escapeHtml(cardmarketUrl(row.market))}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(names.primary||row.entry.name)}</strong> ↗</a>${names.secondary?`<br><small>Englisch: ${escapeHtml(names.secondary)}</small>`:""}<br><small>${escapeHtml([row.market.setName||row.market.set,row.market.collectorNumber,row.market.rarity||row.market.version].filter(Boolean).join(" · ")||"Druckvariante nicht eindeutig")} · CM ${escapeHtml(row.productId||"fehlt")}</small></td><td><strong>${row.stock} / ${row.target}</strong><br><small>${row.missing} fehlen</small></td><td>${escapeHtml(row.entry.language||"alle Sprachen")} · ${escapeHtml(row.entry.condition||"jeder Zustand")}<br><small>${row.entry.foil?"Foil · ":""}Priorität ${escapeHtml(row.entry.priority||"B")}</small></td><td>${row.recommendedSell?`<strong>${money(row.recommendedSell)}</strong><br><small>Price Guide · ${row.priceDate?fmtDate(row.priceDate):"ohne Datum"}</small>`:"–"}</td><td>${row.maxBuy?`<strong>${money(row.maxBuy)}</strong><br><small>inkl. Gebührenrisiko und Verpackung</small>`:"–"}</td><td>${row.maxPrice?`<strong>${money(row.maxPrice)}</strong><br><small>${row.limitProfit>=0?`bei dieser Grenze ${money(row.limitProfit)} · ${pct(row.limitRoi)}`:"nicht rentabel"}</small>`:'<span class="muted">nicht gesetzt</span>'}</td><td><strong>${row.score}/100</strong><br><span class="trade-confidence ${dataClass}">${row.confidence}% Datenvertrauen</span></td><td>${statusBadge(row.recommendation)}<br><small>${escapeHtml(row.reason)}</small></td><td><div class="row-actions">${!row.entry.archived&&!row.exactVariant?`<button class="icon-button" data-assign-want-variant="${escapeHtml(row.list.id)}|${escapeHtml(row.entry.id)}">Druckvariante zuordnen</button>`:""}${!row.entry.archived&&row.exactVariant?`<button class="icon-button" data-want-to-watch="${escapeHtml(row.list.id)}|${escapeHtml(row.entry.id)}">Beobachten</button>`:""}<button class="icon-button" data-toggle-want-archive="${escapeHtml(row.list.id)}|${escapeHtml(row.entry.id)}">${row.entry.archived?"Wiederherstellen":"Archivieren"}</button></div></td></tr>`;}).join(""):'<tr><td colspan="10" class="empty">Keine passenden Wantlist-Einträge vorhanden.</td></tr>';
}

function assignWantlistVariant(listId,entryId){
  const list=state.wantlists.find(row=>row.id===listId),entry=list?.entries?.find(row=>row.id===entryId);if(!list||!entry)return;
  inventoryCardSearchSequence++;inventoryPriceSequence++;
  document.getElementById("modalTitle").textContent="Wantlist-Druckvariante zuordnen";
  const wrap=document.getElementById("modalFields");
  wrap.innerHTML=`<div class="info full-width">Wähle nur die Druckvariante aus, die wirklich zu deinem Wantlist-Eintrag gehört. Menge, Preisgrenze, Sprache und Zustand bleiben erhalten.</div><label class="full-width inventory-card-search-label">Kartenname oder Setnummer suchen<input id="inventoryCardSearch" autocomplete="off" placeholder="Deutscher/englischer Name oder Setnummer …" value="${escapeHtml(entry.name||entry.germanName||entry.englishName||"")}"><div id="inventoryCardResults" class="inventory-card-results"></div></label><div id="inventorySelectedCard" class="inventory-selected-card full-width"><span>Noch keine Druckvariante ausgewählt.</span></div>${["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl"].map(name=>`<input type="hidden" name="${name}">`).join("")}<label>Set<input id="inventorySetDisplay" readonly></label><label>Setnummer<input id="inventoryNumberDisplay" readonly></label><label class="full-width">Version / Seltenheit<input id="inventoryRarityDisplay" readonly></label><input name="suggestedSell" type="hidden"><div id="inventoryPriceSuggestion" class="inventory-price-suggestion full-width"><span>Druckvariante auswählen; der Price Guide dient nur als Markt-Orientierung.</span></div>`;
  wrap.dataset.inventorySelection="required";
  modalHandler=data=>{
    if(!data.productId||!data.name){alert("Bitte zuerst die richtige Druckvariante aus der Ergebnisliste auswählen.");return false;}
    entry.history=Array.isArray(entry.history)?entry.history:[];
    entry.history.push({at:new Date().toISOString(),productId:entry.productId||"",name:entry.name||"",set:entry.set||entry.setName||"",version:entry.version||entry.rarity||"",collectorNumber:entry.collectorNumber||"",action:"Druckvariante manuell zugeordnet"});
    entry.history=entry.history.slice(-100);
    Object.assign(entry,{productId:cleanProductId(data.productId),metacardId:data.metacardId||"",name:data.name,germanName:data.germanName||data.name,englishName:data.englishName||"",set:data.set||"",setName:data.setName||"",variant:data.variant||"",version:data.rarity||"",rarity:data.rarity||"",collectorNumber:data.collectorNumber||"",productUrl:data.productUrl||"",manuallyAssignedAt:new Date().toISOString()});
    return true;
  };
  let searchTimer;
  wrap.oninput=event=>{if(event.target.id!=="inventoryCardSearch")return;clearTimeout(searchTimer);inventoryCardSearchSequence++;wrap.dataset.inventorySelection="required";["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","suggestedSell"].forEach(name=>{const field=wrap.querySelector(`[name="${name}"]`);if(field)field.value="";});document.getElementById("inventorySelectedCard").innerHTML="<span>Bitte die richtige Druckvariante auswählen.</span>";searchTimer=setTimeout(()=>renderInventoryCardSearch(event.target.value,entry),220);};
  wrap.onclick=event=>{handleInventoryProductChoice(event);};
  inventoryModalVariants=new Map();configureModalAction();showDialogSafely(document.getElementById("modal"));
  if(entry.name)setTimeout(()=>renderInventoryCardSearch(entry.name,entry),0);
}

function renderInventoryRepricing(){
  const table=document.getElementById("watchRepricingTable");if(!table)return;
  const rows=getInventoryGroups().map(group=>({group,pricing:inventoryGroupPricing(group),stats:inventoryGroupStats(group)})).filter(row=>row.pricing.needsReprice||row.pricing.unprofitableAtMarket).sort((a,b)=>Math.abs(b.pricing.listingPrice-b.pricing.suggestedSell)-Math.abs(a.pricing.listingPrice-a.pricing.suggestedSell)).slice(0,100);
  const unprofitable=rows.filter(row=>row.pricing.unprofitableAtMarket).length;
  document.getElementById("watchRepricingSummary").innerHTML=`<div><small>Zu prüfen</small><strong>${rows.length}</strong></div><div><small>Nicht kostendeckend</small><strong class="${unprofitable?"money-negative":"money-positive"}">${unprofitable}</strong></div><div><small>Nur mit exakter CM-ID</small><strong>${rows.filter(row=>cleanProductId(row.group.first.productId)).length}</strong></div>`;
  table.innerHTML=rows.length?rows.map(({group,pricing,stats})=>{const names=cardDisplayNames(group.first),difference=Number(pricing.suggestedSell||0)-Number(pricing.listingPrice||0);return `<tr class="${pricing.unprofitableAtMarket?"inventory-price-review":""}"><td><a class="card-link" href="${escapeHtml(cardmarketUrl(group.first))}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(names.primary)}</strong> ↗</a><br><small>${escapeHtml([group.first.setName||group.first.set,group.first.collectorNumber,group.first.rarity].filter(Boolean).join(" · "))} · CM ${escapeHtml(group.first.productId||"fehlt")}</small></td><td>${stats.total} · ${stats.available} verfügbar</td><td>${pricing.averageCost?money(pricing.averageCost):"fehlt"}</td><td>${pricing.listingPrice?money(pricing.listingPrice):"nicht inseriert"}</td><td>${pricing.suggestedSell?money(pricing.suggestedSell):"keine Preisdaten"}</td><td class="${difference>0?"money-positive":difference<0?"money-negative":"muted"}">${pricing.suggestedSell?`${difference>0?"+":""}${money(difference)}`:"–"}</td><td>${pricing.unprofitableAtMarket?statusBadge("NICHT KAUFEN"):statusBadge("BEOBACHTEN")}</td><td><div class="row-actions"><a class="secondary compact-button button-link" href="${escapeHtml(cardmarketUrl(group.first))}" target="_blank" rel="noopener noreferrer">Cardmarket</a>${pricing.suggestedSell?`<button type="button" class="secondary compact-button" data-apply-group-price="${escapeHtml(group.key)}">Preis prüfen</button>`:""}</div></td></tr>`;}).join(""):'<tr><td colspan="8" class="empty">Keine Preisprüfung erforderlich.</td></tr>';
}

function renderWatchlist() {
  renderWantlists();
  renderInventoryRepricing();
  renderPurchaseAnalysis();
  const q = document.getElementById("watchSearch").value;
  const f = document.getElementById("watchStatusFilter").value;
  const priorityFilter=document.getElementById("watchPriorityFilter")?.value||"",stockFilter=document.getElementById("watchStockFilter")?.value||"",dataFilter=document.getElementById("watchDataFilter")?.value||"",pricingFilter=document.getElementById("watchPricingFilter")?.value||"";
  const dataState=w=>{if(!w.priceDate||(!Number(w.currentBuy||0)&&!Number(w.trend||0)&&!Number(w.avg30||0)))return "missing";return daysBetween(w.priceDate)>Number(state.settings.priceAgeDays||7)?"stale":"fresh";};
  const rank={"TOP DEAL":0,"KAUFEN":1,"BEOBACHTEN":2,"FALLEND":3,"NICHT KAUFEN":4,"STOP":5,"KEINE PREISDATEN":6};
  const all=state.watchlist.filter(w=>!w.archived).map(w=>{const calculation=calculateWatch(w);return {...w,...calculation.market,...calculation};});
  const rows = all.filter(w=>cardRecordMatchesSearch(w,q) && (!f || w.status===f)&&(!priorityFilter||w.priority===priorityFilter)&&(!stockFilter||(stockFilter==="below"?Number(w.stock||0)<Number(w.target||0):Number(w.stock||0)>=Number(w.target||0)))&&(!dataFilter||dataState(w)===dataFilter)&&(!pricingFilter||(w.pricingMode||"automatic")===pricingFilter)).sort((a,b)=>(rank[a.status]??99)-(rank[b.status]??99)||Number(b.roi||0)-Number(a.roi||0));
  const summary=document.getElementById("watchSummary");if(summary)summary.innerHTML=`<div><small>Beobachtete Druckvarianten</small><strong>${rows.length}</strong></div><div><small>Kaufchancen</small><strong class="money-positive">${rows.filter(row=>["TOP DEAL","KAUFEN"].includes(row.status)).length}</strong></div><div><small>Preisdaten veraltet / fehlen</small><strong class="${rows.some(row=>dataState(row)!=="fresh")?"money-negative":"money-positive"}">${rows.filter(row=>dataState(row)!=="fresh").length}</strong></div><div><small>Unter Sollbestand</small><strong>${rows.filter(row=>Number(row.stock||0)<Number(row.target||0)).length}</strong></div>`;
  document.getElementById("watchTable").innerHTML = rows.length ? rows.map(w=>{ const names=cardDisplayNames(w); return `
    <tr><td>${escapeHtml(w.priority)}</td><td><a class="card-link" href="${escapeHtml(cardmarketUrl(w))}" title="${escapeHtml(`Cardmarket öffnen · Produkt-ID ${w.productId||"nicht vorhanden"} · ${w.set||"Set unbekannt"} · ${w.version||w.rarity||"Version unbekannt"}`)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(names.primary)}</strong><span class="external-link">↗</span></a>${names.secondary?`<br><small>Englisch: ${escapeHtml(names.secondary)}</small>`:""}<br><small>CM ${escapeHtml(w.productId||"-")}</small></td>
    <td>${escapeHtml(w.set||"")}<br><small>${escapeHtml(w.version||"")}</small></td><td>${w.stock}</td><td>${w.target}</td>
    <td>${w.maxBuy?money(w.maxBuy):"–"}</td><td>${w.targetSell?money(w.targetSell):"–"}</td><td>${w.low!==""?money(w.low):"–"}</td><td>${w.trend!==""?money(w.trend):"–"} / ${w.avg30!==""?money(w.avg30):"–"}</td>
    <td>${w.currentBuy!==""?money(w.profit):"-"}</td><td>${w.currentBuy!==""?pct(w.roi):"-"}</td><td class="${dataState(w)==="fresh"?"money-positive":"money-negative"}">${w.priceDate?fmtDate(w.priceDate):"fehlt"}<br><small>${dataState(w)==="fresh"?"aktuell":dataState(w)==="stale"?"veraltet":"keine Preise"}</small></td><td>${statusBadge(w.status)}</td>
    <td><div class="row-actions"><button class="icon-button" data-edit-watch="${w.id}">Bearbeiten</button><button class="icon-button" data-delete-watch="${w.id}">Löschen</button></div></td></tr>`;}).join("") : `<tr><td colspan="14" class="empty">Keine Karten gefunden</td></tr>`;
}

function activePurchaseDraft(){
  return state.purchaseDrafts.find(row=>row.id===state.activePurchaseDraftId)||null;
}
function purchaseDraftRow(raw={},index=0){
  const productId=cleanProductId(raw.productId||raw.idProduct||raw["Produkt-ID"]||raw["CM Produkt-ID"]);
  const fallback={name:raw.name||raw.cardName||raw.Karte||raw["Kartenname"]||"",set:raw.set||raw.Set||"",setName:raw.setName||"",rarity:raw.rarity||raw.Seltenheit||"",collectorNumber:raw.collectorNumber||raw.Setnummer||"",language:mapLanguage(raw.language||raw.Sprache||"DE"),condition:mapCondition(raw.condition||raw.Zustand||"NM")};
  const product=resolveProduct(productId,fallback);
  return {id:String(raw.id||uid()),sourceArticleId:String(raw.sourceArticleId||raw.articleId||"").replace(/\D/g,""),productId,name:product.name||fallback.name,germanName:product.germanName||fallback.name,englishName:product.englishName||"",set:product.set||fallback.set,setName:product.setName||fallback.setName,collectorNumber:product.collectorNumber||fallback.collectorNumber,rarity:product.rarity||fallback.rarity,language:fallback.language||product.language||"DE",condition:fallback.condition||product.condition||"NM",quantity:Math.max(1,Math.round(num(raw.quantity??raw.Menge,1))),privateQuantity:Math.max(0,Math.round(num(raw.privateQuantity??raw.Privat,0))),unitPrice:Math.max(0,num(raw.unitPrice??raw.price??raw.Stückpreis??raw.Preis,0)),enabled:raw.enabled!==false,liveOffer:Number(product.liveOffer||raw.liveOffer||0),low:Number(product.low||raw.low||0),trend:Number(product.trend||raw.trend||0),avg1:Number(product.avg1||raw.avg1||0),avg7:Number(product.avg7||raw.avg7||0),avg30:Number(product.avg30||raw.avg30||0),priceDate:product.priceDate||raw.priceDate||"",marketReferenceSource:product.marketReferenceSource||raw.marketReferenceSource||"",productUrl:product.productUrl||raw.productUrl||"",sourceRow:index+1};
}
function parsePurchaseDraftText(text){
  const source=String(text||"").trim();if(!source)return [];
  if(source.startsWith("{")||source.startsWith("[")){
    const payload=JSON.parse(source);return (Array.isArray(payload)?payload:payload.items||payload.cards||payload.products||[]).map(purchaseDraftRow);
  }
  if(/<html|data-product-id|\/Products\/Singles\//i.test(source)){
    const doc=new DOMParser().parseFromString(source,"text/html");
    const exact=[...doc.querySelectorAll("[data-product-id]")].map((row,index)=>purchaseDraftRow({sourceArticleId:row.dataset.articleId,productId:row.dataset.productId,name:row.dataset.name||row.querySelector('a[href*="/Products/Singles/"]')?.textContent?.trim(),quantity:row.dataset.amount||row.dataset.quantity||1,unitPrice:row.dataset.price||row.querySelector(".price")?.textContent||0,language:row.dataset.language,condition:row.dataset.condition,productUrl:row.querySelector('a[href*="/Products/Singles/"]')?.href},index));
    if(exact.length)return TcgBusinessAutomation.deduplicatePurchaseDraftRows(exact);
    return [...doc.querySelectorAll('a[href*="/Products/Singles/"]')].map((link,index)=>{const parent=link.closest("tr,article,li,div")||link.parentElement;const content=parent?.textContent||"";const id=cleanProductId(new URL(link.href,"https://www.cardmarket.com").searchParams.get("idProduct"));const price=(content.match(/(\d+[,.]\d{2})\s*€/g)||[]).map(num).at(-1)||0;const quantity=Number((content.match(/(?:Menge|Amount|Qty)\s*[:x]?\s*(\d+)/i)||[])[1]||1);return purchaseDraftRow({productId:id,name:link.textContent.trim(),quantity,unitPrice:price,productUrl:link.href},index);});
  }
  const lines=source.split(/\r?\n/).filter(Boolean);const separator=lines[0]?.includes(";")?";":"\t";
  const first=lines[0].split(separator).map(value=>value.trim().toLowerCase());
  const header=first.some(value=>/product|produkt|name|karte|menge|quantity/.test(value));
  if(header){return parseCsv(source).map(purchaseDraftRow);}
  return lines.map((line,index)=>{const [productId,name,quantity,unitPrice,language,condition,set,rarity]=line.split(separator).map(value=>value.trim());return purchaseDraftRow({productId,name,quantity,unitPrice,language,condition,set,rarity},index);});
}
function analyzeActivePurchaseDraft(){
  const draft=activePurchaseDraft();if(!draft)return null;
  draft.items=TcgBusinessAutomation.deduplicatePurchaseDraftRows(draft.items||[]);
  draft.analysis=TcgBusinessAutomation.analyzePurchaseDraft(draft.items,{shipping:draft.shipping,extra:draft.extra,refund:draft.refund},forwardPricingSettings());
  draft.updatedAt=new Date().toISOString();return draft.analysis;
}
let purchaseDraftPriceRefreshPromise=null;
async function refreshActivePurchaseDraftPrices(force=true){
  const draft=activePurchaseDraft();
  if(!draft||!window.desktopApp?.getTradeRecommendations)return null;
  const ids=[...new Set((draft.items||[]).map(item=>cleanProductId(item.productId)).filter(Boolean))];
  if(!ids.length)return null;
  const signature=`${ids.join(",")}|${state.cardmarket?.priceDate||state.sync?.lastPriceUpdate||""}`;
  if(!force&&draft.marketPriceSignature===signature)return draft.analysis||null;
  if(purchaseDraftPriceRefreshPromise)return purchaseDraftPriceRefreshPromise;
  purchaseDraftPriceRefreshPromise=(async()=>{
    const result=await window.desktopApp.getTradeRecommendations({productIds:ids,limit:100});
    const byId=new Map((result?.recommendations||[]).map(row=>[String(row.productId),row]));
    (draft.items||[]).forEach(item=>{
      const market=byId.get(cleanProductId(item.productId));if(!market)return;
      ["liveOffer","low","trend","avg1","avg7","avg30","priceDate","priceSource","marketReferenceSource","historicalReference"].forEach(key=>{if(market[key]!==undefined&&market[key]!==null)item[key]=market[key];});
    });
    draft.marketPriceSignature=signature;
    draft.marketPricesLoadedAt=new Date().toISOString();
    analyzeActivePurchaseDraft();saveState();renderBuyingPlanner();
    return draft.analysis;
  })();
  try{return await purchaseDraftPriceRefreshPromise;}finally{purchaseDraftPriceRefreshPromise=null;}
}
function renderBuyingPlanner(){
  const select=document.getElementById("purchaseDraftSelect");if(!select)return;
  const current=activePurchaseDraft();
  select.innerHTML=`<option value="">Neuer Entwurf</option>${state.purchaseDrafts.map(row=>`<option value="${escapeHtml(row.id)}" ${row.id===state.activePurchaseDraftId?"selected":""}>${escapeHtml(row.name||`Entwurf ${fmtDate(row.createdAt)}`)}</option>`).join("")}`;
  if(current){document.getElementById("purchaseDraftSeller").value=current.seller||"";document.getElementById("purchaseDraftShipping").value=Number(current.shipping||0);document.getElementById("purchaseDraftExtra").value=Number(current.extra||0);}
  let analysis=null;
  if(current){
    const deduplicated=TcgBusinessAutomation.deduplicatePurchaseDraftRows(current.items||[]);
    const needsRefresh=deduplicated.length!==(current.items||[]).length||!current.analysis?.lines?.length||current.analysis.lines.some(row=>row.typicalProfit===undefined||row.pricing?.typicalSell===undefined);
    if(needsRefresh){current.items=deduplicated;analysis=analyzeActivePurchaseDraft();saveState();}
    else analysis=current.analysis;
  }
  const summary=document.getElementById("purchaseDraftSummary"),table=document.getElementById("purchaseDraftTable");
  if(!analysis){summary.innerHTML="";table.innerHTML='<tr><td colspan="10" class="empty">Noch keinen Warenkorb analysiert.</td></tr>';}
  else{
    const totals=analysis.totals;
    const enabledLines=analysis.lines.filter(row=>row.enabled!==false&&Number(row.businessQuantity||0)>0),missingPrices=enabledLines.filter(row=>!Number(row.pricing?.suggestedSell||0)).length;
    const goodLines=enabledLines.filter(row=>["Sehr guter EK","Lohnt sich"].includes(row.recommendation)).length;
    const manualLines=enabledLines.filter(row=>row.recommendation==="Marktpreis prüfen").length;
    const badLines=enabledLines.filter(row=>row.recommendation==="Nicht kaufen").length;
    const overallDecision=missingPrices?"Preisdaten prüfen":badLines||manualLines?"Nur geprüfte Positionen kaufen":goodLines===enabledLines.length&&goodLines?"Warenkorb lohnt sich":"Einzeln prüfen";
    const overallClass=overallDecision==="Warenkorb lohnt sich"?"money-positive":badLines&&!goodLines&&!manualLines?"money-negative":"money-warning";
    const range=(low,high,formatter=money)=>Number(high||0)>Number(low||0)+0.009?`${formatter(low)} – ${formatter(high)}`:formatter(low);
    const rangeClass=(low,high)=>Number(high||0)<0?"money-negative":Number(low||0)>=0?"money-positive":"money-warning";
    summary.innerHTML=`<div><small>Karten / geschäftlich</small><strong>${totals.cards} / ${totals.businessCards}</strong></div><div><small>Bezahlt gesamt</small><strong>${money(totals.paid)}</strong></div><div><small>Geschäftlicher EK</small><strong>${money(totals.businessCost)}</strong></div><div><small>Möglicher Umsatz</small><strong>${range(totals.projectedRevenue,totals.typicalProjectedRevenue)}</strong><small>vorsichtig bis typischer Price Guide</small></div><div><small>Möglicher Gewinn</small><strong class="${rangeClass(totals.projectedProfit,totals.typicalProjectedProfit)}">${range(totals.projectedProfit,totals.typicalProjectedProfit)}</strong></div><div><small>Möglicher ROI</small><strong class="${rangeClass(totals.projectedRoi,totals.typicalProjectedRoi)}">${range(totals.projectedRoi,totals.typicalProjectedRoi,pct)}</strong></div><div><small>Gesamtentscheidung</small><strong class="${overallClass}">${overallDecision}</strong><small>${missingPrices?`${missingPrices} Position(en) ohne Preis`: `${goodLines} gut · ${manualLines} Markt prüfen · ${badLines} nicht kaufen`}</small></div>`;
    table.innerHTML=analysis.lines.map(row=>{
      const sellLow=Number(row.pricing.suggestedSell||0),sellHigh=Number(row.pricing.typicalSell||sellLow),buyLow=Number(row.pricing.maxBuy||0),buyHigh=Number(row.pricing.typicalMaxBuy||buyLow);
      return `<tr class="draft-${row.recommendation.toLowerCase().replaceAll(" ","-")}"><td><input type="checkbox" data-draft-enabled="${escapeHtml(row.id)}" ${row.enabled!==false?"checked":""}></td><td><input class="draft-number" type="number" min="0" max="${row.quantity}" value="${row.privateQuantity}" data-draft-private="${escapeHtml(row.id)}"></td><td><a class="card-link" href="${escapeHtml(cardmarketUrl(row))}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(cardDisplayNames(row).primary)}</strong> ↗</a><br><small>${escapeHtml([row.setName||row.set,row.collectorNumber,row.rarity,row.language,row.condition].filter(Boolean).join(" · "))} · CM ${escapeHtml(row.productId||"fehlt")}</small></td><td><input class="draft-number" type="number" min="1" value="${row.quantity}" data-draft-quantity="${escapeHtml(row.id)}"></td><td><input class="draft-price" type="number" min="0" step="0.01" value="${row.unitPrice}" data-draft-price="${escapeHtml(row.id)}"></td><td><strong>${money(row.landedUnitCost)}</strong></td><td>${sellLow?`<strong>${range(sellLow,sellHigh)}</strong><br><small>${row.pricing.liveOffer?"Gespeicherte Angebotsbeobachtung":"vorsichtig bis typisches 1-/7-/30-Tage-Niveau"}</small>`:"–"}</td><td>${buyHigh?`<strong>${range(buyLow,buyHigh)}</strong><br><small>untere Grenze sicher · obere nur nach Marktprüfung</small>`:"–"}</td><td class="${rangeClass(row.expectedProfit,row.typicalProfit)}">${sellLow?`${range(row.expectedProfit,row.typicalProfit)}<br><small>${range(row.expectedRoi,row.typicalRoi,pct)}</small>`:"–"}</td><td>${statusBadge(row.recommendation)}<br><small>${escapeHtml(row.decisionReason||"")}</small></td></tr>`;
    }).join("");
  }
  renderDemandRadar();
}

let collectionSearchProducts=new Map();
let selectedCollectionProductId="";
let collectionSearchSequence=0;
let activeCollectionPhotoId="";
let activeCollectionObservationId="";
let collectionObservationNameSearchSequence=0;
let collectionObservationPrintSearchSequence=0;
let collectionObservationNameSearchProducts=new Map();
let collectionObservationPrintSearchProducts=new Map();
const collectionPhotoDataUrls=new Map();
let collectionNameRecognitionBatchToken=0;
const collectionNameRecognitionRunningIds=new Set();

function activeCollectionAnalysis(){
  return (state.collectionPurchaseAnalyses||[]).find(row=>row.id===state.activeCollectionAnalysisId)||null;
}

function createCollectionAnalysis(){
  const analysis={id:uid(),title:`Sammlungsanalyse ${new Date().toLocaleString("de-DE")}`,sourceType:"Kleinanzeigen",sellerName:"",url:"",date:todayISO(),sellerPrice:0,shipping:0,extra:0,notes:"",items:[],decisionSnapshots:[],photos:[],photoObservations:[],physicalCards:[],createdAt:new Date().toISOString()};
  state.collectionPurchaseAnalyses.unshift(analysis);state.activeCollectionAnalysisId=analysis.id;return analysis;
}

function normalizeCollectionPhotoEvidence(analysis){
  if(!analysis)return {photos:[],photoObservations:[],physicalCards:[]};
  if(Array.isArray(analysis.photos)&&Array.isArray(analysis.photoObservations)&&Array.isArray(analysis.physicalCards))return {photos:analysis.photos,photoObservations:analysis.photoObservations,physicalCards:analysis.physicalCards};
  const evidence=window.TcgCollectionPhotoModel?.normalizeAnalysisPhotoEvidence?.(analysis)||{photos:[],photoObservations:[],physicalCards:[]};
  analysis.photos=evidence.photos;analysis.photoObservations=evidence.photoObservations;analysis.physicalCards=evidence.physicalCards;
  return evidence;
}

function activeCollectionPhoto(analysis=activeCollectionAnalysis()){
  if(!analysis)return null;normalizeCollectionPhotoEvidence(analysis);
  let photo=analysis.photos.find(row=>row.id===activeCollectionPhotoId)||analysis.photos[0]||null;
  activeCollectionPhotoId=photo?.id||"";return photo;
}

function activeCollectionObservation(analysis=activeCollectionAnalysis()){
  if(!analysis)return null;
  const photo=activeCollectionPhoto(analysis);if(!photo)return null;
  let observation=analysis.photoObservations.find(row=>row.id===activeCollectionObservationId&&row.photoId===photo.id&&row.detectionReviewState!=="rejected")||null;
  activeCollectionObservationId=observation?.id||"";return observation;
}

async function loadCollectionPhotoData(photo){
  if(!photo?.relativePath)return "";
  if(collectionPhotoDataUrls.has(photo.relativePath))return collectionPhotoDataUrls.get(photo.relativePath);
  if(!window.desktopApp?.readCollectionPhoto)return "";
  try{const result=await window.desktopApp.readCollectionPhoto(photo.relativePath);collectionPhotoDataUrls.set(photo.relativePath,result.dataUrl);return result.dataUrl||"";}
  catch(error){console.error("Sammlungsfoto konnte nicht geladen werden:",error);return "";}
}

function collectionObservationLabel(observation,index){
  if(observation.selectedName||observation.nameCandidates?.[0]?.name)return observation.selectedName||observation.nameCandidates[0].name;
  if(observation.observationSource==="automatic")return `Vorschlag ${Math.round(Number(observation.detectionScore||0)*100)} %`;
  return `Manuell ${index+1}`;
}

function collectionDetectionConfidenceLabel(value){return ({high:"Hoch",medium:"Mittel",low:"Niedrig",unknown:"Unbekannt"})[value]||"Unbekannt";}
function collectionNameConfidenceLabel(value){return ({high:"Hoch",medium:"Mittel",low:"Niedrig",unknown:"Unbekannt",confirmed:"Manuell bestätigt"})[value]||"Unbekannt";}
function collectionNameCandidateContext(candidate={}){
  if(candidate.source!=="automatic_ocr")return "Manuell aus dem Kartenkatalog hinzugefügt";
  const details=[];
  if(candidate.ocrText)details.push(`${candidate.matchedLanguage==="de"?"Deutscher":candidate.matchedLanguage==="en"?"Englischer":"Zweisprachiger"} OCR-Treffer „${candidate.ocrText}“${candidate.matchedAlias?` → „${candidate.matchedAlias}“`:""}`);
  if(candidate.passcodeMatched)details.push(`Karten-ID ${candidate.matchedPasscode||"erkannt"} stimmt überein`);
  if(Number(candidate.artworkSimilarity||0)>=.58)details.push(`Artwork ${Math.round(Number(candidate.artworkSimilarity)*100)} % ähnlich`);
  if(Number(candidate.supportCount||0)>1)details.push("mehrere OCR-Varianten stimmen überein");
  if(candidate.signalConflict)details.push("Konflikt zwischen Erkennungssignalen – bitte manuell prüfen");
  return `${candidate.score==null?collectionNameConfidenceLabel(candidate.confidence):`${Math.round(Number(candidate.score)*100)} %`} · ${details.join(" · ")||"unsicherer Namenskandidat"}`;
}
function collectionQualityWarningLabel(value){return ({very_dark:"Foto ist sehr dunkel",overexposed:"Foto ist stark überbelichtet",low_contrast:"Sehr geringer Kontrast",possibly_blurred:"Foto möglicherweise unscharf",image_too_small:"Bild ist für eine zuverlässige Erkennung zu klein"})[value]||value;}
function collectionSceneTypeLabel(value){return ({binder_grid:"Binder-Raster",loose_cards:"Lose Karten",mixed_or_uncertain:"Gemischt oder nicht eindeutig"})[value]||"Nicht eindeutig";}
function collectionSceneComplexityLabel(value){return ({low:"Niedrig",medium:"Mittel",high:"Hoch"})[value]||"Niedrig";}

function renderCollectionPhotoPreviews(analysis){
  (analysis.photos||[]).forEach(async photo=>{
    const dataUrl=await loadCollectionPhotoData(photo);
    if(!dataUrl)return;
    document.querySelectorAll(`[data-collection-photo-preview="${CSS.escape(photo.id)}"]`).forEach(image=>{image.src=dataUrl;});
    if(photo.id===activeCollectionPhotoId){const main=document.getElementById("collectionPhotoImage");if(main&&main.dataset.photoId===photo.id)main.src=dataUrl;}
  });
}

function renderCollectionObservationEditor(analysis,observation){
  const fields=document.getElementById("collectionObservationEditorFields"),remove=document.getElementById("deleteCollectionObservationBtn"),hint=document.getElementById("collectionObservationHint");
  fields.hidden=!observation;remove.hidden=!observation;hint.textContent=observation?`${observation.observationSource==="automatic"?"Automatischer Vorschlag":"Manuelle Markierung"} ${analysis.photoObservations.filter(row=>row.photoId===observation.photoId&&row.detectionReviewState!=="rejected").findIndex(row=>row.id===observation.id)+1} wird geprüft.`:"Rechteck zeichnen oder auswählen.";
  if(!observation){document.getElementById("collectionObservationNameResults").innerHTML="";document.getElementById("collectionObservationPrintResults").innerHTML="";return;}
  const automatic=observation.observationSource==="automatic",detection=document.getElementById("collectionObservationDetection"),actions=document.getElementById("collectionDetectionActions");
  const rotation=Number(observation.detectionSignals?.rotationDegrees);const geometry=automatic&&Number.isFinite(rotation)?` · erkannter Winkel ${Math.abs(rotation).toFixed(0)}°`:"";
  detection.innerHTML=automatic?`<strong>Automatisch erkannte Kartenfläche</strong><span>Detection-Confidence: ${escapeHtml(collectionDetectionConfidenceLabel(observation.detectionConfidence))} · ${Math.round(Number(observation.detectionScore||0)*100)} %${geometry}</span><small>Diese Sicherheit sagt nur, ob dort wahrscheinlich eine Karte liegt. Sie bestätigt weder Kartenname noch Print.</small>`:'<strong>Manuell markierter Kartenbereich</strong><small>Keine automatische Detection-Confidence. Kartenname und Print werden weiterhin getrennt geprüft.</small>';
  actions.hidden=!automatic||observation.detectionReviewState==="confirmed";
  const box=observation.boundingBox||{};
  [["collectionBBoxX",box.x],["collectionBBoxY",box.y],["collectionBBoxWidth",box.width],["collectionBBoxHeight",box.height],["collectionObservationRow",observation.row],["collectionObservationColumn",observation.column]].forEach(([id,value])=>{document.getElementById(id).value=value??"";});
  document.getElementById("collectionObservationNameConfidence").value=observation.nameConfidence||"unknown";
  document.getElementById("collectionObservationPrintConfidence").value=observation.printConfidence||"unknown";
  document.getElementById("collectionObservationReviewStatus").value=observation.reviewStatus||"unreviewed";
  document.getElementById("collectionObservationSignals").value=(observation.recognitionSignals||[]).join("\n");
  document.getElementById("collectionObservationEconomicRelevant").checked=Boolean(observation.economicRelevant);
  document.getElementById("collectionObservationDetailRequired").checked=Boolean(observation.detailPhotoRequired);
  const nameRecognition=observation.nameRecognition||{},automaticNameCandidates=(observation.nameCandidates||[]).filter(candidate=>candidate.source==="automatic_ocr");
  const recognitionButton=document.getElementById("recognizeCollectionObservationNameBtn"),discardRecognition=document.getElementById("discardCollectionObservationNameRecognitionBtn"),recognitionStatus=document.getElementById("collectionObservationNameRecognitionStatus");
  const multiCardRegion=automatic&&(observation.detectionSignals?.multiCardBoxLikely===true||observation.detectionSignals?.multiCardGridLikely===true);
  recognitionButton.textContent=multiCardRegion?"Kartenfläche prüfen":collectionNameRecognitionRunningIds.has(observation.id)?"Name wird geprüft …":nameRecognition.lastRunAt?"Namensprüfung erneut ausführen":"Kartennamen aus Fläche erkennen";recognitionButton.disabled=multiCardRegion||collectionNameRecognitionRunningIds.has(observation.id);discardRecognition.hidden=!automaticNameCandidates.length&&!nameRecognition.lastRunAt;
  recognitionStatus.innerHTML=multiCardRegion?'<strong>Kartenfläche prüfen</strong><br><small>Dieser automatische Bereich umfasst wahrscheinlich mehrere Binder-Rasterzellen. Die Namens-OCR wird deshalb nicht ausgeführt.</small>':nameRecognition.lastRunAt?`Letzte OCR-Prüfung: ${escapeHtml(new Date(nameRecognition.lastRunAt).toLocaleString("de-DE"))} · Sicherheit ${escapeHtml(collectionNameConfidenceLabel(observation.nameConfidence))} · ${Math.round(Number(nameRecognition.confidenceScore||0)*100)} %${nameRecognition.durationMs?` · ${Math.round(Number(nameRecognition.durationMs))} ms`:""}<br><small>${escapeHtml(nameRecognition.message||"Die Vorschläge sind nicht bestätigt. Bitte einen Namen bewusst bestätigen.")}</small>`:"Noch keine automatische Namensprüfung ausgeführt.";
  document.getElementById("collectionObservationNameCandidates").innerHTML=(observation.nameCandidates||[]).length?(observation.nameCandidates||[]).map(candidate=>{const confirmed=observation.nameConfidence==="confirmed"&&normalizeCardName(observation.selectedName)===normalizeCardName(candidate.name);return `<div class="collection-candidate-row ${confirmed?"selected":""}"><span><strong>${escapeHtml(candidate.name)}</strong>${candidate.englishName&&normalizeCardName(candidate.englishName)!==normalizeCardName(candidate.name)?`<small>Englisch: ${escapeHtml(candidate.englishName)}</small>`:""}<small>${escapeHtml(collectionNameCandidateContext(candidate))}</small></span><span class="collection-candidate-actions"><button type="button" class="secondary" data-select-observation-name="${escapeHtml(candidate.id)}">${confirmed?"Bestätigt":"Diesen Namen bestätigen"}</button><button type="button" class="icon-button danger-text" data-remove-observation-name="${escapeHtml(candidate.id)}">×</button></span></div>`;}).join(""):'<div class="muted">Noch kein Namenskandidat gespeichert.</div>';
  document.getElementById("collectionObservationPrintCandidates").innerHTML=(observation.printCandidates||[]).length?(observation.printCandidates||[]).map(candidate=>`<div class="collection-candidate-row"><span><strong>${escapeHtml(candidate.name||`CM ${candidate.productId}`)}</strong><small>${escapeHtml([candidate.setName,candidate.collectorNumber,candidate.rarity].filter(Boolean).join(" · ")||"Druckdaten unvollständig")} · CM ${escapeHtml(candidate.productId)}</small></span><span class="collection-candidate-actions"><button type="button" class="secondary" data-confirm-observation-print="${escapeHtml(candidate.id)}">Diesen Print bestätigen</button><button type="button" class="icon-button danger-text" data-remove-observation-print="${escapeHtml(candidate.id)}">×</button></span></div>`).join(""):'<div class="muted">Noch kein Print-Kandidat gespeichert.</div>';
  const physicalSelect=document.getElementById("collectionObservationPhysicalCard");
  physicalSelect.innerHTML=`<option value="">Noch nicht verknüpft</option>${(analysis.physicalCards||[]).map((card,index)=>`<option value="${escapeHtml(card.id)}" ${card.id===observation.physicalCardId?"selected":""}>${escapeHtml(card.label||`Physische Karte ${index+1}`)}${card.productId?` · CM ${escapeHtml(card.productId)}`:""}</option>`).join("")}`;
  const physical=(analysis.physicalCards||[]).find(card=>card.id===observation.physicalCardId)||null;
  const itemSelect=document.getElementById("collectionPhysicalCardItem");itemSelect.disabled=!physical;
  itemSelect.innerHTML=`<option value="">Keine wirtschaftliche Position verknüpft</option>${(analysis.items||[]).map(item=>`<option value="${escapeHtml(item.id)}" ${item.id===physical?.linkedCollectionItemId?"selected":""}>${escapeHtml(item.name||`CM ${item.productId||"?"}`)} · ${escapeHtml(item.collectorNumber||item.set||"")}</option>`).join("")}`;
}

function renderCollectionPhotoEvidence(analysis){
  const workspace=document.getElementById("collectionPhotoWorkspace"),list=document.getElementById("collectionPhotoList"),summary=document.getElementById("collectionPhotoEvidenceSummary");
  if(!analysis){workspace.hidden=true;list.innerHTML='<div class="empty">Zuerst eine Sammlungsanalyse anlegen.</div>';summary.innerHTML="";return;}
  normalizeCollectionPhotoEvidence(analysis);const evidence=window.TcgCollectionPhotoModel?.summarizePhotoEvidence?.(analysis)||{};
  summary.innerHTML=`<div><small>Fotos</small><strong>${evidence.photoCount||0}</strong></div><div><small>Sichtbare Kartenbereiche</small><strong>${evidence.observationCount||0}</strong></div><div><small>Automatische Vorschläge</small><strong>${evidence.automaticSuggestedCount||0}</strong></div><div><small>Bestätigte Vorschläge</small><strong>${evidence.automaticConfirmedCount||0}</strong></div><div><small>Manuell angelegte physische Karten</small><strong>${evidence.physicalCardCount||0}</strong></div><div><small>Detailfoto erforderlich</small><strong>${evidence.detailPhotoRequiredCount||0}</strong></div>`;
  const photo=activeCollectionPhoto(analysis);workspace.hidden=!photo;
  list.innerHTML=analysis.photos.length?analysis.photos.map(row=>`<button type="button" class="collection-photo-choice ${row.id===photo?.id?"active":""}" data-select-collection-photo="${escapeHtml(row.id)}"><img data-collection-photo-preview="${escapeHtml(row.id)}" alt=""><span><strong>Bild ${row.sequence}</strong><small>${escapeHtml(row.binderPage||"keine Binder-Seite")}</small><small>${escapeHtml(row.originalFileName||"")}</small></span></button>`).join(""):'<div class="empty">Noch keine Fotos gespeichert.</div>';
  if(!photo){renderCollectionObservationEditor(analysis,null);return;}
  document.getElementById("collectionPhotoSequence").value=photo.sequence||1;document.getElementById("collectionPhotoBinderPage").value=photo.binderPage||"";
  const status=document.getElementById("collectionPhotoDetectionStatus"),quality=document.getElementById("collectionPhotoQuality"),photoSuggestions=analysis.photoObservations.filter(row=>row.photoId===photo.id&&row.observationSource==="automatic"&&row.detectionReviewState!=="rejected");
  status.textContent=photo.lastDetectionAt?`Letzte automatische Analyse: ${new Date(photo.lastDetectionAt).toLocaleString("de-DE")} · ${photoSuggestions.length} sichtbare automatische Vorschläge.`:"Noch keine automatische Flächenerkennung für dieses Foto ausgeführt.";
  const qualityData=photo.detectionQuality||{},warnings=Array.isArray(qualityData.warnings)?qualityData.warnings:[],scene=photo.sceneAnalysis||{},complexity=scene.sceneComplexity||{},complexScene=complexity.level==="high";quality.hidden=!photo.lastDetectionAt;quality.classList.toggle("warning",warnings.length>0||complexScene);quality.innerHTML=photo.lastDetectionAt?`<strong>Bildqualität</strong><span>Helligkeit ${Number(qualityData.brightness||0).toFixed(0)} · Kontrast ${Number(qualityData.contrast||0).toFixed(0)} · Kantenschärfe ${Number(qualityData.sharpness||0).toFixed(0)}</span><small>${warnings.length?warnings.map(collectionQualityWarningLabel).join(" · "):"Keine deutliche technische Qualitätswarnung. Reflexionen und Folien können die Erkennung trotzdem beeinflussen."}</small><strong class="collection-scene-heading">Szene: ${escapeHtml(collectionSceneTypeLabel(scene.sceneType))}</strong><span>Scene-Confidence: ${escapeHtml(collectionDetectionConfidenceLabel(scene.sceneConfidence))} · Szenenkomplexität: ${escapeHtml(collectionSceneComplexityLabel(complexity.level))}</span><small>${complexScene?"Komplexe Szene: Überlappungen, starke Drehungen oder unterschiedliche Größen können Karten verdecken. Bitte alle Vorschläge und fehlende Karten manuell prüfen.":scene.sceneType==="mixed_or_uncertain"?"Der Aufbau ist nicht eindeutig. Die Erkennung bleibt bewusst vorsichtig und erfordert eine manuelle Sichtprüfung.":"Bildqualität und Szenenkomplexität werden getrennt bewertet."}</small>`:"";
  const image=document.getElementById("collectionPhotoImage");image.dataset.photoId=photo.id;image.removeAttribute("src");
  const photoObservations=analysis.photoObservations.filter(row=>row.photoId===photo.id&&row.detectionReviewState!=="rejected");const overlay=document.getElementById("collectionPhotoOverlay");
  overlay.innerHTML=photoObservations.map((observation,index)=>{const box=observation.boundingBox,source=observation.observationSource==="automatic"?"automatic":"manual",review=observation.detectionReviewState||"manual";return `<div class="collection-photo-box source-${source} detection-${review} ${observation.id===activeCollectionObservationId?"active":""}" data-observation-box="${escapeHtml(observation.id)}" style="left:${box.x*100}%;top:${box.y*100}%;width:${box.width*100}%;height:${box.height*100}%"><span>${escapeHtml(collectionObservationLabel(observation,index))}</span></div>`;}).join("");
  renderCollectionObservationEditor(analysis,activeCollectionObservation(analysis));renderCollectionPhotoPreviews(analysis);
}

async function addCollectionPhotos(files){
  if(!files?.length)return;if(!window.desktopApp?.storeCollectionPhoto){alert("Sammlungsfotos können nur in der installierten Desktop-App gespeichert werden.");return;}
  const analysis=activeCollectionAnalysis()||createCollectionAnalysis();syncCollectionMetadata();
  await window.desktopApp.saveState(state);
  for(const file of files){
    try{
      const bytes=new Uint8Array(await file.arrayBuffer());
      const photo=await window.desktopApp.storeCollectionPhoto({analysisId:analysis.id,originalFileName:file.name,mimeType:file.type,bytes,sequence:(analysis.photos||[]).length+1});
      analysis.photos=analysis.photos||[];if(!analysis.photos.some(row=>row.id===photo.id))analysis.photos.push(photo);activeCollectionPhotoId=photo.id;
    }catch(error){console.error(error);alert(`${file.name}: ${error.message}`);}
  }
  activeCollectionObservationId="";saveState();renderCollectionPurchases();
}

async function deleteActiveCollectionPhoto(){
  const analysis=activeCollectionAnalysis(),photo=activeCollectionPhoto(analysis);if(!analysis||!photo)return;
  if(!confirm(`Foto „${photo.originalFileName||`Bild ${photo.sequence}`}“ und seine Kartenmarkierungen löschen?`))return;
  await window.desktopApp.saveState(state);
  await window.desktopApp.deleteCollectionPhoto({analysisId:analysis.id,photoId:photo.id});
  collectionPhotoDataUrls.delete(photo.relativePath);Object.assign(analysis,window.TcgCollectionPhotoModel.removePhotoEvidence(analysis,photo.id));activeCollectionPhotoId=analysis.photos[0]?.id||"";activeCollectionObservationId="";saveState();renderCollectionPurchases();
}

async function detectActiveCollectionPhoto(){
  const analysis=activeCollectionAnalysis(),photo=activeCollectionPhoto(analysis),button=document.getElementById("detectCollectionCardsBtn");
  if(!analysis||!photo)return;
  if(!window.TcgScannerImageProcessing?.detectCollectionCardsFromDataUrl){alert("Die automatische Kartenflächenerkennung ist in dieser Installation nicht verfügbar.");return;}
  const dataUrl=await loadCollectionPhotoData(photo);if(!dataUrl){alert("Das Sammlungsfoto konnte nicht geladen werden.");return;}
  const originalLabel=button.textContent;button.disabled=true;button.textContent="Kartenflächen werden gesucht …";
  try{
    const result=await window.TcgScannerImageProcessing.detectCollectionCardsFromDataUrl(dataUrl);
    const merged=window.TcgCollectionPhotoModel.mergeDetectionSuggestions(analysis.photoObservations,photo.id,result.detections,{analysisId:analysis.id,idFactory:()=>uid()});
    analysis.photoObservations=merged.observations;const multiCardDiscardedCount=Number(result.parameters?.rejectedMultiCardRegions?.length||0);photo.detectionQuality=result.photoQuality||{};photo.sceneAnalysis=result.sceneAnalysis||{};photo.lastDetectionAt=new Date().toISOString();photo.detectionSummary={detectionCount:Number(result.detections?.length||0),addedCount:merged.added.length,skippedCount:merged.skipped,multiCardDiscardedCount,iouThreshold:Number(result.parameters?.iouThreshold||.45),detectorMode:String(result.parameters?.detectorMode||"")};
    activeCollectionObservationId=merged.added[0]?.id||activeCollectionObservationId;saveState();renderCollectionPhotoEvidence(analysis);
    const qualityWarnings=Array.isArray(result.photoQuality?.warnings)?result.photoQuality.warnings.length:0;
    alert(`${merged.added.length} neue Kartenfläche(n) als prüfbare Vorschläge angelegt.${merged.skipped?` ${merged.skipped} bereits vorhandene oder ignorierte Fläche(n) wurden nicht doppelt angelegt.`:""}${qualityWarnings?" Bitte zusätzlich die Hinweise zur Bildqualität beachten.":""}`);
  }catch(error){console.error("Sammlungsfoto-Erkennung fehlgeschlagen:",error);alert(`Kartenflächen konnten nicht erkannt werden: ${error.message}`);}
  finally{button.disabled=false;button.textContent=originalLabel;}
}

function mergeAutomaticCollectionNameCandidates(observation,candidates=[]){
  const selectedKey=normalizeCardName(observation.selectedName||"");
  const preserved=(observation.nameCandidates||[]).filter(candidate=>candidate.source!=="automatic_ocr"||(observation.nameConfidence==="confirmed"&&normalizeCardName(candidate.name)===selectedKey));
  const merged=[];
  for(const candidate of [...candidates,...preserved]){
    const key=String(candidate.metacardId||"").trim()||normalizeCardName(candidate.name||"");
    if(!key||merged.some(row=>(String(row.metacardId||"").trim()||normalizeCardName(row.name||""))===key))continue;
    merged.push(candidate);
  }
  observation.nameCandidates=merged;
}

async function recognizeCollectionObservationName(analysis,photo,observation,{dataUrl="",render=true,persist=true}={}){
  if(!analysis||!photo||!observation)return null;
  if(!window.TcgScannerImageProcessing?.prepareCollectionObservationRecognitionPayload||!window.desktopApp?.recognizeCollectionCardName)throw new Error("Die automatische Namensprüfung ist in dieser Installation nicht verfügbar.");
  if(collectionNameRecognitionRunningIds.has(observation.id))return null;
  collectionNameRecognitionRunningIds.add(observation.id);if(render)renderCollectionPhotoEvidence(analysis);
  try{
    const sourceDataUrl=dataUrl||await loadCollectionPhotoData(photo);if(!sourceDataUrl)throw new Error("Das Sammlungsfoto konnte nicht geladen werden.");
    const prepared=await window.TcgScannerImageProcessing.prepareCollectionObservationRecognitionPayload(sourceDataUrl,observation);
    if(prepared.skipRecognition){
      mergeAutomaticCollectionNameCandidates(observation,[]);if(observation.nameConfidence!=="confirmed")observation.nameConfidence="unknown";observation.nameRecognition={lastRunAt:new Date().toISOString(),engine:"skipped-geometric-check",durationMs:0,confidenceScore:0,margin:0,readings:[],setCodes:[],passcodes:[],artworkFingerprints:[],conflicts:[],message:prepared.message||"Kartenfläche prüfen: Die Namens-OCR wurde nicht ausgeführt."};observation.updatedAt=new Date().toISOString();if(persist)saveState();return {candidates:[],nameConfidence:"unknown",confidenceScore:0,skipped:true,skipReason:prepared.skipReason};
    }
    const result=await window.desktopApp.recognizeCollectionCardName(prepared);
    mergeAutomaticCollectionNameCandidates(observation,result.candidates||[]);
    if(observation.nameConfidence!=="confirmed")observation.nameConfidence=result.nameConfidence||"unknown";
    const ocr=result.ocr||{},readings=(ocr.titleReadings||[]).map(row=>String(row.text||"").trim()).filter(Boolean),setCodes=ocr.setCodes||[],passcodes=ocr.passcodes||[],artworkFingerprints=ocr.artworkFingerprints||[];
    observation.recognitionSignals=(observation.recognitionSignals||[]).filter(signal=>! /^(?:OCR-(?:Name|Setcode)|Karten-ID|Artwork|Signalkonflikt):/i.test(signal));
    if(readings.length)observation.recognitionSignals.push(`OCR-Name: ${[...new Set(readings)].slice(0,4).join(" | ")}`);
    if(setCodes.length)observation.recognitionSignals.push(`OCR-Setcode: ${setCodes.join(" | ")} (nur unterstützendes Signal)`);
    if(passcodes.length)observation.recognitionSignals.push(`Karten-ID: ${passcodes.join(" | ")} (bestimmt nur die Metakarte, keinen Print)`);
    const artworkScore=Math.max(0,...(result.candidates||[]).map(candidate=>Number(candidate.artworkSimilarity||0)));
    if(artworkScore>=.58)observation.recognitionSignals.push(`Artwork: bester Referenzvergleich ${Math.round(artworkScore*100)} % (nur unterstützendes Signal)`);
    if(result.conflicts?.length)observation.recognitionSignals.push(`Signalkonflikt: ${result.conflicts.join(" | ")} – manuelle Prüfung erforderlich`);
    const message=result.candidates?.length?`${result.candidates.length} prüfbare Namenskandidat(en). Kein Name wurde automatisch bestätigt.`:"Kein belastbarer Kartenname gefunden. Bitte Ausschnitt prüfen, manuell suchen oder ein Detailfoto verwenden.";
    observation.nameRecognition={lastRunAt:new Date().toISOString(),engine:String(ocr.engine||"tesseract-local-regions"),durationMs:Number(ocr.durationMs||0),confidenceScore:Number(result.confidenceScore||0),margin:Number(result.margin||0),readings:(result.readings||[]).map(row=>({text:row.text,confidence:row.confidence,variant:row.variant})),setCodes:[...setCodes],passcodes:[...passcodes],artworkFingerprints:artworkFingerprints.map(row=>({...row})),conflicts:[...(result.conflicts||[])],message};
    if(!result.candidates?.length&&observation.economicRelevant)observation.detailPhotoRequired=true;
    observation.updatedAt=new Date().toISOString();if(persist)saveState();return result;
  }finally{collectionNameRecognitionRunningIds.delete(observation.id);if(render)renderCollectionPhotoEvidence(analysis);}
}

async function recognizeActiveCollectionObservationName(){
  const analysis=activeCollectionAnalysis(),photo=activeCollectionPhoto(analysis),observation=activeCollectionObservation(analysis);if(!analysis||!photo||!observation)return;
  try{await recognizeCollectionObservationName(analysis,photo,observation);}
  catch(error){console.error("Kartennamenerkennung fehlgeschlagen:",error);alert(`Kartenname konnte nicht geprüft werden: ${error.message}`);renderCollectionPhotoEvidence(analysis);}
}

async function recognizeActiveCollectionPhotoNames(){
  const analysis=activeCollectionAnalysis(),photo=activeCollectionPhoto(analysis);if(!analysis||!photo)return;
  const observations=analysis.photoObservations.filter(row=>row.photoId===photo.id&&row.detectionReviewState!=="rejected"&&row.boundingBox);if(!observations.length){alert("Auf diesem Foto sind noch keine Kartenflächen markiert.");return;}
  const dataUrl=await loadCollectionPhotoData(photo);if(!dataUrl){alert("Das Sammlungsfoto konnte nicht geladen werden.");return;}
  const token=++collectionNameRecognitionBatchToken,progress=document.getElementById("collectionNameBatchProgress"),bar=document.getElementById("collectionNameBatchProgressBar"),label=document.getElementById("collectionNameBatchProgressLabel"),value=document.getElementById("collectionNameBatchProgressValue"),button=document.getElementById("recognizeCollectionPhotoNamesBtn");
  progress.hidden=false;bar.max=observations.length;bar.value=0;value.textContent=`0 / ${observations.length}`;label.textContent="Kartennamen werden nacheinander geprüft …";button.disabled=true;
  let completed=0,failed=0;
  try{
    for(const observation of observations){
      if(token!==collectionNameRecognitionBatchToken)break;
      activeCollectionObservationId=observation.id;label.textContent=`Prüfe ${observation.row&&observation.column?`Reihe ${observation.row}, Spalte ${observation.column}`:`Kartenfläche ${completed+1}`} …`;
      try{await recognizeCollectionObservationName(analysis,photo,observation,{dataUrl,render:false,persist:false});}catch(error){failed+=1;observation.nameRecognition={lastRunAt:new Date().toISOString(),confidenceScore:0,message:`Prüfung fehlgeschlagen: ${error.message}`};observation.updatedAt=new Date().toISOString();}
      completed+=1;bar.value=completed;value.textContent=`${completed} / ${observations.length}`;renderCollectionPhotoEvidence(analysis);await new Promise(resolve=>setTimeout(resolve,0));
    }
    saveState();const cancelled=token!==collectionNameRecognitionBatchToken;label.textContent=cancelled?`Abgebrochen nach ${completed} von ${observations.length}.`:`Namensprüfung abgeschlossen${failed?` · ${failed} Fehler`:""}.`;
  }finally{button.disabled=false;if(token===collectionNameRecognitionBatchToken)setTimeout(()=>{if(token===collectionNameRecognitionBatchToken)progress.hidden=true;},1800);}
}

function discardActiveCollectionNameRecognition(){
  const analysis=activeCollectionAnalysis(),observation=activeCollectionObservation(analysis);if(!analysis||!observation)return;
  const selectedKey=normalizeCardName(observation.selectedName||"");observation.nameCandidates=(observation.nameCandidates||[]).filter(candidate=>candidate.source!=="automatic_ocr"||(observation.nameConfidence==="confirmed"&&normalizeCardName(candidate.name)===selectedKey));
  if(observation.nameConfidence!=="confirmed")observation.nameConfidence="unknown";delete observation.nameRecognition;observation.recognitionSignals=(observation.recognitionSignals||[]).filter(signal=>! /^(?:OCR-(?:Name|Setcode)|Karten-ID|Artwork|Signalkonflikt):/i.test(signal));observation.updatedAt=new Date().toISOString();saveState();renderCollectionPhotoEvidence(analysis);
}

function createCollectionObservation(boundingBox){
  const analysis=activeCollectionAnalysis(),photo=activeCollectionPhoto(analysis);const normalized=window.TcgCollectionPhotoModel?.normalizeBoundingBox?.(boundingBox);if(!analysis||!photo||!normalized)return null;
  const now=new Date().toISOString(),observation={id:uid(),analysisId:analysis.id,photoId:photo.id,boundingBox:normalized,observationSource:"manual",detectionConfidence:"unknown",detectionScore:null,detectionSignals:{},detectionReviewState:"manual",row:"",column:"",selectedName:"",nameCandidates:[],nameConfidence:"unknown",selectedProductId:"",printCandidates:[],printConfidence:"unknown",recognitionSignals:[],economicRelevant:false,detailPhotoRequired:false,reviewStatus:"unreviewed",physicalCardId:"",linkedCollectionItemId:"",createdAt:now,updatedAt:now};
  analysis.photoObservations.push(observation);activeCollectionObservationId=observation.id;saveState();renderCollectionPhotoEvidence(analysis);return observation;
}

function updateActiveObservationFromFields(){
  const analysis=activeCollectionAnalysis(),observation=activeCollectionObservation(analysis);if(!observation)return;
  const box=window.TcgCollectionPhotoModel?.normalizeBoundingBox?.({x:Number(document.getElementById("collectionBBoxX").value),y:Number(document.getElementById("collectionBBoxY").value),width:Number(document.getElementById("collectionBBoxWidth").value),height:Number(document.getElementById("collectionBBoxHeight").value)});
  if(!box){alert("Der Kartenbereich muss vollständig innerhalb des Fotos liegen.");renderCollectionPhotoEvidence(analysis);return;}
  observation.boundingBox=box;observation.row=document.getElementById("collectionObservationRow").value.trim();observation.column=document.getElementById("collectionObservationColumn").value.trim();observation.nameConfidence=document.getElementById("collectionObservationNameConfidence").value;const requestedPrintConfidence=document.getElementById("collectionObservationPrintConfidence").value;observation.printConfidence=requestedPrintConfidence==="confirmed"&&!cleanProductId(observation.selectedProductId)?"unknown":requestedPrintConfidence;if(requestedPrintConfidence==="confirmed"&&observation.printConfidence!=="confirmed")alert("Ein Print kann erst nach Auswahl einer konkreten Cardmarket-Produkt-ID bestätigt werden.");observation.reviewStatus=document.getElementById("collectionObservationReviewStatus").value;observation.recognitionSignals=document.getElementById("collectionObservationSignals").value.split(/\r?\n/).map(value=>value.trim()).filter(Boolean);observation.economicRelevant=document.getElementById("collectionObservationEconomicRelevant").checked;observation.detailPhotoRequired=document.getElementById("collectionObservationDetailRequired").checked;observation.updatedAt=new Date().toISOString();saveState();renderCollectionPhotoEvidence(analysis);
}

async function searchCollectionObservationCandidates(query,kind){
  const results=document.getElementById(kind==="name"?"collectionObservationNameResults":"collectionObservationPrintResults"),sequence=kind==="name"?++collectionObservationNameSearchSequence:++collectionObservationPrintSearchSequence;
  if(String(query||"").trim().length<2){results.innerHTML="";return;}
  results.innerHTML='<div class="muted">Katalog wird durchsucht …</div>';const products=await searchInventoryCardVariants(query);if(sequence!==(kind==="name"?collectionObservationNameSearchSequence:collectionObservationPrintSearchSequence))return;
  const productMap=new Map(products.map(product=>[String(product.productId),product]));if(kind==="name")collectionObservationNameSearchProducts=productMap;else collectionObservationPrintSearchProducts=productMap;
  if(kind==="name"){
    const unique=[...new Map(products.map(product=>[normalizeCardName(cardDisplayNames(product).primary),product])).values()].slice(0,30);
    results.innerHTML=unique.length?unique.map(product=>`<button type="button" class="collection-candidate-choice" data-add-observation-name="${escapeHtml(product.productId)}"><strong>${escapeHtml(cardDisplayNames(product).primary)}</strong>${product.englishName?`<small>Englisch: ${escapeHtml(product.englishName)}</small>`:""}<small>Nur als Namenskandidat übernehmen</small></button>`).join(""):'<div class="empty">Kein passender Kartenname gefunden.</div>';
  }else results.innerHTML=products.length?products.slice(0,50).map(product=>`<button type="button" class="collection-candidate-choice" data-add-observation-print="${escapeHtml(product.productId)}"><strong>${escapeHtml(inventoryVariantName(product))}</strong><small>${escapeHtml(inventoryVariantSubtitle(product))}</small><small>CM ${escapeHtml(product.productId)} · zunächst nur Kandidat</small></button>`).join(""):'<div class="empty">Keine passende Druckvariante gefunden.</div>';
}

function syncCollectionMetadata(){
  const analysis=activeCollectionAnalysis();if(!analysis)return null;
  const value=id=>document.getElementById(id)?.value??"";
  Object.assign(analysis,{title:value("collectionTitle").trim(),sourceType:value("collectionSourceType"),sellerName:value("collectionSellerName").trim(),url:value("collectionUrl").trim(),date:value("collectionDate")||todayISO(),sellerPrice:Math.max(0,Number(value("collectionSellerPrice")||0)),shipping:Math.max(0,Number(value("collectionShipping")||0)),extra:Math.max(0,Number(value("collectionExtra")||0)),notes:value("collectionNotes").trim(),updatedAt:new Date().toISOString()});
  return analysis;
}

function collectionCalculationInput(analysis){
  return {...analysis,items:(analysis.items||[]).map(item=>{
    const productId=cleanProductId(item.productId);
    const market=productId?marketRecordForProduct({...item,productId}):{};
    const history=productId?(marketDecisionHistoryByProduct[productId]||[]):[];
    const marketDecision=productId?window.TcgBusinessAutomation?.analyzeMarketDecision?.({},market,history,forwardPricingSettings(),new Date()):null;
    const printCandidates=(item.printCandidates||[]).map(candidate=>{
      const candidateId=cleanProductId(candidate.productId);return {...candidate,market:candidateId?marketRecordForProduct({...candidate,productId:candidateId}):{}};
    });
    return {...item,market,marketTrend:marketDecision?.trend||item.marketTrend||"",marketDecision,ownSales:ownSalesExperienceFor(productId)||{},printCandidates};
  })};
}

function calculateCollectionAnalysis(analysis=activeCollectionAnalysis()){
  if(!analysis)return null;
  const result=window.TcgBusinessAutomation?.analyzeCollectionPurchase?.(collectionCalculationInput(analysis),{settings:forwardPricingSettings(),liquidCapital:phase2CapitalOverview().liquid})||null;
  if(result){analysis.calculation=result;analysis.decision=result.decision;analysis.calculatedAt=new Date().toISOString();}
  return result;
}

function collectionDecisionClass(decision){
  return decision==="KAUFEN"?"money-positive":decision==="ABLEHNEN"?"money-negative":decision==="ZU WENIGE DATEN"?"muted":"money-warning";
}

function collectionRiskShare(value,total){return total>0?`${Math.round(Number(value||0)/total*100)} %`:"0 %";}

function renderCollectionPurchases(){
  const select=document.getElementById("collectionAnalysisSelect");if(!select)return;
  const analyses=state.collectionPurchaseAnalyses||[];
  let current=activeCollectionAnalysis();
  select.innerHTML=`<option value="">Neue Analyse</option>${analyses.map(row=>`<option value="${escapeHtml(row.id)}" ${row.id===state.activeCollectionAnalysisId?"selected":""}>${escapeHtml(row.title||"Unbenannte Analyse")} · ${money(row.sellerPrice)}</option>`).join("")}`;
  const ids=["collectionTitle","collectionSourceType","collectionSellerName","collectionUrl","collectionDate","collectionSellerPrice","collectionShipping","collectionExtra","collectionNotes"];
  if(!current){ids.forEach(id=>{const field=document.getElementById(id);if(field)field.value=id==="collectionDate"?todayISO():"";});document.getElementById("collectionDecisionSummary").innerHTML='<div class="empty">Neue Analyse anlegen und Karten erfassen.</div>';document.getElementById("collectionItemTable").innerHTML='<tr><td colspan="14" class="empty">Noch keine Karten erfasst.</td></tr>';document.getElementById("collectionValueCarriers").innerHTML='<div class="empty">Noch keine Wertträger.</div>';document.getElementById("collectionRiskDistribution").innerHTML="";document.getElementById("collectionDecisionReasons").innerHTML="Noch keine Händlerentscheidung berechnet.";renderCollectionPhotoEvidence(null);return;}
  document.getElementById("collectionTitle").value=current.title||"";document.getElementById("collectionSourceType").value=current.sourceType||"Kleinanzeigen";document.getElementById("collectionSellerName").value=current.sellerName||"";document.getElementById("collectionUrl").value=current.url||"";document.getElementById("collectionDate").value=current.date||todayISO();document.getElementById("collectionSellerPrice").value=Number(current.sellerPrice||0);document.getElementById("collectionShipping").value=Number(current.shipping||0);document.getElementById("collectionExtra").value=Number(current.extra||0);document.getElementById("collectionNotes").value=current.notes||"";
  renderCollectionPhotoEvidence(current);
  const calculation=calculateCollectionAnalysis(current);
  if(!calculation)return;
  const summary=document.getElementById("collectionDecisionSummary");
  summary.innerHTML=`<div><small>Karten / Prints</small><strong>${calculation.cardCount} / ${calculation.itemCount}</strong></div><div><small>Verkäuferpreis + Kosten</small><strong>${money(calculation.totalCost)}</strong></div><div><small>Nominaler Referenzwert</small><strong>${money(calculation.nominalValue)}</strong><small>keine sichere Erlösaussage</small></div><div><small>Realistischer Handelswert</small><strong>${money(calculation.realisticValue)}</strong></div><div><small>Konservativer Handelswert</small><strong>${money(calculation.conservativeValue)}</strong></div><div><small>Unsicheres Potenzial</small><strong>${money(calculation.uncertaintyValue)}</strong></div><div><small>Bulk-Wert</small><strong>${money(calculation.bulkValue)}</strong></div><div><small>Blind-Max-EK</small><strong>${money(calculation.blindMaxEk)}</strong></div><div><small>Bestätigter Max-EK</small><strong>${money(calculation.confirmedMaxEk)}</strong></div><div><small>Empfohlenes Erstangebot</small><strong>${money(calculation.firstOffer)}</strong><small>Reserve ${money(calculation.negotiationReserve)}</small></div><div><small>Kapitalbindung / Budget</small><strong>${calculation.capitalBinding} / ${calculation.capitalRisk}</strong><small>${calculation.capitalShare==null?"kein liquides Kapital hinterlegt":`${pct(calculation.capitalShare)} des liquiden Kapitals`}</small></div><div><small>Entscheidung</small><strong class="${collectionDecisionClass(calculation.decision)}">${escapeHtml(calculation.decision)}</strong></div>`;
  document.getElementById("collectionValueCarriers").innerHTML=calculation.topValueCarriers.length?`<ol class="collection-carrier-list">${calculation.topValueCarriers.map(item=>`<li><span><strong>${escapeHtml(item.name||`CM ${item.productId||"unbekannt"}`)}</strong><small>${item.quantity}× · ${escapeHtml(item.priceClass.label)}</small></span><strong>${money(item.conservativeValue)}</strong></li>`).join("")}</ol><p class="muted">Die Top 3 tragen ${calculation.topThreeShare.toLocaleString("de-DE")} % des konservativen Werts. Konzentrationsrisiko: <strong>${calculation.concentrationRisk}</strong>.</p>`:'<div class="empty">Noch keine belastbaren Wertträger.</div>';
  const risk=calculation.riskDistribution,total=calculation.conservativeValue;
  document.getElementById("collectionRiskDistribution").innerHTML=`<div class="settings-status-grid"><div><small>Bestätigt</small><strong>${collectionRiskShare(risk.confirmed,total)}</strong></div><div><small>Unsicher</small><strong>${collectionRiskShare(risk.uncertain,total)}</strong></div><div><small>Low Value</small><strong>${collectionRiskShare(risk.lowValue,total)}</strong></div><div><small>Bulk</small><strong>${collectionRiskShare(risk.bulk,total)}</strong></div></div><p class="muted">Nur aus den vorhandenen Berechnungen; keine behauptete Verkaufswahrscheinlichkeit.</p>`;
  document.getElementById("collectionDecisionReasons").innerHTML=`<strong>${escapeHtml(calculation.decision)}</strong><ul>${calculation.reasons.map(reason=>`<li>${escapeHtml(reason)}</li>`).join("")}</ul>${calculation.relevantItems.length?`<p><strong>Detailprüfung relevant:</strong> ${calculation.relevantItems.map(item=>escapeHtml(item.name||`CM ${item.productId||"?"}`)).join(", ")}</p>`:'<p>Keine unbestätigte Position überschreitet in dieser Entscheidung die Economic-Relevance-Schwelle.</p>'}`;
  const query=String(document.getElementById("collectionItemFilter")?.value||"").trim(),classFilter=document.getElementById("collectionClassFilter")?.value||"",confidenceFilter=document.getElementById("collectionConfidenceFilter")?.value||"",sort=document.getElementById("collectionSort")?.value||"value";
  let rows=calculation.items.filter(row=>(!query||cardRecordMatchesSearch({...current.items.find(item=>item.id===row.id),...row},query))&&(!classFilter||row.priceClass.key===classFilter)&&(!confidenceFilter||row.printConfidence===confidenceFilter));
  rows.sort(sort==="name"?(a,b)=>String(a.name).localeCompare(String(b.name),"de"):sort==="uncertainty"?(a,b)=>b.uncertaintyValue-a.uncertaintyValue:sort==="max"?(a,b)=>b.maxPurchaseContribution-a.maxPurchaseContribution:(a,b)=>b.conservativeValue-a.conservativeValue);
  document.getElementById("collectionItemTable").innerHTML=rows.length?rows.map(row=>{const original=current.items.find(item=>item.id===row.id)||{};const conditions=["NM","EX","GD","LP","PL","POOR","UNBEKANNT"];const languages=["DE","EN","FR","IT","ES","PT","NL","UNBEKANNT"];const confidences={confirmed:"PRINT BESTÄTIGT",likely:"PRINT WAHRSCHEINLICH",unknown:"PRINT UNBEKANNT"};return `<tr><td><strong>${escapeHtml(row.name||original.name||"Print unbekannt")}</strong><br><small>CM ${escapeHtml(row.productId||"nicht bestätigt")}</small></td><td>${escapeHtml(original.setName||original.set||"–")}<br><small>${escapeHtml([original.collectorNumber,original.rarity].filter(Boolean).join(" · ")||"–")}</small></td><td><input class="draft-number" type="number" min="1" value="${row.quantity}" data-collection-quantity="${escapeHtml(row.id)}"></td><td><select data-collection-condition="${escapeHtml(row.id)}">${conditions.map(value=>`<option value="${value}" ${value===row.condition?'selected':''}>${value}</option>`).join('')}</select><select data-collection-language="${escapeHtml(row.id)}">${languages.map(value=>`<option value="${value}" ${value===(original.language||'UNBEKANNT')?'selected':''}>${value}</option>`).join('')}</select></td><td><select data-collection-confidence="${escapeHtml(row.id)}">${Object.entries(confidences).map(([value,label])=>`<option value="${value}" ${value===row.printConfidence?'selected':''}>${label}</option>`).join('')}</select></td><td>${row.referenceValue?money(row.referenceValue):"–"}<br><small>${escapeHtml(row.referenceSource)}</small></td><td><strong>${money(row.conservativeValue)}</strong></td><td>${pct(row.factor*100)}</td><td>${escapeHtml(row.ownSalesDataStatus)}<br><small>${row.ownMedianDays==null?"Median unbekannt":`Median ${row.ownMedianDays} Tage`}</small></td><td>${escapeHtml(row.marketTrend)}</td><td>${money(row.uncertaintyValue)}</td><td>${row.economicRelevant?'<span class="money-warning">DETAILPRÜFUNG</span>':'nicht relevant'}</td><td><strong>${money(row.maxPurchaseContribution)}</strong></td><td><button type="button" class="icon-button danger-text" data-remove-collection-item="${escapeHtml(row.id)}">Entfernen</button></td></tr>`;}).join(""):'<tr><td colspan="14" class="empty">Keine passenden Kartenpositionen.</td></tr>';
  document.getElementById("confirmCollectionPurchaseBtn").textContent=current.linkedPurchaseId?"Einkauf öffnen":"Ankauf bestätigen";
}

async function searchCollectionCards(query){
  const sequence=++collectionSearchSequence,results=document.getElementById("collectionCardSearchResults");selectedCollectionProductId="";document.getElementById("addCollectionCardBtn").disabled=true;
  if(String(query||"").trim().length<2){results.innerHTML="";return;}
  results.innerHTML='<div class="muted">Druckvarianten werden gesucht …</div>';
  const products=await searchInventoryCardVariants(query);if(sequence!==collectionSearchSequence)return;
  collectionSearchProducts=new Map(products.map(product=>[String(product.productId),product]));
  results.innerHTML=products.length?products.slice(0,60).map(product=>`<button type="button" class="inventory-card-choice" data-select-collection-product="${escapeHtml(product.productId)}"><strong>${escapeHtml(inventoryVariantName(product))}</strong>${product.englishName?`<small>Englisch: ${escapeHtml(product.englishName)}</small>`:""}<span>${escapeHtml(inventoryVariantSubtitle(product))}</span><small>Cardmarket-Produkt ${escapeHtml(product.productId)}</small></button>`).join(""):'<div class="empty">Keine passende Druckvariante gefunden.</div>';
}

function addSelectedCollectionCard(){
  let analysis=activeCollectionAnalysis()||createCollectionAnalysis();const product=collectionSearchProducts.get(selectedCollectionProductId);if(!product){alert("Bitte zuerst eine konkrete Druckvariante auswählen.");return;}
  syncCollectionMetadata();const confidence=document.getElementById("collectionCardConfidence").value;
  const market=marketRecordForProduct(product),names=cardDisplayNames(product);
  const sameCardCandidates=confidence==="unknown"?[...collectionSearchProducts.values()].filter(candidate=>normalizeCardName(inventoryVariantName(candidate))===normalizeCardName(inventoryVariantName(product))).slice(0,30).map(candidate=>marketRecordForProduct(candidate)):[];
  analysis.items.push({id:uid(),productId:cleanProductId(product.productId),name:names.primary,germanName:product.germanName||names.primary,englishName:product.englishName||"",set:product.set||"",setName:product.setName||product.set||"",collectorNumber:product.collectorNumber||product.setCode||"",rarity:product.rarity||product.variant||"",quantity:Math.max(1,Math.round(Number(document.getElementById("collectionCardQuantity").value||1))),condition:document.getElementById("collectionCardCondition").value,language:document.getElementById("collectionCardLanguage").value,printConfidence:confidence,printCandidates:sameCardCandidates.map(candidate=>({productId:candidate.productId,name:candidate.name,setName:candidate.setName,collectorNumber:candidate.collectorNumber,rarity:candidate.rarity})),note:"",addedAt:new Date().toISOString(),referenceAtEntry:{priceDate:market.priceDate||"",low:market.low||0,trend:market.trend||0,avg1:market.avg1||0,avg7:market.avg7||0,avg30:market.avg30||0}});
  document.getElementById("collectionCardSearch").value="";document.getElementById("collectionCardSearchResults").innerHTML="";document.getElementById("collectionCardQuantity").value="1";selectedCollectionProductId="";calculateCollectionAnalysis(analysis);saveState();renderAll();document.getElementById("collectionCardSearch").focus();
}

async function importCollectionCsv(file){
  let analysis=activeCollectionAnalysis()||createCollectionAnalysis();const rows=parseCsv(await readFile(file));let imported=0,unconfirmed=0;
  for(const [index,row] of rows.entries()){
    const productId=cleanProductId(row.productId||row["Product-ID"]||row["Produkt-ID"]||row.idProduct);
    const fallback={name:row.Name||row.name||row.Kartenname||row.Karte||"",set:row.Set||row.set||"",collectorNumber:row.Setcode||row.Setnummer||row.collectorNumber||"",rarity:row.Seltenheit||row.rarity||""};
    const product=productId?resolveProduct(productId,fallback):fallback;const confirmed=Boolean(productId);
    analysis.items.push({id:uid(),productId:confirmed?productId:"",name:product.name||fallback.name||`CSV-Zeile ${index+2}`,germanName:product.germanName||"",englishName:product.englishName||"",set:product.set||fallback.set||"",setName:product.setName||"",collectorNumber:product.collectorNumber||fallback.collectorNumber||"",rarity:product.rarity||fallback.rarity||"",quantity:Math.max(1,Math.round(Number(row.Menge||row.quantity||1))),condition:String(row.Zustand||row.condition||"UNBEKANNT").toUpperCase(),language:String(row.Sprache||row.language||""),printConfidence:confirmed?"confirmed":"unknown",printCandidates:[],note:"CSV-Import · unbestätigte Zuordnung bleibt offen",sourceRow:index+2});imported++;if(!confirmed)unconfirmed++;
  }
  calculateCollectionAnalysis(analysis);saveState();renderAll();alert(`${imported} Position(en) importiert. ${unconfirmed} Position(en) bleiben bewusst als Print unbekannt.`);
}

function saveCollectionDecisionSnapshot(actualPurchasePrice=null){
  const analysis=syncCollectionMetadata();if(!analysis)return null;const calculation=calculateCollectionAnalysis(analysis);if(!calculation)return null;
  if(actualPurchasePrice!==null)analysis.actualPurchasePrice=Math.max(0,Number(actualPurchasePrice));
  const snapshot=window.TcgBusinessAutomation.buildCollectionDecisionSnapshot(analysis,calculation,new Date().toISOString());snapshot.id=uid();snapshot.actualPurchasePrice=actualPurchasePrice===null?null:Number(actualPurchasePrice);analysis.decisionSnapshots.push(snapshot);analysis.lastDecisionSnapshotId=snapshot.id;return snapshot;
}

function confirmCollectionPurchase(){
  const analysis=activeCollectionAnalysis();if(!analysis)return;
  if(analysis.linkedPurchaseId){const purchase=state.purchases.find(row=>row.id===analysis.linkedPurchaseId);if(purchase){showView("purchases");openOrderDetails("purchase",purchase.id);}return;}
  syncCollectionMetadata();const calculation=calculateCollectionAnalysis(analysis);if(!calculation?.items?.length){alert("Bitte zuerst Karten erfassen und die Analyse prüfen.");return;}
  const actualText=prompt("Tatsächlich vereinbarter Kartenpreis (€):",Number(analysis.sellerPrice||0).toFixed(2));if(actualText===null)return;const actual=Math.max(0,num(actualText,NaN));if(!Number.isFinite(actual)){alert("Bitte einen gültigen Kaufpreis eingeben.");return;}
  const orderNo=prompt("Bestellnummer oder eigene Ankauf-Referenz:",`SAMMLUNG-${Date.now()}`);if(orderNo===null)return;
  saveCollectionDecisionSnapshot(actual);
  const purchase=window.TcgBusinessAutomation.buildCollectionPurchaseDraft(analysis,calculation,{actualPurchasePrice:actual,purchaseId:uid(),orderNo:orderNo.trim()||`SAMMLUNG-${Date.now()}`,date:todayISO()});
  state.purchases.unshift(purchase);analysis.linkedPurchaseId=purchase.id;analysis.actualPurchasePrice=actual;analysis.confirmedAt=new Date().toISOString();saveState();renderAll();showView("purchases");openOrderDetails("purchase",purchase.id);
}

function demandContext(){
  const stockByProduct={},salesByProduct={};
  state.inventory.filter(item=>!["Verkauft","Storniert"].includes(item.status)).forEach(item=>{const id=cleanProductId(item.productId);if(id)stockByProduct[id]=(stockByProduct[id]||0)+1;});
  state.sales.forEach(sale=>(sale.items||[]).forEach(item=>{const id=cleanProductId(item.productId);if(id)salesByProduct[id]=(salesByProduct[id]||0)+Number(item.quantity||1);}));
  return {stockByProduct,salesByProduct};
}
function exactDemandVariants(record){
  const wanted=[record.name,record.germanName,record.englishName].map(normalizeCardName).filter(Boolean);
  const direct=cleanProductId(record.productId);const products=Object.values(state.productCatalog||{}).filter(product=>direct?cleanProductId(product.productId)===direct:wanted.some(name=>[product.name,product.germanName,product.englishName,product.officialName].map(normalizeCardName).includes(name)));
  return products.length?products:[resolveProduct(direct,record)];
}
function demandRadarRows(){
  const expanded=[];
  (state.demandRadar.records||[]).forEach(record=>exactDemandVariants(record).forEach(product=>{const pricing=TcgBusinessAutomation.calculateAutomaticPriceTargets(product,forwardPricingSettings());expanded.push({...record,...product,productId:cleanProductId(product.productId||record.productId),name:product.name||record.name,germanName:product.germanName||record.germanName,englishName:product.englishName||record.englishName,category:record.category||"Meta-Chance",liveOffer:Number(product.liveOffer||record.liveOffer||0),low:Number(product.low||record.low||0),trend:Number(product.trend||record.trend||0),avg1:Number(product.avg1||record.avg1||0),avg7:Number(product.avg7||record.avg7||0),avg30:Number(product.avg30||record.avg30||0),maxBuy:Number(pricing.maxBuy||0),targetSell:Number(pricing.recommendedSell||0),marketReferenceSource:pricing.marketReferenceSource});}));
  const unique=[...new Map(expanded.map(row=>[`${row.productId}|${normalizeCardName(row.name)}`,row])).values()];
  return TcgBusinessAutomation.scoreDemandRadar(unique,demandContext(),forwardPricingSettings());
}
function renderDemandRadar(){
  const table=document.getElementById("demandRadarTable");if(!table)return;
  const category=document.getElementById("demandCategoryFilter")?.value||"",recommendation=document.getElementById("demandRecommendationFilter")?.value||"",budget=Number(document.getElementById("demandBudgetFilter")?.value||0);
  const all=demandRadarRows();const rows=all.filter(row=>(!category||row.category===category)&&(!recommendation||row.recommendation===recommendation)&&(!budget||!row.maxBuy||row.maxBuy<=budget));
  document.getElementById("demandRadarSummary").innerHTML=`<div><small>Genaue Druckvarianten</small><strong>${rows.length}</strong></div><div><small>Hohe Nachfrage</small><strong class="money-positive">${rows.filter(row=>row.recommendation==="Hohe Nachfrage").length}</strong></div><div><small>Testbestand</small><strong>${rows.filter(row=>row.recommendation==="Testbestand").length}</strong></div><div><small>Hohes Risiko</small><strong class="money-negative">${rows.filter(row=>row.recommendation==="Hohes Risiko").length}</strong></div>`;
  table.innerHTML=rows.length?rows.slice(0,250).map(row=>`<tr><td><a class="card-link" href="${escapeHtml(cardmarketUrl(row))}" target="_blank" rel="noopener"><strong>${escapeHtml(cardDisplayNames(row).primary)}</strong> ↗</a><br><small>${escapeHtml([row.setName||row.set,row.collectorNumber,row.rarity].filter(Boolean).join(" · "))} · CM ${escapeHtml(row.productId||"fehlt")}</small></td><td>${escapeHtml(row.category)}</td><td>${Number(row.appearances||row.frequency||0)} Nennungen${row.tournaments?` / ${Number(row.tournaments)} Decks`:""}<br><small>${row.archetype?escapeHtml(row.archetype):""}</small></td><td>${row.stock} / ${row.ownSales}</td><td>${row.targetSell?`<strong>${money(row.targetSell)}</strong><br><small>${escapeHtml(row.marketReferenceSource||"kurzfristige Referenz")}</small>`:"–"}</td><td>${row.maxBuy?money(row.maxBuy):"–"}<br><small>${row.offerPrice?`Angebot ${money(row.offerPrice)}`:"Angebot noch prüfen"}</small></td><td><strong>${row.score}/100</strong></td><td>${statusBadge(row.recommendation)}<br><small>${escapeHtml(row.reason||`${Math.round(row.metaRate*100)} % Decksignal · ${row.stock} im Bestand · ${row.ownSales} eigene Verkäufe`)}</small>${row.sourceReason?`<br><small>Quelle: ${escapeHtml(row.sourceReason)}</small>`:""}</td></tr>`).join(""):'<tr><td colspan="8" class="empty">Keine passenden Nachfragedaten vorhanden.</td></tr>';
  const source=document.getElementById("demandRadarSource");source.textContent=state.demandRadar.source?`Quelle: ${state.demandRadar.source} · Datenstand ${state.demandRadar.sourceDate||"unbekannt"} · importiert ${state.demandRadar.importedAt?new Date(state.demandRadar.importedAt).toLocaleString("de-DE"):"–"}`:"Noch keine Quelle geladen.";
}
async function importDemandRadarFile(file){
  const text=await file.text();let records=[];
  if(/\.json$/i.test(file.name)){const payload=JSON.parse(text);records=Array.isArray(payload)?payload:payload.cards||payload.records||payload.decklists||[];state.demandRadar.source=payload.source||file.name;state.demandRadar.sourceDate=payload.sourceDate||payload.date||todayISO();}
  else{records=parseCsv(text);state.demandRadar.source=file.name;state.demandRadar.sourceDate=todayISO();}
  state.demandRadar.records=records.map(row=>({productId:cleanProductId(row.productId||row.idProduct),name:row.name||row.card||row.Karte||row.Kartenname||"",germanName:row.germanName||row.nameDe||"",englishName:row.englishName||row.nameEn||"",category:row.category||row.Kategorie||"Meta-Chance",appearances:num(row.appearances??row.frequency??row.Nennungen,0),tournaments:num(row.tournaments??row.sampleSize??row.Decks,1),copies:num(row.copies??row.averageCopies??row.Exemplare,1),archetype:row.archetype||row.Deck||"",risk:row.risk||row.Risiko||"",reason:row.reason||row.Grund||""})).filter(row=>row.name||row.productId);state.demandRadar.importedAt=new Date().toISOString();saveState();renderAll();
}
async function refreshPublicStaples(){
  const button=document.getElementById("refreshStaplesBtn");button.disabled=true;button.textContent="Staples werden geladen …";
  try{const response=await fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php?staple=yes&format=tcg&misc=yes",{cache:"no-store"});if(!response.ok)throw new Error(`HTTP ${response.status}`);const payload=await response.json();state.demandRadar={records:(payload.data||[]).map(card=>({name:card.name,englishName:card.name,category:"Staple",appearances:1,tournaments:1,copies:1,archetype:card.archetype||"",risk:card.banlist_info?.ban_tcg?`Banlist: ${card.banlist_info.ban_tcg}`:"",reason:"Von YGOPRODeck als TCG-Staple geführt"})),source:"YGOPRODeck API v7 · TCG Staples",sourceDate:todayISO(),importedAt:new Date().toISOString()};saveState();renderAll();}
  catch(error){alert(`Staples konnten nicht geladen werden: ${error.message}`);}finally{button.disabled=false;button.textContent="Aktuelle TCG-Staples laden";}
}


function orderItemTable(items=[], kind="purchase", order=null) {
  if(!items.length) return `<div class="empty">Für diese ältere Bestellung sind noch keine Einzelpositionen gespeichert.</div>`;
  const allocations=kind==="purchase"&&order?TcgBusinessAutomation.allocatePurchaseCosts(order,order.costAllocationMethod||"value"):[];
  return `<div class="order-items"><table><thead><tr><th>Menge</th><th>Karte</th><th>Set</th><th>Seltenheit</th><th>Sprache</th><th>Zustand</th><th>Kartenpreis</th>${kind==="purchase"?"<th>Vollständiger EK</th>":""}<th>Gesamt</th>${kind==="purchase"?"<th></th>":""}</tr></thead><tbody>${items.map((item,index)=>{
    const qty=Number(item.quantity||item.amount||1); const price=Number(item.unitPrice||item.price||0);
    const url=cardmarketUrl(item); const names=cardDisplayNames(item);
    const receipt=kind==="purchase"?TcgBusinessAutomation?.normalizePurchaseReceiptLine?.(item,0):null;
    const receiptInfo=receipt&&receipt.assigned?`<small>Geschäft ${receipt.business} · Privat ${receipt.private} · Beschädigt ${receipt.damaged} · Storniert ${receipt.cancelled} · Offen ${receipt.open}</small>`:"";
    const allocation=allocations[index];
    return `<tr><td><strong>${qty}×</strong>${receiptInfo}</td><td><a class="card-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(names.primary)}</strong><span class="external-link">↗</span></a>${names.secondary?`<br><small>Englisch: ${escapeHtml(names.secondary)}</small>`:""}${item.collectorNumber?`<br><small>#${escapeHtml(item.collectorNumber)}</small>`:""}</td><td>${escapeHtml(item.setName||item.set||"-")}</td><td>${escapeHtml(item.rarity||"-")}</td><td>${escapeHtml(item.language||"-")}</td><td>${escapeHtml(item.condition||"-")}</td><td>${money(price)}</td>${kind==="purchase"?`<td><strong>${money(allocation?.unitCost||price)}</strong><br><small>inkl. ${money(allocation?.allocatedShipping||0)} Versand · ${money(allocation?.allocatedExtra||0)} Zusatz</small></td>`:""}<td>${money(qty*price)}</td>${kind==="purchase"?`<td><div class="row-actions"><button type="button" class="icon-button" data-edit-purchase-line="${index}">Korrigieren</button>${!receipt?.assigned?`<button type="button" class="icon-button danger-text" data-delete-purchase-line="${index}">Entfernen</button>`:""}</div></td>`:""}</tr>`;
  }).join("")}</tbody></table></div>`;
}

function saleOrderItemSection(sale,items=[]){
  const stage=String(sale?.workflowStage||sale?.status||"Offen");
  if(stage==="Kommissioniert")return "";
  const initiallyOpen=stage==="Offen";
  return `<details class="order-card-list" ${initiallyOpen?"open":""}><summary>Karten der Bestellung · ${items.reduce((sum,item)=>sum+Math.max(1,Number(item.quantity||1)),0)} Karte(n)</summary>${orderItemTable(items,"sale",sale)}</details>`;
}

function purchaseReceiptHistory(purchase){
  const rows=purchase?.receiptHistory||[];if(!rows.length)return "";
  return `<h3>Wareneingangsverlauf</h3><div class="table-wrap"><table><thead><tr><th>Datum</th><th>Geschäft</th><th>Privat</th><th>Beschädigt</th><th>Storniert</th><th>Noch offen</th><th>Notiz</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${new Date(row.date).toLocaleString("de-DE")}</td><td>${Number(row.totals?.addBusiness||0)>0?`+${Number(row.totals.addBusiness)}`:"–"}</td><td>${Number(row.totals?.addPrivate||0)>0?`+${Number(row.totals.addPrivate)}`:"–"}</td><td>${Number(row.totals?.addDamaged||0)>0?`+${Number(row.totals.addDamaged)}`:"–"}</td><td>${Number(row.totals?.cancelled||0)}</td><td>${Number(row.totals?.open||0)}</td><td>${escapeHtml(row.note||"")}</td></tr>`).join("")}</tbody></table></div>`;
}

function orderWorkflowHistory(order,isPurchase){
  const rows=[...(order.workflowHistory||[])];
  const addDate=(timestamp,field,to,note="")=>{if(timestamp)rows.push({id:`derived-${field}-${timestamp}`,timestamp,field,from:"",to,note,derived:true});};
  addDate(order.paidDate,"Zahlung","Bezahlt");
  if(isPurchase){addDate(order.receivedDate,"Lieferung","Wareneingang",order.trackingNumber?`Sendungsnummer ${order.trackingNumber}`:"");}
  else{addDate(order.packedDate,"Versand","Verpackt");addDate(order.shippedDate,"Versand","Versendet",order.trackingNumber?`Sendungsnummer ${order.trackingNumber}`:"");addDate(order.completedDate,"Vorgang","Abgeschlossen");addDate(order.settledDate,"Abrechnung","Abgerechnet");}
  const unique=new Map(rows.map(row=>[`${row.timestamp}|${row.field}|${row.to}`,row]));
  const sorted=[...unique.values()].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  if(!sorted.length)return "";
  return `<h3>Statusverlauf</h3><div class="table-wrap"><table><thead><tr><th>Zeitpunkt</th><th>Bereich</th><th>Änderung</th><th>Info</th></tr></thead><tbody>${sorted.map(row=>`<tr><td>${new Date(row.timestamp).toLocaleString("de-DE")}</td><td>${escapeHtml(row.field||"Status")}</td><td>${row.from?`${escapeHtml(row.from)} → `:""}${escapeHtml(row.to||"")}</td><td>${escapeHtml(row.note||"")}</td></tr>`).join("")}</tbody></table></div>`;
}

function openOrderDetails(kind,id) {
  const purchase=kind==="purchase" ? state.purchases.find(x=>x.id===id) : null;
  const sale=kind==="sale" ? state.sales.find(x=>x.id===id) : null;
  const order=purchase||sale; if(!order) return;
  const isPurchase=!!purchase;
  const items=isPurchase ? (purchase.pendingItems||[]) : (sale.items||[]);
  const subtotal=isPurchase ? Number(order.cardValue||0) : Number(order.cardValue||items.reduce((sum,i)=>sum+Number(i.quantity||1)*Number(i.unitPrice||i.price||0),0));
  const shipping=Number(order.shipping||order.shippingPaid||0);
  const extra=isPurchase ? Number(order.extra||0) : Number(order.fee||calculateSaleProfit(order).fee||0);
  const total=isPurchase ? Math.max(0,subtotal+shipping+extra-Number(order.refund||0)) : Number(order.revenue||subtotal+shipping);
  const partner=isPurchase ? order.seller : order.customer;
  const calc=isPurchase?null:calculateSaleProfit(order);
  const dialog=document.getElementById("orderDetailDialog");
  if(dialog.open)dialog.close();
  document.getElementById("orderDetailTitle").textContent=`${isPurchase?"Einkauf":"Verkauf"} #${order.orderNo||"-"}`;
  const ownership=isPurchase?purchaseOwnershipTotals(purchase):null;
  const purchaseAssets=isPurchase?state.inventory.filter(item=>item.purchaseId===purchase.id).map(item=>({...item,marketValue:inventoryGroupPricing({ids:[item.id],first:item,quantity:1}).suggestedSell})):[];
  const performance=isPurchase?TcgBusinessAutomation.summarizePurchasePerformance(purchase,purchaseAssets,state.sales):null;
  const paymentStatus=order.status==="Storniert"?"Storniert":order.paymentStatus||(isPurchase?"Bezahlt":order.status==="Offen"?"Offen":"Bezahlt");
  document.getElementById("orderDetailContent").innerHTML=`
    <div class="order-summary-grid">
      <div><small>Bestellnummer</small><strong>${escapeHtml(order.orderNo||"-")}</strong></div>
      <div><small>Datum</small><strong>${fmtDate(order.date)||"-"}</strong></div>
      <div><small>${isPurchase?"Händler":"Kunde"}</small><strong>${escapeHtml(partner||"-")}</strong></div>
      <div><small>${isPurchase?"Lieferstatus":"Vorgangsstatus"}</small><strong>${statusBadge(order.status)}</strong></div>
      <div><small>Zahlung</small><strong>${statusBadge(paymentStatus)}</strong></div>
      ${!isPurchase?`<div><small>Abrechnung</small><strong>${statusBadge(order.settlementStatus||(order.status==="Abgerechnet"?"Abgerechnet":"Offen"))}</strong></div>`:""}
      ${order.trackingNumber?`<div><small>Sendungsnummer</small><strong>${escapeHtml(order.trackingNumber)}</strong></div>`:""}
      <div><small>Karten</small><strong>${Number(order.items||order.quantity||items.reduce((a,i)=>a+Number(i.quantity||1),0))}</strong></div>
      <div><small>Kartenwert</small><strong>${money(subtotal)}</strong></div>
      <div><small>Versand vom Käufer / Versand</small><strong>${money(shipping)}</strong></div>
      <div><small>${isPurchase?"Trustee/Zusatz":"Cardmarket-Gebühr"}</small><strong>${money(extra)}</strong></div>
      ${isPurchase?`<div><small>Gutschrift</small><strong>${money(order.refund||0)}</strong></div><div><small>Bezahlt gesamt</small><strong>${money(total)}</strong></div><div><small>Geschäftlicher Einstand</small><strong>${money(Number(ownership.business||0)+Number(ownership.damaged||0))}</strong></div><div><small>Privater Einstand</small><strong>${money(ownership.private||0)}</strong></div><div><small>Noch nicht aufgeteilt</small><strong>${money(ownership.open||0)}</strong></div>`:`<div><small>Einstand</small><strong>${calc.costKnown?money(order.cost):"Nicht geklärt"}</strong>${order.historicalCostStatus==="unknown"?'<small>bewusst als unbekannt bestätigt</small>':order.historicalCostStatus==="confirmed"?'<small>historisch manuell bestätigt</small>':""}</div><div><small>Erstattung</small><strong>${money(order.refund||0)}</strong></div><div><small>Porto</small><strong>${money(calc.postage)}</strong></div><div><small>Material</small><strong>${money(calc.packaging)}</strong></div><div><small>Gewinn</small>${calc.profitKnown===false?'<strong class="muted">Nicht berechenbar</strong><small>Einstand fehlt oder ist unbekannt</small>':`<strong class="${calc.profit>=0?'money-positive':'money-negative'}">${money(calc.profit)}</strong>`}</div>`}
    </div>
    <div class="order-detail-actions">${isPurchase?`<button type="button" class="primary" id="openPurchaseReceiptBtn">Wareneingang aufteilen</button><button type="button" class="secondary" id="addPurchaseLineBtn">Karte hinzufügen</button><button type="button" class="secondary" id="scanPurchaseLineBtn">Mit iPhone scannen</button>`:`<button type="button" class="secondary" id="openSaleAllocationBtn">Einkaufsexemplare zuordnen</button><button type="button" class="primary" id="repairSaleCostBtn">Wareneinsatz klären</button><button type="button" class="secondary" id="addSaleLineBtn">Karte hinzufügen</button><button type="button" class="secondary" id="scanSaleLineBtn">Mit iPhone scannen</button>`}</div>
    ${isPurchase?`<h3>Wirtschaftlichkeit dieser Bestellung</h3><div class="order-summary-grid"><div><small>Verkauft / Rest</small><strong>${performance.sold} / ${performance.available+performance.reserved}</strong></div><div><small>Realisierter Kartenumsatz</small><strong>${money(performance.realizedRevenue)}</strong></div><div><small>Realisierter Kartengewinn</small><strong class="${performance.realizedProfit>=0?"money-positive":"money-negative"}">${money(performance.realizedProfit)}</strong></div><div><small>Gebundenes Kapital</small><strong>${money(performance.tiedCapital)}</strong></div><div><small>Aktueller Marktwert Rest</small><strong>${money(performance.currentMarketValue)}</strong></div><div><small>Prognose Gesamtgewinn</small><strong class="${performance.projectedTotalProfit>=0?"money-positive":"money-negative"}">${money(performance.projectedTotalProfit)}</strong></div></div>`:""}
    ${isPurchase?orderItemTable(items,kind,purchase):saleOrderItemSection(sale,items)}
    ${isPurchase?purchaseReceiptHistory(purchase):""}
    ${!isPurchase?saleMaterialEditor(order):""}
    ${orderWorkflowHistory(order,isPurchase)}
    ${order.note?`<div class="order-note"><strong>Notiz</strong><p>${escapeHtml(order.note)}</p></div>`:""}`;
  dialog.dataset.saleId=sale?.id||"";dialog.dataset.purchaseId=purchase?.id||"";
  showDialogSafely(dialog);
}

function renderPartners() {
  ensurePartnerRecords();
  document.getElementById("partnerSellerCount").textContent = state.sellers.length;
  document.getElementById("partnerCustomerCount").textContent = state.customers.length;
  document.getElementById("partnerPurchaseVolume").textContent = money(state.purchases.reduce((sum,p)=>sum+Number(p.cardValue||0)+Number(p.shipping||0)+Number(p.extra||0),0));
  document.getElementById("partnerCustomerRevenue").textContent = money(state.sales.reduce((sum,s)=>sum+Number(s.revenue||0),0));

  document.getElementById("sellerTable").innerHTML = state.sellers.length ? state.sellers.map(s=>{
    const st=sellerStats(s);
    const status=s.blocked?"Gesperrt":s.favorite?"Favorit":(s.status||"Aktiv");
    return `<tr>
      <td><strong>${escapeHtml(s.cardmarketName||s.name)}</strong>${s.realName?`<br><small>${escapeHtml(s.realName)}</small>`:""}</td>
      <td>${escapeHtml(s.country||"")}</td><td>${statusBadge(status)}</td><td>${st.orders.length}</td><td>${st.cards}</td>
      <td>${money(st.total)}</td><td>${money(st.avgShipping)}</td><td>${escapeHtml(s.rating||"-")}</td>
      <td><div class="row-actions"><button class="icon-button" data-show-seller="${s.id}">Details</button><button class="icon-button" data-edit-seller="${s.id}">Bearbeiten</button><button class="icon-button danger-text" data-delete-seller="${s.id}">Löschen</button></div></td>
    </tr>`;
  }).join("") : `<tr><td colspan="9" class="empty">Noch keine Händler</td></tr>`;

  document.getElementById("customerTable").innerHTML = state.customers.length ? state.customers.map(c=>{
    const st=customerStats(c);
    const status=c.blocked?"Gesperrt":c.favorite?"Favorit":(c.status||"Aktiv");
    return `<tr>
      <td><strong>${escapeHtml(c.cardmarketName||c.name)}</strong>${c.realName?`<br><small>${escapeHtml(c.realName)}</small>`:""}</td>
      <td>${escapeHtml(c.country||"")}</td><td>${statusBadge(status)}</td><td>${st.orders.length}</td><td>${st.cards}</td>
      <td>${money(st.revenue)}</td><td class="${st.profit>=0?"money-positive":"money-negative"}">${money(st.profit)}</td><td>${escapeHtml(c.rating||"-")}</td>
      <td><div class="row-actions"><button class="icon-button" data-show-customer="${c.id}">Details</button><button class="icon-button" data-edit-customer="${c.id}">Bearbeiten</button><button class="icon-button danger-text" data-delete-customer="${c.id}">Löschen</button></div></td>
    </tr>`;
  }).join("") : `<tr><td colspan="9" class="empty">Noch keine Kunden</td></tr>`;
}

function showSellerDetails(id) {
  const s=state.sellers.find(x=>x.id===id); if(!s) return;
  const st=sellerStats(s);
  const recent=[...st.orders].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
  document.getElementById("sellerDetail").classList.remove("empty");
  document.getElementById("sellerDetail").innerHTML=`
    <h3>${escapeHtml(s.cardmarketName||s.name)}</h3><small>${escapeHtml(s.realName||"")} ${s.country?`· ${escapeHtml(s.country)}`:""}</small>
    <div class="partner-meta">${statusBadge(s.blocked?"Gesperrt":s.favorite?"Favorit":s.status||"Aktiv")} ${s.language?`<span class="badge blue">${escapeHtml(s.language)}</span>`:""}</div>
    <div class="partner-detail-grid">
      <div><small>Bestellungen</small><strong>${st.orders.length}</strong></div><div><small>Karten</small><strong>${st.cards}</strong></div><div><small>Gesamtvolumen</small><strong>${money(st.total)}</strong></div>
      <div><small>Ø Versand</small><strong>${money(st.avgShipping)}</strong></div><div><small>Erste Bestellung</small><strong>${fmtDate(st.first)||"-"}</strong></div><div><small>Letzte Bestellung</small><strong>${fmtDate(st.last)||"-"}</strong></div>
    </div>
    <div class="partner-history"><h4>Letzte Bestellungen</h4><div class="list">${recent.length?recent.map(p=>`<div class="list-row"><div><strong>${escapeHtml(p.orderNo)}</strong><br><small>${fmtDate(p.date)} · ${Number(p.items||0)} Karten</small></div><strong>${money(Number(p.cardValue||0)+Number(p.shipping||0)+Number(p.extra||0))}</strong></div>`).join(""):'<div class="empty">Keine Bestellungen</div>'}</div></div>
    ${s.note?`<div class="partner-note">${escapeHtml(s.note)}</div>`:""}`;
}

function showCustomerDetails(id) {
  const c=state.customers.find(x=>x.id===id); if(!c) return;
  const st=customerStats(c);
  const recent=[...st.orders].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
  document.getElementById("customerDetail").classList.remove("empty");
  document.getElementById("customerDetail").innerHTML=`
    <h3>${escapeHtml(c.cardmarketName||c.name)}</h3><small>${escapeHtml(c.realName||"")} ${c.country?`· ${escapeHtml(c.country)}`:""}</small>
    <div class="partner-meta">${statusBadge(c.blocked?"Gesperrt":c.favorite?"Favorit":c.status||"Aktiv")} ${c.language?`<span class="badge blue">${escapeHtml(c.language)}</span>`:""}</div>
    <div class="partner-detail-grid">
      <div><small>Bestellungen</small><strong>${st.orders.length}</strong></div><div><small>Karten</small><strong>${st.cards}</strong></div><div><small>Umsatz</small><strong>${money(st.revenue)}</strong></div>
      <div><small>Gewinn</small><strong class="${st.profit>=0?"money-positive":"money-negative"}">${money(st.profit)}</strong></div><div><small>Ø Bestellwert</small><strong>${money(st.avgOrder)}</strong></div><div><small>Letzter Kauf</small><strong>${fmtDate(st.last)||"-"}</strong></div>
    </div>
    <div class="partner-history"><h4>Letzte Verkäufe</h4><div class="list">${recent.length?recent.map(s=>`<div class="list-row"><div><strong>${escapeHtml(s.orderNo)}</strong><br><small>${fmtDate(s.date)} · ${Number(s.quantity||0)} Karten</small></div><strong>${money(s.revenue)}</strong></div>`).join(""):'<div class="empty">Keine Verkäufe</div>'}</div></div>
    ${c.note?`<div class="partner-note">${escapeHtml(c.note)}</div>`:""}`;
}

function renderImports() {
  const el = document.getElementById("importHistoryTable");
  if (!el) return;
  const labels = {inventory:"Bestand", purchase:"Einkauf", sale:"Verkauf", prices:"Preise", watchlist:"Watchlist", seller:"Händler", customer:"Kunden", backup:"Backup",settlement:"Cardmarket-Abrechnung",productCatalog:"Produktkatalog",cardmarketBackup:"Cardmarket-Datensicherung"};
  const undoTypes=new Set(["inventory","purchase","sale","watchlist","seller","customer","settlement"]);
  const rows = [...state.imports].sort((a,b)=>new Date(b.date)-new Date(a.date));
  el.innerHTML = rows.length ? rows.map(i=>`<tr>
    <td>${fmtDate(i.date)}</td><td>${escapeHtml(labels[i.type]||i.type)}</td><td>${escapeHtml(i.file||"")}</td>
    <td>${Number(i.rows||0)}</td><td>${Number(i.cards||0)}</td><td>${escapeHtml(i.key||"")}</td>
    <td class="actions">${undoTypes.has(i.type)&&i.mode!=="update"?`<button class="icon-button danger-text" data-delete-import="${i.id}">Rückgängig</button>`:""}<button class="icon-button" data-remove-import-history="${i.id}">Aus Historie entfernen</button></td>
  </tr>`).join("") : `<tr><td colspan="7" class="empty">Noch keine Importe</td></tr>`;
}

function removeImportHistory(id){
  const rec=state.imports.find(x=>x.id===id);
  if(!rec) return;
  if(!confirm(`Import „${rec.file||rec.key||""}“ nur aus der Historie entfernen? Die importierten Daten bleiben erhalten.`)) return;
  state.imports=state.imports.filter(x=>x.id!==id);
  saveState();renderAll();
}

function renderReports() {
  const from=document.getElementById("reportDateFrom")?.value||"",to=document.getElementById("reportDateTo")?.value||"";
  const inPeriod=value=>{const date=String(value||"").slice(0,10);return (!from||date>=from)&&(!to||date<=to);};
  const financial=window.TcgBusinessAutomation?.buildFinancialSummary?.(state,{from,to})||{entries:[],cashIn:0,cashOut:0,cashflow:0,realizedRevenue:0,directCost:0,realizedProfit:0,overhead:0,operatingResult:0};
  const realizedSales=state.sales.filter(s=>["Abgeschlossen","Abgerechnet","Erstattet","Rückgabe eingetroffen"].includes(s.status)&&inPeriod(s.completedDate||s.settledDate||s.date));
  const soldInv = state.inventory.filter(i=>i.status==="Verkauft" && i.saleDate&&inPeriod(i.saleDate));
  document.getElementById("rCashIn").textContent=money(financial.cashIn);
  document.getElementById("rCashOut").textContent=money(financial.cashOut);
  document.getElementById("rCashflow").textContent=money(financial.cashflow);document.getElementById("rCashflow").className=financial.cashflow>=0?"money-positive":"money-negative";
  document.getElementById("rRevenue").textContent = money(financial.realizedRevenue);
  document.getElementById("rProfit").textContent = money(financial.realizedProfit);document.getElementById("rProfit").className=financial.realizedProfit>=0?"money-positive":"money-negative";
  document.getElementById("rOperatingResult").textContent=money(financial.operatingResult);document.getElementById("rOperatingResult").className=financial.operatingResult>=0?"money-positive":"money-negative";
  document.getElementById("rRoi").textContent = pct(financial.directCost?financial.realizedProfit/financial.directCost*100:0);
  document.getElementById("rDays").textContent = `${soldInv.length?Math.round(soldInv.reduce((a,i)=>a+daysBetween(i.purchaseDate,i.saleDate),0)/soldInv.length):0} Tage`;

  const months={};
  financial.entries.forEach(entry=>{const key=(entry.date||"").slice(0,7)||"Ohne Datum";months[key]||={cashflow:0,realized:0,overhead:0};months[key].cashflow+=Number(entry.cashIn||0)-Number(entry.cashOut||0);months[key].realized+=Number(entry.realizedProfit||0);months[key].overhead+=Number(entry.overhead||0);});
  document.getElementById("monthlyReport").innerHTML = Object.keys(months).length ? `<div class="table-wrap"><table><thead><tr><th>Monat</th><th>Cashflow</th><th>Realisierter Gewinn</th><th>Betriebsergebnis</th></tr></thead><tbody>${Object.entries(months).sort().map(([key,value])=>`<tr><td>${escapeHtml(key)}</td><td class="${value.cashflow>=0?"money-positive":"money-negative"}">${money(value.cashflow)}</td><td class="${value.realized>=0?"money-positive":"money-negative"}">${money(value.realized)}</td><td class="${value.realized-value.overhead>=0?"money-positive":"money-negative"}">${money(value.realized-value.overhead)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">Noch keine Daten</div>`;

  const performance=window.TcgBusinessAutomation?.buildPerformanceReport(state,{from,to})||{cards:[]};
  document.getElementById("topCardsReport").innerHTML = performance.cards.length ? `<div class="list">${performance.cards.slice(0,8).map(row=>`<div class="list-row"><span>${escapeHtml(row.name)}</span><strong>${money(row.profit)}</strong></div>`).join("")}</div>` : `<div class="empty">Noch keine Daten</div>`;

  const slow=[...state.inventory].filter(i=>!["Verkauft","Storniert"].includes(i.status)).sort((a,b)=>daysBetween(b.purchaseDate)-daysBetween(a.purchaseDate)).slice(0,8);
  document.getElementById("slowCardsReport").innerHTML = slow.length ? `<div class="list">${slow.map(i=>`<div class="list-row"><span>${escapeHtml(i.name)}</span><strong>${daysBetween(i.purchaseDate)} Tage</strong></div>`).join("")}</div>` : `<div class="empty">Noch keine Daten</div>`;

  const sellers={};
  state.purchases.filter(p=>inPeriod(p.paidDate||p.date)).forEach(p=>{const k=p.seller||"Unbekannt"; sellers[k]??={orders:0,total:0}; sellers[k].orders++; sellers[k].total+=purchaseBusinessCost(p);});
  document.getElementById("sellerReport").innerHTML = Object.keys(sellers).length ? `<div class="list">${Object.entries(sellers).sort((a,b)=>b[1].orders-a[1].orders).map(([k,v])=>`<div class="list-row"><div><span>${escapeHtml(k)}</span><br><small>${v.orders} Bestellungen</small></div><strong>${money(v.total)}</strong></div>`).join("")}</div>` : `<div class="empty">Noch keine Daten</div>`;
  renderAdvancedPerformanceReport(performance);
  renderBusinessHealth();
  renderSettlementReport();
  renderTradeDatabaseInsights();
}

function exportFinancialReportCsv(){
  const from=document.getElementById("reportDateFrom")?.value||"",to=document.getElementById("reportDateTo")?.value||"";
  const financial=window.TcgBusinessAutomation?.buildFinancialSummary?.(state,{from,to});if(!financial)return;
  const quote=value=>`"${String(value??"").replaceAll('"','""')}"`;
  const number=value=>Number(value||0).toFixed(2).replace(".",",");
  const header=["Datum","Kategorie","Beschreibung","Geldeingang","Geldausgang","Realisierter Umsatz","Direkte Kosten","Realisierter Gewinn","Allgemeine Betriebsausgabe","Quelle-ID"];
  const lines=[header,...financial.entries.map(row=>[row.date,row.category,row.label,number(row.cashIn),number(row.cashOut),number(row.realizedRevenue),number(row.directCost),number(row.realizedProfit),number(row.overhead),row.sourceId])];
  downloadTextFile(`TCG_Finanzbericht_${from||"Anfang"}_${to||todayISO()}.csv`,`\uFEFF${lines.map(row=>row.map(quote).join(";")).join("\r\n")}`);
}

function renderAdvancedPerformanceReport(report=window.TcgBusinessAutomation?.buildPerformanceReport(state)) {
  const target=document.getElementById("advancedPerformanceReport");if(!target||!report)return;
  const rows=report[activePerformanceReport]||[];
  document.querySelectorAll("[data-performance-report]").forEach(button=>button.classList.toggle("active",button.dataset.performanceReport===activePerformanceReport));
  if(activePerformanceReport==="stockAge"){
    target.innerHTML=`<table class="advanced-report-table"><thead><tr><th>Karte / Druck</th><th>Bestand</th><th>Kapital</th><th>Ø Alter</th><th>Älteste Karte</th></tr></thead><tbody>${rows.length?rows.slice(0,100).map(row=>`<tr><td><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml([row.set,row.rarity].filter(Boolean).join(" · "))}</small></td><td>${row.quantity}</td><td>${money(row.value)}</td><td>${row.averageDays} Tage</td><td><strong>${row.oldestDays} Tage</strong></td></tr>`).join(""):`<tr><td colspan="5" class="empty">Kein aktiver Bestand vorhanden.</td></tr>`}</tbody></table>`;
    return;
  }
  if(activePerformanceReport==="sellers"){
    target.innerHTML=`<table class="advanced-report-table"><thead><tr><th>Verkäufer</th><th>Bestellungen</th><th>Karten</th><th>Einkaufsvolumen</th><th>Ø Bestellung</th></tr></thead><tbody>${rows.length?rows.slice(0,100).map(row=>`<tr><td><strong>${escapeHtml(row.name)}</strong></td><td>${row.orders}</td><td>${row.cards}</td><td>${money(row.cost)}</td><td>${money(row.averageOrder)}</td></tr>`).join(""):`<tr><td colspan="5" class="empty">Noch keine Einkäufe vorhanden.</td></tr>`}</tbody></table>`;
    return;
  }
  const title=activePerformanceReport==="sets"?"Set":activePerformanceReport==="customers"?"Kunde":"Karte";
  target.innerHTML=`<table class="advanced-report-table"><thead><tr><th>${title}</th><th>Aufträge</th><th>Karten</th><th>Umsatz</th><th>Wareneinsatz</th><th>Gewinn</th><th>ROI</th></tr></thead><tbody>${rows.length?rows.slice(0,100).map(row=>`<tr><td><strong>${escapeHtml(row.name)}</strong></td><td>${row.orders}</td><td>${row.cards}</td><td>${money(row.revenue)}</td><td>${money(row.cost)}</td><td class="${row.profit>=0?"money-positive":"money-negative"}"><strong>${money(row.profit)}</strong></td><td>${pct(row.roi)}</td></tr>`).join(""):`<tr><td colspan="7" class="empty">Noch keine abgeschlossenen Geschäftsdaten vorhanden.</td></tr>`}</tbody></table>`;
}

function businessHealthRows() {
  if(!window.TcgBusinessAutomation)return [];
  return [...TcgBusinessAutomation.buildDataQualityIssues(state),...TcgBusinessAutomation.buildPriceAlerts(state)];
}

function renderBusinessHealth(force=false) {
  const summary=document.getElementById("businessHealthSummary");
  const target=document.getElementById("businessHealthIssues");
  if(!summary||!target||!window.TcgBusinessAutomation)return;
  const issues=businessHealthRows();
  const errors=issues.filter(row=>row.severity==="error").length;
  const warnings=issues.filter(row=>row.severity==="warning").length;
  const status=businessHealthDatabaseStatus||{};
  summary.innerHTML=`<div><span>Kritische Hinweise</span><strong>${errors}</strong></div><div><span>Zu prüfen</span><strong>${warnings}</strong></div><div><span>Automatische Sicherungen</span><strong>${Number(status.backupCount||0)}</strong><small>${status.latestBackupAt?`zuletzt ${new Date(status.latestBackupAt).toLocaleString("de-DE")}`:"nach dem nächsten Speichern"}</small></div><div><span>SQLite</span><strong>${status.ready?"bereit":"wird geprüft"}</strong><small>${Number(status.eventCount||0).toLocaleString("de-DE")} protokollierte Änderungen</small></div>`;
  target.innerHTML=issues.length?`<div class="business-health-list">${issues.slice(0,100).map(row=>businessIssueButton(row,true)).join("")}</div>`:`<div class="success"><strong>Datenprüfung bestanden</strong><br>Keine auffälligen Duplikate, Kalkulationslücken oder Preisrisiken gefunden.</div>`;
  if(window.desktopApp?.getTradeDatabaseStatus&&(force||!businessHealthDatabaseStatus)&&!businessHealthStatusPromise){
    businessHealthStatusPromise=window.desktopApp.getTradeDatabaseStatus().then(next=>{businessHealthDatabaseStatus=next;renderBusinessHealth(false);}).catch(error=>console.error("Sicherungsstatus konnte nicht gelesen werden:",error)).finally(()=>businessHealthStatusPromise=null);
  }
}

function renderSettlementReport() {
  const target=document.getElementById("settlementReport");if(!target)return;
  const records=[...(state.reconciliations||[])].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!records.length){target.innerHTML='<div class="empty">Noch keine Cardmarket-Abrechnung importiert. Der Import erfolgt sicher über „Importe“.</div>';return;}
  const latest=records[0];
  target.innerHTML=`<div class="settlement-summary"><div><span>Datei</span><strong>${escapeHtml(latest.file||"Abrechnung")}</strong><small>${fmtDate(latest.date)}</small></div><div><span>Zugeordnet</span><strong>${Number(latest.matched||0)}</strong></div><div><span>Nicht zugeordnet</span><strong>${Number(latest.unmatched||0)}</strong></div><div><span>Abweichung</span><strong class="${Math.abs(Number(latest.difference||0))<0.02?"money-positive":"money-negative"}">${money(latest.difference)}</strong></div></div><div class="table-wrap"><table><thead><tr><th>Zeile</th><th>Datum</th><th>Bestellung</th><th>Buchung</th><th>Erwartet nach Gebühr</th><th>Abweichung</th><th>Status</th></tr></thead><tbody>${(latest.entries||[]).slice(0,100).map(row=>`<tr><td>${row.row}</td><td>${escapeHtml(row.date||"–")}</td><td>${escapeHtml(row.orderNo||"–")}</td><td>${money(row.amount)}</td><td>${row.matchedSaleId?money(row.expectedPayout):"–"}</td><td class="${Math.abs(Number(row.difference||0))<0.02?"money-positive":"money-negative"}">${row.matchedSaleId?money(row.difference):"–"}</td><td>${statusBadge(row.matchedSaleId?(Math.abs(Number(row.difference||0))<0.02?"Passend":"Abweichung"):"Nicht zugeordnet")}</td></tr>`).join("")}</tbody></table></div>`;
}

function paintTradeDatabaseInsights(data) {
  const summary=document.getElementById("tradeDatabaseSummary");
  const table=document.getElementById("tradeRecommendationTable");
  const events=document.getElementById("businessEventList");
  if(!summary||!table||!events)return;
  const status=data?.status||{};
  const sources=Array.isArray(status.dataSources)?status.dataSources:[];
  const priceGuide=sources.find(source=>source.sourceId==="cardmarket_price_guide");
  const api=sources.find(source=>source.sourceId==="cardmarket_api");
  summary.innerHTML=`
    <div><span>Handelsaufträge</span><strong>${Number(status.orderCount||0).toLocaleString("de-DE")}</strong></div>
    <div><span>Kartengenaue Zeilen</span><strong>${Number(status.tradeLineCount||0).toLocaleString("de-DE")}</strong></div>
    <div><span>Wareneingangszeilen</span><strong>${Number(status.purchaseReceiptLineCount||0).toLocaleString("de-DE")}</strong></div>
    <div><span>Geschäft / Privat</span><strong>${Number(status.businessAssetCount||0).toLocaleString("de-DE")} / ${Number(status.privateAssetCount||0).toLocaleString("de-DE")}</strong></div>
    <div><span>Änderungsereignisse</span><strong>${Number(status.eventCount||0).toLocaleString("de-DE")}</strong></div>
    <div><span>Marktbeobachtungen</span><strong>${Number(status.marketObservationCount||0).toLocaleString("de-DE")}</strong></div>
    <div><span>Price Guide</span><strong>${priceGuide?.enabled?"aktiv":"inaktiv"}</strong><small>${status.latestMarketDate?`Stand ${fmtDate(status.latestMarketDate)}`:"noch ohne Daten"}</small></div>
    <div><span>Cardmarket API</span><strong>${api?.enabled?"aktiv":"vorbereitet"}</strong><small>${api?.enabled?"Quelle eingeschaltet":"wartet auf API-Zugang"}</small></div>`;
  const recommendations=data?.recommendations?.recommendations||[];
  table.innerHTML=recommendations.length?recommendations.map(row=>{
    const confidenceLabel={high:"hoch",medium:"mittel",low:"niedrig"}[row.confidenceLevel]||"niedrig";
    const names=cardDisplayNames({productId:row.productId,name:row.name,englishName:row.englishName});
    return `<tr>
      <td><strong>${escapeHtml(names.primary)}</strong>${names.secondary?`<small>${escapeHtml(names.secondary)}</small>`:""}<small>CM ${escapeHtml(row.productId)}${row.setName?` · ${escapeHtml(row.setName)}`:""}${row.rarity?` · ${escapeHtml(row.rarity)}`:""}</small></td>
      <td>${Number(row.buySampleCount||0)} EK / ${Number(row.sellSampleCount||0)} VK<small>${Number(row.marketSampleCount||0)} Marktstände</small></td>
      <td>${row.ownBuyAverage?money(row.ownBuyAverage):"–"}</td>
      <td>${row.ownSellAverage?money(row.ownSellAverage):"–"}</td>
      <td><strong>${row.recommendedBuy?money(row.recommendedBuy):"–"}</strong></td>
      <td><strong>${row.recommendedSell?money(row.recommendedSell):"–"}</strong><small>${row.quickSell?`Schnell ${money(row.quickSell)}`:""}${row.priceFloor?` · ROI-Ziel ${money(row.priceFloor)}`:""}${row.profitableAtMarket===false?' · nicht rentabel':""}</small></td>
      <td><span class="trade-confidence ${escapeHtml(row.confidenceLevel)}">${confidenceLabel} · ${Math.round(Number(row.confidenceScore||0))}%</span><small title="${escapeHtml((row.explanation||[]).join(" · "))}">${escapeHtml((row.explanation||[])[0]||"Weitere Daten erforderlich")}</small></td>
    </tr>`;
  }).join(""):`<tr><td colspan="7" class="empty">Noch keine kartengenauen Ein- oder Verkäufe vorhanden. Produkt-IDs in Importen und Bestandskarten bilden automatisch die Datenbasis.</td></tr>`;
  const labels={purchase:"Einkauf",sale:"Verkauf",inventory:"Bestand",private_inventory:"Privatsammlung",settlement:"Abrechnung",capital_account:"Kapitalkonto",capital_entry:"Kapitalbuchung",settings:"Einstellungen"};
  const actions={baseline:"Ausgangsstand",create:"erstellt",update:"geändert",delete:"gelöscht"};
  const eventRows=Array.isArray(data?.events)?data.events:[];
  events.innerHTML=eventRows.length?`<div class="trade-event-list">${eventRows.map(row=>`<div class="trade-event-row"><div><strong>${escapeHtml(labels[row.entityType]||row.entityType)} ${escapeHtml(row.entityId)}</strong> <span class="muted">${escapeHtml(actions[row.eventType]||row.eventType)}</span>${row.changedFields?.length?`<small>Felder: ${escapeHtml(row.changedFields.slice(0,6).join(", "))}${row.changedFields.length>6?" …":""}</small>`:""}</div><small>${new Date(row.occurredAt).toLocaleString("de-DE")}</small></div>`).join("")}</div>`:`<div class="empty">Noch keine Änderungen protokolliert.</div>`;
}

async function renderTradeDatabaseInsights(force=false) {
  if(!window.desktopApp?.getTradeDatabaseStatus)return;
  if(!force&&tradeInsightsCache&&Date.now()-tradeInsightsCache.loadedAt<5000){paintTradeDatabaseInsights(tradeInsightsCache);return;}
  if(tradeInsightsPromise)return tradeInsightsPromise;
  tradeInsightsPromise=(async()=>{
    try{
      const [status,recommendations,events]=await Promise.all([
        window.desktopApp.getTradeDatabaseStatus(),
        window.desktopApp.getTradeRecommendations({limit:12}),
        window.desktopApp.getBusinessEvents({limit:8})
      ]);
      tradeInsightsCache={status,recommendations,events,loadedAt:Date.now()};
      paintTradeDatabaseInsights(tradeInsightsCache);
    }catch(error){
      console.error("Handelsdatenbank konnte nicht dargestellt werden:",error);
      const summary=document.getElementById("tradeDatabaseSummary");
      if(summary)summary.innerHTML=`<div class="error">${escapeHtml(error.message)}</div>`;
    }finally{tradeInsightsPromise=null;}
  })();
  return tradeInsightsPromise;
}

function capitalAccountBalances(){
  const balances=new Map((state.capitalAccounts||[]).map(account=>[account.id,0]));
  (state.capitalEntries||[]).filter(entry=>!entry.archived&&balances.has(entry.accountId)).forEach(entry=>{
    balances.set(entry.accountId,balances.get(entry.accountId)+Number(entry.amount||0));
  });
  return balances;
}

function renderCapitalPanel(){
  const summary=document.getElementById("capitalSummary");
  const list=document.getElementById("capitalAccountList");
  if(!summary||!list)return;
  const overview=phase2CapitalOverview();
  const balances=capitalAccountBalances();
  const realized=(state.sales||[]).filter(sale=>["Abgeschlossen","Abgerechnet"].includes(sale.status)).map(calculateSaleProfit).filter(row=>row.profitKnown!==false).reduce((sum,row)=>sum+Number(row.profit||0),0);
  summary.innerHTML=`<div><small>Liquides Handelskapital</small><strong>${money(overview.liquid)}</strong></div><div><small>Bestand zum bekannten EK</small><strong>${money(overview.knownStockCost)}</strong><small>${overview.knownCostCount}/${overview.physicalCards} Exemplare bekannt</small></div><div><small>Aktueller Inseratswert</small><strong>${money(overview.listingValue)}</strong><small>nicht liquide</small></div><div><small>Handelsvermögen zum EK</small><strong>${money(overview.tradingWealthAtCost)}</strong><small>Liquidität + bekannter Bestands-EK</small></div><div><small>Realisierter Gewinn</small><strong>${money(realized)}</strong></div>`;
  const typeLabel={cardmarket:"Cardmarket",bank:"Bank",cash:"Kasse",other:"Sonstiges"};
  list.innerHTML=(state.capitalAccounts||[]).length?`<div class="table-wrap"><table><thead><tr><th>Konto</th><th>Typ</th><th>Stand</th><th>Status</th></tr></thead><tbody>${state.capitalAccounts.map(account=>`<tr><td><strong>${escapeHtml(account.name)}</strong>${account.notes?`<small>${escapeHtml(account.notes)}</small>`:""}</td><td>${escapeHtml(typeLabel[account.type]||"Sonstiges")}</td><td><strong>${money(balances.get(account.id)||0)}</strong></td><td>${account.active===false?"Inaktiv":"Aktiv"}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">Noch kein Handelskonto angelegt. Lege zuerst Cardmarket, Bank, Kasse oder ein anderes Konto mit seinem Startstand an.</div>`;
}

function renderCapitalView(){
  const summary=document.getElementById("capitalPageSummary"),accountsTarget=document.getElementById("capitalPageAccounts"),historyTarget=document.getElementById("capitalPageHistory");
  if(!summary||!accountsTarget||!historyTarget)return;
  const overview=phase2CapitalOverview();
  const labels={cardmarket:"Cardmarket",bank:"Bank",cash:"Kasse",other:"Sonstiges"};
  summary.innerHTML=`
    <div><small>Liquides Handelskapital</small><strong>${money(overview.liquid)}</strong></div>
    <div><small>Cardmarket</small><strong>${money(overview.byType.cardmarket)}</strong></div>
    <div><small>Bank</small><strong>${money(overview.byType.bank)}</strong></div>
    <div><small>Kasse</small><strong>${money(overview.byType.cash)}</strong></div>
    <div><small>Sonstiges</small><strong>${money(overview.byType.other)}</strong></div>
    <div><small>Bekannter Bestands-EK</small><strong>${money(overview.knownStockCost)}</strong><small>${overview.knownCostCount}/${overview.physicalCards} Exemplare mit bekanntem EK</small></div>
    <div><small>Handelsvermögen zum EK</small><strong>${money(overview.tradingWealthAtCost)}</strong><small>Liquidität + bekannter Bestands-EK</small></div>
    <div><small>Inseratswert</small><strong>${money(overview.listingValue)}</strong><small>davon ${money(overview.unknownListingValue)} mit unbekanntem EK · nicht liquide</small></div>`;
  const totals=overview.entryTotals||{};
  summary.innerHTML+=`
    <div><small>Einzahlungen</small><strong>${money(Math.abs(Number(totals.deposit||0)))}</strong></div>
    <div><small>Auszahlungen</small><strong>${money(Math.abs(Number(totals.withdrawal||0)))}</strong></div>
    <div><small>Verkäufe</small><strong>${money(Math.abs(Number(totals.sale||0)))}</strong></div>
    <div><small>Einkäufe</small><strong>${money(Math.abs(Number(totals.purchase||0)))}</strong></div>
    <div><small>Gebühren</small><strong>${money(Math.abs(Number(totals.fee||0)))}</strong></div>
    <div><small>Erstattungen</small><strong>${money(Math.abs(Number(totals.refund||0)))}</strong></div>
    <div><small>Korrekturen</small><strong class="${Number(totals.correction||0)<0?"money-negative":"money-positive"}">${money(Number(totals.correction||0))}</strong></div>
    <div><small>Umbuchungsvolumen</small><strong>${money(Number(totals.transfer||0))}</strong><small>ändert die Gesamtliquidität nicht</small></div>`;
  accountsTarget.innerHTML=overview.accounts.length?`<div class="table-wrap"><table><thead><tr><th>Konto</th><th>Kategorie</th><th>Stand</th><th>Status</th></tr></thead><tbody>${overview.accounts.map(account=>`<tr><td><strong>${escapeHtml(account.name||"Ohne Namen")}</strong>${account.notes?`<br><small>${escapeHtml(account.notes)}</small>`:""}</td><td>${escapeHtml(labels[account.type]||"Sonstiges")}</td><td class="${account.balance<0?"money-negative":""}"><strong>${money(account.balance)}</strong></td><td>${account.active===false?"Inaktiv":"Aktiv"}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">Noch kein Kapitalkonto angelegt. Lege zum Beispiel dein Cardmarket-Guthaben mit dem richtigen Stichtag als Startstand an.</div>`;
  const accountNames=new Map((state.capitalAccounts||[]).map(account=>[account.id,account.name]));
  const typeLabels={opening:"Startstand",deposit:"Einzahlung",withdrawal:"Auszahlung",purchase:"Einkauf bezahlt",sale:"Verkauf erhalten",fee:"Gebühr",refund:"Erstattung",correction:"Korrektur",transfer:"Umbuchung"};
  const entries=[...(state.capitalEntries||[])].filter(entry=>!entry.archived).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||String(b.id||"").localeCompare(String(a.id||"")));
  historyTarget.innerHTML=entries.length?`<div class="table-wrap"><table><thead><tr><th>Datum</th><th>Konto</th><th>Art</th><th>Grund</th><th>Betrag</th></tr></thead><tbody>${entries.map(entry=>`<tr class="${Number(entry.amount||0)<0?"movement-row-negative":"movement-row-positive"}"><td>${fmtDate(entry.date)||"–"}</td><td>${escapeHtml(accountNames.get(entry.accountId)||"Unbekannt")}</td><td>${escapeHtml(typeLabels[entry.type]||entry.type||"Buchung")}</td><td>${escapeHtml(entry.description||"–")}</td><td class="${Number(entry.amount||0)<0?"money-negative":"money-positive"}"><strong>${Number(entry.amount||0)>0?"+":""}${money(entry.amount)}</strong></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">Noch keine Kapitalbuchungen vorhanden.</div>`;
}

function addCapitalAccount(){
  openModal("Handelskonto anlegen",[
    {name:"name",label:"Kontoname",required:true},
    {name:"type",label:"Kontotyp",type:"select",options:[{value:"cardmarket",label:"Cardmarket-Guthaben"},{value:"bank",label:"Bankkonto"},{value:"cash",label:"Kasse / Bargeld"},{value:"other",label:"Sonstiges"}]},
    {name:"openingBalance",label:"Startstand (€)",type:"number",step:"0.01",required:true},
    {name:"date",label:"Stichtag",type:"date",value:todayISO(),required:true},
    {name:"notes",label:"Notiz",full:true}
  ],{},data=>{
    const accountId=uid();
    state.capitalAccounts.push({id:accountId,name:data.name,type:data.type||"other",currency:"EUR",active:true,notes:data.notes||""});
    state.capitalEntries.push({id:uid(),accountId,type:"opening",date:data.date||todayISO(),amount:Number(data.openingBalance||0),description:"Startstand",source:"manual"});
    saveState();renderAll();
  });
}

function addCapitalEntry(){
  if(!(state.capitalAccounts||[]).length){alert("Bitte zuerst ein Handelskonto anlegen.");return;}
  openModal("Kapitalbuchung erfassen",[
    {name:"accountId",label:"Konto",type:"select",options:state.capitalAccounts.filter(a=>a.active!==false).map(a=>({value:a.id,label:a.name}))},
    {name:"type",label:"Buchungsart",type:"select",options:[{value:"deposit",label:"Einzahlung"},{value:"withdrawal",label:"Auszahlung"},{value:"purchase",label:"Einkauf bezahlt"},{value:"sale",label:"Verkauf erhalten"},{value:"fee",label:"Gebühr"},{value:"refund",label:"Erstattung"},{value:"correction",label:"Korrektur (mit Vorzeichen)"}]},
    {name:"amount",label:"Betrag (€)",type:"number",step:"0.01",required:true},
    {name:"date",label:"Datum",type:"date",value:todayISO(),required:true},
    {name:"description",label:"Grund / Notiz",required:true,full:true}
  ],{},data=>{
    const negative=new Set(["withdrawal","purchase","fee"]);
    const entered=Number(data.amount||0);
    const amount=data.type==="correction"?entered:(negative.has(data.type)?-Math.abs(entered):Math.abs(entered));
    state.capitalEntries.push({id:uid(),accountId:data.accountId,type:data.type,date:data.date||todayISO(),amount,description:data.description||"",source:"manual"});
    saveState();renderAll();
  });
}

function addCapitalTransfer(){
  if((state.capitalAccounts||[]).filter(a=>a.active!==false).length<2){alert("Für eine Umbuchung werden zwei aktive Konten benötigt.");return;}
  const options=state.capitalAccounts.filter(a=>a.active!==false).map(a=>({value:a.id,label:a.name}));
  openModal("Kapital umbuchen",[
    {name:"fromAccountId",label:"Von Konto",type:"select",options},
    {name:"toAccountId",label:"Auf Konto",type:"select",options},
    {name:"amount",label:"Betrag (€)",type:"number",step:"0.01",required:true},
    {name:"date",label:"Datum",type:"date",value:todayISO(),required:true},
    {name:"description",label:"Grund / Notiz",full:true}
  ],{},data=>{
    if(data.fromAccountId===data.toAccountId){alert("Bitte zwei verschiedene Konten auswählen.");return false;}
    const amount=Math.abs(Number(data.amount||0));
    if(!amount){alert("Bitte einen Betrag größer als 0 eingeben.");return false;}
    const transferId=uid(),date=data.date||todayISO(),description=data.description||"Umbuchung";
    state.capitalEntries.push({id:uid(),accountId:data.fromAccountId,transferId,type:"transfer",date,amount:-amount,description,source:"manual"});
    state.capitalEntries.push({id:uid(),accountId:data.toAccountId,transferId,type:"transfer",date,amount,description,source:"manual"});
    saveState();renderAll();
  });
}

function renderSettings() {
  document.getElementById("settingFee").value = state.settings.feePercent;
  document.getElementById("settingPackaging").value = state.settings.packaging;
  document.getElementById("settingExpectedCardsPerOrder").value = state.settings.expectedCardsPerOrder ?? 3;
  document.getElementById("settingMinProfit").value = state.settings.minProfit ?? 0;
  document.getElementById("settingMinRoi").value = state.settings.minRoi;
  document.getElementById("settingTargetRoi").value = state.settings.targetRoi ?? 30;
  document.getElementById("settingPriceAge").value = state.settings.priceAgeDays;
  document.getElementById("settingCondition").value = state.settings.condition;
  document.getElementById("settingLanguages").value = state.settings.languages;
  document.getElementById("settingTargetStock").value = state.settings.targetStock;
  document.getElementById("settingSaleAllocationStrategy").value = state.settings.saleAllocationStrategy || "fifo";
  document.getElementById("settingSafetyPercent").value = state.settings.safetyPercent ?? 5;
  document.getElementById("settingThemeMode").value = state.settings.themeMode || "system";
  document.getElementById("settingDensity").value = state.settings.density || "comfortable";
  document.getElementById("settingStartView").value = state.settings.startView || "dashboard";
  document.getElementById("settingQuickSellDiscount").value = state.settings.quickSellDiscount ?? 8;
  document.getElementById("settingStockAgeWarning").value = state.settings.stockAgeWarningDays ?? 90;
  document.getElementById("settingStockAgeCritical").value = state.settings.stockAgeCriticalDays ?? 180;
  document.getElementById("settingPriceGroupA").value = state.settings.priceGroupAFrom ?? 5;
  document.getElementById("settingPriceGroupB").value = state.settings.priceGroupBFrom ?? 1;
  document.getElementById("settingPriceGroupC").value = state.settings.priceGroupCFrom ?? 0.20;
  document.getElementById("settingAgingFresh").value = state.settings.agingFreshMaxDays ?? 14;
  document.getElementById("settingAgingObserve").value = state.settings.agingObserveMaxDays ?? 30;
  document.getElementById("settingAgingReview").value = state.settings.agingReviewMaxDays ?? 45;
  document.getElementById("settingAgingCapital").value = state.settings.agingCapitalMaxDays ?? 60;
  document.getElementById("settingAgingSlow").value = state.settings.agingSlowMaxDays ?? 90;
  document.getElementById("settingMarketTrendStable").value = state.settings.marketTrendStablePercent ?? 3;
  document.getElementById("settingMarketTrendDirectional").value = state.settings.marketTrendDirectionalPercent ?? 6;
  document.getElementById("settingMarketTrendStrong").value = state.settings.marketTrendStrongPercent ?? 15;
  document.getElementById("settingMarketPriceNear").value = state.settings.marketPriceNearPercent ?? 5;
  document.getElementById("settingMarketPriceFar").value = state.settings.marketPriceFarPercent ?? 20;
  document.getElementById("settingScannerEnabled").checked = state.settings.scannerEnabled !== false;
  document.getElementById("settingScannerConfidence").value = state.settings.scannerMinConfidence ?? 80;
  document.getElementById("settingScannerRemember").checked = state.settings.scannerRememberMappings !== false;
  document.getElementById("settingScannerKeepImages").checked = Boolean(state.settings.scannerKeepImages);
  document.getElementById("settingImportReview").checked = state.settings.importReviewRequired !== false;
  document.getElementById("settingArchiveImports").checked = Boolean(state.settings.archiveOriginalImports);
  document.getElementById("settingCollectionClassA").value = state.settings.collectionClassAFrom ?? 10;
  document.getElementById("settingCollectionClassB").value = state.settings.collectionClassBFrom ?? 5;
  document.getElementById("settingCollectionClassC").value = state.settings.collectionClassCFrom ?? 1;
  document.getElementById("settingCollectionClassD").value = state.settings.collectionClassDFrom ?? 0.20;
  document.getElementById("settingCollectionFactorA").value = state.settings.collectionFactorA ?? 60;
  document.getElementById("settingCollectionFactorB").value = state.settings.collectionFactorB ?? 47.5;
  document.getElementById("settingCollectionFactorC").value = state.settings.collectionFactorC ?? 32.5;
  document.getElementById("settingCollectionFactorD").value = state.settings.collectionFactorD ?? 15;
  document.getElementById("settingCollectionBulk").value = state.settings.collectionBulkPerCard ?? 0.01;
  document.getElementById("settingCollectionFirstOffer").value = state.settings.collectionFirstOfferPercent ?? 75;
  document.getElementById("settingCollectionRelevance").value = state.settings.collectionEconomicRelevance ?? 3;
  document.getElementById("settingCollectionSafety").value = state.settings.collectionMinimumSafetyPercent ?? 5;
  document.getElementById("settingCollectionCapitalMedium").value = state.settings.collectionCapitalMediumPercent ?? 25;
  document.getElementById("settingCollectionCapitalHigh").value = state.settings.collectionCapitalHighPercent ?? 50;
  const preview=document.getElementById("settingsCalculationPreview");
  if(preview){
    const sell=5, fee=sell*Number(state.settings.feePercent||0)/100, allocation=packagingAllocation(), safety=sell*Number(state.settings.safetyPercent||0)/100;
    const source=allocation.source==="actual"?`aus ${allocation.sampleCount} echten Bestellungen gelernt`:`mit ${allocation.averageCardsPerOrder} Karten je Bestellung geschätzt`;
    preview.innerHTML=`<strong>Beispiel bei ${money(sell)}</strong><span>Gebühr ${money(fee)} · anteilige Verpackung ${money(allocation.perCard)} (${escapeHtml(source)}) · Sicherheitsabschlag ${money(safety)} · verbleibend ${money(Math.max(0,sell-fee-allocation.perCard-safety))}</span>`;
  }
  const status=document.getElementById("settingsDatabaseStatus");
  if(status&&window.desktopApp?.getTradeDatabaseStatus&&!renderSettings.statusPending){
    renderSettings.statusPending=true;
    window.desktopApp.getTradeDatabaseStatus().then(info=>{
      status.innerHTML=`<div><small>SQLite</small><strong>${info.ready?"Bereit":"Prüfen"}</strong></div><div><small>Automatische Sicherungen</small><strong>${Number(info.backupCount||0)}</strong></div><div><small>Letzte Sicherung</small><strong>${info.latestBackupAt?new Date(info.latestBackupAt).toLocaleString("de-DE"):"Noch keine"}</strong></div><div><small>Protokollierte Änderungen</small><strong>${Number(info.eventCount||0).toLocaleString("de-DE")}</strong></div>`;
    }).catch(error=>{status.innerHTML=`<div class="error">Status konnte nicht gelesen werden: ${escapeHtml(error.message)}</div>`;}).finally(()=>{renderSettings.statusPending=false;});
  }
  renderCapitalPanel();
}

function configureModalAction({submitLabel="Speichern",destructive=false}={}) {
  const submit=document.getElementById("modalSubmit");
  const addAnother=document.getElementById("modalAddAnother");
  if(addAnother){addAnother.hidden=true;addAnother.onclick=null;}
  if(!submit)return;
  submit.textContent=submitLabel;
  submit.className=destructive?"danger-button":"primary";
}

function showDialogSafely(dialog) {
  if(!dialog)return;
  document.querySelectorAll("dialog[open]").forEach(openDialog=>{
    if(openDialog!==dialog)openDialog.close();
  });
  if(dialog.open)dialog.close();
  try{dialog.showModal();}catch(error){dialog.setAttribute("open","");}
  requestAnimationFrame(()=>{
    const field=dialog.querySelector('input:not([type="hidden"]):not([readonly]):not([disabled]), select:not([disabled]), textarea:not([disabled])');
    field?.focus({preventScroll:true});
  });
}

function openModal(title, fields, initial={}, onSave, options={}) {
  document.getElementById("modalTitle").textContent = title;
  const wrap = document.getElementById("modalFields");
  inventoryCardSearchSequence++;
  inventoryPriceSequence++;
  wrap.oninput=null;
  wrap.onclick=null;
  delete wrap.dataset.inventorySelection;
  wrap.innerHTML = fields.map(f=>`
    <label class="${f.full?"full-width":""}">${escapeHtml(f.label)}
      ${f.type==="select"
        ? `<select name="${f.name}">${f.options.map(option=>{const value=typeof option==="object"?option.value:option;const label=typeof option==="object"?option.label:option;return `<option value="${escapeHtml(value)}" ${String(initial[f.name]??f.value??"")===String(value)?"selected":""}>${escapeHtml(label)}</option>`;}).join("")}</select>`
        : f.type==="checkbox"
          ? `<input name="${f.name}" type="checkbox" value="true" ${(initial[f.name]??f.value)?"checked":""} />`
        : `<input name="${f.name}" type="${f.type||"text"}" value="${escapeHtml(initial[f.name]??f.value??"")}" ${f.step?`step="${f.step}"`:""} ${f.min!==undefined?`min="${escapeHtml(f.min)}"`:""} ${f.required?"required":""} />`
      }
    </label>`).join("");
  modalHandler = onSave;
  configureModalAction(options);
  showDialogSafely(document.getElementById("modal"));
}

document.getElementById("modalForm").addEventListener("submit", e=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.currentTarget).entries());
  if(modalHandler?.(data)===false)return;
  inventoryCardSearchSequence++;
  inventoryPriceSequence++;
  document.getElementById("modal").close();
  saveState(); renderAll();
  finishScannerCardReview();
});
document.getElementById("modalClose").onclick=()=>{inventoryCardSearchSequence++;inventoryPriceSequence++;document.getElementById("modal").close();finishScannerCardReview();};
document.getElementById("modalCancel").onclick=()=>{inventoryCardSearchSequence++;inventoryPriceSequence++;document.getElementById("modal").close();finishScannerCardReview();};
document.getElementById("modal").addEventListener("close",finishScannerCardReview);

async function scannerImageFingerprint(dataUrl){
  if(!dataUrl)return "";
  const image=new Image();
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=dataUrl;});
  const canvas=document.createElement("canvas");canvas.width=9;canvas.height=8;
  const context=canvas.getContext("2d",{willReadFrequently:true});context.drawImage(image,0,0,9,8);
  const pixels=context.getImageData(0,0,9,8).data;let bits="";
  const light=index=>pixels[index]*0.299+pixels[index+1]*0.587+pixels[index+2]*0.114;
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){const left=(y*9+x)*4,right=left+4;bits+=light(left)>light(right)?"1":"0";}
  return bits.match(/.{1,4}/g).map(group=>parseInt(group,2).toString(16)).join("");
}

function scannerHashDistance(left,right){
  if(!left||!right||left.length!==right.length)return Infinity;
  let distance=0;for(let index=0;index<left.length;index++){let value=parseInt(left[index],16)^parseInt(right[index],16);while(value){distance+=value&1;value>>=1;}}
  return distance;
}

function scannerMappingMatch(fingerprint){
  const ranked=(state.scannerMappings||[]).map(row=>({...row,distance:scannerHashDistance(fingerprint,row.fingerprint)})).sort((a,b)=>a.distance-b.distance);
  const match=ranked[0];if(!match||match.distance>5)return null;
  const confidence=Math.max(0,100-match.distance*4);
  return confidence>=Number(state.settings.scannerMinConfidence||80)?{...match,confidence}:null;
}

function rememberScannerChoice(scan, product){
  if(!scan?.fingerprint||!product?.productId)return;
  const record={fingerprint:scan.fingerprint,productId:String(product.productId),name:product.name||product.germanName||"",setCode:scan.recognition?.setCodes?.[0]||product.collectorNumber||product.setCode||"",cardPasscode:scan.recognition?.passcodes?.[0]||product.cardPasscode||"",edition:scan.recognition?.edition||product.edition||"",updatedAt:new Date().toISOString()};
  if(state.settings.scannerRememberMappings!==false){
    const existing=(state.scannerMappings||[]).find(row=>row.fingerprint===scan.fingerprint);
    if(existing)Object.assign(existing,record,{confirmations:Number(existing.confirmations||0)+1});
    else state.scannerMappings.push({...record,confirmations:1});
  }
  state.scannerHistory.push({id:scan.id||uid(),timestamp:scan.receivedAt||new Date().toISOString(),mode:scan.mode||"business",fingerprint:scan.fingerprint,hint:scan.hint||"",productId:String(product.productId),setCode:record.setCode,cardPasscode:record.cardPasscode,edition:record.edition,confirmed:true});
  state.scannerHistory=state.scannerHistory.slice(-200);
}

async function openIphoneScanner(mode="business",targetId=""){
  if(state.settings.scannerEnabled===false){alert("Der iPhone-Scanner ist in den Einstellungen deaktiviert.");return;}
  if(!window.desktopApp?.startScanner){alert("Der iPhone-Scanner steht nur in der installierten Desktop-App zur Verfügung.");return;}
  scannerSessionMode=["business","private","purchase","sale"].includes(mode)?mode:"business";
  scannerSessionActive=false;scannerReviewActive=false;scannerSubmissionProcessing=false;scannerSubmissionQueue=[];
  const dialog=document.getElementById("scannerDialog"),content=document.getElementById("scannerContent");
  document.getElementById("scannerSubtitle").textContent={private:"Foto für die Privatsammlung aufnehmen.",purchase:"Karte zu diesem Einkauf ergänzen.",sale:"Karte zu diesem Verkauf ergänzen.",business:"Foto für den Geschäftsbestand aufnehmen."}[scannerSessionMode];
  content.innerHTML='<div class="scanner-loading">Sichere Verbindung wird vorbereitet …</div>';
  scannerDialogSuspended=false;
  showDialogSafely(dialog);
  try{
    const info=await window.desktopApp.startScanner({mode:scannerSessionMode,targetId});
    scannerSessionActive=true;
    content.innerHTML=`<div class="scanner-pairing"><img class="scanner-qr" src="${info.qrDataUrl}" alt="QR-Code für den iPhone-Scanner"><div class="scanner-instructions"><h3>So verbinden Sie Ihr iPhone</h3><p>iPhone und PC müssen im selben WLAN sein. Öffnen Sie die Kamera-App und richten Sie sie auf den QR-Code.</p><span class="scanner-url">${escapeHtml(info.url)}</span><p>Fotografieren Sie beliebig viele Karten nacheinander. Der Manager liest Name und Setnummer lokal aus und lässt Sie jede Druckvariante einzeln bestätigen.</p></div></div><div class="scanner-waiting">Bereit für die erste Karte …</div>`;
  }catch(error){content.innerHTML=`<div class="scanner-error"><strong>Scanner konnte nicht gestartet werden.</strong><br>${escapeHtml(error.message||error)}</div>`;}
}

async function closeIphoneScanner(){
  scannerSessionActive=false;scannerReviewActive=false;scannerSubmissionProcessing=false;scannerSubmissionQueue=[];
  scannerDialogSuspended=false;
  document.getElementById("scannerDialog")?.close();
  try{await window.desktopApp?.stopScanner?.();}catch(error){console.error("Scanner konnte nicht beendet werden:",error);}
}

function updateScannerSeriesStatus(message){
  const target=document.querySelector("#scannerContent .scanner-waiting");
  if(target)target.textContent=message;
}

function scannerProductComplete(product={}){
  return Boolean(String(product.productId||"").trim()&&String(product.setName||product.set||product.setCode||"").trim()&&String(product.collectorNumber||product.setCode||"").trim()&&String(product.rarity||product.variant||"").trim());
}

function scannerProductNames(product={}){
  return [product.germanName,product.englishName,product.name,product.officialName].filter(Boolean);
}

function scannerVerifiedUniqueVariant(products=[],setCode=""){
  const language=String(setCode).match(/-([A-Z]{2})[0-9]/)?.[1]||"";
  const verified=products.filter(product=>scannerProductComplete(product)&&/cardmarket\.com/i.test(String(product.productUrl||""))&&(!language||!product.language||String(product.language).toUpperCase()===language));
  return verified.length===1?verified[0]:null;
}

async function scannerCatalogMatch(scan){
  const recognition=scan.recognition||{};
  const queries=(recognition.queries?.length?recognition.queries:TcgScannerRecognition.buildQueries({hint:scan.hint,text:recognition.text})).slice(0,16);
  const setCodes=recognition.setCodes?.length?recognition.setCodes:TcgScannerRecognition.extractSetCodes(recognition.text||"");
  for(const code of setCodes){
    const products=await searchInventoryCardVariants(code);
    const codeMatches=TcgScannerRecognition.exactCodeMatches(products, [code]);
    if(codeMatches.length){
      const selected=codeMatches.length===1&&scannerProductComplete(codeMatches[0])?codeMatches[0]:scannerVerifiedUniqueVariant(codeMatches,code);
      return {query:code,products:codeMatches,selected,reason:"set-code",score:1};
    }
  }

  let best=null;
  for(const query of queries){
    if(normalizeCardName(query).length<2||setCodes.some(code=>TcgScannerRecognition.compact(code)===TcgScannerRecognition.compact(query)))continue;
    const products=await searchInventoryCardVariants(query);
    if(!products.length)continue;
    const scored=products.map(product=>({product,score:Math.max(0,...scannerProductNames(product).map(name=>TcgScannerRecognition.titleSimilarity(query,name)))})).sort((left,right)=>right.score-left.score);
    const top=scored[0];
    if(!top||top.score<0.54)continue;
    const groupKey=String(top.product.metacardId||"")||normalizeCardName(scannerProductNames(top.product)[0]||"");
    const variants=products.filter(product=>{
      const candidateKey=String(product.metacardId||"")||normalizeCardName(scannerProductNames(product)[0]||"");
      return candidateKey===groupKey;
    });
    const exact=scannerProductNames(top.product).some(name=>normalizeCardName(name)===normalizeCardName(query));
    const candidate={query,products:variants.length?variants:[top.product],selected:null,reason:scan.hint&&normalizeCardName(query)===normalizeCardName(scan.hint)?"hint":exact?"card-name":"fuzzy-name",score:top.score};
    if(candidate.products.length===1&&scannerProductComplete(candidate.products[0])&&(exact||top.score>=0.94))candidate.selected=candidate.products[0];
    if(!best||candidate.score>best.score)best=candidate;
    if(exact)break;
  }
  return best;
}

async function resolveRememberedScannerProduct(mapping){
  if(!mapping)return null;
  try{
    const products=await searchInventoryCardVariants(mapping.productId);
    return products.find(row=>String(row.productId)===String(mapping.productId))||resolveProduct(mapping.productId,{name:mapping.name});
  }catch{return resolveProduct(mapping.productId,{name:mapping.name});}
}

async function acceptScannerSubmission(submission){
  if(!submission?.imageDataUrl)return;
  updateScannerSeriesStatus(`Foto wird zugeschnitten und lokal erkannt … ${scannerSubmissionQueue.length?`${scannerSubmissionQueue.length} weitere in der Warteschlange` : ""}`.trim());
  let prepared={imageDataUrl:submission.imageDataUrl};
  try{
    if(window.TcgScannerImageProcessing?.prepareRecognitionPayload)prepared=await window.TcgScannerImageProcessing.prepareRecognitionPayload(submission.imageDataUrl);
  }catch(error){console.error("Scanner-Bildaufbereitung fehlgeschlagen:",error);}
  let fingerprint="";
  try{fingerprint=await scannerImageFingerprint(prepared.fingerprintImageDataUrl||submission.imageDataUrl);}catch(error){console.error("Scanner-Fingerabdruck fehlgeschlagen:",error);}
  const scan={...submission,fingerprint,cardBounds:prepared.cardBounds||[]};
  const mapping=scannerMappingMatch(fingerprint);
  try{
    scan.recognition=await window.desktopApp?.recognizeCardImage?.({...prepared,hint:submission.hint||""})||{queries:TcgScannerRecognition.buildQueries({hint:submission.hint})};
  }catch(error){
    console.error("Lokale Karten-Texterkennung fehlgeschlagen:",error);
    scan.recognition={text:"",confidence:0,queries:TcgScannerRecognition.buildQueries({hint:submission.hint}),setCodes:[],passcodes:[],edition:"",error:error.message||String(error)};
  }
  if(mapping){
    const remembered=await resolveRememberedScannerProduct(mapping);
    const recognizedCodes=scan.recognition?.setCodes||[];
    if(remembered&&(!recognizedCodes.length||TcgScannerRecognition.exactCodeMatches([remembered],recognizedCodes).length)){
      scan.recognizedProduct=remembered;
      scan.recognitionMatch={query:mapping.name||mapping.productId,products:[remembered],selected:remembered,reason:"remembered",confidence:mapping.confidence};
    }
  }
  if(!scan.recognitionMatch){
    scan.recognitionMatch=await scannerCatalogMatch(scan);
    scan.recognizedProduct=scan.recognitionMatch?.selected||null;
  }
  scannerReviewActive=true;
  const detected=scan.recognizedProduct?`Erkannt: ${inventoryVariantName(scan.recognizedProduct)}`:scan.recognitionMatch?.products?.length?`${scan.recognitionMatch.products.length} passende Druckvarianten gefunden`:'Keine eindeutige Zuordnung – bitte manuell auswählen';
  updateScannerSeriesStatus(`${detected}. Weitere Fotos können bereits aufgenommen werden.`);
  const scannerDialog=document.getElementById("scannerDialog");
  if(scannerDialog?.open){scannerDialogSuspended=true;scannerDialog.close();}
  if(submission.mode==="purchase"&&submission.targetId){addPurchaseLine(submission.targetId,scan);return;}
  if(submission.mode==="sale"&&submission.targetId){addSaleLine(submission.targetId,scan);return;}
  addInventory(scan.recognizedProduct||{},submission.mode==="private"?"private":"business",scan);
}

function queueScannerSubmission(submission){
  if(!submission)return;
  scannerSubmissionQueue.push(submission);
  if(scannerReviewActive||scannerSubmissionProcessing)updateScannerSeriesStatus(`Eine Karte wird geprüft · ${scannerSubmissionQueue.length} weitere${scannerSubmissionQueue.length===1?" Karte":" Karten"} warten.`);
  processScannerSubmissionQueue();
}

async function processScannerSubmissionQueue(){
  if(scannerSubmissionProcessing||scannerReviewActive||!scannerSubmissionQueue.length)return;
  if([...document.querySelectorAll("dialog[open]")].some(dialog=>dialog.id!=="scannerDialog")){setTimeout(processScannerSubmissionQueue,250);return;}
  scannerSubmissionProcessing=true;
  const submission=scannerSubmissionQueue.shift();
  try{await acceptScannerSubmission(submission);}
  catch(error){
    console.error("Scanner-Foto konnte nicht übernommen werden:",error);
    updateScannerSeriesStatus(`Scanfehler: ${error.message||error}. Die nächste Karte kann weiterbearbeitet werden.`);
  }finally{
    scannerSubmissionProcessing=false;
    if(!scannerReviewActive&&scannerSubmissionQueue.length)setTimeout(processScannerSubmissionQueue,0);
  }
}

function finishScannerCardReview(){
  if(!scannerReviewActive)return;
  scannerReviewActive=false;
  if(!scannerSessionActive)return;
  if(scannerDialogSuspended){scannerDialogSuspended=false;showDialogSafely(document.getElementById("scannerDialog"));}
  updateScannerSeriesStatus(scannerSubmissionQueue.length?`${scannerSubmissionQueue.length} weitere${scannerSubmissionQueue.length===1?" Karte wird":" Karten werden"} jetzt geöffnet …`:'Bereit für die nächste Karte …');
  setTimeout(processScannerSubmissionQueue,0);
}

let inventoryModalVariants=new Map();
let inventoryCardSearchSequence=0;
let inventoryPriceSequence=0;

async function searchInventoryCardVariants(query,expectedRecord={}){
  const parsedQuery=window.TcgCardSearch?.parseVariantLabel?.(query)||{baseName:query,variant:""};
  const searchQuery=parsedQuery.variant?parsedQuery.baseName:query;
  const prepare=rows=>{
    const products=window.TcgCardSearch?.inferVariantOrdinals?.(rows)||rows||[];
    products.forEach(product=>{
      const assessment=window.TcgCardSearch?.variantCandidateMatch?.(query,expectedRecord,product)||{};
      product.queryVariantMatch=Boolean(assessment.fullMatch);
      product.queryVariantOnlyMatch=Boolean(assessment.versionMatch&&!assessment.fullMatch);
      product.querySetMatch=Boolean(assessment.setMatch);
    });
    return products.sort((left,right)=>Number(Boolean(right.queryVariantMatch))-Number(Boolean(left.queryVariantMatch))||Number(Boolean(right.querySetMatch))-Number(Boolean(left.querySetMatch))||Number(Boolean(right.queryVariantOnlyMatch))-Number(Boolean(left.queryVariantOnlyMatch)));
  };
  if(window.tcgSearchCatalogCards){
    const result=await window.tcgSearchCatalogCards(searchQuery,100);
    return prepare(result.products||[]);
  }
  if(window.desktopApp?.searchCards){
    const result=await window.desktopApp.searchCards({query:searchQuery,limit:100,offset:0});
    const products=(result.cards||[]).flatMap(card=>(card.variants||[]).map(variant=>({...variant,germanName:card.germanName||variant.germanName,englishName:card.englishName||variant.englishName,name:card.germanName||variant.germanName||card.englishName||variant.englishName||variant.officialName})));
    if(window.desktopApp.getTradeRecommendations&&products.length){
      const recommendations=await window.desktopApp.getTradeRecommendations({productIds:products.map(row=>row.productId),limit:100});
      const byId=new Map((recommendations.recommendations||[]).map(row=>[String(row.productId),row]));
      products.forEach(product=>product.learnedPricing=byId.get(String(product.productId))||null);
    }
    return prepare(products);
  }
  const q=normalizeCardName(searchQuery);
  return prepare(Object.entries(state.productCatalog||{}).filter(([id,row])=>normalizeCardName([id,row.name,row.germanName,row.englishName,row.set,row.setName,row.rarity,row.collectorNumber].join(" ")).includes(q)).slice(0,100).map(([productId,row])=>({productId,...row})));
}

function inventoryVariantName(product={}){
  return product.germanName||product.name||product.officialName||product.englishName||`Cardmarket-Produkt ${product.productId||""}`;
}

function inventoryVariantSubtitle(product={}){
  const setName=product.setName||product.set||"Set unbekannt";
  const setNumber=product.collectorNumber||product.setCode||"Setnummer unbekannt";
  const rarity=[product.variant||product.inferredVariant,product.rarity].filter((value,index,array)=>value&&array.indexOf(value)===index).join(" · ")||"Seltenheit unbekannt";
  return `${setName} · ${setNumber} · ${rarity}`;
}

function inventoryVariantDifference(product={},products=[]){
  const fields=[
    ["Set",product.setName||product.set||""],
    ["Setnummer",product.collectorNumber||product.setCode||""],
    ["Version",product.variant||product.inferredVariant||""],
    ["Seltenheit",product.rarity||""],
    ["Ausgabe",product.edition||product.printVersion||product.releaseName||""]
  ];
  const differences=fields.filter(([label,value])=>value&&new Set(products.map(row=>normalizeCardName(label==="Set"?(row.setName||row.set||""):label==="Setnummer"?(row.collectorNumber||row.setCode||""):label==="Version"?(row.variant||row.inferredVariant||""):label==="Seltenheit"?(row.rarity||""):(row.edition||row.printVersion||row.releaseName||""))).filter(Boolean)).size>1);
  return differences.length?`Unterscheidungsmerkmale: ${differences.map(([label,value])=>`${label} ${value}`).join(" · ")}`:"Die importierten Druckdaten sind mit weiteren Treffern identisch – die CM-ID vor Übernahme auf Cardmarket prüfen.";
}

async function safeCatalogVariantFor(record={}){
  const identity=window.TcgCardSearch?.parseVariantLabel?.(record.name||record.germanName||record.englishName||"");
  const urlIdentity=window.TcgCardSearch?.parseCardmarketProductUrl?.(record.productUrl||"")||{};
  if(!identity?.variantNumber||!(record.setName||record.set||record.expansion||urlIdentity.setSlug))return null;
  const products=await searchInventoryCardVariants(record.name||record.germanName||record.englishName||"",record);
  return window.TcgCardSearch?.selectSafeVariant?.(record,products)||null;
}

async function inventoryPricingSuggestion(product={}){
  if(window.tcgProductPricing)return window.tcgProductPricing(product);
  const learned=product.learnedPricing||((await window.desktopApp?.getTradeRecommendations?.({productIds:[String(product.productId||"")],limit:1}))?.recommendations||[])[0]||{};
  const central=window.TcgBusinessAutomation?.calculateOwnedCardPriceTargets?.({...product,cost:Number(product.cost||product.ownBuyAverage||0)},forwardPricingSettings())||{};
  return {recommendedSell:Number(learned.recommendedSell||central.recommendedSell||0),recommendedBuy:Number(learned.recommendedBuy||central.maxBuy||0),priceFloor:Number(learned.priceFloor||central.priceFloor||0),quickSell:Number(learned.quickSell||central.quickSell||0),profitableAtMarket:learned.profitableAtMarket??central.profitableAtMarket,confidence:learned.confidenceLevel||central.confidenceLevel||"low",priceExplanation:central.priceExplanation||""};
}

async function chooseInventoryVariant(productId,preserveResults=false){
  const product=inventoryModalVariants.get(String(productId));if(!product)return;
  const priceSequence=++inventoryPriceSequence;
  const wrap=document.getElementById("modalFields");
  wrap.dataset.inventorySelection="selected";
  const setValue=product.setCode||product.set||product.setName||"";
  const variantValue=product.variant||product.inferredVariant||"";
  const rarityValue=product.rarity||"";
  const values={productId:String(product.productId||""),metacardId:String(product.metacardId||""),name:inventoryVariantName(product),germanName:product.germanName||inventoryVariantName(product),englishName:product.englishName||product.officialName||"",set:setValue,setName:product.setName||product.set||"",variant:variantValue,rarity:rarityValue,collectorNumber:product.collectorNumber||product.setCode||"",productUrl:product.productUrl||""};
  Object.entries(values).forEach(([name,value])=>{const field=document.querySelector(`#modalFields [name="${name}"]`);if(field)field.value=value;});
  const languageField=wrap.querySelector('[name="language"]');
  document.getElementById("inventorySelectedCard").innerHTML=`<strong>${escapeHtml(values.name)}</strong>${values.englishName&&normalizeCardName(values.englishName)!==normalizeCardName(values.name)?`<small>Englischer Kartenname: ${escapeHtml(values.englishName)}</small>`:""}<span>${escapeHtml(inventoryVariantSubtitle(product))}</span><small class="variant-language-reminder">CM ${escapeHtml(values.productId)} bestimmt die Druckvariante, nicht die Kartensprache.${languageField?` Sprache dieses Exemplars: ${escapeHtml(languageField.value||"bitte unten auswählen")}.`:""}</small>`;
  document.getElementById("inventorySetDisplay").value=values.setName||values.set;
  document.getElementById("inventoryRarityDisplay").value=[values.variant,values.rarity].filter(Boolean).join(" · ");
  document.getElementById("inventoryNumberDisplay").value=values.collectorNumber;
  if(!preserveResults)document.getElementById("inventoryCardResults").innerHTML="";
  else document.querySelectorAll("#inventoryCardResults [data-select-inventory-product]").forEach(button=>button.classList.toggle("selected",button.dataset.selectInventoryProduct===String(productId)));
  const suggestion=await inventoryPricingSuggestion(product);
  if(priceSequence!==inventoryPriceSequence||document.querySelector('#modalFields [name="productId"]')?.value!==String(productId))return;
  const suggestionField=document.querySelector('#modalFields [name="suggestedSell"]');if(suggestionField)suggestionField.value=Number(suggestion.recommendedSell||0).toFixed(2);
  const priceInfo=document.getElementById("inventoryPriceSuggestion");
  if(priceInfo)priceInfo.innerHTML=suggestion.recommendedSell?`<strong>Marktbasierter VK-Vorschlag ${money(suggestion.recommendedSell)}</strong><span>${suggestion.quickSell?`Schnellverkauf ${money(suggestion.quickSell)} · `:""}${suggestion.priceFloor?`VK für Ziel-ROI ${money(suggestion.priceFloor)} · `:""}Maximaler sinnvoller EK ${suggestion.recommendedBuy?money(suggestion.recommendedBuy):"noch ohne ausreichende Daten"} · Datenbasis ${escapeHtml({high:"hoch",medium:"mittel",low:"niedrig"}[suggestion.confidence]||suggestion.confidence||"niedrig")}</span>${suggestion.priceExplanation?`<small>${escapeHtml(suggestion.priceExplanation)}</small>`:""}${suggestion.profitableAtMarket===false?'<span class="money-negative">Der aktuelle Marktpreis erreicht den Mindest-ROI nicht. Der Vorschlag wird nicht künstlich erhöht.</span>':""}<button type="button" class="link-button" id="applyInventorySuggestedPrice">Vorschlag als Inseratspreis übernehmen</button>`:`<span>Noch kein belastbarer VK-Vorschlag für diese Druckvariante vorhanden.</span>`;
}

function handleInventoryProductChoice(event){
  const direct=event.target.closest("[data-select-inventory-product]");
  if(direct){chooseInventoryVariant(direct.dataset.selectInventoryProduct);return true;}
  const confirmed=event.target.closest("[data-confirm-inventory-product]");
  if(!confirmed)return false;
  const productId=confirmed.dataset.confirmInventoryProduct;
  const product=inventoryModalVariants.get(String(productId));
  if(product)product.explicitProductIdSelection=true;
  chooseInventoryVariant(productId,true);
  return true;
}

function scannerReviewTitle(scan={}){
  if(scan.recognizedProduct)return "Karte und Druckvariante erkannt – bitte kontrollieren";
  if(scan.recognitionMatch?.products?.length)return "Karte erkannt – bitte Druckvariante auswählen";
  return "Foto empfangen – bitte Karte und Druckvariante auswählen";
}

function scannerReviewDescription(scan={}){
  const detected=scan.recognitionMatch?.query||scan.hint||"";
  const source=scan.recognitionMatch?.reason==="remembered"?"Aus einer früheren Bestätigung wiedererkannt":detected?`Im Foto erkannt: ${detected}`:"Im Foto wurde kein sicherer Kartenname gelesen";
  const details=[scan.recognition?.setCodes?.[0]&&`Setnummer ${scan.recognition.setCodes[0]}`,scan.recognition?.passcodes?.[0]&&`Karten-ID ${scan.recognition.passcodes[0]}`,scan.recognition?.edition].filter(Boolean).join(" · ");
  return `${source}${details?` · ${details}`:""}. Der Scan speichert niemals automatisch; alle Angaben bleiben vor dem Speichern korrigierbar.`;
}

function renderInventoryProductChoices(products=[],scan=null){
  const target=document.getElementById("inventoryCardResults");if(!target)return;
  const complete=products.filter(product=>scannerProductComplete(product)||product.explicitProductIdSelection);
  const incomplete=products.filter(product=>!complete.includes(product));
  inventoryModalVariants=new Map(products.map(product=>[String(product.productId),product]));
  const recognitionHtml=scan?`<div class="scanner-match-note"><strong>${escapeHtml(scan.recognitionMatch?.reason==="set-code"?"Setnummer im Foto erkannt":scan.recognitionMatch?.reason==="remembered"?"Bekannte Karte wiedererkannt":scan.recognitionMatch?.reason==="fuzzy-name"?"Ähnlicher Kartenname gefunden":"Kartenname im Foto erkannt")}</strong><span>${escapeHtml(scan.recognitionMatch?.query||scan.hint||"")} · Bitte Ausgabe, Seltenheit und Edition kontrollieren.</span></div>`:"";
  const matchNote=product=>product.queryVariantMatch?'<small class="variant-match-note">Kartenname, Set und Version stimmen überein</small>':product.queryVariantOnlyMatch?'<small class="variant-check-note">Nur gleiche Versionsnummer – Set unbedingt prüfen</small>':"";
  const languageNote=`<div class="variant-language-note"><strong>Kartensprache und Druckvariante sind getrennt</strong><span>Eine Cardmarket-Produkt-ID steht für die Druckvariante und sagt nicht automatisch „Deutsch“ oder „Englisch“. Wähle zuerst Set, Setnummer, Version und Seltenheit. Die Sprache deines Exemplars stellst du anschließend im eigenen Feld ein.</span></div>`;
  const completeHtml=complete.map(product=>`<div class="inventory-card-choice-row"><button type="button" class="inventory-card-choice ${product.queryVariantMatch?"recommended":""}" data-select-inventory-product="${escapeHtml(product.productId)}"><strong>${escapeHtml(inventoryVariantName(product))}</strong>${product.englishName&&normalizeCardName(product.englishName)!==normalizeCardName(inventoryVariantName(product))?`<small>Englischer Kartenname: ${escapeHtml(product.englishName)}</small>`:""}<span>${escapeHtml(inventoryVariantSubtitle(product))}</span>${matchNote(product)}<small>${escapeHtml(inventoryVariantDifference(product,complete))}</small><small>Cardmarket-Produkt ${escapeHtml(product.productId)} · Sprache separat auswählen</small></button><a class="variant-cardmarket-check" href="${escapeHtml(cardmarketUrl(product))}" target="_blank" rel="noopener noreferrer">Auf Cardmarket prüfen ↗</a></div>`).join("");
  const incompleteHtml=incomplete.length?`<div class="inventory-incomplete-warning"><strong>${incomplete.length} Cardmarket-Druckvariante${incomplete.length===1?"":"n"} mit unvollständigen Quelldaten</strong><span>Die Versionsnummer macht die CM-IDs unterscheidbar. Prüfe den direkten Cardmarket-Link und bestätige anschließend nur die passende Zeile.</span>${incomplete.slice(0,30).map(product=>`<div class="inventory-product-check ${product.queryVariantMatch?"recommended":""}"><a href="${escapeHtml(cardmarketUrl(product))}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(inventoryVariantName(product))} · ${escapeHtml(inventoryVariantSubtitle(product))}</span>${matchNote(product)}<strong>CM ${escapeHtml(product.productId)} prüfen ↗</strong></a><button type="button" class="secondary compact-button" data-confirm-inventory-product="${escapeHtml(product.productId)}">Diese CM-ID übernehmen</button></div>`).join("")}</div>`:"";
  target.innerHTML=products.length?languageNote+recognitionHtml+completeHtml+incompleteHtml:'<div class="empty">Keine passende Karte gefunden. Bitte Schreibweise oder Namenssprache prüfen.</div>';
}

function applyScannerModalRecognition(scan){
  if(!scan)return false;
  const match=scan.recognitionMatch;
  const search=document.getElementById("inventoryCardSearch");
  const detectedCode=scan.recognition?.setCodes?.[0]||"";
  const detectedLanguage=detectedCode.match(/-([A-Z]{2})[0-9]/)?.[1]||"";
  const languageField=document.querySelector('#modalFields [name="language"]');
  if(languageField&&[...languageField.options].some(option=>option.value===detectedLanguage))languageField.value=detectedLanguage;
  const editionField=document.querySelector('#modalFields [name="edition"]');
  if(editionField&&scan.recognition?.edition&&[...editionField.options].some(option=>option.value===scan.recognition.edition))editionField.value=scan.recognition.edition;
  const passcodeField=document.querySelector('#modalFields [name="cardPasscode"]');
  if(passcodeField)passcodeField.value=scan.recognition?.passcodes?.[0]||"";
  if(search&&match?.query)search.value=match.query;
  if(match?.products?.filter(Boolean).length){
    const products=match.products.filter(Boolean);
    renderInventoryProductChoices(products,scan);
    const selected=scan.recognizedProduct||match.selected;
    if(selected){inventoryModalVariants.set(String(selected.productId),selected);chooseInventoryVariant(selected.productId,true);}
    return true;
  }
  const fallback=scan.hint||scan.recognition?.queries?.[0]||"";
  if(search&&fallback){search.value=fallback;renderInventoryCardSearch(fallback);return true;}
  setTimeout(()=>search?.focus(),0);return false;
}

async function renderInventoryCardSearch(query,expectedRecord={}){
  const target=document.getElementById("inventoryCardResults");if(!target)return;
  const sequence=++inventoryCardSearchSequence;
  if(normalizeCardName(query).length<2){target.innerHTML='<div class="muted">Mindestens zwei Zeichen eingeben.</div>';return;}
  target.innerHTML='<div class="muted">Passende Karten und Druckvarianten werden gesucht …</div>';
  try{
    const products=await searchInventoryCardVariants(query,expectedRecord);if(sequence!==inventoryCardSearchSequence)return;
    const exactProductId=/^\d+$/.test(String(query||"").trim())?String(query).trim():"";
    if(exactProductId)products.forEach(product=>{if(String(product.productId)===exactProductId)product.explicitProductIdSelection=true;});
    renderInventoryProductChoices(products);
  }catch(error){if(sequence===inventoryCardSearchSequence)target.innerHTML=`<div class="error">${escapeHtml(error.message)}</div>`;}
}

function addInventory(initial={}, collection="business", scan=null) {
  const isPrivate=collection==="private";
  const batchEntries=[];
  inventoryCardSearchSequence++;
  inventoryPriceSequence++;
  document.getElementById("modalTitle").textContent=isPrivate?(initial.id?"Private Karte bearbeiten":"Private Karte hinzufügen"):(initial.id?"Karte bearbeiten":"Karte hinzufügen");
  const wrap=document.getElementById("modalFields");
  const language=initial.language||"DE",condition=initial.condition||"NM",edition=initial.edition||"Unbekannt",status=initial.status||(isPrivate?"Privatsammlung":"Im Bestand");
  wrap.innerHTML=`
    ${scan?`<div class="scan-review full-width"><img src="${scan.imageDataUrl}" alt="Vom iPhone aufgenommenes Kartenfoto"><div><strong>${escapeHtml(scannerReviewTitle(scan))}</strong><span>${escapeHtml(scannerReviewDescription(scan))}</span></div></div>`:""}
    ${!initial.id&&!scan?'<div id="inventoryBatchSummary" class="inventory-batch-summary full-width" hidden></div>':""}
    <label class="full-width inventory-card-search-label">Kartenname suchen<input id="inventoryCardSearch" autocomplete="off" placeholder="Deutscher oder englischer Kartenname …" value="${escapeHtml(initial.name||scan?.hint||"")}"><div id="inventoryCardResults" class="inventory-card-results"></div></label>
    <div id="inventorySelectedCard" class="inventory-selected-card full-width">${initial.productId?`<strong>${escapeHtml(initial.name||"Ausgewählte Karte")}</strong><span>${escapeHtml([initial.setName||initial.set,initial.collectorNumber,initial.rarity].filter(Boolean).join(" · "))}</span>`:'<span>Noch keine Druckvariante ausgewählt.</span>'}</div>
    ${["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","cardPasscode"].map(name=>`<input type="hidden" name="${name}" value="${escapeHtml(initial[name]||"")}">`).join("")}
    <label>Set<input id="inventorySetDisplay" value="${escapeHtml(initial.setName||initial.set||"")}" readonly></label>
    <label>Setnummer<input id="inventoryNumberDisplay" value="${escapeHtml(initial.collectorNumber||"")}" readonly></label>
    <label class="full-width">Version / Seltenheit<input id="inventoryRarityDisplay" value="${escapeHtml(initial.rarity||"")}" readonly></label>
    <label>Kartensprache des Exemplars<select name="language">${["DE","EN","DE/EN","IT","FR","ES","PL","NL"].map(value=>`<option ${language===value?"selected":""}>${value}</option>`).join("")}</select><small>Diese Auswahl ist unabhängig von der Cardmarket-Produkt-ID.</small></label>
    <label>Zustand<select name="condition">${["NM","EX","GD","LP","PL"].map(value=>`<option ${condition===value?"selected":""}>${value}</option>`).join("")}</select></label>
    ${isPrivate?"":`<label>Halteprofil<select name="holdingProfile">${(window.TcgBusinessAutomation?.HOLDING_PROFILES||["UNKLASSIFIZIERT"]).map(value=>`<option value="${escapeHtml(value)}" ${(window.TcgBusinessAutomation?.normalizeHoldingProfile?.(initial.holdingProfile)||"UNKLASSIFIZIERT")===value?"selected":""}>${escapeHtml(value)}</option>`).join("")}</select></label><label class="switch-label"><input name="longTermHold" type="checkbox" ${initial.longTermHold?"checked":""}> Bewusst langfristig halten</label>`}
    <label>Edition<select name="edition">${["Unbekannt","1st Edition","Unlimited","Limited Edition"].map(value=>`<option ${edition===value?"selected":""}>${value}</option>`).join("")}</select></label>
    ${initial.id?"":`<label>Stückzahl<input name="quantity" type="number" min="1" max="999" step="1" value="1" required></label>`}
    <label>Einstand (€)<input name="cost" type="number" min="0" step="0.01" value="${Number(initial.cost||0)||""}"></label>
    ${isPrivate?'':`<label>Ziel-VK (€) <small>optional</small><input name="targetSell" type="number" min="0" step="0.01" value="${initial.targetSell==null?(initial.originalTargetSell==null?"":Number(initial.originalTargetSell)):Number(initial.targetSell)}"></label>`}
    ${isPrivate?'':`<label>Gewünschter Inseratspreis (€)<input name="listingPrice" type="number" min="0" step="0.01" value="${Number(initial.listingPrice||0)||""}"></label>`}
    ${isPrivate?`<label>Verkaufsbereitschaft<select name="saleIntent">${["Nicht verkaufen","Vielleicht","Verkaufsbereit"].map(value=>`<option ${String(initial.saleIntent||"Nicht verkaufen")===value?"selected":""}>${value}</option>`).join("")}</select></label><label>Wunschpreis bei Verkauf (€)<input name="desiredSalePrice" type="number" min="0" step="0.01" value="${Number(initial.desiredSalePrice||0)||""}"></label>`:""}
    <input name="suggestedSell" type="hidden" value="${Number(initial.suggestedSell||0)||""}">
    <div id="inventoryPriceSuggestion" class="inventory-price-suggestion full-width"><span>Druckvariante auswählen, um den aktuellen VK-Vorschlag anzuzeigen.</span></div>
    <label>Kaufdatum<input name="purchaseDate" type="date" value="${escapeHtml(initial.purchaseDate||todayISO())}"></label>
    <label>Status<select name="status">${(isPrivate?["Privatsammlung","Ausgeliehen","Abgegeben","Beschädigt"]:[...new Set([...(initial.id?[status]:[]),"Im Bestand","Beschädigt"])]).map(value=>`<option ${status===value?"selected":""}>${value}</option>`).join("")}</select></label>
    <label>Lagerort<input name="location" value="${escapeHtml(initial.location||"")}"></label>
    <label class="full-width">Notiz<input name="note" value="${escapeHtml(initial.note||"")}"></label>`;
  wrap.dataset.inventorySelection=initial.productId?"selected":(initial.id?"legacy":"required");
  const inventoryObject=data=>{
    const enteredCost=data.cost!==""&&data.cost!==null&&data.cost!==undefined;
    const listingPrice=isPrivate?0:Number(data.listingPrice||0),listed=!isPrivate&&listingPrice>0;
    const obj={...data,cost:Number(data.cost||0),costStatus:enteredCost?(Number(data.cost)>0?"known":"confirmed_zero"):"unknown",listingPrice,desiredSalePrice:isPrivate?Number(data.desiredSalePrice||0):0,suggestedSell:Number(data.suggestedSell||0),listed,ownership:isPrivate?"private":"business",holdingProfile:isPrivate?"UNKLASSIFIZIERT":(window.TcgBusinessAutomation?.normalizeHoldingProfile?.(data.holdingProfile)||"UNKLASSIFIZIERT"),longTermHold:!isPrivate&&Boolean(data.longTermHold),originalTargetSell:null,targetSell:null,listingHistory:[]};
    if(!isPrivate&&data.targetSell!==""&&data.targetSell!=null){const change=TcgBusinessAutomation.planTargetSellChange(obj,Number(data.targetSell),new Date().toISOString(),"manual");obj.originalTargetSell=change.originalTargetSell;obj.targetSell=change.targetSell;if(change.historyEntry)obj.listingHistory.push({...change.historyEntry,id:uid()});}
    if(listed)obj.listingHistory.push({id:uid(),eventType:"first_listing",changedAt:new Date().toISOString(),oldPrice:null,newPrice:listingPrice,changeMode:"manual",reason:"Beim Anlegen inseriert"});
    delete obj.quantity;
    if(scan?.fingerprint){obj.scanFingerprint=scan.fingerprint;obj.scanSource="iPhone";if(state.settings.scannerKeepImages)obj.scanImageDataUrl=scan.imageDataUrl;}
    return obj;
  };
  const createInventoryCopies=(obj,quantity,reference)=>{
    const target=isPrivate?state.privateCollection:state.inventory;
    const created=[];
    for(let index=0;index<quantity;index++){const item={...obj,id:uid(),movementRecorded:true,listingHistory:structuredClone(obj.listingHistory||[]).map(entry=>({...entry,id:uid()}))};target.push(item);created.push(item);}
    addMovement({type:isPrivate?"Privatsammlung Zugang":"Manueller Bestand",quantity,productId:cleanProductId(obj.productId),inventoryGroupKey:isPrivate?"":inventoryGroupKey(created[0]),reference,note:`${obj.name||"Karte"}${quantity>1?` · ${quantity} Exemplare`:""}`,addedIds:created.map(item=>item.id),inventorySnapshot:structuredClone(created[0])});
  };
  const renderBatchSummary=()=>{
    const summary=document.getElementById("inventoryBatchSummary");if(!summary)return;
    const total=batchEntries.reduce((sum,row)=>sum+row.quantity,0);
    summary.hidden=!batchEntries.length;
    summary.innerHTML=batchEntries.length?`<div class="inventory-batch-head"><strong>Sammelliste · ${batchEntries.length} Position${batchEntries.length===1?"":"en"} · ${total} Karte${total===1?"":"n"}</strong><span>Stückzahlen können vor dem Speichern noch geändert werden.</span></div>${batchEntries.map((row,index)=>`<div class="inventory-batch-row"><div><strong>${escapeHtml(row.obj.name||"Karte")}</strong><small>${escapeHtml([row.obj.setName||row.obj.set,row.obj.collectorNumber,row.obj.rarity,`CM ${row.obj.productId}`].filter(Boolean).join(" · "))}</small></div><label>Stückzahl<input type="number" min="1" max="999" step="1" value="${row.quantity}" data-inventory-batch-quantity="${index}"></label><button type="button" class="icon-button danger-text" data-remove-inventory-batch="${index}">Entfernen</button></div>`).join("")}`:"";
    const submit=document.getElementById("modalSubmit");if(submit)submit.textContent=batchEntries.length?`Alle ${total} Karten speichern`:"Speichern";
    const addAnother=document.getElementById("modalAddAnother");if(addAnother){addAnother.hidden=false;addAnother.textContent="Aktuelle Karte zur Liste hinzufügen";}
  };
  const currentInventoryEntry=data=>{
    if(!data.productId||!data.name)return null;
    return {obj:inventoryObject(data),quantity:Math.max(1,Math.round(Number(data.quantity||1)))};
  };
  const resetInventoryEntry=()=>{
    ["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","cardPasscode","suggestedSell"].forEach(name=>{const field=wrap.querySelector(`[name="${name}"]`);if(field)field.value="";});
    ["cost","targetSell","listingPrice","desiredSalePrice"].forEach(name=>{const field=wrap.querySelector(`[name="${name}"]`);if(field)field.value="";});
    const quantityField=wrap.querySelector('[name="quantity"]');if(quantityField)quantityField.value="1";
    document.getElementById("inventoryCardSearch").value="";
    document.getElementById("inventoryCardResults").innerHTML="";
    document.getElementById("inventorySelectedCard").innerHTML='<span>Noch keine Druckvariante ausgewählt.</span>';
    document.getElementById("inventorySetDisplay").value="";document.getElementById("inventoryNumberDisplay").value="";document.getElementById("inventoryRarityDisplay").value="";
    document.getElementById("inventoryPriceSuggestion").innerHTML='<span>Druckvariante auswählen, um den aktuellen VK-Vorschlag anzuzeigen.</span>';
    wrap.dataset.inventorySelection="required";inventoryModalVariants=new Map();document.getElementById("inventoryCardSearch").focus();
  };
  modalHandler=data=>{
    const legacyUnchanged=initial.id&&wrap.dataset.inventorySelection==="legacy"&&initial.name;
    if((!data.productId||!data.name)&&!legacyUnchanged&&!batchEntries.length){alert("Bitte zuerst eine Karte und anschließend die richtige Druckvariante auswählen.");document.getElementById("inventoryCardSearch")?.focus();return false;}
    if(legacyUnchanged)data.name=initial.name;
    const obj=inventoryObject(data);
    const target=isPrivate?state.privateCollection:state.inventory;
    if(initial.id){
      const current=target.find(row=>row.id===initial.id);const before=current?structuredClone(current):null;const beforeBucket=!isPrivate&&current?purchaseBucketForAsset(current,"business"):null;
      Object.assign(current,obj);
      if(beforeBucket)adjustPurchaseOwnershipForAsset(current,beforeBucket,purchaseBucketForAsset(current,"business"));
      if(before){
        const identityFields=["productId","metacardId","name","germanName","englishName","set","setName","collectorNumber","rarity","productUrl","cardPasscode"];
        const identityChanged=identityFields.some(field=>JSON.stringify(before[field])!==JSON.stringify(current[field]));
        if(identityChanged&&current.purchaseId&&current.purchaseLineKey){
          const purchase=state.purchases.find(row=>row.id===current.purchaseId);
          const line=(purchase?.pendingItems||[]).find((row,index)=>`${purchase.id}:${TcgBusinessAutomation.purchaseLineKey(row,index)}`===current.purchaseLineKey);
          if(line){identityFields.forEach(field=>line[field]=current[field]||"");refreshPurchaseAssetCosts(purchase);}
        }
        if(identityChanged)(state.sales||[]).forEach(sale=>(sale.items||[]).forEach(item=>{if((item.matchedItemIds||[]).includes(current.id))identityFields.forEach(field=>item[field]=current[field]||"");}));
        const fields=Object.keys(obj).filter(key=>JSON.stringify(before[key])!==JSON.stringify(current[key]));
        if(fields.length)addMovement({type:isPrivate?"Privatkorrektur":"Kartenkorrektur",quantity:0,productId:cleanProductId(current.productId),reference:isPrivate?"Privatsammlung":"Bestand",note:`Geändert: ${fields.join(", ")}`});
      }
    }
    else {
      const current=currentInventoryEntry(data);
      const entries=[...batchEntries];if(current)entries.push(current);
      entries.forEach(entry=>createInventoryCopies(entry.obj,entry.quantity,scan?"iPhone-Scanner":isPrivate?"Private Sammelerfassung":"Bestands-Sammelerfassung"));
    }
    if(scan&&data.productId)rememberScannerChoice(scan,obj);
    return true;
  };
  let searchTimer;
  wrap.oninput=event=>{if(event.target.dataset.inventoryBatchQuantity!==undefined){const index=Number(event.target.dataset.inventoryBatchQuantity);if(batchEntries[index])batchEntries[index].quantity=Math.max(1,Math.round(Number(event.target.value||1)));const total=batchEntries.reduce((sum,row)=>sum+row.quantity,0);const heading=document.querySelector("#inventoryBatchSummary .inventory-batch-head strong");if(heading)heading.textContent=`Sammelliste · ${batchEntries.length} Position${batchEntries.length===1?"":"en"} · ${total} Karte${total===1?"":"n"}`;document.getElementById("modalSubmit").textContent=`Alle ${total} Karten speichern`;return;}if(event.target.id!=="inventoryCardSearch")return;clearTimeout(searchTimer);inventoryCardSearchSequence++;inventoryPriceSequence++;wrap.dataset.inventorySelection="required";["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","suggestedSell"].forEach(name=>{const field=wrap.querySelector(`[name="${name}"]`);if(field)field.value="";});document.getElementById("inventorySelectedCard").innerHTML='<span>Bitte die richtige Druckvariante aus der Liste auswählen.</span>';document.getElementById("inventorySetDisplay").value="";document.getElementById("inventoryNumberDisplay").value="";document.getElementById("inventoryRarityDisplay").value="";document.getElementById("inventoryPriceSuggestion").innerHTML='<span>Druckvariante auswählen, um den aktuellen VK-Vorschlag anzuzeigen.</span>';searchTimer=setTimeout(()=>renderInventoryCardSearch(event.target.value),220);};
  wrap.onclick=event=>{const remove=event.target.closest("[data-remove-inventory-batch]");if(remove){batchEntries.splice(Number(remove.dataset.removeInventoryBatch),1);renderBatchSummary();return;}if(handleInventoryProductChoice(event))return;if(event.target.id==="applyInventorySuggestedPrice"){const suggestion=Number(document.querySelector('#modalFields [name="suggestedSell"]')?.value||0);const priceField=document.querySelector('#modalFields [name="listingPrice"]')||document.querySelector('#modalFields [name="desiredSalePrice"]');if(priceField&&suggestion){priceField.value=suggestion.toFixed(2);priceField.focus();}}};
  inventoryModalVariants=new Map();
  configureModalAction();
  if(!initial.id&&!scan){const addAnother=document.getElementById("modalAddAnother");addAnother.hidden=false;addAnother.onclick=()=>{const form=document.getElementById("modalForm");if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form).entries());const entry=currentInventoryEntry(data);if(!entry){alert("Bitte zuerst die richtige Karte beziehungsweise CM-ID auswählen.");document.getElementById("inventoryCardSearch")?.focus();return;}batchEntries.push(entry);renderBatchSummary();resetInventoryEntry();};}
  showDialogSafely(document.getElementById("modal"));
  if(scan)applyScannerModalRecognition(scan);
  else if(initial.productId)searchInventoryCardVariants(String(initial.productId)).then(products=>{if(wrap.dataset.inventorySelection!=="selected")return;const selected=products.find(row=>String(row.productId)===String(initial.productId));if(selected){inventoryModalVariants.set(String(selected.productId),selected);chooseInventoryVariant(selected.productId);}}).catch(()=>{});
  else setTimeout(()=>document.getElementById("inventoryCardSearch")?.focus(),0);
}

function addPurchaseLine(purchaseId,scan=null){
  const purchase=state.purchases.find(row=>row.id===purchaseId);if(!purchase)return;
  inventoryCardSearchSequence++;inventoryPriceSequence++;
  document.getElementById("modalTitle").textContent=`Karte zu Einkauf #${purchase.orderNo||"-"} hinzufügen`;
  const wrap=document.getElementById("modalFields");
  wrap.innerHTML=`
    ${scan?`<div class="scan-review full-width"><img src="${scan.imageDataUrl}" alt="Vom iPhone aufgenommenes Kartenfoto"><div><strong>${escapeHtml(scannerReviewTitle(scan))}</strong><span>${escapeHtml(scannerReviewDescription(scan))}</span></div></div>`:""}
    <label class="full-width inventory-card-search-label">Kartenname oder Setnummer suchen<input id="inventoryCardSearch" autocomplete="off" placeholder="z. B. Aschenblüte oder RA01-008" value="${escapeHtml(scan?.hint||"")}"><div id="inventoryCardResults" class="inventory-card-results"></div></label>
    <div id="inventorySelectedCard" class="inventory-selected-card full-width"><span>Noch keine Druckvariante ausgewählt.</span></div>
    ${["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","cardPasscode"].map(name=>`<input type="hidden" name="${name}">`).join("")}
    <label>Set<input id="inventorySetDisplay" readonly></label><label>Setnummer<input id="inventoryNumberDisplay" readonly></label>
    <label class="full-width">Version / Seltenheit<input id="inventoryRarityDisplay" readonly></label>
    <label>Menge<input name="quantity" type="number" min="1" step="1" value="1" required></label>
    <label>Stückpreis (€)<input name="unitPrice" type="number" min="0" step="0.01" required></label>
    <label>Kartensprache des Exemplars<select name="language">${["DE","EN","DE/EN","IT","FR","ES","PL","NL"].map(value=>`<option>${value}</option>`).join("")}</select><small>Unabhängig von der Cardmarket-Produkt-ID.</small></label>
    <label>Zustand<select name="condition">${["NM","EX","GD","LP","PL"].map(value=>`<option>${value}</option>`).join("")}</select></label>
    <label>Edition<select name="edition">${["Unbekannt","1st Edition","Unlimited","Limited Edition"].map(value=>`<option>${value}</option>`).join("")}</select></label>
    <input name="suggestedSell" type="hidden"><div id="inventoryPriceSuggestion" class="inventory-price-suggestion full-width"><span>Druckvariante auswählen; der Marktpreis dient nur als Orientierung.</span></div>`;
  wrap.dataset.inventorySelection="required";
  modalHandler=data=>{
    if(!data.productId||!data.name){alert("Bitte zuerst die richtige Druckvariante aus der Ergebnisliste auswählen.");return false;}
    const quantity=Math.max(1,Math.round(Number(data.quantity||1))),unitPrice=Math.max(0,Number(data.unitPrice||0));
    const line={...data,quantity,unitPrice,receiptLineKey:uid(),receivedBusiness:0,receivedPrivate:0,receivedDamaged:0,cancelledQuantity:0,materializedBusiness:0,materializedPrivate:0,materializedDamaged:0};
    purchase.pendingItems ||= [];purchase.pendingItems.push(line);
    purchase.items=purchase.pendingItems.reduce((sum,item)=>sum+Number(item.quantity||1),0);
    purchase.cardValue=purchase.pendingItems.reduce((sum,item)=>sum+Number(item.quantity||1)*Number(item.unitPrice||0),0);
    purchase.inventoryCreated=false;
    if(scan)rememberScannerChoice(scan,line);
    addMovement({type:"Einkaufsposition ergänzt",quantity,productId:cleanProductId(line.productId),purchaseId:purchase.id,reference:`Einkauf ${purchase.orderNo||"-"}`,note:line.name});
    return true;
  };
  let searchTimer;
  wrap.oninput=event=>{if(event.target.id!=="inventoryCardSearch")return;clearTimeout(searchTimer);inventoryCardSearchSequence++;wrap.dataset.inventorySelection="required";["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","suggestedSell"].forEach(name=>{const field=wrap.querySelector(`[name="${name}"]`);if(field)field.value="";});document.getElementById("inventorySelectedCard").innerHTML="<span>Bitte die richtige Druckvariante auswählen.</span>";searchTimer=setTimeout(()=>renderInventoryCardSearch(event.target.value),220);};
  wrap.onclick=event=>{handleInventoryProductChoice(event);};
  inventoryModalVariants=new Map();configureModalAction();showDialogSafely(document.getElementById("modal"));
  if(!applyScannerModalRecognition(scan))setTimeout(()=>document.getElementById("inventoryCardSearch")?.focus(),0);
}

function addSaleLine(saleId,scan=null){
  const sale=state.sales.find(row=>row.id===saleId);if(!sale)return;
  inventoryCardSearchSequence++;inventoryPriceSequence++;
  document.getElementById("modalTitle").textContent=`Karte zu Verkauf #${sale.orderNo||"-"} hinzufügen`;
  const wrap=document.getElementById("modalFields");
  wrap.innerHTML=`
    ${scan?`<div class="scan-review full-width"><img src="${scan.imageDataUrl}" alt="Vom iPhone aufgenommenes Kartenfoto"><div><strong>${escapeHtml(scannerReviewTitle(scan))}</strong><span>${escapeHtml(scannerReviewDescription(scan))}</span></div></div>`:""}
    <label class="full-width inventory-card-search-label">Kartenname oder Setnummer suchen<input id="inventoryCardSearch" autocomplete="off" placeholder="Deutsch, Englisch oder Setnummer" value="${escapeHtml(scan?.hint||"")}"><div id="inventoryCardResults" class="inventory-card-results"></div></label>
    <div id="inventorySelectedCard" class="inventory-selected-card full-width"><span>Noch keine Druckvariante ausgewählt.</span></div>
    ${["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","cardPasscode"].map(name=>`<input type="hidden" name="${name}">`).join("")}
    <label>Set<input id="inventorySetDisplay" readonly></label><label>Setnummer<input id="inventoryNumberDisplay" readonly></label><label class="full-width">Version / Seltenheit<input id="inventoryRarityDisplay" readonly></label>
    <label>Menge<input name="quantity" type="number" min="1" step="1" value="1" required></label><label>Verkaufspreis pro Stück (€)<input name="unitPrice" type="number" min="0" step="0.01" required></label>
    <label>Kartensprache des Exemplars<select name="language">${["DE","EN","DE/EN","IT","FR","ES","PL","NL"].map(value=>`<option>${value}</option>`).join("")}</select><small>Unabhängig von der Cardmarket-Produkt-ID.</small></label><label>Zustand<select name="condition">${["NM","EX","GD","LP","PL"].map(value=>`<option>${value}</option>`).join("")}</select></label>
    <label>Edition<select name="edition">${["Unbekannt","1st Edition","Unlimited","Limited Edition"].map(value=>`<option>${value}</option>`).join("")}</select></label>
    <input name="suggestedSell" type="hidden"><div id="inventoryPriceSuggestion" class="inventory-price-suggestion full-width"><span>Druckvariante auswählen, um den VK-Vorschlag zu sehen.</span></div>`;
  wrap.dataset.inventorySelection="required";
  modalHandler=data=>{
    if(!data.productId||!data.name){alert("Bitte zuerst die richtige Druckvariante auswählen.");return false;}
    const line={...data,quantity:Math.max(1,Math.round(Number(data.quantity||1))),unitPrice:Math.max(0,Number(data.unitPrice||0)),matchedItemIds:[]};
    sale.items ||= [];sale.items.push(line);
    sale.quantity=sale.items.reduce((sum,item)=>sum+Number(item.quantity||1),0);sale.cardValue=sale.items.reduce((sum,item)=>sum+Number(item.quantity||1)*Number(item.unitPrice||0),0);sale.cardNames=sale.items.map(item=>`${item.quantity}× ${item.name}`).join(", ");
    if(Number(sale.revenue||0)<=0)sale.revenue=sale.cardValue+Number(sale.shippingPaid||0);
    if(scan)rememberScannerChoice(scan,line);
    addMovement({type:"Verkaufsposition ergänzt",quantity:line.quantity,productId:cleanProductId(line.productId),saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:line.name});
    setTimeout(()=>openSaleAllocation(sale.id),0);return true;
  };
  let searchTimer;
  wrap.oninput=event=>{if(event.target.id!=="inventoryCardSearch")return;clearTimeout(searchTimer);inventoryCardSearchSequence++;wrap.dataset.inventorySelection="required";["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","suggestedSell"].forEach(name=>{const field=wrap.querySelector(`[name="${name}"]`);if(field)field.value="";});document.getElementById("inventorySelectedCard").innerHTML="<span>Bitte die richtige Druckvariante auswählen.</span>";searchTimer=setTimeout(()=>renderInventoryCardSearch(event.target.value),220);};
  wrap.onclick=event=>{if(handleInventoryProductChoice(event))return;if(event.target.id==="applyInventorySuggestedPrice"){const price=Number(wrap.querySelector('[name="suggestedSell"]')?.value||0);const field=wrap.querySelector('[name="unitPrice"]');if(field&&price)field.value=price.toFixed(2);}};
  inventoryModalVariants=new Map();configureModalAction();showDialogSafely(document.getElementById("modal"));
  if(!applyScannerModalRecognition(scan))setTimeout(()=>document.getElementById("inventoryCardSearch")?.focus(),0);
}

function recalculatePurchaseTotals(purchase){
  purchase.items=(purchase.pendingItems||[]).reduce((sum,item)=>sum+Number(item.quantity||1),0);
  purchase.cardValue=(purchase.pendingItems||[]).reduce((sum,item)=>sum+Number(item.quantity||1)*Number(item.unitPrice||0),0);
}

function refreshPurchaseAssetCosts(purchase){
  const rows=TcgBusinessAutomation.allocatePurchaseCosts(purchase,purchase.costAllocationMethod||"value");
  rows.forEach(row=>{
    const key=`${purchase.id}:${row.receipt.key}`;
    [...state.inventory,...state.privateCollection].filter(asset=>asset.purchaseLineKey===key).forEach(asset=>{
      asset.cost=Number(row.unitCost||0);
      ["productId","metacardId","name","germanName","englishName","set","setName","collectorNumber","rarity","productUrl","cardPasscode","edition","language","condition"].forEach(field=>{if(row.item[field]!==undefined)asset[field]=row.item[field];});
    });
  });
}

function editPurchaseLine(purchaseId,index){
  const purchase=state.purchases.find(row=>row.id===purchaseId),line=purchase?.pendingItems?.[index];if(!purchase||!line)return;
  const receipt=TcgBusinessAutomation.normalizePurchaseReceiptLine(line,index);
  openModal(`Einkaufsposition korrigieren – ${line.name||"Karte"}`,[
    {name:"quantity",label:`Bestellmenge (mindestens ${receipt.assigned} bereits zugeteilt)`,type:"number",required:true},
    {name:"unitPrice",label:"Stückpreis (€)",type:"number",step:"0.01",required:true},
    {name:"set",label:"Set / Setkürzel"},{name:"setName",label:"Setname"},{name:"collectorNumber",label:"Setnummer"},
    {name:"rarity",label:"Version / Seltenheit"},{name:"language",label:"Sprache"},{name:"condition",label:"Zustand"},
    {name:"edition",label:"Edition"},{name:"cardPasscode",label:"Yu-Gi-Oh!-Karten-ID"},
    {name:"reason",label:"Grund der Korrektur",required:true,full:true}
  ],{...line,reason:""},data=>{
    const quantity=Math.max(0,Math.round(Number(data.quantity||0)));
    if(quantity<receipt.assigned){alert(`${receipt.assigned} Exemplare sind bereits zugeteilt. Reduziere diese zuerst über eine Bestands-/Eigentumskorrektur.`);return false;}
    Object.assign(line,{quantity,unitPrice:Math.max(0,Number(data.unitPrice||0)),set:String(data.set||"").trim(),setName:String(data.setName||"").trim(),collectorNumber:String(data.collectorNumber||"").trim(),rarity:String(data.rarity||"").trim(),language:String(data.language||"").trim(),condition:String(data.condition||"").trim(),edition:String(data.edition||"").trim(),cardPasscode:String(data.cardPasscode||"").trim()});
    const productId=cleanProductId(line.productId);
    if(productId){const metadata={set:line.set,setName:line.setName,collectorNumber:line.collectorNumber,rarity:line.rarity};state.productCatalog[productId]={...(state.productCatalog[productId]||{}),...metadata,productId,name:line.name||state.productCatalog[productId]?.name||""};state.inventory.filter(item=>cleanProductId(item.productId)===productId).forEach(item=>Object.assign(item,metadata));state.privateCollection.filter(item=>cleanProductId(item.productId)===productId).forEach(item=>Object.assign(item,metadata));state.sales.forEach(order=>(order.items||[]).filter(item=>cleanProductId(item.productId)===productId).forEach(item=>Object.assign(item,metadata)));}
    recalculatePurchaseTotals(purchase);purchase.inventoryCreated=(purchase.pendingItems||[]).every((item,rowIndex)=>TcgBusinessAutomation.normalizePurchaseReceiptLine(item,rowIndex).open===0);
    refreshPurchaseAssetCosts(purchase);
    addMovement({type:"Einkaufsposition korrigiert",quantity:0,productId,purchaseId:purchase.id,reference:`Einkauf ${purchase.orderNo||"-"}`,note:String(data.reason||"").trim()});return true;
  });
}

function repairPurchaseLineIdentity(purchaseId,index,options={}){
  const purchase=state.purchases.find(row=>row.id===purchaseId),line=purchase?.pendingItems?.[index];if(!purchase||!line)return;
  inventoryCardSearchSequence++;inventoryPriceSequence++;
  document.getElementById("modalTitle").textContent=`Karte in Einkauf #${purchase.orderNo||"-"} zuordnen`;
  const wrap=document.getElementById("modalFields");
  wrap.innerHTML=`
    <div class="info full-width"><strong>Vorhandene Einkaufsposition</strong><br>${escapeHtml(line.name||"Unbekannte Karte")} · ${Number(line.quantity||1)} Exemplar(e). Die Menge und der Wareneingang bleiben unverändert.</div>
    <label class="full-width inventory-card-search-label">Kartenname oder Setnummer suchen<input id="inventoryCardSearch" autocomplete="off" placeholder="Deutsch, Englisch oder Setnummer" value="${escapeHtml(line.name||"")}"><div id="inventoryCardResults" class="inventory-card-results"></div></label>
    <div id="inventorySelectedCard" class="inventory-selected-card full-width"><span>Bitte die richtige Druckvariante auswählen.</span></div>
    ${["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","cardPasscode"].map(name=>`<input type="hidden" name="${name}">`).join("")}
    <label>Set<input id="inventorySetDisplay" readonly></label><label>Setnummer<input id="inventoryNumberDisplay" readonly></label>
    <label class="full-width">Version / Seltenheit<input id="inventoryRarityDisplay" readonly></label>
    <label class="full-width">Grund der Zuordnung<input name="reason" value="Fehlende Cardmarket-ID und Druckvariante ergänzt" required></label>`;
  wrap.dataset.inventorySelection="required";
  modalHandler=data=>{
    if(!data.productId||!data.name){alert("Bitte zuerst die richtige Druckvariante aus der Ergebnisliste auswählen.");return false;}
    const beforeProductId=cleanProductId(line.productId);
    ["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","cardPasscode"].forEach(field=>line[field]=data[field]||"");
    const productId=cleanProductId(line.productId);
    if(productId)state.productCatalog[productId]={...(state.productCatalog[productId]||{}),...line,productId};
    refreshPurchaseAssetCosts(purchase);
    (state.sales||[]).forEach(sale=>(sale.items||[]).filter(item=>beforeProductId&&cleanProductId(item.productId)===beforeProductId).forEach(item=>{
      ["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl","cardPasscode"].forEach(field=>item[field]=line[field]||"");
    }));
    addMovement({type:"Einkaufskarte zugeordnet",quantity:0,productId,purchaseId:purchase.id,reference:`Einkauf ${purchase.orderNo||"-"}`,note:String(data.reason||"").trim()});
    return true;
  };
  let searchTimer;
  wrap.oninput=event=>{if(event.target.id!=="inventoryCardSearch")return;clearTimeout(searchTimer);inventoryCardSearchSequence++;wrap.dataset.inventorySelection="required";["productId","metacardId","name","germanName","englishName","set","setName","variant","rarity","collectorNumber","productUrl"].forEach(name=>{const field=wrap.querySelector(`[name="${name}"]`);if(field)field.value="";});document.getElementById("inventorySelectedCard").innerHTML="<span>Bitte die richtige Druckvariante auswählen.</span>";searchTimer=setTimeout(()=>renderInventoryCardSearch(event.target.value,line),220);};
  wrap.onclick=event=>{handleInventoryProductChoice(event);};
  inventoryModalVariants=new Map();configureModalAction();
  if(options.returnToReceipt){
    const modal=document.getElementById("modal");
    modal.addEventListener("close",()=>setTimeout(()=>openPurchaseReceipt(purchase.id,options.receiptDraft),0),{once:true});
  }
  showDialogSafely(document.getElementById("modal"));
  if(line.name)setTimeout(()=>renderInventoryCardSearch(line.name,line),0);else setTimeout(()=>document.getElementById("inventoryCardSearch")?.focus(),0);
}

function deletePurchaseLine(purchaseId,index){
  const purchase=state.purchases.find(row=>row.id===purchaseId),line=purchase?.pendingItems?.[index];if(!purchase||!line)return;
  const receipt=TcgBusinessAutomation.normalizePurchaseReceiptLine(line,index);
  if(receipt.assigned){alert("Diese Position kann nicht entfernt werden, weil bereits Exemplare zugeteilt wurden.");return;}
  if(!confirm(`Position „${line.name||"Karte"}“ aus dem Einkauf entfernen?`))return;
  purchase.pendingItems.splice(index,1);recalculatePurchaseTotals(purchase);refreshPurchaseAssetCosts(purchase);
  addMovement({type:"Einkaufsposition entfernt",quantity:-receipt.quantity,productId:cleanProductId(line.productId),purchaseId:purchase.id,reference:`Einkauf ${purchase.orderNo||"-"}`,note:line.name||"Karte"});
  saveState();renderAll();openOrderDetails("purchase",purchase.id);
}

function purchaseOwnershipTotals(purchase){
  return window.TcgBusinessAutomation?.purchaseOwnershipTotals?.(purchase,purchase?.costAllocationMethod||"value")||{business:0,private:0,damaged:0,cancelled:0,open:0,total:0};
}

function purchaseBusinessCost(purchase){
  const shared=window.TcgBusinessAutomation?.purchaseBusinessCost?.(purchase);
  if(shared!==undefined)return Number(shared||0);
  if(!Array.isArray(purchase?.pendingItems)||!purchase.pendingItems.length){
    return purchase?.status==="Storniert"?0:Math.max(0,Number(purchase?.cardValue||0)+Number(purchase?.shipping||0)+Number(purchase?.extra||0)-Number(purchase?.refund||0));
  }
  const totals=purchaseOwnershipTotals(purchase);
  return Number(totals.business||0)+Number(totals.damaged||0);
}

function purchaseLineAssetBase(purchase,row){
  const item=row.item||{};
  const decision=row.decisionCost||TcgBusinessAutomation.decisionCostBreakdown({cardPrice:row.unitPrice,fullCost:row.unitCost,cartFiller:row.cartFillerStatus,incrementalShippingCost:row.incrementalShippingCost,incrementalDirectCost:row.incrementalDirectCost});
  return {
    productId:item.productId||"",metacardId:item.metacardId||"",name:item.name||item.germanName||item.englishName||"Unbekannte Karte",
    germanName:item.germanName||item.name||"",englishName:item.englishName||"",set:item.set||"",setName:item.setName||"",
    rarity:item.rarity||item.variant||"",language:item.language||"DE",condition:item.condition||"NM",edition:item.edition||"Unbekannt",cardPasscode:item.cardPasscode||"",
    collectorNumber:item.collectorNumber||item.setCode||"",productUrl:item.productUrl||"",cardPrice:Number(row.unitPrice||0),allocatedPurchaseShipping:Number(row.allocatedShipping||0),allocatedPurchaseExtra:Number(row.allocatedExtra||0),cost:Number(row.unitCost||0),costStatus:Number(row.unitCost||0)>0?"known":"confirmed_zero",
    cartFillerStatus:row.cartFillerStatus||"unknown",incrementalShippingCost:decision.incrementalShipping,incrementalDirectCost:decision.incrementalDirect,decisionCost:decision.decisionCost,decisionCostStatus:decision.status,
    purchaseDate:purchase.date||todayISO(),receivedDate:todayISO(),location:"",source:"Einkauf / Wareneingang",
    lotId:purchase.orderNo||purchase.id,importKey:purchase.importKey||purchase.orderNo||purchase.id,sourceRow:item.sourceRow,
    purchaseId:purchase.id,purchaseLineKey:`${purchase.id}:${row.receipt.key}`,ownership:"business",holdingProfile:"UNKLASSIFIZIERT",longTermHold:false,originalTargetSell:null,targetSell:null,listingHistory:[]
  };
}

function applyConfirmedTargetSell(asset,value,mode="manual",reason="Ziel-VK bestätigt"){
  const change=TcgBusinessAutomation.planTargetSellChange(asset,value,new Date().toISOString(),mode);
  if(!change.changed)return;
  asset.originalTargetSell=change.originalTargetSell;
  asset.targetSell=change.targetSell;
  asset.listingHistory=Array.isArray(asset.listingHistory)?asset.listingHistory:[];
  asset.listingHistory.push({...change.historyEntry,id:uid(),reason:reason||change.historyEntry.reason});
}

function applyPurchaseReceiptPlan(purchase,plan,note=""){
  if(!purchase||!plan?.valid)return 0;
  let created=0;
  plan.lines.forEach(row=>{
    const item=row.item;
    item.receiptLineKey=row.receipt.key;
    item.receivedBusiness=row.business;item.receivedPrivate=row.private;item.receivedDamaged=row.damaged;item.cancelledQuantity=row.cancelled;
    item.listBusiness=Boolean(row.listBusiness);item.receiptListingPrice=Number(row.listingPrice||0);item.suggestedSell=Number(row.suggestedSell||0);
    item.confirmedTargetSellPrice=row.confirmedTargetSellPrice==null?null:Number(row.confirmedTargetSellPrice);
    item.cartFillerStatus=row.cartFillerStatus||"unknown";item.incrementalShippingCost=row.incrementalShippingCost;item.incrementalDirectCost=row.incrementalDirectCost;item.decisionCostStatus=row.decisionCost?.status||"unknown";
    const linkKey=`${purchase.id}:${row.receipt.key}`;
    [...state.inventory,...(state.privateCollection||[])].filter(asset=>asset.purchaseLineKey===linkKey).forEach(asset=>{asset.cardPrice=Number(row.unitPrice||0);asset.allocatedPurchaseShipping=Number(row.allocatedShipping||0);asset.allocatedPurchaseExtra=Number(row.allocatedExtra||0);asset.cost=Number(row.unitCost||0);asset.costStatus=Number(row.unitCost||0)>0?"known":"confirmed_zero";asset.cartFillerStatus=row.cartFillerStatus||"unknown";asset.incrementalShippingCost=row.decisionCost?.incrementalShipping;asset.incrementalDirectCost=row.decisionCost?.incrementalDirect;asset.decisionCost=row.decisionCost?.decisionCost;asset.decisionCostStatus=row.decisionCost?.status||"unknown";if(row.confirmedTargetSellPrice!=null)applyConfirmedTargetSell(asset,row.confirmedTargetSellPrice,"manual","Beim Wareneingang bestätigt");});
    state.inventory.filter(asset=>asset.purchaseLineKey===linkKey&&!['Verkauft','Storniert'].includes(asset.status)).forEach(asset=>{const listed=Boolean(row.listBusiness&&row.listingPrice>0),price=listed?Number(row.listingPrice):0;appendListingChange(asset,{listed,price,mode:"suggested",reason:"Wareneingang"});asset.listed=listed;asset.listingPrice=price;asset.suggestedSell=Number(row.suggestedSell||0);});
    const base=purchaseLineAssetBase(purchase,row);
    for(let index=0;index<row.addBusiness;index++){
      const listed=Boolean(row.listBusiness&&row.listingPrice>0),listingPrice=listed?Number(row.listingPrice||0):0;
      const asset={...base,id:uid(),status:"Im Bestand",listed,listingPrice,suggestedSell:Number(row.suggestedSell||0),ownership:"business",listingHistory:listed?[{id:uid(),eventType:"first_listing",changedAt:new Date().toISOString(),oldPrice:null,newPrice:listingPrice,changeMode:"suggested",reason:"Beim Wareneingang inseriert"}]:[]};if(row.confirmedTargetSellPrice!=null)applyConfirmedTargetSell(asset,row.confirmedTargetSellPrice,"manual","Beim Wareneingang bestätigt");state.inventory.push(asset);created++;
    }
    for(let index=0;index<row.addPrivate;index++){
      state.privateCollection.push({...base,id:uid(),status:"Privatsammlung",listed:false,listingPrice:0,ownership:"private"});created++;
    }
    for(let index=0;index<row.addDamaged;index++){
      state.inventory.push({...base,id:uid(),status:"Beschädigt",listed:false,listingPrice:0,ownership:"business",note:[base.note,"Beim Wareneingang als beschädigt erfasst"].filter(Boolean).join(" · ")});created++;
    }
    item.materializedBusiness=row.business;item.materializedPrivate=row.private;item.materializedDamaged=row.damaged;
  });
  purchase.costAllocationMethod=plan.method;
  const previousStatus=purchase.status;purchase.status=plan.status;
  recordWorkflowChange(purchase,"Lieferstatus",previousStatus,purchase.status,note);
  purchase.inventoryCreated=plan.totals.open===0;
  purchase.receivedDate=(plan.totals.business+plan.totals.private+plan.totals.damaged)>0?(purchase.receivedDate||todayISO()):purchase.receivedDate;
  purchase.receiptHistory ||= [];
  purchase.receiptHistory.unshift({id:uid(),date:new Date().toISOString(),note:String(note||"").trim(),method:plan.method,totals:{...plan.totals}});
  if(plan.totals.addBusiness)addMovement({type:"Wareneingang / Geschäftsbestand",quantity:plan.totals.addBusiness,purchaseId:purchase.id,reference:`Einkauf ${purchase.orderNo||"-"}`,note:note||"Für den Verkauf übernommen"});
  if(plan.totals.addPrivate)addMovement({type:"Wareneingang / Privatsammlung",quantity:plan.totals.addPrivate,purchaseId:purchase.id,reference:`Einkauf ${purchase.orderNo||"-"}`,note:note||"Privat übernommen"});
  if(plan.totals.addDamaged)addMovement({type:"Wareneingang / Beschädigt",quantity:plan.totals.addDamaged,purchaseId:purchase.id,reference:`Einkauf ${purchase.orderNo||"-"}`,note:note||"Beschädigt übernommen"});
  return created;
}

function purchaseReceiptRows(purchase){
  return window.TcgBusinessAutomation?.allocatePurchaseCosts?.(purchase,purchase.costAllocationMethod||"value")||[];
}

function renderPurchaseReceipt(purchase){
  const target=document.getElementById("purchaseReceiptContent");
  const rows=purchaseReceiptRows(purchase);
  const body=rows.map((row,index)=>{
    const r=row.receipt,names=cardDisplayNames(row.item);
    const productId=cleanProductId(row.item.productId),catalog=state.productCatalog?.[productId]||{};
    const pricing=TcgBusinessAutomation.calculateOwnedCardPriceTargets({...catalog,...row.item,cost:Number(row.unitCost||0)},forwardPricingSettings());
    const experience=ownSalesExperienceFor(productId);
    const suggested=Number(row.item.suggestedSell||pricing.suggestedSell||experience?.medianSellPrice||0),listingPrice=Number(row.item.receiptListingPrice||suggested||0);
    const confirmedTarget=row.item.confirmedTargetSellPrice==null?null:Number(row.item.confirmedTargetSellPrice);
    const decision=TcgBusinessAutomation.decisionCostBreakdown({cardPrice:row.unitPrice,fullCost:row.unitCost,cartFiller:row.item.cartFillerStatus,incrementalShippingCost:row.item.incrementalShippingCost,incrementalDirectCost:row.item.incrementalDirectCost});
    const complete=inventoryPrintComplete(row.item);
    const plannedPrivate=r.assigned?0:Math.min(r.quantity,Number(row.item.plannedPrivate||0));
    const plannedBusiness=r.assigned?0:Math.min(r.quantity-plannedPrivate,Number(row.item.plannedBusiness||0));
    row.item.receiptLineKey ||= r.key;
    return `<tr data-receipt-row data-receipt-key="${escapeHtml(r.key)}" data-card-price="${Number(row.unitPrice||0)}" data-full-cost="${Number(row.unitCost||0)}" data-ordered="${r.quantity}" data-min-business="${r.materializedBusiness}" data-min-private="${r.materializedPrivate}" data-min-damaged="${r.materializedDamaged}">
      <td><strong>${escapeHtml(names.primary)}</strong>${names.secondary?`<small>Englisch: ${escapeHtml(names.secondary)}</small>`:""}<small>${escapeHtml([row.item.setName||row.item.set,row.item.collectorNumber,row.item.rarity].filter(Boolean).join(" · ")||"Druckdaten unvollständig")}</small><button type="button" class="badge ${complete?"green":"yellow"} receipt-print-repair" data-repair-receipt-print="${index}" title="Cardmarket-Druckvariante prüfen und zuordnen">${complete?"Variante ändern":"Druckdaten prüfen"}</button></td>
      <td><strong>${r.quantity}</strong></td>
      ${["business","private","damaged","cancelled"].map(key=>{const planned=key==="business"?plannedBusiness:key==="private"?plannedPrivate:0;return `<td><input class="receipt-quantity" data-receipt-value="${key}" type="number" min="${key==="business"?r.materializedBusiness:key==="private"?r.materializedPrivate:key==="damaged"?r.materializedDamaged:0}" max="${r.quantity}" step="1" value="${r[key]||planned||0}"></td>`;}).join("")}
      <td data-receipt-open><strong>${Math.max(0,r.open-plannedBusiness-plannedPrivate)}</strong></td><td><strong>${money(row.unitCost)}</strong><small>Karte, Versand und Zusatzkosten</small></td>
      <td>${suggested?`<strong>${money(suggested)}</strong><small>Markt-/Kostenvorschlag${experience?.medianSellPrice?` · eigener Median ${money(experience.medianSellPrice)}`:""}</small><button type="button" class="link-button" data-accept-target-suggestion="${suggested}">Als Ziel-VK übernehmen</button>`:'<span class="muted">Noch keine ausreichenden Daten</span>'}<input data-receipt-target type="number" min="0" step="0.01" placeholder="Ziel-VK optional" value="${confirmedTarget==null?"":confirmedTarget.toFixed(2)}"></td>
      <td><label>Warenkorbfüller<select data-receipt-cart-filler><option value="unknown" ${decision.cartFiller==null?"selected":""}>Unbekannt</option><option value="yes" ${decision.cartFiller===true?"selected":""}>Ja</option><option value="no" ${decision.cartFiller===false?"selected":""}>Nein</option></select></label><label>Zusätzlicher Versand (€)<input data-receipt-incremental-shipping type="number" min="0" step="0.01" placeholder="0,00 bestätigen" value="${decision.incrementalShipping==null?"":decision.incrementalShipping.toFixed(2)}"></label><label>Weitere direkte Kosten (€)<input data-receipt-incremental-direct type="number" min="0" step="0.01" placeholder="0,00 bestätigen" value="${decision.incrementalDirect==null?"":decision.incrementalDirect.toFixed(2)}"></label><small data-receipt-decision-cost>Entscheidungs-EK: ${decision.decisionCost==null?"unbekannt":money(decision.decisionCost)}</small></td>
      <td><input class="receipt-listing-price" data-receipt-listing-price type="number" min="0" step="0.01" value="${listingPrice?listingPrice.toFixed(2):""}"><label class="receipt-list-check"><input data-receipt-list type="checkbox" ${row.item.listBusiness?"checked":""}> Im Manager direkt als inseriert markieren</label><input data-receipt-suggested type="hidden" value="${suggested}"></td></tr>`;
  }).join("");
  target.innerHTML=rows.length?`<div class="table-wrap"><table class="receipt-table"><thead><tr><th>Karte / Druck</th><th>Bestellt</th><th>Geschäft</th><th>Privat</th><th>Beschädigt</th><th>Storniert</th><th>Offen</th><th>Vollkosten-EK</th><th>Ziel-VK</th><th>Kaufentscheidung</th><th>Direkt inserieren</th></tr></thead><tbody>${body}</tbody></table></div><div class="info">Ziel-VK und Entscheidungs-EK werden nur nach deiner Eingabe gespeichert. Der Entscheidungs-EK dient nicht zur Gewinnrechnung; Gewinn und ROI bleiben auf Vollkostenbasis.</div><div id="purchaseReceiptValidation" class="receipt-validation"></div>`:`<div class="warning">Für diesen Einkauf sind keine einzelnen Kartenpositionen vorhanden. Bitte zuerst Karten hinzufügen.</div>`;
}

function updateReceiptOpenValues(){
  document.querySelectorAll("#purchaseReceiptContent [data-receipt-row]").forEach(row=>{
    const ordered=Number(row.dataset.ordered||0);
    const assigned=[...row.querySelectorAll("[data-receipt-value]")].reduce((sum,input)=>sum+Math.max(0,Math.round(Number(input.value||0))),0);
    const open=ordered-assigned;row.querySelector("[data-receipt-open]").innerHTML=`<strong class="${open<0?"money-negative":""}">${open}</strong>`;
  });
}

function updateReceiptDecisionCostValue(row){
  if(!row)return;
  const value=TcgBusinessAutomation.decisionCostBreakdown({
    cardPrice:Number(row.dataset.cardPrice||0),fullCost:Number(row.dataset.fullCost||0),
    cartFiller:row.querySelector("[data-receipt-cart-filler]")?.value||"unknown",
    incrementalShippingCost:row.querySelector("[data-receipt-incremental-shipping]")?.value===""?null:Number(row.querySelector("[data-receipt-incremental-shipping]")?.value||0),
    incrementalDirectCost:row.querySelector("[data-receipt-incremental-direct]")?.value===""?null:Number(row.querySelector("[data-receipt-incremental-direct]")?.value||0)
  });
  const target=row.querySelector("[data-receipt-decision-cost]");
  if(target)target.textContent=`Entscheidungs-EK: ${value.decisionCost==null?"unbekannt":money(value.decisionCost)}`;
}

function restorePurchaseReceiptDraft(draft){
  if(!draft)return;
  const requests=new Map((draft.requests||[]).map(row=>[String(row.key),row]));
  document.querySelectorAll("#purchaseReceiptContent [data-receipt-row]").forEach(row=>{
    const request=requests.get(String(row.dataset.receiptKey));if(!request)return;
    row.querySelectorAll("[data-receipt-value]").forEach(input=>{input.value=Math.max(0,Math.round(Number(request[input.dataset.receiptValue]||0)));});
    const listed=row.querySelector("[data-receipt-list]");if(listed)listed.checked=Boolean(request.listBusiness);
    const price=row.querySelector("[data-receipt-listing-price]");if(price)price.value=Number(request.listingPrice||0)>0?Number(request.listingPrice).toFixed(2):"";
    const suggested=row.querySelector("[data-receipt-suggested]");if(suggested)suggested.value=Math.max(0,Number(request.suggestedSell||0));
    const target=row.querySelector("[data-receipt-target]");if(target)target.value=request.confirmedTargetSellPrice==null||request.confirmedTargetSellPrice===""?"":Number(request.confirmedTargetSellPrice).toFixed(2);
    const cartFiller=row.querySelector("[data-receipt-cart-filler]");if(cartFiller)cartFiller.value=request.cartFillerStatus||"unknown";
    const incrementalShipping=row.querySelector("[data-receipt-incremental-shipping]");if(incrementalShipping)incrementalShipping.value=request.incrementalShippingCost==null?"":request.incrementalShippingCost;
    const incrementalDirect=row.querySelector("[data-receipt-incremental-direct]");if(incrementalDirect)incrementalDirect.value=request.incrementalDirectCost==null?"":request.incrementalDirectCost;
  });
  document.getElementById("purchaseReceiptNote").value=String(draft.note||"");
  updateReceiptOpenValues();
}

function purchaseReceiptDraft(){
  return {
    method:document.getElementById("purchaseCostAllocation").value,
    note:document.getElementById("purchaseReceiptNote").value,
    requests:readPurchaseReceiptRequest()
  };
}

function openPurchaseReceipt(purchaseId,draft=null){
  const purchase=state.purchases.find(row=>row.id===purchaseId);if(!purchase)return;
  const dialog=document.getElementById("purchaseReceiptDialog");dialog.dataset.purchaseId=purchase.id;
  document.getElementById("purchaseReceiptTitle").textContent=`Wareneingang #${purchase.orderNo||"-"} aufteilen`;
  document.getElementById("purchaseCostAllocation").value=draft?.method||purchase.costAllocationMethod||"value";
  document.getElementById("purchaseReceiptNote").value="";
  renderPurchaseReceipt(purchase);
  restorePurchaseReceiptDraft(draft);
  showDialogSafely(dialog);
}

function readPurchaseReceiptRequest(){
  return [...document.querySelectorAll("#purchaseReceiptContent [data-receipt-row]")].map(row=>({
    key:row.dataset.receiptKey,
    ...Object.fromEntries([...row.querySelectorAll("[data-receipt-value]")].map(input=>[input.dataset.receiptValue,Math.max(0,Math.round(Number(input.value||0))) ])),
    listBusiness:Boolean(row.querySelector("[data-receipt-list]")?.checked),
    listingPrice:Math.max(0,Number(row.querySelector("[data-receipt-listing-price]")?.value||0)),
    suggestedSell:Math.max(0,Number(row.querySelector("[data-receipt-suggested]")?.value||0)),
    confirmedTargetSellPrice:row.querySelector("[data-receipt-target]")?.value===""?null:Math.max(0,Number(row.querySelector("[data-receipt-target]")?.value||0)),
    cartFillerStatus:row.querySelector("[data-receipt-cart-filler]")?.value||"unknown",
    incrementalShippingCost:row.querySelector("[data-receipt-incremental-shipping]")?.value===""?null:Math.max(0,Number(row.querySelector("[data-receipt-incremental-shipping]")?.value||0)),
    incrementalDirectCost:row.querySelector("[data-receipt-incremental-direct]")?.value===""?null:Math.max(0,Number(row.querySelector("[data-receipt-incremental-direct]")?.value||0))
  }));
}

function materializePurchaseInventory(purchase){
  if(!purchase||!Array.isArray(purchase.pendingItems)||!purchase.pendingItems.length)return 0;
  const requested=purchase.pendingItems.map((item,index)=>{const receipt=TcgBusinessAutomation.normalizePurchaseReceiptLine(item,index);return {key:receipt.key,business:receipt.quantity-receipt.private-receipt.damaged-receipt.cancelled,private:receipt.private,damaged:receipt.damaged,cancelled:receipt.cancelled};});
  const plan=TcgBusinessAutomation.planPurchaseReceipt(purchase,requested,purchase.costAllocationMethod||"value");
  return applyPurchaseReceiptPlan(purchase,plan,"Automatisch als Geschäftsbestand übernommen");
}

function recordWorkflowChange(record, field, from, to, note=""){
  if(String(from||"")===String(to||""))return;
  record.workflowHistory ||= [];
  record.workflowHistory.unshift({id:uid(),timestamp:new Date().toISOString(),field,from:String(from||""),to:String(to||""),note:String(note||"")});
  record.workflowHistory=record.workflowHistory.slice(0,100);
}

function addPurchase(initial={}) {
  const initialTotal=Number(initial.cardValue||0)+Number(initial.shipping||0)+Number(initial.extra||0);
  const derivedPayment=initial.status==="Storniert"?"Storniert":initial.paymentStatus||(Number(initial.refund||0)>=initialTotal&&Number(initial.refund||0)>0?"Erstattet":Number(initial.refund||0)>0?"Teilweise erstattet":"Bezahlt");
  const modalInitial={...initial,paymentStatus:derivedPayment,paidDate:initial.paidDate||(derivedPayment==="Bezahlt"?initial.date:"")};
  openModal(initial.id?"Einkauf bearbeiten":"Einkauf erfassen",[
    {name:"orderNo",label:"Bestellnummer",required:true},
    {name:"date",label:"Kaufdatum",type:"date",value:todayISO()},
    {name:"seller",label:"Händler"},
    {name:"country",label:"Händlerland"},
    {name:"items",label:"Kartenanzahl",type:"number"},
    {name:"cardValue",label:"Kartenwert (€)",type:"number",step:"0.01"},
    {name:"shipping",label:"Versand (€)",type:"number",step:"0.01"},
    {name:"extra",label:"Zusatzkosten (€)",type:"number",step:"0.01"},
    {name:"refund",label:"Erstattung / Gutschrift (€)",type:"number",step:"0.01"},
    {name:"paymentStatus",label:"Zahlungsstatus",type:"select",options:["Offen","Bezahlt","Teilweise erstattet","Erstattet","Storniert"]},
    {name:"paidDate",label:"Bezahlt am",type:"date"},
    {name:"status",label:"Lieferstatus",type:"select",options:["Bestellt","Unterwegs","Teilweise eingetroffen","Eingetroffen","Storniert"]},
    {name:"expectedDate",label:"Voraussichtliche Ankunft",type:"date"},
    {name:"trackingNumber",label:"Sendungsnummer"},
    {name:"note",label:"Notiz",full:true}
  ], modalInitial, data=>{
    const requestedStatus=data.status;
    const obj={...data,items:Number(data.items||0),cardValue:Number(data.cardValue||0),shipping:Number(data.shipping||0),extra:Number(data.extra||0),refund:Number(data.refund||0)};
    if(obj.paymentStatus==="Bezahlt"&&!obj.paidDate)obj.paidDate=obj.date||todayISO();
    let purchase;
    if(initial.id) {
      purchase=state.purchases.find(x=>x.id===initial.id);
      const previous={status:purchase.status,paymentStatus:purchase.paymentStatus||derivedPayment};
      Object.assign(purchase,obj);
      recordWorkflowChange(purchase,"Lieferstatus",previous.status,purchase.status);
      recordWorkflowChange(purchase,"Zahlungsstatus",previous.paymentStatus,purchase.paymentStatus);
    } else {
      purchase={...obj,id:uid(),pendingItems:[],inventoryCreated:false,workflowHistory:[]};
      recordWorkflowChange(purchase,"Einkauf","","Erfasst");
      state.purchases.push(purchase);
    }
    if(purchase.pendingItems?.length)recalculatePurchaseTotals(purchase);
    if(requestedStatus==="Eingetroffen"&&purchase.pendingItems?.length){
      const totals=purchaseOwnershipTotals(purchase);
      purchase.status=(totals.business+totals.private+totals.damaged+totals.cancelled)>0?"Teilweise eingetroffen":(initial.status||"Unterwegs");
      setTimeout(()=>openPurchaseReceipt(purchase.id),0);
    }
    refreshPurchaseAssetCosts(purchase);
    if(data.seller && !state.sellers.some(s=>String(s.name).toLowerCase()===String(data.seller).toLowerCase())) state.sellers.push(normalizePartnerRecord({name:data.seller,cardmarketName:data.seller,country:data.country},"seller"));
  });
}


function syncSaleInventoryStatus(sale) {
  if(!sale) return;
  const ids=new Set(Array.isArray(sale.itemIds)?sale.itemIds:[]);
  const changes=[];
  state.inventory.forEach(item=>{
    if(!ids.has(item.id)) return;
    const before=item.status||"Im Bestand";
    const after=["Storniert","Rückgabe eingetroffen"].includes(sale.status)?"Im Bestand":sale.status==="Rückgabe offen"?"Rückgabe unterwegs":sale.status==="Erstattet"?(before==="Rückgabe unterwegs"?"Rückgabe unterwegs":"Verkauft"):["Versendet","Abgeschlossen","Abgerechnet"].includes(sale.status)?"Verkauft":"Reserviert";
    if(before!==after)changes.push({item,before,after});
    if(after==="Im Bestand") {item.status=after; delete item.saleId; delete item.saleOrderNo; delete item.saleDate; delete item.saleMovementRecorded;}
    else if(after==="Verkauft") {item.status=after; item.saleDate=sale.shippedDate||sale.date||todayISO(); item.saleId=sale.id; item.saleOrderNo=sale.orderNo;item.saleMovementRecorded=true;}
    else {item.status=after; item.saleId=sale.id; item.saleOrderNo=sale.orderNo;delete item.saleMovementRecorded;}
  });
  const grouped=new Map();
  changes.forEach(change=>{
    let type="Statusänderung",quantity=0,note=`${change.before} → ${change.after}`;
    if(change.after==="Reserviert"){type=change.before==="Verkauft"?"Bestandsrückbuchung / Reservierung":"Reservierung";quantity=change.before==="Verkauft"?1:0;note="1 Exemplar von verfügbar nach reserviert verschoben";}
    else if(change.after==="Verkauft"){type="Bestandsabgang / Verkauf";quantity=-1;note="Reserviertes Exemplar verkauft";}
    else if(change.after==="Im Bestand"){type=change.before==="Verkauft"?"Bestandsrückbuchung":change.before==="Rückgabe unterwegs"?"Rückgabe eingetroffen":"Reservierung aufgehoben";quantity=change.before==="Verkauft"?1:0;note=change.before==="Rückgabe unterwegs"?"Rückgabe geprüft und wieder verfügbar":"Exemplar wieder verfügbar";}
    else if(change.after==="Rückgabe unterwegs"){type="Rückgabe angekündigt";quantity=0;note="Exemplar bleibt bis zum Eingang nicht verfügbar";}
    const groupKey=inventoryGroupKey(change.item);const key=`${type}|${quantity}|${groupKey}`;
    const row=grouped.get(key)||{type,quantity:0,productId:cleanProductId(change.item.productId),inventoryGroupKey:groupKey,note};
    row.quantity+=quantity;row.copies=(row.copies||0)+1;grouped.set(key,row);
  });
  grouped.forEach(row=>addMovement({...row,saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:row.copies>1?`${row.copies} Exemplare: ${row.note}`:row.note}));
}

function saleAllocationCandidates(line,sale,includeAll=false){
  const productId=cleanProductId(line.productId);
  const availableCandidates=state.inventory.filter(item=>{
    const linkedToSale=item.saleId===sale.id||(sale.itemIds||[]).includes(item.id);
    const available=!['Verkauft','Reserviert','Storniert','Beschädigt','Rückgabe unterwegs'].includes(item.status||'');
    return linkedToSale||available;
  });
  const candidates=availableCandidates.filter(item=>productId&&cleanProductId(item.productId)===productId);
  const language=String(line.language||'').toUpperCase(),condition=String(line.condition||'').toUpperCase();
  const exact=candidates.filter(item=>(!language||String(item.language||'').toUpperCase()===language)&&(!condition||String(item.condition||'').toUpperCase()===condition));
  const matching=exact.length?exact:candidates;
  const source=includeAll?availableCandidates:matching;
  return source.sort((a,b)=>Number(b.saleId===sale.id)-Number(a.saleId===sale.id)||Number(cleanProductId(b.productId)===productId)-Number(cleanProductId(a.productId)===productId)||cardDisplayNames(a).primary.localeCompare(cardDisplayNames(b).primary,"de",{numeric:true,sensitivity:"base"})||String(a.purchaseDate||'').localeCompare(String(b.purchaseDate||''))||String(a.id).localeCompare(String(b.id)));
}

function renderSaleAllocationDialog(sale){
  const dialog=document.getElementById('saleAllocationDialog');
  const lines=Array.isArray(sale.items)?sale.items:[];
  if(!lines.length){document.getElementById('saleAllocationContent').innerHTML='<div class="warning">Dieser Verkauf enthält noch keine kartengenauen Positionen. Füge die Karten zuerst beim Verkauf hinzu oder importiere die detaillierte Cardmarket-Bestellung.</div>';}
  else{
    const currentlyLinked=[...(sale.itemIds||[])];
    const currentlyLinkedItems=currentlyLinked.map(id=>state.inventory.find(item=>item.id===id)).filter(Boolean);
    const claimedDefaults=new Set();
    const rows=[];
    lines.forEach((line,lineIndex)=>{
      const quantity=Math.max(1,Math.round(Number(line.quantity||1)));
      const explicit=Array.isArray(line.matchedItemIds)?line.matchedItemIds:[];
      const candidates=saleAllocationCandidates(line,sale,saleAllocationShowAll);
      const strategy=state.settings.saleAllocationStrategy||"fifo";
      const automatic=strategy==="manual"?[]:TcgBusinessAutomation.selectInventoryForSale(state.inventory,{...line,strategy},quantity).selected;
      for(let unit=0;unit<quantity;unit++){
        const draftKey=`${lineIndex}:${unit}`;
        // Bei eingeblendeten Fremdvarianten niemals irgendeine Bestandskarte automatisch
        // vorauswählen. Nur eine bewusste Auswahl des Benutzers darf die Identität einer
        // Verkaufsposition ändern.
        const selectedId=TcgBusinessAutomation.selectSaleAllocationDefault({line,draftId:saleAllocationDraftSelections.get(draftKey),explicitId:explicit[unit],linkedItems:currentlyLinkedItems,automaticItems:automatic,candidates,claimedIds:claimedDefaults});
        if(selectedId)claimedDefaults.add(selectedId);
        if(selectedId)saleAllocationDraftSelections.set(draftKey,selectedId);
        const options=candidates.map(item=>{const matchingProduct=cleanProductId(line.productId)&&cleanProductId(item.productId)===cleanProductId(line.productId);const names=cardDisplayNames(item);return `<option value="${escapeHtml(item.id)}" ${item.id===selectedId?'selected':''}>${matchingProduct?'✓ Passend':'Andere Bestandskarte'} · ${escapeHtml(names.primary)} · ${escapeHtml([item.setName||item.set,item.collectorNumber,item.rarity,`CM ${item.productId||'fehlt'}`].filter(Boolean).join(' · '))} · ${escapeHtml(fmtDate(item.purchaseDate)||'-')} · EK ${money(item.cost)}</option>`;}).join('');
        rows.push(`<tr><td><strong>${escapeHtml(line.name||line.germanName||line.englishName||'Karte')}</strong><small>${escapeHtml([line.setName||line.set,line.collectorNumber,line.rarity,`CM ${line.productId||'fehlt'}`].filter(Boolean).join(' · '))}</small></td><td>${unit+1} / ${quantity}</td><td><select data-sale-allocation data-line-index="${lineIndex}" data-unit-index="${unit}"><option value="">Bitte Bestandsexemplar wählen</option>${options}</select>${!candidates.length?'<small class="money-negative">Keine passende freie Karte vorhanden. Aktiviere „Alle verfügbaren Bestandskarten“.</small>':''}</td></tr>`);
      }
    });
    const strategyLabel={fifo:"FIFO (ältester Einkauf)","lowest-cost":"niedrigster EK","highest-cost":"höchster EK",manual:"manuelle Auswahl"}[state.settings.saleAllocationStrategy||"fifo"];
    const availableCount=state.inventory.filter(item=>!['Verkauft','Reserviert','Storniert','Beschädigt','Rückgabe unterwegs'].includes(item.status||'')||item.saleId===sale.id).length;
    document.getElementById('saleAllocationContent').innerHTML=`<div class="sale-allocation-toolbar"><label class="switch-label"><input type="checkbox" id="saleAllocationShowAll" ${saleAllocationShowAll?'checked':''}> Alle ${availableCount} verfügbaren Bestandskarten anzeigen</label><small>${saleAllocationShowAll?'Passende Varianten stehen oben; abweichende Karten sind deutlich als „Andere Bestandskarte“ markiert.':'Standardmäßig werden nur passende Cardmarket-Produkt-IDs angezeigt.'}</small></div><div class="table-wrap"><table class="receipt-table"><thead><tr><th>Verkaufsposition</th><th>Exemplar</th><th>Bestandskarte / tatsächlicher EK</th></tr></thead><tbody>${rows.join('')}</tbody></table></div><div class="info">Voreinstellung: ${escapeHtml(strategyLabel)}. Eine bewusst abweichende Bestandskarte berichtigt beim Speichern auch die Karten- und CM-ID-Zuordnung der Verkaufsposition.</div>`;
    document.getElementById('saleAllocationShowAll').onchange=event=>{document.querySelectorAll('#saleAllocationContent [data-sale-allocation]').forEach(select=>saleAllocationDraftSelections.set(`${select.dataset.lineIndex}:${select.dataset.unitIndex}`,select.value));saleAllocationShowAll=event.target.checked;renderSaleAllocationDialog(sale);};
    document.getElementById('saleAllocationContent').onchange=event=>{if(event.target.matches('[data-sale-allocation]'))saleAllocationDraftSelections.set(`${event.target.dataset.lineIndex}:${event.target.dataset.unitIndex}`,event.target.value);};
  }
}

function openSaleAllocation(saleId){
  const sale=state.sales.find(row=>row.id===saleId);if(!sale)return;
  const dialog=document.getElementById('saleAllocationDialog');dialog.dataset.saleId=sale.id;
  saleAllocationShowAll=false;saleAllocationDraftSelections=new Map();
  renderSaleAllocationDialog(sale);
  showDialogSafely(dialog);
}

function saveSaleAllocation(){
  const dialog=document.getElementById('saleAllocationDialog');
  const sale=state.sales.find(row=>row.id===dialog.dataset.saleId);if(!sale)return false;
  const selects=[...document.querySelectorAll('#saleAllocationContent [data-sale-allocation]')];
  if(!selects.length){alert('Es sind keine kartengenauen Verkaufspositionen vorhanden.');return false;}
  if(selects.some(select=>!select.value)){alert('Bitte jeder verkauften Karte ein konkretes Bestandsexemplar zuordnen.');return false;}
  const ids=selects.map(select=>select.value);
  if(new Set(ids).size!==ids.length){alert('Ein Bestandsexemplar kann nicht mehrfach verkauft werden. Bitte die Zuordnung prüfen.');return false;}
  const selectedAssets=ids.map(id=>state.inventory.find(item=>item.id===id));
  if(selectedAssets.some(item=>!item)){alert('Mindestens eine ausgewählte Bestandskarte ist nicht mehr vorhanden. Bitte die Zuordnung neu öffnen.');return false;}
  const lineSelections=(sale.items||[]).map((line,index)=>{
    const lineSelects=selects.filter(select=>Number(select.dataset.lineIndex)===index).sort((a,b)=>Number(a.dataset.unitIndex)-Number(b.dataset.unitIndex));
    const assets=lineSelects.map(select=>state.inventory.find(item=>item.id===select.value)).filter(Boolean);
    const productIds=[...new Set(assets.map(item=>cleanProductId(item.productId)).filter(Boolean))];
    return {line,lineSelects,assets,productIds,mismatch:assets.some(item=>cleanProductId(item.productId)!==cleanProductId(line.productId))};
  });
  if(lineSelections.some(row=>row.productIds.length>1)){alert('Einer Verkaufsposition wurden unterschiedliche Kartenvarianten zugeordnet. Bitte pro Verkaufsposition nur Exemplare derselben Bestandskarte wählen.');return false;}
  const mismatchCount=lineSelections.reduce((sum,row)=>sum+(row.mismatch?row.assets.length:0),0);
  if(mismatchCount&&!confirm(`${mismatchCount} Zuordnung(en) weichen von der bisherigen Verkaufsposition ab. Die Karten- und CM-ID-Daten des Verkaufs werden an die gewählten Bestandskarten angepasst. Fortfahren?`))return false;
  const newIds=new Set(ids);
  (sale.itemIds||[]).filter(id=>!newIds.has(id)).forEach(id=>{
    const old=state.inventory.find(item=>item.id===id&&item.saleId===sale.id);if(!old)return;
    const previousStatus=old.status;
    old.status='Im Bestand';delete old.saleId;delete old.saleOrderNo;delete old.saleDate;delete old.saleMovementRecorded;
    addMovement({type:'Bestandszuordnung gelöst',quantity:previousStatus==='Verkauft'?1:0,productId:cleanProductId(old.productId),saleId:sale.id,reference:`Bestellung ${sale.orderNo||'-'}`,note:`Einkaufslos ${old.lotId||old.purchaseId||'-'} wieder freigegeben`});
  });
  const identityFields=['productId','metacardId','name','germanName','englishName','set','setName','collectorNumber','rarity','productUrl','cardPasscode','edition','language','condition'];
  lineSelections.forEach(({line,lineSelects,assets,mismatch})=>{
    line.matchedItemIds=lineSelects.map(select=>select.value);
    if(mismatch&&assets[0])identityFields.forEach(field=>line[field]=assets[0][field]||'');
  });
  sale.itemIds=ids;
  const assets=ids.map(id=>state.inventory.find(item=>item.id===id)).filter(Boolean);
  sale.cost=assets.reduce((sum,item)=>sum+Number(item.cost||0),0);
  sale.historicalCostStatus="linked";
  sale.costSource="inventory_lots";
  sale.excludeCostFromLearning=false;
  delete sale.historicalCostNote;
  delete sale.historicalCostConfirmedAt;
  sale.quantity=ids.length;
  sale.cardNames=(sale.items||[]).map(item=>`${Number(item.quantity||1)}× ${item.name||item.germanName||item.englishName||'Karte'}`).join(', ');
  syncSaleInventoryStatus(sale);
  addMovement({type:'Bestandszuordnung',quantity:0,saleId:sale.id,reference:`Bestellung ${sale.orderNo||'-'}`,note:`${ids.length} konkrete Einkaufsexemplare zugeordnet; Wareneinsatz ${money(sale.cost)}`});
  saveState();renderAll();dialog.close();openOrderDetails('sale',sale.id);return true;
}

function addSale(initial={}) {
  const derivedPayment=initial.status==="Storniert"?"Storniert":initial.status==="Erstattet"?"Erstattet":initial.paymentStatus||(initial.status&&initial.status!=="Offen"?"Bezahlt":"Offen");
  const derivedSettlement=initial.settlementStatus||(initial.status==="Abgerechnet"?"Abgerechnet":"Offen");
  const modalInitial={...initial,paymentStatus:derivedPayment,settlementStatus:derivedSettlement,paidDate:initial.paidDate||(derivedPayment==="Bezahlt"?initial.date:"")};
  openModal(initial.id?"Verkauf bearbeiten":"Verkauf erfassen",[
    {name:"orderNo",label:"Bestellnummer",required:true},
    {name:"date",label:"Verkaufsdatum",type:"date",value:todayISO()},
    {name:"customer",label:"Kunde"},
    {name:"country",label:"Kundenland"},
    {name:"quantity",label:"Kartenanzahl",type:"number"},
    {name:"cardNames",label:"Karten",full:true},
    {name:"revenue",label:"Gesamteinnahme inkl. Käufer-Versand (€)",type:"number",step:"0.01"},
    {name:"cost",label:"Einstand verkaufter Karten (€)",type:"number",step:"0.01"},
    {name:"fee",label:"Gebühr (€) – leer = automatisch",type:"number",step:"0.01"},
    {name:"shippingPaid",label:"Versand vom Käufer (€)",type:"number",step:"0.01"},
    {name:"postage",label:"Tatsächliches Porto (€)",type:"number",step:"0.01"},
    {name:"refund",label:"Erstattung an Käufer (€)",type:"number",step:"0.01"},
    {name:"paymentStatus",label:"Zahlungsstatus",type:"select",options:["Offen","Bezahlt","Erstattet","Storniert"]},
    {name:"paidDate",label:"Bezahlt am",type:"date"},
    {name:"settlementStatus",label:"Abrechnungsstatus",type:"select",options:["Offen","Abgerechnet"]},
    {name:"settledDate",label:"Abgerechnet am",type:"date"},
    {name:"trackingNumber",label:"Sendungsnummer"},
    {name:"status",label:"Vorgangsstatus",type:"select",options:["Offen","Bezahlt","Kommissioniert","Verpackt","Versendet","Rückgabe offen","Rückgabe eingetroffen","Erstattet","Abgeschlossen","Abgerechnet","Storniert"]},
    {name:"note",label:"Notiz",full:true}
  ], modalInitial, data=>{
    const obj={...data,quantity:Number(data.quantity||0),revenue:Number(data.revenue||0),cost:Number(data.cost||0),shippingPaid:Number(data.shippingPaid||0),postage:Number(data.postage||0),refund:Number(data.refund||0)};
    if(obj.cost>0){obj.historicalCostStatus="confirmed";obj.costSource="manual_sale_entry";obj.excludeCostFromLearning=false;}
    if(obj.paymentStatus==="Bezahlt"&&!obj.paidDate)obj.paidDate=obj.date||todayISO();
    if(obj.settlementStatus==="Abgerechnet"&&!obj.settledDate)obj.settledDate=todayISO();
    let sale;
    if(initial.id) { sale=state.sales.find(x=>x.id===initial.id);const previous={status:sale.status,paymentStatus:sale.paymentStatus||derivedPayment,settlementStatus:sale.settlementStatus||derivedSettlement};Object.assign(sale,obj);recordWorkflowChange(sale,"Vorgangsstatus",previous.status,sale.status);recordWorkflowChange(sale,"Zahlungsstatus",previous.paymentStatus,sale.paymentStatus);recordWorkflowChange(sale,"Abrechnungsstatus",previous.settlementStatus,sale.settlementStatus); }
    else { sale={...obj,id:uid(),items:[],itemIds:[],workflowHistory:[]};recordWorkflowChange(sale,"Verkauf","","Erfasst");state.sales.push(sale); }
    syncSaleInventoryStatus(sale);
    if(sale.items?.length&&sale.itemIds?.length<(sale.items||[]).reduce((sum,item)=>sum+Number(item.quantity||1),0)&&!["Storniert","Erstattet"].includes(sale.status))setTimeout(()=>openSaleAllocation(sale.id),0);
    if(data.customer && !state.customers.some(c=>String(c.name).toLowerCase()===String(data.customer).toLowerCase())) state.customers.push(normalizePartnerRecord({name:data.customer,cardmarketName:data.customer,country:data.country},"customer"));
  });
}

function addWatch(initial={}) {
  const modalInitial={...initial,pricingMode:initial.pricingMode||"automatic"};
  openModal(initial.id?"Watchlist bearbeiten":"Karte beobachten",[
    {name:"priority",label:"Priorität",type:"select",options:["A","B","C"]},
    {name:"productId",label:"CM Produkt-ID"},
    {name:"name",label:"Kartenname",required:true},
    {name:"set",label:"Set"},
    {name:"version",label:"Version / Seltenheit"},
    {name:"productUrl",label:"Cardmarket-Link zur genauen Version",full:true},
    {name:"target",label:"Sollbestand",type:"number",value:state.settings.targetStock},
    {name:"pricingMode",label:"Preisgrenzen",type:"select",options:[{value:"automatic",label:"Automatisch aus Marktdaten"},{value:"manual",label:"Manuell festlegen"}]},
    {name:"maxBuy",label:"Max. Einkauf (€)",type:"number",step:"0.01"},
    {name:"currentBuy",label:"Price Guide Low (€)",type:"number",step:"0.01"},
    {name:"targetSell",label:"Marktgestützter Ziel-VK (€)",type:"number",step:"0.01"},
    {name:"trend",label:"Cardmarket Price Trend (€)",type:"number",step:"0.01"},
    {name:"avg30",label:"Cardmarket Ø 30 Tage (€)",type:"number",step:"0.01"},
    {name:"reprint",label:"Reprint-Risiko",type:"select",options:["Niedrig","Mittel","Hoch"]},
    {name:"banlist",label:"Banlist-Risiko",type:"select",options:["Niedrig","Mittel","Hoch"]}
  ], modalInitial, data=>{
    const obj={...data,target:Number(data.target||0),maxBuy:Number(data.maxBuy||0),currentBuy:data.currentBuy===""?"":Number(data.currentBuy),targetSell:Number(data.targetSell||0),trend:data.trend===""?"":Number(data.trend),avg30:data.avg30===""?"":Number(data.avg30)};
    if(obj.pricingMode!=="manual")Object.assign(obj,automaticWatchTargets(obj));
    if(initial.id) Object.assign(state.watchlist.find(x=>x.id===initial.id),obj); else state.watchlist.push({...obj,id:uid(),stock:0});
  });
}

function addPartner(kind, initial={}) {
  const isSeller=kind==="seller";
  const fields=[
    {name:"name",label:"Interner Name",required:true},
    {name:"cardmarketName",label:"Cardmarket-Benutzername",required:true},
    {name:"externalId",label:"Cardmarket-Konto-ID (optional, für spätere API)"},
    {name:"realName",label:"Name / Firma"},
    {name:"country",label:"Land"},
    {name:"language",label:"Sprache"},
    {name:"status",label:"Status",type:"select",options:["Aktiv","Inaktiv","Gesperrt"]},
    {name:"favorite",label:"Favorit",type:"select",options:["Nein","Ja"]},
    {name:"email",label:"E-Mail"},
    {name:"phone",label:"Telefon"},
    ...(isSeller?[
      {name:"rating",label:"Gesamtbewertung"},
      {name:"shippingSpeed",label:"Versandgeschwindigkeit",type:"select",options:["","Sehr schnell","Schnell","Normal","Langsam"]},
      {name:"packagingQuality",label:"Verpackungsqualität",type:"select",options:["","Sehr gut","Gut","In Ordnung","Schlecht"]},
      {name:"conditionAccuracy",label:"Zustand wie beschrieben",type:"select",options:["","Immer","Meistens","Unklar","Nein"]},
      {name:"communication",label:"Kommunikation",type:"select",options:["","Sehr gut","Gut","Neutral","Schlecht"]}
    ]:[
      {name:"rating",label:"Bewertung",type:"select",options:["Offen","Positiv","Neutral","Negativ"]},
      {name:"preferredShipping",label:"Bevorzugter Versand"},
      {name:"trackingRequired",label:"Tracking erforderlich",type:"select",options:["Nein","Ja"]}
    ]),
    {name:"complaints",label:"Reklamationen",type:"number"},
    {name:"note",label:"Notizen",full:true}
  ];
  const modalInitial={...initial,
    favorite:initial.favorite?"Ja":"Nein",
    trackingRequired:initial.trackingRequired?"Ja":"Nein"
  };
  openModal(initial.id?`${isSeller?"Händler":"Kunde"} bearbeiten`:`${isSeller?"Händler":"Kunde"} hinzufügen`,fields,modalInitial,data=>{
    const arr=isSeller?state.sellers:state.customers;
    const normalized=value=>normalizeSearchTerm(value).replaceAll(" ","");
    const duplicate=arr.find(row=>row.id!==initial.id&&(
      (data.externalId&&row.externalId&&String(row.externalId)===String(data.externalId))||
      (normalized(row.cardmarketName||row.name)&&normalized(row.cardmarketName||row.name)===normalized(data.cardmarketName||data.name))
    ));
    if(duplicate){alert(`Dieser ${isSeller?"Händler":"Kunde"} ist bereits als „${duplicate.cardmarketName||duplicate.name}“ gespeichert.`);return false;}
    const obj=normalizePartnerRecord({...data,
      favorite:data.favorite==="Ja",
      trackingRequired:data.trackingRequired==="Ja",
      complaints:Number(data.complaints||0)
    },isSeller?"seller":"customer");
    if(initial.id) Object.assign(arr.find(x=>x.id===initial.id),obj,{id:initial.id}); else arr.push(obj);
  });
}

function parseCsv(text) {
  const firstLine=text.split(/\r?\n/)[0]||"";
  const delimiter=(firstLine.match(/;/g)||[]).length >= (firstLine.match(/,/g)||[]).length ? ";" : ",";
  const rows=[]; let row=[], cur="", quote=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(c==='"' && quote && n==='"'){cur+='"';i++;continue;}
    if(c==='"'){quote=!quote;continue;}
    if(c===delimiter && !quote){row.push(cur);cur="";continue;}
    if((c==="\n"||c==="\r")&&!quote){
      if(c==="\r"&&n==="\n")i++;
      row.push(cur); if(row.some(v=>v!=="")) rows.push(row); row=[]; cur=""; continue;
    }
    cur+=c;
  }
  if(cur||row.length){row.push(cur);rows.push(row);}
  const headers=rows.shift().map(h=>h.trim());
  return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]??"").trim()])));
}

const getAny=(obj,names)=>{
  const lower=Object.fromEntries(Object.entries(obj).map(([k,v])=>[k.toLowerCase().replace(/\s+/g,""),v]));
  for(const n of names){const k=n.toLowerCase().replace(/\s+/g,""); if(k in lower) return lower[k];}
  return "";
};

async function readFile(file){ return await file.text(); }

function num(value, fallback=0) {
  if (value === null || value === undefined || value === "") return fallback;
  const normalized = String(value).trim().replace(/\s/g, "").replace(/€/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stockRowMetadata(r) {
  const productId = cleanProductId(getAny(r,["idProduct","productId","CM Produkt-ID"]));
  const imageUrl = getAny(r,["ImageUrl","imageUrl"]);
  const setFromImage = String(imageUrl||"").match(/\/5\/([^/]+)\/\d+\//)?.[1] || "";
  const sourceName=getAny(r,["Name","Karte","Product Name"]);
  const sourceIdentity=window.TcgCardSearch?.parseVariantLabel?.(sourceName)||{};
  return resolveProduct(productId, {
    name:sourceName,
    set:setFromImage || getAny(r,["SetCode","Set","ExpansionCode"]),
    setName:getAny(r,["Expansion","Setname"]),
    variant:sourceIdentity.variant||getAny(r,["Variant","Version"]),
    rarity:getAny(r,["Rarity","Seltenheit"]),
    language:getAny(r,["Language","Sprache"]),
    condition:getAny(r,["Condition","Zustand"]),
    collectorNumber:getAny(r,["CollectorNumber","Kartennr."]),
    productUrl:getAny(r,["ProductUrl","Produkt-URL"])
  });
}

function setStockRowProductId(row,productId){
  const matchingKey=Object.keys(row||{}).find(key=>["idproduct","productid","cmprodukt-id"].includes(String(key).toLowerCase().replace(/\s+/g,"")));
  row[matchingKey||"idProduct"]=String(productId||"");
}

async function resolveMissingStockProductIds(rows=[]){
  const cache=new Map();
  let resolved=0,unresolved=0;
  for(const row of rows){
    if(cleanProductId(getAny(row,["idProduct","productId","CM Produkt-ID"])))continue;
    const record=stockRowMetadata(row);
    const sourceIdentity=window.TcgCardSearch?.parseVariantLabel?.(record.name||"")||{};
    const cacheKey=[sourceIdentity.baseName,record.setName||record.set,record.rarity||sourceIdentity.rarity,sourceIdentity.variant].map(normalizeCardName).join("|");
    let candidate=cache.get(cacheKey);
    if(candidate===undefined){
      candidate=await safeCatalogVariantFor(record);
      cache.set(cacheKey,candidate||null);
    }
    if(!candidate){unresolved++;continue;}
    setStockRowProductId(row,candidate.productId);
    resolved++;
  }
  return {resolved,unresolved};
}

function updateCatalogFromRows(rows) {
  let updated=0;
  rows.forEach(r=>{
    const p=stockRowMetadata(r);
    if(!p.productId || !p.name || /^Unbekannte Karte/.test(p.name)) return;
    state.productCatalog[p.productId]={...state.productCatalog[p.productId],...p};
    updated++;
  });
  return updated;
}

function stockInventoryIdentity(item={}) {
  return window.TcgBusinessAutomation?.stockSnapshotIdentity?.(item)||`variant-v2:${inventoryVariantKey(item)}|${String(item.edition||"").trim().toUpperCase()}`;
}

function stockVariantIdentity(item={}) {
  return stockInventoryIdentity({...item,articleId:"",idArticle:""});
}

function stockReconciliationIdentity(item={}) {
  const editionText=String(item.edition||"").trim().toUpperCase();
  const edition=["","-","N/A","UNKNOWN","UNBEKANNT"].includes(editionText)?"":editionText;
  return [cleanProductId(item.productId),mapLanguage(item.language||"").trim().toUpperCase(),mapCondition(item.condition||"").trim().toUpperCase(),edition].join("|");
}

function stockSnapshotManaged(item={}) {
  return Boolean(item.stockIdentity)||/^STOCK-/i.test(String(item.importKey||item.lotId||""));
}

function rememberFieldChanges(item,patch,target) {
  const fields={};
  Object.entries(patch).forEach(([field,value])=>{
    if(item[field]===value)return;
    fields[field]={had:Object.prototype.hasOwnProperty.call(item,field),value:item[field]};
    item[field]=value;
  });
  if(Object.keys(fields).length)target.push({id:item.id,fields});
}

function recordLegacyInventoryEntries(items=[]) {
  items.filter(item=>!item.movementRecorded).forEach(item=>{
    addMovement({
      type:"Historischer Bestandseintrag",quantity:1,productId:cleanProductId(item.productId),inventoryGroupKey:inventoryGroupKey(item),inventoryItemId:item.id,
      timestamp:item.purchaseDate||todayISO(),reference:item.purchaseId?`Einkauf ${item.purchaseId}`:(item.lotId||"Früherer Bestand"),note:item.location||""
    });
    item.movementRecorded=true;
  });
}

function removeImport(importRecord, ask=true) {
  if(!importRecord) return;
  if(ask && !confirm(`Import „${importRecord.file}“ wirklich rückgängig machen?`)) return;
  const key=importRecord.key;
  let undoNotice="";
  if(importRecord.type==="inventory"&&importRecord.snapshotSync) {
    const newer=state.imports.some(row=>row.type==="inventory"&&row.snapshotSync&&row.id!==importRecord.id&&new Date(row.date)>new Date(importRecord.date));
    if(newer){alert("Nur der neueste Cardmarket-Bestandsabgleich kann rückgängig gemacht werden. Bitte zuerst den neueren Abgleich zurücknehmen.");return;}
    const createdIds=new Set(importRecord.createdIds||[]);
    let removedCreated=0,protectedCreated=0;
    state.inventory=state.inventory.filter(item=>{
      if(!createdIds.has(item.id))return true;
      if(["Reserviert","Verkauft"].includes(item.status)||item.saleId){protectedCreated++;return true;}
      removedCreated++;return false;
    });
    (importRecord.removedItems||[]).forEach(item=>{if(!state.inventory.some(current=>current.id===item.id))state.inventory.push(item);});
    (importRecord.updatedFieldsBefore||[]).forEach(change=>{
      const item=state.inventory.find(current=>current.id===change.id);if(!item)return;
      Object.entries(change.fields||{}).forEach(([field,before])=>{if(before.had)item[field]=before.value;else delete item[field];});
    });
    addMovement({type:"Bestandsabgleich rückgängig",quantity:(importRecord.removedItems||[]).length-removedCreated,reference:importRecord.file||key,note:"Letzten Cardmarket-Bestand wiederhergestellt"});
    if(protectedCreated)undoNotice=`${protectedCreated} inzwischen reservierte oder verkaufte Exemplare wurden zum Schutz der Verkaufsdaten nicht entfernt.`;
  } else if(importRecord.type==="inventory") {
    let protectedCount=0;
    state.inventory=state.inventory.filter(i=>{const matches=i.importKey===key||i.lotId===key;if(matches&&(["Reserviert","Verkauft"].includes(i.status)||i.saleId)){protectedCount++;return true;}return !matches;});
    if(protectedCount)undoNotice=`${protectedCount} inzwischen reservierte oder verkaufte Exemplare wurden zum Schutz der Verkaufsdaten nicht entfernt.`;
  } else if(importRecord.type==="purchase") {
    if(importRecord.mode==="update"){alert("Ein Aktualisierungsimport kann nicht pauschal rückgängig gemacht werden, weil frühere Wareneingänge geschützt sind. Du kannst nur den Historieneintrag entfernen oder die Bestellung gezielt bearbeiten.");return;}
    const purchaseIds=state.purchases.filter(p=>p.importKey===key || p.orderNo===key).map(p=>p.id);
    let protectedCount=0;
    state.inventory=state.inventory.filter(i=>{const matches=i.importKey===key||i.lotId===key||purchaseIds.includes(i.purchaseId);if(matches&&(["Reserviert","Verkauft"].includes(i.status)||i.saleId)){protectedCount++;return true;}return !matches;});
    state.privateCollection=state.privateCollection.filter(i=>!purchaseIds.includes(i.purchaseId));
    if(protectedCount)undoNotice=`${protectedCount} inzwischen reservierte oder verkaufte Exemplare wurden zum Schutz der Verkaufsdaten nicht entfernt.`;
    state.purchases=state.purchases.filter(p=>p.importKey!==key && p.orderNo!==key);
  } else if(importRecord.type==="sale") {
    const saleIds=state.sales.filter(s=>s.importKey===key || s.orderNo===key).map(s=>s.id);
    state.inventory.forEach(i=>{
      if(i.saleImportKey===key || saleIds.includes(i.saleId)) {
        i.status="Im Bestand"; delete i.saleDate; delete i.saleId; delete i.saleOrderNo; delete i.saleImportKey; delete i.saleMovementRecorded;
      }
    });
    state.sales=state.sales.filter(s=>s.importKey!==key && s.orderNo!==key);
  } else if(importRecord.type==="watchlist" && Array.isArray(importRecord.watchlistBefore)) {
    state.watchlist=structuredClone(importRecord.watchlistBefore);
  } else if(importRecord.type==="seller" && Array.isArray(importRecord.createdIds)) {
    const ids=new Set(importRecord.createdIds);state.sellers=state.sellers.filter(row=>!ids.has(row.id));
  } else if(importRecord.type==="customer" && Array.isArray(importRecord.createdIds)) {
    const ids=new Set(importRecord.createdIds);state.customers=state.customers.filter(row=>!ids.has(row.id));
  } else if(importRecord.type==="settlement") {
    state.reconciliations=state.reconciliations.filter(row=>row.id!==importRecord.reconciliationId&&row.importKey!==key);
  }
  state.imports=state.imports.filter(i=>i.id!==importRecord.id);
  saveState(); renderAll();
  if(undoNotice)alert(undoNotice);
}

async function importStock(file) {
  const rows=parseCsv(await readFile(file));
  if(!rows.length) throw new Error("Keine Datenzeilen gefunden.");
  const key=`STOCK-${file.name}-${Number(file.size||0)}-${Number(file.lastModified||0)}-${rows.length}`;
  const previous=state.imports.find(i=>i.type==="inventory" && i.key===key);
  if(previous)throw new Error("Dieser Cardmarket-Bestand wurde bereits verarbeitet. Bitte einen neueren Export auswählen.");
  const productIdResolution=await resolveMissingStockProductIds(rows);
  updateCatalogFromRows(rows);

  // Mengen aus offenen Bestellungen werden beim Bestandsimport reserviert und
  // erst nach Status „Eingetroffen“ durch createInventoryFromPurchase angelegt.
  const pendingOpen = pendingOpenPurchaseQuantities(state.purchases);
  let cards=0, unknown=0, skippedOpenOrders=0;
  const soldHistoryPreserved=state.inventory.filter(item=>["Verkauft","Storniert"].includes(item.status)).length;
  const snapshotRows=new Map();
  rows.forEach((r,idx)=>{
    const p=stockRowMetadata(r);
    const quantity=Math.max(0,Math.round(num(getAny(r,["Amount","count","quantity","Menge"]),1)));
    const offerPrice=num(getAny(r,["Price_EUR","price","Angebot/Stück"]),0);
    if(/^Unbekannte Karte/.test(p.name)) unknown++;

    const variantKey = inventoryVariantKey(p);
    const pendingQty = pendingOpen.get(variantKey) || 0;
    const skipQty = Math.min(quantity, pendingQty);
    const createQty = Math.max(0, quantity - skipQty);
    if (skipQty) {
      pendingOpen.set(variantKey, pendingQty - skipQty);
      skippedOpenOrders += skipQty;
    }

    const articleId=cleanProductId(getAny(r,["ArticleID","idArticle"]));
    const identity=stockInventoryIdentity({...p,articleId,listingPrice:offerPrice});
    const current=snapshotRows.get(identity)||{identity,quantity:0,p,offerPrice,articleId,sourceRow:idx+2};
    current.quantity+=createQty;
    current.p=p;current.offerPrice=offerPrice;current.articleId=articleId;
    snapshotRows.set(identity,current);
    cards+=createQty;
  });

  const createdIds=[],removedItems=[],updatedFieldsBefore=[];
  const movementDeltas=[];
  const existingByIdentity=new Map();
  const availableByVariant=new Map();
  const isSnapshotOnlyItem=item=>!item.purchaseId&&!item.purchaseLineKey&&(
    item.source==="Cardmarket-Bestandsabgleich"||/^STOCK-/i.test(String(item.importKey||item.lotId||""))
  );
  state.inventory.forEach(item=>{
    const identity=stockInventoryIdentity(item);
    const managed=stockSnapshotManaged(item);
    if(managed)item.stockIdentity=identity;
    if(managed||item.listed){
      if(!existingByIdentity.has(identity))existingByIdentity.set(identity,[]);
      existingByIdentity.get(identity).push(item);
    }
    if(!managed&&!['Verkauft','Storniert','Reserviert','Beschädigt','Rückgabe unterwegs'].includes(item.status)&&!item.saleId){
      const variantIdentity=stockReconciliationIdentity(item);
      if(!availableByVariant.has(variantIdentity))availableByVariant.set(variantIdentity,[]);
      availableByVariant.get(variantIdentity).push(item);
    }
  });

  const claimedAvailableIds=new Set();
  snapshotRows.forEach(row=>{
    const exact=[...(existingByIdentity.get(row.identity)||[])];
    const exactIds=new Set(exact.map(item=>item.id));
    const availableFallback=(availableByVariant.get(stockReconciliationIdentity(row.p))||[])
      .filter(item=>!exactIds.has(item.id)&&!claimedAvailableIds.has(item.id))
      .sort((a,b)=>Number(Boolean(b.purchaseId||b.purchaseLineKey))-Number(Boolean(a.purchaseId||a.purchaseLineKey)) || new Date(a.purchaseDate||0)-new Date(b.purchaseDate||0))
      .slice(0,row.quantity);
    availableFallback.forEach(item=>claimedAvailableIds.add(item.id));
    const existing=[...exact,...availableFallback].sort((a,b)=>
      Number(Boolean(b.purchaseId||b.purchaseLineKey))-Number(Boolean(a.purchaseId||a.purchaseLineKey))
      || Number(isSnapshotOnlyItem(a))-Number(isSnapshotOnlyItem(b))
      || new Date(a.purchaseDate||0)-new Date(b.purchaseDate||0)
    );
    const available=TcgBusinessAutomation.calculateInventoryBuckets(existing).availableItems;
    const activeSnapshotItems=available.slice(0,row.quantity);
    const overflow=available.slice(row.quantity);
    const removeIds=new Set(overflow.filter(isSnapshotOnlyItem).map(item=>item.id));
    const removed=existing.filter(item=>removeIds.has(item.id));
    recordLegacyInventoryEntries(removed);
    removed.forEach(item=>removedItems.push(structuredClone(item)));
    if(removeIds.size)state.inventory=state.inventory.filter(item=>!removeIds.has(item.id));

    // Ein fehlendes oder mengenreduziertes Inserat bedeutet nur "nicht mehr
    // angeboten". Einkaufsexemplare und manuell erfasste Karten bleiben daher
    // physisch im Manager und verlieren lediglich ihre Inseratsverknuepfung.
    overflow.filter(item=>!removeIds.has(item.id)).forEach(item=>{
      appendListingChange(item,{listed:false,price:0,mode:"import",reason:"Im Cardmarket-Bestandsimport nicht mehr inseriert"});
      rememberFieldChanges(item,{listed:false,listingPrice:0,articleId:"",stockIdentity:"",lastStockSnapshot:key},updatedFieldsBefore);
    });

    const metadata={
      productId:row.p.productId,name:row.p.name,germanName:row.p.germanName||"",englishName:row.p.englishName||"",
      set:row.p.set,setName:row.p.setName,variant:row.p.variant||"",rarity:row.p.rarity,language:row.p.language,condition:row.p.condition,
      collectorNumber:row.p.collectorNumber,productUrl:row.p.productUrl,listed:row.offerPrice>0,listingPrice:row.offerPrice,
      articleId:row.articleId,stockIdentity:row.identity,lastStockSnapshot:key
    };
    activeSnapshotItems.forEach(item=>{
      appendListingChange(item,{listed:metadata.listed,price:metadata.listingPrice,mode:"import",reason:"Cardmarket-Bestandsimport"});
      rememberFieldChanges(item,TcgBusinessAutomation.mergeInventorySnapshot(item,metadata),updatedFieldsBefore);
    });
    const addCount=Math.max(0,row.quantity-activeSnapshotItems.length);
    for(let n=0;n<addCount;n++){
      const item={id:uid(),...metadata,cost:0,costStatus:"unknown",purchaseDate:todayISO(),status:"Im Bestand",location:"",source:"Cardmarket-Bestandsabgleich",importKey:key,lotId:key,sourceRow:row.sourceRow,movementRecorded:true,holdingProfile:"UNKLASSIFIZIERT",longTermHold:false,originalTargetSell:null,listingHistory:row.offerPrice>0?[{id:uid(),eventType:"baseline",changedAt:new Date().toISOString(),oldPrice:null,newPrice:row.offerPrice,changeMode:"import",reason:"Cardmarket-Bestandsimport"}]:[]};
      state.inventory.push(item);createdIds.push(item.id);
    }
    const delta=addCount-removeIds.size;
    if(delta)movementDeltas.push({identity:row.identity,delta,productId:row.p.productId,groupKey:inventoryGroupKey({...row.p,articleId:row.articleId})});
  });

  const knownIdentities=new Set(snapshotRows.keys());
  const missingGroups=new Map();
  state.inventory.filter(item=>stockSnapshotManaged(item)&&!["Verkauft","Storniert","Reserviert","Beschädigt"].includes(item.status)).forEach(item=>{
    const identity=stockInventoryIdentity(item);
    if(knownIdentities.has(identity))return;
    if(!missingGroups.has(identity))missingGroups.set(identity,[]);
    missingGroups.get(identity).push(item);
  });
  missingGroups.forEach((items,identity)=>{
    const removable=items.filter(isSnapshotOnlyItem);
    const preserved=items.filter(item=>!isSnapshotOnlyItem(item));
    preserved.forEach(item=>{
      appendListingChange(item,{listed:false,price:0,mode:"import",reason:"Im Cardmarket-Bestandsimport nicht mehr inseriert"});
      rememberFieldChanges(item,{listed:false,listingPrice:0,articleId:"",stockIdentity:"",lastStockSnapshot:key},updatedFieldsBefore);
    });
    recordLegacyInventoryEntries(removable);
    removable.forEach(item=>removedItems.push(structuredClone(item)));
    const ids=new Set(removable.map(item=>item.id));
    if(ids.size)state.inventory=state.inventory.filter(item=>!ids.has(item.id));
    if(removable.length)movementDeltas.push({identity,delta:-removable.length,productId:removable[0]?.productId,groupKey:inventoryGroupKey(removable[0]||{})});
  });

  movementDeltas.forEach(change=>addMovement({type:"Cardmarket-Bestandsabgleich",quantity:change.delta,productId:cleanProductId(change.productId),inventoryGroupKey:change.groupKey,reference:file.name,note:change.delta>0?"Neue verfügbare Exemplare aus Bestandssnapshot":"Nicht mehr verfügbare Exemplare aus Bestandssnapshot"}));
  state.imports.push({
    id:uid(),type:"inventory",key,file:file.name,date:new Date().toISOString(),
    rows:rows.length,cards,unknown,skippedOpenOrders,soldHistoryPreserved,snapshotSync:true,createdIds,removedItems,updatedFieldsBefore,
    productIdsResolved:productIdResolution.resolved,productIdsUnresolved:productIdResolution.unresolved,
    added:createdIds.length,removed:removedItems.length
  });
  await window.tcgBackfillBusinessPrintMetadata?.([...snapshotRows.values()].map(row=>row.p.productId));
  saveState();renderAll();
  return {
    rows:rows.length,cards,unknown,skippedOpenOrders,added:createdIds.length,removed:removedItems.length,soldHistoryPreserved,...productIdResolution,
    warning:`Vollständiger Bestandsabgleich: ${createdIds.length} neue reine Inseratsexemplare ergänzt und ${removedItems.length} nicht mehr vorhandene reine Snapshot-Exemplare entfernt. Vorhandene Einkaufs- und manuelle Karten bleiben erhalten und werden bei fehlendem Inserat nur auf „nicht inseriert“ gesetzt. ${soldHistoryPreserved} verkaufte/stornierte Exemplare bleiben für Historie und Auswertung gespeichert.${productIdResolution.resolved?` ${productIdResolution.resolved} fehlende CM-ID${productIdResolution.resolved===1?" wurde":"s wurden"} sicher aus Kartenname, Set und Versionsnummer ergänzt.`:""}${productIdResolution.unresolved?` ${productIdResolution.unresolved} nicht eindeutige Zuordnung${productIdResolution.unresolved===1?" bleibt":"en bleiben"} zur manuellen Prüfung offen.`:""}`
  };
}

function purchaseShipmentKey(file,rows=[]){
  const fromName=(String(file?.name||"").match(/(\d{6,})/)||[])[1];
  const fromRow=String(getAny(rows[0]||{},["orderNo","orderId","idOrder","Bestellnummer"])||"").replace(/^#/,"").trim();
  if(fromName||fromRow)return fromName||fromRow;
  const safeName=String(file?.name||"Einkauf").replace(/\.[^.]+$/,"").replace(/[^a-zA-Z0-9_-]+/g,"-").slice(0,60);
  return `PURCHASE-${safeName}-${Number(file?.size||rows.length)}-${rows.length}`;
}

async function importPurchases(file,details={}) {
  const rows=parseCsv(await readFile(file));
  if(!rows.length) throw new Error("Keine Datenzeilen gefunden.");
  const shipment=purchaseShipmentKey(file,rows);
  const existingPurchase=state.purchases.find(row=>String(row.orderNo||row.importKey||"")===String(shipment));
  updateCatalogFromRows(rows);
  let cards=0,total=0,unknown=0;
  const purchaseId=uid();
  const pendingItems=[];
  rows.forEach((r,idx)=>{
    const productId=cleanProductId(getAny(r,["idProduct","productId","CM Produkt-ID"]));
    const quantity=Math.max(1,Math.round(num(getAny(r,["groupCount","count","quantity","Menge"]),1)));
    const price=num(getAny(r,["price","Stückpreis","unitPrice"]),0);
    const p=resolveProduct(productId, stockRowMetadata(r));
    if(/^Unbekannte Karte/.test(p.name)) unknown++;
    const language=mapLanguage(getAny(r,["idLanguage","language","Sprache"])) || p.language;
    const condition=mapCondition(getAny(r,["condition","Condition-Code","Zustand"])) || p.condition;
    pendingItems.push({
      productId, name:p.name, set:p.set, setName:p.setName, variant:p.variant||"", rarity:p.rarity,
      language,condition,
      collectorNumber:p.collectorNumber, productUrl:p.productUrl,
      quantity, unitPrice:price, sourceRow:idx+2,
      receiptLineKey:`CM:${productId||"unknown"}:${language||""}:${condition||""}:${Number(price).toFixed(4)}`
    });
    cards+=quantity; total+=quantity*price;
  });
  const consolidatedLines=new Map();
  pendingItems.forEach(line=>{
    const current=consolidatedLines.get(line.receiptLineKey);
    if(!current){consolidatedLines.set(line.receiptLineKey,line);return;}
    current.quantity=Number(current.quantity||0)+Number(line.quantity||0);
    current.sourceRows=[...(current.sourceRows||[current.sourceRow]),line.sourceRow];
  });
  pendingItems.splice(0,pendingItems.length,...consolidatedLines.values());
  const importDate = details.date || document.getElementById("purchaseImportDate")?.value || todayISO();
  const importSeller = String(details.seller || document.getElementById("purchaseImportSeller")?.value || "Aus CSV").trim() || "Aus CSV";
  const importShipping = num(details.shipping ?? document.getElementById("purchaseImportShipping")?.value, 0);
  const importExtra = num(details.extra ?? document.getElementById("purchaseImportExtra")?.value, 0);
  const importRefund = num(details.refund, 0);

  let purchase;
  if(existingPurchase){
    purchase=existingPurchase;
    purchase.pendingItems ||= [];
    const existingByKey=new Map();
    (purchase.pendingItems||[]).forEach((item,index)=>{
      existingByKey.set(String(item.receiptLineKey||TcgBusinessAutomation.purchaseLineKey(item,index)),item);
      existingByKey.set(`CM:${cleanProductId(item.productId)||"unknown"}:${item.language||""}:${item.condition||""}:${Number(item.unitPrice||0).toFixed(4)}`,item);
    });
    pendingItems.forEach((incoming,index)=>{
      const key=String(incoming.receiptLineKey||TcgBusinessAutomation.purchaseLineKey(incoming,index));
      const current=existingByKey.get(key);
      if(!current){purchase.pendingItems.push(incoming);return;}
      const receipt=TcgBusinessAutomation.normalizePurchaseReceiptLine(current,index);
      Object.assign(current,{...incoming,receiptLineKey:current.receiptLineKey||incoming.receiptLineKey,quantity:Math.max(Number(incoming.quantity||0),receipt.assigned),receivedBusiness:receipt.business,receivedPrivate:receipt.private,receivedDamaged:receipt.damaged,cancelledQuantity:receipt.cancelled,materializedBusiness:receipt.materializedBusiness,materializedPrivate:receipt.materializedPrivate,materializedDamaged:receipt.materializedDamaged});
    });
    purchase.date=details.date||purchase.date||importDate;purchase.seller=details.seller||purchase.seller||importSeller;
    if(details.shipping!==undefined)purchase.shipping=importShipping;if(details.extra!==undefined)purchase.extra=importExtra;if(details.refund!==undefined)purchase.refund=importRefund;
    purchase.items=(purchase.pendingItems||[]).reduce((sum,item)=>sum+Number(item.quantity||1),0);
    purchase.cardValue=(purchase.pendingItems||[]).reduce((sum,item)=>sum+Number(item.quantity||1)*Number(item.unitPrice||0),0);
    purchase.inventoryCreated=(purchase.pendingItems||[]).every((item,index)=>TcgBusinessAutomation.normalizePurchaseReceiptLine(item,index).open===0);
    purchase.note=[purchase.note,`Am ${todayISO()} erneut aus ${file.name} abgeglichen.`].filter(Boolean).join("\n");
  }else{
    purchase={id:purchaseId,orderNo:shipment,date:importDate,seller:importSeller,country:"",items:cards,cardValue:total,shipping:importShipping,extra:importExtra,refund:importRefund,status:"Unterwegs",note:`Import aus ${file.name}. Karten werden beim Eintreffen auf Geschäft und Privat aufgeteilt.`,importKey:shipment,pendingItems,inventoryCreated:false,costAllocationMethod:"value"};
    state.purchases.push(purchase);
  }
  refreshPurchaseAssetCosts(purchase);
  state.imports.push({id:uid(),type:"purchase",key:shipment,file:file.name,date:new Date().toISOString(),rows:rows.length,cards,unknown,mode:existingPurchase?"update":"create",purchaseId:purchase.id});
  await window.tcgBackfillBusinessPrintMetadata?.(pendingItems.map(item=>item.productId));
  saveState(); renderAll();
  return {rows:rows.length,cards,total,shipment,unknown,updated:Boolean(existingPurchase),shipping:Number(purchase.shipping||0),extra:Number(purchase.extra||0),grandTotal:Number(purchase.cardValue||0)+Number(purchase.shipping||0)+Number(purchase.extra||0)-Number(purchase.refund||0),warning:existingPurchase?"Vorhandener Einkauf wurde aktualisiert; bereits zugeteilte Exemplare blieben erhalten.":""};
}

function mapLanguage(v){
  const m={"1":"EN","2":"FR","3":"DE","4":"ES","5":"IT","8":"PT","Englisch":"EN","Deutsch":"DE"};
  return m[String(v)]||String(v||state.settings.languages);
}
function mapCondition(v){
  const m={"1":"MT","2":"NM","3":"EX","4":"GD","5":"LP","6":"PL","7":"PO"};
  return m[String(v)]||String(v||state.settings.condition);
}

async function importPrices(file) {
  const rows=parseCsv(await readFile(file));
  let updated=0;
  rows.forEach(r=>{
    const productId=cleanProductId(getAny(r,["idProduct","productId","CM Produkt-ID"]));
    const w=state.watchlist.find(x=>cleanProductId(x.productId)===productId);
    if(!w) return;
    const val=n=>{const v=getAny(r,n); return v===""?"":num(v);};
    w.low=val(["LOW","Low","CM Low"]); w.trend=val(["TREND","Trend","CM Trend"]);
    w.avg1=val(["AVG1","Avg1","Ø 1 Tag"]); w.avg7=val(["AVG7","Avg7","Ø 7 Tage"]);
    w.avg30=val(["AVG30","Avg30","Ø 30 Tage"]); w.priceDate=todayISO(); updated++;
  });
  state.imports.push({id:uid(),type:"prices",key:`prices-${Date.now()}`,file:file.name,date:new Date().toISOString(),rows:rows.length,cards:updated});
  saveState(); renderAll(); return {rows:rows.length,updated};
}

async function importSales(file) {
  const rows=parseCsv(await readFile(file));
  if(!rows.length) throw new Error("Keine Datenzeilen gefunden.");
  if(/cardmarket-stock/i.test(file.name) || rows.some(r=>getAny(r,["ArticleID"]) && getAny(r,["Total_EUR"]))) {
    throw new Error("Das ist ein Bestands-Export, keine Verkaufsdatei. Bitte unter „Cardmarket-Bestand“ importieren.");
  }
  const shipment=(file.name.match(/(\d{6,})/)||[])[1]||`SALE-${Date.now()}`;
  if(state.imports.some(i=>i.type==="sale"&&i.key===shipment)) throw new Error("Dieser Verkauf wurde bereits importiert.");
  let matched=0,revenue=0,cardNames=[],soldItems=[],saleItems=[],cards=0;
  const usedIds=new Set();
  rows.forEach(r=>{
    const productId=cleanProductId(getAny(r,["idProduct","productId","CM Produkt-ID"]));
    const quantity=Math.max(1,Math.round(num(getAny(r,["groupCount","count","quantity","Menge"]),1)));
    const price=num(getAny(r,["price","Stückpreis","unitPrice"]),0);
    const language=mapLanguage(getAny(r,["idLanguage","language","Sprache"]));
    const condition=mapCondition(getAny(r,["condition","Condition-Code","Zustand"]));
    const product=resolveProduct(productId,stockRowMetadata(r));
    const strategy=state.settings.saleAllocationStrategy||"fifo";
    const selection=strategy==="manual"?{selected:[],missing:quantity}:TcgBusinessAutomation.selectInventoryForSale(state.inventory.filter(item=>!usedIds.has(item.id)),{productId,language,condition,strategy},quantity);
    selection.selected.forEach(item=>{usedIds.add(item.id);soldItems.push(item);matched++;cardNames.push(item.name||product.name);});
    saleItems.push({articleId:cleanProductId(getAny(r,["articleId","idArticle"])),productId,name:product.name,set:product.set,setName:product.setName,collectorNumber:product.collectorNumber,rarity:product.rarity,language,condition,quantity,unitPrice:price,productUrl:product.productUrl,matchedItemIds:selection.selected.map(item=>item.id)});
    cards+=quantity;revenue+=price*quantity;
  });
  const cost=soldItems.reduce((a,i)=>a+Number(i.cost||0),0);
  const saleId=uid();
  const sale={id:saleId,orderNo:shipment,date:todayISO(),customer:"Aus CSV",country:"",quantity:cards,cardNames:cardNames.join(", "),revenue,cardValue:revenue,cost,status:"Abgeschlossen",workflowStage:"Abgeschlossen",note:`Import aus ${file.name}`,importKey:shipment,itemIds:soldItems.map(i=>i.id),items:saleItems};
  state.sales.push(sale);syncSaleInventoryStatus(sale);
  state.imports.push({id:uid(),type:"sale",key:shipment,file:file.name,date:new Date().toISOString(),rows:rows.length,cards:matched});
  saveState();renderAll(); return {rows:rows.length,cards,matched,revenue,warning:matched<cards?`${cards-matched} Karte(n) benötigen noch eine Bestandszuordnung.`:"Alle Karten wurden konkreten Einkaufsexemplaren zugeordnet."};
}


function restoreSaleInventory(sale) {
  if (!sale) return 0;
  const ids = new Set(Array.isArray(sale.itemIds) ? sale.itemIds : []);
  let restored = 0;
  state.inventory.forEach(item => {
    if (!ids.has(item.id)) return;
    item.status = "Im Bestand";
    delete item.saleId;
    delete item.saleOrderNo;
    delete item.saleDate;
    delete item.saleMovementRecorded;
    restored++;
  });
  return restored;
}

function deleteSaleRecord(id) {
  const sale = state.sales.find(x=>x.id===id);
  if (!sale) return;
  const restored = restoreSaleInventory(sale);
  let restoredMaterials=0;
  if((sale.materialUsage||[]).length&&(sale.packedDate||["Verpackt","Versendet","Abgeschlossen"].includes(sale.status))){
    const plan=planMaterialStockChanges(sale.materialUsage,[]);
    const changes=applyMaterialStockPlan(plan);
    restoredMaterials=changes.reduce((sum,change)=>sum+Math.max(0,Number(change.quantity||0)),0);
    changes.forEach(change=>addMovement({type:"Materialrückbuchung",quantity:change.quantity,materialId:change.material.id,saleId:sale.id,reference:`Gelöschte Bestellung ${sale.orderNo||"-"}`,note:`${change.material.name} aus gelöschter Verpackung zurückgebucht`}));
  }
  state.sales = state.sales.filter(x=>x.id!==id);
  saveState(); renderAll();
  if (restored||restoredMaterials) alert(`${restored} Karte${restored===1?"":"n"} und ${restoredMaterials} Materialeinheit${restoredMaterials===1?"":"en"} wurden wieder in den Bestand gelegt.`);
}

function downloadTextFile(filename, text, type="text/csv;charset=utf-8") {
  const blob = new Blob(["\ufeff" + text], {type});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const GENERIC_TEMPLATES = {
  inventory: "productId;name;set;rarity;language;condition;quantity;listingPrice;listed;status;purchaseDate;location;note;productUrl\n",
  purchase: "orderNo;date;seller;country;items;cardValue;shipping;extra;status;note\n",
  sale: "orderNo;date;customer;country;quantity;cardNames;revenue;cost;status;note\n",
  watchlist: "priority;productId;name;set;version;stock;target;maxBuy;targetSell;currentBuy;trend;avg30;reprint;banlist\n",
  seller: "cardmarketName;realName;country;language;email;phone;status;favorite;rating;communication;shippingSpeed;packagingQuality;conditionAccuracy;complaints;note\n",
  customer: "cardmarketName;realName;country;language;email;phone;status;favorite;rating;preferredShipping;trackingRequired;complaints;note\n",
  settlement: "date;orderNo;amount;description\n"
};

function detectImportType(file, rows, rawText="") {
  const name = String(file?.name||"").toLowerCase();
  if (name.endsWith(".json")) return "backup";
  if (name.endsWith(".html") || name.endsWith(".htm")) return "saleHtml";
  const keys = new Set(Object.keys(rows[0]||{}).map(k=>String(k).toLowerCase()));
  const automatic=window.TcgBusinessAutomation?.detectCsvImportType(file?.name,Object.keys(rows[0]||{}));
  if(automatic&&automatic!=="unknown")return automatic;
  const has = (...names) => names.some(n=>keys.has(n.toLowerCase()));
  if (has("articleid") && has("price_eur") && has("amount")) return "inventory";
  if (has("groupcount") && has("price") && has("idproduct")) return "purchase";
  if (has("trendprice","avg30","avg7","avg1") && has("idproduct","productid")) return "prices";
  if (has("orderno") && has("customer") && has("revenue")) return "saleGeneric";
  if (has("orderno") && has("seller") && has("cardvalue")) return "purchaseGeneric";
  if (has("priority") && has("targetsell")) return "watchlistGeneric";
  if (has("listingprice") && has("name")) return "inventoryGeneric";
  if (has("packagingquality","shippingspeed","conditionaccuracy")) return "sellerGeneric";
  if (has("preferredshipping","trackingrequired")) return "customerGeneric";
  if (name.includes("seller") || name.includes("haendler") || name.includes("händler")) return "sellerGeneric";
  if (name.includes("customer") || name.includes("kunde")) return "customerGeneric";
  if (name.includes("watch")) return "watchlistGeneric";
  if (name.includes("sale") || name.includes("verkauf")) return "sale";
  return "unknown";
}

function boolValue(v) {
  return ["1","true","ja","yes","y","x","inseriert"].includes(String(v??"").trim().toLowerCase());
}

function genericImportRecord(type, rows, file) {
  const key = `GEN-${type}-${Date.now()}`;
  let count = 0, cards = 0, created, updated;
  const createdIds=[];
  if (type === "inventoryGeneric") {
    rows.forEach((r, idx)=>{
      const quantity = Math.max(1, Number(r.quantity||r.menge||1));
      const product = resolveProduct(r.productId||r.idProduct, r);
      for(let n=0;n<quantity;n++) state.inventory.push({
        id:uid(), ...product, name:r.name||product.name, set:r.set||product.set, rarity:r.rarity||product.rarity,
        language:r.language||product.language, condition:r.condition||product.condition,
        cost:num(r.cost||r.einstand), listingPrice:num(r.listingPrice||r.inseratspreis),
        listed:boolValue(r.listed) || num(r.listingPrice||r.inseratspreis)>0,
        status:r.status||"Im Bestand", purchaseDate:r.purchaseDate||r.date||todayISO(),
        location:r.location||"", note:r.note||"", productUrl:r.productUrl||product.productUrl,
        importKey:key, lotId:key, sourceRow:idx+2
      });
      count++; cards += quantity;
    });
  } else if (type === "purchaseGeneric") {
    rows.forEach(r=>{ state.purchases.push({
      id:uid(), orderNo:r.orderNo||r.bestellnr||`EK-${Date.now()}-${count+1}`, date:r.date||todayISO(),
      seller:r.seller||r.haendler||"", country:r.country||r.land||"", items:num(r.items||r.karten),
      cardValue:num(r.cardValue||r.kartenwert), shipping:num(r.shipping||r.versand), extra:num(r.extra||r.zusatz),
      status:r.status||"Unterwegs", note:r.note||"", importKey:key, pendingItems:[], inventoryCreated:false
    }); count++; cards += num(r.items||r.karten); });
  } else if (type === "saleGeneric") {
    rows.forEach(r=>{ state.sales.push({
      id:uid(), orderNo:r.orderNo||r.bestellnr||`VK-${Date.now()}-${count+1}`, date:r.date||todayISO(),
      customer:r.customer||r.kunde||"", country:r.country||r.land||"", quantity:num(r.quantity||r.menge),
      cardNames:r.cardNames||r.karten||"", revenue:num(r.revenue||r.umsatz), cost:num(r.cost||r.wareneinsatz),
      shippingPaid:num(r.shippingPaid||r.versandKaeufer), postage:num(r.postage||r.porto), material:num(r.material),
      status:r.status||"Abgeschlossen", note:r.note||"", importKey:key, itemIds:[]
    }); count++; cards += num(r.quantity||r.menge); });
  } else if (type === "watchlistGeneric") {
    created=0; updated=0;
    const watchlistBefore=structuredClone(state.watchlist);
    rows.forEach(r=>{
      const productId=cleanProductId(r.productId||r.idProduct||r.produktId);
      const name=String(r.name||r.karte||"").trim();
      const set=String(r.set||"").trim();
      const version=String(r.version||r.rarity||r.seltenheit||"").trim();
      let target=null;
      if(productId) target=state.watchlist.find(x=>cleanProductId(x.productId)===productId);
      if(!target && name) target=state.watchlist.find(x=>normalizeCardName(x.name)===normalizeCardName(name) && String(x.set||"").toLowerCase()===set.toLowerCase() && String(x.version||"").toLowerCase()===version.toLowerCase());
      const patch={};
      const assignText=(key,...sources)=>{for(const src of sources){if(src!==undefined&&src!==null&&String(src).trim()!==""){patch[key]=String(src).trim();break;}}};
      const assignNum=(key,...sources)=>{for(const src of sources){if(src!==undefined&&src!==null&&String(src).trim()!==""){patch[key]=num(src);break;}}};
      assignText("productId",productId);
      assignText("name",name);
      assignText("set",set);
      assignText("version",version);
      assignText("priority",r.priority||r.prioritaet||r.priorität);
      assignText("reprint",r.reprint);
      assignText("banlist",r.banlist);
      assignText("note",r.note||r.notiz);
      assignText("productUrl",r.productUrl||r.url||r.link);
      assignNum("stock",r.stock ?? r.bestand);
      assignNum("target",r.target ?? r.zielbestand);
      assignNum("maxBuy",r.maxBuy ?? r.maxEinkauf ?? r.maximalerEinkaufspreis);
      assignNum("targetSell",r.targetSell ?? r.zielverkauf ?? r.verkaufspreis);
      assignNum("currentBuy",r.currentBuy ?? r.low ?? r.cmLow);
      assignNum("trend",r.trend ?? r.trendpreis);
      assignNum("avg1",r.avg1);
      assignNum("avg7",r.avg7);
      assignNum("avg30",r.avg30);
      if(target){Object.assign(target,patch);updated++;}
      else if(patch.name||patch.productId){state.watchlist.push({id:uid(),priority:"B",stock:0,target:0,maxBuy:0,targetSell:0,currentBuy:"",trend:"",avg1:"",avg7:"",avg30:"",reprint:"",banlist:"",...patch});created++;}
      count++;
    });
    cards=created+updated;
  } else if (type === "sellerGeneric") {
    rows.forEach(r=>{ const partner=normalizePartnerRecord({...r,name:r.cardmarketName||r.name,favorite:boolValue(r.favorite)},"seller");state.sellers.push(partner);createdIds.push(partner.id);count++; });
  } else if (type === "customerGeneric") {
    rows.forEach(r=>{ const partner=normalizePartnerRecord({...r,name:r.cardmarketName||r.name,favorite:boolValue(r.favorite),trackingRequired:boolValue(r.trackingRequired)},"customer");state.customers.push(partner);createdIds.push(partner.id);count++; });
  }
  const importType = ({inventoryGeneric:"inventory",purchaseGeneric:"purchase",saleGeneric:"sale",watchlistGeneric:"watchlist",sellerGeneric:"seller",customerGeneric:"customer"})[type] || type;
  const importRecord={id:uid(),type:importType,key,file:file.name,date:new Date().toISOString(),rows:count,cards};
  if(type === "watchlistGeneric") importRecord.watchlistBefore=watchlistBefore;
  if(createdIds.length) importRecord.createdIds=createdIds;
  state.imports.push(importRecord);
  saveState(); renderAll();
  return {type:importType,rows:count,cards,created:typeof created!=="undefined"?created:undefined,updated:typeof updated!=="undefined"?updated:undefined};
}

async function importSaleHtml(file) {
  const html = await file.text();
  const doc = new DOMParser().parseFromString(html,"text/html");
  const title = doc.title || file.name;
  const orderNo = (title.match(/#(\d{6,})/)||html.match(/Orders\/(\d{6,})/)||[])[1];
  if(!orderNo) throw new Error("Keine Cardmarket-Bestellnummer gefunden.");
  if(state.imports.some(i=>i.type==="sale" && i.key===orderNo)) throw new Error("Diese Verkaufsbestellung wurde bereits importiert.");

  const userLink=[...doc.querySelectorAll('a[href*="/Users/"]')].find(a=>a.textContent.trim());
  const customer=userLink?.textContent.trim() || "Cardmarket-Kunde";
  const text=(doc.body?.innerText||"").replace(/\u00a0/g," ");
  const dateMatch=text.match(/\b(\d{2}\.\d{2}\.\d{4})\b/);
  const date=dateMatch ? dateMatch[1].split(".").reverse().join("-") : todayISO();
  const shippingText=doc.querySelector('.shipping-price')?.textContent || "0";
  const shippingPaid=num(shippingText,0);
  const totalTexts=[...doc.querySelectorAll('.total')].map(e=>e.textContent.trim());
  const totalValue=totalTexts.map(v=>num(v,0)).find(v=>v>0) || 0;

  const rarityMap={"10":"Common","20":"Rare","30":"Super Rare","40":"Ultra Rare","50":"Secret Rare","60":"Ultimate Rare","70":"Ghost Rare","80":"Gold Rare","90":"Platinum Secret Rare"};
  const rows=[...doc.querySelectorAll('[data-article-id][data-product-id]')];
  if(!rows.length) throw new Error("Keine Kartenpositionen gefunden. Bitte die vollständige gespeicherte Cardmarket-Seite importieren.");

  const items=[]; const itemIds=[]; let cards=0, cardValue=0, cost=0, matched=0;
  rows.forEach(row=>{
    const productId=cleanProductId(row.dataset.productId);
    const quantity=Math.max(1,Number(row.dataset.amount||1));
    const unitPrice=Number(row.dataset.price||0);
    const productLink=[...row.querySelectorAll('a[href*="/Products/Singles/"]')].map(a=>a.href).find(Boolean)||"";
    const setLink=[...row.querySelectorAll('a[href*="/Expansions/"]')].find(Boolean);
    const set=(setLink?.textContent||"").trim() || ((row.innerText||"").match(/#\d+\s+([A-Z0-9-]{3,8})\b/)||[])[1] || "";
    const fallback={name:row.dataset.name||"",set,setName:row.dataset.expansionName||"",rarity:rarityMap[row.dataset.rarity]||"",language:mapLanguage(row.dataset.language),condition:mapCondition(row.dataset.condition),collectorNumber:row.dataset.number||"",productUrl:productLink};
    const p=resolveProduct(productId,fallback);
    if(productLink) p.productUrl=productLink;
    if(set) p.set=set;
    if(!p.rarity && fallback.rarity) p.rarity=fallback.rarity;
    state.productCatalog[productId]={...(state.productCatalog[productId]||{}),...p};

    const matchedForItem=[];
    for(let n=0;n<quantity;n++){
      const candidates=state.inventory.filter(i=>i.status!=="Verkauft" && i.status!=="Reserviert" && cleanProductId(i.productId)===productId)
        .sort((a,b)=>new Date(a.purchaseDate||0)-new Date(b.purchaseDate||0));
      const inv=candidates[0];
      if(inv){inv.status="Reserviert"; matchedForItem.push(inv.id); itemIds.push(inv.id); cost+=Number(inv.cost||0); matched++;}
    }
    items.push({articleId:cleanProductId(row.dataset.articleId),productId,name:p.name,set:p.set,setName:p.setName,rarity:p.rarity,language:mapLanguage(row.dataset.language)||p.language,condition:mapCondition(row.dataset.condition)||p.condition,collectorNumber:p.collectorNumber||row.dataset.number||"",productUrl:p.productUrl,quantity,unitPrice,comment:row.dataset.comment||"",matchedItemIds:matchedForItem});
    cards+=quantity; cardValue+=quantity*unitPrice;
  });

  const revenue = totalValue || cardValue + shippingPaid;
  const fee = Math.ceil(cardValue*Number(state.settings.feePercent||0))/100;
  const saleId=uid();
  itemIds.forEach(id=>{const item=state.inventory.find(x=>x.id===id); if(item){item.saleId=saleId;item.saleOrderNo=orderNo;}});
  const sale={id:saleId,orderNo,date,customer,country:"",quantity:cards,cardNames:items.map(i=>`${i.quantity}× ${i.name}`).join(", "),revenue,cardValue,shippingPaid,cost,fee,status:"Offen",note:`Import aus ${file.name}`,importKey:orderNo,itemIds,items};
  state.sales.push(sale);
  if(customer && !state.customers.some(c=>String(c.name).toLowerCase()===customer.toLowerCase())) state.customers.push(normalizePartnerRecord({name:customer,cardmarketName:customer},"customer"));
  state.imports.push({id:uid(),type:"sale",key:orderNo,file:file.name,date:new Date().toISOString(),rows:items.length,cards});
  saveState(); renderAll();
  return {type:"sale",rows:items.length,cards,matched,warning:matched<cards?`${cards-matched} Karte(n) konnten keinem freien Bestand zugeordnet werden.`:"Karten wurden als reserviert markiert."};
}


function isWatchlistUpdatePayload(payload) {
  return !!(payload && typeof payload === "object" && Array.isArray(payload.cards) && (
    String(payload.schema||"").toLowerCase().includes("watchlist") ||
    payload.cards.some(card => card && (card.productId || card.idProduct) && (card.action || card.priority || card.targetSell !== undefined))
  ));
}

function watchlistMatch(card) {
  const productId=cleanProductId(card.productId||card.idProduct||card.produktId);
  if(productId) {
    const byId=state.watchlist.find(x=>cleanProductId(x.productId)===productId);
    if(byId) return byId;
  }
  const name=normalizeCardName(card.name||card.karte||"");
  const set=String(card.set||"").trim().toLowerCase();
  const version=String(card.version||card.rarity||card.seltenheit||"").trim().toLowerCase();
  if(!name) return null;
  return state.watchlist.find(x=>normalizeCardName(x.name)===name && String(x.set||"").trim().toLowerCase()===set && String(x.version||x.rarity||"").trim().toLowerCase()===version) || null;
}

function watchlistPatchFromCard(card) {
  const patch={};
  const text=(key,...values)=>{for(const value of values){if(value!==undefined&&value!==null&&String(value).trim()!==""){patch[key]=String(value).trim();break;}}};
  const number=(key,...values)=>{for(const value of values){if(value!==undefined&&value!==null&&String(value).trim()!==""){patch[key]=num(value);break;}}};
  text("productId",cleanProductId(card.productId||card.idProduct||card.produktId));
  text("name",card.name||card.karte);
  text("englishName",card.englishName);
  text("set",card.set);
  text("cardNumber",card.cardNumber||card.collectorNumber);
  text("version",card.version||card.rarity||card.seltenheit);
  text("rarity",card.rarity||card.seltenheit);
  text("priority",card.priority||card.prioritaet||card.priorität);
  text("category",card.category||card.kategorie);
  text("recommendation",card.recommendation||card.empfehlung);
  text("reprint",card.reprint);
  text("banlist",card.banlist);
  text("reason",card.reason||card.grund);
  text("note",card.note||card.notiz);
  text("productUrl",card.productUrl||card.sourceUrl||card.url||card.link);
  text("priceDate",card.priceDate);
  text("lastChecked",card.lastChecked);
  text("priceScope",card.priceScope);
  text("trend30Direction",card.trend30Direction);
  number("stock",card.stock ?? card.bestand);
  number("target",card.target ?? card.zielbestand);
  number("maxQuantity",card.maxQuantity);
  number("maxBuy",card.maxBuy ?? card.maxEinkauf ?? card.maximalerEinkaufspreis);
  number("targetSell",card.targetSell ?? card.zielverkauf ?? card.verkaufspreis);
  number("currentBuy",card.currentBuy ?? card.low ?? card.cmLow);
  number("low",card.low ?? card.cmLow);
  number("trend",card.trend ?? card.trendpreis);
  number("avg1",card.avg1);
  number("avg7",card.avg7);
  number("avg30",card.avg30);
  number("capitalLimit",card.capitalLimit);
  number("expectedProfitAtLow",card.expectedProfitAtLow);
  number("expectedRoiAtLow",card.expectedRoiAtLow);
  return patch;
}

function importWatchlistUpdatePayload(payload,fileName="Watchlist-Update.json") {
  if(!isWatchlistUpdatePayload(payload)) throw new Error("Keine gültige Watchlist-Aktualisierung erkannt.");
  const key=`WATCHLIST-${payload.version||Date.now()}`;
  if(state.imports.some(i=>i.type==="watchlist" && i.key===key)) throw new Error("Diese Watchlist-Aktualisierung wurde bereits importiert.");
  const before=structuredClone(state.watchlist);
  let created=0,updated=0,archived=0,skipped=0;
  payload.cards.forEach(card=>{
    if(!card || typeof card!=="object") {skipped++;return;}
    const action=String(card.action||"upsert").trim().toLowerCase();
    const target=watchlistMatch(card);
    if(["archive","archivieren","remove","delete"].includes(action)) {
      if(target){target.archived=true;target.archivedAt=todayISO();target.archiveReason=card.reason||"Durch Watchlist-Update archiviert";archived++;}
      else skipped++;
      return;
    }
    const patch=watchlistPatchFromCard(card);
    patch.archived=false;
    delete patch.id;
    if(target){
      // Persönliche Felder bleiben erhalten, sofern die Update-Datei sie nicht ausdrücklich liefert.
      Object.assign(target,patch);
      updated++;
    } else if(patch.name||patch.productId) {
      state.watchlist.push({id:uid(),priority:"B",stock:0,target:0,maxBuy:0,targetSell:0,currentBuy:"",trend:"",avg1:"",avg7:"",avg30:"",reprint:"",banlist:"",...patch});
      created++;
    } else skipped++;
  });
  const record={id:uid(),type:"watchlist",key,file:fileName,date:new Date().toISOString(),rows:payload.cards.length,cards:created+updated,created,updated,archived,watchlistBefore:before,version:payload.version||""};
  state.imports.push(record);
  saveState();renderAll();
  return {type:"watchlist",rows:payload.cards.length,cards:created+updated,created,updated,archived,skipped,warning:archived?`${archived} Einträge archiviert`:""};
}

function importSettlementRows(rows,file) {
  if(!window.TcgBusinessAutomation)throw new Error("Abgleichsmodul ist nicht geladen.");
  const key=`SETTLEMENT-${file.name}-${file.size||rows.length}-${file.lastModified||Date.now()}`;
  if(state.imports.some(record=>record.type==="settlement"&&record.key===key))throw new Error("Diese Abrechnungsdatei wurde bereits importiert.");
  const result=TcgBusinessAutomation.reconcileSettlementRows(rows,state);
  const record={id:uid(),importKey:key,file:file.name,date:new Date().toISOString(),...result};
  state.reconciliations.push(record);
  state.imports.push({id:uid(),type:"settlement",key,file:file.name,date:record.date,rows:result.rows,cards:result.matched,reconciliationId:record.id});
  saveState();renderAll();
  return {type:"settlement",rows:result.rows,cards:result.matched,matched:result.matched,unmatched:result.unmatched,warning:result.unmatched?`${result.unmatched} Buchung(en) konnten noch keinem Verkauf zugeordnet werden.`:`Alle ${result.matched} Buchungen wurden zugeordnet.`};
}

async function universalImportFile(file,options={}) {
  if (!file) throw new Error("Keine Datei ausgewählt.");
  if (file.name.toLowerCase().endsWith(".json")) {
    const payload=JSON.parse(await file.text());
    if (/price_guide_3\.json$/i.test(file.name)) {
      const result=applyOfficialPriceGuide(payload, file.name);
      return {type:"prices",rows:result.rows,cards:result.updated,warning:result.unmatched?`${result.unmatched} Watchlist-Karten ohne passende Produkt-ID`:""};
    }
    if (isWatchlistUpdatePayload(payload)) return importWatchlistUpdatePayload(payload,file.name);
    await importBackupPayload(payload,file.name);
    return {type:"backup",rows:1,cards:state.inventory.length};
  }
  if (/\.(html?|htlm)$/i.test(file.name)) return await importSaleHtml(file);
  const text = await file.text();
  const rows = parseCsv(text);
  if (!rows.length) throw new Error("Die Datei enthält keine lesbaren Daten.");
  const type = options.forcedType || detectImportType(file, rows, text);
  if (type === "inventory") return {...await importStock(file),type:"inventory"};
  if (type === "purchase") return {...await importPurchases(file,options.purchaseDetails||{}),type:"purchase"};
  if (type === "prices") return {...await importPrices(file),type:"prices"};
  if (type === "sale") return {...await importSales(file),type:"sale"};
  if (type === "settlement") return importSettlementRows(rows,file);
  if (["inventoryGeneric","purchaseGeneric","saleGeneric","watchlistGeneric","sellerGeneric","customerGeneric"].includes(type)) return genericImportRecord(type,rows,file);
  throw new Error("Dateityp nicht erkannt. Nutze eine Vorlage oder wähle den Importtyp manuell.");
}

const IMPORT_TYPE_LABELS={
  inventory:"Cardmarket-Bestand",purchase:"Cardmarket-Einkauf",sale:"Cardmarket-Verkauf (CSV)",saleHtml:"Cardmarket-Verkauf (HTML)",prices:"Marktpreise",watchlist:"Watchlist",backup:"Komplettes Backup",productCatalog:"Produktkatalog",cardmarketBackup:"Cardmarket-Datensicherung",inventoryGeneric:"Eigener Bestand",purchaseGeneric:"Eigene Einkäufe",saleGeneric:"Eigene Verkäufe",watchlistGeneric:"Eigene Watchlist",sellerGeneric:"Händler",customerGeneric:"Kunden",settlement:"Cardmarket-Abrechnung",unknown:"Nicht erkannt"
};
const IMPORT_SELECT_TYPES=["inventory","purchase","sale","prices","settlement","inventoryGeneric","purchaseGeneric","saleGeneric","watchlistGeneric","sellerGeneric","customerGeneric"];
let pendingImportBatch=[];
let pendingFolderImports=[];

function importDuplicateFor(type,key,fileName) {
  if(!key&&type==="inventory")return state.imports.some(row=>row.type==="inventory"&&row.file===fileName);
  if(!key)return false;
  return state.imports.some(row=>row.type===({saleHtml:"sale",watchlistGeneric:"watchlist"}[type]||type)&&String(row.key)===String(key));
}

async function analyzeImportFile(file,metadata={}) {
  const lower=file.name.toLowerCase();
  const analysis={id:uid(),file,metadata,fileName:file.name,type:"unknown",rows:0,cards:0,key:"",warnings:[],duplicate:false,blocked:false};
  try{
    if(lower.endsWith(".json")){
      const payload=JSON.parse(await file.text());
      if(Array.isArray(payload?.priceGuides)||/price_guide_3\.json$/i.test(file.name)){analysis.type="prices";analysis.rows=(payload.priceGuides||payload.priceGuide||[]).length;analysis.cards=analysis.rows;}
      else if(payload?.schema&&String(payload.schema).toLowerCase().includes("watchlist")&&Array.isArray(payload.cards)){analysis.type="watchlist";analysis.rows=payload.cards.length;analysis.cards=payload.cards.length;analysis.key=`WATCHLIST-${payload.version||file.lastModified}`;}
      else if(Array.isArray(payload?.products)&&Array.isArray(payload?.priceHistory)){analysis.type="cardmarketBackup";analysis.rows=payload.priceHistory.length;analysis.cards=payload.products.length;}
      else if(Array.isArray(payload?.products)&&payload.products.some(row=>row&&(row.idProduct||row.productId))){analysis.type="productCatalog";analysis.rows=payload.products.length;analysis.cards=payload.products.length;}
      else if(payload&&typeof payload==="object"&&(Array.isArray(payload.inventory)||Array.isArray(payload.sales)||Array.isArray(payload.purchases))){analysis.type="backup";analysis.rows=1;analysis.cards=(payload.inventory||[]).length;analysis.warnings.push("Ein komplettes Backup ersetzt den aktuellen Datenstand. Nur importieren, wenn das ausdrücklich gewünscht ist.");}
      else {analysis.type="backup";analysis.rows=1;analysis.warnings.push("JSON wird als komplettes Backup behandelt. Inhalt besonders sorgfältig prüfen.");}
    } else if(/\.html?$/i.test(lower)){
      const html=await file.text();const doc=new DOMParser().parseFromString(html,"text/html");
      analysis.type="saleHtml";analysis.key=(doc.title.match(/#(\d{6,})/)||html.match(/Orders\/(\d{6,})/)||[])[1]||"";
      analysis.rows=doc.querySelectorAll('[data-article-id][data-product-id]').length;
      analysis.cards=[...doc.querySelectorAll('[data-article-id][data-product-id]')].reduce((sum,row)=>sum+Math.max(1,Number(row.dataset.amount||1)),0);
      if(!analysis.key||!analysis.rows){analysis.blocked=true;analysis.warnings.push("Keine vollständige Cardmarket-Verkaufsseite erkannt.");}
    } else {
      const text=await file.text();const rows=parseCsv(text);
      if(!rows.length)throw new Error("Keine lesbaren Datenzeilen gefunden.");
      analysis.rows=rows.length;analysis.type=detectImportType(file,rows,text);
      const quantityKeys=["Amount","amount","groupCount","quantity","Menge","count"];
      analysis.cards=rows.reduce((sum,row)=>sum+Math.max(1,Math.round(num(getAny(row,quantityKeys),1))),0);
      if(analysis.type==="inventory")analysis.key=`STOCK-${file.name}-${Number(file.size||0)}-${Number(file.lastModified||0)}-${rows.length}`;
      if(analysis.type==="purchase")analysis.key=purchaseShipmentKey(file,rows);
      if(analysis.type==="sale")analysis.key=(file.name.match(/(\d{6,})/)||[])[1]||String(getAny(rows[0]||{},["orderNo","orderId","idOrder","Bestellnummer"])||"").trim();
      if(analysis.type==="settlement"){analysis.cards=rows.length;analysis.key=`SETTLEMENT-${file.name}-${file.size||rows.length}-${file.lastModified||Date.now()}`;}
      if(["purchaseGeneric","saleGeneric"].includes(analysis.type)){
        const existing=new Set((analysis.type==="purchaseGeneric"?state.purchases:state.sales).map(row=>String(row.orderNo||"").trim()).filter(Boolean));
        const duplicateOrders=rows.map(row=>String(getAny(row,["orderNo","bestellnr","Bestellnummer"])).trim()).filter(orderNo=>orderNo&&existing.has(orderNo));
        if(duplicateOrders.length){analysis.duplicate=true;analysis.blocked=true;analysis.warnings.push(`Bestellnummer bereits vorhanden: ${[...new Set(duplicateOrders)].slice(0,5).join(", ")}`);}
      }
      if(analysis.type==="unknown")analysis.warnings.push("Dateityp konnte nicht sicher erkannt werden. Bitte den richtigen Typ auswählen.");
      if(analysis.type==="inventory")analysis.warnings.push("Vollständiger Abgleich: Neue Positionen werden ergänzt, nicht mehr angebotene Cardmarket-Positionen aus dem aktuellen Bestand entfernt. Verkaufs- und Stornohistorie sowie manuelle/private Bestände bleiben erhalten.");
    }
    analysis.duplicate=analysis.duplicate||importDuplicateFor(analysis.type,analysis.key,file.name);
    if(analysis.duplicate&&analysis.type==="purchase"){
      analysis.blocked=false;analysis.updateExisting=true;analysis.warnings.push("Dieser Einkauf ist bereits vorhanden. Der Import aktualisiert Positionen und Druckdaten, ohne die Bestellung zu verdoppeln oder Zuteilungen zu löschen.");
    }else if(analysis.duplicate){analysis.blocked=true;analysis.warnings.push("Diese Datei oder Bestellnummer wurde bereits importiert.");}
  }catch(error){analysis.blocked=true;analysis.error=error.message;analysis.warnings.push(error.message);}
  return analysis;
}

function renderImportPreviewDialog() {
  const content=document.getElementById("importPreviewContent");
  const confirmButton=document.getElementById("importPreviewConfirm");
  if(!content||!confirmButton)return;
  const options=IMPORT_SELECT_TYPES.map(type=>`<option value="${type}">${escapeHtml(IMPORT_TYPE_LABELS[type])}</option>`).join("");
  content.innerHTML=`<div class="import-preview-summary"><strong>${pendingImportBatch.length} Datei${pendingImportBatch.length===1?"":"en"}</strong><span>${pendingImportBatch.filter(row=>!row.blocked&&row.type!=="unknown").length} bereit · ${pendingImportBatch.filter(row=>row.blocked).length} gesperrt</span></div><div class="import-preview-list">${pendingImportBatch.map(item=>{const existing=state.purchases.find(row=>String(row.orderNo||row.importKey||"")===String(item.key||""))||{};return `<article class="import-preview-item ${item.blocked?"blocked":""}" data-import-preview-id="${item.id}"><div><strong>${escapeHtml(item.metadata.path||item.fileName)}</strong><small>${Number(item.rows||0)} Positionen · ca. ${Number(item.cards||0)} Karten${item.key?` · ${escapeHtml(item.key)}`:""}</small></div><label>Erkannter Typ<select data-import-type="${item.id}" ${/\.json$|\.html?$/i.test(item.fileName)?"disabled":""}><option value="${item.type}">${escapeHtml(IMPORT_TYPE_LABELS[item.type]||item.type)}</option>${options}</select></label>${item.type==="purchase"?`<div class="import-purchase-details"><label>Kaufdatum<input type="date" data-import-purchase-date="${item.id}" value="${escapeHtml(existing.date||todayISO())}"/></label><label>Verkäufer<input data-import-purchase-seller="${item.id}" value="${escapeHtml(existing.seller||"")}" placeholder="Cardmarket-Name"/></label><label>Einkaufsversand (€)<input type="number" min="0" step="0.01" data-import-purchase-shipping="${item.id}" value="${Number(existing.shipping||0)}"/></label><label>Zusatzkosten (€)<input type="number" min="0" step="0.01" data-import-purchase-extra="${item.id}" value="${Number(existing.extra||0)}"/></label><label>Gutschrift (€)<input type="number" min="0" step="0.01" data-import-purchase-refund="${item.id}" value="${Number(existing.refund||0)}"/></label></div>`:""}${item.warnings.length?`<div class="import-preview-warnings">${item.warnings.map(message=>`<span>${escapeHtml(message)}</span>`).join("")}</div>`:`<div class="import-preview-ok">Keine Auffälligkeiten gefunden.</div>`}<label class="import-approval"><input type="checkbox" data-import-approved="${item.id}" ${item.blocked||item.type==="unknown"?"disabled":"checked"}/> Diese Datei importieren</label></article>`;}).join("")}</div>`;
  confirmButton.disabled=!pendingImportBatch.some(item=>!item.blocked&&item.type!=="unknown");
}

function showImportPreview() {
  renderImportPreviewDialog();
  const dialog=document.getElementById("importPreviewDialog");
  showDialogSafely(dialog);
}

async function runUniversalImport(files,metadata=[]) {
  if(!files?.length)return;
  const analyses=[];
  for(let index=0;index<files.length;index++)analyses.push(await analyzeImportFile(files[index],metadata[index]||{}));
  pendingImportBatch=analyses;
  showImportPreview();
}

async function confirmImportPreview() {
  const out=document.getElementById("universalImportPreview");
  const results=[];
  const selected=pendingImportBatch.filter(item=>!item.blocked&&document.querySelector(`[data-import-approved="${item.id}"]`)?.checked);
  document.getElementById("importPreviewConfirm").disabled=true;
  for(const item of selected){
    try{
      const forcedType=document.querySelector(`[data-import-type="${item.id}"]`)?.value||item.type;
      const purchaseDetails=forcedType==="purchase"?{
        date:document.querySelector(`[data-import-purchase-date="${item.id}"]`)?.value||todayISO(),
        seller:document.querySelector(`[data-import-purchase-seller="${item.id}"]`)?.value||"Aus CSV",
        shipping:document.querySelector(`[data-import-purchase-shipping="${item.id}"]`)?.value||0,
        extra:document.querySelector(`[data-import-purchase-extra="${item.id}"]`)?.value||0,
        refund:document.querySelector(`[data-import-purchase-refund="${item.id}"]`)?.value||0
      }:{};
      const result=await universalImportFile(item.file,{forcedType,purchaseDetails});
      if(item.metadata.path&&item.metadata.signature)state.sync.processedFiles[item.metadata.path]=item.metadata.signature;
      results.push(`<div class="success"><strong>${escapeHtml(item.metadata.path||item.fileName)}</strong><br>${escapeHtml(IMPORT_TYPE_LABELS[result.type]||result.type||"Import")} · ${Number(result.rows||0)} Positionen · ${Number(result.cards||0)} Karten${result.added!==undefined?` · ${Number(result.added||0)} neu · ${Number(result.removed||0)} entfernt`:""}${result.warning?`<br><span class="warning-text">${escapeHtml(result.warning)}</span>`:""}</div>`);
    }catch(error){results.push(`<div class="error"><strong>${escapeHtml(item.fileName)}</strong><br>${escapeHtml(error.message)}</div>`);}
  }
  pendingFolderImports=pendingFolderImports.filter(folder=>!selected.some(item=>item.metadata.path===folder.path&&item.metadata.signature===folder.signature));
  saveState();updateAutomationUi();
  document.getElementById("importPreviewDialog").close();
  if(out)out.innerHTML=results.join("")||'<div class="muted">Es wurde keine Datei ausgewählt.</div>';
  const folderOut=document.getElementById("folderSyncPreview");if(folderOut&&results.length)folderOut.innerHTML=results.join("");
  pendingImportBatch=[];renderAll();
}


const OFFICIAL_YGO_PRICE_GUIDE = "https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_3.json";
let syncDirectoryHandle = null;
let folderSyncTimer = null;

function normalizeCardName(value="") {
  const withoutVariant = String(value).replace(/\([^)]*\)/g," ");
  return window.TcgCardSearch?.normalizeSpaced(withoutVariant) || withoutVariant.toLocaleLowerCase("de-DE").trim();
}

function inferWatchProduct(w) {
  const currentId=cleanProductId(w.productId);
  if(currentId) return resolveProduct(currentId,w);
  const targetName=normalizeCardName(w.name);
  const targetSet=String(w.set||"").toUpperCase();
  const targetRarity=String(w.version||"").toLowerCase();
  const entries=Object.entries(state.productCatalog||{});
  const candidates=entries.filter(([,p])=>{
    const n=normalizeCardName(p.name||"");
    if(!n.startsWith(targetName) && !targetName.startsWith(n)) return false;
    if(targetSet && String(p.set||"").toUpperCase()!==targetSet) return false;
    if(targetRarity.includes("secret") && !String(p.rarity||"").toLowerCase().includes("secret")) return false;
    if(targetRarity.includes("ultra") && !String(p.rarity||"").toLowerCase().includes("ultra")) return false;
    if(targetRarity.includes("super") && !String(p.rarity||"").toLowerCase().includes("super")) return false;
    return true;
  });
  if(candidates.length===1){
    const [id,p]=candidates[0]; w.productId=id; w.productUrl=w.productUrl||p.productUrl||""; return {...p,productId:id};
  }
  return null;
}

function priceGuideRows(payload) {
  if(Array.isArray(payload)) return payload;
  if(Array.isArray(payload?.priceGuide)) return payload.priceGuide;
  if(Array.isArray(payload?.products)) return payload.products;
  if(payload && typeof payload==="object") {
    return Object.entries(payload).map(([key,value])=>{
      if(value && typeof value==="object" && !Array.isArray(value)) return {idProduct:key,...value};
      return null;
    }).filter(Boolean);
  }
  return [];
}

function applyOfficialPriceGuide(payload, source="Cardmarket Price Guide") {
  const rows=priceGuideRows(payload);
  const byId=new Map();
  rows.forEach(r=>{
    const id=cleanProductId(r.idProduct ?? r.productId ?? r.id);
    if(id) byId.set(id,r);
  });
  let updated=0, unmatched=0;
  const pickRow=(r,...names)=>{for(const n of names){if(r[n]!==undefined&&r[n]!==null&&r[n]!=="")return Number(r[n]);}return "";};
  byId.forEach((r,id)=>{state.productCatalog[id]={...(state.productCatalog[id]||{}),low:pickRow(r,"LOW","low","lowPrice"),trend:pickRow(r,"TREND","trend","trendPrice"),avg1:pickRow(r,"AVG1","avg1"),avg7:pickRow(r,"AVG7","avg7"),avg30:pickRow(r,"AVG30","avg30"),priceDate:todayISO()};});
  state.watchlist.forEach(w=>{
    const inferred=inferWatchProduct(w);
    const id=cleanProductId(w.productId || inferred?.productId);
    const r=byId.get(id);
    if(!r){unmatched++;return;}
    const pick=(...names)=>{for(const n of names){if(r[n]!==undefined&&r[n]!==null&&r[n]!=="")return Number(r[n]);}return "";};
    w.currentBuy=pick("LOW","low","lowPrice");
    w.low=w.currentBuy;
    w.trend=pick("TREND","trend","trendPrice");
    w.avg1=pick("AVG1","avg1");
    w.avg7=pick("AVG7","avg7");
    w.avg30=pick("AVG30","avg30");
    w.priceDate=todayISO();
    updated++;
  });
  state.sync.lastPriceUpdate=new Date().toISOString();
  state.imports.push({id:uid(),type:"prices",key:`official-prices-${Date.now()}`,file:source,date:new Date().toISOString(),rows:rows.length,cards:updated});
  saveState();renderAll();updateAutomationUi();
  return {rows:rows.length,updated,unmatched};
}

async function updateOfficialMarketPrices(manual=true) {
  const out=document.getElementById("autoPricePreview");
  if(out) out.innerHTML='<div class="muted">Offizieller Cardmarket-Price-Guide wird geladen …</div>';
  try{
    const response=await fetch(OFFICIAL_YGO_PRICE_GUIDE,{cache:"no-store"});
    if(!response.ok) throw new Error(`Download fehlgeschlagen (${response.status})`);
    const result=applyOfficialPriceGuide(await response.json(),"Offizieller Cardmarket Yu-Gi-Oh! Price Guide");
    if(out) out.innerHTML=`<div class="success"><strong>Marktpreise aktualisiert</strong><br>${result.updated} Watchlist-Karten aktualisiert · ${result.rows} Preiszeilen gelesen${result.unmatched?` · ${result.unmatched} ohne eindeutige Produkt-ID`:""}</div>`;
    return result;
  }catch(err){
    if(out) out.innerHTML=`<div class="error"><strong>Automatischer Download nicht möglich</strong><br>${escapeHtml(err.message)}<br><small>Alternativ die Datei price_guide_3.json in den überwachten Ordner speichern.</small></div>`;
    if(manual) throw err;
  }
}

const syncHandleCache = window.TcgIndexedDbRecovery.createIndexedDbRecovery({
  indexedDB,
  name:"tcgWawiHandles",
  version:1,
  onUpgrade:db=>{
    if(!db.objectStoreNames.contains("handles")) db.createObjectStore("handles");
  },
  onStatus:event=>{
    if(event.status==="defect-detected") console.warn("Defekter Ordner-Cache erkannt; er wird automatisch neu aufgebaut.",event.reason);
    if(event.status==="repair-error") console.error("Ordner-Cache konnte nicht repariert werden.",event.error);
  }
});
function openSyncDb(){return syncHandleCache.open();}
async function saveDirectoryHandle(handle){
  return syncHandleCache.withRecovery(db=>new Promise((resolve,reject)=>{
    let tx;
    try{tx=db.transaction("handles","readwrite");tx.objectStore("handles").put(handle,"syncDirectory");}
    catch(error){reject(error);return;}
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  }));
}
async function loadDirectoryHandle(){
  return syncHandleCache.withRecovery(db=>new Promise((resolve,reject)=>{
    let req;
    try{req=db.transaction("handles","readonly").objectStore("handles").get("syncDirectory");}
    catch(error){reject(error);return;}
    req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  }));
}
async function repairSyncHandleCache(){
  syncDirectoryHandle=null;
  await syncHandleCache.repair();
  updateAutomationUi();
  return {ok:true};
}
window.tcgRepairSyncHandleCache=repairSyncHandleCache;

async function ensureDirectoryPermission(handle,write=false){
  if(!handle) return false; const opts={mode:write?"readwrite":"read"};
  if(await handle.queryPermission(opts)==="granted") return true;
  return await handle.requestPermission(opts)==="granted";
}

async function chooseSyncFolder(){
  if(!window.showDirectoryPicker){alert("Die Ordnerüberwachung wird von diesem Browser nicht unterstützt. Bitte Chrome oder Edge verwenden.");return;}
  syncDirectoryHandle=await window.showDirectoryPicker({mode:"read"});
  await saveDirectoryHandle(syncDirectoryHandle);
  state.sync.processedFiles={};saveState();updateAutomationUi();await scanSyncFolder(true);startFolderSyncTimer();
}

function isAutomaticImportCandidate(name="") {
  const lower=String(name).toLowerCase();
  // Sicherungskopien dürfen niemals automatisch importiert werden: Ein Backup
  // ersetzt den kompletten aktuellen Datenbestand und würde dadurch später
  // manuell importierte Einkäufe wieder entfernen.
  if (/backup|warenwirtschaft_backup|sicherung/.test(lower)) return false;
  if (/\.(csv|html?|htlm)$/i.test(lower)) return true;
  // JSON wird automatisch nur für ausdrücklich unterstützte Update-Dateien gelesen.
  return /price_guide_3\.json$/i.test(lower) || /watchlist.*update.*\.json$/i.test(lower);
}

async function listSyncFiles(handle,path=""){
  const files=[];
  for await (const [name,entry] of handle.entries()){
    if(entry.kind==="file"){
      if(isAutomaticImportCandidate(name)) files.push({entry,path:path+name});
    }
  }
  return files;
}

async function scanSyncFolder(manual=false){
  const out=document.getElementById("folderSyncPreview");
  try{
    if(!syncDirectoryHandle) syncDirectoryHandle=await loadDirectoryHandle();
    if(!syncDirectoryHandle){if(manual) alert("Bitte zuerst einen Ordner auswählen.");updateAutomationUi();return;}
    if(!(await ensureDirectoryPermission(syncDirectoryHandle))){if(manual) alert("Zugriff auf den Ordner wurde nicht erlaubt.");return;}
    const entries=await listSyncFiles(syncDirectoryHandle);
    const newFiles=[];
    for(const {entry,path} of entries){
      const file=await entry.getFile(); const signature=`${file.size}:${file.lastModified}`;
      if(state.sync.processedFiles[path]!==signature) newFiles.push({file,path,signature});
    }
    if(!newFiles.length){if(manual&&out)out.innerHTML='<div class="success">Keine neuen oder geänderten Dateien gefunden.</div>';updateAutomationUi();return;}
    newFiles.forEach(item=>{
      if(!pendingFolderImports.some(pending=>pending.path===item.path&&pending.signature===item.signature))pendingFolderImports.push(item);
    });
    updateAutomationUi();
    if(out)out.innerHTML=`<div class="warning"><strong>${pendingFolderImports.length} Datei${pendingFolderImports.length===1?" wartet":"en warten"} auf Prüfung</strong><br>Es wurde noch nichts gespeichert. Öffne die Vorschau und bestätige die richtigen Importtypen.</div>`;
    if(manual)await runUniversalImport(pendingFolderImports.map(item=>item.file),pendingFolderImports.map(item=>({path:item.path,signature:item.signature})));
  }catch(err){if(out)out.innerHTML=`<div class="error">${escapeHtml(err.message)}</div>`;}
}

function startFolderSyncTimer(){
  clearInterval(folderSyncTimer);
  if(state.sync.autoFolder) folderSyncTimer=setInterval(()=>scanSyncFolder(false),30000);
}

function updateAutomationUi(){
  const name=document.getElementById("syncFolderName"); const status=document.getElementById("syncFolderStatus");
  if(name) name.textContent=syncDirectoryHandle?.name || "Kein Ordner verbunden";
  if(status) status.textContent=syncDirectoryHandle ? `Automatische Prüfung ${state.sync.autoFolder?"aktiv":"pausiert"} · ${Object.keys(state.sync.processedFiles||{}).length} Dateien bekannt` : "Unterstützt Chrome und Edge. Der Browser muss geöffnet bleiben.";
  const price=document.getElementById("autoPriceStatus");
  if(price) price.textContent=state.sync.lastPriceUpdate ? `Zuletzt aktualisiert: ${new Date(state.sync.lastPriceUpdate).toLocaleString("de-DE")}` : "Noch nicht aktualisiert";
  const folderToggle=document.getElementById("autoFolderSyncToggle"); if(folderToggle) folderToggle.checked=state.sync.autoFolder!==false;
  const reviewButton=document.getElementById("reviewFolderImportsBtn");if(reviewButton){reviewButton.hidden=!pendingFolderImports.length;reviewButton.textContent=pendingFolderImports.length?`${pendingFolderImports.length} wartende Datei${pendingFolderImports.length===1?"":"en"} prüfen`:"Wartende Dateien prüfen";}
  const priceToggle=document.getElementById("autoPriceToggle"); if(priceToggle) priceToggle.checked=state.sync.autoPrices!==false;
}

async function initAutomation(){
  try{syncDirectoryHandle=await loadDirectoryHandle();}catch{}
  updateAutomationUi();startFolderSyncTimer();
  if(syncDirectoryHandle&&state.sync.autoFolder) setTimeout(()=>scanSyncFolder(false),1200);
  // Der taegliche Price-Guide-Lauf wird zentral im Cardmarket-Datencenter
  // geplant. So koennen manueller Button und Automatik nie parallel importieren.
}

async function exportBackup(){
  const payload=window.desktopApp?.createBackupBundle?await window.desktopApp.createBackupBundle(state):state;
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`TCG_Warenwirtschaft_Backup_${todayISO()}.json`;a.click();URL.revokeObjectURL(a.href);
}
async function importBackupPayload(data,fileName="Backup.json"){
  if(data?.format==="tcg-business-manager-backup-v2"){
    if(!window.desktopApp?.restoreBackupBundle)throw new Error("Diese Sicherung mit Sammlungsfotos kann nur in der Desktop-App wiederhergestellt werden.");
    const restored=await window.desktopApp.restoreBackupBundle(data);
    state=migrateState(restored.state);
    localStorage.setItem(DB_KEY,JSON.stringify(state));
    localStorage.setItem(DESKTOP_UPDATED_KEY,restored.result?.updatedAt||new Date().toISOString());
  }else{
    state=migrateState(data);saveState();
  }
  renderAll();return {file:fileName};
}
async function importBackup(file){return importBackupPayload(JSON.parse(await file.text()),file.name);}

document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-view-jump]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.viewJump)));
document.getElementById("navBackBtn")?.addEventListener("click",navigateBack);
document.getElementById("navForwardBtn")?.addEventListener("click",navigateForward);
window.addEventListener("mouseup",event=>{
  if(event.button===3){event.preventDefault();navigateBack();}
  else if(event.button===4){event.preventDefault();navigateForward();}
});

let activeViewInputRenderTimer = null;
function scheduleActiveViewRender() {
  clearTimeout(activeViewInputRenderTimer);
  activeViewInputRenderTimer = setTimeout(renderAll, 140);
}
["inventorySearch","privateSearch","purchaseSearch","salesSearch","salesAnalysisSearch","salesAnalysisMinSales","salesAnalysisMinRoi","salesAnalysisMinAverageProfit","salesAnalysisMinTotalProfit","salesAnalysisLastSaleFrom","salesAnalysisPriceMin","salesAnalysisPriceMax","watchSearch","materialSearch","expenseSearch","slowMoverSearch","slowMoverPriceMin","slowMoverPriceMax"].forEach(id=>document.getElementById(id)?.addEventListener("input",scheduleActiveViewRender));
// Auswahlfelder erst nach der bestätigten Auswahl neu zeichnen. Ein Neuaufbau
// während des Öffnens würde das native Auswahlmenü sofort wieder schließen.
["inventoryStatusFilter","inventorySetFilter","inventoryRarityFilter","inventoryLanguageFilter","inventoryConditionFilter","inventoryStockFilter","inventoryAgeFilter","inventoryQualityFilter","inventoryProfitFilter","inventorySort","privateSetFilter","privateRarityFilter","privateLanguageFilter","privateConditionFilter","privateSaleIntentFilter","purchaseStatusFilter","purchaseSellerFilter","purchasePaymentFilter","purchaseAllocationFilter","salesStatusFilter","salesCustomerFilter","salesPaymentFilter","salesProfitFilter","salesAnalysisQuality","salesAnalysisTurnover","salesAnalysisProfile","salesAnalysisSet","salesAnalysisRarity","salesAnalysisSort","watchStatusFilter","watchPriorityFilter","watchStockFilter","watchDataFilter","watchPricingFilter","wantlistFilter","wantlistPurposeFilter","wantlistRecommendationFilter","wantlistShowArchived","expenseCategoryFilter","expenseTypeFilter","slowMoverAgeFilter","slowMoverPriceGroup","slowMoverProfile","slowMoverCost","slowMoverLongTerm","slowMoverLanguage","slowMoverCondition","slowMoverTrend","slowMoverRecommendation","slowMoverProfitTarget","slowMoverSort"].forEach(id=>document.getElementById(id)?.addEventListener("change",renderAll));

document.getElementById("inventoryFilterReset").onclick=()=>{["inventorySearch","inventoryStatusFilter","inventorySetFilter","inventoryRarityFilter","inventoryLanguageFilter","inventoryConditionFilter","inventoryAgeFilter","inventoryQualityFilter","inventoryProfitFilter"].forEach(id=>document.getElementById(id).value="");document.getElementById("inventoryStockFilter").value="current";document.getElementById("inventorySort").value="name";renderAll();};
document.getElementById("privateFilterReset").onclick=()=>{["privateSearch","privateSetFilter","privateRarityFilter","privateLanguageFilter","privateConditionFilter","privateSaleIntentFilter"].forEach(id=>document.getElementById(id).value="");renderAll();};
document.getElementById("purchaseFilterReset").onclick=()=>{["purchaseSearch","purchaseStatusFilter","purchaseSellerFilter","purchasePaymentFilter","purchaseAllocationFilter"].forEach(id=>document.getElementById(id).value="");renderAll();};
document.getElementById("salesFilterReset").onclick=()=>{["salesSearch","salesStatusFilter","salesCustomerFilter","salesPaymentFilter","salesProfitFilter"].forEach(id=>document.getElementById(id).value="");renderAll();};
document.getElementById("salesAnalysisFilterReset").onclick=()=>{["salesAnalysisSearch","salesAnalysisMinSales","salesAnalysisQuality","salesAnalysisTurnover","salesAnalysisProfile","salesAnalysisSet","salesAnalysisRarity","salesAnalysisMinRoi","salesAnalysisMinAverageProfit","salesAnalysisMinTotalProfit","salesAnalysisLastSaleFrom","salesAnalysisPriceMin","salesAnalysisPriceMax"].forEach(id=>document.getElementById(id).value="");document.getElementById("salesAnalysisSort").value="sales-desc";renderAll();};
document.getElementById("watchFilterReset").onclick=()=>{["watchSearch","watchStatusFilter","watchPriorityFilter","watchStockFilter","watchDataFilter","watchPricingFilter"].forEach(id=>document.getElementById(id).value="");renderAll();};
document.getElementById("wantlistFilterReset").onclick=()=>{["wantlistFilter","wantlistPurposeFilter","wantlistRecommendationFilter"].forEach(id=>document.getElementById(id).value="");document.getElementById("wantlistShowArchived").checked=false;renderAll();};
document.getElementById("slowMoverFilterReset").onclick=()=>{["slowMoverSearch","slowMoverAgeFilter","slowMoverPriceGroup","slowMoverProfile","slowMoverCost","slowMoverLongTerm","slowMoverLanguage","slowMoverCondition","slowMoverTrend","slowMoverRecommendation","slowMoverProfitTarget","slowMoverPriceMin","slowMoverPriceMax"].forEach(id=>document.getElementById(id).value="");document.getElementById("slowMoverSort").value="age-desc";renderAll();};

document.getElementById("addInventoryBtn").onclick=()=>addInventory();
document.getElementById("purchasePriceImportBtn").onclick=()=>document.getElementById("purchasePriceImportFile").click();
document.getElementById("purchasePriceImportFile").onchange=event=>{
  const files=[...(event.target.files||[])];
  event.target.value="";
  if(files.length)openPurchasePriceImport(files);
};
document.getElementById("purchasePriceImportClose").onclick=()=>document.getElementById("purchasePriceImportDialog").close();
document.getElementById("purchasePriceImportCancel").onclick=()=>document.getElementById("purchasePriceImportDialog").close();
document.getElementById("purchasePriceImportConfirm").onclick=()=>confirmPurchasePriceImport();
document.getElementById("addPrivateBtn").onclick=()=>addInventory({},"private");
document.getElementById("scanInventoryBtn").onclick=()=>openIphoneScanner("business");
document.getElementById("scanPrivateBtn").onclick=()=>openIphoneScanner("private");
document.getElementById("scannerClose").onclick=closeIphoneScanner;
document.getElementById("scannerStop").onclick=closeIphoneScanner;
document.getElementById("scannerDialog").addEventListener("cancel",event=>{event.preventDefault();closeIphoneScanner();});
document.getElementById("addPurchaseBtn").onclick=()=>addPurchase();
document.getElementById("addSaleBtn").onclick=()=>addSale();
document.getElementById("addMaterialBtn").onclick=()=>addMaterial();
document.getElementById("buyMaterialBtn").onclick=()=>buyMaterial();
document.getElementById("addTemplateBtn").onclick=()=>addTemplate();
document.getElementById("addExpenseBtn").onclick=()=>addExpense();
document.getElementById("addWatchBtn").onclick=()=>addWatch();
document.getElementById("wantlistImportFile").onchange=async event=>{const file=event.target.files?.[0];if(!file)return;try{const result=await importWantlistFile(file);alert(`${result.totalRows} Wantlist-Einträge verarbeitet: ${result.created} neu, ${result.updated} geändert, ${result.archived} archiviert.${result.unmatched?` ${result.unmatched} Einträge benötigen noch eine eindeutige Druckvariante.`:""}`);}catch(error){alert(`Wantlist konnte nicht importiert werden: ${error.message}`);}finally{event.target.value="";}};
document.getElementById("newPurchaseDraftBtn").onclick=()=>{state.activePurchaseDraftId="";document.getElementById("purchaseCartPaste").value="";document.getElementById("purchaseDraftSeller").value="";document.getElementById("purchaseDraftShipping").value="0";document.getElementById("purchaseDraftExtra").value="0";renderBuyingPlanner();};
document.getElementById("purchaseDraftSelect").onchange=event=>{state.activePurchaseDraftId=event.target.value;renderBuyingPlanner();};
document.getElementById("analyzePurchaseCartBtn").onclick=async()=>{
  const button=document.getElementById("analyzePurchaseCartBtn"),oldText=button.textContent;button.disabled=true;button.textContent="Preise werden geprüft …";
  try{const items=parsePurchaseDraftText(document.getElementById("purchaseCartPaste").value);if(!items.length){alert("Keine Kartenpositionen erkannt. Bitte Datei oder eingefügte Zeilen prüfen.");return;}const existing=activePurchaseDraft();const draft=existing||{id:uid(),name:`Einkaufsentwurf ${new Date().toLocaleString("de-DE")}`,createdAt:new Date().toISOString()};Object.assign(draft,{seller:document.getElementById("purchaseDraftSeller").value.trim(),shipping:Number(document.getElementById("purchaseDraftShipping").value||0),extra:Number(document.getElementById("purchaseDraftExtra").value||0),items});if(!existing)state.purchaseDrafts.unshift(draft);state.activePurchaseDraftId=draft.id;analyzeActivePurchaseDraft();await refreshActivePurchaseDraftPrices(true);saveState();renderAll();}catch(error){alert(`Warenkorb konnte nicht gelesen werden: ${error.message}`);}finally{button.disabled=false;button.textContent=oldText;}
};
document.getElementById("purchaseCartFile").onchange=async event=>{const file=event.target.files?.[0];if(!file)return;try{document.getElementById("purchaseCartPaste").value=await file.text();document.getElementById("analyzePurchaseCartBtn").click();}finally{event.target.value="";}};
document.getElementById("savePurchaseDraftBtn").onclick=()=>{const draft=activePurchaseDraft();if(!draft){alert("Bitte zuerst einen Warenkorb analysieren.");return;}draft.seller=document.getElementById("purchaseDraftSeller").value.trim();draft.shipping=Number(document.getElementById("purchaseDraftShipping").value||0);draft.extra=Number(document.getElementById("purchaseDraftExtra").value||0);const name=prompt("Name für diesen Einkaufsentwurf:",draft.name||"Einkaufsentwurf");if(name===null)return;draft.name=name.trim()||draft.name;analyzeActivePurchaseDraft();saveState();renderAll();};
document.getElementById("purchaseDraftTable").addEventListener("change",event=>{const draft=activePurchaseDraft();if(!draft)return;const id=event.target.dataset.draftEnabled||event.target.dataset.draftPrivate||event.target.dataset.draftQuantity||event.target.dataset.draftPrice;const row=draft.items.find(item=>item.id===id);if(!row)return;if(event.target.dataset.draftEnabled)row.enabled=event.target.checked;if(event.target.dataset.draftPrivate)row.privateQuantity=Math.min(row.quantity,Math.max(0,Math.round(Number(event.target.value||0))));if(event.target.dataset.draftQuantity){row.quantity=Math.max(1,Math.round(Number(event.target.value||1)));row.privateQuantity=Math.min(row.privateQuantity,row.quantity);}if(event.target.dataset.draftPrice)row.unitPrice=Math.max(0,Number(event.target.value||0));analyzeActivePurchaseDraft();saveState();renderBuyingPlanner();});
document.getElementById("convertPurchaseDraftBtn").onclick=()=>{const draft=activePurchaseDraft();if(!draft?.analysis?.lines?.length){alert("Bitte zuerst einen Warenkorb analysieren.");return;}if(draft.convertedPurchaseId){const existing=state.purchases.find(row=>row.id===draft.convertedPurchaseId);if(existing){openOrderDetails("purchase",existing.id);return;}}const orderNo=prompt("Bestellnummer eintragen (nach dem Kauf von Cardmarket übernehmen):",`ENTWURF-${Date.now()}`);if(orderNo===null)return;const lines=draft.analysis.lines.filter(row=>row.enabled!==false&&row.quantity>0);const purchase={id:uid(),orderNo:orderNo.trim()||`ENTWURF-${Date.now()}`,date:todayISO(),seller:draft.seller||"Cardmarket",country:"",items:lines.reduce((sum,row)=>sum+row.quantity,0),cardValue:lines.reduce((sum,row)=>sum+row.quantity*row.unitPrice,0),shipping:Number(draft.shipping||0),extra:Number(draft.extra||0),refund:0,status:"Bestellt",paymentStatus:"Bezahlt",note:`Aus Einkaufsentwurf „${draft.name||"ohne Namen"}“ übernommen. Mengen für Geschäft und Privat sind für den Wareneingang vorgemerkt.`,pendingItems:lines.map(row=>({...row,receiptLineKey:`DRAFT:${draft.id}:${row.id}`,plannedPrivate:row.privateQuantity,plannedBusiness:Math.max(0,row.quantity-row.privateQuantity),receivedBusiness:0,receivedPrivate:0,receivedDamaged:0,cancelledQuantity:0})),inventoryCreated:false,costAllocationMethod:"value",sourceDraftId:draft.id};state.purchases.unshift(purchase);draft.convertedPurchaseId=purchase.id;draft.convertedAt=new Date().toISOString();saveState();renderAll();showView("purchases");openOrderDetails("purchase",purchase.id);};
document.getElementById("refreshStaplesBtn").onclick=refreshPublicStaples;
document.getElementById("demandRadarFile").onchange=async event=>{const file=event.target.files?.[0];if(!file)return;try{await importDemandRadarFile(file);}catch(error){alert(`Meta-Datei konnte nicht gelesen werden: ${error.message}`);}finally{event.target.value="";}};
["demandCategoryFilter","demandRecommendationFilter","demandBudgetFilter"].forEach(id=>document.getElementById(id).addEventListener("change",renderDemandRadar));
document.getElementById("demandFilterReset").onclick=()=>{["demandCategoryFilter","demandRecommendationFilter","demandBudgetFilter"].forEach(id=>document.getElementById(id).value="");renderDemandRadar();};
document.getElementById("addSellerBtn").onclick=()=>addPartner("seller");
document.getElementById("addCustomerBtn").onclick=()=>addPartner("customer");
document.getElementById("quickAddBtn").onclick=()=>addInventory();
document.getElementById("capitalAddAccountBtn").onclick=addCapitalAccount;
document.getElementById("capitalAddEntryBtn").onclick=addCapitalEntry;
document.getElementById("capitalAddTransferBtn").onclick=addCapitalTransfer;

document.body.addEventListener("click",e=>{
  const wantButton=e.target.closest("[data-want-to-watch], [data-toggle-want-archive], [data-assign-want-variant]");
  if(wantButton){
    const value=wantButton.dataset.wantToWatch||wantButton.dataset.toggleWantArchive||wantButton.dataset.assignWantVariant||"";const [listId,entryId]=value.split("|");
    const list=state.wantlists.find(row=>row.id===listId),entry=list?.entries?.find(row=>row.id===entryId);
    if(!list||!entry)return;
    if(wantButton.dataset.assignWantVariant){assignWantlistVariant(listId,entryId);return;}
    if(wantButton.dataset.toggleWantArchive){entry.archived=!entry.archived;entry.archivedAt=entry.archived?new Date().toISOString():"";saveState();renderAll();return;}
    const market=marketRecordForProduct(entry),productId=cleanProductId(market.productId);
    if(!productId){alert("Bitte zuerst eine eindeutige Cardmarket-Druckvariante zuordnen.");return;}
    const existing=state.watchlist.find(row=>!row.archived&&cleanProductId(row.productId)===productId);
    if(existing){showView("watchlist");document.getElementById("watchSearch").value=productId;renderAll();return;}
    const targets=window.TcgBusinessAutomation.calculateAutomaticPriceTargets(market,forwardPricingSettings());
    state.watchlist.push({id:uid(),priority:entry.priority||"B",productId,name:market.name,germanName:market.germanName,englishName:market.englishName,set:market.set||market.setName,version:market.rarity||market.version,stock:0,target:Number(entry.quantity||state.settings.targetStock||0),maxBuy:Number(targets.maxBuy||0),targetSell:Number(targets.recommendedSell||0),currentBuy:market.low||"",low:market.low||"",trend:market.trend||"",avg1:market.avg1||"",avg7:market.avg7||"",avg30:market.avg30||"",reprint:"",banlist:"",priceDate:market.priceDate||"",productUrl:market.productUrl||"",pricingMode:"automatic",sourceWantlistId:list.id});
    saveState();renderAll();return;
  }
  const actionTarget=e.target.closest("[data-edit-inventory], [data-edit-private], [data-private-to-business], [data-business-to-private], [data-delete-private], [data-edit-inventory-group], [data-apply-group-price], [data-inventory-details], [data-correct-inventory], [data-cancel-movement], [data-edit-purchase], [data-receive-purchase], [data-edit-sale], [data-edit-watch], [data-edit-seller], [data-edit-customer], [data-show-seller], [data-show-customer], [data-show-purchase], [data-show-sale], [data-show-material], [data-delete-inventory], [data-delete-inventory-group], [data-delete-purchase], [data-delete-sale], [data-delete-watch], [data-delete-seller], [data-delete-customer], [data-delete-material], [data-edit-material], [data-buy-material], [data-delete-template], [data-edit-template], [data-toggle-expense], [data-edit-expense], [data-remove-usage]");
  const d=(actionTarget||e.target).dataset;
  if(d.editInventory) addInventory(state.inventory.find(x=>x.id===d.editInventory));
  if(d.editPrivate) addInventory(state.privateCollection.find(x=>x.id===d.editPrivate),"private");
  if(d.privateToBusiness){
    const item=state.privateCollection.find(x=>x.id===d.privateToBusiness);
    if(item&&confirm(`„${item.name||"Diese Karte"}“ in den Geschäftsbestand verschieben? Ihr dokumentierter Einstand wird dann in die Geschäftsauswertung einbezogen.`)){
      adjustPurchaseOwnershipForAsset(item,"private","business");
      state.privateCollection=state.privateCollection.filter(row=>row.id!==item.id);
      state.inventory.push({...item,ownership:"business",status:"Im Bestand",listed:false,listingPrice:0});
      addMovement({type:"Privat → Geschäftsbestand",quantity:1,productId:cleanProductId(item.productId),reference:"Eigentumswechsel",note:item.name||"Karte"});saveState();renderAll();
    }
  }
  if(d.businessToPrivate)moveBusinessInventoryToPrivate(d.businessToPrivate);
  if(d.deletePrivate)deletePrivateCard(d.deletePrivate);
  if(d.editInventoryGroup) editInventoryGroup(d.editInventoryGroup);
  if(d.applyGroupPrice){const group=getInventoryGroups().find(row=>row.key===d.applyGroupPrice);if(group)editInventoryGroup(group.key,inventoryGroupPricing(group).suggestedSell);}
  if(d.inventoryDetails) openInventoryDetails(d.inventoryDetails);
  if(d.correctInventory) correctInventoryGroup(d.correctInventory);
  if(d.cancelMovement) cancelInventoryMovement(d.cancelMovement);
  if(d.editPurchase) addPurchase(state.purchases.find(x=>x.id===d.editPurchase));
  if(d.receivePurchase) openPurchaseReceipt(d.receivePurchase);
  if(d.editSale) addSale(state.sales.find(x=>x.id===d.editSale));
  if(d.editWatch) addWatch(state.watchlist.find(x=>x.id===d.editWatch));
  if(d.editSeller) addPartner("seller",state.sellers.find(x=>x.id===d.editSeller));
  if(d.editCustomer) addPartner("customer",state.customers.find(x=>x.id===d.editCustomer));
  if(d.showSeller) showSellerDetails(d.showSeller);
  if(d.showCustomer) showCustomerDetails(d.showCustomer);
  if(d.showPurchase) openOrderDetails("purchase",d.showPurchase);
  if(d.showSale) openOrderDetails("sale",d.showSale);
  if(d.showMaterial) showMaterialHistory(d.showMaterial);
  if(d.deleteInventory && confirm("Karte wirklich als Bestandskorrektur löschen?")) {const item=state.inventory.find(x=>x.id===d.deleteInventory);if(item)adjustPurchaseOwnershipForAsset(item,purchaseBucketForAsset(item,"business"),null);state.inventory=state.inventory.filter(x=>x.id!==d.deleteInventory);saveState();renderAll();}
  if(d.deleteInventoryGroup) {
    const group=getInventoryGroups().find(g=>g.key===d.deleteInventoryGroup);
    if(group && confirm(`${group.quantity} Karte${group.quantity===1?"":"n"} dieser Position wirklich löschen?`)) {
      const ids=new Set(inventoryGroupStats(group).currentItems.map(item=>item.id));
      state.inventory.filter(item=>ids.has(item.id)).forEach(item=>adjustPurchaseOwnershipForAsset(item,purchaseBucketForAsset(item,"business"),null));
      state.inventory=state.inventory.filter(x=>!ids.has(x.id));saveState();renderAll();
    }
  }
  if(d.deletePurchase && confirm("Einkauf wirklich löschen? Noch nicht verkaufte zugehörige Karten werden ebenfalls entfernt.")) {
    state.inventory=state.inventory.filter(i=>i.purchaseId!==d.deletePurchase || i.status==="Verkauft");
    state.privateCollection=state.privateCollection.filter(i=>i.purchaseId!==d.deletePurchase);
    state.purchases=state.purchases.filter(x=>x.id!==d.deletePurchase);saveState();renderAll();
  }
  if(d.deleteSale && confirm("Verkauf wirklich löschen? Zugeordnete Karten werden wieder in den Bestand gelegt.")) deleteSaleRecord(d.deleteSale);
  if(d.deleteWatch && confirm("Watchlist-Eintrag wirklich löschen?")) {state.watchlist=state.watchlist.filter(x=>x.id!==d.deleteWatch);saveState();renderAll();}
  if(d.deleteSeller && confirm("Händler wirklich löschen? Einkaufsbestellungen bleiben erhalten.")) {
    const seller=state.sellers.find(x=>x.id===d.deleteSeller);
    state.partnerExclusions ||= {sellers:[],customers:[]};
    if(seller?.name && !state.partnerExclusions.sellers.includes(seller.name)) state.partnerExclusions.sellers.push(seller.name);
    state.sellers=state.sellers.filter(x=>x.id!==d.deleteSeller);saveState();renderAll();
  }
  if(d.deleteCustomer && confirm("Kunden wirklich löschen? Verkaufsbestellungen bleiben erhalten.")) {
    const customer=state.customers.find(x=>x.id===d.deleteCustomer);
    state.partnerExclusions ||= {sellers:[],customers:[]};
    if(customer?.name && !state.partnerExclusions.customers.includes(customer.name)) state.partnerExclusions.customers.push(customer.name);
    state.customers=state.customers.filter(x=>x.id!==d.deleteCustomer);saveState();renderAll();
  }
  if(d.editMaterial) addMaterial(state.materials.find(x=>x.id===d.editMaterial));
  if(d.buyMaterial) buyMaterial(d.buyMaterial);
  if(d.deleteMaterial && confirm("Material wirklich löschen? Bestehende Verkaufsdaten bleiben erhalten.")) {state.materials=state.materials.filter(x=>x.id!==d.deleteMaterial);saveState();renderAll();}
  if(d.editExpense) addExpense(state.expenses.find(x=>x.id===d.editExpense));
  if(d.toggleExpense){const expense=state.expenses.find(x=>x.id===d.toggleExpense);if(expense&&confirm(expense.status==="Storniert"?"Storno wirklich aufheben und die Ausgabe wieder buchen?":"Ausgabe stornieren? Sie bleibt zur Nachvollziehbarkeit gespeichert.")){expense.status=expense.status==="Storniert"?"Gebucht":"Storniert";expense.cancelledAt=expense.status==="Storniert"?new Date().toISOString():"";addMovement({type:expense.status==="Storniert"?"Ausgabe storniert":"Ausgabe wieder gebucht",quantity:0,expenseId:expense.id,reference:expense.description||expense.category,note:money(expense.amount)});saveState();renderAll();}}
  if(d.editTemplate) addTemplate(state.materialTemplates.find(x=>x.id===d.editTemplate));
  if(d.deleteTemplate && confirm("Versandvorlage wirklich löschen?")) {state.materialTemplates=state.materialTemplates.filter(x=>x.id!==d.deleteTemplate);saveState();renderAll();}
  if("removeUsage" in d) {actionTarget?.closest('[data-usage-row]')?.remove();updateSaleMaterialPreview();}
  if(d.deleteImport) removeImport(state.imports.find(x=>x.id===d.deleteImport));
  if(d.removeImportHistory) removeImportHistory(d.removeImportHistory);
});

document.getElementById("addCapitalAccountBtn").onclick=addCapitalAccount;
document.getElementById("addCapitalEntryBtn").onclick=addCapitalEntry;
document.getElementById("addCapitalTransferBtn").onclick=addCapitalTransfer;

document.getElementById("saveSettingsBtn").onclick=()=>{
  const next={...state.settings,
    feePercent:Number(document.getElementById("settingFee").value||0),
    packaging:Number(document.getElementById("settingPackaging").value||0),
    minProfit:Number(document.getElementById("settingMinProfit").value||0),
    minRoi:Number(document.getElementById("settingMinRoi").value||0),
    targetRoi:Number(document.getElementById("settingTargetRoi").value||30),
    expectedCardsPerOrder:Number(document.getElementById("settingExpectedCardsPerOrder").value||3),
    pricingModelVersion:"market-roi-v2-minprofit",
    priceAgeDays:Number(document.getElementById("settingPriceAge").value||7),
    condition:document.getElementById("settingCondition").value,
    languages:document.getElementById("settingLanguages").value,
    targetStock:Number(document.getElementById("settingTargetStock").value||0),
    saleAllocationStrategy:document.getElementById("settingSaleAllocationStrategy").value,
    safetyPercent:Number(document.getElementById("settingSafetyPercent").value||0),
    quickSellDiscount:Number(document.getElementById("settingQuickSellDiscount").value||0),
    stockAgeWarningDays:Number(document.getElementById("settingStockAgeWarning").value||90),
    stockAgeCriticalDays:Number(document.getElementById("settingStockAgeCritical").value||180),
    priceGroupAFrom:Number(document.getElementById("settingPriceGroupA").value||5),
    priceGroupBFrom:Number(document.getElementById("settingPriceGroupB").value||1),
    priceGroupCFrom:Number(document.getElementById("settingPriceGroupC").value||0.20),
    agingFreshMaxDays:Number(document.getElementById("settingAgingFresh").value||14),
    agingObserveMaxDays:Number(document.getElementById("settingAgingObserve").value||30),
    agingReviewMaxDays:Number(document.getElementById("settingAgingReview").value||45),
    agingCapitalMaxDays:Number(document.getElementById("settingAgingCapital").value||60),
    agingSlowMaxDays:Number(document.getElementById("settingAgingSlow").value||90),
    marketTrendStablePercent:Number(document.getElementById("settingMarketTrendStable").value||3),
    marketTrendDirectionalPercent:Number(document.getElementById("settingMarketTrendDirectional").value||6),
    marketTrendStrongPercent:Number(document.getElementById("settingMarketTrendStrong").value||15),
    marketPriceNearPercent:Number(document.getElementById("settingMarketPriceNear").value||5),
    marketPriceFarPercent:Number(document.getElementById("settingMarketPriceFar").value||20),
    themeMode:document.getElementById("settingThemeMode").value,
    density:document.getElementById("settingDensity").value,
    startView:document.getElementById("settingStartView").value,
    scannerEnabled:document.getElementById("settingScannerEnabled").checked,
    scannerMinConfidence:Number(document.getElementById("settingScannerConfidence").value||80),
    scannerRememberMappings:document.getElementById("settingScannerRemember").checked,
    scannerKeepImages:document.getElementById("settingScannerKeepImages").checked,
    importReviewRequired:document.getElementById("settingImportReview").checked,
    archiveOriginalImports:document.getElementById("settingArchiveImports").checked
    ,collectionClassAFrom:Number(document.getElementById("settingCollectionClassA").value||10)
    ,collectionClassBFrom:Number(document.getElementById("settingCollectionClassB").value||5)
    ,collectionClassCFrom:Number(document.getElementById("settingCollectionClassC").value||1)
    ,collectionClassDFrom:Number(document.getElementById("settingCollectionClassD").value||0.20)
    ,collectionFactorA:Number(document.getElementById("settingCollectionFactorA").value||60)
    ,collectionFactorB:Number(document.getElementById("settingCollectionFactorB").value||47.5)
    ,collectionFactorC:Number(document.getElementById("settingCollectionFactorC").value||32.5)
    ,collectionFactorD:Number(document.getElementById("settingCollectionFactorD").value||15)
    ,collectionBulkPerCard:Number(document.getElementById("settingCollectionBulk").value||0.01)
    ,collectionFirstOfferPercent:Number(document.getElementById("settingCollectionFirstOffer").value||75)
    ,collectionEconomicRelevance:Number(document.getElementById("settingCollectionRelevance").value||3)
    ,collectionMinimumSafetyPercent:Number(document.getElementById("settingCollectionSafety").value||5)
    ,collectionCapitalMediumPercent:Number(document.getElementById("settingCollectionCapitalMedium").value||25)
    ,collectionCapitalHighPercent:Number(document.getElementById("settingCollectionCapitalHigh").value||50)
  };
  state.settings=window.TcgAppConfig?.normalizeSettings?window.TcgAppConfig.normalizeSettings(next):next;
  applyAppearanceSettings();saveState();renderAll();alert("Einstellungen gespeichert.");
};
document.getElementById("resetConfirmation").oninput=event=>{document.getElementById("resetDemoBtn").disabled=event.target.value.trim().toLocaleUpperCase("de-DE")!=="LÖSCHEN";};
document.getElementById("resetDemoBtn").onclick=()=>{
  if(document.getElementById("resetConfirmation").value.trim().toLocaleUpperCase("de-DE")!=="LÖSCHEN")return;
  if(!confirm("Wirklich alle Geschäfts-, Bestands- und Bewegungsdaten löschen? Ein Backup wird vorher heruntergeladen."))return;
  exportBackup();
  const preservedCatalog=state.productCatalog;
  const preservedSettings=state.settings;
  state=structuredClone(defaultState);state.settings=preservedSettings;state.productCatalog=preservedCatalog;state.watchlist=[];
  document.getElementById("resetConfirmation").value="";document.getElementById("resetDemoBtn").disabled=true;
  saveState({allowDestructiveReset:true});renderAll();alert("Geschäftsdaten wurden zurückgesetzt. Das zuvor exportierte Backup kann bei Bedarf wieder geladen werden.");
};
document.getElementById("themeToggleBtn").onclick=toggleTheme;
document.getElementById("openDataFolderBtn").onclick=async()=>{const result=await window.desktopApp?.openDataFolder?.();if(result&&!result.ok)alert(`Datenordner konnte nicht geöffnet werden: ${result.error}`);};

["backupBtn","backupBtn2"].forEach(id=>{const el=document.getElementById(id);if(el)el.onclick=exportBackup;});
["backupInput","backupInput2"].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener("change",async e=>{try{await importBackup(e.target.files[0]);alert("Backup importiert.");}catch(err){alert(err.message);}});});

const universalInput=document.getElementById("universalImportInput");
if(universalInput) universalInput.addEventListener("change",async e=>{await runUniversalImport([...e.target.files]);e.target.value="";});
const universalDrop=document.getElementById("universalDropzone");
if(universalDrop){
  ["dragenter","dragover"].forEach(ev=>universalDrop.addEventListener(ev,e=>{e.preventDefault();universalDrop.classList.add("drag-active");}));
  ["dragleave","drop"].forEach(ev=>universalDrop.addEventListener(ev,e=>{e.preventDefault();universalDrop.classList.remove("drag-active");}));
  universalDrop.addEventListener("drop",async e=>{await runUniversalImport([...e.dataTransfer.files]);});
}
document.getElementById("importPreviewClose").onclick=()=>document.getElementById("importPreviewDialog").close();
document.getElementById("importPreviewCancel").onclick=()=>document.getElementById("importPreviewDialog").close();
document.getElementById("importPreviewConfirm").onclick=()=>confirmImportPreview();
document.getElementById("importPreviewContent").addEventListener("change",event=>{
  const select=event.target.closest("[data-import-type]");if(!select)return;
  const item=pendingImportBatch.find(row=>row.id===select.dataset.importType);if(!item)return;
  item.type=select.value;item.blocked=item.duplicate||item.type==="unknown";renderImportPreviewDialog();
});

const purchaseReceiptDialog=document.getElementById("purchaseReceiptDialog");
const closePurchaseReceipt=()=>{purchaseReceiptDialog.close();};
document.getElementById("purchaseReceiptClose").onclick=closePurchaseReceipt;
document.getElementById("purchaseReceiptCancel").onclick=closePurchaseReceipt;
document.getElementById("purchaseReceiptContent").addEventListener("input",event=>{if(event.target.matches("[data-receipt-value]"))updateReceiptOpenValues();if(event.target.matches("[data-receipt-incremental-shipping],[data-receipt-incremental-direct]"))updateReceiptDecisionCostValue(event.target.closest("[data-receipt-row]"));});
document.getElementById("purchaseReceiptContent").addEventListener("change",event=>{if(event.target.matches("[data-receipt-cart-filler]"))updateReceiptDecisionCostValue(event.target.closest("[data-receipt-row]"));});
document.getElementById("purchaseReceiptContent").addEventListener("click",event=>{
  const suggestion=event.target.closest("[data-accept-target-suggestion]");
  if(suggestion){const row=suggestion.closest("[data-receipt-row]");const field=row?.querySelector("[data-receipt-target]");if(field){field.value=Number(suggestion.dataset.acceptTargetSuggestion||0).toFixed(2);field.focus();}return;}
  const button=event.target.closest("[data-repair-receipt-print]");if(!button)return;
  const purchase=state.purchases.find(row=>row.id===purchaseReceiptDialog.dataset.purchaseId);if(!purchase)return;
  const draft=purchaseReceiptDraft();purchase.costAllocationMethod=draft.method;
  repairPurchaseLineIdentity(purchase.id,Number(button.dataset.repairReceiptPrint),{returnToReceipt:true,receiptDraft:draft});
});
document.getElementById("purchaseCostAllocation").addEventListener("change",event=>{
  const purchase=state.purchases.find(row=>row.id===purchaseReceiptDialog.dataset.purchaseId);if(!purchase)return;
  const draft=purchaseReceiptDraft();purchase.costAllocationMethod=event.target.value;draft.method=event.target.value;renderPurchaseReceipt(purchase);restorePurchaseReceiptDraft(draft);
});
const assignAllOpenReceiptUnits=targetKey=>{
  document.querySelectorAll("#purchaseReceiptContent [data-receipt-row]").forEach(row=>{
    const ordered=Number(row.dataset.ordered||0);
    const inputs=[...row.querySelectorAll("[data-receipt-value]")];
    const assigned=inputs.reduce((sum,input)=>sum+Math.max(0,Math.round(Number(input.value||0))),0);
    const target=inputs.find(input=>input.dataset.receiptValue===targetKey);
    if(target&&ordered>assigned)target.value=Number(target.value||0)+(ordered-assigned);
  });updateReceiptOpenValues();
};
document.getElementById("receiptAllBusiness").onclick=()=>assignAllOpenReceiptUnits("business");
document.getElementById("receiptAllPrivate").onclick=()=>assignAllOpenReceiptUnits("private");
document.getElementById("purchaseReceiptForm").addEventListener("submit",event=>{
  event.preventDefault();
  const purchase=state.purchases.find(row=>row.id===purchaseReceiptDialog.dataset.purchaseId);if(!purchase)return;
  const method=document.getElementById("purchaseCostAllocation").value;
  const plan=TcgBusinessAutomation.planPurchaseReceipt(purchase,readPurchaseReceiptRequest(),method);
  const validation=document.getElementById("purchaseReceiptValidation");
  if(!plan.valid){validation.innerHTML=`<div class="error">${plan.errors.map(escapeHtml).join("<br>")}</div>`;return;}
  const incompleteListed=plan.lines.filter(row=>row.listBusiness&&row.business>0&&!inventoryPrintComplete(row.item));
  if(incompleteListed.length){validation.innerHTML=`<div class="error">${incompleteListed.length} direkt zu inserierende Druckvariante(n) sind noch nicht eindeutig. Bitte zuerst Set, Setnummer und Seltenheit über die Einkaufsposition korrigieren.</div>`;return;}
  const incomplete=plan.lines.filter(row=>(row.addBusiness+row.addPrivate+row.addDamaged)>0&&(!String(row.item.setName||row.item.set||"").trim()||!String(row.item.collectorNumber||"").trim()||!String(row.item.rarity||"").trim()));
  if(incomplete.length&&!confirm(`${incomplete.length} Druckvariante(n) haben noch unvollständige Set- oder Seltenheitsdaten. Trotzdem übernehmen?`))return;
  applyPurchaseReceiptPlan(purchase,plan,document.getElementById("purchaseReceiptNote").value);
  saveState();renderAll();purchaseReceiptDialog.close();openOrderDetails("purchase",purchase.id);
});
document.addEventListener("click",e=>{
  const type=e.target.dataset.template;
  if(type && GENERIC_TEMPLATES[type]) downloadTextFile(`TCG_${type}_Vorlage.csv`,GENERIC_TEMPLATES[type]);
});

document.getElementById("orderDetailContent").addEventListener("click",e=>{
  const dlg=document.getElementById("orderDetailDialog");
  const purchase=state.purchases.find(row=>row.id===dlg.dataset.purchaseId);
  if(e.target.id==="openPurchaseReceiptBtn"&&purchase){dlg.close();openPurchaseReceipt(purchase.id);return;}
  if(e.target.id==="addPurchaseLineBtn"&&purchase){dlg.close();addPurchaseLine(purchase.id);return;}
  if(e.target.id==="scanPurchaseLineBtn"&&purchase){dlg.close();openIphoneScanner("purchase",purchase.id);return;}
  const editLine=e.target.closest("[data-edit-purchase-line]");if(editLine&&purchase){dlg.close();editPurchaseLine(purchase.id,Number(editLine.dataset.editPurchaseLine));return;}
  const deleteLine=e.target.closest("[data-delete-purchase-line]");if(deleteLine&&purchase){deletePurchaseLine(purchase.id,Number(deleteLine.dataset.deletePurchaseLine));return;}
  const sale=state.sales.find(s=>s.id===dlg.dataset.saleId); if(!sale)return;
  if(e.target.id==="openSaleAllocationBtn"){dlg.close();openSaleAllocation(sale.id);return;}
  if(e.target.id==="repairSaleCostBtn"){dlg.close();openHistoricalCostRepair(sale.id);return;}
  if(e.target.id==="addSaleLineBtn"){dlg.close();addSaleLine(sale.id);return;}
  if(e.target.id==="scanSaleLineBtn"){dlg.close();openIphoneScanner("sale",sale.id);return;}
  if(e.target.id==="salePickAllBtn"){
    const boxes=[...document.querySelectorAll("[data-pick-item]")],selectAll=boxes.some(box=>!box.checked);
    boxes.forEach(box=>{box.checked=selectAll;});
    updateSalePickUi(selectAll);
    return;
  }
  if(e.target.id==="addSaleMaterialBtn") {const options=state.materials.map(m=>`<option value="${m.id}">${escapeHtml(m.name)} (${Number(m.stock||0)} verfügbar)</option>`).join("");document.getElementById("saleMaterialUsage").insertAdjacentHTML("beforeend",materialUsageRow({},Date.now(),options));}
  if(e.target.id==="applySaleTemplateBtn") {const id=document.getElementById("saleTemplateSelect").value;if(!id)return;applyTemplateToEditor(id);}
  if(e.target.id==="saveSaleAsTemplateBtn") {const name=document.getElementById("saleTemplateName")?.value?.trim();if(!name){alert("Bitte zuerst einen Namen für die Vorlage eingeben.");document.getElementById("saleTemplateName")?.focus();return;}const items=readSaleMaterialRows();state.materialTemplates.push({id:uid(),name,shippingType:document.getElementById("saleShippingType").value,postage:Number(document.getElementById("salePostage").value||0),items:items.map(i=>({materialId:i.materialId,quantity:i.quantity}))});saveState();renderAll();openOrderDetails("sale",sale.id);alert("Vorlage gespeichert.");}
  if(e.target.id==="saleWorkflowNext") {
    const stage=sale.workflowStage||"Offen";
    if(stage==="Offen") { const previous=sale.status;sale.status="Bezahlt"; reserveSaleInventory(sale); sale.workflowStage="Kommissioniert";recordWorkflowChange(sale,"Vorgangsstatus",previous,"Bezahlt"); addMovement({type:"Status",quantity:0,saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:"Bezahlt → Kommissionieren"}); }
    else if(stage==="Kommissioniert") { const boxes=[...document.querySelectorAll("[data-pick-item]")]; sale.pickedItems=boxes.filter(x=>x.checked).map(x=>Number(x.dataset.pickItem)); if(boxes.some(x=>!x.checked)){alert("Bitte alle Karten abhaken.");return;} const previous=sale.status;sale.status="Kommissioniert"; sale.workflowStage="Verpackt";recordWorkflowChange(sale,"Vorgangsstatus",previous,"Kommissioniert"); addMovement({type:"Kommissionierung",quantity:Number(sale.quantity||boxes.length),saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:"Alle Positionen geprüft"}); }
    saveState();renderAll();openOrderDetails("sale",sale.id);
  }
  if(e.target.id==="saveSaleMaterialsBtn") saveSalePacking(sale,false);
  if(e.target.id==="saveAndShipSaleBtn") saveSalePacking(sale,true);
  if(e.target.id==="createDeliveryNoteBtn") printSaleDocument(sale,"delivery");
  if(e.target.id==="createShippingLabelBtn") printSaleDocument(sale,"label");
  if(e.target.id==="saleCompleteBtn") {const previous=sale.status;sale.status="Abgeschlossen";sale.workflowStage="Abgeschlossen";sale.completedDate=todayISO();recordWorkflowChange(sale,"Vorgangsstatus",previous,"Abgeschlossen","Ankunft vom Kunden bestätigt");addMovement({type:"Abschluss",quantity:0,saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:"Ankunft vom Kunden bestätigt"});saveState();renderAll();document.getElementById("orderDetailDialog").close();}
});
document.getElementById("orderDetailContent").addEventListener("input",e=>{if(e.target.matches("[data-material-id],[data-material-qty],#salePostage"))updateSaleMaterialPreview();});
document.getElementById("orderDetailContent").addEventListener("change",e=>{if(e.target.matches("[data-material-id]"))updateSaleMaterialPreview();if(e.target.matches("[data-pick-item]"))updateSalePickUi(true);});
document.getElementById("orderDetailClose").onclick=()=>document.getElementById("orderDetailDialog").close();

const saleAllocationDialog=document.getElementById("saleAllocationDialog");
document.getElementById("saleAllocationClose").onclick=()=>saleAllocationDialog.close();
document.getElementById("saleAllocationCancel").onclick=()=>saleAllocationDialog.close();
document.getElementById("saleAllocationForm").addEventListener("submit",event=>{event.preventDefault();saveSaleAllocation();});
document.getElementById("orderDetailCloseBottom").onclick=()=>document.getElementById("orderDetailDialog").close();

const bindMonthlyFinanceCard=(id,type)=>{
  const card=document.getElementById(id);if(!card)return;
  card.onclick=()=>openMonthlyFinanceDetails(type);
  card.onkeydown=event=>{
    if(event.key!=="Enter"&&event.key!==" ")return;
    event.preventDefault();openMonthlyFinanceDetails(type);
  };
};
bindMonthlyFinanceCard("monthlyRevenueCard","income");
bindMonthlyFinanceCard("monthlyExpensesCard","expenses");
document.getElementById("monthlyFinanceClose").onclick=()=>document.getElementById("monthlyFinanceDialog").close();
document.getElementById("monthlyFinanceCloseBottom").onclick=()=>document.getElementById("monthlyFinanceDialog").close();
document.getElementById("monthlyFinanceContent").addEventListener("click",event=>{
  const link=event.target.closest("[data-finance-order-id]");if(!link)return;
  document.getElementById("monthlyFinanceDialog").close();
  openOrderDetails(link.dataset.financeOrderType,link.dataset.financeOrderId);
});


const chooseFolderBtn=document.getElementById("chooseSyncFolderBtn");
if(chooseFolderBtn) chooseFolderBtn.onclick=()=>chooseSyncFolder().catch(err=>alert(err.message));
const scanFolderBtn=document.getElementById("scanSyncFolderBtn");
if(scanFolderBtn) scanFolderBtn.onclick=()=>scanSyncFolder(true);
const reviewFolderImportsBtn=document.getElementById("reviewFolderImportsBtn");
if(reviewFolderImportsBtn)reviewFolderImportsBtn.onclick=()=>runUniversalImport(pendingFolderImports.map(item=>item.file),pendingFolderImports.map(item=>({path:item.path,signature:item.signature})));
const folderToggle=document.getElementById("autoFolderSyncToggle");
if(folderToggle) folderToggle.onchange=e=>{state.sync.autoFolder=e.target.checked;saveState();startFolderSyncTimer();updateAutomationUi();};
const priceButton=document.getElementById("updateMarketPricesBtn");
if(priceButton) priceButton.onclick=()=>updateOfficialMarketPrices(true).catch(()=>{});
const priceToggle=document.getElementById("autoPriceToggle");
if(priceToggle) priceToggle.onchange=e=>{state.sync.autoPrices=e.target.checked;saveState();updateAutomationUi();};

document.getElementById("repairWorkflowsBtn").onclick=openDataRepairCenter;
document.getElementById("openDataRepairBtn").onclick=openDataRepairCenter;
document.getElementById("dataRepairClose").onclick=()=>document.getElementById("dataRepairDialog").close();
document.getElementById("dataRepairCloseBottom").onclick=()=>document.getElementById("dataRepairDialog").close();
document.getElementById("dataRepairContent").addEventListener("input",event=>{
  if(event.target.id!=="cardRepairSearch")return;
  cardRepairSearch=event.target.value;
  const position=event.target.selectionStart;
  renderDataRepairCenter();
  requestAnimationFrame(()=>{const input=document.getElementById("cardRepairSearch");input?.focus({preventScroll:true});if(input&&position!==null)input.setSelectionRange(position,position);});
});
document.getElementById("dataRepairContent").addEventListener("change",event=>{
  if(event.target.id==="cardRepairAreaFilter")cardRepairAreaFilter=event.target.value;
  else if(event.target.id==="cardRepairIssueFilter")cardRepairIssueFilter=event.target.value;
  else return;
  renderDataRepairCenter();
});
document.getElementById("dataRepairContent").addEventListener("click",async event=>{
  const cardButton=event.target.closest("[data-card-repair-key]");
  if(cardButton){const row=cardRepairRowsByKey.get(cardButton.dataset.cardRepairKey);if(row){document.getElementById("dataRepairDialog").close();openCardAssignmentRepair(row);}return;}
  const allocationButton=event.target.closest("[data-repair-sale-allocation]");
  if(allocationButton){document.getElementById("dataRepairDialog").close();openSaleAllocation(allocationButton.dataset.repairSaleAllocation);return;}
  const costButton=event.target.closest("[data-repair-sale-cost]");
  if(costButton){document.getElementById("dataRepairDialog").close();openHistoricalCostRepair(costButton.dataset.repairSaleCost);return;}
  if(event.target.closest("#repairAssignmentProposalBtn")){
    const button=event.target.closest("#repairAssignmentProposalBtn");button.disabled=true;button.textContent="Sichere CM-IDs werden gesucht …";
    try{await openSafeCardAssignmentProposals();}
    catch(error){alert(`CM-ID-Vorschläge konnten nicht ermittelt werden: ${error.message}`);renderDataRepairCenter();}
    return;
  }
  if(event.target.closest("#repairMetadataBtn")){
    const button=event.target.closest("#repairMetadataBtn");button.disabled=true;button.textContent="Kartendaten werden geprüft …";
    try{
      const before=dataRepairRecords().assignmentRows.length;
      await window.tcgBackfillBusinessPrintMetadata?.();
      const stillMissingNumbers=dataRepairRecords().assignmentRows.some(row=>row.inspection.issues.some(issue=>issue.code==="missing-number"));
      if(stillMissingNumbers&&window.tcgRefreshBusinessPrintMetadata){
        button.textContent="Aktuelle Kartendaten werden geladen …";
        await window.tcgRefreshBusinessPrintMetadata();
      }
      const changed=Math.max(0,before-dataRepairRecords().assignmentRows.length);
      if(Number(changed||0)>0){addMovement({type:"Datenreparatur",quantity:0,reference:"Kartendatenbank",note:`${Number(changed)} eindeutige Namens- oder Druckdaten ergänzt`});saveState();renderAll();}
      renderDataRepairCenter();
      alert(Number(changed||0)>0?`${Number(changed)} eindeutige Kartendaten wurden ergänzt. Nicht eindeutige Varianten bleiben bewusst zur manuellen Prüfung offen.`:"Auch in den aktuellsten Kartendaten wurden keine weiteren eindeutigen Setnummern gefunden. Die verbleibenden Positionen bleiben sicher unverändert und können später gezielt geprüft werden.");
    }catch(error){alert(`Kartendaten konnten nicht ergänzt werden: ${error.message}`);renderDataRepairCenter();}
  }
});
document.getElementById("refreshBusinessHealthBtn").onclick=()=>{businessHealthDatabaseStatus=null;renderBusinessHealth(true);};
document.getElementById("reportDateFrom").onchange=renderReports;
document.getElementById("reportDateTo").onchange=renderReports;
document.getElementById("reportPeriodReset").onclick=()=>{document.getElementById("reportDateFrom").value="";document.getElementById("reportDateTo").value="";renderReports();};
document.getElementById("exportReportCsv").onclick=exportFinancialReportCsv;
const collectionSelect=document.getElementById("collectionAnalysisSelect");
collectionSelect.onchange=event=>{state.activeCollectionAnalysisId=event.target.value;selectedCollectionProductId="";activeCollectionPhotoId="";activeCollectionObservationId="";renderCollectionPurchases();};
document.getElementById("newCollectionAnalysisBtn").onclick=()=>{createCollectionAnalysis();activeCollectionPhotoId="";activeCollectionObservationId="";saveState();renderAll();document.getElementById("collectionTitle").focus();};
["collectionTitle","collectionSourceType","collectionSellerName","collectionUrl","collectionDate","collectionSellerPrice","collectionShipping","collectionExtra","collectionNotes"].forEach(id=>{
  document.getElementById(id).addEventListener("change",()=>{if(!activeCollectionAnalysis())createCollectionAnalysis();syncCollectionMetadata();calculateCollectionAnalysis();saveState();renderCollectionPurchases();});
});
let collectionSearchTimer;
document.getElementById("collectionCardSearch").addEventListener("input",event=>{clearTimeout(collectionSearchTimer);collectionSearchTimer=setTimeout(()=>searchCollectionCards(event.target.value),180);});
document.getElementById("collectionCardSearch").addEventListener("keydown",event=>{if(event.key==="Enter"&&selectedCollectionProductId){event.preventDefault();addSelectedCollectionCard();}});
document.getElementById("collectionCardSearchResults").addEventListener("click",event=>{const button=event.target.closest("[data-select-collection-product]");if(!button)return;selectedCollectionProductId=button.dataset.selectCollectionProduct;document.querySelectorAll("#collectionCardSearchResults [data-select-collection-product]").forEach(row=>row.classList.toggle("selected",row===button));document.getElementById("addCollectionCardBtn").disabled=false;});
document.getElementById("addCollectionCardBtn").onclick=addSelectedCollectionCard;
document.getElementById("collectionCsvInput").addEventListener("change",async event=>{const file=event.target.files?.[0];if(file)try{await importCollectionCsv(file);}catch(error){alert(`Sammlungs-CSV konnte nicht gelesen werden: ${error.message}`);}event.target.value="";});
document.getElementById("collectionPhotoInput").addEventListener("change",async event=>{const files=[...(event.target.files||[])];event.target.value="";try{await addCollectionPhotos(files);}catch(error){console.error(error);alert(`Sammlungsfoto konnte nicht gespeichert werden: ${error.message}`);}});
document.getElementById("collectionPhotoList").addEventListener("click",event=>{const button=event.target.closest("[data-select-collection-photo]");if(!button)return;activeCollectionPhotoId=button.dataset.selectCollectionPhoto;activeCollectionObservationId="";renderCollectionPhotoEvidence(activeCollectionAnalysis());});
document.getElementById("deleteCollectionPhotoBtn").onclick=()=>deleteActiveCollectionPhoto().catch(error=>{console.error(error);alert(`Foto konnte nicht gelöscht werden: ${error.message}`);});
document.getElementById("detectCollectionCardsBtn").onclick=()=>detectActiveCollectionPhoto();
document.getElementById("recognizeCollectionPhotoNamesBtn").onclick=()=>recognizeActiveCollectionPhotoNames().catch(error=>{console.error(error);alert(`Kartennamen konnten nicht geprüft werden: ${error.message}`);});
document.getElementById("cancelCollectionNameBatchBtn").onclick=()=>{collectionNameRecognitionBatchToken+=1;document.getElementById("collectionNameBatchProgressLabel").textContent="Namensprüfung wird nach der aktuellen Karte beendet …";};
document.getElementById("recognizeCollectionObservationNameBtn").onclick=()=>recognizeActiveCollectionObservationName();
document.getElementById("discardCollectionObservationNameRecognitionBtn").onclick=discardActiveCollectionNameRecognition;
["collectionPhotoSequence","collectionPhotoBinderPage"].forEach(id=>document.getElementById(id).addEventListener("change",()=>{const analysis=activeCollectionAnalysis(),photo=activeCollectionPhoto(analysis);if(!photo)return;photo.sequence=Math.max(1,Math.round(Number(document.getElementById("collectionPhotoSequence").value||1)));photo.binderPage=document.getElementById("collectionPhotoBinderPage").value.trim();saveState();renderCollectionPhotoEvidence(analysis);}));

let collectionPhotoPointerAction=null;
const collectionPhotoStage=document.getElementById("collectionPhotoStage"),collectionPhotoOverlay=document.getElementById("collectionPhotoOverlay");
const collectionPhotoPoint=event=>{const rect=collectionPhotoStage.getBoundingClientRect();return {x:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))};};
collectionPhotoStage.addEventListener("pointerdown",event=>{
  if(!activeCollectionPhoto())return;const point=collectionPhotoPoint(event),boxElement=event.target.closest("[data-observation-box]");
  if(boxElement){const analysis=activeCollectionAnalysis(),observation=analysis.photoObservations.find(row=>row.id===boxElement.dataset.observationBox);if(!observation)return;activeCollectionObservationId=observation.id;collectionPhotoPointerAction={type:"move",start:point,original:{...observation.boundingBox},observation};renderCollectionPhotoEvidence(analysis);event.preventDefault();return;}
  collectionPhotoPointerAction={type:"draw",start:point,current:point};const draft=document.createElement("div");draft.className="collection-photo-draft";draft.id="collectionPhotoDraft";collectionPhotoOverlay.appendChild(draft);event.preventDefault();
});
window.addEventListener("pointermove",event=>{
  const action=collectionPhotoPointerAction;if(!action)return;const point=collectionPhotoPoint(event);
  if(action.type==="draw"){action.current=point;const x=Math.min(action.start.x,point.x),y=Math.min(action.start.y,point.y),width=Math.abs(point.x-action.start.x),height=Math.abs(point.y-action.start.y),draft=document.getElementById("collectionPhotoDraft");if(draft)draft.style.cssText=`left:${x*100}%;top:${y*100}%;width:${width*100}%;height:${height*100}%`;}
  else{const dx=point.x-action.start.x,dy=point.y-action.start.y;action.observation.boundingBox={...action.original,x:Math.max(0,Math.min(1-action.original.width,action.original.x+dx)),y:Math.max(0,Math.min(1-action.original.height,action.original.y+dy))};const element=document.querySelector(`[data-observation-box="${CSS.escape(action.observation.id)}"]`);if(element){element.style.left=`${action.observation.boundingBox.x*100}%`;element.style.top=`${action.observation.boundingBox.y*100}%`;}}
});
window.addEventListener("pointerup",()=>{
  const action=collectionPhotoPointerAction;if(!action)return;collectionPhotoPointerAction=null;document.getElementById("collectionPhotoDraft")?.remove();
  if(action.type==="draw"){const x=Math.min(action.start.x,action.current.x),y=Math.min(action.start.y,action.current.y),width=Math.abs(action.current.x-action.start.x),height=Math.abs(action.current.y-action.start.y);if(width>=.01&&height>=.01)createCollectionObservation({x,y,width,height});}
  else{action.observation.boundingBox=window.TcgCollectionPhotoModel.normalizeBoundingBox(action.observation.boundingBox);action.observation.updatedAt=new Date().toISOString();saveState();renderCollectionPhotoEvidence(activeCollectionAnalysis());}
});

["collectionBBoxX","collectionBBoxY","collectionBBoxWidth","collectionBBoxHeight","collectionObservationRow","collectionObservationColumn","collectionObservationNameConfidence","collectionObservationPrintConfidence","collectionObservationReviewStatus","collectionObservationSignals","collectionObservationEconomicRelevant","collectionObservationDetailRequired"].forEach(id=>document.getElementById(id).addEventListener("change",updateActiveObservationFromFields));
document.getElementById("confirmCollectionDetectionBtn").onclick=()=>{const analysis=activeCollectionAnalysis(),observation=activeCollectionObservation(analysis);if(!analysis||!observation||observation.observationSource!=="automatic")return;observation.detectionReviewState="confirmed";observation.updatedAt=new Date().toISOString();saveState();renderCollectionPhotoEvidence(analysis);};
document.getElementById("rejectCollectionDetectionBtn").onclick=()=>{const analysis=activeCollectionAnalysis(),observation=activeCollectionObservation(analysis);if(!analysis||!observation||observation.observationSource!=="automatic")return;observation.detectionReviewState="rejected";observation.updatedAt=new Date().toISOString();activeCollectionObservationId="";saveState();renderCollectionPhotoEvidence(analysis);};
document.getElementById("deleteCollectionObservationBtn").onclick=()=>{const analysis=activeCollectionAnalysis(),observation=activeCollectionObservation(analysis);if(!analysis||!observation)return;if(observation.observationSource==="automatic"){observation.detectionReviewState="rejected";observation.updatedAt=new Date().toISOString();}else analysis.photoObservations=analysis.photoObservations.filter(row=>row.id!==observation.id);activeCollectionObservationId="";saveState();renderCollectionPhotoEvidence(analysis);};
let collectionObservationNameTimer,collectionObservationPrintTimer;
document.getElementById("collectionObservationNameSearch").addEventListener("input",event=>{clearTimeout(collectionObservationNameTimer);collectionObservationNameTimer=setTimeout(()=>searchCollectionObservationCandidates(event.target.value,"name"),180);});
document.getElementById("collectionObservationPrintSearch").addEventListener("input",event=>{clearTimeout(collectionObservationPrintTimer);collectionObservationPrintTimer=setTimeout(()=>searchCollectionObservationCandidates(event.target.value,"print"),180);});
document.getElementById("collectionPhotoWorkspace").addEventListener("click",event=>{
  const analysis=activeCollectionAnalysis(),observation=activeCollectionObservation(analysis);if(!analysis||!observation)return;
  const addName=event.target.closest("[data-add-observation-name]");if(addName){const product=collectionObservationNameSearchProducts.get(addName.dataset.addObservationName);if(!product)return;const names=cardDisplayNames(product),candidate={id:uid(),name:names.primary,germanName:product.germanName||names.primary,englishName:product.englishName||"",metacardId:product.metacardId||"",source:"catalog_search",confidence:"unknown"};if(!observation.nameCandidates.some(row=>normalizeCardName(row.name)===normalizeCardName(candidate.name)))observation.nameCandidates.push(candidate);observation.selectedName=candidate.name;document.getElementById("collectionObservationNameSearch").value="";document.getElementById("collectionObservationNameResults").innerHTML="";saveState();renderCollectionPhotoEvidence(analysis);return;}
  const selectName=event.target.closest("[data-select-observation-name]");if(selectName){const candidate=observation.nameCandidates.find(row=>row.id===selectName.dataset.selectObservationName);if(candidate){observation.selectedName=candidate.name;observation.nameConfidence="confirmed";candidate.confidence="confirmed";const physical=analysis.physicalCards.find(row=>row.id===observation.physicalCardId);if(physical){physical.name=candidate.name;physical.updatedAt=new Date().toISOString();}observation.updatedAt=new Date().toISOString();}saveState();renderCollectionPhotoEvidence(analysis);return;}
  const removeName=event.target.closest("[data-remove-observation-name]");if(removeName){const candidate=observation.nameCandidates.find(row=>row.id===removeName.dataset.removeObservationName);observation.nameCandidates=observation.nameCandidates.filter(row=>row.id!==removeName.dataset.removeObservationName);if(candidate&&observation.selectedName===candidate.name){observation.selectedName="";observation.nameConfidence="unknown";}saveState();renderCollectionPhotoEvidence(analysis);return;}
  const addPrint=event.target.closest("[data-add-observation-print]");if(addPrint){const product=collectionObservationPrintSearchProducts.get(addPrint.dataset.addObservationPrint);if(!product)return;const candidate={id:uid(),productId:cleanProductId(product.productId),name:cardDisplayNames(product).primary,germanName:product.germanName||"",englishName:product.englishName||"",setName:product.setName||product.set||"",collectorNumber:product.collectorNumber||product.setCode||"",rarity:product.rarity||product.variant||"",source:"manual_search",signals:[]};if(!observation.printCandidates.some(row=>row.productId===candidate.productId))observation.printCandidates.push(candidate);document.getElementById("collectionObservationPrintSearch").value="";document.getElementById("collectionObservationPrintResults").innerHTML="";saveState();renderCollectionPhotoEvidence(analysis);return;}
  const confirmPrint=event.target.closest("[data-confirm-observation-print]");if(confirmPrint){const candidate=observation.printCandidates.find(row=>row.id===confirmPrint.dataset.confirmObservationPrint);if(!candidate)return;observation.selectedProductId=candidate.productId;observation.printConfidence="confirmed";if(!observation.selectedName){observation.selectedName=candidate.name;if(candidate.name&&!observation.nameCandidates.some(row=>normalizeCardName(row.name)===normalizeCardName(candidate.name)))observation.nameCandidates.push({id:uid(),name:candidate.name,germanName:candidate.germanName||"",englishName:candidate.englishName||"",source:"confirmed_print",confidence:"unknown"});}const physical=analysis.physicalCards.find(row=>row.id===observation.physicalCardId);if(physical){physical.productId=candidate.productId;physical.name=observation.selectedName||candidate.name;physical.updatedAt=new Date().toISOString();}saveState();renderCollectionPhotoEvidence(analysis);return;}
  const removePrint=event.target.closest("[data-remove-observation-print]");if(removePrint){const candidate=observation.printCandidates.find(row=>row.id===removePrint.dataset.removeObservationPrint);observation.printCandidates=observation.printCandidates.filter(row=>row.id!==removePrint.dataset.removeObservationPrint);if(candidate&&observation.selectedProductId===candidate.productId){observation.selectedProductId="";observation.printConfidence="unknown";}saveState();renderCollectionPhotoEvidence(analysis);}
});
document.getElementById("createPhysicalCardBtn").onclick=()=>{const analysis=activeCollectionAnalysis(),observation=activeCollectionObservation(analysis);if(!analysis||!observation)return;const card={id:uid(),analysisId:analysis.id,label:observation.selectedName||`Physische Karte ${analysis.physicalCards.length+1}`,linkedCollectionItemId:"",productId:observation.selectedProductId||"",name:observation.selectedName||"",reviewStatus:"unreviewed",createdAt:new Date().toISOString()};analysis.physicalCards.push(card);observation.physicalCardId=card.id;saveState();renderCollectionPhotoEvidence(analysis);};
document.getElementById("unlinkPhysicalCardBtn").onclick=()=>{const analysis=activeCollectionAnalysis(),observation=activeCollectionObservation(analysis);if(!observation)return;observation.physicalCardId="";observation.linkedCollectionItemId="";saveState();renderCollectionPhotoEvidence(analysis);};
document.getElementById("collectionObservationPhysicalCard").onchange=event=>{const analysis=activeCollectionAnalysis(),observation=activeCollectionObservation(analysis);if(!observation)return;observation.physicalCardId=event.target.value;const physical=analysis.physicalCards.find(row=>row.id===observation.physicalCardId);observation.linkedCollectionItemId=physical?.linkedCollectionItemId||"";saveState();renderCollectionPhotoEvidence(analysis);};
document.getElementById("collectionPhysicalCardItem").onchange=event=>{const analysis=activeCollectionAnalysis(),observation=activeCollectionObservation(analysis),physical=analysis?.physicalCards?.find(row=>row.id===observation?.physicalCardId);if(!physical)return;physical.linkedCollectionItemId=event.target.value;const item=analysis.items.find(row=>row.id===event.target.value);if(item){physical.productId=cleanProductId(item.productId);physical.name=item.name||physical.name;const calculated=calculateCollectionAnalysis(analysis)?.items?.find(row=>row.id===item.id);if(calculated)observation.economicRelevant=Boolean(calculated.economicRelevant);}observation.linkedCollectionItemId=event.target.value;saveState();renderCollectionPhotoEvidence(analysis);};
document.getElementById("collectionItemTable").addEventListener("change",event=>{const id=event.target.dataset.collectionQuantity||event.target.dataset.collectionCondition||event.target.dataset.collectionLanguage||event.target.dataset.collectionConfidence;if(!id)return;const analysis=activeCollectionAnalysis(),item=analysis?.items?.find(row=>row.id===id);if(!item)return;if(event.target.dataset.collectionQuantity)item.quantity=Math.max(1,Math.round(Number(event.target.value||1)));if(event.target.dataset.collectionCondition)item.condition=event.target.value;if(event.target.dataset.collectionLanguage)item.language=event.target.value;if(event.target.dataset.collectionConfidence)item.printConfidence=event.target.value;calculateCollectionAnalysis(analysis);saveState();renderCollectionPurchases();});
document.getElementById("collectionItemTable").addEventListener("click",event=>{const id=event.target.closest("[data-remove-collection-item]")?.dataset.removeCollectionItem;if(!id)return;const analysis=activeCollectionAnalysis();if(!analysis)return;analysis.items=analysis.items.filter(row=>row.id!==id);(analysis.physicalCards||[]).forEach(card=>{if(card.linkedCollectionItemId===id)card.linkedCollectionItemId="";});(analysis.photoObservations||[]).forEach(row=>{if(row.linkedCollectionItemId===id)row.linkedCollectionItemId="";});calculateCollectionAnalysis(analysis);saveState();renderAll();});
["collectionItemFilter","collectionClassFilter","collectionConfidenceFilter","collectionSort"].forEach(id=>document.getElementById(id).addEventListener(id==="collectionItemFilter"?"input":"change",renderCollectionPurchases));
document.getElementById("saveCollectionSnapshotBtn").onclick=()=>{if(!activeCollectionAnalysis()){alert("Bitte zuerst eine Analyse anlegen.");return;}saveCollectionDecisionSnapshot();saveState();renderAll();alert("Entscheidungssnapshot gespeichert. Spätere Marktpreise verändern diese historische Begründung nicht.");};
document.getElementById("confirmCollectionPurchaseBtn").onclick=confirmCollectionPurchase;
const globalSearch=document.getElementById("globalSearch"),globalSearchResults=document.getElementById("globalSearchResults");
globalSearch.oninput=event=>renderGlobalSearch(event.target.value);
globalSearch.onkeydown=event=>{if(event.key==="Escape"){globalSearch.value="";renderGlobalSearch("");globalSearch.blur();}else if(event.key==="Enter"&&globalSearchActions[0]){event.preventDefault();globalSearchActions[0]();globalSearch.value="";renderGlobalSearch("");}};
globalSearchResults.onclick=event=>{const button=event.target.closest("[data-global-result]");if(!button)return;globalSearchActions[Number(button.dataset.globalResult)]?.();globalSearch.value="";renderGlobalSearch("");};
document.addEventListener("click",event=>{if(!event.target.closest(".global-search-wrap"))globalSearchResults.hidden=true;});
document.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();globalSearch.focus();globalSearch.select();}});
document.addEventListener("change",event=>{
  if(!event.target.matches('#modalFields [name="language"]'))return;
  const reminder=document.querySelector("#inventorySelectedCard .variant-language-reminder");
  const productId=document.querySelector('#modalFields [name="productId"]')?.value||"";
  if(reminder)reminder.textContent=`CM ${productId||"–"} bestimmt die Druckvariante, nicht die Kartensprache. Sprache dieses Exemplars: ${event.target.value||"nicht gewählt"}.`;
});
document.addEventListener("click",event=>{
  const workflowTask=event.target.closest("[data-dashboard-task-kind]");
  if(workflowTask){
    openOrderDetails(workflowTask.dataset.dashboardTaskKind,workflowTask.dataset.dashboardTaskId);
    return;
  }
  const phase3Filter=event.target.closest("[data-phase3-filter]");
  if(phase3Filter){
    const filter=phase3Filter.dataset.phase3Filter;
    showView("slowmovers");
    ["slowMoverTrend","slowMoverRecommendation","slowMoverProfitTarget"].forEach(id=>{const field=document.getElementById(id);if(field)field.value="";});
    if(filter==="falling")document.getElementById("slowMoverTrend").value="falling";
    if(filter==="rising")document.getElementById("slowMoverTrend").value="rising";
    if(filter==="price-review")document.getElementById("slowMoverRecommendation").value="review";
    if(filter==="target")document.getElementById("slowMoverProfitTarget").value="risk";
    renderAll();
    return;
  }
  const repair=event.target.closest("[data-repair-action]");
  if(repair){
    const action=repair.dataset.repairAction,recordId=repair.dataset.recordId;
    if(action==="repairSaleCost"&&recordId)openHistoricalCostRepair(recordId);else openDataRepairCenter();
    return;
  }
  const reportButton=event.target.closest("[data-performance-report]");
  if(reportButton){activePerformanceReport=reportButton.dataset.performanceReport;renderAdvancedPerformanceReport();return;}
  const jump=event.target.closest("[data-view-jump]");
  if(jump&&!jump.matches(".nav-item")){
    const view=jump.dataset.viewJump,query=String(jump.dataset.filterQuery||"").trim();
    showView(view);
    if(view==="inventory"&&jump.dataset.filterQuality&&document.getElementById("inventoryQualityFilter")){document.getElementById("inventoryQualityFilter").value=jump.dataset.filterQuality;renderAll();}
    const searchId={inventory:"inventorySearch",private:"privateSearch",purchases:"purchaseSearch",sales:"salesSearch",watchlist:"watchSearch",materials:"materialSearch",expenses:"expenseSearch"}[view];
    if(query&&searchId&&document.getElementById(searchId)){
      document.getElementById(searchId).value=query;
      renderAll();
      requestAnimationFrame(()=>document.getElementById(searchId)?.focus());
    }
  }
});

const purchaseImportDateField = document.getElementById("purchaseImportDate");
if (purchaseImportDateField && !purchaseImportDateField.value) purchaseImportDateField.value = todayISO();

window.desktopApp?.onScannerSubmission?.(submission=>queueScannerSubmission(submission));

applyAppearanceSettings();
initializeUiDisclosures();
installTextFieldErgonomics();
systemThemeQuery?.addEventListener?.("change",()=>{if((state.settings.themeMode||"system")==="system")applyAppearanceSettings();});
showView(state.settings.startView||"dashboard");
initAutomation();
refreshCardNameLookup(true).then(() => renderAll()).catch(error => {
  console.error("Zweisprachiger SQLite-Namensindex konnte beim Start nicht geladen werden:", error);
});
refreshMarketDecisionHistory(true);
refreshOwnSalesExperience(true);

// Beim ersten Start der Desktop-Version wird der vorhandene Browserstand
// automatisch in die dauerhafte SQLite-Datei übernommen.
if (window.desktopApp?.saveState) {
  window.desktopApp.saveState(state).then(result => {
    if (result?.updatedAt) localStorage.setItem(DESKTOP_UPDATED_KEY, result.updatedAt);
    const el = document.getElementById("saveStatus");
    if (el) el.textContent = "SQLite bereit";
  }).catch(error => {
    console.error("Erster SQLite-Abgleich fehlgeschlagen:", error);
    const el = document.getElementById("saveStatus");
    if (el) el.textContent = "Lokal bereit · SQLite-Fehler";
  });
}

// Kaufanalyse: Katalogtreffer direkt auf die Watchlist setzen.
document.addEventListener("click",e=>{const id=e.target.closest("[data-analysis-add-watch]")?.dataset.analysisAddWatch;if(!id)return;const p=resolveProduct(id);if(state.watchlist.some(w=>!w.archived&&cleanProductId(w.productId)===id)){alert("Diese Karte ist bereits auf der Watchlist.");return;}state.watchlist.push({id:uid(),priority:"B",productId:id,name:p.name,set:p.set,version:p.rarity,stock:0,target:Number(state.settings.targetStock||0),maxBuy:0,targetSell:0,currentBuy:p.low||"",trend:p.trend||"",avg30:p.avg30||"",reprint:"",banlist:"",priceDate:p.priceDate||""});saveState();renderAll();});
