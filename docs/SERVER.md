# Egg Catcher på Debian, Apache och Certbot

Uppdaterat 2026-10-06. Debian 13.7 är verifierat via ägarens serverutskrift. Apache har flera aktiva webbplatser på port 80 och 443, men ingen aktiv VirtualHost för egg.landychev.se. Certbots certifikatlista saknar också den domänen. DNS-kontrollen gav en A-post och ingen AAAA-post; HTTP svarade med 301 till HTTPS. Detta verifierar ännu inte rätt innehåll eller ett giltigt certifikat för Egg Catcher. SSH-adressen anges separat. Uppdateringar körs som `landy`. Serverns arkitektur, byggverktyg, Certbot-plugin och eventuella befintliga Egg-mappar återstår att kontrollera.

Målet är `https://egg.landychev.se/`. Följ första installationen i ordning och kontrollera resultatet mellan avsnitten. Kommandona nedan är installationsanvisningar, inte en redovisning av redan utförda serverändringar.

## Fastställda kataloger

| Plats | Innehåll |
| --- | --- |
| `/home/landy/github-proj/egg` | Git-klon med källkod och skript |
| `/var/www/egg/releases/` | Separata färdigbyggda versioner |
| `/var/www/egg/current` | Länk till aktiv version; Apaches DocumentRoot |
| `/var/www/egg/previous` | Länk till föregående version |
| `/var/www/egg/work/` | Tillfälliga byggen, endast åtkomliga för `landy` |
| `/var/www/egg/logs/` och `state/` | Loggar och uppgifter för återställning/rensning, endast åtkomliga för `landy` |

`landy` äger projektets filer. Apache läser de färdiga filerna som `www-data`. Root används för första kataloginstallationen, Apache och Certbot. Ingen ny användare behöver skapas, och Apache behöver inte åtkomst till Git-klonen i hemkatalogen.

## 1. Inventera befintlig miljö

På din Mac:

```bash
ssh DIN_SSH_ANVANDARE@DIN_SERVER
```

På Debian:

```bash
cat /etc/os-release
cat /etc/debian_version
sudo apache2ctl -S
sudo apache2ctl -M
sudo certbot certificates
command -v node
command -v npm
command -v git
getent ahosts egg.landychev.se
ls -ld /var/www/egg
```

Att `/var/www/egg` ännu inte finns är normalt. Kontrollera att domänen inte redan finns i en annan VirtualHost. Om den gör det, granska just den konfigurationen och anpassa den i stället för att skapa en dubblering. Behåll befintliga projekt och deras konfigurationer. Vår mall använder enbart det exakta namnet `egg.landychev.se`, inga wildcardnamn.

DNS A/AAAA ska peka mot serverns publika adress. Om servern ligger bakom routern behöver port 80 och 443 redan nå Apache från internet. En AAAA-post ska bara finnas om IPv6 fungerar. Certbots HTTP-kontroll måste kunna nå den här domänen utifrån.

## 2. Förbered webbplatsens katalog

Du kan köra följande från root-skalet som du redan har på Debian. Installera grundverktygen vid behov:

```bash
apt update
apt install git curl ca-certificates xz-utils
```

Skapa den nya webbplatskatalogen med `landy` som ägare. Om katalogen redan finns visar blocket dess nuvarande ägare i stället för att ändra den:

```bash
if [ ! -e /var/www/egg ] && [ ! -L /var/www/egg ]; then
    install -d -o landy -g "$(id -gn landy)" -m 755 /var/www/egg
else
    ls -ld /var/www/egg
fi
```

Byt till `landy` innan du arbetar med Git, npm eller uppdateringsskriptet:

```bash
su - landy
```

Skapa förberedelsesidan före första publiceringen. Blocket avbryter om `current` redan finns och kräver att `landy` kan skriva i webbplatskatalogen:

