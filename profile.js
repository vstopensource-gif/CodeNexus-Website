// Profile Page JavaScript
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Get auth and db from global (set by nav-auth.js)
const auth = window.firebaseAuth;
const db = window.firebaseDb;

// DOM Elements
const userInfoCard = document.getElementById('user-info-card');
const profilePhoto = document.getElementById('profile-photo');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profilePhone = document.getElementById('profile-phone');
const profileCollege = document.getElementById('profile-college');
const registeredEventsGrid = document.getElementById('registered-events-grid');
const noEventsMessage = document.getElementById('no-events-message');

// Event data mapping (expandable for future events)
const eventDataMap = {
  'gsoc-2024-10-31': {
    title: 'GSoC Success Story with Prathamesh Sahasrabhojane',
    image: 'GsocEvent.jpeg',
    date: 'October 31, 2025',
    time: '2:30 PM IST',
    link: 'event-gsoc.html'
  }
};

// Load user profile data
async function loadUserProfile(user) {
  if (!db || !user) return;

  try {
    // Get user document
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Update profile info
      if (profileName) profileName.textContent = userData.name || user.displayName || 'User';
      if (profileEmail) profileEmail.textContent = user.email || '';
      
      if (profilePhoto && user.photoURL) {
        profilePhoto.src = user.photoURL;
        profilePhoto.style.display = 'block';
      }

      if (userInfoCard) {
        userInfoCard.style.display = 'block';
      }

      // Get phone and college directly from user profile
      if (userData.phone && profilePhone) {
        profilePhone.textContent = userData.phone;
        profilePhone.classList.remove('muted');
      } else if (profilePhone) {
        profilePhone.textContent = 'Not provided';
        profilePhone.classList.add('muted');
      }
      
      if (userData.college && profileCollege) {
        profileCollege.textContent = userData.college;
        profileCollege.classList.remove('muted');
      } else if (profileCollege) {
        profileCollege.textContent = 'Not provided';
        profileCollege.classList.add('muted');
      }

      // Load registered events
      const registrationsRef = collection(db, 'event_registrations');
      const q = query(registrationsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      await loadRegisteredEvents(user.uid, registrationsRef, querySnapshot);
    } else {
      // User document doesn't exist yet, create basic display
      if (profileName) profileName.textContent = user.displayName || user.email?.split('@')[0] || 'User';
      if (profileEmail) profileEmail.textContent = user.email || '';
      
      if (profilePhoto && user.photoURL) {
        profilePhoto.src = user.photoURL;
        profilePhoto.style.display = 'block';
      }

      if (userInfoCard) {
        userInfoCard.style.display = 'block';
      }
      
      // Set default values for phone and college
      if (profilePhone) {
        profilePhone.textContent = 'Not provided';
        profilePhone.classList.add('muted');
      }
      if (profileCollege) {
        profileCollege.textContent = 'Not provided';
        profileCollege.classList.add('muted');
      }
      
      // Try to load events anyway
      const registrationsRef = collection(db, 'event_registrations');
      const q = query(registrationsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      await loadRegisteredEvents(user.uid, registrationsRef, querySnapshot);
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

// Load registered events
async function loadRegisteredEvents(userId, registrationsRef, existingSnapshot) {
  if (!db) return;

  try {
    let snapshot = existingSnapshot;
    if (!snapshot) {
      const q = query(registrationsRef, where('userId', '==', userId));
      snapshot = await getDocs(q);
    }

    if (snapshot.empty) {
      if (noEventsMessage) noEventsMessage.style.display = 'block';
      if (registeredEventsGrid) registeredEventsGrid.style.display = 'none';
      return;
    }

    const events = [];
    snapshot.forEach((doc) => {
      const regData = doc.data();
      const eventInfo = eventDataMap[regData.eventId];
      if (eventInfo) {
        events.push({
          ...eventInfo,
          registeredAt: regData.registeredAt,
          status: regData.status || 'registered'
        });
      }
    });

    if (events.length === 0) {
      if (noEventsMessage) noEventsMessage.style.display = 'block';
      if (registeredEventsGrid) registeredEventsGrid.style.display = 'none';
      return;
    }

    // Display events
    if (registeredEventsGrid) {
      registeredEventsGrid.innerHTML = events.map(event => `
        <article class="card event-card">
          <div class="event-image-wrapper">
            <img src="${event.image}" alt="${event.title}" />
            <div class="event-overlay">
              <span class="badge event-badge">Registered</span>
            </div>
          </div>
          <div class="event-content">
            <h3>${event.title}</h3>
            <p class="event-date">${event.date} · ${event.time}</p>
            <div style="margin-top: 16px;">
              <a href="${event.link}" class="btn btn--ghost btn--small">View Details</a>
            </div>
          </div>
        </article>
      `).join('');
      registeredEventsGrid.style.display = 'grid';
    }

    if (noEventsMessage) noEventsMessage.style.display = 'none';
  } catch (error) {
    console.error('Error loading registered events:', error);
  }
}

// Initialize on page load - wait for nav-auth to initialize
function initializeProfile() {
  // Wait a bit for nav-auth.js to initialize Firebase
  const checkAuth = setInterval(() => {
    const auth = window.firebaseAuth;
    if (auth) {
      clearInterval(checkAuth);
      auth.onAuthStateChanged((user) => {
        if (user) {
          loadUserProfile(user);
        } else {
          // Redirect to login if not authenticated
          window.location.href = 'join.html';
        }
      });
    }
  }, 100);
  
  // Timeout after 2 seconds
  setTimeout(() => {
    clearInterval(checkAuth);
    if (!window.firebaseAuth) {
      window.location.href = 'join.html';
    }
  }, 2000);
}

document.addEventListener('DOMContentLoaded', initializeProfile);

