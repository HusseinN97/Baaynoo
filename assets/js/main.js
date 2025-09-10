/* GA4 (replace MEASUREMENT_ID), privacy-aware */
export function initAnalytics() {
  const dnt = navigator.doNotTrack == "1" || window.doNotTrack == "1";
  if (dnt) return;
  const id = document.documentElement.getAttribute('data-ga4') || 'G-XXXXXXX';
  if (!id || id === 'G-XXXXXXX') return;
  const s = document.createElement('script');
  s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id, { anonymize_ip: true });
}

/* Nav active state (filename-based; works on GitHub Pages) */
export function setActiveNav() {
  const path = location.pathname.replace(/\/$/, '/index.html');
  const cur = path.split('/').pop();
  document.querySelectorAll('nav a[data-path]').forEach((a) => {
    const ap = (a.dataset.path || '').split('/').pop();
    if (ap === cur) a.setAttribute('aria-current', 'page');
  });
}

/* Newsletter + contact spam guard */
export function spamGuard(form) {
  if (!form) return;
  const hp = form.querySelector('input[name="company"]'); // honeypot
  const ts = form.querySelector('input[name="ts"]');
  if (ts) ts.value = String(Date.now());
  form.addEventListener('submit', (e) => {
    const now = Date.now();
    const started = Number(ts?.value || 0);
    const tooFast = now - started < 4000; // <4s
    if ((hp && hp.value) || tooFast) {
      e.preventDefault();
      const msg = form.querySelector('.form-message');
      if (msg) { msg.textContent = 'Submission blocked. Please try again.'; msg.className = 'form-message error'; }
    }
  });
}

/* Utility: set dir based on lang */
export function applyDir() {
  const html = document.documentElement;
  const lang = html.lang || 'en';
  html.dir = lang.startsWith('ar') ? 'rtl' : 'ltr';
}

/* Back-to-top visibility and behavior */
function initBackToTop(){
  const btn = document.querySelector('.back-to-top');
  if(!btn) return;
  const onScroll = () => {
    if (window.scrollY > 600) btn.classList.add('show');
    else btn.classList.remove('show');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* Header scroll state (shrink on scroll) */
function initHeaderScroll(){
  const header = document.querySelector('header.site-header');
  if(!header) return;
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  applyDir();
  setActiveNav();
  initAnalytics();
  document.querySelectorAll('form[data-spam-guard]').forEach(spamGuard);
  initHeaderScroll();
  initBackToTop();
  initMobileMenu();
});

/* Mobile menu with focus trap */
function initMobileMenu() {
  const header = document.querySelector('header.site-header');
  const nav = document.getElementById('primary-nav');
  const toggle = header?.querySelector('.menu-toggle');
  const overlay = header?.querySelector('.nav-overlay');
  if (!header || !nav || !toggle || !overlay) return;

  const getFocusable = () => nav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');

  const open = () => {
    header.classList.add('nav-open');
    document.body.classList.add('no-scroll');
    toggle.setAttribute('aria-expanded', 'true');
    overlay.hidden = false;
    const f = getFocusable();
    f.length && f[0].focus();
  };
  const close = () => {
    header.classList.remove('nav-open');
    document.body.classList.remove('no-scroll');
    toggle.setAttribute('aria-expanded', 'false');
    overlay.hidden = true;
    toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  });
  overlay.addEventListener('click', close);
  nav.addEventListener('click', (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && t.tagName === 'A') close();
  });
  document.addEventListener('keydown', (e) => {
    if (!header.classList.contains('nav-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') {
      const f = Array.from(getFocusable());
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    }
  });
}
