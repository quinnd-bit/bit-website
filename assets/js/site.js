(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.hidden = !open;
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  document.addEventListener('click', (event) => {
    if (toggle?.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) setMenu(false);
  });
  const desktop = window.matchMedia('(min-width: 901px)');
  desktop.addEventListener('change', (event) => { if (event.matches && toggle) setMenu(false); });
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
    const select = (tab, focus = false) => {
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (event) => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); select(tabs[next], true); }
      });
    });
  });
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in-view'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.section-heading, .offering-card, .principle-grid article, .values-grid article').forEach((element) => observer.observe(element));
  }
  const heroTheme = document.querySelector('[data-hero-theme]');
  if (heroTheme) {
    const themes = [
      'Possibility', 'Responsibility', 'Sustainability', 'Resilience',
      'Wellbeing', 'Belonging', 'Collaboration', 'Stewardship',
      'Equity', 'Insight', 'Evidence', 'Regeneration'
    ];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visibleLayout = window.matchMedia('(min-width: 761px)');
    let index = 0;
    let inView = true;
    let cycleTimer;
    let fadeTimer;
    const stop = () => {
      window.clearTimeout(cycleTimer);
      window.clearTimeout(fadeTimer);
      heroTheme.classList.remove('is-changing');
    };
    const canCycle = () => inView && !document.hidden && visibleLayout.matches && !reducedMotion.matches;
    const next = () => {
      if (!canCycle()) return;
      heroTheme.classList.add('is-changing');
      fadeTimer = window.setTimeout(() => {
        index = (index + 1) % themes.length;
        heroTheme.textContent = themes[index].toUpperCase();
        heroTheme.classList.remove('is-changing');
        cycleTimer = window.setTimeout(next, 4400);
      }, 260);
    };
    const update = () => {
      stop();
      if (canCycle()) cycleTimer = window.setTimeout(next, 4400);
    };
    if ('IntersectionObserver' in window) {
      const themeObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        update();
      }, { threshold: 0.05 });
      themeObserver.observe(heroTheme.closest('.hero'));
    }
    document.addEventListener('visibilitychange', update);
    reducedMotion.addEventListener('change', update);
    visibleLayout.addEventListener('change', update);
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', update);
    update();
  }

  const form = document.querySelector('#inquiry-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `BIT enquiry: ${data.get('interest')}`;
    const body = [data.get('message'), '', `Name: ${data.get('name')}`, `Email: ${data.get('email')}`, `Organisation: ${data.get('organisation') || 'Not specified'}`, `Interest: ${data.get('interest')}`].join('\n');
    const url = `mailto:info@building-insights.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const status = document.querySelector('#inquiry-status');
    status.textContent = 'Your email app will open a draft. Nothing has been sent by this website. If no app opens, email info@building-insights.org directly.';
    window.location.href = url;
  });
  const interest = new URLSearchParams(window.location.search).get('interest');
  const interestField = document.querySelector('select[name="interest"]');
  if (interest && interestField && Array.from(interestField.options).some((option) => option.value === interest)) interestField.value = interest;
})();
