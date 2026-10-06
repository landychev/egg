# Egg Catch – speldesigndokument

Version: 0.5  
Datum: 2026-10-03  
Status: Arbetsunderlag inför prototyp  
Underlag: ”Egg Catch – Uppgift 1: Spelidé”, Aleksei Landychev, 2026-09-26, PowerPointen `Egg_Catch_final.pptx` (12 bilder inklusive talaranteckningar) samt designdiskussion 2026-10-03.

## 1. Dokumentets syfte och status

Det här dokumentet är projektets gemensamma referens för vad Egg Catch ska vara, hur spelet ska fungera och vad vi behöver undersöka innan vi bygger vidare. Vid ändringar uppdaterar vi dokumentet så att design och implementation följer samma regler.

- **Grunddesign** återger spelidén i underlaget.
- **Designbeslut** är avgöranden som fattats efter underlaget (se avsnitt 4). De gäller tills de uttryckligen ändras.
- **Prototypförslag** fyller luckor eller avgränsar den första versionen. De är arbetsförslag, inte fattade beslut.
- **Öppna frågor** behöver avgöras genom designbeslut eller speltest.

Underlagets inspelningsmanus och instruktioner om att fylla i AI-användning ingår inte i spelets krav. PowerPointens talaranteckningar används som källa till designförtydliganden, inte som instruktioner för arbetet. Presentationen använder namnet **Egg Catcher**, medan det tidigare underlaget och detta dokument använder **Egg Catch**. Slutligt namn återstår att fastställa. Påståenden om kursplan och teori återges här som bakgrund från underlaget och är inte källgranskade i detta dokument.

## 2. Spelet i en mening

Egg Catch är ett pedagogiskt tvåknappsspel där barn hjälper en varg att fånga och sortera rullande ägg genom att tolka tal eller enkla matematiska uttryck och välja rätt korg.

## 3. Målgrupp och pedagogiskt syfte

**Primär målgrupp:** barn 7–9 år, årskurs 1–3.  
**Användning:** kort repetition i klassrummet eller hemma.  
**Önskad omgångslängd:** ungefär 1–2 minuter.

Spelet ska befästa kunskap som barnet redan har mött i undervisningen. Det ska inte ersätta en genomgång av matematiska begrepp.

### Innehåll att träna

| Område | Exempel på ägg | Regel eller kategorier |
| --- | --- | --- |
| Jämna och udda tal | `7`, `8` | JÄMNT / UDDA |
| Jämförelse av tal | `4`, `12` | Mindre än en gräns / minst gränsen |
| Enkel addition, resultat inom 0–20 | `3 + 4`, `6 + 5` | `< 10` / `≥ 10` |
| Multiplar av 2 och 3 | `3`, `5`, `9`, `12` | Fånga bara tal som uppfyller regeln |

Varje uppgift måste ha exakt ett korrekt val. Vid gränsvärden ska kategorierna tillsammans täcka alla möjliga svar: resultatet 10 hör exempelvis till `≥ 10`.

Uppmärksamhet, reaktion, arbetsminne och mönsterigenkänning är tänkta sekundära träningsområden. Dessa effekter ska inte betraktas som visade av prototypen.

## 4. Designprinciper och designbeslut

### Designprinciper

1. **Beslutet är kärnan, fångsten är kvittot.** Känslan ska vara ”jag kom på vilken korg ägget hör till”, inte ”jag hann fånga ägget”. Fångsten är belöningen som gör beslutet roligt. Det får tre konsekvenser:
   - Ingen belöning för snabbhet. Ett rätt svar tidigt i färden ger samma utfall som ett rätt svar sent.
   - Rätt val leder alltid till en lyckad fångst. Vargen rör sig automatiskt som svar på barnets val. Barnet ska aldrig uppleva ”jag valde rätt men vargen missade”.
   - Manuell förflyttning av vargen, val av ränna och exakt fångsttiming ingår inte i designen.
