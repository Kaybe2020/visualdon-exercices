import * as d3 from 'd3'

// Import des données
import data from '../data/cantons_data.geojson'

/*
========================================================================================================================
1. Dessin SVG (15 points)
========================================================================================================================
Vous pouvez dessiner la figure soit à partir d'ici ou directement dans l'HTML (public/index.html).
*/

const svg = d3.select("#svg").append("svg");
svg.attr("class", "mon-svg");

const margin0 = { top: 10, right: 40, bottom: 10, left: 40 },
      width0 = 750 - margin0.left - margin0.right,
      height0 = 110 - margin0.top - margin0.bottom;

svg.attr("width", width0 + margin0.left + margin0.right)
    .attr("height", height0 + margin0.top + margin0.bottom)
    .attr("transform", "translate(" + margin0.left + "," + margin0.top + ")");

const tabValeursGrille = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const groupeGrille1 = svg.append("g");
const groupeGrille2 = svg.append("g");

groupeGrille1.selectAll("line")
    .data(tabValeursGrille)
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("y1", d => d)
    .attr("x2", 100)
    .attr("y2", d => d)
    .attr("stroke", "black");

groupeGrille2.selectAll("line")
    .data(tabValeursGrille)
    .enter()
    .append("line")
    .attr("y1", 0)
    .attr("x1", d => d)
    .attr("y2", 100)
    .attr("x2", d => d)
    .attr("stroke", "black");

const cercle = svg.append("circle");
cercle.attr("cx", 20)
    .attr("cy", 20)
    .attr("r", 5)
    .attr("fill", "red");

const dessin = svg.append("path");
dessin.attr("d", "M 20 20 H80 V80 H50 V40 H60 V70 H70 V40 H80 ")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "2");


/*
========================================================================================================================
2. Manipulation des données (20 points)
========================================================================================================================
*/
const tabData = data.features;
// Le nom du canton avec le plus d'ensoleillement (maximum radiation)
const maxRadiation = tabData.filter(d => d.properties.radiation === d3.max(tabData, d => d.properties.radiation));
const nomCantonMaxRadiation = maxRadiation.map(d => d.properties.name);
console.log('Le nom du canton avec le plus de radiation est : ' + nomCantonMaxRadiation);


// Les noms des cantons avec le moins de précipitation (minimum precipitation)
const minPrecipitation = tabData.filter(d => d.properties.precipitation === d3.min(tabData, d => d.properties.precipitation));
const nomCantonMinPrecipitation = minPrecipitation.map(d => d.properties.name);
console.log('Le nom du canton avec le moins de précipitation est : ' + nomCantonMinPrecipitation);


// La moyenne de précipitation en Suisse
const moyennePrecipitation = tabData.reduce((acc, curr) => acc + curr.properties.precipitation, 0) / tabData.length;
console.log('La moyenne de précipitation en Suisse est : ' + moyennePrecipitation);

const moyenneArrondie = Math.round(moyennePrecipitation);
console.log('La moyenne de précipitation en Suisse arrondie est : ' + moyenneArrondie);


/*
========================================================================================================================
3. Visualisations (45 points)
========================================================================================================================
*/

// Constantes
const margin = {top : 10, right: 40, bottom: 20, left: 40},
    width = 0.8*window.innerWidth - margin.left - margin.right,
    height = 0.5*window.innerHeight + margin.top + margin.bottom;


// --- 3.1 Carte ---
const mapSvg = d3.select('#map')
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


const projection = d3.geoMercator()
    .translate([width/2, height/2])
    .rotate([-7.43864, -46.95108, 0])
    .center([0.54, -0.1])
    .scale(8000);

// Continuez ci-dessous-----------------------------------
//min et max précipitations
const minPrecipitationCarte = d3.min(tabData, d => d.properties.precipitation);
const maxPrecipitationCarte = d3.max(tabData, d => d.properties.precipitation);

const color = d3.scaleLinear()
                .domain([minPrecipitationCarte, maxPrecipitationCarte])
                .range(["#ffa600", "#5c021d"]);

let path = d3.geoPath()
    .projection(projection)

var tooltipDiv = d3.select("#map").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

mapSvg.selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("data-precipitation", function(d) {
        return d.properties.precipitation;
    })
    .attr("data-canton", function(d) {
        return d.properties.name;
    })
    .attr("d", path)
    .attr("fill", function(d) {
        return color(d.properties.precipitation);
    })
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .on("mouseover", function(d) {
        tooltipDiv.transition()
            .duration(200)
            .style("opacity", 1);
        tooltipDiv.html(this.dataset.canton + " : " + this.dataset.precipitation + " mm")
            .style("left", (this.clientX) + "px")
            .style("top", (this.clientY + 100) + "px");
    })
    .on("mouseout", function(d) {
        tooltipDiv.transition()
            .duration(500)
            .style("opacity", 0);
    });

//--------------------------------------------------------

// --- 3.2 Bubble chart ---
const bubbleFigureSvg = d3.select('#scatter-plot')
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Continuez ci-dessous-----------------------------------
//min et max radiation (précipitation défini pour map au dessus)
const minRadiationChart = d3.min(tabData, d => d.properties.radiation);
const maxRadiationChart = d3.max(tabData, d => d.properties.radiation);

console.log(minRadiationChart, maxRadiationChart);

const echelleX = d3.scaleLinear()
        .domain([minPrecipitationCarte-60, maxPrecipitationCarte])
        .range([0, width]);

const echelleY = d3.scaleLinear()
        .domain([minRadiationChart-2, maxRadiationChart])
        .range([height, 0]);

const axeX = d3.axisBottom(echelleX);
const axeY = d3.axisLeft(echelleY);

bubbleFigureSvg.append('g')
        .attr("transform", "translate(0," + height + ")")
        .call(axeX);

bubbleFigureSvg.append('g')
        .attr("transform", "translate(0, 0)")
        .call(axeY);

//tableau avec la radiation, précipitation, latitude et nom du canton
const tabPourCercles = tabData.map(d => {
    return { radiation: d.properties.radiation,
             precipitation: d.properties.precipitation,
             latitude: d.properties.latitude,
             name: d.properties.name
        }
});
console.log(tabPourCercles);


//cercle pour chaque canton
const cercles = bubbleFigureSvg.selectAll("circle")
.data(tabPourCercles)
.enter() 
.append('circle')
    .attr('cx', d => echelleX(d.precipitation))
    .attr('cy', d => echelleY(d.radiation))
    .attr('r', 0)
    .attr('fill', '#ffa600')
    .attr('opacity', 0.7);

//animation des cercles
cercles.transition()
.duration(1500)
.attr("r", d => ((d.latitude)-46)*10);

const repQuestion = d3.select('#scatter-plot')
.append('h3')
.text("Le type d'échelle le plus pertinent pour la précipitation est la logarithmique.")
.style("fill", "#ffa6000");

//--------------------------------------------------------



