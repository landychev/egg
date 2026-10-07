# Egg Catcher – uppgifter för en spelbar prototyp

Datum: 2026-10-03  
Status: Arbetsplan med tio huvuduppgifter. Punkt 1 och 2 är nedbrutna i separata detaljdokument; övriga punkter återstår.

## Mål och teknisk riktning

Målet är en prototyp som kan öppnas via en länk och spelas i webbläsaren, med både träning och utmaning för jämna och udda tal inom 0–20.

Planen utgår från [TEKNIKVAL.md](TEKNIKVAL.md) och prototypförslaget i [SPELDESIGN.md](SPELDESIGN.md), version 0.5. TypeScript används för spelregler och tillstånd, Phaser för spelvärld, animationer, ljud och inmatning, och Vite för lokal utveckling och publiceringsbygge. Matematik och resultatberäkning hålls åtskilda från presentationen. Prototypen körs i webbläsaren med lokalt rekord, utan egen serverlogik eller databas.

## Tio huvuduppgifter

Ordningen nedan är en föreslagen genomförandeordning. Varje uppgift har ett stabilt nummer som vi senare kan använda för deluppgifter, exempelvis `04.1`. Kryssa i en huvuduppgift först när dess färdigkriterium har kontrollerats. Uppgift 02 är verifierad lokalt 2026-10-07. Övriga uppgifter behåller sin tidigare status.

### 01. Sätta upp projektet

- [ ] Klar

**Detaljplan:** [Punkt 1 – projektgrund och uppdateringar via GitHub till Debian](detaljerade-uppgifter-1.md). Dokumentet innehåller 14 deluppgifter med förklaringar, enkel pseudokod och färdigkriterier.

**Mål:** Ha en fungerande teknisk grund och en verifierad väg för att publicera och uppdatera spelet.

**Omfattning:** Skapa projektet med TypeScript, Phaser och Vite, välja och låsa kompatibla versioner samt ordna en enkel struktur för kod, bilder och ljud. Lägg in separata kontroller för typer och publiceringsbygge samt instruktioner för att starta projektet. Koppla projektet till GitHub och förbered Debian-servern med ett Bash-skript för att hämta, bygga, publicera och vid behov återställa en version.

**Klart när:** En enkel Phaser-scen visas i webbläsaren, typkontrollen går igenom och projektet kan byggas och förhandsvisas lokalt. En uppdatering av startscenen har verifierats från lokal commit och push till GitHub, vidare till publicering på Debian, inklusive återställning. Alla 14 deluppgifters färdigkriterier är kontrollerade.

### 02. Bygga spelreglerna och beskriva spelets tillstånd

- [x] Klar – verifierad lokalt 2026-10-07, se [kontrollprotokollet](VERIFIERING-02.md).

**Detaljplan:** [Punkt 2 – spelregler och spelets tillstånd](detaljerade-uppgifter-2.md). Dokumentet innehåller 14 deluppgifter med förklaringar, enkel pseudokod och färdigkriterier.

**Mål:** Ha tydliga regler som fungerar oberoende av grafiken.

**Omfattning:** Skapa uppgifter med heltal 0–20, bedöm jämnt eller udda och beskriv spelläge, aktivt ägg och svar. Skilj mellan rätt svar, fel korg och utan svar. Samla justerbara spelvärden på ett ställe. Varje ägg får bedömas högst en gång.

**Klart när:** Regelkontroller visar att alla tal, inklusive noll, får rätt kategori och att ett redan bedömt ägg inte kan ge ytterligare resultat. Alla 14 deluppgifters färdigkriterier är kontrollerade.

### 03. Skapa spelplanen och den första grafiken

- [ ] Klar

**Mål:** Visa en begriplig spelvärld på dator och surfplatta.

**Omfattning:** Bygg en Phaser-scen med varg, fyra rännor, två korgar och plats för ett ägg med tydligt tal. Vänster korg märks JÄMNT och höger UDDA. Lägg ut två stora spelknappar och den aktuella regeln. Använd enkel prototypgrafik som går att ersätta senare.

**Klart när:** Hela spelplanen ryms på de valda testskärmarna och tal, etiketter och knappar är läsbara. Korgarna visar ord utan prickbilder under själva spelet.

### 04. Göra grundloopen spelbar

- [ ] Klar

**Mål:** Kunna se ett ägg, välja kategori och direkt förstå resultatet.

**Omfattning:** Låt ett ägg åt gången röra sig längs en slumpad ränna. Koppla pekknappar och valda tangenter till samma svarshantering. Lås svaret vid första trycket och förhindra att en nedhållen knapp besvarar nästa ägg. Animera automatisk fångst vid rätt svar och sprucket ägg med markerad rätt korg vid felval. Använd symboler eller rörelse tillsammans med färg.

**Klart när:** Flera ägg kan spelas efter varandra. Rätt svar tidigt och sent under färden ger alltid lyckad fångst. Dubbeltryck ger inte dubbla resultat. Grundloopen har provspelats innan poäng och progression byggs vidare.

### 05. Implementera träningsläget

- [ ] Klar

**Mål:** Låta barnet träna i egen takt och få stöd efter ett fel.

**Omfattning:** Låt obesvarade ägg stanna vid rännans slut. Efter fel visas en kort förklaring med prickbild, därefter samma tal tills svaret blir rätt och sedan ett nytt bekräftelseägg med samma egenskap. Vid fel på bekräftelseägget ges samma stöd och omförsök innan blandade uppgifter återupptas. Barnet väljer när nästa ägg börjar efter en förklaring.

**Klart när:** Hela förloppet efter fel fungerar, inklusive fel på bekräftelseägget. Träningen saknar poäng, kombo, liv och game over, och dess omförsök blandas inte med utmaningens resultat.

