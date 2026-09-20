// Apply the saved visual direction before the page paints.
(() => {
  try {
    const saved = JSON.parse(localStorage.getItem('bit-review-view-v1') || '{}');
    if (['street', 'canopy', 'plan'].includes(saved.visual)) document.documentElement.dataset.cityVisual = saved.visual;
    if (['canopy', 'estuary', 'terracotta', 'graphite'].includes(saved.palette)) document.documentElement.dataset.palette = saved.palette;
    if (["civic-frame", "neighbourhood-ii", "shared-structure", "assembly", "public-square", "open-charter", "open-frame", "neighbourhood"].includes(saved.logo)) document.documentElement.dataset.logo = saved.logo;
  } catch (_) { /* Defaults remain available when browser storage is unavailable. */ }
})();
