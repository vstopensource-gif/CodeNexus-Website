// Firebase Configuration - Import from shared config
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Initialize Firebase (or use existing instance from nav-auth.js)
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
  console.warn('Firebase not configured yet.', error);
  auth = window.firebaseAuth || null;
  db = window.firebaseDb || null;
}

const googleProvider = new GoogleAuthProvider();
const EVENT_ID = 'gsoc-2024-10-31'; // Unique event identifier

// DOM Elements
const googleSignInBtn = document.getElementById('google-signin-btn');
const authMessage = document.getElementById('auth-message');
const loginPrompt = document.getElementById('login-prompt');
const registrationFormSection = document.getElementById('registration-form-section');
const registrationSuccess = document.getElementById('registration-success');
const alreadyRegistered = document.getElementById('already-registered');
const registerEventBtn = document.getElementById('register-event-btn');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmRegistrationBtn = document.getElementById('confirm-registration-btn');
const cancelRegistrationBtn = document.getElementById('cancel-registration-btn');
const regDisplayName = document.getElementById('reg-display-name');
const regDisplayPhone = document.getElementById('reg-display-phone');
const regDisplayCollege = document.getElementById('reg-display-college');

// Show message helper
function showMessage(message, type = 'success') {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.className = `auth-message auth-message--${type}`;
  authMessage.style.display = 'block';
  
  setTimeout(() => {
    authMessage.style.display = 'none';
  }, 5000);
}

// Check if user is already registered
async function checkRegistrationStatus(userId) {
  if (!db) return false;
  
  try {
    const registrationsRef = collection(db, 'event_registrations');
    const q = query(registrationsRef, where('userId', '==', userId), where('eventId', '==', EVENT_ID));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking registration:', error);
    return false;
  }
}

// Get registration data
async function getRegistrationData(userId) {
  if (!db) return null;
  
  try {
    const registrationsRef = collection(db, 'event_registrations');
    const q = query(registrationsRef, where('userId', '==', userId), where('eventId', '==', EVENT_ID));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error('Error getting registration data:', error);
    return null;
  }
}

// Google Sign In
if (googleSignInBtn) {
  googleSignInBtn.addEventListener('click', async () => {
    if (!auth) {
      showMessage('Firebase not configured. Please set up your Firebase project.', 'error');
      return;
    }

    try {
      googleSignInBtn.disabled = true;
      googleSignInBtn.textContent = 'Signing in...';
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Save basic user data
      await saveUserData(user);
      
      // Check if already registered
      const isRegistered = await checkRegistrationStatus(user.uid);
      
      if (isRegistered) {
        // Already registered - show already registered view
        showAlreadyRegistered();
      } else {
        // Show registration form with user details from profile
        loginPrompt.style.display = 'none';
        registrationFormSection.style.display = 'block';
        
        // Load user profile data to display
        await loadUserProfileForRegistration(user);
      }
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      showMessage(error.message || 'Failed to sign in. Please try again.', 'error');
      googleSignInBtn.disabled = false;
      googleSignInBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Continue with Google';
    }
  });
}

// Modal functions
function showModal() {
  if (confirmationModal) {
    confirmationModal.style.display = 'flex';
  }
}

function hideModal() {
  if (confirmationModal) {
    confirmationModal.style.display = 'none';
  }
}

