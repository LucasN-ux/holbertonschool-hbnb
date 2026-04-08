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
        initMobileMenu();
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
            logo.style.marginRight   = '-0.18em';
            logo.style.textTransform = 'uppercase';
            logo.style.overflow      = 'visible';

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

function initMobileMenu() {
    const hamburger = document.getElementById('nav-hamburger');
    const menu      = document.getElementById('mobile-menu');
    const overlay   = document.getElementById('mobile-menu-overlay');
    if (!hamburger || !menu || !overlay) return;

    function openMenu() {
        menu.classList.add('open');
        overlay.classList.add('open');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        menu.classList.remove('open');
        overlay.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
        hamburger.classList.contains('open') ? closeMenu() : openMenu();
    });
    overlay.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMenu();
    });
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const mobileLinks = document.getElementById('mobile-menu-links');
    const mobileLoginLink = document.getElementById('mobile-login-link');

    if (!token) {
        if (loginLink) loginLink.style.display = 'inline-flex';
        if (mobileLoginLink) mobileLoginLink.style.display = 'block';
    } else {
        const payload = getTokenPayload(token);
        const isAdmin = payload && payload.is_admin;

        const firstName = (payload && payload.first_name) ? payload.first_name : '';
        const initial  = firstName ? firstName[0].toUpperCase() : '?';

        const adminLinks = `
            <a href="admin.html" role="menuitem">⚙ Control Room</a>
            <hr class="nav-sep" role="separator">
            <button class="nav-dd-logout" onclick="logout()" role="menuitem">Logout</button>`;
        const userLinks = `
            <a href="my_places.html" role="menuitem">My Stations</a>
            <a href="my_reservations.html" role="menuitem">My Reservations</a>
            <a href="profile.html" role="menuitem">My Profile</a>
            <hr class="nav-sep" role="separator">
            <button class="nav-dd-logout" onclick="logout()" role="menuitem">Logout</button>`;

        if (loginLink) {
            loginLink.outerHTML = `
                <div class="nav-dropdown" id="nav-dropdown">
                    <button class="nav-dd-trigger" id="nav-dd-trigger"
                        aria-haspopup="true" aria-expanded="false"
                        aria-label="Account menu — ${firstName || 'Navigator'}">
                        <span class="nav-avatar">${initial}</span>
                        ${firstName ? `<span class="nav-dd-name">${firstName}</span>` : ''}
                        <svg class="nav-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="nav-dd-menu" id="nav-dd-menu" role="menu" aria-hidden="true">
                        ${isAdmin ? adminLinks : userLinks}
                    </div>
                </div>`;
            initNavDropdown();
        }

        if (mobileLinks) {
            mobileLinks.innerHTML = isAdmin
                ? `${firstName ? `<span class="mobile-user-name">◉ ${firstName}</span>` : ''}
                   <a href="admin.html">Control Room</a>
                   <a href="#" onclick="logout();return false;">Logout</a>`
                : `${firstName ? `<span class="mobile-user-name">◉ ${firstName}</span>` : ''}
                   <a href="my_places.html">My Stations</a>
                   <a href="my_reservations.html">My Reservations</a>
                   <a href="profile.html">My Profile</a>
                   <a href="#" onclick="logout();return false;">Logout</a>`;
        }
    }

    fetchPlaces(token);
}

function initNavDropdown() {
    const trigger = document.getElementById('nav-dd-trigger');
    const menu    = document.getElementById('nav-dd-menu');
    const wrapper = document.getElementById('nav-dropdown');
    if (!trigger || !menu) return;

    // Move menu to <body> so it's in the root stacking context
    // (avoids header's stacking context capping z-index)
    document.body.appendChild(menu);

    function positionMenu() {
        const rect = trigger.getBoundingClientRect();
        menu.style.top  = (rect.bottom + 6) + 'px';
        menu.style.right = (window.innerWidth - rect.right) + 'px';
        menu.style.left = 'auto';
    }

    function open() {
        positionMenu();
        menu.style.display = 'flex';
        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
    }
    function close() {
        menu.style.display = 'none';
        wrapper.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.style.display === 'flex' ? close() : open();
    });

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target) && !menu.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    menu.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', close);
    });

    // Reposition on scroll/resize while open
    window.addEventListener('scroll', () => {
        if (menu.style.display === 'flex') positionMenu();
    }, { passive: true });
    window.addEventListener('resize', () => {
        if (menu.style.display === 'flex') positionMenu();
    }, { passive: true });
}

