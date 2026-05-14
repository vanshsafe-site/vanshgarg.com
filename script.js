/* ======================================================
   VANSH GARG PORTFOLIO — script.js
   Celestial Engine: Stars · Aurora · Cursor · Tilt ·
   Particles · Typewriter · Orbital Dots · Neural Net
   ====================================================== */

   (function () {
    'use strict';
  
    /* ── 1. INJECT BACKGROUND LAYERS ──────────────────── */
    function injectLayers() {
      // Scroll progress bar
      const prog = document.createElement('div');
      prog.id = 'scroll-progress';
      document.body.prepend(prog);
  
      // Star canvas
      const starCvs = document.createElement('canvas');
      starCvs.id = 'star-canvas';
      document.body.prepend(starCvs);
  
      // Particle canvas
      const pCvs = document.createElement('canvas');
      pCvs.id = 'particle-canvas';
      document.body.appendChild(pCvs);
  
      // Aurora
      const aurora = document.createElement('div');
      aurora.className = 'aurora-layer';
      aurora.innerHTML = '<div class="aurora-blob"></div><div class="aurora-blob"></div><div class="aurora-blob"></div><div class="aurora-blob"></div>';
      document.body.appendChild(aurora);
  
      // Noise
      const noise = document.createElement('div');
      noise.className = 'noise-overlay';
      document.body.appendChild(noise);
  
      // Custom cursor
      const co = document.createElement('div'); co.id = 'cursor-outer';
      const ci = document.createElement('div'); ci.id = 'cursor-inner';
      document.body.appendChild(co);
      document.body.appendChild(ci);
    }
  
    /* ── 2. STAR FIELD ────────────────────────────────── */
    function initStars() {
      const cvs = document.getElementById('star-canvas');
      const ctx = cvs.getContext('2d');
      let W, H, stars = [], shoots = [];
  
      function resize() {
        W = cvs.width  = window.innerWidth;
        H = cvs.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', () => { resize(); buildStars(); });
  
      function rand(a, b) { return a + Math.random() * (b - a); }
  
      function buildStars() {
        stars = Array.from({ length: 320 }, () => ({
          x: rand(0, W), y: rand(0, H),
          r: rand(0.3, 1.8),
          bright: Math.random() > 0.88,
          base: rand(0.2, 1),
          speed: rand(0.0006, 0.002),
          phase: rand(0, Math.PI * 2),
        }));
      }
      buildStars();
  
      function spawnShoot() {
        const sx = rand(W * 0.1, W * 0.9);
        shoots.push({
          x: sx, y: rand(0, H * 0.4),
          len: rand(80, 200), angle: rand(20, 45) * (Math.PI / 180),
          life: 1, decay: rand(0.012, 0.022),
        });
        setTimeout(spawnShoot, rand(5000, 9000));
      }
      setTimeout(spawnShoot, rand(3000, 6000));
  
      function drawSparkle(cx, cy, r) {
        const arms = 4, len = r * 3;
        ctx.save();
        ctx.translate(cx, cy);
        for (let i = 0; i < arms; i++) {
          ctx.rotate(Math.PI / arms);
          ctx.beginPath();
          ctx.moveTo(0, -len); ctx.lineTo(0, len);
          ctx.strokeStyle = 'rgba(220,235,255,0.35)';
          ctx.lineWidth = 0.5; ctx.stroke();
        }
        ctx.restore();
      }
  
      let raf;
      function draw(t) {
        ctx.clearRect(0, 0, W, H);
  
        stars.forEach(s => {
          const alpha = s.base * (0.5 + 0.5 * Math.sin(t * s.speed * 1000 + s.phase));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210,228,255,${alpha})`;
          ctx.fill();
          if (s.bright && alpha > 0.7) drawSparkle(s.x, s.y, s.r);
        });
  
        shoots = shoots.filter(sh => sh.life > 0);
        shoots.forEach(sh => {
          const ex = sh.x + Math.cos(sh.angle) * sh.len;
          const ey = sh.y + Math.sin(sh.angle) * sh.len;
          const grad = ctx.createLinearGradient(sh.x, sh.y, ex, ey);
          grad.addColorStop(0, `rgba(200,225,255,${sh.life})`);
          grad.addColorStop(1, 'rgba(200,225,255,0)');
          ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(ex, ey);
          ctx.strokeStyle = grad; ctx.lineWidth = 1.2; ctx.stroke();
          sh.x += Math.cos(sh.angle) * 3;
          sh.y += Math.sin(sh.angle) * 3;
          sh.life -= sh.decay;
        });
  
        raf = requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    }
  
    /* ── 3. AURORA PARALLAX ────────────────────────────── */
    function initAuroraParallax() {
      const blobs = document.querySelectorAll('.aurora-blob');
      const factors = [0.012, -0.018, 0.009, -0.014];
      window.addEventListener('mousemove', e => {
        const cx = e.clientX - window.innerWidth / 2;
        const cy = e.clientY - window.innerHeight / 2;
        blobs.forEach((b, i) => {
          const f = factors[i];
          b.style.transform = `translate(${cx * f}px, ${cy * f}px) scale(var(--sc,1))`;
        });
      });
    }
  
    /* ── 4. CUSTOM CURSOR ─────────────────────────────── */
    function initCursor() {
      const co = document.getElementById('cursor-outer');
      const ci = document.getElementById('cursor-inner');
      let ox = -100, oy = -100, tx = -100, ty = -100;
  
      document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  
      function loop() {
        ox += (tx - ox) * 0.12;
        oy += (ty - oy) * 0.12;
        co.style.left = ox + 'px'; co.style.top = oy + 'px';
        ci.style.left = tx + 'px'; ci.style.top = ty + 'px';
        requestAnimationFrame(loop);
      }
      loop();
  
      const hov = 'a,button,.vector-js,.example,.project,.links a,.button';
      document.querySelectorAll(hov).forEach(el => {
        el.addEventListener('mouseenter', () => { co.classList.add('hover'); ci.classList.add('hover'); });
        el.addEventListener('mouseleave', () => { co.classList.remove('hover'); ci.classList.remove('hover'); });
      });
    }
  
    /* ── 5. SCROLL PROGRESS ───────────────────────────── */
    function initScrollProgress() {
      const bar = document.getElementById('scroll-progress');
      window.addEventListener('scroll', () => {
        const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        bar.style.width = (pct * 100) + '%';
      }, { passive: true });
    }
  
    /* ── 6. NAVBAR SCROLL STATE + ACTIVE LINK ─────────── */
    function initNavbar() {
      const nav = document.querySelector('.navbar');
      const links = document.querySelectorAll('.nav-links a');
      const page = location.pathname.split('/').pop() || 'index.html';
  
      links.forEach(a => {
        const href = a.getAttribute('href');
        if (href === page || (page === '' && href === 'index.html')) {
          a.classList.add('active');
        }
      });
  
      window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 10);
      }, { passive: true });
  
      // Mobile menu
      const btn = document.querySelector('.mobile-menu-btn');
      const navLinks = document.querySelector('.nav-links');
      if (btn && navLinks) {
        btn.addEventListener('click', () => navLinks.classList.toggle('open'));
      }
    }
  
    /* ── 7. STAGGERED SCROLL REVEAL ───────────────────── */
    function initReveal() {
      const items = document.querySelectorAll('.example,.project,.section-title,.faq-box,.container > p');
      items.forEach(el => el.classList.add('reveal'));
  
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), i * 60);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.08 });
  
      items.forEach(el => obs.observe(el));
    }
  
    /* ── 8. 3-D CARD TILT ─────────────────────────────── */
    function initTilt() {
      const cards = document.querySelectorAll('.example,.project');
      cards.forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width  - 0.5;
          const y = (e.clientY - r.top)  / r.height - 0.5;
          card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) scale3d(1.015,1.015,1.015)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
          card.style.transition = 'transform 0.5s ease, border-color 0.3s, box-shadow 0.3s';
          setTimeout(() => card.style.transition = '', 500);
        });
      });
    }
  
    /* ── 9. PARTICLE BURST ────────────────────────────── */
    function initParticles() {
      const cvs = document.getElementById('particle-canvas');
      const ctx = cvs.getContext('2d');
      let W, H;
      function resize() { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }
      resize();
      window.addEventListener('resize', resize);
  
      let particles = [];
      const colors = ['#7eb8f7','#b28aff','#52e8c8','#f7c87e','#ffffff'];
  
      function burst(x, y, n = 18) {
        for (let i = 0; i < n; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 4;
          particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            r: 2 + Math.random() * 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
            decay: 0.018 + Math.random() * 0.022,
            gravity: 0.08,
          });
        }
      }
  
      document.querySelectorAll('.results a, a.button, .links a').forEach(el => {
        el.addEventListener('click', e => burst(e.clientX, e.clientY, 22));
        el.addEventListener('mouseenter', e => {
          const r = el.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + r.height / 2, 10);
        });
      });
  
      function drawParticles() {
        ctx.clearRect(0, 0, W, H);
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fill();
          p.x += p.vx; p.y += p.vy;
          p.vy += p.gravity; p.vx *= 0.97;
          p.life -= p.decay;
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(drawParticles);
      }
      requestAnimationFrame(drawParticles);
    }
  
    /* ── 10. TYPEWRITER HERO ──────────────────────────── */
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
      let pi = 0, ci2 = 0, deleting = false;
  
      function tick() {
        const ph = phrases[pi];
        wrap.textContent = ph.substring(0, ci2);
        wrap.appendChild(cursor);
  
        if (!deleting && ci2 < ph.length) {
          ci2++; setTimeout(tick, 55 + Math.random() * 35);
        } else if (!deleting && ci2 === ph.length) {
          deleting = true; setTimeout(tick, 1800);
        } else if (deleting && ci2 > 0) {
          ci2--; setTimeout(tick, 28);
        } else {
          deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 400);
        }
      }
  
      // Insert before h1
      const h1 = header.querySelector('h1');
      if (h1) header.insertBefore(wrap, h1);
      setTimeout(tick, 800);
    }
  
    /* ── 11. ORBITAL DOTS ─────────────────────────────── */
    function initOrbitalDots() {
      const pic = document.querySelector('.profile-pic');
      if (!pic) return;
  
      const sphere = document.createElement('div');
      sphere.className = 'hero-sphere';
      pic.parentNode.insertBefore(sphere, pic);
      sphere.appendChild(pic);
  
      const orbs = [
        { color: '#7eb8f7', size: 10, radius: 74, speed: 0.0014, offset: 0       },
        { color: '#b28aff', size:  8, radius: 90, speed: -0.0009, offset: 2.1    },
        { color: '#52e8c8', size:  7, radius: 62, speed: 0.0019,  offset: 4.4    },
      ];
  
      const dots = orbs.map(o => {
        const d = document.createElement('div');
        d.className = 'orbital-dot';
        d.style.cssText = `width:${o.size}px;height:${o.size}px;background:${o.color};box-shadow:0 0 10px ${o.color};`;
        sphere.appendChild(d);
        return { el: d, ...o, angle: o.offset };
      });
  
      function animOrbs(t) {
        dots.forEach(d => {
          d.angle += d.speed * 16;
          const x = Math.cos(d.angle) * d.radius;
          const y = Math.sin(d.angle) * d.radius * 0.4;
          d.el.style.transform = `translate(${x - d.size/2}px, ${y - d.size/2}px)`;
          d.el.style.zIndex = y > 0 ? 3 : 1;
          d.el.style.opacity = 0.7 + 0.3 * ((y + d.radius * 0.4) / (d.radius * 0.8));
        });
        requestAnimationFrame(animOrbs);
      }
      requestAnimationFrame(animOrbs);
    }
  
    /* ── 12. NEURAL NETWORK SVG ───────────────────────── */
    function injectNeuralNet() {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'neural-panel';
      svg.setAttribute('viewBox', '0 0 160 360');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  
      const nodes = [
        [80,30],[30,100],[130,100],
        [20,190],[80,190],[140,190],
        [40,280],[120,280],[80,340],
      ];
      const edges = [
        [0,1],[0,2],[1,3],[1,4],[2,4],[2,5],
        [3,6],[4,6],[4,7],[5,7],[6,8],[7,8],
      ];
  
      edges.forEach(([a, b], i) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1', nodes[a][0]); line.setAttribute('y1', nodes[a][1]);
        line.setAttribute('x2', nodes[b][0]); line.setAttribute('y2', nodes[b][1]);
        line.setAttribute('stroke', '#7eb8f7'); line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-opacity', '0.4');
  
        const len = Math.hypot(nodes[b][0]-nodes[a][0], nodes[b][1]-nodes[a][1]);
        const pulse = document.createElementNS('http://www.w3.org/2000/svg','circle');
        pulse.setAttribute('r', '3');
        const colors = ['#7eb8f7','#b28aff','#52e8c8','#f7c87e'];
        pulse.setAttribute('fill', colors[i % colors.length]);
  
        const anim = document.createElementNS('http://www.w3.org/2000/svg','animateMotion');
        anim.setAttribute('dur', (1.2 + i * 0.25) + 's');
        anim.setAttribute('repeatCount', 'indefinite');
        anim.setAttribute('begin', (i * 0.18) + 's');
        const mp = document.createElementNS('http://www.w3.org/2000/svg','mpath');
        // Use path instead
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg','path');
        const d = `M${nodes[a][0]},${nodes[a][1]} L${nodes[b][0]},${nodes[b][1]}`;
        pathEl.setAttribute('d', d);
        pathEl.setAttribute('id', `np${i}`);
        svg.appendChild(pathEl);
        mp.setAttributeNS('http://www.w3.org/1999/xlink','href',`#np${i}`);
        anim.appendChild(mp);
        pulse.appendChild(anim);
  
        svg.appendChild(line);
        svg.appendChild(pulse);
      });
  
      nodes.forEach(([x, y]) => {
        const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
        c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', '5');
        c.setAttribute('fill', '#0b0d1a'); c.setAttribute('stroke', '#7eb8f7');
        c.setAttribute('stroke-width', '1.5'); c.setAttribute('stroke-opacity', '0.7');
        svg.appendChild(c);
      });
  
      document.body.appendChild(svg);
    }
  
    /* ── 13. MARQUEE BAND ─────────────────────────────── */
    function injectMarquee() {

        const header = document.querySelector('header');
        if (!header || !header.nextElementSibling) return;
      
        const words = [
          ['Knowledge', true],
          ['Empathy', true],
          ['Vision', true],
          ['Innovation', true],
          ['Nurturing', true],
          ['✦', true],
          ['AI'],
          ['·'],
          ['Cybersecurity'],
          ['·'],
          ['UI/UX'],
          ['·'],
          ['Web Design'],
          ['·'],
          ['Micro Influencer'],
          ['✦', true],
        ];
      
        const band = document.createElement('div');
        band.className = 'marquee-band';
      
        const track = document.createElement('div');
        track.className = 'marquee-track';
      
        const content = words.map(([text, hi]) =>
          `<span${hi ? ' class="hi"' : ''}>${text}</span>`
        ).join('');
      
        track.innerHTML = content + content;
      
        band.appendChild(track);
      
        header.insertAdjacentElement('afterend', band);
      }
  
    /* ── 14. BOOT SEQUENCE ────────────────────────────── */
    function boot() {
      injectLayers();
      injectNeuralNet();
      injectMarquee();
  
      initStars();
      initAuroraParallax();
      initCursor();
      initScrollProgress();
      initNavbar();
      initTypewriter();
      initOrbitalDots();
      initReveal();
      initTilt();
      initParticles();
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  
  })();
  
function addFeatureSpacing() {

  const featureLists = document.querySelectorAll('.features li');

  featureLists.forEach((item, index) => {

    item.style.marginBottom = '14px';

    /* removes extra gap from last item */
    if(index === featureLists.length - 1){
      item.style.marginBottom = '0px';
    }

  });

}

/* Run after page loads */
window.addEventListener('DOMContentLoaded', addFeatureSpacing);

/* ======================================================
   VISIBILITY PATCH — append to script.js
   Refreshes cursor hover targets after DOM is ready,
   applies accessible contrast checks on muted text,
   and adds a subtle colour-pop on card h3 headings.
   ====================================================== */

   (function patchVisibility() {
    'use strict';
  
    /* ── RE-REGISTER CURSOR HOVER TARGETS ──────────────── */
    /* The main script runs before some dynamic content.    */
    /* This ensures every card heading and button is wired. */
    function refreshCursorTargets() {
      const co = document.getElementById('cursor-outer');
      const ci = document.getElementById('cursor-inner');
      if (!co || !ci) return;
  
      const sel = 'a, button, .vector-js, .example, .project, '
                + '.links a, .button, h3, .faq-box, .section-title';
  
      document.querySelectorAll(sel).forEach(el => {
        /* avoid double-binding */
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = '1';
        el.addEventListener('mouseenter', () => {
          co.classList.add('hover');
          ci.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
          co.classList.remove('hover');
          ci.classList.remove('hover');
        });
      });
    }
  
    /* ── ACCENT GLOW ON CARD h3 HOVER ──────────────────── */
    /* Adds a soft left-border colour pop when hovering     */
    /* a card, making the heading feel tactile.             */
    function initCardHeadingGlow() {
      document.querySelectorAll('.example, .project').forEach(card => {
        const h3 = card.querySelector('h3');
        if (!h3) return;
  
        /* Store original so we can restore */
        const origColor = getComputedStyle(h3).color;
  
        card.addEventListener('mouseenter', () => {
          h3.style.transition = 'color 0.25s ease, text-shadow 0.25s ease';
          h3.style.color = '#7eb8f7';          /* --primary */
          h3.style.textShadow = '0 0 18px rgba(126,184,247,0.35)';
        });
        card.addEventListener('mouseleave', () => {
          h3.style.color = '';
          h3.style.textShadow = '';
        });
      });
    }
  
    /* ── SECTION TITLE ENTRANCE COUNTER ────────────────── */
    /* Subtle number counter that counts up next to each    */
    /* section title so pages feel more structured.         */
    function addSectionNumbers() {
      const titles = document.querySelectorAll('.section-title');
      titles.forEach((t, i) => {
        const num = document.createElement('span');
        num.textContent = String(i + 1).padStart(2, '0');
        num.style.cssText = [
          'font-family:Syne,sans-serif',
          'font-size:0.65rem',
          'font-weight:800',
          'letter-spacing:0.08em',
          'color:rgba(126,184,247,0.35)',
          'vertical-align:super',
          'margin-right:0.45rem',
          'user-select:none',
          '-webkit-text-fill-color:rgba(126,184,247,0.35)',
        ].join(';');
        t.insertBefore(num, t.firstChild);
      });
    }
  
    /* ── BOOT ───────────────────────────────────────────── */
    function patchBoot() {
      refreshCursorTargets();
      initCardHeadingGlow();
      addSectionNumbers();
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', patchBoot);
    } else {
      patchBoot();
    }
  
  })();