# Kontrollprotokoll – uppgift 2

Datum: 2026-10-07. Lokal miljö: macOS ARM64, Node.js 22.23.3, npm 10.9.9.
Vitest 5.0.3 är låst i `package.json` och `package-lock.json`.

## Kontrollerade färdigkriterier

| Del | Kontroll |
| --- | --- |
| 02.1 | `npm test` kör Vitest utan bevakningsläge. Ett tillfälligt felande test gav avslutskod 1 och hindrade följande bygge i kontrollkedjan. Provtestet togs bort. |
| 02.2 | Typkontroll av alla käll- och testfiler. Typtester låser kategorier, val, lägen, utfall och äggstatus. Utan svar kräver `choice: null` och utmaningsläge. |
| 02.3 | Inställningarna är frysta. Ogiltiga intervall, heltal och tidsvärden avvisas, inklusive minsta tal 30. |
| 02.4 | Alla 21 tal har kontrollerats, med noll uttryckligen som jämnt. −1, 21, decimaltal och icke ändliga tal avvisas. |
| 02.5–02.6 | Båda knapparna översätts i båda riktningar. Svenska ord finns i versaler och gemener. |
| 02.7 | Bestämd slump ger båda ändpunkterna; ogiltiga slumpvärden och intervall avvisas. |
| 02.8 | Hundra anrop ger id 1–100. Separata räknare är oberoende; omstarter delar sidans räknare. |
| 02.9–02.10 | Bestämda och slumpade ägg valideras. Alla 21 tal och fyra rännor nås med styrd slump. 1 000 vanligt slumpade ägg ligger inom intervallen. |
| 02.11 | En tom omgång saknar ägg och svar. Ett rullande eller väntande ägg kan inte ersättas. Ett bedömt ägg kan ersättas; dess id kan inte återanvändas. |
| 02.12 | Rätt/fel korg, noll, dubbeltryck, gammalt id, inget aktivt ägg och svar efter väntan är kontrollerade. |
| 02.13 | Slutet ger utan svar i utmaning och väntan utan svarspost i träning. Dubbla eller gamla sluthändelser ignoreras. |
| 02.14 | Exakt ett rätt val per tal i båda lägena. Tryck/slut i båda ordningarna ger högst en post. Omstart isolerar träningssvar från utmaning och ignorerar gamla ägg-id:n. |

`npm test`: **129 tester i 8 filer godkända**.
`npm run typecheck`: **godkänd**.
`npm run build`: **godkänt**.

Regelkoden har granskats: inga Phaser-importer, webbläsaranrop, timers eller
positioner i `src/logic/`. Justerbara värden hämtas från `settings.ts`.
Tester använder uttryckliga förväntade värden från speldesignen.

## Kontroller före publicering

`scripts/deploy.sh` kör redan `npm run test --if-present` före bygget och har
`set -Eeuo pipefail`. Nu finns testkommandot, så regeltesterna körs och ett
testfel stoppar en ny publicering. Befintlig Debian-kontroll i GitHub Actions
har också fått `npm test` före bygget.

Den nya regelkärnan och kontrollkedjan har verifierats lokalt. Ingen ny körning
av GitHub Actions eller publicering på Debian ingår i denna verifiering.
Tidigare återstående serverkontroller för uppgift 1 är fortsatt separata.

## Omfattning och kvarvarande arbete

Samtliga 14 deluppgifter i punkt 2 är verifierade. Scenen använder ännu inte
regelkärnan för spelhandlingar. Den gemensamma id-räknaren initieras när sidan
laddas, men spelplan, knappar och animationer kopplas in i uppgift 3–4.

Träningens omförsök och bekräftelseägg, poäng/kombo/liv, paus och resultatskärm
återstår enligt huvudplanen. Färdtid 3 s, mellanrum 0,8 s, nivåfaktor 0,8 och
nivågräns 10 rätt är enbart platshållare i inställningarna.

Bygget visar den redan kända varningen om Phasers paketstorlek (cirka 1,38 MB,
cirka 358 kB gzip). Inget byggfel rapporteras. Ingen visuell speltestning eller
test med målgruppen har gjorts inom uppgift 2.

Testverktygets arbetsgång följer [Vitests officiella guide](https://vitest.dev/guide/).