// Load user profile data for registration display
async function loadUserProfileForRegistration(user) {
  if (!db || !user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Display user info
      if (regDisplayName) {
        regDisplayName.textContent = `Name: ${userData.name || user.displayName || 'Not provided'}`;
      }
      if (regDisplayPhone) {
        regDisplayPhone.textContent = `Phone: ${userData.phone || 'Not provided'}`;
      }
      if (regDisplayCollege) {
        regDisplayCollege.textContent = `College: ${userData.college || 'Not provided'}`;
      }
    } else {
      // User profile doesn't exist
      if (regDisplayName) regDisplayName.textContent = `Name: ${user.displayName || 'Not provided'}`;
      if (regDisplayPhone) regDisplayPhone.textContent = `Phone: Not provided`;
      if (regDisplayCollege) regDisplayCollege.textContent = `College: Not provided`;
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

// Store user data temporarily for modal confirmation
let pendingRegistrationData = null;

// Registration button click
if (registerEventBtn) {
  registerEventBtn.addEventListener('click', async () => {
    if (!auth || !db) {
      showMessage('Firebase not configured.', 'error');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showMessage('Please sign in first.', 'error');
      window.location.href = 'join.html';
      return;
    }

    // Fetch user data from users collection
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      showMessage('Please complete your profile first.', 'error');
      window.location.href = 'join.html';
      return;
    }
    
    const userData = userDoc.data();
    const name = userData.name || user.displayName;
    const phone = userData.phone;
    const college = userData.college;
    
    if (!phone || !college) {
      showMessage('Please complete your profile first. Go to Join page to add phone and college.', 'error');
      window.location.href = 'join.html';
      return;
    }

    // Check if already registered
    const isRegistered = await checkRegistrationStatus(user.uid);
    if (isRegistered) {
      showMessage('You are already registered for this event.', 'error');
      showAlreadyRegistered();
      return;
    }

    // Store data from users collection and show confirmation modal
    pendingRegistrationData = { name, phone, college };
    showModal();
  });
}

// Confirm registration from modal
if (confirmRegistrationBtn) {
  confirmRegistrationBtn.addEventListener('click', async () => {
    if (!pendingRegistrationData) return;

    const user = auth.currentUser;
    if (!user) {
      showMessage('Please sign in first.', 'error');
      hideModal();
      window.location.href = 'join.html';
      return;
    }

    try {
      confirmRegistrationBtn.disabled = true;
      confirmRegistrationBtn.textContent = 'Registering...';

      // Save registration to Firestore in event_registrations collection
      // User data (phone, college) is already in users collection, we just reference it
      const registrationRef = doc(collection(db, 'event_registrations'));
      await setDoc(registrationRef, {
        userId: user.uid,
        eventId: EVENT_ID,
        name: pendingRegistrationData.name,
        phone: pendingRegistrationData.phone, // From users collection
        college: pendingRegistrationData.college, // From users collection
        email: user.email,
        registeredAt: new Date().toISOString(),
        status: 'registered'
      });

      // Hide modal and form, show success
      hideModal();
      registrationFormSection.style.display = 'none';
      showRegistrationSuccess();
      showMessage('Registration successful!', 'success');
      pendingRegistrationData = null;
      
    } catch (error) {
      console.error('Registration error:', error);
      showMessage('Failed to register. Please try again.', 'error');
      confirmRegistrationBtn.disabled = false;
      confirmRegistrationBtn.textContent = 'Yes, Register Me';
    }
  });
}

// Cancel registration from modal
if (cancelRegistrationBtn) {
  cancelRegistrationBtn.addEventListener('click', () => {
    hideModal();
    pendingRegistrationData = null;
  });
}

// Close modal on backdrop click
if (confirmationModal) {
  confirmationModal.addEventListener('click', (e) => {
    if (e.target === confirmationModal) {
      hideModal();
      pendingRegistrationData = null;
    }
  });
}

// Show registration success
function showRegistrationSuccess() {
  if (loginPrompt) loginPrompt.style.display = 'none';
  if (registrationFormSection) registrationFormSection.style.display = 'none';
  if (alreadyRegistered) alreadyRegistered.style.display = 'none';
  if (registrationSuccess) registrationSuccess.style.display = 'block';
}

// Show already registered status
function showAlreadyRegistered() {
  if (loginPrompt) loginPrompt.style.display = 'none';
  if (registrationFormSection) {
    registrationFormSection.style.display = 'none';
  }
  if (registrationSuccess) registrationSuccess.style.display = 'none';
  if (alreadyRegistered) {
    alreadyRegistered.style.display = 'block';
  }
}

// Save user data to Firestore
async function saveUserData(user) {
  if (!db) return;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingDoc = await getDoc(userRef);
    
    if (!existingDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
    } else {
      await setDoc(userRef, {
        lastLogin: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}


// Auth state observer
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in - check registration status
      const isRegistered = await checkRegistrationStatus(user.uid);
      
      if (isRegistered) {
        // Already registered
        if (loginPrompt) loginPrompt.style.display = 'none';
        if (registrationFormSection) registrationFormSection.style.display = 'none';
        if (registrationSuccess) registrationSuccess.style.display = 'none';
        showAlreadyRegistered();
      } else {
        // Not registered yet - show form with user details
        loginPrompt.style.display = 'none';
        registrationFormSection.style.display = 'block';
        registrationSuccess.style.display = 'none';
        
        // Load user profile data to display
        await loadUserProfileForRegistration(user);
      }
    } else {
      // User is signed out
      loginPrompt.style.display = 'block';
      registrationFormSection.style.display = 'none';
      registrationSuccess.style.display = 'none';
      
      if (googleSignInBtn) {
        googleSignInBtn.disabled = false;
        googleSignInBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Continue with Google';
      }
    }
  });
}

