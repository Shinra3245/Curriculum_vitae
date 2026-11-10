/* ==========================================================
   PORTAFOLIO – interactividad
   ========================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tema claro / oscuro ---------- */
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem('theme');
    if (saved) root.dataset.theme = saved;
    else if (matchMedia('(prefers-color-scheme: light)').matches) root.dataset.theme = 'light';
  } catch (_) {}
  $('#themeToggle').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (_) {}
  });

  /* ---------- Menú móvil ---------- */
  const burger = $('#burger');
  const links = $('#navLinks');
  const closeMenu = () => { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', links).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());

  /* ---------- Scroll: nav, progreso, enlace activo ---------- */
  const nav = $('#nav');
  const progress = $('#progress');
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navAnchors = $$('a[href^="#"]', links);
  const sections = navAnchors.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        navAnchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Animaciones al hacer scroll ---------- */
  // Retraso escalonado entre hermanos
  $$('.skills, .projects, .quotes, .stats').forEach(group =>
    [...group.children].forEach((el, i) => el.style.setProperty('--d', i * 0.1 + 's')));

  const countUp = el => {
    const target = +el.dataset.count;
    if (reduceMotion) { el.textContent = target; return; }
    const dur = 1400, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const revealer = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-visible');
      $$('[data-count]', en.target).forEach(countUp);
      revealer.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => revealer.observe(el));

  /* ---------- Texto que se escribe solo ---------- */
  const typed = $('#typed');
  const roles = ['Desarrollador Full Stack', 'Diseñador de interfaces', 'Creador de productos web'];
  if (reduceMotion) {
    typed.textContent = roles[0];
  } else {
    let r = 0, c = 0, del = false;
    const type = () => {
      const word = roles[r];
      typed.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(type, 1600); }
      if (del && c === 0) { del = false; r = (r + 1) % roles.length; return setTimeout(type, 350); }
      c += del ? -1 : 1;
      setTimeout(type, del ? 35 : 75);
    };
    type();
  }

  /* ---------- Filtro de proyectos ---------- */
  const filters = $$('.filter');
  const projects = $$('.project');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.toggle('is-active', b === btn));
    const f = btn.dataset.filter;
    projects.forEach(p => {
      const show = f === 'all' || p.dataset.cat === f;
      p.classList.toggle('is-hidden', !show);
      if (show) p.classList.add('is-visible');
    });
  }));

  /* ---------- Imágenes: fallback si falla la carga ---------- */
  $$('img').forEach(img => img.addEventListener('error', () => {
    img.style.visibility = 'hidden';
  }, { once: true }));

  /* ---------- Formulario de contacto ---------- */
  // Por defecto abre el cliente de correo. Cambia EMAIL por el tuyo,
  // o reemplaza este bloque por fetch() a Formspree, EmailJS, etc.
  const EMAIL = 'tucorreo@ejemplo.com';
  const form = $('#contactForm');
  const status = $('#formStatus');
  const setStatus = (msg, cls) => { status.textContent = msg; status.className = 'form__status ' + (cls || ''); };

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    $$('.field', form).forEach(f => {
      const input = $('input, textarea', f);
      const ok = input.value.trim() && (input.type !== 'email' || /^\S+@\S+\.\S+$/.test(input.value));
      f.classList.toggle('has-error', !ok);
      if (!ok) valid = false;
    });
    if (!valid) return setStatus('Revisa los campos marcados.', 'err');

    const { name, email, message } = Object.fromEntries(new FormData(form));
    const subject = encodeURIComponent('Contacto desde el portafolio – ' + name);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setStatus('¡Gracias! Se abrirá tu cliente de correo.', 'ok');
    form.reset();
  });

  /* ---------- Año del footer ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
