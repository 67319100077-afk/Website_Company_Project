// footer.js - small behaviors for footer: back-to-top and year injection
document.addEventListener('DOMContentLoaded', () => {
  // set year
  const yEl = document.getElementById('footerYear');
  if (yEl) yEl.textContent = new Date().getFullYear();

  // back-to-top behavior
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function checkScroll() {
    const show = window.scrollY > 320;
    btn.classList.toggle('show', show);
  }
  checkScroll();
  window.addEventListener('scroll', throttle(checkScroll, 150));

  // smooth scroll to top
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    btn.blur();
  });

  // simple throttle
  function throttle(fn, wait) {
    let t = 0;
    return function(...args) {
      const now = Date.now();
      if (now - t > wait) {
        t = now;
        fn.apply(this, args);
      }
    };
  }
});