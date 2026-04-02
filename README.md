# Convoy Movement Calculator

U.S. Army Convoy Movement Calculator with interactive map routing, vehicle database, and DD Form 1265 export.

## Features
- Interactive map with road routing (Leaflet + OSRM)
- Turn-by-turn directions
- Full Army vehicle database with specs (HMMWV, JLTV, FMTV, HEMTT, PLS, HET)
- Trailer attachments
- Auto march rate (limited to slowest vehicle)
- Density formula (VPM), pass time, ETA/ETD schedule
- DD Form 1265 export to PDF
- All formulas match Army convoy calculation doctrine

---

## Deploy to GitHub Pages (Step by Step)

### 1. Install Git and Node.js
If you don't have them yet:
- **Git**: https://git-scm.com/downloads
- **Node.js**: https://nodejs.org (download the LTS version)

Open a terminal (Command Prompt, PowerShell, or Mac Terminal).

### 2. Create a GitHub Repository
1. Go to https://github.com
2. Click the green **New** button (top left)
3. Name it `convoy-calculator`
4. Leave it **Public**
5. Do NOT check "Add a README" (we already have one)
6. Click **Create repository**
7. Copy the URL it gives you (looks like `https://github.com/YOUR-USERNAME/convoy-calculator.git`)

### 3. Set Up the Project Locally
Unzip the project folder, then open a terminal in that folder:

```bash
cd convoy-app

# Install dependencies
npm install

# Test it locally (opens in your browser at http://localhost:5173)
npm run dev
```

If it looks good, stop the dev server (Ctrl+C) and push to GitHub:

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit - Convoy Movement Calculator"

# Connect to your GitHub repo (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/convoy-calculator.git
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages
1. Go to your repo on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**, select **GitHub Actions**
5. That is it. The workflow file we included will auto-deploy

### 5. Wait for Deployment
1. Go to the **Actions** tab in your repo
2. You should see a workflow running called "Deploy to GitHub Pages"
3. Wait 1 to 2 minutes for it to finish (green checkmark)
4. Your app is now live at: `https://YOUR-USERNAME.github.io/convoy-calculator/`

---

## Update the App
Any time you make changes, just:

```bash
git add .
git commit -m "Description of what you changed"
git push
```

GitHub Actions will auto-rebuild and redeploy. Takes about 1 minute.

---

## Run Locally for Development

```bash
npm install    # First time only
npm run dev    # Starts local dev server
```

Open http://localhost:5173 in your browser.

---

## If Your Repo Name Is Different
If you named your repo something other than `convoy-calculator`, open `vite.config.js` and change the base path:

```js
base: '/your-repo-name/'
```

---

## Tech Stack
- React 18
- Vite
- Leaflet (OpenStreetMap)
- Leaflet Routing Machine (OSRM)
- GitHub Pages (free hosting)
