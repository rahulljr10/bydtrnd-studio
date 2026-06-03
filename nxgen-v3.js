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

/* ============================================================
   HERO 3D CANVAS — Marketing-themed 3D objects
   Rocket, Megaphone, Bar Chart, Star, Play Button, Ring
   ============================================================ */
(function(){
  const canvas = document.getElementById('hero-3d');
  if (!canvas) return;

  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload = initScene;
  document.head.appendChild(s);

  function initScene(){
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.z = 7;

    /* ── Materials ── */
    const mWine  = new THREE.MeshBasicMaterial({ color: 0x8B1E3C, wireframe: true, transparent: true, opacity: 0.50 });
    const mIndig = new THREE.MeshBasicMaterial({ color: 0x1D04BD, wireframe: true, transparent: true, opacity: 0.38 });
    const mLight = new THREE.MeshBasicMaterial({ color: 0xfafaf8, wireframe: true, transparent: true, opacity: 0.18 });
    /* Solid accent for faces */
    const mWineSolid  = new THREE.MeshBasicMaterial({ color: 0x8B1E3C, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
    const mIndigSolid = new THREE.MeshBasicMaterial({ color: 0x1D04BD, transparent: true, opacity: 0.06, side: THREE.DoubleSide });

    const objects = []; // { mesh/group, speed:[rx,ry,rz], floatAmp, floatSpeed, floatOffset }

    /* ── 1. ROCKET — brand launch ── */
    (function(){
      const g = new THREE.Group();
      // Body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.0, 8), mWine);
      const bodySolid = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.0, 8), mWineSolid);
      // Nose cone
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 8), mWine);
      const noseSolid = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 8), mWineSolid);
      nose.position.y = 0.77;
      noseSolid.position.y = 0.77;
      // Fins (3 flat triangles)
      [-1, 0, 1].forEach((_, i) => {
        const finGeo = new THREE.ConeGeometry(0.22, 0.4, 3);
        const fin = new THREE.Mesh(finGeo, mWine);
        fin.position.y = -0.55;
        fin.rotation.y = (i * Math.PI * 2) / 3;
        fin.rotation.z = Math.PI;
        fin.scale.set(0.6, 1, 0.2);
        g.add(fin);
      });
      g.add(body, bodySolid, nose, noseSolid);
      g.position.set(-3.5, 1.5, -1.5);
      g.rotation.set(0.3, 0.2, 0.25);
      scene.add(g);
      objects.push({ grp: g, speed: [0.004, 0.006, 0.002], floatAmp: 0.18, floatSpeed: 0.8, floatOffset: 0 });
    })();

    /* ── 2. MEGAPHONE — amplify brand voice ── */
    (function(){
      const g = new THREE.Group();
      // Horn (frustum open toward audience)
      const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.18, 0.9, 10, 1, true), mIndig);
      horn.rotation.z = Math.PI / 2;
      const hornSolid = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.18, 0.9, 10, 1, true), mIndigSolid);
      hornSolid.rotation.z = Math.PI / 2;
      // Handle/body
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), mIndig);
      handle.rotation.z = Math.PI / 2;
      handle.position.x = 0.7;
      // Bell rim
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.04, 8, 24), mWine);
      rim.rotation.y = Math.PI / 2;
      rim.position.x = -0.45;
      g.add(horn, hornSolid, handle, rim);
      g.position.set(3.0, -1.2, -2.0);
      g.rotation.set(-0.2, -0.4, 0.15);
      scene.add(g);
      objects.push({ grp: g, speed: [-0.003, 0.005, -0.004], floatAmp: 0.22, floatSpeed: 0.65, floatOffset: 1.2 });
    })();

    /* ── 3. TRENDING BAR CHART — growth / going viral ── */
    (function(){
      const g = new THREE.Group();
      const heights = [0.4, 0.65, 0.55, 0.85, 1.1]; // ascending = growth
      const cols = [mLight, mIndig, mLight, mWine, mWine];
      const colsSolid = [mIndigSolid, mIndigSolid, mIndigSolid, mWineSolid, mWineSolid];
      heights.forEach((h, i) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.18, h, 0.18), cols[i]);
        const barSolid = new THREE.Mesh(new THREE.BoxGeometry(0.18, h, 0.18), colsSolid[i]);
        const x = (i - 2) * 0.28;
        bar.position.set(x, h / 2 - 0.55, 0);
        barSolid.position.set(x, h / 2 - 0.55, 0);
        g.add(bar, barSolid);
      });
      g.position.set(0.5, 2.2, -3.5);
      g.rotation.set(0.2, 0.5, -0.1);
      scene.add(g);
      objects.push({ grp: g, speed: [0.002, -0.004, 0.003], floatAmp: 0.14, floatSpeed: 0.9, floatOffset: 2.3 });
    })();

    /* ── 4. VIRAL STAR — trending / going beyond ── */
    (function(){
      const shape = new THREE.Shape();
      const outer = 0.52, inner = 0.22, pts = 5;
      for (let i = 0; i < pts * 2; i++){
        const r = i % 2 === 0 ? outer : inner;
        const a = (i * Math.PI) / pts - Math.PI / 2;
        if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
      const star = new THREE.Mesh(geo, mWine);
      const starSolid = new THREE.Mesh(geo, mWineSolid);
      const g = new THREE.Group();
      g.add(star, starSolid);
      g.position.set(-2.8, -1.6, -1.0);
      g.rotation.set(0.3, 0.6, 0.1);
      scene.add(g);
      objects.push({ grp: g, speed: [-0.005, 0.007, -0.003], floatAmp: 0.20, floatSpeed: 1.1, floatOffset: 0.8 });
    })();

    /* ── 5. PLAY BUTTON — video / content creation ── */
    (function(){
      const shape = new THREE.Shape();
      shape.moveTo(-0.35, -0.42);
      shape.lineTo(0.52, 0);
      shape.lineTo(-0.35, 0.42);
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 });
      const play = new THREE.Mesh(geo, mIndig);
      const playSolid = new THREE.Mesh(geo, mIndigSolid);
      const g = new THREE.Group();
      g.add(play, playSolid);
      // Circle outline around play button (like a video player)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.05, 10, 32), mIndig);
      ring.position.z = 0.1;
      g.add(ring);
      g.position.set(3.5, 1.8, -3.0);
      g.rotation.set(-0.3, -0.5, 0.2);
      scene.add(g);
      objects.push({ grp: g, speed: [0.003, -0.005, 0.004], floatAmp: 0.16, floatSpeed: 0.75, floatOffset: 1.8 });
    })();

    /* ── 6. NOTIFICATION RING — engagement / reach ── */
    (function(){
      const g = new THREE.Group();
      // Outer ring
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 10, 32), mWine);
      // Inner ring (smaller, rotated)
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 8, 24), mLight);
      ring2.rotation.x = Math.PI / 3;
      // Bell dome (notification icon suggestion)
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), mWine);
      dome.position.y = 0.08;
      g.add(ring1, ring2, dome);
      g.position.set(-1.0, -2.6, -2.5);
      g.rotation.set(0.5, 0.3, -0.2);
      scene.add(g);
      objects.push({ grp: g, speed: [0.006, -0.004, 0.005], floatAmp: 0.24, floatSpeed: 0.6, floatOffset: 3.5 });
    })();

    /* ── Mouse parallax ── */
    let mx = 0, my = 0;
    window.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth - 0.5) * 1.0;
      my = (e.clientY / window.innerHeight - 0.5) * 0.6;
    });

    /* ── Resize ── */
    window.addEventListener('resize', () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    /* ── Animate ── */
    let t = 0;
    (function tick(){
      requestAnimationFrame(tick);
      t += 0.016;
      objects.forEach(o => {
        o.grp.rotation.x += o.speed[0];
        o.grp.rotation.y += o.speed[1];
        o.grp.rotation.z += o.speed[2];
        // Float up/down
        o.grp.position.y += Math.sin(t * o.floatSpeed + o.floatOffset) * o.floatAmp * 0.016;
      });
      camera.position.x += (mx - camera.position.x) * 0.03;
      camera.position.y += (-my - camera.position.y) * 0.03;
      renderer.render(scene, camera);
    })();
  }
})();
