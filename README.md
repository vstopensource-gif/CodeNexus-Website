## CodeNexus Website

A lightweight, static website for the CodeNexus community with authentication, profile management, and event registrations (including a GSOC event page). Built with vanilla HTML/CSS/JS and Firebase for auth/storage.

### Features
- **Authentication**: Login/Signup/Logout flows powered by Firebase (`auth.js`, `nav-auth.js`).
- **User Profiles**: Basic profile view and updates (`profile.html`, `profile.js`).
- **Events**: Events listing and registration (`events.html`, `event-registration.js`).
- **GSOC Event**: Dedicated GSOC event page (`event-gsoc.html`, `GsocEvent.jpeg`).
- **Responsive UI**: Global styles in `styles.css`.

### Project Structure
```
/CodeNexus-Website
  ├─ index.html              # Landing page
  ├─ join.html               # Join/Onboarding page
  ├─ events.html             # Events listing
  ├─ event-gsoc.html         # GSOC event page
  ├─ profile.html            # User profile page
  ├─ styles.css              # Global styles
  ├─ auth.js                 # Firebase auth helpers (login/signup/logout)
  ├─ nav-auth.js             # Navbar auth-state handling
  ├─ profile.js              # Profile page logic
  ├─ event-registration.js   # Event registration logic
  ├─ firebase-config.example.js # Template for Firebase config
  └─ GsocEvent.jpeg          # Media asset
```

### Prerequisites
- **Node.js**: v16 or higher (for npm)
- **Browser**: Chrome, Firefox, Edge, or Safari.
- **Firebase project**: Needed for live auth/data.

### Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create Firebase project:**
   - Go to `https://console.firebase.google.com`
   - In Project Settings → General → "Your apps", create a Web app and copy the config

3. **Create `.env` file:**
   Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

   **Important:** The `.env` file is in `.gitignore` and will NOT be committed to Git.

### Running Locally

**Development server (recommended):**
```bash
npm run dev
```
This starts Vite's dev server on `http://localhost:5500` with hot module replacement.

**Production build:**
```bash
npm run build
npm run preview
```
This creates an optimized build in the `dist/` directory.

### Environment Notes
- Firebase configuration is loaded from environment variables via `firebase-config.js`
- The `.env` file is never committed to Git (it's in `.gitignore`)
- In production (Netlify), set the same `VITE_FIREBASE_*` variables in Netlify's environment variables
- Client Firebase config is public (as required), but security comes from Firebase Security Rules and Auth

### Deployment

**Netlify (recommended):**
1. Set environment variables in Netlify:
   - Go to Site settings → Environment variables
   - Add all `VITE_FIREBASE_*` variables with their values (same as in your `.env` file)
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Push to your connected Git repository - Netlify will build and deploy automatically

**Firebase Hosting:**
```bash
npm run build
npm i -g firebase-tools
firebase login --no-localhost
firebase init hosting
# Set public directory to "dist"
firebase deploy
```

**GitHub Pages:**
- Build the project: `npm run build`
- Push the `dist/` folder contents to the `gh-pages` branch
- Enable GitHub Pages in repository settings

### Customization
- Update styling in `styles.css`.
- Adjust navigation/auth UI in `nav-auth.js`.
- Extend profile fields or validation in `profile.js`.
- Add or modify event pages (`events.html`, `event-gsoc.html`) and logic (`event-registration.js`).

### Contributing
- Fork and create a feature branch.
- Keep edits focused and readable; match existing code style.
- Test locally before opening a PR.

### Troubleshooting
- **Missing environment variables error**: 
  - Make sure you created the `.env` file with all required `VITE_FIREBASE_*` variables
  - Restart the dev server after creating/updating `.env`
- **Build fails in production**: 
  - Ensure all `VITE_FIREBASE_*` variables are set in Netlify (or your hosting platform)
- **Firebase errors**: 
  - Re-check API key, project ID, and enabled auth providers in Firebase Console
  - Verify environment variables are correctly set
- **CORS or module errors**: 
  - Use `npm run dev` (Vite dev server) instead of opening files directly
  - For production, always use the built files from `dist/`

### License
MIT (or your preferred license). If you need a specific license, add a `LICENSE` file.

### Acknowledgments
- Firebase for authentication and hosting tooling.
- CodeNexus community contributors.
