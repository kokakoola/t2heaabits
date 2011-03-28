// * Iga küsimus käib ühe tähe kohta,  (letter)
// * igal küsimusel on kolm vastusevarianti,  (options)
// * üks vastusevariantidest on õige:  (answer)
//     0-esimene, 1=teine, 2=kolmas.

/* sa mainisid, et siin on duplikatsioon - aga me ei rääkind sellest rohkem */
STEPS = [
    {letter: 'a', type: 'vowel',
     options: ['auto', 'elevant', 'banaan'], answer: 0, word: 'auto'},

    {letter: 'b', type: 'stopconsonant',
     options: ['ymbrik', 'banaan', 'elevant'], answer: 1, word: 'banaan'},

    {letter: 'd', type: 'stopconsonant',
     options: ['diivan', 'lill', 'qqkull'], answer: 0, word: 'diivan'},

    {letter: 'e', type: 'vowel',
     options: ['rong', 'elevant', 'hiir'], answer: 1, word: 'elevant'},

    {letter: 'g', type: 'stopconsonant',
     options: ['gloobus', 'konn', 'ymbrik'], answer: 0, word: 'gloobus'},

    {letter: 'h', type: 'consonant',
     options: ['ptype', 'hiir', 'maja'], answer: 1, word: 'hiir'},

    {letter: 'j', type: 'consonant',
     options: ['banaan', 'siil', 'j2nes'], answer: 2, word: 'jänes'},

    {letter: 'k', type: 'stopconsonant',
     options: ['nqqp', 'tigu', 'konn'], answer: 2, word: 'konn'}
];

FIRST_STEP_NR = 0;
LAST_STEP_NR = STEPS.length - 1;

VOWEL_COLOR = '#CC0000';
CONSONANT_COLOR = '#00398F';
STOPCONSONANT_COLOR = '#008A00';

// Kui tahame disaini muuta, peame ainult siinse numbri ära muutma.
SLIDE_WIDTH = 680;

RIGHT = 1;
LEFT = -1;

// See muutuja viitab slaidile (DOM element), mis parasjagu aktiivne on:
currentSlide = null;

$(function() {
    // createSlide loob slaidi, mis on täidetud etteantud numbriga
    // küsimusega ja paneb selle #window sisse.
    currentSlide = createSlide(FIRST_STEP_NR);
    // Liigutame äsjaloodud slaidi paika, st täpselt aknasse:
    currentSlide.css('left', 0);
    var navElements = $('#button-prev, #button-next, .alphabet_letter');
    // Seo Next ja Previous nupud vastavate toimingutega.
    $('#button-next').click(function() { 
        changeSlide(RIGHT); 
        $(navElements).fadeOut('slow'); 
    });
    $('#button-prev').click(function() { 
        changeSlide(LEFT); 
        $(navElements).fadeOut('slow'); 
    });
});


function createSlide(stepNr) {

    // Kloonime uue slaidi võttes näidiseks #empty-slide'i:
    var slide = $('#empty-slide').clone();

    // ID'd me otseselt ei vaja, kuna hoiame nagunii aktiivset slaidi
    // globaalses muutujas currentSlide, aga kuna #empty-slide on meil
    // ka alati DOM'is ja kahe DOM elemendi ID'd ei tohiks olla samad,
    // siis muudabe kloonitud DOM elemendi ID ära:
    slide.attr('id', 'current-slide');

    // Lisame äsjakloonitud tühja slaidi #window sisse:
    slide.appendTo('#window');

    // Kutsume välja protseduuri, mis paneb slaidile vajalikud
    // event'id külge:
    setUpEvents(slide);

    // Kutsume välja protseduuri, mis võtab STEPS'ist vastava
    // numbriga küsimuse ja täidab slaidi selle küsimuse andmetega:
    loadStep(slide, stepNr);

    slide.stepNr = stepNr;

    // Tagastame äsjaloodud slaidi kellele iganes seda protseduuri
    // välja kutsus:
    return slide;
}


