/* ── TOAST NOTIFICATIONS ── */
function showToast(message, type = 'info', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'false');
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    toast.addEventListener('click', () => dismissToast(toast));

    container.appendChild(toast);
    setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
    if (!toast.isConnected) return;
    toast.style.animation = 'toastOut 0.3s ease forwards';
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

/* ── UTILITIES ── */
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const trimmed = cookie.trim();
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.substring(0, eqIndex);
        const value = trimmed.substring(eqIndex + 1);
        if (key === name) return value;
    }
    return null;
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function getTokenPayload(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

function logout() {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = 'login.html';
}

function protectPage() {
    const token = getCookie('token');
    if (!token) {
        window.location.href = 'index.html';
    }
    return token;
}

/* ── HEADER / FOOTER ── */
function load(id, file) {
    return fetch(file)
        .then(res => res.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
        });
}

function loadHeaderFooter() {
    load('header', 'header.html').then(() => {
        checkAuthentication();
        initLogoAnimation();
    });
    load('footer', 'footer.html').then(() => {
        updateFooterAuth();
    });
}

function initLogoAnimation() {
    const logo    = document.querySelector('.logo-hero');
    const logoNav = document.querySelector('.logo-nav');
    const header  = document.querySelector('header');

    // Pas de hero → logo statique, header visible
    if (!logo) {
        if (logoNav) logoNav.style.opacity = '1';
        if (header)  header.classList.add('header--visible');
        return;
    }

    // Sur index : cacher le logo-nav statique, logo-hero fait tout
    if (logoNav) logoNav.style.display = 'none';
    if (header)  header.classList.remove('header--visible');

    if (!window.gsap) return;
    gsap.registerPlugin(ScrollTrigger);

    const HEADER_H  = 60;
    const targetTop = HEADER_H / 2;
    const finalSize = 22; // px ≈ 1.375rem

    ScrollTrigger.create({
        trigger : '#hero',
        start   : 'top top',
        end     : 'bottom top',
        onUpdate(self) {
            const p = Math.min(Math.max(self.progress, 0), 1);

            if (p <= 0) {
                logo.style.cssText = '';
                if (header) header.classList.remove('header--visible');
                return;
            }

            const startSize = Math.min(Math.max(window.innerWidth * 0.22, 80), 320);
            const startTop  = window.innerHeight / 2;
            const size = startSize + (finalSize - startSize) * p;
            const top  = startTop  + (targetTop - startTop)  * p;

            logo.style.top           = top + 'px';
            logo.style.left          = '50%';
            logo.style.transform     = 'translate(-50%, -50%)';
            logo.style.fontSize      = size + 'px';
            logo.style.position      = 'fixed';
            logo.style.zIndex        = '1002';
            logo.style.letterSpacing = '0.18em';
            logo.style.textTransform = 'uppercase';

            if (p >= 0.90) {
                logo.style.background           = 'linear-gradient(110deg, #4B5043 0%, #9BC4BC 100%)';
                logo.style.webkitBackgroundClip = 'text';
                logo.style.backgroundClip       = 'text';
                logo.style.webkitTextFillColor  = 'transparent';
                logo.style.color                = 'transparent';
                logo.style.pointerEvents        = 'auto';
                if (header) header.classList.add('header--visible');
            } else {
                logo.style.background           = '';
                logo.style.webkitBackgroundClip = '';
                logo.style.backgroundClip       = '';
                logo.style.webkitTextFillColor  = '';
                logo.style.color                = `rgba(255,255,255,${1 - p * 0.4})`;
                logo.style.pointerEvents        = 'none';
                if (header) header.classList.remove('header--visible');
            }
        }
    });
}

