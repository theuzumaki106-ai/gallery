/**
 * LUMINA GALLERY — GITHUB API CONNECTOR & AUTO-SYNC
 * 
 * Automatically lists photos from GitHub Repository using:
 * 1. Pre-generated photos.json (if GitHub Action is enabled)
 * 2. GitHub REST API Contents endpoint (https://api.github.com/repos/:owner/:repo/contents/:path)
 * 3. jsDelivr Edge CDN for fast global image loading and caching
 */

class GitHubGalleryAPI {
  constructor() {
    this.validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'];
    this.cacheKeyPrefix = 'lumina_cache_';
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Main entry to fetch all photos
   */
  async getPhotos() {
    const config = window.galleryConfig.get();

    // 1. If explicitly in Demo mode, load sample dataset
    if (config.isDemo || !config.username || !config.repo) {
      return this.fetchSamplePhotos();
    }

    // 2. Try loading pre-built photos.json first (instant, 0 API limits)
    try {
      const prebuiltPhotos = await this.fetchPrebuiltIndex(config);
      if (prebuiltPhotos && prebuiltPhotos.length > 0) {
        return prebuiltPhotos;
      }
    } catch (e) {
      console.info('Prebuilt photos.json not found, falling back to GitHub Contents API');
    }

    // 3. Fetch dynamically via GitHub REST API
    return this.fetchFromGitHubAPI(config);
  }

  /**
   * Fetch sample photos for offline or demo use
   */
  async fetchSamplePhotos() {
    // 1. Direct memory fallback (Works 100% on file:// URLs without CORS blocking)
    if (window.LUMINA_SAMPLE_PHOTOS && Array.isArray(window.LUMINA_SAMPLE_PHOTOS) && window.LUMINA_SAMPLE_PHOTOS.length > 0) {
      return [...window.LUMINA_SAMPLE_PHOTOS];
    }

    // 2. Fetch from local JSON file if running on a web server
    try {
      const response = await fetch('photos/sample-photos.json');
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Could not fetch sample-photos.json', err);
    }

    return [];
  }


  /**
   * Attempt to fetch pre-built photos.json from the repository
   */
  async fetchPrebuiltIndex(config) {
    const jsonUrl = `https://raw.githubusercontent.com/${config.username}/${config.repo}/${config.branch}/photos.json`;
    const response = await fetch(jsonUrl, { cache: 'no-cache' });
    if (!response.ok) return null;
    return await response.json();
  }

  /**
   * Query GitHub REST API Contents Endpoint
   */
  async fetchFromGitHubAPI(config) {
    const cacheKey = `${this.cacheKeyPrefix}${config.username}_${config.repo}_${config.folder}`;
    const cached = this.getCache(cacheKey);

    if (cached) {
      return cached;
    }

    const folderPath = encodeURIComponent(config.folder || 'photos');
    const apiUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${folderPath}?ref=${config.branch}`;

    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };

    if (config.token) {
      headers['Authorization'] = `token ${config.token}`;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Folder "${config.folder}" not found in repository "${config.username}/${config.repo}". Make sure the folder exists and has photos!`);
      } else if (response.status === 403) {
        throw new Error('GitHub API rate limit reached (60 requests/hour). Add an optional GitHub Token in Settings to raise it to 5,000/hr, or enable the GitHub Action.');
      }
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    const files = await response.json();

    if (!Array.isArray(files)) {
      throw new Error('Expected a directory listing from GitHub API');
    }

    // Filter only image files
    const imageFiles = files.filter(file => {
      if (file.type !== 'file') return false;
      const lowerName = file.name.toLowerCase();
      return this.validExtensions.some(ext => lowerName.endsWith(ext));
    });

    // Map into standardized photo objects
    const photos = imageFiles.map((file, index) => {
      const parsed = this.parseFilename(file.name);
      
      // Fast CDN delivery via jsDelivr (Edge CDN with worldwide caching)
      const cdnUrl = `https://cdn.jsdelivr.net/gh/${config.username}/${config.repo}@${config.branch}/${file.path}`;
      const rawUrl = file.download_url || cdnUrl;

      return {
        id: file.sha || `photo-${index}`,
        name: file.name,
        title: parsed.title,
        category: parsed.category,
        url: cdnUrl,
        rawUrl: rawUrl,
        thumbUrl: cdnUrl,
        size: file.size,
        path: file.path,
        htmlUrl: file.html_url,
        date: new Date().toISOString().split('T')[0],
        camera: 'Camera Info Available in EXIF',
        lens: 'Standard Optics',
        exposure: 'Standard Auto',
        dimensions: 'Auto-detected on load'
      };
    });

