/**
 * LUMINA GALLERY — MAIN APPLICATION CONTROLLER
 */

class LuminaGalleryApp {
  constructor() {
    this.allPhotos = [];
    this.filteredPhotos = [];
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.currentSort = 'newest';
    this.favoritesOnly = false;
    this.currentLayout = 'layout-masonry';
    this.favorites = this.loadFavorites();

    this.bindDOM();
    this.initTheme();
    this.initEventListeners();
    this.loadGallery();
  }

  bindDOM() {
    // Containers
    this.galleryGrid = document.getElementById('galleryGrid');
    this.gallerySkeleton = document.getElementById('gallerySkeleton');
    this.emptyState = document.getElementById('emptyState');
    this.demoBanner = document.getElementById('demoBanner');
    this.toastContainer = document.getElementById('toastContainer');

    // Header & Meta
    this.galleryTitle = document.getElementById('galleryTitle');
    this.gallerySubtitle = document.getElementById('gallerySubtitle');
    this.photoCount = document.getElementById('photoCount');
    this.categoryCount = document.getElementById('categoryCount');
    this.repoNameDisplay = document.getElementById('repoNameDisplay');
    this.syncStatusBadge = document.getElementById('syncStatusBadge');
    this.syncStatusText = document.getElementById('syncStatusText');

    // Controls
    this.categoriesList = document.getElementById('categoriesList');
    this.searchInput = document.getElementById('searchInput');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');
    this.sortDropdownTrigger = document.getElementById('sortDropdownTrigger');
    this.sortDropdownMenu = document.getElementById('sortDropdownMenu');
    this.currentSortLabel = document.getElementById('currentSortLabel');
    this.favoritesFilterBtn = document.getElementById('favoritesFilterBtn');
    this.favoritesCount = document.getElementById('favoritesCount');

    // Layout buttons
    this.layoutMasonryBtn = document.getElementById('layoutMasonryBtn');
    this.layoutGridBtn = document.getElementById('layoutGridBtn');
    this.layoutColumnsBtn = document.getElementById('layoutColumnsBtn');

    // Action buttons
    this.startSlideshowBtn = document.getElementById('startSlideshowBtn');
    this.openUploadBtn = document.getElementById('openUploadBtn');
    this.uploadBtnLockIcon = document.getElementById('uploadBtnLockIcon');
    this.uploadBtnText = document.getElementById('uploadBtnText');
    this.adminSessionPill = document.getElementById('adminSessionPill');
    this.lockSessionBtn = document.getElementById('lockSessionBtn');
    this.openSettingsBtn = document.getElementById('openSettingsBtn');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.connectRepoBannerBtn = document.getElementById('connectRepoBannerBtn');
    this.emptyStateActionBtn = document.getElementById('emptyStateActionBtn');

    // Password Authentication Modal
    this.passwordModal = document.getElementById('passwordModal');
    this.passwordBackdrop = document.getElementById('passwordBackdrop');
    this.closePasswordBtn = document.getElementById('closePasswordBtn');
    this.cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    this.submitPasswordBtn = document.getElementById('submitPasswordBtn');
    this.adminPasswordInput = document.getElementById('adminPasswordInput');
    this.togglePasswordBtn = document.getElementById('togglePasswordBtn');
    this.passwordErrorMsg = document.getElementById('passwordErrorMsg');
    this.rememberSessionCheck = document.getElementById('rememberSessionCheck');

    // Photo Upload Studio Modal
    this.uploadStudioModal = document.getElementById('uploadStudioModal');
    this.uploadStudioBackdrop = document.getElementById('uploadStudioBackdrop');
    this.closeUploadStudioBtn = document.getElementById('closeUploadStudioBtn');
    this.closeUploadStudioFooterBtn = document.getElementById('closeUploadStudioFooterBtn');
    this.switchUploadTabBtn = document.getElementById('switchUploadTabBtn');
    this.switchTabBtnText = document.getElementById('switchTabBtnText');
    this.uploadTabDirect = document.getElementById('uploadTabDirect');
    this.uploadTabGuide = document.getElementById('uploadTabGuide');
    this.uploadDropzone = document.getElementById('uploadDropzone');
    this.photoFileInput = document.getElementById('photoFileInput');
    this.browseFileBtn = document.getElementById('browseFileBtn');
    this.uploadPreviewPanel = document.getElementById('uploadPreviewPanel');
    this.uploadImgPreview = document.getElementById('uploadImgPreview');
    this.previewFileSize = document.getElementById('previewFileSize');
    this.uploadPhotoTitle = document.getElementById('uploadPhotoTitle');
    this.uploadPhotoCategory = document.getElementById('uploadPhotoCategory');
    this.customCategoryGroup = document.getElementById('customCategoryGroup');
    this.uploadCustomCategory = document.getElementById('uploadCustomCategory');
    this.destFilenamePreview = document.getElementById('destFilenamePreview');
    this.uploadTokenBox = document.getElementById('uploadTokenBox');
    this.uploadTokenInput = document.getElementById('uploadTokenInput');
    this.uploadProgressContainer = document.getElementById('uploadProgressContainer');
    this.uploadProgressBar = document.getElementById('uploadProgressBar');
    this.uploadStatusText = document.getElementById('uploadStatusText');
    this.chooseAnotherFileBtn = document.getElementById('chooseAnotherFileBtn');
    this.startUploadBtn = document.getElementById('startUploadBtn');
    this.openDirectGithubFolderBtn = document.getElementById('openDirectGithubFolderBtn');

    // Settings Modal
    this.settingsModal = document.getElementById('settingsModal');
    this.settingsBackdrop = document.getElementById('settingsBackdrop');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    this.resetDemoBtn = document.getElementById('resetDemoBtn');

    // Form inputs
    this.cfgUsername = document.getElementById('cfgUsername');
    this.cfgRepo = document.getElementById('cfgRepo');
    this.cfgFolder = document.getElementById('cfgFolder');
    this.cfgBranch = document.getElementById('cfgBranch');
    this.cfgToken = document.getElementById('cfgToken');
    this.cfgTitle = document.getElementById('cfgTitle');
    this.cfgNewPassword = document.getElementById('cfgNewPassword');
    this.footerGithubLink = document.getElementById('footerGithubLink');

    // Upload state
    this.selectedUploadFile = null;
    this.currentUploadTab = 'direct';
  }

