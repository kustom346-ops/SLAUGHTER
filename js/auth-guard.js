// ================================================================
// SLAUGHTER — AUTH GUARD + NAV AVATAR
// ================================================================

(function () {
  const SESSION_KEY = 'slaughter_session';

  function getSession() {
    try {
      return JSON.parse(
        localStorage.getItem(SESSION_KEY) ||
        sessionStorage.getItem(SESSION_KEY) ||
        'null'
      );
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  const session = getSession();

  // ===== ЗАЩИТА =====
  if (!session || !session.login) {
    window.location.href = 'auth.html';
    return;
  }

  // ===== БЛОК ПРОФИЛЯ В НАВБАРЕ =====
  function injectUserBlock() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const existing = nav.querySelector('.nav-user');
    if (existing) existing.remove();

    const burger = nav.querySelector('.burger');
    const initial = session.login.charAt(0).toUpperCase();

    const userBlock = document.createElement('div');
    userBlock.className = 'nav-user';
    userBlock.innerHTML =
      '<button class="nav-avatar" id="navAvatar" aria-label="Профиль">' +
        '<span>' + initial + '</span>' +
        '<div class="nav-avatar-ring"></div>' +
      '</button>' +
      '<div class="nav-dropdown" id="navDropdown">' +
        '<div class="nav-dropdown-header">' +
          '<div class="nav-dropdown-avatar">' + initial + '</div>' +
          '<div class="nav-dropdown-info">' +
            '<div class="nav-dropdown-label">Вы вошли как</div>' +
            '<div class="nav-dropdown-name">' + escapeHtml(session.login) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="nav-dropdown-divider"></div>' +
        '<a href="profile.html" class="nav-dropdown-item">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
            '<circle cx="12" cy="7" r="4"/>' +
          '</svg>' +
          'Профиль' +
        '</a>' +
        '<a href="download.html" class="nav-dropdown-item">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
            '<polyline points="7 10 12 15 17 10"/>' +
            '<line x1="12" y1="15" x2="12" y2="3"/>' +
          '</svg>' +
          'Скачать' +
        '</a>' +
        '<div class="nav-dropdown-divider"></div>' +
        '<button class="nav-dropdown-item danger" id="navLogout">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>' +
            '<polyline points="16 17 21 12 16 7"/>' +
            '<line x1="21" y1="12" x2="9" y2="12"/>' +
          '</svg>' +
          'Выйти' +
        '</button>' +
      '</div>';

    if (burger) {
      nav.insertBefore(userBlock, burger);
    } else {
      nav.appendChild(userBlock);
    }

    // ===== ЛОГИКА DROPDOWN =====
    const avatar = document.getElementById('navAvatar');
    const dropdown = document.getElementById('navDropdown');
    const logout = document.getElementById('navLogout');

    if (avatar && dropdown) {
      avatar.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('open');
        avatar.classList.toggle('active');
      });

      document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target) && e.target !== avatar) {
          dropdown.classList.remove('open');
          avatar.classList.remove('active');
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          dropdown.classList.remove('open');
          avatar.classList.remove('active');
        }
      });
    }

    if (logout) {
      logout.addEventListener('click', function () {
        clearSession();
        window.location.href = 'auth.html';
      });
    }
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUserBlock);
  } else {
    injectUserBlock();
  }
})();