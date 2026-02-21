/* ═══════════════════════════════════════════════════════════════
   BTC THESIS — NAV BUILDER
   Reads pages.json, builds sidebar, highlights current page.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  // Resolve base path: root pages use "./assets/", subfolder pages use "../assets/"
  const depth = (window.location.pathname.match(/\//g) || []).length;
  const pathParts = window.location.pathname.split('/').filter(Boolean);

  // Detect if we're in a subfolder (thesis/, trading/, portfolio/, research/)
  const subfolders = ['thesis', 'trading', 'portfolio', 'research'];
  let base = './';
  for (const part of pathParts) {
    if (subfolders.includes(part)) { base = '../'; break; }
  }

  // Current filename for active state
  const currentPath = window.location.pathname;
  const currentFile = currentPath.split('/').slice(-1)[0] || 'index.html';

  function isActive(pageFile) {
    // Normalize: compare end of path
    if (currentPath.endsWith(pageFile)) return true;
    if (currentPath.endsWith('/' + pageFile)) return true;
    // Dashboard special case: index.html → dashboard.html
    if (currentFile === '' && pageFile === 'dashboard.html') return true;
    return false;
  }

  fetch(base + 'assets/pages.json')
    .then(r => r.json())
    .then(data => {
      let html = '';

      // Logo
      html += `<a class="nav-logo" href="${base}dashboard.html">`;
      html += `<div class="nav-logo-sub">private research</div>`;
      html += `<div class="nav-logo-name">BTC<br/><span>THESIS</span></div>`;
      html += `</a>`;

      // Sections
      for (const section of data.sections) {
        html += `<div class="nav-section">${section.label}</div>`;
        for (const page of section.pages) {
          const href = base + page.file;
          const active = isActive(page.file) ? ' active' : '';
          let badge = '';
          if (page.badge) {
            const cls = page.badgeColor === 'yellow' ? 'ty' : page.badgeColor === 'green' ? 'tg' : '';
            badge = `<span class="ntag ${cls}">${page.badge}</span>`;
          }
          html += `<a class="nav-item${active}" href="${href}"><span class="pip"></span>${page.title}${badge}</a>`;
        }
      }

      // Inject into .nav element
      const nav = document.querySelector('.nav');
      if (nav) nav.innerHTML = html;
    })
    .catch(err => console.warn('Nav load failed:', err));
})();
