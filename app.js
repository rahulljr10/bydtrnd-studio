/* ============================================================
   NXGEN STUDIO — Shared app behavior
   ============================================================ */
document.documentElement.classList.remove('no-js');
document.body.classList.remove('no-js');

/* ---------- Preloader ---------- */
(function(){
  const count = document.getElementById('count');
  const pre = document.getElementById('preloader');
  if (!pre) return;
  let n = 0;
  const dur = 1400;
  const start = performance.now();
  function tick(now){
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    n = Math.floor(eased * 100);
    if (count) count.textContent = String(n).padStart(3, '0');
    if (t < 1) requestAnimationFrame(tick);
    else {
      setTimeout(() => {
        pre.classList.add('done');
        document.body.classList.add('ready');
        startScramble();
        setTimeout(() => { pre.style.display = 'none'; }, 1200);
      }, 220);
    }
  }
  requestAnimationFrame(tick);
})();

/* ---------- Cursor ---------- */
(function(){
  if (matchMedia('(max-width: 760px)').matches) return;
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  let mx = innerWidth / 2, my = innerHeight / 2;
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
  document.querySelectorAll('[data-cursor], a, button, .svc-head, .work-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

/* ---------- Hero mouse-follow glow ---------- */
(function(){
  const hero = document.querySelector('.hero, .svc-hero');
  if (!hero) return;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
})();

/* ---------- Nav scrolled state ---------- */
(function(){
  const nav = document.getElementById('nav');
  if (!nav) return;
  addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 40);
  }, { passive: true });
})();

/* ---------- Text scramble ---------- */
function startScramble(){
  const els = document.querySelectorAll('.scramble');
  const chars = '!<>-_\\/[]{}—=+*^?#NX0123456789';
  els.forEach((el, idx) => {
    const final = el.dataset.final || el.textContent;
    const dur = 900;
    const start = performance.now() + 600 + idx * 100;
    function frame(now){
      if (now < start){ requestAnimationFrame(frame); return; }
      const t = Math.min(1, (now - start) / dur);
      let out = '';
      for (let i = 0; i < final.length; i++){
        if (t * final.length > i) out += final[i];
        else out += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = final;
    }
    requestAnimationFrame(frame);
  });
}

/* ---------- Reveal on scroll ---------- */
(function(){
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const proc = document.querySelector('.process');
  if (proc){
    const ioProc = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting){ proc.classList.add('in'); ioProc.unobserve(proc); } });
    }, { threshold: .25 });
    ioProc.observe(proc);
  }

  const cta = document.querySelector('.cta');
  if (cta){
    const ioCta = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting){ cta.classList.add('in'); ioCta.unobserve(cta); } });
    }, { threshold: .3 });
    ioCta.observe(cta);
  }
})();

/* ---------- Magnetic buttons ---------- */
(function(){
  if (matchMedia('(max-width: 760px)').matches) return;
  document.querySelectorAll('.hero-cta, .cta-mail, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * .15}px, ${y * .25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
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
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
      history.replaceState(null, '', id);
    });
  });
})();

/* ---------- Nav dropdown (tap/click on mobile, also accessible) ---------- */
(function(){
  document.querySelectorAll('.nav-has-dropdown').forEach(dd => {
    const trigger = dd.querySelector('a');
    const isTouch = matchMedia('(hover: none), (max-width: 760px)').matches;
    if (!isTouch) return; // desktop uses CSS :hover
    trigger.addEventListener('click', e => {
      // Only intercept if dropdown isn't open
      if (!dd.classList.contains('open')) {
        e.preventDefault();
        document.querySelectorAll('.nav-has-dropdown.open').forEach(o => o.classList.remove('open'));
        dd.classList.add('open');
      }
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-has-dropdown')) {
      document.querySelectorAll('.nav-has-dropdown.open').forEach(o => o.classList.remove('open'));
    }
  });
})();
