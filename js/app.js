/* ============================================================
   CYATAM — ABB System Hardening Portal
   JavaScript principal
   ============================================================ */

// ---- Navigation ----
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const searchInput = document.getElementById('searchInput');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const overlay = document.getElementById('overlay');

function showPage(id) {
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
    document.querySelector('.main-content').scrollTo(0, 0);
  }
  const link = document.querySelector(`.nav-link[data-page="${id}"]`);
  if (link) link.classList.add('active');
  // Animate progress bars if any
  setTimeout(animateProgressBars, 100);
}

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const page = link.dataset.page;
    if (page) {
      showPage(page);
      if (window.innerWidth <= 900) closeSidebar();
    }
  });
});

// ---- Mobile Menu ----
menuToggle?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
});

overlay?.addEventListener('click', closeSidebar);

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

// ---- Search ----
searchInput?.addEventListener('input', function() {
  const q = this.value.toLowerCase().trim();
  if (!q) {
    navLinks.forEach(l => l.parentElement.classList.remove('hidden'));
    return;
  }
  navLinks.forEach(link => {
    const text = link.textContent.toLowerCase();
    link.parentElement.classList.toggle('hidden', !text.includes(q));
  });
});

// ---- Copy Button ----
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pre = btn.closest('.code-block').querySelector('pre code');
    if (!pre) return;
    navigator.clipboard.writeText(pre.textContent).then(() => {
      const orig = btn.textContent;
      btn.textContent = '✓ Copiado';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 2000);
    });
  });
});

// ---- Animate Progress Bars ----
function animateProgressBars() {
  document.querySelectorAll('.page.active .progress-fill').forEach(fill => {
    const target = fill.dataset.width || '0';
    fill.style.width = target + '%';
  });
}

// ---- Keyboard Navigation ----
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSidebar();
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput?.focus();
  }
});

// ---- Init ----
showPage('page-overview');
