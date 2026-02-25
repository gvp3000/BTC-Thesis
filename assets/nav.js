/**
 * nav.js — Shared navigation for all pages
 *
 * How it works:
 *  1. Reads pages.json to get all pages and sections
 *  2. Builds the sidebar nav dynamically
 *  3. Highlights the active page based on current URL
 *  4. Handles relative paths (works from any subfolder depth)
 *  5. Logo links back to index.html (homepage)
 *
 * To add a new page to the nav: edit pages.json only.
 * This file never needs to change unless you want to change nav behavior.
 */

(function () {
  // ── Determine root path (handles pages in subfolders) ───────────────────
  function getRootPath() {
    const path = window.location.pathname;
    // Count directory depth from root
    const parts = path.replace(/\/$/, '').split('/').filter(Boolean);
    // GitHub Pages: /repo-name/folder/file.html = depth 2+
    // Find index.html location by going up to where assets/ lives
    // We embed a data attribute on the script tag: data-root="../"
    const scriptEl = document.querySelector('script[src*="nav.js"]');
    if (scriptEl && scriptEl.dataset.root) return scriptEl.dataset.root;
    return './';
  }

  const ROOT = getRootPath();

  // ── Fetch pages.json and build nav ──────────────────────────────────────
  fetch(ROOT + 'assets/pages.json')
    .then(r => r.json())
    .then(data => buildNav(data))
    .catch(() => {
      // Fallback: render minimal nav if fetch fails (e.g. opening file:// locally)
      console.warn('nav.js: Could not load pages.json. Open via a local server or GitHub Pages.');
    });

  function buildNav(data) {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const currentPath = window.location.pathname;

    let html = `
      <a href="${ROOT}index.html" class="nav-logo" style="text-decoration:none; color:inherit; cursor:pointer;">
        <div class="nav-logo-eyebrow">research</div>
        <div class="nav-logo-title">BTC<br/><span>THESIS</span></div>
      </a>
    `;

    data.sections.forEach(section => {
      html += `<div class="nav-section-label">${section.label}</div>`;

      section.pages.forEach(page => {
        const href = ROOT + page.file;
        const isActive = currentPath.endsWith(page.file) || currentPath.endsWith(page.file.replace('.html', ''));
        const activeClass = isActive ? ' active' : '';

        let badge = '';
        if (page.badge) {
          badge = `<span class="nav-badge ${page.badgeColor || 'dim'}">${page.badge}</span>`;
        }

        html += `
          <a class="nav-link${activeClass}" href="${href}">
            <span class="nav-dot"></span>
            ${page.title}
            ${badge}
          </a>
        `;
      });
    });

    nav.innerHTML = html;
  }
})();