2. **Så få saker som möjligt att hålla reda på.** Två spelknappar och ett ägg i taget. Två knappar garanterar inte att uppmärksamheten går till talet, men de tar bort konkurrensen om den. Rörelse, animationer och markering måste också vara begripliga.
3. **Matematiken styr handlingen.** Talet eller uttrycket finns på ägget; spelet avbryts inte av en separat frågeruta.
4. **Tydlig återkoppling.** Barnet ska direkt förstå om valet var rätt och, i träning, få hjälp att förstå varför.
5. **Trygg träning före tidspress.** Träningsläget har ingen tidsgräns och inget game over. Tidspressen hör till utmaningen.
6. **Läsbarhet före dekoration.** Stora siffror, tydliga symboler, stark kontrast och lite text.
7. **En svårighet höjs i taget.** Tempo, antal ägg och matematikinnehåll ökas var för sig. Vid nytt innehåll återgår spelet till långsamt tempo och ett ägg åt gången, så att barnet får möta det nya innehållet med mindre tidspress och färre samtidiga uppgifter.
8. **Personlig utveckling.** Rekord och kombo ska uppmuntra barnet att förbättra sitt eget resultat.

### Designbeslut 2026-10-03

- Ingen tidsbonus. Kombo räknar rätta svar i följd.
- Vargen genomför fångsten automatiskt efter spelarens val.
- Första prototypen visar ett enda ägg åt gången, med slumpad ränna.
- Träning och utmaning kan använda samma starthastighet. I träning stannar ägget vid slutet av rännan och väntar på svar; i utmaning räknas ett obesvarat ägg som en miss. Hastigheten är ett testvärde.
- Efter fel i träning följer ett bestämt förlopp: förklaring, samma tal tills barnet svarar rätt, därefter ett bekräftelseägg med ett nytt tal av samma slag, sedan blandade uppgifter (avsnitt 6).
- Nytt matematikinnehåll börjar alltid i långsamt tempo och med ett ägg åt gången, även om föregående nivå haft flera samtidiga ägg.
- Resultatet skiljer på rätt svar, fel korg och uteblivna svar, i loggen och på resultatskärmen.
- Korgarnas kategorier visas med ord och prickbilder i introduktionen och i förklaringar. Under spel visas bara orden. Regeln ska också kunna höras.
- Vid felval spricker ägget på golvet och rätt korg markeras samtidigt.
- Kombo, liv och nivåer är **stöd runt kärnmekaniken**: de påverkar motivation och frustration och är mer än dekoration, men de kan vänta tills grundloopen är testad.

## 5. Spelvärld och grundloop

Uttrycket är inspirerat av äldre handhållna LCD-spel av typen Game & Watch. PowerPointen nämner särskilt **Nu, pogodi!** som förebild för vargen och äggen som rullar längs rännorna. En varg står längst ner på skärmen. Ägg rullar längs fyra rännor och bär ett tal eller ett uttryck.

I grundläget har vargen två korgar:

- Vänster: **JÄMNT**.
- Höger: **UDDA**.

Grundloopen är:

**Se ägget → tolka innehållet → välj knapp → vargen fångar eller ägget spricker → få återkoppling → möt nästa ägg.**

I utmaningsläget tillkommer poäng och kombo. Underlaget uppskattar ungefär 1–2 sekunder per beslut och cirka 40 beslut per omgång. Detta är riktmärken att testa, inte fasta tidskrav. Ett barn som fortfarande läser `6 + 5` med fingret kan behöva betydligt längre tid.

### Styrning och vilket ägg ett tryck gäller

**Designbeslut:** i första prototypen finns ett enda ägg på skärmen i taget. Rännan slumpas, så att de fyra rännorna ger visuell variation utan att skapa ett extra beslut. Ett knapptryck gäller alltid det ägg som visas.

- Vänster och höger knapp väljer kategori. I filterläget betyder vänster fånga och höger låt passera.
- Ett val accepteras under hela äggets färd och låses vid första tryck. Vargen flyttar korgen automatiskt och resultatet animeras direkt.
- Ett ägg bedöms exakt en gång. Att hålla en knapp nedtryckt besvarar inte kommande ägg.
- Om inget val görs innan ägget når slutet: i utmaning räknas det som uteblivet svar; i träning stannar ägget och väntar.

