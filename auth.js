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
  getDoc 
} from 'firebase/firestore';

// Initialize Firebase App (if not already initialized)
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase not configured yet. Please add your Firebase config.', error);
  // Create mock auth for development
  auth = null;
  db = null;
}

const googleProvider = new GoogleAuthProvider();

// DOM Elements
const googleSignInBtn = document.getElementById('google-signin-btn');
const signOutBtn = document.getElementById('signout-btn');
const authMessage = document.getElementById('auth-message');
const loginSection = document.getElementById('login-section');
const profileCompletionSection = document.getElementById('profile-completion-section');
const userDashboard = document.getElementById('user-dashboard');
const profileCompletionForm = document.getElementById('profile-completion-form');

// Show message helper
function showMessage(message, type = 'success') {
  authMessage.textContent = message;
  authMessage.className = `auth-message auth-message--${type}`;
  authMessage.style.display = 'block';
  
  setTimeout(() => {
    authMessage.style.display = 'none';
  }, 5000);
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
      
      // Save basic user data to Firestore
      await saveUserData(user, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });
      
      // Check if user has completed profile (has phone and college)
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.phone && userData.college) {
          // Profile complete, show dashboard
          showMessage('Successfully signed in!', 'success');
        } else {
          // Profile incomplete, show completion form
          loginSection.style.display = 'none';
          profileCompletionSection.style.display = 'block';
        }
      } else {
        // New user, show completion form
        loginSection.style.display = 'none';
        profileCompletionSection.style.display = 'block';
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      showMessage(error.message || 'Failed to sign in. Please try again.', 'error');
      googleSignInBtn.disabled = false;
      googleSignInBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Continue with Google';
    }
  });
}

// Sign out
if (signOutBtn) {
  signOutBtn.addEventListener('click', async () => {
    if (!auth) {
      showMessage('Firebase not configured.', 'error');
      return;
    }

    try {
      await signOut(auth);
      showMessage('Signed out successfully.', 'success');
    } catch (error) {
      console.error('Sign out error:', error);
      showMessage('Failed to sign out.', 'error');
    }
  });
}

// Save user data to Firestore
async function saveUserData(user, userData) {
  if (!db) return;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingDoc = await getDoc(userRef);
    
    if (!existingDoc.exists()) {
      // New user - create document
      await setDoc(userRef, {
        ...userData,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
    } else {
      // Existing user - update last login
      await setDoc(userRef, {
        lastLogin: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// Validation functions
function validatePhoneNumber(phone) {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  // Remove spaces, dashes, and other non-digit characters except +
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it starts with + (country code) or is just digits
  if (cleaned.startsWith('+')) {
    // With country code: should be + followed by 10-13 digits total
    const digits = cleaned.substring(1);
    if (!/^\d{10,13}$/.test(digits)) {
      return { valid: false, message: 'Phone number with country code should have 10-13 digits after +' };
    }
  } else {
    // Without country code: should be exactly 10 digits
    if (!/^\d{10}$/.test(cleaned)) {
      return { valid: false, message: 'Phone number should be exactly 10 digits (e.g., 9876543210)' };
    }
  }
  
  return { valid: true, message: '' };
}

function validateEmail(email) {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true, message: '' };
}

// Real-time phone validation
const phoneInput = document.getElementById('phone-number');
const phoneError = document.getElementById('phone-error');

if (phoneInput && phoneError) {
  phoneInput.addEventListener('input', (e) => {
    const validation = validatePhoneNumber(e.target.value);
    if (e.target.value && !validation.valid) {
      phoneError.textContent = validation.message;
      phoneError.style.display = 'block';
      phoneInput.classList.add('input-error');
    } else {
      phoneError.style.display = 'none';
      phoneInput.classList.remove('input-error');
    }
  });
  
  phoneInput.addEventListener('blur', (e) => {
    const validation = validatePhoneNumber(e.target.value);
    if (!validation.valid) {
      phoneError.textContent = validation.message;
      phoneError.style.display = 'block';
      phoneInput.classList.add('input-error');
    } else {
      phoneError.style.display = 'none';
      phoneInput.classList.remove('input-error');
    }
  });
}

// Profile completion form submission
if (profileCompletionForm) {
  profileCompletionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!auth || !db) {
      showMessage('Firebase not configured.', 'error');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showMessage('Please sign in first.', 'error');
      return;
    }

    const formData = new FormData(profileCompletionForm);
    const phone = formData.get('phone').trim();
    const college = formData.get('college').trim();

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      showMessage(phoneValidation.message, 'error');
      if (phoneError) {
        phoneError.textContent = phoneValidation.message;
        phoneError.style.display = 'block';
        phoneInput.classList.add('input-error');
      }
      phoneInput.focus();
      return;
    }

    // Validate college name
    if (!college || college.length < 2) {
      showMessage('Please enter a valid college/university name', 'error');
      return;
    }

    // Validate email from Google Auth (should already be valid, but double-check)
    const emailValidation = validateEmail(user.email);
    if (!emailValidation.valid) {
      showMessage('Invalid email address. Please sign in again.', 'error');
      return;
    }

    try {
      const submitBtn = profileCompletionForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      // Clean phone number (remove spaces, dashes, etc.)
      const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');

      // Save phone and college to user profile
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        phone: cleanedPhone,
        college: college,
        email: user.email
      }, { merge: true });

      // Hide form and show dashboard
      profileCompletionSection.style.display = 'none';
      userDashboard.style.display = 'block';
      showMessage('Profile completed successfully!', 'success');
      
      // Update user info in dashboard
      updateDashboardUserInfo(user);
    } catch (error) {
      console.error('Error saving profile:', error);
      showMessage('Failed to save profile. Please try again.', 'error');
      const submitBtn = profileCompletionForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Complete Profile & Continue';
    }
  });
}

// Update dashboard user info
function updateDashboardUserInfo(user) {
  const userNameEl = document.getElementById('user-name');
  const userPhotoEl = document.getElementById('user-photo');
  
  if (userNameEl) {
    userNameEl.textContent = user.displayName || user.email || 'User';
  }
  
  if (userPhotoEl && user.photoURL) {
    userPhotoEl.src = user.photoURL;
    userPhotoEl.style.display = 'block';
  }
}

// Auth state observer
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Check if user profile is complete
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.phone && userData.college) {
          // Profile complete - show dashboard
          loginSection.style.display = 'none';
          profileCompletionSection.style.display = 'none';
          userDashboard.style.display = 'block';
          updateDashboardUserInfo(user);
          loadUserData(user);
        } else {
          // Profile incomplete - show completion form
          loginSection.style.display = 'none';
          userDashboard.style.display = 'none';
          profileCompletionSection.style.display = 'block';
        }
      } else {
        // New user - show completion form
        loginSection.style.display = 'none';
        userDashboard.style.display = 'none';
        profileCompletionSection.style.display = 'block';
      }
    } else {
      // User is signed out
      loginSection.style.display = 'block';
      profileCompletionSection.style.display = 'none';
      userDashboard.style.display = 'none';
      
      if (googleSignInBtn) {
        googleSignInBtn.disabled = false;
        googleSignInBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Continue with Google';
      }
    }
  });
}

// Load user data from Firestore
async function loadUserData(user) {
  if (!db) return;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      // You can use this data to display user profile information
      console.log('User data:', data);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

