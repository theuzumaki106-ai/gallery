# Lumina — Automated GitHub Photography Portfolio & Gallery

> A modern, high-performance photo gallery website hosted for free on **GitHub Pages**. Whenever you upload or push any photo to the `photos/` folder on GitHub, it **automatically syncs and appears in your live gallery** without needing any manual code editing!

---

## ✨ Features

- **🔒 Password-Protected Upload Studio:**
  - Secure passcode lock prevents unauthorized visitors from uploading photos.
  - Default admin passcode: `admin123` (changeable anytime in Settings).
  - SHA-256 cryptographic verification using the Web Crypto API.
  - Direct in-browser upload: Drag & drop photos, edit title/category, and commit straight to GitHub via REST API!
- **⚡ 100% Automated GitHub Sync:** Upload photos via the in-browser studio or via GitHub web UI ("Upload files") — your gallery updates automatically via the GitHub REST API and edge CDN.
- **🎨 Award-Winning Editorial UI/UX:**
  - Ambient glowing background & frosted glassmorphism navigation.
  - Dark Mode (OLED) & Light Mode with smooth transition.
  - Multi-layout switch: **Dynamic Masonry**, **Square Grid**, and **Editorial Feed**.
- **🔍 Real-Time Search & Smart Tagging:** Instant search by title, tag, or camera, plus automatic category pill generation from filenames.
- **🖼️ Pro Fullscreen Lightbox:**
  - Mouse wheel zoom & pan drag.
  - Bottom filmstrip thumbnail carousel.
  - EXIF metadata drawer (file size, dimensions, camera, exposure, GitHub source).
  - Download original image & Copy direct image link.
  - Fullscreen toggle (`F`) & Keyboard shortcuts (Left/Right arrows, `Esc`, `I`).
  - Auto-play Slideshow mode with smooth progress bar (`Space`).
- **❤️ Favorites System:** Save favorite photos with localStorage persistence.
- **🚀 Optional GitHub Action:** Automatically creates `photos.json` on push for instant loading with zero API rate limits.


---

## 🚀 Quick Setup & Deployment to GitHub (Under 2 Minutes)

### Step 1: Create a GitHub Repository
1. Go to [GitHub.com/new](https://github.com/new).
2. Name your repository (for example: `my-photo-gallery`).
3. Set it to **Public** and click **Create repository**.

### Step 2: Push this folder to your repository
Open PowerShell or your terminal in this directory:
```bash
cd "C:\Users\viswajeet\.gemini\antigravity\scratch\auto-github-gallery"
git init
git add .
git commit -m "feat: initial lumina automated photo gallery"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

*(Alternatively, you can drag and drop all the files from this folder directly into the GitHub web interface!)*

### Step 3: Enable Free GitHub Pages
1. In your GitHub repository, click on **Settings** (top tab).
2. In the left sidebar, click on **Pages**.
3. Under **Build and deployment > Branch**:
   - Choose **`main`** (or `master`)
   - Choose **`/ (root)`**
   - Click **Save**.
4. In about 30 seconds, GitHub will give you your live URL:
   `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

---

## 📸 How to Upload Photos (Two Easy Ways)

### Method 1: Directly from the Website (Protected with Password)
1. Click the **Upload Photos** button in the top navigation bar.
2. Enter your Admin Password (default: <code class="code-badge">admin123</code>).
3. The **Photo Upload Studio** will open:
   - Drag & drop or select your photo (`.jpg`, `.png`, `.webp`, `.gif`, etc.).
   - Set the **Photo Title** and **Category** (e.g. Nature, Architecture, Street).
   - Enter your GitHub Personal Access Token (stored locally in your browser).
   - Click **Upload to GitHub Now** &rarr; it commits directly to your GitHub repo and immediately refreshes the gallery!
4. When finished, you can click the Lock icon in the header to re-lock admin access.

### Method 2: Directly via GitHub Web UI
1. Open your repository on GitHub.
2. Open the **`photos/`** folder.
3. Click **Add file &rarr; Upload files**.
4. Drag & drop your photos and click **Commit changes**.
5. Refresh your website — your new photos will immediately appear in your gallery!


### 💡 Pro Tip: Smart Categories via Filename
Name your files with a category prefix to automatically categorize them into filter pills!
- `nature-lake-sunset.jpg` &rarr; Categorized under **Nature**
- `architecture-glass-facade.jpg` &rarr; Categorized under **Architecture**
- `street-midnight-rain.webp` &rarr; Categorized under **Street**
- `travel-kyoto-shrine.png` &rarr; Categorized under **Travel**
- `portrait-elena.jpg` &rarr; Categorized under **Portraits**

---

## ⚙️ Configuration & Local Testing

- **Local Preview:** You can open `index.html` directly in your browser or run a local server (`npx serve .` or `python -m http.server`). It will show a curated high-res demo gallery and a settings modal where you can enter any GitHub repository to test live syncing!
- **Settings Modal:** Click the ⚙️ icon in the header at any time to configure your GitHub Username, Repository, branch, or optional token.

---

## 📁 File Structure

```
auto-github-gallery/
├── index.html                  # Main gallery page & UI layout
├── css/
│   └── style.css               # Complete responsive design system & animations
├── js/
│   ├── config.js               # Auto-detects GitHub Pages repo & manages settings
│   ├── github-api.js           # GitHub REST API fetcher, CDN links & caching
│   ├── lightbox.js             # Fullscreen lightbox, zoom, filmstrip, slideshow
│   └── app.js                  # Gallery rendering, filters, search, favorites
├── photos/
│   ├── sample-photos.json      # High-res sample photography for offline/demo
│   └── README.md               # Quick upload instructions for this folder
├── .github/
│   └── workflows/
│       └── generate-gallery.yml# GitHub Action to auto-index photos on push
└── README.md                   # Documentation
```
