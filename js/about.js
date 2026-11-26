/* ==========================================================================
   0. MOBILE NAVIGATION HAMBURGER TOGGLE (<= 850px)
   ========================================================================== */
(function () {
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  if (!navToggle || !primaryNav) return;

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
   2. RELEVANT DEEP-FIELD NEBULA & CURATOR CONSTELLATION BACKGROUND
   ========================================================================== */
(function () {
  const canvas = document.getElementById('about-cosmos-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let bgLoaded = false;

  // Relevant deep-space nebula / observatory backdrop (NASA/Unsplash deep field with local fallback)
  const nebulaImg = new Image();
  nebulaImg.crossOrigin = 'anonymous';
  nebulaImg.src = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1800&q=85';
  nebulaImg.onload = () => { bgLoaded = true; };

  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;
  let targetScroll = 0;
  let currentScroll = 0;

  // 6 major constellation stars representing the 6 founding curators
  const curatorStars = [
    { label: '26I-3005', nx: 0.16, ny: 0.24 },
    { label: '26I-3011', nx: 0.34, ny: 0.17 },
    { label: '26I-3004', nx: 0.54, ny: 0.22 },
    { label: '26I-3013', nx: 0.76, ny: 0.19 },
    { label: '26I-3010', nx: 0.84, ny: 0.48 },
    { label: '26I-6528', nx: 0.22, ny: 0.68 }
  ];

  const constellationEdges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [1, 5],
    [5, 2]
  ];

  // Ambient stardust field
  const stars = [];
  for (let i = 0; i < 120; i++) {
    stars.push({
      nx: Math.random(),
      ny: Math.random(),
      r: 0.6 + Math.random() * 1.6,
      depth: 0.3 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      gold: Math.random() < 0.28
    });
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('pointermove', (e) => {
    targetMouseX = (e.clientX / width) - 0.5;
    targetMouseY = (e.clientY / height) - 0.5;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    targetScroll = Math.min(1, window.scrollY / maxScroll);
  }, { passive: true });

  function animate(now) {
    requestAnimationFrame(animate);
    const t = now * 0.001;

    currentMouseX += (targetMouseX - currentMouseX) * 0.05;
    currentMouseY += (targetMouseY - currentMouseY) * 0.05;
    currentScroll += (targetScroll - currentScroll) * 0.05;

    ctx.clearRect(0, 0, width, height);

    if (bgLoaded && nebulaImg.naturalWidth > 0) {
      const zoom = 1.08 + currentScroll * 0.06;
      const scale = Math.max(width / nebulaImg.naturalWidth, height / nebulaImg.naturalHeight) * zoom;
      const dw = nebulaImg.naturalWidth * scale;
      const dh = nebulaImg.naturalHeight * scale;
      const dx = (width - dw) * 0.5 - currentMouseX * 36;
      const dy = (height - dh) * 0.5 - currentMouseY * 28;

      ctx.drawImage(nebulaImg, dx, dy, dw, dh);

      // Deep Oxford & Abyss atmospheric overlay so curator cards stay crisp
      const grad = ctx.createRadialGradient(
        width * 0.5, height * 0.45, Math.min(width, height) * 0.15,
        width * 0.5, height * 0.45, Math.max(width, height) * 0.8
      );
      grad.addColorStop(0, 'rgba(4, 30, 66, 0.42)');
      grad.addColorStop(1, 'rgba(1, 8, 20, 0.86)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#010814';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw twinkling stardust
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const sx = ((s.nx * width - currentMouseX * 65 * s.depth) + width) % width;
      const sy = ((s.ny * height - currentMouseY * 50 * s.depth) + height) % height;
      const alpha = 0.35 + 0.55 * Math.sin(t * 1.9 + s.phase);

      ctx.fillStyle = s.gold
        ? `rgba(240, 203, 144, ${(alpha * 0.65).toFixed(3)})`
        : `rgba(196, 196, 196, ${(alpha * 0.55).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw subtle 6-curator constellation overlay
    const pts = curatorStars.map((st, idx) => ({
      x: st.nx * width - currentMouseX * 45 + Math.cos(t * 0.5 + idx) * 3,
      y: st.ny * height - currentMouseY * 35 + Math.sin(t * 0.5 + idx) * 3,
      label: st.label
    }));

    ctx.save();
    ctx.strokeStyle = 'rgba(240, 203, 144, 0.24)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    for (let i = 0; i < constellationEdges.length; i++) {
      const [a, b] = constellationEdges[i];
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.stroke();
    }
    ctx.restore();

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      ctx.fillStyle = 'rgba(240, 203, 144, 0.75)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '600 10px "Playfair Display", Georgia, serif';
      ctx.fillStyle = 'rgba(240, 203, 144, 0.48)';
      ctx.fillText(p.label, p.x + 7, p.y + 3);
    }
  }

  requestAnimationFrame(animate);
})();

/* ==========================================================================
   3. CURATORS DYNAMIC RENDERING & WING FILTER INTERACTION
   ========================================================================== */
(function () {
  const gridEl = document.getElementById('curatorGrid');
  const filterBtns = document.querySelectorAll('.curator-filter-btn');
  if (!gridEl) return;

  const CURATORS = [
    {
      initials: 'SP',
      idLabel: 'Roll No: 26I-3005 • Lead Architect',
      name: 'Sara Parvez',
      wing: 'entrance',
      wingTag: 'Museum Entrance & Hub',
      summary: 'Proposed the Stellarium concept, established the museum\'s visual identity and formatting, and built the Grand Lobby, interactive Floor Plan blueprint, and Curators charter.',
      pages: [
        { label: '1. Grand Lobby & Andromeda Lab', file: 'index.html →', href: '../index.html' },
        { label: '2. Interactive 2D Floor Plan', file: 'map.html →', href: 'map.html' },
        { label: '3. About & Curators Charter', file: 'about.html →', href: 'about.html' }
      ]
    },
    {
      initials: 'MB',
      idLabel: 'Roll No: 26I-3011 • Wing I Curator',
      name: 'Muhammad Bilal',
      wing: 'wing1',
      wingTag: 'Wing 1 — Our Solar System',
      summary: 'Curated our cosmic neighborhood from the Sun and asteroid belt out to framed planetary exhibits, planetary scale charts, ring systems, and icy moons like Europa and Titan.',
      pages: [
        { label: '4. Solar System Overview & Scale', file: 'solar-system.html →', href: 'solar-system.html' },
        { label: '5. Inner Rocky Planets', file: 'inner-planets.html →', href: 'inner-planets.html' },
        { label: '6. Outer Gas & Ice Giants', file: 'outer-planets.html →', href: 'outer-planets.html' }
      ]
    },
    {
      initials: 'AR',
      idLabel: 'Roll No: 26I-3004 • Wing II Curator',
      name: 'Asad Rehman',
      wing: 'wing2',
      wingTag: 'Wing 2 — Deep Space & Cosmos',
      summary: 'Designed the deep-sky galleries explaining light-years, stellar nurseries like the Pillars of Creation and Orion Nebula, spiral galaxies, and Event Horizon black hole imagery.',
      pages: [
        { label: '7. Deep Space Overview', file: 'deep-space.html →', href: 'deep-space.html' },
        { label: '8. Stars & Stellar Nurseries', file: 'stars-nebulae.html →', href: 'stars-nebulae.html' },
        { label: '9. Black Holes & Galaxies', file: 'black-holes.html →', href: 'black-holes.html' }
      ]
    },
    {
      initials: 'KI',
      idLabel: 'Roll No: 26I-3013 • Wing III Curator',
      name: 'Khurrum Ishad',
      wing: 'wing3',
      wingTag: 'Wing 3 — History of Space Exploration',
      summary: 'Chronicled humanity\'s journey beyond Earth from Sputnik 1 and global milestones including SUPARCO to Apollo 11 moonwalks, Artemis, Mars rovers, and Voyager probes.',
      pages: [
        { label: '10. Space Race Timeline', file: 'exploration.html →', href: 'exploration.html' },
        { label: '11. Apollo & Lunar Missions', file: 'apollo-missions.html →', href: 'apollo-missions.html' },
        { label: '12. Mars Rovers & Probes', file: 'mars-rovers.html →', href: 'mars-rovers.html' }
      ]
    },
    {
      initials: 'AK',
      idLabel: 'Roll No: 26I-3010 • Wing IV Curator',
      name: 'Azlan Khan Mehsud',
      wing: 'wing4',
      wingTag: 'Wing 4 — Space Technology & Observatories',
      summary: 'Built the engineering exhibitions featuring side-by-side Hubble vs. JWST comparisons, Saturn V to Starship rocket payload charts, and a room-by-room International Space Station tour.',
      pages: [
        { label: '13. Space Telescopes (Hubble & JWST)', file: 'telescopes.html →', href: 'telescopes.html' },
        { label: '14. Historic & Modern Rockets', file: 'rockets.html →', href: 'rockets.html' },
        { label: '15. International Space Station', file: 'iss.html →', href: 'iss.html' }
      ]
    },
    {
      initials: 'MS',
      idLabel: 'Roll No: 26I-6528 • Interactive Lead',
      name: 'Muhammad Shoaib',
      wing: 'visitor',
      wingTag: 'Visitor Experience & Interactive Extras',
      summary: 'Engineered interactive visitor features including the Hubble Birthday Gift experience, a 10-question Junior Astronomer Quiz, and a localStorage-powered Saved Collection & Visitor Pass.',
      pages: [
        { label: '16. Hubble Birthday Gift', file: 'gift.html →', href: 'gift.html' },
        { label: '17. 10-Question Space Trivia Quiz', file: 'quiz.html →', href: 'quiz.html' },
        { label: '18. Saved Collection & Visitor Pass', file: 'my-collection.html →', href: 'my-collection.html' }
      ]
    }
  ];

  function createCuratorCard(curator) {
    const card = document.createElement('article');
    card.className = 'curator-card';
    card.dataset.wing = curator.wing;

    const topWrapper = document.createElement('div');

    const topHeader = document.createElement('div');
    topHeader.className = 'curator-top';

    const crest = document.createElement('div');
    crest.className = 'curator-crest';
    crest.textContent = curator.initials;

    const identity = document.createElement('div');

    const idEl = document.createElement('div');
    idEl.className = 'curator-id';
    idEl.textContent = curator.idLabel;

    const nameEl = document.createElement('h3');
    nameEl.textContent = curator.name;

    identity.append(idEl, nameEl);
    topHeader.append(crest, identity);

    const wingTag = document.createElement('div');
    wingTag.className = 'wing-tag';
    wingTag.textContent = curator.wingTag;

    const summary = document.createElement('p');
    summary.className = 'curator-summary';
    summary.textContent = curator.summary;

    topWrapper.append(topHeader, wingTag, summary);

    const linksList = document.createElement('div');
    linksList.className = 'page-links-list';

    curator.pages.forEach((page) => {
      const link = document.createElement('a');
      link.href = page.href;
      link.className = 'page-link-item';
      link.append(document.createTextNode(`${page.label} `));

      const fileSpan = document.createElement('span');
      fileSpan.textContent = page.file;
      link.appendChild(fileSpan);

      linksList.appendChild(link);
    });

    card.append(topWrapper, linksList);
    return card;
  }

  function setActiveFilterButton(wingKey) {
    filterBtns.forEach((btn) => {
      const isActive = btn.dataset.wing === wingKey;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  function createEmptyState() {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'empty-state';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'subtitle';
    eyebrow.textContent = 'No Matching Curators';

    const heading = document.createElement('h3');
    heading.textContent = 'No Curators Found for This Wing';

    const text = document.createElement('p');
    text.textContent = 'No curatorial profiles match the selected exhibition wing filter. Reset the filter to view all six founding curators.';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'gold-btn';
    resetBtn.textContent = 'Show All Curators';
    resetBtn.addEventListener('click', () => {
      setActiveFilterButton('all');
      renderCurators('all');
    });

    emptyBox.append(eyebrow, heading, text, resetBtn);
    return emptyBox;
  }

  function renderCurators(selectedWing = 'all') {
    const matchingCurators = selectedWing === 'all'
      ? CURATORS
      : CURATORS.filter((curator) => curator.wing === selectedWing);

    gridEl.replaceChildren();

    if (matchingCurators.length === 0) {
      gridEl.appendChild(createEmptyState());
      return;
    }

    const fragment = document.createDocumentFragment();
    matchingCurators.forEach((curator) => {
      fragment.appendChild(createCuratorCard(curator));
    });
    gridEl.appendChild(fragment);
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedWing = btn.dataset.wing || 'all';
      setActiveFilterButton(selectedWing);
      renderCurators(selectedWing);
    });
  });

  window.renderCurators = renderCurators;
  renderCurators('all');
})();