function updateFooterAuth() {
    const container = document.getElementById('footer-account-links');
    if (!container) return;
    const token = getCookie('token');
    if (token) {
        container.innerHTML = `
            <a href="profile.html">My Profile</a>
            <a href="#" onclick="logout();return false;">Logout</a>
        `;
    } else {
        container.innerHTML = `
            <a href="login.html">Login</a>
            <a href="login.html">Register</a>
        `;
    }
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (!token) {
        if (loginLink) loginLink.style.display = 'inline-flex';
    } else {
        if (loginLink) {
            const payload = getTokenPayload(token);
            const isAdmin = payload && payload.is_admin;
            loginLink.outerHTML = isAdmin
                ? `<a href="admin.html" class="btn-outline">Admin Panel</a>
                   <button class="btn-primary" onclick="logout()" aria-label="Log out of your account">Logout</button>`
                : `<a href="my_places.html" class="btn-outline">My Places</a>
                   <a href="profile.html" class="btn-outline">My Profile</a>
                   <button class="btn-primary" onclick="logout()" aria-label="Log out of your account">Logout</button>`;
        }
    }

    fetchPlaces(token);
}

/* ── PLACES ── */
let allPlaces = [];

async function fetchPlaces(token) {
    const container = document.getElementById('places-list');
    if (!container) return;

    container.innerHTML = '<div class="loading-state"><span class="spinner" aria-hidden="true"></span>Loading places...</div>';
    container.setAttribute('aria-busy', 'true');

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/places/', { headers });
        if (response.ok) {
            allPlaces = await response.json();
            displayPlaces(allPlaces);
            buildMarquee(allPlaces);
        } else {
            container.innerHTML = '<p class="loading-text">Could not load places.</p>';
        }
    } catch {
        container.innerHTML = '<p class="loading-text">Could not connect to server.</p>';
    } finally {
        container.setAttribute('aria-busy', 'false');
    }
}

