/* ==========================================================================
   STELLARIUM — WING I: OUR SOLAR SYSTEM (solar-system.js)
   Generates the Solar System Overview page from structured JS data arrays,
   manages the interactive linear/log scale chart, and saves exhibits to
   localStorage under the key "stellariumSaved".
   ========================================================================== */

(function initSolarSystemPage() {
  "use strict";

  const STORAGE_KEY = "stellariumSaved";

  // ------------------------------------------------------------------------
  // 1. STRUCTURED EXHIBITION DATA ARRAYS
  // ------------------------------------------------------------------------
  const PAGE_HEADER_DATA = {
    eyebrow: "Wing I • Gallery 01",
    title: "Our Solar System",
    intro:
      "Our Solar System is a gravitationally bound neighborhood of one yellow dwarf star, eight planets, dwarf planets, and rocky belts orbiting inside the Milky Way. Formed roughly 4.6 billion years ago from a collapsing interstellar cloud, this cosmic system stretches from the blazing solar photosphere to the icy frontier beyond Neptune."
  };

  const FEATURED_EXHIBITS = [
    {
      id: "sun",
      badge: "Central Star • G2V",
      title: "The Sun",
      description:
        "At the heart of our Solar System lies a magnetic sphere of incandescent plasma whose nuclear fusion drives light, heat, and space weather across every planetary orbit.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg",
      imageAlt:
        "Extreme ultraviolet view of the Sun captured by NASA's Solar Dynamics Observatory",
      stats: [
        { label: "Diameter", value: "1.39 million km" },
        { label: "Surface Temp", value: "About 5,500 °C" },
        { label: "Age", value: "About 4.6 billion years" },
        { label: "System Mass", value: "99.86% of total mass" }
      ],
      allowSave: true
    },
    {
      id: "asteroid-belt",
      badge: "Circumstellar Disc • Main Belt",
      title: "The Asteroid Belt",
      description:
        "This vast torus of ancient rocky and metallic remnants preserves primordial building blocks that Jupiter's gravity kept from coalescing into a fifth rocky planet.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/8/86/The_Four_Largest_Asteroids.jpg",
      imageAlt:
        "Scale comparison of the four largest objects in the main asteroid belt: Ceres, Vesta, Pallas, and Hygiea",
      stats: [
        { label: "Location", value: "Between Mars and Jupiter" },
        { label: "Distance from Sun", value: "About 2.2 to 3.2 AU" },
        { label: "Largest Object", value: "Ceres (about 940 km across)" }
      ],
      allowSave: false
    }
  ];

  // Diameters in kilometres for the Sun and all eight planets.
  const SCALE_BODIES = [
    { id: "mercury", name: "Mercury", diameterKm: 4879, type: "Inner Rocky Planet" },
    { id: "venus", name: "Venus", diameterKm: 12104, type: "Inner Rocky Planet" },
    { id: "earth", name: "Earth", diameterKm: 12742, type: "Inner Rocky Planet" },
    { id: "mars", name: "Mars", diameterKm: 6779, type: "Inner Rocky Planet" },
    { id: "jupiter", name: "Jupiter", diameterKm: 139820, type: "Outer Gas Giant" },
    { id: "saturn", name: "Saturn", diameterKm: 116460, type: "Outer Gas Giant" },
    { id: "uranus", name: "Uranus", diameterKm: 50724, type: "Outer Ice Giant" },
    { id: "neptune", name: "Neptune", diameterKm: 49244, type: "Outer Ice Giant" },
    { id: "sun", name: "Sun", diameterKm: 1391000, type: "Central Star" }
  ];

  const WING_LINKS = [
    { label: "Explore Inner Planets", href: "inner-planets.html" },
    { label: "Explore Outer Giants", href: "outer-planets.html" }
  ];

  // Track interactive chart state.
  let currentScaleMode = "linear";
  let selectedBodyId = null;

  // ------------------------------------------------------------------------
  // 2. SAFE LOCALSTORAGE HELPERS
  // ------------------------------------------------------------------------

  /**
   * Reads the saved exhibit ID array from localStorage safely.
   * Returns { ok, ids, message } so callers can show visible errors if needed.
   */
  function readSavedCollection() {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      if (rawValue === null || rawValue === "") {
        return { ok: true, ids: [], message: "" };
      }

      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) {
        return {
          ok: false,
          ids: [],
          message: "Saved collection data had an unexpected format and could not be read."
        };
      }

      // Keep only non-empty string IDs.
      const cleanIds = parsed.filter(function isValidId(entry) {
        return typeof entry === "string" && entry.trim() !== "";
      });
      return { ok: true, ids: cleanIds, message: "" };
    } catch (error) {
      return {
        ok: false,
        ids: [],
        message: "Browser storage is unavailable or blocked. Saved items may not persist."
      };
    }
  }

  /**
   * Writes an array of saved exhibit IDs to localStorage safely.
   * Returns { ok, message }.
   */
  function writeSavedCollection(ids) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      return { ok: true, message: "" };
    } catch (error) {
      return {
        ok: false,
        message: "Unable to save to browser storage. Please check storage permissions."
      };
    }
  }

  // ------------------------------------------------------------------------
  // 3. IMAGE HELPER WITH STYLED FALLBACK
  // ------------------------------------------------------------------------

  /**
   * Creates a .media-frame containing an <img> and an onerror fallback box.
   */
  function createExhibitImage(imageUrl, imageAlt) {
    const frame = document.createElement("div");
    frame.className = "media-frame";

    const safeUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";
    const safeAlt = typeof imageAlt === "string" && imageAlt.trim()
      ? imageAlt.trim()
      : "Solar System exhibit photograph";

    function showPlaceholder() {
      frame.innerHTML = "";
      const fallback = document.createElement("div");
      fallback.className = "img-fallback";
      fallback.setAttribute("role", "img");
      fallback.setAttribute("aria-label", safeAlt + " (image unavailable)");

      const icon = document.createElement("span");
      icon.className = "img-fallback-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "✦";

      const title = document.createElement("span");
      title.className = "img-fallback-title";
      title.textContent = "Archival Image Unavailable";

      const caption = document.createElement("span");
      caption.className = "img-fallback-caption";
      caption.textContent = safeAlt;

      fallback.append(icon, title, caption);
      frame.appendChild(fallback);
    }

    if (!safeUrl) {
      showPlaceholder();
      return frame;
    }

    const img = document.createElement("img");
    img.alt = safeAlt;
    img.loading = "lazy";
    // Attach error handler before setting src so immediate failures are caught.
    img.addEventListener("error", showPlaceholder);
    img.src = safeUrl;

    frame.appendChild(img);
    return frame;
  }

  // ------------------------------------------------------------------------
  // 4. SECTION RENDERERS
  // ------------------------------------------------------------------------

  /**
   * Renders the .page-header section from PAGE_HEADER_DATA.
   */
  function renderPageHeader() {
    const headerEl = document.getElementById("page-header");
    if (!headerEl) {
      return;
    }

    if (!PAGE_HEADER_DATA || !PAGE_HEADER_DATA.title) {
      headerEl.innerHTML =
        '<p class="status-message">Gallery introduction data is currently missing.</p>';
      return;
    }

    const eyebrow = document.createElement("div");
    eyebrow.className = "badge-tag";
    eyebrow.textContent = PAGE_HEADER_DATA.eyebrow;

    const heading = document.createElement("h1");
    heading.id = "page-title";
    heading.textContent = PAGE_HEADER_DATA.title;

    const intro = document.createElement("p");
    intro.textContent = PAGE_HEADER_DATA.intro;

    headerEl.replaceChildren(eyebrow, heading, intro);
  }

  /**
   * Updates the appearance and ARIA state of the Sun's save button.
   */
  function syncSaveButtonUI(button, feedbackEl, isSaved, statusText, isError) {
    button.classList.toggle("is-saved", isSaved);
    button.setAttribute("aria-pressed", String(isSaved));

    const heartSpan = button.querySelector(".heart-icon");
    const labelSpan = button.querySelector(".save-label");
    if (heartSpan) {
      heartSpan.textContent = isSaved ? "♥" : "♡";
    }
    if (labelSpan) {
      labelSpan.textContent = isSaved ? "Saved to My Collection" : "Save to My Collection";
    }

    if (feedbackEl) {
      feedbackEl.textContent = statusText || "";
      feedbackEl.classList.toggle("is-error", Boolean(isError));
    }
  }

  /**
   * Renders The Sun and The Asteroid Belt cards into #solar-highlights.
   */
  function renderFeaturedExhibits() {
    const container = document.getElementById("solar-highlights");
    if (!container) {
      return;
    }

    if (!Array.isArray(FEATURED_EXHIBITS) || FEATURED_EXHIBITS.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "status-message";
      emptyMsg.textContent = "No Solar System exhibit records were found.";
      container.replaceChildren(emptyMsg);
      return;
    }

    const initialStorage = readSavedCollection();
    const fragment = document.createDocumentFragment();

    FEATURED_EXHIBITS.forEach(function buildExhibitCard(item) {
      if (!item || !item.title) {
        return;
      }

      const card = document.createElement("article");
      card.className = "exhibit-card";
      card.id = "exhibit-" + item.id;

      // Exhibit photograph with fallback handling.
      const media = createExhibitImage(item.imageUrl, item.imageAlt);
      card.appendChild(media);

      const body = document.createElement("div");
      body.className = "card-body";

      const badge = document.createElement("div");
      badge.className = "badge-tag";
      badge.textContent = item.badge || "Solar Exhibit";

      const title = document.createElement("h3");
      title.textContent = item.title;

      const description = document.createElement("p");
      description.textContent = item.description || "Description unavailable.";

      body.append(badge, title, description);

      // Build .stat-list from data array, with fallback if stats are empty.
      const statList = document.createElement("ul");
      statList.className = "stat-list";
      if (Array.isArray(item.stats) && item.stats.length > 0) {
        item.stats.forEach(function appendStat(stat) {
          const li = document.createElement("li");
          const strong = document.createElement("strong");
          strong.textContent = (stat.label || "Detail") + ": ";
          const valueNode = document.createTextNode(stat.value || "N/A");
          li.append(strong, valueNode);
          statList.appendChild(li);
        });
      } else {
        const li = document.createElement("li");
        li.textContent = "Telemetry statistics unavailable.";
        statList.appendChild(li);
      }
      body.appendChild(statList);

      // Add the Heart "Save to My Collection" button on cards with allowSave.
      if (item.allowSave) {
        const actions = document.createElement("div");
        actions.className = "card-actions";

        const saveBtn = document.createElement("button");
        saveBtn.type = "button";
        saveBtn.className = "outline-btn save-btn";

        const heart = document.createElement("span");
        heart.className = "heart-icon";
        heart.setAttribute("aria-hidden", "true");

        const label = document.createElement("span");
        label.className = "save-label";

        saveBtn.append(heart, label);

        const feedback = document.createElement("p");
        feedback.className = "save-feedback";
        feedback.setAttribute("aria-live", "polite");

        const isInitiallySaved =
          initialStorage.ok && initialStorage.ids.indexOf(item.id) !== -1;

        syncSaveButtonUI(
          saveBtn,
          feedback,
          isInitiallySaved,
          initialStorage.ok
            ? (isInitiallySaved ? "In your saved gallery collection." : "")
            : initialStorage.message,
          !initialStorage.ok
        );

        saveBtn.addEventListener("click", function handleSaveToggle() {
          const latest = readSavedCollection();
          if (!latest.ok && !latest.message) {
            return;
          }

          const updatedIds = latest.ids.slice();
          const existingIndex = updatedIds.indexOf(item.id);
          let nextSavedState = false;

          if (existingIndex === -1) {
            updatedIds.push(item.id);
            nextSavedState = true;
          } else {
            updatedIds.splice(existingIndex, 1);
            nextSavedState = false;
          }

          const writeResult = writeSavedCollection(updatedIds);
          if (!writeResult.ok) {
            syncSaveButtonUI(saveBtn, feedback, !nextSavedState, writeResult.message, true);
            return;
          }

          const msg = nextSavedState
            ? "Saved to My Collection."
            : "Removed from My Collection.";
          syncSaveButtonUI(saveBtn, feedback, nextSavedState, msg, false);
        });

        actions.append(saveBtn, feedback);
        body.appendChild(actions);
      }

      card.appendChild(body);
      fragment.appendChild(card);
    });

    container.replaceChildren(fragment);
  }

  /**
   * Computes CSS bar width percentages for either "linear" or "logarithmic" mode.
   */
  function computeBarWidths(validBodies, mode) {
    const diameters = validBodies.map(function getDiameter(b) {
      return b.diameterKm;
    });
    const maxDiameter = Math.max.apply(null, diameters);

    if (mode === "logarithmic") {
      const logValues = diameters.map(function toLog(d) {
        return Math.log10(d);
      });
      const minLog = Math.min.apply(null, logValues);
      const maxLog = Math.max.apply(null, logValues);
      // Offset the baseline slightly below the smallest planet so its bar stays visible.
      const baseLog = Math.max(0, minLog - 0.5);
      const span = maxLog - baseLog || 1;

      return validBodies.map(function mapLogWidth(body) {
        const pct = ((Math.log10(body.diameterKm) - baseLog) / span) * 100;
        return Math.max(2, Math.min(100, pct));
      });
    }

    // Default: Linear scale relative to the Sun's diameter.
    return validBodies.map(function mapLinearWidth(body) {
      const pct = (body.diameterKm / maxDiameter) * 100;
      return Math.max(0.2, Math.min(100, pct));
    });
  }

  /**
   * Renders the Scale Comparison Chart into #scale-section.
   */
  function renderScaleSection() {
    const section = document.getElementById("scale-section");
    if (!section) {
      return;
    }

    // Validate chart data: diameters must be finite positive numbers.
    const validBodies = Array.isArray(SCALE_BODIES)
      ? SCALE_BODIES.filter(function validateBody(body) {
          return (
            body &&
            typeof body.name === "string" &&
            body.name.trim() !== "" &&
            typeof body.diameterKm === "number" &&
            Number.isFinite(body.diameterKm) &&
            body.diameterKm > 0
          );
        })
      : [];

    const header = document.createElement("div");
    header.className = "scale-header";

    const badge = document.createElement("div");
    badge.className = "badge-tag";
    badge.textContent = "Interactive Diagram";

    const heading = document.createElement("h2");
    heading.id = "scale-heading";
    heading.textContent = "Solar System Scale Comparison";

    const subtitle = document.createElement("p");
    subtitle.textContent =
      "Compare the diameters of the Sun and all eight planets. Switch between linear and logarithmic scales, then select any bar to inspect its exact size.";

    header.append(badge, heading, subtitle);

    if (validBodies.length === 0) {
      const emptyChart = document.createElement("p");
      emptyChart.className = "status-message";
      emptyChart.textContent =
        "Scale comparison data is unavailable or contains no valid positive diameters.";
      section.replaceChildren(header, emptyChart);
      return;
    }

    const controls = document.createElement("div");
    controls.className = "scale-controls";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", "Scale mode selector");

    const linearBtn = document.createElement("button");
    linearBtn.type = "button";
    linearBtn.className = "outline-btn";
    linearBtn.textContent = "Linear scale";

    const logBtn = document.createElement("button");
    logBtn.type = "button";
    logBtn.className = "outline-btn";
    logBtn.textContent = "Logarithmic scale";

    controls.append(linearBtn, logBtn);

    const chartContainer = document.createElement("div");
    chartContainer.className = "scale-chart";

    const readout = document.createElement("p");
    readout.className = "scale-readout";
    readout.id = "scale-readout";
    readout.setAttribute("aria-live", "polite");
    readout.textContent =
      "Click or press Tab and Enter on any bar to view its name and diameter.";

    /**
     * Updates the readout box and visual selection highlight for a chosen body.
     */
    function selectBody(body) {
      if (!body) {
        return;
      }
      selectedBodyId = body.id;
      readout.textContent =
        body.name +
        " — Diameter: " +
        body.diameterKm.toLocaleString("en-US") +
        " km (" +
        body.type +
        ")";

      const allButtons = chartContainer.querySelectorAll(".scale-bar-btn");
      allButtons.forEach(function syncSelected(btn) {
        const isMatch = btn.dataset.bodyId === selectedBodyId;
        btn.classList.toggle("selected", isMatch);
        btn.setAttribute("aria-pressed", String(isMatch));
      });
    }

    /**
     * Re-renders all horizontal bars using the active scale mode.
     */
    function renderBars() {
      const isLinear = currentScaleMode === "linear";
      linearBtn.classList.toggle("active", isLinear);
      linearBtn.setAttribute("aria-pressed", String(isLinear));
      logBtn.classList.toggle("active", !isLinear);
      logBtn.setAttribute("aria-pressed", String(!isLinear));

      const widths = computeBarWidths(validBodies, currentScaleMode);
      const fragment = document.createDocumentFragment();

      validBodies.forEach(function buildBarRow(body, index) {
        // Using a native <button> provides built-in Tab focus and Enter/Space activation.
        const rowBtn = document.createElement("button");
        rowBtn.type = "button";
        rowBtn.className = "scale-bar-btn";
        rowBtn.dataset.bodyId = body.id;

        const isSelected = body.id === selectedBodyId;
        rowBtn.classList.toggle("selected", isSelected);
        rowBtn.setAttribute("aria-pressed", String(isSelected));
        rowBtn.setAttribute(
          "aria-label",
          body.name + ", diameter " + body.diameterKm.toLocaleString("en-US") + " km"
        );

        const labelSpan = document.createElement("span");
        labelSpan.className = "scale-label";
        labelSpan.textContent = body.name;

        const trackSpan = document.createElement("span");
        trackSpan.className = "scale-track";

        const fillSpan = document.createElement("span");
        fillSpan.className = "scale-fill";
        fillSpan.style.width = widths[index].toFixed(2) + "%";
        trackSpan.appendChild(fillSpan);

        const valueSpan = document.createElement("span");
        valueSpan.className = "scale-value";
        valueSpan.textContent = body.diameterKm.toLocaleString("en-US") + " km";

        rowBtn.append(labelSpan, trackSpan, valueSpan);

        rowBtn.addEventListener("click", function handleBarActivate() {
          selectBody(body);
        });

        // Explicit Enter handler reinforces keyboard support alongside native button activation.
        rowBtn.addEventListener("keydown", function handleBarKeydown(event) {
          if (event.key === "Enter") {
            event.preventDefault();
            selectBody(body);
          }
        });

        fragment.appendChild(rowBtn);
      });

      chartContainer.replaceChildren(fragment);
    }

    linearBtn.addEventListener("click", function handleLinearClick() {
      currentScaleMode = "linear";
      renderBars();
    });

    logBtn.addEventListener("click", function handleLogClick() {
      currentScaleMode = "logarithmic";
      renderBars();
    });

    section.replaceChildren(header, controls, chartContainer, readout);
    renderBars();
  }

  /**
   * Renders the Wing I navigation buttons from WING_LINKS.
   */
  function renderWingLinks() {
    const linksContainer = document.getElementById("wing-links");
    if (!linksContainer) {
      return;
    }

    if (!Array.isArray(WING_LINKS) || WING_LINKS.length === 0) {
      return;
    }

    const fragment = document.createDocumentFragment();
    WING_LINKS.forEach(function buildLink(linkInfo) {
      if (!linkInfo || !linkInfo.href || !linkInfo.label) {
        return;
      }
      const anchor = document.createElement("a");
      anchor.className = "gold-btn";
      anchor.href = linkInfo.href;
      anchor.textContent = linkInfo.label;
      fragment.appendChild(anchor);
    });

    linksContainer.replaceChildren(fragment);
  }

  // Initialize all sections once the DOM is ready.
  renderPageHeader();
  renderFeaturedExhibits();
  renderScaleSection();
  renderWingLinks();
})();