    this.setCache(cacheKey, photos);
    return photos;
  }

  /**
   * Smart Category & Title Extraction from File Name
   * Example filenames:
   * "nature-mountain-peak.jpg"  -> Category: "Nature", Title: "Mountain Peak"
   * "[Travel] Kyoto Temple.png" -> Category: "Travel", Title: "Kyoto Temple"
   * "street_rainy_walk.webp"    -> Category: "Street", Title: "Rainy Walk"
   * "IMG_20261018.jpg"          -> Category: "General", Title: "Photo Oct 18, 2026"
   */
  parseFilename(filename) {
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    
    let category = 'Photography';
    let title = nameWithoutExt;

    // Check for bracket category: "[Travel] Japan Sunset"
    const bracketMatch = nameWithoutExt.match(/^\[(.*?)\]\s*(.*)$/);
    if (bracketMatch) {
      category = this.capitalize(bracketMatch[1].trim());
      title = bracketMatch[2].trim();
    } else {
      // Check for delimiter prefix: "nature-something" or "nature_something"
      const parts = nameWithoutExt.split(/[-_]/);
      if (parts.length > 1) {
        const potentialCat = parts[0].toLowerCase();
        const commonCategories = ['anime', 'sketches', 'art', 'illustration', 'nature', 'street', 'architecture', 'portraits', 'travel', 'landscape', 'minimalism', 'wildlife', 'macro', 'urban', 'night', 'abstract'];
        
        if (commonCategories.includes(potentialCat)) {
          category = this.capitalize(potentialCat);
          title = parts.slice(1).join(' ');
        }

      }
    }

    // Clean up title: replace hyphens/underscores with spaces & capitalize
    title = title.replace(/[-_]+/g, ' ').trim();
    title = this.capitalizeWords(title);

    // If title is just an generic camera code like "IMG 4022", give it a readable name
    if (/^(img|dsc|dji|pxl|pic)\s*\d+$/i.test(title)) {
      title = `Capture ${title.toUpperCase()}`;
    }

    return { category, title };
  }

  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  capitalizeWords(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Cache helpers
   */
  getCache(key) {
    try {
      const itemStr = sessionStorage.getItem(key);
      if (!itemStr) return null;
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        sessionStorage.removeItem(key);
        return null;
      }
      if (!Array.isArray(item.data) || item.data.length === 0) {
        sessionStorage.removeItem(key);
        return null;
      }
      return item.data;
    } catch (e) {
      return null;
    }
  }


  setCache(key, data) {
    try {
      const payload = {
        data: data,
        expiry: Date.now() + this.cacheDuration
      };
      sessionStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not cache photos', e);
    }
  }

  /**
   * Helper: Convert File object to pure Base64 string
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Result format: "data:image/jpeg;base64,iVBORw0KGgo..."
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload Photo directly to GitHub Repository via Contents API
   */
  async uploadPhotoToGitHub({ file, category = 'Photography', title = '', token = '' }) {
    const config = window.galleryConfig.get();

    if (!config.username || !config.repo) {
      throw new Error('Please configure your GitHub Username and Repository name first in Settings.');
    }

    const authToken = token || config.token;
    if (!authToken) {
      throw new Error('GitHub Personal Access Token is required to upload directly. Please enter a token.');
    }

    // Determine target file name
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() || '.jpg';
    const cleanTitle = (title || file.name.substring(0, file.name.lastIndexOf('.')))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const cleanCat = (category || 'photo').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalFilename = `${cleanCat}-${cleanTitle}${ext}`;

    const folder = config.folder || 'photos';
    const filePath = `${folder}/${finalFilename}`;
    const apiUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${filePath}`;

    // Convert file to Base64
    const base64Content = await this.fileToBase64(file);

    // Check if file already exists to obtain its sha for updating
    let existingSha = null;
    try {
      const checkRes = await fetch(`${apiUrl}?ref=${config.branch}`, {
        headers: {
          'Authorization': `token ${authToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (checkRes.ok) {
        const fileMeta = await checkRes.json();
        existingSha = fileMeta.sha;
      }
    } catch (e) {
      // If check fails or 404, proceed as new file
    }

    const commitPayload = {
      message: `Upload photo: ${finalFilename} via Lumina Gallery [skip ci]`,
      content: base64Content,
      branch: config.branch || 'main'
    };

    if (existingSha) {
      commitPayload.sha = existingSha;
    }

    const uploadRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${authToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commitPayload)
    });

    if (!uploadRes.ok) {
      const errJson = await uploadRes.json().catch(() => ({}));
      if (uploadRes.status === 401 || uploadRes.status === 403) {
        throw new Error('GitHub Authorization Failed: Verify your Personal Access Token has "repo" or "Contents: Write" permissions.');
      }
      throw new Error(errJson.message || `Upload failed with HTTP ${uploadRes.status}`);
    }

    // Invalidate local cache so new image loads immediately
    this.clearCache();

    return {
      success: true,
      filename: finalFilename,
      path: filePath,
      data: await uploadRes.json()
    };
  }

  clearCache() {
    sessionStorage.clear();
  }
}

window.gitHubGalleryAPI = new GitHubGalleryAPI();