function displayPlaces(places) {
    const container = document.getElementById('places-list');
    if (!container) return;

    container.innerHTML = '';

    if (places.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏡</div>
                <p>No places found matching your filters.</p>
            </div>`;
        return;
    }

    places.forEach(place => {
        const card = document.createElement('article');
        card.className = 'place-card';
        card.dataset.price = place.price || 0;

        let photos = [];
        try { photos = place.photos ? JSON.parse(place.photos) : []; } catch {}
        const firstPhoto = photos[0] || null;

        const priceDisplay = place.price != null ? `$${place.price}` : 'N/A';

        card.innerHTML = `
            <a href="place.html?id=${place.id}" class="place-card-link" aria-label="View ${place.title}, ${priceDisplay} per night">
                <div class="place-card-image">
                    ${firstPhoto
                        ? `<img src="${firstPhoto}" alt="${place.title}" loading="lazy">`
                        : `<div class="place-card-no-photo" aria-hidden="true">🏠</div>`}
                    <div class="place-card-price">${priceDisplay} <span>/ night</span></div>
                </div>
                <div class="place-card-body">
                    <h2 class="place-card-title">${place.title}</h2>
                </div>
            </a>
        `;

        container.appendChild(card);
    });
}

function initFilters() {
    const searchInput = document.getElementById('search-input');
    const priceFilter = document.getElementById('price-filter');
    const sortSelect  = document.getElementById('sort-select');
    const resetBtn    = document.getElementById('filter-reset');

    if (!priceFilter && !searchInput && !sortSelect) return;

    function applyFilters() {
        const query    = (searchInput?.value || '').toLowerCase().trim();
        const maxPrice = priceFilter?.value || 'all';
        const sort     = sortSelect?.value  || 'default';

        let filtered = allPlaces.filter(p => {
            const matchPrice = maxPrice === 'all' || (p.price != null && Number(p.price) <= Number(maxPrice));
            const matchQuery = !query ||
                (p.title    || '').toLowerCase().includes(query) ||
                (p.city     || '').toLowerCase().includes(query) ||
                (p.location || '').toLowerCase().includes(query) ||
                (p.address  || '').toLowerCase().includes(query);
            return matchPrice && matchQuery;
        });

        filtered = [...filtered].sort((a, b) => {
            switch (sort) {
                case 'name-asc':     return (a.title || '').localeCompare(b.title || '');
                case 'name-desc':    return (b.title || '').localeCompare(a.title || '');
                case 'price-asc':    return (a.price || 0) - (b.price || 0);
                case 'price-desc':   return (b.price || 0) - (a.price || 0);
                case 'location-asc': return (a.city || a.location || '').localeCompare(b.city || b.location || '');
                default:             return 0;
            }
        });

        displayPlaces(filtered);
    }

    searchInput?.addEventListener('input', applyFilters);
    priceFilter?.addEventListener('change', applyFilters);
    sortSelect?.addEventListener('change', applyFilters);

    resetBtn?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (priceFilter) priceFilter.value = 'all';
        if (sortSelect)  sortSelect.value  = 'default';
        displayPlaces(allPlaces);
    });
}

/* ── PLACE DETAILS ── */
async function initPlaceDetails() {
    const container = document.getElementById('place-details');
    if (!container) return;

    const placeId = getPlaceIdFromURL();
    const token = getCookie('token');

    if (!placeId) {
        container.innerHTML = '<p>No place selected.</p>';
        return;
    }

    container.innerHTML = '<div class="loading-state"><span class="spinner" aria-hidden="true"></span>Loading place...</div>';

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, { headers });

    if (!response.ok) {
        container.innerHTML = '<p>Place not found.</p>';
        return;
    }

    const place = await response.json();

    // Update page title
    document.title = `${place.title} — hbnb`;

    let photos = [];
    try { photos = place.photos ? JSON.parse(place.photos) : []; } catch {}

    const galleryHTML = photos.length > 0
        ? `<div class="place-photos-gallery" role="img" aria-label="Photos of ${place.title}">
            ${photos.map((url, i) => `<img src="${url}" alt="${place.title} — photo ${i + 1}" class="${i === 0 ? 'gallery-main' : 'gallery-thumb'}" loading="${i === 0 ? 'eager' : 'lazy'}">`).join('')}
           </div>`
        : `<div class="place-details-no-photo" aria-hidden="true">🏠</div>`;

    const payload = token ? getTokenPayload(token) : null;
    const isOwner = payload && payload.sub === place.owner.id;
    const reviewBtnHTML = (token && !isOwner)
        ? `<hr class="booking-divider">
           <a href="add_review.html?id=${place.id}" class="btn-review">Add a Review</a>`
        : '';

    container.innerHTML = `
        <div class="place-layout">
            <div class="place-main">
                ${galleryHTML}
                <div class="place-details-header">
                    <h1>${place.title}</h1>
                </div>
                <div class="place-info-grid">
                    <div class="place-info-card">
                        <div class="label" id="host-label">Host</div>
                        <div class="value" aria-labelledby="host-label">${place.owner.first_name} ${place.owner.last_name}</div>
                    </div>
                    <div class="place-info-card">
                        <div class="label" id="price-label">Price per night</div>
                        <div class="value" aria-labelledby="price-label">$${place.price}</div>
                    </div>
                    <div class="place-info-card">
                        <div class="label" id="amenities-label">Amenities</div>
                        <div class="value" aria-labelledby="amenities-label">${place.amenities.map(a => a.name).join(', ') || 'None'}</div>
                    </div>
                </div>
                <div class="place-description">${place.description || 'No description provided.'}</div>
            </div>
            <aside class="place-sidebar">
                <div class="booking-card" id="booking-card">
                    <div class="booking-price">$${place.price} <span>/ night</span></div>
                    <p class="booking-meta">Hosted by ${place.owner.first_name} ${place.owner.last_name}</p>
                    ${reviewBtnHTML}
                </div>
            </aside>
        </div>
    `;
}

/* ── REVIEWS ── */
async function renderReviews() {
    const container = document.getElementById('reviews');
    if (!container) return;

    const placeId = getPlaceIdFromURL();
    if (!placeId) return;

    container.setAttribute('aria-busy', 'true');
    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}/reviews`);

    container.innerHTML = '';
    container.setAttribute('aria-busy', 'false');

    if (!response.ok) {
        container.innerHTML = '<p>No reviews yet.</p>';
        return;
    }

    const reviews = await response.json();

    if (reviews.length === 0) {
        container.innerHTML = '<p>No reviews yet.</p>';
        return;
    }

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = `Reviews (${reviews.length})`;
    container.appendChild(title);

    reviews.forEach(review => {
        const filledStars = '★'.repeat(review.rating);
        const emptyStars = '☆'.repeat(5 - review.rating);
        const card = document.createElement('article');
        card.className = 'review-card';

        card.innerHTML = `
            <div class="review-header">
                <div class="review-avatar" aria-hidden="true">G</div>
                <div>
                    <div class="review-stars" aria-label="${review.rating} out of 5 stars">${filledStars}${emptyStars}</div>
                </div>
            </div>
            <p class="review-text">${review.text}</p>
        `;

        container.appendChild(card);
    });
}

