/* ==========================================================================
   WING IV — INTERNATIONAL SPACE STATION (iss.html)
   Room-by-room explorer, daily routine checklist, ECLSS calculator & live form
   ========================================================================== */

(function () {
  const ISS_ROOMS = [
    {
      id: 'zvezda-galley',
      code: 'Module 01 • Eat & Dine',
      name: 'Zvezda Service Module (Galley)',
      category: 'eat',
      img: '../images/iss-galley.svg',
      alt: 'Illustration of the ISS Zvezda dining galley with tethered food pouches, tortillas, and zero-gravity foot restraints',
      dimensions: '13.1 m long • 4.15 m diameter',
      crewActivity: 'Rehydrating meals, dining & morning briefings',
      gear: 'Velcro dining table, hot/cold water dispenser, foot loops',
      description: 'Astronauts gather around a fold-down table equipped with Velcro strips and bungee cords. Food arrives thermostabilized or freeze-dried in pouches, and drinks are sipped through clamped straws so droplets never float away.',
      tip: 'Microgravity Detail: Because fluid shifts toward the head in orbit, astronauts experience mild nasal congestion—making spicy chili sauces and horseradish crew favorites!'
    },
    {
      id: 'harmony-sleep',
      code: 'Module 02 • Sleep & Rest',
      name: 'Harmony Node 2 (Sleep Stations)',
      category: 'sleep',
      img: '../images/iss-sleep.svg',
      alt: 'Illustration of a Harmony Node 2 vertical crew sleep pod with tethered sleeping bag, fan vent, and personal laptop',
      dimensions: '4 private pods • Phone-booth volume each',
      crewActivity: '8.5 hours scheduled sleep, personal calls & journaling',
      gear: 'Tethered sleeping bag, CO₂ circulation fan, acoustic foam, eye mask',
      description: 'Each astronaut claims a personal phone-booth-sized sleep station lined with sound-dampening pads. Because "up" and "down" do not exist in freefall, sleeping bags are zippered vertically to the wall.',
      tip: 'Microgravity Detail: The station sees 16 sunrises and sunsets every 24 hours, so astronauts rely on eye masks and UTC scheduling to maintain circadian rhythm.'
    },
    {
      id: 'destiny-lab',
      code: 'Module 03 • Experiments',
      name: 'Destiny & Columbus Science Labs',
      category: 'science',
      img: '../images/iss-lab.svg',
      alt: 'Illustration of the ISS Destiny and Columbus laboratories with science racks, plant habitat, and microgravity glovebox',
      dimensions: '24 International Standard Payload Racks',
      crewActivity: 'Protein crystals, fluid physics, cold atoms & space botany',
      gear: 'Microgravity Science Glovebox, Veggie plant chamber, Cold Atom Lab',
      description: 'Inside modular refrigerator-sized racks, crews conduct over 250 active experiments per expedition—studying combustion without convection, growing leafy greens under LED arrays, and testing ultra-cold quantum gases.',
      tip: 'Microgravity Detail: Enclosed gloveboxes prevent liquids, powders, or microbes from escaping into the shared cabin air.'
    },
    {
      id: 'cupola-dome',
      code: 'Module 04 • Observation',
      name: 'Cupola Earth Observation Dome',
      category: 'eva',
      img: '../images/iss-cupola.svg',
      alt: 'Illustration looking out the 7-window ISS Cupola dome at the curved blue horizon of Earth',
      dimensions: '2.95 m diameter • 7 fused-silica panes',
      crewActivity: 'Canadarm2 robotics, hurricane tracking & Earth photography',
      gear: 'Robotic workstation controls, 800 mm telephoto lenses, gold handrails',
      description: 'Attached to the Earth-facing side of Tranquility, the Cupola gives crews a 360-degree panoramic view for guiding visiting cargo spacecraft with the robotic arm and documenting climate events.',
      tip: 'Microgravity Detail: Astronauts cite the Cupola as the station’s most restorative spot for mental well-being while far from home.'
    },
    {
      id: 'quest-airlock',
      code: 'Module 05 • Spacewalks',
      name: 'Quest Joint Airlock (EVA)',
      category: 'eva',
      img: '../images/iss-airlock.svg',
      alt: 'Illustration of the ISS Quest Airlock chamber with two white EMU spacesuits ready beside the hatch',
      dimensions: '2 chambers: Equipment Lock & Crew Lock',
      crewActivity: 'Pre-breathe decompression & Extravehicular Activity (EVA)',
      gear: 'Two 127 kg EMU spacesuits, SAFER jetpacks, safety tethers',
      description: 'Before stepping into vacuum to upgrade solar arrays or cooling pumps, spacewalkers spend hours breathing pure oxygen at lowered pressure (10.2 psi) inside Quest to purge nitrogen and prevent decompression sickness.',
      tip: 'Microgravity Detail: Outside in the vacuum, every single wrench, camera, and astronaut is double-tethered to prevent drifting into orbit.'
    }
  ];

  const DAILY_ROUTINE = [
    { id: 'wake', time: '06:00 UTC', task: 'Wake in Harmony pod, sponge wash & no-rinse dental hygiene' },
    { id: 'breakfast', time: '06:45 UTC', task: 'Rehydrate breakfast pouches & morning planning conference in Zvezda' },
    { id: 'lab-am', time: '08:15 UTC', task: 'Morning microgravity glovebox & plant biology experiments in Destiny' },
    { id: 'ared', time: '11:30 UTC', task: '2-hour resistive strength & treadmill workout to protect bone density' },
    { id: 'lunch-pm', time: '13:30 UTC', task: 'Tortilla wrap lunch & Cupola robotic inspection of visiting spacecraft' },
    { id: 'sleep', time: '21:30 UTC', task: 'Verify CO₂ sleep fan airflow, zip into wall bag & rest for 8.5 hrs' }
  ];

  const CHECKLIST_KEY = 'stellarium_iss_checklist';
  const EXP_KEY = 'stellarium_iss_experiments';
  const { openModal, toggleSavedExhibit, isExhibitSaved, getPref, setPref, escapeHtml } = window.StellariumWing4;

  let activeRoomId = getPref('lastIssRoomId', ISS_ROOMS[0].id);
  let activeFilter = 'all';
  let searchQuery = '';

  /* ------------------------------------------------------------------------
     ROOM-BY-ROOM EXPLORER SPOTLIGHT
     ------------------------------------------------------------------------ */
  function renderSchematicButtons() {
    const wrap = document.getElementById('issSchematicButtons');
    wrap.innerHTML = ISS_ROOMS.map(room => `
      <button type="button" role="tab" aria-selected="${room.id === activeRoomId}" class="iss-node-btn ${room.id === activeRoomId ? 'active' : ''}" data-room-select="${escapeHtml(room.id)}">
        <span class="node-code">${escapeHtml(room.code)}</span>
        <strong>${escapeHtml(room.name)}</strong>
      </button>
    `).join('');

    wrap.querySelectorAll('[data-room-select]').forEach(btn => {
      btn.addEventListener('click', () => selectRoom(btn.getAttribute('data-room-select')));
    });
  }

  function selectRoom(id) {
    const room = ISS_ROOMS.find(r => r.id === id) || ISS_ROOMS[0];
    activeRoomId = room.id;
    setPref('lastIssRoomId', room.id);

    renderSchematicButtons();

    const img = document.getElementById('spotImg');
    img.src = room.img;
    img.alt = room.alt;
    document.getElementById('spotTag').textContent = room.code;
    document.getElementById('spotTitle').textContent = room.name;
    document.getElementById('spotDesc').textContent = room.description;
    document.getElementById('spotStats').innerHTML = `
      <li><strong>Dimensions:</strong> ${escapeHtml(room.dimensions)}</li>
      <li><strong>Primary Crew Activity:</strong> ${escapeHtml(room.crewActivity)}</li>
      <li><strong>Key Equipment:</strong> ${escapeHtml(room.gear)}</li>
    `;
    document.getElementById('spotMicrogravityTip').textContent = room.tip;

    syncSpotlightSaveBtn(room);
  }

  function syncSpotlightSaveBtn(room) {
    const btn = document.getElementById('spotlightSaveBtn');
    btn.textContent = isExhibitSaved(room.id) ? '✓ Room Saved' : 'Save Room to Collection';
  }

  /* ------------------------------------------------------------------------
     DATA & DISPLAY: FILTERED MODULE DIRECTORY
     ------------------------------------------------------------------------ */
  function renderRoomCards() {
    const grid = document.getElementById('issCardsGrid');
    const countEl = document.getElementById('issRoomCount');

    const filtered = ISS_ROOMS.filter(r => {
      const catOk = activeFilter === 'all' || r.category === activeFilter;
      const q = searchQuery.trim().toLowerCase();
      const textOk = !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.crewActivity.toLowerCase().includes(q);
      return catOk && textOk;
    });

    countEl.textContent = `Showing ${filtered.length} of ${ISS_ROOMS.length} modules`;

    if (!filtered.length) {
      grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:1.5rem;">No ISS rooms match your search.</p>';
      return;
    }

    grid.innerHTML = filtered.map(r => {
      const saved = isExhibitSaved(r.id);
      return `
        <article class="exhibit-card">
          <div>
            <img src="${escapeHtml(r.img)}" alt="${escapeHtml(r.alt)}">
            <span class="badge-tag">${escapeHtml(r.code)}</span>
            <h3>${escapeHtml(r.name)}</h3>
            <p>${escapeHtml(r.description)}</p>
          </div>
          <div class="card-actions-row">
            <button type="button" class="outline-btn" data-tour-room="${escapeHtml(r.id)}">Tour Module</button>
            <button type="button" class="outline-btn" data-modal-room="${escapeHtml(r.id)}">Details</button>
            <button type="button" class="outline-btn ${saved ? 'active' : ''}" data-save-room="${escapeHtml(r.id)}">${saved ? 'Saved ✓' : 'Save'}</button>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('[data-tour-room]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectRoom(btn.getAttribute('data-tour-room'));
        document.getElementById('explorerHeading').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    grid.querySelectorAll('[data-modal-room]').forEach(btn => {
      btn.addEventListener('click', () => openRoomModal(btn.getAttribute('data-modal-room')));
    });

    grid.querySelectorAll('[data-save-room]').forEach(btn => {
      btn.addEventListener('click', () => {
        const room = ISS_ROOMS.find(r => r.id === btn.getAttribute('data-save-room'));
        if (!room) return;
        toggleSavedExhibit({
          id: room.id,
          title: room.name,
          wing: 'Wing IV • ISS Habitats',
          page: 'iss.html',
          summary: room.crewActivity
        });
        renderRoomCards();
        if (room.id === activeRoomId) syncSpotlightSaveBtn(room);
      });
    });
  }

  function openRoomModal(id) {
    const r = ISS_ROOMS.find(item => item.id === id);
    if (!r) return;
    document.getElementById('issModalSubtitle').textContent = r.code;
    document.getElementById('issModalTitle').textContent = r.name;
    const img = document.getElementById('issModalImg');
    img.src = r.img;
    img.alt = r.alt;

    document.getElementById('issModalBody').innerHTML = `
      <p style="margin-bottom:1rem;">${escapeHtml(r.description)}</p>
      <ul class="stat-list">
        <li><strong>Dimensions:</strong> ${escapeHtml(r.dimensions)}</li>
        <li><strong>Crew Activity:</strong> ${escapeHtml(r.crewActivity)}</li>
        <li><strong>Key Gear:</strong> ${escapeHtml(r.gear)}</li>
      </ul>
      <p style="color:var(--gold-light); font-style:italic;">${escapeHtml(r.tip)}</p>
    `;
    openModal('issDetailModal');
  }

  /* ------------------------------------------------------------------------
     INTERACTIVE CHECKLIST (PERSISTED IN LOCALSTORAGE)
     ------------------------------------------------------------------------ */
  function initChecklist() {
    const container = document.getElementById('issChecklist');
    const progressEl = document.getElementById('checklistProgress');
    let state = {};
    try {
      state = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
    } catch (e) { state = {}; }

    function render() {
      let doneCount = 0;
      container.innerHTML = DAILY_ROUTINE.map(item => {
        const checked = Boolean(state[item.id]);
        if (checked) doneCount++;
        return `
          <label class="check-item ${checked ? 'completed' : ''}">
            <input type="checkbox" data-task-id="${escapeHtml(item.id)}" ${checked ? 'checked' : ''}>
            <span>
              <strong style="color:var(--gold-light); display:block;">${escapeHtml(item.time)}</strong>
              ${escapeHtml(item.task)}
            </span>
          </label>
        `;
      }).join('');

      progressEl.textContent = `${doneCount} / ${DAILY_ROUTINE.length} done`;

      container.querySelectorAll('input[type="checkbox"]').forEach(box => {
        box.addEventListener('change', () => {
          state[box.getAttribute('data-task-id')] = box.checked;
          try {
            localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
          } catch (e) { /* ignore */ }
          render();
        });
      });
    }

    render();
  }

  /* ------------------------------------------------------------------------
     ACCORDION & ORBITAL RESOURCE CALCULATOR
     ------------------------------------------------------------------------ */
  function initAccordion() {
    document.querySelectorAll('#issAccordion .accordion-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.accordion-item');
        const isOpen = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
        btn.querySelector('span:last-child').textContent = isOpen ? '−' : '+';
      });
    });
  }

  function initOrbitCalculator() {
    const crewInput = document.getElementById('issCrewInput');
    const daysInput = document.getElementById('issDaysInput');

    function update() {
      const crew = Math.max(1, Math.min(11, Number(crewInput.value) || 7));
      const days = Math.max(1, Math.min(365, Number(daysInput.value) || 180));

      const orbits = Math.round(days * 15.5);
      const kmPerOrbit = 42710; // ~27,600 km/h * ~1.547 hr orbit
      const distMillions = (orbits * kmPerOrbit) / 1e6;
      const totalWaterNeed = crew * days * 2.5;
      const recycledWater = totalWaterNeed * 0.98;
      const oxygenKg = crew * days * 0.84;
      const foodKg = crew * days * 1.8;

      document.getElementById('issOutOrbits').textContent = orbits.toLocaleString();
      document.getElementById('issOutDistance').textContent = distMillions.toFixed(1) + 'M km';
      document.getElementById('issOutWaterSaved').textContent = Math.round(recycledWater).toLocaleString() + ' L';
      document.getElementById('issOutOxygen').textContent = `${Math.round(oxygenKg).toLocaleString()} kg O₂ • ${Math.round(foodKg).toLocaleString()} kg Food`;
    }

    crewInput.addEventListener('input', update);
    daysInput.addEventListener('input', update);
    update();
  }

  /* ------------------------------------------------------------------------
     LIVE-VALIDATED EXPERIMENT PROPOSAL FORM
     ------------------------------------------------------------------------ */
  function initExperimentForm() {
    const form = document.getElementById('issExperimentForm');
    const status = document.getElementById('issFormStatus');

    const fields = {
      title: {
        el: document.getElementById('expTitle'),
        err: document.getElementById('errExpTitle'),
        validate: v => v.trim().length >= 4 ? '' : 'Experiment title must be at least 4 characters.'
      },
      email: {
        el: document.getElementById('expEmail'),
        err: document.getElementById('errExpEmail'),
        validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid researcher email address.'
      },
      module: {
        el: document.getElementById('expModule'),
        err: document.getElementById('errExpModule'),
        validate: v => v ? '' : 'Please select a target ISS module.'
      },
      minutes: {
        el: document.getElementById('expMinutes'),
        err: document.getElementById('errExpMinutes'),
        validate: v => {
          const n = Number(v);
          return (!Number.isNaN(n) && n >= 15 && n <= 240) ? '' : 'Crew time must be between 15 and 240 minutes.';
        }
      },
      hypothesis: {
        el: document.getElementById('expHypothesis'),
        err: document.getElementById('errExpHypothesis'),
        validate: v => v.trim().length >= 20 ? '' : `Hypothesis needs at least 20 characters (${v.trim().length}/20).`
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
        status.textContent = 'Please correct the highlighted fields before submitting your ISS proposal.';
        return;
      }

      const submission = {
        title: fields.title.el.value.trim(),
        email: fields.email.el.value.trim(),
        module: fields.module.el.value,
        minutes: fields.minutes.el.value,
        hypothesis: fields.hypothesis.el.value.trim()
      };

      try {
        const list = JSON.parse(localStorage.getItem(EXP_KEY) || '[]');
        list.unshift(submission);
        localStorage.setItem(EXP_KEY, JSON.stringify(list));
      } catch (err) { /* ignore */ }

      status.className = 'form-status visible';
      status.textContent = `Experiment "${submission.title}" queued for ${submission.module} (${submission.minutes} crew mins). Confirmation sent to ${submission.email}.`;
      form.reset();
      Object.keys(fields).forEach(k => fields[k].el.setAttribute('aria-invalid', 'false'));
    });
  }

  /* ------------------------------------------------------------------------
     INITIALIZE PAGE
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    selectRoom(activeRoomId);
    renderRoomCards();
    initChecklist();
    initAccordion();
    initOrbitCalculator();
    initExperimentForm();

    document.getElementById('spotlightSaveBtn').addEventListener('click', () => {
      const room = ISS_ROOMS.find(r => r.id === activeRoomId);
      if (!room) return;
      toggleSavedExhibit({
        id: room.id,
        title: room.name,
        wing: 'Wing IV • ISS Habitats',
        page: 'iss.html',
        summary: room.crewActivity
      });
      syncSpotlightSaveBtn(room);
      renderRoomCards();
    });

    document.querySelectorAll('#issFilters button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#issFilters button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        renderRoomCards();
      });
    });

    document.getElementById('issSearch').addEventListener('input', e => {
      searchQuery = e.target.value;
      renderRoomCards();
    });

    document.addEventListener('stellarium:savedChanged', () => {
      const room = ISS_ROOMS.find(r => r.id === activeRoomId);
      if (room) syncSpotlightSaveBtn(room);
      renderRoomCards();
    });
  });
})();
