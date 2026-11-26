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
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Darkness of ink stroke (white background = 0, black ink = 255)
        const brightness = (r + g + b) / 3;
        const inkAlpha = Math.max(0, Math.min(255, (245 - brightness) * 1.35));

        // Tint ink strokes to Golden Egg (#F0CB90)
        data[i] = 240;
        data[i + 1] = 203;
        data[i + 2] = 144;
        data[i + 3] = inkAlpha;
      }

      ctx.putImageData(imgData, 0, 0);
      container.innerHTML = '';
      container.appendChild(offCanvas);
    } catch (err) {
      // If browser blocks local file pixel reading, style the image directly with CSS filter
      img.style.filter = 'invert(1) sepia(0.55) saturate(2.1) hue-rotate(355deg) brightness(1.08)';
      img.style.mixBlendMode = 'screen';
    }
  }

  img.onload = processInkLogo;
  img.onerror = renderFallbackSVG;
  if (img.complete && img.naturalWidth > 0) processInkLogo();
})();

/* ==========================================================================
   2. INTERACTIVE SPIRAL GALAXY ENGINE (SILVER PLATE + GOLDEN SPOTS)
   ========================================================================== */
(function () {
  const canvas = document.getElementById('galaxy-webgl-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance'
  });
  if (!gl) return;

  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 16000 : 38000;

  function createPerspectiveMatrix(fovDeg, aspect, near, far) {
    const f = 1.0 / Math.tan((fovDeg * Math.PI) / 360.0);
    const nf = 1.0 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }

  function createLookAtMatrix(eye, center, up) {
    let zx = eye[0] - center[0];
    let zy = eye[1] - center[1];
    let zz = eye[2] - center[2];
    let zLen = Math.hypot(zx, zy, zz) || 1;
    zx /= zLen; zy /= zLen; zz /= zLen;

    let xx = up[1] * zz - up[2] * zy;
    let xy = up[2] * zx - up[0] * zz;
    let xz = up[0] * zy - up[1] * zx;
    let xLen = Math.hypot(xx, xy, xz) || 1;
    xx /= xLen; xy /= xLen; xz /= xLen;

    let yx = zy * xz - zz * xy;
    let yy = zz * xx - zx * xz;
    let yz = zx * xy - zy * xx;

    return new Float32Array([
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
      1
    ]);
  }

  function invert4x4(m) {
    const out = new Float32Array(16);
    const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
    const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
    const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
    const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return out;
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }

  function transformPoint4(m, x, y, z, w) {
    return [
      m[0] * x + m[4] * y + m[8] * z + m[12] * w,
      m[1] * x + m[5] * y + m[9] * z + m[13] * w,
      m[2] * x + m[6] * y + m[10] * z + m[14] * w,
      m[3] * x + m[7] * y + m[11] * z + m[15] * w
    ];
  }

  const vsSource = `
    precision highp float;

    attribute float aRadius;
    attribute float aAngle;
    attribute float aSpreadY;
    attribute float aSize;
    attribute float aGoldSpot;
    attribute float aPhase;
    attribute float aIsDust;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform float uTime;
    uniform vec2 uTilt;
    uniform vec2 uPointerWorld;
    uniform float uPointerActive;
    uniform float uScrollZoom;
    uniform float uPixelRatio;

    varying float vAlpha;
    varying float vGoldSpot;
    varying float vIsDust;

    void main() {
      // Differential Keplerian orbital velocity (inner core rotates faster than outer arms)
      float angularVel = 0.28 / (pow(aRadius, 0.62) + 0.25);
      float theta = aAngle + uTime * angularVel;

      vec3 pos = vec3(
        cos(theta) * aRadius,
        aSpreadY,
        sin(theta) * aRadius
      );

      // Smooth pointer/touch camera tilt on X & Y axes
      float cx = cos(uTilt.y);
      float sx = sin(uTilt.y);
      float cy = cos(uTilt.x);
      float sy = sin(uTilt.x);

      float x1 = pos.x * cy - pos.z * sy;
      float z1 = pos.x * sy + pos.z * cy;
      pos.x = x1;
      pos.z = z1;

      float y2 = pos.y * cx - pos.z * sx;
      float z2 = pos.y * sx + pos.z * cx;
      pos.y = y2;
      pos.z = z2;

      // Cursor magnetic repulsion wake in XZ plane
      vec2 delta = pos.xz - uPointerWorld;
      float dist = length(delta);
      float wake = smoothstep(0.85, 0.0, dist) * uPointerActive;
      if (dist > 0.0001) {
        pos.xz += normalize(delta) * wake * 0.24;
        pos.y += wake * 0.08;
      }

      // Scroll zoom outward adaptation
      pos *= (1.0 + uScrollZoom * 0.45);

      vec4 mvPosition = uViewMatrix * vec4(pos, 1.0);
      gl_Position = uProjectionMatrix * mvPosition;

      // Ambient twinkling oscillation
      float twinkle = 0.76 + 0.24 * sin(uTime * 2.2 + aPhase);

      // Depth-aware sprite sizing
      float perspectiveSize = aSize * (3.6 / max(-mvPosition.z, 0.6));
      gl_PointSize = clamp(perspectiveSize * uPixelRatio * twinkle, 1.2, 42.0);

      vGoldSpot = aGoldSpot;
      vIsDust = aIsDust;
      float scrollFade = clamp(1.0 - uScrollZoom * 0.55, 0.22, 1.0);
      vAlpha = clamp((0.52 + (1.0 / max(aRadius, 0.45)) * 0.22) * twinkle * scrollFade, 0.08, 0.95);
    }
  `;

  const fsSource = `
    precision mediump float;

    varying float vAlpha;
    varying float vGoldSpot;
    varying float vIsDust;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float r = length(coord) * 2.0;
      if (r > 1.0) discard;

      // Sharp star core vs soft blurred background nebula dust
      float falloff = mix(pow(1.0 - r, 2.4), pow(1.0 - r, 1.35) * 0.24, vIsDust);

      // Silver Plate (#C4C4C4 -> bright #E6ECF5) primary stars + Golden Egg (#F0CB90 / #BC9E70) spots
      vec3 silverPlate = vec3(0.82, 0.85, 0.91);
      vec3 goldenSpot  = vec3(0.96, 0.80, 0.54);

      vec3 finalColor = mix(silverPlate, goldenSpot, vGoldSpot);
      gl_FragColor = vec4(finalColor, falloff * vAlpha);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  const STRIDE_FLOATS = 7;
  const particleData = new Float32Array(PARTICLE_COUNT * STRIDE_FLOATS);
  const ARM_COUNT = 4;
  const SPIRAL_TWIST = 3.55;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const isDust = i < PARTICLE_COUNT * 0.14 ? 1.0 : 0.0;
    const u = Math.random();
    const radius = Math.pow(u, 1.32) * 2.85 + 0.04;

    const armIndex = i % ARM_COUNT;
    const baseArmAngle = (armIndex / ARM_COUNT) * Math.PI * 2;
    const logarithmicSpin = Math.log(radius + 0.25) * SPIRAL_TWIST;

    // Preserve clean dark negative-space lanes between spiral arms
    const gaussianScatter = (Math.random() + Math.random() + Math.random() - 1.5) * (0.26 + radius * 0.16);
    const angle = baseArmAngle + logarithmicSpin + gaussianScatter;

    const thickness = (0.14 / (radius + 0.45)) + 0.025;
    const yOffset = (Math.random() - 0.5) * thickness;

    const size = isDust > 0.5
      ? (18.0 + Math.random() * 24.0)
      : (2.8 + Math.pow(Math.random(), 2.8) * 6.2);

    // Silver Plate primary field with dense Golden Core + scattered Golden Spots along arms
    const isCoreGold = radius < 0.55 && Math.random() < 0.72;
    const isArmGoldenSpot = Math.random() < 0.11;
    const goldSpot = (isCoreGold || isArmGoldenSpot) ? 1.0 : 0.0;

    const phase = Math.random() * Math.PI * 2;

    const offset = i * STRIDE_FLOATS;
    particleData[offset + 0] = radius;
    particleData[offset + 1] = angle;
    particleData[offset + 2] = yOffset;
    particleData[offset + 3] = size;
    particleData[offset + 4] = goldSpot;
    particleData[offset + 5] = phase;
    particleData[offset + 6] = isDust;
  }

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.STATIC_DRAW);

  const BYTES_PER_FLOAT = 4;
  const STRIDE_BYTES = STRIDE_FLOATS * BYTES_PER_FLOAT;

  function bindAttrib(name, floatOffset) {
    const loc = gl.getAttribLocation(program, name);
    if (loc !== -1) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, STRIDE_BYTES, floatOffset * BYTES_PER_FLOAT);
    }
  }

  bindAttrib('aRadius', 0);
  bindAttrib('aAngle', 1);
  bindAttrib('aSpreadY', 2);
  bindAttrib('aSize', 3);
  bindAttrib('aGoldSpot', 4);
  bindAttrib('aPhase', 5);
  bindAttrib('aIsDust', 6);

  const uProjLoc = gl.getUniformLocation(program, 'uProjectionMatrix');
  const uViewLoc = gl.getUniformLocation(program, 'uViewMatrix');
  const uTimeLoc = gl.getUniformLocation(program, 'uTime');
  const uTiltLoc = gl.getUniformLocation(program, 'uTilt');
  const uPtrWorldLoc = gl.getUniformLocation(program, 'uPointerWorld');
  const uPtrActiveLoc = gl.getUniformLocation(program, 'uPointerActive');
  const uScrollLoc = gl.getUniformLocation(program, 'uScrollZoom');
  const uPixelRatioLoc = gl.getUniformLocation(program, 'uPixelRatio');

  const eyePos = [0, 2.35, 3.85];
  const viewMatrix = createLookAtMatrix(eyePos, [0, 0, 0], [0, 1, 0]);
  const invViewMatrix = invert4x4(viewMatrix);
  let projMatrix = createPerspectiveMatrix(52, window.innerWidth / window.innerHeight, 0.1, 100);
  let invProjMatrix = invert4x4(projMatrix);

  gl.uniformMatrix4fv(uViewLoc, false, viewMatrix);
  gl.uniformMatrix4fv(uProjLoc, false, projMatrix);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  let targetTiltX = 0, targetTiltY = 0;
  let currentTiltX = 0, currentTiltY = 0;
  let targetPtrX = 999, targetPtrZ = 999;
  let currentPtrX = 999, currentPtrZ = 999;
  let targetPtrActive = 0, currentPtrActive = 0;
  let targetScrollZoom = 0, currentScrollZoom = 0;

  function intersectGalacticPlane(ndcX, ndcY) {
    const clipNear = transformPoint4(invProjMatrix, ndcX, ndcY, -1, 1);
    const wNear = clipNear[3] || 1;
    const viewRay = [clipNear[0] / wNear, clipNear[1] / wNear, -1, 0];
    const worldDir = transformPoint4(invViewMatrix, viewRay[0], viewRay[1], viewRay[2], 0);

    if (Math.abs(worldDir[1]) < 0.0001) return null;
    const t = -eyePos[1] / worldDir[1];
    if (t < 0) return null;
    return [eyePos[0] + worldDir[0] * t, eyePos[2] + worldDir[2] * t];
  }

  function handlePointer(clientX, clientY) {
    const nx = (clientX / window.innerWidth) * 2 - 1;
    const ny = -((clientY / window.innerHeight) * 2 - 1);

    targetTiltX = nx * 0.26;
    targetTiltY = -ny * 0.20;

    const hit = intersectGalacticPlane(nx, ny);
    if (hit) {
      targetPtrX = hit[0];
      targetPtrZ = hit[1];
      targetPtrActive = 1.0;
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    projMatrix = createPerspectiveMatrix(52, window.innerWidth / window.innerHeight, 0.1, 100);
    invProjMatrix = invert4x4(projMatrix);
    gl.uniformMatrix4fv(uProjLoc, false, projMatrix);
    gl.uniform1f(uPixelRatioLoc, dpr);
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('pointermove', (e) => handlePointer(e.clientX, e.clientY), { passive: true });
  window.addEventListener('pointerleave', () => { targetPtrActive = 0.0; });

  window.addEventListener('scroll', () => {
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    targetScrollZoom = Math.min(1.0, window.scrollY / maxScroll);
  }, { passive: true });

  const startTime = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    const elapsed = (now - startTime) * 0.001;

    currentTiltX += (targetTiltX - currentTiltX) * 0.06;
    currentTiltY += (targetTiltY - currentTiltY) * 0.06;
    currentPtrX += (targetPtrX - currentPtrX) * 0.12;
    currentPtrZ += (targetPtrZ - currentPtrZ) * 0.12;
    currentPtrActive += (targetPtrActive - currentPtrActive) * 0.08;
    currentScrollZoom += (targetScrollZoom - currentScrollZoom) * 0.08;

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uTimeLoc, elapsed);
    gl.uniform2f(uTiltLoc, currentTiltX, currentTiltY);
    gl.uniform2f(uPtrWorldLoc, currentPtrX, currentPtrZ);
    gl.uniform1f(uPtrActiveLoc, currentPtrActive);
    gl.uniform1f(uScrollLoc, currentScrollZoom);

    gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);
  }

  requestAnimationFrame(animate);
})();

/* ==========================================================================
   3. ANDROMEDA MULTI-WAVELENGTH SPECTRUM SLIDER SCRIPT
   ========================================================================== */
const viewer = document.getElementById('spectrumViewer');
const layerXray = document.getElementById('layerXray');
const layerMulti = document.getElementById('layerMulti');
const divider = document.getElementById('sliderDivider');
const rangeInput = document.getElementById('spectrumRange');
const caption = document.getElementById('spectrumCaption');
const buttons = document.querySelectorAll('.spec-btn');

const descriptions = {
  visible: '<strong style="color: #F0CB90;">Visible Light View (Andromeda):</strong> Captures the golden glow of hundreds of billions of stars and dark lanes of interstellar dust across our nearest major galactic neighbor.',
  xray: '<strong style="color: #F0CB90;">X-Ray View (Andromeda):</strong> Highlights hundreds of X-ray binary stars and superheated plasma swirling around Andromeda\'s central supermassive black hole.',
  multi: '<strong style="color: #F0CB90;">Multi-Wavelength Composite:</strong> Merges infrared dust rings, optical starlight, and X-ray radiation into one complete portrait of galactic evolution.'
};

let currentPercent = 50;
let targetPercent = 50;
let activeZone = '';

function renderSpectrum(percent) {
  divider.style.left = percent + '%';
  rangeInput.value = percent.toFixed(1);

  const xrayRightInset = Math.max(0, Math.min(100, 100 - (percent * 1.5)));
  const multiRightInset = Math.max(0, Math.min(100, 100 - Math.max(0, (percent - 35) * 1.54)));

  layerXray.style.clipPath = `inset(0 ${xrayRightInset}% 0 0)`;
  layerMulti.style.clipPath = `inset(0 ${multiRightInset}% 0 0)`;

  let newZone = 'xray';
  if (percent < 34) newZone = 'visible';
  else if (percent > 68) newZone = 'multi';

  if (newZone !== activeZone) {
    activeZone = newZone;
    buttons.forEach(btn => btn.classList.remove('active'));
    if (newZone === 'visible') {
      buttons[0].classList.add('active');
      caption.innerHTML = descriptions.visible;
    } else if (newZone === 'xray') {
      buttons[1].classList.add('active');
      caption.innerHTML = descriptions.xray;
    } else {
      buttons[2].classList.add('active');
      caption.innerHTML = descriptions.multi;
    }
  }
}

function animateLoop() {
  const diff = targetPercent - currentPercent;
  if (Math.abs(diff) > 0.02) {
    currentPercent += diff * 0.16;
    renderSpectrum(currentPercent);
  } else if (currentPercent !== targetPercent) {
    currentPercent = targetPercent;
    renderSpectrum(currentPercent);
  }
  requestAnimationFrame(animateLoop);
}

function setTargetSpectrum(val) {
  targetPercent = Math.max(0, Math.min(100, Number(val)));
}

rangeInput.addEventListener('input', (e) => setTargetSpectrum(e.target.value));

let isDragging = false;
function updateFromPointer(clientX) {
  const rect = viewer.getBoundingClientRect();
  const pos = ((clientX - rect.left) / rect.width) * 100;
  setTargetSpectrum(pos);
}

viewer.addEventListener('pointerdown', (e) => {
  isDragging = true;
  viewer.classList.add('dragging');
  viewer.setPointerCapture(e.pointerId);
  updateFromPointer(e.clientX);
});

viewer.addEventListener('pointermove', (e) => {
  if (isDragging) updateFromPointer(e.clientX);
});

viewer.addEventListener('pointerup', (e) => {
  isDragging = false;
  viewer.classList.remove('dragging');
  viewer.releasePointerCapture(e.pointerId);
});

renderSpectrum(50);
requestAnimationFrame(animateLoop);

/* ==========================================================================
   4. PERMANENT EXHIBITION HALLS (DYNAMIC RENDERING + EMPTY STATE)
   ========================================================================== */
(function () {
  const roomListEl = document.getElementById('roomList');
  if (!roomListEl) return;

  const EXHIBITION_HALLS = [
    {
      id: 'wing1',
      wingLabel: 'WING I',
      title: 'Our Solar System',
      description: 'Eight worlds, dwarf planets, and golden rings orbiting our home star.',
      href: 'pages/solar-system.html',
      linkText: 'Enter Gallery →'
    },
    {
      id: 'wing2',
      wingLabel: 'WING II',
      title: 'Deep Space',
      description: 'Pillars of cosmic dust, dying stars, and the mysteries of event horizons.',
      href: 'pages/deep-space.html',
      linkText: 'Enter Gallery →'
    },
    {
      id: 'wing3',
      wingLabel: 'WING III',
      title: 'Human Exploration',
      description: 'Footprints on the lunar regolith and robotic emissaries on Mars.',
      href: 'pages/exploration.html',
      linkText: 'Enter Gallery →'
    },
    {
      id: 'wing4',
      wingLabel: 'WING IV',
      title: 'Space Engineering',
      description: 'The orbital telescopes, heavy rockets, and stations extending human sight.',
      href: 'pages/telescopes.html',
      linkText: 'Enter Gallery →'
    }
  ];

  function createEmptyState(message) {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'empty-state';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'subtitle';
    eyebrow.textContent = 'No Matching Galleries';

    const heading = document.createElement('h3');
    heading.textContent = 'No Exhibition Halls Found';

    const text = document.createElement('p');
    text.textContent = message;

    emptyBox.append(eyebrow, heading, text);
    return emptyBox;
  }

  function createRoomCard(hall) {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.dataset.wing = hall.id;

    const num = document.createElement('div');
    num.className = 'room-num';
    num.textContent = hall.wingLabel;

    const title = document.createElement('h3');
    title.textContent = hall.title;

    const desc = document.createElement('p');
    desc.textContent = hall.description;

    const link = document.createElement('a');
    link.href = hall.href;
    link.textContent = hall.linkText;

    card.append(num, title, desc, link);
    return card;
  }

  function renderExhibitionHalls(filterWing = 'all') {
    const matchingHalls = filterWing === 'all'
      ? EXHIBITION_HALLS
      : EXHIBITION_HALLS.filter((hall) => hall.id === filterWing);

    roomListEl.replaceChildren();

    if (matchingHalls.length === 0) {
      roomListEl.appendChild(
        createEmptyState('No permanent exhibition halls match the selected filter.')
      );
      return;
    }

    const fragment = document.createDocumentFragment();
    matchingHalls.forEach((hall) => {
      fragment.appendChild(createRoomCard(hall));
    });
    roomListEl.appendChild(fragment);
  }

  window.renderExhibitionHalls = renderExhibitionHalls;
  renderExhibitionHalls('all');
})();