function renderAddReviewButton() {
    const placeId = getPlaceIdFromURL();
    const token = getCookie('token');
    const fallback = document.getElementById('add-review-button');

    // initPlaceDetails already injects the button (or not) — nothing to do here
    // Just hide the fallback container; it is only a safety net for pages without booking-card
    const bookingCard = document.getElementById('booking-card');
    if (bookingCard) {
        if (fallback) fallback.style.display = 'none';
        return;
    }

    // Fallback path: no booking-card (shouldn't happen with current layout)
    if (!fallback) return;
    if (!placeId || !token) { fallback.style.display = 'none'; return; }

    // Owner check is handled in initPlaceDetails (booking-card path)
    fallback.style.display = 'none';
}

/* ── LOGIN ── */
function initLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in…';

        const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';

        if (response.ok) {
            const data = await response.json();
            document.cookie = `token=${data.access_token}; path=/`;
            const payload = getTokenPayload(data.access_token);
            window.location.href = (payload && payload.is_admin) ? 'admin.html' : 'index.html';
        } else {
            showToast('Invalid email or password. Please try again.', 'error');
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    });
}

/* ── REGISTER ── */
function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');

    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            form.style.display = 'flex';
            form.querySelector('input').focus();
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            form.style.display = 'none';
            loginForm.style.display = 'flex';
            loginForm.querySelector('input').focus();
        });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account…';

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

        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';

        if (response.ok) {
            showToast('Account created! You can now login.', 'success');
            form.reset();
            form.style.display = 'none';
            loginForm.style.display = 'flex';
            document.getElementById('email').focus();
        } else {
            const err = await response.json();
            showToast(err.error || 'Registration failed. Please try again.', 'error');
        }
    });
}

/* ── REVIEW FORM ── */
async function submitReview(token, placeId, reviewText, rating) {
    return fetch('http://127.0.0.1:5000/api/v1/reviews/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: reviewText, rating: parseInt(rating), place_id: placeId })
    });
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

        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';

        const reviewText = document.getElementById('review').value;
        const rating = document.getElementById('rating').value;

        const response = await submitReview(token, placeId, reviewText, rating);

        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';

        if (response.ok) {
            showToast('Review submitted successfully!', 'success');
            reviewForm.reset();
            setTimeout(() => window.history.back(), 1500);
        } else {
            showToast('Failed to submit review. Please try again.', 'error');
        }
    });
}

/* ── PROFILE ── */
async function initProfileForm() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    const token = protectPage();
    const payload = getTokenPayload(token);
    const userId = payload?.sub;

    if (!userId) {
        showToast('Invalid session. Please login again.', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

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

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving…';

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

        submitBtn.disabled = false;
        submitBtn.textContent = 'Save changes';

        if (res.ok) {
            showToast('Profile updated successfully!', 'success');
            const avatar = document.getElementById('profile-avatar');
            const fullname = document.getElementById('profile-fullname');
            if (avatar) avatar.textContent = (data.first_name[0] + data.last_name[0]).toUpperCase();
            if (fullname) fullname.textContent = `${data.first_name} ${data.last_name}`;
        } else {
            const err = await res.json();
            showToast(err.error || 'Update failed. Please try again.', 'error');
        }
    });
}

