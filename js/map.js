/* ==========================================================================
   0. MOBILE NAVIGATION HAMBURGER TOGGLE (<= 850px)
   ========================================================================== */
(function () {
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  if (!navToggle || !primaryNav || navToggle.dataset.navBound === '1') return;
  navToggle.dataset.navBound = '1';

  function setMenuOpen(isOpen) {
    primaryNav.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  }

  navToggle.addEventListener('click', () => {
    setMenuOpen(!primaryNav.classList.contains('is-open'));
  });

  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 850) setMenuOpen(false);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
      setMenuOpen(false);
      navToggle.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (
      primaryNav.classList.contains('is-open') &&
      !primaryNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      setMenuOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 850 && primaryNav.classList.contains('is-open')) {
      setMenuOpen(false);
    }
  });
})();

/* ==========================================================================
   1. LOGO TRANSPARENCY & GOLDEN INK PROCESSOR
   ========================================================================== */
(function () {
  const container = document.getElementById('logoContainer');
  const img = document.getElementById('rawLogoImg');
  if (!container || !img) return;

  function renderFallbackSVG() {
    container.innerHTML = `
      <svg viewBox="0 0 120 120" width="68" height="68" aria-label="Stellarium Celestial Ring Logo">
        <defs>
          <radialGradient id="goldRing" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#F0CB90"/>
            <stop offset="65%" stop-color="#BC9E70"/>
            <stop offset="100%" stop-color="#B39053"/>
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="44" fill="none" stroke="url(#goldRing)" stroke-width="5.5" stroke-dasharray="235 28" stroke-linecap="round"/>
        <path d="M25 46 C42 22, 74 20, 92 38" fill="none" stroke="#F0CB90" stroke-width="8" stroke-linecap="round"/>
        <line x1="46" y1="24" x2="40" y2="9" stroke="#F0CB90" stroke-width="3" stroke-linecap="round"/>
        <line x1="58" y1="21" x2="57" y2="6" stroke="#F0CB90" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="71" y1="23" x2="77" y2="9" stroke="#F0CB90" stroke-width="3" stroke-linecap="round"/>
        <line x1="82" y1="29" x2="93" y2="17" stroke="#BC9E70" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="96" cy="84" r="6" fill="#F0CB90"/>
        <line x1="99" y1="88" x2="108" y2="102" stroke="#F0CB90" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `;
  }

  function processInkLogo() {
    try {
      const offCanvas = document.createElement('canvas');
      const size = 240;
      offCanvas.width = size;
      offCanvas.height = size;
      const ctx = offCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);

      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const inkAlpha = Math.max(0, Math.min(255, (245 - brightness) * 1.35));
        data[i] = 240;
        data[i + 1] = 203;
        data[i + 2] = 144;
        data[i + 3] = inkAlpha;
      }

      ctx.putImageData(imgData, 0, 0);
      container.innerHTML = '';
      container.appendChild(offCanvas);
    } catch (err) {
      img.style.filter = 'invert(1) sepia(0.55) saturate(2.1) hue-rotate(355deg) brightness(1.08)';
      img.style.mixBlendMode = 'screen';
    }
  }

  img.onload = processInkLogo;
  img.onerror = renderFallbackSVG;
  if (img.complete && img.naturalWidth > 0) processInkLogo();
})();

/* ==========================================================================
   2. GALAXY CLUSTER MAPPING BACKGROUND CANVAS
   ========================================================================== */
