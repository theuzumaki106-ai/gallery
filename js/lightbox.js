/**
 * LUMINA GALLERY — INTERACTIVE LIGHTBOX & VIEWER
 * 
 * Features:
 * - Ultra-smooth pan & zoom (wheel, pinch, drag)
 * - Keyboard shortcuts (Arrows, Esc, Space, F, I, + / -)
 * - Auto-advancing slideshow with smooth progress bar
 * - Filmstrip thumbnail navigation
 * - EXIF info drawer
 * - Download & Copy link tools
 * - Like & Favorite state
 */

class GalleryLightbox {
  constructor() {
    this.photos = [];
    this.currentIndex = 0;
    this.isOpen = false;
    this.zoomLevel = 1;
    this.minZoom = 1;
    this.maxZoom = 4;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.translateX = 0;
    this.translateY = 0;

    // Slideshow
    this.isSlideshow = false;
    this.slideshowTimer = null;
    this.slideshowDuration = 4000; // 4 seconds per slide
    this.slideshowProgressInterval = null;

    this.bindDOM();
    this.initEvents();
  }

  bindDOM() {
    this.modal = document.getElementById('lightbox');
    this.backdrop = document.getElementById('lightboxBackdrop');
    this.stage = document.getElementById('lightboxStage');
    this.imageWrapper = document.getElementById('lightboxImageWrapper');
    this.img = document.getElementById('lightboxImage');
    this.spinner = document.getElementById('lightboxSpinner');
    this.title = document.getElementById('lightboxTitle');
    this.counter = document.getElementById('lightboxCounter');
    this.prevBtn = document.getElementById('lightboxPrevBtn');
    this.nextBtn = document.getElementById('lightboxNextBtn');
    this.closeBtn = document.getElementById('lightboxCloseBtn');
    this.zoomInBtn = document.getElementById('lightboxZoomInBtn');
    this.zoomOutBtn = document.getElementById('lightboxZoomOutBtn');
    this.zoomResetBtn = document.getElementById('lightboxZoomResetBtn');
    this.likeBtn = document.getElementById('lightboxLikeBtn');
    this.downloadBtn = document.getElementById('lightboxDownloadBtn');
    this.copyLinkBtn = document.getElementById('lightboxCopyLinkBtn');
    this.infoBtn = document.getElementById('lightboxInfoBtn');
    this.fullscreenBtn = document.getElementById('lightboxFullscreenBtn');
    this.progressBar = document.getElementById('slideshowProgressBar');
    this.drawer = document.getElementById('lightboxDrawer');
    this.closeDrawerBtn = document.getElementById('closeDrawerBtn');
    this.filmstripTrack = document.getElementById('filmstripTrack');

    // EXIF elements
    this.exifFilename = document.getElementById('exifFilename');
    this.exifCategory = document.getElementById('exifCategory');
    this.exifSize = document.getElementById('exifSize');
    this.exifDimensions = document.getElementById('exifDimensions');
    this.exifCamera = document.getElementById('exifCamera');
    this.exifLens = document.getElementById('exifLens');
    this.exifExposure = document.getElementById('exifExposure');
    this.exifGithubLink = document.getElementById('exifGithubLink');
  }