**Senare steg:** när flera samtidiga ägg införs behöver en tydlig turordning bestämmas, exempelvis att ägget närmast slutet är aktivt och markeras. Spelaren ska aldrig behöva gissa vilket ägg ett tryck gäller.

## 6. Spellägen

| Egenskap | Träningsläge | Utmaningsläge |
| --- | --- | --- |
| Syfte | Befästa regeln med stöd | Träna flyt och förbättra eget resultat |
| Färdtid | Samma starthastighet som utmaningen. Ägget stannar vid slutet och väntar på svar | Samma starthastighet, ökar med nivån. Ett obesvarat ägg vid slutet är en miss |
| Liv och game over | Inga liv, inget game over | Tre missar avslutar omgången |
| Vid fel | Inga poäng- eller livstraff, men alltid förklaring och nytt försök (se förlopp nedan) | Kort, tydlig rättelse: rätt korg markeras |
| Poäng | Nej | Ja |
| Kombo och rekord | Nej | Ja |

Samma spelhandling och samma starthastighet används i båda lägena. Det enda som skiljer vid rännans slut är om ägget väntar eller räknas som miss. Det gör löftet om träning i egen takt konkret, och hastigheten förblir ett testvärde.

### Förlopp efter fel i träning

1. Ägget spricker, rätt korg markeras.
2. En kort förklaring visas med bildstöd. Exempel vid `7`: **”7 är udda. Tre par och en ensam.”** Prickbilden visar tre par och en ensam prick.
3. Samma tal kommer igen tills barnet svarar rätt. Vid nytt fel visas förklaringen igen.
4. Därefter kommer ett **bekräftelseägg**: ett nytt tal med samma egenskap, exempelvis `11`, utan färdig förklaringsbild. Det ger en första indikation på om barnet kan använda förklaringen på ett nytt tal.
5. Vid fel på bekräftelseägget används samma stöd igen: förklaring, samma tal tills rätt.
6. Därefter återgår spelet till vanliga, blandade uppgifter. Barnet kan ha upprepat samma knapp, så blandade uppgifter behövs för att se om regeln sitter.

Hjälpta omförsök i träning är inte resultat och ska inte blandas in i utmaningens resultatskärm (avsnitt 10).

Barnet väljer själv när nästa ägg får börja efter en förklaring. Själva uppgiften ligger fortfarande på ägget och ersätts inte av en frågeruta.

Exempel på återkoppling i utmaning: **”7 är UDDA.”** Rätt korg markeras medan ägget spricker.

Utmaningen är valbar när barnet känner sig säkert på regeln. Utmaningsomgången avslutas efter tre missar; målet 1–2 minuter är ett önskat utfall av balanseringen, inte en tidsgräns. Träning ska kunna avslutas av spelaren när som helst.

## 7. Rätt svar, missar och filterläge

### Sorteringsläge

| Händelse | Utfall | Registreras som |
| --- | --- | --- |
| Ägget sorteras i rätt korg | Rätt svar | Rätt |
| Ägget sorteras i fel korg | En miss | Fel korg |
| Ägget når slutet utan svar (utmaning) | En miss | Utan svar |

Fel korg och uteblivet svar kostar båda ett liv i utmaningen men registreras separat. Barnet kan ha räknat fel eller bara behövt mer tid, och de två orsakerna ska gå att skilja åt i analysen. Ordvalet ”utan svar” är medvetet: ”hann inte” tolkar orsaken åt barnet, medan ett uteblivet svar också kan bero på osäkerhet eller distraktion.

Vid felval spricker ägget på golvet och rätt korg markeras samtidigt, så att barnet förstår varför fångsten misslyckades.

### Filterläge

Från nivå 5 är tanken att ersätta de två kategorierna med en regel, exempelvis **”FÅNGA BARA TAL DELBARA MED 3”**.

- Vänster knapp: **FÅNGA**.
- Höger knapp: **LÅT PASSERA**.

Att låta ett ägg passera ska vara ett aktivt beslut. Därför behöver filterläget skilja mellan ett korrekt passerat ägg och ett uteblivet svar.

