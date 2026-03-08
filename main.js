/**
 * LedgerStone & Associates — Main JavaScript
 * Pure vanilla JS, no dependencies.
 */

/* ============================================================
   UTILITY
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   BOOK OPENING ANIMATION (Home page only)
   ============================================================ */
function initBookAnimation() {
  const overlay = $('#book-overlay');
  if (!overlay) return;

  const pageContent = $('.page-content');

  // Skip if already played this session OR if reduced motion
  if (sessionStorage.getItem('ls_book_played') === '1' || prefersReducedMotion()) {
    overlay.classList.add('hidden');
    if (pageContent) pageContent.style.opacity = '1';
    return;
  }

  // Hide main content while overlay is showing
  if (pageContent) pageContent.style.opacity = '0';

  // Start the animation sequence
  const book = overlay.querySelector('.book');

  // Phase 1: Show overlay, then open book after short pause
  setTimeout(() => {
    if (book) book.classList.add('opened');
  }, 600);

  // Phase 2: Fade out overlay, reveal content
  setTimeout(() => {
    overlay.classList.add('fade-out');
    if (pageContent) {
      pageContent.style.transition = 'opacity 0.6s ease';
      pageContent.style.opacity = '1';
    }
  }, 2000);

  // Phase 3: Remove overlay from DOM
  setTimeout(() => {
    overlay.classList.add('hidden');
    sessionStorage.setItem('ls_book_played', '1');
  }, 2700);
}

/* ============================================================
   HEADER — scroll shadow & active nav
   ============================================================ */
function initHeader() {
  const header = $('.site-header');
  if (!header) return;

  // Scroll shadow
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mark active nav link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  $$('.site-nav a').forEach(link => {
    const linkPath = link.getAttribute('href').split('/').pop();
    if (linkPath === currentPath ||
       (currentPath === '' && linkPath === 'index.html')) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ============================================================
   MOBILE NAV TOGGLE
   ============================================================ */
function initMobileNav() {
  const toggle = $('.nav-toggle');
  const nav    = $('.site-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
    document.body.style.overflow = expanded ? '' : 'hidden';
  });

  // Close on nav link click (mobile)
  $$('.site-nav a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

/* ============================================================
   SCROLL REVEAL (generic .reveal elements)
   ============================================================ */
function initScrollReveal() {
  if (prefersReducedMotion()) {
    $$('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => obs.observe(el));
}

/* ============================================================
   STATS COUNT-UP ANIMATION (A-04)
   ============================================================ */
function initCountUp() {
  const stats = $$('[data-count]');
  if (!stats.length) return;

  if (prefersReducedMotion()) {
    stats.forEach(el => {
      el.textContent = el.dataset.count;
    });
    return;
  }

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animateCount(el) {
    const target   = el.dataset.count;
    // Extract numeric portion and suffix
    const numMatch = target.match(/[\d,]+/);
    if (!numMatch) { el.textContent = target; return; }
    const num      = parseInt(numMatch[0].replace(/,/g, ''), 10);
    const prefix   = target.slice(0, numMatch.index);
    const suffix   = target.slice(numMatch.index + numMatch[0].length);

    const duration = 1800;
    const start    = performance.now();

    function frame(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current  = Math.round(easeOut(progress) * num);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(el => obs.observe(el));
}

/* ============================================================
   SERVICES CARD BORDER LINE-DRAW (A-06, A-07)
   ============================================================ */
function initServiceCardAnimation() {
  const cards = $$('.service-detail-card');
  if (!cards.length) return;

  if (prefersReducedMotion()) {
    cards.forEach(c => {
      c.classList.add('line-drawn');
    });
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('line-drawn');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(c => obs.observe(c));
}

/* ============================================================
   ABOUT PAGE — stagger fade-up on load (A-05)
   ============================================================ */
function initAboutStagger() {
  const sections = $$('.about-stagger');
  if (!sections.length) return;

  if (prefersReducedMotion()) {
    sections.forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; });
    return;
  }

  sections.forEach((sec, i) => {
    sec.style.opacity = '0';
    sec.style.transform = 'translateY(30px)';
    sec.style.transition = `opacity 0.6s ease ${i * 150}ms, transform 0.6s ease ${i * 150}ms`;
  });

  // Use rAF to trigger after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sections.forEach(sec => {
        sec.style.opacity = '1';
        sec.style.transform = 'translateY(0)';
      });
    });
  });
}

/* ============================================================
   CONTACT PAGE — form fields fade-left (A-08)
   ============================================================ */
function initContactFormAnimation() {
  const groups = $$('.form-group');
  if (!groups.length) return;

  if (prefersReducedMotion()) {
    groups.forEach(g => g.classList.add('animate-in'));
    return;
  }

  groups.forEach((g, i) => {
    setTimeout(() => g.classList.add('animate-in'), i * 200);
  });
}

/* ============================================================
   CONTACT FORM — validation & submission
   ============================================================ */
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const successMsg = form.querySelector('.form-success');

  function getField(name) { return form.querySelector(`[name="${name}"]`); }
  function getError(name) { return form.querySelector(`[data-error="${name}"]`); }

  function setError(name, msg) {
    const field = getField(name);
    const err   = getError(name);
    if (field) field.classList.add('error');
    if (err)   { err.textContent = msg; err.classList.add('visible'); }
  }

  function clearError(name) {
    const field = getField(name);
    const err   = getError(name);
    if (field) field.classList.remove('error');
    if (err)   { err.textContent = ''; err.classList.remove('visible'); }
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  // Live validation
  $$('[data-validate]', form).forEach(field => {
    field.addEventListener('blur', () => {
      validateField(field);
    });
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(field);
    });
  });

  function validateField(field) {
    const name  = field.name;
    const value = field.value.trim();
    clearError(name);

    if (field.required && !value) {
      setError(name, 'This field is required.');
      return false;
    }
    if (name === 'email' && value && !validateEmail(value)) {
      setError(name, 'Please enter a valid email address.');
      return false;
    }
    return true;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;
    $$('[data-validate]', form).forEach(field => {
      if (!validateField(field)) valid = false;
    });

    if (!valid) {
      // Focus first error field
      const firstError = form.querySelector('.form-input.error, .form-textarea.error, .form-select.error');
      if (firstError) firstError.focus();
      return;
    }

    // Simulate form submission
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    setTimeout(() => {
      form.querySelectorAll('.form-group').forEach(g => g.style.display = 'none');
      form.querySelector('.form-submit-wrap').style.display = 'none';
      if (successMsg) successMsg.classList.add('visible');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }, 1000);
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initBookAnimation();
  initHeader();
  initMobileNav();
  initScrollReveal();
  initCountUp();
  initServiceCardAnimation();
  initAboutStagger();
  initContactFormAnimation();
  initContactForm();
});
