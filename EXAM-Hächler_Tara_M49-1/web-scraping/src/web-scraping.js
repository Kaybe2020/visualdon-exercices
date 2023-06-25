import jsdom from "jsdom";
import fetch from "isomorphic-fetch"
import puppeteer from "puppeteer"


const wikipedia_url = "https://fr.wikipedia.org/wiki/Liste_des_lacs_de_Suisse";


/*
========================================================================================================================
Capture d’écran
========================================================================================================================
*/

(async() => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
    await page.goto(wikipedia_url)
    await page.screenshot({ path: 'screenshot.png' })
    await browser.close()
});


/*
========================================================================================================================
Noms des lacs Suisses
========================================================================================================================
*/
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(wikipedia_url);

    let tableauLac = await page.$$(".wikitable sortable jquery-tablesorter tbody tr");
    const nomsLacs = [];

    for (const td of tableauLac) {
        if (td.classList.contains("title")) {
            nomsLacs.push(td.innerText);
        }
    }
    console.log(nomsLacs);
    await browser.close();
})();

/*
========================================================================================================================
Nom du lac le plus profond
========================================================================================================================
*/

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(wikipedia_url);

    let tableauLac = await page.$$(".wikitable sortable jquery-tablesorter tbody tr");
    const tabProfondeur = [];

    for (const td of tableauLac) {
        if (td == await page.$("tr:lastchild")) {
            tabProfondeur.push(td.innerText);
        }
    }

    const profondeurPrecedente = 0;
    const plusProfondLac = null;
    tabProfondeur.forEach(profondeur => {
        if (profondeur > profondeurPrecedente) {
            plusProfondLac = profondeur;
        }
        profondeur = profondeurPrecedente;
    });

    console.log(plusProfondLac);
    await browser.close();
})();



/*
========================================================================================================================
Nom du lac le plus grand
========================================================================================================================
*/
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(wikipedia_url);
    const selecteurNomsLacs = '#mw-content-text > ul > li';
    console.log(await page.$$(selecteurNomsLacs));

    let tableauLac = await page.$$(".wikitable sortable jquery-tablesorter tbody tr");
    const tabSuperficie = [];

    for (const td of tableauLac) {
        if (td.classList.contains("datasortkey")) {
            tabSuperficie.push(td.innerText);
        }
    }

    const superficiePrecedente = 0;
    const plusGrandLac = null;
    tabSuperficie.forEach(superficie => {
        if (superficie > superficiePrecedente) {
            plusGrandLac = superficie;
        }
        superficie = superficiePrecedente;
    });
    console.log(plusGrandLac);
    await browser.close();
})();
