/**
 * Building Insights Together - Ambient Architectural Node Animation
 * Subtle, non-intrusive geometric network that overlays the photographic header
 */

(function () {
  'use strict';

  function initAmbientCanvas() {
    const heroParents = document.querySelectorAll('.elementor-element-cd2a19d, .elementor-element-aee314e');
    if (!heroParents.length) return;

    heroParents.forEach((parent) => {
      // Ensure parent position relative
      parent.style.position = 'relative';

      const canvas = document.createElement('canvas');
      canvas.className = 'bit-ambient-canvas';
      parent.insertBefore(canvas, parent.firstChild);

      const ctx = canvas.getContext('2d');
      let width = (canvas.width = parent.offsetWidth);
      let height = (canvas.height = parent.offsetHeight);

      let mouse = { x: width * 0.5, y: height * 0.5 };
      let nodes = [];
      const numNodes = Math.min(Math.floor((width * height) / 16000), 40);

      for (let i = 0; i < numNodes; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.5 + 1.0,
        });
      }

      function onResize() {
        width = canvas.width = parent.offsetWidth;
        height = canvas.height = parent.offsetHeight;
      }
      window.addEventListener('resize', onResize);

      parent.addEventListener('mousemove', (e) => {
        const rect = parent.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });

      function draw() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          n1.x += n1.vx;
          n1.y += n1.vy;

          if (n1.x < 0 || n1.x > width) n1.vx *= -1;
          if (n1.y < 0 || n1.y > height) n1.vy *= -1;

          // Connect nodes with delicate lines
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 140) {
              const alpha = (1 - dist / 140) * 0.18;
              ctx.strokeStyle = `rgba(206, 218, 229, ${alpha})`;
              ctx.lineWidth = 0.75;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
            }
          }

          // Node point
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        requestAnimationFrame(draw);
      }

      requestAnimationFrame(draw);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAmbientCanvas);
  } else {
    initAmbientCanvas();
  }
})();
