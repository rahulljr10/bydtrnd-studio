/* ============================================================
   BYDTRND — Behaviors
   - Preloader counter + curtains (homepage only)
   - Lenis smooth scroll (lerp 0.08)
   - Custom cursor with RAF lerp (star shape, mix-blend-mode:difference)
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

/* ---------- Preloader — homepage only ---------- */
(function(){
  const pre = document.querySelector('.preload');
  if (!pre) return;

  // Only run the full animation on the homepage (body.home).
  // All other pages don't include the preloader HTML at all,
  // but this guard is a safety net in case they ever do.
  const isHome = document.body.classList.contains('home') ||
                 location.pathname === '/' ||
                 /(?:^|\/)index\.html$/.test(location.pathname);

  if (!isHome) {
    // Not homepage — hide immediately, no animation
    pre.classList.add('done');
    document.body.classList.add('ready');
    pre.style.display = 'none';
    return;
  }

  // Homepage: skip curtain animation when navigating back from sub-pages
  if (document.referrer) {
    try {
      const ref = new URL(document.referrer);
      if (ref.hostname === location.hostname) {
        pre.classList.add('done');
        document.body.classList.add('ready');
        pre.style.display = 'none';
        return;
      }
    } catch(e) {}
  }

  // Fresh homepage visit — run full preloader
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
  window.__lenis = lenis;
  if (typeof ScrollTrigger !== 'undefined'){
    lenis.on('scroll', ScrollTrigger.update);
  }
})();

/* ---------- Cursor — 4-pointed star with mix-blend-mode:difference ---------- */
(function(){
  if (matchMedia('(max-width: 760px)').matches) return;
  const star = document.querySelector('.cursor-star');
  if (!star) return;
  let mx = innerWidth/2, my = innerHeight/2;
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    star.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%,-50%)`;
  });
  document.querySelectorAll('a, button, .svc-head, .svc-card, .price-card, .faq-q, [data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hover'));
  });
  addEventListener('mousedown', () => document.body.classList.add('clicking'));
  addEventListener('mouseup', () => document.body.classList.remove('clicking'));
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