  /* ========================================================================
     Theme Management (Dark / Light)
     ======================================================================== */
  initTheme() {
    const savedTheme = localStorage.getItem('lumina_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('lumina_theme', newTheme);
  }

  /* ========================================================================
     Event Listeners
     ======================================================================== */
  initEventListeners() {
    // Check initial admin unlocked state
    this.updateAdminUIState();

    // Theme toggle
    this.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());

    // Search
    this.searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
      this.applyFilters();
    });

    this.clearSearchBtn?.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.clearSearchBtn.style.display = 'none';
      this.applyFilters();
    });

    // Layout Modes
    this.layoutMasonryBtn?.addEventListener('click', () => this.setLayout('layout-masonry'));
    this.layoutGridBtn?.addEventListener('click', () => this.setLayout('layout-grid'));
    this.layoutColumnsBtn?.addEventListener('click', () => this.setLayout('layout-columns'));

    // Sort Dropdown
    this.sortDropdownTrigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.sortDropdownTrigger.parentElement.classList.toggle('open');
    });

    window.addEventListener('click', () => {
      this.sortDropdownTrigger?.parentElement.classList.remove('open');
    });

    this.sortDropdownMenu?.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const sortType = e.currentTarget.dataset.sort;
        this.setSort(sortType, e.currentTarget.textContent.trim());
      });
    });

    // Favorites Filter
    this.favoritesFilterBtn?.addEventListener('click', () => {
      this.favoritesOnly = !this.favoritesOnly;
      this.favoritesFilterBtn.classList.toggle('active', this.favoritesOnly);
      this.applyFilters();
    });

    // Slideshow
    this.startSlideshowBtn?.addEventListener('click', () => {
      if (this.filteredPhotos.length > 0) {
        window.galleryLightbox.setPhotos(this.filteredPhotos);
        window.galleryLightbox.open(0);
        window.galleryLightbox.startSlideshow();
      }
    });

    // Upload & Password Access handlers
    this.openUploadBtn?.addEventListener('click', () => this.handleUploadAccessClick());
    this.emptyStateActionBtn?.addEventListener('click', () => this.handleUploadAccessClick());
    this.lockSessionBtn?.addEventListener('click', () => this.lockAdminSession());

    // Password modal listeners
    this.closePasswordBtn?.addEventListener('click', () => this.toggleModal(this.passwordModal, false));
    this.cancelPasswordBtn?.addEventListener('click', () => this.toggleModal(this.passwordModal, false));
    this.passwordBackdrop?.addEventListener('click', () => this.toggleModal(this.passwordModal, false));
    this.submitPasswordBtn?.addEventListener('click', () => this.submitPassword());
    this.adminPasswordInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submitPassword();
    });
    this.togglePasswordBtn?.addEventListener('click', () => this.togglePasswordVisibility());

    // Upload Studio listeners
    this.closeUploadStudioBtn?.addEventListener('click', () => this.toggleModal(this.uploadStudioModal, false));
    this.closeUploadStudioFooterBtn?.addEventListener('click', () => this.toggleModal(this.uploadStudioModal, false));
    this.uploadStudioBackdrop?.addEventListener('click', () => this.toggleModal(this.uploadStudioModal, false));
    this.switchUploadTabBtn?.addEventListener('click', () => this.toggleUploadTab());

    this.openDirectGithubFolderBtn?.addEventListener('click', () => {
      const cfg = window.galleryConfig.get();
      if (cfg.username && cfg.repo) {
        window.open(`https://github.com/${cfg.username}/${cfg.repo}/tree/${cfg.branch}/${cfg.folder}`, '_blank');
      } else {
        window.open('https://github.com', '_blank');
      }
    });

    // Dropzone & File selection
    this.browseFileBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.photoFileInput?.click();
    });
    this.uploadDropzone?.addEventListener('click', () => this.photoFileInput?.click());

    this.photoFileInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleFileSelected(e.target.files[0]);
      }
    });

    // Drag and Drop
    this.uploadDropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadDropzone.classList.add('dragover');
    });
    this.uploadDropzone?.addEventListener('dragleave', () => {
      this.uploadDropzone.classList.remove('dragover');
    });
    this.uploadDropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    this.chooseAnotherFileBtn?.addEventListener('click', () => this.resetUploadFile());
    this.uploadPhotoTitle?.addEventListener('input', () => this.updateFilenamePreview());
    this.uploadPhotoCategory?.addEventListener('change', () => {
      const isCustom = this.uploadPhotoCategory.value === 'Custom';
      if (this.customCategoryGroup) {
        this.customCategoryGroup.style.display = isCustom ? 'block' : 'none';
      }
      this.updateFilenamePreview();
    });
    this.uploadCustomCategory?.addEventListener('input', () => this.updateFilenamePreview());
    this.startUploadBtn?.addEventListener('click', () => this.executePhotoUpload());

    // Settings
    this.openSettingsBtn?.addEventListener('click', () => this.openSettings());
    this.connectRepoBannerBtn?.addEventListener('click', () => this.openSettings());
    this.closeSettingsBtn?.addEventListener('click', () => this.toggleModal(this.settingsModal, false));
    this.settingsBackdrop?.addEventListener('click', () => this.toggleModal(this.settingsModal, false));
    this.saveSettingsBtn?.addEventListener('click', () => this.saveSettings());
    this.resetDemoBtn?.addEventListener('click', () => this.resetSettingsToDemo());

    // Sync status click to refresh
    this.syncStatusBadge?.addEventListener('click', () => {
      window.gitHubGalleryAPI.clearCache();
      this.showToast('Refreshing live photos from GitHub...', 'info');
      this.loadGallery();
    });
  }


  /* ========================================================================
     Load & Fetch Photos
     ======================================================================== */
  async loadGallery() {
    this.showLoading(true);

    const config = window.galleryConfig.get();
    
    // Update Header Meta
    if (this.galleryTitle && config.title) {
      this.galleryTitle.textContent = config.title;
    }

    if (config.isDemo) {
      this.demoBanner.style.display = 'flex';
      this.syncStatusText.textContent = 'Sample Demo Mode';
      this.repoNameDisplay.textContent = 'Demo Gallery';
    } else {
      this.demoBanner.style.display = 'none';
      this.syncStatusText.textContent = `Synced: ${config.repo}`;
      this.repoNameDisplay.textContent = `${config.username}/${config.repo}`;
      if (this.footerGithubLink) {
        this.footerGithubLink.href = `https://github.com/${config.username}/${config.repo}`;
      }
    }

    try {
      let photos = await window.gitHubGalleryAPI.getPhotos();
      if (!photos || photos.length === 0) {
        console.info('No photos returned from primary source, using embedded sample gallery.');
        photos = await window.gitHubGalleryAPI.fetchSamplePhotos();
      }
      this.allPhotos = photos || [];

      this.renderCategories();
      this.applyFilters();
      this.updateFavoritesCount();

      this.showLoading(false);
      if (this.allPhotos.length > 0) {
        this.showToast(`Loaded ${this.allPhotos.length} photos`, 'success');
      }
    } catch (err) {
      console.error('Gallery Load Error:', err);
      
      // Fallback to sample photos if error occurred
      const samplePhotos = await window.gitHubGalleryAPI.fetchSamplePhotos();
      this.allPhotos = samplePhotos || [];
      this.renderCategories();
      this.applyFilters();
      this.showLoading(false);
      this.demoBanner.style.display = 'flex';
      this.showToast(err.message, 'warning', 4000);
    }
  }


  showLoading(isLoading) {
    if (isLoading) {
      this.gallerySkeleton.style.display = this.currentLayout === 'layout-masonry' ? 'block' : 'grid';
      this.galleryGrid.style.display = 'none';
      this.emptyState.style.display = 'none';
    } else {
      this.gallerySkeleton.style.display = 'none';
      this.galleryGrid.style.display = this.currentLayout === 'layout-masonry' ? 'block' : 'grid';
      if (this.currentLayout === 'layout-columns') {
        this.galleryGrid.style.display = 'flex';
      }
    }
  }

  /* ========================================================================
     Filtering & Sorting
     ======================================================================== */
  applyFilters() {
    let list = [...this.allPhotos];

    // 1. Category Filter
    if (this.currentCategory !== 'all') {
      list = list.filter(p => (p.category || '').toLowerCase() === this.currentCategory.toLowerCase());
    }

    // 2. Favorites Filter
    if (this.favoritesOnly) {
      list = list.filter(p => this.isFavorite(p));
    }

    // 3. Search Query
    if (this.searchQuery) {
      list = list.filter(p => {
        const titleMatch = (p.title || '').toLowerCase().includes(this.searchQuery);
        const nameMatch = (p.name || '').toLowerCase().includes(this.searchQuery);
        const catMatch = (p.category || '').toLowerCase().includes(this.searchQuery);
        const cameraMatch = (p.camera || '').toLowerCase().includes(this.searchQuery);
        return titleMatch || nameMatch || catMatch || cameraMatch;
      });
    }

    // 4. Sort
    list = this.sortPhotos(list, this.currentSort);

    this.filteredPhotos = list;
    this.renderGallery();
    this.updateStats();

    // Sync active photos with Lightbox
    window.galleryLightbox.setPhotos(this.filteredPhotos);
  }

  sortPhotos(list, sortType) {
    switch (sortType) {
      case 'newest':
        return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      case 'oldest':
        return list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      case 'name-asc':
        return list.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name));
      case 'name-desc':
        return list.sort((a, b) => (b.title || b.name).localeCompare(a.title || a.name));
      case 'random':
        return [...list].sort(() => Math.random() - 0.5);
      default:
        return list;
    }
  }

  setSort(sortType, label) {
    this.currentSort = sortType;
    if (this.currentSortLabel) this.currentSortLabel.textContent = label;

    this.sortDropdownMenu?.querySelectorAll('.dropdown-item').forEach(item => {
      item.classList.toggle('active', item.dataset.sort === sortType);
    });

    this.applyFilters();
  }

  /* ========================================================================
     Rendering Gallery & Cards
     ======================================================================== */
  renderGallery() {
    this.galleryGrid.innerHTML = '';

    if (this.filteredPhotos.length === 0) {
      this.emptyState.style.display = 'block';
      this.galleryGrid.style.display = 'none';
      return;
    }

    this.emptyState.style.display = 'none';
    this.galleryGrid.style.display = this.currentLayout === 'layout-columns' ? 'flex' : (this.currentLayout === 'layout-masonry' ? 'block' : 'grid');

    this.filteredPhotos.forEach((photo, index) => {
      const card = this.createPhotoCard(photo, index);
      this.galleryGrid.appendChild(card);
    });
  }

  createPhotoCard(photo, index) {
    const card = document.createElement('article');
    card.className = 'photo-card';
    card.dataset.index = index;

    const isFav = this.isFavorite(photo);

    card.innerHTML = `
      <div class="card-media">
        <img src="${photo.thumbUrl || photo.url}" alt="${photo.title || photo.name}" loading="lazy">
        <div class="card-overlay">
          <div class="card-overlay-top">
            <span class="card-tag">${photo.category || 'Photography'}</span>
            <button class="card-action-btn like-btn ${isFav ? 'liked' : ''}" title="Save to Favorites" data-id="${photo.id || photo.name}">
              <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
          </div>
          <div class="card-overlay-bottom">
            <div class="card-meta">
              <h3 class="card-title">${photo.title || photo.name}</h3>
              <p class="card-subtitle">${photo.camera || photo.dimensions || 'High Resolution'}</p>
            </div>
            <div class="card-expand-icon">
              <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
            </div>
          </div>
        </div>
      </div>
    `;

    // Image error fallback
    const imgEl = card.querySelector('img');
    imgEl.onerror = () => {
      if (photo.rawUrl && imgEl.src !== photo.rawUrl) {
        imgEl.src = photo.rawUrl;
      } else if (photo.url && imgEl.src !== photo.url) {
        imgEl.src = photo.url;
      }
    };

    // Click on card opens lightbox
    card.addEventListener('click', (e) => {
      if (e.target.closest('.like-btn')) return;
      window.galleryLightbox.open(index);
    });


    // Like button inside card
    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isNowFav = this.toggleFavorite(photo);
      likeBtn.classList.toggle('liked', isNowFav);
      const icon = likeBtn.querySelector('i');
      icon.className = isNowFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    });

    return card;
  }

  /* ========================================================================
     Categories Bar
     ======================================================================== */
  renderCategories() {
    if (!this.categoriesList) return;

    // Extract all unique categories
    const categoriesMap = new Map();
    this.allPhotos.forEach(p => {
      const cat = p.category || 'Photography';
      categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
    });

    this.categoriesList.innerHTML = `
      <button class="pill ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">
        All Photos (${this.allPhotos.length})
      </button>
    `;

    categoriesMap.forEach((count, cat) => {
      const btn = document.createElement('button');
      btn.className = `pill ${this.currentCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`;
      btn.dataset.category = cat.toLowerCase();
      btn.textContent = `${cat} (${count})`;

      btn.addEventListener('click', () => {
        this.currentCategory = cat.toLowerCase();
        this.categoriesList.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        this.applyFilters();
      });

      this.categoriesList.appendChild(btn);
    });

    // Re-bind 'All' button
    this.categoriesList.querySelector('[data-category="all"]').addEventListener('click', (e) => {
      this.currentCategory = 'all';
      this.categoriesList.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      this.applyFilters();
    });

    if (this.categoryCount) {
      this.categoryCount.textContent = categoriesMap.size;
    }
  }

  updateStats() {
    if (this.photoCount) {
      this.photoCount.textContent = this.filteredPhotos.length;
    }
  }

  /* ========================================================================
     Layout Switching (Masonry / Grid / Columns)
     ======================================================================== */
  setLayout(layoutClass) {
    this.currentLayout = layoutClass;
    this.galleryGrid.className = `gallery-grid ${layoutClass}`;

    this.layoutMasonryBtn?.classList.toggle('active', layoutClass === 'layout-masonry');
    this.layoutGridBtn?.classList.toggle('active', layoutClass === 'layout-grid');
    this.layoutColumnsBtn?.classList.toggle('active', layoutClass === 'layout-columns');

    this.galleryGrid.style.display = layoutClass === 'layout-columns' ? 'flex' : (layoutClass === 'layout-masonry' ? 'block' : 'grid');
  }

  /* ========================================================================
     Favorites System
     ======================================================================== */
  loadFavorites() {
    try {
      const favs = localStorage.getItem('lumina_favorites');
      return favs ? JSON.parse(favs) : [];
    } catch (e) {
      return [];
    }
  }

  isFavorite(photo) {
    const key = photo.id || photo.name;
    return this.favorites.includes(key);
  }

  toggleFavorite(photo) {
    const key = photo.id || photo.name;
    const index = this.favorites.indexOf(key);
    let isFav = false;

    if (index > -1) {
      this.favorites.splice(index, 1);
      this.showToast('Removed from favorites', 'info');
      isFav = false;
    } else {
      this.favorites.push(key);
      this.showToast('Added to favorites', 'success');
      isFav = true;
    }

    localStorage.setItem('lumina_favorites', JSON.stringify(this.favorites));
    this.updateFavoritesCount();

    if (this.favoritesOnly) {
      this.applyFilters();
    }

    return isFav;
  }

  updateFavoritesCount() {
    if (!this.favoritesCount) return;
    const count = this.favorites.length;
    this.favoritesCount.textContent = count;
    this.favoritesCount.style.display = count > 0 ? 'flex' : 'none';
  }

  /* ========================================================================
     Modals (Upload Guide & Settings)
     ======================================================================== */
  toggleModal(modal, show) {
    if (!modal) return;
    if (show) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  openSettings() {
    const cfg = window.galleryConfig.get();
    if (this.cfgUsername) this.cfgUsername.value = cfg.username || '';
    if (this.cfgRepo) this.cfgRepo.value = cfg.repo || '';
    if (this.cfgFolder) this.cfgFolder.value = cfg.folder || 'photos';
    if (this.cfgBranch) this.cfgBranch.value = cfg.branch || 'main';
    if (this.cfgToken) this.cfgToken.value = cfg.token || '';
    if (this.cfgTitle) this.cfgTitle.value = cfg.title || 'Captured Moments';

    this.toggleModal(this.settingsModal, true);
  }

  saveSettings() {
    const username = this.cfgUsername.value.trim();
    const repo = this.cfgRepo.value.trim();
    const folder = this.cfgFolder.value.trim() || 'photos';
    const branch = this.cfgBranch.value.trim() || 'main';
    const token = this.cfgToken.value.trim();
    const title = this.cfgTitle.value.trim() || 'Captured Moments';

    const newPassword = this.cfgNewPassword?.value.trim();

    if (!username || !repo) {
      this.showToast('Please enter both GitHub Username and Repository name', 'warning');
      return;
    }

    window.galleryConfig.saveConfig({
      username,
      repo,
      folder,
      branch,
      token,
      title
    });

    // If new password provided, update hash
    if (newPassword) {
      window.galleryConfig.updatePassword(newPassword);
      this.showToast('Admin password updated successfully!', 'success');
      if (this.cfgNewPassword) this.cfgNewPassword.value = '';
    }

    window.gitHubGalleryAPI.clearCache();
    this.toggleModal(this.settingsModal, false);
    this.showToast('Settings saved! Connecting to GitHub repository...', 'success');
    this.loadGallery();
  }

  resetSettingsToDemo() {
    window.galleryConfig.resetToDemo();
    window.gitHubGalleryAPI.clearCache();
    this.toggleModal(this.settingsModal, false);
    this.showToast('Reset to Sample Demo Gallery', 'info');
    this.loadGallery();
  }

  /* ========================================================================
     Admin Authentication & Password Protection
     ======================================================================== */
  updateAdminUIState() {
    const isUnlocked = window.galleryConfig.isAdminUnlocked();
    if (this.adminSessionPill) {
      this.adminSessionPill.style.display = isUnlocked ? 'inline-flex' : 'none';
    }
    if (this.uploadBtnLockIcon) {
      this.uploadBtnLockIcon.className = isUnlocked ? 'fa-solid fa-cloud-arrow-up' : 'fa-solid fa-lock';
    }
    if (this.uploadBtnText) {
      this.uploadBtnText.textContent = isUnlocked ? 'Upload Studio' : 'Upload Photos';
    }
  }

  handleUploadAccessClick() {
    if (window.galleryConfig.isAdminUnlocked()) {
      this.openUploadStudio();
    } else {
      this.openPasswordModal();
    }
  }

  openPasswordModal() {
    if (this.adminPasswordInput) {
      this.adminPasswordInput.value = '';
    }
    if (this.passwordErrorMsg) {
      this.passwordErrorMsg.style.display = 'none';
    }
    this.toggleModal(this.passwordModal, true);
    setTimeout(() => this.adminPasswordInput?.focus(), 150);
  }

  togglePasswordVisibility() {
    if (!this.adminPasswordInput) return;
    const isPassword = this.adminPasswordInput.type === 'password';
    this.adminPasswordInput.type = isPassword ? 'text' : 'password';
    const icon = this.togglePasswordBtn?.querySelector('i');
    if (icon) {
      icon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    }
  }

  async submitPassword() {
    const entered = this.adminPasswordInput?.value || '';
    if (!entered.trim()) {
      if (this.passwordErrorMsg) {
        this.passwordErrorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter the password.';
        this.passwordErrorMsg.style.display = 'flex';
      }
      return;
    }

    const isValid = await window.galleryConfig.verifyPassword(entered);
    if (isValid) {
      if (this.rememberSessionCheck?.checked) {
        window.galleryConfig.setAdminUnlocked(true);
      }
      this.updateAdminUIState();
      this.toggleModal(this.passwordModal, false);
      this.showToast('Admin access unlocked!', 'success');
      this.openUploadStudio();
    } else {
      if (this.passwordErrorMsg) {
        this.passwordErrorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Incorrect password. Try default: admin123';
        this.passwordErrorMsg.style.display = 'flex';
      }
      const dialog = this.passwordModal?.querySelector('.modal-dialog');
      dialog?.classList.remove('shake');
      void dialog?.offsetWidth; // Trigger reflow for animation restart
      dialog?.classList.add('shake');
    }
  }

  lockAdminSession() {
    window.galleryConfig.setAdminUnlocked(false);
    this.updateAdminUIState();
    this.showToast('Admin session locked.', 'info');
  }

  /* ========================================================================
     Photo Upload Studio Logic
     ======================================================================== */
  openUploadStudio() {
    const config = window.galleryConfig.get();

    // Populate token if already saved
    if (this.uploadTokenInput) {
      this.uploadTokenInput.value = config.token || '';
    }

    this.toggleUploadTab('direct');
    this.resetUploadFile();
    this.toggleModal(this.uploadStudioModal, true);
  }

  toggleUploadTab(forceTab) {
    if (forceTab) {
      this.currentUploadTab = forceTab;
    } else {
      this.currentUploadTab = this.currentUploadTab === 'direct' ? 'guide' : 'direct';
    }

    if (this.currentUploadTab === 'direct') {
      if (this.uploadTabDirect) this.uploadTabDirect.style.display = 'block';
      if (this.uploadTabGuide) this.uploadTabGuide.style.display = 'none';
      if (this.switchTabBtnText) this.switchTabBtnText.textContent = 'Manual GitHub Guide';
      if (this.startUploadBtn && this.selectedUploadFile) this.startUploadBtn.style.display = 'inline-flex';
    } else {
      if (this.uploadTabDirect) this.uploadTabDirect.style.display = 'none';
      if (this.uploadTabGuide) this.uploadTabGuide.style.display = 'block';
      if (this.switchTabBtnText) this.switchTabBtnText.textContent = 'In-Browser Direct Upload';
      if (this.startUploadBtn) this.startUploadBtn.style.display = 'none';
    }
  }

  handleFileSelected(file) {
    if (!file) return;

    // Check valid image
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i)) {
      this.showToast('Please select a valid image file (JPG, PNG, WebP, GIF)', 'warning');
      return;
    }

    this.selectedUploadFile = file;

    // Show preview panel and hide dropzone
    if (this.uploadDropzone) this.uploadDropzone.style.display = 'none';
    if (this.uploadPreviewPanel) this.uploadPreviewPanel.style.display = 'flex';
    if (this.chooseAnotherFileBtn) this.chooseAnotherFileBtn.style.display = 'inline-flex';
    if (this.startUploadBtn) this.startUploadBtn.style.display = 'inline-flex';

    // Thumbnail Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.uploadImgPreview) this.uploadImgPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // File size badge
    if (this.previewFileSize) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      this.previewFileSize.textContent = `${mb} MB`;
    }

    // Auto-parse filename for title and category
    const parsed = window.gitHubGalleryAPI.parseFilename(file.name);
    if (this.uploadPhotoTitle) {
      this.uploadPhotoTitle.value = parsed.title;
    }

    if (this.uploadPhotoCategory) {
      // Find matching category option
      let found = false;
      Array.from(this.uploadPhotoCategory.options).forEach(opt => {
        if (opt.value.toLowerCase() === (parsed.category || '').toLowerCase()) {
          this.uploadPhotoCategory.value = opt.value;
          found = true;
        }
      });
      if (!found && parsed.category && parsed.category !== 'Photography') {
        this.uploadPhotoCategory.value = 'Custom';
        if (this.customCategoryGroup) this.customCategoryGroup.style.display = 'block';
        if (this.uploadCustomCategory) this.uploadCustomCategory.value = parsed.category;
      }
    }

    this.updateFilenamePreview();
  }

  resetUploadFile() {
    this.selectedUploadFile = null;
    if (this.photoFileInput) this.photoFileInput.value = '';
    if (this.uploadDropzone) this.uploadDropzone.style.display = 'flex';
    if (this.uploadPreviewPanel) this.uploadPreviewPanel.style.display = 'none';
    if (this.chooseAnotherFileBtn) this.chooseAnotherFileBtn.style.display = 'none';
    if (this.startUploadBtn) this.startUploadBtn.style.display = 'none';
    if (this.uploadProgressContainer) this.uploadProgressContainer.style.display = 'none';
  }

  updateFilenamePreview() {
    if (!this.destFilenamePreview) return;

    let cat = this.uploadPhotoCategory?.value || 'photo';
    if (cat === 'Custom' && this.uploadCustomCategory?.value.trim()) {
      cat = this.uploadCustomCategory.value.trim();
    }

    const title = this.uploadPhotoTitle?.value.trim() || 'untitled';
    const originalExt = this.selectedUploadFile
      ? this.selectedUploadFile.name.substring(this.selectedUploadFile.name.lastIndexOf('.')).toLowerCase()
      : '.jpg';

    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const cleanCat = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `${cleanCat}-${cleanTitle}${originalExt}`;

    const config = window.galleryConfig.get();
    const folder = config.folder || 'photos';
    this.destFilenamePreview.textContent = `${folder}/${filename}`;
  }

  async executePhotoUpload() {
    if (!this.selectedUploadFile) {
      this.showToast('Please select a photo first', 'warning');
      return;
    }

    const title = this.uploadPhotoTitle?.value.trim();
    if (!title) {
      this.showToast('Please provide a photo title', 'warning');
      this.uploadPhotoTitle?.focus();
      return;
    }

    let category = this.uploadPhotoCategory?.value || 'Photography';
    if (category === 'Custom') {
      category = this.uploadCustomCategory?.value.trim() || 'Photography';
    }

    const token = this.uploadTokenInput?.value.trim();
    const config = window.galleryConfig.get();

    if (!token && !config.token) {
      this.showToast('Please enter your GitHub Personal Access Token to commit photos directly', 'warning');
      this.uploadTokenInput?.focus();
      return;
    }

    // Save token if user provided one
    if (token && token !== config.token) {
      window.galleryConfig.saveConfig({ token });
    }

    // Show progress UI
    if (this.uploadProgressContainer) this.uploadProgressContainer.style.display = 'flex';
    if (this.uploadProgressBar) this.uploadProgressBar.style.width = '20%';
    if (this.uploadStatusText) this.uploadStatusText.textContent = 'Reading & encoding image...';
    if (this.startUploadBtn) this.startUploadBtn.disabled = true;

    try {
      if (this.uploadProgressBar) this.uploadProgressBar.style.width = '60%';
      if (this.uploadStatusText) this.uploadStatusText.textContent = 'Committing photo to GitHub repository...';

      const result = await window.gitHubGalleryAPI.uploadPhotoToGitHub({
        file: this.selectedUploadFile,
        category: category,
        title: title,
        token: token || config.token
      });

      if (this.uploadProgressBar) this.uploadProgressBar.style.width = '100%';
      if (this.uploadStatusText) this.uploadStatusText.textContent = 'Successfully uploaded!';

      this.showToast(`Uploaded "${result.filename}" to GitHub!`, 'success', 5000);

      // Close modal and refresh gallery
      setTimeout(() => {
        if (this.startUploadBtn) this.startUploadBtn.disabled = false;
        this.toggleModal(this.uploadStudioModal, false);
        this.resetUploadFile();
        this.loadGallery();
      }, 900);

    } catch (err) {
      console.error('Photo Upload Error:', err);
      if (this.uploadProgressContainer) this.uploadProgressContainer.style.display = 'none';
      if (this.startUploadBtn) this.startUploadBtn.disabled = false;
      this.showToast(err.message, 'error', 6000);
    }
  }


  /* ========================================================================
     Toast Notification System
     ======================================================================== */
  showToast(message, type = 'info', duration = 3000) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';
    if (type === 'error') iconClass = 'fa-solid fa-circle-xmark';

    toast.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.galleryApp = new LuminaGalleryApp();
});
