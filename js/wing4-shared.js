/* ==========================================================================
   WING IV: SHARED STATE, NAVIGATION, SAVED COLLECTION & ACCESSIBLE MODAL
   Pure Vanilla JavaScript (zero external libraries)
   ========================================================================== */

(function () {
  const STORAGE_KEY = 'stellarium_saved_exhibits';
  const PREFS_KEY = 'stellarium_wing4_prefs';

  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* Storage unavailable in restricted browser mode */
    }
  }

  /* ------------------------------------------------------------------------
     1. RESPONSIVE MOBILE HAMBURGER NAVIGATION
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? '✕ Close Menu' : '☰ Gallery Menu';
    });
  }

  /* ------------------------------------------------------------------------
     2. SAVED COLLECTION STATE (localStorage across all 3 pages)
     ------------------------------------------------------------------------ */
  function getSavedItems() {
    return readStorage(STORAGE_KEY, []);
  }

  function isExhibitSaved(id) {
    return getSavedItems().some(item => item.id === id);
  }

  function toggleSavedExhibit(exhibit) {
    const items = getSavedItems();
    const index = items.findIndex(item => item.id === exhibit.id);
    let savedNow = false;

    if (index >= 0) {
      items.splice(index, 1);
      savedNow = false;
    } else {
      items.push({
        id: exhibit.id,
        title: exhibit.title,
        wing: exhibit.wing,
        page: exhibit.page,
        summary: exhibit.summary
      });
      savedNow = true;
    }

    writeStorage(STORAGE_KEY, items);
    updateSavedBadges();
    renderCollectionModalList();
    return savedNow;
  }

  function removeSavedExhibit(id) {
    const filtered = getSavedItems().filter(item => item.id !== id);
    writeStorage(STORAGE_KEY, filtered);
    updateSavedBadges();
    renderCollectionModalList();
    document.dispatchEvent(new CustomEvent('stellarium:savedChanged'));
  }

  function updateSavedBadges() {
    const count = getSavedItems().length;
    document.querySelectorAll('.saved-count-badge').forEach(badge => {
      badge.textContent = String(count);
    });
  }

  function renderCollectionModalList() {
    const container = document.getElementById('savedCollectionList');
    if (!container) return;

    const items = getSavedItems();
    if (!items.length) {
      container.innerHTML = '<p style="color: var(--text-silver);">No exhibits saved yet. Click <strong>"Save to Collection"</strong> on any telescope pair, rocket, or ISS room to build your personal tour.</p>';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="saved-list-item">
        <div>
          <span class="badge-tag">${escapeHtml(item.wing)}</span>
          <h4 style="margin: 0.15rem 0;">${escapeHtml(item.title)}</h4>
          <p style="font-size: 0.9rem; margin: 0;">${escapeHtml(item.summary)}</p>
        </div>
        <div style="display:flex; gap:0.5rem; flex-shrink:0;">
          <a href="${escapeHtml(item.page)}" class="outline-btn">Visit</a>
          <button type="button" class="outline-btn" data-remove-saved="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.title)} from saved collection">Remove</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-remove-saved]').forEach(btn => {
      btn.addEventListener('click', () => removeSavedExhibit(btn.getAttribute('data-remove-saved')));
    });
  }

  /* ------------------------------------------------------------------------
     3. ACCESSIBLE MODAL CONTROLLER
     ------------------------------------------------------------------------ */
  let lastFocusedEl = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    lastFocusedEl = document.activeElement;
    modal.classList.add('open');
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function initModals() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', e => {
        if (e.target === backdrop) closeModal(backdrop);
      });
      const closeBtn = backdrop.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(backdrop));
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(closeModal);
      }
    });

    const collectionBtn = document.getElementById('openSavedCollectionBtn');
    if (collectionBtn) {
      collectionBtn.addEventListener('click', () => {
        renderCollectionModalList();
        openModal('savedCollectionModal');
      });
    }

    const clearBtn = document.getElementById('clearSavedCollectionBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        writeStorage(STORAGE_KEY, []);
        updateSavedBadges();
        renderCollectionModalList();
        document.dispatchEvent(new CustomEvent('stellarium:savedChanged'));
      });
    }
  }

  /* ------------------------------------------------------------------------
     4. PREFERENCES & HELPERS
     ------------------------------------------------------------------------ */
  function getPref(key, fallback) {
    const prefs = readStorage(PREFS_KEY, {});
    return key in prefs ? prefs[key] : fallback;
  }

  function setPref(key, value) {
    const prefs = readStorage(PREFS_KEY, {});
    prefs[key] = value;
    writeStorage(PREFS_KEY, prefs);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.StellariumWing4 = {
    initMobileNav,
    initModals,
    openModal,
    closeModal,
    getSavedItems,
    isExhibitSaved,
    toggleSavedExhibit,
    updateSavedBadges,
    getPref,
    setPref,
    escapeHtml
  };

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initModals();
    updateSavedBadges();
  });
})();
