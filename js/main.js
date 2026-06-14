/* ════════════════════════════════════════════════
   MAIN.JS — Lógica interactiva del portfolio
   Módulos: typewriter · reveal · counters ·
            skill bars · active nav · mobile nav ·
            scroll progress
   ════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {


  /* ══════════════════════════════════════════════
     1. TYPEWRITER — roles animados en el hero
  ══════════════════════════════════════════════ */
  const roles = [
    'Técnico en Programación',
    'IT Support Technician',
    'Desarrollador Junior',
    'Soporte & Hardware',
    'Full-Stack Learner',
  ];

  const el      = document.getElementById('typewriter');
  let   ri      = 0;    /* índice de rol actual */
  let   ci      = 0;    /* índice de carácter */
  let   typing  = true; /* true = escribiendo, false = borrando */
  let   pause   = 0;    /* frames de pausa entre ciclos */

  function tick() {
    if (!el) return;

    if (pause > 0) {
      pause--;
      setTimeout(tick, 80);
      return;
    }

    if (typing) {
      /* Agrega un carácter */
      el.textContent = roles[ri].slice(0, ci + 1);
      ci++;
      if (ci === roles[ri].length) {
        /* Terminó de escribir → pausa antes de borrar */
        typing = false;
        pause  = 22;
        setTimeout(tick, 80);
      } else {
        setTimeout(tick, 85);
      }
    } else {
      /* Borra un carácter */
      el.textContent = roles[ri].slice(0, ci - 1);
      ci--;
      if (ci === 0) {
        /* Terminó de borrar → pasa al siguiente rol */
        typing = true;
        ri     = (ri + 1) % roles.length;
        pause  = 8;
        setTimeout(tick, 80);
      } else {
        setTimeout(tick, 48);
      }
    }
  }

  tick();


  /* ══════════════════════════════════════════════
     2. REVEAL — aparición de elementos al hacer scroll
  ══════════════════════════════════════════════ */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  /* Observar todos los elementos .reveal */
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });


  /* ══════════════════════════════════════════════
     3. COUNTERS — animación de números en hero stats
  ══════════════════════════════════════════════ */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const numEl  = entry.target;
        const target = parseInt(numEl.dataset.target, 10);
        const dur    = 1400;           /* duración total en ms */
        const step   = dur / target;

        let current = 0;

        const interval = setInterval(() => {
          current++;
          numEl.textContent = current;
          if (current >= target) {
            numEl.textContent = target;
            clearInterval(interval);
          }
        }, step);

        counterObserver.unobserve(numEl);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    counterObserver.observe(el);
  });


  /* ══════════════════════════════════════════════
     4. SKILL BARS — animación de barras al entrar en viewport
  ══════════════════════════════════════════════ */
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        /* Busca fills dentro del grupo que entró */
        entry.target.querySelectorAll('.skill-fill').forEach(fill => {
          const width = fill.dataset.width || '0';
          /* Delay escalonado según posición en el grupo */
          const idx = [...fill.closest('.skill-list').querySelectorAll('.skill-fill')].indexOf(fill);
          setTimeout(() => {
            fill.style.width = width + '%';
          }, idx * 100);
        });

        skillObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('.skill-group').forEach(group => {
    skillObserver.observe(group);
  });


  /* ══════════════════════════════════════════════
     5. ACTIVE NAV — resaltar link activo según sección visible
  ══════════════════════════════════════════════ */
  const sections  = document.querySelectorAll('.section[id]');
  const navLinks  = document.querySelectorAll('.nav-link[data-section]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;

        navLinks.forEach(link => {
          link.classList.remove('active-link');
          if (link.dataset.section === id) {
            link.classList.add('active-link');
          }
        });
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(s => sectionObserver.observe(s));


  /* ══════════════════════════════════════════════
     6. SCROLL PROGRESS — barra en el sidebar
  ══════════════════════════════════════════════ */
  const scrollBar = document.getElementById('scrollBar');

  window.addEventListener('scroll', () => {
    if (!scrollBar) return;

    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    scrollBar.style.height = Math.min(pct, 100) + '%';
  }, { passive: true });


  /* ══════════════════════════════════════════════
     7. MOBILE NAV — toggle del sidebar en pantallas pequeñas
  ══════════════════════════════════════════════ */
  const navToggle = document.getElementById('navToggle');
  const sidebar   = document.getElementById('sidebar');

  if (navToggle && sidebar) {

    /* Abrir / cerrar sidebar */
    navToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      navToggle.classList.toggle('active');
    });

    /* Cerrar al hacer click en un link (mobile UX) */
    sidebar.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });

    /* Cerrar al hacer click fuera del sidebar */
    document.addEventListener('click', (e) => {
      const clickedOutside = !sidebar.contains(e.target) && !navToggle.contains(e.target);
      if (clickedOutside && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        navToggle.classList.remove('active');
      }
    });
  }


  /* ══════════════════════════════════════════════
     8. SMOOTH SCROLL — anclajes internos
  ══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });


  /* ══════════════════════════════════════════════
     9. TIMELINE DOTS — entrada escalonada
  ══════════════════════════════════════════════ */
  const tlObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const items = entry.target.querySelectorAll('.tl-item');
        items.forEach((item, i) => {
          setTimeout(() => {
            item.style.opacity    = '1';
            item.style.transform  = 'translateX(0)';
          }, i * 150);
        });

        tlObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  /* Inicializar estado oculto de timeline items */
  document.querySelectorAll('.tl-item').forEach(item => {
    item.style.opacity   = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  const timeline = document.querySelector('.timeline');
  if (timeline) tlObserver.observe(timeline);


  /* ══════════════════════════════════════════════
     10. NAV TOGGLE — animación hamburger → X
  ══════════════════════════════════════════════ */
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const spans = navToggle.querySelectorAll('span');
      const isOpen = navToggle.classList.contains('active');

      if (isOpen) {
        /* Animación a hamburger */
        spans[0].style.transform  = '';
        spans[1].style.opacity    = '';
        spans[2].style.transform  = '';
      } else {
        /* Animación a X */
        spans[0].style.transform  = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity    = '0';
        spans[2].style.transform  = 'translateY(-7px) rotate(-45deg)';
      }
    });
  }


});
