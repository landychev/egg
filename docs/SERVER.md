# Egg Catcher på Debian, Apache och Certbot

Uppdaterat 2026-10-06. Ägarens serverutskrifter bekräftar Debian 13.7, Node.js 22.23.3 och npm 10.9.9. Node-paketet `22.23.3-1nodesource1` kommer från NodeSource. Versionen räcker för projektets Vite 8.3.3, vars Node-krav är `^20.19.0 || >=22.12.0`. Ingen separat Node-installation behövs.

Apache och Certbot finns redan för flera andra projekt. I den tidigare inventeringen saknades VirtualHost och certifikat för egg.landychev.se. DNS hade en A-post och ingen AAAA-post. HTTP svarade med omdirigering till HTTPS; rätt innehåll och certifikat för Egg Catcher återstår att verifiera.

Målet är `https://egg.landychev.se/`. Kommandona nedan är anvisningar för servern; de har inte körts på den verkliga servern av assistenten. Kör installations- och publiceringskommandona **som root**. Git-kommandon körs som `landy` för att behålla klonens ägare och använda den användarens GitHub-åtkomst.

## Kataloger och ägare

| Plats | Innehåll och ägare |
| --- | --- |
| `/home/landy/github-proj/egg` | Git-klon, ägs av `landy` |
| `/var/www/egg` | Webbplatsens katalog, ägs av `www-data:www-data` |
| `/var/www/egg/releases/COMMIT` | Färdigbyggda versioner, ägs av `www-data:www-data` |
| `/var/www/egg/current` | Länk till aktiv version; Apaches DocumentRoot |
| `/var/www/egg/previous` | Mål för återställning |
| `/var/lib/egg-deploy/work/` | Tillfälliga byggen, endast root |
| `/var/lib/egg-deploy/logs/` | Publiceringsloggar, endast root |
| `/var/lib/egg-deploy/retired/` | Tidsstämplar för rensning, endast root |
| `/var/lib/egg-deploy/pending` | Tillfällig journal under versionsbyte, endast root |

Skriptet skapar kataloger som saknas. Publicerade kataloger får behörighet 755 och vanliga filer 644. Privata kontrollkataloger får 700. Apache behöver inte åtkomst till Git-klonen. Vanliga publiceringar kräver ingen omladdning av Apache.

## 1. Kontrollera miljön och uppdatera klonen

Från din Mac ansluter du med `ssh landy@192.168.0.9` och går sedan till ditt root-skal på servern. Kontrollera:

```bash
node --version
npm --version
apache2ctl -S
certbot certificates
ls -ld /home/landy/github-proj/egg /var/www/egg
```

Node ska vara `v22.23.3`, samma som `.nvmrc` och `.node-version`. Skriptet kontrollerar exakt Node-version före bygge. Vid framtida versionsbyte uppdateras dessa filer och `package.json`/låsfilens Node-krav tillsammans. npm 10.9.9 fungerar med projektets låsfil.

Installera grundverktyg om de saknas; detta går att köra igen:

```bash
apt-get update
apt-get install -y git curl ca-certificates util-linux
```

Uppdatera klonen som dess ägare, när ingen publicering körs:

```bash
runuser -u landy -- git -C /home/landy/github-proj/egg status --short --branch
runuser -u landy -- git -C /home/landy/github-proj/egg remote -v
runuser -u landy -- git -C /home/landy/github-proj/egg pull --ff-only origin main
```

Granska eventuella lokala ändringar före uppdateringen. `origin` ska vara `git@github.com:landychev/egg.git` och grenen `main`. Publiceringsskriptets Git-kommandon körs automatiskt som ägaren till `.git`, normalt `landy`. Root behöver därför ingen egen GitHub-nyckel. GitHub-åtkomsten för `landy` måste fungera utan interaktiv lösenordsfråga när skriptet körs. Detta är separat från din lösenordsinloggning till Debian via SSH.

## 2. Förbered webbplatsen

Som root:

```bash
cd /home/landy/github-proj/egg
bash scripts/deploy.sh prepare
bash scripts/deploy.sh status
```

`prepare` skapar förberedelsesidan och `current` endast om ingen version redan är aktiv. Vid nästa körning behålls den aktiva sidan. Befintliga vanliga filer eller kataloger på platsen för `current`/`previous` skrivs inte över; skriptet avbryter då med ett tydligt fel så innehållet kan granskas.

## 3. Lägg till Egg Catchers Apache-konfiguration

