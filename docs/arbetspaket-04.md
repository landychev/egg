# Arbetspaket för uppgift 04 – spelbar grundloop

Datum: 2026-10-17

Det här dokumentet bryter ner [detaljerade-uppgifter-4.md](detaljerade-uppgifter-4.md) i åtta arbetspaket som kan delas ut till olika agenter. Varje paket är skrivet så att det går att skicka som en egen uppgift: det anger vilka filer paketet äger, vilka gränssnitt det ska följa, vilka tester som ska finnas och vad som ska rapporteras tillbaka. Avsnittet **Kontrakt** är det som gör att paketen kan byggas parallellt utan att vänta på varandra.

Huvuduppgift: [04. Göra grundloopen spelbar](UPPGIFTER.md#04-göra-grundloopen-spelbar). Deluppgifterna 04.1–04.12 i detaljplanen är fördelade på paketen enligt tabellen i slutet.

## Instruktion till varje agent

Detta avsnitt kopieras in i varje uppdrag tillsammans med det aktuella paketet.

1. Läs `CLAUDE.md` i repots rot, `src/logic/README.md` och avsnittet **Kontrakt** nedan. Läs sedan bara ditt paket. Läs inte hela `SPELDESIGN.md` eller hela detaljplanen; paketet innehåller det du behöver.
2. Arbeta på en egen gren från `main`: `04-p<N>-<kortnamn>`, till exempel `04-p1-inputlock`. Gör små commits med engelska meddelanden.
3. Rör bara filerna under **Äger**. Behöver du ändra något under **Rör inte**, stanna och rapportera det i stället för att ändra. Det är så vi undviker sammanslagningskonflikter.
4. Kör `npm test` och `npm run typecheck` innan varje commit. Nya moduler utan Phaser-beroende ska ha en testfil bredvid sig, `*.test.ts`, i Vitest.
5. Hårdkoda inga spelvärden eller koordinater. Hämta dem från `GAME_SETTINGS` (`src/logic/settings.ts`) och `LAYOUT`/`LANES` (`src/game/layout.ts`).
6. Scenkod får anropa regelkärnan men aldrig räkna ut jämnt/udda själv, och aldrig ändra fälten i en `Round` direkt. Bara `answer`, `reachEnd`, `setActiveEgg` och `createRound` i `src/logic/round.ts` får göra det.
7. Dokumentera i kod med korta kommentarer på engelska där ett val inte är självklart. Övrig dokumentation är på svenska.
8. Rapportera tillbaka enligt mallen i slutet av paketet: ändrade filer, antal tester före/efter, vad som är kontrollerat, öppna frågor och eventuella avvikelser från kontraktet.

## Kontrakt – gemensamma gränssnitt

Alla paket kodar mot de här signaturerna. Den som implementerar en modul får lägga till saker men inte ändra eller ta bort det som står här utan att rapportera det. Typerna `Choice`, `GameMode`, `Egg`, `AnswerRecord` och `Round` finns redan i `src/logic/types.ts`.

### K1. Inmatningslås – `src/game/inputLock.ts` (P1)

```ts
export type InputSource = 'pointer-left' | 'pointer-right' | 'key-left' | 'key-right';

export interface InputLock {
  /** true exakt en gång per nedtryckning; false tills källan har släppts. */
  press(source: InputSource): boolean;
  release(source: InputSource): void;
  /** Släpper alla källor. Används vid scenomstart och när fönstret tappar fokus. */
  reset(): void;
  isHeld(source: InputSource): boolean;
}

export function createInputLock(): InputLock;
```

### K2. Loopens faser – `src/game/flow.ts` (P2)

```ts
import type { GameMode } from '../logic/types';

export type Phase = 'idle' | 'rolling' | 'waiting' | 'resolving' | 'gap';
export type FlowEvent = 'start' | 'answered' | 'reachedEnd' | 'resolved' | 'next' | 'stop';

/** Nästa fas, eller kastar Error vid en övergång som inte är tillåten. */
export function nextPhase(phase: Phase, event: FlowEvent, mode: GameMode): Phase;

/** true bara i 'rolling' och 'waiting'. */
export function acceptsAnswer(phase: Phase): boolean;
```

Tillåtna övergångar:

| Från | Händelse | Till |
| --- | --- | --- |
| `idle` | `start` | `rolling` |
| `rolling` | `answered` | `resolving` |
| `rolling` | `reachedEnd` (träning) | `waiting` |
| `rolling` | `reachedEnd` (utmaning) | `resolving` |
| `waiting` | `answered` | `resolving` |
| `resolving` | `resolved` | `gap` |
| `gap` | `next` | `rolling` |
| alla | `stop` | `idle` |

Allt annat kastar. `idle` är läget innan loopen startat och i `?inspect=1`.

### K3. Äggets rörelse och mål – `src/game/eggMotion.ts` samt tillägg i `src/game/layout.ts` (P3)

```ts
// eggMotion.ts
import type { Choice } from '../logic/types';

export interface EggPose { readonly x: number; readonly y: number; readonly shellRotation: number }

/** Position via positionOnLane och skalets rotation i radianer; talet roteras aldrig. */
export function eggPose(lane: number, progress: number): EggPose;

/** Varv som skalet hinner på en hel färd. Vänstra rännor roterar medurs, högra moturs. */
export const SHELL_TURNS: number;

export function travelMs(): number;  // GAME_SETTINGS.travelSeconds * 1000
export function gapMs(): number;     // GAME_SETTINGS.gapSeconds * 1000

/** Återkopplingsraden: "12 är JÄMNT." Ord från CATEGORY_WORDS. */
export function feedbackText(value: number, category: 'even' | 'odd'): string;
```

```ts
// layout.ts – tillägg, befintliga fält ändras inte
export const LAYOUT = Object.freeze({
  ...,
  ground: { y: number },                    // där ett sprucket ägg landar; nära wolf.baseY
  basketOpening: { offsetY: number },       // korgöppningens avstånd över baskets.*.y
});

/** Punkten ägget flyger till vid fångst i vald korg. */
export function catchTarget(choice: Choice): Point;

/** Punkten ett ägg från rännan `lane` faller till vid fel: rakt under rännans slut, på ground.y. */
export function crackTarget(lane: number): Point;
```

### K4. Resultateffekter – `src/game/resultEffects.ts` (P5)

```ts
import type Phaser from 'phaser';
import type { AnswerRecord, Choice } from '../logic/types';

export interface EffectTargets {
  readonly scene: Phaser.Scene;
  readonly egg: Phaser.GameObjects.Container;     // behållaren 'number-egg'
  readonly shell: Phaser.GameObjects.Image;       // skalet inuti behållaren
  readonly baskets: Readonly<Record<Choice, Phaser.GameObjects.Container>>;
  readonly feedback: Phaser.GameObjects.Text;
}

/** Fångst i korgen för record.correctCategory. Anropar onDone exakt en gång när allt är klart. */
export function playCatch(targets: EffectTargets, record: AnswerRecord, onDone: () => void): void;

/** Sprucket ägg vid crackTarget(lane) och markerad rätt korg. Anropar onDone exakt en gång. */
export function playCrack(targets: EffectTargets, record: AnswerRecord, lane: number, onDone: () => void): void;

/** Tar bort symboler, korgmarkering och sprucket ägg; återställer ägg och korgar till utgångsläge. */
export function clearEffects(targets: EffectTargets): void;
```

Båda `play`-funktionerna ska vara avbrytbara: `clearEffects` stoppar pågående tweens och timers som modulen skapat.

### K5. Scenens publika yta – `src/scenes/GameScene.ts` (P4, P6)

```ts
export interface GameSceneData { mode?: GameMode; inspect?: boolean }   // standard: 'training', false

class GameScene {
  // Befintliga, behålls för ?inspect=1:
  setPreview(value: number, lane: number, progress: number): void;
  setFeedback(text: string): void;
  setButtonState(state: ButtonState, choice?: Choice): void;   // utan choice: båda knapparna

  // Nya:
  startLoop(): void;                       // idle → rolling, första ägget
  submitChoice(choice: Choice, source: InputSource): void;
  readonly phase: Phase;                   // för kontroller och tester
}
```

Scenen startas med `this.scene.start('GameScene', data)` eller via Phaser-konfigurationens `scene`-lista; `init(data)` läser `GameSceneData`. I utvecklingsläge sätter `?mode=challenge` läget och `?inspect=1` sätter `inspect`.

## Vågor och beroenden

```
Våg 1 (parallellt, inga gemensamma filer):   P1 inputLock   P2 flow   P3 eggMotion + layout
Våg 2 (parallellt):                           P4 scen: rulla, svara, knappar   P5 resultEffects
Våg 3 (en agent, äger GameScene):             P6 integration: effekter, rännans slut, nästa ägg, städning
Våg 4 (parallellt):                           P7 sida, README, inspect-läge   P8 verifiering och protokoll
```

P4 och P5 kan starta samtidigt som våg 1 om de kodar mot kontrakten och tillfälligt stubbar det som saknas, men det är enklare att låta våg 1 bli klar först; den är liten. P6 väntar på P4 och P5. P8 är sist.

| Paket | Deluppgifter i detaljplanen | Beroende på |
| --- | --- | --- |
| P1 | 04.1 (låset), del av 04.11 | – |
| P2 | 04.2, del av 04.11 | – |
| P3 | 04.3 (beräkningen), del av 04.11 | – |
| P4 | 04.3 (scenen), 04.4, 04.5 | P1, P2, P3 |
| P5 | 04.6, 04.7 | P3 |
| P6 | 04.8, 04.9 | P4, P5 |
| P7 | 04.10 | P6 |
| P8 | 04.12, resten av 04.11 | P6, P7 |

**Status 2026-10-17:** Våg 1 är klar och sammanslagen i `main`: P1 `78eab3d`, P2 `bde8000`, P3 `8586299` + `6dcc32a`. 197 tester gröna, typkontroll och bygge OK. Inga avvikelser från K1–K3; P2 exporterar dessutom `PHASES`, `FLOW_EVENTS` och `TRANSITIONS`. Nästa: våg 2 (P4, P5) – läs ”Från våg 1” i respektive paket.

---

## P1 – Inmatningslås

**Mål:** En nedhållen knapp eller tangent ger exakt ett svar, aldrig fler. Modulen ska vara ren TypeScript utan Phaser.

**Äger:** `src/game/inputLock.ts`, `src/game/inputLock.test.ts`.
**Rör inte:** allt annat.

**Så löser du det:**

- Implementera K1. Håll de nedtryckta källorna i en `Set<InputSource>`. `press` returnerar `true` och lägger till källan om den inte redan fanns; annars `false`. `release` tar bort. `reset` tömmer.
- Fyra källor enligt K1. Pekare och tangent för samma sida är olika källor: ett finger på vänster knapp hindrar inte vänsterpilen. Det är avsiktligt; regelkärnan hindrar ändå dubbla svar på samma ägg.
- Ingen tidsgräns, ingen automatisk frisläppning. Scenen ansvarar för `reset` vid `blur` och scenomstart.

**Tester som ska finnas:**

- Första `press` ger `true`, andra `press` utan `release` ger `false`.
- `release` följt av `press` ger `true` igen.
- Fyra källor är oberoende av varandra.
- `reset` släpper alla; `isHeld` speglar läget.
- `press` med en okänd sträng kastar `RangeError` (skydd mot felaktiga anrop från scenen).

**Klart när:** Modulen följer K1, testerna ovan passerar, `npm run typecheck` passerar. Uppskattad storlek: under 40 rader kod.

**Rapportera:** ändrade filer, antal tester, eventuella avvikelser från K1.

---

## P2 – Loopens faser

**Mål:** En liten tillståndsmaskin som säger var loopen är och vilka övergångar som är tillåtna, så att scenen inte behöver lösa flaggor.

**Äger:** `src/game/flow.ts`, `src/game/flow.test.ts`.
**Rör inte:** allt annat.

**Så löser du det:**

- Implementera K2 exakt enligt övergångstabellen. Lägg tabellen som data (ett objekt eller en `Map`) och låt `nextPhase` slå upp i den, så att testerna kan gå igenom alla kombinationer.
- `reachedEnd` är den enda händelsen där `mode` spelar roll. Alla andra ignorerar `mode`.
- `stop` är tillåtet från alla faser och går till `idle`. Används vid scenomstart, koduppdatering och framtida paus/avslut i uppgift 8.
- Felmeddelandet vid ogiltig övergång ska innehålla fas och händelse, till exempel `Invalid transition: gap + answered`.

**Tester som ska finnas:**

- Varje rad i övergångstabellen, i båda lägena där det är relevant.
- Minst fem ogiltiga övergångar kastar, bland dem `gap + answered`, `resolving + answered`, `idle + answered`, `rolling + next`, `waiting + reachedEnd`.
- `acceptsAnswer` är `true` bara för `rolling` och `waiting`.
- En full varv-sekvens i träning (`start → answered → resolved → next → reachedEnd → answered → resolved`) och i utmaning (`start → reachedEnd → resolved → next`).

**Klart när:** Modulen följer K2, testerna passerar, typkontrollen passerar.

**Rapportera:** ändrade filer, antal tester, eventuella avvikelser från K2.

---

## P3 – Äggets rörelse, mål och återkopplingstext

**Mål:** All beräkning för var ägget är, hur skalet roterar, vart det flyger vid fångst och var det landar vid fel ska finnas i ren kod med tester, så att scen och effekter bara läser värden.

**Äger:** `src/game/eggMotion.ts`, `src/game/eggMotion.test.ts`, `src/game/layout.ts` (endast tillägg enligt K3), `src/game/layout.test.ts` (endast nya tester).
**Rör inte:** `src/scenes/*`, `src/logic/*`, befintliga värden i `LAYOUT` och `LANES`.

**Så löser du det:**

- `eggPose` anropar `positionOnLane` och lägger till `shellRotation = riktning * progress * SHELL_TURNS * 2π`, där riktning är `+1` för rännor som går åt höger (1 och 2) och `-1` för rännor som går åt vänster (3 och 4). Läs riktningen ur `LANES` (`end.x - start.x`), hårdkoda inte ränne-id. `SHELL_TURNS` föreslås vara `2.5`; det ska gå att ändra på ett ställe.
- `travelMs` och `gapMs` läser `GAME_SETTINGS` vid anrop, inte vid modulladdning, så att framtida inställningsändringar i uppgift 6 slår igenom.
- `feedbackText(12, 'even')` ger `"12 är JÄMNT."`. Ordet hämtas från `CATEGORY_WORDS[category].uppercase`.
- I `layout.ts`: lägg till `ground` och `basketOpening` i `LAYOUT`, samt `catchTarget` och `crackTarget` enligt K3. `ground.y` ska ligga strax under den lägsta rännans slut men ovanför `feedback.y`; utgå från `wolf.baseY`. `catchTarget(choice)` är korgens mittpunkt minus `basketOpening.offsetY`. `crackTarget(lane)` är `{ x: lane.end.x, y: ground.y }`.
- Kasta `RangeError` för okända rännor och ogiltiga val, på samma sätt som `positionOnLane` gör.

**Tester som ska finnas:**

- `eggPose` vid `progress` 0 och 1 ger samma position som `positionOnLane`; rotationen är 0 vid 0 och `±SHELL_TURNS·2π` vid 1 med rätt tecken per ränna.
- `feedbackText` för 0, 7, 10 och 20 ger rätt ord och punkt.
- `travelMs`/`gapMs` motsvarar inställningarna.
- `catchTarget` för båda valen ligger inom spelplanen (`BOARD`) och **nedanför** alla rännors slutpunkter, så att fångströrelsen alltid går nedåt.
- `crackTarget` för alla fyra rännor ligger inom spelplanen, under rännans slut och över `LAYOUT.feedback.y`.
- Okänd ränna och ogiltigt val kastar.

**Klart när:** Allt i K3 finns, testerna passerar, befintliga layouttester är oförändrade och gröna.

**Rapportera:** ändrade filer, valda värden för `ground.y`, `basketOpening.offsetY` och `SHELL_TURNS` med en rad motivering, antal tester.

---

## P4 – Scenen: rullande ägg, svar och knappar

**Mål:** Ett ägg rullar från rännans början till slut, barnet kan svara med knapp eller piltangent, och svaret låses vid första trycket. Fångst- och sprickanimation ingår inte (P5/P6); i det här paketet räcker det att ägget stannar och återkopplingsraden visar texten.

**Äger:** `src/scenes/GameScene.ts`, `src/game/visualStyle.ts` (endast tillägg).
**Rör inte:** `src/logic/*`, `src/game/layout.ts`, `src/game/eggMotion.ts`, `src/game/flow.ts`, `src/game/inputLock.ts`, `index.html`, `src/game/previewControls.ts`.
**Förutsätter:** P1, P2, P3 sammanslagna i `main`.

**Från våg 1:** Rotera bara skalbilden, inte containern: `shell.setRotation(pose.shellRotation)`. Värdet är i radianer, så inte `setAngle`. `inputLock` kastar `RangeError` för okända källor även i `release` och `isHeld`. Den manuella kontrollen kan göras i molnarbetsytan med `npx vite` och headless Chromium (Playwright), se `CLAUDE.md`.

**Så löser du det:**

1. **Scenens data och fält.** Lägg till `init(data: GameSceneData)` enligt K5. Fält: `round: Round`, `phase: Phase`, `activeEgg: Egg | null`, `motion: Phaser.Tweens.Tween | null`, `inputLock: InputLock`. I `create` skapas `round = createRound(mode)` och `phase = 'idle'`. Om `data.inspect` är sant stannar scenen i `idle` och beter sig som i dag; annars anropas `startLoop()` sist i `create`.
2. **Spara referenser.** Korgbehållarna (`basket-left`, `basket-right`) och skalet i `number-egg` ska sparas som fält, så att P6 kan bygga ett `EffectTargets`-objekt utan att leta i displaylistan.
3. **`startLoop` och `startEgg`.** `startLoop` sätter `phase = nextPhase(phase, 'start', mode)` och anropar `startEgg`. `startEgg`: `egg = createRandomEgg(sessionEggIds)`, `setActiveEgg(round, egg)`, placera ägget med `eggPose(egg.lane, 0)`, sätt talet, återställ skalets rotation och synlighet, sätt knapparna till `normal`. Starta en tween på ett objekt `{ progress: 0 }` till `1` under `travelMs()` med `onUpdate` som sätter position och `shell.rotation` från `eggPose`. `onComplete` anropar `onReachEnd()`.
4. **`onReachEnd`.** Anropar `reachEnd(round, egg.id)`. Om det returnerar `null` (träning): `phase = nextPhase(phase, 'reachedEnd', mode)` → `waiting`, ägget står kvar vid slutet. Om det returnerar en svarspost (utmaning): samma övergång → `resolving`, och `resolve(record)` anropas.
5. **Inmatning.** Varje knapp får `setInteractive(new Phaser.Geom.Rectangle(...), Phaser.Geom.Rectangle.Contains)` över hela sin rundade rektangel, med `pointerdown` → `submitChoice(choice, 'pointer-left'|'pointer-right')` och `pointerup`/`pointerupoutside` → `inputLock.release(...)`. Tangenter: `this.input.keyboard.on('keydown-LEFT'/'keydown-RIGHT')` → `submitChoice(..., 'key-left'|'key-right')`, med `event.repeat` ignorerat, och `keyup-LEFT`/`keyup-RIGHT` → `release`. `window` `blur` → `inputLock.reset()`; lyssnaren tas bort i `shutdown`.
6. **`submitChoice`.** Exakt i den här ordningen: om `!acceptsAnswer(phase)` → return; om `!inputLock.press(source)` → return; `record = answer(round, activeEgg.id, choice)`; om `null` → return; stoppa `motion`; `phase = nextPhase(phase, 'answered', mode)`; visa `pressed` på den tryckta knappen i 150 ms via `this.time.delayedCall`, därefter `inactive` på båda; anropa `resolve(record)`.
7. **`resolve(record)` i det här paketet** är tillfällig: sätt återkopplingsraden till `feedbackText(record.value, record.correctCategory)` och lämna ägget där det är. P6 byter ut kroppen mot effekterna. Markera metoden med en kommentar `// Replaced in P6`.
8. **`setButtonState(state, choice?)`.** Utöka så att en enskild knapp kan sättas. Behåll beteendet utan `choice`.
9. **Städning.** I `shutdown` (och `destroy`): stoppa tweenen, ta bort tangent- och fönsterlyssnare, `inputLock.reset()`, `phase = nextPhase(phase, 'stop', mode)`. Koduppdatering via Vite ska ge exakt en canvas och inga kvarvarande lyssnare.
10. **`?mode=challenge`.** Läs `location.search` i `main.ts`? Nej – `main.ts` ägs inte av paketet. Läs i `init` om `data.mode` saknas: `import.meta.env.DEV && new URLSearchParams(location.search).get('mode') === 'challenge'`. Samma mönster som den befintliga `inspect`-kontrollen.

**Kontroll (manuell, i `npm run dev`):**

- Ägget rullar på alla fyra rännor på cirka 3 sekunder, talet är upprätt, skalet roterar.
- Vänster knapp, höger knapp, vänsterpil och högerpil ger var sin återkopplingstext. Ett andra tryck under samma ägg gör ingenting.
- Nedhållen pil: en text, inte flera. Släpp och tryck igen på samma ägg: inget (ägget är bedömt).
- Träning: ägget stannar vid slutet och kan besvaras därifrån. `?mode=challenge`: slutet ger texten utan tryck.
- Inga konsolfel. Omladdning och koduppdatering ger en canvas.

Loopen fortsätter inte till nästa ägg i det här paketet; det är avsiktligt.

**Klart när:** Allt i kontrollistan fungerar, `npm test`, `npm run typecheck` och `npm run build` passerar, och `?inspect=1` fungerar som förut.

**Rapportera:** ändrade filer, vad som kontrollerats och i vilken webbläsare, avvikelser från K5, samt exakt vilka fält P6 kan använda för `EffectTargets`.

---

## P5 – Fångst- och sprickeffekter

**Mål:** Två korta animationer som gör resultatet tydligt med rörelse och symbol, inte bara färg, inkapslade i en modul som scenen anropar med ett `onDone`.

**Äger:** `src/game/resultEffects.ts`, `src/game/visualStyle.ts` (endast tillägg av färger/mått för effekter), `docs/artwork-v1/ARTWORK.md` (endast om en bildfil läggs till), `public/assets/images/` (endast nya filer).
**Rör inte:** `src/scenes/*`, `src/logic/*`, `src/game/layout.ts`, `src/game/eggMotion.ts`.
**Förutsätter:** P3 i `main` (för `catchTarget`, `crackTarget`, `feedbackText`).

**Från våg 1 (P3):** `LAYOUT.ground.y` = 404 (vargens marklinje, `wolf.baseY`), `LAYOUT.basketOpening.offsetY` = 36 (mitten av korgens mörka öppning), vilket ger `catchTarget` y = 302.

- `crackTarget` hamnar vid foten av korgen på samma sida som rännan (rännorna 1–2 ligger över vänster korg, 3–4 över höger). Rita det fallande och spruckna ägget framför korgen, annars kan ett fel svar se ut som en fångst.
- Ett helt ägg (100 px) på `ground.y` täcker y 354–454: korgskyltens nederkant, återkopplingsraden och 2 px av knapparna. Platta till det spruckna ägget till ungefär 50 px höjd.
- Vid `catchTarget` täcker ett helt ägg korgens framkant. Krymp ägget när det åker in, eller lägg det bakom korgens framkant.

**Så löser du det:**

Implementera K4. Allt skapas i `targets.scene` och förankras på spelplanens logiska koordinater (960 × 540); skalning sköts av Phasers `FIT`.

**`playCatch`:**

1. Mål: `catchTarget(choiceForCategory(record.correctCategory))`.
2. Tween på `targets.egg` från nuvarande position till målet, cirka 450 ms, med en mjuk båge: tweena `x` linjärt och `y` med `Sine.easeIn`, eller använd två kedjade tweens (upp lite, sedan ned). Skalets rotation får fortsätta; talet förblir upprätt eftersom det är ett separat objekt.
3. Vid ankomst: korgen i `targets.baskets[choice]` studsar (skala 1 → 1,08 → 1 på cirka 200 ms), ägget tonas ut (alpha → 0 på 150 ms) och en bocksymbol visas vid korgen i cirka 500 ms. Rita symbolen med Graphics (ljus cirkel, mörk bock) eller en textsymbol `✓` i `STYLE.text.feedback`-storlek; välj det som ser bäst ut i skalad storlek.
4. Sätt `targets.feedback` till `feedbackText(record.value, record.correctCategory)`.
5. När sista tweenen är klar: `onDone()` exakt en gång. Hela sekvensen under ungefär en sekund.

**`playCrack`:**

1. Mål: `crackTarget(lane)`.
2. Tween på `targets.egg` rakt ned till målet, cirka 300 ms, `Quad.easeIn`.
3. Vid landning: dölj skalet (`shell.setVisible(false)`) och visa ett sprucket ägg ritat med Graphics på samma position: två ljusa skalhalvor med mörk kontur och en gul fläck, i samma stil som övrig grafik. Talet ska synas kvar strax ovanför. Om en ritad form inte håller stilen, lägg i stället `egg-cracked-v1.png` i `public/assets/images/`, beskriv den i `ARTWORK.md` och ladda den i modulen med `import.meta.env.BASE_URL` (observera att scenen då behöver ladda bilden i `preload`; rapportera det till P6).
4. Samtidigt: rätt korg (`choiceForCategory(record.correctCategory)`) får en tydlig ring eller kontur runt sig (Graphics, 5–7 px, ljus färg från `STYLE`) och en studs. En kryssymbol `✗` visas vid det spruckna ägget.
5. Sätt `targets.feedback` enligt samma text.
6. `onDone()` exakt en gång när animationerna är klara, under ungefär en sekund. Det spruckna ägget, ringen och symbolerna ligger kvar tills `clearEffects`.

**`clearEffects`:** stoppar modulens tweens och timers, tar bort symboler, ring och sprucket ägg, sätter korgarnas skala till 1, visar skalet igen, sätter äggets alpha till 1 och tömmer återkopplingsraden. Ska vara ofarlig att anropa flera gånger och utan föregående `play`.

Håll modulens objekt i en intern lista per `targets.scene` så att `clearEffects` vet vad som ska bort. Inga globala variabler.

**Kontroll:** Modulen kan inte provas i Vitest (Phaser kräver webbläsare). Verifiera i stället tillfälligt via `?inspect=1`: lägg **lokalt, utan att committa**, två knappar i `previewControls.ts` som anropar `playCatch`/`playCrack` med ett konstruerat `AnswerRecord`, och kontrollera båda effekterna från alla fyra rännor och båda korgarna. Ta bort den lokala ändringen före commit och beskriv i rapporten hur du provade. P7 lägger till permanenta kontroller.

**Klart när:** K4 är implementerad, båda effekterna och `clearEffects` är visuellt kontrollerade från alla rännor, typkontroll och bygge passerar, inga nya konsolvarningar.

**Rapportera:** ändrade filer, ritad form eller bildfil, animationstider, hur du provade, och om scenen behöver ladda något i `preload`.

---

## P6 – Integration: effekter, rännans slut, nästa ägg, städning

**Mål:** Loopen sluter sig: svar → effekt → paus → nytt ägg, om och om igen, utan att något blir kvar.

**Äger:** `src/scenes/GameScene.ts`, `src/game/config.ts` (bara om scenstart behöver data).
**Rör inte:** `src/logic/*`, `src/game/*.ts` utom genom rapporterade behov.
**Förutsätter:** P4 och P5 i `main`.

**Så löser du det:**

1. Bygg ett `EffectTargets`-objekt i `create` av fälten från P4. Ladda eventuell bild som P5 rapporterat i `preload`.
2. Byt kroppen i `resolve(record)`: `outcome === 'correct'` → `playCatch(targets, record, onResolved)`; `wrong-basket` och `unanswered` → `playCrack(targets, record, activeEgg.lane, onResolved)`.
3. `onResolved`: `phase = nextPhase(phase, 'resolved', mode)`; starta `this.time.delayedCall(gapMs(), nextEgg)`. Spara timern i ett fält.
4. `nextEgg`: `clearEffects(targets)`; `phase = nextPhase(phase, 'next', mode)`; `startEgg()` (från P4). Regelkärnan tillåter nytt ägg eftersom föregående är bedömt; om `setActiveEgg` kastar är det ett fel i loopen och ska synas i konsolen, inte sväljas.
5. Utmaning vid rännans slut: `onReachEnd` från P4 anropar redan `resolve(record)`; kontrollera att det går via `playCrack` med `unanswered`.
6. `aria-label` på `#game` uppdateras vid nytt ägg (`"Ett ägg med talet 12 rullar"`) och vid resultat (återkopplingstexten).
7. Städning: `shutdown` stoppar också gap-timern och anropar `clearEffects`. Kontrollera koduppdatering och `scene.restart()` från inspect-panelen.
8. Samma `Round` används under hela provspelet; `round.answers` ska växa med en post per ägg. Lägg en `console.debug` bakom `import.meta.env.DEV` som skriver ut varje svarspost; den hjälper P8.

**Kontroll (manuell):**

- Tio ägg i följd med blandade utfall. Inget sprucket ägg, ring eller symbol finns kvar när nästa ägg startar.
- Rätt svar tidigt, i mitten och sent på varje ränna ger fångst i rätt korg. Fel svar på varje ränna ger sprickning med rätt korg markerad.
- Träning: vänta vid slutet, svara därifrån, båda utfallen. Utmaning: låt tre ägg passera utan svar.
- Tryck under `resolving` och `gap` gör ingenting. Dubbeltryck ger ett resultat.
- Storleksbyte under färden: ägget fortsätter på banan.
- Omladdning, koduppdatering, scenomstart: en canvas, inga konsolfel.

**Klart när:** Hela kontrollistan är gjord, `npm test`, `npm run typecheck` och `npm run build` passerar.

**Rapportera:** ändrade filer, vad som kontrollerats, upplevd rytm med `travelSeconds: 3` och `gapSeconds: 0.8` (för P8 och uppgift 6), eventuella avvikelser.

---

## P7 – Sidan runt spelet, README och inspect-läge

**Mål:** Sidtexterna beskriver ett provspel, README beskriver styrningen, och utvecklingskontrollerna fungerar med loopen.

**Äger:** `index.html`, `src/style.css`, `README.md`, `src/game/previewControls.ts`, `src/main.ts` (endast texter).
**Rör inte:** `src/scenes/*`, `src/logic/*`, övriga `src/game/*`.
**Förutsätter:** P6 i `main`.

**Så löser du det:**

- `index.html`: titel `Egg Catcher – provspel`, `meta description` och `aria-label` utan ordet förhandsvisning, `.prototype` visar `Provspel · träning` (eller `utmaning`, sätts från `main.ts` utifrån samma `?mode`-läsning som scenen – om det kräver en delad hjälpfunktion, rapportera i stället för att duplicera logiken). Fotnoten byts till **”Tryck på knapparna eller använd ← och →.”** Statusraden visar `Spelet är igång`.
- `previewControls.ts`: panelen fungerar fortfarande med `?inspect=1` (scenen står i `idle`). Lägg till tre knappar: **Spela ett ägg** (`scene.startLoop()`), **Visa fångst** och **Visa sprickning** (anropar `playCatch`/`playCrack` via ett konstruerat `AnswerRecord` på det ägg som visas, följt av `clearEffects` vid nästa val). Det ger P5:s tillfälliga kontroll ett permanent hem, fortfarande bara i utvecklingsläge.
- `README.md`: nytt stycke om styrning (knappar, piltangenter), `?mode=challenge`, att `?inspect=1` kan spela ett ägg och visa effekterna; uppdatera tabellen över projektets platser med `inputLock.ts`, `flow.ts`, `eggMotion.ts`, `resultEffects.ts`; byt första styckets beskrivning från förhandsvisning till provspel.
- `style.css`: bara om någon ny text behöver en stil.

**Klart när:** Inga sidtexter nämner förhandsvisning, inspect-panelen kan spela ett ägg och visa båda effekterna, README stämmer, bygget passerar och produktionsbygget innehåller inte panelen.

**Rapportera:** ändrade filer och de exakta texterna som nu visas.

---

## P8 – Verifiering och protokoll

**Mål:** Grundloopen är provspelad enligt detaljplanens 04.12 och resultatet dokumenterat så att huvuduppgift 4 kan kryssas i.

**Äger:** `docs/VERIFIERING-04.md` (ny), `docs/detaljerade-uppgifter-4.md` (endast kryssrutor och statusrad), `docs/UPPGIFTER.md` (endast kryssrutan för 04), `CLAUDE.md` (avsnitten Nuläge och Nästa steg), `docs/screenshots-04/` (ny, valfri).
**Rör inte:** `src/*`. Hittar du fel, rapportera dem; rätta inte.
**Förutsätter:** P6 och P7 i `main`.

**Så löser du det:**

- Skriv `VERIFIERING-04.md` i samma form som `VERIFIERING-03.md`: datum, miljö (Node-version, webbläsare), antal tester, och en kryssad lista enligt 04.12 i detaljplanen: rätt tidigt/mitten/sent på fyra rännor, fel på fyra rännor, väntande ägg i träning, uteblivet svar i utmaning, dubbeltryck, nedhållen tangent, finger kvar på knappen, tangent släppt utanför fönstret, tio ägg + omladdning + koduppdatering, storleksbyte under färd, dator och stående surfplatta (simulerad räcker; riktig surfplatta hör till uppgift 10).
- Notera upplevd rytm och förslag till justering av `travelSeconds`/`gapSeconds`, utan att ändra dem.
- Kontrollera att `npm test` innehåller testerna från P1–P3 och att antalet stämmer med rapporterna.
- Kryssa i 04.1–04.12 i detaljplanen när respektive färdigkriterium är uppfyllt; lämna öppna rutor om något saknas och skriv varför. Kryssa i 04 i `UPPGIFTER.md` bara om allt är klart.
- Uppdatera `CLAUDE.md`: nuläge, nästa steg (uppgift 05 eller 06, enligt `UPPGIFTER.md`), öppna punkter.

**Klart när:** Protokollet finns, alla kontroller är gjorda och dokumenterade, kryssrutor och `CLAUDE.md` stämmer med verkligheten.

**Rapportera:** länk till protokollet, lista över fel som hittades (för separata rättningar), och vad som lämnades öppet.

---

## Rapportmall (kopieras av varje agent)

```
Paket: P<N> – <namn>
Gren: 04-p<N>-<kortnamn>, commit <hash>
Ändrade filer:
  - ...
Tester: <före> → <efter> (npm test), typecheck OK/FEL, build OK/FEL
Kontrollerat:
  - ...
Avvikelser från kontraktet: inga / ...
Behov i andra paket: inga / ...
Öppna frågor: inga / ...
```

## Sammanslagning

Paketen slås ihop i vågordning till `main`, var och en efter att dess rapport är läst och `npm test` + `npm run typecheck` har körts på den sammanslagna koden. Efter varje våg uppdateras raden ”Nuläge” i `CLAUDE.md`. Publicering till servern görs tidigast efter P6, helst efter P7, med det vanliga deploy-flödet.
