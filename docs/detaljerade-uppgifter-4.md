# Egg Catcher – detaljerade uppgifter för punkt 4

Datum: 2026-10-17

Status: Arbetsplan. Ingen deluppgift är påbörjad. Deluppgifterna är fördelade på åtta arbetspaket med gränssnittskontrakt i [arbetspaket-04.md](arbetspaket-04.md); det dokumentet används när arbetet delas ut till flera agenter.

Huvuduppgift: [04. Göra grundloopen spelbar i UPPGIFTER.md](UPPGIFTER.md#04-göra-grundloopen-spelbar)

Underlag: [SPELDESIGN.md](SPELDESIGN.md), version 0.5, avsnitt 5 (grundloop och styrning), 6 (spellägen) och 10 (återkoppling), regelkärnan från [detaljerade-uppgifter-2.md](detaljerade-uppgifter-2.md) och spelplanen från [detaljerade-uppgifter-3.md](detaljerade-uppgifter-3.md).

## Mål och omfattning

Punkt 4 gör spelplanen spelbar: ett ägg åt gången rullar längs en slumpad ränna, barnet väljer JÄMNT eller UDDA med knapp eller tangent, vargen fångar ägget vid rätt svar och ägget spricker vid fel. Därefter kommer nästa ägg. Regelkärnan från punkt 2 avgör alla resultat; scenen visar dem.

**Efter implementationen ska sidan visa ett spelbart provspel i stället för förhandsvisningen.** Knapparna är aktiva. Sidtexten beskriver inte längre spelet som en förhandsvisning.

Poäng, liv, kombo och tempoökning hör till punkt 6. Förklaring med prickbild, omförsök med samma tal och bekräftelseägg hör till punkt 5. Startmeny, val av läge, paus och omstart hör till punkt 8. Punkt 4 ger loopen som dessa uppgifter bygger vidare på.

Arbetsflödet är:

**Bestäm styrning → beskriv loopens tillstånd → få ägget att rulla → koppla svaren → animera fångst och sprickning → koppla nästa ägg → provspela och dokumentera.**

Detta är en arbetsplan. Ingen deluppgift är genomförd genom att dokumentet skrivs. Kryssa i en deluppgift först när dess färdigkriterium har kontrollerats. Namn på nya filer och funktioner är förslag; befintliga funktioner anges med sina faktiska namn.

### Principer för hela punkt 4

- **Beslutet är kärnan, fångsten är kvittot.** Rätt val ger alltid en lyckad fångst, oavsett när under färden trycket sker och oavsett ränna. Vargen och korgen rör sig automatiskt. Ingen kollision eller fångsttiming avgör något.
- **Regelkärnan bestämmer resultatet.** Scenen anropar `answer` och `reachEnd` i `src/logic/round.ts` och gör något synligt bara när en svarspost returneras. Scenen räknar aldrig själv ut jämnt eller udda.
- **Ett ägg, ett svar.** Svaret låses vid första accepterade trycket. En nedhållen knapp eller tangent besvarar inte nästa ägg. Händelsen bär id för det ägg barnet såg vid trycket.
- **Samma svarshantering för alla inmatningar.** Pekknappar, musklick och tangenter leder till en och samma funktion. Ingen inmatningsväg har egna regler.
- **Färg är aldrig den enda signalen.** Rätt visas med rörelse och symbol, fel med sprucket ägg och en markerad rätt korg. Återkopplingstexten anger talet och kategorin i ord.
- **Spelvärden hämtas från `GAME_SETTINGS`.** Färdtid och paus mellan ägg är `travelSeconds` och `gapSeconds`. Inga tidsvärden skrivs direkt i scenen.
- **Städa efter varje ägg.** Tweens, timers och lyssnare skapas per ägg och tas bort vid bedömning, scenomstart och koduppdatering. Sidan har alltid exakt en canvas.
- **Behåll layouten från punkt 3.** `LANES`, `LAYOUT` och `positionOnLane` i `src/game/layout.ts` styr fortfarande var saker är. Rörelsen beräknas ur samma data som förhandsvisningen.

## Översikt

| Nr | Deluppgift | Beror på |
| --- | --- | --- |
| 04.1 | Bestämma styrning och skydd mot nedhållen knapp | 03 |
| 04.2 | Beskriva loopens tillstånd i scenen | 02.10, 04.1 |
| 04.3 | Låta ägget rulla längs rännan | 03.6, 03.9, 04.2 |
| 04.4 | Koppla knappar och tangenter till svarshanteringen | 03.10, 04.1–04.3 |
| 04.5 | Visa knapparnas tillstånd under spel | 03.10, 04.4 |
| 04.6 | Animera fångsten vid rätt svar | 03.7–03.8, 04.4 |
| 04.7 | Animera sprucket ägg och markera rätt korg | 03.8, 04.4 |
| 04.8 | Hantera rännans slut: väntande ägg och uteblivet svar | 02.10, 04.3, 04.7 |
| 04.9 | Starta nästa ägg och hålla loopen igång | 04.6–04.8 |
| 04.10 | Uppdatera sidan runt spelet och utvecklingskontrollerna | 04.9 |
| 04.11 | Automatiska kontroller av loopen | 04.2, 04.4, 04.9 |
| 04.12 | Provspela, verifiera och dokumentera | Alla ovan |

04.1–04.2 är beslut och struktur. 04.3–04.5 ger ett ägg som rullar och kan besvaras. 04.6–04.8 ger de tre utfallen. 04.9–04.12 sluter loopen och kontrollerar den.

## 04.1 – Bestämma styrning och skydd mot nedhållen knapp

- [ ] Klar

**Mål:** Veta exakt vilka inmatningar som räknas som ett svar och hur ett tryck knyts till rätt ägg.

**Så löser vi det:**

Förslag på styrning för första prototypen:

| Inmatning | Vänster / JÄMNT | Höger / UDDA |
| --- | --- | --- |
| Pekskärm och mus | Tryck på vänster knapp | Tryck på höger knapp |
| Tangentbord | `ArrowLeft` | `ArrowRight` |

Piltangenterna räcker i punkt 4. De är lätta att förklara, finns på alla tangentbord och motsvarar knapparnas placering. Fler tangenter kan läggas till senare utan att ändra svarshanteringen.

Ett svar registreras på **nedtryckning**, inte på släpp: `pointerdown` på knappens träffyta och `keydown` för tangenten. Två skydd gör att en nedhållen knapp inte besvarar nästa ägg:

1. `keydown` med `event.repeat === true` ignoreras. Dessutom hålls en liten mängd med tangenter som är nedtryckta just nu; en tangent måste släppas (`keyup`) innan den räknas igen. Detsamma gäller pekaren: ett nytt svar kräver ett nytt `pointerdown`.
2. Varje svarshändelse bär id för det ägg som visades vid trycket. Regelkärnan avvisar gamla id:n. Kombinationen gör att en nedhållen knapp är ofarlig även om ett nytt ägg hunnit starta.

Lägg skyddet i en liten modul utan Phaser-beroende, exempelvis `src/game/inputLock.ts`, så att det kan testas med Vitest:

```
inputLock.press(källa)    → true om källan var uppsläppt och nu är nedtryckt, annars false
inputLock.release(källa)  → markerar källan som uppsläppt
inputLock.reset()         → släpper allt, används vid scenomstart och fönsterbyte (blur)
```

Fokus: scenen lyssnar på tangenter via Phasers tangentbordsobjekt så att det bara reagerar när spelet har fokus. När fönstret tappar fokus (`blur`) återställs låset, så att en tangent som släpptes utanför sidan inte fastnar som nedtryckt.

**Klart när:** Tangenter, pekinmatning och de två skydden finns beskrivna här, modulen för låset finns med tester, och valet är noterat under öppna val.

## 04.2 – Beskriva loopens tillstånd i scenen

- [ ] Klar

**Mål:** Ha en liten, tydlig beskrivning av var loopen befinner sig, så att svar, animationer och nästa ägg inte krockar.

**Så löser vi det:**

Regelkärnan har redan äggets status (`rolling`, `waiting`, `judged`). Scenen behöver därutöver veta om en animation eller paus pågår. Förslag på scenens egna faser:

| Fas | Vad som händer | Svar tillåts |
| --- | --- | --- |
| `rolling` | Ägget rör sig längs rännan | Ja |
| `waiting` | Ägget står vid rännans slut (träning) | Ja |
| `resolving` | Fångst- eller sprickanimation och återkoppling visas | Nej |
| `gap` | Kort paus (`gapSeconds`) innan nästa ägg | Nej |

Övergångar: `rolling` → `resolving` vid svar, `rolling` → `waiting` vid slutet i träning, `rolling` → `resolving` vid slutet i utmaning, `waiting` → `resolving` vid svar, `resolving` → `gap` när animationen är klar, `gap` → `rolling` när nästa ägg startar.

Lägg faserna och de tillåtna övergångarna i en modul utan Phaser-beroende, exempelvis `src/game/flow.ts`, med en funktion som svarar på om ett svar får tas emot i den aktuella fasen. Scenen äger en `Round` från `createRound(mode)` och det aktuella äggets id. Spelläget skickas in när scenen startas (`scene.start('GameScene', { mode })`); standard i punkt 4 är `training`, så att ett provspel inte behöver liv.

Tillstånden är scenens presentation, inte spelregler. Om regelkärnan returnerar `null` görs ingen övergång.

**Klart när:** Faser och övergångar finns i kod med tester, och scenen använder dem i stället för lösa flaggor.

## 04.3 – Låta ägget rulla längs rännan

- [ ] Klar

**Mål:** Ett ägg med tal rör sig från rännans början till dess slut på `travelSeconds` sekunder, med läsbart tal hela vägen.

**Så löser vi det:**

Skapa ägget med `createRandomEgg(sessionEggIds)` och aktivera det med `setActiveEgg(round, egg)`. Rännan kommer från `egg.lane`. Rörelsen är en Phaser-tween över ett framstegsvärde 0 → 1 under `GAME_SETTINGS.travelSeconds * 1000` millisekunder; vid varje uppdatering sätts äggets position med `positionOnLane(egg.lane, progress)`. Då används exakt samma bandata som förhandsvisningen och layouttesterna.

Rotera bara äggets skal, inte talet: skalet i behållaren `number-egg` får en rotation som följer framsteget (några varv på hela färden, riktning efter rännans sida), medan textobjektet behåller rotation 0. Talet ska vara läsbart vid början, mitten och slutet på alla fyra rännor.

När tweenen är klar anropar scenen `reachEnd(round, egg.id)` och hanterar resultatet enligt 04.8. Tweenen och dess lyssnare sparas så att de kan stoppas vid svar, vid scenomstart och vid koduppdatering.

Linjär rörelse räcker i punkt 4. Tempoökning per nivå hör till punkt 6.

**Klart när:** Ett ägg rullar från början till slut på rätt tid på alla fyra rännor, talet är upprätt och läsbart under hela färden, och `reachEnd` anropas exakt en gång per ägg som når slutet.

## 04.4 – Koppla knappar och tangenter till svarshanteringen

- [ ] Klar

**Mål:** Alla inmatningar leder till ett och samma svar, och ett ägg bedöms exakt en gång.

**Så löser vi det:**

Ge varje knapp en träffyta över hela den rundade rektangeln (`setInteractive` med en rektangel i knappens mått) och lyssna på `pointerdown`. Lyssna på `ArrowLeft` och `ArrowRight` via scenens tangentbord. Båda vägarna anropar en enda metod:

```
submitChoice(choice):
  om inte flow tillåter svar i aktuell fas → gör ingenting
  om inte inputLock.press(källa) → gör ingenting
  eggId = det aktuella äggets id (det barnet ser)
  record = answer(round, eggId, choice)
  om record === null → gör ingenting
  stoppa rörelsen, gå till fasen resolving
  visa resultatet enligt 04.6 eller 04.7
```

`pointerup`, `pointerupoutside` och `keyup` anropar `inputLock.release(källa)`. Inget annat händer vid släpp.

Dubbeltryck ger inte dubbla resultat eftersom regelkärnan redan har markerat ägget som `judged` och returnerar `null`, och eftersom fasen `resolving` inte tillåter svar. Båda skydden ska finnas.

**Klart när:** Rätt och fel svar fungerar från båda knapparna och båda tangenterna. Ett andra tryck under samma ägg gör ingenting. En nedhållen tangent eller ett kvarhållet finger besvarar inte nästa ägg.

## 04.5 – Visa knapparnas tillstånd under spel

- [ ] Klar

**Mål:** Barnet ser att knapparna går att trycka på, vilken som trycktes och när de inte tar emot svar.

**Så löser vi det:**

Använd `setButtonState` och `BUTTON_STYLES` från punkt 3:

- `normal` när ägget rullar eller väntar.
- `pressed` på den knapp som precis tog emot ett svar, i en kort stund (cirka 150 ms) innan båda knapparna blir `inactive`.
- `inactive` under `resolving` och `gap`.
- `focused` behövs inte i punkt 4; tangentbordsfokus hanteras av sidan, inte av en markerad knapp.

Komplettera `setButtonState` så att de två knapparna kan ha olika tillstånd. Behåll stilarna i `visualStyle.ts`.

**Klart när:** Knapparna växlar mellan normal, nedtryckt och inaktiv i takt med loopen, och det syns i skalad storlek på surfplatta.

## 04.6 – Animera fångsten vid rätt svar

- [ ] Klar

**Mål:** Vid rätt svar fångas ägget alltid i rätt korg, med en rörelse och en symbol som gör resultatet tydligt.

**Så löser vi det:**

Målkorgen är `choiceForCategory(record.correctCategory)`, det vill säga korgen för det rätta svaret, hämtad ur svarsposten. Positionen kommer från `LAYOUT.baskets`.

Fångsten i punkt 4 är en enkel rörelse i tre steg, alla som tweens:

1. Ägget lämnar rännan från sin aktuella position och rör sig i en mjuk båge ned i korgens öppning (cirka 400–500 ms). Talet förblir läsbart under rörelsen.
2. Korgen gör en liten studs (skala 1,0 → 1,08 → 1,0) när ägget landar; ägget tonas bort i korgen.
3. En symbol, exempelvis en bock ✓ i en ljus cirkel, visas kort vid korgen, och återkopplingsraden visar **”12 är JÄMNT.”** med talet från svarsposten och ordet från `CATEGORY_WORDS`.

Vargen behöver ingen egen animation i punkt 4; en liten rörelse (vargen lutar sig mot korgen) kan läggas till som förbättring om tiden finns. Fångsten är lika oavsett om trycket kom tidigt eller sent i färden och oavsett ränna, eftersom rörelsen alltid utgår från äggets aktuella position och alltid slutar i korgen.

Hela sekvensen bör ta högst ungefär en sekund, så att nästa ägg inte känns långt borta. Alla tweens avslutas med att scenen går till fasen `gap`.

**Klart när:** Rätt svar vid början, mitten och slutet av alla fyra rännor ger en fångst i rätt korg, med symbol och text. Ingen fångst missar och inget ägg lämnas kvar på skärmen.

## 04.7 – Animera sprucket ägg och markera rätt korg

- [ ] Klar

**Mål:** Vid felval ser barnet att ägget sprack och vilken korg som hade varit rätt.

**Så löser vi det:**

1. Ägget faller rakt ned från sin aktuella position till markytan under rännan (ungefär till korgarnas basnivå), cirka 300 ms.
2. Vid landningen byts hela ägget till ett sprucket ägg. Enklast är en liten ritad form i Phaser: två skalhalvor och en gul fläck, i samma stil som övrig grafik. Om det blir bättre med en bildfil läggs `egg-cracked-v1.png` i `public/assets/images/` och beskrivs i `docs/artwork-v1/ARTWORK.md`. Talet visas kvar ovanför det spruckna ägget tills nästa ägg, så att barnet kan koppla talet till återkopplingen.
3. Samtidigt markeras rätt korg (`choiceForCategory(record.correctCategory)`) med en tydlig kontur eller ring runt korgen och en kort studs. Markeringen använder form och rörelse, inte bara färg.
4. Återkopplingsraden visar **”12 är JÄMNT.”** på samma sätt som vid rätt svar. En symbol, exempelvis ett kryss ✗, visas vid det spruckna ägget.

Det spruckna ägget, markeringen och symbolen tas bort när nästa ägg startar. I punkt 5 byggs förklaringen med prickbild och omförsök ovanpå detta läge; punkt 4 går vidare till nästa ägg efter pausen.

**Klart när:** Felval från alla fyra rännor ger ett sprucket ägg, markerad rätt korg och text. Allt som hör till det spruckna ägget försvinner innan nästa ägg visas.

## 04.8 – Hantera rännans slut: väntande ägg och uteblivet svar

- [ ] Klar

**Mål:** Rännans slut hanteras enligt spelläget, med regelkärnan som domare.

**Så löser vi det:**

När rörelsen är klar anropas `reachEnd(round, egg.id)`:

- **Träning:** `reachEnd` returnerar `null` och ägget får status `waiting`. Scenen går till fasen `waiting`: ägget står still vid rännans slut, talet syns och knapparna är fortsatt `normal`. Ett svar hanteras som under färden; fångsten utgår från slutpositionen.
- **Utmaning:** `reachEnd` returnerar en svarspost med `outcome: 'unanswered'`. Ägget faller och spricker som i 04.7 och rätt korg markeras. Återkopplingen visar **”12 är JÄMNT.”** Liv och poäng tillkommer i punkt 6.

Så att båda vägarna kan provas redan nu: scenen startas med `{ mode: 'training' }` som standard, och i utvecklingsläge kan `?mode=challenge` i adressen starta utmaningsvarianten. Den riktiga lägesväljaren hör till punkt 8.

**Klart när:** I träning väntar ägget vid slutet och kan besvaras med fångst eller sprickning. I utmaning räknas slutet som uteblivet svar med sprucket ägg och markerad korg. `reachEnd` anropas aldrig under en animation eller efter ett svar.

## 04.9 – Starta nästa ägg och hålla loopen igång

- [ ] Klar

**Mål:** Efter varje resultat kommer ett nytt ägg utan att något från det förra blir kvar.

**Så löser vi det:**

När fasen `gap` börjar startar en Phaser-timer på `GAME_SETTINGS.gapSeconds * 1000` millisekunder. När den går ut:

1. Rensa återkopplingsraden, symboler, korgmarkering och sprucket ägg.
2. Skapa nästa ägg med `createRandomEgg(sessionEggIds)` och aktivera det med `setActiveEgg(round, egg)`. Regelkärnan tillåter det eftersom föregående ägg är bedömt.
3. Återställ äggbehållaren (synlig, full skala, rotation 0) och starta rörelsen enligt 04.3.

Samma `Round` används under hela provspelet; `round.answers` växer med en post per bedömt ägg och blir underlag för punkt 6 och 9. Sessionsräknaren ger nya id:n utan återanvändning.

Vid scenens `shutdown` och vid koduppdatering stoppas timer, tweens och lyssnare, och inmatningslåset återställs. Det befintliga `?inspect=1`-läget startar inte loopen (se 04.10).

**Klart när:** Minst tio ägg i följd kan spelas med blandade utfall utan att gamla objekt syns, utan konsolfel och med exakt en canvas efter omladdning och koduppdatering.

## 04.10 – Uppdatera sidan runt spelet och utvecklingskontrollerna

- [ ] Klar

**Mål:** Sidan beskriver det som faktiskt visas, och utvecklingskontrollerna från punkt 3 fortsätter att fungera.

**Så löser vi det:**

- `index.html`: titel, beskrivning, `aria-label`, statusrad och fotnot uppdateras från ”förhandsvisning” till ett provspel, exempelvis ”Provspel · träning”. Nämn tangenterna kort under spelplanen: **”Tryck på knapparna eller använd ← och →.”**
- `GameScene.setPreview` behålls för `?inspect=1`. När sidan öppnas med `inspect` startar scenen i ett stillastående läge utan rullande ägg, så att grafikkontrollerna fortfarande kan visa tal, banpositioner och knapputseenden. Lägg vid behov till en kontroll ”Spela ett ägg” som startar ett enskilt ägg från kontrollpanelen.
- `README.md`: beskriv styrningen, `?mode=challenge` och att knapparna nu är aktiva. Uppdatera tabellen över projektets platser med nya moduler.
- Den dolda `aria-label` på spelytan uppdateras vid nytt ägg och vid resultat, så att skärmläsare får talet och återkopplingen.

**Klart när:** Sidans texter stämmer med spelet, `?inspect=1` fungerar i utvecklingsläge utan att loopen stör, och README beskriver styrningen.

## 04.11 – Automatiska kontroller av loopen

- [ ] Klar

**Mål:** Det som kan kontrolleras utan webbläsare kontrolleras av `npm test`.

**Så löser vi det:**

Nya testfiler bredvid modulerna, utan Phaser-beroende:

- `inputLock.test.ts`: första `press` ger `true`, upprepad `press` utan `release` ger `false`, `release` följt av `press` ger `true`, `reset` släpper alla källor, olika källor (vänster knapp, höger knapp, varje tangent) är oberoende.
- `flow.test.ts`: tillåtna och otillåtna övergångar, svar tillåts bara i `rolling` och `waiting`, och en otillåten övergång kastar eller ignoreras enligt valt mönster.
- Loopens regelsekvens med den befintliga regelkärnan: `createRound` → `createRandomEgg` med fast slumpkälla → `setActiveEgg` → `answer` → nytt ägg, upprepat flera gånger; svar med gammalt id ger `null`; `reachEnd` i träning följt av `answer`; `reachEnd` i utmaning ger `unanswered`.
- Layout: målpositionen för fångst (`LAYOUT.baskets`) ligger inom spelplanen och nedanför alla rännors slut, så att fångströrelsen alltid går nedåt mot korgen.

Animationstider och tweens testas inte automatiskt; de kontrolleras i 04.12.

**Klart när:** `npm test` och `npm run typecheck` passerar med de nya testerna, och antalet tester är noterat i kontrollprotokollet.

## 04.12 – Provspela, verifiera och dokumentera

- [ ] Klar

**Mål:** Grundloopen är provspelad och resultatet dokumenterat innan poäng och progression byggs vidare.

**Så löser vi det:**

Skapa `docs/VERIFIERING-04.md` i samma form som tidigare protokoll. Kontrollera i utvecklingsläge och i `npm run preview`:

- Rätt svar tidigt (strax efter start), i mitten och sent (strax före slutet) på var och en av de fyra rännorna ger fångst i rätt korg.
- Fel svar på alla fyra rännor ger sprucket ägg och markerad rätt korg.
- Träning: ägget väntar vid slutet; svar därifrån fungerar. Utmaning (`?mode=challenge`): slutet ger uteblivet svar.
- Dubbeltryck, snabbt växlande tryck på båda knapparna och tryck under animationen ger inte dubbla resultat.
- Nedhållen piltangent och kvarhållet finger över en knapp besvarar inte nästa ägg. Tangent släppt utanför fönstret fastnar inte.
- Tio ägg i följd, därefter omladdning och koduppdatering: en canvas, inga kvarvarande objekt, inga konsolfel.
- Storleksbyte under ett rullande ägg: rörelsen fortsätter och ägget stannar på banan.
- Dator och surfplatta enligt testytorna från punkt 3; notera enhet och webbläsare.

Notera `travelSeconds` och `gapSeconds` som provades och hur de upplevdes, som underlag för balanseringen i punkt 6 och 10.

Publicera gärna provspelet till servern med det befintliga deploy-flödet när det är stabilt, så att det kan provas på en riktig surfplatta via länken.

**Klart när:** Kontrollerna är dokumenterade och godkända, samtliga deluppgifter är klara och huvuduppgift 4 kan markeras som klar i `UPPGIFTER.md`.

## Gränser mot andra huvuduppgifter

| Område | Hanteras i |
| --- | --- |
| Bedömning, äggstatus och svarsposter | 02, befintlig regelkärna återanvänds |
| Spelplan, layoutdata, grafik och knapputseenden | 03, återanvänds |
| Rullande ägg, svar, fångst, sprickning, nästa ägg | 04 |
| Förklaring med prickbild, samma tal igen, bekräftelseägg | 05 |
| Poäng, liv, kombo, tempoökning och nivå | 06 |
| Introduktion och uppläst regel | 07 |
| Startmeny, val av träning/utmaning, paus, avslut och omstart | 08 |
| Resultatskärm och lokalt rekord | 09 |
| Speltest med målgruppen, balansering av tider och slutpublicering | 10 |

## Öppna val att hantera under arbetet

| Val | Utgångspunkt | Avgörs i |
| --- | --- | --- |
| Tangenter | `ArrowLeft` och `ArrowRight`; fler kan läggas till senare | 04.1 |
| Färdtid och paus mellan ägg | `travelSeconds: 3`, `gapSeconds: 0.8` från `GAME_SETTINGS`; justeras efter provspel | 04.12, balanseras i 06 och 10 |
| Standardläge i provspelet | `training`; `?mode=challenge` i utvecklingsläge | 04.2 och 04.8 |
| Sprucket ägg | Ritad form i Phaser först; bildfil om det ser bättre ut | 04.7 |
| Vargens rörelse vid fångst | Ingen egen animation i punkt 4; liten lutning som möjlig förbättring | 04.6 |
| Ljud | Inget ljud i punkt 4; `public/assets/audio/` används från punkt 7 | 07 |
| Längd på fångst- och sprickanimation | Högst cirka en sekund; provas mot hur snabbt nästa tal går att läsa | 04.6–04.7, 04.12 |

## När hela punkt 4 är klar

04.1–04.2 ger styrning och struktur. 04.3–04.5 ger ett ägg som rullar och kan besvaras. 04.6–04.8 ger fångst, sprucket ägg och hantering av rännans slut. 04.9–04.12 sluter loopen, uppdaterar sidan och kontrollerar helheten.

Resultatet är ett provspel där flera ägg kan spelas efter varandra, rätt svar alltid ger fångst och fel svar ger en tydlig rättelse. Huvuduppgift 5 bygger träningens stöd på sprickläget, och huvuduppgift 6 lägger poäng och tempo på samma loop.