Kontrollera först `apache2ctl -S` så att domänen inte redan används i en annan konfigurationsfil, varken på port 80 eller 443. Återanvänd i så fall den filen och granska dess innehåll. Mallen har endast `ServerName egg.landychev.se` och påverkar inte andra projekt genom wildcardnamn.

Mallen innehåller både HTTP- och HTTPS-vhost. HTTPS-blocket och omdirigeringen från HTTP ligger i `<IfFile>` och aktiveras automatiskt först när Let's Encrypt-certifikatet finns. Filen går därför att aktivera redan före Certbot; då svarar bara port 80. Utan egen HTTPS-vhost svarar annars serverns standardcertifikat (`donkey.landychev.se`) för domänen, och publiceringsskriptets webbkontroll avbryter med `ERR_TLS_CERT_ALTNAME_INVALID`.

Blocket kan köras upprepade gånger. Det skapar en första säkerhetskopia och installerar mallen från repot:

```bash
bash <<'APACHE'
set -euo pipefail
if [ ! -e /root/apache-before-egg.tar.gz ]; then
    tar -czf /root/apache-before-egg.tar.gz /etc/apache2
fi
install -m 644 /home/landy/github-proj/egg/deploy/apache/egg.landychev.se.conf /etc/apache2/sites-available/egg.landychev.se.conf
a2enmod headers ssl
a2ensite egg.landychev.se.conf
apache2ctl configtest
systemctl reload apache2
APACHE
```

Omladdning sker bara om konfigurationstestet lyckas. Kontrollera sedan:

```bash
apache2ctl -S | grep egg
curl -I http://egg.landychev.se/
```

Öppna adressen och kontrollera att Egg Catchers förberedelsesida visas över HTTP. Kontrollera även de befintliga webbplatserna. Port 80 och 443 måste nå Apache utifrån, och DNS A/AAAA ska peka rätt. En AAAA-post ska bara finnas om IPv6 fungerar.

## 4. HTTPS med befintlig Certbot

Kontrollera certifikatlistan innan ett certifikat skapas. Om ett certifikat redan omfattar domänen används dess befintliga namn; justera i så fall `Define EGG_CERT`/`EGG_KEY` överst i konfigurationsfilen. För ett nytt separat certifikat hämtas bara certifikatet (`certonly`); Apache-konfigurationen kommer från mallen och ändras inte av Certbot:

```bash
certbot certonly --apache --cert-name egg.landychev.se -d egg.landychev.se \
    --keep-until-expiring --deploy-hook "systemctl reload apache2"
apache2ctl configtest
systemctl reload apache2
apache2ctl -S | grep egg
certbot certificates
curl -I https://egg.landychev.se/
curl -I http://egg.landychev.se/
```

Efter omladdningen ska `apache2ctl -S` visa `*:443 egg.landychev.se` från `egg.landychev.se.conf`, HTTPS ska svara 200 med rätt certifikat och HTTP ska svara 301 till HTTPS. `--deploy-hook` gör att Apache laddas om vid automatisk förnyelse. ACME-sökvägen `/.well-known/acme-challenge/` undantas från omdirigeringen, så förnyelsen fungerar även över HTTP.

Kontrollera förnyelsen för det certifikatnamn som listan faktiskt visar:

```bash
certbot renew --cert-name egg.landychev.se --dry-run
```

Återanvänd serverns befintliga rutin för automatisk förnyelse. Apache-pluginen ska finnas i den Certbot-installation som redan används.

## 5. Publicera

När domänen fungerar över HTTPS, kör som root:

```bash
cd /home/landy/github-proj/egg
bash scripts/deploy.sh deploy
bash scripts/deploy.sh status
```

Skriptet hämtar `main`, väljer en exakt commit och bygger separat med `npm ci --include=dev`. Eventuellt `npm test` körs också. En komplett version får commitens fullständiga ID som katalognamn och flyttas atomiskt på publiceringsdiskens filsystem. Därefter kontrolleras innehållet via webbservern innan och efter bytet av `current`.

Om samma commit redan är aktiv kontrolleras filerna och webbsvaret; inget nytt bygge eller versionsbyte görs. En redan sparad, korrekt version återanvänds. Om en sparad version är skadad avbryts körningen utan att skriva över den. Vid byggfel lämnas den aktiva versionen orörd. Vid verifieringsfel efter versionsbytet återställs `current` och `previous` från journalen.

