// Shared Navigation Authentication Logic
// This file handles authentication state across all pages

// Firebase Configuration - Import from shared config
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getCountFromServer
} from 'firebase/firestore';

// Initialize Firebase App (if not already initialized)
let app, auth, db;
try {
  if (!window.firebaseApp) {
    app = initializeApp(firebaseConfig);
    window.firebaseApp = app;
  } else {
    app = window.firebaseApp;
  }
  
  if (!window.firebaseAuth) {
    auth = getAuth(app);
    window.firebaseAuth = auth;
  } else {
    auth = window.firebaseAuth;
  }
  
  if (!window.firebaseDb) {
    db = getFirestore(app);
    window.firebaseDb = db;
  } else {
    db = window.firebaseDb;
  }
} catch (error) {
  console.warn('Firebase already initialized or error:', error);
  auth = window.firebaseAuth || null;
  db = window.firebaseDb || null;
}

// Create Join button HTML
function createJoinButton() {
  return '<a class="btn btn--small" href="join.html">Join</a>';
}

// Create user menu dropdown HTML
function createUserMenuHTML(user) {
  const userName = user.displayName || user.email?.split('@')[0] || 'User';
  
  return `
    <div class="user-menu-wrapper">
      <button class="user-menu-trigger" aria-label="User menu">
        <span class="user-name">${userName}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="user-menu-dropdown">
        <a href="profile.html" class="user-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Profile
        </a>
        <button class="user-menu-item user-menu-logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </div>
  `;
}

// Update hero CTA button based on auth state
function updateHeroCTA(user) {
  try {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const heroPrimaryButtons = heroSection.querySelectorAll('a.btn.btn--primary[href="join.html"]');
    if (heroPrimaryButtons && heroPrimaryButtons.length > 0) {
      heroPrimaryButtons.forEach((btn) => {
        const text = (btn.textContent || '').trim();
        if (text === 'Join Now') {
          if (user) {
            btn.textContent = 'Go to Profile';
            btn.setAttribute('href', 'profile.html');
          } else {
            btn.textContent = 'Join Now';
            btn.setAttribute('href', 'join.html');
          }
        }
      });
    }

    // Also handle the secondary CTA "Join a Team" present lower on the homepage
    const joinTeamButtons = document.querySelectorAll('a.btn.btn--primary[href="join.html"], a.btn.btn--primary[href="join.html"]');
    if (joinTeamButtons && joinTeamButtons.length > 0) {
      joinTeamButtons.forEach((btn) => {
        const text = (btn.textContent || '').trim();
        if (text === 'Join a Team') {
          if (user) {
            btn.textContent = 'Go to Profile';
            btn.setAttribute('href', 'profile.html');
          } else {
            btn.textContent = 'Join a Team';
            btn.setAttribute('href', 'join.html');
          }
        }
      });
    }
  } catch (e) {
    // No-op if structure not present on this page
  }
}

// Update additional CTA in hero card ("Get Started →")
function updateGetStartedCTA(user) {
  try {
    // Only on pages with hero card (home)
    const getStartedButtons = document.querySelectorAll('aside.hero-card a.btn.btn--primary[href="join.html"]');
    if (!getStartedButtons || getStartedButtons.length === 0) return;

    getStartedButtons.forEach((btn) => {
      const text = (btn.textContent || '').trim();
      if (text === 'Get Started →') {
        if (user) {
          btn.textContent = 'Go to Profile';
          btn.setAttribute('href', 'profile.html');
        } else {
          btn.textContent = 'Get Started →';
          btn.setAttribute('href', 'join.html');
        }
      }
    });
  } catch (_) {}
}

