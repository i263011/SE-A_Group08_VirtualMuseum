/* ==========================================================================
   SHARED RESPONSIVE NAVIGATION TOGGLE (< 850px)
   ========================================================================== */
(function () {
  const toggleBtn = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  if (!toggleBtn || !nav) return;

  const labelEl = toggleBtn.querySelector('.nav-toggle-label');
  const desktopQuery = window.matchMedia('(min-width: 851px)');

  function setMenuOpen(isOpen) {
    nav.classList.toggle('is-open', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    if (labelEl) {
      labelEl.textContent = isOpen ? 'Close' : 'Menu';
    }
  }

  toggleBtn.addEventListener('click', () => {
    const isCurrentlyOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isCurrentlyOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (!desktopQuery.matches) {
        setMenuOpen(false);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
      const wasInsideNav = nav.contains(document.activeElement);
      setMenuOpen(false);
      if (wasInsideNav) {
        toggleBtn.focus();
      }
    }
  });

  function handleViewportChange(e) {
    if (e.matches) {
      setMenuOpen(false);
    }
  }

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleViewportChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleViewportChange);
  }
})();