function changeSlide(direction) {
    // nextletterNr on vaid lokaalne muutuja ning me kasutame seda
    // aint allpool createSlide'i välja kutsudes.

    // Arvutame nextletterNr'i. See arvutamine on tegelikult väga
    // lihtne, sest see on kas - 1 või + 1.
    var nextStepNr = currentSlide.stepNr + direction;

    // Vaatame, et nextStepNr sisaldaks ainult korrektseid väärtusi.

    // Kui me olime esimese küsimuse peal ja üritasime tagasi minna,
    // siis lähme hoopis viimase küsimuse peale.
    if (nextStepNr < FIRST_STEP_NR)
        nextStepNr = LAST_STEP_NR;
    // ...ja vastupidi ka:
    else if (nextStepNr > LAST_STEP_NR)
        nextStepNr = FIRST_STEP_NR;

    // Loome uue slaidi, mis sisaldab küsimust, mida me kohe kuvama hakkame.
    var newSlide = createSlide(nextStepNr);

    // Kirjeldame sammud, mida teha PEALE animeerimist:
    var PEALE_ANIMEERIMIST_TEE_SEDA = function() {
        // need read ei käivitu kohe vaid alles peale animeerimist,
        // sest me anname selle eeskirja ilma teda välja kutsumata
        // animate'ile üle.

        currentSlide.remove();

        // Kui kõik on valmis, märgime ka üles, et nüüd oleme järgmise
        // slaidi juures:
        currentSlide = newSlide;
    };

    // Liigutame aktiivse slaidi lavalt ära ja lavataguse tema
    // asemele.  Kaasa anname selle eeskirja, mille me just
    // defineerisime ILMA seda eeskirja välja kutsumata.
    move(currentSlide, newSlide, -direction, PEALE_ANIMEERIMIST_TEE_SEDA);
    // Kui me eeskirja välja oleks kutsunud, siis me oleks move'ile
    // edasi andnud mitte eeskirja enda, vaid väärtuse, mille me
    // oleksime saanud eeskirja väljakutsumisest.
}


function move(fromSlide, toSlide, direction, afterAnimate) {
    // Selle protseduuri viimane argument on eeskiri, mille me saime
    // changeSlide'ilt. Tekib küsimus, et miks me ei võiks seda
    // eeskirja hoopis siin samas luua ja animate'ile anda, ja miks
    // peame ta changeSlide'is looma ja siis sedasi keeruliselt üle
    // andma. Asi on selles, et see loogika kuulub changeSlide'i
    // pädevusse. Sellise lihtsa programmi puhul iseenesest vahet
    // pole, aga üldiselt on oluline, et iga koodi osa kirjeldaks just
    // seda, milles ta pädev on. Ja just nimelt 'KIRJELDAKS' mitte
    // 'TEEKS', sest changeSlide ise EI TEE neid samme, mis selles
    // eeskirjas on, vaid ta delegeerib need sammud edasi õigel hetkel
    // täitmiseks. Umbes nagu ärikonsultant ei soorita ise samme oma
    // kliendi ettevõtte parandamiseks vaid annab kliendile juhtnöörid
    // ja klient täidab neid juhtnööre kokkulepitud hetkel.
    // Jätame pasiivse slaidi varjatuks, aga paneme ta kohe
    // aknaraamist VASAKULE:
    toSlide.css('left', (-direction) * SLIDE_WIDTH);
    // Liigutame aktiivse täispikkuse võrra PAREMALE, nii et ta
    // kaob lõpuks ära
    fromSlide.animate({'left': direction * SLIDE_WIDTH},
                      {complete: afterAnimate});

    // Liigutame passiivse täispikkuse võrra PAREMALE, nii et ta
    // ilmub lõpuks täpselt raami keskele nähtavaks.
    toSlide.animate({'left': 0});

    // Iseenesest võiks ka kogu move'i sisu INLINE'ida changeSlide'i
    // sisse ehk asendada see koht changeSlide'is, kus move'i välja
    // kutsutakse, move'i enda sisuga.

    // Samuti oleks ehk parem 'move' nimetada ümber 'doAnimation'-iks
    // vms.
}


