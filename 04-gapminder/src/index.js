import * as d3 from 'd3'
import { select, selectAll } from "d3-selection";
import { scaleSqrt, scaleLinear, scalePow } from "d3-scale";
import { max, min } from "d3-array";
import { axisLeft, axisBottom } from "d3-axis";

import { geoMercator, geoPath } from "d3-geo";
import { json } from "d3-fetch";

import { transition } from "d3-transition";
import { easeLinear } from "d3-ease";


// Pour importer les données
// import file from '../data/data.csv'

// 1) Préparer les données **************************************************************************************************************
/*Le premier rendu implique la visualisation statique des données data/gapminder.csv pour l'année 2021 sous forme de Scatter/Bubble 
Chart. Vous aurez sur l'axe X les données de PIB par habitant et sur l'axe Y l'espérance de vie. La taille des cercles devra être 
proportionnelle à la population du pays.*/

// a) Importer les données :
import pibHabitantData from '../data/income_per_person_gdppercapita_ppp_inflation_adjusted.csv';
import esperanceVieData from '../data/life_expectancy_years.csv';
import populationData from '../data/population_total.csv';

// b) Préparation des données :
// définition fonction qui  pour maramètre un tableau de données, une variable et un nom de variable. Elle permet de convertir
// les données la variable spécifiée en format SI (ex: 1000 -> 1k)
let convertSi = (array, variable, variableName) => {

    let convertVariable = array.map(d => {
        //trouver le SI (M, B, k)
        let SI = typeof d[variable.toString()] === 'string' || d[variable.toString()] instanceof String ? d[variable.toString()].slice(-1) : d[variable.toString()]; // cette ligne permet de vérifier si la variable est un string ou un nombre
        // Extraire les nombres
        let number = typeof d[variable.toString()] === 'string' || d[variable.toString()] instanceof String ? parseFloat(d[variable.toString()].slice(0, -1)) : d[variable.toString()]; // cette ligne permet de parser le string en nombre 

        // selon la valeur SI, multiplier la puissance
        switch (SI) {
            case 'k': {
                return { "country": d.country, [variableName]: Math.pow(10, 3) * number }; // Math.pow(10, 3) = 1 mille
                break;
            }
            case 'M': {
                return { "country": d.country, [variableName]: Math.pow(10, 6) * number }; // Math.pow(10, 6) = 1 million
                break;
            }
            case 'B': {
                return { "country": d.country, [variableName]: Math.pow(10, 9) * number }; // Math.pow(10, 9) = 1 milliard
                break;
            }
            default: {
                return { "country": d.country, [variableName]: number };
                break;
            }
        }
    })
    return convertVariable;
};

// récupère toutes les années
const annees = Object.keys(populationData[0])

// créer les tableaux qu'on aura besoin  
let pop = [],
    pibHabit = [],
    espVie = [],
    dataTotale = [];

// merge les données (fusionner) par pays
const mergeByCountry = (data1, data2, data3) => {
    let data = [];
    data1.map(item => {
        // créer un nouvel objet qui classe  les données dans data1, data2 et data3 par pays
        let obj = {
            ...data2.find((d) => (d.country === item.country) && d),
            ...data3.find((d) => (d.country === item.country) && d),
            ...item // ... signifie qu'on ajoute les données de item à l'objet
        }
        // ajouter l'objet dans le tableau data
        data.push(obj);
        // console.log(data);
    });
    return data;
}

// push les données année dans les tableaux créés
annees.forEach(annee => {
    pop.push({ "annee": annee, "data": convertSi(populationData, annee, "pop") })
    pibHabit.push({ "annee": annee, "data": convertSi(pibHabitantData, annee, "pibHabit") }) // le nom doit être le même que celui qu'on push (affiche pas échelle sinon)
    espVie.push({ "annee": annee, "data": convertSi(esperanceVieData, annee, "espVie") })

    // créer des constantes annee pour chaque tableau
    const anneePop = pop.filter(d => d.annee == annee).map(d => d.data)[0];
    const anneePibHabit = pibHabit.filter(d => d.annee == annee).map(d => d.data)[0];
    const anneeEspVie = espVie.filter(d => d.annee == annee).map(d => d.data)[0];

    // mettre les données dans le tableau dataTotale
    dataTotale.push({ "annee": annee, "data": mergeByCountry(anneePop, anneePibHabit, anneeEspVie) })
});


