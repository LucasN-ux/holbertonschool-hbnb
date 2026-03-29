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
        { id: 1, name: "Place 1", price: 100 },
        { id: 2, name: "Place 2", price: 150 }
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

function initPlaceDetails() {
    const container = document.getElementById("place-details");
    if (!container) return;
    
    // Exemple de données (plus tard API)
    const places = [
    {
        id: 1,
        name: "Place 1",
        host: "John Doe",
        price: 100,
        description: "Nice place in the city",
        amenities: ["WiFi", "Kitchen", "AC"]
    },
    {
        id: 2,
        name: "Place 2",
        host: "Jane Smith",
        price: 150,
        description: "Big apartment",
        amenities: ["WiFi", "Pool"]
    }
    ];

    // Récupérer l'id depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));

    const place = places.find(p => p.id === id);
    if (!place) {
    container.innerHTML = "<p>No places selected</p>";
    return;
    }

    container.innerHTML = `
    <section class="place-details">
        <h1>${place.name}</h1>

        <div class="place-info">
        <p><strong>Host:</strong> ${place.host}</p>
        <p><strong>Price:</strong> $${place.price}/night</p>
        <p><strong>Description:</strong> ${place.description}</p>
        <p><strong>Amenities:</strong> ${place.amenities.join(", ")}</p>
        </div>
    </section>
    `;
}

function renderReviews() {
    const container = document.getElementById("reviews");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const placeId = Number(params.get("id"));

    const reviews = [
        {
        place_id: 1,
        user: "Alice",
        rating: 5,
        comment: "Amazing place!"
        },
        {
        place_id: 2,
        user: "Bob",
        rating: 4,
        comment: "Very clean and nice."
        }
    ];

    const filteredReviews = reviews.filter(r => r.place_id === placeId);

    container.innerHTML = "";
    
    if (filteredReviews.length === 0) {
        container.innerHTML = "<p>No reviews yet.</p>";
        return;
    }

    filteredReviews.forEach(review => {
        const card = document.createElement("article");
        card.className = "review-card";

        card.innerHTML = `
        <p><strong>User:</strong> ${review.user}</p>
        <p><strong>Rating:</strong> ${review.rating}/5</p>
        <p>${review.comment}</p>
        `;

        container.appendChild(card);
    });
}

function renderAddReviewButton() {
    const container = document.getElementById("add-review-button");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const placeId = params.get("id");

    // ❌ pas d'id → on cache le bouton
    if (!placeId) {
        container.innerHTML = "";
        return;
    }

    // simulation login
    const isLoggedIn = true;

    if (isLoggedIn) {
        container.innerHTML = `
            <a href="add_review.html" class="login-button">
                Add Review
            </a>
        `;
    } else {
        container.innerHTML = "";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadHeaderFooter();
    initPlacesPage();
    initPlaceDetails();
    renderReviews();
    renderAddReviewButton();
});
