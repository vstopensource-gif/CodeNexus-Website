## CodeNexus Website

A lightweight, static website for the CodeNexus developer community with authentication, profile management, and event registrations. Built with vanilla HTML/CSS/JS and Firebase for authentication and data storage.

> 🌐 **Live Demo:** [Visit the live site](#) *(codenexusvst.netlify.app)*  
> 💬 **Join our community:** [WhatsApp Channel](https://whatsapp.com/channel/0029Vb6s2Jg4dTnTPNbgRE37) | [WhatsApp Community](https://chat.whatsapp.com/JUaHh3U8nKwGa8b8lDJUko) | [LinkedIn](https://www.linkedin.com/in/code-nexus-323b32396/) | [Instagram](https://www.instagram.com/code_nexus_official/)

### Features
- 🔐 **Authentication**: Google Sign-In powered by Firebase Authentication
- 👤 **User Profiles**: Profile management with phone number and college information
- 📅 **Event Management**: Event listings and registration system
- 🎯 **GSOC Events**: Dedicated pages for GSoC preparation and mentorship sessions
- 📱 **Responsive Design**: Mobile-friendly UI that works on all devices
- ⚡ **Lightweight**: Pure vanilla JavaScript, no heavy frameworks

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
  └─ GsocEvent.jpeg          # Media asset
```

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend Services**: Firebase (Authentication, Firestore)
- **Hosting**: Compatible with any static hosting service
- **No Build Tools**: Pure static files, no bundlers required

### Browser Support
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ Internet Explorer (not supported)

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, or Safari)
- A local web server for development (recommended)
- A Firebase project for authentication and data storage

### Setup
1. **Create a Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or select an existing one
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Configure Security Rules for your data

2. **Configure Firebase in the code:**
   - Update the `firebaseConfig` object in `auth.js`, `nav-auth.js`, and `event-registration.js`
   - Replace the placeholder values with your Firebase project credentials
   - You can find these in Firebase Console → Project Settings → General → Your apps

**Note:** Firebase web API keys are public identifiers and are safe to include in client-side code. Security is enforced through Firebase Security Rules and Authentication.

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

### Security Notes
- Firebase web API keys are public identifiers and must be included in client-side code
- Security is enforced through Firebase Security Rules and Authentication
- Configure proper Firestore Security Rules to protect your data
- Never expose Firebase Admin SDK keys or service account credentials

### Deployment

**GitHub Pages:**
1. Push your repository to GitHub
2. Go to Repository Settings → Pages
3. Select the branch and root folder
4. Your site will be available at `https://yourusername.github.io/repository-name`

**Firebase Hosting:**
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. Initialize hosting: `firebase init hosting`
4. Deploy: `firebase deploy`

**Netlify:**
1. Connect your GitHub repository to Netlify
2. Set build command: (leave empty for static site)
3. Set publish directory: `/` (root)
4. Deploy automatically on push

**Other Static Hosting:**
This is a static website and can be deployed to any static hosting service (Vercel, Cloudflare Pages, etc.).

### Customization
- Update styling in `styles.css`.
- Adjust navigation/auth UI in `nav-auth.js`.
- Extend profile fields or validation in `profile.js`.
- Add or modify event pages (`events.html`, `event-gsoc.html`) and logic (`event-registration.js`).

### Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository** and create a feature branch
2. **Make your changes** following the existing code style
3. **Test locally** to ensure everything works
4. **Submit a pull request** with a clear description of your changes

**Guidelines:**
- Keep code focused and readable
- Match the existing code style and structure
- Test all changes before submitting
- Update documentation if needed
- Be respectful and constructive in discussions

### Reporting Issues

Found a bug or have a suggestion? Please open an issue in this repository with:
- A clear description of the problem
- Steps to reproduce (if it's a bug)
- Expected vs actual behavior
- Browser and OS information (if relevant)

### Troubleshooting

**Authentication not working:**
- Verify Firebase configuration in `auth.js`, `nav-auth.js`, and `event-registration.js`
- Check that Authentication is enabled in Firebase Console
- Ensure Google Sign-In provider is configured in Firebase Console

**CORS or module errors:**
- Always use a local web server (see "Running Locally" above)
- Do not open HTML files directly in the browser (file:// protocol)

**Firebase errors:**
- Verify your Firebase project credentials are correct
- Check that Firestore database is created and rules are configured
- Ensure required Firebase services are enabled in the console

**Data access issues:**
- Review Firestore Security Rules in Firebase Console
- Verify that users are properly authenticated before accessing data

### License
MIT (or your preferred license). If you need a specific license, add a `LICENSE` file.

### Community & Support

- 💬 **WhatsApp Channel**: [Join for updates](https://whatsapp.com/channel/0029Vb6s2Jg4dTnTPNbgRE37)
- 👥 **WhatsApp Community**: [Join the conversation](https://chat.whatsapp.com/JUaHh3U8nKwGa8b8lDJUko)
- 💼 **LinkedIn**: [Connect with us](https://www.linkedin.com/in/code-nexus-323b32396/)
- 📷 **Instagram**: [Follow us](https://www.instagram.com/code_nexus_official/)

### Acknowledgments
- Firebase for authentication and hosting tooling
- CodeNexus community contributors and members
- All open-source libraries and tools that made this project possible