// 2) Visualisation statique **************************************************************************************************************
// data pour l'année 2021
const data2021 = dataTotale.filter(d => d.annee == 2021).map(d => d.data)[0]

// entrer des données de base CSS
const margin = { top: 10, right: 40, bottom: 20, left: 40 },
    width = 0.8 * window.innerWidth - margin.left - margin.right,
    height = 0.7 * window.innerHeight + margin.top + margin.bottom;

// créer le svg (créer une dive graphicArea dans body de index.html)
const graphSvg = select("#graphicArea")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "StaticGraph")
    .append("g") // créer un groupe g
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // déplacer le groupe g

// créer les échelles
const popScale = scaleSqrt() // échelle racine carrée
    .domain([0, max(data2021.map(d => d.pop))]) // domaine de 0 à la valeur max de la population
    .range([2, 30]);

const pibHabitScale = scaleLinear() // échelle linéaire
    .domain([0, max(data2021.map(d => d.pibHabit))]) // domaine de 0 à la valeur max du PIB par habitant
    .range([0, width]); // range de 0 à la largeur du svg

const espVieScale = scalePow() // échelle puissance
    .domain([0, max(data2021.map(d => d.espVie))]) // domaine de 0 à la valeur max de l'espérance de vie
    .range([height, 0]) // range de la hauteur du svg à 0
    .exponent(3); // exponent sert à définir la puissance

// créer les axes
graphSvg.append("g") // créer un groupe g
    .attr("transform", "translate(0," + height + ")") // déplacer le groupe g
    .call(axisBottom(pibHabitScale)); // créer l'axe X  call = appel de la fonction

graphSvg.append("g") // créer un groupe g
    .call(axisLeft(espVieScale)); // créer l'axe Y

// console.log(espVie) // les données ont toutes la même espVue :64 et pibHabit : 1950

// Créer et placer les cercles
graphSvg.selectAll("circle")
    .data(data2021)
    .enter()
    .append("circle")
    .attr("cx", d => pibHabitScale(parseFloat(d.pibHabit))) // parseFloat permet de parser le string en nombre (on force pour être sur)
    .attr("cy", d => {
        // console.log(d); // confirme que les données sont correctement extraites
        return espVieScale(parseFloat(d.espVie))
    })
    .attr("r", d => popScale(parseFloat(d.pop)))
    .attr("fill", "orange");


//créer le texte pour l'axe X
graphSvg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("PIB par habitant, inflation ajustée (dollars) ");

//créer le texte pour l'axe Y
graphSvg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75rem") // déplacer le texte de 0.75rem
    .attr("transform", "rotate(-90)")
    .text("Espérance de vie (années)");




// 3) Cartographie ***********************************************************************************************************************
// Représentez les valeurs d'espérance de vie sur une carte. Trouver des données géographiques en format .geojson, et visualiser 
//l'espérance de vie sous forme de : Carte choroplète et Cartogramme

// créer son svg dans la nouvelle div avec l'id graphicChronoplete (refait comme la 1ère)
const map = select("#graphicChronoplete")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "map")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // déplacer le groupe g

// créer une projection grâce à geoMercator
const projection = geoMercator()
    .scale(70) // zoom => taille de la carte
    .center([0, 20])
    .translate([width / 2, height / 2]); // translate permet de centrer la carte

// créer un path pour la projection. Cela permet de convertir les coordonnées en path SVG. Path signifie chemin
const path = geoPath().projection(projection);

// Donner l'echelle de couleur
const colorScale = scaleLinear()
    .domain([min(data2021.map(d => d.pibHabit)), max(data2021.map(d => d.pibHabit))]) // domaine de 0 à la valeur max de l'espérance de vie
    .range(["white", "purple"]) // range de la hauteur du svg à 0