### 06. Implementera utmaningsläget

- [ ] Klar

**Mål:** Skapa en avgränsad omgång med poäng, kombo och försiktig tempoökning.

**Omfattning:** Inför tre liv, poäng, komboräknare och nivå 1–2 inom jämnt/udda. Fel korg och utan svar kostar vardera ett liv och nollställer kombon, men registreras separat. Använd samma starthastighet som i träning. Utgå från speldesignens testvärden: en poäng per rätt svar och ingen kombobonus. Ingen tidsbonus införs. Visa liv, poäng, kombo och nivå under spelet.

**Klart när:** Tredje missen avslutar omgången, rätta svar bygger kombo och tempoökningen sker enligt en dokumenterad nivågräns. Poängen påverkas inte av hur tidigt spelaren svarar.

### 07. Skapa introduktionen och regeluppläsningen

- [ ] Klar

**Mål:** Barnet ska förstå regeln och knapparna innan spelet börjar.

**Omfattning:** Visa målet, ord och prickbilder för jämnt och udda samt en demonstration med vargen. Bestäm formuleringen och ta fram en kort förinspelad regel som kopplar jämnt till vänster och udda till höger. Lägg till ”Lyssna igen” och möjlighet att prova själv. Hantera ljudstart utifrån spelarens interaktion med sidan.

**Klart när:** Introduktionen kan genomföras på testenheterna, regeln hörs och kan upprepas, och barnet får prova innan det valda spelläget startar.

### 08. Koppla ihop start, paus, avslut och omstart

- [ ] Klar

**Mål:** Göra prototypen till ett sammanhängande spel som barnet kan styra själv.

**Omfattning:** Skapa startskärm med val av träning eller utmaning och koppla den till introduktion och spel. Lägg till paus, fortsätt, avsluta och omstart. Hantera övergångar så att gamla ägg, knapptryck eller timers inte följer med till nästa omgång. Träning ska kunna avslutas när som helst.

**Klart när:** Båda spellägena går att starta och lämna. Paus stoppar både rörelse och svarstid och blockerar spelsvar. Fortsättning återupptar samma läge utan omedelbar miss, och omstart återställer omgången.

### 09. Visa resultat och spara personligt rekord

- [ ] Klar

**Mål:** Ge tydlig återkoppling efter en utmaningsomgång.

**Omfattning:** Visa poäng, bästa kombo, lokalt rekord och separata räkneverk för rätt, fel korg och utan svar. Lista missade tal med valt svar eller ”utan svar”. Spara rekord lokalt efter avslutad omgång och koppla ”Spela igen” till omstart. Resultatet presenteras som spelresultat och samtalsunderlag.

**Klart när:** Resultatskärmen stämmer med den spelade omgången. Träningens omförsök ingår inte. Rekordet behålls vid omstart och omladdning när lokal lagring är tillgänglig; spelet fungerar även om lagringen inte går att använda.

### 10. Verifiera, speltesta och publicera prototypen

- [ ] Klar

**Mål:** Ha en fungerande prototyp som andra kan öppna och spela via en länk.

**Omfattning:** Kontrollera prototypen mot checklistan i speldesignens avsnitt 12. Kör typkontroll, relevanta regeltester och publiceringsbygge. Testa hela flödet på valda datorer och surfplattor, inklusive läsbarhet, pekstyrning, tangentbord, ljud och paus. Genomför ett första speltest med målgruppen och justera tydliga problem med förståelse, tempo och återkoppling. Publicera den färdiga prototypen på Debian-servern genom uppdateringsflödet som etablerades i punkt 1.

**Klart när:** Prototypens kriterier är uppfyllda, ett första speltest är dokumenterat och den publicerade länken har kontrollerats på testenheterna. Kvarvarande förbättringar finns noterade för nästa version.

## Hur vi bryter ner planen senare

När en huvuduppgift ska påbörjas beskriver vi mindre deluppgifter i ett separat detaljdokument och länkar dit från huvuduppgiften. Punkt 1 finns i [detaljerade-uppgifter-1.md](detaljerade-uppgifter-1.md) och punkt 2 i [detaljerade-uppgifter-2.md](detaljerade-uppgifter-2.md). Varje deluppgift ska beskriva en konkret förändring och hur vi kontrollerar att den fungerar. Vi behåller huvuduppgiftens mål och färdigkriterium som riktning.

Uppgift 01 etablerar även publiceringsvägen med en enkel startscen. Uppgift 01–04 ger en första spelbar grundloop. Uppgift 05–09 gör prototypens båda spellägen och användarflöde kompletta. Uppgift 10 samlar slutkontroll, speltest och publicering; löpande kontroller görs redan under respektive uppgift.

## Öppna val att hantera inom uppgifterna

| Val | Hanteras i |
| --- | --- |
| Exakta verktygsversioner | 01 |
| Testenheter, skärmorientering och tangentbordsstyrning | 03–04, verifieras i 10 |
| Färdtid, intervall mellan ägg och gräns för tempoökning | 04 och 06, justeras i 10 |
| Regelns formulering och inspelning | 07 |
| GitHub-repo, publiceringsgren, Debian-åtkomst, webbserver och publiceringsadress | 01.10–01.14, slutkontroll i 10 |

## Utanför den första prototypen

Flera samtidiga ägg, addition, filterläge, adaptiv hastighet, lärarverktyg, konton och sociala funktioner planeras senare. Detsamma gäller knappen ”Prova dessa tal i lugn takt” från resultatskärmen. Dessa delar behövs inte för att slutföra de tio huvuduppgifterna.
