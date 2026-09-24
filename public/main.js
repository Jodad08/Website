// Theme toggle, scroll reveals, footer year. No dependencies.
(function () {
  var root = document.documentElement;

  // Theme: follows the system until the visitor picks one, then remembers it.
  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Reveal sections as they enter the viewport. Siblings stagger by index.
  var items = document.querySelectorAll('.reveal');
  items.forEach(function (el) {
    var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal') : [];
    var n = Array.prototype.indexOf.call(siblings, el);
    if (n > 0) el.style.setProperty('--n', String(n));
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Transparent nav while the hero photo is behind it.
  var nav = document.querySelector('.nav');
  var heroEnd = document.querySelector('.hero-end');
  if (nav && heroEnd && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      nav.classList.toggle('over-hero', e.isIntersecting || e.boundingClientRect.top > nav.offsetHeight);
    }, { rootMargin: '-64px 0px 0px 0px' }).observe(heroEnd);
  }

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