// If user registered, update Featured Event CTA on home
async function updateFeaturedEventCTA(user) {
  try {
    // Only proceed on pages that have the featured event card
    const featuredCard = document.querySelector('.featured-event-card');
    if (!featuredCard) return;

    // If not logged in, keep default state
    if (!user || !db) return;

    // Check registration for known featured event id
    const EVENT_ID = 'gsoc-2024-10-31';
    const registrationsRef = collection(db, 'event_registrations');
    const qReg = query(registrationsRef, where('userId', '==', user.uid), where('eventId', '==', EVENT_ID));
    const snap = await getDocs(qReg);

    if (!snap.empty) {
      // Update primary CTA to "View My Registration"
      const primaryBtn = featuredCard.querySelector('.featured-event-cta a.btn.btn--primary[href="event-gsoc.html"]');
      if (primaryBtn) {
        primaryBtn.textContent = 'View My Registration';
        primaryBtn.setAttribute('href', 'profile.html');
        primaryBtn.setAttribute('aria-label', 'View My Registration');
      }

      // Optionally, ensure a secondary CTA exists to view details
      const secondaryBtn = featuredCard.querySelector('.featured-event-cta a.btn.btn--ghost');
      if (secondaryBtn) {
        // keep as is; minimal changes
      }

      // Hide CTA hints when registered
      document.querySelectorAll('.cta-hint').forEach((el) => {
        el.style.display = 'none';
      });
    }
  } catch (e) {
    // Gracefully ignore failures; keep default UI
  }
}

// Toggle CTA hints based on auth state
function updateCTAHints(user) {
  try {
    const hints = document.querySelectorAll('.cta-hint');
    if (!hints || hints.length === 0) return;
    hints.forEach((el) => {
      el.style.display = user ? 'none' : '';
    });
  } catch (_) {}
}

// Count helpers and UI injection
function formatRoundedCount(count) {
  if (count < 1000) {
    // round to nearest 50
    const rounded = Math.round(count / 50) * 50;
    return `${rounded.toLocaleString()}+`;
  }
  const oneDecimal = (count / 1000).toFixed(1);
  return `${oneDecimal.replace(/\.0$/, '')}k+`;
}

async function injectTrustedByStats() {
  try {
    if (!db) return;
    const elCount = document.getElementById('community-students-count');
    const snap = await getCountFromServer(collection(db, 'users'));
    const total = snap.data().count || 0;
    const displayTo = formatRoundedCountNumber(total);
    if (elCount) animateCount(elCount, displayTo);
  } catch (_) {}
}

// Testimonials (conditional render if collection exists)
async function populateTestimonials() {
  try {
    if (!db) return;
    const container = document.getElementById('testimonials-grid');
    const section = document.getElementById('testimonials-section');
    if (!container || !section) return;
    const tRef = collection(db, 'testimonials');
    const snap = await getDocs(tRef);
    if (snap.empty) {
      section.style.display = 'none';
      return;
    }
    const items = [];
    let i = 0;
    snap.forEach((doc) => {
      if (i >= 3) return; // only first 3
      const t = doc.data();
      const quote = t.quote || '';
      const name = t.name || 'Member';
      const role = t.role || '';
      items.push(`
        <blockquote class="card quote">
          <p>“${quote}”</p>
          <cite>${name}${role ? ` — ${role}` : ''}</cite>
        </blockquote>
      `);
      i += 1;
    });
    if (items.length === 0) {
      section.style.display = 'none';
      return;
    }
    container.innerHTML = items.join('');
    section.style.display = '';
  } catch (_) {}
}

// Count animation helpers
function formatRoundedCountNumber(count) {
  if (count < 1000) {
    return Math.round(count / 50) * 50;
  }
  // round to nearest 100 for large counts
  return Math.round(count / 100) * 100;
}

function animateCount(element, target) {
  const duration = 1400;
  const start = 0;
  const startTime = performance.now();
  const formatter = new Intl.NumberFormat();
  function step(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const current = Math.floor(start + (target - start) * easeOutCubic(progress));
    element.textContent = `${formatter.format(current)}+`;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Setup user menu event handlers
function setupUserMenuHandlers(userMenuElement, user) {
  const trigger = userMenuElement.querySelector('.user-menu-trigger');
  const dropdown = userMenuElement.querySelector('.user-menu-dropdown');
  
  if (!trigger || !dropdown) return;
  
  // Toggle dropdown
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  const closeDropdown = (e) => {
    if (!userMenuElement.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  };
  
  // Use a single listener that we can clean up
  document.addEventListener('click', closeDropdown);
  
  // Setup logout button
  const logoutBtn = userMenuElement.querySelector('.user-menu-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        window.location.href = 'join.html';
      } catch (error) {
        console.error('Sign out error:', error);
      }
    });
  }
}