**Grunddesign enligt PowerPointens talaranteckningar till bild 6:** rätt fångst eller korrekt val att låta passera räknas som rätt svar. Fel val räknas som en miss; i utmaning räknas även inget svar i tid som en miss. Tabellen preciserar utfallen i utmaning. I träning stannar ett obesvarat ägg vid slutet och väntar på ett aktivt val, även i filterläget. Felval i träning ger stöd och nytt försök utan livs- eller poängstraff:

| Ägget uppfyller regeln | Val | Utfall |
| --- | --- | --- |
| Ja | Fånga | Rätt svar |
| Ja | Låt passera | En miss (fel val) |
| Nej | Fånga | En miss (fel val) |
| Nej | Låt passera | Rätt svar |
| Ja eller nej | Inget svar före slutet (utmaning) | En miss (utan svar) |

Exempel för multiplar av 3: fånga `3`, `9` och `12`; välj låt passera för `5` och `8`.

Den generella formuleringen i underlaget att ett ofångat ägg alltid är en miss gäller alltså sorteringsläget. Den kan inte tillämpas på ett korrekt aktivt val att låta passera i filterläget.

### Gissning

Vid slumpmässiga val mellan två alternativ med exakt ett korrekt svar är sannolikheten för rätt svar 50 %, vilket PowerPointen lyfter som en risk. En kort omgång kan inte säkert skilja gissning från förståelse: slumpmässiga fel kan bero på stress, och ett mönster kan uppstå av en tillfällighet. Resultatet ska därför presenteras som samtalsunderlag, inte som diagnos (avsnitt 10). Vi behöver testa om poäng och kombo speglar kunskap eller främst tempo och gissning.

## 8. Progression

Grunddesignens progression för utmaningsläget:

| Nivå | Innehåll | Ny utmaning |
| --- | --- | --- |
| 1 | Jämnt / udda | Långsamt tempo |
| 2 | Jämnt / udda | Högre tempo |
| 3 | Jämnt / udda | Flera ägg samtidigt |
| 4 | Additioner med resultat inom 0–20 | Sortera i `< 10` / `≥ 10`. Långsamt tempo och ett ägg åt gången |
| 5 och vidare | Filterregel, exempelvis multiplar av 3 | Välj fånga eller låt passera. Långsamt tempo och ett ägg åt gången |

**Designbeslut:** en svårighet höjs i taget: tempo, antal ägg eller matematikinnehåll. Vid nytt innehåll återgår spelet till långsamt tempo och ett ägg åt gången, även om föregående nivå haft flera samtidiga ägg. Först därefter kan tempo eller antal ägg ökas var för sig.

**Grunddesign enligt PowerPointen, bilder 5–6:** spelet pausar vid övergången till filterläge, visar den nya regeln och knappbetydelsen och låter barnet göra ett provförsök innan äggen börjar rulla igen.

**Prototypförslag:** låt regelbytet ske mellan äggvågor och avsluta först ägg som använder den gamla regeln. Inget ägg ska byta bedömningsregel under färden. Bestäm hur många provförsök barnet får, vilket stöd som visas och om försöken påverkar liv eller poäng innan övergången implementeras.

Följande är ännu inte bestämt:

- Hur många rätta svar som krävs för nästa nivå.
- Exakta hastigheter och intervall mellan ägg.
- Hur många samtidiga ägg som är rimligt.
- Vilka regler som följer efter nivå 5.
- Om lärare eller spelare ska kunna välja innehåll direkt.

## 9. Poäng, kombo och rekord

Kombo, liv och nivåer är stöd runt kärnmekaniken. Här skiljs **regel** (princip som gäller) från **startvärde** (inställning att justera i speltest).

| Regel | Startvärde i första prototypen |
| --- | --- |
| Ett rätt svar ger poäng | 1 poäng |
| Ett rätt svar ökar kombon (komboräknaren) | +1 |
| Kombo ger extra poäng (bonusen, grunddesign bild 4) | Bonusmodell ännu inte bestämd: när den börjar, hur stor den är och hur den visas. 0 i första prototypen |
| En miss ger 0 poäng, nollställer kombon och förbrukar ett liv | 3 liv |
| Ingen tidsbonus. Rätt svar tidigt och sent i färden ger samma utfall | – |
| Ett korrekt aktivt val att låta passera ger samma belöning som en korrekt fångst | – |
| Kombon visas för spelaren | Exempelvis **”12 rätt i rad!”** |
| Rekord sparas lokalt på enheten och uppdateras efter avslutad omgång | – |
| Träningsläget saknar poäng, kombo och liv | – |