// importer les données geojson
json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then((data) => { // données trouvées sur https://d3-graph-gallery.com/graph/choropleth_basic.html

    // change le nom United States en USA pour que les données correspondent (et d'autres si besoin)
    const index = data2021.map(d => d.country).indexOf('United States');
    if (index !== -1) {
        data2021[index].country = 'USA'; // sinon on a une donnée grise
    } // je ne connais pas les autres pays donc ça restera gris ^^'

    // dessiner la carte
    map.append("g")
        .selectAll("path")
        .data(data.features) // data.features = data du geojson
        .join("path") // join permet de lier les données
        .attr("d", path)
        .attr("fill", d => {
            // filtrer les données
            let donneesFiltrees = data2021.find(dc => dc.country == d.properties.name);
            return donneesFiltrees ? colorScale(donneesFiltrees.pibHabit) : "grey"; // si les données sont trouvées, appliquer la couleur, sinon appliquer gris ( = pas de données)
        })
});




// 4) Animation **************************************************************************************************************************
// Animer les données selon les années. En bref : faite le premier graphique, mais pour chaque année! Cela doit ressembler à la visualisation
// proposée par Gapminder.

// créer son svg
const animationGraph = select("#animationMap")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "map")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // déplacer le groupe g

// créer les axes
animationGraph.append("g") // créer un groupe g
    .attr("transform", "translate(0," + height + ")") // déplacer le groupe g
    .call(axisBottom(pibHabitScale)); // créer l'axe X  call = appel de la fonction

animationGraph.append("g") // créer un groupe g
    .call(axisLeft(espVieScale)); // créer l'axe Y

//créer le texte pour l'axe X
animationGraph.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("PIB par habitant, inflation ajustée (dollars) ");

//créer le texte pour l'axe Y
animationGraph.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75rem") // déplacer le texte de 0.75rem
    .attr("transform", "rotate(-90)")
    .text("Espérance de vie (années)");



//créer le texte pour l'axe X
animationGraph.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("PIB par habitant, inflation ajustée (dollars) ");

//créer le texte pour l'axe Y
animationGraph.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75rem") // déplacer le texte de 0.75rem
    .attr("transform", "rotate(-90)")
    .text("Espérance de vie (années)");


// créer une variable pour stocker l'ID de l'interval
let intervalId;

// créer la fonction d'animation
function animation() {
    // vérifier s'il y a déjà un internvalle
    if (!intervalId) {
        intervalId = setInterval(play, 100);
    }
}

// créer les données en HTML (bouton play et stop)
// créer la fonction play appellée dans animation
let i = 0; // variable pour incrémenter (commence en 1800)
function play() {
    if (dataTotale[i].annee == 2021) { // si l'année est 2021
        i = 0; // remettre i à 0
    } else { // sinon on incrémente
        i++;
    }
    // afficher l'année dans le HTML !! DOIT SE TROUVER DANS LA FONCTION PLAY !!
    select('#textAnimation').text(dataTotale[i].annee)
    updateChart(dataTotale[i].data); // mettre à jour les données
}

// Créer la fonction stop
function stop() {
    clearInterval(intervalId); // arrêter l'intervalle
    intervalId = null; // remettre l'intervalle à null
}

// // créer la fonction updateChart pour mettre à jour les données
function updateChart(dataUpdate) {
    //créer les cercles
    animationGraph.selectAll("circle")
        .data(dataUpdate)
        .join(enter => enter.append("circle") // enter permet de créer les cercles
            .attr("cx", d => pibHabitScale(d.pibHabit))
            .attr("cy", d => espVieScale(d.espVie))
            .attr("r", 0)
            .transition(transition()
                .duration(500) // temps animation
                .ease(easeLinear)) // type d'animation, easeLinear = animation linéaire
            .attr("r", d => popScale(d.pop)) // permet de faire grossir les cercles
            .attr("fill", "rgba(170, 50, 180, 0.5)")
            ,
            update => update.transition(transition().duration(500).ease(easeLinear)) // update permet de mettre à jour les cercles et prend en compte le temps d'animation
                .attr("cx", d => pibHabitScale(d.pibHabit))
                .attr("cy", d => espVieScale(d.espVie))
                .attr("r", d => popScale(d.pop))
            ,
            exit => exit.remove()) // exit permet de supprimer les cercles
}

// écoute les évènements au clic
document.getElementById("play").addEventListener("click", animation);
document.getElementById("stop").addEventListener("click", stop);
