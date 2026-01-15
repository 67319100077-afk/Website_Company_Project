// mobile.js — small helpers for mobile UX
// Include after bootstrap bundle and after your existing main.js/products.js

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // 1) Collapse navbar when a link is clicked (mobile)
    try {
      var bsCollapseEl = document.querySelector('.navbar-collapse');
      if (bsCollapseEl) {
        var bsCollapse = new bootstrap.Collapse(bsCollapseEl, { toggle: false });
        document.querySelectorAll('.navbar-collapse .nav-link').forEach(function (lnk) {
          lnk.addEventListener('click', function () {
            // only collapse if toggler is visible
            var toggler = document.querySelector('.navbar-toggler');
            if (toggler && window.getComputedStyle(toggler).display !== 'none') {
              bsCollapse.hide();
            }
          });
        });
      }
    } catch (e) {
      // silent
      console.warn('mobile.js: navbar collapse helper failed', e);
    }

    // 2) Add mobile-fullscreen fallback attribute to modal-dialogs if not using bootstrap's class
    try {
      var addMobileFullscreen = function (dialog) {
        if (!dialog) return;
        if (!dialog.classList.contains('modal-fullscreen-sm-down')) {
          dialog.setAttribute('data-mobile-fullscreen', 'true');
        }
      };
      // productModal and announcement modal (if present)
      addMobileFullscreen(document.querySelector('#productModal .modal-dialog'));
      addMobileFullscreen(document.querySelector('.announcement-modal .modal-dialog'));
    } catch (e) {
      console.warn('mobile.js: modal fallback failed', e);
    }

    // 3) Improve focus behavior when modals open on mobile (scroll to top of modal)
    try {
      document.querySelectorAll('.modal').forEach(function (m) {
        m.addEventListener('shown.bs.modal', function () {
          // on small screens, ensure body scroll position is at top of modal content
          if (window.innerWidth <= 768) {
            var mo = m.querySelector('.modal-body');
            if (mo) mo.scrollTop = 0;
            // Focus first focusable control for accessibility
            var first = m.querySelector('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
            if (first) setTimeout(function () { first.focus(); }, 120);
          }
        });
      });
    } catch (e) {
      // ignore
    }

    // 4) Optional: add passive touch listeners to improve scroll performance on some devices
    try {
      ['touchstart', 'touchmove'].forEach(function (evt) {
        window.addEventListener(evt, function () {}, { passive: true });
      });
    } catch (e) {}

  }, false);
})();