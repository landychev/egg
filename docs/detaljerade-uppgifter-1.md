# Egg Catcher – detaljerade uppgifter för punkt 1

Datum: 2026-10-03  
Status: Delvis implementerad 2026-10-06 – 01.1–01.9 är verifierade lokalt och 01.10 är verifierad mot GitHub. Se [kontrollprotokollet](VERIFIERING-01.md) för återstående serverkontroller.  
Huvuduppgift: [01. Sätta upp projektet i UPPGIFTER.md](UPPGIFTER.md#01-sätta-upp-projektet)  
Teknisk grund: [TEKNIKVAL.md](TEKNIKVAL.md).

## Mål och omfattning

Punkt 1 ska ge oss ett projekt som går att starta, kontrollera och bygga, med en enkel Phaser-scen i webbläsaren. Den omfattar också en fungerande väg för att publicera och uppdatera spelet på en Debian-server via GitHub och ett Bash-skript.

Vi använder TypeScript för kod och spelregler, Phaser för spelets presentation och Vite för utveckling och bygge. Den färdiga webbplatsen består av statiska filer. Debian-servern hämtar källkoden och bygger filerna; webbläsaren kör själva spelet.

Arbetsflödet är:

**Utveckla lokalt → kontrollera och provspela → commit → push till GitHub → hämta med Git på Debian → bygga och publicera med Bash-skript → kontrollera den publicerade versionen.**

En commit sparar ändringarna i det lokala Git-repositoryt. En push skickar dem till GitHub så att servern kan hämta dem.

Detta dokument beskriver hur arbetet ska lösas. Projektgrunden och serverfilerna finns nu i repot; serverkedjan är ännu inte verifierad på Debian. Kryssa i en deluppgift först när dess färdigkriterium har kontrollerats. Varg, ägg, spelknappar och spelregler implementeras i senare huvuduppgifter.

## 01.1 – Kontrollera och bestämma utvecklingsmiljön

- [x] Klar

**Mål:** Ha en gemensam, fungerande miljö för projektets utvecklingsverktyg.

**Så löser vi det:**

- Kontrollera vilka versioner av Node.js och npm som redan finns på utvecklingsdatorn.
- Kontrollera vilka Node.js-versioner den valda Vite-versionen stöder.
- Välj en stödd LTS-version av Node.js och dokumentera den i projektet.
- Använd npm konsekvent för beroenden och låsfil.
- Planera för samma Node.js-version på Debian-servern för att minska skillnader mellan lokalt bygge och serverbygge.

Node.js kör utvecklingsverktygen. Spelaren behöver bara en webbläsare.

**Enkel pseudokod:**

> Läs installerad Node.js-version → jämför med verktygens krav → använd versionen om den stöds, annars ordna en kompatibel version → dokumentera valet.

**Klart när:** Verktygen kan köras med den valda miljön och versionsvalet är dokumenterat.

## 01.2 – Skapa projektgrunden

- [x] Klar

**Mål:** Kunna öppna en minimal sida via Vites utvecklingsserver.

**Så löser vi det:**

Kontrollera först projektmappens innehåll. Utgå från Vites TypeScript-mall utan extra gränssnittsramverk och lägg in grundfilerna utan att skriva över befintlig dokumentation. Ta bort mallens demonstrationsinnehåll.

| Fil | Ansvar |
| --- | --- |
| `package.json` | Beskriver beroenden och projektets arbetskommandon. |
| `index.html` | Sidan som webbläsaren öppnar och platsen där spelet ska visas. |
| `src/main.ts` | Startpunkten som senare skapar Phaser-spelet. |
| `src/style.css` | Sidans grundläggande layout och bakgrund. |

**Klart när:** Utvecklingsservern visar sidan och en sparad ändring av text eller bakgrund syns i webbläsaren.

## 01.3 – Installera beroenden och låsa versionerna

- [x] Klar

**Mål:** Kunna återskapa samma installation på en annan dator eller på servern.

**Så löser vi det:**

Välj stabila och kompatibla versioner av Phaser, TypeScript och Vite vid projektstarten. Phaser används av spelet, medan TypeScript och Vite används för utveckling och bygge. Spara beroendelistan och npm:s låsfil, `package-lock.json`.

Låsfilen beskriver de exakta paketversionerna. Både lokal installation och serverinstallation ska kunna utgå från den. Servern behöver även utvecklingsberoendena när den bygger spelet.

Vi lägger till verktyg efter behov. Ett separat testsystem för spelregler införs i huvuduppgift 2.

**Enkel pseudokod:**

> Välj versioner → installera beroenden → spara beroendelista och låsfil → verifiera en ny installation från låsfilen.

**Klart när:** Installationen kan återskapas och Phaser kan användas från TypeScript.

## 01.4 – Ge kod och resurser tydliga platser

- [x] Klar

**Mål:** Göra projektet lätt att förstå och bygga vidare på.

**Så löser vi det:**

| Plats | Innehåll |
| --- | --- |
| `src/main.ts` | Startar spelet en gång. |
| `src/game/` | Spelets grundkonfiguration. |
| `src/scenes/` | Phaser-scener som visar och styr olika delar av spelet. |
| `src/logic/` | Matematikregler, svar och resultatberäkning när dessa implementeras. |
| `public/assets/images/` | Bilder som spelet laddar. |
| `public/assets/audio/` | Inspelad regel och övriga ljud. |
| `src/style.css` | Layout för sidan runt spelet. |
| `scripts/` | Uppdateringsskript och eventuella hjälpskript. |

Spelregler ska kunna kontrolleras utan att starta Phaser. Därför hålls de åtskilda från animationer och scener. Skapa bara de filer som behövs; tabellen visar även var framtida innehåll hör hemma.

Lägg till en `.gitignore` för installerade beroenden, byggfiler, tillfälliga loggar och operativsystemets hjälpfiler. Låsfilen ska sparas i Git. Nycklar och andra serverhemligheter förvaras utanför repot.

**Klart när:** Det finns tydliga platser för kod och resurser, och genererade eller lokala filer hålls åtskilda från projektets källfiler.

## 01.5 – Ställa in TypeScript och typkontroll

- [x] Klar

**Mål:** Upptäcka typfel tidigt i utvecklingen.

**Så löser vi det:**

Utgå från mallens inställningar, använd strikt typkontroll och anpassa miljön till webbläsaren och Vite. Kontrollen ska exempelvis kunna upptäcka fel sorts värde och att ett värde kanske saknas.

TypeScript kontrollerar typerna. Vite omvandlar och paketerar koden. Ett lyckat Vite-bygge är därför inte ensamt ett bevis på att typkontrollen har gått igenom.

Verifiera inställningen med ett tillfälligt, avsiktligt typfel. Kontrollera att det upptäcks och ta sedan bort det.

**Klart när:** Typkontrollen upptäcker provfelet och går igenom när felet har rättats. Inget avsiktligt fel lämnas kvar.

## 01.6 – Starta Phaser och visa en minimal scen

- [x] Klar

**Mål:** Bekräfta att Phaser fungerar tillsammans med projektgrunden.

**Så löser vi det:**

Bestäm vilket element på sidan som innehåller spelet, en preliminär intern arbetsyta och vilken scen som startar först. Skala arbetsytan proportionerligt efter tillgängligt utrymme. Det kan ge tomrum runt spelet när skärmens proportioner skiljer sig, men former och text förvrängs inte.

Visa en bakgrund, texten ”Egg Catcher” och en enkel form. Kontrollera också att uppdateringar under utveckling inte skapar flera spelinstanser ovanpå varandra. Den slutliga spelplanens layout hanteras i huvuduppgift 3.

**Enkel pseudokod:**

> Sidan laddas → hitta platsen för spelet → läs spelkonfigurationen → skapa en Phaser-instans → starta första scenen → visa titel och enkel grafik.

**Klart när:** En enda scen visas utan konsolfel och behåller sina proportioner när fönstret ändrar storlek.

## 01.7 – Skapa kommandon för utveckling och bygge

- [x] Klar

**Mål:** Göra de återkommande arbetsmomenten enkla och enhetliga.

**Så löser vi det:**

| Kommando | Uppgift |
| --- | --- |
| `dev` | Starta Vite för lokal utveckling. |
| `typecheck` | Kontrollera TypeScript utan att skapa publiceringsfiler. |
| `build` | Kontrollera typer och därefter skapa publiceringsbygget. |
| `preview` | Visa det färdiga bygget via en lokal server. |

**Enkel pseudokod för bygge:**

> Kör typkontroll → stoppa vid fel → bygg annars projektet → spara publiceringsfilerna i byggmappen → rapportera resultatet.

Förhandsvisningen kontrollerar de färdiga byggfilerna och kompletterar utvecklingsläget. Den används lokalt; Debian-serverns webbserver levererar den publika versionen.

**Klart när:** Alla fyra arbetsmoment fungerar och ett typfel hindrar publiceringsbygget.

## 01.8 – Skriva en kort startguide

- [x] Klar

**Mål:** Någon annan ska kunna starta projektet utan att läsa vår konversation.

**Så löser vi det:**

Skapa en README som beskriver verktygsversioner, installation från låsfilen, start och stopp av utvecklingsservern, typkontroll, bygge och förhandsvisning. Förklara mappstrukturen och länka till speldesign, teknikval och uppgiftsplan.

Beskriv aktuell status: efter denna del finns en teknisk startscen men ännu ingen spelmekanik. Serverinstruktionerna läggs till eller länkas från README i deluppgift 01.14.

**Klart när:** Instruktionerna går att följa från installation till förhandsvisning och stämmer med projektets faktiska kommandon.

## 01.9 – Kontrollera hela den lokala projektgrunden

- [x] Klar

**Mål:** Bekräfta att projektet fungerar både under utveckling och som färdigt bygge.

**Så löser vi det:**

1. Verifiera installation från låsfilen utan att radera användarens arbete.
2. Starta utvecklingsservern och öppna scenen.
3. Ändra ett synligt element och kontrollera uppdateringen.
4. Kör typkontroll och publiceringsbygge.
5. Öppna bygget via förhandsvisningen.
6. Kontrollera scen, storleksanpassning, konsolfel och saknade filer.
7. Stäm av arbetsgången mot README.

Här räcker en dokumenterad praktisk kontroll av projektgrunden. Automatiserade tester av spelregler hör till nästa huvuduppgift.

**Klart när:** Hela den lokala kedjan fungerar och instruktionerna har verifierats.

## 01.10 – Koppla projektet till GitHub

- [x] Klar

**Mål:** Ha en gemensam källa för de versioner som ska publiceras.

**Så löser vi det:**

Kontrollera om ett Git-repository redan finns och använd det om det är projektets avsedda repo. Koppla till rätt GitHub-repository och bestäm vilken gren servern hämtar godkända uppdateringar från. `main` är ett förslag; exakt repo och gren behöver anges vid implementationen.

Versionshantera källkod, dokumentation, låsfil och uppdateringsskript. Kontrollera att installerade beroenden, lokala byggfiler och hemligheter inte följer med.

**Enkel pseudokod för det lokala arbetsflödet:**

> Gör ändringar → kontrollera typer och relevanta tester → bygg och provspela → granska ändringarna → skapa commit → push till den bestämda grenen på GitHub.

**Klart när:** En lokalt kontrollerad version finns på GitHub och kan hämtas från den bestämda grenen.

## 01.11 – Förbereda Debian-servern

- [ ] Klar

**Mål:** Servern ska kunna hämta, bygga och leverera spelet.

**Så löser vi det:**

- Kontrollera Debian-version och befintlig serverkonfiguration före ändringar.
- Ordna Git, vald Node.js-version och npm.
- Ordna en webbserver. Nginx är ett förslag; slutligt val görs utifrån serverns befintliga miljö.
- Kör uppdateringar som root enligt det valda serverupplägget: Git-klon i `/home/landy/github-proj/egg`, publicering i `/var/www/egg` med `www-data:www-data` som ägare. Git-kommandon körs som klonens ägare `landy`. Skripten ska tåla upprepade körningar.
- Skapa platser för hämtad källkod, byggda versioner och loggar.
- Ge servern läsbehörighet till GitHub. För ett privat repo kan en läsbehörig deploy-nyckel användas.
- Bestäm publiceringsadress, eventuell undermapp och HTTPS. Anpassa resursadresserna i bygget till publiceringsplatsen.

Bygget kräver Node.js och npm. Webbservern levererar sedan de färdiga statiska filerna. Vites utvecklingsserver används inte som publik speltjänst. Serverns uppgift innebär inte att spelet behöver en databas eller egen backend.

**Klart när:** Servern kan hämta projektet, bygga det och leverera startscenen via den avsedda webbadressen. HTTPS ska fungera vid publik publicering.

## 01.12 – Skapa ett Bash-skript för uppdateringar

- [ ] Klar

**Mål:** Göra varje uppdatering tydlig, upprepningsbar och möjlig att felsöka.

**Så löser vi det:**

Versionshantera skriptet i repot. Vid första installationen hämtas repot manuellt med Git så att skriptet blir tillgängligt. Vid vanliga uppdateringar ska skriptet hämta den bestämda grenen och arbeta med en identifierad commit i en separat byggmapp. Exakt aktiveringsmekanism beskrivs i 01.13.

**Enkel pseudokod:**

> Kontrollera inställningar och verktyg  
> Förhindra att två uppdateringar körs samtidigt  
> Hämta den bestämda grenen från GitHub  
> Välj och logga exakt commit  
> Förbered en separat byggmapp för denna commit  
> Installera beroenden från låsfilen, inklusive byggverktygen  
> Kör projektets kontroller och bygge  
> Kontrollera att förväntade byggfiler finns  
> Aktivera den färdigbyggda versionen  
> Kontrollera att webbservern levererar rätt version  
> Logga resultatet och avsluta med tydligt besked

Om ett steg misslyckas ska skriptet stoppa före publicering. När automatiserade regeltester finns ska de ingå i kontrollerna; tills dess används projektgrundens faktiska kontroller. Uppdatering av själva skriptet ska också beskrivas, så att det är tydligt vilken skriptversion som körs.

**Klart när:** Skriptet kan uppdatera spelet från GitHub och anger publicerad commit eller vilket steg som misslyckades. En andra samtidig körning stoppas tydligt.

## 01.13 – Kunna avbryta och återställa publiceringen

- [ ] Klar

**Mål:** Behålla en fungerande version om en uppdatering går fel.

**Så löser vi det:**

Bygg den nya versionen separat medan den gamla fortsätter att visas. Använd versionsmappar med commitidentifiering och en pekare till den aktiva versionen. Byt pekaren i ett sammanhållet steg efter godkänt bygge; kopiera inte successivt nya filer ovanpå det aktiva spelet.

| Del | Funktion |
| --- | --- |
| Källkod | Serverns hämtade Git-repository. |
| Versionsmappar | Separata färdigbyggda versioner. |
| Aktiv version | Pekare till versionen som ska visas. |
| Loggar | Tidpunkt, commit och resultat för uppdateringarna. |

Spara åtminstone den föregående versionen för återställning utan nytt bygge. Webbkontrollen ska verifiera den väntade versionen och att dess viktiga filer kan hämtas, inte bara att någon sida svarar.

**Enkel pseudokod:**

> Misslyckat bygge → behåll aktiv version  
> Godkänt bygge → aktivera ny version  
> Misslyckad kontroll efter aktivering → återställ föregående version och rapportera felet  
> Godkänd kontroll → registrera lyckad publicering

Planera cachehanteringen så att nya besök får aktuell startsida. Behåll äldre resursadresser åtkomliga under en bestämd övergångstid för redan öppna spelsessioner. Att enbart spara gamla mappar räcker inte om webbservern inte längre kan leverera deras filer; adresser och serverkonfiguration behöver stödja detta. Bestäm när gamla versioner får rensas utan att aktiv version eller återställningsversion tas bort.

**Klart när:** Ett kontrollerat byggfel lämnar befintligt spel tillgängligt, återställning har provats och en öppen äldre session klarar uppdateringen enligt den valda cache- och resurshanteringen.

## 01.14 – Dokumentera och prova hela uppdateringskedjan

- [ ] Klar

**Mål:** Kunna upprepa installation, uppdatering och återställning med tydliga instruktioner.

**Så löser vi det:**

Dokumentera första serverinstallationen separat från den vanliga uppdateringsrutinen. Ange repo, gren, servermappar, nödvändiga verktyg, hur skriptet startas, var loggarna finns, hur aktiv commit kontrolleras och hur återställning görs. Dokumentera åtkomstens upplägg utan att skriva privata nycklar eller hemligheter i repot.

Prova hela flödet med en liten synlig ändring i startscenen, exempelvis en versionsetikett.

**Enkel pseudokod:**

> Ändra lokalt → kontrollera och bygg → commit → push → uppdatera på Debian → kontrollera ändringen och commit i webbläsaren → prova återställning → återgå till avsedd version.

Anteckna utfallet och kontrollera att instruktionerna stämmer med genomförandet.

**Klart när:** En riktig uppdatering från datorn via GitHub till Debian är verifierad, återställning är provad och arbetsgången är dokumenterad.

## Uppgifter som behövs innan serverdelen implementeras

| Uppgift eller val | Hanteras i |
| --- | --- |
| GitHub-repository, privat eller publikt, samt publiceringsgren | 01.10 |
| Debian-version, serveradress och tillgänglig åtkomst | 01.11 |
| Webbserver, domän, HTTPS och publicering i rot eller undermapp | 01.11 |
| Servermappar och användare som kör uppdateringar | 01.11–01.12 |
| Hur länge äldre versioner och resurser sparas | 01.13 |

Dessa uppgifter behöver inte vara bestämda för att påbörja den lokala projektgrunden.

## När hela punkt 1 är klar

Deluppgift 01.1–01.9 ger den lokala projektgrunden. Deluppgift 01.10–01.14 ger versionshantering och en verifierad publiceringsväg med startscenen. Samtliga färdigkriterier ska vara kontrollerade innan huvuduppgift 1 markeras som klar.

Huvuduppgift 10 i uppgiftsplanen används senare för slutkontroll, speltest och publicering av den färdiga spelprototypen genom samma uppdateringsväg.
