# Egg Catcher – detaljerade uppgifter för punkt 2

Datum: 2026-10-03
Status: Implementerad och verifierad lokalt 2026-10-07. Se [kontrollprotokollet](VERIFIERING-02.md).
Huvuduppgift: [02. Bygga spelreglerna och beskriva spelets tillstånd i UPPGIFTER.md](UPPGIFTER.md#02-bygga-spelreglerna-och-beskriva-spelets-tillstånd)
Underlag: [SPELDESIGN.md](SPELDESIGN.md), version 0.5, och [TEKNIKVAL.md](TEKNIKVAL.md). Bygger på projektgrunden i [detaljerade-uppgifter-1.md](detaljerade-uppgifter-1.md).

## Mål och omfattning

Punkt 2 ger spelets regelkärna: uppgifter med heltal 0–20, bedömning av jämnt och udda, äggets och omgångens tillstånd samt svarsposter som skiljer på rätt svar, fel korg och utan svar. Alla justerbara spelvärden samlas på ett ställe.

Regelkärnan ligger i `src/logic/` och avgör vad som räknas som rätt. Phaser-scenerna i senare huvuduppgifter visar resultatet men avgör det inte.

Arbetsflödet är:

**Scenen skapar ett ägg → scenen visar ägget → barnet trycker eller ägget når slutet → regelkärnan bedömer → scenen animerar utfallet.**

Detta dokument beskriver de 14 deluppgifterna. Regelkärnan och dess tester finns nu i `src/logic/`; användningen beskrivs i [regelguiden](../src/logic/README.md). Namnen i pseudokoden är beskrivande; namnen i koden bestäms vid implementationen. Kryssa i en deluppgift först när dess färdigkriterium har kontrollerats.

### Principer för hela punkt 2

- **Inga beroenden till Phaser.** Ingen fil i `src/logic/` importerar Phaser. Reglerna kan då kontrolleras utan webbläsare.
- **Regelkärnan mäter ingen tid.** Scenen meddelar när ägget har nått slutet. Bedömningen tar aldrig emot tid eller position. Det garanterar att ett rätt svar ger samma utfall tidigt och sent i färden.
- **Paus hanteras i scenen** (huvuduppgift 8). Scenen stoppar ägget och skickar inga svar under paus. Regelkärnan behöver inte känna till paus.
- **Tester skrivs tillsammans med varje deluppgift**, inte i slutet.
- **Enkla funktioner och enkla datastrukturer.** Inget ramverk för tillståndsmaskiner.

## Översikt

| Nr | Deluppgift | Beror på |
| --- | --- | --- |
| 02.1 | Lägga till testverktyg för regelkontroller | 01 |
| 02.2 | Beskriva grundbegreppen som typer | 02.1 |
| 02.3 | Samla spelvärden på ett ställe | 02.2 |
| 02.4 | Regeln jämnt/udda | 02.3 |
| 02.5 | Koppla knappar och kategorier | 02.2 |
| 02.6 | Samla orden för kategorierna | 02.2 |
| 02.7 | Utbytbar slumpkälla | 02.1 |
| 02.8 | Id-räknare för ägg | 02.1 |
| 02.9 | Skapa ett ägg | 02.4, 02.8 |
| 02.10 | Skapa ett slumpat ägg | 02.7, 02.9 |
| 02.11 | Omgång och aktivt ägg | 02.9 |
| 02.12 | Bedöma när barnet trycker | 02.5, 02.11 |
| 02.13 | Bedöma när ägget når slutet | 02.11 |
| 02.14 | Samlade regelkontroller | Alla ovan |

02.5–02.8 kan göras i valfri ordning.

## 02.1 – Lägga till testverktyg för regelkontroller

- [x] Klar

**Mål:** Kunna köra automatiska kontroller av spelreglerna med ett kommando.

**Så löser vi det:**

- Lägg till Vitest som utvecklingsberoende och lås versionen i låsfilen, på samma sätt som i 01.3. Vitest fungerar tillsammans med Vite och TypeScript utan extra byggsteg.
- Lägg till kommandot `test` bredvid `dev`, `typecheck`, `build` och `preview` från 01.7.
- Placera testfiler bredvid koden de kontrollerar, exempelvis `regler.test.ts` bredvid `regler.ts` i `src/logic/`.
- Låt testerna ingå i kontrollerna före publicering. Uppdateringsskriptet i 01.12 ska köra dem före bygget, så att ett fel i reglerna stoppar publiceringen.
- Verifiera med ett provtest som går igenom och ett tillfälligt test som avsiktligt misslyckas. Ta bort det felande testet.

**Enkel pseudokod:**

> Kör `test` → hitta alla testfiler → kör varje kontroll → rapportera godkända och misslyckade → avsluta med fel om någon kontroll misslyckades.

**Klart när:** `test` går igenom, ett avsiktligt fel upptäcks och rapporteras, och testerna ingår i kontrollerna före publicering.

## 02.2 – Beskriva grundbegreppen som typer

- [x] Klar

**Mål:** Alla delar av spelet använder samma begrepp med ett begränsat antal tillåtna värden.

**Så löser vi det:**

| Begrepp | Tillåtna värden | Används till |
| --- | --- | --- |
| Kategori | JÄMNT, UDDA | Talets egenskap och korgarna |
| Val | VÄNSTER, HÖGER | Barnets knapptryck |
| Spelläge | TRÄNING, UTMANING | Vad som händer vid rännans slut |
| Utfall | RÄTT, FEL_KORG, UTAN_SVAR | Resultatet av en bedömning |
| Äggstatus | RULLAR, VÄNTAR, BEDÖMT | Var ägget befinner sig i sitt förlopp |

Sammansatta begrepp:

```
Ägg       = { id, tal, ränna, status, utfall (eller inget) }
Svarspost = { äggId, tal, val (eller inget), rättKategori, utfall, läge }
Omgång    = { läge, aktivtÄgg (eller inget), svarsposter }
```

UTAN_SVAR är ett eget utfall och inte frånvaron av ett svar. Speldesignen kräver att fel korg och utan svar kan skiljas åt i analysen.

Om ett nytt utfall läggs till senare, exempelvis för filterläget, ska typkontrollen visa var det ännu inte hanteras.

**Klart när:** Typerna finns i `src/logic/`, typkontrollen går igenom och begreppen stämmer med tabellen. Att otillåtna värden avvisas kontrolleras vid granskning eller med en rad som avsiktligt förväntas ge typfel.

## 02.3 – Samla spelvärden på ett ställe

- [x] Klar

**Mål:** Alla värden som kan behöva justeras efter speltest finns i en fil, och inget av dem är hårdkodat någon annanstans.

**Så löser vi det:**

Skapa en fil för spelvärden i `src/logic/`. Varje värde märks med sin typ:

- **Designbeslut** – ändras bara om speldesignen ändras.
- **Startvärde** – speldesignens utgångsvärde, justeras efter speltest.
- **Platshållare** – tillfälligt värde så att spelet kan köras; bestäms i en senare huvuduppgift.

| Värde | Förslag | Typ | Bestäms eller används i |
| --- | --- | --- | --- |
| Minsta tal | 0 | Designbeslut | 02 |
| Största tal | 20 | Designbeslut | 02 |
| Antal rännor | 4 | Designbeslut | 02, 03 |
| Färdtid från rännans början till slut | t.ex. 3 s | Platshållare | 04 |
| Paus mellan ägg | t.ex. 0,8 s | Platshållare | 04 |
| Liv i utmaning | 3 | Startvärde | 06 |
| Poäng per rätt svar | 1 | Startvärde | 06 |
| Kombobonus | 0 | Startvärde | 06 |
| Tempo på nivå 2 | t.ex. färdtid × 0,8 | Platshållare | 06 |
| Antal rätt för nivå 2 | t.ex. 10 | Platshållare | 06 |

Färdtiden anges i sekunder och inte som pixlar per sekund. Då blir tempot detsamma på surfplatta och datorskärm, och speltest på olika enheter blir jämförbara.

Speldesignens riktmärke är ungefär 1–2 sekunder per beslut och cirka 40 beslut på 1–2 minuter. Färdtiden prövas mot det i huvuduppgift 4.

Värdena läses men ändras aldrig medan spelet körs.

**Enkel pseudokod för kontrollen:**

> Läs spelvärdena → minsta tal är mindre än största tal → intervallet innehåller minst ett jämnt och ett udda tal → antal rännor, färdtid och liv är större än noll → rapportera fel annars.

**Klart när:** Kontrollen av spelvärdena går igenom, och ett avsiktligt felaktigt värde, exempelvis minsta tal 30, upptäcks.

## 02.4 – Regeln jämnt/udda

- [x] Klar

**Mål:** En enda funktion avgör talets kategori.

**Så löser vi det:**

```
funktion kategoriFör(tal):
    om tal inte är ett heltal                    → fel "ogiltigt tal"
    om tal < MINSTA_TAL eller tal > STÖRSTA_TAL  → fel "utanför intervallet"
    om resten när tal delas med 2 är 0           → returnera JÄMNT
    annars                                       → returnera UDDA
```

Gränserna hämtas från spelvärdena i 02.3. Noll behöver ingen specialregel eftersom 0 delat med 2 ger resten 0. Testet kontrollerar ändå noll uttryckligen, eftersom checklistan i speldesignen kräver det.

Ett ogiltigt tal är ett programmeringsfel och inget som barnet kan orsaka. Därför stoppar funktionen med ett tydligt fel.

**Testfall:**

| Tal | Förväntat |
| --- | --- |
| 0 | JÄMNT |
| 2, 4, 6 … 20 | JÄMNT |
| 1, 3, 5 … 19 | UDDA |
| −1 och 21 | Fel: utanför intervallet |
| 2,5 | Fel: ogiltigt tal |

**Klart när:** Alla 21 tal får rätt kategori och de ogiltiga talen avvisas.

## 02.5 – Koppla knappar och kategorier

- [x] Klar

**Mål:** Kopplingen mellan knapp och kategori finns på ett enda ställe och fungerar åt båda hållen.

**Så löser vi det:**

Spelet behöver översätta ett tryck till en kategori. Det behöver också hitta knappen och korgen för den rätta kategorin, så att rätt korg kan markeras vid felval.

```
KNAPPKARTA = { VÄNSTER → JÄMNT, HÖGER → UDDA }

funktion kategoriFörVal(val):
    returnera KNAPPKARTA[val]

funktion valFörKategori(kategori):
    returnera den knapp i KNAPPKARTA som pekar på kategori
```

När filterläget införs senare (fånga / låt passera) är det denna koppling som ändras, inte bedömningen.

**Klart när:** Båda knapparna ger rätt kategori, och knapp → kategori → knapp ger samma knapp för båda knapparna.

## 02.6 – Samla orden för kategorierna

- [x] Klar

**Mål:** Samma ord används överallt där kategorierna visas.

**Så löser vi det:**

```
KATEGORIORD = {
    JÄMNT → versaler "JÄMNT", gemener "jämnt"
    UDDA  → versaler "UDDA",  gemener "udda"
}
```

| Används i | Exempel | Huvuduppgift |
| --- | --- | --- |
| Korgarnas etiketter | JÄMNT, UDDA | 03 |
| Återkoppling | ”7 är UDDA.” | 04 |
| Förklaring i träning | ”7 är udda. Tre par och en ensam.” | 05 |
| Resultatlistan | ”13: valde jämnt.” | 09 |

Punkt 2 levererar bara orden. Hela meningarna formuleras i respektive huvuduppgift.

**Klart när:** Båda kategorierna har båda formerna och ingen form är tom.

## 02.7 – Utbytbar slumpkälla

- [x] Klar

**Mål:** Slumpen kan ersättas med förutbestämda värden i test.

**Så löser vi det:**

En slumpkälla är en funktion som ger ett decimaltal som är minst 0 och mindre än 1. I spelet används webbläsarens vanliga slump. I testerna används en lista med bestämda värden som lämnas ut i tur och ordning.

```
funktion slumpaHeltal(slump, min, max):
    returnera golv(slump() × (max − min + 1)) + min
```

**Testfall:**

| Slumpvärde | Intervall | Förväntat |
| --- | --- | --- |
| 0 | 0–20 | 0 |
| 0,999 | 0–20 | 20 |
| 0 | 1–4 | 1 |
| 0,999 | 1–4 | 4 |

Testfallen med 0,999 fångar det vanliga felet att det högsta värdet aldrig kan komma.

**Klart när:** Testfallen går igenom och en testslumpkälla med bestämda värden fungerar.

## 02.8 – Id-räknare för ägg

- [x] Klar

**Mål:** Varje ägg får ett id som aldrig återanvänds under en spelsession.

**Så löser vi det:**

```
IdRäknare = { senaste = 0 }

funktion nästaId(räknare):
    räknare.senaste = räknare.senaste + 1
    returnera räknare.senaste
```

- I spelet skapas en räknare när sidan laddas. Den nollställs aldrig, inte heller vid ny omgång eller omstart.
- I testerna skapar varje test en egen räknare, så att testerna inte påverkar varandra.

Om id:n började om vid varje omgång skulle ett sent tryck på förra omgångens ägg 1 kunna träffa nya omgångens ägg 1. Det är ett av de problem som huvuduppgift 8 ska förhindra.

**Klart när:** 100 anrop ger id 1–100 utan dubbletter, och två räknare påverkar inte varandra.

## 02.9 – Skapa ett ägg

- [x] Klar

**Mål:** Ett ägg kan skapas av ett bestämt tal och en bestämd ränna.

**Så löser vi det:**

```
funktion skapaÄgg(räknare, tal, ränna):
    kontrollera tal med kategoriFör (stoppar om talet är ogiltigt)
    om ränna inte är ett heltal från 1 till ANTAL_RÄNNOR → fel "ogiltig ränna"
    returnera Ägg {
        id = nästaId(räknare), tal, ränna,
        status = RULLAR, utfall = inget
    }
```

Funktionen hålls skild från slumpen. Träningsläget i huvuduppgift 5 behöver kunna skapa ett nytt ägg med samma tal efter ett fel, och bekräftelseägget behöver ett valt tal.

**Klart när:** Ett nytt ägg har status RULLAR och inget utfall, två ägg får olika id, och talet 21 samt rännorna 0 och 5 avvisas.

## 02.10 – Skapa ett slumpat ägg

- [x] Klar

**Mål:** Spelet kan få ett nytt ägg med slumpat tal och slumpad ränna.

**Så löser vi det:**

```
funktion nyttSlumpatÄgg(räknare, slump):
    tal   = slumpaHeltal(slump, MINSTA_TAL, STÖRSTA_TAL)
    ränna = slumpaHeltal(slump, 1, ANTAL_RÄNNOR)
    returnera skapaÄgg(räknare, tal, ränna)
```

Den första versionen använder ren slump. Om samma tal eller samma kategori får komma många gånger i rad är en öppen fråga (se slutet av dokumentet). En eventuell begränsning läggs in i denna funktion utan att resten av regelkärnan påverkas.

**Testfall:**

| Slumpvärden | Förväntat |
| --- | --- |
| 0 och 0 | Tal 0, ränna 1 |
| 0,999 och 0,999 | Tal 20, ränna 4 |
| 1 000 ägg med vanlig slump | Alla tal inom 0–20 och alla rännor inom 1–4 |

**Klart när:** Testfallen går igenom.

## 02.11 – Omgång och aktivt ägg

- [x] Klar

**Mål:** En omgång håller reda på spelläge, det enda aktiva ägget och alla svarsposter.

**Så löser vi det:**

```
funktion skapaOmgång(läge):
    returnera Omgång { läge, aktivtÄgg = inget, svarsposter = tom lista }

funktion sättAktivtÄgg(omgång, ägg):
    om omgången har ett aktivt ägg som inte är BEDÖMT → fel "ett ägg är redan aktivt"
    omgång.aktivtÄgg = ägg
```

Omstart i huvuduppgift 8 innebär att en ny omgång skapas och den gamla kastas. Eftersom id-räknaren fortsätter uppåt ignoreras ett sent tryck på ett ägg från den gamla omgången.

Tillåtna statusövergångar för ett ägg:

| Från | Till | När |
| --- | --- | --- |
| RULLAR | BEDÖMT | Barnet trycker, eller ägget når slutet i utmaning |
| RULLAR | VÄNTAR | Ägget når slutet i träning |
| VÄNTAR | BEDÖMT | Barnet trycker medan ägget väntar |
| BEDÖMT | – | Slutstatus. Inget mer händer |

Alla andra övergångar ignoreras. Övergångarna utförs av 02.12 och 02.13.

Poäng, kombo och liv ingår inte i omgången i punkt 2. De räknas fram ur svarsposterna i huvuduppgift 6.

**Klart när:** En ny omgång saknar aktivt ägg och svarsposter. Ett andra ägg avvisas medan det första har status RULLAR eller VÄNTAR men accepteras när det första är BEDÖMT.

## 02.12 – Bedöma när barnet trycker

- [x] Klar

**Mål:** Ett tryck ger rätt svar eller fel korg, högst en gång per ägg.

**Så löser vi det:**

Scenen skickar med äggets id i varje tryck. Funktionen tar inte emot tid eller äggets position.

```
funktion svara(omgång, äggId, val):
    ägg = omgång.aktivtÄgg
    om ägg saknas              → ignorera, returnera inget
    om ägg.id ≠ äggId          → ignorera (trycket gällde ett annat ägg)
    om ägg.status == BEDÖMT    → ignorera (redan bedömt)

    rätt   = kategoriFör(ägg.tal)
    valt   = kategoriFörVal(val)
    utfall = RÄTT om valt == rätt, annars FEL_KORG

    ägg.status = BEDÖMT
    ägg.utfall = utfall
    post = Svarspost { ägg.id, ägg.tal, val, rätt, utfall, omgång.läge }
    lägg post i omgång.svarsposter
    returnera post
```

Svarsposten innehåller den rätta kategorin. Scenen kan då markera rätt korg med `valFörKategori` utan att räkna själv. När funktionen inte returnerar någon svarspost ska scenen inte animera något.

Kontrollen av id kompletterar knapplåset i huvuduppgift 4. Ett tryck som kommer in efter att nästa ägg har dykt upp kan inte besvara fel ägg.

**Testfall:**

| Situation | Förväntat |
| --- | --- |
| Rätt knapp på 7 (HÖGER) | RÄTT, en svarspost |
| Fel knapp på 7 (VÄNSTER) | FEL_KORG, rätt kategori UDDA |
| Rätt knapp på 0 (VÄNSTER) | RÄTT |
| Två tryck på samma ägg | En svarspost; andra trycket ignoreras |
| Tryck med ett gammalt id | Ignoreras |
| Tryck utan aktivt ägg | Ignoreras |
| Tryck på ett väntande ägg i träning | Bedöms som vanligt |

**Klart när:** Alla testfall går igenom.

## 02.13 – Bedöma när ägget når slutet

- [x] Klar

**Mål:** Ett obesvarat ägg blir utan svar i utmaning och väntar i träning.

**Så löser vi det:**

```
funktion nåttSlutet(omgång, äggId):
    ägg = omgång.aktivtÄgg
    om ägg saknas, ägg.id ≠ äggId eller ägg.status ≠ RULLAR → ignorera, returnera inget

    om omgång.läge == TRÄNING:
        ägg.status = VÄNTAR
        returnera inget

    om omgång.läge == UTMANING:
        ägg.status = BEDÖMT
        ägg.utfall = UTAN_SVAR
        post = Svarspost { ägg.id, ägg.tal, val = inget,
                           kategoriFör(ägg.tal), UTAN_SVAR, UTMANING }
        lägg post i omgång.svarsposter
        returnera post
```

Scenen anropar funktionen när äggets rörelse har nått rännans slut. Under paus står rörelsen still, så anropet kommer först när spelet har återupptagits.

**Testfall:**

| Situation | Förväntat |
| --- | --- |
| Slutet nås i utmaning | UTAN_SVAR, val saknas, en svarspost |
| Slutet nås i träning | Status VÄNTAR, ingen svarspost |
| Slutet nås två gånger | Andra anropet ignoreras |
| Slutet nås för ett redan bedömt ägg | Ignoreras |

**Klart när:** Alla testfall går igenom.

## 02.14 – Samlade regelkontroller

- [x] Klar

**Mål:** Visa att punkt 2 uppfyller sitt färdigkriterium och speldesignens regelkrav.

**Så löser vi det:**

Exakt ett rätt svar per tal (speldesign avsnitt 12, första punkten):

```
för varje tal från MINSTA_TAL till STÖRSTA_TAL:
    räkna hur många av knapparna VÄNSTER och HÖGER som ger RÄTT
    kontrollera att antalet är exakt 1
```

Ordningsfall där ett tryck och rännans slut kommer nästan samtidigt. Webbläsaren hanterar händelserna en i taget, så den som kommer först avgör:

| Ordning | Läge | Förväntat |
| --- | --- | --- |
| Tryck, sedan slutet | Utmaning | Bara tryckets utfall räknas |
| Slutet, sedan tryck | Utmaning | Bara UTAN_SVAR räknas |
| Slutet, sedan tryck | Träning | Ägget väntar och bedöms sedan av trycket |

Avslutande kontroller:

- `test` och `typecheck` går igenom.
- Ingen fil i `src/logic/` importerar Phaser.
- Inga spelvärden från 02.3 är hårdkodade i regelkoden.

**Klart när:** Alla kontroller ovan går igenom. Då är färdigkriteriet för huvuduppgift 2 uppfyllt: alla tal, inklusive noll, får rätt kategori och ett redan bedömt ägg kan inte ge ytterligare resultat.

## Gränser mot andra huvuduppgifter

| Område | Hanteras i |
| --- | --- |
| Paus stoppar ägget och blockerar svar | 08, i scenen |
| Knapplås och nedhållen knapp | 04 |
| Nytt tal med samma egenskap för bekräftelseägget | 05 |
| Förloppet efter fel i träning | 05 |
| Liv, poäng och kombo, räknade ur svarsposterna | 06 |
| Riktiga värden för färdtid och nivågräns | 04 och 06 |
| Resultatlista och rekord | 09 |

## Öppna frågor

| Fråga | Påverkar | Förslag |
| --- | --- | --- |
| Får samma tal komma två gånger i rad? | 02.10 | Börja med ren slump. |
| Ska långa serier av samma kategori begränsas? Fem jämna tal i rad gör det svårt att se om barnet förstår regeln eller bara trycker på samma knapp. | 02.10 | Ta upp som designbeslut i SPELDESIGN.md. Ett enkelt mellanläge är aldrig samma tal två gånger i rad och högst tre i rad av samma kategori. |
| Platshållarnas värden | 02.3 | Bestäms i huvuduppgift 4 och 6. |

Frågorna hindrar inte att arbetet påbörjas.

## När hela punkt 2 är klar

Deluppgift 02.1–02.3 ger testverktyg, begrepp och spelvärden. 02.4–02.10 ger regeln och äggen. 02.11–02.13 ger omgång och bedömning. 02.14 visar att allt hänger ihop. Samtliga färdigkriterier ska vara kontrollerade innan huvuduppgift 2 markeras som klar.

Regelkärnan används sedan av grundloopen i huvuduppgift 4.
