# Spelplan närmare stilskissen – 2026-10-17

Den tidigare vyn hade en liten varg och tunna, flacka rännor vars ändar doldes bakom korgarna. Att enbart sänka korgarna löste inte skillnaden mot skissen.

## Ändrat

- Vargens bildyta ökas från 300 till 360 logiska pixlar och placeras vid (480, 236), med baspunkt kring y 404.
- Fyra bredare trärännor med synlig ovansida, bakre kant, främre planka, ändyta och sidostolpar ersätter de tunna linjerna. De ritas fortfarande i Phaser; inga nya bildfiler behövs.
- Banorna lutar mer och deras slutpunkter ligger längre ut från mitten. De nedre rännorna slutar vid korgarnas bakre/yttre öppningar.
- Rännorna ritas efter korgarna så att ändarna syns ovanpå den bakre kanten, men utan att täcka frontens etiketter. Ägget och talet ritas överst.
- Korgarna balanseras mot den större vargen: bildyta 210 × 210, centrum (310, 338)/(650, 338), etikettoffset 22. Detta ersätter koordinaterna i den tidigare korgjusteringen.
- Regelskylten är 560 pixlar bred för att ge utrymme åt de högre äggbanorna; textstorlekarna är oförändrade.
- Ritningen utgår från samma lutning och slutpunkter som äggets banfunktion, även vid förlängningen ut mot stolparna.

## Verifiering

- Alla 134 tester i 9 filer passerar.
- Typkontroll och produktionsbygge passerar. Den tidigare kända varningen om Phasers paketstorlek kvarstår.
- Layouttestet kontrollerar nu 21 positioner per ränna och verklig rektangelöverlappning mot regelskylten, inklusive spelplanens överkant.
- Färdigt bygge granskat i appens webbläsare: dator 1280 × 720 och simulerad stående surfplatta 768 × 1024. Surfplattans spelplan mättes till 736 × 414, exakt en canvas, ingen horisontell överrinning och inga registrerade webbläsarfel eller varningar.
- Lokal grafikkontroll: talet 20 vid nedre högra rännans slut, provåterkoppling samt talet 20 vid övre högra rännans början. Tal, etiketter och regel förblir läsbara.
- Skärmbilder av produktionsbygget: [dator](desktop.jpg), [stående surfplatta](tablet-portrait.jpg).

Detta verifierar den visuella justeringen. Rullande ägg, fångst, inmatning och övrig spelmekanik är inte införda. Prov på riktiga surfplattor och den fullständiga checklistan för uppgift 3 är separata kontroller.
