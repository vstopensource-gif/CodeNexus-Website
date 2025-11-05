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
- **Browser**: Chrome, Firefox, Edge, or Safari.
- **Local server**: Recommended for development.
- **Firebase project**: Needed for live auth/data.

### Setup
1. Create a Firebase project at `https://console.firebase.google.com`.
2. In Project Settings → General → "Your apps", create a Web app and copy the config.
3. Create `firebase-config.js` from the provided example and paste your config:

```bash
cp firebase-config.example.js firebase-config.js
```

4. Edit `firebase-config.js` and fill in your Firebase credentials.

### Running Locally
You can open `index.html` directly, but a local server is better (for auth redirects and relative paths).

- Using Python (3.x):
```bash
python3 -m http.server 5500
# then open http://localhost:5500
```

- Using Node (serve):
```bash
npx serve . -l 5500 --single
# then open http://localhost:5500
```

- Using VS Code Live Server: Right-click `index.html` → "Open with Live Server".

### Environment Notes
- Ensure `firebase-config.js` is loaded before any file that uses Firebase (e.g., `auth.js`, `nav-auth.js`).
- Do not commit secrets. Client Firebase config is public, but never commit admin/service keys.

### Deployment
- **GitHub Pages** (static):
  - Push the repository to GitHub.
  - In repo Settings → Pages, select the branch and root folder.
  - Wait for the site to build; then open the Pages URL.
- **Firebase Hosting** (dynamic-friendly):
  - Install Firebase CLI and initialize hosting in this folder.
```bash
npm i -g firebase-tools
firebase login --no-localhost
firebase init hosting
firebase deploy
```

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
- **Blank auth state**: Confirm `firebase-config.js` exists and is loaded before `auth.js`.
- **CORS or file path issues**: Use a local server instead of opening files directly.
- **Firebase errors**: Re-check API key, project ID, and enabled auth providers in Firebase Console.

### License
MIT (or your preferred license). If you need a specific license, add a `LICENSE` file.

### Acknowledgments
- Firebase for authentication and hosting tooling.
- CodeNexus community contributors.


Hello 
how are you 