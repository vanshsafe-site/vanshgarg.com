/* ======================================================
   VANSH GARG PORTFOLIO — script.js  (AI Neural Net Edition)
   Background: Drifting neurons · synaptic connections ·
               signal packets · hex-circuit grid · mouse glow
   ====================================================== */

   (function () {
    'use strict';
  
    /* ── DEVICE CAPABILITY DETECTION ──────────────────── */
    const isTouch  = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const isLowEnd = navigator.hardwareConcurrency <= 2
                  || !!(navigator.connection && navigator.connection.saveData);
    const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
    const NEURON_COUNT = isLowEnd ? 26 : (isTouch ? 36 : 54);
    const FRAME_MS     = isLowEnd ? 80 : 33;   // ~30 fps; low-end ~12 fps
    const CONN_DIST    = isLowEnd ? 150 : 210;
  
    /* Pre-computed colour palette { hex, r,g,b } */
    const PALETTE = [
      { hex: '#4facfe', r: 79,  g: 172, b: 254 },
      { hex: '#00f2fe', r: 0,   g: 242, b: 254 },
      { hex: '#a78bfa', r: 167, g: 139, b: 250 },
      { hex: '#7ef5ff', r: 126, g: 245, b: 255 },
      { hex: '#c084fc', r: 192, g: 132, b: 252 },
    ];
  
    function rgba({ r, g, b }, a) { return `rgba(${r},${g},${b},${a})`; }
    function rand(a, b)           { return a + Math.random() * (b - a);  }
    function pick(arr)            { return arr[Math.floor(Math.random() * arr.length)]; }
  
    /* ── 1. INJECT LAYERS ──────────────────────────────── */
    function injectLayers() {
      const prog = document.createElement('div');
      prog.id = 'scroll-progress';
      document.body.prepend(prog);
  
      if (!reduced) {
        const cvs = document.createElement('canvas');
        cvs.id = 'star-canvas';
        document.body.prepend(cvs);
      }
  
      if (!isTouch) {
        document.body.style.cursor = 'none';
        const co = document.createElement('div'); co.id = 'cursor-outer';
        const ci = document.createElement('div'); ci.id = 'cursor-inner';
        document.body.appendChild(co);
        document.body.appendChild(ci);
      }
    }
  
    /* ── 2. AI NEURAL NETWORK BACKGROUND ────────────────── */
    function initNeuralNet() {
      if (reduced) return;
      const cvs = document.getElementById('star-canvas');
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
  
      let W, H, neurons = [], signals = [], lastFrame = 0, prevT = 0;
      let mouse = { x: -999, y: -999 };  // off-screen default
  
      /* ─ Resize ─ */
      function resize() {
        W = cvs.width  = window.innerWidth;
        H = cvs.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', () => { resize(); buildNeurons(); }, { passive: true });
  
      /* Track mouse for proximity effects (desktop only) */
      if (!isTouch) {
        window.addEventListener('mousemove', e => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        }, { passive: true });
      }
  
      /* ─ Build Neurons ─ */
      function buildNeurons() {
        neurons = Array.from({ length: NEURON_COUNT }, () => {
          const col = pick(PALETTE);
          return {
            x:          rand(0, W),
            y:          rand(0, H),
            r:          rand(2.8, 5.5),
            vx:         rand(-0.1, 0.1),
            vy:         rand(-0.1, 0.1),
            col,
            pulse:      rand(0, Math.PI * 2),
            pulseSpd:   rand(0.01, 0.025),
            glowR:      rand(14, 30),
            active:     false,
            activeTTL:  0,
            hovered:    false,
          };
        });
        signals = [];
      }
      buildNeurons();
  
      /* ─ Euclidean distance ─ */
      function d2(a, b) {
        const dx = a.x - b.x, dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
      }
  
      /* ─ Spawn a travelling signal ─ */
      let sigTimer = 0;
      function spawnSignal(from, to, depth) {
        depth = depth || 0;
        if (depth > 3) return;
        signals.push({
          from, to,
          t: 0,
          speed: rand(0.005, 0.013),
          col:   pick(PALETTE),
          size:  rand(2.2, 4),
          tail:  rand(0.1, 0.2),
          depth,
          done:  false,
        });
        from.active    = true;
        from.activeTTL = rand(600, 900);
      }
  
      function maybeSpawnSignal(dt) {
        sigTimer += dt;
        const interval = isLowEnd ? 900 : 320;
        if (sigTimer < interval) return;
        sigTimer = 0;
  
        const from = pick(neurons);
        const neighbors = neurons.filter(n => n !== from && d2(from, n) < CONN_DIST);
        if (!neighbors.length) return;
        spawnSignal(from, pick(neighbors), 0);
      }
  
      /* On signal arrival, optionally chain-fire to another neighbor */
      function onSignalArrived(sig) {
        sig.to.active    = true;
        sig.to.activeTTL = rand(400, 700);
        if (!isLowEnd && sig.depth < 3 && Math.random() < 0.45) {
          const cands = neurons.filter(n => n !== sig.from && n !== sig.to && d2(sig.to, n) < CONN_DIST);
          if (cands.length) {
            const delay = rand(80, 220);
            setTimeout(() => spawnSignal(sig.to, pick(cands), sig.depth + 1), delay);
          }
        }
      }
  
      /* ─ Layer 1: Hex-circuit grid ─ */
      function drawGrid() {
        if (isLowEnd) return;
        const S   = 64;           // hex size
        const H3  = S * 0.866;   // √3/2
        const cols = Math.ceil(W / S) + 3;
        const rows = Math.ceil(H / H3) + 3;
  
        ctx.save();
        ctx.strokeStyle = 'rgba(79,172,254,0.045)';
        ctx.lineWidth   = 0.6;
  
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const cx = col * S + (row % 2 ? S * 0.5 : 0) - S;
            const cy = row * H3 - H3;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const a  = (Math.PI / 3) * i - Math.PI / 6;
              const px = cx + S * 0.46 * Math.cos(a);
              const py = cy + S * 0.46 * Math.sin(a);
              if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
        ctx.restore();
      }
  
      /* ─ Layer 2: Synaptic connections ─ */
      function drawConnections() {
        for (let i = 0; i < neurons.length; i++) {
          const a = neurons[i];
          for (let j = i + 1; j < neurons.length; j++) {
            const b    = neurons[j];
            const dist = d2(a, b);
            if (dist > CONN_DIST) continue;
  
            const fade   = 1 - dist / CONN_DIST;
            const isHot  = a.active || b.active || a.hovered || b.hovered;
            const alpha  = isHot ? fade * 0.52 : fade * 0.13;
            const width  = isHot ? 0.9 : 0.35;
            const col    = isHot ? `rgba(0,242,254,${alpha})` : `rgba(79,172,254,${alpha})`;
  
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = col;
            ctx.lineWidth   = width;
            ctx.stroke();
          }
        }
      }
  
      /* ─ Layer 3: Travelling signal orbs ─ */
      function drawSignals() {
        signals.forEach(s => {
          if (s.done) return;
          const x  = s.from.x + (s.to.x - s.from.x) * s.t;
          const y  = s.from.y + (s.to.y - s.from.y) * s.t;
          const tx = s.from.x + (s.to.x - s.from.x) * Math.max(0, s.t - s.tail);
          const ty = s.from.y + (s.to.y - s.from.y) * Math.max(0, s.t - s.tail);
  
          /* Tail gradient */
          const tg = ctx.createLinearGradient(tx, ty, x, y);
          tg.addColorStop(0, rgba(s.col, 0));
          tg.addColorStop(1, rgba(s.col, 0.9));
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(x, y);
          ctx.strokeStyle = tg;
          ctx.lineWidth   = s.size * 0.65;
          ctx.stroke();
  
          /* Bright orb head */
          const og = ctx.createRadialGradient(x, y, 0, x, y, s.size * 3.5);
          og.addColorStop(0,   'rgba(255,255,255,0.98)');
          og.addColorStop(0.25, rgba(s.col, 0.85));
          og.addColorStop(1,    rgba(s.col, 0));
          ctx.beginPath();
          ctx.arc(x, y, s.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = og;
          ctx.fill();
        });
      }
  
      /* ─ Layer 4 + 5: Neuron glow + core ─ */
      function drawNeurons() {
        neurons.forEach(n => {
          n.pulse += n.pulseSpd;
          const breathe = 0.65 + 0.35 * Math.sin(n.pulse);
          const isLit   = n.active || n.hovered;
          const glowA   = (isLit ? 0.55 : 0.18) * breathe;
          const coreR   = n.r * (isLit ? 1.55 : 1) * breathe;
          const glowRad = n.glowR * (isLit ? 2.2 : 1);
  
          /* Glow halo */
          const gg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowRad);
          gg.addColorStop(0, rgba(n.col, glowA));
          gg.addColorStop(1, rgba(n.col, 0));
          ctx.beginPath();
          ctx.arc(n.x, n.y, glowRad, 0, Math.PI * 2);
          ctx.fillStyle = gg;
          ctx.fill();
  
          /* Core */
          ctx.beginPath();
          ctx.arc(n.x, n.y, coreR, 0, Math.PI * 2);
          ctx.fillStyle = isLit ? '#00f2fe' : n.col.hex;
          ctx.fill();
  
          /* Outer ring */
          ctx.beginPath();
          ctx.arc(n.x, n.y, coreR + 2, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(n.col, isLit ? 0.7 : 0.28);
          ctx.lineWidth   = 0.8;
          ctx.stroke();
  
          /* Second outer ring (active only) */
          if (isLit) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, coreR + 5 + 4 * breathe, 0, Math.PI * 2);
            ctx.strokeStyle = rgba(n.col, 0.18 * breathe);
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        });
      }
  
      /* ─ Mouse proximity: light up nearby neurons ─ */
      function updateHover() {
        if (isTouch) return;
        neurons.forEach(n => {
          const mx = n.x - mouse.x, my = n.y - mouse.y;
          const dd = Math.sqrt(mx * mx + my * my);
          n.hovered = dd < 130;
  
          /* Gentle mouse repulsion */
          if (dd < 100 && dd > 0) {
            n.vx += (mx / dd) * 0.04;
            n.vy += (my / dd) * 0.04;
          }
        });
      }
  
      /* ─ Velocity damping & boundary wrap ─ */
      const MAX_V = 0.22;
      function updateNeurons(dt) {
        neurons.forEach(n => {
          /* Damp velocity */
          n.vx *= 0.985;
          n.vy *= 0.985;
          /* Clamp */
          n.vx = Math.max(-MAX_V, Math.min(MAX_V, n.vx));
          n.vy = Math.max(-MAX_V, Math.min(MAX_V, n.vy));
          /* Move */
          n.x += n.vx;
          n.y += n.vy;
          /* Wrap */
          if (n.x < -30)  n.x = W + 30;
          if (n.x > W+30) n.x = -30;
          if (n.y < -30)  n.y = H + 30;
          if (n.y > H+30) n.y = -30;
          /* Cool down */
          if (n.activeTTL > 0) { n.activeTTL -= dt; if (n.activeTTL <= 0) n.active = false; }
        });
      }
  
      /* ─ Main render loop ─ */
      function draw(t) {
        requestAnimationFrame(draw);
        if (t - lastFrame < FRAME_MS) return;
        const dt = t - prevT;
        prevT    = t;
        lastFrame = t;
  
        ctx.clearRect(0, 0, W, H);
  
        drawGrid();
        updateHover();
        drawConnections();
        drawSignals();
        drawNeurons();
        updateNeurons(dt);
  
        /* Update signals, fire arrivals */
        signals.forEach(s => {
          s.t += s.speed;
          if (!s.done && s.t >= 1) {
            s.done = true;
            onSignalArrived(s);
          }
        });
        signals = signals.filter(s => !s.done);
  
        maybeSpawnSignal(dt);
      }
  
      requestAnimationFrame(draw);
    }
  
    /* ── 3. CURSOR (desktop / pointer devices only) ────── */
    function initCursor() {
      if (isTouch) return;
      const co = document.getElementById('cursor-outer');
      const ci = document.getElementById('cursor-inner');
      if (!co || !ci) return;
  
      document.addEventListener('mousemove', e => {
        co.style.left = e.clientX + 'px';
        co.style.top  = e.clientY + 'px';
        ci.style.left = e.clientX + 'px';
        ci.style.top  = e.clientY + 'px';
      }, { passive: true });
  
      const sel = 'a, button, .vector-js, .example, .project, .links a, .button, h3';
      document.querySelectorAll(sel).forEach(el => {
        el.addEventListener('mouseenter', () => { co.classList.add('hover'); ci.classList.add('hover'); });
        el.addEventListener('mouseleave', () => { co.classList.remove('hover'); ci.classList.remove('hover'); });
      });
    }
  
    /* ── 4. SCROLL PROGRESS ─────────────────────────────── */
    function initScrollProgress() {
      const bar = document.getElementById('scroll-progress');
      if (!bar) return;
      window.addEventListener('scroll', () => {
        const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        bar.style.width = (pct * 100) + '%';
      }, { passive: true });
    }
  
    /* ── 5. NAVBAR ──────────────────────────────────────── */
    function initNavbar() {
      const nav   = document.querySelector('.navbar');
      const links = document.querySelectorAll('.nav-links a');
      const page  = location.pathname.split('/').pop() || 'index.html';
  
      links.forEach(a => {
        const href = a.getAttribute('href');
        if (href === page || (page === '' && href === 'index.html'))
          a.classList.add('active');
      });
  
      window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 10);
      }, { passive: true });
  
      const btn      = document.querySelector('.mobile-menu-btn');
      const navLinks = document.querySelector('.nav-links');
      if (btn && navLinks)
        btn.addEventListener('click', () => navLinks.classList.toggle('open'));
    }
  
    /* ── 6. SCROLL REVEAL (IntersectionObserver) ─────────── */
    function initReveal() {
      const items = document.querySelectorAll('.example,.project,.section-title,.faq-box,.container > p');
      items.forEach(el => el.classList.add('reveal'));
  
      const obs = new IntersectionObserver(entries => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), i * 55);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.07 });
  
      items.forEach(el => obs.observe(el));
    }
  
    /* ── 7. CARD TILT — desktop only, CSS transition reset ── */
    function initTilt() {
      if (isTouch || isLowEnd) return;
      document.querySelectorAll('.example,.project').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width  - 0.5;
          const y = (e.clientY - r.top)  / r.height - 0.5;
          card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg) translateY(-2px)`;
        }, { passive: true });
        card.addEventListener('mouseleave', () => {
          card.style.transition = 'transform 0.45s ease, border-color 0.3s, box-shadow 0.3s';
          card.style.transform  = '';
          setTimeout(() => { card.style.transition = ''; }, 450);
        });
      });
    }
  
    /* ── 8. TYPEWRITER ──────────────────────────────────── */
    function initTypewriter() {
      const header = document.querySelector('header');
      if (!header) return;
  
      const wrap = document.createElement('div');
      wrap.className = 'typewriter-wrap';
      const cursor = document.createElement('span');
      cursor.className = 'tw-cursor';
  
      const phrases = [
        'Where Technology Meets Creativity',
        'Founder. Builder. Creator.',
        'AI · Cybersecurity · UI/UX · Content',
        'Crafting the Future, One Prompt at a Time',
      ];
      let pi = 0, ci = 0, deleting = false;
  
      function tick() {
        const ph = phrases[pi];
        wrap.textContent = ph.substring(0, ci);
        wrap.appendChild(cursor);
        if (!deleting && ci < ph.length) {
          ci++; setTimeout(tick, 55 + Math.random() * 35);
        } else if (!deleting) {
          deleting = true; setTimeout(tick, 1800);
        } else if (ci > 0) {
          ci--; setTimeout(tick, 28);
        } else {
          deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 380);
        }
      }
  
      const h1 = header.querySelector('h1');
      if (h1) header.insertBefore(wrap, h1);
      setTimeout(tick, 700);
    }
  
    /* ── 9. MARQUEE ─────────────────────────────────────── */
    function injectMarquee() {
      const header = document.querySelector('header');
      if (!header || !header.nextElementSibling) return;
  
      const words = [
        ['K',true],['nowl'],['edge',' '],
        ['E',true],['mpathy',' '],
        ['V',true],['ision',' '],
        ['I',true],['nnovation',' '],
        [' ✦ ',true],
        ['AI',''],['·',''],['Cybersecurity',''],['·',''],
        ['UI/UX',''],['·',''],['Web Design',''],['·',''],
        ['Micro Influencer',''],[' ✦ ',true],
      ];
  
      const band  = document.createElement('div');  band.className  = 'marquee-band';
      const track = document.createElement('div');  track.className = 'marquee-track';
      const html  = words.map(([t, hi]) => `<span${hi ? ' class="hi"' : ''}>${t}</span>`).join('');
      track.innerHTML = html + html;
      band.appendChild(track);
      header.insertAdjacentElement('afterend', band);
    }
  
    /* ── 10. SECTION NUMBERS ────────────────────────────── */
    function addSectionNumbers() {
      document.querySelectorAll('.section-title').forEach((t, i) => {
        const num = document.createElement('span');
        num.textContent = String(i + 1).padStart(2, '0');
        num.style.cssText = 'font-size:0.62rem;font-weight:800;letter-spacing:0.08em;'
          + 'color:rgba(126,184,247,0.32);vertical-align:super;margin-right:0.45rem;'
          + 'user-select:none;-webkit-text-fill-color:rgba(126,184,247,0.32);';
        t.insertBefore(num, t.firstChild);
      });
    }
  
    /* ── BOOT ────────────────────────────────────────────── */
    function boot() {
      injectLayers();
      initNeuralNet();
      initCursor();
      initScrollProgress();
      initNavbar();
      initReveal();
      initTilt();
      initTypewriter();
      injectMarquee();
      addSectionNumbers();
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  
  })();