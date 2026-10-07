# Regelkärna – uppgift 2

Reglerna körs utan Phaser, webbläsare, klocka eller äggposition. Scenen skickar
knappval och händelsen att ägget nått slutet. Bara en returnerad svarspost ska
utlösa en resultatanimation. `null` betyder att inget nytt resultat skapades.

| Fil | Ansvar |
| --- | --- |
| `types.ts` | Kategorier, val, spellägen, äggstatus och svarsposter |
| `settings.ts` | Frysta spelvärden och kontroll av deras giltighet |
| `parity.ts` | Kategori för heltal inom det inställda intervallet |
| `categories.ts` | Vänster/jämnt, höger/udda, omvänd koppling och svenska ord |
| `random.ts` | Utbytbar slumpkälla och inkluderande heltalsintervall |
| `ids.ts` | Sessionsräknare utan återanvändning av id |
| `eggs.ts` | Bestämda och slumpade ägg |
| `round.ts` | Aktivt ägg, svar och övergångar till väntan eller bedömning |

## Användning från kommande scener

```ts
import { sessionEggIds } from '../game/session';
import { createRandomEgg } from '../logic/eggs';
import { answer, createRound, reachEnd, setActiveEgg } from '../logic/round';

const round = createRound('training');
const egg = createRandomEgg(sessionEggIds);
setActiveEgg(round, egg);

// Händelsen ska bära id för det ägg barnet faktiskt såg vid trycket.
const result = answer(round, egg.id, 'right');
// Om result !== null: visa resultatet och markera dess correctCategory.

// Anropas av scenen när rörelsen når slutet, aldrig under paus.
reachEnd(round, egg.id);
```

`round` behålls mellan händelser. Funktionerna uppdaterar dess `activeEgg` och
`answers`; scenen ska läsa aktuell status därifrån. Äggen och svarsposterna är
frysta och ersätts vid övergångar. En tidigare `egg`-referens är en ögonblicksbild.
Ändra därför inte omgångens fält direkt.

`src/game/session.ts` skapar den enda räknaren för den laddade sidan. Den läggs
också i spelets register som `eggIds`. Använd samma räknare vid nästa ägg,
lägesbyte och omstart. Skapa en ny `Round` vid omstart, utan att skapa nya id:n
från 1. Varje test använder däremot en egen räknare.

| Händelse | Träning | Utmaning |
| --- | --- | --- |
| Tryck under färden | Rätt eller fel korg | Rätt eller fel korg |
| Slutet utan svar | Väntar; ingen svarspost | Bedömt som utan svar |
| Tryck på väntande ägg | Rätt eller fel korg | Inte ett normalt tillstånd |
| Gammalt id eller redan bedömt ägg | Ignoreras | Ignoreras |

Ett nytt ägg kan ersätta det aktiva först efter bedömning. Ett använt id kan inte
återaktiveras i samma omgång. Träningssvar finns endast i träningsomgångens lista
och bär läget `training`; ett nytt utmaningsspel börjar med en tom lista.
Poäng, kombo, liv och träningsförlopp efter fel implementeras i uppgift 5–6.
Paus, rörelse, tidtagning och knapplås hör till scenerna i uppgift 4 och 8.

## Kontroller

Kör `npm test` en gång eller `npm run test:watch` under utveckling.
Testfilerna ligger bredvid regelkoden. `npm run typecheck` kontrollerar även
testernas typer; Vitest ersätter inte typkontrollen.
Se [kontrollprotokollet](../../docs/VERIFIERING-02.md).
