import * as d3 from 'd3'

// Import des données
import data from '../data/countries.geojson'


// Exercice 1 : SVG *********************************************************
// voir sur fichier index.html


// Exercice 2 : Données *****************************************************
// 1) Filtrez les données ayant une population plus grandes que 1’000’000 (POP2005)
console.log("Data : ", data);
console.log("Data features : ", data.features);

const population = data.features.filter((f) => f.properties.POP2005 > 1000000);

console.log("Pop > 1000000 : ", population);
console.log("MAP REGION : ", data.features.map((feature) => feature.properties.REGION));


// 2) Sortez la moyenne de la population par continent *************************
// REGION : Europe 150, Afrique 2, Asie 142, Océanie 9, Amériques 19

// tableau des continents
// const continentsNames = {
//     142: "Asie",
//     150: "Europe",
//     2: "Afrique",
//     9: "Océanie",
//     19: "Amériques",
// };

// // habitants totaux par région
// let regions = {};
// population.forEach(function (d) {
//     if (regions[d.properties.REGION] === undefined) {
//         // si la région n'est pas encore définie
//         regions[properties] = {
//             population: d.properties.POP2005,
//             count: 1,
//         }
//     } else {
//         // si la région est déjà définie, addition de la population et count +1
//         regions[properties].population += d.properties.POP2005;
//         regions[properties].count++;
//     }
// });
// console.log("Regions : ", regions);

// // Habitants totaux par continent (data.features.properties)

// // Moyenne des habitants par région
// let moyenne = {};
// for (let region in regions) {
//     moyenne[region] = Math.round(
//         regions[region].population / regions[region].count
//     );
// }
// console.log(moyenne);

// // Fonction permettant de séparer chaque 1000 par un ' (et chaque décimale par un .)
// function numberWithApos(n) {
//     var parts = n.toString().split(".");
//     return (
//         parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'") +
//         (parts[1] ? "." + parts[1] : "")
//     );
// }

// Affichage des résultats


// Exercice 3 : Visualisation ********************************************************
// Avec les données de l’exercice précédent, produisez les visualisations suivantes

// 1. Colorier la carte selon la population des pays
// Marges du graphique
const margin = { top: 10, right: 10, bottom: 0, left: 10 },
    width = 800 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

// Nuances de couleurs selon la grandeur de la population
const color = d3
    .scaleLinear()
    .domain([500000, 10000000]) // popullation min et max
    .range(["white", "purple"]); // couleur min et max

// Projection de carte (Mercator)
const projection = d3
    .geoMercator()
    .scale(120)
    .translate([width / 2, height / 2.8]);

// Générateur de chemin
const path = d3.geoPath().projection(projection);

// Création du SVG
const svg = d3
    .select("#ex3")
    .append("svg")
    .attr("width", "800px")
    .attr("height", "500px");

//indication de la projection
var tooltipDiv = d3
    .select("#ex3")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Ajout des pays
svg
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", path)

    //récupérer la population de chaque pays
    .attr("data-population", function (d) {
        return d.properties.POP2005;
    })

    // récupérer les noms des pays
    .attr("data-country", function (d) {
        return d.properties.NAME;
    })

    //dessiner les pays
    .attr("d", path)
    .attr("fill", function (d) {
        return color(d.properties.POP2005);
    })
    .style("stroke", "white") // couleur trait
    .style("stroke-width", 0.3) // épaisseur du trait


    // 2) ajouter une info-bulle avec la population du pays quand on y survole avec la souris
    .on("mouseover", function (d) {
        d3.selection(this)
            .style("opacity", 0.7)
            .style("stroke", "white")
            .style("stroke-width", "3");

        tooltipDiv.transition().duration(200).style("opacity", 1);
        tooltipDiv
            .html(
                "Pays : " +
                this.dataset.country +
                "<br/>" +
                "Population : " +
                numberWithApos(this.dataset.population) // permet de séparer chaque 1000 par un ' (et chaque décimale par un .)
            )
            .style("left", d.clientX + "px")
            .style("top", d.clientY + 100 + "px");
    })

    // quand la souris quitte le pays, l'opacité revient à 0.7
    .on("mouseleave", function (d) {
        d3.selection(this)
            .style("opacity", 1)
            .style("stroke", "white")
            .style("stroke-width", "0.3");

        tooltipDiv.transition().duration(500).style("opacity", 0);
    });


// 3) Comment appellons-nous ces types de cartes ? Rajouter la réponse en titre de cette carte
d3.select("#ex3")
    .append("p")
    .text("Nous appellons ces types de cartes des cartes choroplètes.");