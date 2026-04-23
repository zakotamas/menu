/**
 * menu.js — Radial / Pie Menu Logic
 *
 * Responsibilities:
 *  1. Toggle open/close on center button click or tap
 *  2. Close when clicking/tapping outside the menu
 *  3. Close on Escape key
 *  4. Wire up item click handlers (placeholder — replace with your routing/navigation)
 *  5. Sync aria-expanded for accessibility
 *  6. Attach tooltip labels from each button's aria-label / alt text
 */

(function () {
  'use strict';

  /* ── Element references ──────────────────────────────────── */
  const menu      = document.getElementById('radialMenu');
  const toggle    = document.getElementById('menuToggle');
  const itemsList = document.getElementById('menuItems');
  const itemBtns  = itemsList.querySelectorAll('.item-btn');

  /* ── State ───────────────────────────────────────────────── */
  let isOpen = false;

  /* ── Helpers ─────────────────────────────────────────────── */

  /**
   * Open the radial menu.
   * Adds the `is-open` class (CSS handles all animations).
   */
  function openMenu() {
    isOpen = true;
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    itemsList.removeAttribute('hidden');
    // Announce to screen readers
    toggle.setAttribute('aria-label', 'Close product menu');
  }

  /**
   * Close the radial menu.
   */
  function closeMenu() {
    isOpen = false;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open product menu');
  }

  /**
   * Toggle between open/closed states.
   */
  function toggleMenu() {
    isOpen ? closeMenu() : openMenu();
  }

  /* ── Populate tooltip data-labels from img alt text ─────── */
  /**
   * Each `.item-btn::after` pseudo-element reads `attr(data-label)`.
   * We pull the text from the <img alt="…"> inside each button and
   * set it as `data-label` so CSS can display it.
   */
  itemBtns.forEach(function (btn) {
    const img   = btn.querySelector('img');
    const label = img ? img.getAttribute('alt') : '';
    if (label) btn.setAttribute('data-label', label);
  });

  /* ── Event: Center button click / tap ────────────────────── */
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMenu();
  });

  /* ── Event: Item button click / tap ─────────────────────── */
  /**
   * Replace the body of this handler with your own navigation /
   * routing logic (e.g. window.location.href, router.push, etc.).
   */
  itemBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const label = btn.getAttribute('data-label') || btn.querySelector('img')?.alt || 'Item';
      console.log('[RadialMenu] Selected:', label);
      // ── YOUR NAVIGATION CODE HERE ──────────────────────────
      // Example: window.location.href = `/products/${label.toLowerCase().replace(' ', '-')}`;
      // ──────────────────────────────────────────────────────

      // Optional: close menu after selection
      closeMenu();
    });
  });

  /* ── Event: Click / tap outside → close ─────────────────── */
  document.addEventListener('click', function (e) {
    if (isOpen && !menu.contains(e.target)) {
      closeMenu();
    }
  });

  /* ── Event: Touch outside (explicit for iOS Safari) ─────── */
  document.addEventListener('touchstart', function (e) {
    if (isOpen && !menu.contains(e.target)) {
      closeMenu();
    }
  }, { passive: true });

  /* ── Event: Escape key → close ──────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
      toggle.focus(); // return focus to trigger
    }
  });

  /* ── Keyboard navigation within open menu ────────────────── */
  /**
   * Arrow keys cycle through item buttons when the menu is open.
   * Tab / Shift-Tab also work naturally since items are in DOM order.
   */
  itemBtns.forEach(function (btn, index) {
    btn.addEventListener('keydown', function (e) {
      if (!isOpen) return;

      const total = itemBtns.length;
      let next = -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (index + 1) % total;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (index - 1 + total) % total;
      } else if (e.key === 'Home') {
        next = 0;
      } else if (e.key === 'End') {
        next = total - 1;
      }

      if (next >= 0) {
        e.preventDefault();
        itemBtns[next].focus();
      }
    });
  });

  /* ── Responsive: recalculate on orientation change ───────── */
  /**
   * CSS handles sizing via clamp() / vmin, so no JS resize math needed.
   * We only need to close the menu on a significant viewport change to
   * avoid items appearing off-screen during device rotation.
   */
  let lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    const newW = window.innerWidth;
    // Only close if width changed meaningfully (orientation change)
    if (Math.abs(newW - lastW) > 80 && isOpen) {
      closeMenu();
    }
    lastW = newW;
  });

  /* ── Touch: prevent 300ms tap delay on modern browsers ───── */
  /**
   * `touch-action: manipulation` in CSS is sufficient in modern browsers,
   * but we also prevent double-tap zoom on the menu area explicitly.
   */
  menu.addEventListener('touchend', function (e) {
    e.preventDefault(); // prevents ghost click delay
    // Re-dispatch as click so our click handlers fire immediately
    e.target.closest('button')?.click();
  }, { passive: false });

  /* ── Initialise ──────────────────────────────────────────── */
  // Ensure menu starts closed and aria state is correct
  closeMenu();

})();
