/**
 * LUMINA GALLERY — CONFIGURATION & AUTO-DETECTION
 * 
 * Automatically detects repository info when hosted on GitHub Pages:
 * https://<username>.github.io/<repo-name>/
 */

const CONFIG_STORAGE_KEY = 'lumina_gallery_config';

// Default configuration
const defaultConfig = {
  // If hosted on GitHub Pages, these will auto-detect if left blank
  username: '',
  repo: '',
  folder: 'photos',
  branch: 'main',
  token: '', // Personal access token with repo/contents:write permission for direct uploads
  title: 'Captured Moments',
  isDemo: false,
  // SHA-256 hash of default password 'admin123'
  adminPasswordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
};

class GalleryConfig {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    let cfg = saved ? JSON.parse(saved) : { ...defaultConfig };

    // Ensure adminPasswordHash exists in config
    if (!cfg.adminPasswordHash) {
      cfg.adminPasswordHash = defaultConfig.adminPasswordHash;
    }

    // Auto-detect GitHub Pages URL if username and repo aren't explicitly saved
    if (!cfg.username || !cfg.repo) {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;

      if (hostname.endsWith('.github.io')) {
        cfg.username = hostname.split('.')[0];
        
        const pathSegments = pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          cfg.repo = pathSegments[0];
        }
      }
    }

    // If still no repo configured (e.g. running on localhost or file:///), flag as demo
    if (!cfg.username || !cfg.repo) {
      cfg.isDemo = true;
    }

    return cfg;
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig, isDemo: false };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    return this.config;
  }

  resetToDemo() {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    this.config = { ...defaultConfig, isDemo: true };
    return this.config;
  }

  get() {
    return this.config;
  }

  /**
   * Cryptographic SHA-256 Hash
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify password against saved hash
   */
  async verifyPassword(password) {
    const hashed = await this.hashPassword(password);
    return hashed === this.config.adminPasswordHash;
  }

  /**
   * Change admin password
   */
  async updatePassword(newPassword) {
    const hashed = await this.hashPassword(newPassword);
    this.config.adminPasswordHash = hashed;
    this.saveConfig({ adminPasswordHash: hashed });
    return true;
  }

  /**
   * Admin Session state in sessionStorage
   */
  isAdminUnlocked() {
    return sessionStorage.getItem('lumina_admin_unlocked') === 'true';
  }

  setAdminUnlocked(status = true) {
    if (status) {
      sessionStorage.setItem('lumina_admin_unlocked', 'true');
    } else {
      sessionStorage.removeItem('lumina_admin_unlocked');
    }
  }
}

window.galleryConfig = new GalleryConfig();