// Setup slide tegeleb sellega, et slaidid oleks enne mängu
// pihtahakkamist sobivas olekus.
function setUpEvents(slide) {
    // Võtame DOM'ist vajaminevad elemendid:
    var allOptionElements = slide.find('.options').children();
    var wordElement = slide.find('.word');

    var letter = slide.find('.letter');
    $(letter).click(function() {
        $(this).toggleClass('lower');
    });

    // Paneme etteantud slaidi vastusevariantidele külge
    // click-eventi handlerid:
    allOptionElements.each(function(index, optionEl) {    

    $(optionEl).mouseover(
        function() {
            $(this).find('img')
                .filter(':not(:animated)')
                .animate({width: '120%', height: '120%', left: '+=50', top: '-=50'}, {duration: '500'});
            $('.options:animated').css('z-index', '100')
        }).mouseout(
        function() {       
            $(this).find('img')
                .animate({width: '100%', height: '100%', left: '0', top: '0'}, {duration: '500'});
        }
    );
        /*
        jällegi animate hämar: 1) miks top -100 toimib alles siis kui px 
        lõppu lisada? api ütleb, et kui määrangut pole,
        lisatakse vaikimisi parameetriks px. 2) kui ma tahaksin välja 
        võtta 'valed' vastused, kuidas ma neid kutsuda saan?
        if else küll, aga muutujaga (tüüpi var wrongAnswer = currentStep.answer !== index)
         3) miks allOptionElementsi ees ei käi $ märki? või miks teiste 
         ees käib. või on see lihtsalt minu tekitatud viga (aga see toimib)?
         sellest oli juttu, aga mul on täpselt meelest läinud 
         (eelistan mitte tühja pakkuda)
        */ 

        $(optionEl).one('click',(function() {
            var currentStep = STEPS[slide.stepNr];
            var navElements = $('#button-prev, #button-next, .alphabet_letter');
            if (currentStep.answer === index) {
                alert('Jah!! Võtame järgmise!');
                $(optionEl).unbind('mouseenter mouseleave mouseover mouseout');            
                allOptionElements.fadeOut('fast');
                $(optionEl).animate({top: '-=100px', width: '200px', height: '200px'},{duration: 100});
                $(wordElement).fadeIn('slow');
                $(navElements).delay(1000).fadeIn('slow');     
            } else {
                var randomValue = Math.random();
                if (randomValue < 0.5) {
                    alert('Ei... proovi veel!');
                } else {
                    alert('Vale vastus...');
                }
            }
        }));
    });
}

// See protseduur/funktsioon täidab etteantud slaidi etteantud
// küsimusega.
function loadStep(slide, stepNr) {
    var step = STEPS[stepNr];

    // Leiame selle span'i, mille sees alguses on LETTER HERE:
    var letterEl = slide.find('.letter');
    var wordEl = slide.find('.word');
    
    // Määrame selle elemendi sisuks letter.letter'i sisu:
    letterEl.text(step.letter);
    wordEl.find('.upper').text(step.word);
    wordEl.find('.lower').text(step.word);
    /*     letterEl.css('color', step.color); */
    /*     slide.css('background-color', step.bgColor); */

    if (step.type === 'vowel') {
        letterEl.css('color', VOWEL_COLOR);
    } else if (step.type === 'consonant') {
            letterEl.css('color', CONSONANT_COLOR);
        } else {
            letterEl.css('color', STOPCONSONANT_COLOR);
        }

    var allImgElements = slide.find('.options img');
    allImgElements.each(function(index, imgEl) {
        var imageUrl = 'media/' + step.options[index] + '.gif';
        $(imgEl).attr('src', imageUrl);
    });
}
