/**
 * ROYAL SPICE RESTAURANT — script.js
 * Features:
 *  - Page loader
 *  - Sticky nav + hamburger menu
 *  - Smooth scroll
 *  - Hero reveal animations
 *  - Scroll-triggered AOS animations
 *  - Menu tab switching
 *  - Gallery lightbox
 *  - Review slider with auto-play
 *  - Reservation form validation
 *  - Scroll-to-top button
 */

'use strict';

/* ── 1. PAGE LOADER ──────────────────────────────────────── */
const loader = document.getElementById('loader');

window.addEventListener('load', () => {
  // Wait for loader bar animation (≈1.6s) then fade out
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
    // Trigger hero reveals after loader fades
    document.querySelectorAll('.reveal-up').forEach(el => {
      el.classList.add('visible');
    });
  }, 1800);
});

// Prevent scrolling while loading
document.body.classList.add('loading');


/* ── 2. STICKY NAVIGATION ────────────────────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });


/* ── 3. HAMBURGER MENU ───────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');
const navLinkEls = document.querySelectorAll('.nav-link, .nav-cta');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a nav link is clicked
navLinkEls.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }
});


/* ── 4. SMOOTH SCROLL (for browsers that don't support it) ─ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72', 10);
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ── 5. SCROLL REVEAL (Intersection Observer) ───────────────*/
const aosObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('aos-animate');
      // Optionally unobserve after animation
      aosObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('[data-aos]').forEach((el, i) => {
  // Apply stagger delay from data attribute
  const delay = el.dataset.aosDelay ? parseInt(el.dataset.aosDelay) : 0;
  el.style.transitionDelay = delay + 'ms';
  aosObserver.observe(el);
});

// Also observe section titles and about stats
const sectionRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      sectionRevealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section-title, .section-eyebrow, .section-sub, .body-text, .stat-item, .contact-item, .chef-card, .res-info-item').forEach(el => {
  el.classList.add('reveal-up');
  sectionRevealObserver.observe(el);
});


/* ── 6. MENU TABS ────────────────────────────────────────── */
const tabBtns     = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    // Update buttons
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    // Update content panels
    tabContents.forEach(panel => {
      panel.classList.remove('active');
    });
    const targetPanel = document.getElementById('tab-' + target);
    if (targetPanel) {
      targetPanel.classList.add('active');
      // Re-trigger AOS for newly revealed cards
      targetPanel.querySelectorAll('[data-aos]').forEach(el => {
        el.classList.remove('aos-animate');
        void el.offsetWidth; // reflow
        el.classList.add('aos-animate');
      });
    }
  });
});


/* ── 7. GALLERY LIGHTBOX ─────────────────────────────────── */
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox     = document.getElementById('lightbox');
const lbContent    = document.getElementById('lbContent');
const lbCounter    = document.getElementById('lbCounter');
const lbClose      = document.getElementById('lbClose');
const lbPrev       = document.getElementById('lbPrev');
const lbNext       = document.getElementById('lbNext');

// Build gallery data from DOM
const galleryData = Array.from(galleryItems).map(item => {
  const inner = item.querySelector('.img-inner');
  return {
    icon:  inner ? inner.querySelector('i')?.className || 'fa-solid fa-image' : 'fa-solid fa-image',
    label: inner ? inner.querySelector('span')?.textContent || 'Gallery' : 'Gallery'
  };
});

let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const data = galleryData[currentIndex];
  lbContent.innerHTML = `
    <div class="img-inner" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:var(--gold-dim);">
      <i class="${data.icon}" style="font-size:4rem;"></i>
      <span style="font-size:0.85rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);">${data.label}</span>
    </div>`;
  lbCounter.textContent = `${currentIndex + 1} / ${galleryData.length}`;
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
  item.addEventListener('keydown', e => { if (e.key === 'Enter') openLightbox(index); });
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `View gallery image ${index + 1}`);
});

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

lbNext.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % galleryData.length;
  updateLightbox();
});

lbPrev.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
  updateLightbox();
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % galleryData.length; updateLightbox(); }
  if (e.key === 'ArrowLeft')  { currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length; updateLightbox(); }
});


/* ── 8. REVIEW SLIDER ────────────────────────────────────── */
const reviewCards = document.querySelectorAll('.review-card');
const reviewPrev  = document.getElementById('reviewPrev');
const reviewNext  = document.getElementById('reviewNext');
const dotsContainer = document.getElementById('reviewDots');

