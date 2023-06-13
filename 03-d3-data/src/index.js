// {JSON} Placeholder est un projet qui met à disposition des fausses API pour tester et prototyper des applications. 
// 1) Chargez les données posts et users avec la méthode json() du module d3-fetch. (= fait des requêtes HTTP Get)
import { json } from "d3-fetch";
import * as d3 from "d3";
import { max } from "d3-array";

const postsUrl = "https://jsonplaceholder.typicode.com/posts";
const usersUrl = "https://jsonplaceholder.typicode.com/users";

// 2) A partir des données users et posts, créez un tableau d'objets
Promise.all([ // on le fait dans une promise pour que les données soient chargées avant de les utiliser
    d3.json(postsUrl), // récupère la donnée
    d3.json(usersUrl)
])
    .then(([posts, users]) => {
        // a) nouvel objet avec les données de posts et users
        let result1 = users.map(user => { // si je met foreach cela retourne undefined
            let posts_filtered = posts.filter(post => post.userId === user.id);
            // console.log("Posts filtrés : ", posts_filtered);

            let new_object = {
                "nom_utilisateur": user.username,
                "nom": user.name,
                "ville": user.address.city,
                "titres_posts": posts_filtered.map(post => post.title),
            }
            return new_object;
        });
        // console.log("Nouvel objet : ", result1);


        // b) Créer un tableau d'objet qui filtre le nombre de post par utilisateur *****************************************************
        let result2 = users.map(user => {
            let posts_filtered = posts.filter(post => post.userId === user.id);
            let new_object = {
                "UtilisateurID": user.id,
                "nom_utilisateur": user.name,
                "nombre_posts": posts_filtered.length
            }
            return new_object;
        });


        // c) Afficher le nombre de post par user *************************************************************************************
        const container = d3.select("body")
            .append("div"); // on créé un div dans le body

        container.selectAll("p")
            .data(result2)
            .enter()
            .append("p")
            .text(d => "L'utilisateur avec l'id " + d.UtilisateurID + " du nom de " + d.nom_utilisateur + " a écrit " + d.nombre_posts + " posts.");

        // console.log(result2);



        // d) Trouvez le user qui a écrit le texte le plus long texte dans posts.body ********************************************************
        let longueurOne = users.map(users => {
            let posts_filtered = posts.filter(post => post.userId === users.id);
            let new_object = {
                "nom_utilisateur": users.username,
                "utilisateurID": users.id, // Attention de bien prendre les bonnes dénominations des données!!!
                "longueur_texte": max(posts_filtered.map(post => post.body.length)),
                "longTexte": posts_filtered.map(post => post.body)
            }
            return new_object;
        });
        const resultat3 = longueurOne.filter(d => d.longueur_texte === max(longueurOne.map(d2 => d2.longueur_texte)));

        // e) Afficher le nom de l'utilisateur avec le texte le plus long dans posts.body ****************************************************
        const container2 = d3.select("body")
            .append("div");

        container2.selectAll("p")
            .data(resultat3)
            .enter()
            .append("p")
            .html(d => "L'utilisateur avec l'id " + d.utilisateurID + " du nom de " + d.nom_utilisateur + " a écrit le texte le plus long avec " + d.longueur_texte + " de caractères. <br> Voici le texte : " + d.longTexte.join("<br>"));
        // je passe le texte avec d.longTexte  parce que j'ai utilisé la méthode map pour récupérer le contenu de chaque post.body et les ai combinés en utilisant la balise <br> pour obtenir un retour à la ligne entre chaque partie du texte
        // mettre en .html plutôt qu'en .text pour pouvoir mettre des <br> dans le texte


        // f) Dessinez un graphique en bâton en ayant sur l'axe x les utilisateurs et y le nombre de posts ***************************************
        const width = 700;
        const height = 500;
        const barchart = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        //crée les rectangles
        barchart.selectAll("rect")
            .data(result2)
            .join("rect")
            .attr("x", (d, i) => i * 70)
            .attr("y", d => height - (d.nombre_posts + 400)) // pour corriger l'erreur "NaN" de la console (limite height à 500)
            .attr("width", 50)
            .attr("height", d => d.nombre_posts + 100) // j'ai rajouter 100 pour simuler les barres plus grandes
            .attr("fill", "violet");

        // g) Mettez une étiquette en dessous ce chaque bâton qui indique le nombre de posts ****************************************************
        barchart.selectAll("text")
            .data(result2)
            .join("text")
            .text(d => d.nombre_posts)
            .attr("x", (d, i) => (i * 70) + 25)
            .attr("y", d => height - (d.nombre_posts + 250)) // +250 pour que le texte soit en dessous des barres
            .attr("text-anchor", "middle") // Alignement horizontal au centre du texte
            .attr("fill", "black");
    });