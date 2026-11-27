/* ==========================================================================
   STELLARIUM — SHARED NAVIGATION CONTROLLER (nav.js)
   Handles the responsive mobile hamburger menu and logo fallback.
   ========================================================================== */

(function initMuseumNavigation() {
  "use strict";

  const toggleBtn = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("main-nav");
  const brandLogo = document.querySelector(".brand-logo");

  // Guard: If the logo fails to load, replace it with a clean star emblem.
  if (brandLogo) {
    brandLogo.addEventListener("error", function handleLogoError() {
      const fallback = document.createElement("span");
      fallback.className = "brand-logo-fallback";
      fallback.setAttribute("aria-hidden", "true");
      fallback.textContent = "✦";
      brandLogo.replaceWith(fallback);
    });
  }

  // Guard: Only wire up menu toggle if both elements exist on the page.
  if (!toggleBtn || !navMenu) {
    return;
  }

  /**
   * Opens or closes the mobile navigation drawer and keeps ARIA state synced.
   * @param {boolean} shouldOpen - True to expand the menu, false to collapse it.
   */
  function setMenuOpen(shouldOpen) {
    navMenu.classList.toggle("nav-open", shouldOpen);
    toggleBtn.setAttribute("aria-expanded", String(shouldOpen));
    toggleBtn.textContent = shouldOpen ? "✕ Close Menu" : "☰ Menu";
  }

  // Toggle menu on click (also fires for Enter/Space on a native <button>).
  toggleBtn.addEventListener("click", function handleToggleClick() {
    const isCurrentlyOpen = toggleBtn.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isCurrentlyOpen);
  });

  // Allow keyboard users to close an open mobile menu using the Escape key.
  document.addEventListener("keydown", function handleEscapeKey(event) {
    const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
    if (event.key === "Escape" && isOpen) {
      setMenuOpen(false);
      toggleBtn.focus();
    }
  });

  // Close the mobile dropdown cleanly if the window widens past 850px.
  window.addEventListener("resize", function handleViewportResize() {
    if (window.innerWidth > 850 && navMenu.classList.contains("nav-open")) {
      setMenuOpen(false);
    }
  });
})();
