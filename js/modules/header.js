/* ==========================================================================
   Melia · Header
   - Cristal más opaco al hacer scroll (IntersectionObserver, sin scroll listener)
   - Menú móvil accesible (aria-expanded, Esc, clic fuera)
   - Enlace activo según la sección visible (scroll spy)
   ========================================================================== */
(function (Melia) {
  'use strict';

  const { $, $$ } = Melia.utils;
  const DESKTOP_QUERY = window.matchMedia('(min-width: 1024px)');

  let header = null;
  let toggle = null;
  let mobileNav = null;

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    $('.sr-only', toggle).textContent = open ? 'Cerrar menú' : 'Abrir menú';
  }

  function isMenuOpen() {
    return header.classList.contains('is-open');
  }

  function watchScrollState() {
    // Un centinela invisible al inicio de la página: cuando sale de vista, el header se solidifica
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:80px;pointer-events:none;';
    document.body.prepend(sentinel);

    new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }).observe(sentinel);
  }

  function watchActiveSection() {
    const links = $$('.site-nav__link');
    const sections = links
      .map((link) => document.getElementById(link.hash.slice(1)))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const active = link.hash === '#' + entry.target.id;
            link.classList.toggle('is-active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function init() {
    header = $('[data-header]');
    if (!header) return;
    toggle = $('[data-menu-toggle]', header);
    mobileNav = $('[data-mobile-nav]', header);

    watchScrollState();
    watchActiveSection();

    if (!toggle || !mobileNav) return;

    toggle.addEventListener('click', () => setMenu(!isMenuOpen()));

    mobileNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isMenuOpen()) {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (isMenuOpen() && !header.contains(event.target)) setMenu(false);
    });

    DESKTOP_QUERY.addEventListener('change', (event) => {
      if (event.matches && isMenuOpen()) setMenu(false);
    });
  }

  Melia.header = { init };
})(window.Melia = window.Melia || {});