(function () {
  const canvas = document.getElementById('galaxy-cluster-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;
  const clusterNodes = [
    { nx: 0.14, ny: 0.22, r: 2.5 },
    { nx: 0.28, ny: 0.16, r: 2.0 },
    { nx: 0.45, ny: 0.26, r: 2.8 },
    { nx: 0.72, ny: 0.18, r: 2.4 },
    { nx: 0.86, ny: 0.34, r: 2.2 },
    { nx: 0.18, ny: 0.74, r: 2.6 },
    { nx: 0.36, ny: 0.82, r: 2.1 },
    { nx: 0.68, ny: 0.76, r: 2.5 },
    { nx: 0.84, ny: 0.68, r: 2.3 }
  ];

  const clusterLinks = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8], [2, 6]
  ];

  const stars = Array.from({ length: 110 }, () => ({
    nx: Math.random(),
    ny: Math.random(),
    r: 0.6 + Math.random() * 1.5,
    depth: 0.35 + Math.random() * 1.15,
    phase: Math.random() * Math.PI * 2,
    gold: Math.random() < 0.3
  }));

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('pointermove', (e) => {
    targetMouseX = (e.clientX / Math.max(1, width)) - 0.5;
    targetMouseY = (e.clientY / Math.max(1, height)) - 0.5;
  }, { passive: true });

  function drawFrame(timeSec) {
    currentMouseX += (targetMouseX - currentMouseX) * 0.05;
    currentMouseY += (targetMouseY - currentMouseY) * 0.05;

    ctx.fillStyle = '#010814';
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(
      width * 0.5, height * 0.42, Math.min(width, height) * 0.08,
      width * 0.5, height * 0.42, Math.max(width, height) * 0.75
    );
    glow.addColorStop(0, 'rgba(4, 30, 66, 0.55)');
    glow.addColorStop(1, 'rgba(1, 8, 20, 0.92)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    stars.forEach((star) => {
      const sx = ((star.nx * width - currentMouseX * 48 * star.depth) + width) % width;
      const sy = ((star.ny * height - currentMouseY * 36 * star.depth) + height) % height;
      const alpha = prefersReducedMotion
        ? 0.55
        : 0.35 + 0.5 * Math.sin(timeSec * 1.6 + star.phase);

      ctx.fillStyle = star.gold
        ? `rgba(240, 203, 144, ${(alpha * 0.68).toFixed(3)})`
        : `rgba(196, 196, 196, ${(alpha * 0.52).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, star.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const pts = clusterNodes.map((node) => ({
      x: node.nx * width - currentMouseX * 28,
      y: node.ny * height - currentMouseY * 22,
      r: node.r
    }));

    ctx.save();
    ctx.strokeStyle = 'rgba(188, 158, 112, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    clusterLinks.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.stroke();
    });
    ctx.restore();

    pts.forEach((pt) => {
      ctx.fillStyle = 'rgba(240, 203, 144, 0.62)';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  if (prefersReducedMotion) {
    drawFrame(0);
  } else {
    function animate(now) {
      drawFrame(now * 0.001);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
})();

/* ==========================================================================
   3. INTERACTIVE MUSEUM FLOOR PLAN & CUSTOM TOUR ROUTE PLANNER
   ========================================================================== */
(function () {
  const STORAGE_KEY = 'stellarium_tour_itinerary';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const WINGS = {
    rotunda: {
      id: 'rotunda',
      code: 'CENTRAL ATRIUM • LEVEL I',
      title: 'Grand Rotunda & Andromeda Lab',
      wingLabel: 'Grand Rotunda',
      curator: 'Sara Parvez (26I-3005 • Lead Architect)',
      curatorNotes: 'Designed as the museum\'s central celestial crossroads. Visitors orient themselves here before branching into the four thematic wings.',
      accessibility: 'Step-free main entrance ramp, tactile constellation ring, high-contrast captions, and audio guide desk.',
      highlight: 'Andromeda Galaxy (M31) Multi-Wavelength Spectrum Slider',
      href: '../index.html',
      linkLabel: 'Enter Lobby →',
      roomIds: ['rotunda']
    },
    wing1: {
      id: 'wing1',
      code: 'WING I • NORTH-WEST HALL',
      title: 'Wing I: Our Solar System',
      wingLabel: 'Wing I: Solar System',
      curator: 'Muhammad Bilal (26I-3011 • Wing I Curator)',
      curatorNotes: 'Traces our cosmic neighborhood outward from the Sun and inner rocky worlds to the gas giants, ring systems, and icy moons.',
      accessibility: 'Wide 2.4m step-free gallery aisles, planetary scale tactile relief plates, and screen-reader exhibit labels.',
      highlight: 'Planetary Scale Comparison & Europa / Titan Ice-Moon Dossiers',
      href: 'solar-system.html',
      linkLabel: 'Enter Wing I →',
      roomIds: ['solar-system', 'inner-planets', 'outer-planets']
    },
    wing2: {
      id: 'wing2',
      code: 'WING II • NORTH-EAST HALL',
      title: 'Wing II: Deep Space & Cosmos',
      wingLabel: 'Wing II: Deep Space',
      curator: 'Asad Rehman (26I-3004 • Wing II Curator)',
      curatorNotes: 'Explores interstellar distances in light-years, luminous star-forming nebulae, spiral galaxies, and supermassive black holes.',
      accessibility: 'Low-glare dark-sky lighting with luminous gold floor markers, descriptive audio tracks, and seated viewing benches.',
      highlight: 'Pillars of Creation, Orion Nebula & Event Horizon Telescope M87*',
      href: 'deep-space.html',
      linkLabel: 'Enter Wing II →',
      roomIds: ['deep-space', 'stars-nebulae', 'black-holes']
    },
    wing3: {
      id: 'wing3',
      code: 'WING III • SOUTH-WEST HALL',
      title: 'Wing III: Human Space Exploration',
      wingLabel: 'Wing III: Exploration',
      curator: 'Khurrum Ishad (26I-3013 • Wing III Curator)',
      curatorNotes: 'Chronicles humanity\'s reach beyond Earth—from Sputnik 1 and SUPARCO milestones to Apollo lunar landings, Artemis, and Mars rovers.',
      accessibility: 'Step-free chronological concourse, captioned archival mission briefings, and wheelchair-accessible rover models.',
      highlight: 'Space Race Timeline, Apollo 11 Archive & Perseverance Mars Panorama',
      href: 'exploration.html',
      linkLabel: 'Enter Wing III →',
      roomIds: ['exploration', 'apollo-missions', 'mars-rovers']
    },
    wing4: {
      id: 'wing4',
      code: 'WING IV • SOUTH-EAST HALL',
      title: 'Wing IV: Observatories & Engineering',
      wingLabel: 'Wing IV: Observatories',
      curator: 'Azlan Khan Mehsud (26I-3010 • Wing IV Curator)',
      curatorNotes: 'Examines the optical observatories, heavy-lift launch vehicles, and orbital laboratories that extend human vision across the universe.',
      accessibility: 'Lift access to Level II observation deck, side-by-side high-contrast telescope optics panels, and ISS audio tour.',
      highlight: 'Hubble vs. JWST Comparator, Rocket Payload Chart & ISS Module Tour',
      href: 'telescopes.html',
      linkLabel: 'Enter Wing IV →',
      roomIds: ['telescopes', 'rockets', 'iss']
    }
  };

  const ROOMS = {
    'rotunda': {
      id: 'rotunda',
      wingId: 'rotunda',
      code: 'ATRIUM • GRAND ROTUNDA',
      title: 'Grand Rotunda & Andromeda Lab',
      wingName: 'Grand Rotunda',
      duration: 10,
      href: '../index.html',
      linkLabel: 'Enter Lobby →',
      description: 'Central orientation dome featuring the interactive Messier 31 multi-wavelength comparator and live galactic plane simulation.',
      curatorNotes: 'Sara Parvez (26I-3005) recommends starting here for a quick 10-minute spectral preview before choosing a wing.',
      accessibility: 'Step-free atrium, tactile floor compass, keyboard-accessible slider, and audio orientation.',
      highlight: 'Andromeda Galaxy (M31) Visible / X-Ray / Multi-Wavelength Slider',
      coords: { x: 400, y: 277 },
      pinCoords: { x: 400, y: 231 }
    },
    'solar-system': {
      id: 'solar-system',
      wingId: 'wing1',
      code: 'WING I • ROOM 1A',
      title: 'Solar System Overview & Scale',
      wingName: 'Wing I: Solar System',
      duration: 10,
      href: 'solar-system.html',
      linkLabel: 'Enter Room 1A →',
      description: 'Introduction to our Sun, orbital mechanics, astronomical units, and the sweeping scale from Mercury to the Kuiper Belt.',
      curatorNotes: 'Muhammad Bilal (26I-3011) highlights the true-ratio planetary scale chart so visitors grasp interplanetary distances.',
      accessibility: 'Step-free entrance from North-West concourse, raised brass scale bars, and audio descriptions.',
      highlight: 'Interactive Solar System Scale & Orbital Zone Map',
      coords: { x: 91, y: 144 },
      pinCoords: { x: 120, y: 94 }
    },
    'inner-planets': {
      id: 'inner-planets',
      wingId: 'wing1',
      code: 'WING I • ROOM 1B',
      title: 'Inner Rocky Planets',
      wingName: 'Wing I: Solar System',
      duration: 15,
      href: 'inner-planets.html',
      linkLabel: 'Enter Room 1B →',
      description: 'Comparative geology and atmospheres of Mercury, Venus, Earth, and Mars, including volcanic plains and impact basins.',
      curatorNotes: 'Muhammad Bilal (26I-3011) contrasts Venus\'s runaway greenhouse effect with Mars\'s ancient river deltas.',
      accessibility: 'Low-height planetary placards, tactile crater reliefs, and full text transcripts.',
      highlight: 'Terrestrial World Comparison Wall & Martian Canyon Relief',
      coords: { x: 189, y: 144 },
      pinCoords: { x: 218, y: 94 }
    },
    'outer-planets': {
      id: 'outer-planets',
      wingId: 'wing1',
      code: 'WING I • ROOM 1C',
      title: 'Outer Gas & Ice Giants',
      wingName: 'Wing I: Solar System',
      duration: 15,
      href: 'outer-planets.html',
      linkLabel: 'Enter Room 1C →',
      description: 'Journey past the asteroid belt to Jupiter\'s storms, Saturn\'s rings, Uranus, Neptune, and ocean moons Europa and Titan.',
      curatorNotes: 'Muhammad Bilal (26I-3011) showcases Cassini and Juno imagery revealing subsurface oceans beneath icy crusts.',
      accessibility: 'Wheelchair-friendly viewing alcove, ring-system tactile model, and captioned audio narration.',
      highlight: 'Cassini Saturn Ring Mosaic & Europa / Titan Habitability Dossier',
      coords: { x: 287, y: 144 },
      pinCoords: { x: 316, y: 94 }
    },
    'deep-space': {
      id: 'deep-space',
      wingId: 'wing2',
      code: 'WING II • ROOM 2A',
      title: 'Deep Space Overview',
      wingName: 'Wing II: Deep Space',
      duration: 10,
      href: 'deep-space.html',
      linkLabel: 'Enter Room 2A →',
      description: 'Threshold to the interstellar cosmos introducing light-years, cosmic lookback time, and deep-field sky surveys.',
      curatorNotes: 'Asad Rehman (26I-3004) frames how telescope light acts as a time machine across millions of light-years.',
      accessibility: 'Step-free gallery, high-contrast star charts, and seating benches along the central wall.',
      highlight: 'Cosmic Distance Ladder & Hubble Ultra Deep Field Survey',
      coords: { x: 513, y: 144 },
      pinCoords: { x: 542, y: 94 }
    },
    'stars-nebulae': {
      id: 'stars-nebulae',
      wingId: 'wing2',
      code: 'WING II • ROOM 2B',
      title: 'Stars & Stellar Nurseries',
      wingName: 'Wing II: Deep Space',
      duration: 15,
      href: 'stars-nebulae.html',
      linkLabel: 'Enter Room 2B →',
      description: 'Stellar birth and evolution inside giant molecular clouds, showcasing the Orion Nebula, Carina Cliffs, and Pillars of Creation.',
      curatorNotes: 'Asad Rehman (26I-3004) pairs visible-light Hubble frames with JWST infrared captures piercing dense dust.',
      accessibility: 'Calming ambient lighting, descriptive audio tracks, and clear color-blind-safe spectrum keys.',
      highlight: 'Pillars of Creation (Eagle Nebula) & Orion Stellar Nursery',
      coords: { x: 611, y: 144 },
      pinCoords: { x: 640, y: 94 }
    },
    'black-holes': {
      id: 'black-holes',
      wingId: 'wing2',
      code: 'WING II • ROOM 2C',
      title: 'Black Holes & Galaxies',
      wingName: 'Wing II: Deep Space',
      duration: 20,
      href: 'black-holes.html',
      linkLabel: 'Enter Room 2C →',
      description: 'Relativistic astrophysics gallery examining gravitational lensing, galactic mergers, and Event Horizon Telescope shadow imagery.',
      curatorNotes: 'Asad Rehman (26I-3004) advises budgeting 20 minutes here to explore the M87* shadow analysis and galaxy taxonomy.',
      accessibility: 'Step-free chamber, tactile gravitational-well dome, and full screen-reader transcripts.',
      highlight: 'Event Horizon Telescope M87* Ring & Stephan\'s Quintet',
      coords: { x: 709, y: 144 },
      pinCoords: { x: 738, y: 94 }
    },
    'exploration': {
      id: 'exploration',
      wingId: 'wing3',
      code: 'WING III • ROOM 3A',
      title: 'Space Race Timeline',
      wingName: 'Wing III: Exploration',
      duration: 15,
      href: 'exploration.html',
      linkLabel: 'Enter Room 3A →',
      description: 'Chronological exhibition tracing early orbital rocketry from Sputnik 1 and Vostok through global milestones including SUPARCO.',
      curatorNotes: 'Khurrum Ishad (26I-3013) highlights international spaceflight pioneers and Pakistan\'s early sounding rocket heritage.',
      accessibility: 'Wide timeline corridor, eye-level chronological plaques, and audio-guided archival clips.',
      highlight: '1957–Present Spaceflight Chronology & Global Agencies Wall',
      coords: { x: 91, y: 446 },
      pinCoords: { x: 120, y: 396 }
    },
    'apollo-missions': {
      id: 'apollo-missions',
      wingId: 'wing3',
      code: 'WING III • ROOM 3B',
      title: 'Apollo & Lunar Missions',
      wingName: 'Wing III: Exploration',
      duration: 15,
      href: 'apollo-missions.html',
      linkLabel: 'Enter Room 3B →',
      description: 'Dedicated to Project Apollo\'s lunar landings, moonwalk photography, and the modern Artemis return-to-the-Moon campaign.',
      curatorNotes: 'Khurrum Ishad (26I-3013) curates Apollo 11–17 mission logs alongside lunar sample geology.',
      accessibility: 'Step-free gallery, tactile Moon landing-site globe, and captioned mission radio transcripts.',
      highlight: 'Apollo 11 Sea of Tranquility Archive & Artemis Lunar Gateway',
      coords: { x: 189, y: 446 },
      pinCoords: { x: 218, y: 396 }
    },
    'mars-rovers': {
      id: 'mars-rovers',
      wingId: 'wing3',
      code: 'WING III • ROOM 3C',
      title: 'Mars Rovers & Probes',
      wingName: 'Wing III: Exploration',
      duration: 15,
      href: 'mars-rovers.html',
      linkLabel: 'Enter Room 3C →',
      description: 'Robotic explorers on the Red Planet and beyond—featuring Sojourner, Curiosity, Perseverance, Ingenuity, and Voyager 1 & 2.',
      curatorNotes: 'Khurrum Ishad (26I-3013) compares rover autonomous navigation with Voyager\'s Golden Record interstellar journey.',
      accessibility: 'Accessible viewing rails, Voyager Golden Record audio station, and high-contrast Mars panoramas.',
      highlight: 'Perseverance Jezero Crater Panorama & Voyager Interstellar Probes',
      coords: { x: 287, y: 446 },
      pinCoords: { x: 316, y: 396 }
    },
    'telescopes': {
      id: 'telescopes',
      wingId: 'wing4',
      code: 'WING IV • ROOM 4A',
      title: 'Space Telescopes (Hubble & JWST)',
      wingName: 'Wing IV: Observatories',
      duration: 15,
      href: 'telescopes.html',
      linkLabel: 'Enter Room 4A →',
      description: 'Engineering deep-dive comparing Hubble\'s ultraviolet/optical mirror with JWST\'s 6.5-meter gold-coated segmented infrared array.',
      curatorNotes: 'Azlan Khan Mehsud (26I-3010) demonstrates why L2 sunshield cooling unlocks the earliest galaxies.',
      accessibility: 'Step-free Level II elevator access, hexagonal mirror tactile display, and screen-reader specs.',
      highlight: 'Hubble vs. James Webb Side-by-Side Mirror & Deep Field Comparison',
      coords: { x: 513, y: 446 },
      pinCoords: { x: 542, y: 396 }
    },
    'rockets': {
      id: 'rockets',
      wingId: 'wing4',
      code: 'WING IV • ROOM 4B',
      title: 'Historic & Modern Rockets',
      wingName: 'Wing IV: Observatories',
      duration: 15,
      href: 'rockets.html',
      linkLabel: 'Enter Room 4B →',
      description: 'Propulsion evolution from Saturn V and the Space Shuttle to reusable orbital boosters like Falcon 9 and Starship.',
      curatorNotes: 'Azlan Khan Mehsud (26I-3010) breaks down payload-to-LEO trade-offs and cryogenic propellant engineering.',
      accessibility: 'Clear floor paths around vertical scale models, high-contrast payload charts, and audio guide.',
      highlight: 'Saturn V to Starship Payload-to-Orbit Comparison Chart',
      coords: { x: 611, y: 446 },
      pinCoords: { x: 640, y: 396 }
    },
    'iss': {
      id: 'iss',
      wingId: 'wing4',
      code: 'WING IV • ROOM 4C',
      title: 'International Space Station',
      wingName: 'Wing IV: Observatories',
      duration: 15,
      href: 'iss.html',
      linkLabel: 'Enter Room 4C →',
      description: 'Module-by-module architectural tour of humanity\'s orbital laboratory, Cupola Earth-observation dome, and microgravity science.',
      curatorNotes: 'Azlan Khan Mehsud (26I-3010) walks visitors through crew life support, solar arrays, and orbital research racks.',
      accessibility: 'Step-free simulated module deck, captioned astronaut briefings, and seated Cupola projection.',
      highlight: 'ISS Pressurized Module Blueprint & Cupola Orbital Dome',
      coords: { x: 709, y: 446 },
      pinCoords: { x: 738, y: 396 }
    }
  };

  const PRESETS = {
    highlights: {
      label: '30-Min Highlights Tour',
      rooms: ['solar-system', 'stars-nebulae']
    },
    grand: {
      label: 'Full 4-Wing Grand Tour',
      rooms: [
        'rotunda',
        'solar-system', 'inner-planets', 'outer-planets',
        'deep-space', 'stars-nebulae', 'black-holes',
        'telescopes', 'rockets', 'iss',
        'mars-rovers', 'apollo-missions', 'exploration'
      ]
    },
    deepspace: {
      label: 'Deep Space & Telescopes Focus',
      rooms: ['deep-space', 'stars-nebulae', 'black-holes', 'telescopes']
    }
  };

  const ADJACENT_WINGS = new Set([
    'wing1|wing2', 'wing2|wing1',
    'wing1|wing3', 'wing3|wing1',
    'wing2|wing4', 'wing4|wing2',
    'wing3|wing4', 'wing4|wing3'
  ]);

  // DOM References
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const wingGroups = Array.from(document.querySelectorAll('.wing-group'));
  const wingHeaderZones = Array.from(document.querySelectorAll('.wing-header-zone'));
  const roomZones = Array.from(document.querySelectorAll('.room-zone'));
  const tourRouteLayer = document.getElementById('tourRouteLayer');

  const inspectorCode = document.getElementById('inspectorCode');
  const inspectorTitle = document.getElementById('inspectorTitle');
  const inspectorDesc = document.getElementById('inspectorDesc');
  const inspectorCuratorNotes = document.getElementById('inspectorCuratorNotes');
  const inspectorTime = document.getElementById('inspectorTime');
  const inspectorAccessibility = document.getElementById('inspectorAccessibility');
  const inspectorHighlight = document.getElementById('inspectorHighlight');
  const inspectorRoomsBlock = document.getElementById('inspectorRoomsBlock');
  const inspectorLink = document.getElementById('inspectorLink');
  const addToTourBtn = document.getElementById('addToTourBtn');

  const presetBtns = Array.from(document.querySelectorAll('.preset-btn'));
  const clearTourBtn = document.getElementById('clearTourBtn');
  const tourTotalStopsEl = document.getElementById('tourTotalStops');
  const tourTotalDurationEl = document.getElementById('tourTotalDuration');
  const tourExhibitTimeEl = document.getElementById('tourExhibitTime');
  const tourWalkingTimeEl = document.getElementById('tourWalkingTime');
  const tourItineraryList = document.getElementById('tourItineraryList');
  const tourStatusLive = document.getElementById('tourStatusLive');

  if (!inspectorTitle || !tourItineraryList) return;

  let activeWingFilter = 'all';
  let selectionMode = 'room'; // 'room' | 'wing'
  let selectedRoomId = 'rotunda';
  let selectedWingId = 'rotunda';
  let activePresetKey = null;
  let itinerary = loadItinerary();

  function loadItinerary() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const seen = new Set();
      return parsed.filter((id) => {
        if (typeof id !== 'string' || !ROOMS[id] || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    } catch (err) {
      return [];
    }
  }

  function saveItinerary() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itinerary));
    } catch (err) {
      // Ignore storage quota or private browsing errors
    }
  }

  function announceStatus(message) {
    if (!tourStatusLive) return;
    tourStatusLive.textContent = '';
    requestAnimationFrame(() => {
      tourStatusLive.textContent = message;
    });
  }

  function formatHoursAndMinutes(totalMinutes) {
    const mins = Math.max(0, Math.round(totalMinutes));
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    const hrLabel = hrs === 1 ? 'hr' : 'hrs';
    const minLabel = rem === 1 ? 'min' : 'mins';
    return `${hrs} ${hrLabel} ${rem} ${minLabel}`;
  }

  function getTransitionDetails(fromRoom, toRoom) {
    if (fromRoom.wingId === toRoom.wingId) {
      return {
        minutes: 2,
        label: `2 min gallery walk within ${fromRoom.wingName}`
      };
    }

    if (fromRoom.wingId === 'rotunda' || toRoom.wingId === 'rotunda') {
      return {
        minutes: 3,
        label: `3 min radial walk (${fromRoom.wingName} → ${toRoom.wingName})`
      };
    }

    const pairKey = `${fromRoom.wingId}|${toRoom.wingId}`;
    if (ADJACENT_WINGS.has(pairKey)) {
      return {
        minutes: 5,
        label: `5 min concourse walk (${fromRoom.wingName} → ${toRoom.wingName})`
      };
    }

    return {
      minutes: 7,
      label: `7 min cross-rotunda walk (${fromRoom.wingName} → ${toRoom.wingName})`
    };
  }

  function calculateTourTotals() {
    let exhibitMinutes = 0;
    let walkingMinutes = 0;

    itinerary.forEach((roomId, index) => {
      const room = ROOMS[roomId];
      if (!room) return;
      exhibitMinutes += room.duration;

      if (index > 0) {
        const prevRoom = ROOMS[itinerary[index - 1]];
        if (prevRoom) {
          walkingMinutes += getTransitionDetails(prevRoom, room).minutes;
        }
      }
    });

    return {
      stops: itinerary.length,
      exhibitMinutes,
      walkingMinutes,
      totalMinutes: exhibitMinutes + walkingMinutes
    };
  }

  function syncBlueprintHighlights() {
    const highlightedWing = selectionMode === 'wing'
      ? selectedWingId
      : ROOMS[selectedRoomId].wingId;

    filterBtns.forEach((btn) => {
      const isMatch = btn.dataset.filter === activeWingFilter;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-pressed', String(isMatch));
    });

    wingGroups.forEach((group) => {
      const wingId = group.dataset.wing;
      const shouldDim = activeWingFilter !== 'all' && wingId !== activeWingFilter;
      const isWingActive = wingId === highlightedWing;
      group.classList.toggle('dimmed', shouldDim);
      group.classList.toggle('wing-active', isWingActive);
    });

    wingHeaderZones.forEach((header) => {
      const isWingSelected =
        selectionMode === 'wing' && header.dataset.wingSelect === selectedWingId;
      header.setAttribute('aria-pressed', String(isWingSelected));
    });

    roomZones.forEach((zone) => {
      const roomId = zone.dataset.room;
      const isSelected = selectionMode === 'room' && roomId === selectedRoomId;
      const isInTour = itinerary.includes(roomId);
      zone.classList.toggle('selected', isSelected);
      zone.classList.toggle('in-tour', isInTour);
      zone.setAttribute('aria-pressed', String(isSelected));
    });

    renderSvgTourRoute();
  }

  function renderSvgTourRoute() {
    if (!tourRouteLayer) return;
    tourRouteLayer.replaceChildren();

    if (itinerary.length === 0) return;

    if (itinerary.length > 1) {
      const pointsStr = itinerary
        .map((roomId) => ROOMS[roomId]?.coords)
        .filter(Boolean)
        .map((pt) => `${pt.x},${pt.y}`)
        .join(' ');

      const polyline = document.createElementNS(SVG_NS, 'polyline');
      polyline.setAttribute('points', pointsStr);
      polyline.setAttribute('class', 'tour-route-path');
      tourRouteLayer.appendChild(polyline);
    }

    itinerary.forEach((roomId, idx) => {
      const room = ROOMS[roomId];
      if (!room) return;

      const pinGroup = document.createElementNS(SVG_NS, 'g');
      pinGroup.setAttribute('class', 'tour-stop-pin');

      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', String(room.pinCoords.x));
      circle.setAttribute('cy', String(room.pinCoords.y));
      circle.setAttribute('r', '10');

      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('x', String(room.pinCoords.x));
      label.setAttribute('y', String(room.pinCoords.y));
      label.textContent = String(idx + 1);

      pinGroup.append(circle, label);
      tourRouteLayer.appendChild(pinGroup);
    });
  }

  function renderInspectorRoomsList(wingId, currentRoomId) {
    inspectorRoomsBlock.replaceChildren();
    const wing = WINGS[wingId];
    if (!wing) return;

    const heading = document.createElement('div');
    heading.className = 'inspector-rooms-heading';
    heading.textContent = wingId === 'rotunda'
      ? 'Atrium Hall'
      : `Gallery Rooms in ${wing.wingLabel}`;

    const listEl = document.createElement('div');
    listEl.className = 'inspector-room-chips';

    wing.roomIds.forEach((roomId) => {
      const room = ROOMS[roomId];
      if (!room) return;

      const row = document.createElement('div');
      row.className = 'inspector-room-row';
      if (selectionMode === 'room' && roomId === currentRoomId) {
        row.classList.add('is-current');
      }

      const selectBtn = document.createElement('button');
      selectBtn.type = 'button';
      selectBtn.className = 'room-chip-btn';
      selectBtn.textContent = room.title;
      selectBtn.setAttribute('aria-pressed', String(selectionMode === 'room' && roomId === currentRoomId));
      selectBtn.addEventListener('click', () => {
        selectRoom(roomId);
      });

      const meta = document.createElement('div');
      meta.className = 'room-chip-meta';

      const durSpan = document.createElement('span');
      durSpan.textContent = `${room.duration} min`;

      const pageLink = document.createElement('a');
      pageLink.href = room.href;
      pageLink.className = 'room-chip-link';
      pageLink.textContent = 'Open →';

      meta.append(durSpan, pageLink);
      row.append(selectBtn, meta);
      listEl.appendChild(row);
    });

    inspectorRoomsBlock.append(heading, listEl);
  }

  function updateInspector() {
    if (selectionMode === 'wing') {
      const wing = WINGS[selectedWingId];
      if (!wing) return;

      const wingMinutes = wing.roomIds.reduce(
        (sum, id) => sum + (ROOMS[id]?.duration || 0),
        0
      );
      const unaddedCount = wing.roomIds.filter((id) => !itinerary.includes(id)).length;

      inspectorCode.textContent = wing.code;
      inspectorTitle.textContent = wing.title;
      inspectorDesc.textContent = wing.curatorNotes;
      inspectorCuratorNotes.textContent = wing.curator;
      inspectorTime.textContent = `${wingMinutes} Minutes (${wing.roomIds.length} ${wing.roomIds.length === 1 ? 'Gallery' : 'Galleries'})`;
      inspectorAccessibility.textContent = wing.accessibility;
      inspectorHighlight.textContent = wing.highlight;

      inspectorLink.href = wing.href;
      inspectorLink.textContent = wing.linkLabel;

      if (unaddedCount === 0) {
        addToTourBtn.textContent = '✓ All Wing Rooms in Tour';
        addToTourBtn.setAttribute('aria-pressed', 'true');
      } else {
        addToTourBtn.textContent = wing.roomIds.length === 1
          ? '+ Add to My Tour'
          : `+ Add ${unaddedCount} Wing Rooms to Tour`;
        addToTourBtn.setAttribute('aria-pressed', 'false');
      }

      renderInspectorRoomsList(wing.id, null);
      return;
    }

    const room = ROOMS[selectedRoomId];
    if (!room) return;

    const isInTour = itinerary.includes(room.id);

    inspectorCode.textContent = room.code;
    inspectorTitle.textContent = room.title;
    inspectorDesc.textContent = room.description;
    inspectorCuratorNotes.textContent = room.curatorNotes;
    inspectorTime.textContent = `${room.duration} Minutes`;
    inspectorAccessibility.textContent = room.accessibility;
    inspectorHighlight.textContent = room.highlight;

    inspectorLink.href = room.href;
    inspectorLink.textContent = room.linkLabel;

    addToTourBtn.textContent = isInTour ? '✓ In My Tour (Click to Remove)' : '+ Add to My Tour';
    addToTourBtn.setAttribute('aria-pressed', String(isInTour));

    renderInspectorRoomsList(room.wingId, room.id);
  }

  function createEmptyTourState() {
    const empty = document.createElement('div');
    empty.className = 'empty-state';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'subtitle';
    eyebrow.textContent = 'Custom Route Planner';

    const heading = document.createElement('h3');
    heading.textContent = 'Your Museum Tour Itinerary Is Empty';

    const body = document.createElement('p');
    body.textContent = 'Click any room on the architectural blueprint and select "+ Add to My Tour", or choose one of the Quick Tour presets above to calculate your visit duration and walking route.';

    const quickBtn = document.createElement('button');
    quickBtn.type = 'button';
    quickBtn.className = 'gold-btn';
    quickBtn.textContent = 'Load 30-Min Highlights Tour';
    quickBtn.addEventListener('click', () => applyPreset('highlights'));

    empty.append(eyebrow, heading, body, quickBtn);
    return empty;
  }

  function renderTourItinerary(focusTarget = null) {
    const totals = calculateTourTotals();

    tourTotalStopsEl.textContent = `${totals.stops} ${totals.stops === 1 ? 'Stop' : 'Stops'}`;
    tourTotalDurationEl.textContent = formatHoursAndMinutes(totals.totalMinutes);
    tourExhibitTimeEl.textContent = formatHoursAndMinutes(totals.exhibitMinutes);
    tourWalkingTimeEl.textContent = totals.walkingMinutes >= 60
      ? formatHoursAndMinutes(totals.walkingMinutes)
      : `${totals.walkingMinutes} ${totals.walkingMinutes === 1 ? 'min' : 'mins'}`;

    clearTourBtn.disabled = itinerary.length === 0;

    presetBtns.forEach((btn) => {
      const isActive = activePresetKey === btn.dataset.preset;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    tourItineraryList.replaceChildren();

    if (itinerary.length === 0) {
      tourItineraryList.appendChild(createEmptyTourState());
      syncBlueprintHighlights();
      updateInspector();
      if (focusTarget && focusTarget.type === 'empty') {
        const emptyCta = tourItineraryList.querySelector('.empty-state button');
        if (emptyCta) emptyCta.focus();
      }
      return;
    }

    const fragment = document.createDocumentFragment();

    itinerary.forEach((roomId, index) => {
      const room = ROOMS[roomId];
      if (!room) return;

      if (index > 0) {
        const prevRoom = ROOMS[itinerary[index - 1]];
        if (prevRoom) {
          const transition = getTransitionDetails(prevRoom, room);
          const connector = document.createElement('div');
          connector.className = 'tour-leg-connector';
          connector.textContent = transition.label;
          fragment.appendChild(connector);
        }
      }

      const card = document.createElement('article');
      card.className = 'tour-stop-card';

      const badge = document.createElement('div');
      badge.className = 'stop-badge';
      badge.textContent = String(index + 1);
      badge.setAttribute('aria-hidden', 'true');

      const info = document.createElement('div');
      info.className = 'stop-info';

      const eyebrow = document.createElement('div');
      eyebrow.className = 'stop-eyebrow';
      eyebrow.textContent = room.code;

      const title = document.createElement('h3');
      title.textContent = room.title;

      const metaLine = document.createElement('div');
      metaLine.className = 'stop-meta-line';

      const durSpan = document.createElement('span');
      durSpan.textContent = `Est. Visit: ${room.duration} mins`;

      const inspectBtn = document.createElement('button');
      inspectBtn.type = 'button';
      inspectBtn.className = 'stop-map-btn';
      inspectBtn.textContent = 'Highlight on Map';
      inspectBtn.addEventListener('click', () => {
        selectRoom(room.id);
      });

      const pageLink = document.createElement('a');
      pageLink.href = room.href;
      pageLink.textContent = room.linkLabel;

      metaLine.append(durSpan, inspectBtn, pageLink);
      info.append(eyebrow, title, metaLine);

      const controls = document.createElement('div');
      controls.className = 'stop-controls';

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'stop-ctrl-btn';
      upBtn.textContent = '↑';
      upBtn.disabled = index === 0;
      upBtn.dataset.roomId = room.id;
      upBtn.dataset.action = 'up';
      upBtn.setAttribute('aria-label', `Move ${room.title} earlier in tour`);
      upBtn.addEventListener('click', () => moveStop(index, -1));

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'stop-ctrl-btn';
      downBtn.textContent = '↓';
      downBtn.disabled = index === itinerary.length - 1;
      downBtn.dataset.roomId = room.id;
      downBtn.dataset.action = 'down';
      downBtn.setAttribute('aria-label', `Move ${room.title} later in tour`);
      downBtn.addEventListener('click', () => moveStop(index, 1));

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'stop-ctrl-btn remove-btn';
      removeBtn.textContent = '✕';
      removeBtn.dataset.roomId = room.id;
      removeBtn.dataset.action = 'remove';
      removeBtn.setAttribute('aria-label', `Remove ${room.title} from tour`);
      removeBtn.addEventListener('click', () => removeStop(room.id));

      controls.append(upBtn, downBtn, removeBtn);
      card.append(badge, info, controls);
      fragment.appendChild(card);
    });

    tourItineraryList.appendChild(fragment);
    syncBlueprintHighlights();
    updateInspector();

    if (focusTarget && focusTarget.roomId) {
      const selector = `button[data-room-id="${focusTarget.roomId}"][data-action="${focusTarget.action}"]`;
      let targetBtn = tourItineraryList.querySelector(selector);
      if (targetBtn && targetBtn.disabled) {
        const fallbackAction = focusTarget.action === 'up' ? 'down' : 'up';
        targetBtn = tourItineraryList.querySelector(
          `button[data-room-id="${focusTarget.roomId}"][data-action="${fallbackAction}"]`
        ) || tourItineraryList.querySelector(
          `button[data-room-id="${focusTarget.roomId}"][data-action="remove"]`
        );
      }
      if (targetBtn && !targetBtn.disabled) {
        targetBtn.focus();
      }
    }
  }

  function selectRoom(roomId) {
    if (!ROOMS[roomId]) return;
    selectionMode = 'room';
    selectedRoomId = roomId;
    selectedWingId = ROOMS[roomId].wingId;
    if (activeWingFilter !== 'all' && activeWingFilter !== selectedWingId) {
      activeWingFilter = selectedWingId;
    }
    syncBlueprintHighlights();
    updateInspector();
  }

  function selectWing(wingId) {
    if (!WINGS[wingId]) return;
    selectionMode = 'wing';
    selectedWingId = wingId;
    activeWingFilter = wingId;
    syncBlueprintHighlights();
    updateInspector();
  }

  function toggleRoomInTour(roomId) {
    const room = ROOMS[roomId];
    if (!room) return;
    activePresetKey = null;

    const existingIdx = itinerary.indexOf(roomId);
    if (existingIdx !== -1) {
      itinerary.splice(existingIdx, 1);
      saveItinerary();
      renderTourItinerary();
      announceStatus(`Removed ${room.title} from your tour. ${itinerary.length} stops remaining.`);
      return;
    }

    itinerary.push(roomId);
    saveItinerary();
    renderTourItinerary();
    announceStatus(`Added ${room.title} to your tour. ${itinerary.length} stops total.`);
  }

  function addWingRoomsToTour(wingId) {
    const wing = WINGS[wingId];
    if (!wing) return;
    activePresetKey = null;

    let addedCount = 0;
    wing.roomIds.forEach((roomId) => {
      if (!itinerary.includes(roomId)) {
        itinerary.push(roomId);
        addedCount += 1;
      }
    });

    if (addedCount === 0) {
      announceStatus(`All rooms in ${wing.wingLabel} are already in your tour itinerary.`);
      return;
    }

    saveItinerary();
    renderTourItinerary();
    announceStatus(`Added ${addedCount} gallery ${addedCount === 1 ? 'room' : 'rooms'} from ${wing.wingLabel} to your tour.`);
  }

  function moveStop(index, delta) {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= itinerary.length) return;

    activePresetKey = null;
    const [movedId] = itinerary.splice(index, 1);
    itinerary.splice(targetIdx, 0, movedId);

    saveItinerary();
    renderTourItinerary({
      roomId: movedId,
      action: delta < 0 ? 'up' : 'down'
    });

    const movedRoom = ROOMS[movedId];
    if (movedRoom) {
      announceStatus(`Moved ${movedRoom.title} to stop ${targetIdx + 1}.`);
    }
  }

  function removeStop(roomId) {
    const idx = itinerary.indexOf(roomId);
    if (idx === -1) return;

    activePresetKey = null;
    itinerary.splice(idx, 1);
    saveItinerary();

    const nextFocusId = itinerary[idx] || itinerary[idx - 1] || null;
    renderTourItinerary(
      nextFocusId
        ? { roomId: nextFocusId, action: 'remove' }
        : { type: 'empty' }
    );

    const room = ROOMS[roomId];
    if (room) {
      announceStatus(`Removed ${room.title} from your tour. ${itinerary.length} stops remaining.`);
    }
  }

  function clearTour() {
    if (itinerary.length === 0) return;
    activePresetKey = null;
    itinerary = [];
    saveItinerary();
    renderTourItinerary();
    announceStatus('Cleared your museum tour itinerary.');
  }

  function applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    activePresetKey = presetKey;
    itinerary = preset.rooms.filter((id) => Boolean(ROOMS[id]));
    saveItinerary();
    renderTourItinerary();

    const totals = calculateTourTotals();
    announceStatus(
      `Loaded ${preset.label}: ${totals.stops} stops, ${formatHoursAndMinutes(totals.totalMinutes)} total estimated duration.`
    );
  }

  function bindSvgActivation(element, handler) {
    element.addEventListener('click', handler);
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  }

  // Filter buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter || 'all';
      activeWingFilter = filter;
      if (filter === 'all') {
        selectionMode = 'room';
        selectedRoomId = 'rotunda';
        selectedWingId = 'rotunda';
        syncBlueprintHighlights();
        updateInspector();
      } else {
        selectWing(filter);
      }
    });
  });
  // SVG Wing Headers & Room Chambers
  wingHeaderZones.forEach((header) => {
    bindSvgActivation(header, () => {
      const wingId = header.dataset.wingSelect;
      if (wingId) selectWing(wingId);
    });
  });

  roomZones.forEach((zone) => {
    bindSvgActivation(zone, () => {
      const roomId = zone.dataset.room;
      if (roomId) selectRoom(roomId);
    });
  });

  // Inspector Add to Tour button
  addToTourBtn.addEventListener('click', () => {
    if (selectionMode === 'wing') {
      addWingRoomsToTour(selectedWingId);
    } else {
      toggleRoomInTour(selectedRoomId);
    }
  });

  // Preset & Clear buttons
  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      if (presetKey) applyPreset(presetKey);
    });
  });

  clearTourBtn.addEventListener('click', clearTour);

  // Initial Render
  renderTourItinerary();
})();
