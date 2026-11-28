/* ==========================================================================
   STELLARIUM — WING I: INNER ROCKY PLANETS (inner-planets.js)
   Renders Mercury, Venus, Earth, and Mars from a structured data array,
   powers live search/sorting, calculates weight across all four planets,
   saves favorites to localStorage ("stellariumSaved"), and manages the modal.
   ========================================================================== */

(function initInnerPlanetsPage() {
  "use strict";

  const STORAGE_KEY = "stellariumSaved";
  const EARTH_STANDARD_GRAVITY = 9.81;

  // ------------------------------------------------------------------------
  // 1. STRUCTURED PLANET DATA ARRAY
  // Figures cross-checked against NASA GSFC Planetary Fact Sheets.
  // ------------------------------------------------------------------------
  const INNER_PLANETS = [
    {
      id: "mercury",
      name: "Mercury",
      badge: "Planet 01 • Closest to the Sun",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg",
      imageAlt:
        "True-color mosaic of Mercury captured by NASA's MESSENGER spacecraft",
      description:
        "The smallest and innermost planet in our Solar System, Mercury is a heavily cratered world with an oversized iron core. Lacking a thick blanket of air to trap heat, its surface swings from scorching daytime highs near 430 °C to freezing nights around -180 °C, averaging 167 °C.",
      avgTempC: 167,
      gravity: 3.7,
      atmosphere: "Almost no atmosphere (a thin exosphere)",
      dayLength: "176 Earth days (4,222.6 hrs solar day)",
      moons: 0
    },
    {
      id: "venus",
      name: "Venus",
      badge: "Planet 02 • Runaway Greenhouse",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg",
      imageAlt:
        "Natural-color view of Venus wrapped in thick yellowish-white clouds, from Mariner 10 data",
      description:
        "Similar in size and mass to Earth, Venus is hidden beneath thick sulfuric-acid clouds and a dense carbon dioxide atmosphere that traps intense heat. It spins slowly backwards (retrograde), taking 243 Earth days for one sidereal spin and 116.8 Earth days from sunrise to sunrise.",
      avgTempC: 464,
      gravity: 8.87,
      atmosphere: "96% carbon dioxide with crushing pressure",
      dayLength: "116.8 Earth days (2,802 hrs solar day)",
      moons: 0
    },
    {
      id: "earth",
      name: "Earth",
      badge: "Planet 03 • Ocean World",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg",
      imageAlt:
        "The Blue Marble photograph of Earth taken by the Apollo 17 crew in 1972",
      description:
        "Our home planet is the largest terrestrial world and the only known world with liquid surface oceans and living ecosystems. Its protective magnetic field and nitrogen-oxygen atmosphere shield life from solar radiation while stabilizing surface temperatures.",
      avgTempC: 15,
      gravity: 9.81,
      atmosphere: "78% nitrogen and 21% oxygen",
      dayLength: "24.0 hours",
      moons: 1
    },
    {
      id: "mars",
      name: "Mars",
      badge: "Planet 04 • The Red Planet",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg",
      imageAlt:
        "True-color image of Mars showing rust-colored plains and polar ice, captured by ESA's Rosetta",
      description:
        "Iron-rich dust gives Mars its signature crimson hue across vast volcanic plateaus and deep canyons like Valles Marineris. Ancient river deltas and polar ice caps show it once held flowing water, and today two small captured moons, Phobos and Deimos, orbit overhead.",
      avgTempC: -65,
      gravity: 3.71,
      atmosphere: "Very thin carbon dioxide air",
      dayLength: "24.7 hours",
      moons: 2
    }
  ];

  // ------------------------------------------------------------------------
  // 2. DOM ELEMENT REFERENCES & MODAL STATE
  // ------------------------------------------------------------------------
  const gridEl = document.getElementById("planets-grid");
  const searchInput = document.getElementById("planet-search");
  const sortSelect = document.getElementById("planet-sort");

  const weightForm = document.getElementById("weight-form");
  const weightInput = document.getElementById("earth-weight");
  const weightFeedback = document.getElementById("weight-feedback");
  const weightResults = document.getElementById("weight-results");

  const modalBackdrop = document.getElementById("planet-modal");
  const modalCloseBtn = document.getElementById("modal-close");
  const modalBadge = document.getElementById("modal-badge");
  const modalTitle = document.getElementById("modal-title");
  const modalMedia = document.getElementById("modal-media");
  const modalDescription = document.getElementById("modal-description");
  const modalStats = document.getElementById("modal-stats");

  // Keeps track of the "View details" button that opened the modal so focus returns to it.
  let lastFocusedButton = null;

  // ------------------------------------------------------------------------
  // 3. SAFE LOCALSTORAGE HELPERS
  // ------------------------------------------------------------------------

  /**
   * Reads the JSON array of saved IDs from localStorage under "stellariumSaved".
   * Returns { ok, ids, message } so callers can show errors without crashing.
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

      // Filter to valid non-empty strings so corrupted entries do not break rendering.
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
   * Writes the full array of saved IDs back to localStorage safely.
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
  // 4. SHARED UI BUILDERS (IMAGE FALLBACK & STATS LIST)
  // ------------------------------------------------------------------------

  /**
   * Creates a .media-frame containing an <img> and an onerror fallback placeholder
   * matching the styled placeholder used on pages/solar-system.html.
   */
  function createExhibitImage(imageUrl, imageAlt) {
    const frame = document.createElement("div");
    frame.className = "media-frame";

    const safeUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";
    const safeAlt = typeof imageAlt === "string" && imageAlt.trim()
      ? imageAlt.trim()
      : "Inner planet exhibit photograph";

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
    // Attach the error listener before assigning src so instant failures are caught.
    img.addEventListener("error", showPlaceholder);
    img.src = safeUrl;

    frame.appendChild(img);
    return frame;
  }

  /**
   * Formats a planet's statistics into an array of { label, value } pairs.
   */
  function getPlanetStats(planet) {
    const tempText = Number.isFinite(planet.avgTempC)
      ? planet.avgTempC + " °C"
      : "Unavailable";
    const gravityText = Number.isFinite(planet.gravity)
      ? planet.gravity + " m/s²"
      : "Unavailable";
    const moonText = typeof planet.moons === "number" && Number.isFinite(planet.moons)
      ? String(planet.moons)
      : "Unavailable";

    return [
      { label: "Surface Temperature", value: tempText },
      { label: "Gravity", value: gravityText },
      { label: "Atmosphere", value: planet.atmosphere || "Unavailable" },
      { label: "Day Length", value: planet.dayLength || "Unavailable" },
      { label: "Moons", value: moonText }
    ];
  }

  /**
   * Builds a <ul class="stat-list"> element for a planet object.
   */
  function buildStatList(planet) {
    const statList = document.createElement("ul");
    statList.className = "stat-list";

    getPlanetStats(planet).forEach(function appendStat(stat) {
      const li = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = stat.label + ": ";
      const valueNode = document.createTextNode(stat.value);
      li.append(strong, valueNode);
      statList.appendChild(li);
    });

    return statList;
  }

  // ------------------------------------------------------------------------
  // 5. SAVE BUTTON SYNC & CARD RENDERING
  // ------------------------------------------------------------------------

  /**
   * Updates the heart icon, label, ARIA pressed state, and feedback message.
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
      labelSpan.textContent = isSaved
        ? "Saved to My Collection"
        : "Save to My Collection";
    }

    if (feedbackEl) {
      feedbackEl.textContent = statusText || "";
      feedbackEl.classList.toggle("is-error", Boolean(isError));
    }
  }

  /**
   * Returns a filtered and sorted copy of INNER_PLANETS without mutating the source array.
   */
  function getFilteredAndSortedPlanets() {
    if (!Array.isArray(INNER_PLANETS)) {
      return [];
    }

    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const sortMode = sortSelect ? sortSelect.value : "default";

    // Filter out malformed entries and keep planets whose name matches the search text.
    const filtered = INNER_PLANETS.filter(function matchesSearch(planet) {
      if (!planet || typeof planet.name !== "string" || planet.name.trim() === "") {
        return false;
      }
      if (!query) {
        return true;
      }
      return planet.name.toLowerCase().indexOf(query) !== -1;
    });

    // Sort a shallow copy based on the chosen dropdown option.
    const sorted = filtered.slice();
    sorted.sort(function comparePlanets(a, b) {
      if (sortMode === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortMode === "temp-asc") {
        return a.avgTempC - b.avgTempC;
      }
      if (sortMode === "temp-desc") {
        return b.avgTempC - a.avgTempC;
      }
      if (sortMode === "gravity-asc") {
        return a.gravity - b.gravity;
      }
      if (sortMode === "gravity-desc") {
        return b.gravity - a.gravity;
      }
      return 0;
    });

    return sorted;
  }

  /**
   * Renders the planet exhibit cards into #planets-grid.
   */
  function renderPlanetCards() {
    if (!gridEl) {
      return;
    }

    if (!Array.isArray(INNER_PLANETS) || INNER_PLANETS.length === 0) {
      const missingMsg = document.createElement("p");
      missingMsg.className = "status-message";
      missingMsg.textContent = "Planet exhibit data is currently unavailable.";
      gridEl.replaceChildren(missingMsg);
      return;
    }

    const planetsToShow = getFilteredAndSortedPlanets();
    if (planetsToShow.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "status-message";
      emptyMsg.textContent = "No planets match your search.";
      gridEl.replaceChildren(emptyMsg);
      return;
    }

    const initialStorage = readSavedCollection();
    const fragment = document.createDocumentFragment();

    planetsToShow.forEach(function buildPlanetCard(planet) {
      const card = document.createElement("article");
      card.className = "exhibit-card";
      card.id = "planet-" + planet.id;

      // Planet image with styled fallback on error.
      const media = createExhibitImage(planet.imageUrl, planet.imageAlt);
      card.appendChild(media);

      const body = document.createElement("div");
      body.className = "card-body";

      const badge = document.createElement("div");
      badge.className = "badge-tag";
      badge.textContent = planet.badge || "Inner Rocky Planet";

      const title = document.createElement("h3");
      title.textContent = planet.name;

      const statList = buildStatList(planet);

      // Card action buttons: Heart Save and View Details.
      const actions = document.createElement("div");
      actions.className = "card-actions";

      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "outline-btn save-btn";

      const heart = document.createElement("span");
      heart.className = "heart-icon";
      heart.setAttribute("aria-hidden", "true");

      const saveLabel = document.createElement("span");
      saveLabel.className = "save-label";

      saveBtn.append(heart, saveLabel);

      const feedback = document.createElement("p");
      feedback.className = "save-feedback";
      feedback.setAttribute("aria-live", "polite");

      const isInitiallySaved =
        initialStorage.ok && initialStorage.ids.indexOf(planet.id) !== -1;

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
        if (!latest.ok) {
          syncSaveButtonUI(
            saveBtn,
            feedback,
            saveBtn.classList.contains("is-saved"),
            latest.message,
            true
          );
          return;
        }

        // Copy existing IDs so exhibits saved on other pages are preserved.
        const updatedIds = latest.ids.slice();
        const existingIndex = updatedIds.indexOf(planet.id);
        let nextSavedState = false;

        if (existingIndex === -1) {
          updatedIds.push(planet.id);
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

        const statusMessage = nextSavedState
          ? "Saved to My Collection."
          : "Removed from My Collection.";
        syncSaveButtonUI(saveBtn, feedback, nextSavedState, statusMessage, false);
      });

      const detailsBtn = document.createElement("button");
      detailsBtn.type = "button";
      detailsBtn.className = "outline-btn details-btn";
      detailsBtn.textContent = "View details";
      detailsBtn.addEventListener("click", function handleViewDetails() {
        openPlanetModal(planet, detailsBtn);
      });

      actions.append(saveBtn, detailsBtn, feedback);
      body.append(badge, title, statList, actions);
      card.appendChild(body);
      fragment.appendChild(card);
    });

    gridEl.replaceChildren(fragment);
  }

  // ------------------------------------------------------------------------
  // 6. WEIGHT CALCULATOR
  // ------------------------------------------------------------------------

  /**
   * Displays an inline validation error or success message for the weight tool.
   */
  function setWeightFeedback(message, isError) {
    if (!weightFeedback) {
      return;
    }
    weightFeedback.textContent = message;
    weightFeedback.classList.toggle("is-error", Boolean(isError));
  }

  /**
   * Validates the Earth weight input (required, numeric, 1 to 500 kg)
   * and renders weights for all four inner planets.
   */
  function handleWeightCalculation(event) {
    event.preventDefault();

    if (!weightInput || !weightResults) {
      return;
    }

    const rawText = weightInput.value.trim();

    // 1. Check required input.
    if (rawText === "") {
      weightResults.replaceChildren();
      setWeightFeedback("Please enter your weight in kilograms.", true);
      return;
    }

    // 2. Check strict numeric format (supports whole numbers and decimals).
    const isNumericFormat = /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(rawText);
    const earthWeight = Number(rawText);

    if (!isNumericFormat || !Number.isFinite(earthWeight)) {
      weightResults.replaceChildren();
      setWeightFeedback("Please enter a valid number (for example, 65 or 65.5).", true);
      return;
    }

    // 3. Check allowed range: between 1 and 500 kg inclusive.
    if (earthWeight < 1 || earthWeight > 500) {
      weightResults.replaceChildren();
      setWeightFeedback("Please enter a weight between 1 and 500 kg.", true);
      return;
    }

    // Valid input: calculate weight on each planet using weight * (gravity / 9.81).
    const fragment = document.createDocumentFragment();
    let validCount = 0;

    INNER_PLANETS.forEach(function buildResultCard(planet) {
      if (!planet || typeof planet.gravity !== "number" || !Number.isFinite(planet.gravity)) {
        return;
      }

      const weightOnPlanet = earthWeight * (planet.gravity / EARTH_STANDARD_GRAVITY);
      if (!Number.isFinite(weightOnPlanet)) {
        return;
      }

      validCount += 1;

      const resultCard = document.createElement("div");
      resultCard.className = "weight-result-card";

      const planetName = document.createElement("div");
      planetName.className = "weight-result-planet";
      planetName.textContent = planet.name;

      const weightValue = document.createElement("div");
      weightValue.className = "weight-result-value";
      weightValue.textContent = weightOnPlanet.toFixed(1) + " kg";

      const gravityNote = document.createElement("div");
      gravityNote.className = "weight-result-gravity";
      gravityNote.textContent = "Gravity: " + planet.gravity + " m/s²";

      resultCard.append(planetName, weightValue, gravityNote);
      fragment.appendChild(resultCard);
    });

    if (validCount === 0) {
      weightResults.replaceChildren();
      setWeightFeedback("Planet gravity data is missing, so weights cannot be calculated.", true);
      return;
    }

    setWeightFeedback(
      "Showing weights for an Earth weight of " + earthWeight + " kg:",
      false
    );
    weightResults.replaceChildren(fragment);
  }

  // ------------------------------------------------------------------------
  // 7. PLANET DETAIL MODAL
  // ------------------------------------------------------------------------

  /**
   * Opens the modal popup with the selected planet's description and stats.
   */
  function openPlanetModal(planet, triggerButton) {
    if (!modalBackdrop || !planet) {
      return;
    }

    lastFocusedButton = triggerButton || null;

    if (modalBadge) {
      modalBadge.textContent = planet.badge || "Inner Rocky Planet";
    }
    if (modalTitle) {
      modalTitle.textContent = planet.name || "Planet Exhibit";
    }
    if (modalMedia) {
      modalMedia.replaceChildren(createExhibitImage(planet.imageUrl, planet.imageAlt));
    }
    if (modalDescription) {
      modalDescription.textContent =
        planet.description || "Detailed description is currently unavailable.";
    }
    if (modalStats) {
      const builtList = buildStatList(planet);
      modalStats.replaceChildren.apply(modalStats, Array.from(builtList.children));
    }

    modalBackdrop.classList.add("open");
    modalBackdrop.setAttribute("aria-hidden", "false");

    // Move keyboard focus into the dialog to the close button.
    if (modalCloseBtn) {
      modalCloseBtn.focus();
    }
  }

  /**
   * Closes the modal popup and restores focus to the button that opened it.
   */
  function closePlanetModal() {
    if (!modalBackdrop || !modalBackdrop.classList.contains("open")) {
      return;
    }

    modalBackdrop.classList.remove("open");
    modalBackdrop.setAttribute("aria-hidden", "true");

    if (lastFocusedButton && typeof lastFocusedButton.focus === "function") {
      lastFocusedButton.focus();
    }
    lastFocusedButton = null;
  }

  // ------------------------------------------------------------------------
  // 8. EVENT LISTENERS & INITIALIZATION
  // ------------------------------------------------------------------------
  if (searchInput) {
    searchInput.addEventListener("input", renderPlanetCards);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", renderPlanetCards);
  }

  if (weightForm) {
    weightForm.addEventListener("submit", handleWeightCalculation);
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closePlanetModal);
  }

  // Close modal when clicking directly on the dark backdrop outside .modal-box.
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", function handleBackdropClick(event) {
      if (event.target === modalBackdrop) {
        closePlanetModal();
      }
    });
  }

  // Close modal with the Escape key.
  document.addEventListener("keydown", function handleModalEscape(event) {
    if (event.key === "Escape" && modalBackdrop && modalBackdrop.classList.contains("open")) {
      closePlanetModal();
    }
  });

  // Render the 2 x 2 planet grid on initial page load.
  renderPlanetCards();
})();