Komboräknaren är beslutad; bonusen är det som återstår att besluta. Underlagen definierar ingen formel för den. Speltest ska undersöka om en bonus förbättrar motivationen utan att göra resultatet svårbegripligt. Poäng är spelresultat och ska inte presenteras som ett betyg på barnets matematikkunskaper.

## 10. Skärmar och återkoppling

**Prototypförslag för minsta nödvändiga flöde:**

1. **Start:** välj träning eller utmaning.
2. **Introduktion:** målet visas: **”Nu tränar vi jämna och udda tal.”** Korgarna visar ord och prickbild: två par på den jämna korgen, två par och en ensam prick på den udda. Vargen demonstrerar ett exempel medan en kort, förinspelad regel läses upp och kopplar jämnt till vänster och udda till höger. En knapp, **”Lyssna igen”**, spelar upp regeln på nytt i introduktionen. Därefter får barnet prova själv.
3. **Spel:** fyra rännor, varg, ett ägg, aktuell regel och två stora knappar. Korgarna visar bara orden; prickbilderna visas inte under spel, eftersom uppgiften annars blir att leta efter den ensamma pricken.
4. **Återkoppling:** rätt visas med symbol och rörelse, inte bara färg. Vid fel spricker ägget och rätt korg markeras. I träning följer förklaringen med prickbild.
5. **Resultat i utmaning:** poäng, bästa kombo, personligt rekord och spela igen, samt tre räkneverk: **”14 rätt · 2 fel korg · 1 utan svar”**. Räkneverken gäller endast utmaningsomgången; träningens hjälpta omförsök räknas inte in.

### Resultatet som samtalsunderlag

Utmaningens resultatskärm listar de tal barnet inte klarade, med utfall som visar om barnet valde fel korg eller lämnade ägget utan svar:

- ”13: valde jämnt.”
- ”17: utan svar.”

Listan ska ge underlag för ett samtal med lärare eller förälder, inte en bedömning. Ett barn som chansar missar slumpmässigt; ett barn som inte förstått regeln missar oftare systematiskt, men en kort omgång räcker inte för att avgöra vilket. Som senare steg föreslås en knapp **”Prova dessa tal i lugn takt”** som startar träning med just de talen. Klarar barnet dem då finns bättre stöd för att tempot spelade roll.

Utmaningsläget visar dessutom återstående liv och nivå. Paus och avslut ska vara lätta att hitta; de två huvudknapparna avser själva spelhandlingen.

### Läsbarhet och tillgänglighet

- Tal och uttryck ska gå att läsa under hela färden.
- Korgar och knappar ska ha tydliga etiketter eller symboler.
- Färg får inte vara den enda signalen för rätt och fel.
- Förklaringar ska vara korta och kompletteras med bildstöd.
- Regeln ska kunna höras. Första prototypen har en kort, förinspelad regel i introduktionen och en knapp för att lyssna igen. Uppläsning vid regelbyte tillkommer när nya uppgiftstyper och filterläget införs; mer omfattande uppläst återkoppling är ett senare steg.
- Träningsläget ska alltid vara ett tillgängligt alternativ till tidspress.
- Surfplatta är en tänkt användningsmiljö. Tekniskt plattformsval och exakt tangentbordsstyrning är öppna frågor.

## 11. Omfattning för första spelbara prototypen

Detta är en föreslagen avgränsning, inte en ändring av den långsiktiga spelidén.

### Ingår

