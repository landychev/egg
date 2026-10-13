# Kontrollprotokoll – uppgift 3

Datum: 2026-10-13. Implementation finns lokalt. Visuell slutkontroll återstår; huvuduppgift 3 är ännu inte avprickad.

## Implementerat

- Ny `GameScene` ersätter den tekniska startscenen i spelkonfigurationen.
- Gårdsbakgrund, en neutral varg, fyra ritade trärännor, två likadana korgar, ett ägg med tal och två inaktiva kategoriknappar.
- Bildresurser laddas med `import.meta.env.BASE_URL`. Tal, etiketter och regel är separata textobjekt.
- Vänster/JÄMNT och höger/UDDA hämtas från regelkärnans kategorikarta och ordlista.
- Exempelägget skapas med `createEgg` och den gemensamma sessionsräknaren. Ingen svarshantering, tidtagning, poäng eller spelomgång startas.
- Layout och text-/knappstilar samlas i `src/game/layout.ts` och `visualStyle.ts`.
- Förhandsvisningen håller fast vid logiska 960 × 540. Sidan tar hänsyn till både fönstrets bredd och höjd och visar storlekshjälp när planen annars måste krympas under 75 procent.
- Lokal grafikkontroll via `?inspect=1`: tal 0–20, alla fyra banor, början/mitten/slut, fyra knapputseenden, provåterkoppling och scenomstart. Modulen inkluderas endast i utvecklingsläge.

## Genomförda kontroller

- `npm test`: **134 tester i 9 filer godkända**, inklusive fem nya layouttester.
- `npm run build`: **godkänt**, inklusive `npm run typecheck`.
- Layouttester kontrollerar alla fyra banor, hela äggets fria utrymme vid fem positioner, rörelse inåt/nedåt, ogiltiga positioner, knappavstånd och läsbarhetsmål vid minsta skala.
- De tre fristående PNG-bilderna har riktig transparens. Bakgrunden är täckande. Originalen ändras inte vid inladdning.
- Produktionspaketet har kontrollerats för att utvecklingskontrollerna inte följer med.
- `git diff --check`: utan anmärkning.

Kontrollerna kördes med datorns Node **26.3.1**. Den tidigare tillfälliga Node 22-katalogen saknar numera själva körfilen. Projektets låsta version och serverkrav är oförändrade: **22.23.3**. En ny kontroll med den versionen återstår före publicering.

Bygget ger den tidigare kända varningen om Phasers paketstorlek (cirka 1,38 MB JavaScript före gzip).

## Testytor och beräknade mått

Detta är beräkningar utifrån CSS och layoutdata, **inte verifierade webbläsarmätningar**. Inga riktiga surfplattor har provats i detta steg.

| Yta | Beräknad spelplan | Tal | Kategoriord/regel | Knappar |
| --- | --- | --- | --- | --- |
| Dator 1366 × 768 | 1120 × 630 | 56 px | 32,7 px | 411 × 89 px |
| Liggande surfplatta 1024 × 768 | 992 × 558 | 49,6 px | 28,9 px | 364 × 79 px |
| Stående surfplatta 768 × 1024 | 736 × 414 | 36,8 px | 21,5 px | 270 × 58 px |
| Mindre fönster 800 × 600 | 768 × 432 | 38,4 px | 22,4 px | 282 × 61 px |
| Mobil 390 × 844 | Storlekshjälp | – | – | – |

Mål: tal minst 32 px, kategoriord/regel minst 20 px, knappar minst 140 × 56 px. Vid mindre bredd än 752 px eller höjd än 537 px visas hjälp i stället för en för liten spelplan.

## Grafikens mått och lager

Bakgrund → rännor → varg → korgar/etiketter → regel/återkoppling/knappar → ägg/tal.

Vargens bildyta är 300 × 300 med mittpunkt (480, 278); synlig fotpunkt ungefär (480, 418). Korgarnas bildytor är 240 × 240 kring (310, 348) och (650, 348), med etiketter 25 logiska pixlar nedanför respektive mittpunkt. Dessa är separata behållare och framtida fästpunkter; själva vargens armar är inte separata sprites ännu. Äggets bildyta är 100 × 100 med upprätt tal. Knapparna är 352 × 76 med 52 pixlars mellanrum och framtida träffyta över hela knappen. De är inte interaktiva i förhandsvisningen.

Återkoppling har en reserverad rad kring (480, 435), över knapparna. Bildbeskrivningar och originalmått finns i `docs/artwork-v1/ARTWORK.md`.

## Kvarvarande visuell verifiering

Webbläsarverktyget nekade tillgång till den lokala sidan eftersom dess administrativa säkerhetskontroll inte kunde verifieras. Ingen visuell webbläsarkontroll eller skärmbild kunde därför genomföras. Begränsningen kringgicks inte.

- Öppna utvecklingsservern, granska normal vy och `?inspect=1` på testytorna ovan.
- Kontrollera alla tal, särskilt 0, 7, 10 och 20, samt början/mitten/slut på samtliga banor.
- Kontrollera läsbarhet, korgarnas etiketter, transparenskanter, fokus/nedtryckt/inaktiv form och provåterkoppling.
- Kontrollera verkliga DOM-mått, frånvaro av sidrullning, storleks- och orienteringsbyte, särskilt från storlekshjälp tillbaka till spelplan.
- Kontrollera konsolen och resursladdning, omladdning, flera scenomstarter och koduppdatering: exakt en canvas och inga kvarvarande utvecklingskontroller.
- Kör `npm run preview` och kontrollera det färdiga bygget visuellt. Spara representativa skärmbilder.
- Prova faktisk dator och surfplatta. Notera enhet och webbläsare.

Ingen commit, push eller serverpublicering ingår i detta steg. Rullande ägg, styrning och fångst-/felanimationer återstår i uppgift 4.
