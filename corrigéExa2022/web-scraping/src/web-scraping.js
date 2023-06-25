import jsdom from "jsdom";
import fetch from "isomorphic-fetch"
import puppeteer from "puppeteer"


const wikipedia_url = "https://fr.wikipedia.org/wiki/Liste_des_lacs_de_Suisse";


/*
========================================================================================================================
Capture d’écran
========================================================================================================================
*/




(async () => {
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1920, height: 1080 }
    });
    const page = await browser.newPage();
    await page.goto(wikipedia_url);
    await page.screenshot({ path: './screenshot.png' });

    await browser.close();
})();



/*
========================================================================================================================
Noms des lacs Suisses
========================================================================================================================
*/

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(wikipedia_url);

const datas = await page.$$eval('table tr', lacs => {
    return Array.from(lacs, lac => {
        const colonnes = lac.querySelectorAll('td');
        return Array.from(colonnes, colonne => colonne.innerText);
    });
});

// console.log(datas);

let table = [];
for (let i = 1; i < datas.length; i++) {
    if (datas[i][0] == undefined) {
        break;
    }
    table.push([datas[i][0], datas[i][5], datas[i][7]]);
}

console.log('Nom des lacs : ');
for (const lac of table) {
    let noms = lac[0].split('\n')
    console.log(noms[0]);
}


/*
========================================================================================================================
Nom du lac le plus profond
========================================================================================================================
*/

console.log('-------------------------');
console.log('Lac le plus profond : ');
let profondeurMax = 0;
let nomProfondeurMax = ''
for (const lac of table) {
    if (parseInt(lac[2]) > profondeurMax) {
        profondeurMax = parseInt(lac[2])
        let noms = lac[0].split('\n')
        nomProfondeurMax = noms[0]
    }
}
console.log(nomProfondeurMax + ' : ' + profondeurMax + ' mètres');




/*
========================================================================================================================
Nom du lac le plus grand
========================================================================================================================
*/


console.log('-------------------------');
let superficieMax = 0
let nomsuperficieMax = ''

let superficieMaxCH = 0
let nomsuperficieMaxCH = ''

let superficieMaxCHOnly = 0
let nomsuperficieMaxCHOnly = ''

for (const lac of table) {
    let superficies = lac[1].split(' ')
    if (parseInt(superficies[0]) > superficieMax || superficieMax == 0) {
        let noms = lac[0].split('\n')
        nomsuperficieMax = noms[0]
        superficieMax = parseInt(superficies[0])
    }
    if (superficies.length > 1) {
        if (parseFloat(lac[1].split('\n')[1]) > superficieMaxCH || superficieMaxCH == 0) {
            let noms = lac[0].split('\n')
            nomsuperficieMaxCH = noms[0]
            superficieMaxCH = parseFloat(lac[1].split('\n')[1])
        }
    }else if(superficies.length == 1){
        if (parseInt(superficies[0]) > superficieMaxCHOnly || superficieMaxCHOnly == 0) {
            let noms = lac[0].split('\n')
            nomsuperficieMaxCHOnly = noms[0]
            superficieMaxCHOnly = parseInt(superficies[0])
        }
    }
}
console.log('Plus grand lac en Suisse : ');
console.log(nomsuperficieMax + ' : ' + superficieMax + ' km2');
console.log('Lac ayan la plus grand supérficie en sur le territoire Suisse : ');
console.log(nomsuperficieMaxCH + ' : ' + superficieMaxCH + ' km2');
console.log('Plus grand la uniquement sur le territoire Suisse : ');
console.log(nomsuperficieMaxCHOnly + ' : ' + superficieMaxCHOnly + ' km2');