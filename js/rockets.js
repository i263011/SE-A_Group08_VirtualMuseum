/* ==========================================================================
   WING IV — HISTORIC & MODERN ROCKETS
   To-scale height & payload comparison, matcher calculator & live manifest form
   ========================================================================== */

(function () {
  const ROCKETS_DATA = [
    {
      id: 'saturn-v',
      name: 'Saturn V',
      era: '1967–1973 • NASA / Apollo',
      category: 'historic',
      firstFlight: 1967,
      heightM: 110.6,
      diameterM: 10.1,
      leoKg: 140000,
      gtoKg: 48600,
      tliKg: 48600,
      thrustKn: 34500,
      costMillion: 185,
      reusable: false,
      stages: '3 stages (S-IC, S-II, S-IVB) • RP-1/LOX & LH2/LOX',
      engines: '5× Rocketdyne F-1 (Stage 1) + 6× J-2 (Upper stages)',
      img: '../images/rocket-saturn-v.svg',
      alt: 'To-scale vertical illustration of the 110.6-meter Saturn V Moon rocket',
      summary: 'Built to carry Apollo astronauts to the Moon, Saturn V delivered 140 metric tons to Low Earth Orbit and launched Skylab in 1973.'
    },
    {
      id: 'space-shuttle',
      name: 'Space Shuttle',
      era: '1981–2011 • NASA / STS',
      category: 'historic',
      firstFlight: 1981,
      heightM: 56.1,
      diameterM: 8.7,
      leoKg: 27500,
      gtoKg: 3810,
      tliKg: 0,
      thrustKn: 30160,
      costMillion: 450,
      reusable: true,
      stages: 'Orbiter + External Tank + 2 Solid Rocket Boosters',
      engines: '3× RS-25 SSME + 2× 5-segment Solid Rocket Boosters',
      img: '../images/rocket-space-shuttle.svg',
      alt: 'To-scale vertical illustration of the 56.1-meter Space Shuttle stack with orange external tank and twin boosters',
      summary: 'The first partially reusable orbital spacecraft system, ferrying crews, the Hubble Space Telescope, and ISS truss modules across 135 flights.'
    },
    {
      id: 'falcon-9',
      name: 'Falcon 9 Block 5',
      era: '2010–Present • SpaceX',
      category: 'reusable',
      firstFlight: 2010,
      heightM: 70.0,
      diameterM: 3.7,
      leoKg: 22800,
      gtoKg: 8300,
      tliKg: 4020,
      thrustKn: 7607,
      costMillion: 67,
      reusable: true,
      stages: '2 stages • Propulsively landed first stage + fairing reuse',
      engines: '9× Merlin 1D (Stage 1) + 1× Merlin Vacuum (Stage 2)',
      img: '../images/rocket-falcon-9.svg',
      alt: 'To-scale vertical illustration of the 70-meter Falcon 9 reusable two-stage rocket',
      summary: 'Pioneered routine orbital booster landings on ocean drone ships, making orbital spaceflight dramatically more frequent and affordable.'
    },
    {
      id: 'starship',
      name: 'Starship & Super Heavy',
      era: '2023–Present • SpaceX',
      category: 'superheavy',
      firstFlight: 2023,
      heightM: 121.0,
      diameterM: 9.0,
      leoKg: 150000,
      gtoKg: 21000,
      tliKg: 100000,
      thrustKn: 74400,
      costMillion: 90,
      reusable: true,
      stages: '2 fully reusable stainless-steel stages (orbital refueling capable)',
      engines: '33× Raptor (Booster) + 6× Raptor (Ship) • Liquid Methane/LOX',
      img: '../images/rocket-starship.svg',
      alt: 'To-scale vertical illustration of the 121-meter stainless-steel Starship and Super Heavy rocket',
      summary: 'The tallest and most powerful rocket ever built, designed for 100% rapid reusability, Artemis lunar landers, and deep-space cargo.'
    }
  ];

  const { openModal, toggleSavedExhibit, isExhibitSaved, getPref, setPref, escapeHtml } = window.StellariumWing4;

  let unitSystem = getPref('rocketUnits', 'metric'); // 'metric' or 'imperial'
  let barMetric = 'leo';
  let activeFilter = 'all';
  let searchQuery = '';
  let sortMode = 'height-desc';
  let selectedScaleId = 'starship';

  function formatHeight(m) {
    return unitSystem === 'metric' ? `${m.toFixed(1)} m` : `${(m * 3.28084).toFixed(0)} ft`;
  }

  function formatMass(kg) {
    if (!kg) return 'N/A (LEO only)';
    return unitSystem === 'metric'
      ? `${(kg / 1000).toFixed(1)} t (${kg.toLocaleString()} kg)`
      : `${Math.round(kg * 2.20462).toLocaleString()} lbs`;
  }

  function formatThrust(kn) {
    return unitSystem === 'metric'
      ? `${kn.toLocaleString()} kN`
      : `${Math.round(kn * 224.809).toLocaleString()} lbf`;
  }

  /* ------------------------------------------------------------------------
     TO-SCALE HEIGHT VISUALIZATION & HORIZONTAL PAYLOAD BARS
     ------------------------------------------------------------------------ */
  function renderScaleStage() {
    const grid = document.getElementById('rocketScaleGrid');
    const maxH = 121.0; // Starship reference height

    grid.innerHTML = ROCKETS_DATA.map(r => {
      const pxHeight = Math.round((r.heightM / maxH) * 275);
      return `
        <div class="scale-col ${r.id === selectedScaleId ? 'active' : ''}" tabindex="0" role="button" data-scale-id="${escapeHtml(r.id)}" aria-label="Inspect ${escapeHtml(r.name)} (${formatHeight(r.heightM)})">
          <div class="scale-rocket-wrap">
            <img class="scale-rocket-img" src="${escapeHtml(r.img)}" alt="${escapeHtml(r.alt)}" style="height:${pxHeight}px;">
          </div>
          <div class="scale-meta">
            <h3>${escapeHtml(r.name)}</h3>
            <div class="scale-stat-line">${formatHeight(r.heightM)} tall</div>
            <div class="scale-stat-line" style="color:var(--gold-light);">LEO: ${formatMass(r.leoKg)}</div>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('[data-scale-id]').forEach(col => {
      const activate = () => {
        selectedScaleId = col.getAttribute('data-scale-id');
        renderScaleStage();
        openRocketModal(selectedScaleId);
      };
      col.addEventListener('click', activate);
      col.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function renderPayloadBars() {
    const wrap = document.getElementById('payloadBarChart');
    const maxVal = barMetric === 'leo' ? 150000 : barMetric === 'gto' ? 48600 : 74400;

    wrap.innerHTML = ROCKETS_DATA.map(r => {
      const raw = barMetric === 'leo' ? r.leoKg : barMetric === 'gto' ? r.gtoKg : r.thrustKn;
      const pct = Math.max(4, Math.round((raw / maxVal) * 100));
      const label = barMetric === 'thrust' ? formatThrust(raw) : formatMass(raw);

      return `
        <div class="payload-row">
          <strong style="color:var(--gold-light);">${escapeHtml(r.name)}</strong>
          <div class="payload-track" aria-hidden="true">
            <div class="payload-fill" style="width:${raw === 0 ? 0 : pct}%;"></div>
          </div>
          <span style="font-size:0.9rem; color:var(--text-bright);">${escapeHtml(label)}</span>
        </div>
      `;
    }).join('');
  }

  /* ------------------------------------------------------------------------
     DATA & DISPLAY: FILTERED & SORTED ROCKET CARDS
     ------------------------------------------------------------------------ */
  function renderRocketCards() {
    const grid = document.getElementById('rocketsCardGrid');
    const countEl = document.getElementById('rocketCount');

    let items = ROCKETS_DATA.filter(r => {
      const catOk = activeFilter === 'all' ||
        (activeFilter === 'historic' && r.category === 'historic') ||
        (activeFilter === 'reusable' && r.reusable) ||
        (activeFilter === 'superheavy' && r.leoKg >= 100000);

      const q = searchQuery.trim().toLowerCase();
      const textOk = !q || r.name.toLowerCase().includes(q) || r.era.toLowerCase().includes(q) || r.engines.toLowerCase().includes(q);
      return catOk && textOk;
    });

    items.sort((a, b) => {
      if (sortMode === 'height-desc') return b.heightM - a.heightM;
      if (sortMode === 'payload-desc') return b.leoKg - a.leoKg;
      return a.firstFlight - b.firstFlight;
    });

    countEl.textContent = `Showing ${items.length} of ${ROCKETS_DATA.length} launch vehicles`;

    if (!items.length) {
      grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:1.5rem;">No rockets match that filter.</p>';
      return;
    }

    grid.innerHTML = items.map(r => {
      const saved = isExhibitSaved(r.id);
      return `
        <article class="exhibit-card">
          <div>
            <img src="${escapeHtml(r.img)}" alt="${escapeHtml(r.alt)}" style="object-fit:contain; background:#020b1a; padding:0.5rem;">
            <span class="badge-tag">${escapeHtml(r.era)}</span>
            <h3>${escapeHtml(r.name)}</h3>
            <ul class="stat-list">
              <li><strong>Height:</strong> ${escapeHtml(formatHeight(r.heightM))}</li>
              <li><strong>LEO Payload:</strong> ${escapeHtml(formatMass(r.leoKg))}</li>
              <li><strong>Liftoff Thrust:</strong> ${escapeHtml(formatThrust(r.thrustKn))}</li>
              <li><strong>Reusability:</strong> ${r.reusable ? 'Reusable Components' : 'Fully Expendable'}</li>
            </ul>
            <p>${escapeHtml(r.summary)}</p>
          </div>
          <div class="card-actions-row">
            <button type="button" class="outline-btn" data-rocket-detail="${escapeHtml(r.id)}">Engineering Specs</button>
            <button type="button" class="outline-btn ${saved ? 'active' : ''}" data-rocket-save="${escapeHtml(r.id)}">${saved ? 'Saved ✓' : 'Save'}</button>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('[data-rocket-detail]').forEach(btn => {
      btn.addEventListener('click', () => openRocketModal(btn.getAttribute('data-rocket-detail')));
    });

    grid.querySelectorAll('[data-rocket-save]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rocket = ROCKETS_DATA.find(r => r.id === btn.getAttribute('data-rocket-save'));
        if (!rocket) return;
        toggleSavedExhibit({
          id: rocket.id,
          title: rocket.name,
          wing: 'Wing IV • Rockets',
          page: 'rockets.html',
          summary: `${formatHeight(rocket.heightM)} tall • LEO ${formatMass(rocket.leoKg)}`
        });
        renderRocketCards();
      });
    });
  }

  function openRocketModal(id) {
    const r = ROCKETS_DATA.find(item => item.id === id);
    if (!r) return;
    document.getElementById('rocketModalSubtitle').textContent = r.era;
    document.getElementById('rocketModalTitle').textContent = r.name;
    document.getElementById('rocketModalBody').innerHTML = `
      <div style="display:grid; grid-template-columns: 160px 1fr; gap:1.5rem; align-items:center;">
        <img src="${escapeHtml(r.img)}" alt="${escapeHtml(r.alt)}" style="height:260px; object-fit:contain; margin:0 auto; background:#020b1a; border:1px solid var(--gold-dark); padding:0.5rem;">
        <div>
          <p style="margin-bottom:1rem;">${escapeHtml(r.summary)}</p>
          <ul class="stat-list">
            <li><strong>Height × Diameter:</strong> ${escapeHtml(formatHeight(r.heightM))} × ${r.diameterM} m</li>
            <li><strong>LEO Capacity:</strong> ${escapeHtml(formatMass(r.leoKg))}</li>
            <li><strong>GTO / Deep-Space:</strong> ${escapeHtml(formatMass(r.gtoKg))}</li>
            <li><strong>Architecture:</strong> ${escapeHtml(r.stages)}</li>
            <li><strong>Propulsion:</strong> ${escapeHtml(r.engines)}</li>
            <li><strong>Est. Flight Cost:</strong> ~$${r.costMillion}M USD</li>
          </ul>
        </div>
      </div>
    `;
    openModal('rocketDetailModal');
  }

  /* ------------------------------------------------------------------------
     LOGIC & CALCULATION: PAYLOAD & ORBIT MATCHER
     ------------------------------------------------------------------------ */
  function initMatcher() {
    const massInput = document.getElementById('calcPayloadMass');
    const orbitSelect = document.getElementById('calcOrbit');
    const prioSelect = document.getElementById('calcPriority');

    function calculateMatch() {
      const rawMass = Math.max(100, Number(massInput.value) || 18000);
      const massKg = unitSystem === 'metric' ? rawMass : rawMass / 2.20462;
      const orbit = orbitSelect.value;
      const priority = prioSelect.value;

      const capKey = orbit === 'leo' ? 'leoKg' : orbit === 'gto' ? 'gtoKg' : 'tliKg';

      let pool = ROCKETS_DATA.filter(r => r[capKey] > 0);
      if (priority === 'reusable') {
        pool = pool.filter(r => r.reusable);
      }

      const evaluated = pool.map(r => {
        const cap = r[capKey];
        const launches = Math.ceil(massKg / cap);
        const totalCost = launches * r.costMillion;
        const util = Math.min(100, (massKg / (launches * cap)) * 100);
        return { rocket: r, launches, totalCost, util };
      });

      evaluated.sort((a, b) => {
        if (priority === 'capacity') {
          return a.launches - b.launches || b.rocket[capKey] - a.rocket[capKey];
        }
        return a.totalCost - b.totalCost || a.launches - b.launches;
      });

      const best = evaluated[0];
      if (!best) return;

      document.getElementById('matchBestRocket').textContent = best.rocket.name;
      document.getElementById('matchUtilization').textContent = best.util.toFixed(1) + '%';
      document.getElementById('matchLaunches').textContent = String(best.launches);
      document.getElementById('matchCost').textContent = '$' + best.totalCost.toLocaleString() + 'M';
      document.getElementById('matchSummaryNote').textContent =
        `${best.rocket.name} carries ${formatMass(best.rocket[capKey])} to ${orbit.toUpperCase()}, completing your ${Math.round(massKg).toLocaleString()} kg mission in ${best.launches} launch${best.launches > 1 ? 'es' : ''}.`;
    }

    massInput.addEventListener('input', calculateMatch);
    orbitSelect.addEventListener('change', calculateMatch);
    prioSelect.addEventListener('change', calculateMatch);
    return calculateMatch;
  }

  /* ------------------------------------------------------------------------
     ACCORDION & LIVE-VALIDATED MANIFEST FORM
     ------------------------------------------------------------------------ */
  function initAccordion() {
    document.querySelectorAll('#rocketAccordion .accordion-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.accordion-item');
        const isOpen = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
        btn.querySelector('span:last-child').textContent = isOpen ? '−' : '+';
      });
    });
  }

  function initManifestForm() {
    const form = document.getElementById('manifestForm');
    const status = document.getElementById('manifestFormStatus');

    const fields = {
      mission: {
        el: document.getElementById('manMission'),
        err: document.getElementById('errManMission'),
        validate: v => v.trim().length >= 3 ? '' : 'Mission name must be at least 3 characters.'
      },
      email: {
        el: document.getElementById('manEmail'),
        err: document.getElementById('errManEmail'),
        validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid mission lead email.'
      },
      vehicle: {
        el: document.getElementById('manVehicle'),
        err: document.getElementById('errManVehicle'),
        validate: v => v ? '' : 'Select a launch vehicle.'
      },
      mass: {
        el: document.getElementById('manMass'),
        err: document.getElementById('errManMass'),
        validate: v => {
          const n = Number(v);
          return (!Number.isNaN(n) && n >= 50 && n <= 150000) ? '' : 'Payload mass must be between 50 and 150,000 kg.';
        }
      }
    };

    function validateField(key) {
      const f = fields[key];
      const msg = f.validate(f.el.value);
      f.err.textContent = msg;
      f.el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }

    Object.keys(fields).forEach(k => {
      fields[k].el.addEventListener('input', () => validateField(k));
      fields[k].el.addEventListener('blur', () => validateField(k));
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const ok = Object.keys(fields).map(validateField).every(Boolean);
      if (!ok) {
        status.className = 'form-status visible error';
        status.textContent = 'Please fix the highlighted manifest fields before logging.';
        return;
      }

      const payload = {
        mission: fields.mission.el.value.trim(),
        email: fields.email.el.value.trim(),
        vehicle: fields.vehicle.el.value,
        mass: fields.mass.el.value
      };

      try {
        localStorage.setItem('stellarium_last_manifest', JSON.stringify(payload));
      } catch (err) { /* ignore */ }

      status.className = 'form-status visible';
      status.textContent = `Launch manifest "${payload.mission}" (${Number(payload.mass).toLocaleString()} kg) assigned to ${payload.vehicle}. Confirmation sent to ${payload.email}.`;
      form.reset();
      Object.keys(fields).forEach(k => fields[k].el.setAttribute('aria-invalid', 'false'));
    });
  }

  /* ------------------------------------------------------------------------
     INITIALIZE PAGE
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    const recalculateMatcher = initMatcher();

    function applyUnits(nextUnits) {
      unitSystem = nextUnits;
      setPref('rocketUnits', nextUnits);
      document.getElementById('unitMetricBtn').classList.toggle('active', nextUnits === 'metric');
      document.getElementById('unitImperialBtn').classList.toggle('active', nextUnits === 'imperial');
      document.querySelectorAll('.unit-mass-label').forEach(el => {
        el.textContent = nextUnits === 'metric' ? 'kg' : 'lbs';
      });
      renderScaleStage();
      renderPayloadBars();
      renderRocketCards();
      recalculateMatcher();
    }

    document.getElementById('unitMetricBtn').addEventListener('click', () => applyUnits('metric'));
    document.getElementById('unitImperialBtn').addEventListener('click', () => applyUnits('imperial'));

    document.querySelectorAll('[data-bar-metric]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-bar-metric]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        barMetric = btn.getAttribute('data-bar-metric');
        renderPayloadBars();
      });
    });

    document.querySelectorAll('#rocketFilters button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#rocketFilters button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        renderRocketCards();
      });
    });

    document.getElementById('rocketSearch').addEventListener('input', e => {
      searchQuery = e.target.value;
      renderRocketCards();
    });

    document.getElementById('rocketSort').addEventListener('change', e => {
      sortMode = e.target.value;
      renderRocketCards();
    });

    initAccordion();
    initManifestForm();
    applyUnits(unitSystem);

    document.addEventListener('stellarium:savedChanged', renderRocketCards);
  });
})();
