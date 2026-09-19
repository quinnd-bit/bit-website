(() => {
  'use strict';
const palettes = [{"id": "canopy", "name": "Canopy", "description": "Forest, warm paper, and soft moss. Rooted in the natural world.", "swatches": ["#172a24", "#f4f3ed", "#d7e9bc", "#6e895d"]}, {"id": "estuary", "name": "Estuary", "description": "Deep blue, mist, and mineral green. Open, calm, and precise.", "swatches": ["#1b3440", "#f1f4f3", "#c5e1dd", "#5b858c"]}, {"id": "terracotta", "name": "Terracotta", "description": "Clay, chalk, and warm earth. Tactile, welcoming, and human.", "swatches": ["#492e28", "#f8f1e8", "#edd3b9", "#ac694e"]}, {"id": "graphite", "name": "Graphite", "description": "Charcoal, limestone, and muted gold. Quiet, timeless, and assured.", "swatches": ["#282b29", "#f3f2ee", "#e5dcbf", "#918363"]}];
const logos = [{"id": "open-frame", "name": "Open Frame", "description": "An open architectural plan paired with precise BIT lettering, brought into a compact signature.", "composition": "Mark + BIT", "file": "compositions/open-frame-signature.svg", "mark": "compositions/open-frame-mark.svg", "viewBox": "0 0 210 64"}, {"id": "confluence", "name": "Confluence", "description": "Converging flows become the T itself, connecting a familiar acronym with a distinctive shared structure.", "composition": "Integrated BIT", "file": "compositions/confluence-signature.svg", "mark": "compositions/confluence-mark.svg", "viewBox": "0 0 178 64"}, {"id": "neighbourhood", "name": "Neighbourhood", "description": "A cluster of buildings accompanies the full name in a warm, balanced three-line signature.", "composition": "Full name + mark", "file": "compositions/neighbourhood-signature.svg", "mark": "compositions/neighbourhood-mark.svg", "viewBox": "0 0 205 80"}, {"id": "open-frame-full", "name": "Open Signature", "description": "An architectural frame introduces the full Building Insights Together name, with BIT as a quiet signature above.", "composition": "Full name + BIT", "file": "compositions/open-frame-full-signature.svg", "mark": "compositions/open-frame-full-mark.svg", "viewBox": "0 0 240 72"}, {"id": "interlock", "name": "Interlock", "description": "The stepped architectural joint becomes the B itself: one compact, integrated BIT signature.", "composition": "Integrated BIT", "file": "compositions/interlock-signature.svg", "mark": "compositions/interlock-mark.svg", "viewBox": "0 0 224 72"}, {"id": "fieldwork", "name": "Fieldwork", "description": "Four soft land parcels, editorial BIT lettering, and the full name in a carefully balanced stacked signature.", "composition": "BIT + full name", "file": "compositions/fieldwork-signature.svg", "mark": "compositions/fieldwork-mark.svg", "viewBox": "0 0 240 80"}];
  const visuals = [{ id: 'street', name: 'Street level' }, { id: 'canopy', name: 'City & canopy' }, { id: 'plan', name: 'City plan' }];
  const key = 'bit-review-view-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) {}
  const state = { palette: document.documentElement.dataset.palette, logo: document.documentElement.dataset.logo, visual: document.documentElement.dataset.cityVisual || 'street', seen: saved.seen === true, collapsed: saved.collapsed === true };
  const dialog = document.getElementById('review-dialog');
  const dock = document.getElementById('review-dock');
  const options = document.getElementById('review-dock-options');
  const collapseButton = document.querySelector('[data-review-collapse]');
  const openButton = document.querySelector('[data-review-open]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let closing = false;
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) {} };
  const apply = () => {
    const palette = palettes.find(item => item.id === state.palette) || palettes[0];
    const logo = logos.find(item => item.id === state.logo) || logos[0];
    const visual = visuals.find(item => item.id === state.visual) || visuals[0];
    state.visual = visual.id;
    document.documentElement.dataset.cityVisual = visual.id;
    document.querySelectorAll('[data-review-visual-select]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.reviewVisualSelect === visual.id)));
    document.querySelectorAll('[data-city-image-status]').forEach(el => { const message = `City image: ${visual.name}`; if (el.textContent !== message) el.textContent = message; });
    state.palette = palette.id;
    state.logo = logo.id;
    document.documentElement.dataset.palette = palette.id;
    document.documentElement.dataset.logo = logo.id;
    document.querySelectorAll('[data-review-kind]').forEach(input => { input.checked = input.value === state[input.dataset.reviewKind]; });
    document.querySelectorAll('[data-palette-description]').forEach(el => { el.textContent = palette.description; });
    document.querySelectorAll('[data-logo-description]').forEach(el => { el.textContent = logo.description; });
    document.querySelectorAll('[data-review-summary]').forEach(el => { el.textContent = logo.name; });
    const favicon = document.querySelector('link[rel="icon"]');
    favicon?.setAttribute('href', `/assets/brand/${logo.mark}`);
    favicon?.setAttribute('type', 'image/svg+xml');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palette.swatches[0]);
  };
  const setCollapsed = (value) => {
    state.collapsed = value;
    options.hidden = value;
    dock.classList.toggle('is-collapsed', value);
    collapseButton.setAttribute('aria-expanded', String(!value));
    collapseButton.setAttribute('aria-label', value ? 'Expand review controls' : 'Collapse review controls');
    collapseButton.textContent = value ? '+' : '−';
  };
  const showReview = () => {
    if (dialog.open || closing) return;
    dock.hidden = true;
    document.body.classList.add('review-modal-open');
    dialog.showModal();
    dialog.querySelector('[data-review-close]').focus({ preventScroll: true });
  };
  const minimiseReview = async () => {
    if (!dialog.open || closing) return;
    closing = true;
    state.seen = true;
    save();
    dock.hidden = false;
    dock.style.visibility = 'hidden';
    if (!motion.matches && typeof dialog.animate === 'function') {
      const from = dialog.getBoundingClientRect();
      const to = dock.getBoundingClientRect();
      dialog.classList.add('is-minimising');
      const animation = dialog.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1, transformOrigin: 'top left' },
        { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`, opacity: 0.15, transformOrigin: 'top left' }
      ], { duration: 320, easing: 'cubic-bezier(.4,0,.2,1)' });
      try { await animation.finished; } catch (_) {}
    }
    dialog.close();
    dialog.classList.remove('is-minimising');
    document.body.classList.remove('review-modal-open');
    dock.style.visibility = '';
    closing = false;
    if (!motion.matches) dock.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180, easing: 'ease-out' });
    openButton.focus({ preventScroll: true });
  };
  document.querySelectorAll('[data-review-kind]').forEach(input => input.addEventListener('change', () => {
    if (!input.checked) return;
    state[input.dataset.reviewKind] = input.value;
    if (input.dataset.reviewKind === 'visual') setFlipped(document.getElementById('city-image-card'), false);
    apply();
    save();
  }));
  document.querySelectorAll('[data-review-close]').forEach(button => button.addEventListener('click', minimiseReview));
  document.querySelectorAll('[data-review-open]').forEach(button => button.addEventListener('click', showReview));
  document.querySelectorAll('[data-review-reset]').forEach(button => button.addEventListener('click', () => {
    state.palette = 'canopy';
    state.logo = 'open-frame';
    state.visual = 'street';
    apply();
    save();
  }));
  collapseButton.addEventListener('click', () => { setCollapsed(!state.collapsed); save(); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); minimiseReview(); });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) minimiseReview();
  });

  const flipButtons = Array.from(document.querySelectorAll('[data-review-flip]'));
  const setFlipped = (card, flipped, focusChoice = false) => {
    if (!card) return;
    card.classList.toggle('is-flipped', flipped);
    const front = card.querySelector('.review-flip-front');
    const back = card.querySelector('.review-flip-back');
    front.inert = flipped;
    back.inert = !flipped;
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
    const button = flipButtons.find(item => item.dataset.reviewFlip === card.id);
    if (button) {
      button.setAttribute('aria-expanded', String(flipped));
      const label = flipped ? (card.id === 'review-dock-card' ? 'Back to palettes and logos' : 'Show selected city image') : (card.id === 'review-dock-card' ? 'Choose city image' : 'Compare city images');
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      const text = button.querySelector('span');
      if (text) text.textContent = flipped ? 'Back to image' : 'Try another view';
    }
    if (focusChoice) {
      const target = flipped ? (back.querySelector('input:checked, button[aria-pressed="true"]') || back.querySelector('button, input')) : button;
      target?.focus({ preventScroll: true });
    }
  };
  flipButtons.forEach(button => button.addEventListener('click', () => {
    const card = document.getElementById(button.dataset.reviewFlip);
    const expanding = card.id === 'review-dock-card' && state.collapsed;
    if (expanding) { setCollapsed(false); save(); }
    setFlipped(card, expanding || !card.classList.contains('is-flipped'), true);
  }));
  document.querySelectorAll('[data-review-visual-select]').forEach(button => button.addEventListener('click', () => {
    state.visual = button.dataset.reviewVisualSelect;
    apply();
    save();
    setFlipped(document.getElementById('city-image-card'), false, true);
  }));
  const showCityImage = (compare = false) => {
    const visual = document.getElementById('city-visual');
    if (!visual) { window.location.href = compare ? '/index.html?review=images#city-visual' : '/index.html#city-visual'; return; }
    document.getElementById('tab-models')?.click();
    visual.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'center' });
    document.querySelector('[data-review-flip="city-image-card"]')?.focus({ preventScroll: true });
  };
  document.querySelectorAll('[data-review-see-image]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    setFlipped(document.getElementById('city-image-card'), false);
    showCityImage();
  }));
  document.querySelectorAll('[data-review-images]').forEach(button => button.addEventListener('click', async () => {
    await minimiseReview();
    setCollapsed(false);
    setFlipped(document.getElementById('review-dock-card'), true);
    save();
    showCityImage(true);
  }));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || dialog.open) return;
    const scope = event.target.closest('.city-visual, .review-dock');
    const card = scope?.querySelector('.review-flipper.is-flipped');
    if (card) { event.preventDefault(); setFlipped(card, false, true); }
  });

  apply();
  setCollapsed(state.collapsed);
  const arrival = new URL(window.location.href);
  if (arrival.searchParams.get('review') === 'images' && document.getElementById('city-visual')) {
    state.seen = true;
    dock.hidden = false;
    setCollapsed(false);
    setFlipped(document.getElementById('review-dock-card'), true);
    save();
    arrival.searchParams.delete('review');
    window.history.replaceState(null, '', arrival.pathname + arrival.search + arrival.hash);
  } else if (state.seen) dock.hidden = false;
  else showReview();
})();
