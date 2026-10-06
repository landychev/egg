# Kontrollprotokoll – uppgift 1

Datum: 2026-10-06. Lokal miljö: macOS ARM64. De ursprungliga kontrollerna använde Node 24.21.0 separat från datorns globala Node 26.3.1. Projektet har därefter anpassats till serverns Node 22.23.3; resultat av omkontrollen redovisas nedan.

## Verifierat lokalt

- [x] **01.1–01.4:** versionsval, projektfiler, exakta paketversioner, låsfil och mappstruktur.
- [x] **01.5:** avsiktligt typfel upptäcktes med TS2322; provfilen togs bort.
- [x] **01.6:** startscenen visades i webbläsaren utan konsolfel. En sparad kodändring ändrade den synliga texten och lämnade exakt en canvas. Provtexten återställdes.
- [x] **01.7:** `dev`, `typecheck`, `build` och `preview` kördes. Typfelet stoppade även `build` före Vite.
- [x] **01.8–01.9:** README stämdes av. Ren `npm ci --include=dev` från låsfilen kördes i en separat katalog och följdes av lyckat bygge med Node 24.21.0.
- [x] Mobilbredd 390 px: canvas 362 × 203,625 px, ingen horisontell överrinning. Desktopbredd 1280 px: canvas 1040 × 585 px. Båda behöll proportionerna 16:9.
- [x] `bash -n scripts/deploy.sh` och Node-syntaxkontroll av de dåvarande hjälpskripten.
- [x] Apache 2.4.67: mallen kontrollerades med `httpd -t` och kördes isolerat på loopback. Endast lyssningsadress, sökvägar och testvärd ersattes i testkonfigurationen.
- [x] Två riktiga byggkataloger med testmanifest: A aktiverades, B kontrollerades och aktiverades, A:s resursadresser fungerade fortfarande och pekaren återställdes till A.
- [x] Webbkontrollen avvisade fel version och avsiktligt skadad JavaScript genom jämförelse av SHA-256. Testskadan återställdes.
- [x] HTTP-kontroll: startsida och versionsfil fick `no-store`; versionsspecifik JavaScript fick `public, max-age=31536000, immutable`.

- [x] Sökvägsändringen till `/var/www/egg`: Bash-syntaxkontroll av skript och serverguidens kommandoblock samt `httpd -t` av den uppdaterade Apache-mallen passerade. Apache-provet använde tillfälliga lokala kataloger; serverns verkliga behörigheter är ännu inte provade.

Apache-testet använde separata testversioner och tillfälliga kataloger. Det bevisar inte att hela Linux-skriptet har körts på Debian: automatisk återställning, `flock`, rensning och serverns faktiska behörigheter återstår att verifiera där.

## Anpassning till root och Node 22

- [x] Serverns Node.js 22.23.3 och npm 10.9.9 används i versionsfiler och dokumentation.
- [x] Ren `npm ci --include=dev`, typkontroll och produktionsbygge passerade lokalt med exakt Node 22.23.3 och npm 10.9.9. Den officiella Node-distributionens SHA-256 verifierades.
- [x] Bash- och JavaScript-syntaxkontroller passerade för de uppdaterade skripten.
- [ ] Isolerat integrationstest som root i Debian 13: upprepad prepare/deploy/rollback/prune, ägarskap, byggfel, HTTP-fel, avbruten aktivering, låsning och skadade filer. Resultat förs in efter CI-körningen.

## GitHub

- [x] Befintligt repo återanvänt: `git@github.com:landychev/egg.git`.
- [x] Gren `main` och fjärråtkomst verifierade.
- [x] **01.10:** implementationen pushades som `153ef8898d2a770e73b6917709da313f347c5479`. `git ls-remote` bekräftade samma commit på GitHubs `main`. Efterföljande ändringar i detta protokoll är dokumentation av kontrollen.

## Kvar på Debian

- [ ] **01.11:** återstående inventering, katalogbehörigheter för `www-data`, Apache VirtualHost och HTTPS.
- [ ] **01.12:** riktig publicering genom skriptet och test av samtidighetslåset.
- [ ] **01.13:** byggfel lämnar befintlig version aktiv; automatisk/manuell återställning och rensning har provats på Linux.
- [ ] **01.14:** synlig ändring har gått från lokal dator via GitHub till den publika HTTPS-adressen; en äldre öppen session har provats.

Serverinventering 2026-10-06, via ägarens kommandoutskrift: Debian 13.7 bekräftad; Apache listar flera aktiva webbplatser på port 80 och 443 men ingen VirtualHost för egg.landychev.se; Certbot listar inget certifikat för den domänen. En separat DNS-kontroll gav en A-post och ingen AAAA-post. HTTP svarade med 301 till HTTPS; korrekt webbplatsinnehåll och HTTPS-certifikat är fortfarande overifierade.

Ägaren använder lösenordsinloggning; den tillgängliga SSH-nyckeln nekades. Ingen serverkonfiguration, DNS eller certifikat har ändrats. Ägaren har valt `/home/landy/github-proj/egg` för Git-klonen och `/var/www/egg` för publiceringen. Uppdateringar ska köras som root; Git körs som klonens ägare `landy` och webbträdet ägs av `www-data`. Serverutskriften bekräftar Node 22.23.3 och npm 10.9.9 från NodeSource. Certbot-plugin, publicering och katalogbehörigheter behöver fortfarande verifieras på servern.

Hela huvuduppgift 1 är därför fortfarande öppen. [SERVER.md](SERVER.md) beskriver nästa steg.

## Känd bygginformation

Phaser ger en JavaScript-fil på cirka 1,38 MB (cirka 358 kB gzip). Vite varnar för paketstorleken; typkontroll, bygge och webbläsarkontroller passerade. Paketstorlek och laddningstid kan optimeras när spelinnehållet har införts. Det finns ännu inga automatiserade regeltester; dessa hör till uppgift 2.
