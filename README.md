# Egg Catcher

Ett matematikspel i TypeScript och Phaser. Uppgift 1 ger en responsiv teknisk startscen; spelregler, varg, ägg och spelknappar kommer senare.

## Verktyg

- Node.js **22.23.3 LTS**, samma version lokalt och på Debian (se `.nvmrc` och `.node-version`).
- npm, som följer med Node.js. Använd `npm ci` och versionshantera `package-lock.json`.
- Phaser **4.2.1**, TypeScript **7.0.2**, Vite **8.3.3**.

Node-versionen är anpassad till serverns befintliga Node.js 22.23.3 och npm 10.9.9. Node 26.3.1 finns globalt på utvecklingsdatorn; en separat Node 22.23.3 används för projektets kontroller. Installera Node-versionen via din vanliga versionshanterare eller [Node.js officiella distribution](https://nodejs.org/dist/v22.23.3/). Om nvm redan finns:

```bash
nvm install
nvm use
```

## Starta lokalt

Öppna en terminal i `egg`, där `package.json` ligger:

```bash
node --version
npm ci
npm run dev
```

Öppna adressen som terminalen visar (normalt http://127.0.0.1:5173). Avsluta med **Ctrl+C**. Utvecklingsservern lyssnar bara på den lokala datorn. Sparade ändringar uppdaterar sidan; den gamla Phaser-instansen städas bort vid koduppdatering.

```bash
npm run typecheck
npm run build
npm run preview
```

`build` kör alltid typkontroll först och lägger sedan statiska filer i `dist/`. `preview` visar det färdiga bygget, normalt på http://127.0.0.1:4173. Avsluta även den med Ctrl+C. Apache levererar den publika webbplatsen; Node behöver inte köras som en publik tjänst.

## Projektets platser

| Plats | Innehåll |
| --- | --- |
| `src/main.ts` | Start och städning av spelet |
| `src/game/config.ts` | Arbetsytan 960 × 540 och proportionerlig skalning |
| `src/scenes/StartScene.ts` | Första scenen |
| `src/logic/` | Framtida spelregler, utan Phaser-beroende |
| `public/assets/images/`, `public/assets/audio/` | Framtida bilder och ljud |
| `scripts/` | Publicering, återställning och verifiering |
| `deploy/apache/` | Egen VirtualHost för egg.landychev.se |
| `docs/` | Planer, kontrollresultat och serverguide |

När resurser från `public/` laddas i Phaser ska adressen byggas med `import.meta.env.BASE_URL`, till exempel `` `${import.meta.env.BASE_URL}assets/images/example.png` ``. Då behåller en öppen spelsession sina versionsspecifika resurser efter en uppdatering.

## GitHub och publicering

Repo: `git@github.com:landychev/egg.git`. Publiceringsgren: `main`.

På Debian ligger Git-klonen i `/home/landy/github-proj/egg`. Som **root** kör du `bash scripts/deploy.sh` därifrån. Skriptet utför Git-kommandona som klonens ägare, normalt `landy`. Färdiga versioner hamnar i `/var/www/egg/releases/`; Apache visar `/var/www/egg/current`. Webbfilerna ägs av `www-data:www-data`; privata byggen och loggar ligger i `/var/lib/egg-deploy` med root som ägare. Förberedelser och Apache/HTTPS beskrivs i serverguiden.

Kontrollera och provspela ändringar före commit och push. Servern hämtar en exakt commit, installerar med låsfilen och bygger separat. En färdig version aktiveras genom ett atomiskt byte av `current`. Kontrollen jämför commit, startsida och filernas SHA-256; vid fel efter bytet återställs föregående version.

`prepare`, publicering, återställning och rensning kan köras upprepade gånger. Samma commit byggs inte om och upprepad rollback behåller samma mål. Se [serverguiden](docs/SERVER.md) för Apache, Certbot, första installation, uppdatering och återställning. Se [kontrollprotokollet](docs/VERIFIERING-01.md) för vad som faktiskt har provats och vad som återstår på Debian.

## Underlag

- [Speldesign](docs/SPELDESIGN.md)
- [Teknikval](docs/TEKNIKVAL.md)
- [Uppgiftsplan](docs/UPPGIFTER.md)
- [Detaljerade uppgifter 1](docs/detaljerade-uppgifter-1.md)

Referensdokumenten kopierades från projektmappen. Originalen där har inte ändrats. Aktuell implementationsstatus förs i kontrollprotokollet.

Verktygsreferenser: [Node.js LTS](https://nodejs.org/en/about/previous-releases), [Vites miljökrav](https://vite.dev/guide/), [Phaser-installation](https://docs.phaser.io/phaser/getting-started/installation).