/* ── ADD PLACE ── */
async function initAddPlaceForm() {
    const form = document.getElementById('add-place-form');
    if (!form) return;

    const token = protectPage();
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

    document.getElementById('photos').addEventListener('change', (e) => {
        const previewGrid = document.getElementById('photo-previews');
        previewGrid.innerHTML = '';
        Array.from(e.target.files).forEach(file => {
            const url = URL.createObjectURL(file);
            const div = document.createElement('div');
            div.className = 'photo-preview-item';
            div.innerHTML = `<img src="${url}" alt="Photo preview">`;
            previewGrid.appendChild(div);
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing…';

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
                showToast('Photo upload failed. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish my place';
                return;
            }
            photos = (await uploadRes.json()).photo_urls;
        }

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

        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish my place';

        if (response.ok) {
            showToast('Place published successfully!', 'success');
            setTimeout(() => window.location.href = 'my_places.html', 1500);
        } else {
            const err = await response.json();
            showToast(err.error || 'Failed to add place. Please try again.', 'error');
        }
    });
}

/* ── MY PLACES ── */
async function initMyPlaces() {
    const container = document.getElementById('my-places-list');
    if (!container) return;

    const token = protectPage();
    const payload = getTokenPayload(token);
    const userId = payload?.sub;

    container.innerHTML = '<div class="loading-state"><span class="spinner" aria-hidden="true"></span>Loading your places…</div>';
    container.setAttribute('aria-busy', 'true');

    const res = await fetch(
        `http://127.0.0.1:5000/api/v1/users/${userId}/places`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );

    container.setAttribute('aria-busy', 'false');

    if (!res.ok) {
        container.innerHTML = '<p class="loading-text">Could not load your places.</p>';
        return;
    }

    const places = await res.json();

    if (places.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>You have no places yet.</p>
                <a href="add_place.html" class="btn-save" style="display:inline-block;width:auto;padding:0.75rem 1.5rem;">Add your first place</a>
            </div>`;
        return;
    }

    container.innerHTML = '';
    places.forEach(place => {
        let photos = [];
        try { photos = place.photos ? JSON.parse(place.photos) : []; } catch {}

        const card = document.createElement('article');
        card.className = 'my-place-card';
        card.innerHTML = `
            <div class="my-place-photo">
                ${photos[0]
                    ? `<img src="${photos[0]}" alt="${place.title}" loading="lazy">`
                    : `<div class="place-card-no-photo" aria-hidden="true">🏠</div>`}
            </div>
            <div class="my-place-info">
                <h3>${place.title}</h3>
                <p class="price">$${place.price} <span>/ night</span></p>
                <p class="description">${place.description || ''}</p>
            </div>
            <div class="my-place-actions">
                <a href="place.html?id=${place.id}" class="btn-outline" aria-label="View ${place.title}">View</a>
                <a href="edit_place.html?id=${place.id}" class="btn-save" style="width:auto;padding:0.5rem 1.25rem;" aria-label="Edit ${place.title}">Edit</a>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ── EDIT PLACE ── */
async function initEditPlaceForm() {
    const form = document.getElementById('edit-place-form');
    if (!form) return;

    const token = protectPage();
    const placeId = getPlaceIdFromURL();

    const amenitiesContainer = document.getElementById('amenities-list');
    const allAmenities = [];
    try {
        const res = await fetch('http://127.0.0.1:5000/api/v1/amenities/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            allAmenities.push(...(await res.json()));
        }
    } catch {}

    const placeRes = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`);
    if (!placeRes.ok) {
        showToast('Place not found.', 'error');
        setTimeout(() => window.location.href = 'my_places.html', 1500);
        return;
    }
    const place = await placeRes.json();

    document.title = `Edit — ${place.title}`;
    document.getElementById('title').value = place.title;
    document.getElementById('description').value = place.description || '';
    document.getElementById('price').value = place.price;
    document.getElementById('latitude').value = place.latitude;
    document.getElementById('longitude').value = place.longitude;

    const currentAmenityIds = place.amenities.map(a => a.id);
    amenitiesContainer.innerHTML = allAmenities.length === 0
        ? '<p class="loading-text">No amenities available.</p>'
        : allAmenities.map(a => `
            <label class="amenity-checkbox">
                <input type="checkbox" name="amenities" value="${a.id}"
                    ${currentAmenityIds.includes(a.id) ? 'checked' : ''}>
                <span>${a.name}</span>
            </label>
        `).join('');

    let currentPhotos = [];
    try { currentPhotos = place.photos ? JSON.parse(place.photos) : []; } catch {}

    const currentPhotosDiv = document.getElementById('current-photos');
    if (currentPhotos.length > 0) {
        currentPhotosDiv.innerHTML = currentPhotos.map((url, i) =>
            `<div class="photo-preview-item"><img src="${url}" alt="Current photo ${i + 1}" loading="lazy"></div>`
        ).join('');
    }

    document.getElementById('photos').addEventListener('change', (e) => {
        const previewGrid = document.getElementById('photo-previews');
        previewGrid.innerHTML = '';
        Array.from(e.target.files).forEach(file => {
            const div = document.createElement('div');
            div.className = 'photo-preview-item';
            div.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="New photo preview">`;
            previewGrid.appendChild(div);
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving…';

        let photos = currentPhotos;
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
                showToast('Photo upload failed. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save changes';
                return;
            }
            photos = (await uploadRes.json()).photo_urls;
        }

        const selectedAmenities = Array.from(
            document.querySelectorAll('input[name="amenities"]:checked')
        ).map(cb => cb.value);

        const data = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: parseFloat(document.getElementById('price').value),
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            photos: photos.length > 0 ? JSON.stringify(photos) : null,
            amenities: selectedAmenities
        };

        const res = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Save changes';

        if (res.ok) {
            showToast('Place updated successfully!', 'success');
            setTimeout(() => window.location.href = 'my_places.html', 1500);
        } else {
            const err = await res.json();
            showToast(err.error || 'Update failed. Please try again.', 'error');
        }
    });
}

