/* ==========================================================================
   WING III: EXPLORATION — INTERACTIVE CONTROLLER (js/wing3.js)
   Handles Space Race timeline filtering, Apollo accessible tabs/modal/weight
   calculator, Mars/Voyager cards & sortable table, and localStorage collection.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "stellarium_collection";
  var FALLBACK_IMAGE =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360">' +
        '<rect width="600" height="360" fill="#041E42"/>' +
        '<rect x="14" y="14" width="572" height="332" fill="none" stroke="#BC9E70" stroke-width="3"/>' +
        '<circle cx="300" cy="150" r="56" fill="none" stroke="#F0CB90" stroke-width="2"/>' +
        '<circle cx="300" cy="150" r="8" fill="#F0CB90"/>' +
        '<text x="300" y="255" text-anchor="middle" fill="#F0CB90" font-family="Georgia,serif" font-size="22" letter-spacing="3">STELLARIUM ARCHIVE</text>' +
        '<text x="300" y="285" text-anchor="middle" fill="#C4C4C4" font-family="Georgia,serif" font-size="14">WING III • EXPLORATION PLATE</text>' +
      "</svg>"
    );

  /* ------------------------------------------------------------------------
     1. SAFE LOCALSTORAGE COLLECTION HELPERS
     ------------------------------------------------------------------------ */
  function readCollection() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (entry) {
        return entry && typeof entry === "object" && typeof entry.id === "string";
      });
    } catch (err) {
      return [];
    }
  }

  function writeCollection(items) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (err) {
      return false;
    }
  }

  function isItemSaved(id) {
    var items = readCollection();
    return items.some(function (entry) {
      return entry.id === id;
    });
  }

  function saveItemToCollection(item) {
    if (!item || !item.id) return false;
    var items = readCollection();
    var exists = items.some(function (entry) {
      return entry.id === item.id;
    });
    if (!exists) {
      items.push({
        id: String(item.id),
        title: String(item.title || "Untitled Exhibit"),
        page: String(item.page || ""),
        image: String(item.image || "")
      });
      writeCollection(items);
    }
    return true;
  }

  function syncSaveButtonState(button, saved) {
    if (!button) return;
    if (saved) {
      button.textContent = "Saved ";
      var check = document.createElement("span");
      check.setAttribute("aria-hidden", "true");
      check.textContent = "✓";
      button.appendChild(check);
      button.classList.add("is-saved");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.textContent = "Save to My Collection";
      button.classList.remove("is-saved");
      button.setAttribute("aria-pressed", "false");
    }
  }

  function createSaveButton(item) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "outline-btn save-btn";
    btn.dataset.saveId = item.id;
    syncSaveButtonState(btn, isItemSaved(item.id));

    btn.addEventListener("click", function () {
      saveItemToCollection(item);
      document.querySelectorAll('[data-save-id="' + CSS.escape(item.id) + '"]').forEach(function (el) {
        syncSaveButtonState(el, true);
      });
    });

    return btn;
  }

  function applyImageFallback(img) {
    if (!img) return;
    img.addEventListener("error", function handleImgError() {
      img.removeEventListener("error", handleImgError);
      img.src = FALLBACK_IMAGE;
    });
  }

  /* ------------------------------------------------------------------------
     2. PAGE 1: SPACE RACE TIMELINE (exploration.html)
     ------------------------------------------------------------------------ */
  function initExplorationPage() {
    var timelineContainer = document.getElementById("timelineList");
    if (!timelineContainer || !window.WING3_DATA) return;

    var searchInput = document.getElementById("eventSearch");
    var agencySelect = document.getElementById("agencyFilter");
    var countLabel = document.getElementById("eventsCount");
    var emptyState = document.getElementById("emptyEventsState");
    var resetBtn = document.getElementById("resetFiltersBtn");

    var events = window.WING3_DATA.spaceRaceEvents.slice().sort(function (a, b) {
      return a.year - b.year;
    });

    // Populate unique agencies in dropdown
    var agencies = [];
    events.forEach(function (ev) {
      if (agencies.indexOf(ev.agency) === -1) {
        agencies.push(ev.agency);
      }
    });
    agencies.forEach(function (agency) {
      var opt = document.createElement("option");
      opt.value = agency;
      opt.textContent = agency;
      agencySelect.appendChild(opt);
    });

    function renderEvents() {
      var query = (searchInput.value || "").trim().toLowerCase();
      var selectedAgency = agencySelect.value;

      var filtered = events.filter(function (ev) {
        var matchesAgency = selectedAgency === "all" || ev.agency === selectedAgency;
        var haystack = (ev.year + " " + ev.title + " " + ev.agency + " " + ev.description).toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        return matchesAgency && matchesQuery;
      });

      timelineContainer.innerHTML = "";
      countLabel.textContent = "Showing " + filtered.length + " of " + events.length + " milestones";

      if (filtered.length === 0) {
        emptyState.hidden = false;
        return;
      }

      emptyState.hidden = true;

      filtered.forEach(function (ev) {
        var itemWrap = document.createElement("article");
        itemWrap.className = "timeline-item";

        var marker = document.createElement("span");
        marker.className = "timeline-marker";
        marker.setAttribute("aria-hidden", "true");
        itemWrap.appendChild(marker);

        var card = document.createElement("div");
        card.className = "exhibit-card timeline-card";

        var row = document.createElement("div");
        row.className = "row g-4 align-items-center";

        var mediaCol = document.createElement("div");
        mediaCol.className = "col-md-4";
        var img = document.createElement("img");
        img.src = ev.image;
        img.alt = ev.alt || ev.title;
        img.loading = "lazy";
        img.className = "timeline-media";
        applyImageFallback(img);
        mediaCol.appendChild(img);

        var bodyCol = document.createElement("div");
        bodyCol.className = "col-md-8 d-flex flex-column";

        var header = document.createElement("div");
        header.className = "timeline-card-header";

        var yearEl = document.createElement("span");
        yearEl.className = "timeline-year";
        yearEl.textContent = String(ev.year);

        var agencyEl = document.createElement("span");
        agencyEl.className = "badge-tag";
        agencyEl.textContent = ev.agency;

        header.appendChild(yearEl);
        header.appendChild(agencyEl);

        var titleEl = document.createElement("h3");
        titleEl.textContent = ev.title;

        var descEl = document.createElement("p");
        descEl.textContent = ev.description;

        var actions = document.createElement("div");
        actions.className = "card-footer-actions";
        actions.appendChild(
          createSaveButton({
            id: ev.id,
            title: ev.year + " — " + ev.title,
            page: "exploration.html",
            image: ev.image
          })
        );

        bodyCol.appendChild(header);
        bodyCol.appendChild(titleEl);
        bodyCol.appendChild(descEl);
        bodyCol.appendChild(actions);

        row.appendChild(mediaCol);
        row.appendChild(bodyCol);
        card.appendChild(row);
        itemWrap.appendChild(card);
        timelineContainer.appendChild(itemWrap);
      });
    }

    searchInput.addEventListener("input", renderEvents);
    agencySelect.addEventListener("change", renderEvents);
    resetBtn.addEventListener("click", function () {
      searchInput.value = "";
      agencySelect.value = "all";
      renderEvents();
      searchInput.focus();
    });

    renderEvents();
  }

  /* ------------------------------------------------------------------------
     3. PAGE 2: APOLLO & LUNAR MISSIONS (apollo-missions.html)
     ------------------------------------------------------------------------ */
  function initApolloPage() {
    var tabList = document.getElementById("apolloTabList");
    if (!tabList || !window.WING3_DATA) return;

    initApolloTabs(tabList);
    initApolloGalleryAndModal();
    initWeightCalculator();
  }

  function initApolloTabs(tabList) {
    var panelsContainer = document.getElementById("apolloTabPanels");
    var missions = window.WING3_DATA.apolloMissions;
    var tabs = [];

    function activateTab(index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
        var panelId = tab.getAttribute("aria-controls");
        var panel = document.getElementById(panelId);
        if (panel) {
          panel.hidden = !selected;
        }
      });
      if (moveFocus && tabs[index]) {
        tabs[index].focus();
      }
    }

    missions.forEach(function (mission, idx) {
      var tabBtn = document.createElement("button");
      tabBtn.type = "button";
      tabBtn.id = "tab-" + mission.id;
      tabBtn.className = "outline-btn wing3-tab";
      tabBtn.setAttribute("role", "tab");
      tabBtn.setAttribute("aria-controls", "panel-" + mission.id);
      tabBtn.setAttribute("aria-selected", idx === 0 ? "true" : "false");
      tabBtn.tabIndex = idx === 0 ? 0 : -1;
      tabBtn.textContent = mission.tabLabel;

      tabBtn.addEventListener("click", function () {
        activateTab(idx, false);
      });

      tabBtn.addEventListener("keydown", function (e) {
        var nextIndex = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          nextIndex = (idx + 1) % tabs.length;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          nextIndex = (idx - 1 + tabs.length) % tabs.length;
        } else if (e.key === "Home") {
          nextIndex = 0;
        } else if (e.key === "End") {
          nextIndex = tabs.length - 1;
        }

        if (nextIndex !== null) {
          e.preventDefault();
          activateTab(nextIndex, true);
        }
      });

      tabs.push(tabBtn);
      tabList.appendChild(tabBtn);

      // Build corresponding tabpanel
      var panel = document.createElement("div");
      panel.id = "panel-" + mission.id;
      panel.className = "wing3-tabpanel";
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabBtn.id);
      panel.hidden = idx !== 0;

      var row = document.createElement("div");
      row.className = "row g-4 align-items-center";

      var imgCol = document.createElement("div");
      imgCol.className = "col-md-5";
      var img = document.createElement("img");
      img.src = mission.image;
      img.alt = mission.alt;
      img.className = "mission-panel-img";
      applyImageFallback(img);
      imgCol.appendChild(img);

      var infoCol = document.createElement("div");
      infoCol.className = "col-md-7";

      var heading = document.createElement("h3");
      heading.textContent = mission.title;

      var stats = document.createElement("ul");
      stats.className = "stat-list";
      [
        ["Mission Dates", mission.dates],
        ["Flight Crew", mission.crew],
        ["Target Zone", mission.site]
      ].forEach(function (pair) {
        var li = document.createElement("li");
        var strong = document.createElement("strong");
        strong.textContent = pair[0] + ": ";
        li.appendChild(strong);
        li.appendChild(document.createTextNode(pair[1]));
        stats.appendChild(li);
      });

      var objP = document.createElement("p");
      objP.textContent = mission.objective;

      var highP = document.createElement("p");
      highP.textContent = mission.highlights;

      infoCol.appendChild(heading);
      infoCol.appendChild(stats);
      infoCol.appendChild(objP);
      infoCol.appendChild(highP);

      row.appendChild(imgCol);
      row.appendChild(infoCol);
      panel.appendChild(row);
      panelsContainer.appendChild(panel);
    });
  }

  function initApolloGalleryAndModal() {
    var galleryGrid = document.getElementById("apolloPhotoGallery");
    var backdrop = document.getElementById("apolloModalBackdrop");
    var closeBtn = document.getElementById("apolloModalClose");
    var modalBadge = document.getElementById("apolloModalMission");
    var modalTitle = document.getElementById("apolloModalTitle");
    var modalImg = document.getElementById("apolloModalImg");
    var modalCaption = document.getElementById("apolloModalCaption");
    var lastFocused = null;

    if (!galleryGrid || !backdrop) return;

    function openModal(photo, triggerEl) {
      lastFocused = triggerEl || document.activeElement;
      modalBadge.textContent = photo.mission;
      modalTitle.textContent = photo.title;
      modalImg.src = photo.image;
      modalImg.alt = photo.alt;
      applyImageFallback(modalImg);
      modalCaption.textContent = photo.caption;

      backdrop.classList.add("open");
      backdrop.setAttribute("aria-hidden", "false");
      closeBtn.focus();
    }

    function closeModal() {
      backdrop.classList.remove("open");
      backdrop.setAttribute("aria-hidden", "true");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    closeBtn.addEventListener("click", closeModal);

    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && backdrop.classList.contains("open")) {
        closeModal();
      }
    });

    window.WING3_DATA.apolloGallery.forEach(function (photo) {
      var col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";

      var card = document.createElement("article");
      card.className = "exhibit-card";

      var img = document.createElement("img");
      img.src = photo.image;
      img.alt = photo.alt;
      img.loading = "lazy";
      applyImageFallback(img);

      var badge = document.createElement("span");
      badge.className = "badge-tag";
      badge.textContent = photo.mission;

      var title = document.createElement("h3");
      title.textContent = photo.title;

      var summary = document.createElement("p");
      summary.textContent = photo.caption;

      var actions = document.createElement("div");
      actions.className = "card-footer-actions";

      var inspectBtn = document.createElement("button");
      inspectBtn.type = "button";
      inspectBtn.className = "gold-btn";
      inspectBtn.textContent = "Inspect Plate";
      inspectBtn.addEventListener("click", function () {
        openModal(photo, inspectBtn);
      });

      actions.appendChild(inspectBtn);
      actions.appendChild(
        createSaveButton({
          id: photo.id,
          title: photo.title + " (" + photo.mission + ")",
          page: "apollo-missions.html",
          image: photo.image
        })
      );

      card.appendChild(img);
      card.appendChild(badge);
      card.appendChild(title);
      card.appendChild(summary);
      card.appendChild(actions);
      col.appendChild(card);
      galleryGrid.appendChild(col);
    });
  }

  function initWeightCalculator() {
    var form = document.getElementById("weightCalcForm");
    if (!form) return;

    var weightInput = document.getElementById("earthWeightInput");
    var errorBox = document.getElementById("weightCalcError");
    var resultBox = document.getElementById("weightCalcResult");
    var moonValueEl = document.getElementById("moonWeightOutput");
    var marsValueEl = document.getElementById("marsWeightOutput");
    var calcSummaryEl = document.getElementById("weightCalcSummary");
    var saveWrap = document.getElementById("weightSaveContainer");

    var CALC_SAVE_ID = "apollo-gravity-weight-result";
    var CALC_IMAGE = "https://images-assets.nasa.gov/image/as11-40-5903/as11-40-5903~thumb.jpg";
    var latestCalcTitle = "Lunar & Martian Gravity Calculation (Moon 16.5% / Mars 37.8%)";

    function renderCalcSaveButton() {
      saveWrap.innerHTML = "";
      var saveBtn = createSaveButton({
        id: CALC_SAVE_ID,
        title: latestCalcTitle,
        page: "apollo-missions.html",
        image: CALC_IMAGE
      });
      saveWrap.appendChild(saveBtn);
    }

    // Ensure saved state is reflected immediately on reload
    renderCalcSaveButton();

    function showError(message) {
      errorBox.textContent = message;
      errorBox.hidden = false;
      weightInput.setAttribute("aria-invalid", "true");
    }

    function clearError() {
      errorBox.textContent = "";
      errorBox.hidden = true;
      weightInput.removeAttribute("aria-invalid");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearError();

      var raw = (weightInput.value || "").trim();
      var selectedUnitEl = form.querySelector('input[name="weightUnit"]:checked');
      var unit = selectedUnitEl ? selectedUnitEl.value : "kg";

      if (raw === "") {
        resultBox.hidden = true;
        showError("Please enter your Earth weight before calculating.");
        return;
      }

      if (!/^[+-]?\d+(\.\d+)?$/.test(raw)) {
        resultBox.hidden = true;
        showError("Invalid input: please enter a numeric weight value (for example, 70 or 154.5).");
        return;
      }

      var weight = Number(raw);
      if (!Number.isFinite(weight)) {
        resultBox.hidden = true;
        showError("Invalid numeric value. Please enter a finite number.");
        return;
      }

      if (weight === 0) {
        resultBox.hidden = true;
        showError("Weight cannot be zero. Please enter a positive weight greater than 0.");
        return;
      }

      if (weight < 0) {
        resultBox.hidden = true;
        showError("Weight cannot be negative. Please enter a positive value.");
        return;
      }

      var moonWeight = (weight * 0.165).toFixed(2);
      var marsWeight = (weight * 0.378).toFixed(2);

      moonValueEl.textContent = moonWeight + " " + unit;
      marsValueEl.textContent = marsWeight + " " + unit;
      calcSummaryEl.textContent =
        "An Earth weight of " +
        weight +
        " " +
        unit +
        " equals " +
        moonWeight +
        " " +
        unit +
        " on the Moon (16.5%) and " +
        marsWeight +
        " " +
        unit +
        " on Mars (37.8%).";

      latestCalcTitle =
        "Gravity Weight: " +
        weight +
        " " +
        unit +
        " = " +
        moonWeight +
        " " +
        unit +
        " (Moon) / " +
        marsWeight +
        " " +
        unit +
        " (Mars)";

      renderCalcSaveButton();
      resultBox.hidden = false;
    });
  }

  /* ------------------------------------------------------------------------
     4. PAGE 3: MARS ROVERS & PROBES (mars-rovers.html)
     ------------------------------------------------------------------------ */
  function initMarsRoversPage() {
    var cardsGrid = document.getElementById("probesCardsGrid");
    var compareBody = document.getElementById("probesCompareBody");
    if (!cardsGrid || !compareBody || !window.WING3_DATA) return;

    var cardsTab = document.getElementById("viewCardsTab");
    var compareTab = document.getElementById("viewCompareTab");
    var cardsPanel = document.getElementById("viewCardsPanel");
    var comparePanel = document.getElementById("viewComparePanel");
    var sortYearBtn = document.getElementById("sortYearBtn");
    var yearHeader = document.getElementById("launchYearHeader");

    var probes = window.WING3_DATA.planetaryProbes.slice();
    var sortAsc = true;

    function switchView(showCompare, moveFocus) {
      cardsTab.setAttribute("aria-selected", showCompare ? "false" : "true");
      compareTab.setAttribute("aria-selected", showCompare ? "true" : "false");
      cardsTab.tabIndex = showCompare ? -1 : 0;
      compareTab.tabIndex = showCompare ? 0 : -1;
      cardsPanel.hidden = showCompare;
      comparePanel.hidden = !showCompare;

      if (moveFocus) {
        (showCompare ? compareTab : cardsTab).focus();
      }
    }

    cardsTab.addEventListener("click", function () {
      switchView(false, false);
    });
    compareTab.addEventListener("click", function () {
      switchView(true, false);
    });

    [cardsTab, compareTab].forEach(function (tab, idx) {
      tab.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End") {
          e.preventDefault();
          var nextCompare = idx === 0;
          if (e.key === "Home") nextCompare = false;
          if (e.key === "End") nextCompare = true;
          switchView(nextCompare, true);
        }
      });
    });

    // Render Cards View
    probes.forEach(function (probe) {
      var col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";

      var card = document.createElement("article");
      card.className = "exhibit-card";

      var img = document.createElement("img");
      img.src = probe.image;
      img.alt = probe.alt;
      img.loading = "lazy";
      applyImageFallback(img);

      var badge = document.createElement("span");
      badge.className = "badge-tag";
      badge.textContent = probe.type;

      var title = document.createElement("h3");
      title.textContent = probe.title;

      var stats = document.createElement("ul");
      stats.className = "stat-list";
      [
        ["Launch Year", String(probe.launchYear)],
        ["Mass", probe.mass],
        ["Goal", probe.goal],
        ["Key Discovery", probe.keyDiscovery]
      ].forEach(function (row) {
        var li = document.createElement("li");
        var strong = document.createElement("strong");
        strong.textContent = row[0] + ": ";
        li.appendChild(strong);
        li.appendChild(document.createTextNode(row[1]));
        stats.appendChild(li);
      });

      var actions = document.createElement("div");
      actions.className = "card-footer-actions";
      actions.appendChild(
        createSaveButton({
          id: probe.id,
          title: probe.title + " (" + probe.launchYear + ")",
          page: "mars-rovers.html",
          image: probe.image
        })
      );

      card.appendChild(img);
      card.appendChild(badge);
      card.appendChild(title);
      card.appendChild(stats);
      card.appendChild(actions);
      col.appendChild(card);
      cardsGrid.appendChild(col);
    });

    function renderCompareTable() {
      var sorted = probes.slice().sort(function (a, b) {
        return sortAsc ? a.launchYear - b.launchYear : b.launchYear - a.launchYear;
      });

      yearHeader.setAttribute("aria-sort", sortAsc ? "ascending" : "descending");
      sortYearBtn.textContent = "Launch Year " + (sortAsc ? "▲" : "▼");

      compareBody.innerHTML = "";
      sorted.forEach(function (probe) {
        var tr = document.createElement("tr");

        var tdName = document.createElement("td");
        var strongName = document.createElement("strong");
        strongName.style.color = "var(--gold-light)";
        strongName.textContent = probe.title;
        tdName.appendChild(strongName);

        var tdYear = document.createElement("td");
        tdYear.textContent = String(probe.launchYear);

        var tdMass = document.createElement("td");
        tdMass.textContent = probe.mass;

        var tdGoal = document.createElement("td");
        tdGoal.textContent = probe.goal;

        var tdDiscovery = document.createElement("td");
        tdDiscovery.textContent = probe.keyDiscovery;

        var tdSave = document.createElement("td");
        tdSave.appendChild(
          createSaveButton({
            id: probe.id,
            title: probe.title + " (" + probe.launchYear + ")",
            page: "mars-rovers.html",
            image: probe.image
          })
        );

        tr.appendChild(tdName);
        tr.appendChild(tdYear);
        tr.appendChild(tdMass);
        tr.appendChild(tdGoal);
        tr.appendChild(tdDiscovery);
        tr.appendChild(tdSave);
        compareBody.appendChild(tr);
      });
    }

    sortYearBtn.addEventListener("click", function () {
      sortAsc = !sortAsc;
      renderCompareTable();
    });

    renderCompareTable();
  }

  /* ------------------------------------------------------------------------
     5. BOOTSTRAP ON DOM READY
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("img").forEach(applyImageFallback);
    initExplorationPage();
    initApolloPage();
    initMarsRoversPage();
  });
})();