```bash
bash <<'BOOTSTRAP'
set -euo pipefail
test -w /var/www/egg
test ! -e /var/www/egg/current
test ! -L /var/www/egg/current
mkdir -p /var/www/egg/releases /var/www/egg/bootstrap
printf '%s\n' '<!doctype html><html lang="sv"><meta charset="utf-8"><title>Egg Catcher</title><h1>Egg Catcher förbereds</h1></html>' > /var/www/egg/bootstrap/index.html
chmod 755 /var/www/egg/releases /var/www/egg/bootstrap
chmod 644 /var/www/egg/bootstrap/index.html
ln -s /var/www/egg/bootstrap /var/www/egg/current
BOOTSTRAP
```

Uppdateringsskriptet körs som `landy`, utan sudo. Vanliga uppdateringar kräver ingen omladdning av Apache.

## 3. Installera den valda Node-versionen

Vi använder den officiella binärdistributionen i en egen katalog så att andra projekts Node-versioner kan behållas. Kör detta som din administrativa användare med sudo till installationssteget:

```bash
EGG_NODE_VERSION=24.21.0
case "$(uname -m)" in
  x86_64) EGG_NODE_ARCH=x64 ;;
  aarch64) EGG_NODE_ARCH=arm64 ;;
  *) echo "Kontrollera rätt Node-distribution för serverns arkitektur"; exit 1 ;;
esac
EGG_NODE_TMP=$(mktemp -d)
cd "$EGG_NODE_TMP"
EGG_NODE_FILE="node-v${EGG_NODE_VERSION}-linux-${EGG_NODE_ARCH}.tar.xz"
curl -fSLO "https://nodejs.org/dist/v${EGG_NODE_VERSION}/${EGG_NODE_FILE}"
curl -fSLO "https://nodejs.org/dist/v${EGG_NODE_VERSION}/SHASUMS256.txt"
grep "  ${EGG_NODE_FILE}$" SHASUMS256.txt | sha256sum --check --strict
```

Fortsätt bara om kontrollsumman säger **OK**. Kontrollera att målkatalogen är ledig och packa upp:

```bash
test ! -e "/opt/node-v${EGG_NODE_VERSION}-linux-${EGG_NODE_ARCH}"
sudo tar -xJf "$EGG_NODE_FILE" -C /opt
```

I `landy`-användarens `~/.profile`, lägg till raden för serverns arkitektur, till exempel x86-64:

```bash
export PATH="/opt/node-v24.21.0-linux-x64/bin:$PATH"
```

Använd `linux-arm64` på en ARM64-server. Logga sedan in i användarmiljön:

```bash
sudo -iu landy
node --version
npm --version
```

Node ska visa `v24.21.0`. Skriptet jämför den exakta versionen med `.nvmrc` före bygge. Vid ett senare versionsbyte uppdateras både `.nvmrc`, `.node-version`, `package.json` och serverinstallationen tillsammans.

## 4. Återanvänd Git-klonen och GitHub-åtkomsten

Som `landy`, om klonen redan finns:

```bash
cd /home/landy/github-proj/egg
git status --short --branch
git remote -v
git pull --ff-only origin main
```

Granska eventuella lokala ändringar före uppdatering. `origin` ska vara `git@github.com:landychev/egg.git` och grenen `main`.

Om katalogen ännu inte har klonats:

```bash
mkdir -p /home/landy/github-proj
git clone git@github.com:landychev/egg.git /home/landy/github-proj/egg
cd /home/landy/github-proj/egg
```

Återanvänd fungerande GitHub-åtkomst för `landy`. Om GitHub nekar åtkomst behöver användarens SSH-nyckel eller en läsbehörig deploy-nyckel kopplas till repot. Privata nycklar förvaras utanför repot. En ny GitHub-värdnyckel kontrolleras mot [GitHubs dokumenterade fingerprints](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints).

Git-repot innehåller källkod och skript. Apache pekar på `/var/www/egg/current` och behöver inte läsa hemkatalogen.

