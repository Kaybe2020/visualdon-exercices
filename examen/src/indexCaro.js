import * as d3 from 'd3'
import {select, selectAll} from "d3-selection";
import {scaleSqrt,scaleBand, scaleLinear, scalePow,scaleLog} from "d3-scale";
import {max, min} from "d3-array";
import {axisLeft, axisBottom} from "d3-axis";
import {geoMercator, geoPath} from "d3-geo";
import {json} from "d3-fetch";
import {transition} from "d3-transition";
import {easeLinear} from "d3-ease";


// Import des données
import data2005 from '../data/countries.geojson'
let paysEurope = []
let paysAsie = []
let paysAfrique = []
let paysAmerique = []
let paysOceanie = []

console.log(data2005)



//faire un filtre donnt les données de data.features[0].properties.POP > 1000000

const filteredData = [];
data2005.features.forEach(element => {
    if (element.properties.POP2005 > 1000000) {
        filteredData.push(element)
    }
});


//faire un swich case pour les continents
data2005.features.forEach(element => {
    switch (element.properties.REGION) {
        case 150:
            paysEurope.push(element.properties.POP2005)
            break;
        case 142:
            paysAsie.push(element.properties.POP2005)
            break;
        case 2:
            paysAfrique.push(element.properties.POP2005)
            break;
        case 19:
            paysAmerique.push(element.properties.POP2005)
            break;
        case 9:
            paysOceanie.push(element.properties.POP2005)
            break;
        default:
            break;
    }
});
console.log(paysEurope.length)


const averageEurope = d3.mean(paysEurope)
const averageAsie = d3.mean(paysAsie)
const averageAfrique = d3.mean(paysAfrique)
const averageAmerique = d3.mean(paysAmerique)
const averageOceanie = d3.mean(paysOceanie)

let moyenneRegions = {
    "Europe": averageEurope,
    "Asie": averageAsie,
    "Afrique": averageAfrique,
    "Amerique": averageAmerique,
    "Oceanie": averageOceanie
}

console.log(moyenneRegions)

//carte
const margin = {top : 10, right: 40, bottom: 20, left: 100},
    width = 0.8*window.innerWidth - margin.left - margin.right,
    height = 0.7*window.innerHeight + margin.top + margin.bottom;

const map = d3.select('#mapArea')
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


const projection = geoMercator()
    .scale(70)
    .center([0,20])
    .translate([width / 2, height / 2]);

const path = geoPath().projection(projection);


const colorScale = scaleLinear()
    .domain([min(data2005.features.map(d=>d.properties.POP2005)), max(data2005.features.map(d=>d.properties.POP2005))])
    .range(["white", "steelblue"]);

json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then((data) => {

    // Changer le nom USA (Pour les autres pays, il faudrait faire le même exercice)
    // const index = data.features.map(d=> d.properties.name).indexOf('United States');
    // if (index !== -1) {
    //     data2021[index].country= 'USA';
    // }

    //étiquette
    const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("opacity", 0);


    // Draw the map
        map.append("g")
        .selectAll("path")
        .data(data.features)
        .join("path")
        .attr("d", path)
        .attr("fill", d => {
            // console.log("data2005 :")
            // console.log(data2005)
            // console.log("d :")
            // console.log(d)
            let dataFiltered = data2005.features.find(dc => dc.properties.NAME == d.properties.name);
            return dataFiltered ? colorScale(dataFiltered.properties.POP2005) : 'GREY';
        })
        .on("mouseover", (event, d) => {
            const countryName = d.properties.name;
            const pop2005 = data2005.features.find(dc => dc.properties.NAME === countryName)?.properties.POP2005;
        
            // Afficher l'étiquette à côté du curseur
            tooltip
              .style("left", event.pageX + 5 + "px")
              .style("top", event.pageY + 5 + "px")
              .transition()
              .duration(200)
              .style("opacity", 1);
        
            // Mettre à jour le contenu de l'étiquette
            tooltip.html(`
            <div class="tooltip">
              <p class="tooltip-text"> ${countryName}</p>
              <p class="tooltip-text"> ${pop2005} habitants </p>
              </div>
            `);
          })
          .on("mouseout", () => {
            // Masquer l'étiquette lorsque la souris quitte le pays
            tooltip
              .transition()
              .duration(200)
              .style("opacity", 0);
          });
        });
        
//histogramme
const numberOfCountries = data2005.features.length;
const labelHeight = 200; // Hauteur estimée d'une étiquette
const requiredHeight = numberOfCountries * labelHeight;

console.log(numberOfCountries);
const sortedData = data2005.features.sort((a, b) => a.properties.POP2005 - b.properties.POP2005);

const figure = select("#histogramme")
  .append('svg')
  .attr("width", width+800 + margin.left + margin.right)
  .attr("height", height + requiredHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Créer une échelle d3 pour la hauteur
const pop2005 = scaleLinear()
  .domain([0, max(data2005.features, d => d.properties.POP2005)])
  .range([0, width+100]);

const countryName = scaleBand()
  .domain(data2005.features.map(d => d.properties.NAME))
  .range([height, 0]) // Inverser la plage pour commencer en bas et se terminer en haut
  .padding(0.1);

figure
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(axisBottom(pop2005))
  .style("font-size", "4px");;

figure
  .append("g")
  .call(axisLeft(countryName))
  .style("font-size", "4px");

  const etiquette = select("body")
  .append("div")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("background-color", "rgba(0, 0, 0, 0.7)")
  .style("color", "white")
  .style("padding", "5px")
  .style("font-size", "12px")
  .style("display", "none");

figure.selectAll('rect')
  .data(sortedData)
  .join('rect')
  .attr('width', d => pop2005(d.properties.POP2005))
  .attr('height', countryName.bandwidth())
  .attr('x', 0)
  .attr('y', d => countryName(d.properties.NAME))
  .attr('fill', 'black')
  .on('mouseover', function(event,d) {
    console.log(d);
    // Afficher les informations sur le survol de la souris
    const name = d.properties.NAME;
    const population = d.properties.POP2005;
    select(this)
    .transition()
    .duration(200)
    .attr('opacity', 0.7);
    
    etiquette
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY + 5 + "px")
        .style("display", "block")  
        .html(`
        <div class="tooltip">
            <p class="tooltip-text"> ${name}</p>
            <p class="tooltip-text"> ${population} habitants </p>
        </div>
        `);
  })
  .on('mouseout', function(d) {
    // Masquer les informations lorsque la souris quitte le rectangle
    select(this)
    .transition()
    .duration(200)
    .attr('opacity', 1);

    etiquette
        .style("display", "none");
  });
  


