# Kontrollprotokoll – uppgift 1

Datum: 2026-10-06. Lokal miljö: macOS ARM64. Projektets Node 24.21.0 användes separat från datorns globala Node 26.3.1. npm följer med Node-installationen.

## Verifierat lokalt

- [x] **01.1–01.4:** versionsval, projektfiler, exakta paketversioner, låsfil och mappstruktur.
- [x] **01.5:** avsiktligt typfel upptäcktes med TS2322; provfilen togs bort.
- [x] **01.6:** startscenen visades i webbläsaren utan konsolfel. En sparad kodändring ändrade den synliga texten och lämnade exakt en canvas. Provtexten återställdes.
- [x] **01.7:** `dev`, `typecheck`, `build` och `preview` kördes. Typfelet stoppade även `build` före Vite.
- [x] **01.8–01.9:** README stämdes av. Ren `npm ci --include=dev` från låsfilen kördes i en separat katalog och följdes av lyckat bygge med Node 24.21.0.
- [x] Mobilbredd 390 px: canvas 362 × 203,625 px, ingen horisontell överrinning. Desktopbredd 1280 px: canvas 1040 × 585 px. Båda behöll proportionerna 16:9.
- [x] `bash -n scripts/deploy.sh` och Node-syntaxkontroll av båda hjälpskripten.
- [x] Apache 2.4.67: mallen kontrollerades med `httpd -t` och kördes isolerat på loopback. Endast lyssningsadress, sökvägar och testvärd ersattes i testkonfigurationen.
- [x] Två riktiga byggkataloger med testmanifest: A aktiverades, B kontrollerades och aktiverades, A:s resursadresser fungerade fortfarande och pekaren återställdes till A.
- [x] Webbkontrollen avvisade fel version och avsiktligt skadad JavaScript genom jämförelse av SHA-256. Testskadan återställdes.
- [x] HTTP-kontroll: startsida och versionsfil fick `no-store`; versionsspecifik JavaScript fick `public, max-age=31536000, immutable`.

Apache-testet använde separata testversioner och tillfälliga kataloger. Det bevisar inte att hela Linux-skriptet har körts på Debian: automatisk återställning, `flock`, rensning och serverns faktiska behörigheter återstår att verifiera där.

## GitHub

- [x] Befintligt repo återanvänt: `git@github.com:landychev/egg.git`.
- [x] Gren `main` och fjärråtkomst verifierade.
- [ ] **01.10:** den kontrollerade implementationen har pushats och fjärrgrenen jämförts med lokal commit.

## Kvar på Debian

- [ ] **01.11:** inventering, separat användare, Node, Apache VirtualHost, DNS och HTTPS.
- [ ] **01.12:** riktig publicering genom skriptet och test av samtidighetslåset.
- [ ] **01.13:** byggfel lämnar befintlig version aktiv; automatisk/manuell återställning och rensning har provats på Linux.
- [ ] **01.14:** synlig ändring har gått från lokal dator via GitHub till den publika HTTPS-adressen; en äldre öppen session har provats.

Servern svarade på SSH men nekade tillgänglig nyckel. Ägaren använder lösenordsinloggning. Ingen serverkonfiguration, DNS eller certifikat har ändrats. Uppgiven Debian-version 13.7 är ännu inte verifierad mot serverns systemfiler.

Hela huvuduppgift 1 är därför fortfarande öppen. [SERVER.md](SERVER.md) beskriver nästa steg.

## Känd bygginformation

Phaser ger en JavaScript-fil på cirka 1,38 MB (cirka 358 kB gzip). Vite varnar för paketstorleken; typkontroll, bygge och webbläsarkontroller passerade. Paketstorlek och laddningstid kan optimeras när spelinnehållet har införts. Det finns ännu inga automatiserade regeltester; dessa hör till uppgift 2.