## 5. Lägg till endast Egg Catchers Apache-konfiguration

Gå tillbaka till din administrativa användare med `exit` om du står i `landy`-skalet. Säkerhetskopiera Apache-konfigurationen före första ändringen:

```bash
sudo tar -czf "/root/apache-before-egg-$(date +%Y%m%d-%H%M%S).tar.gz" /etc/apache2
sudo test ! -e /etc/apache2/sites-available/egg.landychev.se.conf
```

Om filen redan finns: granska den först och skriv inte över den med mallen. För en ny fil:

```bash
sudo install -m 644 /home/landy/github-proj/egg/deploy/apache/egg.landychev.se.conf /etc/apache2/sites-available/egg.landychev.se.conf
sudo a2enmod headers
sudo a2ensite egg.landychev.se.conf
sudo apache2ctl configtest
```

Bara om testet visar **Syntax OK**:

```bash
sudo systemctl reload apache2
sudo apache2ctl -S
curl -I http://egg.landychev.se/
```

Öppna adressen och kontrollera att den visar Egg Catchers förberedelsesida. Kontrollera också de befintliga projektens adresser. Inga befintliga webbplatser ska avaktiveras. Om syntaxkontrollen misslyckas: rätta den nya filen innan någon omladdning.

## 6. Aktivera HTTPS med befintlig Certbot

Inventera först certifikaten enligt steg 1. Om domänen redan har ett certifikat används det befintliga upplägget. För ett nytt certifikat:

```bash
sudo certbot --apache -d egg.landychev.se --redirect
sudo apache2ctl configtest
sudo apache2ctl -S
sudo certbot certificates
curl -I https://egg.landychev.se/
```

Certbot kan skapa `egg.landychev.se-le-ssl.conf`. Kontrollera att HTTPS-konfigurationen innehåller samma `DocumentRoot`, `Alias`, Directory-behörigheter och cache-regler som vår mall. Kontrollera rätt ServerName i både HTTP- och HTTPS-konfigurationen. Certbot ska bara hantera den angivna domänen.

Kontrollera förnyelse med certifikatnamnet som `certbot certificates` faktiskt visar, exempelvis:

```bash
sudo certbot renew --cert-name egg.landychev.se --dry-run
```

Kontrollera den befintliga automatiska förnyelserutinen; skapa inte en extra timer om förnyelse redan är ordnad. Apache-pluginen måste finnas i den Certbot-installation du redan använder; blanda inte en snap-installation och apt-paket utan att först kontrollera upplägget.

## 7. Första riktiga publiceringen

Från din administrativa användare:

```bash
sudo -iu landy
cd /home/landy/github-proj/egg
bash scripts/deploy.sh
bash scripts/deploy.sh status
```

Skriptet hämtar `main` från `origin`, väljer en exakt commit, bygger i en separat katalog och aktiverar versionen först när filkontrollen lyckats. Standardinställningar:

| Variabel | Standard |
| --- | --- |
| `EGG_REPO` | Repot där skriptet ligger, här `/home/landy/github-proj/egg` |
| `EGG_ROOT` | `/var/www/egg` |
| `EGG_BRANCH` | `main` |
| `EGG_URL` | `https://egg.landychev.se` |

HTTPS är standard även vid första publiceringen. Bootstrap-sidan kan återställas om det första riktiga bytet misslyckas. Ingen publik Vite-process eller extra publik port behövs.

Besök startsidan och `https://egg.landychev.se/version.json`. Versionsetiketten i startscenen ska stämma med commit i `version.json`.

## Vanlig uppdatering och skriptversion

På utvecklingsdatorn: kontrollera typer, bygg, provspela, commit och push till `main`.

På servern, som `landy`, när ingen annan uppdatering körs:

```bash
cd /home/landy/github-proj/egg
git status --short
git pull --ff-only origin main
bash scripts/deploy.sh
```