| Variabel | Standard |
| --- | --- |
| `EGG_REPO` | Repot där skriptet ligger |
| `EGG_ROOT` | `/var/www/egg` |
| `EGG_STATE_ROOT` | `/var/lib/egg-deploy` |
| `EGG_GIT_USER` | Ägaren till klonens `.git`, normalt `landy` |
| `EGG_BRANCH` | `main` |
| `EGG_URL` | `https://egg.landychev.se` |

Besök startsidan och `https://egg.landychev.se/version.json`. Versionsetiketten i startscenen ska motsvara commit i versionsfilen.

## Vanliga uppdateringar

Efter kontrollerad commit och push från utvecklingsdatorn, kör som root på servern:

```bash
runuser -u landy -- git -C /home/landy/github-proj/egg pull --ff-only origin main
cd /home/landy/github-proj/egg
bash scripts/deploy.sh deploy
```

Uppdatera klonen före körningen så att skript och hjälpfiler följer med. Kör inte `git pull` samtidigt som publicering pågår. Skriptets egen `git fetch` ändrar inte arbetskatalogen. Loggen innehåller skriptets SHA-256 och versionens commit.

Alla skriptåtgärder använder samma `flock`-lås. En andra samtidig körning avslutas med felmeddelande och lämnar den första körningen i fred. Loggfiler tillkommer vid varje körning, även när den publicerade versionen är oförändrad.

## Återställning och avbrott

Som root:

```bash
cd /home/landy/github-proj/egg
bash scripts/deploy.sh rollback
```

Det aktiverar målet i `previous` utan ombyggnad. `previous` byts inte vid rollback: upprepad rollback behåller samma version. Efter rollback kan du publicera senaste `main` igen med `deploy`, eller välja en sparad version uttryckligen:

```bash
bash scripts/deploy.sh rollback RELEASE-ID
```

`RELEASE-ID` ska vara ett befintligt katalognamn i `/var/www/egg/releases`. Även en upprepad explicit rollback lämnar pekarna oförändrade när rätt version redan är aktiv. Båda formerna kontrollerar innehållet lokalt och via HTTP.

`SIGINT` och `SIGTERM` hanteras med automatisk återställning. Om processen dödas med `SIGKILL` finns journalen kvar; nästa körning, även `status`, återställer det avbrutna bytet innan den fortsätter. Vid ett verkligt strömavbrott ska även filsystemets och webbplatsens tillstånd kontrolleras; skriptet ger ingen garanti mot diskfel. Tillfälliga byggkataloger som blir kvar efter ett hårt avbrott kan granskas och rensas när ingen körning pågår.

Publiceringsloggar: `/var/lib/egg-deploy/logs/`. Apache-loggar: `/var/log/apache2/egg-access.log` och `egg-error.log`.

## Cache och rensning

Startsidan och `/version.json` får `Cache-Control: no-store`. Varje version använder `/releases/RELEASE-ID/` för sina resurser, som inte ändras efter publicering. Äldre öppna spelsessioner kan därför fortsätta hämta sina egna resurser efter en uppdatering.

Rensning behåller versioner minst sju hela dygn efter att de senast slutade vara aktiva. Aktiv version och målet i `previous` tas aldrig bort:

```bash
bash scripts/deploy.sh prune
```

Upprepad rensning är säker. Ingen automatisk rensning installeras. Bara versioner med registrerad pensionering tas bort; aldrig aktiverade byggen kan behöva granskas separat. Sessioner som lämnas öppna längre än sju dygn kan behöva laddas om efter rensning.

## Kontroller

[Kontrollprotokollet](VERIFIERING-01.md) skiljer lokala och isolerade tester från det som återstår på den riktiga servern. Integrationsprovet i `tests/deploy/integration.py` använder tillfälliga kataloger, lokal Git och en lokal HTTP-server. GitHub Actions kör det som root i Debian 13 med projektets Node-version. Det installerar ingen webbplats på din server.

## Referenser

- [Vites Node-krav](https://vite.dev/guide/)
- [Apache: namnbaserade VirtualHost](https://httpd.apache.org/docs/2.4/vhosts/name-based.html)
- [Apache: Alias och Directory-behörigheter](https://httpd.apache.org/docs/2.4/mod/mod_alias.html)
- [Certbot: användarguide](https://eff-certbot.readthedocs.io/en/stable/using.html)
- [Debian: runuser](https://manpages.debian.org/trixie/util-linux/runuser.1.en.html)
