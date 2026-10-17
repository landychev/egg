# Egg Catcher – detaljerade uppgifter för punkt 3

Datum: 2026-10-07

Status 2026-10-17: Spelplanen är implementerad, publicerad som `996e751` och visuellt kontrollerad mot den publika adressen på dator-, surfplatte- och mobilytor. Deluppgifterna är avprickade; prov på riktiga surfplattor görs i uppgift 10. Se [VERIFIERING-03.md](VERIFIERING-03.md).

Huvuduppgift: [03. Skapa spelplanen och den första grafiken i UPPGIFTER.md](UPPGIFTER.md#03-skapa-spelplanen-och-den-första-grafiken)

Underlag: [SPELDESIGN.md](SPELDESIGN.md), version 0.5, [TEKNIKVAL.md](TEKNIKVAL.md) och den implementerade regelkärnan i [detaljerade-uppgifter-2.md](detaljerade-uppgifter-2.md).

## Mål och omfattning

Punkt 3 ger en synlig spelplan med en varg, fyra rännor, två korgar, ett ägg med tydligt tal, två stora kategoriknappar och den aktuella regeln. Spelplanen ska gå att granska på dator och surfplatta. Grafiken är enkel prototypgrafik som kan bytas ut senare.

**Efter implementationen ska sidan visa spelplanen i stället för den nuvarande cirkeln och starttexten.** Ett stillastående exempelägg visar hur uppgiften kommer att se ut. Korgar och knappar är märkta JÄMNT till vänster och UDDA till höger. Sidan beskriver detta som en förhandsvisning av spelplanen.

Rullande ägg, spelarens svar, automatisk fångst, sprickanimationer och nästa ägg kopplas ihop i huvuduppgift 4. Punkt 3 förbereder de visuella delarna och deras placering. Knapparna kan visas i sina olika utseenden vid utvecklingskontroll, men besvarar ännu inga ägg.

Arbetsflödet är:

**Välj testytor → planera layout → skapa scen och grafik → sätt ihop förhandsvisningen → kontrollera läsbarhet och storleksanpassning.**

Detta är en arbetsplan. Ingen deluppgift är genomförd genom att dokumentet skrivs. Kryssa i en deluppgift först när dess färdigkriterium har kontrollerats. Namn på nya filer och funktioner är förslag; befintliga regelfunktioner anges med sina faktiska namn.

### Principer för hela punkt 3

- **Talet och de två valen ska vara lätta att upptäcka.** Dekoration får inte skymma ägget, regeln eller kategorierna.
- **Reglerna kommer från punkt 2.** Använd `CATEGORY_WORDS`, `categoryForChoice`, `choiceForCategory` och `GAME_SETTINGS`. Ingen grafikfunktion ska själv beräkna jämnt eller udda.
- **Rännan är oberoende av rätt svar.** Alla tal kan komma från alla fyra rännor. Rännans sida får inte framställas som en anvisning om vilken korg som är rätt.
- **Under spel används ord på korgarna.** Prickbilder hör till introduktion och förklaringar i huvuduppgift 5 och 7. Äggets färg eller form ska inte avslöja kategorin.
- **Layout och spelregler hålls åtskilda.** Visuella mått, färger och textstilar får en egen plats. `src/logic/` förblir utan Phaser-beroende.
- **Bedömningen kräver ingen fysisk kollision.** Placering och kommande animation ska stödja att varje rätt val ger fångst, oavsett ränna eller svarstid.
- **Kontrollera varje del när den byggs.** Visuella kontroller dokumenteras. Automatiska kontroller används där de kan upptäcka konkreta fel, exempelvis saknade rännor eller ogiltiga positionsdata.

## Bildstil och krav på grafiken

Det här avsnittet preciserar hur prototypgrafiken bör se ut. Det är en gemensam utgångspunkt för implementation och eventuell bildframtagning. Exakta nyanser och detaljer prövas mot den färdiga layouten. Med grafik menas både former som ritas direkt i Phaser och separata bildfiler.

### Gemensamt bildspråk

Utgå från **vänlig, tecknad 2D-grafik för barn 7–9 år**, med rundade former, tydliga silhuetter och mörka konturer. Vargen får ha personlighet, medan bakgrund och föremål hålls enkla. De äldre handhållna spelens tydliga uppställning med fyra rännor ger inspiration till kompositionen.

Alla delar ska se ut att höra till samma bildvärld: liknande konturtjocklek, förenklad detaljnivå, färgmättnad och skuggning. Använd en tydlig vy framifrån eller lätt från sidan. Korgöppningar och rännor kan visas lätt uppifrån när det gör deras funktion begripligare.

Låt talet på ägget och de två valen vara mest framträdande. Vargen kommer därefter; bakgrunden ska vara lugnast. Utgå från spelets gröna bakgrund, varmvit äggyta, grå varg och varma bruna trä- och korgfärger. Kontrollera färgerna i verklig visningsstorlek, där ljusa och mörka ytor fortfarande måste gå att skilja åt.

### Hur varje del bör se ut

| Del | Önskat utseende | Viktigt vid framtagning |
| --- | --- | --- |
| Bakgrund och mark | Dämpad grön ton och en enkel markyta som förankrar vargen. Sparsam, lågmäld dekoration. | Lämna lugna ytor bakom äggets färd, regeln och knapparna. Föremål som ska flyttas eller uppdateras ska inte ingå i bakgrundsbilden. |
| Varg | Vänlig grå figur med tydliga öron, lång nos, ljus nos- och magyta samt synlig svans. Ett lugnt, uppmärksamt ansiktsuttryck och lätt böjda armar. | Silhuetten ska gå att känna igen även när figuren visas liten. Rita en neutral pose för punkt 3. Korgar och kategoriord ska vara separata från vargbilden. |
| Rännor | Enkla trärännor med tydlig ovansida och kant, lutade inåt mot spelvärlden. Samma material och formspråk på alla fyra. | Äggets bana ska gå att följa. Håll dekorativa detaljer borta från talets läsyta. Vänster och höger rännor får speglas; de visar ingen matematisk kategori. |
| Korgar | Två likvärdiga korgar i varm brun ton, med tydlig öppning och ett fåtal linjer som antyder flätning. En lugn yta för etiketten. | Båda ska se lika användbara ut och ha jämförbar storlek. JÄMNT och UDDA läggs på som text i spelet. Handtag och vargens händer får inte täcka orden. |
| Ägg | Varmvitt ägg, något smalare upptill, med tydlig mörk kontur och en stor ren yta i mitten. Diskret skuggning kan ge form. | En och samma äggbild används för alla tal. Inga inritade siffror, ansikten, prickar eller kategorimarkeringar. Talet läggs ovanpå med separat text. |
| Kategoriknappar | Stora rundade knappar med tydlig kant och plana, lättlästa textytor. Samma grundform och visuella tyngd för båda valen. | Orden läggs på separat. Tillstånd som fokus och nedtryckt ska kunna visas med kontur eller formförändring tillsammans med färg. |

### Separata delar och text i spelet

Spelplanen byggs av separata visuella objekt. En sammanhängande konceptbild kan användas som referens, men spelet behöver kunna flytta ägget, uppdatera talet och markera en korg oberoende av resten.

- **Text skapas i spelet.** Tal, JÄMNT, UDDA, regeln och återkopplingen ska inte vara inbakade i bildfiler. Använd ett tydligt typsnitt med öppna sifferformer och utan dekorativ handstil.
- **En bild kan återanvändas.** Alla tal använder samma äggform. Korgarnas grundbild kan vara gemensam, med olika textetiketter. Rännornas utseende kan återanvändas eller speglas där banorna tillåter det.
- **Rörliga delar hålls fria.** Varg, korgar och ägg ska kunna placeras var för sig. Om kommande fångströrelser kräver separata armar förbereds tydliga fästpunkter; hela animationsserier behövs först i punkt 4.
- **Talet förblir upprätt.** Äggformen får senare röra sig och rotera medan talet behåller sin läsbara riktning. Samma princip gäller korgarnas etiketter när de flyttas.

### Om grafiken levereras som bildfiler

Fristående figurer och föremål levereras som **PNG med verklig transparens**. Transparensen ska inte vara en inritad vit eller schackrutig ruta. Bakgrunden kan vara täckande. Kontrollera kanterna mot både ljus och mörk yta så att oönskade kanter eller glorior upptäcks.

Anpassa upplösningen till objektets största planerade storlek i spelet. Som startvärde kan rasterbilder ha ungefär dubbla bredden och höjden jämfört med den största visningsstorleken i CSS-pixlar på testytorna. En figur som ska visas som 140 × 180 CSS-pixlar kan exempelvis exporteras i 280 × 360 bildpunkter. Kontrollera resultatet på testenheterna och undvik att förstora små original tills de blir suddiga.

Ge figurerna tillräckligt med marginal för öron, svans och konturer, och dokumentera var bas- eller fästpunkten ligger. Framtida poser av samma figur ska använda konsekvent skala och fästpunkt så att figuren inte hoppar vid bildbyte. Behåll redigerbara original separat från exporter som spelet laddar.

Placera spelbilderna under `public/assets/images/`, gärna med beskrivande namn som `wolf-neutral.png`, `basket.png` och `egg.png`. Dokumentera vad varje fil används till, dess tänkta storlek och ursprung. När grafiken ritas direkt i Phaser behövs inga motsvarande PNG-filer.

### Vad som räcker i punkt 3

Det räcker med en sammanhängande grafisk stil, en neutral varg, fyra ritade rännor, två korgar, ett återanvändbart helt ägg och två knappar med sina visuella tillstånd. Fångstposer, sprucket ägg och resultateffekter tas fram tillsammans med animationerna i punkt 4.

Grafiken är redo när objekten känns igen i sin faktiska spelstorlek, tal och ord är tydliga och inga bilddetaljer avslöjar det rätta svaret. Granska hela spelplanen tillsammans; fina enskilda bilder räcker inte om de konkurrerar med siffran eller gör layouten svårläst.

## Översikt

| Nr | Deluppgift | Beror på |
| --- | --- | --- |
| 03.1 | Välja testytor och mål för läsbarhet | 01–02 |
| 03.2 | Planera spelplanens ytor och koordinater | 03.1 |
| 03.3 | Skapa och koppla in spelplansscenen | 03.2 |
| 03.4 | Samla färger, textstilar och grafiska mått | 03.2 |
| 03.5 | Rita bakgrund och bestämma lagerordning | 03.3–03.4 |
| 03.6 | Rita fyra rännor och beskriva deras banor | 03.2–03.5 |
| 03.7 | Skapa vargens prototypgrafik | 03.4–03.5 |
| 03.8 | Skapa och märka de två korgarna | 03.4, 03.7, 02.5–02.6 |
| 03.9 | Visa ett ägg med ett läsbart tal | 03.4, 03.6, 02.9 |
| 03.10 | Skapa de två stora kategoriknapparna | 03.2, 03.4, 02.5–02.6 |
| 03.11 | Visa regeln och ge återkoppling plats | 03.2, 03.4, 03.8, 03.10 |
| 03.12 | Sätta ihop en sammanhängande förhandsvisning | 03.5–03.11 |
| 03.13 | Anpassa spelplan och omgivande sida till skärmen | 03.1, 03.12 |
| 03.14 | Verifiera och dokumentera spelplanen | Alla ovan |

När layouten och den grafiska grunden finns kan varg, ägg och knappar byggas i valfri ordning enligt beroendena.

## 03.1 – Välja testytor och mål för läsbarhet

- [x] Klar

**Mål:** Bestämma på vilka skärmytor punkt 3 ska godkännas och vad ”läsligt” innebär för prototypen.

**Så löser vi det:**

Utgå från dator och surfplatta. Följande är förslag till webbläsarens tillgängliga visningsyta, i CSS-pixlar, inte enhetens fysiska skärmupplösning:

| Testyta | Storlek | Vad den kontrollerar |
| --- | --- | --- |
| Dator | 1366 × 768 | Spelplanen ryms även när höjden är begränsad |
| Surfplatta, liggande | 1024 × 768 | Knappar, tal och regel är tydliga på en mindre yta |
| Surfplatta, stående | 768 × 1024 | Samma innehåll fungerar när bredden blir begränsande |
| Litet fönster, extra kontroll | 390 × 844 | Sidan klipper inte innehåll eller gör det oåtkomligt |

Dokumentera vilka riktiga enheter och webbläsare som ska användas. Simulerade webbläsarstorlekar är användbara för layoutkontroll men ersätter inte den praktiska kontrollen på en surfplatta.

Föreslagna läsbarhetsmål på de tre primära testytorna:

- Talet på ägget motsvarar minst 32 CSS-pixlar i textstorlek efter skalning.
- Regel, korgord och knappord motsvarar minst 20 CSS-pixlar efter skalning.
- Varje kategoriknapp har en synlig yta på minst 140 × 56 CSS-pixlar, med tydligt mellanrum.
- Hela spelplanen och båda knapparna kan ses samtidigt, utan att sidan behöver rullas.

Detta är projektets föreslagna startmål, som prövas vid implementationen. Mobilspel är inte ett separat färdigkrav för huvuduppgift 3. Om ett mycket litet fönster inte rymmer en läsbar plan ska sidan hantera det begripligt, exempelvis med en kort uppmaning att förstora fönstret eller vrida enheten.

**Klart när:** Primära testytor, tillgängliga testenheter, orienteringar och mätbara läsbarhetsmål finns noterade inför arbetet.

## 03.2 – Planera spelplanens ytor och koordinater

- [x] Klar

**Mål:** Alla delar får plats utan att överlappa viktig information.

**Så löser vi det:**

Utgå från projektets befintliga logiska arbetsyta, 960 × 540. Dela den i en överdel för regeln, en mittdel för rännor och ägg samt en nedre del för varg, korgar och spelknappar. Justera fördelningen efter läsbarhetsmålen.

En grov skiss visar innehållets ordning, inte slutliga mått:

```text
+------------------------------------------------------+
|          Sortera talen: JÄMNT eller UDDA              |
|                                                      |
|   ränna 1  \\                        //  ränna 3        |
|   ränna 2    \\       ett ägg       //    ränna 4      |
|                                                      |
|                 [JÄMNT] VARG [UDDA]                  |
|                  plats för återkoppling              |
|                                                      |
|       [       JÄMNT       ] [       UDDA       ]       |
+------------------------------------------------------+
```

Samla arbetsytans mått, marginaler, objektens storlekar och fasta placeringar i en liten layoutbeskrivning, exempelvis `src/game/layout.ts`. Spelkonfiguration och grafik ska använda samma definition av arbetsytan. Om layouten behöver ändras ska det inte kräva ändringar av matematikreglerna.

Beskriv särskilt rännornas start- och slutpunkter, vargens baspunkt, korgarnas placering och äggets fria utrymme. Räkna med hela ägget och dess text, inte bara mittpunkten, vid kanterna.

**Enkel pseudokod:**

> Läs arbetsytans mått → avsätt regel och knappytor → placera spelvärlden i återstående utrymme → kontrollera marginaler och överlapp.

**Klart när:** En måttsatt layout eller skiss visar alla delar, och det finns utrymme för ett tvåsiffrigt ägg på samtliga rännor.

## 03.3 – Skapa och koppla in spelplansscenen

- [x] Klar

**Mål:** Den nya spelplanen går att öppna och ersätter den tekniska startscenen i den aktuella förhandsvisningen.

**Så löser vi det:**

Skapa exempelvis `GameScene` i `src/scenes/` och registrera den i spelkonfigurationen. Låt sidan tills vidare öppna spelplanens förhandsvisning direkt. Startmeny och val av spelläge hör till huvuduppgift 8.

Scenen ansvarar för att skapa och städa sina visuella objekt. Behåll projektets hantering av en enda Phaser-instans vid koduppdatering. Den gemensamma id-räknaren från `src/game/session.ts` ska fortsätta användas om förhandsvisningen skapar ett exempelägg.

**Enkel pseudokod:**

> Sidan laddas → starta en spelinstans → skapa spelplansscenen → bygg scenens objekt en gång → städa dem när scenen lämnas.

**Klart när:** Den nya scenen visas utan konsolfel. Omladdning, scenomstart och en sparad kodändring skapar inte dubbla spelplaner eller flera canvas-element.

## 03.4 – Samla färger, textstilar och grafiska mått

- [x] Klar

**Mål:** Grafiken får ett enhetligt utseende som går att justera och ersätta.

**Så löser vi det:**

Utgå från sidans befintliga gröna och ljusa färger. Definiera tydliga färger för bakgrund, konturer, ägg, text, korgar och knappar samt några få textstorlekar. Lägg dem tillsammans, exempelvis i `src/game/visualStyle.ts`.

Använd avsnittet [Bildstil och krav på grafiken](#bildstil-och-krav-på-grafiken) som gemensam bildbeskrivning. Gör en liten stilskiss med varg, korg, ägg och ett tal innan samtliga objekt förfinas. Bedöm skissen i den storlek objekten faktiskt ska visas i.

Använd enkla former och egen prototypgrafik. Dela upp ritandet i små funktioner eller komponenter när ett objekt behöver flyttas, uppdateras eller ersättas. Inför inget nytt gränssnittsramverk för detta steg.

Visuella storlekar hör till layouten och stilarna. Talintervall, antal rännor och framtida färdtid läses från `GAME_SETTINGS` i regelkärnan. Om bildfiler används läggs de i `public/assets/images/` och laddas med projektets `BASE_URL` enligt README.

**Klart när:** Gemensamma färger och textstilar finns samlade och en stilskiss visar att objekten passar ihop. Ett byte av exempelvis textstorlek eller bakgrundsfärg kan göras på ett tydligt ställe. Valet mellan ritade former och bildfiler är dokumenterat för de viktigaste objekten.

## 03.5 – Rita bakgrund och bestämma lagerordning

- [x] Klar

**Mål:** Spelvärlden ger sammanhang och lämnar ägg, text och kontroller synliga.

**Så löser vi det:**

Rita en lugn bakgrund och ett golv. Använd sparsam dekoration. Beskriv ordningen mellan bakgrund, rännor, varg, korgar, ägg och text. Talet ska ligga framför sin äggform och förbli synligt även nära rännans slut.

Lämna plats för kommande återkoppling utan att lägga den ovanpå kategoriknapparna. Bakgrundsobjekt ska inte fånga framtida pekhändelser.

**Klart när:** Bakgrunden är tydligt underordnad uppgiften. Ett placerat provägg och dess tal kan ses framför övrig grafik på de tänkta banorna.

## 03.6 – Rita fyra rännor och beskriva deras banor

- [x] Klar

**Mål:** Fyra tydligt åtskilda rännor kan återanvändas för äggens rörelse i punkt 4.

**Så löser vi det:**

Ge rännorna stabila id:n som motsvarar regelkärnans `lane`:

| Id | Föreslagen placering |
| --- | --- |
| 1 | Vänster, övre |
| 2 | Vänster, nedre |
| 3 | Höger, övre |
| 4 | Höger, nedre |

Beskriv varje bana med en startpunkt och en slutpunkt, eller en kort lista av punkter om det behövs. Använd samma beskrivning för att rita rännan och placera ägget. Kontrollera att antalet banor motsvarar `GAME_SETTINGS.laneCount` och att id:n inte saknas eller dubbleras.

En enkel positionsfunktion kan ange var ägget ska ritas längs banan vid ett förlopp mellan 0 och 1. Den tar ingen tid och startar ingen rörelse; uppgift 4 använder positionerna för animationen.

**Enkel pseudokod:**

> Hämta bana för äggets ränna → beräkna plats vid början, mitten eller slutet → placera ägget på banan.

**Klart när:** Alla fyra rännor går att urskilja. Ett ägg kan placeras vid början, mitten och slutet av var och en utan att klippas eller skymma regeln eller knapparna. Samma tal kan visas på båda sidor utan att korgarnas betydelse ändras.

## 03.7 – Skapa vargens prototypgrafik

- [x] Klar

**Mål:** En vänlig varg är tydligt spelets figur och går att animera senare.

**Så löser vi det:**

Bygg en enkel varg med igenkännliga öron, nos, kropp, armar och svans. Samla delarna så att hela figuren kan flyttas och skalas tillsammans. Placera den i den nedre delen av spelvärlden enligt layouten.

Följ bildbeskrivningens grå figur med ljus nos och mage. Kontrollera att öron, nos och svans känns igen även i liten storlek. Korgarna ritas eller laddas separat; kategoriorden ska inte ingå i vargbilden.

Bestäm en neutral pose och tydliga fästpunkter för korgar eller armar. Förbered placeringen så att en kommande fångst åt båda kategorierna kan visas. Själva fångströrelsen införs i punkt 4.

**Klart när:** Figuren går att känna igen som en varg, ryms med båda korgarna och skymmer inte rännornas slut eller kategoritexterna. Grafiken går att byta utan att ändra svarshanteringen.

## 03.8 – Skapa och märka de två korgarna

- [x] Klar

**Mål:** Barnet kan se vilken korg som hör till varje kategori.

**Så löser vi det:**

Rita två korgar med tydlig öppning och etikett. Vänster och höger betyder spelarens vänster och höger på skärmen. Vänster ska alltid vara JÄMNT och höger UDDA, oberoende av ränna och vargens pose.

Hämta kategorin via `categoryForChoice` och etiketten från `CATEGORY_WORDS`. Ge varje korg en identifierbar visuell komponent så att den rätta senare kan markeras med hjälp av `choiceForCategory`.

Under själva spelvisningen används bara kategoriorden, utan prickbilder. Etiketterna ska vara läsbara även när vargen eller korgen senare rör sig.

Håll flätmönstret enkelt och etikettens bakgrund lugn. Korgarna ska ha samma grundform och ungefär samma storlek. Om de använder bildfiler läggs orden ovanpå bilderna som separata textobjekt.

**Enkel pseudokod:**

> För vänster och höger → hämta kategori → hämta kategoriord → rita korg och etikett på rätt sida.

**Klart när:** Korgarna visar JÄMNT till vänster och UDDA till höger på samtliga primära testytor. Orden stämmer med regelkärnan och inga prickbilder visas.

## 03.9 – Visa ett ägg med ett läsbart tal

- [x] Klar

**Mål:** Ett ägg kan visa vilket heltal som helst inom 0–20 utan att siffrorna blir svårlästa.

**Så löser vi det:**

Skapa en äggform med ljus yta, tydlig kontur och mörkt tal. Samla form och text som ett visuellt objekt som kan placeras, uppdateras och tas bort. Talet hämtas från äggets `value` i regelkärnan.

Äggformen ska vara smalare upptill och ha tillräckligt stor fri mitt för två siffror. Använd en återanvändbar form eller bild utan text. Lägg talet som ett eget textobjekt, så att alla 21 tal kan visas utan separata numrerade äggbilder.

Använd samma äggutseende för jämna och udda tal. Talet ska vara upprätt och centrerat; om äggformen senare roteras behöver siffrorna fortfarande gå att läsa.

Kontrollera särskilt `0`, `7`, `10` och `20`, både mitt på och nära ändarna av banorna. Visa bara ett ägg åt gången. Vid byte av tal eller ränna ska gamla texter och former ersättas eller återanvändas, inte lämnas kvar.

**Klart när:** Alla tal 0–20 ryms på ägget. Ett tvåsiffrigt tal når läsbarhetsmålet efter skalning och hela ägget ryms på varje kontrollerad banposition.

## 03.10 – Skapa de två stora kategoriknapparna

- [x] Klar

**Mål:** De två valen har tydliga, konsekventa knappar med gott om plats för framtida pekstyrning.

**Så löser vi det:**

Placera knapparna under spelvärlden, i samma vänster–höger-ordning som korgarna. Hämta deras texter från samma kategorikarta och ordlista som korgarnas texter.

Beskriv normal, nedtryckt, fokuserad och inaktiv form så att tillstånden kan granskas. Förbered en träffyta som omfattar hela knappen, inte bara texten. Knapparnas ytor får inte överlappa varandra eller hamna under sidans övriga element.

I denna förhandsvisning visas de som inaktiva val, med fortsatt läsliga etiketter. Aktivering, tangentval, pekhändelser och knapplås kopplas in i punkt 4. Välj då också hur kontrollerna görs åtkomliga med tangentbord; tangentnamn ska inte visas innan styrningen är bestämd.

**Klart när:** Båda knapparna ryms samtidigt, når storleksmålen och har rätt ord. Deras planerade träffytor och visuella tillstånd är dokumenterade inför punkt 4.

## 03.11 – Visa regeln och ge återkoppling plats

- [x] Klar

**Mål:** Barnet ser vad uppgiften handlar om och var återkopplingen kommer att visas.

**Så löser vi det:**

Visa en kort regel i spelplanens överdel, exempelvis **”Sortera talen: JÄMNT eller UDDA.”** Bygg kategoridelen från den gemensamma ordlistan. Vid behov kan en kort rad tydliggöra **”JÄMNT till vänster · UDDA till höger.”** Pröva om raden behövs eller bara upprepar knapparna.

Regeln ska vara synlig samtidigt som ägget och knapparna. Ge kommande återkoppling en bestämd yta som inte flyttar runt resten av planen när text tillkommer.

Poäng, liv, kombo och nivå införs i punkt 6. Visa inga påhittade resultat eller liv i förhandsvisningen. Regeluppläsning och ”Lyssna igen” hör till punkt 7.

**Klart när:** Regeln kan läsas på alla primära testytor. En tillfällig provtext för återkoppling, exempelvis ”7 är UDDA.”, ryms utan överlapp och tas bort från den neutrala förhandsvisningen.

## 03.12 – Sätta ihop en sammanhängande förhandsvisning

- [x] Klar

**Mål:** Alla visuella delar fungerar tillsammans i en enda scen.

**Så löser vi det:**

Låt scenen skapa bakgrund, rännor, varg, korgar, regel, knappar och ett bestämt exempelägg. Använd `createEgg` med den gemensamma sessionsräknaren och låt grafikdelen läsa dess tal och ränna. Ett fast exempel gör granskning och skärmbilder jämförbara.

Förbered ett enkelt sätt att under utveckling ändra exempelägg och banposition. Det kan vara testdata eller tillfälliga utvecklingskontroller. Sådana kontroller ska inte följa med i den vanliga publicerade spelvyn.

Scenen visar data men anropar ännu inte `answer` eller `reachEnd`. Inga poäng eller svarsposter ska skapas av att någon granskar grafiken.

**Enkel pseudokod:**

> Skapa scenens fasta objekt → skapa ett exempelägg → placera det längs vald ränna → visa tal och etiketter → lämna förhandsvisningen stilla.

**Klart när:** Förhandsvisningen visar exakt en varg, fyra rännor, två korgar, ett ägg och två knappar. Den fungerar utan att en riktig spelomgång startas och förblir stabil vid upprepade scenstarter.

## 03.13 – Anpassa spelplan och omgivande sida till skärmen

- [x] Klar

**Mål:** Spelplanen är användbar på testytorna, även när webbläsarens storlek eller orientering ändras.

**Så löser vi det:**

Utgå från den befintliga proportionerliga skalningen. Kontrollera både tillgänglig bredd och höjd. Sidans nuvarande stora rubrik, introduktion, statusrad och marginaler behöver anpassas så att de inte tränger undan spelet på en liggande surfplatta eller en låg datorskärm.

Mät det faktiska utrymmet i webbläsaren. Beräkna skalan från den plats som återstår för spelplanen och kontrollera text- och knappmått efter skalning. Att hela bilden ryms betyder inte automatiskt att texten är läslig.

Uppdatera beskrivningen av spelområdet i `index.html`: den ska beskriva den nya spelplanen, inte den gamla cirkeln. Ändra också sidans status- och hjälptexter så att de tydligt säger att detta är en förhandsvisning. Behåll versionsvisningen.

Prova ändrad fönsterstorlek och båda surfplatteorienteringarna. Om de beslutade minimimåtten inte hålls ska layouten anpassas eller den aktuella storleken uttryckligen hanteras som för liten. Förvräng inte figurerna genom olika skalning i höjd och bredd.

**Enkel pseudokod:**

> Mät ledig bredd och höjd → beräkna proportionerlig skala → kontrollera läsbara mått → visa planen eller hjälp för en för liten yta.

**Klart när:** På alla primära testytor syns regel, ägg och båda knapparna samtidigt utan klippning, överlapp eller sidrullning. Storleksbyte skapar inga dubbla objekt. Den extra småfönsterkontrollen och vald hantering är dokumenterade.

## 03.14 – Verifiera och dokumentera spelplanen

- [x] Klar

**Mål:** Visa att huvuduppgift 3 uppfyller sitt färdigkriterium och är redo att kopplas till grundloopen.

**Så löser vi det:**

Skapa `docs/VERIFIERING-03.md` vid implementationen. Ange enhet, webbläsare, visningsyta, orientering, datum och om kontrollen gjordes på riktig enhet eller med simulerad storlek.

Kontrollera och dokumentera:

- Alla fem huvuddelar: varg, fyra rännor, två korgar, ett talägg och två knappar.
- Rätt vänster–höger-koppling och en synlig regel med samma ord överallt.
- Ord utan prickbilder på korgarna och neutralt utseende på ägget.
- Tal 0–20, med särskild läsbarhetskontroll av 0, 7, 10 och 20.
- Ett ägg vid början, mitten och slutet av alla fyra banor, ett i taget.
- Textstorlekar, knappmått, kanter, kontrast och överlapp på alla primära testytor.
- Enhetligt bildspråk, igenkännlig vargsilhuett och rena bildkanter i faktisk spelstorlek. Bildfiler har fungerande transparens och tillräcklig upplösning.
- Tal och etiketter är separata textobjekt. Ett byte av tal eller kategoriord kräver ingen ny bildfil.
- Omladdning, ändrad fönsterstorlek, orienteringsbyte och scenomstart.
- Inga konsolfel, saknade resurser eller kvarvarande utvecklingskontroller i den vanliga vyn.
- Godkända `npm test`, `npm run typecheck` och `npm run build`, samt visuell kontroll av det färdiga bygget via `npm run preview`.

Spara representativa skärmbilder för dator och surfplatta tillsammans med kontrollanteckningarna. Om en riktig testenhet saknas ska det stå som kvarvarande kontroll; markera inte den som godkänd utifrån enbart simulering.

**Klart när:** Kontrollerna är dokumenterade och godkända, samtliga deluppgifter är klara och kvarvarande arbete i andra huvuduppgifter framgår. Då kan huvuduppgift 3 markeras som klar i `UPPGIFTER.md`.

## Gränser mot andra huvuduppgifter

| Område | Hanteras i |
| --- | --- |
| Talets kategori, ägg-id och bedömning | 02, befintlig regelkärna återanvänds |
| Visuell spelplan, etiketter, stillastående ägg och knapputseenden | 03 |
| Rullande ägg, tidsförlopp och slumpad ränna i spel | 04 |
| Pekstyrning, tangenter, första trycket och skydd mot nedhållen knapp | 04 |
| Automatisk fångst, sprucket ägg och markering av rätt korg | 04 |
| Träningens stöd, omförsök och bekräftelseägg | 05 |
| Poäng, liv, kombo och tempoökning | 06 |
| Introduktion, prickbilder och regeluppläsning | 07 |
| Startmeny, val av läge, paus, avslut och omstart för spelaren | 08 |
| Resultatskärm och lokalt rekord | 09 |
| Samlat speltest med målgruppen och slutpublicering | 10 |

Publicering av en färdig delversion kan göras med det befintliga deploy-flödet när den ska visas på servern. Att skriva denna detaljplan eller bygga förhandsvisningen innebär inte i sig att något har publicerats.

## Öppna val att hantera under arbetet

| Val | Utgångspunkt | Avgörs i |
| --- | --- | --- |
| Faktiska datorer, surfplattor och webbläsare | Välj tillgängliga testenheter och dokumentera dem | 03.1 |
| Läsbarhetsmål efter skalning | 32 px tal, 20 px kategoriord/regel, minst 140 × 56 px knappar | 03.1 och 03.13 |
| Stående surfplatta | Försök behålla samma logiska spelplan och kontrollera läsbarheten | 03.2 och 03.13 |
| Mycket små fönster | Begriplig hjälp om planen inte ryms läsligt | 03.13 |
| Vargens detaljer | Vänlig grå 2D-figur med ljus nos och mage enligt bildbeskrivningen | 03.4 och 03.7 |
| Ritade former eller bildfiler | Välj per objekt; behåll samma stil och möjlighet att byta grafiken | 03.4 |
| Slutliga bilder och animationer | Prototypgrafik först, med möjlighet att ersätta den | 03 och 04 |
| Kort regeltext | ”Sortera talen: JÄMNT eller UDDA.” som förslag | 03.11; uppläsning i 07 |
| Exakta tangenter och inmatningslösning | Bestäms när knapparna kopplas till spelhandlingar | 04 |

## När hela punkt 3 är klar

03.1–03.4 ger testmål, layout, scen och visuella grundvärden. 03.5–03.11 ger spelvärlden och dess läsbara information. 03.12–03.14 sätter ihop, anpassar och verifierar helheten.

Resultatet är en begriplig förhandsvisning av spelplanen på de valda testskärmarna. Huvuduppgift 4 gör sedan samma scen spelbar med regelkärnan från punkt 2.
