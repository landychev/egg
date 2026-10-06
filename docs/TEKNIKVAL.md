# Egg Catcher – val av språk och verktyg

Datum: 2026-10-03  
Status: Beslutat teknikval för den första spelbara webbprototypen  
Underlag: `SPELDESIGN.md`, version 0.5, och diskussionen om teknikval.

## Beslut

Vi bygger prototypen med **TypeScript, Phaser och Vite**. Spelet ska kunna öppnas via en länk och spelas direkt i webbläsaren.

| Verktyg | Roll i projektet |
| --- | --- |
| TypeScript | Språket vi skriver spelregler och övrig kod i. |
| Phaser | Spelramverket som hanterar spelvärld, animationer, ljud och inmatning. |
| Vite | Utvecklingsverktyget som kör projektet lokalt och bygger filerna för publicering. |

HTML och CSS används vid behov för sidans struktur, layout och vanliga gränssnittselement. Vite är ett byggverktyg, inte ett spelramverk.

## Vad valet ska stödja

Egg Catcher är ett pedagogiskt 2D-spel för barn 7–9 år. Den första prototypen har ett ägg åt gången, fyra rännor och två knappar för att välja kategori. Vargen fångar automatiskt efter spelarens val.

Tekniken ska göra det enkelt att testa läsbarhet, återkoppling och tempo. Den behöver också stödja skillnaden mellan träning, där ägget väntar på svar, och utmaning, där ett obesvarat ägg räknas som en miss. Surfplatta är en tänkt användningsmiljö, så stora pekknappar och tangentbordsstöd är en lämplig utgångspunkt. Exakta testenheter och tangenter återstår att bestämma.

## Varför TypeScript?

TypeScript bygger på JavaScript och omvandlas till JavaScript som körs i webbläsaren. Typkontrollen kan upptäcka vissa fel redan under utvecklingen.

För vårt spel hjälper det oss att beskriva spellägen, uppgifter och svar tydligt. Exempelvis ska **rätt svar**, **fel korg** och **utan svar** vara separata utfall. Träningens hjälpta omförsök ska också hållas skilda från utmaningens resultat.

Tydliga typer gör det lättare att ändra regler och senare lägga till addition eller filterläge. TypeScript kräver lite mer struktur än vanlig JavaScript, men vi bedömer att det är en rimlig kostnad för en prototyp som ska kunna utvecklas vidare.

Typkontroll garanterar inte att spelreglerna är korrekta. Vi behöver fortfarande kontrollera exempelvis att varje ägg bedöms högst en gång, att noll räknas som jämnt och att paus stoppar svarstiden.

## Varför Phaser?

Phaser är ett ramverk för 2D-spel i webbläsaren. Det erbjuder färdiga funktioner för bland annat animationer, ljud, scener och inmatning. Det passar spelets rörliga ägg, vargens fångster och den direkta återkopplingen efter ett val.

Vi får en gemensam grund för att:

- animera ägg längs rännorna och stoppa dem i träningsläget,
- visa lyckad fångst, sprucket ägg och rätt korg,
- spela upp regel och ljudeffekter,
- hantera spelarens inmatning och övergångar mellan spelets olika delar.

En viktig princip är att **spelreglerna avgör resultatet och animationen visar det**. Rätt svar ska alltid ge en lyckad fångst, oavsett när under färden barnet svarar. Fångsten behöver därför inte avgöras av en fysiksimulering eller av exakt kollision mellan ägg och korg.

Nackdelen är att Phaser är ett extra beroende och har ett eget arbetssätt att lära sig. För den planerade prototypen bedömer vi att dess färdiga spelfunktioner sparar mer arbete än de tillför.

## Varför Vite?

Vite ger oss en lokal utvecklingsserver och ett byggsteg som skapar filerna för publicering. Det gör arbetsflödet smidigt när vi ändrar till exempel färdtid, textstorlek eller återkoppling och vill prova resultatet direkt.

Vite har stöd för TypeScript och passar ihop med Phaser. Typkontrollen ska också ingå som ett separat kontrollsteg i projektet; att Vite kan bygga koden betyder inte i sig att alla typer har kontrollerats.

Vite är inte en tjänst som publicerar spelet åt oss. Val av webbhotell och själva publiceringen hanteras separat.

## Alternativ och avgränsningar

**JavaScript utan TypeScript** hade varit tillräckligt för en liten demonstration. Vi väljer TypeScript för tydligare struktur när spellägen och uppgiftstyper blir fler.

**HTML, CSS och JavaScript utan spelramverk** hade också kunnat lösa grundidén. Med animationer, ljud, pauser och flera spellägen föredrar vi att använda Phasers befintliga funktioner.

Vi inför inget separat gränssnittsramverk i det här teknikvalet. Behovet kan omprövas om projektet senare får mer omfattande menyer eller lärarverktyg.

För den första prototypen är utgångspunkten att spelet körs helt i webbläsaren och att rekord sparas lokalt. Det behövs då ingen egen serverlogik eller databas. Lokala rekord följer inte automatiskt med till en annan enhet och kan försvinna om webbläsarens lagring rensas.

## Konsekvenser för implementationen

Vi håller matematikregler och resultatberäkning åtskilda från animationerna. Det gör reglerna lättare att kontrollera och gör det möjligt att ändra grafiken utan att samtidigt ändra vad som räknas som ett rätt svar.

Vi börjar med jämnt och udda, ett ägg åt gången och de två spellägena enligt speldesignens prototypförslag. Hastigheter och andra balansvärden ska vara enkla att justera efter speltest.

Att verktygen stödjer webbläsare och pekskärmar ersätter inte tester på de datorer och surfplattor som ska användas. Läsbarhet, knappar, ljudstart och paus behöver kontrolleras där.

Exakta verktygsversioner väljs och låses när projektet sätts upp. Detta dokument beslutar teknikstacken; det ändrar inte spelreglerna i speldesigndokumentet.

## Källor

- [TypeScript – introduktion](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)
- [Phaser – officiell dokumentation](https://docs.phaser.io/)
- [Vite – introduktion och arbetsflöde](https://vite.dev/guide/)
- [Vite – TypeScript och typkontroll](https://vite.dev/guide/features.html#typescript)

Verktygens dokumentation beskriver deras funktioner. Motiveringarna och avgränsningarna ovan är våra bedömningar utifrån Egg Catchers behov.
