/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

function load(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    });
}

function loadHeaderFooter(){
    load("header", "header.html");
    load("footer", "footer.html");
}

function initPlacesPage() {
const container = document.getElementById("places-list");
if (!container) return;

// Exemple statique (plus tard API)
const places = [
    { name: "Place 1", price: 100 },
    { name: "Place 2", price: 150 }
];

places.forEach(place => {
    const card = document.createElement("article");
    card.className = "place-card";

    card.innerHTML = `
    <h2>${place.name}</h2>
    <p>Price: $${place.price}/night</p>
    <a href="place.html?id=${place.id}">View Details</a>
    `;

    container.appendChild(card);
});
}

document.addEventListener("DOMContentLoaded", function () {
    loadHeaderFooter();
    initPlacesPage();
});
