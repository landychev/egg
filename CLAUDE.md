# Egg Catcher – startpunkt för varje session

Läs den här filen först. Läs sedan **bara** det som tabellen under ”Var detaljer finns” pekar på för dagens uppgift. Uppdatera avsnitten ”Nuläge” och ”Nästa steg” som sista steg i varje session.

## Vad spelet är

Matematikspel för barn 7–9 år: en varg fångar ägg med tal 0–20 som rullar längs fyra rännor; barnet väljer JÄMNT (vänster) eller UDDA (höger). Rätt val ger alltid fångst, fel val ger sprucket ägg och markerad rätt korg. Träningsläge (ägget väntar vid slutet) och utmaningsläge (poäng, tre liv). TypeScript + Phaser 4 + Vite, regelkärna utan Phaser i `src/logic/`.

## Nuläge (2026-10-17)

- Huvuduppgift **01–03 implementerade**; 02 och 03 är avprickade. 01 väntar bara på två serverprov (se öppna punkter).
- Senaste commit: `167f62f` (korg-/rännejustering, verifiering av 03, plan för 04). Live på <https://egg.landychev.se/> ligger `996e751` tills nästa deploy.
- Sidan visar en stillastående spelplan. Knapparna är inaktiva – spelet blir spelbart i uppgift 04.
- Tester: 134 i 9 filer, `npm test` och `npm run typecheck` gröna lokalt.

## Nästa steg

Uppgift 04 är uppdelad i åtta arbetspaket i `docs/arbetspaket-04.md`, med gemensamma gränssnitt (avsnittet **Kontrakt**) så att paketen kan byggas parallellt av olika agenter.

1. **Våg 1** – P1 `inputLock`, P2 `flow`, P3 `eggMotion` + layout-tillägg (rena moduler, parallellt)
2. **Våg 2** – P4 scen: rulla/svara/knappar, P5 `resultEffects` (parallellt)
3. **Våg 3** – P6 integration (en agent), sedan P7 sida/README och P8 verifiering

Att skicka ett paket till en agent: kopiera ”Instruktion till varje agent” + ”Kontrakt” + det aktuella paketet ur `arbetspaket-04.md`. Läs själv bara det paket som är aktuellt; detaljplanen `detaljerade-uppgifter-4.md` är bakgrund.

## Öppna punkter som väntar på Aleksei

- `git push` görs från Mac:en (assistentens skal når inte GitHub via SSH).
- Uppgift 01 kan kryssas i efter två prov på servern vid nästa deploy: `deploy.sh rollback` (01.13) och två samtidiga `deploy`-anrop (01.12). Notera resultatet i `docs/VERIFIERING-01.md`.
- Prov på riktig surfplatta görs i uppgift 10, inte tidigare.

## Var detaljer finns – och när de ska läsas

| Fil | Läs när |
| --- | --- |
| `docs/UPPGIFTER.md` | Du behöver överblick över alla tio huvuduppgifter eller ska kryssa i en. Kryssraderna räcker: `grep -nE '^### |^- \[' docs/UPPGIFTER.md` |
| `docs/detaljerade-uppgifter-N.md` | Bara under arbete på uppgift N, och då bara aktuellt avsnitt `## N.x` |
| `docs/VERIFIERING-0N.md` | Bara när uppgift N verifieras eller dess protokoll uppdateras |
| `docs/SPELDESIGN.md` | Bara vid designfrågor (regler, lägen, pedagogik). Avsnitt 5–7 och 10 är de som rör spelmekaniken |
| `docs/TEKNIKVAL.md` | Nästan aldrig; versioner står i README |
| `docs/SERVER.md` | Bara vid serverarbete |
| `src/logic/README.md` | När scener ska anropa regelkärnan (kort, läs hela) |
| `README.md` | När kommandon, filplatser eller publiceringsflödet behövs |

Hela filer på 20–30 kB (SPELDESIGN, detaljplanerna) ska inte läsas in i sin helhet utan anledning.

## Arbetsregler

- `docs/` i repot är enda platsen för planer, protokoll och bilder. Inga kopior i projektmappens rot.
- Kontroller körs på Mac:en: `npm test`, `npm run typecheck`, `npm run build`. Assistentens skal kan inte köra dem (plattformsbundna binärer) – lita på Aleksei eller protokollet.
- Publicering: Aleksei kör `git pull` och `bash scripts/deploy.sh` som root på Debian. Assistenten publicerar aldrig själv.
- Visuell kontroll görs mot <https://egg.landychev.se/> i appens inbyggda webbläsare efter deploy; lokal dev-server nås inte därifrån.
- En huvuduppgift kryssas i först när dess ”Klart när” är kontrollerat och ett protokoll finns. Deluppgifter kryssas i detaljplanen.
- Enkla lösningar först. Spelvärden från `GAME_SETTINGS`, layout från `src/game/layout.ts`, inga hårdkodade tal i scenerna.
- Commit-meddelanden på engelska, dokumentation på svenska. Ändringar i `src/` ska ha gröna tester innan commit.