/* ── MARQUEE CAROUSEL ── */
function buildMarquee(places) {
    const inner = document.getElementById('marquee-inner');
    if (!inner || places.length === 0) return;

    // Use all places, minimum 8 cards — repeat if needed
    const pool = places.length < 8
        ? [...places, ...places, ...places].slice(0, Math.max(places.length * 3, 8))
        : places;

    const makeCard = (place) => {
        let photos = [];
        try { photos = place.photos ? JSON.parse(place.photos) : []; } catch {}
        const photo = photos[0] || null;
        const price = place.price != null ? `$${place.price}` : null;

        const a = document.createElement('a');
        a.href = `place.html?id=${place.id}`;
        a.className = 'marquee-card';
        a.setAttribute('aria-label', `${place.title}${price ? ', ' + price + ' per night' : ''}`);

        a.innerHTML = `
            ${photo
                ? `<img src="${photo}" alt="${place.title}" loading="lazy">`
                : `<div class="marquee-card-no-photo" aria-hidden="true">🏠</div>`}
            <div class="marquee-card__overlay" aria-hidden="true"></div>
            <div class="marquee-card__info">
                <div class="marquee-card__title">${place.title}</div>
                ${price ? `<div class="marquee-card__price"><strong>${price}</strong> / night</div>` : ''}
            </div>
        `;
        return a;
    };

    // First pass
    pool.forEach(p => inner.appendChild(makeCard(p)));
    // Duplicate for seamless loop
    pool.forEach(p => inner.appendChild(makeCard(p)));
}

/* ── SCROLL REVEAL (IntersectionObserver) ── */
function initScrollReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
}

/* ── HEADER SCROLL STATE ── */
function initHeaderScroll() {
    // Sur index, le logo animation contrôle le header — pas de scroll class
    if (document.querySelector('.logo-hero')) return;
    const header = document.querySelector('header');
    if (!header) return;
    const toggle = () => header.classList.toggle('scrolled', window.scrollY > 10);
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function () {
    loadHeaderFooter();
    initFilters();
    initPlaceDetails();
    renderReviews();
    renderAddReviewButton();
    initLogin();
    initReviewForm();
    initAddPlaceForm();
    initRegisterForm();
    initProfileForm();
    initMyPlaces();
    initEditPlaceForm();
    initScrollReveal();

    // Header scroll class — also run after header is injected
    const headerDiv = document.getElementById('header');
    if (headerDiv) {
        new MutationObserver(() => initHeaderScroll())
            .observe(headerDiv, { childList: true });
    }
});
