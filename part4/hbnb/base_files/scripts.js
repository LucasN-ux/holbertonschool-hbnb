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

        const firstPhoto = place.photos
            ? JSON.parse(place.photos)[0]
            : null;

        card.innerHTML = `
            ${firstPhoto
                ? `<img src="${firstPhoto}" alt="${place.title}">`
                : `<div class="place-card-no-photo">🏠</div>`}
            <div class="place-card-body">
                <h2>${place.title}</h2>
                <p class="price">$${place.price ?? 'N/A'} <span>/ night</span></p>
                <a href="place.html?id=${place.id}">View Details</a>
            </div>
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

    const placePhotos = place.photos ? JSON.parse(place.photos) : [];

    container.innerHTML = `
        ${placePhotos.length > 0
            ? `<div class="place-photos-gallery">${placePhotos.map((url, i) => `<img src="${url}" alt="${place.title} photo ${i+1}" class="${i === 0 ? 'gallery-main' : 'gallery-thumb'}">`).join('')}</div>`
            : `<div class="place-details-no-photo">🏠</div>`}
        <div class="place-details-header">
            <h1>${place.title}</h1>
        </div>
        <div class="place-info-grid">
            <div class="place-info-card">
                <div class="label">Host</div>
                <div class="value">${place.owner.first_name} ${place.owner.last_name}</div>
            </div>
            <div class="place-info-card">
                <div class="label">Price per night</div>
                <div class="value">$${place.price}</div>
            </div>
            <div class="place-info-card">
                <div class="label">Amenities</div>
                <div class="value">${place.amenities.map(a => a.name).join(', ') || 'None'}</div>
            </div>
        </div>
        <div class="place-description">${place.description || 'No description provided.'}</div>
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

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = `Reviews (${reviews.length})`;
    container.appendChild(title);

    reviews.forEach(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const card = document.createElement("article");
        card.className = "review-card";

        card.innerHTML = `
            <div class="review-header">
                <div class="review-avatar">G</div>
                <div>
                    <div class="review-stars">${stars}</div>
                </div>
            </div>
            <p class="review-text">${review.text}</p>
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

    if (!token) {
        loginLink.style.display = 'inline-flex';
    } else {
        loginLink.outerHTML = `
            <a href="profile.html" class="btn-outline">My Profile</a>
            <button class="btn-primary" onclick="logout()">Logout</button>
        `;
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

    // Toggle entre login et register
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');

    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            form.style.display = 'flex';
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            form.style.display = 'none';
            loginForm.style.display = 'flex';
        });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const data = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value
        };

        const response = await fetch('http://127.0.0.1:5000/api/v1/users/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Account created! You can now login.');
            form.style.display = 'none';
            loginForm.style.display = 'flex';
        } else {
            const err = await response.json();
            alert('Error: ' + (err.error || 'Registration failed'));
        }
    });
}

function getTokenPayload(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

async function initProfileForm() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    const token = protectPage();
    const payload = getTokenPayload(token);
    const userId = payload?.sub;

    if (!userId) {
        alert('Invalid session. Please login again.');
        window.location.href = 'login.html';
        return;
    }

    // Prefill avec les données actuelles
    const response = await fetch(`http://127.0.0.1:5000/api/v1/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        const user = await response.json();
        document.getElementById('first_name').value = user.first_name;
        document.getElementById('last_name').value = user.last_name;

        const avatar = document.getElementById('profile-avatar');
        const fullname = document.getElementById('profile-fullname');
        if (avatar) avatar.textContent = (user.first_name[0] + user.last_name[0]).toUpperCase();
        if (fullname) fullname.textContent = `${user.first_name} ${user.last_name}`;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const data = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value
        };

        const res = await fetch(`http://127.0.0.1:5000/api/v1/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert('Profile updated successfully!');
        } else {
            const err = await res.json();
            alert('Error: ' + (err.error || 'Update failed'));
        }
    });
}

async function initAddPlaceForm() {
    const form = document.getElementById('add-place-form');
    if (!form) return;

    const token = protectPage();

    // Load amenities
    const amenitiesContainer = document.getElementById('amenities-list');
    try {
        const res = await fetch('http://127.0.0.1:5000/api/v1/amenities/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const amenities = await res.json();
            if (amenities.length === 0) {
                amenitiesContainer.innerHTML = '<p class="loading-text">No amenities available.</p>';
            } else {
                amenitiesContainer.innerHTML = amenities.map(a => `
                    <label class="amenity-checkbox">
                        <input type="checkbox" name="amenities" value="${a.id}">
                        <span>${a.name}</span>
                    </label>
                `).join('');
            }
        }
    } catch {
        amenitiesContainer.innerHTML = '<p class="loading-text">Could not load amenities.</p>';
    }

    // Photo previews
    document.getElementById('photos').addEventListener('change', (e) => {
        const previewGrid = document.getElementById('photo-previews');
        previewGrid.innerHTML = '';
        Array.from(e.target.files).forEach(file => {
            const url = URL.createObjectURL(file);
            const div = document.createElement('div');
            div.className = 'photo-preview-item';
            div.innerHTML = `<img src="${url}" alt="preview">`;
            previewGrid.appendChild(div);
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Upload photos
        let photos = [];
        const photoFiles = document.getElementById('photos').files;
        if (photoFiles.length > 0) {
            const formData = new FormData();
            Array.from(photoFiles).forEach(f => formData.append('photos[]', f));

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
            photos = uploadData.photo_urls;
        }

        // Get selected amenities
        const selectedAmenities = Array.from(
            document.querySelectorAll('input[name="amenities"]:checked')
        ).map(cb => cb.value);

        const placeData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: parseFloat(document.getElementById('price').value),
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            photos: photos.length > 0 ? JSON.stringify(photos) : null,
            amenities: selectedAmenities
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
    initProfileForm();
});
