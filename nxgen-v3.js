/* ============================================================
   NXGEN v3 — Behaviors
   - Preloader counter + curtains
   - Lenis smooth scroll (lerp 0.08)
   - Custom cursor with RAF lerp
   - Scroll progress
   - Reveals (IntersectionObserver, .rv)
   - Magnetic buttons
   - Text scramble (hero italic word cycler)
   - Hero badge phrase rotator
   - Services accordion
   - 3D card tilt on pricing
   - Nav scrolled state
   - Smooth anchor scroll
   - GSAP ScrollTrigger parallax on hero star (if GSAP loaded)
   - Contact form floating labels
   ============================================================ */
document.documentElement.classList.remove('no-js');

/* ---------- Preloader ---------- */
(function(){
  const pre = document.querySelector('.preload');
  if (!pre) return;

  // NXGEN_v3.html only: skip the curtain animation when the user
  // arrived from another page (document.referrer is non-empty) — e.g.
  // navigating back from a sub-page. Fresh opens (address bar /
  // bookmark / new tab) have an empty referrer and still play the
  // full preloader. Sub-pages keep their normal preloader behavior.
  const isHome = /(?:^|\/)NXGEN_v3\.html$/.test(location.pathname) ||
                 location.pathname === '/' ||
                 location.pathname.endsWith('/');
  if (isHome && document.referrer){
    pre.classList.add('done');
    document.body.classList.add('ready');
    pre.style.display = 'none';
    return;
  }

  const count = pre.querySelector('.preload-count > span');
  const bar = pre.querySelector('.preload-bar > div');
  const dur = 1500;
  const start = performance.now();
  function tick(now){
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = Math.floor(eased * 100);
    if (count) count.textContent = String(v).padStart(3, '0');
    if (bar) bar.style.width = (eased * 100) + '%';
    if (t < 1) requestAnimationFrame(tick);
    else {
      setTimeout(() => {
        pre.classList.add('done');
        document.body.classList.add('ready');
        setTimeout(() => { pre.style.display = 'none'; }, 1300);
      }, 200);
    }
  }
  requestAnimationFrame(tick);
})();

/* ---------- Lenis smooth scroll ---------- */
(function(){
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    smoothTouch: false,
  });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  // expose for anchor scrolling
  window.__lenis = lenis;
  // bridge to GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined'){
    lenis.on('scroll', ScrollTrigger.update);
  }
})();

