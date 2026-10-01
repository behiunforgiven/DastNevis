/**
 * Main Application Orchestrator for Dastnevis New Tab Extension
 */

const App = (() => {
  let shortcutsList = [];
  let todosList = [];
  let currentCity = Weather.DEFAULT_CITIES[0]; // Tehran
  let userSettings = {
    usePersianDigits: true,
    timeFormat24: true,
    wallpaper: 'assets/images/bg-nature.jpg',
    glassBlur: 16,
    searchEngine: 'google'
  };

  const SEARCH_ENGINES = {
    google: { name: 'گوگل', url: 'https://www.google.com/search?q=' },
    youtube: { name: 'یوتیوب', url: 'https://www.youtube.com/results?search_query=' },
    bing: { name: 'بینگ', url: 'https://www.bing.com/search?q=' },
    duckduckgo: { name: 'داک‌داک‌گو', url: 'https://duckduckgo.com/?q=' },
    digikala: { name: 'دیجی‌کالا', url: 'https://www.digikala.com/search/?q=' },
    torob: { name: 'ترب', url: 'https://torob.com/search/?query=' },
    chatgpt: { name: 'هوش مصنوعی', url: 'https://chatgpt.com/?q=' }
  };

  function init() {
    loadSettings();
    applyWallpaper(userSettings.wallpaper);

    // Initialize Global Modal Listeners (Backdrop click, Close buttons, Escape key)
    initGlobalModalListeners();

    // Initialize Clock & Date (Instant synchronous)
    initClock();

    // Initialize Calendar (Instant synchronous - 0ms delay!)
    CalendarUI.init();

    // Initialize Shortcuts (Instant synchronous render from cache, then background sync)
    initShortcuts();

    // Initialize To-Dos (Instant synchronous render from cache, then background sync)
    initTodos();

    // Initialize Music Player (Instant synchronous)
    initMusicPlayer();

    // Initialize Search (Instant synchronous)
    initSearch();

    // Initialize Sidebar & Modals (Instant synchronous)
    initSidebarAndModals();

    // Initialize Weather in background (Instant cache display, non-blocking network fetch)
    initWeather();
  }

  /* ------------------- SETTINGS ------------------- */
  function loadSettings() {
    try {
      const stored = localStorage.getItem('dastnevis_settings');
      if (stored) {
        userSettings = { ...userSettings, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem('dastnevis_settings', JSON.stringify(userSettings));
    } catch {
      // ignore
    }
  }

  function applyWallpaper(wpUrl) {
    document.body.style.backgroundImage = `url('${wpUrl}')`;
  }

  /* ------------------- CLOCK & EVENTS ------------------- */
  function initClock() {
    function update() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      if (!userSettings.timeFormat24) {
        hours = hours % 12 || 12;
      }
      const hStr = String(hours).padStart(2, '0');

      const clockEl = document.getElementById('digital-clock');
      if (clockEl) {
        const timeFormatted = userSettings.usePersianDigits
          ? `${Jalali.toPersianDigits(hStr)}:${Jalali.toPersianDigits(minutes)}`
          : `${hStr}:${minutes}`;
        clockEl.textContent = timeFormatted;
      }

      // Today's Persian Date in Header
      const today = Jalali.getToday();
      const dateEl = document.getElementById('header-persian-date');
      if (dateEl) {
        dateEl.textContent = userSettings.usePersianDigits
          ? today.persianShort
          : `${today.jd} ${today.monthName}`;
      }

      const dateSubEl = document.getElementById('header-sub-date');
      if (dateSubEl) {
        dateSubEl.textContent = `${today.gregorian.short} | ${today.hijri.formatted}`;
      }
    }

    update();
    setInterval(update, 1000);

    // Populate Today's Events in Card
    renderTodayEvents();
  }

  function renderTodayEvents() {
    const today = Jalali.getToday();
    const listEl = document.getElementById('today-occasions-list');
    if (!listEl) return;

    listEl.innerHTML = '';

    const events = [];
    if (today.occasion) {
      events.push(today.occasion);
    }
    // Authentic Persian day-to-day contextual items
    events.push('ددلاین ارسال تسک‌ها');
    events.push('پیگیری پروژه‌های در جریان');

    events.forEach(item => {
      const li = document.createElement('li');
      li.className = 'occasion-item';
      li.innerHTML = `<span class="bullet">•</span> <span>${item}</span>`;
      listEl.appendChild(li);
    });
  }

  /* ------------------- WEATHER ------------------- */
  async function initWeather() {
    const cityEl = document.getElementById('weather-city-name');
    const tempEl = document.getElementById('weather-temp');
    const commentEl = document.getElementById('weather-comment');
    const iconContainer = document.getElementById('weather-icon-container');
    const minMaxEl = document.getElementById('weather-minmax');
    const humidityEl = document.getElementById('weather-humidity');

    if (cityEl) cityEl.textContent = currentCity.name;

    function applyWeatherData(wData) {
      if (!wData) return;
      if (tempEl) {
        tempEl.textContent = userSettings.usePersianDigits
          ? `${Jalali.toPersianDigits(wData.temp)}°`
          : `${wData.temp}°`;
      }
      if (commentEl) commentEl.textContent = wData.comment;
      if (iconContainer) iconContainer.innerHTML = Weather.getWeatherSvg(wData.icon);
      if (minMaxEl) {
        minMaxEl.textContent = userSettings.usePersianDigits
          ? `حداکثر ${Jalali.toPersianDigits(wData.maxTemp)}° | حداقل ${Jalali.toPersianDigits(wData.minTemp)}°`
          : `حداکثر ${wData.maxTemp}° | حداقل ${wData.minTemp}°`;
      }
      if (humidityEl) {
        humidityEl.textContent = userSettings.usePersianDigits
          ? `رطوبت: ${Jalali.toPersianDigits(wData.humidity)}٪ | باد: ${Jalali.toPersianDigits(wData.windSpeed)} km/h`
          : `رطوبت: ${wData.humidity}% | باد: ${wData.windSpeed} km/h`;
      }

      // Populate Prayer Times Modal
      if (wData.prayerTimes) {
        const pt = wData.prayerTimes;
        const fajrEl = document.getElementById('pt-fajr');
        const sunriseEl = document.getElementById('pt-sunrise');
        const dhuhrEl = document.getElementById('pt-dhuhr');
        const sunsetEl = document.getElementById('pt-sunset');
        const maghribEl = document.getElementById('pt-maghrib');
        if (fajrEl) fajrEl.textContent = userSettings.usePersianDigits ? Jalali.toPersianDigits(pt.fajr) : pt.fajr;
        if (sunriseEl) sunriseEl.textContent = userSettings.usePersianDigits ? Jalali.toPersianDigits(pt.sunrise) : pt.sunrise;
        if (dhuhrEl) dhuhrEl.textContent = userSettings.usePersianDigits ? Jalali.toPersianDigits(pt.dhuhr) : pt.dhuhr;
        if (sunsetEl) sunsetEl.textContent = userSettings.usePersianDigits ? Jalali.toPersianDigits(pt.sunset) : pt.sunset;
        if (maghribEl) maghribEl.textContent = userSettings.usePersianDigits ? Jalali.toPersianDigits(pt.maghrib) : pt.maghrib;
      }
    }

    // 1. Instantly apply cached weather data if available (0ms delay!)
    const cached = Weather.getCachedWeather(currentCity);
    if (cached) {
      applyWeatherData(cached);
    }

    // 2. Fetch fresh weather data in the background
    try {
      const wData = await Weather.fetchWeather(currentCity);
      applyWeatherData(wData);
    } catch (e) {
      console.error('Weather load error:', e);
    }
  }

  /* ------------------- SHORTCUTS ------------------- */
  let currentScIconType = 'favicon';
  let currentScPresetKey = '';
  let currentScEmoji = '🌐';
  let currentScCustomData = '';

  async function initShortcuts() {
    // Instant synchronous render (0ms delay)
    shortcutsList = Shortcuts.getShortcutsSync();
    renderShortcuts();

    // Non-blocking background sync with Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      Shortcuts.loadShortcuts().then(stored => {
        if (stored && JSON.stringify(stored) !== JSON.stringify(shortcutsList)) {
          shortcutsList = stored;
          renderShortcuts();
        }
      });
    }

    const addShortcutModal = document.getElementById('shortcut-modal');
    const modalClose = document.getElementById('shortcut-modal-close');
    const modalBackdrop = document.getElementById('shortcut-modal-backdrop');
    const form = document.getElementById('shortcut-form');
    const titleInput = document.getElementById('sc-title-input');
    const urlInput = document.getElementById('sc-url-input');
    const colorInput = document.getElementById('sc-color-input');
    const emojiInput = document.getElementById('sc-emoji-input');
    const fileInput = document.getElementById('sc-file-input');
    const customUrlInput = document.getElementById('sc-custom-url-input');
    const refreshFavBtn = document.getElementById('sc-btn-refresh-fav');

    const cancelBtn = document.getElementById('sc-cancel-btn');

    if (modalClose) modalClose.addEventListener('click', closeShortcutModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeShortcutModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeShortcutModal);

    // Populate preset SVG buttons
    renderPresetIconsGrid();

    // Setup icon type tabs
    const tabButtons = document.querySelectorAll('.sc-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        switchShortcutIconTab(type);
      });
    });

    // Live preview listeners
    if (titleInput) {
      titleInput.addEventListener('input', () => {
        const label = document.getElementById('sc-preview-title');
        if (label) label.textContent = titleInput.value.trim() || 'عنوان میانبر';
      });
    }

    if (urlInput) {
      urlInput.addEventListener('input', () => {
        if (currentScIconType === 'favicon') {
          updateShortcutLivePreview();
        }
      });
    }

    if (colorInput) {
      colorInput.addEventListener('input', () => {
        const cardBtn = document.getElementById('sc-card-preview-btn');
        if (cardBtn) cardBtn.style.setProperty('--sc-bg', colorInput.value);
      });
    }

    // Quick color dots
    document.querySelectorAll('.quick-color-dots .color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const color = dot.getAttribute('data-color');
        if (colorInput) colorInput.value = color;
        const cardBtn = document.getElementById('sc-card-preview-btn');
        if (cardBtn) cardBtn.style.setProperty('--sc-bg', color);
      });
    });

    // Emoji input & quick emoji chips
    if (emojiInput) {
      emojiInput.addEventListener('input', () => {
        currentScEmoji = emojiInput.value.trim() || '🌐';
        updateShortcutLivePreview();
      });
    }

    document.querySelectorAll('#sc-emoji-chips .emoji-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        currentScEmoji = chip.textContent.trim();
        if (emojiInput) emojiInput.value = currentScEmoji;
        updateShortcutLivePreview();
      });
    });

    // Custom image file upload
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          try {
            currentScCustomData = await processUploadedIcon(file);
            document.getElementById('sc-custom-val').value = currentScCustomData;
            if (customUrlInput) customUrlInput.value = '';
            updateShortcutLivePreview();
          } catch (err) {
            console.error('Error processing icon image:', err);
          }
        }
      });
    }

    // Custom direct image URL
    if (customUrlInput) {
      customUrlInput.addEventListener('input', () => {
        const val = customUrlInput.value.trim();
        if (val) {
          currentScCustomData = val;
          document.getElementById('sc-custom-val').value = val;
          updateShortcutLivePreview();
        }
      });
    }

    // Refresh Favicon button
    if (refreshFavBtn) {
      refreshFavBtn.addEventListener('click', () => {
        updateShortcutLivePreview(true);
      });
    }

    // Form submission
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('sc-edit-id').value;
        const title = (document.getElementById('sc-title-input').value || '').trim() || 'سایت';
        const url = (document.getElementById('sc-url-input').value || '').trim();
        const color = (document.getElementById('sc-color-input').value || '').trim() || '#0284c7';

        if (!url) return;
        const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

        const shortcutData = {
          title,
          url: fullUrl,
          bgColor: color,
          iconType: currentScIconType
        };

        if (currentScIconType === 'preset') {
          shortcutData.iconKey = currentScPresetKey || 'globe';
        } else if (currentScIconType === 'emoji') {
          shortcutData.emoji = currentScEmoji || '🔗';
        } else if (currentScIconType === 'custom') {
          shortcutData.customIcon = currentScCustomData || '';
        } else {
          // favicon
          shortcutData.faviconUrl = Shortcuts.getFaviconUrl(fullUrl);
        }

        if (editId) {
          // Update existing
          const idx = shortcutsList.findIndex(s => s.id === editId);
          if (idx !== -1) {
            shortcutsList[idx] = {
              ...shortcutsList[idx],
              ...shortcutData
            };
          }
        } else {
          // Add new
          shortcutsList.push({
            id: 'sc-' + Date.now(),
            ...shortcutData
          });
        }

        await Shortcuts.saveShortcuts(shortcutsList);
        renderShortcuts();
        closeShortcutModal();
      });
    }
  }

  /**
   * Scales and optimizes uploaded images to small data URLs so storage isn't overloaded
   */
  function processUploadedIcon(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('فایلی انتخاب نشده است'));
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        if (file.type === 'image/svg+xml') {
          resolve(dataUrl);
          return;
        }
        const img = new Image();
        img.onload = () => {
          const maxDim = 96;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderPresetIconsGrid() {
    const grid = document.getElementById('sc-presets-grid');
    if (!grid) return;
    grid.innerHTML = '';

    (Shortcuts.PRESET_ITEMS || []).forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `sc-preset-btn ${currentScPresetKey === item.key ? 'active' : ''}`;
      btn.dataset.key = item.key;
      btn.dataset.color = item.color;
      btn.title = item.name;

      btn.innerHTML = `
        <div class="preset-icon-wrap" style="background:${item.color};">
          ${Shortcuts.PRESET_SVGS[item.key] || '✨'}
        </div>
        <span class="preset-name">${item.name}</span>
      `;

      btn.addEventListener('click', () => {
        currentScPresetKey = item.key;
        document.getElementById('sc-preset-val').value = item.key;
        
        // Auto-suggest preset theme color if color hasn't been deliberately customized
        const colorInput = document.getElementById('sc-color-input');
        if (colorInput && item.color) {
          colorInput.value = item.color;
          const cardBtn = document.getElementById('sc-card-preview-btn');
          if (cardBtn) cardBtn.style.setProperty('--sc-bg', item.color);
        }

        document.querySelectorAll('.sc-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        updateShortcutLivePreview();
      });

      grid.appendChild(btn);
    });
  }

  function switchShortcutIconTab(type) {
    currentScIconType = type;
    document.getElementById('sc-icontype-val').value = type;

    // Update active tab buttons
    document.querySelectorAll('.sc-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-type') === type);
    });

    // Update active panels
    document.querySelectorAll('.sc-icon-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `sc-panel-${type}`);
    });

    updateShortcutLivePreview();
  }

  function updateShortcutLivePreview(forceReloadFav = false) {
    const previewWrap = document.getElementById('sc-icon-preview');
    const cardBtn = document.getElementById('sc-card-preview-btn');
    const colorInput = document.getElementById('sc-color-input');
    const urlInput = document.getElementById('sc-url-input');

    if (cardBtn && colorInput) {
      cardBtn.style.setProperty('--sc-bg', colorInput.value || '#0284c7');
    }

    if (!previewWrap) return;

    if (currentScIconType === 'preset') {
      const svg = Shortcuts.PRESET_SVGS[currentScPresetKey] || Shortcuts.PRESET_SVGS['globe'];
      previewWrap.innerHTML = svg;
    } else if (currentScIconType === 'emoji') {
      previewWrap.innerHTML = `<span class="shortcut-emoji">${currentScEmoji || '🔗'}</span>`;
    } else if (currentScIconType === 'custom') {
      if (currentScCustomData) {
        previewWrap.innerHTML = `<img class="shortcut-favicon" src="${currentScCustomData}" alt="icon" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=\\'shortcut-emoji\\'>🖼️</span>'"/>`;
      } else {
        previewWrap.innerHTML = `<span class="shortcut-emoji">🖼️</span>`;
      }
    } else {
      // Favicon
      const rawUrl = urlInput ? urlInput.value.trim() : '';
      if (rawUrl && rawUrl.length > 3) {
        const fullUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
        const favUrl = Shortcuts.getFaviconUrl(fullUrl) + (forceReloadFav ? `&_t=${Date.now()}` : '');
        previewWrap.innerHTML = `<img class="shortcut-favicon" src="${favUrl}" alt="favicon" onerror="Shortcuts.handleFaviconError(this, '${encodeURIComponent(fullUrl)}')"/>`;
      } else {
        previewWrap.innerHTML = `<span class="shortcut-emoji">🌐</span>`;
      }
    }
  }

  function renderShortcuts() {
    const container = document.getElementById('shortcuts-grid');
    if (!container) return;
    container.innerHTML = '';

    // Render active shortcuts
    shortcutsList.forEach(sc => {
      const card = document.createElement('div');
      card.className = 'shortcut-item';

      card.innerHTML = `
        <a href="${sc.url}" class="shortcut-icon-btn" style="--sc-bg: ${sc.bgColor || '#334155'};" title="${sc.title}">
          <div class="shortcut-icon-wrap">
            ${Shortcuts.renderShortcutIcon(sc)}
          </div>
        </a>
        <span class="shortcut-label">${sc.title}</span>
        <div class="shortcut-actions">
          <button class="sc-action-btn edit-btn" title="ویرایش">✎</button>
          <button class="sc-action-btn delete-btn" title="حذف">✕</button>
        </div>
      `;

      card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditShortcutModal(sc);
      });

      card.querySelector('.delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        shortcutsList = shortcutsList.filter(s => s.id !== sc.id);
        await Shortcuts.saveShortcuts(shortcutsList);
        renderShortcuts();
      });

      container.appendChild(card);
    });

    // Render empty '+' slots up to 12 total items (2 rows of 6)
    const emptySlotsCount = Math.max(1, 12 - shortcutsList.length);
    for (let i = 0; i < emptySlotsCount; i++) {
      const emptySlot = document.createElement('div');
      emptySlot.className = 'shortcut-item empty-slot';
      emptySlot.innerHTML = `
        <button type="button" class="shortcut-icon-btn add-slot-btn" title="افزودن میانبر جدید">
          <span class="plus-icon">+</span>
        </button>
        <span class="shortcut-label">افزودن</span>
      `;
      emptySlot.addEventListener('click', () => openNewShortcutModal());
      container.appendChild(emptySlot);
    }
  }

  function openNewShortcutModal() {
    document.getElementById('sc-modal-title').textContent = 'افزودن میانبر جدید';
    document.getElementById('sc-edit-id').value = '';
    document.getElementById('sc-title-input').value = '';
    document.getElementById('sc-url-input').value = '';
    document.getElementById('sc-color-input').value = '#0284c7';
    document.getElementById('sc-preview-title').textContent = 'پیش‌نمایش میانبر';

    currentScIconType = 'favicon';
    currentScPresetKey = '';
    currentScEmoji = '🌐';
    currentScCustomData = '';
    document.getElementById('sc-emoji-input').value = '';
    document.getElementById('sc-custom-url-input').value = '';
    document.getElementById('sc-custom-val').value = '';

    switchShortcutIconTab('favicon');
    document.getElementById('shortcut-modal').classList.add('active');
  }

  function openEditShortcutModal(sc) {
    document.getElementById('sc-modal-title').textContent = 'ویرایش میانبر';
    document.getElementById('sc-edit-id').value = sc.id;
    document.getElementById('sc-title-input').value = sc.title;
    document.getElementById('sc-url-input').value = sc.url;
    document.getElementById('sc-color-input').value = sc.bgColor || '#0284c7';
    document.getElementById('sc-preview-title').textContent = sc.title;

    currentScIconType = sc.iconType || 'favicon';
    currentScPresetKey = sc.iconKey || '';
    currentScEmoji = sc.emoji || '🌐';
    currentScCustomData = sc.customIcon || '';

    document.getElementById('sc-preset-val').value = currentScPresetKey;
    document.getElementById('sc-emoji-input').value = sc.emoji || '';
    document.getElementById('sc-custom-val').value = currentScCustomData;
    document.getElementById('sc-custom-url-input').value = (currentScCustomData.startsWith('http') ? currentScCustomData : '');

    // Highlight active preset button if applicable
    document.querySelectorAll('.sc-preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.key === currentScPresetKey);
    });

    switchShortcutIconTab(currentScIconType);
    document.getElementById('shortcut-modal').classList.add('active');
  }

  function closeShortcutModal() {
    document.getElementById('shortcut-modal').classList.remove('active');
  }

  /* ------------------- TO-DOS ("دست نویس") ------------------- */
  async function initTodos() {
    // Instant synchronous render (0ms delay)
    todosList = Todo.getTodosSync();
    renderTodos();

    // Non-blocking background sync with Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      Todo.loadTodos().then(stored => {
        if (stored && JSON.stringify(stored) !== JSON.stringify(todosList)) {
          todosList = stored;
          renderTodos();
        }
      });
    }

    const addBtn = document.getElementById('btn-add-todo');
    const modal = document.getElementById('todo-modal');
    const modalClose = document.getElementById('todo-modal-close');
    const modalBackdrop = document.getElementById('todo-modal-backdrop');
    const form = document.getElementById('todo-form');

    const cancelBtn = document.getElementById('td-cancel-btn');

    if (addBtn) addBtn.addEventListener('click', () => openNewTaskModal());
    if (modalClose) modalClose.addEventListener('click', closeTodoModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeTodoModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeTodoModal);

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('td-title-input').value.trim();
        const tag = document.getElementById('td-tag-input').value.trim() || 'عمومی';
        const dateText = document.getElementById('td-date-input').value.trim() || 'امروز';
        const desc = document.getElementById('td-desc-input').value.trim();

        if (!title) return;

        todosList.unshift({
          id: 'td-' + Date.now(),
          title,
          tag,
          dateText,
          description: desc,
          completed: false,
          createdAt: Date.now()
        });

        await Todo.saveTodos(todosList);
        renderTodos();
        closeTodoModal();
      });
    }
  }

  function renderTodos() {
    const listEl = document.getElementById('todos-container');
    if (!listEl) return;
    listEl.innerHTML = '';

    todosList.forEach(task => {
      const item = document.createElement('div');
      item.className = `todo-card ${task.completed ? 'completed' : ''}`;

      item.innerHTML = `
        <div class="todo-main-row">
          <label class="todo-checkbox-wrapper">
            <input type="checkbox" class="todo-check-input" ${task.completed ? 'checked' : ''} />
            <span class="custom-checkbox"></span>
          </label>
          <div class="todo-header-info">
            <div class="todo-title">${task.title}</div>
            <div class="todo-badges">
              <span class="todo-tag">${task.tag}</span>
              <span class="todo-date">${task.dateText}</span>
            </div>
          </div>
          <button class="todo-delete-btn" title="حذف تسک">✕</button>
        </div>
        ${task.description ? `<div class="todo-desc-row">${task.description}</div>` : ''}
      `;

      // Checkbox toggle
      item.querySelector('.todo-check-input').addEventListener('change', async (e) => {
        task.completed = e.target.checked;
        if (task.completed) {
          item.classList.add('completed');
        } else {
          item.classList.remove('completed');
        }
        await Todo.saveTodos(todosList);
      });

      // Delete
      item.querySelector('.todo-delete-btn').addEventListener('click', async () => {
        todosList = todosList.filter(t => t.id !== task.id);
        await Todo.saveTodos(todosList);
        renderTodos();
      });

      listEl.appendChild(item);
    });
  }

  function openNewTaskModal(defaultDate = '') {
    document.getElementById('td-title-input').value = '';
    document.getElementById('td-tag-input').value = 'کار';
    document.getElementById('td-date-input').value = defaultDate || 'امروز';
    document.getElementById('td-desc-input').value = '';
    document.getElementById('todo-modal').classList.add('active');
  }

  function closeTodoModal() {
    document.getElementById('todo-modal').classList.remove('active');
  }

  /* ------------------- MUSIC PLAYER ------------------- */
  function initMusicPlayer() {
    const playBtn = document.getElementById('music-play-btn');
    const nextBtn = document.getElementById('music-next-btn');
    const titleEl = document.getElementById('music-track-title');
    const artistEl = document.getElementById('music-track-artist');
    const coverEl = document.getElementById('music-album-cover');

    function updateTrackUI(track, isPlaying) {
      if (titleEl) titleEl.textContent = track.title;
      if (artistEl) artistEl.textContent = track.artist;
      if (coverEl) {
        if (isPlaying) {
          coverEl.classList.add('spinning');
        } else {
          coverEl.classList.remove('spinning');
        }
      }
      if (playBtn) {
        playBtn.innerHTML = isPlaying
          ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
          : `<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><polygon points="6,4 20,12 6,20"/></svg>`;
      }
    }

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const playing = MusicPlayer.togglePlay();
        updateTrackUI(MusicPlayer.getCurrentTrack(), playing);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const next = MusicPlayer.nextTrack();
        updateTrackUI(next, MusicPlayer.getIsPlaying());
      });
    }

    updateTrackUI(MusicPlayer.getCurrentTrack(), false);
  }

  /* ------------------- SEARCH BAR ------------------- */
  function initSearch() {
    const input = document.getElementById('search-input');
    const form = document.getElementById('search-form');
    const engineIcon = document.getElementById('search-engine-icon');

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;

        // Check if query is direct URL
        if (query.match(/^(https?:\/\/|[a-z0-9]+\.[a-z]{2,})/i)) {
          const dest = query.startsWith('http') ? query : `https://${query}`;
          window.location.href = dest;
          return;
        }

        const engine = SEARCH_ENGINES[userSettings.searchEngine] || SEARCH_ENGINES.google;
        window.location.href = engine.url + encodeURIComponent(query);
      });
    }
  }

  /* ------------------- SIDEBAR & MODALS ------------------- */
  function initSidebarAndModals() {
    // City Selector in Weather
    const cityBtn = document.getElementById('weather-city-btn');
    if (cityBtn) {
      cityBtn.addEventListener('click', () => {
        const nextIdx = (Weather.DEFAULT_CITIES.findIndex(c => c.name === currentCity.name) + 1) % Weather.DEFAULT_CITIES.length;
        currentCity = Weather.DEFAULT_CITIES[nextIdx];
        initWeather();
      });
    }

    // Prayer Times button
    const prayerBtn = document.getElementById('link-prayer-times');
    const prayerModal = document.getElementById('prayer-modal');
    const prayerClose = document.getElementById('prayer-modal-close');
    const prayerBackdrop = document.getElementById('prayer-modal-backdrop');

    if (prayerBtn && prayerModal) {
      prayerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prayerModal.classList.add('active');
      });
    }
    if (prayerClose) prayerClose.addEventListener('click', () => prayerModal.classList.remove('active'));
    if (prayerBackdrop) prayerBackdrop.addEventListener('click', (e) => {
      if (e.target === prayerBackdrop) prayerModal.classList.remove('active');
    });

    // Settings Modal
    const settingsBtn = document.getElementById('sidebar-btn-settings');
    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-modal-close');
    const settingsBackdrop = document.getElementById('settings-modal-backdrop');

    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener('click', () => settingsModal.classList.add('active'));
    }
    if (settingsClose) settingsClose.addEventListener('click', () => settingsModal.classList.remove('active'));
    if (settingsBackdrop) settingsBackdrop.addEventListener('click', (e) => {
      if (e.target === settingsBackdrop) settingsModal.classList.remove('active');
    });

    // Wallpaper switchers in settings
    document.querySelectorAll('.wallpaper-thumb-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const wp = btn.getAttribute('data-wp');
        if (wp) {
          userSettings.wallpaper = wp;
          applyWallpaper(wp);
          saveSettings();
        }
      });
    });

    // Persian Digits Toggle
    const faDigitsToggle = document.getElementById('toggle-persian-digits');
    if (faDigitsToggle) {
      faDigitsToggle.checked = userSettings.usePersianDigits;
      faDigitsToggle.addEventListener('change', (e) => {
        userSettings.usePersianDigits = e.target.checked;
        saveSettings();
        location.reload();
      });
    }

    // Fullscreen toggle
    const fsBtn = document.getElementById('sidebar-btn-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }

  /* ------------------- GLOBAL UNIVERSAL MODAL SYSTEM ------------------- */
  function initGlobalModalListeners() {
    // 1. Close modal on backdrop or overlay click outside the card
    document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('modal-backdrop')) {
          overlay.classList.remove('active');
        }
      });
    });

    // 2. Close modal on any close or cancel button click
    document.addEventListener('click', (e) => {
      const closeTarget = e.target.closest('.modal-close-btn, #sc-cancel-btn, #td-cancel-btn, [data-close-modal]');
      if (closeTarget) {
        e.preventDefault();
        const activeModal = closeTarget.closest('.custom-modal-overlay');
        if (activeModal) {
          activeModal.classList.remove('active');
        }
      }
    });

    // 3. Escape key closes any currently active modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.custom-modal-overlay.active');
        activeModals.forEach(m => m.classList.remove('active'));
      }
    });
  }

  return {
    init,
    openNewTaskModal,
    openNewTaskModalWithDate: openNewTaskModal,
    closeTodoModal,
    openNewShortcutModal,
    closeShortcutModal
  };
})();

window.App = App;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}
