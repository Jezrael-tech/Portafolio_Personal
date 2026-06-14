/* ════════════════════════════════════════════════
   PARTICLES.JS — Sistema de partículas hero
   Canvas 2D: nodos flotantes + líneas de conexión
   Estilo: código binario + nodos de red tech
   ════════════════════════════════════════════════ */

(function () {

  /* ── Espera a que el DOM esté listo ─────────── */
  document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx    = canvas.getContext('2d');

    /* Colores extraídos del design token */
    const C_PRIMARY = '#00d4ff';
    const C_VIOLET  = '#7b2ff7';

    /* ── Config central ────────────────────────── */
    const CFG = {
      count:        55,      /* cantidad de partículas */
      maxDist:      130,     /* distancia máxima para dibujar línea */
      speedMin:     0.15,
      speedMax:     0.5,
      radiusMin:    1,
      radiusMax:    2.5,
      linAlpha:     0.08,    /* opacidad base de las líneas */
      dotAlpha:     0.45,    /* opacidad base de los puntos */
      codeChars:    ['0','1','<','>','/','#','{','}','[',']','_','$'],
      codeProb:     0.12,    /* probabilidad de ser char en vez de círculo */
    };

    let W, H, particles = [];

    /* ── Redimensionar canvas al contenedor ────── */
    function resize() {
      const parent = canvas.parentElement;
      W = canvas.width  = parent.offsetWidth;
      H = canvas.height = parent.offsetHeight;
    }

    /* ── Constructor de partícula ──────────────── */
    function Particle() {
      this.reset();
    }

    Particle.prototype.reset = function () {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.vx   = (Math.random() - 0.5) * (CFG.speedMax - CFG.speedMin) * 2;
      this.vy   = (Math.random() - 0.5) * (CFG.speedMax - CFG.speedMin) * 2;
      this.r    = CFG.radiusMin + Math.random() * (CFG.radiusMax - CFG.radiusMin);

      /* Cada partícula elige: punto azul, punto violeta o char de código */
      const rnd = Math.random();
      if (rnd < CFG.codeProb) {
        this.type = 'char';
        this.char = CFG.codeChars[Math.floor(Math.random() * CFG.codeChars.length)];
        this.color = Math.random() < 0.5 ? C_PRIMARY : C_VIOLET;
        this.alpha = 0.12 + Math.random() * 0.18;
        this.fontSize = 8 + Math.random() * 6;
      } else {
        this.type  = 'dot';
        this.color = Math.random() < 0.65 ? C_PRIMARY : C_VIOLET;
        this.alpha = CFG.dotAlpha * (0.4 + Math.random() * 0.6);
      }
    };

    /* ── Actualizar posición ───────────────────── */
    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;

      /* Rebote en bordes */
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;

      this.x = Math.max(0, Math.min(W, this.x));
      this.y = Math.max(0, Math.min(H, this.y));
    };

    /* ── Dibujar partícula ─────────────────────── */
    Particle.prototype.draw = function () {
      ctx.save();
      ctx.globalAlpha = this.alpha;

      if (this.type === 'char') {
        /* Char de código: font Fira Code */
        ctx.fillStyle   = this.color;
        ctx.font        = `${this.fontSize}px "Fira Code", monospace`;
        ctx.fillText(this.char, this.x, this.y);
      } else {
        /* Punto con glow sutil */
        ctx.shadowColor  = this.color;
        ctx.shadowBlur   = 6;
        ctx.fillStyle    = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    /* ── Dibujar líneas entre partículas cercanas ─ */
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CFG.maxDist) {
            /* Alpha inversamente proporcional a distancia */
            const alpha = CFG.linAlpha * (1 - dist / CFG.maxDist);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle  = C_PRIMARY;
            ctx.lineWidth    = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    /* ── Inicializar partículas ─────────────────── */
    function init() {
      resize();
      particles = [];
      for (let i = 0; i < CFG.count; i++) {
        particles.push(new Particle());
      }
    }

    /* ── Loop de animación ─────────────────────── */
    function loop() {
      ctx.clearRect(0, 0, W, H);

      drawConnections();

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(loop);
    }

    /* ── Manejo de resize con debounce ─────────── */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        particles.forEach(p => p.reset());
      }, 200);
    });

    /* ── Interactividad: repulsar al mover mouse ── */
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      particles.forEach(p => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          /* Empuja suavemente la partícula */
          p.vx += (dx / d) * 0.5;
          p.vy += (dy / d) * 0.5;
          /* Limitar velocidad máxima */
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 2) {
            p.vx = (p.vx / speed) * 2;
            p.vy = (p.vy / speed) * 2;
          }
        }
      });
    });

    init();
    loop();
  });

})();
