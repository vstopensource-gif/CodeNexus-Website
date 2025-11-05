# Vite Setup with Environment Variables

This project uses Vite to bundle the application and inject Firebase configuration from environment variables at build time.

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
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

   **Important:** The `.env` file is already in `.gitignore` and will NOT be committed to Git.

## Development

Run the development server:
```bash
npm run dev
```

This will start Vite's dev server on `http://localhost:5500` (or the next available port).

## Production Build

Build for production:
```bash
npm run build
```

This creates an optimized build in the `dist/` directory. The Firebase configuration will be injected from your environment variables at build time.

## Deployment to Netlify

1. **Set Environment Variables in Netlify:**
   - Go to your Netlify site → **Site settings** → **Environment variables**
   - Add all the `VITE_FIREBASE_*` variables with their values
   - These are the same values from your local `.env` file

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Deploy:**
   - Push to your connected Git repository
   - Netlify will automatically build and deploy using the environment variables

## Security Notes

- ✅ Firebase API keys are **public identifiers**, not secrets. They must be in the client bundle.
- ✅ Security comes from **Firebase Security Rules** and **Auth**, not from hiding the keys.
- ✅ The `.env` file is in `.gitignore` so it never gets committed to Git.
- ✅ In production, environment variables are set in Netlify, not in your repository.
- ✅ The source code in GitHub stays clean (no hardcoded keys).
- ✅ The built JavaScript contains the config (as it must), but the raw source doesn't.

## Troubleshooting

**Missing environment variables error:**
- Make sure you created the `.env` file with all required variables
- Check that variable names start with `VITE_` (required by Vite)
- Restart the dev server after creating/updating `.env`

**Build fails:**
- Ensure all `VITE_FIREBASE_*` variables are set in Netlify (for production builds)
- Check that your `.env` file exists locally (for local builds)

