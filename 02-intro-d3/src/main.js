import { select, selectAll } from "d3-selection";

// C'est ici que vous allez écrire les premières lignes avec d3.js!
// RAPPEL EXERCICE : Important: dans cet exercice seulement les méthodes du module d3-selection pourront être utilisées.


// 1. Créez 3 cercles de 40px de rayon et placez-les respectivement à : (50,50), (150,150), (250,250) *********************************
// définir la hauteur et la largeur du SVG
const width = 500;
const height = 500;
// créer le SVG
const svg = select("body")
    .append("svg") // crée le SVG  en utilisant la méthode append
    .attr("class", "svgCercles")
    .attr("width", width)
    .attr("height", height);

// créer les cercles
const circle1 = svg.append("circle")
    .attr("cx", 50)
    .attr("cy", 50)
    .attr("r", 40)

const circle2 = svg.append("circle")
    .attr("cx", 150)
    .attr("cy", 150)
    .attr("r", 40)
    .attr("class", "circle2")

const circle3 = svg.append("circle")
    .attr("cx", 250)
    .attr("cy", 250)
    .attr("r", 40)


// 2. Changez la couleur du deuxième cercle *******************************************************************************************
// Je donne donc une classe un circle2 
circle2.attr("fill", "orange"); // ici j'ajoute un attribut couleur au cercle
// OU
//circle2.select("cirlce2").attr("fill", "orange"); // ici (j'ai rajouté ma classe au point 1) j'attribut la couleur à la classe


// 3. Déplacez de 50px vers la droite le premier et le deuxième cercle ****************************************************************
const deplacementX = 50;
circle1.attr("cx", +circle1.attr("cx") + deplacementX); // on donne l'attr.cx à cx pour connaitre la position actuelle du cercle et on ajoute le déplacement
// OU
// circle1.attr("cx", 100);
circle2.attr("cx", +circle2.attr("cx") + deplacementX); // on donne l'attr.cx à cx pour connaitre la position actuelle du cercle et on ajoute le déplacement
// OU
//circle2.attr("cx", 200);


// 4. Rajoutez du texte en dessous de chaque cercle ***********************************************************************************
// circle ne peut pas contenir de texte donc je vais utiliser le svg et coller le texte au cercle voulu en lui passant les cx et cy du cercle
const deplacementTextX = 60;
const deplacementTextY = 60; // pas utiliser ici mais même principe
svg.append("text")
    .text("Bonjour, je m'appelle cercle1")
    .attr("x", +circle1.attr("cx") + deplacementTextX)
    .attr("y", +circle1.attr("cy"))
    .attr("class", "text")

svg.append("text")
    .text("Coucou, je suis le cercle2")
    .attr("x", +circle2.attr("cx") + deplacementTextX)
    .attr("y", +circle2.attr("cy"))
    .attr("class", "text")

svg.append("text")
    .text("Hello, moi c'est cercle3")
    .attr("x", +circle3.attr("cx") + deplacementTextX)
    .attr("y", +circle3.attr("cy"))
    .attr("class", "text")


// 5. Alignez verticalement les cercles en cliquant sur le dernier cercle ************************************************************
// je vais utiliser la méthode on() pour écouter l'évènement click sur le cercle3
circle3.on("click", () => {
    circle1.attr("cx", +circle3.attr("cx"));
    circle2.attr("cx", +circle3.attr("cx"));
    // ajout d'une class aux text au point 1 afin de pouvoir les sélectionner
    selectAll(".text").attr("x", +circle3.attr("cx") + deplacementTextX); // ne fonctionne pas avec select il faut mettre selectAll car il y a plusieurs textes
})


// 6.  BARCHART : Vous avez à disposition les données suivantes: [20, 5, 25, 8, 15] ****************************************************
/* Ces données représentent la hauteur des rectangles que vous allez dessiner avec la méthode data([data]).join(enter) que nous avons vue 
en cours. Les rectangles auront une largeur fixe de 20px et doivent être alignés en bas l'un à côté de l'autre (comme un graphique en batons ! 📊 )*/
// déclarer la donnée
const data = [20, 5, 25, 8, 15];

// créer le SVG (par défaut les svg se mettent les uns à la suite des autres)
const svg2 = select("body")
    .append("svg")
    .attr("class", "svgBarchart")
    .attr("width", width)
    .attr("height", height);

svg2.selectAll("rect")
    .data(data) // data() permet de lier les données
    .join(enter => enter.append("rect") //  enter permet de créer les rectangles (ajouter nouveaux éléments)
        .attr("width", 20)
        .attr("height", d => d) // d est la donnée
        .attr("x", (d, i) => (i * 50)) // i est l'index équivaut à l'espacement entre les rectangles
        .attr("y", d => height - d) // height - d permet de placer les rectangles en bas
        .attr("fill", "blue")
    )


