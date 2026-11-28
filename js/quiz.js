/* ==========================================================================
   STELLARIUM — SPACE TRIVIA QUIZ & JUNIOR ASTRONOMER CERTIFICATE (js/quiz.js)
   10 Museum-Wide Multiple-Choice Questions, Live Form Validation,
   localStorage State Persistence, Scoring Analytics & Certificate Generator
   ========================================================================== */

(function () {
  const QUIZ_BANK = [
    {
      id: 'q1',
      wing: 'Wing I • Solar System',
      wingPage: 'solar-system.html',
      exhibit: 'Exhibit 01 • Planetary Extremes',
      prompt: 'Which planet in our Solar System experiences the hottest surface temperatures—averaging around 465°C (869°F)—due to a runaway carbon dioxide greenhouse atmosphere?',
      options: [
        'Mercury, because it orbits closest to the Sun',
        'Venus, trapped beneath dense sulfuric acid clouds',
        'Mars, during southern summer dust storms',
        'Jupiter, radiating primordial gravitational heat'
      ],
      correctIndex: 1,
      explanation: 'Although Mercury is closer to the Sun, Venus possesses a thick CO₂ atmosphere (92 times Earth’s surface pressure) that traps heat globally, making it hotter than Mercury.'
    },
    {
      id: 'q2',
      wing: 'Wing I • Solar System',
      wingPage: 'solar-system.html',
      exhibit: 'Exhibit 03 • Outer Moons & Rings',
      prompt: 'Which moon of Saturn ejects water-ice geysers from subsurface ocean fractures near its south pole, feeding Saturn’s E-ring?',
      options: [
        'Titan',
        'Io',
        'Enceladus',
        'Europa'
      ],
      correctIndex: 2,
      explanation: 'Enceladus vents plumes of water vapor, ice grains, and organic molecules through "tiger stripe" fissures, indicating a warm liquid ocean beneath its icy crust.'
    },
    {
      id: 'q3',
      wing: 'Wing II • Deep Space',
      wingPage: 'deep-space.html',
      exhibit: 'Exhibit 05 • Stellar Nurseries',
      prompt: 'What astrophysical process powers main-sequence stars like our Sun for billions of years inside their superheated cores?',
      options: [
        'Nuclear fission of uranium and thorium isotopes',
        'Thermonuclear fusion of hydrogen nuclei into helium',
        'Chemical combustion of interstellar molecular hydrogen',
        'Gravitational tidal friction from orbiting planets'
      ],
      correctIndex: 1,
      explanation: 'At core temperatures exceeding 15 million Kelvin, hydrogen protons fuse into helium via the proton-proton chain, converting mass directly into radiant energy.'
    },
    {
      id: 'q4',
      wing: 'Wing II • Deep Space',
      wingPage: 'deep-space.html',
      exhibit: 'Exhibit 07 • Black Holes & Relativistic Phenomena',
      prompt: 'What is the name of the boundary surrounding a black hole beyond which the escape velocity exceeds the speed of light?',
      options: [
        'The Roche Limit',
        'The Oort Shell',
        'The Event Horizon',
        'The Chandrasekhar Boundary'
      ],
      correctIndex: 2,
      explanation: 'The Event Horizon marks the point of no return around a black hole; once crossed, all spacetime paths lead inward toward the singularity.'
    },
    {
      id: 'q5',
      wing: 'Wing II • Deep Space',
      wingPage: 'deep-space.html',
      exhibit: 'Exhibit 08 • Galaxies & Cosmology',
      prompt: 'What is the approximate diameter of the Milky Way’s luminous stellar disk, which houses between 100 and 400 billion stars?',
      options: [
        '10,000 light-years',
        '100,000 light-years',
        '2.5 million light-years',
        '13.8 billion light-years'
      ],
      correctIndex: 1,
      explanation: 'Our barred spiral galaxy spans roughly 100,000 light-years across, with our Solar System orbiting in the Orion Arm about 26,000 light-years from Sagittarius A*.'
    },
    {
      id: 'q6',
      wing: 'Wing III • Exploration',
      wingPage: 'exploration.html',
      exhibit: 'Exhibit 09 • Apollo Lunar Landings',
      prompt: 'On July 20, 1969, which Lunar Module carried Neil Armstrong and Buzz Aldrin to the surface of Mare Tranquillitatis (Sea of Tranquility)?',
      options: [
        'Apollo 11 Lunar Module "Eagle"',
        'Apollo 13 Lunar Module "Aquarius"',
        'Apollo 17 Lunar Module "Challenger"',
        'Vostok 1 Descent Capsule'
      ],
      correctIndex: 0,
      explanation: 'Commanded by Neil Armstrong with Lunar Module Pilot Buzz Aldrin, the Apollo 11 Lunar Module Eagle touched down on Mare Tranquillitatis while Michael Collins orbited overhead in Columbia.'
    },
    {
      id: 'q7',
      wing: 'Wing III • Exploration',
      wingPage: 'exploration.html',
      exhibit: 'Exhibit 11 • Planetary Rovers',
      prompt: 'Which NASA nuclear-powered rover landed in Jezero Crater in February 2021 accompanied by the Ingenuity Mars Helicopter?',
      options: [
        'Spirit',
        'Opportunity',
        'Perseverance',
        'Sojourner'
      ],
      correctIndex: 2,
      explanation: 'Perseverance explores ancient river delta deposits in Jezero Crater to cache rock cores for future sample return and deployed Ingenuity for the first powered flights on another planet.'
    },
    {
      id: 'q8',
      wing: 'Wing IV • Observatories',
      wingPage: 'telescopes.html',
      exhibit: 'Exhibit 13 • Space Telescopes',
      prompt: 'Where does the James Webb Space Telescope (JWST) orbit so its tennis-court-sized sunshield can keep its infrared mirrors below 50 Kelvin?',
      options: [
        'Low Earth Orbit at 400 km altitude',
        'The Sun-Earth L2 Lagrange Point, 1.5 million km beyond Earth',
        'A polar orbit around the Moon',
        'Geostationary orbit above the Pacific Ocean'
      ],
      correctIndex: 1,
      explanation: 'Orbiting the Sun-Earth L2 point allows JWST to keep the Sun, Earth, and Moon on one side of its five-layer sunshield while observing faint infrared light from the earliest galaxies.'
    },
    {
      id: 'q9',
      wing: 'Wing IV • Observatories',
      wingPage: 'rockets.html',
      exhibit: 'Exhibit 14 • Historic & Modern Rockets',
      prompt: 'Which super-heavy-lift launch vehicle, standing 110.6 meters tall and powered by five F-1 engines on its first stage, launched all Apollo crews to the Moon?',
      options: [
        'Saturn V',
        'Falcon 9 Block 5',
        'Ariane 5 ECA',
        'Soyuz-FG'
      ],
      correctIndex: 0,
      explanation: 'Designed under Wernher von Braun, the three-stage Saturn V remains the only launch vehicle to carry humans beyond Low Earth Orbit.'
    },
    {
      id: 'q10',
      wing: 'Wing IV • Observatories',
      wingPage: 'iss.html',
      exhibit: 'Exhibit 15 • International Space Station',
      prompt: 'Why do astronauts aboard the International Space Station eat tortillas instead of sliced bread and rely on continuous circulation fans inside Harmony sleep pods?',
      options: [
        'To reduce launch mass by 50% and cool supercomputers',
        'Bread crumbs float into air filters, and airflow prevents exhaled CO₂ pockets around sleeping crew',
        'Microgravity increases atmospheric pressure inside Zvezda',
        'Tortillas reflect cosmic radiation better than wheat loaves'
      ],
      correctIndex: 1,
      explanation: 'In freefall, crumbs pose an inhalation and equipment hazard, while warm exhaled CO₂ does not rise naturally—making sleep-pod fans vital for astronaut safety.'
    }
  ];

  const STATE_KEY = 'stellarium_quiz_state_v1';
  const BEST_KEY = 'stellarium_quiz_best_v1';

  let state = {
    candidateName: '',
    candidateEmail: '',
    favoriteWing: '',
    mode: 'standard',
    order: QUIZ_BANK.map((_, i) => i),
    currentIndex: 0,
    answers: {}, // { [questionId]: selectedOptionIndex }
    completed: false,
    serial: ''
  };

  let reviewFilter = 'all';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
      /* Ignore storage quota restrictions */
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.order) && parsed.order.length === QUIZ_BANK.length) {
        return parsed;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function loadBestRecord() {
    try {
      const raw = localStorage.getItem(BEST_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveBestRecord(record) {
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify(record));
    } catch (e) {
      /* Ignore */
    }
  }

  function shuffleIndices(len) {
    const arr = Array.from({ length: len }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function computeScore() {
    let correct = 0;
    QUIZ_BANK.forEach(q => {
      if (state.answers[q.id] === q.correctIndex) correct++;
    });
    return correct;
  }

  function getRankDetails(score) {
    if (score >= 9) {
      return {
        shortRank: 'Gold Laureate',
        fullRank: 'Junior Astronomer — Gold Laureate (Distinction)'
      };
    }
    if (score >= 7) {
      return {
        shortRank: 'Certified Scholar',
        fullRank: 'Junior Astronomer — Certified Observatory Scholar'
      };
    }
    return {
      shortRank: 'Cadet Stargazer',
      fullRank: 'Junior Astronomer — Associate Cadet'
    };
  }

  /* ------------------------------------------------------------------------
     MOBILE NAVIGATION TOGGLE
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  /* ------------------------------------------------------------------------
     TOP BAR RECORD & SAVED CERTIFICATE MODAL
     ------------------------------------------------------------------------ */
  function syncHeaderRecord() {
    const badge = document.getElementById('bestScoreBadge');
    const viewBtn = document.getElementById('openSavedCertBtn');
    const best = loadBestRecord();

    if (!best) {
      badge.textContent = 'Best Record: Not Attempted';
      viewBtn.hidden = true;
      return;
    }

    badge.textContent = `Best Record: ${best.score}/10 (${best.accuracy}%) — ${best.candidateName}`;
    viewBtn.hidden = false;
  }

  function openSavedCertModal() {
    const best = loadBestRecord();
    if (!best) return;

    const box = document.getElementById('savedCertModalContent');
    box.innerHTML = `
      <div class="stat-list">
        <li><strong>Recipient:</strong> ${escapeHtml(best.candidateName)}</li>
        <li><strong>Awarded Title:</strong> ${escapeHtml(best.fullRank)}</li>
        <li><strong>Score &amp; Accuracy:</strong> ${best.score} / 10 (${best.accuracy}%)</li>
        <li><strong>Specialty Wing:</strong> ${escapeHtml(best.favoriteWing)}</li>
        <li><strong>Date Conferred:</strong> ${escapeHtml(best.date)}</li>
        <li><strong>Serial Number:</strong> ${escapeHtml(best.serial)}</li>
      </div>
      <p style="font-size:0.92rem; color:var(--gold-light);">Tip: Complete or view the results panel below to print the full-size certificate plaque.</p>
    `;
    document.getElementById('certPreviewModal').classList.add('open');
  }

  /* ------------------------------------------------------------------------
     LIVE VALIDATED CANDIDATE REGISTRATION FORM
     ------------------------------------------------------------------------ */
  function initRegistrationForm() {
    const form = document.getElementById('candidateForm');
    const statusEl = document.getElementById('regStatus');
    const resumeBtn = document.getElementById('resumeQuizBtn');

    const fields = {
      name: {
        el: document.getElementById('candidateName'),
        err: document.getElementById('errCandidateName'),
        validate: v => {
          const trimmed = v.trim();
          if (trimmed.length < 2) return 'Please enter your name (at least 2 characters) for the certificate.';
          if (!/^[a-zA-Z0-9 .'-]+$/.test(trimmed)) return 'Use standard letters, spaces, periods, or hyphens.';
          return '';
        }
      },
      email: {
        el: document.getElementById('candidateEmail'),
        err: document.getElementById('errCandidateEmail'),
        validate: v => {
          const trimmed = v.trim();
          if (!trimmed) return ''; // Optional field
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? '' : 'Enter a valid email address or leave blank.';
        }
      },
      wing: {
        el: document.getElementById('favoriteWing'),
        err: document.getElementById('errFavoriteWing'),
        validate: v => v ? '' : 'Please select your favorite museum wing for your certificate endorsement.'
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

    // Check for existing saved session
    const saved = loadState();
    if (saved && saved.candidateName) {
      fields.name.el.value = saved.candidateName;
      fields.email.el.value = saved.candidateEmail || '';
      fields.wing.el.value = saved.favoriteWing || '';
      resumeBtn.hidden = false;
      resumeBtn.textContent = saved.completed
        ? `View Last Results (${saved.candidateName})`
        : `Resume Attempt (${Object.keys(saved.answers).length}/10 Answered)`;
    }

    resumeBtn.addEventListener('click', () => {
      const existing = loadState();
      if (!existing) return;
      state = existing;
      if (state.completed) {
        showResultsStage();
      } else {
        showQuizStage();
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const valid = Object.keys(fields).map(validateField).every(Boolean);
      if (!valid) {
        statusEl.className = 'form-status visible error';
        statusEl.textContent = 'Please resolve the highlighted fields before starting the examination.';
        return;
      }

      statusEl.className = 'form-status';
      statusEl.textContent = '';

      const mode = document.getElementById('difficultyFilter').value;
      const serialNum = 'STL-2026-' + String(Math.floor(1000 + Math.random() * 9000));

      state = {
        candidateName: fields.name.el.value.trim(),
        candidateEmail: fields.email.el.value.trim(),
        favoriteWing: fields.wing.el.value,
        mode,
        order: mode === 'shuffled' ? shuffleIndices(QUIZ_BANK.length) : QUIZ_BANK.map((_, i) => i),
        currentIndex: 0,
        answers: {},
        completed: false,
        serial: serialNum
      };

      saveState();
      showQuizStage();
    });
  }

  /* ------------------------------------------------------------------------
     QUIZ RENDERING & INTERACTION
     ------------------------------------------------------------------------ */
  function showQuizStage() {
    document.getElementById('registrationSection').hidden = true;
    document.getElementById('resultsSection').hidden = true;
    document.getElementById('quizStageSection').hidden = false;
    renderCurrentQuestion();
  }

  function renderNavDots() {
    const container = document.getElementById('questionNavDots');
    container.innerHTML = state.order.map((bankIdx, pos) => {
      const q = QUIZ_BANK[bankIdx];
      const userAns = state.answers[q.id];
      let cls = 'q-dot';
      if (pos === state.currentIndex) cls += ' current';
      if (userAns !== undefined) {
        cls += userAns === q.correctIndex ? ' answered-correct' : ' answered-wrong';
      }
      return `<button type="button" class="${cls}" data-jump-idx="${pos}" aria-label="Go to question ${pos + 1}">${pos + 1}</button>`;
    }).join('');

    container.querySelectorAll('[data-jump-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.currentIndex = Number(btn.getAttribute('data-jump-idx'));
        saveState();
        renderCurrentQuestion();
      });
    });
  }

  function renderCurrentQuestion() {
    const bankIdx = state.order[state.currentIndex];
    const q = QUIZ_BANK[bankIdx];
    const selected = state.answers[q.id];
    const isAnswered = selected !== undefined;

    document.getElementById('questionWingTag').textContent = q.wing;
    document.getElementById('currentQNum').textContent = String(state.currentIndex + 1);
    document.getElementById('hudCandidateName').textContent = state.candidateName;
    document.getElementById('hudLiveScore').textContent = String(computeScore());

    const answeredCount = Object.keys(state.answers).length;
    const pct = Math.max(10, Math.round(((state.currentIndex + 1) / QUIZ_BANK.length) * 100));
    document.getElementById('quizProgressFill').style.width = pct + '%';
    document.getElementById('quizProgressBar').setAttribute('aria-valuenow', String(state.currentIndex + 1));

    document.getElementById('questionExhibitRef').textContent = q.exhibit;
    const hintLink = document.getElementById('questionHintLink');
    hintLink.href = q.wingPage;
    hintLink.textContent = `Consult ${q.wing.split('•')[0].trim()} →`;

    document.getElementById('questionPromptText').textContent = q.prompt;

    const letters = ['A', 'B', 'C', 'D'];
    const optionsEl = document.getElementById('optionsContainer');
    optionsEl.innerHTML = q.options.map((optText, idx) => {
      let stateClass = '';
      if (isAnswered) {
        if (idx === q.correctIndex) stateClass = 'correct';
        else if (idx === selected) stateClass = 'incorrect';
      }
      return `
        <button
          type="button"
          class="option-btn ${stateClass}"
          data-opt-idx="${idx}"
          role="radio"
          aria-checked="${selected === idx}"
          ${isAnswered ? 'disabled' : ''}
        >
          <span class="option-letter">${letters[idx]}</span>
          <span>${escapeHtml(optText)}</span>
        </button>
      `;
    }).join('');

    optionsEl.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.answers[q.id] !== undefined) return;
        state.answers[q.id] = Number(btn.getAttribute('data-opt-idx'));
        saveState();
        renderCurrentQuestion();
      });
    });

    const feedback = document.getElementById('feedbackBanner');
    const headline = document.getElementById('feedbackHeadline');
    const explanation = document.getElementById('feedbackExplanation');

    if (isAnswered) {
      const right = selected === q.correctIndex;
      feedback.hidden = false;
      feedback.className = `feedback-banner ${right ? 'is-correct' : 'is-incorrect'}`;
      headline.textContent = right
        ? '✓ Accurate Observation!'
        : `✕ Incorrect — Correct Answer: ${letters[q.correctIndex]}`;
      explanation.textContent = q.explanation;
    } else {
      feedback.hidden = true;
    }

    document.getElementById('prevQuestionBtn').disabled = state.currentIndex === 0;

    const nextBtn = document.getElementById('nextQuestionBtn');
    const isLast = state.currentIndex === QUIZ_BANK.length - 1;
    nextBtn.disabled = !isAnswered;
    nextBtn.textContent = isLast
      ? (answeredCount === QUIZ_BANK.length ? 'Claim Junior Astronomer Certificate ★' : 'Answer All Questions to Finish')
      : 'Next Question →';

    if (isLast && answeredCount < QUIZ_BANK.length) {
      nextBtn.disabled = true;
    }

    renderNavDots();
  }

  /* ------------------------------------------------------------------------
     RESULTS CALCULATION, CERTIFICATE POPULATION & ANSWER REVIEW
     ------------------------------------------------------------------------ */
  function calculateStrongestWing() {
    const wingScores = {};
    QUIZ_BANK.forEach(q => {
      const shortWing = q.wing.split('•')[0].trim();
      if (!wingScores[shortWing]) wingScores[shortWing] = { correct: 0, total: 0 };
      wingScores[shortWing].total++;
      if (state.answers[q.id] === q.correctIndex) {
        wingScores[shortWing].correct++;
      }
    });

    let bestWing = 'Wing I';
    let bestRatio = -1;
    Object.keys(wingScores).forEach(w => {
      const ratio = wingScores[w].correct / wingScores[w].total;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestWing = `${w} (${wingScores[w].correct}/${wingScores[w].total})`;
      }
    });
    return bestWing;
  }

  function showResultsStage() {
    state.completed = true;
    saveState();

    document.getElementById('registrationSection').hidden = true;
    document.getElementById('quizStageSection').hidden = true;
    document.getElementById('resultsSection').hidden = false;

    const score = computeScore();
    const accuracy = Math.round((score / QUIZ_BANK.length) * 100);
    const rank = getRankDetails(score);
    const strongest = calculateStrongestWing();
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    document.getElementById('resScoreFraction').textContent = `${score} / 10`;
    document.getElementById('resAccuracy').textContent = `${accuracy}%`;
    document.getElementById('resRankTitle').textContent = rank.shortRank;
    document.getElementById('resStrongestWing').textContent = strongest;

    // Populate Junior Astronomer Certificate
    document.getElementById('certRecipientName').textContent = state.candidateName || 'Distinguished Visitor';
    document.getElementById('certScoreDisplay').textContent = `${score} / 10 (${accuracy}%)`;
    document.getElementById('certRankDisplay').textContent = rank.fullRank;
    document.getElementById('certDateDisplay').textContent = dateStr;
    document.getElementById('certSerialDisplay').textContent = state.serial || 'STL-2026-1024';
    document.getElementById('certWingEndorsement').textContent = state.favoriteWing || 'All Four Museum Wings';

    const prevBest = loadBestRecord();
    if (!prevBest || score >= prevBest.score) {
      saveBestRecord({
        candidateName: state.candidateName,
        score,
        accuracy,
        fullRank: rank.fullRank,
        favoriteWing: state.favoriteWing,
        date: dateStr,
        serial: state.serial
      });
    }
    syncHeaderRecord();
    renderReviewList();
  }

  function renderReviewList() {
    const listEl = document.getElementById('answerReviewList');
    const items = state.order.map((bankIdx, idx) => {
      const q = QUIZ_BANK[bankIdx];
      const userIdx = state.answers[q.id];
      const isCorrect = userIdx === q.correctIndex;
      return { q, idx, userIdx, isCorrect };
    }).filter(item => {
      if (reviewFilter === 'correct') return item.isCorrect;
      if (reviewFilter === 'incorrect') return !item.isCorrect;
      return true;
    });

    if (!items.length) {
      listEl.innerHTML = '<p style="text-align:center; padding:1.2rem; color:var(--gold-light);">No questions match this filter category.</p>';
      return;
    }

    listEl.innerHTML = items.map(({ q, idx, userIdx, isCorrect }) => `
      <article class="review-item ${isCorrect ? 'ok' : 'bad'}">
        <div class="review-item-head">
          <span class="badge-tag">Q${idx + 1} • ${escapeHtml(q.wing)}</span>
          <strong style="color:${isCorrect ? '#7ce3a8' : '#ff8c82'};">${isCorrect ? '✓ Correct' : '✕ Missed'}</strong>
        </div>
        <h4>${escapeHtml(q.prompt)}</h4>
        <p><strong>Your Answer:</strong> ${userIdx !== undefined ? escapeHtml(q.options[userIdx]) : 'Unanswered'}</p>
        <p><strong>Curator Key:</strong> <span style="color:var(--gold-light);">${escapeHtml(q.options[q.correctIndex])}</span></p>
        <p style="color:var(--text-silver); margin-top:0.35rem;"><em>${escapeHtml(q.explanation)}</em></p>
      </article>
    `).join('');
  }

  /* ------------------------------------------------------------------------
     INITIALIZATION & EVENT LISTENERS
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    syncHeaderRecord();
    initRegistrationForm();

    document.getElementById('prevQuestionBtn').addEventListener('click', () => {
      if (state.currentIndex > 0) {
        state.currentIndex--;
        saveState();
        renderCurrentQuestion();
      }
    });

    document.getElementById('nextQuestionBtn').addEventListener('click', () => {
      if (state.currentIndex < QUIZ_BANK.length - 1) {
        state.currentIndex++;
        saveState();
        renderCurrentQuestion();
      } else if (Object.keys(state.answers).length === QUIZ_BANK.length) {
        showResultsStage();
      }
    });

    document.getElementById('resetAttemptBtn').addEventListener('click', () => {
      state.answers = {};
      state.currentIndex = 0;
      state.completed = false;
      saveState();
      renderCurrentQuestion();
    });

    document.getElementById('retakeQuizBtn').addEventListener('click', () => {
      document.getElementById('resultsSection').hidden = true;
      document.getElementById('quizStageSection').hidden = true;
      document.getElementById('registrationSection').hidden = false;
      const resumeBtn = document.getElementById('resumeQuizBtn');
      resumeBtn.hidden = false;
      resumeBtn.textContent = `View Last Results (${state.candidateName})`;
    });

    document.getElementById('printCertificateBtn').addEventListener('click', () => {
      window.print();
    });

    document.querySelectorAll('#reviewFilterGroup button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#reviewFilterGroup button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        reviewFilter = btn.getAttribute('data-review-filter');
        renderReviewList();
      });
    });

    // Saved Certificate Modal Controls
    const modal = document.getElementById('certPreviewModal');
    document.getElementById('openSavedCertBtn').addEventListener('click', openSavedCertModal);
    document.getElementById('closeCertModalBtn').addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('open');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        modal.classList.remove('open');
      }
    });
    document.getElementById('clearSavedRecordBtn').addEventListener('click', () => {
      try {
        localStorage.removeItem(BEST_KEY);
      } catch (e) { /* ignore */ }
      syncHeaderRecord();
      modal.classList.remove('open');
    });
    document.getElementById('modalPrintBtn').addEventListener('click', () => {
      modal.classList.remove('open');
      if (!state.completed && loadBestRecord()) {
        const best = loadBestRecord();
        document.getElementById('certRecipientName').textContent = best.candidateName;
        document.getElementById('certScoreDisplay').textContent = `${best.score} / 10 (${best.accuracy}%)`;
        document.getElementById('certRankDisplay').textContent = best.fullRank;
        document.getElementById('certDateDisplay').textContent = best.date;
        document.getElementById('certSerialDisplay').textContent = best.serial;
        document.getElementById('certWingEndorsement').textContent = best.favoriteWing;
        document.getElementById('resultsSection').hidden = false;
      }
      window.print();
    });
  });
})();