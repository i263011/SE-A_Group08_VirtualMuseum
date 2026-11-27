/* ==========================================================================
   WING IV — SPACE TELESCOPES (HUBBLE vs. JWST)
   Data-driven comparison gallery, wipe slider, optics calculator & live form
   ========================================================================== */

(function () {
  const TELESCOPE_TARGETS = [
    {
      id: 'pillars-of-creation',
      title: 'Pillars of Creation (Eagle Nebula)',
      constellation: 'Serpens',
      category: 'nebula',
      distanceLy: 6500,
      hubbleYear: 2014,
      jwstYear: 2022,
      hubbleImg: '../images/hubble-pillars.svg',
      jwstImg: '../images/jwst-pillars.svg',
      hubbleAlt: 'Hubble optical view of the Pillars of Creation showing dark opaque dust columns against teal gas',
      jwstAlt: 'JWST infrared view of the Pillars of Creation showing translucent amber dust and glowing crimson newborn stars',
      hubbleNote: 'Visible light (WFC3) highlights glowing oxygen & hydrogen gas edges, while dense interstellar dust blocks stars behind the pillars.',
      jwstNote: 'Near-infrared light (NIRCam) pierces straight through the dust, revealing bright red protostars forming at the pillar tips and thousands of background stars.',
      summary: 'A 4-light-year-tall stellar nursery where ultraviolet starlight erodes molecular hydrogen columns while new stars ignite inside.',
      hubbleSpikes: '4-point cross spikes from secondary mirror support struts.',
      jwstSpikes: '6-point hexagonal diffraction spikes from 18 beryllium-gold mirror segments.'
    },
    {
      id: 'carina-cliffs',
      title: 'Cosmic Cliffs (Carina Nebula)',
      constellation: 'Carina',
      category: 'nebula',
      distanceLy: 7600,
      hubbleYear: 2007,
      jwstYear: 2022,
      hubbleImg: '../images/hubble-carina.svg',
      jwstImg: '../images/jwst-carina.svg',
      hubbleAlt: 'Hubble optical view of the Carina Nebula Cosmic Cliffs shrouded in soft misty clouds',
      jwstAlt: 'JWST infrared view of the Carina Nebula Cosmic Cliffs revealing golden copper ridges and hundreds of sparkling stars',
      hubbleNote: 'Optical wavelengths show soft dusty silhouettes along the edge of the giant gaseous cavity NGC 3324.',
      jwstNote: 'Infrared cameras expose hot ionized gas streaming off 7-light-year-tall peaks and dozens of previously hidden stellar jets.',
      summary: 'Intense ultraviolet radiation from massive young stars carves towering cosmic peaks along the edge of an expanding nebula bubble.',
      hubbleSpikes: '4-point cross spikes on foreground stars.',
      jwstSpikes: '6-point primary spikes with tiny secondary horizontal streaks.'
    },
    {
      id: 'southern-ring',
      title: 'Southern Ring Nebula (NGC 3132)',
      constellation: 'Vela',
      category: 'planetary',
      distanceLy: 2500,
      hubbleYear: 1998,
      jwstYear: 2022,
      hubbleImg: '../images/hubble-southern-ring.svg',
      jwstImg: '../images/jwst-southern-ring.svg',
      hubbleAlt: 'Hubble visible light image of the Southern Ring planetary nebula showing a single bright central star',
      jwstAlt: 'JWST infrared image of the Southern Ring nebula revealing concentric dusty shells and the hidden red white-dwarf binary',
      hubbleNote: 'Hubble clearly resolves the bright companion star inside the glowing blue-green ionized gas shell, but its dying white dwarf partner is obscured.',
      jwstNote: 'Mid- and near-infrared light unveils both binary stars at the center—including the dust-cloaked dying white dwarf—and a distant edge-on background galaxy.',
      summary: 'Expanding shells of gas and dust ejected over thousands of years by a Sun-like star at the end of its nuclear life.',
      hubbleSpikes: 'Single visible central star resolved.',
      jwstSpikes: 'Dual binary stars resolved plus intricate foamy molecular hydrogen filaments.'
    },
    {
      id: 'stephans-quintet',
      title: "Stephan's Quintet",
      constellation: 'Pegasus',
      category: 'galaxy',
      distanceLy: 290000000,
      hubbleYear: 2009,
      jwstYear: 2022,
      hubbleImg: '../images/hubble-stephans-quintet.svg',
      jwstImg: '../images/jwst-stephans-quintet.svg',
      hubbleAlt: "Hubble optical image of Stephan's Quintet showing five closely grouped galaxies",
      jwstAlt: "JWST infrared mosaic of Stephan's Quintet highlighting supersonic shockwaves and a blazing active galactic core",
      hubbleNote: 'Visible light captures glowing blue star-forming knots along spiral arms stretched by gravitational tides.',
      jwstNote: 'Infrared vision isolates a superheated supersonic shockwave tearing through intergalactic gas and pierces the dust around NGC 7319’s 24-million-solar-mass black hole.',
      summary: 'A compact group of five galaxies locked in a cosmic gravitational dance, triggering shockwaves and bursts of star birth.',
      hubbleSpikes: 'Soft diffuse stellar halos across the five galaxies.',
      jwstSpikes: 'Intense 6-point diffraction spikes radiating from the active galactic nucleus.'
    },
    {
      id: 'tarantula-nebula',
      title: 'Tarantula Nebula (30 Doradus)',
      constellation: 'Dorado',
      category: 'nebula',
      distanceLy: 161000,
      hubbleYear: 2014,
      jwstYear: 2022,
      hubbleImg: '../images/hubble-tarantula.svg',
      jwstImg: '../images/jwst-tarantula.svg',
      hubbleAlt: 'Hubble visible light image of the Tarantula Nebula showing ionized hydrogen clouds',
      jwstAlt: 'JWST infrared image of the Tarantula Nebula revealing the hollowed-out star cluster cavity and red protostars',
      hubbleNote: 'Optical filters trace glowing ionized hydrogen webs surrounding the massive R136 super star cluster in the Large Magellanic Cloud.',
      jwstNote: 'NIRCam strips away opaque dust cocoons to display tens of thousands of young stars and distant background galaxies shimmering behind the nebula.',
      summary: 'The largest and brightest star-forming region in the entire Local Group of galaxies, home to stars over 150 times the Sun’s mass.',
      hubbleSpikes: 'Dense glowing blue optical core.',
      jwstSpikes: 'Crisp hollowed dust cavity with embedded crimson protostars.'
    }
  ];

  const SPEC_TABS = {
    mirrors: `
      <h3>Primary Mirror &amp; Optical Design</h3>
      <ul class="stat-list" style="margin-top:0.85rem;">
        <li><strong>Hubble Mirror:</strong> 2.4 m (7.9 ft) single monolithic glass mirror coated in aluminum and magnesium fluoride; collecting area <strong>4.52 m²</strong>.</li>
        <li><strong>JWST Mirror:</strong> 6.5 m (21.3 ft) segmented mirror built from 18 hexagonal gold-coated beryllium panels; collecting area <strong>25.4 m²</strong> (5.6× net effective area after central obstruction, ~7.3× raw aperture ratio).</li>
        <li><strong>Why Gold?</strong> Gold reflects ~98% of infrared wavelengths, whereas standard aluminum drops efficiency across red and infrared bands.</li>
      </ul>
    `,
    orbit: `
      <h3>Orbit Location &amp; Thermal Protection</h3>
      <ul class="stat-list" style="margin-top:0.85rem;">
        <li><strong>Hubble Orbit:</strong> Low Earth Orbit (~540 km altitude), completing an orbit every 95 minutes; serviceable by astronauts (5 Space Shuttle servicing missions).</li>
        <li><strong>JWST Orbit:</strong> Sun–Earth Lagrange Point 2 (L2), <strong>1.5 million km</strong> from Earth—nearly 4× farther than the Moon.</li>
        <li><strong>Tennis-Court Sunshield:</strong> JWST carries a 5-layer Kapton sunshield keeping its instruments at cryogenic <strong>-233 °C (40 K)</strong> so its own heat does not blind its infrared sensors.</li>
      </ul>
    `,
    spectrum: `
      <h3>Wavelengths &amp; What Each Sees</h3>
      <ul class="stat-list" style="margin-top:0.85rem;">
        <li><strong>Hubble Spectrum:</strong> 0.1–2.5 micrometers (Ultraviolet, Visible Light, and a sliver of Near-Infrared). Ideal for hot young blue stars, glowing nebulae, and planetary atmospheres.</li>
        <li><strong>JWST Spectrum:</strong> 0.6–28.3 micrometers (Red Visible, Near-Infrared, and Mid-Infrared). Ideal for piercing dense dust, imaging exoplanet atmospheres, and seeing the earliest redshifted galaxies.</li>
        <li><strong>Together:</strong> Combining Hubble UV/optical data with JWST infrared maps gives astronomers a full multi-wavelength life story of stars and galaxies.</li>
      </ul>
    `
  };

  const PROPOSAL_KEY = 'stellarium_telescope_proposals';
  const { openModal, toggleSavedExhibit, isExhibitSaved, getPref, setPref, escapeHtml } = window.StellariumWing4;

  let activeTargetId = getPref('lastTelescopeId', TELESCOPE_TARGETS[0].id);
  let activeMode = getPref('telescopeCompareMode', 'dual');
  let activeFilter = 'all';
  let searchQuery = '';
  let sortMode = 'distance-asc';

  function formatLy(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(0) + ' Million ly';
    return num.toLocaleString() + ' ly';
  }

  /* ------------------------------------------------------------------------
     FEATURED STAGE (DUAL FRAMES + WIPE SLIDER)
     ------------------------------------------------------------------------ */
  function loadTargetIntoStage(id) {
    const target = TELESCOPE_TARGETS.find(t => t.id === id) || TELESCOPE_TARGETS[0];
    activeTargetId = target.id;
    setPref('lastTelescopeId', target.id);

    document.getElementById('stageHeading').textContent = target.title;
    document.getElementById('stageMeta').textContent = `Constellation: ${target.constellation} • Distance: ${formatLy(target.distanceLy)} • Hubble (${target.hubbleYear}) vs. JWST (${target.jwstYear})`;

    const dHub = document.getElementById('dualHubbleImg');
    const dJwst = document.getElementById('dualJwstImg');
    dHub.src = target.hubbleImg;
    dHub.alt = target.hubbleAlt;
    dJwst.src = target.jwstImg;
    dJwst.alt = target.jwstAlt;

    document.getElementById('dualHubbleNote').innerHTML = `<strong>Optical Insight:</strong> ${escapeHtml(target.hubbleNote)} <br><em style="color:var(--gold-main);">Optics: ${escapeHtml(target.hubbleSpikes)}</em>`;
    document.getElementById('dualJwstNote').innerHTML = `<strong>Infrared Insight:</strong> ${escapeHtml(target.jwstNote)} <br><em style="color:var(--gold-main);">Optics: ${escapeHtml(target.jwstSpikes)}</em>`;

    const wHub = document.getElementById('wipeHubbleImg');
    const wJwst = document.getElementById('wipeJwstImg');
    wHub.src = target.hubbleImg;
    wHub.alt = target.hubbleAlt;
    wJwst.src = target.jwstImg;
    wJwst.alt = target.jwstAlt;

    document.getElementById('stageScienceSummary').textContent = target.summary;
    syncStageSaveButton(target);
  }

  function syncStageSaveButton(target) {
    const btn = document.getElementById('stageSaveBtn');
    const saved = isExhibitSaved(target.id);
    btn.textContent = saved ? '✓ Saved in Collection' : 'Save Exhibit to Collection';
  }

  function setComparisonMode(mode) {
    activeMode = mode;
    setPref('telescopeCompareMode', mode);
    const isDual = mode === 'dual';

    document.getElementById('dualCompareView').hidden = !isDual;
    document.getElementById('wipeCompareView').hidden = isDual;

    const dualBtn = document.getElementById('modeDualBtn');
    const wipeBtn = document.getElementById('modeWipeBtn');
    dualBtn.classList.toggle('active', isDual);
    dualBtn.setAttribute('aria-selected', String(isDual));
    wipeBtn.classList.toggle('active', !isDual);
    wipeBtn.setAttribute('aria-selected', String(!isDual));
  }

  function initWipeSlider() {
    const viewer = document.getElementById('wipeViewer');
    const hubbleLayer = document.getElementById('wipeHubbleLayer');
    const divider = document.getElementById('wipeDivider');
    const range = document.getElementById('wipeRange');

    function updatePosition(percent) {
      const clamped = Math.max(0, Math.min(100, Number(percent)));
      hubbleLayer.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
      divider.style.left = clamped + '%';
      range.value = clamped;
    }

    range.addEventListener('input', e => updatePosition(e.target.value));

    let dragging = false;
    function setFromClientX(clientX) {
      const rect = viewer.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      updatePosition(pct);
    }

    viewer.addEventListener('pointerdown', e => {
      dragging = true;
      viewer.setPointerCapture(e.pointerId);
      setFromClientX(e.clientX);
    });
    viewer.addEventListener('pointermove', e => {
      if (dragging) setFromClientX(e.clientX);
    });
    viewer.addEventListener('pointerup', e => {
      dragging = false;
      viewer.releasePointerCapture(e.pointerId);
    });
  }

  /* ------------------------------------------------------------------------
     DATA & DISPLAY: FILTERED & SORTED GALLERY GRID
     ------------------------------------------------------------------------ */
  function renderGallery() {
    const grid = document.getElementById('telescopeGalleryGrid');
    const countEl = document.getElementById('galleryCount');

    let items = TELESCOPE_TARGETS.filter(item => {
      const matchesCat = activeFilter === 'all' || item.category === activeFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesText = !q || item.title.toLowerCase().includes(q) || item.constellation.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q);
      return matchesCat && matchesText;
    });

    items.sort((a, b) => {
      if (sortMode === 'distance-asc') return a.distanceLy - b.distanceLy;
      if (sortMode === 'distance-desc') return b.distanceLy - a.distanceLy;
      return a.title.localeCompare(b.title);
    });

    countEl.textContent = `Showing ${items.length} of ${TELESCOPE_TARGETS.length} regions`;

    if (!items.length) {
      grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:1.5rem;">No deep-space comparison pairs match that search.</p>';
      return;
    }

    grid.innerHTML = items.map(item => {
      const saved = isExhibitSaved(item.id);
      return `
        <article class="exhibit-card">
          <div>
            <div class="dual-preview-strip">
              <figure>
                <img src="${escapeHtml(item.hubbleImg)}" alt="${escapeHtml(item.hubbleAlt)}">
                <figcaption>Hubble (${item.hubbleYear})</figcaption>
              </figure>
              <figure>
                <img src="${escapeHtml(item.jwstImg)}" alt="${escapeHtml(item.jwstAlt)}">
                <figcaption>JWST (${item.jwstYear})</figcaption>
              </figure>
            </div>
            <span class="badge-tag">${escapeHtml(item.constellation)} • ${escapeHtml(formatLy(item.distanceLy))}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
          </div>
          <div class="card-actions-row">
            <button type="button" class="outline-btn" data-compare-id="${escapeHtml(item.id)}">Load in Viewer</button>
            <button type="button" class="outline-btn" data-detail-id="${escapeHtml(item.id)}">Telemetry</button>
            <button type="button" class="outline-btn ${saved ? 'active' : ''}" data-save-id="${escapeHtml(item.id)}">${saved ? 'Saved ✓' : 'Save'}</button>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('[data-compare-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        loadTargetIntoStage(btn.getAttribute('data-compare-id'));
        document.getElementById('stageHeading').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    grid.querySelectorAll('[data-detail-id]').forEach(btn => {
      btn.addEventListener('click', () => openTargetModal(btn.getAttribute('data-detail-id')));
    });

    grid.querySelectorAll('[data-save-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = TELESCOPE_TARGETS.find(t => t.id === btn.getAttribute('data-save-id'));
        if (!target) return;
        toggleSavedExhibit({
          id: target.id,
          title: target.title,
          wing: 'Wing IV • Space Telescopes',
          page: 'telescopes.html',
          summary: `Hubble vs. JWST (${formatLy(target.distanceLy)})`
        });
        renderGallery();
        if (target.id === activeTargetId) syncStageSaveButton(target);
      });
    });
  }

  function openTargetModal(id) {
    const t = TELESCOPE_TARGETS.find(item => item.id === id);
    if (!t) return;
    document.getElementById('modalSubtitle').textContent = `Constellation ${t.constellation} • ${formatLy(t.distanceLy)}`;
    document.getElementById('modalTitle').textContent = t.title;
    const hImg = document.getElementById('modalHubbleImg');
    const jImg = document.getElementById('modalJwstImg');
    hImg.src = t.hubbleImg;
    hImg.alt = t.hubbleAlt;
    jImg.src = t.jwstImg;
    jImg.alt = t.jwstAlt;

    document.getElementById('modalBody').innerHTML = `
      <p style="margin-bottom:1rem;">${escapeHtml(t.summary)}</p>
      <ul class="stat-list">
        <li><strong>Hubble Optical View (${t.hubbleYear}):</strong> ${escapeHtml(t.hubbleNote)}</li>
        <li><strong>JWST Infrared View (${t.jwstYear}):</strong> ${escapeHtml(t.jwstNote)}</li>
        <li><strong>Diffraction Signature:</strong> ${escapeHtml(t.jwstSpikes)}</li>
      </ul>
    `;
    openModal('telescopeDetailModal');
  }

  /* ------------------------------------------------------------------------
     LOGIC & CALCULATION: LIGHT-TRAVEL & MIRROR SENSITIVITY CALCULATOR
     ------------------------------------------------------------------------ */
  function initCalculator() {
    const presetSelect = document.getElementById('calcTargetPreset');
    const distInput = document.getElementById('calcDistanceInput');
    const expInput = document.getElementById('calcExposureInput');

    presetSelect.innerHTML = TELESCOPE_TARGETS.map(t => `<option value="${t.distanceLy}">${escapeHtml(t.title)}</option>`).join('') +
      '<option value="custom">Custom Distance...</option>';

    function compute() {
      const dist = Math.max(1, Number(distInput.value) || 6500);
      const exp = Math.max(0.1, Number(expInput.value) || 10);

      const hubbleArea = Math.PI * Math.pow(2.4 / 2, 2); // ~4.52 m²
      const jwstArea = Math.PI * Math.pow(6.5 / 2, 2);   // ~33.18 m² raw aperture (~25.4 m² unblocked)
      const areaRatio = jwstArea / hubbleArea;          // ~7.34×

      const yearEmitted = 2026 - dist;
      let eraLabel = '';
      if (yearEmitted >= 1) {
        eraLabel = Math.round(yearEmitted) + ' CE';
      } else {
        const bce = Math.abs(Math.round(yearEmitted));
        eraLabel = bce >= 1e6 ? (bce / 1e6).toFixed(1) + 'M yrs ago' : bce.toLocaleString() + ' BCE';
      }

      document.getElementById('outLookback').textContent = dist >= 1e6 ? (dist / 1e6).toFixed(1) + 'M yrs' : dist.toLocaleString() + ' yrs';
      document.getElementById('outEra').textContent = eraLabel;
      document.getElementById('outMirrorRatio').textContent = areaRatio.toFixed(1) + '×';
      document.getElementById('outJwstTime').textContent = (exp / areaRatio).toFixed(2) + ' hrs';
    }

    presetSelect.addEventListener('change', () => {
      if (presetSelect.value !== 'custom') {
        distInput.value = presetSelect.value;
        compute();
      }
    });
    distInput.addEventListener('input', () => {
      presetSelect.value = 'custom';
      compute();
    });
    expInput.addEventListener('input', compute);
    compute();
  }

  /* ------------------------------------------------------------------------
     FORMS & INPUT: LIVE VALIDATION + LOCALSTORAGE PROPOSALS
     ------------------------------------------------------------------------ */
  function initProposalForm() {
    const form = document.getElementById('proposalForm');
    const status = document.getElementById('proposalFormStatus');

    const fields = {
      target: {
        el: document.getElementById('propTarget'),
        err: document.getElementById('errPropTarget'),
        validate: v => v.trim().length >= 3 ? '' : 'Enter a cosmic target name (at least 3 characters).'
      },
      email: {
        el: document.getElementById('propEmail'),
        err: document.getElementById('errPropEmail'),
        validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address (e.g., name@domain.com).'
      },
      observatory: {
        el: document.getElementById('propObservatory'),
        err: document.getElementById('errPropObservatory'),
        validate: v => v ? '' : 'Please select an observatory mode.'
      },
      hours: {
        el: document.getElementById('propHours'),
        err: document.getElementById('errPropHours'),
        validate: v => {
          const n = Number(v);
          return (!Number.isNaN(n) && n >= 1 && n <= 48) ? '' : 'Exposure must be between 1 and 48 hours.';
        }
      },
      rationale: {
        el: document.getElementById('propRationale'),
        err: document.getElementById('errPropRationale'),
        validate: v => v.trim().length >= 20 ? '' : `Justification needs at least 20 characters (${v.trim().length}/20).`
      }
    };

    function validateField(key) {
      const f = fields[key];
      const message = f.validate(f.el.value);
      f.err.textContent = message;
      f.el.setAttribute('aria-invalid', message ? 'true' : 'false');
      return !message;
    }

    Object.keys(fields).forEach(key => {
      fields[key].el.addEventListener('input', () => validateField(key));
      fields[key].el.addEventListener('blur', () => validateField(key));
    });

    function renderSavedProposals() {
      const wrap = document.getElementById('savedProposalsContainer');
      let list = [];
      try {
        list = JSON.parse(localStorage.getItem(PROPOSAL_KEY) || '[]');
      } catch (e) { list = []; }

      if (!list.length) {
        wrap.innerHTML = '';
        return;
      }
      wrap.innerHTML = '<h3 style="margin-bottom:0.7rem;">Recent Submitted Target Proposals</h3>' +
        list.slice(0, 3).map(p => `
          <div class="saved-list-item">
            <div>
              <span class="badge-tag">${escapeHtml(p.observatory)} • ${escapeHtml(p.hours)} hrs</span>
              <h4 style="margin:0.15rem 0;">${escapeHtml(p.target)}</h4>
              <p style="font-size:0.9rem; margin:0;">${escapeHtml(p.rationale)}</p>
            </div>
            <span style="font-size:0.85rem; color:var(--gold-main);">${escapeHtml(p.email)}</span>
          </div>
        `).join('');
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const allValid = Object.keys(fields).map(validateField).every(Boolean);

      if (!allValid) {
        status.className = 'form-status visible error';
        status.textContent = 'Please correct the highlighted fields above before submitting.';
        return;
      }

      const entry = {
        target: fields.target.el.value.trim(),
        email: fields.email.el.value.trim(),
        observatory: fields.observatory.el.value,
        hours: fields.hours.el.value,
        rationale: fields.rationale.el.value.trim()
      };

      try {
        const existing = JSON.parse(localStorage.getItem(PROPOSAL_KEY) || '[]');
        existing.unshift(entry);
        localStorage.setItem(PROPOSAL_KEY, JSON.stringify(existing));
      } catch (err) { /* ignore storage errors */ }

      status.className = 'form-status visible';
      status.textContent = `Observation request logged for "${entry.target}" (${entry.observatory}, ${entry.hours} hrs). Confirmation queued for ${entry.email}.`;
      form.reset();
      Object.keys(fields).forEach(k => fields[k].el.setAttribute('aria-invalid', 'false'));
      renderSavedProposals();
    });

    renderSavedProposals();
  }

  /* ------------------------------------------------------------------------
     INITIALIZE PAGE
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    loadTargetIntoStage(activeTargetId);
    setComparisonMode(activeMode);
    initWipeSlider();
    renderGallery();
    initCalculator();
    initProposalForm();

    document.getElementById('modeDualBtn').addEventListener('click', () => setComparisonMode('dual'));
    document.getElementById('modeWipeBtn').addEventListener('click', () => setComparisonMode('wipe'));

    document.getElementById('stageSaveBtn').addEventListener('click', () => {
      const target = TELESCOPE_TARGETS.find(t => t.id === activeTargetId);
      if (!target) return;
      toggleSavedExhibit({
        id: target.id,
        title: target.title,
        wing: 'Wing IV • Space Telescopes',
        page: 'telescopes.html',
        summary: `Hubble vs. JWST (${formatLy(target.distanceLy)})`
      });
      syncStageSaveButton(target);
      renderGallery();
    });

    document.querySelectorAll('#targetFilters button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#targetFilters button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        renderGallery();
      });
    });

    document.getElementById('targetSearch').addEventListener('input', e => {
      searchQuery = e.target.value;
      renderGallery();
    });

    document.getElementById('targetSort').addEventListener('change', e => {
      sortMode = e.target.value;
      renderGallery();
    });

    const specContent = document.getElementById('specTabContent');
    specContent.innerHTML = SPEC_TABS.mirrors;
    document.querySelectorAll('[data-spec-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-spec-tab]').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        specContent.innerHTML = SPEC_TABS[btn.getAttribute('data-spec-tab')] || '';
      });
    });

    document.addEventListener('stellarium:savedChanged', () => {
      const target = TELESCOPE_TARGETS.find(t => t.id === activeTargetId);
      if (target) syncStageSaveButton(target);
      renderGallery();
    });
  });
})();
