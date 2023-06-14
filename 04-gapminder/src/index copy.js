import * as d3 from 'd3'
import { select, selectAll } from "d3-selection";
import { scaleSqrt, scaleLinear, scalePow } from "d3-scale";
import { max, min } from "d3-array";
import { axisLeft, axisBottom } from "d3-axis";

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
            ...data2.find((item) => (item.country === item.country) && item),
            ...data3.find((item) => (item.country === item.country) && item),
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
    pibHabit.push({ "annee": annee, "data": convertSi(pibHabitantData, annee, "pibHabitant") })
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


// Créer et placer les cercles
graphSvg.selectAll("circle")
    .data(data2021)
    .enter()
    .append("circle")
    .attr("cx", d => pibHabitScale(parseFloat(d.pibHabit)))
    .attr("cy", d => {
         console.log(d); // confirme que les données sont correctement extraites
         return espVieScale(parseFloat(d.espVie))
    })
    .attr("r", d => popScale(parseFloat(d.pop)))
    .attr("fill", "steelblue");


//créer le texte pour l'axe X
graphSvg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 20) // +20 pour mettre le texte en dessous de l'axe
    .text("PIB par habitant, inflation ajustée (dollars) ");

//créer le texte pour l'axe Y
graphSvg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -30) // -30 pour le placer en dehors de l'axe
    .attr("dy", ".75rem") // déplacer le texte de 0.75rem
    .attr("transform", "rotate(-90)")
    .text("Espérance de vie (années)");