let reviewIndex   = 0;
let reviewTimer   = null;

// Build dots
reviewCards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Go to review ${i + 1}`);
  dot.addEventListener('click', () => showReview(i));
  dotsContainer.appendChild(dot);
});

function showReview(index) {
  reviewCards[reviewIndex].classList.remove('active');
  dotsContainer.children[reviewIndex].classList.remove('active');

  reviewIndex = (index + reviewCards.length) % reviewCards.length;

  reviewCards[reviewIndex].classList.add('active');
  dotsContainer.children[reviewIndex].classList.add('active');
}

function nextReview() { showReview(reviewIndex + 1); }
function prevReview() { showReview(reviewIndex - 1); }

reviewNext.addEventListener('click', () => { nextReview(); resetTimer(); });
reviewPrev.addEventListener('click', () => { prevReview(); resetTimer(); });

function startTimer() { reviewTimer = setInterval(nextReview, 5500); }
function resetTimer()  { clearInterval(reviewTimer); startTimer(); }

startTimer();


/* ── 9. RESERVATION FORM VALIDATION ─────────────────────── */
const form       = document.getElementById('reservationForm');
const submitBtn  = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

// Set minimum date to today
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}

const validators = {
  fname:  { test: v => v.trim().length >= 2,          msg: 'Please enter your first name (min 2 characters).' },
  lname:  { test: v => v.trim().length >= 2,          msg: 'Please enter your last name (min 2 characters).' },
  email:  { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email address.' },
  phone:  { test: v => /^[\+\d\s\-\(\)]{7,15}$/.test(v),     msg: 'Please enter a valid phone number.' },
  date:   { test: v => { const d = new Date(v); return !isNaN(d) && d >= new Date(new Date().setHours(0,0,0,0)); }, msg: 'Please select a future date.' },
  time:   { test: v => v !== '',                      msg: 'Please select a time.' },
  guests: { test: v => v !== '',                      msg: 'Please select number of guests.' },
};

function validateField(id) {
  const field = document.getElementById(id);
  const errorEl = document.getElementById(id + 'Error');
  if (!field || !validators[id]) return true;

  const valid = validators[id].test(field.value);
  errorEl.textContent = valid ? '' : validators[id].msg;
  field.classList.toggle('invalid', !valid);
  return valid;
}

// Live validation on blur
Object.keys(validators).forEach(id => {
  const field = document.getElementById(id);
  if (field) {
    field.addEventListener('blur', () => validateField(id));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) validateField(id);
    });
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate all fields
  let allValid = true;
  Object.keys(validators).forEach(id => {
    if (!validateField(id)) allValid = false;
  });

  if (!allValid) {
    // Scroll to first error
    const firstInvalid = form.querySelector('.invalid');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Show loading state
  const btnText   = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  submitBtn.disabled = true;
  btnText.style.display   = 'none';
  btnLoader.style.display = 'inline-flex';

  // Simulate API call (replace with real fetch to your backend)
  await new Promise(resolve => setTimeout(resolve, 1800));

  // Show success
  submitBtn.style.display = 'none';
  formSuccess.style.display = 'flex';
  form.reset();

  // Optionally reset after 10s for demo purposes
  setTimeout(() => {
    submitBtn.style.display = '';
    submitBtn.disabled  = false;
    btnText.style.display   = '';
    btnLoader.style.display = 'none';
    formSuccess.style.display = 'none';
  }, 12000);
});


/* ── 10. SCROLL-TO-TOP BUTTON ────────────────────────────── */
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ── 11. ACTIVE NAV HIGHLIGHT ON SCROLL ──────────────────── */
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      allNavLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => navObserver.observe(section));

// Add CSS for active nav state
const activeNavStyle = document.createElement('style');
activeNavStyle.textContent = `
  .nav-link.active {
    color: var(--gold);
  }
  .nav-link.active::after {
    transform: scaleX(1);
  }
`;
document.head.appendChild(activeNavStyle);


/* ── 12. COUNTER ANIMATION (stats) ──────────────────────── */
function animateCounter(el, target, duration = 1800) {
  const isDecimal = target.toString().includes('.');
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    el.textContent = isDecimal ? current.toFixed(1) : current.toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const rawText = el.textContent.replace(/[^0-9.]/g, '');
      const target = parseFloat(rawText) || 0;
      if (target > 0) animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));
