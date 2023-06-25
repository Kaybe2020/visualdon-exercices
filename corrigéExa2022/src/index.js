import * as d3 from 'd3'

// Import des données
import data from '../data/cantons_data.geojson'

/*
========================================================================================================================
1. Dessin SVG (15 points)
========================================================================================================================
Vous pouvez dessiner la figure soit à partir d'ici ou directement dans l'HTML (public/index.html).
*/


// --> HTML


/*
========================================================================================================================
2. Manipulation des données (20 points)
========================================================================================================================
*/

console.log(data.features)

// Le nom du canton avec le plus d'ensoleillement (maximum radiation)
let maxRadiationCanton = ''
let maxRadiation = 0
for (let canton of data.features) {
    if (canton.properties.radiation > maxRadiation || maxRadiation == 0) {
        maxRadiation = canton.properties.radiation
        maxRadiationCanton = canton.properties.name
    }
}
console.log('Canton le plus ensoleillé : ' + maxRadiationCanton)

// Les noms des cantons avec le moins de précipitation (minimum precipitation)
let minPrecipitationCanton = ''
let minPrecipitation = 0
let maxPrecipitation = 0
for (let canton of data.features) {
    if (canton.properties.precipitation < minPrecipitation || minPrecipitation == 0) {
        minPrecipitation = canton.properties.precipitation
        minPrecipitationCanton = canton.properties.name
    }
    if (canton.properties.precipitation > maxPrecipitation || maxPrecipitation == 0) {
        maxPrecipitation = canton.properties.precipitation
    }
}
console.log('Canton le moins pluvieux : ' + minPrecipitationCanton)


// La moyenne de précipitation en Suisse

let totalPrecipitation = 0
let nbCantons = 26
for (let canton of data.features) {
    totalPrecipitation += canton.properties.precipitation
}
let moyennePrecipitation = totalPrecipitation / nbCantons
console.log('Moyenne des précipitations : ' + moyennePrecipitation)

/*
========================================================================================================================
3. Visualisations (45 points)
========================================================================================================================
*/

// Constantes
const margin = { top: 10, right: 40, bottom: 20, left: 40 },
    width = 0.8 * window.innerWidth - margin.left - margin.right,
    height = 0.5 * window.innerHeight + margin.top + margin.bottom;


// --- 3.1 Carte ---
const mapSvg = d3.select('#map')
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


const projection = d3.geoMercator()
    .translate([width / 2, height / 2])
    .rotate([-7.43864, -46.95108, 0])
    .center([0.54, -0.1])
    .scale(8000);

// Continuez ci-dessous-----------------------------------

const tooltip = d3.select('#map')
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("padding", "5px")
    .style("position", "fixed")

const colorScale = d3.scaleThreshold()
    .domain([800, 1000, 1200, 1400, 1600, 1800, 2000])
    .range(d3.schemeBlues[8]);

let mousemove = function (event, d) {
    tooltip.style("opacity", 1)
        .html(d.properties.name + " : " + d.properties.precipitation)
        .style("left", (event.x + 20) + "px")
        .style("top", (event.y + 20) + "px")
}

let mouseOver = function (d) {
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black")
}

let mouseLeave = function (d) {
    d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")

    tooltip.style("opacity", 0)
}

mapSvg.append("g")
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath()
        .projection(projection)
    )
    .attr("fill", function (d) {
        let precipitation = 0;
        for (let canton of data.features) {
            if (canton.properties.name == d.properties.name) {
                precipitation = canton.properties.precipitation
            }
        }
        return colorScale(precipitation);
    })
    .style("stroke", "transparent")
    // .attr("class", function (d) { return "Canton" })
    .style("opacity", .8)
    .on("mouseover", mouseOver)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseLeave)




//--------------------------------------------------------

// --- 3.2 Bubble chart ---
const bubbleFigureSvg = d3.select('#scatter-plot')
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Continuez ci-dessous-----------------------------------

// Echelles
let x = d3.scalePow()
    .exponent(2)
    .domain([0, maxPrecipitation])
    .range([0, width])
    .nice()

let y = d3.scalePow()
    .exponent(3)
    .domain([0, maxRadiation])
    .range([height, 0])
    .nice()


let maxLatitude = 0
let minLatitude = 0
for (let canton of data.features) {
    if (canton.properties.latitude > maxLatitude || maxRadiation == 0) {
        maxLatitude = canton.properties.latitude
    }
    if (canton.properties.latitude < minLatitude || minLatitude == 0) {
        minLatitude = canton.properties.latitude
    }
}
console.log('min' + minLatitude);
console.log('max' + maxLatitude);

let ronds = d3.scaleSqrt()
    .domain([minLatitude, maxLatitude])
    .range([2, 10]);

//Ajouter les cercles
bubbleFigureSvg.append('g')
    .selectAll("dot")
    .data(data.features)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.properties.precipitation) })
    .attr("cy", function (d) { return y(d.properties.radiation) })
    .attr("r", 0)
    .style("fill", "red")
    .attr("opacity", "0.7")
    .attr("stroke", "black")

// Add x axis
bubbleFigureSvg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// Add y axis
bubbleFigureSvg.append("g")
    .call(d3.axisLeft(y));

    bubbleFigureSvg.selectAll("circle")
    .transition()
    .delay(function (d, i) { return (i * 3) })
    .duration(2000)
    .attr("r", function (d) { return ronds(d.properties.latitude); })

console.log('Echelle la plus pértinente pour les précipitation : Exponentielle');
console.log('Car il n\'y a pas de données proches du zéro');

//--------------------------------------------------------