- Varg, fyra rännor och två kategorikorgar.
- Ett ägg på skärmen åt gången, slumpad ränna.
- Jämna och udda heltal inom 0–20. Noll räknas som jämnt.
- Två stora spelknappar. Vargen fångar automatiskt efter valet.
- Introduktion med ord, prickbilder, demonstration och en kort, förinspelad regel. Knappen ”Lyssna igen” upprepar regeln.
- Träningsläge: ägget väntar vid slutet, förlopp efter fel med samma tal tills rätt och bekräftelseägg, inget game over, ingen resultatskärm med räkneverk.
- Utmaningsläge med tre liv, poäng, kombo och lokalt rekord. Ingen tidsbonus.
- En enkel tempoökning inom jämnt/udda för att testa nivå 1–2.
- Resultatskärm med tre räkneverk och lista över missade tal.
- Start, paus, avslut och omstart.

### Senare steg

1. ”Prova dessa tal i lugn takt” från resultatskärmen.
2. Flera samtidiga ägg, efter att markering av aktivt ägg har testats.
3. Addition och jämförelsekategorier.
4. Filterläge och tydliga regelbyten.
5. Uppläsning vid regelbyte, mer omfattande uppläst återkoppling och adaptiv hastighet.
6. Eventuellt innehållsval för lärare och andra ämnesområden.

Klassrekord, sociala funktioner, konton och språklektioner ingår inte i prototypförslaget. Underlaget nämner sociala inslag och andra ämnen som möjliga framtida riktningar.

## 12. När prototypen är redo att speltestas

- [ ] Varje ägg har exakt ett korrekt svar enligt den synliga regeln.
- [ ] Det finns ett ägg på skärmen och det är uppenbart att trycket gäller det.
- [ ] Ett ägg bedöms högst en gång och kan inte kosta flera liv.
- [ ] Rätt val ger alltid en lyckad fångst, oavsett när i färden trycket sker.
- [ ] Vid felval spricker ägget och rätt korg markeras samtidigt.
- [ ] Fel korg och uteblivet svar ger vardera en miss i utmaning och registreras separat.
- [ ] Tredje missen avslutar utmaningsomgången.
- [ ] I träning stannar ägget vid slutet och väntar.
- [ ] Efter fel i träning kommer förklaring, samma tal tills rätt, ett bekräftelseägg och sedan blandade uppgifter, utan liv eller poäng.
- [ ] Träning och utmaning startar i samma hastighet, och hastigheten går att ändra som testvärde.
- [ ] Prickbilder syns i introduktion och förklaring, inte på korgarna under spel.
- [ ] Introduktionen spelar upp den förinspelade regeln och kopplar jämnt till vänster och udda till höger. ”Lyssna igen” spelar upp regeln på nytt.
- [ ] Kombo ökar vid rätt svar och nollställs vid miss. Ingen tidsbonus finns.
- [ ] Utmaningens resultatskärm visar rätt, fel korg och utan svar var för sig samt vilka tal som missades och med vilket utfall. Träningens omförsök ingår inte.
- [ ] Omstart återställer omgången men behåller rekordet.
- [ ] Paus stoppar äggets rörelse och svarstid.
- [ ] Siffror, knappar och regler är läsbara på den valda testenheten.

## 13. Pedagogisk bakgrund och motivation

Underlaget kopplar innehållet till matematik i årskurs 1–3 enligt Lgr22. Vid användning i en kursinlämning behöver hänvisningen kompletteras med exakt källa och relevanta avsnitt.

Den pedagogiska avsikten är att låta upprepad klassificering och omedelbar återkoppling stödja befästande och flyt. Tidspress är en designhypotes som behöver prövas: ett snabbt svar kan bero på kunskap, gissning eller motorisk vana. Träningen ska därför ge utrymme för förståelse och förklaring.

### Hur det pedagogiska syftet blir synligt

Det ska synas i spelarens upplevelse, utöver att det står siffror på äggen, på tre nivåer:

| För vem | Vad som gör lärandet synligt |
| --- | --- |
| **Barnet** | Ett tydligt mål (”Nu tränar vi jämna och udda tal”). Regeln syns hela tiden. Återkoppling som förklarar varför, med prickbild. En chans att använda förklaringen direkt. |
| **Läraren eller föräldern** | Resultat med rätt, fel korg och utan svar åtskilda samt vilka tal som missades, som underlag för ett samtal. |
| **Vi som utformar och testar** | Bekräftelseägget: kan barnet använda förklaringen på ett nytt tal? Det ger något konkret att observera utan att göra poängen till ett kunskapsmått. |

