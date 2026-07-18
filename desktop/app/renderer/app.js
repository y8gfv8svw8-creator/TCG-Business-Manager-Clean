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

const defaultState = {
  settings: {
    feePercent: 5,
    packaging: 0.12,
    minProfit: 0.75,
    minRoi: 20,
    priceAgeDays: 7,
    condition: "NM",
    languages: "DE/EN",
    targetStock: 3,
    safetyPercent: 5
  },
  inventory: [],
  purchases: [],
  sales: [],
  watchlist: [
    {id: (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`), priority:"A", name:"Aschenblüte & Freudiger Frühling", set:"RA01", version:"V.3 – Secret Rare", stock:0, target:3, maxBuy:4.00, targetSell:5.99, ...WATCHLIST_REFERENCE["Aschenblüte & Freudiger Frühling"], reprint:"Mittel", banlist:"Niedrig", priceDate:"2026-07-16"},
    {id: (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`), priority:"A", name:"Unendliche Unbeständigkeit", set:"RA01", version:"V.3 – Secret Rare", stock:0, target:3, maxBuy:4.00, targetSell:5.49, ...WATCHLIST_REFERENCE["Unendliche Unbeständigkeit"], reprint:"Mittel", banlist:"Niedrig", priceDate:"2026-07-16"},
    {id: (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`), priority:"A", name:"Nibiru, das Urwesen", set:"RA01", version:"V.3 – Secret Rare", stock:0, target:3, maxBuy:2.00, targetSell:3.49, ...WATCHLIST_REFERENCE["Nibiru, das Urwesen"], reprint:"Mittel", banlist:"Niedrig", priceDate:"2026-07-16"},
    {id: (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`), priority:"A", name:"Effektverschleierin", set:"RA01", version:"V.3 – Secret Rare", stock:0, target:3, maxBuy:2.75, targetSell:4.29, ...WATCHLIST_REFERENCE["Effektverschleierin"], reprint:"Mittel", banlist:"Niedrig", priceDate:"2026-07-16"},
    {id: (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`), priority:"B", name:"Ausgeglichener Zweikampf", set:"RA01", version:"V.3 – Secret Rare", stock:0, target:3, maxBuy:2.25, targetSell:3.49, ...WATCHLIST_REFERENCE["Ausgeglichener Zweikampf"], reprint:"Mittel", banlist:"Niedrig", priceDate:"2026-07-16"}
  ],
  sellers: [],
  customers: [],
  imports: [],
  expenses: [],
  materials: [],
  materialTemplates: [],
  movements: [],
  sync: {autoFolder:true, autoPrices:true, lastPriceUpdate:"", processedFiles:{}},
  partnerExclusions: {sellers: [], customers: []},
  productCatalog: structuredClone(BUILTIN_PRODUCT_CATALOG)
};

let state = loadState();
let modalHandler = null;

const views = {
  dashboard: ["Dashboard", "Zentrale Übersicht über Bestand, Käufe, Verkäufe und Gewinn."],
  inventory: ["Bestand", "Jede physische Karte wird einzeln geführt."],
  purchases: ["Einkäufe", "Bestellungen, Lieferstatus, Versand und Einstand."],
  sales: ["Verkäufe", "Verkaufsbestellungen, Gebühren und tatsächlicher Gewinn."],
  materials: ["Versandmaterial", "Materialbestand, Stückkosten, Mindestbestände und eigene Versandvorlagen."],
  expenses: ["Ausgaben", "Sonstige Betriebsausgaben und Materialeinkäufe nachvollziehbar erfassen."],
  watchlist: ["Marktbeobachtung", "Kaufgrenzen, Zielpreise und Ampelentscheidungen."],
  partners: ["Händler & Kunden", "Kontakte, Bewertungen, Bestellungen und Umsatz."],
  imports: ["Importe", "Cardmarket-Einkäufe, Verkäufe, Marktpreise und Backups."],
  reports: ["Auswertungen", "Gewinn, ROI, Lagerdauer und Leistung nach Monat."],
  settings: ["Einstellungen", "Gebühren, Grenzwerte und Standardwerte."]
};

function cleanProductId(value) {
  const match = String(value ?? "").match(/\d+/);
  return match ? match[0] : "";
}

function mergeCatalog(base={}, extra={}) {
  return {...base, ...extra};
}

function resolveProduct(productId, fallback={}) {
  const id = cleanProductId(productId);
  const c = state?.productCatalog?.[id] || BUILTIN_PRODUCT_CATALOG[id] || {};
  return {
    productId: id,
    name: c.name || fallback.name || (id ? `Unbekannte Karte (CM ${id})` : "Unbekannte Karte"),
    set: c.set || fallback.set || "",
    setName: c.setName || fallback.setName || "",
    rarity: c.rarity || fallback.rarity || "",
    language: c.language || fallback.language || state?.settings?.languages || "DE/EN",
    condition: c.condition || fallback.condition || state?.settings?.condition || "NM",
    collectorNumber: c.collectorNumber || fallback.collectorNumber || "",
    productUrl: c.productUrl || fallback.productUrl || ""
  };
}

function inventoryVariantKey(item={}) {
  const language = mapLanguage(item.language || "").trim().toUpperCase();
  const condition = mapCondition(item.condition || "").trim().toUpperCase();
  return [cleanProductId(item.productId), language, condition].join("|");
}

function pendingOpenPurchaseQuantities(purchases=[]) {
  const pending = new Map();
  purchases
    .filter(p => p && !["Eingetroffen", "Storniert"].includes(p.status))
    .forEach(p => (Array.isArray(p.pendingItems) ? p.pendingItems : []).forEach(item => {
      const key = inventoryVariantKey(item);
      if (!cleanProductId(item.productId)) return;
      pending.set(key, (pending.get(key) || 0) + Math.max(0, Number(item.quantity || 0)));
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
  const revenue = orders.reduce((sum,s)=>sum+Number(s.revenue||0),0);
  const profit = orders.reduce((sum,s)=>sum+calculateSaleProfit(s).profit,0);
  const dates = orders.map(s=>s.date).filter(Boolean).sort();
  return {orders,cards,revenue,profit,avgOrder:orders.length?revenue/orders.length:0,first:dates[0]||"",last:dates.at(-1)||""};
}

function migrateState(data) {
  const migrated = {...structuredClone(defaultState), ...data};
  migrated.settings = {...defaultState.settings, ...(data.settings||{})};
  migrated.inventory = Array.isArray(data.inventory) ? data.inventory : [];
  migrated.purchases = Array.isArray(data.purchases) ? data.purchases : [];
  migrated.sales = Array.isArray(data.sales) ? data.sales : [];
  migrated.watchlist = Array.isArray(data.watchlist) ? data.watchlist : structuredClone(defaultState.watchlist);
  migrated.expenses = Array.isArray(data.expenses) ? data.expenses : [];
  migrated.materials = Array.isArray(data.materials) ? data.materials : [];
  migrated.materialTemplates = Array.isArray(data.materialTemplates) ? data.materialTemplates : [];
  migrated.movements = Array.isArray(data.movements) ? data.movements : [];
  migrated.sellers = (Array.isArray(data.sellers) ? data.sellers : []).map(s=>normalizePartnerRecord(s,"seller"));
  migrated.customers = (Array.isArray(data.customers) ? data.customers : []).map(c=>normalizePartnerRecord(c,"customer"));
  migrated.imports = Array.isArray(data.imports) ? data.imports : [];
  migrated.sync = {...defaultState.sync, ...(data.sync||{})};
  migrated.sync.processedFiles = {...((data.sync||{}).processedFiles||{})};
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
    i.cost = Number(i.cost||0);
    i.listingPrice = Number(i.listingPrice||0);
    if (i.listed === undefined) i.listed = i.listingPrice > 0;
    if (i.status === "Verkauft" && !i.saleId && !i.saleOrderNo && /^IMPORT-/.test(i.lotId||"")) {
      i.status = "Im Bestand";
      delete i.saleDate;
    }
  });

  // Karten aus noch nicht eingetroffenen Einkäufen dürfen nicht im Bestand stehen.
  // Ältere Backups werden dabei automatisch in offene Wareneingangspositionen umgewandelt.
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
    if (purchase.status === "Eingetroffen") return true;
    return i.status === "Verkauft"; // Bereits verkaufte Historie niemals automatisch entfernen.
  });
  // Auch Karten aus einem Cardmarket-Bestandsimport dürfen offene Bestellungen
  // nicht vorzeitig materialisieren. Entsprechende Mengen werden automatisch entfernt.
  migrated.inventory = removeStockCopiesCoveredByOpenPurchases(migrated.inventory, migrated.purchases);

  migrated.purchases.forEach(p=>{
    p.inventoryCreated = migrated.inventory.some(i=>i.purchaseId===p.id);
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

function saveState() {
  const savedAt = new Date().toISOString();
  const serialized = JSON.stringify(state);
  localStorage.setItem(DB_KEY, serialized);
  localStorage.setItem(DESKTOP_UPDATED_KEY, savedAt);

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
  window.desktopApp.saveState(state).then(result => {
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
const todayISO = () => new Date().toISOString().slice(0,10);
const daysBetween = (a,b=new Date()) => a ? Math.max(0, Math.floor((new Date(b)-new Date(a))/86400000)) : 0;
const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `tcg-${Date.now()}-${Math.random().toString(16).slice(2)}`);

function statusBadge(status) {
  const s = String(status||"");
  let c = "blue";
  if (["TOP DEAL","KAUFEN","Verkauft","Abgeschlossen","Eingetroffen"].includes(s)) c="green";
  if (["BEOBACHTEN","Im Bestand","Offen","Unterwegs","Bestellt"].includes(s)) c="yellow";
  if (["STOP","Storniert","Beschädigt","Verlustverkauf"].includes(s)) c="red";
  if (["Reserviert","Bezahlt","Versendet"].includes(s)) c="purple";
  return `<span class="badge ${c}">${escapeHtml(s||"-")}</span>`;
}

function escapeHtml(v) {
  return String(v??"").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}


function normalizeSearchTerm(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("de-DE")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function catalogCardData(item={}) {
  const productId = cleanProductId(item.productId);
  return productId ? (state.productCatalog?.[productId] || BUILTIN_PRODUCT_CATALOG[productId] || {}) : {};
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
  const normalizedQuery = normalizeSearchTerm(query);
  if (!normalizedQuery) return true;
  const haystack = normalizeSearchTerm(cardRecordSearchValues(record).join(" "));
  return normalizedQuery.split(/\s+/).every(term => haystack.includes(term));
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
  const gross = Number(sale.revenue||0);
  const feeBase = Number(sale.cardValue||gross);
  const fee = sale.fee !== undefined && sale.fee !== "" ? Number(sale.fee) : feeBase * state.settings.feePercent/100;
  const packaging = saleMaterialCost(sale);
  const postage = Number(sale.postage||0);
  const cost = Number(sale.cost||0);
  return {fee, packaging, postage, profit:gross-fee-packaging-postage-cost};
}

function calculateWatch(w) {
  const buy = Number(w.currentBuy||0);
  const sell = Number(w.targetSell||0);
  const fee = sell * state.settings.feePercent/100;
  const net = sell - fee - state.settings.packaging;
  const profit = buy ? net-buy : 0;
  const roi = buy ? profit/buy*100 : 0;
  let status = "BEOBACHTEN";
  if (w.reprint==="Hoch" || w.banlist==="Hoch") status="STOP";
  else if (w.stock >= w.target && w.target>0) status="STOP";
  else if (buy && buy <= Number(w.maxBuy||0) && profit >= state.settings.minProfit && roi >= state.settings.minRoi) {
    status = buy <= Number(w.maxBuy||0)*0.8 ? "TOP DEAL" : "KAUFEN";
  }
  return {profit,roi,status};
}

function showView(name) {
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById(`view-${name}`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active", b.dataset.view===name));
  document.getElementById("pageTitle").textContent = views[name][0];
  document.getElementById("pageSubtitle").textContent = views[name][1];
  renderAll();
}

function renderAll() {
  syncWatchStock();
  renderDashboard();
  renderInventory();
  renderPurchases();
  renderSales();
  renderMaterials();
  renderExpenses();
  renderWatchlist();
  renderPartners();
  renderImports();
  renderReports();
  renderSettings();
}

function syncWatchStock() {
  state.watchlist.forEach(w=>{
    w.stock = state.inventory.filter(i => i.status!=="Verkauft" && ((w.productId && i.productId===w.productId) || (!w.productId && i.name===w.name))).length;
  });
}

function completedOrPaidSale(s){ return ["Bezahlt","Versendet","Abgeschlossen"].includes(s.status); }
function monthlyBusinessFigures(year,month){
  const sales=state.sales.filter(s=>isSameMonth(s.date,year,month) && completedOrPaidSale(s));
  const purchases=state.purchases.filter(p=>isSameMonth(p.date,year,month) && p.status!=="Storniert");
  const income=sales.reduce((a,s)=>a+Number(s.revenue||0),0);
  const cardPurchases=purchases.reduce((a,p)=>a+Number(p.cardValue||0)+Number(p.shipping||0)+Number(p.extra||0),0);
  const saleCosts=sales.reduce((a,s)=>{const c=calculateSaleProfit(s);return a+c.fee+c.postage+c.packaging;},0);
  const other=(state.expenses||[]).filter(e=>isSameMonth(e.date,year,month)&&e.status!=="Storniert").reduce((a,e)=>a+Number(e.amount||0),0);
  const expenses=cardPurchases+saleCosts+other;
  return {sales,purchases,income,cardPurchases,saleCosts,other,expenses,profit:income-expenses};
}
function renderDashboard() {
  const activeInv = state.inventory.filter(i=>["Im Bestand","Inseriert"].includes(i.status) || (i.status==="Im Bestand" && i.listed));
  const now = new Date();
  const month = now.getMonth(), year = now.getFullYear();
  const figures=monthlyBusinessFigures(year,month);
  const inventoryListingValue = activeInv.reduce((a,i)=>a+(i.listed ? Number(i.listingPrice||0) : 0),0);
  const investedCapital = activeInv.reduce((a,i)=>a+Number(i.cost||0),0);
  const openPurchases = state.purchases.filter(p=>!["Eingetroffen","Storniert"].includes(p.status)).length;
  const opp = state.watchlist.filter(w=>!w.archived && ["TOP DEAL","KAUFEN"].includes(calculateWatch(w).status)).length;

  document.getElementById("mInventoryCount").textContent = activeInv.length;
  document.getElementById("mInventoryValue").textContent = money(inventoryListingValue);
  document.getElementById("mInvestedCapital").textContent = money(investedCapital);
  document.getElementById("mMonthlyRevenue").textContent = money(figures.income);
  document.getElementById("mMonthlyExpenses").textContent = money(figures.expenses);
  document.getElementById("mMonthlyProfit").textContent = money(figures.profit);
  document.getElementById("mMonthlyProfit").className = figures.profit >= 0 ? "money-positive" : "money-negative";
  document.getElementById("mOpenPurchases").textContent = openPurchases;
  document.getElementById("mBuyOpportunities").textContent = opp;

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
    ...state.sales.filter(s=>!["Abgeschlossen","Storniert"].includes(s.status)).map(s=>({title:`Verkauf ${s.orderNo}`, sub:`${s.customer||"Unbekannt"} · ${money(s.revenue)}`, status:s.status}))
  ].slice(0,6);
  document.getElementById("openOperations").innerHTML = openOps.length ? `<div class="list">${openOps.map(x=>`<div class="list-row"><div><strong>${escapeHtml(x.title)}</strong><br><small>${escapeHtml(x.sub)}</small></div>${statusBadge(x.status)}</div>`).join("")}</div>` : `<div class="empty">Keine offenen Vorgänge</div>`;

  const deals = state.watchlist.filter(w=>!w.archived).map(w=>({...w,...calculateWatch(w)})).filter(w=>["TOP DEAL","KAUFEN"].includes(w.status)).sort((a,b)=>b.roi-a.roi).slice(0,6);
  document.getElementById("topDeals").innerHTML = deals.length ? `<div class="list">${deals.map(w=>{
    const url = cardmarketUrl(w);
    return `<div class="list-row"><div><a class="card-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(w.name)}</strong><span class="external-link">↗</span></a><br><small>${money(w.currentBuy)} → ${money(w.targetSell)} · ROI ${pct(w.roi)}</small></div>${statusBadge(w.status)}</div>`;
  }).join("")}</div>` : `<div class="empty">Noch keine konkreten Einkaufspreise eingetragen</div>`;

  const age = [
    {label:"0–30 Tage", count:activeInv.filter(i=>daysBetween(i.purchaseDate)<=30).length},
    {label:"31–60 Tage", count:activeInv.filter(i=>daysBetween(i.purchaseDate)>30 && daysBetween(i.purchaseDate)<=60).length},
    {label:"61–90 Tage", count:activeInv.filter(i=>daysBetween(i.purchaseDate)>60 && daysBetween(i.purchaseDate)<=90).length},
    {label:"über 90 Tage", count:activeInv.filter(i=>daysBetween(i.purchaseDate)>90).length}
  ];
  const maxAge = Math.max(1,...age.map(x=>x.count));
  document.getElementById("ageSummary").innerHTML = `<div class="list">${age.map(x=>`<div><div class="list-row"><span>${x.label}</span><strong>${x.count}</strong></div><div class="bar"><span style="width:${x.count/maxAge*100}%"></span></div></div>`).join("")}</div>`;

  const recent = [...state.sales].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  document.getElementById("recentSales").innerHTML = recent.length ? `<div class="list">${recent.map(s=>{const p=calculateSaleProfit(s).profit; return `<div class="list-row"><div><strong>${escapeHtml(s.orderNo)}</strong><br><small>${fmtDate(s.date)} · ${escapeHtml(s.customer||"")}</small></div><span class="${p>=0?"money-positive":"money-negative"}">${money(p)}</span></div>`}).join("")}</div>` : `<div class="empty">Noch keine Verkäufe</div>`;
}


function addMovement(entry={}) {
  state.movements ||= [];
  state.movements.unshift({id:uid(), timestamp:new Date().toISOString(), ...entry});
}
function saleInventoryItems(sale){
  const ids=new Set(Array.isArray(sale?.itemIds)?sale.itemIds:[]);
  return state.inventory.filter(i=>ids.has(i.id));
}
function reserveSaleInventory(sale){
  if(!sale || sale.reservationCreated) return;
  const linked=saleInventoryItems(sale);
  linked.forEach(item=>{
    if(item.status!=="Verkauft") item.status="Reserviert";
    item.saleId=sale.id; item.saleOrderNo=sale.orderNo;
  });
  sale.reservationCreated=true;
  sale.paidDate=sale.paidDate||todayISO();
  addMovement({type:"Reservierung", direction:"reserve", quantity:linked.length||Number(sale.quantity||0), saleId:sale.id, reference:`Bestellung ${sale.orderNo||"-"}`, note:"Ware für bezahlte Bestellung reserviert"});
}
function inventoryGroupStats(group){
  const items=group.ids.map(id=>state.inventory.find(i=>i.id===id)).filter(Boolean);
  const total=items.filter(i=>i.status!=="Verkauft").length;
  const reserved=items.filter(i=>i.status==="Reserviert").length;
  return {total,reserved,available:Math.max(0,total-reserved),items};
}
function openInventoryDetails(groupKey){
  const group=getInventoryGroups().find(g=>g.key===groupKey);
  if(!group){ alert("Die Bestandsposition konnte nicht geöffnet werden. Bitte die Ansicht neu laden."); return; }
  const i=group.first, stats=inventoryGroupStats(group);
  const related=(state.movements||[]).filter(m=>{
    if(m.inventoryGroupKey===groupKey) return true;
    if(m.productId && cleanProductId(m.productId)===cleanProductId(i.productId)) return true;
    return false;
  });
  const inferred=stats.items.map(item=>({timestamp:item.purchaseDate||todayISO(),type:"Wareneingang / Bestand",quantity:1,reference:item.purchaseId?`Einkauf ${item.purchaseId}`:(item.lotId||"Bestand"),note:item.location||""}));
  const rows=[...related,...inferred].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  const reservations=new Map();
  stats.items.filter(item=>item.status==="Reserviert").forEach(item=>{
    const sale=state.sales.find(s=>s.id===item.saleId);
    const key=item.saleId||item.saleOrderNo||"unbekannt";
    const current=reservations.get(key)||{saleId:item.saleId,orderNo:item.saleOrderNo||sale?.orderNo||"-",status:sale?.status||"Reserviert",quantity:0};
    current.quantity+=1; reservations.set(key,current);
  });
  const reservationRows=[...reservations.values()];
  const dialog=document.getElementById("orderDetailDialog");
  document.getElementById("orderDetailTitle").textContent="Bestand & Bewegungen";
  document.getElementById("orderDetailContent").innerHTML=`
    <div class="inventory-detail-head"><div><h3>${escapeHtml(i.name)}</h3><small>${escapeHtml(i.set||"-")} · ${escapeHtml(i.rarity||"-")} · CM ${escapeHtml(i.productId||"-")}</small></div><a class="button secondary" href="${escapeHtml(cardmarketUrl(i))}" target="_blank" rel="noopener noreferrer">Cardmarket öffnen ↗</a></div>
    <div class="inventory-stock-grid"><div><small>Gesamtbestand</small><strong>${stats.total}</strong></div><div><small>Reserviert</small><strong>${stats.reserved}</strong></div><div><small>Verfügbar</small><strong>${stats.available}</strong></div></div>
    <h3>Reserviert für</h3>
    <div class="table-wrap"><table><thead><tr><th>Bestellung</th><th>Menge</th><th>Status</th></tr></thead><tbody>${reservationRows.length?reservationRows.map(r=>`<tr><td>${r.saleId?`<button class="link-button" data-show-sale="${escapeHtml(r.saleId)}">#${escapeHtml(r.orderNo)}</button>`:`#${escapeHtml(r.orderNo)}`}</td><td><strong>${r.quantity}</strong></td><td>${statusBadge(r.status)}</td></tr>`).join(""):`<tr><td colspan="3" class="empty">Aktuell keine Reservierungen.</td></tr>`}</tbody></table></div>
    <h3>Bewegungsverlauf</h3>
    <div class="table-wrap"><table><thead><tr><th>Datum</th><th>Bewegung</th><th>Menge</th><th>Referenz</th><th>Info</th></tr></thead><tbody>${rows.length?rows.map(m=>`<tr><td>${fmtDate(m.timestamp)}</td><td>${escapeHtml(m.type||"Bewegung")}</td><td><strong>${Number(m.quantity||0)>0?"+":""}${Number(m.quantity||0)}</strong></td><td>${escapeHtml(m.reference||"-")}</td><td>${escapeHtml(m.note||"")}</td></tr>`).join(""):`<tr><td colspan="5" class="empty">Noch keine Bewegungen protokolliert.</td></tr>`}</tbody></table></div>`;
  dialog.dataset.saleId="";
  if(dialog.open) dialog.close();
  try { dialog.showModal(); } catch(error) { dialog.setAttribute("open",""); }
}

function inventoryDisplayStatus(item) {
  if (item.status === "Verkauft") return "Verkauft";
  if (item.listed && Number(item.listingPrice || 0) > 0) return "Inseriert";
  if (item.status === "Im Bestand") return "Nicht inseriert";
  return item.status || "Im Bestand";
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
    item.condition || "",
    item.listed ? "1" : "0",
    Number(item.listingPrice || 0).toFixed(4),
    item.status || ""
  ].join("|");
}

function getInventoryGroups() {
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
    group.quantity += 1;
    if (new Date(item.purchaseDate || todayISO()) < new Date(group.oldestDate || todayISO())) {
      group.oldestDate = item.purchaseDate || todayISO();
    }
  });
  return [...map.values()];
}

function renderInventory() {
  const q = document.getElementById("inventorySearch").value;
  const f = document.getElementById("inventoryStatusFilter").value;
  const rows = getInventoryGroups().filter(group => {
    const i = group.first;
    const displayStatus = inventoryDisplayStatus(i);
    return cardRecordMatchesSearch({...i, status:displayStatus, quantity:group.quantity}, q) && (!f || displayStatus === f || i.status === f);
  });

  document.getElementById("inventoryTable").innerHTML = rows.length ? rows.map(group => {
    const i = group.first;
    const names = cardDisplayNames(i);
    const displayStatus = inventoryDisplayStatus(i);
    const price = i.listed && Number(i.listingPrice || 0) > 0
      ? money(i.listingPrice)
      : '<span class="muted">Nicht inseriert</span>';
    const url = cardmarketUrl(i);
    const exactLink = /^https?:\/\//i.test(String(i.productUrl || state.productCatalog?.[cleanProductId(i.productId)]?.productUrl || ""));
    return `<tr>
      <td><a class="card-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="${exactLink ? "Genaue Kartenvariante auf Cardmarket öffnen" : "Cardmarket-Suche für diese Variante öffnen"}"><strong>${escapeHtml(names.primary)}</strong><span class="external-link">↗</span></a>${names.secondary?`<br><small>Englisch: ${escapeHtml(names.secondary)}</small>`:""}<br><small>CM ${escapeHtml(i.productId||"-")}</small></td>
      <td>${escapeHtml(i.set || "-")}</td>
      <td>${escapeHtml(i.rarity || "-")}</td>
      <td><button class="stock-detail-button" data-inventory-details="${escapeHtml(group.key)}"><strong>${group.quantity}</strong><span>Details</span></button></td>
      <td>${price}</td>
      <td>${statusBadge(displayStatus)}</td>
      <td>${daysBetween(group.oldestDate)} Tage</td>
      <td><div class="row-actions"><button class="icon-button" data-edit-inventory-group="${escapeHtml(group.key)}">Bearbeiten</button><button class="icon-button" data-delete-inventory-group="${escapeHtml(group.key)}">Löschen</button></div></td>
    </tr>`;
  }).join("") : `<tr><td colspan="8" class="empty">Keine Karten gefunden</td></tr>`;
}

function editInventoryGroup(groupKey) {
  const group = getInventoryGroups().find(g => g.key === groupKey);
  if (!group) return;
  const first = group.first;
  const initial = {
    listingStatus: first.listed ? "Inseriert" : "Nicht inseriert",
    listingPrice: Number(first.listingPrice || 0),
    status: first.status || "Im Bestand",
    location: first.location || "",
    note: first.note || ""
  };
  openModal(`${group.quantity} Karte${group.quantity===1?"":"n"} bearbeiten`,[
    {name:"listingStatus",label:"Cardmarket-Inserat",type:"select",options:["Nicht inseriert","Inseriert"]},
    {name:"listingPrice",label:"Inseratspreis pro Stück (€)",type:"number",step:"0.01"},
    {name:"status",label:"Bestandsstatus",type:"select",options:["Im Bestand","Reserviert","Verkauft","Beschädigt"]},
    {name:"location",label:"Lagerort"},
    {name:"note",label:"Notiz",full:true}
  ], initial, data => {
    const ids = new Set(group.ids);
    state.inventory.forEach(item => {
      if (!ids.has(item.id)) return;
      item.listed = data.listingStatus === "Inseriert";
      item.listingPrice = item.listed ? Number(data.listingPrice || 0) : 0;
      item.status = data.status || "Im Bestand";
      item.location = data.location || "";
      item.note = data.note || "";
    });
  });
}

function renderPurchases() {
  const q = document.getElementById("purchaseSearch").value;
  const f = document.getElementById("purchaseStatusFilter").value;
  const rows = state.purchases.filter(p=>cardRecordMatchesSearch(p,q) && (!f || p.status===f));
  document.getElementById("purchaseTable").innerHTML = rows.length ? rows.map(p=>`
    <tr><td><strong>${escapeHtml(p.orderNo)}</strong></td><td>${fmtDate(p.date)}</td><td>${escapeHtml(p.seller||"")}</td>
    <td>${escapeHtml(p.country||"")}</td><td>${Number(p.items||0)}</td><td>${money(p.cardValue)}</td><td>${money(p.shipping)}</td>
    <td>${money(p.extra)}</td><td>${money(Number(p.cardValue||0)+Number(p.shipping||0)+Number(p.extra||0))}</td><td>${statusBadge(p.status)}</td>
    <td><div class="row-actions"><button class="icon-button" data-show-purchase="${p.id}">Bestellung öffnen</button><button class="icon-button" data-edit-purchase="${p.id}">Bearbeiten</button><button class="icon-button" data-delete-purchase="${p.id}">Löschen</button></div></td></tr>`).join("") : `<tr><td colspan="11" class="empty">Keine Einkäufe gefunden</td></tr>`;
}

function renderSales() {
  const q = document.getElementById("salesSearch").value;
  const f = document.getElementById("salesStatusFilter").value;
  const rows = state.sales.filter(s=>cardRecordMatchesSearch(s,q) && (!f || s.status===f));
  document.getElementById("salesTable").innerHTML = rows.length ? rows.map(s=>{const calc=calculateSaleProfit(s); return `
    <tr><td><strong>${escapeHtml(s.orderNo)}</strong></td><td>${fmtDate(s.date)}</td><td>${escapeHtml(s.customer||"")}</td>
    <td>${Number(s.quantity||0)}</td><td>${money(s.revenue)}</td><td>${money(calc.fee)}</td>
    <td class="${calc.profit>=0?"money-positive":"money-negative"}">${money(calc.profit)}</td><td>${statusBadge(s.status)}</td>
    <td><div class="row-actions"><button class="icon-button" data-show-sale="${s.id}">Packen</button><button class="icon-button" data-edit-sale="${s.id}">Bearbeiten</button><button class="icon-button" data-delete-sale="${s.id}">Löschen</button></div></td></tr>`}).join("") : `<tr><td colspan="9" class="empty">Keine Verkäufe gefunden</td></tr>`;
  renderShippingWorkbench();
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
  table.innerHTML=rows.length?rows.map(m=>{const low=Number(m.stock||0)<=Number(m.minStock||0);return `<tr><td><strong>${escapeHtml(m.name)}</strong><br><small>${escapeHtml(m.unit||"Stück")}</small></td><td>${Number(m.stock||0)}</td><td>${money(m.unitCost)}</td><td>${money(Number(m.stock||0)*Number(m.unitCost||0))}</td><td>${Number(m.minStock||0)}</td><td class="${low?'stock-low':'stock-ok'}">${low?'Nachbestellen':'Ausreichend'}</td><td><div class="row-actions"><button class="icon-button" data-buy-material="${m.id}">Einkaufen</button><button class="icon-button" data-edit-material="${m.id}">Bearbeiten</button><button class="icon-button" data-delete-material="${m.id}">Löschen</button></div></td></tr>`}).join(""):'<tr><td colspan="7" class="empty">Noch kein Versandmaterial angelegt</td></tr>';
  const list=document.getElementById("templateList");
  list.innerHTML=state.materialTemplates.length?state.materialTemplates.map(t=>`<div class="template-chip"><div><strong>${escapeHtml(t.name)}</strong><small>${escapeHtml(t.shippingType||"Keine Versandart")} · ${(t.items||[]).map(i=>`${Number(i.quantity||0)}× ${escapeHtml(state.materials.find(m=>m.id===i.materialId)?.name||"Material")}`).join(", ")||"Keine Materialien"}</small></div><div class="row-actions"><button class="icon-button" data-edit-template="${t.id}">Bearbeiten</button><button class="icon-button" data-delete-template="${t.id}">Löschen</button></div></div>`).join(""):'<div class="empty">Noch keine Versandvorlagen gespeichert</div>';
}
function renderExpenses(){
  const table=document.getElementById("expenseTable"); if(!table) return;
  const q=(document.getElementById("expenseSearch")?.value||"").toLowerCase(); const f=document.getElementById("expenseCategoryFilter")?.value||"";
  const rows=(state.expenses||[]).filter(e=>(!q||JSON.stringify(e).toLowerCase().includes(q))&&(!f||e.category===f)).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const now=new Date(); const monthRows=state.expenses.filter(e=>isSameMonth(e.date,now.getFullYear(),now.getMonth())&&e.status!=="Storniert");
  const total=monthRows.reduce((a,e)=>a+Number(e.amount||0),0); const material=monthRows.filter(e=>e.category==="Versandmaterial").reduce((a,e)=>a+Number(e.amount||0),0);
  document.getElementById("expenseMonthTotal").textContent=money(total); document.getElementById("expenseMaterialMonth").textContent=money(material); document.getElementById("expenseOtherMonth").textContent=money(total-material);
  table.innerHTML=rows.length?rows.map(e=>`<tr><td>${fmtDate(e.date)}</td><td>${escapeHtml(e.category||"Sonstiges")}</td><td>${escapeHtml(e.description||"")}</td><td>${money(e.amount)}</td><td>${escapeHtml(e.note||"")}</td><td><div class="row-actions"><button class="icon-button" data-edit-expense="${e.id}">Bearbeiten</button><button class="icon-button" data-delete-expense="${e.id}">Löschen</button></div></td></tr>`).join(""):'<tr><td colspan="6" class="empty">Keine Ausgaben gefunden</td></tr>';
}
function addMaterial(initial={}){openModal(initial.id?"Material bearbeiten":"Material anlegen",[
  {name:"name",label:"Materialname",required:true},{name:"unit",label:"Einheit",value:"Stück"},{name:"stock",label:"Aktueller Bestand",type:"number"},{name:"unitCost",label:"Stückkosten (€)",type:"number",step:"0.001"},{name:"minStock",label:"Mindestbestand",type:"number"},{name:"note",label:"Notiz",full:true}
],initial,data=>{const obj={...data,stock:Number(data.stock||0),unitCost:Number(data.unitCost||0),minStock:Number(data.minStock||0)};if(initial.id)Object.assign(state.materials.find(x=>x.id===initial.id),obj);else state.materials.push({...obj,id:uid()});});}
function buyMaterial(materialId=""){
  if(!state.materials.length){alert("Bitte zuerst ein Material anlegen.");return;}
  const initial={materialId:materialId||state.materials[0].id,date:todayISO()};
  openModal("Material einkaufen",[{name:"materialId",label:"Material",type:"select",options:state.materials.map(m=>m.id)},{name:"date",label:"Datum",type:"date",value:todayISO()},{name:"quantity",label:"Menge",type:"number",required:true},{name:"totalCost",label:"Gesamtpreis (€)",type:"number",step:"0.01",required:true},{name:"note",label:"Notiz",full:true}],initial,data=>{
    const m=state.materials.find(x=>x.id===data.materialId); if(!m)return; const qty=Number(data.quantity||0),cost=Number(data.totalCost||0); if(qty<=0||cost<0){alert("Menge und Preis prüfen.");return;}
    const oldStock=Number(m.stock||0),oldValue=oldStock*Number(m.unitCost||0); m.stock=oldStock+qty; m.unitCost=m.stock?(oldValue+cost)/m.stock:0;
    state.expenses.push({id:uid(),date:data.date||todayISO(),category:"Versandmaterial",description:`${qty} ${m.unit||"Stück"} ${m.name}`,amount:cost,note:data.note||"",materialId:m.id});
  });
}
function addExpense(initial={}){openModal(initial.id?"Ausgabe bearbeiten":"Ausgabe erfassen",[{name:"date",label:"Datum",type:"date",value:todayISO()},{name:"category",label:"Kategorie",type:"select",options:["Porto","Software","Bürobedarf","Sonstiges"]},{name:"description",label:"Beschreibung",required:true},{name:"amount",label:"Betrag (€)",type:"number",step:"0.01",required:true},{name:"note",label:"Notiz",full:true}],initial,data=>{const obj={...data,amount:Number(data.amount||0)};if(initial.id)Object.assign(state.expenses.find(x=>x.id===initial.id),obj);else state.expenses.push({...obj,id:uid()});});}
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
function adjustMaterialStock(oldUsage,newUsage){
  const delta=new Map();
  (oldUsage||[]).forEach(u=>delta.set(u.materialId,(delta.get(u.materialId)||0)+Number(u.quantity||0)));
  (newUsage||[]).forEach(u=>delta.set(u.materialId,(delta.get(u.materialId)||0)-Number(u.quantity||0)));
  for(const [id,d] of delta){const m=state.materials.find(x=>x.id===id);if(m)m.stock=Math.max(0,Number(m.stock||0)+d);}
}
function saleMaterialEditor(sale){
  const options=state.materials.map(m=>`<option value="${m.id}">${escapeHtml(m.name)} (${Number(m.stock||0)} verfügbar)</option>`).join("");
  const templateOptions='<option value="">Vorlage auswählen…</option>'+state.materialTemplates.map(t=>`<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("");
  const stage=sale.workflowStage||"Offen";
  const orderItems=(sale.items||[]).length?sale.items:[{name:sale.cardNames||`${sale.quantity||0} Karten`,quantity:sale.quantity||1}];
  if(stage==="Offen") return `<div class="workflow-panel"><h3>Bestellübersicht</h3><p>Die Bestellung ist offen. Mit „Weiter“ wird sie als bezahlt markiert, die Ware reserviert und direkt die Kommissionierung geöffnet.</p><div class="order-detail-actions"><button class="primary" id="saleWorkflowNext">Weiter zur Kommissionierung</button></div></div>`;
  if(stage==="Kommissioniert") return `<div class="workflow-panel"><h3>Kommissionieren</h3><p class="muted">Alle Positionen aus dem Lager holen und einzeln abhaken.</p><div class="pick-list">${orderItems.map((item,idx)=>`<label class="pick-row"><input type="checkbox" data-pick-item="${idx}" ${(sale.pickedItems||[]).includes(idx)?"checked":""}><span><strong>${Number(item.quantity||1)}× ${escapeHtml(item.name||"Unbekannte Karte")}</strong><small>${escapeHtml([item.set,item.rarity,item.language,item.condition].filter(Boolean).join(" · "))}</small></span></label>`).join("")}</div><div class="order-detail-actions"><button class="primary" id="saleWorkflowNext">Weiter zum Verpacken</button></div></div>`;
  if(stage==="Verpackt") return `<div class="material-editor"><h3>Verpacken</h3>
    <div class="material-editor-grid"><label>Versandart<select id="saleShippingType"><option value="">Bitte auswählen…</option>${["Standardbrief","Kompaktbrief","Großbrief","Maxibrief","Warensendung"].map(x=>`<option ${sale.shippingType===x?"selected":""}>${x}</option>`).join("")}</select></label><label>Tatsächliches Porto (€)<input id="salePostage" type="number" min="0" step="0.01" value="${Number(sale.postage||0)}"></label><label>Vorlage<select id="saleTemplateSelect">${templateOptions}</select></label><button class="secondary" type="button" id="applySaleTemplateBtn">Vorlage laden</button></div>
    <div id="saleMaterialUsage" class="material-usage-list">${(sale.materialUsage||[]).map((u,idx)=>materialUsageRow(u,idx,options)).join("")}</div>
    <div class="order-detail-actions"><button class="secondary" type="button" id="addSaleMaterialBtn">+ Material</button><button class="secondary" type="button" id="saveSaleAsTemplateBtn">Als Vorlage speichern</button><button class="secondary" type="button" id="createDeliveryNoteBtn">Lieferschein</button><button class="secondary" type="button" id="createShippingLabelBtn">Versandlabel</button><button class="primary" type="button" id="saveAndShipSaleBtn">Verpackung beenden & versenden</button></div>
    <div class="financial-summary"><div><small>Materialkosten</small><strong id="saleMaterialCostPreview">${money(saleMaterialCost(sale))}</strong></div><div><small>Porto</small><strong id="salePostagePreview">${money(sale.postage)}</strong></div><div><small>Gewinn Bestellung</small><strong id="saleProfitPreview">${money(calculateSaleProfit(sale).profit)}</strong></div></div></div>`;
  if(stage==="Versendet") return `<div class="workflow-panel"><h3>Versendet</h3><p>Die Bestellung wurde versendet. Die Einnahme ist gebucht; bis zur Empfangsbestätigung bleibt sie als noch nicht abgeschlossen gekennzeichnet.</p><div class="order-detail-actions"><button class="secondary" id="createDeliveryNoteBtn">Lieferschein</button><button class="primary" id="saleCompleteBtn">Ankunft bestätigt – abschließen</button></div></div>`;
  return `<div class="workflow-panel"><h3>Abgeschlossen</h3><p>Der Kunde hat den Erhalt bestätigt.</p><div class="order-detail-actions"><button class="secondary" id="createDeliveryNoteBtn">Lieferschein</button></div></div>`;
}
function materialUsageRow(u={},idx=0,options=""){return `<div class="material-usage-row" data-usage-row><select data-material-id><option value="">Material wählen</option>${options.replace(`value="${u.materialId}"`,`value="${u.materialId}" selected`)}</select><input data-material-qty type="number" min="0" step="1" value="${Number(u.quantity||1)}"><span data-usage-cost>${money(Number(u.quantity||1)*Number(u.unitCost||0))}</span><button type="button" class="icon-button" data-remove-usage>×</button></div>`;}
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
  for(const u of usage){
    const m=state.materials.find(x=>x.id===u.materialId); const oldQty=old.filter(x=>x.materialId===u.materialId).reduce((a,x)=>a+Number(x.quantity||0),0);
    const needed=Math.max(0,u.quantity-oldQty);
    if(m&&needed>Number(m.stock||0)){alert(`${m.name}: Es fehlen ${needed-Number(m.stock||0)} ${m.unit||"Stück"}.`);return false;}
  }
  adjustMaterialStock(old,usage); sale.materialUsage=usage; sale.shippingType=shippingType; sale.postage=Math.max(0,Number(document.getElementById("salePostage")?.value||0));
  if(markShipped){
    sale.status="Versendet"; sale.workflowStage="Versendet"; sale.shippedDate=todayISO(); syncSaleInventoryStatus(sale);
    addMovement({type:"Versand",quantity:-Number(sale.quantity||sale.itemIds?.length||0),saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:`${sale.shippingType}; Porto ${money(sale.postage)}`});
    usage.forEach(u=>addMovement({type:"Materialverbrauch",quantity:-u.quantity,materialId:u.materialId,saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:u.name}));
    addMovement({type:"Einnahme",quantity:Number(sale.revenue||0),saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:"Nach Versand als Einnahme gebucht"});
  }
  saveState(); renderAll(); document.getElementById("orderDetailDialog").close(); return true;
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
  const marketAvg30=Number(watch?.avg30||catalog.avg30||catalog.AVG30||0);
  const marketPrice=marketLow||marketTrend||marketAvg30;
  const expectedSell=marketAvg30||marketTrend||marketLow;
  const safety=Math.max(0,Number(state.settings.safetyPercent||0))/100;
  const safeSell=expectedSell*(1-safety);
  const netBeforeBuy=safeSell*(1-Number(state.settings.feePercent||0)/100)-Number(state.settings.packaging||0);
  const maxByProfit=Math.max(0,netBeforeBuy-Number(state.settings.minProfit||0));
  const maxByRoi=Math.max(0,netBeforeBuy/(1+Number(state.settings.minRoi||0)/100));
  const calculatedMaxBuy=expectedSell?Math.min(maxByProfit,maxByRoi):0;
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
  return {watch,catalog,purchases,sales,total,reserved,available,bestBuy,avgBuy,bestSell,avgSell,marketPrice,marketLow,marketTrend,marketAvg30,expectedSell,maxBuy,calculatedMaxBuy,estimatedProfit,estimatedMargin,recommendation,soldQty,boughtQty,profit:realizedRevenue-soldQty*avgBuy};
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
        <div class="analysis-metric"><span>Aktueller Marktpreis</span><strong>${a.marketPrice?money(a.marketPrice):"-"}</strong></div><div class="analysis-metric"><span>Empfohlener VK</span><strong>${a.expectedSell?money(a.expectedSell):"-"}</strong></div><div class="analysis-metric"><span>Empfohlener Max-EK</span><strong>${a.calculatedMaxBuy?money(a.calculatedMaxBuy):"-"}</strong></div>
        <div class="analysis-metric"><span>Eigene Kaufgrenze</span><strong>${a.watch?.maxBuy?money(a.watch.maxBuy):"-"}</strong></div><div class="analysis-metric"><span>Bester eigener EK</span><strong>${a.bestBuy?money(a.bestBuy):"Keine Daten"}</strong></div><div class="analysis-metric"><span>Ø eigener EK</span><strong>${a.avgBuy?money(a.avgBuy):"Keine Daten"}</strong></div>
        <div class="analysis-metric"><span>Bester eigener VK</span><strong>${a.bestSell?money(a.bestSell):"Keine Daten"}</strong></div><div class="analysis-metric"><span>Ø eigener VK</span><strong>${a.avgSell?money(a.avgSell):"Keine Daten"}</strong></div><div class="analysis-metric"><span>Geschätzter Gewinn</span><strong class="${a.estimatedProfit>=0?'money-positive':'money-negative'}">${a.expectedSell?money(a.estimatedProfit):"-"}</strong></div>
        <div class="analysis-metric"><span>Geschätzte Marge</span><strong>${a.expectedSell?pct(a.estimatedMargin):"-"}</strong></div><div class="analysis-metric"><span>Bestand / reserviert</span><strong>${a.total} / ${a.reserved}</strong></div><div class="analysis-metric"><span>Verfügbar</span><strong>${a.available}</strong></div>
      </div><div class="analysis-recommendation"><span class="muted">Einkaufsempfehlung</span><br><strong class="${cls}">${escapeHtml(a.recommendation)}</strong><div class="analysis-note">Berechnung mit ${Number(state.settings.feePercent||0).toFixed(1).replace('.',',')} % Gebühr, ${money(state.settings.packaging)}, ${money(state.settings.minProfit)} Mindestgewinn, ${Number(state.settings.minRoi||0)} % Mindest-ROI und ${Number(state.settings.safetyPercent||0)} % Sicherheitsabschlag.</div></div>
      <div class="analysis-history"><details><summary>Eigene Historie (${a.purchases.length} Einkäufe / ${a.sales.length} Verkäufe)</summary><h4>Einkäufe</h4><div class="table-wrap"><table><thead><tr><th>Datum</th><th>Menge</th><th>EK</th><th>Händler</th><th>Bestellung</th></tr></thead><tbody>${purchaseRows||'<tr><td colspan="5" class="empty">Keine Einkäufe gespeichert</td></tr>'}</tbody></table></div><h4>Verkäufe</h4><div class="table-wrap"><table><thead><tr><th>Datum</th><th>Menge</th><th>VK</th><th>Kunde</th><th>Bestellung</th></tr></thead><tbody>${saleRows||'<tr><td colspan="5" class="empty">Keine Verkäufe gespeichert</td></tr>'}</tbody></table></div></details></div></article>`;
  }).join("")}</div>`;
}
function renderWatchlist() {
  renderPurchaseAnalysis();
  const q = document.getElementById("watchSearch").value;
  const f = document.getElementById("watchStatusFilter").value;
  const rows = state.watchlist.filter(w=>!w.archived).map(w=>({...w,...calculateWatch(w)})).filter(w=>cardRecordMatchesSearch(w,q) && (!f || w.status===f));
  document.getElementById("watchTable").innerHTML = rows.length ? rows.map(w=>{ const names=cardDisplayNames(w); return `
    <tr><td>${escapeHtml(w.priority)}</td><td><a class="card-link" href="${escapeHtml(cardmarketUrl(w))}" title="${escapeHtml(`Cardmarket öffnen · Produkt-ID ${w.productId||"nicht vorhanden"} · ${w.set||"Set unbekannt"} · ${w.version||w.rarity||"Version unbekannt"}`)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(names.primary)}</strong><span class="external-link">↗</span></a>${names.secondary?`<br><small>Englisch: ${escapeHtml(names.secondary)}</small>`:""}<br><small>CM ${escapeHtml(w.productId||"-")}</small></td>
    <td>${escapeHtml(w.set||"")}<br><small>${escapeHtml(w.version||"")}</small></td><td>${w.stock}</td><td>${w.target}</td>
    <td>${money(w.maxBuy)}</td><td>${money(w.targetSell)}</td><td>${w.trend!==""?money(w.trend):"-"}</td><td>${w.avg30!==""?money(w.avg30):"-"}</td>
    <td>${w.currentBuy!==""?money(w.profit):"-"}</td><td>${w.currentBuy!==""?pct(w.roi):"-"}</td><td>${statusBadge(w.status)}</td>
    <td><div class="row-actions"><button class="icon-button" data-edit-watch="${w.id}">Bearbeiten</button><button class="icon-button" data-delete-watch="${w.id}">Löschen</button></div></td></tr>`;}).join("") : `<tr><td colspan="13" class="empty">Keine Karten gefunden</td></tr>`;
}


function orderItemTable(items=[], kind="purchase") {
  if(!items.length) return `<div class="empty">Für diese ältere Bestellung sind noch keine Einzelpositionen gespeichert.</div>`;
  return `<div class="order-items"><table><thead><tr><th>Menge</th><th>Karte</th><th>Set</th><th>Seltenheit</th><th>Sprache</th><th>Zustand</th><th>Stückpreis</th><th>Gesamt</th></tr></thead><tbody>${items.map(item=>{
    const qty=Number(item.quantity||item.amount||1); const price=Number(item.unitPrice||item.price||0);
    const url=cardmarketUrl(item); const names=cardDisplayNames(item);
    return `<tr><td><strong>${qty}×</strong></td><td><a class="card-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(names.primary)}</strong><span class="external-link">↗</span></a>${names.secondary?`<br><small>Englisch: ${escapeHtml(names.secondary)}</small>`:""}${item.collectorNumber?`<br><small>#${escapeHtml(item.collectorNumber)}</small>`:""}</td><td>${escapeHtml(item.set||"-")}</td><td>${escapeHtml(item.rarity||"-")}</td><td>${escapeHtml(item.language||"-")}</td><td>${escapeHtml(item.condition||"-")}</td><td>${money(price)}</td><td>${money(qty*price)}</td></tr>`;
  }).join("")}</tbody></table></div>`;
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
  const total=isPurchase ? subtotal+shipping+extra : Number(order.revenue||subtotal+shipping);
  const partner=isPurchase ? order.seller : order.customer;
  const calc=isPurchase?null:calculateSaleProfit(order);
  document.getElementById("orderDetailTitle").textContent=`${isPurchase?"Einkauf":"Verkauf"} #${order.orderNo||"-"}`;
  document.getElementById("orderDetailContent").innerHTML=`
    <div class="order-summary-grid">
      <div><small>Bestellnummer</small><strong>${escapeHtml(order.orderNo||"-")}</strong></div>
      <div><small>Datum</small><strong>${fmtDate(order.date)||"-"}</strong></div>
      <div><small>${isPurchase?"Händler":"Kunde"}</small><strong>${escapeHtml(partner||"-")}</strong></div>
      <div><small>Status</small><strong>${statusBadge(order.status)}</strong></div>
      <div><small>Karten</small><strong>${Number(order.items||order.quantity||items.reduce((a,i)=>a+Number(i.quantity||1),0))}</strong></div>
      <div><small>Kartenwert</small><strong>${money(subtotal)}</strong></div>
      <div><small>Versand vom Käufer / Versand</small><strong>${money(shipping)}</strong></div>
      <div><small>${isPurchase?"Trustee/Zusatz":"Cardmarket-Gebühr"}</small><strong>${money(extra)}</strong></div>
      ${isPurchase?`<div><small>Gesamt</small><strong>${money(total)}</strong></div>`:`<div><small>Einstand</small><strong>${money(order.cost)}</strong></div><div><small>Porto</small><strong>${money(calc.postage)}</strong></div><div><small>Material</small><strong>${money(calc.packaging)}</strong></div><div><small>Gewinn</small><strong class="${calc.profit>=0?'money-positive':'money-negative'}">${money(calc.profit)}</strong></div>`}
    </div>
    ${orderItemTable(items,kind)}
    ${!isPurchase?saleMaterialEditor(order):""}
    ${order.note?`<div class="order-note"><strong>Notiz</strong><p>${escapeHtml(order.note)}</p></div>`:""}`;
  document.getElementById("orderDetailDialog").dataset.saleId=sale?.id||"";
  document.getElementById("orderDetailDialog").showModal();
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
  const labels = {inventory:"Bestand", purchase:"Einkauf", sale:"Verkauf", prices:"Preise", watchlist:"Watchlist", seller:"Händler", customer:"Kunden", backup:"Backup"};
  const rows = [...state.imports].sort((a,b)=>new Date(b.date)-new Date(a.date));
  el.innerHTML = rows.length ? rows.map(i=>`<tr>
    <td>${fmtDate(i.date)}</td><td>${escapeHtml(labels[i.type]||i.type)}</td><td>${escapeHtml(i.file||"")}</td>
    <td>${Number(i.rows||0)}</td><td>${Number(i.cards||0)}</td><td>${escapeHtml(i.key||"")}</td>
    <td class="actions"><button class="icon-button danger-text" data-delete-import="${i.id}">Rückgängig</button><button class="icon-button" data-remove-import-history="${i.id}">Aus Historie entfernen</button></td>
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
  const revenue = state.sales.reduce((a,s)=>a+Number(s.revenue||0),0);
  const profits = state.sales.map(s=>calculateSaleProfit(s).profit);
  const profit = profits.reduce((a,b)=>a+b,0);
  const cost = state.sales.reduce((a,s)=>a+Number(s.cost||0),0);
  const soldInv = state.inventory.filter(i=>i.status==="Verkauft" && i.saleDate);
  document.getElementById("rRevenue").textContent = money(revenue);
  document.getElementById("rProfit").textContent = money(profit);
  document.getElementById("rRoi").textContent = pct(cost?profit/cost*100:0);
  document.getElementById("rDays").textContent = `${soldInv.length?Math.round(soldInv.reduce((a,i)=>a+daysBetween(i.purchaseDate,i.saleDate),0)/soldInv.length):0} Tage`;

  const months={};
  state.sales.forEach(s=>{const k=(s.date||"").slice(0,7)||"Ohne Datum"; months[k]=(months[k]||0)+calculateSaleProfit(s).profit;});
  document.getElementById("monthlyReport").innerHTML = Object.keys(months).length ? `<div class="list">${Object.entries(months).sort().map(([k,v])=>`<div class="list-row"><span>${escapeHtml(k)}</span><strong class="${v>=0?"money-positive":"money-negative"}">${money(v)}</strong></div>`).join("")}</div>` : `<div class="empty">Noch keine Daten</div>`;

  const cardProfit={};
  state.sales.forEach(s=>{(s.cardNames||"Unbekannt").split(",").forEach(n=>cardProfit[n.trim()]=(cardProfit[n.trim()]||0)+calculateSaleProfit(s).profit/Math.max(1,(s.cardNames||"").split(",").length));});
  document.getElementById("topCardsReport").innerHTML = Object.keys(cardProfit).length ? `<div class="list">${Object.entries(cardProfit).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>`<div class="list-row"><span>${escapeHtml(k)}</span><strong>${money(v)}</strong></div>`).join("")}</div>` : `<div class="empty">Noch keine Daten</div>`;

  const slow=[...state.inventory].filter(i=>!["Verkauft","Storniert"].includes(i.status)).sort((a,b)=>daysBetween(b.purchaseDate)-daysBetween(a.purchaseDate)).slice(0,8);
  document.getElementById("slowCardsReport").innerHTML = slow.length ? `<div class="list">${slow.map(i=>`<div class="list-row"><span>${escapeHtml(i.name)}</span><strong>${daysBetween(i.purchaseDate)} Tage</strong></div>`).join("")}</div>` : `<div class="empty">Noch keine Daten</div>`;

  const sellers={};
  state.purchases.forEach(p=>{const k=p.seller||"Unbekannt"; sellers[k]??={orders:0,total:0}; sellers[k].orders++; sellers[k].total+=Number(p.cardValue||0)+Number(p.shipping||0)+Number(p.extra||0);});
  document.getElementById("sellerReport").innerHTML = Object.keys(sellers).length ? `<div class="list">${Object.entries(sellers).sort((a,b)=>b[1].orders-a[1].orders).map(([k,v])=>`<div class="list-row"><div><span>${escapeHtml(k)}</span><br><small>${v.orders} Bestellungen</small></div><strong>${money(v.total)}</strong></div>`).join("")}</div>` : `<div class="empty">Noch keine Daten</div>`;
}

function renderSettings() {
  document.getElementById("settingFee").value = state.settings.feePercent;
  document.getElementById("settingPackaging").value = state.settings.packaging;
  document.getElementById("settingMinProfit").value = state.settings.minProfit;
  document.getElementById("settingMinRoi").value = state.settings.minRoi;
  document.getElementById("settingPriceAge").value = state.settings.priceAgeDays;
  document.getElementById("settingCondition").value = state.settings.condition;
  document.getElementById("settingLanguages").value = state.settings.languages;
  document.getElementById("settingTargetStock").value = state.settings.targetStock;
  document.getElementById("settingSafetyPercent").value = state.settings.safetyPercent ?? 5;
}

function openModal(title, fields, initial={}, onSave) {
  document.getElementById("modalTitle").textContent = title;
  const wrap = document.getElementById("modalFields");
  wrap.innerHTML = fields.map(f=>`
    <label class="${f.full?"full-width":""}">${escapeHtml(f.label)}
      ${f.type==="select"
        ? `<select name="${f.name}">${f.options.map(o=>`<option ${String(initial[f.name]??f.value??"")===String(o)?"selected":""}>${escapeHtml(o)}</option>`).join("")}</select>`
        : `<input name="${f.name}" type="${f.type||"text"}" value="${escapeHtml(initial[f.name]??f.value??"")}" ${f.step?`step="${f.step}"`:""} ${f.required?"required":""} />`
      }
    </label>`).join("");
  modalHandler = onSave;
  document.getElementById("modal").showModal();
}

document.getElementById("modalForm").addEventListener("submit", e=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.currentTarget).entries());
  modalHandler?.(data);
  document.getElementById("modal").close();
  saveState(); renderAll();
});
document.getElementById("modalClose").onclick=()=>document.getElementById("modal").close();
document.getElementById("modalCancel").onclick=()=>document.getElementById("modal").close();

function addInventory(initial={}) {
  const modalInitial={...initial,listingStatus:initial.listed?"Inseriert":"Nicht inseriert"};
  openModal(initial.id?"Karte bearbeiten":"Karte hinzufügen",[
    {name:"productId",label:"CM Produkt-ID"},
    {name:"name",label:"Kartenname",required:true},
    {name:"set",label:"Set"},
    {name:"rarity",label:"Version / Seltenheit"},
    {name:"language",label:"Sprache",type:"select",options:["DE","EN","DE/EN","IT","FR","ES","PL","NL"]},
    {name:"condition",label:"Zustand",type:"select",options:["NM","EX","GD","LP","PL"]},
    {name:"cost",label:"Einstand (€)",type:"number",step:"0.01"},
    {name:"listingStatus",label:"Cardmarket-Inserat",type:"select",options:["Nicht inseriert","Inseriert"]},
    {name:"listingPrice",label:"Inseratspreis pro Stück (€)",type:"number",step:"0.01"},
    {name:"purchaseDate",label:"Kaufdatum",type:"date",value:todayISO()},
    {name:"status",label:"Status",type:"select",options:["Bestellt","Unterwegs","Im Bestand","Reserviert","Verkauft","Beschädigt"]},
    {name:"location",label:"Lagerort"},
    {name:"note",label:"Notiz",full:true}
  ], modalInitial, data=>{
    const obj={...data,cost:Number(data.cost||0),listingPrice:Number(data.listingPrice||0),listed:data.listingStatus==="Inseriert"};
    delete obj.listingStatus;
    if(initial.id) Object.assign(state.inventory.find(x=>x.id===initial.id),obj);
    else state.inventory.push({...obj,id:uid()});
  });
}

function materializePurchaseInventory(purchase) {
  if (!purchase || purchase.status!=="Eingetroffen") return 0;
  if (purchase.inventoryCreated || state.inventory.some(i=>i.purchaseId===purchase.id)) {
    purchase.inventoryCreated=true;
    return 0;
  }
  const items=Array.isArray(purchase.pendingItems)?purchase.pendingItems:[];
  const totalCards=items.reduce((sum,item)=>sum+Number(item.quantity||0),0);
  if (!totalCards) return 0;
  const allocation=(Number(purchase.shipping||0)+Number(purchase.extra||0))/totalCards;
  let created=0;
  items.forEach(item=>{
    for(let n=0;n<Number(item.quantity||0);n++){
      state.inventory.push({
        id:uid(), productId:item.productId, name:item.name, set:item.set, setName:item.setName,
        rarity:item.rarity, language:item.language, condition:item.condition,
        collectorNumber:item.collectorNumber||"", productUrl:item.productUrl||"",
        cost:Number(item.unitPrice||0)+allocation, purchaseDate:purchase.date||todayISO(),
        status:"Im Bestand", location:"", source:"Cardmarket-Einkauf",
        listed:false, listingPrice:0, lotId:purchase.orderNo, importKey:purchase.importKey||purchase.orderNo,
        sourceRow:item.sourceRow, purchaseId:purchase.id
      });
      created++;
    }
  });
  purchase.inventoryCreated=true;
  purchase.receivedDate=purchase.receivedDate||todayISO();
  return created;
}

function addPurchase(initial={}) {
  openModal(initial.id?"Einkauf bearbeiten":"Einkauf erfassen",[
    {name:"orderNo",label:"Bestellnummer",required:true},
    {name:"date",label:"Kaufdatum",type:"date",value:todayISO()},
    {name:"seller",label:"Händler"},
    {name:"country",label:"Händlerland"},
    {name:"items",label:"Kartenanzahl",type:"number"},
    {name:"cardValue",label:"Kartenwert (€)",type:"number",step:"0.01"},
    {name:"shipping",label:"Versand (€)",type:"number",step:"0.01"},
    {name:"extra",label:"Zusatzkosten (€)",type:"number",step:"0.01"},
    {name:"status",label:"Status",type:"select",options:["Bestellt","Unterwegs","Eingetroffen","Storniert"]},
    {name:"note",label:"Notiz",full:true}
  ], initial, data=>{
    const obj={...data,items:Number(data.items||0),cardValue:Number(data.cardValue||0),shipping:Number(data.shipping||0),extra:Number(data.extra||0)};
    let purchase;
    if(initial.id) {
      purchase=state.purchases.find(x=>x.id===initial.id);
      Object.assign(purchase,obj);
    } else {
      purchase={...obj,id:uid(),pendingItems:[],inventoryCreated:false};
      state.purchases.push(purchase);
    }
    if(purchase.status==="Eingetroffen") materializePurchaseInventory(purchase);
    if(data.seller && !state.sellers.some(s=>String(s.name).toLowerCase()===String(data.seller).toLowerCase())) state.sellers.push(normalizePartnerRecord({name:data.seller,cardmarketName:data.seller,country:data.country},"seller"));
  });
}


function syncSaleInventoryStatus(sale) {
  if(!sale) return;
  const ids=new Set(Array.isArray(sale.itemIds)?sale.itemIds:[]);
  state.inventory.forEach(item=>{
    if(!ids.has(item.id)) return;
    if(sale.status==="Storniert") {item.status="Im Bestand"; delete item.saleId; delete item.saleOrderNo; delete item.saleDate;}
    else if(["Versendet","Abgeschlossen"].includes(sale.status)) {item.status="Verkauft"; item.saleDate=sale.date||todayISO(); item.saleId=sale.id; item.saleOrderNo=sale.orderNo;}
    else {item.status="Reserviert"; item.saleId=sale.id; item.saleOrderNo=sale.orderNo;}
  });
}

function addSale(initial={}) {
  openModal(initial.id?"Verkauf bearbeiten":"Verkauf erfassen",[
    {name:"orderNo",label:"Bestellnummer",required:true},
    {name:"date",label:"Verkaufsdatum",type:"date",value:todayISO()},
    {name:"customer",label:"Kunde"},
    {name:"country",label:"Kundenland"},
    {name:"quantity",label:"Kartenanzahl",type:"number"},
    {name:"cardNames",label:"Karten",full:true},
    {name:"revenue",label:"Verkaufspreis gesamt (€)",type:"number",step:"0.01"},
    {name:"cost",label:"Einstand verkaufter Karten (€)",type:"number",step:"0.01"},
    {name:"fee",label:"Gebühr (€) – leer = automatisch",type:"number",step:"0.01"},
    {name:"shippingPaid",label:"Versand vom Käufer (€)",type:"number",step:"0.01"},
    {name:"postage",label:"Tatsächliches Porto (€)",type:"number",step:"0.01"},
    {name:"status",label:"Status",type:"select",options:["Offen","Bezahlt","Kommissioniert","Verpackt","Versendet","Abgeschlossen","Storniert"]},
    {name:"note",label:"Notiz",full:true}
  ], initial, data=>{
    const obj={...data,quantity:Number(data.quantity||0),revenue:Number(data.revenue||0),cost:Number(data.cost||0),shippingPaid:Number(data.shippingPaid||0),postage:Number(data.postage||0)};
    let sale;
    if(initial.id) { sale=state.sales.find(x=>x.id===initial.id); Object.assign(sale,obj); }
    else { sale={...obj,id:uid(),items:[],itemIds:[]}; state.sales.push(sale); }
    syncSaleInventoryStatus(sale);
    if(data.customer && !state.customers.some(c=>String(c.name).toLowerCase()===String(data.customer).toLowerCase())) state.customers.push(normalizePartnerRecord({name:data.customer,cardmarketName:data.customer,country:data.country},"customer"));
  });
}

function addWatch(initial={}) {
  openModal(initial.id?"Watchlist bearbeiten":"Karte beobachten",[
    {name:"priority",label:"Priorität",type:"select",options:["A","B","C"]},
    {name:"productId",label:"CM Produkt-ID"},
    {name:"name",label:"Kartenname",required:true},
    {name:"set",label:"Set"},
    {name:"version",label:"Version / Seltenheit"},
    {name:"productUrl",label:"Cardmarket-Link zur genauen Version",full:true},
    {name:"target",label:"Sollbestand",type:"number",value:state.settings.targetStock},
    {name:"maxBuy",label:"Max. Einkauf (€)",type:"number",step:"0.01"},
    {name:"currentBuy",label:"Aktuelles Angebot (€)",type:"number",step:"0.01"},
    {name:"targetSell",label:"Zielverkauf (€)",type:"number",step:"0.01"},
    {name:"trend",label:"CM Trend (€)",type:"number",step:"0.01"},
    {name:"avg30",label:"Ø 30 Tage (€)",type:"number",step:"0.01"},
    {name:"reprint",label:"Reprint-Risiko",type:"select",options:["Niedrig","Mittel","Hoch"]},
    {name:"banlist",label:"Banlist-Risiko",type:"select",options:["Niedrig","Mittel","Hoch"]}
  ], initial, data=>{
    const obj={...data,target:Number(data.target||0),maxBuy:Number(data.maxBuy||0),currentBuy:data.currentBuy===""?"":Number(data.currentBuy),targetSell:Number(data.targetSell||0),trend:data.trend===""?"":Number(data.trend),avg30:data.avg30===""?"":Number(data.avg30)};
    if(initial.id) Object.assign(state.watchlist.find(x=>x.id===initial.id),obj); else state.watchlist.push({...obj,id:uid(),stock:0});
  });
}

function addPartner(kind, initial={}) {
  const isSeller=kind==="seller";
  const fields=[
    {name:"name",label:"Interner Name",required:true},
    {name:"cardmarketName",label:"Cardmarket-Benutzername",required:true},
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
  return resolveProduct(productId, {
    name:getAny(r,["Name","Karte","Product Name"]),
    set:setFromImage || getAny(r,["SetCode","Set","ExpansionCode"]),
    setName:getAny(r,["Expansion","Setname"]),
    rarity:getAny(r,["Rarity","Seltenheit"]),
    language:getAny(r,["Language","Sprache"]),
    condition:getAny(r,["Condition","Zustand"]),
    collectorNumber:getAny(r,["CollectorNumber","Kartennr."]),
    productUrl:getAny(r,["ProductUrl","Produkt-URL"])
  });
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

function removeImport(importRecord, ask=true) {
  if(!importRecord) return;
  if(ask && !confirm(`Import „${importRecord.file}“ wirklich rückgängig machen?`)) return;
  const key=importRecord.key;
  if(importRecord.type==="inventory") {
    state.inventory=state.inventory.filter(i=>i.importKey!==key && i.lotId!==key);
  } else if(importRecord.type==="purchase") {
    const purchaseIds=state.purchases.filter(p=>p.importKey===key || p.orderNo===key).map(p=>p.id);
    state.inventory=state.inventory.filter(i=>i.importKey!==key && i.lotId!==key && !purchaseIds.includes(i.purchaseId));
    state.purchases=state.purchases.filter(p=>p.importKey!==key && p.orderNo!==key);
  } else if(importRecord.type==="sale") {
    const saleIds=state.sales.filter(s=>s.importKey===key || s.orderNo===key).map(s=>s.id);
    state.inventory.forEach(i=>{
      if(i.saleImportKey===key || saleIds.includes(i.saleId)) {
        i.status="Im Bestand"; delete i.saleDate; delete i.saleId; delete i.saleOrderNo; delete i.saleImportKey;
      }
    });
    state.sales=state.sales.filter(s=>s.importKey!==key && s.orderNo!==key);
  } else if(importRecord.type==="watchlist" && Array.isArray(importRecord.watchlistBefore)) {
    state.watchlist=structuredClone(importRecord.watchlistBefore);
  }
  state.imports=state.imports.filter(i=>i.id!==importRecord.id);
  saveState(); renderAll();
}

async function importStock(file) {
  const rows=parseCsv(await readFile(file));
  if(!rows.length) throw new Error("Keine Datenzeilen gefunden.");
  const key=`STOCK-${file.name}-${rows.length}`;
  const previous=state.imports.find(i=>i.type==="inventory" && (i.key===key || i.file===file.name));
  if(previous) {
    if(!confirm("Dieser Bestandsimport existiert bereits. Alten Import ersetzen?")) throw new Error("Import abgebrochen.");
    removeImport(previous,false);
  }
  updateCatalogFromRows(rows);

  // Mengen aus offenen Bestellungen werden beim Bestandsimport reserviert und
  // erst nach Status „Eingetroffen“ durch createInventoryFromPurchase angelegt.
  const pendingOpen = pendingOpenPurchaseQuantities(state.purchases);
  let cards=0, unknown=0, skippedOpenOrders=0;
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

    for(let n=0;n<createQty;n++){
      state.inventory.push({
        id:uid(), productId:p.productId, name:p.name, set:p.set, setName:p.setName, rarity:p.rarity,
        language:p.language, condition:p.condition, collectorNumber:p.collectorNumber, productUrl:p.productUrl,
        cost:0, purchaseDate:todayISO(), status:"Im Bestand", location:"", source:"Eigene Sammlung / Packpull",
        listed:offerPrice>0, listingPrice:offerPrice, articleId:cleanProductId(getAny(r,["ArticleID","idArticle"])),
        importKey:key, lotId:key, sourceRow:idx+2
      });
    }
    cards+=createQty;
  });
  state.imports.push({
    id:uid(),type:"inventory",key,file:file.name,date:new Date().toISOString(),
    rows:rows.length,cards,unknown,skippedOpenOrders
  });
  saveState();renderAll();
  return {rows:rows.length,cards,unknown,skippedOpenOrders};
}

async function importPurchases(file) {
  const rows=parseCsv(await readFile(file));
  if(!rows.length) throw new Error("Keine Datenzeilen gefunden.");
  const shipment=(file.name.match(/(\d{6,})/)||[])[1]||`PURCHASE-${Date.now()}`;
  if(state.imports.some(i=>i.type==="purchase"&&i.key===shipment)) throw new Error("Diese Sendung wurde bereits importiert.");
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
    pendingItems.push({
      productId, name:p.name, set:p.set, setName:p.setName, rarity:p.rarity,
      language:mapLanguage(getAny(r,["idLanguage","language","Sprache"])) || p.language,
      condition:mapCondition(getAny(r,["condition","Condition-Code","Zustand"])) || p.condition,
      collectorNumber:p.collectorNumber, productUrl:p.productUrl,
      quantity, unitPrice:price, sourceRow:idx+2
    });
    cards+=quantity; total+=quantity*price;
  });
  const importDate = document.getElementById("purchaseImportDate")?.value || todayISO();
  const importSeller = document.getElementById("purchaseImportSeller")?.value?.trim() || "Aus CSV";
  const importShipping = num(document.getElementById("purchaseImportShipping")?.value, 0);
  const importExtra = num(document.getElementById("purchaseImportExtra")?.value, 0);

  state.purchases.push({
    id:purchaseId,orderNo:shipment,date:importDate,seller:importSeller,country:"",items:cards,
    cardValue:total,shipping:importShipping,extra:importExtra,status:"Unterwegs",
    note:`Import aus ${file.name}. Karten werden erst bei Status „Eingetroffen“ in den Bestand übernommen.`,
    importKey:shipment,pendingItems,inventoryCreated:false
  });
  state.imports.push({id:uid(),type:"purchase",key:shipment,file:file.name,date:new Date().toISOString(),rows:rows.length,cards,unknown});
  saveState(); renderAll();
  return {rows:rows.length,cards,total,shipment,unknown,shipping:importShipping,extra:importExtra,grandTotal:total+importShipping+importExtra};
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
  let matched=0,revenue=0,cardNames=[],soldItems=[];
  rows.forEach(r=>{
    const productId=cleanProductId(getAny(r,["idProduct","productId","CM Produkt-ID"]));
    const quantity=Math.max(1,Math.round(num(getAny(r,["groupCount","count","quantity","Menge"]),1)));
    const price=num(getAny(r,["price","Stückpreis","unitPrice"]),0);
    const language=mapLanguage(getAny(r,["idLanguage","language","Sprache"]));
    const condition=mapCondition(getAny(r,["condition","Condition-Code","Zustand"]));
    for(let n=0;n<quantity;n++){
      const candidates=state.inventory.filter(i=>i.status!=="Verkauft" && cleanProductId(i.productId)===productId && (!language || i.language===language) && (!condition || i.condition===condition));
      const item=(candidates.length?candidates:state.inventory.filter(i=>i.status!=="Verkauft" && cleanProductId(i.productId)===productId))
        .sort((a,b)=>new Date(a.purchaseDate||0)-new Date(b.purchaseDate||0))[0];
      if(item){
        item.status="Verkauft"; item.saleDate=todayISO(); item.saleOrderNo=shipment; item.saleImportKey=shipment;
        matched++; cardNames.push(item.name); soldItems.push(item);
      }
      revenue+=price;
    }
  });
  const cost=soldItems.reduce((a,i)=>a+Number(i.cost||0),0);
  const saleId=uid(); soldItems.forEach(i=>i.saleId=saleId);
  state.sales.push({id:saleId,orderNo:shipment,date:todayISO(),customer:"Aus CSV",country:"",quantity:matched,cardNames:cardNames.join(", "),revenue,cost,status:"Abgeschlossen",note:`Import aus ${file.name}`,importKey:shipment,itemIds:soldItems.map(i=>i.id)});
  state.imports.push({id:uid(),type:"sale",key:shipment,file:file.name,date:new Date().toISOString(),rows:rows.length,cards:matched});
  saveState();renderAll(); return {rows:rows.length,matched,revenue};
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
    restored++;
  });
  return restored;
}

function deleteSaleRecord(id) {
  const sale = state.sales.find(x=>x.id===id);
  if (!sale) return;
  const restored = restoreSaleInventory(sale);
  state.sales = state.sales.filter(x=>x.id!==id);
  saveState(); renderAll();
  if (restored) alert(`${restored} Karte${restored===1?"":"n"} wurde${restored===1?"":"n"} wieder in den Bestand gelegt.`);
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
  customer: "cardmarketName;realName;country;language;email;phone;status;favorite;rating;preferredShipping;trackingRequired;complaints;note\n"
};

function detectImportType(file, rows, rawText="") {
  const name = String(file?.name||"").toLowerCase();
  if (name.endsWith(".json")) return "backup";
  if (name.endsWith(".html") || name.endsWith(".htm")) return "saleHtml";
  const keys = new Set(Object.keys(rows[0]||{}).map(k=>String(k).toLowerCase()));
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
    rows.forEach(r=>{ state.sellers.push(normalizePartnerRecord({...r,name:r.cardmarketName||r.name,favorite:boolValue(r.favorite)},"seller")); count++; });
  } else if (type === "customerGeneric") {
    rows.forEach(r=>{ state.customers.push(normalizePartnerRecord({...r,name:r.cardmarketName||r.name,favorite:boolValue(r.favorite),trackingRequired:boolValue(r.trackingRequired)},"customer")); count++; });
  }
  const importType = ({inventoryGeneric:"inventory",purchaseGeneric:"purchase",saleGeneric:"sale",watchlistGeneric:"watchlist",sellerGeneric:"seller",customerGeneric:"customer"})[type] || type;
  const importRecord={id:uid(),type:importType,key,file:file.name,date:new Date().toISOString(),rows:count,cards};
  if(type === "watchlistGeneric") importRecord.watchlistBefore=watchlistBefore;
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
  const fee = Math.ceil(cardValue*5)/100;
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

async function universalImportFile(file) {
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
  const type = detectImportType(file, rows, text);
  if (type === "inventory") return {...await importStock(file),type:"inventory"};
  if (type === "purchase") return {...await importPurchases(file),type:"purchase"};
  if (type === "prices") return {...await importPrices(file),type:"prices"};
  if (type === "sale") return {...await importSales(file),type:"sale"};
  if (["inventoryGeneric","purchaseGeneric","saleGeneric","watchlistGeneric","sellerGeneric","customerGeneric"].includes(type)) return genericImportRecord(type,rows,file);
  throw new Error("Dateityp nicht erkannt. Nutze eine Vorlage oder wähle den Importtyp manuell.");
}

async function runUniversalImport(files) {
  const out=document.getElementById("universalImportPreview");
  const results=[];
  for (const file of files) {
    try {
      const r=await universalImportFile(file);
      results.push(`<div class="success"><strong>${escapeHtml(file.name)}</strong><br>${escapeHtml(r.type||"Import")} · ${Number(r.rows||0)} Positionen · ${Number(r.cards||0)} Karten${r.warning?`<br><span class="warning-text">${escapeHtml(r.warning)}</span>`:""}</div>`);
    } catch(err) {
      results.push(`<div class="error"><strong>${escapeHtml(file.name)}</strong><br>${escapeHtml(err.message)}</div>`);
    }
  }
  out.innerHTML=results.join("");
}


const OFFICIAL_YGO_PRICE_GUIDE = "https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_3.json";
let syncDirectoryHandle = null;
let folderSyncTimer = null;

function normalizeCardName(value="") {
  return String(value).toLowerCase().replace(/\([^)]*\)/g," ").replace(/[^a-z0-9äöüß]+/gi," ").trim();
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

function openSyncDb(){
  return new Promise((resolve,reject)=>{const req=indexedDB.open("tcgWawiHandles",1);req.onupgradeneeded=()=>req.result.createObjectStore("handles");req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
}
async function saveDirectoryHandle(handle){const db=await openSyncDb();return new Promise((resolve,reject)=>{const tx=db.transaction("handles","readwrite");tx.objectStore("handles").put(handle,"syncDirectory");tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
async function loadDirectoryHandle(){const db=await openSyncDb();return new Promise((resolve,reject)=>{const req=db.transaction("handles").objectStore("handles").get("syncDirectory");req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});}

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
    }else if(entry.kind==="directory"){
      files.push(...await listSyncFiles(entry,path+name+"/"));
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
    const results=[];
    for(const item of newFiles){
      try{
        const r=await universalImportFile(item.file);
        state.sync.processedFiles[item.path]=item.signature;
        results.push(`<div class="success"><strong>${escapeHtml(item.path)}</strong><br>${escapeHtml(r.type||"Import")} · ${Number(r.rows||0)} Positionen · ${Number(r.cards||0)} Karten</div>`);
      }catch(err){
        results.push(`<div class="error"><strong>${escapeHtml(item.path)}</strong><br>${escapeHtml(err.message)}</div>`);
      }
    }
    saveState();renderAll();updateAutomationUi();if(out)out.innerHTML=results.join("");
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
  const priceToggle=document.getElementById("autoPriceToggle"); if(priceToggle) priceToggle.checked=state.sync.autoPrices!==false;
}

async function initAutomation(){
  try{syncDirectoryHandle=await loadDirectoryHandle();}catch{}
  updateAutomationUi();startFolderSyncTimer();
  if(syncDirectoryHandle&&state.sync.autoFolder) setTimeout(()=>scanSyncFolder(false),1200);
  if(state.sync.autoPrices){
    const last=state.sync.lastPriceUpdate?new Date(state.sync.lastPriceUpdate).getTime():0;
    if(Date.now()-last>20*60*60*1000) setTimeout(()=>updateOfficialMarketPrices(false),1800);
  }
}

function exportBackup(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`TCG_Warenwirtschaft_Backup_${todayISO()}.json`;a.click();URL.revokeObjectURL(a.href);
}
function importBackupPayload(data,fileName="Backup.json"){state=migrateState(data);saveState();renderAll();return {file:fileName};}
async function importBackup(file){return importBackupPayload(JSON.parse(await file.text()),file.name);}

document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-view-jump]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.viewJump)));

["inventorySearch","inventoryStatusFilter","purchaseSearch","purchaseStatusFilter","salesSearch","salesStatusFilter","watchSearch","watchStatusFilter","materialSearch","expenseSearch","expenseCategoryFilter"].forEach(id=>document.getElementById(id).addEventListener("input",renderAll));

document.getElementById("addInventoryBtn").onclick=()=>addInventory();
document.getElementById("addPurchaseBtn").onclick=()=>addPurchase();
document.getElementById("addSaleBtn").onclick=()=>addSale();
document.getElementById("addMaterialBtn").onclick=()=>addMaterial();
document.getElementById("buyMaterialBtn").onclick=()=>buyMaterial();
document.getElementById("addTemplateBtn").onclick=()=>addTemplate();
document.getElementById("addExpenseBtn").onclick=()=>addExpense();
document.getElementById("addWatchBtn").onclick=()=>addWatch();
document.getElementById("addSellerBtn").onclick=()=>addPartner("seller");
document.getElementById("addCustomerBtn").onclick=()=>addPartner("customer");
document.getElementById("quickAddBtn").onclick=()=>addInventory();

document.body.addEventListener("click",e=>{
  const actionTarget=e.target.closest("[data-edit-inventory], [data-edit-inventory-group], [data-inventory-details], [data-edit-purchase], [data-edit-sale], [data-edit-watch], [data-edit-seller], [data-edit-customer], [data-show-seller], [data-show-customer], [data-show-purchase], [data-show-sale], [data-delete-inventory], [data-delete-inventory-group], [data-delete-purchase], [data-delete-sale], [data-delete-watch], [data-delete-seller], [data-delete-customer], [data-delete-material], [data-edit-material], [data-delete-template], [data-edit-template], [data-delete-expense], [data-edit-expense]");
  const d=(actionTarget||e.target).dataset;
  if(d.editInventory) addInventory(state.inventory.find(x=>x.id===d.editInventory));
  if(d.editInventoryGroup) editInventoryGroup(d.editInventoryGroup);
  if(d.inventoryDetails) openInventoryDetails(d.inventoryDetails);
  if(d.editPurchase) addPurchase(state.purchases.find(x=>x.id===d.editPurchase));
  if(d.editSale) addSale(state.sales.find(x=>x.id===d.editSale));
  if(d.editWatch) addWatch(state.watchlist.find(x=>x.id===d.editWatch));
  if(d.editSeller) addPartner("seller",state.sellers.find(x=>x.id===d.editSeller));
  if(d.editCustomer) addPartner("customer",state.customers.find(x=>x.id===d.editCustomer));
  if(d.showSeller) showSellerDetails(d.showSeller);
  if(d.showCustomer) showCustomerDetails(d.showCustomer);
  if(d.showPurchase) openOrderDetails("purchase",d.showPurchase);
  if(d.showSale) openOrderDetails("sale",d.showSale);
  if(d.deleteInventory && confirm("Karte wirklich löschen?")) {state.inventory=state.inventory.filter(x=>x.id!==d.deleteInventory);saveState();renderAll();}
  if(d.deleteInventoryGroup) {
    const group=getInventoryGroups().find(g=>g.key===d.deleteInventoryGroup);
    if(group && confirm(`${group.quantity} Karte${group.quantity===1?"":"n"} dieser Position wirklich löschen?`)) {
      const ids=new Set(group.ids);
      state.inventory=state.inventory.filter(x=>!ids.has(x.id));saveState();renderAll();
    }
  }
  if(d.deletePurchase && confirm("Einkauf wirklich löschen? Noch nicht verkaufte zugehörige Karten werden ebenfalls entfernt.")) {
    state.inventory=state.inventory.filter(i=>i.purchaseId!==d.deletePurchase || i.status==="Verkauft");
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
  if(d.deleteExpense && confirm("Ausgabe wirklich löschen?")) {state.expenses=state.expenses.filter(x=>x.id!==d.deleteExpense);saveState();renderAll();}
  if(d.editTemplate) addTemplate(state.materialTemplates.find(x=>x.id===d.editTemplate));
  if(d.deleteTemplate && confirm("Versandvorlage wirklich löschen?")) {state.materialTemplates=state.materialTemplates.filter(x=>x.id!==d.deleteTemplate);saveState();renderAll();}
  if(d.removeUsage) {e.target.closest('[data-usage-row]')?.remove();}
  if(d.deleteImport) removeImport(state.imports.find(x=>x.id===d.deleteImport));
  if(d.removeImportHistory) removeImportHistory(d.removeImportHistory);
});

document.getElementById("saveSettingsBtn").onclick=()=>{
  state.settings={
    feePercent:Number(document.getElementById("settingFee").value||0),
    packaging:Number(document.getElementById("settingPackaging").value||0),
    minProfit:Number(document.getElementById("settingMinProfit").value||0),
    minRoi:Number(document.getElementById("settingMinRoi").value||0),
    priceAgeDays:Number(document.getElementById("settingPriceAge").value||7),
    condition:document.getElementById("settingCondition").value,
    languages:document.getElementById("settingLanguages").value,
    targetStock:Number(document.getElementById("settingTargetStock").value||0),
    safetyPercent:Number(document.getElementById("settingSafetyPercent").value||0)
  };saveState();renderAll();alert("Einstellungen gespeichert.");
};
document.getElementById("resetDemoBtn").onclick=()=>{if(confirm("Alle lokalen Daten unwiderruflich löschen?")){state=structuredClone(defaultState);saveState();renderAll();}};

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
document.addEventListener("click",e=>{
  const type=e.target.dataset.template;
  if(type && GENERIC_TEMPLATES[type]) downloadTextFile(`TCG_${type}_Vorlage.csv`,GENERIC_TEMPLATES[type]);
});

document.getElementById("orderDetailContent").addEventListener("click",e=>{
  const dlg=document.getElementById("orderDetailDialog"); const sale=state.sales.find(s=>s.id===dlg.dataset.saleId); if(!sale)return;
  if(e.target.id==="addSaleMaterialBtn") {const options=state.materials.map(m=>`<option value="${m.id}">${escapeHtml(m.name)} (${Number(m.stock||0)} verfügbar)</option>`).join("");document.getElementById("saleMaterialUsage").insertAdjacentHTML("beforeend",materialUsageRow({},Date.now(),options));}
  if(e.target.id==="applySaleTemplateBtn") {const id=document.getElementById("saleTemplateSelect").value;if(!id)return;applyTemplateToEditor(id);}
  if(e.target.id==="saveSaleAsTemplateBtn") {const name=prompt("Name der neuen Versandvorlage:");if(!name)return;const items=readSaleMaterialRows();state.materialTemplates.push({id:uid(),name,shippingType:document.getElementById("saleShippingType").value,postage:Number(document.getElementById("salePostage").value||0),items:items.map(i=>({materialId:i.materialId,quantity:i.quantity}))});saveState();renderAll();alert("Vorlage gespeichert.");}
  if(e.target.id==="saleWorkflowNext") {
    const stage=sale.workflowStage||"Offen";
    if(stage==="Offen") { sale.status="Bezahlt"; reserveSaleInventory(sale); sale.workflowStage="Kommissioniert"; addMovement({type:"Status",quantity:0,saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:"Bezahlt → Kommissionieren"}); }
    else if(stage==="Kommissioniert") { const boxes=[...document.querySelectorAll("[data-pick-item]")]; sale.pickedItems=boxes.filter(x=>x.checked).map(x=>Number(x.dataset.pickItem)); if(boxes.some(x=>!x.checked)){alert("Bitte alle Karten abhaken.");return;} sale.status="Kommissioniert"; sale.workflowStage="Verpackt"; addMovement({type:"Kommissionierung",quantity:Number(sale.quantity||boxes.length),saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:"Alle Positionen geprüft"}); }
    saveState();renderAll();openOrderDetails("sale",sale.id);
  }
  if(e.target.id==="saveSaleMaterialsBtn") saveSalePacking(sale,false);
  if(e.target.id==="saveAndShipSaleBtn") saveSalePacking(sale,true);
  if(e.target.id==="createDeliveryNoteBtn") printSaleDocument(sale,"delivery");
  if(e.target.id==="createShippingLabelBtn") printSaleDocument(sale,"label");
  if(e.target.id==="saleCompleteBtn") {sale.status="Abgeschlossen";sale.workflowStage="Abgeschlossen";sale.completedDate=todayISO();addMovement({type:"Abschluss",quantity:0,saleId:sale.id,reference:`Bestellung ${sale.orderNo||"-"}`,note:"Ankunft vom Kunden bestätigt"});saveState();renderAll();document.getElementById("orderDetailDialog").close();}
});
document.getElementById("orderDetailContent").addEventListener("input",e=>{if(e.target.matches("[data-material-id],[data-material-qty],#salePostage"))updateSaleMaterialPreview();});
document.getElementById("orderDetailContent").addEventListener("change",e=>{if(e.target.matches("[data-material-id]"))updateSaleMaterialPreview();});
document.getElementById("orderDetailClose").onclick=()=>document.getElementById("orderDetailDialog").close();
document.getElementById("orderDetailCloseBottom").onclick=()=>document.getElementById("orderDetailDialog").close();


const chooseFolderBtn=document.getElementById("chooseSyncFolderBtn");
if(chooseFolderBtn) chooseFolderBtn.onclick=()=>chooseSyncFolder().catch(err=>alert(err.message));
const scanFolderBtn=document.getElementById("scanSyncFolderBtn");
if(scanFolderBtn) scanFolderBtn.onclick=()=>scanSyncFolder(true);
const folderToggle=document.getElementById("autoFolderSyncToggle");
if(folderToggle) folderToggle.onchange=e=>{state.sync.autoFolder=e.target.checked;saveState();startFolderSyncTimer();updateAutomationUi();};
const priceButton=document.getElementById("updateMarketPricesBtn");
if(priceButton) priceButton.onclick=()=>updateOfficialMarketPrices(true).catch(()=>{});
const priceToggle=document.getElementById("autoPriceToggle");
if(priceToggle) priceToggle.onchange=e=>{state.sync.autoPrices=e.target.checked;saveState();updateAutomationUi();};

const purchaseImportDateField = document.getElementById("purchaseImportDate");
if (purchaseImportDateField && !purchaseImportDateField.value) purchaseImportDateField.value = todayISO();

showView("dashboard");
initAutomation();

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
