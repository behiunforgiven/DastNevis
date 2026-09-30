/**
 * Shortcuts Module
 * Allows users to define custom site shortcuts, edit, delete, reorder,
 * and choose icons/favicons with full Chrome storage persistence.
 */

const Shortcuts = (() => {
  const STORAGE_KEY = 'dastnevis_shortcuts_v1';

  // Default presets inspired by the preview
  const DEFAULT_SHORTCUTS = [
    {
      id: 'sc-1',
      title: 'یوتیوب',
      url: 'https://youtube.com',
      iconType: 'preset',
      iconKey: 'youtube',
      bgColor: '#dc2626'
    },
    {
      id: 'sc-2',
      title: 'پوشه مالی',
      url: 'https://emofid.com',
      iconType: 'preset',
      iconKey: 'finance',
      bgColor: '#0284c7'
    },
    {
      id: 'sc-3',
      title: 'توییتر',
      url: 'https://x.com',
      iconType: 'preset',
      iconKey: 'twitter',
      bgColor: '#0ea5e9'
    },
    {
      id: 'sc-4',
      title: 'نوشن',
      url: 'https://notion.so',
      iconType: 'preset',
      iconKey: 'notion',
      bgColor: '#334155'
    },
    {
      id: 'sc-5',
      title: 'شاواز',
      url: 'https://shavaz.com',
      iconType: 'preset',
      iconKey: 'store',
      bgColor: '#ec4899'
    },
    {
      id: 'sc-6',
      title: 'دستیار هوش مصنوعی',
      url: 'https://chatgpt.com',
      iconType: 'preset',
      iconKey: 'ai',
      bgColor: '#8b5cf6'
    }
  ];

  const PRESET_SVGS = {
    youtube: `<svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    notion: `<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.053-.607L3.107 2.388c-.466.047-.56.327-.373.513zm-.14 3.732v13.623c0 .84.42 1.12 1.167.793l14.429-8.4c.56-.327.933-.047.933.606v-13.67c0-.84-.373-1.12-1.073-.747zm13.122 1.493c.14.7.14 1.353-.42 1.68l-6.907 4.013v-5.693l6.02-3.453c.887-.514 1.12-.14 1.307.753z"/></svg>`,
    ai: `<svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" fill="#fde047"/><path d="M19 16L20.2 18.8L23 20L20.2 21.2L19 24L17.8 21.2L15 20L17.8 18.8L19 16Z" fill="#38bdf8"/><path d="M5 16L6.2 18.8L9 20L6.2 21.2L5 24L3.8 21.2L1 20L3.8 18.8L5 16Z" fill="#a78bfa"/></svg>`,
    finance: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><circle cx="12" cy="14" r="2"/></svg>`,
    store: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    github: `<svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
    google: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>`,
    telegram: `<svg viewBox="0 0 24 24" width="26" height="26" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.196 1.006.128.832.942z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`
  };

  /**
   * Loads shortcuts from Chrome storage or fallback localStorage
   */
  async function loadShortcuts() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          if (result && result[STORAGE_KEY] && Array.isArray(result[STORAGE_KEY]) && result[STORAGE_KEY].length > 0) {
            resolve(result[STORAGE_KEY]);
          } else {
            resolve(DEFAULT_SHORTCUTS);
          }
        });
      } else {
        try {
          const item = localStorage.getItem(STORAGE_KEY);
          if (item) {
            resolve(JSON.parse(item));
          } else {
            resolve(DEFAULT_SHORTCUTS);
          }
        } catch {
          resolve(DEFAULT_SHORTCUTS);
        }
      }
    });
  }

  /**
   * Saves shortcuts list
   */
  async function saveShortcuts(shortcutsList) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [STORAGE_KEY]: shortcutsList }, () => {
          resolve(true);
        });
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcutsList));
        } catch (e) {
          console.error(e);
        }
        resolve(true);
      }
    });
  }

  /**
   * Extracts favicon URL using Google's Favicon Service
   */
  function getFaviconUrl(url) {
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
    } catch {
      return '';
    }
  }

  /**
   * Renders shortcut icon based on type
   */
  function renderShortcutIcon(sc) {
    if (sc.iconType === 'preset' && PRESET_SVGS[sc.iconKey]) {
      return PRESET_SVGS[sc.iconKey];
    }
    if (sc.iconType === 'emoji') {
      return `<span class="shortcut-emoji">${sc.emoji || '🔗'}</span>`;
    }
    // Favicon mode
    const favUrl = sc.faviconUrl || getFaviconUrl(sc.url);
    return `<img class="shortcut-favicon" src="${favUrl}" alt="${sc.title}" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=\\'shortcut-emoji\\'>🌐</span>'"/>`;
  }

  return {
    DEFAULT_SHORTCUTS,
    PRESET_SVGS,
    loadShortcuts,
    saveShortcuts,
    getFaviconUrl,
    renderShortcutIcon
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Shortcuts;
}
