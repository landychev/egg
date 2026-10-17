# Egg Catcher – startpunkt för varje session

Läs den här filen först. Läs sedan **bara** det som tabellen under ”Var detaljer finns” pekar på för dagens uppgift. Uppdatera avsnitten ”Nuläge” och ”Nästa steg” som sista steg i varje session.

## Vad spelet är

Matematikspel för barn 7–9 år: en varg fångar ägg med tal 0–20 som rullar längs fyra rännor; barnet väljer JÄMNT (vänster) eller UDDA (höger). Rätt val ger alltid fångst, fel val ger sprucket ägg och markerad rätt korg. Träningsläge (ägget väntar vid slutet) och utmaningsläge (poäng, tre liv). TypeScript + Phaser 4 + Vite, regelkärna utan Phaser i `src/logic/`.

## Nuläge (2026-10-17)

- Huvuduppgift **01–03 implementerade**; 02 och 03 är avprickade. 01 väntar bara på två serverprov (se öppna punkter).
- Uppgift 04: **våg 1 klar** i `main` – P1 `inputLock`, P2 `flow`, P3 `eggMotion` + `ground`/`basketOpening`/`catchTarget`/`crackTarget` i `layout.ts`. Rena moduler; inget syns på sidan förrän scenen använder dem i P4. Deluppgifterna 04.1–04.3 är bara delvis klara (scendelen återstår) och är därför inte kryssade.
- Senaste kodcommit: `6dcc32a` (P3). Live på <https://egg.landychev.se/> ligger `996e751` tills nästa deploy.
- Sidan visar en stillastående spelplan. Knapparna är inaktiva – spelet blir spelbart i uppgift 04.
- Tester: 197 i 12 filer; `npm test`, `npm run typecheck` och `npm run build` gröna (körda i molnarbetsytan).

## Nästa steg

Uppgift 04 är uppdelad i åtta arbetspaket i `docs/arbetspaket-04.md`, med gemensamma gränssnitt (avsnittet **Kontrakt**) så att paketen kan byggas parallellt av olika agenter. Status per våg står under tabellen i ”Vågor och beroenden”.

1. **Våg 2** – P4 scen: rulla/svara/knappar, P5 `resultEffects` (parallellt). Båda paketen har ett stycke ”Från våg 1” med värden och fallgropar från P3.
2. **Våg 3** – P6 integration (en agent), sedan P7 sida/README och P8 verifiering.

Att skicka ett paket till en agent: hänvisa till ”Instruktion till varje agent”, rätt kontrakt och det aktuella paketet i `arbetspaket-04.md` (med radintervall), och tala om att kontrollerna går att köra i molnarbetsytan (se arbetsreglerna). Läs själv bara det paket som är aktuellt; detaljplanen `detaljerade-uppgifter-4.md` är bakgrund.

Så kördes våg 1, och det fungerade: klona repot till molnarbetsytan, `npm ci`, en `git worktree` per paket med grenen `04-p<N>-<namn>` och `node_modules` som symlänk till klonen, en agent per worktree, sedan rebase i vågordning och fast-forward till `main` med kontrollerna på den sammanslagna koden.

## Öppna punkter som väntar på Aleksei

- `git push` görs från Mac:en (assistentens skal når inte GitHub via SSH).
- Uppgift 01 kan kryssas i efter två prov på servern vid nästa deploy: `deploy.sh rollback` (01.13) och två samtidiga `deploy`-anrop (01.12). Notera resultatet i `docs/VERIFIERING-01.md`.
- Två visuella val avgörs i P8: hur många varv skalet roterar (`SHELL_TURNS` 2,5 nu, ungefär 0,7 vore verklig rullning) och om det är tydligt nog att det spruckna ägget landar vid korgen på samma sida som rännan.
- Prov på riktig surfplatta görs i uppgift 10, inte tidigare.

## Var detaljer finns – och när de ska läsas

| Fil | Läs när |
| --- | --- |
| `docs/UPPGIFTER.md` | Du behöver överblick över alla tio huvuduppgifter eller ska kryssa i en. Kryssraderna räcker: `grep -nE '^### |^- \[' docs/UPPGIFTER.md` |
| `docs/detaljerade-uppgifter-N.md` | Bara under arbete på uppgift N, och då bara aktuellt avsnitt `## N.x` |
| `docs/arbetspaket-04.md` | Under uppgift 04: instruktionen, kontrakten och det aktuella paketet. Rubrikerna: `grep -nE '^#{2,3} ' docs/arbetspaket-04.md` |
| `docs/VERIFIERING-0N.md` | Bara när uppgift N verifieras eller dess protokoll uppdateras |
| `docs/SPELDESIGN.md` | Bara vid designfrågor (regler, lägen, pedagogik). Avsnitt 5–7 och 10 är de som rör spelmekaniken |
| `docs/TEKNIKVAL.md` | Nästan aldrig; versioner står i README |
| `docs/SERVER.md` | Bara vid serverarbete |
| `src/logic/README.md` | När scener ska anropa regelkärnan (kort, läs hela) |
| `README.md` | När kommandon, filplatser eller publiceringsflödet behövs |

Hela filer på 20–30 kB (SPELDESIGN, detaljplanerna, arbetspaketen) ska inte läsas in i sin helhet utan anledning.

## Arbetsregler

- `docs/` i repot är enda platsen för planer, protokoll och bilder. Inga kopior i projektmappens rot.
- Kontrollerna `npm test`, `npm run typecheck` och `npm run build` körs i molnarbetsytan: `git clone https://github.com/landychev/egg.git` (läsåtkomst via HTTPS fungerar) och `npm ci`. Där finns Node 22.22, vilket räcker trots att `engines` anger 22.23. I Mac-mappen går de inte att köra från assistentens skal (`node_modules` har macOS-binärer); där kör Aleksei dem.
- Visuell kontroll före deploy: `npx vite --port <port>` i molnarbetsytan och skärmbilder, klick och tangenttryck med headless Chromium via Playwright (Python). Varningar om WebGL i mjukvara kommer från headless-läget och är inte spelets fel. Slutlig kontroll görs mot <https://egg.landychev.se/> i appens inbyggda webbläsare efter deploy.
- Publicering: Aleksei kör `git pull` och `bash scripts/deploy.sh` som root på Debian. Assistenten publicerar aldrig själv.
- En huvuduppgift kryssas i först när dess ”Klart när” är kontrollerat och ett protokoll finns. Deluppgifter kryssas i detaljplanen.
- Enkla lösningar först. Spelvärden från `GAME_SETTINGS`, layout från `src/game/layout.ts`, inga hårdkodade tal i scenerna.
- Commit-meddelanden på engelska, dokumentation på svenska. Ändringar i `src/` ska ha gröna tester innan commit.
