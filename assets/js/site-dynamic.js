/**
 * Building Insights Together - Dynamic Tech Interactions & Abstract Canvas
 * Inspired by modern computational design (OpenAI, Palantir Foundry/Apollo)
 */

(function () {
  'use strict';

  // 1. Interactive Abstract Mesh / Lattice Canvas for Hero
  function initDynamicCanvas() {
    const canvasContainers = document.querySelectorAll('.bit-hero-canvas-container');
    if (!canvasContainers.length) return;

    canvasContainers.forEach((container) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'bit-hero-canvas';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let width = (canvas.width = container.offsetWidth);
      let height = (canvas.height = container.offsetHeight);

      let mouse = { x: width * 0.5, y: height * 0.5, targetX: width * 0.5, targetY: height * 0.5 };
      let points = [];
      const numPoints = Math.min(Math.floor((width * height) / 14000), 55);

      for (let i = 0; i < numPoints; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          baseRadius: Math.random() * 1.6 + 1.0,
          phase: Math.random() * Math.PI * 2,
        });
      }

      function onResize() {
        width = canvas.width = container.offsetWidth;
        height = canvas.height = container.offsetHeight;
      }
      window.addEventListener('resize', onResize);

      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.targetX = e.clientX - rect.left;
        mouse.targetY = e.clientY - rect.top;
      });

      let animationFrame;
      let lastTime = 0;

      function render(time) {
        // Smooth mouse damping
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < points.length; i++) {
          const p1 = points[i];
          p1.x += p1.vx;
          p1.y += p1.vy;

          if (p1.x < 0 || p1.x > width) p1.vx *= -1;
          if (p1.y < 0 || p1.y > height) p1.vy *= -1;

          // Connect nearby points
          for (let j = i + 1; j < points.length; j++) {
            const p2 = points[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
              const alpha = (1 - dist / 150) * 0.16;
              ctx.strokeStyle = `rgba(127, 195, 224, ${alpha})`;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }

          // Mouse proximity force / highlight
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 180) {
            const mAlpha = (1 - mdist / 180) * 0.35;
            ctx.strokeStyle = `rgba(217, 142, 160, ${mAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }

          // Draw node
          const pulsing = p1.baseRadius + Math.sin(time * 0.002 + p1.phase) * 0.5;
          ctx.fillStyle = 'rgba(206, 218, 229, 0.7)';
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, Math.max(0.5, pulsing), 0, Math.PI * 2);
          ctx.fill();
        }

        animationFrame = requestAnimationFrame(render);
      }

      animationFrame = requestAnimationFrame(render);
    });
  }

  // 2. Interactive Product Tab Switcher (Forge vs Core)
  function initProductTabs() {
    const tabTriggers = document.querySelectorAll('.bit-tab-trigger');
    const tabPanels = document.querySelectorAll('.bit-tab-panel');

    if (!tabTriggers.length || !tabPanels.length) return;

    tabTriggers.forEach((trigger) => {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-target');

        tabTriggers.forEach((t) => t.classList.remove('active'));
        tabPanels.forEach((p) => p.classList.remove('active'));

        this.classList.add('active');
        const activePanel = document.getElementById(targetId);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      });
    });
  }

  // 3. Smooth scroll for anchor navigation
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // DOM ready init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initDynamicCanvas();
      initProductTabs();
      initAnchorScroll();
    });
  } else {
    initDynamicCanvas();
    initProductTabs();
    initAnchorScroll();
  }
})();