`git pull` uppdaterar även själva skriptet och dess hjälpfiler **innan** skriptet startas. Kör inte `git pull` samtidigt som en publicering. Skriptet loggar sin SHA-256 och den exakta spelcommit som byggs. Dess `git fetch` ändrar inte arbetskatalogen. Lokala ändringar ska först granskas; använd inte reset eller clean för att komma förbi dem.

Samtidiga körningar av publicering, återställning och rensning spärras med `flock`. Byggverktygen installeras med `npm ci --include=dev`. Om ett testkommando införs i `package.json` körs även det före bygget.

## Återställning

```bash
cd /home/landy/github-proj/egg
bash scripts/deploy.sh rollback
```

Det återställer den föregående versionen utan att bygga om. Den ersatta versionen blir sedan `previous`, så samma kommando kan växla tillbaka. En sparad version kan också väljas uttryckligen:

```bash
bash scripts/deploy.sh rollback RELEASE-ID
```

`RELEASE-ID` är ett riktigt katalognamn i `/var/www/egg/releases`. Både manuell och automatisk återställning kontrollerar filinnehållet via webbservern. Vid misslyckad kontroll efter aktivering återställer skriptet pekaren och avslutar med felstatus. Om även den gamla versionens HTTP-kontroll misslyckas står det tydligt i loggen.

Loggar: `/var/www/egg/logs/`. Apache-loggar: `/var/log/apache2/egg-access.log` och `egg-error.log`.

## Cache och rensning

Startsidan och `/version.json` får `Cache-Control: no-store`. Varje bygge använder `/releases/RELEASE-ID/` för sina resursadresser; de filerna ändras aldrig och kan cachelagras. Därför kan äldre öppna sessioner fortfarande hämta sin egen versions bilder, ljud och JavaScript.

Gamla versioner behålls minst **sju hela dygn efter att de senast slutade vara aktiva**. Aktiv version och `previous` tas aldrig bort av rensningskommandot:

```bash
bash scripts/deploy.sh prune
```

Ingen automatisk rensning körs. Kör den manuellt när diskbehovet motiverar det. Rensning tar bara versioner med registrerad pensionering; övergivna, aldrig aktiverade byggen kan behöva granskas separat. Sessioner som lämnas öppna längre än sju dygn kan behöva laddas om efter rensning. Ingen resursgaranti ges för sådana sessioner.

## Kvar att verifiera på den riktiga servern

- Installera och visa startscenen över HTTPS, kontrollera övriga Apache-webbplatser.
- Gör en synlig ändring lokalt, commit, push och publicera den; jämför commit.
- Prova två samtidiga skriptkörningar; den andra ska stoppas.
- Prova ett avsiktligt byggfel på en separat testgren, med `EGG_BRANCH` satt till den grenen. Den aktiva startsidan ska behållas. Publicera ingen trasig commit på `main`.
- Prova återställning och därefter återgång till den avsedda versionen.
- Behåll en äldre flik öppen under uppdateringen och kontrollera att dess gamla resursadresser fortsätter fungera.
- Prova förnyelse av just Egg Catchers certifikat.

`SIGINT` och `SIGTERM` hanteras så att ett avbrutet byte kan återställas. Strömavbrott eller `SIGKILL` kan inte hanteras av en Bash-trap; efter ett sådant avbrott ska `status`, startsidan och loggen kontrolleras manuellt. Det atomiska bytet innebär att pekaren är antingen den gamla eller nya versionen.

## Referenser

- [Apache: namnbaserade VirtualHost](https://httpd.apache.org/docs/2.4/vhosts/name-based.html)
- [Apache: Alias och Directory-behörigheter](https://httpd.apache.org/docs/2.4/mod/mod_alias.html)
- [Certbot: användarguide](https://eff-certbot.readthedocs.io/en/stable/using.html)
- [Vite: publiceringsbas](https://vite.dev/config/shared-options.html#base)
