// ================================================================
// SLAUGHTER — UI SCRIPTS v2
// ================================================================

// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ===== BURGER =====
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ================================================================
// 🔥 PAGE TRANSITION — переход между страницами
// ================================================================
const transition = document.getElementById('page-transition');

document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
  if (!href.endsWith('.html')) return;

  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (!transition) {
      window.location.href = href;
      return;
    }

    transition.classList.add('active');

    setTimeout(() => {
      window.location.href = href;
    }, 550);
  });
});

// Скрываем шторку при загрузке новой страницы
window.addEventListener('load', () => {
  if (transition) {
    setTimeout(() => {
      transition.classList.remove('active');
    }, 100);
  }
});

// ===== REVEAL ON SCROLL =====
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 100);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== DOWNLOAD BUTTON =====
const dlBtn = document.getElementById('dlBtn');
if (dlBtn) {
  dlBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const original = dlBtn.innerHTML;
    dlBtn.style.pointerEvents = 'none';
    dlBtn.innerHTML = 'PREPARING...';
    setTimeout(() => {
      dlBtn.innerHTML = '✓ DOWNLOAD STARTED';
      dlBtn.style.background = '#2bff6a';
      dlBtn.style.color = '#050506';
      setTimeout(() => {
        dlBtn.innerHTML = original;
        dlBtn.style.background = '';
        dlBtn.style.color = '';
        dlBtn.style.pointerEvents = '';
      }, 2000);
    }, 900);
  });
}

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ===== PARALLAX TITLE =====
let mouseX = 0, mouseY = 0;
let currentX = 0, currentY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 16;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 16;
});

function updateTitleParallax() {
  currentX += (mouseX - currentX) * 0.08;
  currentY += (mouseY - currentY) * 0.08;

  document.querySelectorAll('.title, .page-title').forEach(t => {
    t.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  });

  requestAnimationFrame(updateTitleParallax);
}
updateTitleParallax();

// ================================================================
// HIDE LOADER — с учётом warp-флага
// ================================================================
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const cameFromWarp = sessionStorage.getItem('slaughter_warp') === '1';

  setTimeout(() => {
    loader.classList.add('hidden');
  }, cameFromWarp ? 100 : 900);
});

// ================================================================
// REVEAL-IN + WELCOME OVERLAY — только после warp-перехода
// ================================================================
(function () {
  const cameFromWarp = sessionStorage.getItem('slaughter_warp') === '1';

  if (!cameFromWarp) return;

  // Убираем флаг — используется один раз
  sessionStorage.removeItem('slaughter_warp');

  // 🔥 Blur-in эффект для контента
  document.body.classList.add('reveal-in');
  setTimeout(() => {
    document.body.classList.remove('reveal-in');
  }, 2200);

  // 🔥 Welcome overlay
  const overlay = document.getElementById('welcome-overlay');
  const nameEl = document.getElementById('welcomeName');

  if (overlay && nameEl) {
    let login = '';
    try {
      const session = JSON.parse(
        localStorage.getItem('slaughter_session') ||
        sessionStorage.getItem('slaughter_session') ||
        'null'
      );
      if (session && session.login) login = session.login;
    } catch (e) {}

    if (login) nameEl.textContent = login;

    setTimeout(() => overlay.classList.add('active'), 400);

    setTimeout(() => {
      overlay.classList.add('dismiss');
      setTimeout(() => overlay.remove(), 1200);
    }, 2600);
  }
})();

// ===== SMOOTH SCROLL для якорей =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});