/* ── PLACES ── */
let allPlaces = [];

async function fetchPlaces(token) {
    const container = document.getElementById('places-list');
    if (!container) return;

    container.innerHTML = '<div class="loading-state"><span class="spinner" aria-hidden="true"></span>Scanning habitats…</div>';
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
            container.innerHTML = '<p class="loading-text">Transmission interrupted. Habitats unavailable.</p>';
        }
    } catch {
        container.innerHTML = '<p class="loading-text">No signal detected. Check your connection.</p>';
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
                <div class="empty-state-icon">🪐</div>
                <p>No habitats match your search parameters.</p>
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
            <a href="place.html?id=${place.id}" class="place-card-link" aria-label="Scout ${place.title}, ${priceDisplay} per cycle">
                <div class="place-card-image">
                    ${firstPhoto
                        ? `<img src="${firstPhoto}" alt="${place.title}" loading="lazy">`
                        : `<div class="place-card-no-photo" aria-hidden="true"><img src="images/no_picture.jpg" alt="No visual scan" style="width:100%;height:100%;object-fit:cover;"></div>`}
                    <div class="place-card-price">${priceDisplay} <span>/ cycle</span></div>
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
        const countEl  = document.getElementById('filter-count');

        let filtered = allPlaces.filter(p => {
            const matchPrice = maxPrice === 'all' || (p.price != null && Number(p.price) <= Number(maxPrice));
            const matchQuery = !query ||
                (p.title    || '').toLowerCase().includes(query) ||
                (p.city     || '').toLowerCase().includes(query) ||
                (p.location || '').toLowerCase().includes(query) ||
                (p.address  || '').toLowerCase().includes(query);
            return matchPrice && matchQuery;
        });

        if (countEl) {
            const isFiltered = query || maxPrice !== 'all' || sort !== 'default';
            countEl.textContent = isFiltered ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : '';
        }

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
        const countEl = document.getElementById('filter-count');
        if (countEl) countEl.textContent = '';
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
        container.innerHTML = '<p>No habitat selected.</p>';
        return;
    }

    container.innerHTML = '<div class="loading-state"><span class="spinner" aria-hidden="true"></span>Initializing habitat data…</div>';

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, { headers });

    if (!response.ok) {
        container.innerHTML = '<p>Habitat not found in registry.</p>';
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
        : `<div class="place-details-no-photo" aria-hidden="true"><img src="images/no_picture.jpg" alt="No visual scan" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;"></div>`;

    const payload = token ? getTokenPayload(token) : null;
    const isOwner = payload && payload.sub === place.owner.id;
    const isLoggedIn = !!token;

    const reviewBtnHTML = (isLoggedIn && !isOwner)
        ? `<hr class="booking-divider">
           <a href="add_review.html?id=${place.id}" class="btn-review">File Mission Log</a>`
        : '';

    // Reservation section — only for logged-in non-owners
    const today = new Date().toISOString().split('T')[0];
    const reservationHTML = (isLoggedIn && !isOwner)
        ? `<hr class="booking-divider">
           <div class="booking-reservation" id="booking-reservation">
               <h3 class="booking-res-title">Reserve this habitat</h3>
               <div class="booking-dates">
                   <label for="res-checkin">Check-in</label>
                   <input type="date" id="res-checkin" min="${today}" aria-label="Check-in date">
                   <label for="res-checkout">Check-out</label>
                   <input type="date" id="res-checkout" min="${today}" aria-label="Check-out date">
               </div>
               <div class="booking-total" id="booking-total" aria-live="polite"></div>
               <button class="btn-reserve" id="btn-reserve" disabled>Select dates to reserve</button>
           </div>`
        : (!isLoggedIn
            ? `<hr class="booking-divider">
               <a href="login.html" class="btn-reserve" style="text-align:center;">Log in to reserve</a>`
            : '');

    container.innerHTML = `
        <div class="place-layout">
            <div class="place-main">
                ${galleryHTML}
                <div class="place-details-header">
                    <h1>${place.title}</h1>
                </div>
                <div class="place-info-grid">
                    <div class="place-info-card">
                        <div class="label" id="host-label">Keeper</div>
                        <div class="value" aria-labelledby="host-label">${place.owner.first_name} ${place.owner.last_name}</div>
                    </div>
                    <div class="place-info-card">
                        <div class="label" id="price-label">Rate / cycle</div>
                        <div class="value" aria-labelledby="price-label">$${place.price}</div>
                    </div>
                    <div class="place-info-card">
                        <div class="label" id="amenities-label">Systems</div>
                        <div class="value" aria-labelledby="amenities-label">${place.amenities.map(a => a.name).join(', ') || 'None'}</div>
                    </div>
                </div>
                <div class="place-description">${place.description || 'No atmospheric briefing provided.'}</div>
            </div>
            <aside class="place-sidebar">
                <div class="booking-card" id="booking-card">
                    <div class="booking-price">$${place.price} <span>/ cycle</span></div>
                    <p class="booking-meta">Kept by ${place.owner.first_name} ${place.owner.last_name}</p>
                    ${reservationHTML}
                    ${reviewBtnHTML}
                </div>
            </aside>
        </div>
    `;

    // Wire up date pickers if they exist
    if (isLoggedIn && !isOwner) {
        const checkin  = document.getElementById('res-checkin');
        const checkout = document.getElementById('res-checkout');
        const totalEl  = document.getElementById('booking-total');
        const reserveBtn = document.getElementById('btn-reserve');

        function updateTotal() {
            const inVal  = checkin.value;
            const outVal = checkout.value;
            if (!inVal || !outVal) {
                totalEl.textContent = '';
                reserveBtn.disabled = true;
                reserveBtn.textContent = 'Select dates to reserve';
                return;
            }
            const inDate  = new Date(inVal);
            const outDate = new Date(outVal);
            if (outDate <= inDate) {
                totalEl.textContent = 'Check-out must be after check-in';
                totalEl.className = 'booking-total error';
                reserveBtn.disabled = true;
                reserveBtn.textContent = 'Invalid dates';
                return;
            }
            const nights = Math.round((outDate - inDate) / 86400000);
            const total  = (nights * parseFloat(place.price)).toFixed(2);
            totalEl.innerHTML = `<strong>${nights} night${nights > 1 ? 's' : ''}</strong> — $${total} total`;
            totalEl.className = 'booking-total';
            reserveBtn.disabled = false;
            reserveBtn.textContent = `Reserve — $${total}`;
        }

        checkin.addEventListener('change', () => {
            if (checkout.value && checkout.value <= checkin.value) {
                checkout.value = '';
            }
            checkout.min = checkin.value || today;
            updateTotal();
        });
        checkout.addEventListener('change', updateTotal);

        reserveBtn.addEventListener('click', async () => {
            if (!checkin.value || !checkout.value) return;
            reserveBtn.disabled = true;
            reserveBtn.textContent = 'Initiating…';

            const res = await fetch('http://127.0.0.1:5000/api/v1/reservations/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    place_id:  place.id,
                    check_in:  checkin.value,
                    check_out: checkout.value
                })
            });

            if (res.ok) {
                showToast('Reservation request transmitted! Awaiting keeper confirmation.', 'success', 5000);
                checkin.value  = '';
                checkout.value = '';
                totalEl.textContent = '';
                reserveBtn.textContent = 'Select dates to reserve';
            } else {
                const err = await res.json();
                showToast(err.error || 'Reservation failed. Please retry.', 'error');
                reserveBtn.disabled = false;
                reserveBtn.textContent = `Reserve`;
            }
        });
    }
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
        container.innerHTML = '<p>No mission logs filed yet.</p>';
        return;
    }

    const reviews = await response.json();

    if (reviews.length === 0) {
        container.innerHTML = '<p>No mission logs filed yet.</p>';
        return;
    }

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = `Mission Logs (${reviews.length})`;
    container.appendChild(title);

    reviews.forEach(review => {
        const filledStars = '★'.repeat(review.rating);
        const emptyStars = '☆'.repeat(5 - review.rating);
        const card = document.createElement('article');
        card.className = 'review-card';

        card.innerHTML = `
            <div class="review-header">
                <div class="review-avatar" aria-hidden="true">E</div>
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
        submitBtn.textContent = 'Initiating sequence…';

        const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Initiate sequence';

        if (response.ok) {
            const data = await response.json();
            document.cookie = `token=${data.access_token}; path=/`;
            const payload = getTokenPayload(data.access_token);
            window.location.href = (payload && payload.is_admin) ? 'admin.html' : 'index.html';
        } else {
            showToast('Access denied. Invalid frequency or cipher.', 'error');
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

    // Auto-show register form if ?register=1 is in the URL
    if (new URLSearchParams(window.location.search).get('register') === '1') {
        if (loginForm) loginForm.style.display = 'none';
        form.style.display = 'flex';
        form.querySelector('input')?.focus();
    }

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
        submitBtn.textContent = 'Enlisting…';

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
        submitBtn.textContent = 'Enlist';

        if (response.ok) {
            showToast('Navigator registered. Initiate sequence to board.', 'success');
            form.reset();
            form.style.display = 'none';
            loginForm.style.display = 'flex';
            document.getElementById('email').focus();
        } else {
            const err = await response.json();
            showToast(err.error || 'Enlistment failed. Please retry.', 'error');
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
        option.textContent = `${i} Signal${i > 1 ? 's' : ''}`;
        ratingSelect.appendChild(option);
    }

    reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Transmitting…';

        const reviewText = document.getElementById('review').value;
        const rating = document.getElementById('rating').value;

        const response = await submitReview(token, placeId, reviewText, rating);

        submitBtn.disabled = false;
        submitBtn.textContent = 'Transmit log';

        if (response.ok) {
            showToast('Mission log transmitted successfully!', 'success');
            reviewForm.reset();
            setTimeout(() => window.history.back(), 1500);
        } else {
            showToast('Transmission failed. Please retry.', 'error');
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
        showToast('Session expired. Please re-authenticate.', 'error');
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
        submitBtn.textContent = 'Syncing…';

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
        submitBtn.textContent = 'Sync file';

        if (res.ok) {
            showToast('Navigator file synchronized.', 'success');
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
                amenitiesContainer.innerHTML = '<p class="loading-text">No systems available.</p>';
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
        amenitiesContainer.innerHTML = '<p class="loading-text">Unable to scan available systems.</p>';
    }

    let addPlaceFiles = [];

    function renderAddPhotos() {
        const grid = document.getElementById('photo-previews');
        const hint = document.getElementById('photos-hint');
        const label = document.querySelector('label.photo-upload-area');
        hint.textContent = `${addPlaceFiles.length} / 10 scans`;
        if (label) label.style.display = addPlaceFiles.length >= 10 ? 'none' : '';
        grid.innerHTML = '';
        addPlaceFiles.forEach((file, i) => {
            const div = document.createElement('div');
            div.className = 'photo-preview-item';
            div.innerHTML = `
                <img src="${URL.createObjectURL(file)}" alt="Photo ${i + 1}">
                <button type="button" class="photo-remove-btn" aria-label="Remove photo" onclick="removeAddPhoto(${i})">&#x2715;</button>`;
            grid.appendChild(div);
        });
    }

    window.removeAddPhoto = (i) => { addPlaceFiles.splice(i, 1); renderAddPhotos(); };

    document.getElementById('photos').addEventListener('change', (e) => {
        const slots = 10 - addPlaceFiles.length;
        const incoming = Array.from(e.target.files).slice(0, slots);
        if (e.target.files.length > slots) {
            showToast(`Only ${slots} more scan(s) can be uploaded (10 max).`, 'error');
        }
        addPlaceFiles.push(...incoming);
        e.target.value = '';
        renderAddPhotos();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Broadcasting…';

        let photos = [];
        if (addPlaceFiles.length > 0) {
            const formData = new FormData();
            addPlaceFiles.forEach(f => formData.append('photos[]', f));

            const uploadRes = await fetch('http://127.0.0.1:5000/api/v1/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!uploadRes.ok) {
                showToast('Visual scan upload failed. Please retry.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Broadcast habitat';
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
            photos: JSON.stringify(photos),
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
        submitBtn.textContent = 'Broadcast habitat';

        if (response.ok) {
            showToast('Habitat broadcast to the network!', 'success');
            setTimeout(() => window.location.href = 'my_places.html', 1500);
        } else {
            const err = await response.json();
            showToast(err.error || 'Broadcast failed. Please retry.', 'error');
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

    container.innerHTML = '<div class="loading-state"><span class="spinner" aria-hidden="true"></span>Scanning your stations…</div>';
    container.setAttribute('aria-busy', 'true');

    const res = await fetch(
        `http://127.0.0.1:5000/api/v1/users/${userId}/places`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );

    container.setAttribute('aria-busy', 'false');

    if (!res.ok) {
        container.innerHTML = '<p class="loading-text">Unable to retrieve your stations. Signal lost.</p>';
        return;
    }

    const places = await res.json();

    if (places.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛸</div>
                <p>No habitats registered yet. The galaxy awaits.</p>
                <a href="add_place.html" class="btn-save" style="display:inline-block;width:auto;padding:0.75rem 1.5rem;">Register your first habitat</a>
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
                    : `<div class="place-card-no-photo" aria-hidden="true"><img src="images/no_picture.jpg" alt="No visual scan" style="width:100%;height:100%;object-fit:cover;"></div>`}
            </div>
            <div class="my-place-info">
                <h3>${place.title}</h3>
                <p class="price">$${place.price} <span>/ cycle</span></p>
                <p class="description">${place.description || ''}</p>
            </div>
            <div class="my-place-actions">
                <a href="place.html?id=${place.id}" class="btn-outline" aria-label="Scout ${place.title}">Scout</a>
                <a href="edit_place.html?id=${place.id}" class="btn-save" style="width:auto;padding:0.5rem 1.25rem;" aria-label="Modify ${place.title}">Modify</a>
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
        showToast('Habitat not found in registry.', 'error');
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
        ? '<p class="loading-text">No systems available.</p>'
        : allAmenities.map(a => `
            <label class="amenity-checkbox">
                <input type="checkbox" name="amenities" value="${a.id}"
                    ${currentAmenityIds.includes(a.id) ? 'checked' : ''}>
                <span>${a.name}</span>
            </label>
        `).join('');

    // ── Photo management for edit ──
    let savedPhotos = []; // existing URLs (from server)
    let pendingFiles = []; // new File objects not yet uploaded
    try { savedPhotos = place.photos ? JSON.parse(place.photos) : []; } catch {}

    function renderEditPhotos() {
        const grid = document.getElementById('all-photo-previews');
        const hint = document.getElementById('photos-count-hint');
        const label = document.getElementById('photos-upload-label');
        const total = savedPhotos.length + pendingFiles.length;
        hint.textContent = `${total} / 10 scans`;
        label.style.display = total >= 10 ? 'none' : '';

        grid.innerHTML = '';

        savedPhotos.forEach((url, i) => {
            const div = document.createElement('div');
            div.className = 'photo-preview-item';
            div.innerHTML = `
                <img src="${url}" alt="Photo ${i + 1}" loading="lazy">
                <button type="button" class="photo-remove-btn" aria-label="Remove photo" onclick="removeSavedPhoto(${i})">&#x2715;</button>`;
            grid.appendChild(div);
        });

        pendingFiles.forEach((file, i) => {
            const div = document.createElement('div');
            div.className = 'photo-preview-item';
            const url = URL.createObjectURL(file);
            div.innerHTML = `
                <img src="${url}" alt="New photo ${i + 1}">
                <button type="button" class="photo-remove-btn" aria-label="Remove photo" onclick="removePendingPhoto(${i})">&#x2715;</button>`;
            grid.appendChild(div);
        });
    }

    window.removeSavedPhoto = (i) => { savedPhotos.splice(i, 1); renderEditPhotos(); };
    window.removePendingPhoto = (i) => { pendingFiles.splice(i, 1); renderEditPhotos(); };

    renderEditPhotos();

    document.getElementById('photos').addEventListener('change', (e) => {
        const slots = 10 - savedPhotos.length - pendingFiles.length;
        const incoming = Array.from(e.target.files).slice(0, slots);
        if (e.target.files.length > slots) {
            showToast(`Only ${slots} more scan(s) can be uploaded (10 max).`, 'error');
        }
        pendingFiles.push(...incoming);
        e.target.value = '';
        renderEditPhotos();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Syncing…';

        let photos = [...savedPhotos];

        if (pendingFiles.length > 0) {
            const formData = new FormData();
            pendingFiles.forEach(f => formData.append('photos[]', f));
            const uploadRes = await fetch('http://127.0.0.1:5000/api/v1/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (!uploadRes.ok) {
                showToast('Visual scan upload failed. Please retry.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sync changes';
                return;
            }
            photos = [...photos, ...(await uploadRes.json()).photo_urls];
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
            photos: JSON.stringify(photos),
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
        submitBtn.textContent = 'Sync changes';

        if (res.ok) {
            showToast('Habitat data synchronized.', 'success');
            setTimeout(() => window.location.href = 'my_places.html', 1500);
        } else {
            const err = await res.json();
            showToast(err.error || 'Sync failed. Please retry.', 'error');
        }
    });
}

/* ── MY RESERVATIONS ── */
function switchTab(tab) {
    const pMine     = document.getElementById('panel-mine');
    const pIncoming = document.getElementById('panel-incoming');
    const tMine     = document.getElementById('tab-mine');
    const tIncoming = document.getElementById('tab-incoming');
    if (!pMine || !pIncoming) return;

    if (tab === 'mine') {
        pMine.hidden = false;     pIncoming.hidden = true;
        tMine.classList.add('active');    tMine.setAttribute('aria-selected', 'true');
        tIncoming.classList.remove('active'); tIncoming.setAttribute('aria-selected', 'false');
    } else {
        pIncoming.hidden = false; pMine.hidden = true;
        tIncoming.classList.add('active'); tIncoming.setAttribute('aria-selected', 'true');
        tMine.classList.remove('active'); tMine.setAttribute('aria-selected', 'false');
    }
}

function statusBadge(status) {
    const map = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled' };
    const label = { pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled' };
    return `<span class="res-status-badge ${map[status] || ''}">${label[status] || status}</span>`;
}

async function initMyReservations() {
    const listMine     = document.getElementById('my-reservations-list');
    const listIncoming = document.getElementById('incoming-reservations-list');
    if (!listMine && !listIncoming) return;

    const token = protectPage();

    // ── My bookings (as guest) ──
    if (listMine) {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/v1/reservations/mine', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            listMine.setAttribute('aria-busy', 'false');

            if (!res.ok) throw new Error();
            const reservations = await res.json();

            if (reservations.length === 0) {
                listMine.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🛸</div>
                        <p>No bookings yet. Explore habitats across the galaxy.</p>
                        <a href="index.html" class="btn-save" style="display:inline-block;width:auto;padding:0.75rem 1.5rem;">Explore habitats</a>
                    </div>`;
            } else {
                listMine.innerHTML = '';
                reservations.forEach(r => {
                    const card = document.createElement('article');
                    card.className = 'res-card';
                    const canCancel = r.status === 'pending' || r.status === 'confirmed';
                    card.innerHTML = `
                        <div class="res-card-body">
                            <div class="res-card-title">
                                <a href="place.html?id=${r.place_id}">${r.place_title || 'Unknown habitat'}</a>
                                ${statusBadge(r.status)}
                            </div>
                            <div class="res-card-dates">
                                <span>🚀 ${r.check_in}</span>
                                <span class="res-arrow">→</span>
                                <span>🛬 ${r.check_out}</span>
                            </div>
                            <div class="res-card-price">$${r.total_price} total</div>
                        </div>
                        ${canCancel ? `<button class="btn-cancel-res" onclick="cancelReservation('${r.id}', this)">Cancel</button>` : ''}
                    `;
                    listMine.appendChild(card);
                });
            }
        } catch {
            listMine.innerHTML = '<p class="loading-text">Unable to load your bookings. Signal lost.</p>';
        }
    }

    // ── Incoming requests (as owner) ──
    if (listIncoming) {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/v1/reservations/incoming', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            listIncoming.setAttribute('aria-busy', 'false');

            if (!res.ok) throw new Error();
            const reservations = await res.json();

            if (reservations.length === 0) {
                listIncoming.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📡</div>
                        <p>No incoming requests. Your habitats await explorers.</p>
                    </div>`;
            } else {
                listIncoming.innerHTML = '';
                reservations.forEach(r => {
                    const card = document.createElement('article');
                    card.className = 'res-card';
                    const isPending = r.status === 'pending';
                    card.innerHTML = `
                        <div class="res-card-body">
                            <div class="res-card-title">
                                <a href="place.html?id=${r.place_id}">${r.place_title || 'Unknown habitat'}</a>
                                ${statusBadge(r.status)}
                            </div>
                            <div class="res-card-guest">Navigator: <strong>${r.guest_name || 'Unknown'}</strong></div>
                            <div class="res-card-dates">
                                <span>🚀 ${r.check_in}</span>
                                <span class="res-arrow">→</span>
                                <span>🛬 ${r.check_out}</span>
                            </div>
                            <div class="res-card-price">$${r.total_price} total</div>
                        </div>
                        ${isPending ? `
                        <div class="res-card-actions">
                            <button class="btn-confirm-res" onclick="confirmReservation('${r.id}', this)">Confirm</button>
                            <button class="btn-reject-res"  onclick="rejectReservation('${r.id}', this)">Reject</button>
                        </div>` : ''}
                    `;
                    listIncoming.appendChild(card);
                });
            }
        } catch {
            listIncoming.innerHTML = '<p class="loading-text">Unable to load incoming requests. Signal lost.</p>';
        }
    }
}

async function cancelReservation(id, btn) {
    btn.disabled = true;
    btn.textContent = 'Cancelling…';
    const token = getCookie('token');
    const res = await fetch(`http://127.0.0.1:5000/api/v1/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        showToast('Reservation cancelled.', 'info');
        const card = btn.closest('.res-card');
        if (card) {
            card.querySelector('.res-status-badge').className = 'res-status-badge badge-cancelled';
            card.querySelector('.res-status-badge').textContent = 'Cancelled';
            btn.remove();
        }
    } else {
        showToast('Could not cancel. Please retry.', 'error');
        btn.disabled = false;
        btn.textContent = 'Cancel';
    }
}

async function confirmReservation(id, btn) {
    btn.disabled = true;
    btn.textContent = 'Confirming…';
    const token = getCookie('token');
    const res = await fetch(`http://127.0.0.1:5000/api/v1/reservations/${id}/confirm`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        showToast('Reservation confirmed! The navigator has been notified.', 'success');
        const card = btn.closest('.res-card');
        if (card) {
            card.querySelector('.res-status-badge').className = 'res-status-badge badge-confirmed';
            card.querySelector('.res-status-badge').textContent = 'Confirmed';
            card.querySelector('.res-card-actions').remove();
        }
    } else {
        showToast('Could not confirm. Please retry.', 'error');
        btn.disabled = false;
        btn.textContent = 'Confirm';
    }
}

async function rejectReservation(id, btn) {
    btn.disabled = true;
    btn.textContent = 'Rejecting…';
    const token = getCookie('token');
    const res = await fetch(`http://127.0.0.1:5000/api/v1/reservations/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        showToast('Reservation rejected.', 'info');
        const card = btn.closest('.res-card');
        if (card) {
            card.querySelector('.res-status-badge').className = 'res-status-badge badge-cancelled';
            card.querySelector('.res-status-badge').textContent = 'Cancelled';
            card.querySelector('.res-card-actions').remove();
        }
    } else {
        showToast('Could not reject. Please retry.', 'error');
        btn.disabled = false;
        btn.textContent = 'Reject';
    }
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
                : `<div class="marquee-card-no-photo" aria-hidden="true"><img src="images/no_picture.jpg" alt="No visual scan" style="width:100%;height:100%;object-fit:cover;"></div>`}
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

/* ── RGPD — COOKIE CONSENT BANNER ── */
function initCookieBanner() {
    if (localStorage.getItem('hbnb-cookie-consent') === 'accepted') return;

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
        <div class="cookie-banner-content">
            <p>
                hbnb utilise un cookie d'authentification strictement nécessaire au fonctionnement du service.
                Aucune donnée n'est partagée avec des tiers.
                <a href="privacy.html" class="cookie-link">Politique de confidentialité</a>
            </p>
            <div class="cookie-banner-actions">
                <a href="privacy.html" class="cookie-btn-secondary">En savoir plus</a>
                <button class="cookie-btn-accept" id="cookie-accept-btn" aria-label="Accept cookies">Accepter</button>
            </div>
        </div>
    `;
    document.body.appendChild(banner);

    // Animate in
    requestAnimationFrame(() => banner.classList.add('visible'));

    document.getElementById('cookie-accept-btn').addEventListener('click', () => {
        localStorage.setItem('hbnb-cookie-consent', 'accepted');
        banner.classList.remove('visible');
        setTimeout(() => banner.remove(), 350);
    });
}

/* ── DELETE ACCOUNT ── */
async function initDeleteAccount() {
    const btn = document.getElementById('delete-account-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const confirmed = window.confirm(
            'Supprimer définitivement votre compte ?\n\nToutes vos données (habitats, réservations, avis) seront effacées. Cette action est irréversible.'
        );
        if (!confirmed) return;

        const token = getCookie('token');
        const payload = getTokenPayload(token);
        if (!payload?.sub) return;

        btn.disabled = true;
        btn.textContent = 'Suppression…';

        const res = await fetch(`http://127.0.0.1:5000/api/v1/users/${payload.sub}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            showToast('Compte supprimé. Vous allez être déconnecté.', 'info', 3000);
            setTimeout(() => {
                document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showToast('La suppression a échoué. Réessayez.', 'error');
            btn.disabled = false;
            btn.textContent = 'Supprimer mon compte';
        }
    });
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
    initCookieBanner();
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
    initMyReservations();
    initDeleteAccount();
    initEditPlaceForm();
    initScrollReveal();

    // Header scroll class — also run after header is injected
    const headerDiv = document.getElementById('header');
    if (headerDiv) {
        new MutationObserver(() => initHeaderScroll())
            .observe(headerDiv, { childList: true });
    }
});