/* ---------- Cursor ---------- */
(function(){
  if (matchMedia('(max-width: 760px)').matches) return;
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  let mx = innerWidth/2, my = innerHeight/2;
  let rx = mx, ry = my;
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%,-50%)`;
  });
  function loop(){
    rx += (mx - rx) * .18;
    ry += (my - ry) * .18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();
  document.querySelectorAll('a, button, .svc-head, .svc-card, .price-card, .faq-q, [data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hover'));
  });
})();

/* ---------- Scroll progress ---------- */
(function(){
  const bar = document.querySelector('.scrollbar > div');
  if (!bar) return;
  addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    const p = Math.max(0, Math.min(1, scrollY / h));
    bar.style.width = (p * 100) + '%';
  }, { passive: true });
})();

/* ---------- Nav scrolled ---------- */
(function(){
  const nav = document.querySelector('.nav');
  if (!nav) return;
  function check(){ nav.classList.toggle('scrolled', scrollY > 40); }
  check();
  addEventListener('scroll', check, { passive: true });
})();

/* ---------- Reveals ---------- */
(function(){
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  ['.process', '.cta'].forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    const o = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting){ el.classList.add('in'); o.unobserve(el); }});
    }, { threshold: .25 });
    o.observe(el);
  });
})();

/* ---------- Magnetic buttons ---------- */
(function(){
  if (matchMedia('(max-width: 760px)').matches) return;
  document.querySelectorAll('.btn, .nav-cta, .pc-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * .15}px, ${y * .25}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

/* ---------- Hero badge phrase rotator ---------- */
(function(){
  const rot = document.querySelector('.b-rotate');
  if (!rot) return;
  const phrases = JSON.parse(rot.dataset.phrases || '[]');
  if (!phrases.length) return;
  const span = rot.querySelector('span');
  let i = 0;
  setInterval(() => {
    span.style.transform = 'translateY(-100%)';
    setTimeout(() => {
      i = (i + 1) % phrases.length;
      span.textContent = phrases[i];
      span.style.transition = 'none';
      span.style.transform = 'translateY(100%)';
      requestAnimationFrame(() => {
        span.style.transition = '';
        span.style.transform = 'translateY(0)';
      });
    }, 550);
  }, 2400);
})();

/* ---------- Text scramble on hero italic word ---------- */
(function(){
  const els = document.querySelectorAll('.scramble');
  const chars = '!<>-_\\/[]{}—=+*^?#NX0123456789';
  els.forEach(el => {
    const list = (el.dataset.words || el.textContent).split('|').map(s => s.trim());
    let idx = 0;
    function set(target){
      const dur = 700;
      const start = performance.now();
      function frame(now){
        const t = Math.min(1, (now - start) / dur);
        let out = '';
        for (let i = 0; i < target.length; i++){
          if (t * target.length > i) out += target[i];
          else out += chars[Math.floor(Math.random() * chars.length)];
        }
        el.textContent = out;
        if (t < 1) requestAnimationFrame(frame);
        else el.textContent = target;
      }
      requestAnimationFrame(frame);
    }
    // initial set after preloader
    setTimeout(() => set(list[0]), 1400);
    setInterval(() => {
      idx = (idx + 1) % list.length;
      set(list[idx]);
    }, 2800);
  });
})();

/* ---------- Services accordion ---------- */
(function(){
  document.querySelectorAll('.svc-row').forEach((row, i) => {
    const head = row.querySelector('.svc-head');
    if (!head) return;
    head.addEventListener('click', () => {
      const wasOpen = row.classList.contains('open');
      // single-open accordion
      row.parentElement.querySelectorAll('.svc-row.open').forEach(r => r.classList.remove('open'));
      if (!wasOpen) row.classList.add('open');
    });
  });
})();

/* ---------- 3D tilt on pricing ---------- */
(function(){
  if (matchMedia('(max-width: 760px)').matches) return;
  document.querySelectorAll('.price-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ---------- Smooth anchor scroll ---------- */
(function(){
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + scrollY - 20;
      if (window.__lenis){
        window.__lenis.scrollTo(y, { duration: 1.2 });
      } else {
        scrollTo({ top: y, behavior: 'smooth' });
      }
      history.replaceState(null, '', id);
    });
  });
})();

/* ---------- GSAP ScrollTrigger parallax on hero star ---------- */
(function(){
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  const star = document.querySelector('.hero-star');
  if (star){
    gsap.to(star, {
      scale: 1.6,
      rotation: 25,
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      }
    });
  }
})();

/* ---------- Float pill (appears past hero) ---------- */
(function(){
  const p = document.getElementById('fpill');
  if (!p) return;
  function check(){ p.classList.toggle('show', scrollY > innerHeight * 0.85); }
  check();
  addEventListener('scroll', check, { passive: true });
})();

/* ---------- Contact form floating labels ---------- */
(function(){
  document.querySelectorAll('.form .field').forEach(field => {
    const input = field.querySelector('input, textarea, select');
    const label = field.querySelector('label');
    if (!input || !label) return;
    function check(){
      field.classList.toggle('filled', !!input.value);
    }
    input.addEventListener('input', check);
    input.addEventListener('blur', check);
    check();
  });
  // Demo submit
  const form = document.querySelector('.form');
  if (form){
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (btn){
        const orig = btn.querySelector('.txt')?.textContent;
        if (btn.querySelector('.txt')) btn.querySelector('.txt').textContent = 'Sent ✓';
        btn.style.background = 'linear-gradient(135deg, #1D04BD 0%, #8B1E3C 100%)';
        setTimeout(() => {
          if (btn.querySelector('.txt') && orig) btn.querySelector('.txt').textContent = orig;
          btn.style.background = '';
          form.reset();
          form.querySelectorAll('.field').forEach(f => f.classList.remove('filled'));
        }, 2200);
      }
    });
  }
})();

/* ============================================================
   CURSOR — reveal on first mouse move
   ============================================================ */
(function(){
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  document.addEventListener('mousemove', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  }, { once: true });
})();

/* ============================================================
   3D SERVICE CARD TILT (mouse parallax)
   ============================================================ */
(function(){
  if (matchMedia('(max-width:860px)').matches) return;
  document.querySelectorAll('.svc-item, .cap, .price-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ============================================================
   HERO 3D CANVAS — floating geometric shapes (Three.js)
   ============================================================ */
(function(){
  const canvas = document.getElementById('hero-3d');
  if (!canvas) return;

  // Dynamically load Three.js
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload = initThree;
  document.head.appendChild(s);

  function initThree(){
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    camera.position.z = 6;

    // Materials
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x8B1E3C, wireframe: true, transparent: true, opacity: 0.35 });
    const indMat  = new THREE.MeshBasicMaterial({ color: 0x1D04BD, wireframe: true, transparent: true, opacity: 0.25 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xfafaf8, wireframe: true, transparent: true, opacity: 0.12 });

    // Create shapes
    const shapes = [
      { geo: new THREE.IcosahedronGeometry(0.9, 1), mat: wireMat,  pos: [-3, 1.2, -2],  speed: [0.003, 0.005, 0.002] },
      { geo: new THREE.OctahedronGeometry(0.7, 0),  mat: indMat,   pos: [3.2, -1, -1],  speed: [0.004, -0.003, 0.005] },
      { geo: new THREE.TetrahedronGeometry(0.6, 0), mat: wireMat,  pos: [0.5, 2.2, -3], speed: [-0.005, 0.004, 0.003] },
      { geo: new THREE.IcosahedronGeometry(0.5, 0), mat: whiteMat, pos: [-2.5, -1.8, -1], speed: [0.006, -0.004, 0.002] },
      { geo: new THREE.OctahedronGeometry(1.1, 1),  mat: indMat,   pos: [4, 2, -4],     speed: [-0.002, 0.006, -0.003] },
      { geo: new THREE.TetrahedronGeometry(0.4, 0), mat: whiteMat, pos: [-1, -2.5, -2], speed: [0.005, 0.003, -0.004] },
    ];

    const meshes = shapes.map(({ geo, mat, pos, speed }) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(...pos);
      m.userData.speed = speed;
      scene.add(m);
      return m;
    });

    // Mouse parallax
    let mx = 0, my = 0;
    window.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.8;
      my = (e.clientY / window.innerHeight - 0.5) * 0.5;
    });

    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    });

    // Animate
    (function animate(){
      requestAnimationFrame(animate);
      meshes.forEach(m => {
        m.rotation.x += m.userData.speed[0];
        m.rotation.y += m.userData.speed[1];
        m.rotation.z += m.userData.speed[2];
      });
      camera.position.x += (mx - camera.position.x) * 0.04;
      camera.position.y += (-my - camera.position.y) * 0.04;
      renderer.render(scene, camera);
    })();
  }
})();