Poäng och kombo kan göra utmaningen rolig men säger inte ensamma om barnet förstått regeln. Ett möjligt speltest är därför att ibland låta barnet förklara ett val i lugn takt.

### Octalysis

![Egg Catch – motivation genom Octalysis](Egg_Catch_Octalysis_v2.png)

*Figur 1. Egen tillämpning av Yu-kai Chous Octalysis på Egg Catch. Grönt markerar White Hat (2 och 3), gult Black Hat (7 och 8). Grått betyder att drivkraften inte står i fokus i figuren, inte att den saknar möjliga kopplingar till spelet. Figuren är en designanalys, inte en mätning av motivation eller lärande.*

I figurens tillämpning kopplas rätt sortering, nivåer och personligt rekord till 2 (utveckling). Kedjekombo och dynamisk återkoppling genom vargens fångst kopplas till 3 (kreativitet och återkoppling). Dessa tekniker innebär inte i sig att spelet erbjuder stor kreativ frihet. Variation i tal och ränna kopplas till 7 (nyfikenhet) som en hypotes att pröva i speltest. Tre liv och risken att bryta kombon kopplas till 8 (förlust). Samma mekanik kan beröra flera drivkrafter: att bygga en kombo och att riskera att förlora den betonar olika delar av upplevelsen.

Äggets färd som tidsgräns i utmaningen kan analyseras under 6 (knapphet), med koppling till tekniken *Count Down Timer*, men ingår inte i figurens fyra fokusområden. Ägande (4) har inte lyfts fram eftersom prototypen saknar en beslutad mekanik för en personlig eller anpassningsbar varg.

