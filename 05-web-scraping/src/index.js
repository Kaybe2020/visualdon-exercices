import jsdom from "jsdom";
import fetch from "isomorphic-fetch"
import puppeteer from "puppeteer"

// 1) Webscraper Wikipedia *******************************************************************************************************
// Imprimez dans la console tous les noms de cantons et les populations respectives, à partir de la page Wikipedia citée ci-dessus.

// Screenshots
//type d'écran
const sizes = [
    { type: 'iphone', width: 375, height: 812 },
    { type: 'ipad', width: 768, height: 1024 },
    { type: 'laptop', width: 1540, height: 877 },
]

// capturer la page
const capture = browser => async ({ type, width, height }) => {
    const page = await browser.newPage()
    await page.goto('https://fr.wikipedia.org/wiki/Canton_(Suisse)#Donn%C3%A9es_cantonales')
    await page.setViewport({ width, height })
    await page.screenshot({ path: `wikipedia_${type}.png` })
}

// lancer le navigateur
const run = async () => {
    const browser = await puppeteer.launch() 
    await Promise.all(sizes.map(capture(browser)))
    await browser.close()
}

run();

// Population
// récupérer les noms et les populations de chaque canton
const cantonPop = async () => {
    const response = await fetch('https://fr.wikipedia.org/wiki/Canton_(Suisse)#Donn%C3%A9es_cantonales');
    const text = await response.text();
    const dom = await new jsdom.JSDOM(text);

    // récupère le body et les éléments de la page
    const body = dom.window.document; 
    const names = body.querySelectorAll("table>tbody>tr>td:nth-of-type(3)"); 
    const pop = body.querySelectorAll("table>tbody>tr>td:nth-of-type(4)");

    // créer un nouveau tableau avec les données récupérées
    const namesPop = [...names].map((d,i) => {
        let newArray = [{
            "name" : d.textContent,
            "pop": pop[i].textContent
        }]
        return newArray
    } );

    console.log(namesPop)
}
cantonPop();



// 2) Webscraper un site e-commerce ************************************************************************************************
const url = "https://www.webscraper.io/test-sites/e-commerce/allinone/computers/laptops";

const ecommerce = async() => {
    const response = await fetch(url)
    const text = await response.text();
    const dom = await new jsdom.JSDOM(text);

    //// récupérer tous les éléments de la classe "col-sm-4.col-lg-4.col-md-4"
    let p = dom.window.document.querySelectorAll(".col-sm-4.col-lg-4.col-md-4"); 

    //// récupérer les noms, prix et étoiles de chaque produit
    const products = [...p].map((d,i) => {
        const name = d.querySelector("a.title").textContent;
        const price = d.querySelector("h4.price").textContent;
        const rating = d.querySelectorAll("div.ratings p")[1].getAttribute("data-rating");

        //// créer un nouveau tableau avec les données récupérées
        let newArray = [{
            "produit" : name,
            "prix": price,
            "etoiles": rating
        }]
        return newArray
    } );

    console.log(products)

};

ecommerce();