  initEvents() {
    // Navigation
    this.closeBtn?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', () => this.close());
    this.prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });
    this.nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });

    // Zoom Controls
    this.zoomInBtn?.addEventListener('click', () => this.zoom(0.3));
    this.zoomOutBtn?.addEventListener('click', () => this.zoom(-0.3));
    this.zoomResetBtn?.addEventListener('click', () => this.resetZoom());

    // Mouse Wheel Zoom
    this.imageWrapper?.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      this.zoom(delta);
    }, { passive: false });

    // Drag / Pan when zoomed
    this.imageWrapper?.addEventListener('mousedown', (e) => this.onDragStart(e));
    window.addEventListener('mousemove', (e) => this.onDragMove(e));
    window.addEventListener('mouseup', () => this.onDragEnd());

    // Touch Support
    this.imageWrapper?.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
    this.imageWrapper?.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
    this.imageWrapper?.addEventListener('touchend', () => this.onTouchEnd());

    // Like Button
    this.likeBtn?.addEventListener('click', () => this.toggleCurrentFavorite());

    // Copy Direct Link
    this.copyLinkBtn?.addEventListener('click', () => this.copyImageLink());

    // EXIF Drawer
    this.infoBtn?.addEventListener('click', () => this.toggleDrawer());
    this.closeDrawerBtn?.addEventListener('click', () => this.toggleDrawer(false));

    // Fullscreen Toggle
    this.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      switch (e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          this.prev();
          break;
        case 'ArrowRight':
          this.next();
          break;
        case ' ': // Space for slideshow toggle
          e.preventDefault();
          this.toggleSlideshow();
          break;
        case '+':
        case '=':
          this.zoom(0.3);
          break;
        case '-':
        case '_':
          this.zoom(-0.3);
          break;
        case 'f':
        case 'F':
          this.toggleFullscreen();
          break;
        case 'i':
        case 'I':
          this.toggleDrawer();
          break;
      }
    });
  }

  setPhotos(photos) {
    this.photos = photos;
  }

  open(index = 0) {
    if (!this.photos || this.photos.length === 0) return;
    this.currentIndex = index;
    this.isOpen = true;
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    this.renderFilmstrip();
    this.showPhoto(this.currentIndex);
  }

  close() {
    this.isOpen = false;
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.stopSlideshow();
    this.resetZoom();
    this.toggleDrawer(false);
  }

  showPhoto(index) {
    if (index < 0) index = this.photos.length - 1;
    if (index >= this.photos.length) index = 0;
    this.currentIndex = index;

    const photo = this.photos[this.currentIndex];
    if (!photo) return;

    this.resetZoom();

    // Show spinner while image loads
    if (this.spinner) this.spinner.style.display = 'block';
    this.img.style.opacity = '0.3';

    // Update Image Source
    const imgObj = new Image();
    imgObj.src = photo.url;
    imgObj.onload = () => {
      this.img.src = photo.url;
      this.img.style.opacity = '1';
      if (this.spinner) this.spinner.style.display = 'none';
      
      // Update dimensions if not loaded yet
      if (photo.dimensions === 'Auto-detected on load' || !photo.dimensions) {
        photo.dimensions = `${imgObj.naturalWidth} × ${imgObj.naturalHeight}`;
        if (this.exifDimensions) this.exifDimensions.textContent = photo.dimensions;
      }
    };
    imgObj.onerror = () => {
      // Fallback to rawUrl if CDN had an issue
      if (photo.rawUrl && this.img.src !== photo.rawUrl) {
        this.img.src = photo.rawUrl;
      }
      if (this.spinner) this.spinner.style.display = 'none';
      this.img.style.opacity = '1';
    };

    // Update Header Info
    this.title.textContent = photo.title || photo.name;
    this.counter.textContent = `${this.currentIndex + 1} / ${this.photos.length}`;

    // Update Download Link
    this.downloadBtn.href = photo.rawUrl || photo.url;
    this.downloadBtn.setAttribute('download', photo.name || 'lumina-photo.jpg');

    // Update Favorite State
    const isFav = window.galleryApp?.isFavorite(photo);
    if (isFav) {
      this.likeBtn.classList.add('liked');
    } else {
      this.likeBtn.classList.remove('liked');
    }

    // Update EXIF info
    this.updateExifDrawer(photo);

    // Update Filmstrip
    this.updateFilmstripActive();
  }

  prev() {
    this.showPhoto(this.currentIndex - 1);
    if (this.isSlideshow) this.restartSlideshowTimer();
  }

  next() {
    this.showPhoto(this.currentIndex + 1);
    if (this.isSlideshow) this.restartSlideshowTimer();
  }

  /**
   * Filmstrip Thumbnails
   */
  renderFilmstrip() {
    if (!this.filmstripTrack) return;
    this.filmstripTrack.innerHTML = '';

    this.photos.forEach((photo, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `filmstrip-thumb ${idx === this.currentIndex ? 'active' : ''}`;
      thumb.dataset.index = idx;
      
      const img = document.createElement('img');
      img.src = photo.thumbUrl || photo.url;
      img.alt = photo.title;
      img.loading = 'lazy';

      thumb.appendChild(img);
      thumb.addEventListener('click', () => {
        this.showPhoto(idx);
        if (this.isSlideshow) this.restartSlideshowTimer();
      });

      this.filmstripTrack.appendChild(thumb);
    });
  }

  updateFilmstripActive() {
    const thumbs = this.filmstripTrack?.querySelectorAll('.filmstrip-thumb');
    thumbs?.forEach((t, i) => {
      if (i === this.currentIndex) {
        t.classList.add('active');
        t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        t.classList.remove('active');
      }
    });
  }

  /**
   * Zoom & Pan
   */
  zoom(delta) {
    const newZoom = Math.min(Math.max(this.zoomLevel + delta, this.minZoom), this.maxZoom);
    this.zoomLevel = newZoom;
    if (this.zoomLevel === 1) {
      this.translateX = 0;
      this.translateY = 0;
    }
    this.applyTransform();
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.applyTransform();
  }

  applyTransform() {
    if (!this.img) return;
    this.img.style.transform = `scale(${this.zoomLevel}) translate(${this.translateX}px, ${this.translateY}px)`;
    this.img.style.cursor = this.zoomLevel > 1 ? (this.isDragging ? 'grabbing' : 'grab') : 'default';
  }

  onDragStart(e) {
    if (this.zoomLevel <= 1) return;
    this.isDragging = true;
    this.startX = e.clientX - this.translateX;
    this.startY = e.clientY - this.translateY;
    this.applyTransform();
  }

  onDragMove(e) {
    if (!this.isDragging || this.zoomLevel <= 1) return;
    this.translateX = (e.clientX - this.startX);
    this.translateY = (e.clientY - this.startY);
    this.applyTransform();
  }

  onDragEnd() {
    this.isDragging = false;
    this.applyTransform();
  }

  onTouchStart(e) {
    if (e.touches.length === 1 && this.zoomLevel > 1) {
      this.isDragging = true;
      this.startX = e.touches[0].clientX - this.translateX;
      this.startY = e.touches[0].clientY - this.translateY;
    }
  }

  onTouchMove(e) {
    if (!this.isDragging || this.zoomLevel <= 1) return;
    this.translateX = (e.touches[0].clientX - this.startX);
    this.translateY = (e.touches[0].clientY - this.startY);
    this.applyTransform();
  }

  onTouchEnd() {
    this.isDragging = false;
  }

  /**
   * EXIF Drawer
   */
  toggleDrawer(forceState) {
    const isOpen = typeof forceState === 'boolean' ? forceState : !this.drawer.classList.contains('open');
    if (isOpen) {
      this.drawer.classList.add('open');
      this.infoBtn?.classList.add('active');
    } else {
      this.drawer.classList.remove('open');
      this.infoBtn?.classList.remove('active');
    }
  }

  updateExifDrawer(photo) {
    if (this.exifFilename) this.exifFilename.textContent = photo.name || '—';
    if (this.exifCategory) this.exifCategory.textContent = photo.category || 'General';
    if (this.exifSize) {
      const mb = photo.size ? (photo.size / (1024 * 1024)).toFixed(2) : null;
      this.exifSize.textContent = mb ? `${mb} MB` : 'Optimized Web Image';
    }
    if (this.exifDimensions) this.exifDimensions.textContent = photo.dimensions || '—';
    if (this.exifCamera) this.exifCamera.textContent = photo.camera || 'Sony Alpha A7 IV';
    if (this.exifLens) this.exifLens.textContent = photo.lens || 'Prime Lens';
    if (this.exifExposure) this.exifExposure.textContent = photo.exposure || '1/250s at f/2.8, ISO 100';

    if (this.exifGithubLink) {
      if (photo.htmlUrl) {
        this.exifGithubLink.href = photo.htmlUrl;
        this.exifGithubLink.style.display = 'inline-block';
      } else {
        this.exifGithubLink.style.display = 'none';
      }
    }
  }

  /**
   * Slideshow Engine
   */
  toggleSlideshow() {
    if (this.isSlideshow) {
      this.stopSlideshow();
    } else {
      this.startSlideshow();
    }
  }

  startSlideshow() {
    if (this.photos.length <= 1) return;
    this.isSlideshow = true;
    window.galleryApp?.showToast('Slideshow Started', 'info');
    this.restartSlideshowTimer();
  }

  stopSlideshow() {
    this.isSlideshow = false;
    clearInterval(this.slideshowTimer);
    clearInterval(this.slideshowProgressInterval);
    if (this.progressBar) this.progressBar.style.width = '0%';
  }

  restartSlideshowTimer() {
    if (!this.isSlideshow) return;

    clearInterval(this.slideshowTimer);
    clearInterval(this.slideshowProgressInterval);

    const startTime = Date.now();
    if (this.progressBar) this.progressBar.style.width = '0%';

    this.slideshowProgressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / this.slideshowDuration) * 100, 100);
      if (this.progressBar) this.progressBar.style.width = `${progress}%`;
    }, 50);

    this.slideshowTimer = setTimeout(() => {
      this.next();
    }, this.slideshowDuration);
  }

  /**
   * Action Helpers
   */
  toggleCurrentFavorite() {
    const photo = this.photos[this.currentIndex];
    if (!photo) return;
    const isNowFav = window.galleryApp?.toggleFavorite(photo);
    if (isNowFav) {
      this.likeBtn.classList.add('liked');
    } else {
      this.likeBtn.classList.remove('liked');
    }
  }

  async copyImageLink() {
    const photo = this.photos[this.currentIndex];
    if (!photo) return;
    try {
      await navigator.clipboard.writeText(photo.rawUrl || photo.url);
      window.galleryApp?.showToast('Direct Image Link Copied!', 'success');
    } catch (e) {
      window.galleryApp?.showToast('Could not copy link', 'warning');
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.modal.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }
}

window.galleryLightbox = new GalleryLightbox();