// Update navigation bar based on auth state
function updateNavigation(user) {
  const placeholder = document.getElementById('nav-auth-placeholder');
  
  if (!placeholder) {
    // If placeholder not found, retry after a short delay
    setTimeout(() => updateNavigation(user), 100);
    return;
  }

  // Clear placeholder
  placeholder.innerHTML = '';

  if (user) {
    // User is logged in - inject user menu
    placeholder.innerHTML = createUserMenuHTML(user);
    
    // Setup event handlers for the user menu
    const userMenuWrapper = placeholder.querySelector('.user-menu-wrapper');
    if (userMenuWrapper) {
      setupUserMenuHandlers(userMenuWrapper, user);
    }
  } else {
    // User is not logged in - inject Join button
    placeholder.innerHTML = createJoinButton();
  }

  // Also update hero CTA in pages that have it
  updateHeroCTA(user);
  updateGetStartedCTA(user);
  // And update featured event CTA if applicable
  updateFeaturedEventCTA(user);
}

// Initialize navigation
function initNavigation() {
  if (!auth) {
    // Wait for auth to be ready
    auth = window.firebaseAuth;
    if (!auth) {
      // Defer once via rAF rather than polling
      return requestAnimationFrame(initNavigation);
    }
  }

  // Set up auth state listener (fires immediately if user is already logged in)
  onAuthStateChanged(auth, (user) => {
    updateNavigation(user);
    // Unified CTA refresh
    try { refreshCTAs(user); } catch (_) {}
    updateFeaturedEventCTA(user);
    injectTrustedByStats();
    populateTestimonials();
  });
  
  // Also check current state immediately
  if (auth.currentUser !== null && auth.currentUser !== undefined) {
    updateNavigation(auth.currentUser);
  } else {
    updateNavigation(null);
  }

  // Run one-time DOM-related updates after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try { refreshCTAs(auth?.currentUser || null); } catch (_) {}
      updateFeaturedEventCTA(auth?.currentUser || null);
      injectTrustedByStats();
      populateTestimonials();
      // One-time observer to catch late DOM nodes
      try {
        const main = document.getElementById('main');
        if (main) {
          const mo = new MutationObserver(() => {
            try { refreshCTAs(auth?.currentUser || null); } catch (_) {}
            mo.disconnect();
          });
          mo.observe(main, { childList: true, subtree: true });
        }
      } catch (_) {}
    }, { once: true });
  } else {
    try { refreshCTAs(auth?.currentUser || null); } catch (_) {}
    updateFeaturedEventCTA(auth?.currentUser || null);
    injectTrustedByStats();
    populateTestimonials();
  }
}

// Unified CTA refresh using data attributes
function refreshCTAs(user) {
  const isLoggedIn = !!user;
  // hero primary
  const heroPrimary = document.querySelector('[data-cta="hero-primary"]');
  if (heroPrimary) {
    if (isLoggedIn) {
      heroPrimary.textContent = 'Go to Profile';
      heroPrimary.setAttribute('href', 'profile.html');
    } else {
      heroPrimary.textContent = 'Join Now';
      heroPrimary.setAttribute('href', 'join.html');
    }
  }

  // hero side card
  const heroCard = document.querySelector('[data-cta="hero-card"]');
  if (heroCard) {
    if (isLoggedIn) {
      heroCard.textContent = 'Go to Profile';
      heroCard.setAttribute('href', 'profile.html');
    } else {
      heroCard.textContent = 'Join Now';
      heroCard.setAttribute('href', 'join.html');
    }
  }

  // CTA hints
  document.querySelectorAll('[data-cta-hint]').forEach((el) => {
    el.style.display = isLoggedIn ? 'none' : '';
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  // DOM is already ready
  initNavigation();
}

// Also run on window load as backup
window.addEventListener('load', () => {
  if (auth) {
    if (auth.currentUser !== null && auth.currentUser !== undefined) {
      updateNavigation(auth.currentUser);
    } else {
      updateNavigation(null);
    }
  }
});

// Export for use in other scripts
window.updateNavigation = updateNavigation;
window.firebaseAuth = auth;
window.firebaseDb = db;
