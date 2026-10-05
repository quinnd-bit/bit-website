(() => {
  'use strict';

  const apiBase = window.BIT_STICKY_NOTES_API || document.querySelector('meta[name="sticky-notes-api"]')?.content || '/api/sticky-notes';
  const pagePath = normalisePath(window.location.pathname);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = { notes: [], placing: false, placement: null, activeId: null };

  const layer = element('div', 'sticky-notes-layer');
  layer.dataset.stickyUi = '';
  layer.setAttribute('aria-hidden', 'true');

  const launcher = element('button', 'sticky-notes-launcher');
  launcher.type = 'button';
  launcher.dataset.stickyUi = '';
  launcher.setAttribute('aria-controls', 'sticky-notes-panel');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = '<svg class="sticky-notes-launcher-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4.5h14v11l-4.5 4H5z" stroke="currentColor" stroke-width="1.5"/><path d="M14.5 19.5v-4h4M8 9h8M8 12.5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span>Site notes</span><span class="sticky-notes-count" aria-label="0 notes">0</span>';

  const panel = element('aside', 'sticky-notes-panel');
  panel.id = 'sticky-notes-panel';
  panel.dataset.stickyUi = '';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Site feedback notes');
  panel.innerHTML = `
    <div class="sticky-notes-panel-header">
      <div><p class="sticky-notes-panel-kicker">Shared website feedback</p><h2>Site notes</h2></div>
      <button class="sticky-notes-icon-button" type="button" data-sticky-close aria-label="Close site notes">×</button>
    </div>
    <p class="sticky-notes-panel-intro">Pin a suggestion to the exact part of this page it refers to. Notes are shared with everyone using this review site.</p>
    <div class="sticky-notes-panel-actions">
      <button class="sticky-notes-primary" type="button" data-sticky-add aria-pressed="false">+ Add a note</button>
      <button class="sticky-notes-secondary" type="button" data-sticky-refresh>Refresh</button>
    </div>
    <p class="sticky-notes-status" data-sticky-status aria-live="polite"></p>
    <ol class="sticky-notes-list" data-sticky-list></ol>
    <p class="sticky-notes-empty" data-sticky-empty>No notes on this page yet.</p>`;

  const placementBanner = element('div', 'sticky-placement-banner');
  placementBanner.dataset.stickyUi = '';
  placementBanner.hidden = true;
  placementBanner.innerHTML = '<span>Click the exact spot where this note belongs.</span><button type="button" data-sticky-cancel-placement>Cancel</button>';

  const composer = element('form', 'sticky-note-composer');
  composer.dataset.stickyUi = '';
  composer.hidden = true;
  composer.setAttribute('role', 'dialog');
  composer.setAttribute('aria-modal', 'true');
  composer.setAttribute('aria-labelledby', 'sticky-note-composer-title');
  composer.innerHTML = `
    <h2 id="sticky-note-composer-title">Leave a site note</h2>
    <label for="sticky-note-author">Name or initials</label>
    <input id="sticky-note-author" name="author" maxlength="80" autocomplete="name" required>
    <label for="sticky-note-message">Suggestion</label>
    <textarea id="sticky-note-message" name="message" maxlength="600" required></textarea>
    <p class="sticky-note-form-status" data-sticky-form-status aria-live="polite"></p>
    <div class="sticky-note-composer-actions">
      <button type="button" data-sticky-cancel>Cancel</button>
      <button type="submit">Save note</button>
    </div>`;

  const noteCard = element('article', 'sticky-note-card');
  noteCard.dataset.stickyUi = '';
  noteCard.hidden = true;
  noteCard.setAttribute('role', 'dialog');
  noteCard.setAttribute('aria-modal', 'false');
  noteCard.setAttribute('aria-labelledby', 'sticky-note-card-title');
  noteCard.innerHTML = `
    <div class="sticky-note-card-header">
      <div><span class="sticky-note-anchor-label" data-sticky-card-number></span><h2 id="sticky-note-card-title" data-sticky-card-author></h2></div>
      <button class="sticky-notes-icon-button" type="button" data-sticky-card-close aria-label="Close note">×</button>
    </div>
    <p data-sticky-card-message></p>
    <span class="sticky-note-meta" data-sticky-card-date></span>`;

  document.body.append(layer, launcher, panel, placementBanner, composer, noteCard);

  const count = launcher.querySelector('.sticky-notes-count');
  const addButton = panel.querySelector('[data-sticky-add]');
  const status = panel.querySelector('[data-sticky-status]');
  const list = panel.querySelector('[data-sticky-list]');
  const empty = panel.querySelector('[data-sticky-empty]');
  const authorInput = composer.elements.author;
  const messageInput = composer.elements.message;
  const formStatus = composer.querySelector('[data-sticky-form-status]');

  try { authorInput.value = localStorage.getItem('bit-sticky-notes-author') || ''; } catch (_) {}

  launcher.addEventListener('click', () => setPanel(panel.hidden));
  panel.querySelector('[data-sticky-close]').addEventListener('click', () => setPanel(false));
  panel.querySelector('[data-sticky-refresh]').addEventListener('click', () => loadNotes(true));
  addButton.addEventListener('click', () => setPlacing(!state.placing));
  placementBanner.querySelector('[data-sticky-cancel-placement]').addEventListener('click', () => setPlacing(false));
  composer.querySelector('[data-sticky-cancel]').addEventListener('click', closeComposer);
  noteCard.querySelector('[data-sticky-card-close]').addEventListener('click', closeNoteCard);
  composer.addEventListener('submit', saveNote);
  document.addEventListener('click', placeNote, true);
  document.addEventListener('keydown', handleEscape);
  window.addEventListener('resize', scheduleMarkerPositioning);
  window.addEventListener('scroll', closeNoteCard, { passive: true });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleMarkerPositioning);
    observer.observe(document.body);
  }

  if ('MutationObserver' in window) {
    const observer = new MutationObserver(scheduleMarkerPositioning);
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['hidden', 'aria-hidden', 'class']
    });
  }

  loadNotes(false);
  window.setInterval(() => {
    if (!document.hidden && !state.placing && composer.hidden) loadNotes(false, true);
  }, 30000);

  function normalisePath(pathname) {
    const withoutIndex = pathname.replace(/\/index\.html$/i, '/');
    const collapsed = withoutIndex.replace(/\/{2,}/g, '/');
    if (collapsed === '/') return '/';
    return collapsed.endsWith('/') ? collapsed : `${collapsed}/`;
  }

  function element(tag, className) {
    const node = document.createElement(tag);
    node.className = className;
    return node;
  }

  function setPanel(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (!open) setPlacing(false);
    if (open) panel.querySelector('[data-sticky-close]').focus({ preventScroll: true });
    else launcher.focus({ preventScroll: true });
  }

  function setPlacing(value) {
    state.placing = value;
    addButton.setAttribute('aria-pressed', String(value));
    addButton.textContent = value ? 'Cancel placement' : '+ Add a note';
    placementBanner.hidden = !value;
    document.body.classList.toggle('sticky-note-placing', value);
    if (value) {
      panel.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      closeNoteCard();
    }
  }

  function placeNote(event) {
    if (!state.placing || event.target.closest('[data-sticky-ui]')) return;
    event.preventDefault();
    event.stopPropagation();

    const anchor = chooseAnchor(event.target);
    const rect = anchor.getBoundingClientRect();
    const documentWidth = Math.max(document.documentElement.scrollWidth, 1);
    const documentHeight = Math.max(document.documentElement.scrollHeight, 1);
    state.placement = {
      selector: selectorFor(anchor),
      xRatio: clamp((event.clientX - rect.left) / Math.max(rect.width, 1), 0, 1),
      yRatio: clamp((event.clientY - rect.top) / Math.max(rect.height, 1), 0, 1),
      documentXRatio: clamp((event.clientX + window.scrollX) / documentWidth, 0, 1),
      documentYRatio: clamp((event.clientY + window.scrollY) / documentHeight, 0, 1)
    };
    setPlacing(false);
    openComposer(event.clientX, event.clientY);
  }

  function chooseAnchor(start) {
    let node = start instanceof Element ? start : start.parentElement;
    while (node && node !== document.body) {
      const tag = node.tagName.toLowerCase();
      const rect = node.getBoundingClientRect();
      if (!['path', 'use', 'svg', 'span'].includes(tag) && rect.width >= 32 && rect.height >= 20) return node;
      node = node.parentElement;
    }
    return document.body;
  }

  function selectorFor(start) {
    if (start === document.body) return 'body';
    const parts = [];
    let node = start;
    while (node && node !== document.body) {
      if (node.id && document.querySelectorAll(`#${escapeCss(node.id)}`).length === 1) {
        parts.unshift(`#${escapeCss(node.id)}`);
        break;
      }
      const tag = node.tagName.toLowerCase();
      const parent = node.parentElement;
      if (!parent) break;
      const siblings = Array.from(parent.children).filter(item => item.tagName === node.tagName);
      const suffix = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(node) + 1})` : '';
      parts.unshift(`${tag}${suffix}`);
      node = parent;
    }
    return parts.join(' > ') || 'body';
  }

  function escapeCss(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return value.replace(/[^a-zA-Z0-9_-]/g, match => `\\${match}`);
  }

  function openComposer(clientX, clientY) {
    composer.hidden = false;
    formStatus.textContent = '';
    messageInput.value = '';
    positionFloating(composer, clientX, clientY);
    (authorInput.value ? messageInput : authorInput).focus();
  }

  function closeComposer() {
    composer.hidden = true;
    state.placement = null;
    formStatus.textContent = '';
  }

  async function saveNote(event) {
    event.preventDefault();
    if (!state.placement) return;
    const author = authorInput.value.trim();
    const message = messageInput.value.trim();
    if (!author || !message) {
      formStatus.textContent = 'Add your name and suggestion.';
      return;
    }

    const submit = composer.querySelector('button[type="submit"]');
    submit.disabled = true;
    formStatus.textContent = 'Saving…';
    try {
      const response = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagePath, author, message, anchor: state.placement })
      });
      if (!response.ok) throw new Error(`The notes service returned ${response.status}.`);
      const saved = await response.json();
      state.notes.push(saved.note);
      state.notes.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      try { localStorage.setItem('bit-sticky-notes-author', author); } catch (_) {}
      closeComposer();
      renderNotes();
      status.textContent = 'Note saved and shared.';
      openNoteCard(saved.note, state.notes.indexOf(saved.note) + 1);
    } catch (_) {
      formStatus.textContent = 'Could not save this note. Check that the shared notes server is running.';
    } finally {
      submit.disabled = false;
    }
  }

  async function loadNotes(announce = false, quiet = false) {
    if (!quiet) status.textContent = 'Loading shared notes…';
    try {
      const url = new URL(apiBase, window.location.href);
      url.searchParams.set('path', pagePath);
      const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error(`The notes service returned ${response.status}.`);
      const payload = await response.json();
      state.notes = Array.isArray(payload.notes) ? payload.notes : [];
      state.notes.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      renderNotes();
      status.textContent = announce ? 'Shared notes refreshed.' : '';
    } catch (_) {
      status.textContent = 'Shared notes are unavailable. Start this site with its notes server to view or add feedback.';
      if (!state.notes.length) renderNotes();
    }
  }

  function renderNotes() {
    layer.replaceChildren();
    list.replaceChildren();
    empty.hidden = state.notes.length > 0;
    count.textContent = String(state.notes.length);
    count.setAttribute('aria-label', `${state.notes.length} ${state.notes.length === 1 ? 'note' : 'notes'}`);

    state.notes.forEach((note, index) => {
      const number = index + 1;
      const marker = element('button', 'sticky-note-marker');
      marker.type = 'button';
      marker.dataset.noteId = note.id;
      marker.setAttribute('aria-label', `Open site note ${number} by ${note.author}`);
      marker.setAttribute('aria-expanded', String(note.id === state.activeId));
      marker.innerHTML = `<span>${number}</span>`;
      marker.addEventListener('click', () => openNoteCard(note, number));
      layer.append(marker);

      const item = document.createElement('li');
      const button = element('button', 'sticky-notes-list-button');
      button.type = 'button';
      const numberEl = element('span', 'sticky-notes-list-number');
      numberEl.textContent = String(number);
      const copy = element('span', 'sticky-notes-list-copy');
      const message = document.createElement('strong');
      message.textContent = note.message;
      const meta = document.createElement('span');
      meta.textContent = `${note.author} · ${formatDate(note.createdAt)}`;
      copy.append(message, meta);
      button.append(numberEl, copy);
      button.addEventListener('click', () => focusNote(note, number));
      item.append(button);
      list.append(item);
    });
    positionMarkers();
  }

  function positionMarkers() {
    state.notes.forEach(note => {
      const marker = layer.querySelector(`[data-note-id="${escapeCss(note.id)}"]`);
      if (!marker) return;
      const point = resolvePoint(note.anchor);
      marker.style.left = `${point.x}px`;
      marker.style.top = `${point.y}px`;
    });
  }

  let positioningFrame = 0;
  function scheduleMarkerPositioning() {
    if (positioningFrame) return;
    positioningFrame = window.requestAnimationFrame(() => {
      positioningFrame = 0;
      positionMarkers();
    });
  }

  function resolvePoint(anchor = {}) {
    let target = null;
    try { target = anchor.selector ? document.querySelector(anchor.selector) : null; } catch (_) {}
    if (target) {
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          x: window.scrollX + rect.left + clamp(Number(anchor.xRatio), 0, 1) * rect.width,
          y: window.scrollY + rect.top + clamp(Number(anchor.yRatio), 0, 1) * rect.height
        };
      }
    }
    return {
      x: clamp(Number(anchor.documentXRatio), 0, 1) * document.documentElement.scrollWidth,
      y: clamp(Number(anchor.documentYRatio), 0, 1) * document.documentElement.scrollHeight
    };
  }

  function focusNote(note, number) {
    const point = resolvePoint(note.anchor);
    const top = Math.max(0, point.y - window.innerHeight * 0.35);
    window.scrollTo({ top, behavior: motion.matches ? 'auto' : 'smooth' });
    window.setTimeout(() => openNoteCard(note, number), motion.matches ? 0 : 420);
  }

  function openNoteCard(note, number) {
    state.activeId = note.id;
    noteCard.querySelector('[data-sticky-card-number]').textContent = `Note ${number}`;
    noteCard.querySelector('[data-sticky-card-author]').textContent = note.author;
    noteCard.querySelector('[data-sticky-card-message]').textContent = note.message;
    noteCard.querySelector('[data-sticky-card-date]').textContent = formatDate(note.createdAt);
    noteCard.hidden = false;
    layer.querySelectorAll('.sticky-note-marker').forEach(marker => marker.setAttribute('aria-expanded', String(marker.dataset.noteId === note.id)));
    const point = resolvePoint(note.anchor);
    positionFloating(noteCard, point.x - window.scrollX, point.y - window.scrollY);
    noteCard.querySelector('[data-sticky-card-close]').focus({ preventScroll: true });
  }

  function closeNoteCard() {
    if (noteCard.hidden) return;
    noteCard.hidden = true;
    state.activeId = null;
    layer.querySelectorAll('.sticky-note-marker').forEach(marker => marker.setAttribute('aria-expanded', 'false'));
  }

  function positionFloating(node, clientX, clientY) {
    const margin = 14;
    const preferredLeft = clientX + 18;
    const preferredTop = clientY + 18;
    const width = Math.min(330, window.innerWidth - margin * 2);
    node.style.left = `${clamp(preferredLeft, margin, window.innerWidth - width - margin)}px`;
    node.style.top = `${clamp(preferredTop, margin, Math.max(margin, window.innerHeight - 340))}px`;
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  function handleEscape(event) {
    if (event.key !== 'Escape') return;
    if (!composer.hidden) closeComposer();
    else if (state.placing) setPlacing(false);
    else if (!noteCard.hidden) closeNoteCard();
    else if (!panel.hidden) setPanel(false);
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(Number.isFinite(value) ? value : minimum, minimum), maximum);
  }
})();