Källa till ramverket: Yu-kai Chou, [The Octalysis Framework: 8 Core Drives of Gamification](https://yukaichou.com/gamification-examples/octalysis-gamification-framework/) (länk kontrollerad 2026-10-03).

Underlaget använder Yu-kai Chous Octalysis som teoretisk utgångspunkt:

| Motivationskraft i underlaget | Tänkt uttryck i spelet |
| --- | --- |
| Development & Accomplishment | Synliga nivåer, kombo och personlig förbättring |
| Empowerment of Creativity & Feedback | Omedelbar återkoppling på spelarens val |
| Unpredictability & Curiosity | Variation i kommande tal och senare regler |
| Loss & Avoidance | Tre liv och tidspress i utmaningsläget |

Detta är underlagets tolkning av teorin. En kort återkopplingsloop visar inte i sig att spelet erbjuder kreativitet eller meningsfulla strategiska val. Den kopplingen behöver motiveras när teoridelen utvecklas.

Praktisk konsekvens för designen: låt trygg träning och personlig utveckling bära upplevelsen; använd förlustrisk och tempo varsamt i utmaningsläget. Spelets faktiska lärandeeffekt är ännu inte undersökt.

### White Hat och Black Hat

PowerPointens bild 10 beskriver utveckling och kontroll som White Hat: trygg träning, nya försök utan förlust och synliga framsteg. Black Hat omfattar osäkerhet och förlust, med oväntade tal och tre liv i utmaningen. Båda spellägena blandar drivkrafter. Träningen ska betona trygghet och kontroll, och pressen i utmaningen behöver begränsas för målgruppen.

Presentationens bild 9 lyfter främst drivkrafterna 2 (utveckling), 3 (kreativitet och återkoppling) och 7 (nyfikenhet). Drivkraft 8 (förlust) diskuteras därefter för utmaningsläget. Presentationen betonar att den kreativa friheten är begränsad i tvåknappsformatet. Den hänvisar till Chous *Actionable Gamification*, men saknar fullständig bibliografisk referens.

### AI:s roll i designarbetet

Enligt PowerPointens bild 8 och talaranteckningar använde Aleksei Landychev ChatGPT som bollplank. Hans ursprungliga idé var en varg som fångar ägg med två knappar. AI föreslog tal och uttryck på äggen, filterläge, träning utan game over och möjliga kopplingar till Octalysis. Konceptbilderna i presentationen är märkta som AI-genererade.

Designerns val var två korgar som start, filterläge först på nivå 5, två spellägen och tydliga regler för missar. Designbesluten 2026-10-03 togs i en designdiskussion med Claude som bollplank; designern ansvarar för att bedöma förslagen utifrån målgruppen. Denna redovisning beskriver designens tillkomst och innebär inget krav på generativ AI i själva spelet.

## 14. Risker och speltest

| Risk eller osäkerhet | Vad vi behöver observera |
| --- | --- |
| Barnet chansar eller upprepar samma knapp | Kan barnet förklara regeln och sina val även utan tidspress? Klarar barnet de blandade uppgifterna efter bekräftelseägget? |
| Tempot mäter motorik mer än matematik | Klarar barnet samma uppgifter i träning, där ägget väntar? |
| Förklaringen är för svår att läsa | Uppfattar barnet återkopplingen och använder den på bekräftelseägget? |
| Flera ägg gör styrningen oklar (senare steg) | Kan barnet peka ut vilket ägg som är aktivt? |
| Regelbyten orsakar fel av vana | Förstår barnet den nya regeln och knappbetydelsen innan nästa ägg? |
| Tre liv skapar frustration | Vill barnet försöka igen eller välja träning? |
| Omgången blir för kort eller lång | Hur nära ligger verklig speltid målet 1–2 minuter? |
| Fångstanimationen stjäl uppmärksamhet från talet | Hinner barnet läsa nästa ägg efter en fångst? |

Börja med att testa om barn 7–9 år förstår grundregeln, knapparna och återkopplingen. Justera först därefter tempo och progression. Observera rätta svar, fel korg och uteblivna svar separat så att de inte blandas ihop i analysen.

## 15. Beslut att ta härnäst

1. Välj plattform och inmatning för första speltestet.
2. Bestäm startvärden för färdtid i träning och utmaning samt nivågräns.
3. Bestäm om och hur kombobonusen införs.
4. Bestäm den exakta formuleringen och spela in introduktionens korta regel.
5. Bestäm antal provförsök och stöd vid regelbyte innan filterläget implementeras.
6. Testa grundloopen innan fler uppgiftstyper införs.

## 16. Ändringslogg

| Datum | Version | Ändring |
| --- | --- | --- |
| 2026-10-03 | 0.5 | Lagt till egen Octalysis-figur i avsnitt 13. Kedjekombo kopplas till 3; White Hat och Black Hat har konsekventa färger. Nyfikenhet kvarstår som hypotes, förlust avser liv och bruten kombo, och tidsgränsens koppling till 6 förklaras i text. Källänk kontrollerad. |
| 2026-10-03 | 0.4 | Förtydligat filterlägets väntan i träning och tidsgräns i utmaning. Nytt innehåll börjar långsamt med ett ägg åt gången; en svårighet höjs i taget. Förinspelad regel och ”Lyssna igen” ingår i prototypens introduktion och testkriterier. Resultatexemplet följer trelivsregeln. Bekräftelseägget beskrivs som en första indikation. Omfattning och återstående beslut har anpassats. |
| 2026-10-03 | 0.3 | Designbeslut från designdiskussion: beslutet är kärnan och fångsten kvittot; ingen tidsbonus; vargen fångar automatiskt; ett ägg åt gången; ägget väntar i träning; förlopp efter fel med samma tal och bekräftelseägg; en svårighet i taget och långsamt tempo vid nytt innehåll; rätt/fel korg/utan svar åtskilda; prickbilder i introduktion och förklaring men inte under spel; rätt korg markeras vid felval. Regel och startvärde separerade i poängmodellen. Tre nivåer av synligt lärande. Dörren stängd för manuell förflyttning, val av ränna och exakt fångsttiming. |
| 2026-10-03 | 0.2 | Jämfört med PowerPointens 12 bilder och talaranteckningar. Kompletterat nytt försök i träning, paus och provförsök vid regelbyte, kombobonus, inspirationskälla, namnfråga samt bakgrund om White Hat/Black Hat och AI:s roll. Filterbedömningen är bekräftad i presentationen. |
| 2026-10-03 | 0.1 | Sammanställt grunddesignen, markerat öppna frågor och föreslagit prototypomfattning samt fullständiga bedömningsregler. |
