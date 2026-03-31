/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

function load(id, file) {
    return fetch(file)
    .then(res => res.text())
    .then(data => {
        document.getElementById(id).innerHTML = data;
    });
}

function loadHeaderFooter(){
    load("header", "header.html").then(() => {
        checkAuthentication();
    });
    load("footer", "footer.html");
}

let allPlaces = [];

async function fetchPlaces(token) {
    const container = document.getElementById('places-list');
    if (!container) return;

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://127.0.0.1:5000/api/v1/places/', { headers });

    if (response.ok) {
        allPlaces = await response.json();
        displayPlaces(allPlaces);
    }
}

function displayPlaces(places) {
    const container = document.getElementById('places-list');
    if (!container) return;

    container.innerHTML = '';

    places.forEach(place => {
        const card = document.createElement('article');
        card.className = 'place-card';
        card.dataset.price = place.price || 0;

        card.innerHTML = `
            ${place.photo_url ? `<img src="${place.photo_url}" alt="${place.title}" style="width:100%;border-radius:8px;margin-bottom:0.75rem;object-fit:cover;height:160px;">` : ''}
            <h2>${place.title}</h2>
            <p>Price per night: $${place.price ?? 'N/A'}</p>
            <a href="place.html?id=${place.id}">View Details</a>
        `;

        container.appendChild(card);
    });
}

function initPriceFilter() {
    const filter = document.getElementById('price-filter');
    if (!filter) return;

    filter.innerHTML = `
        <option value="all">All</option>
        <option value="50">$50</option>
        <option value="100">$100</option>
        <option value="150">$150</option>
        <option value="200">$200</option>
    `;

    filter.addEventListener('change', (event) => {
        const max = event.target.value;
        const cards = document.querySelectorAll('.place-card');

        cards.forEach(card => {
            if (max === 'all' || Number(card.dataset.price) <= Number(max)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}


function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function initPlaceDetails() {
    const container = document.getElementById("place-details");
    if (!container) return;

    const placeId = getPlaceIdFromURL();
    const token = getCookie('token');

    if (!placeId) {
        container.innerHTML = "<p>No place selected.</p>";
        return;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, { headers });

    if (!response.ok) {
        container.innerHTML = "<p>Place not found.</p>";
        return;
    }

    const place = await response.json();

    container.innerHTML = `
        <section class="place-details">
            ${place.photo_url ? `<img src="${place.photo_url}" alt="${place.title}" style="width:100%;border-radius:12px;margin-bottom:1.5rem;object-fit:cover;max-height:350px;">` : ''}
            <h1>${place.title}</h1>
            <div class="place-info">
                <p><strong>Host:</strong> ${place.owner.first_name} ${place.owner.last_name}</p>
                <p><strong>Price:</strong> $${place.price}/night</p>
                <p><strong>Description:</strong> ${place.description}</p>
                <p><strong>Amenities:</strong> ${place.amenities.map(a => a.name).join(', ') || 'None'}</p>
            </div>
        </section>
    `;
}

async function renderReviews() {
    const container = document.getElementById("reviews");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const placeId = params.get("id");

    if (!placeId) return;

    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}/reviews`);

    container.innerHTML = "";

    if (!response.ok) {
        container.innerHTML = "<p>No reviews yet.</p>";
        return;
    }

    const reviews = await response.json();

    if (reviews.length === 0) {
        container.innerHTML = "<p>No reviews yet.</p>";
        return;
    }

    reviews.forEach(review => {
        const card = document.createElement("article");
        card.className = "review-card";

        card.innerHTML = `
            <p><strong>Rating:</strong> ${review.rating}/5</p>
            <p>${review.text}</p>
        `;

        container.appendChild(card);
    });
}

function renderAddReviewButton() {
    const container = document.getElementById("add-review-button");
    if (!container) return;

    const placeId = getPlaceIdFromURL();
    const token = getCookie('token');

    if (!placeId || !token) {
        container.style.display = 'none';
        return;
    }

    container.innerHTML = `
        <a href="add_review.html?id=${placeId}" class="login-button">
            Add Review
        </a>
    `;
}

function initLogin() {
    const loginForm = document.getElementById('login-form');

    async function loginUser(email, password) {
        const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        return response;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await loginUser(email, password);

            if (response.ok) {
                const data = await response.json();

                document.cookie = `token=${data.access_token}; path=/`;

                window.location.href = 'index.html';
            } else {
                alert('Login failed: ' + response.statusText);
            }
        });
    }
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return value;
    }
    return null;
}

function logout() {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = 'login.html';
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    const registerLink = document.getElementById('register-link');

    if (!token) {
        loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'inline-block';
    } else {
        loginLink.outerHTML = '<button class="login-button" onclick="logout()">Logout</button>';
        if (registerLink) registerLink.style.display = 'none';
    }

    const addPlaceBtn = document.getElementById('add-place-btn');
    if (addPlaceBtn) {
        addPlaceBtn.style.display = token ? 'inline-block' : 'none';
    }

    fetchPlaces(token);
}



function protectPage() {
    const token = getCookie('token');
    if (!token) {
        window.location.href = 'index.html';
    }
    return token;
}

async function submitReview(token, placeId, reviewText, rating) {
    const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: reviewText, rating: parseInt(rating), place_id: placeId })
    });
    return response;
}

function handleResponse(response, form) {
    if (response.ok) {
        alert('Review submitted successfully!');
        form.reset();
    } else {
        alert('Failed to submit review');
    }
}

function initReviewForm() {
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;

    const token = protectPage();
    const placeId = getPlaceIdFromURL();

    const ratingSelect = document.getElementById('rating');
    for (let i = 1; i <= 5; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} Star${i > 1 ? 's' : ''}`;
        ratingSelect.appendChild(option);
    }

    reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const reviewText = document.getElementById('review').value;
        const rating = document.getElementById('rating').value;

        const response = await submitReview(token, placeId, reviewText, rating);
        handleResponse(response, reviewForm);
    });
}

function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const data = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        const response = await fetch('http://127.0.0.1:5000/api/v1/users/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Account created! You can now login.');
            window.location.href = 'login.html';
        } else {
            const err = await response.json();
            alert('Error: ' + (err.error || 'Registration failed'));
        }
    });
}

function initAddPlaceForm() {
    const form = document.getElementById('add-place-form');
    if (!form) return;

    const token = protectPage();

    // Photo preview
    document.getElementById('photo').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const preview = document.getElementById('photo-preview');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        let photo_url = null;

        // Upload photo if selected
        const photoFile = document.getElementById('photo').files[0];
        if (photoFile) {
            const formData = new FormData();
            formData.append('photo', photoFile);

            const uploadRes = await fetch('http://127.0.0.1:5000/api/v1/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!uploadRes.ok) {
                alert('Photo upload failed');
                return;
            }

            const uploadData = await uploadRes.json();
            photo_url = uploadData.photo_url;
        }

        const placeData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: parseFloat(document.getElementById('price').value),
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            photo_url: photo_url
        };

        const response = await fetch('http://127.0.0.1:5000/api/v1/places/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(placeData)
        });

        if (response.ok) {
            alert('Place added successfully!');
            window.location.href = 'index.html';
        } else {
            const err = await response.json();
            alert('Error: ' + (err.error || 'Failed to add place'));
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    loadHeaderFooter();
    initPriceFilter();
    initPlaceDetails();
    renderReviews();
    renderAddReviewButton();
    initLogin();
    initReviewForm();
    initAddPlaceForm();
    initRegisterForm();
});
