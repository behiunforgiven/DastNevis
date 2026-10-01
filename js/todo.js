/**
 * To-Do & Notes Module ("دست نویس")
 * Manages tasks, categories, due dates, sub-notes, and completion status.
 */

const Todo = (() => {
  const STORAGE_KEY = 'dastnevis_todos_v1';

  // Preset tasks matching the desktop-preview.jpeg!
  const DEFAULT_TODOS = [
    {
      id: 'td-1',
      title: 'تولد حسام رو تبریک بگم',
      tag: 'تولد',
      dateText: '۲۹ خرداد',
      description: 'همین؟ فقط یه تبریک؟ پس کادو چی؟ واسه کادو میتونیم یه BMW X3 2009 Green بدیم بهش یا تیشرت ایکیا :)',
      completed: false,
      createdAt: Date.now() - 86400000 * 2
    },
    {
      id: 'td-2',
      title: 'ارسال ترجمه مدارک',
      tag: 'دانشگاه',
      dateText: 'امروز',
      description: 'ارسال فیش و تأییدیه ریزنمرات به بخش بین‌الملل دانشگاه',
      completed: false,
      createdAt: Date.now() - 86400000
    },
    {
      id: 'td-3',
      title: 'یه نسک خیلی آروم',
      tag: 'شخصی',
      dateText: '۱۵ تیر',
      description: 'کتاب خوندن و گوش دادن به آلبوم جدید با یه فنجون قهوه تازه دم',
      completed: false,
      createdAt: Date.now()
    },
    {
      id: 'td-4',
      title: 'پرداخت قبض اینترنت و هاست',
      tag: 'مالی',
      dateText: 'دیروز',
      description: 'تمدید سرویس سرور و اشتراک شاتل',
      completed: true,
      createdAt: Date.now() - 86400000 * 3
    }
  ];

  /**
   * Synchronously retrieves cached todos for instant zero-latency UI rendering (0ms delay)
   */
  function getTodosSync() {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_TODOS;
  }

  async function loadTodos() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([STORAGE_KEY], (res) => {
          if (res && res[STORAGE_KEY] && Array.isArray(res[STORAGE_KEY])) {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(res[STORAGE_KEY]));
            } catch {}
            resolve(res[STORAGE_KEY]);
          } else {
            resolve(getTodosSync());
          }
        });
      } else {
        resolve(getTodosSync());
      }
    });
  }

  async function saveTodos(todos) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error(e);
    }
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [STORAGE_KEY]: todos }, () => resolve(true));
      } else {
        resolve(true);
      }
    });
  }

  return {
    DEFAULT_TODOS,
    getTodosSync,
    loadTodos,
    saveTodos
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Todo;
}
