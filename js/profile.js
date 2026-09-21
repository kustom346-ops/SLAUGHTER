// ================================================================
// SLAUGHTER — PROFILE PAGE
// ================================================================

(function () {
  const STORAGE_KEY = 'slaughter_users';
  const SESSION_KEY = 'slaughter_session';

  // ===== УТИЛИТЫ =====
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  function hashPassword(pw) {
    let h = 0;
    for (let i = 0; i < pw.length; i++) {
      h = ((h << 5) - h) + pw.charCodeAt(i);
      h |= 0;
    }
    return 'h_' + Math.abs(h).toString(36) + '_' + pw.length;
  }

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

  const session = getSession();
  if (!session || !session.login) return;

  const users = getUsers();
  const user = users[session.login.toLowerCase()];

  if (!user) return;

  // ================================================================
  // ЗАПОЛНЕНИЕ ПРОФИЛЯ
  // ================================================================
  const nameEl = document.getElementById('profileName');
  const avatarLetter = document.getElementById('avatarLetter');
  const statCreated = document.getElementById('statCreated');
  const statDays = document.getElementById('statDays');
  const statLevel = document.getElementById('statLevel');

  if (nameEl) nameEl.textContent = user.login;

  if (avatarLetter) {
    avatarLetter.textContent = user.login.charAt(0).toUpperCase();
  }

  if (statCreated && user.created) {
    const d = new Date(user.created);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    statCreated.textContent = day + '.' + month + '.' + year;
  }

  if (statDays && user.created) {
    const days = Math.max(1, Math.floor((Date.now() - user.created) / (1000 * 60 * 60 * 24)));
    // Анимированный счётчик
    let current = 0;
    const step = Math.max(1, Math.ceil(days / 40));
    const iv = setInterval(function () {
      current += step;
      if (current >= days) {
        current = days;
        clearInterval(iv);
      }
      statDays.textContent = current;
    }, 25);
  }

  if (statLevel && user.created) {
    const days = Math.floor((Date.now() - user.created) / (1000 * 60 * 60 * 24));
    const level = Math.min(99, 1 + Math.floor(days / 3));
    statLevel.textContent = level;
  }

  // ================================================================
  // СМЕНА ПАРОЛЯ
  // ================================================================
  const modal = document.getElementById('passwordModal');
  const changePassBtn = document.getElementById('changePassBtn');
  const modalClose = document.getElementById('modalClose');
  const passwordForm = document.getElementById('passwordForm');
  const passError = document.getElementById('passError');

  function openModal() {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (passwordForm) passwordForm.reset();
    if (passError) {
      passError.classList.remove('visible');
      passError.textContent = '';
    }
  }

  if (changePassBtn) {
    changePassBtn.addEventListener('click', openModal);
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

  function showPassError(msg) {
    if (!passError) return;
    passError.textContent = msg;
    passError.classList.add('visible');
    clearTimeout(passError._t);
    passError._t = setTimeout(function () {
      passError.classList.remove('visible');
    }, 4500);
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const current = passwordForm.current.value;
      const newPass = passwordForm.newPass.value;
      const newPass2 = passwordForm.newPass2.value;

      if (!current || current.length < 4) {
        showPassError('ТЕКУЩИЙ ПАРОЛЬ СЛИШКОМ КОРОТКИЙ');
        return;
      }

      if (hashPassword(current) !== user.password) {
        showPassError('НЕВЕРНЫЙ ТЕКУЩИЙ ПАРОЛЬ');
        return;
      }

      if (!newPass || newPass.length < 4) {
        showPassError('НОВЫЙ ПАРОЛЬ МИНИМУМ 4 СИМВОЛА');
        return;
      }

      if (newPass !== newPass2) {
        showPassError('НОВЫЕ ПАРОЛИ НЕ СОВПАДАЮТ');
        return;
      }

      if (newPass === current) {
        showPassError('НОВЫЙ ПАРОЛЬ СОВПАДАЕТ СО СТАРЫМ');
        return;
      }

      // Обновление
      const freshUsers = getUsers();
      const key = user.login.toLowerCase();
      if (freshUsers[key]) {
        freshUsers[key].password = hashPassword(newPass);
        saveUsers(freshUsers);
      }

      // Успех
      passError.textContent = '✓ ПАРОЛЬ ОБНОВЛЁН';
      passError.style.color = '#2bff6a';
      passError.classList.add('visible');

      setTimeout(function () {
        passError.style.color = '';
        closeModal();
      }, 1500);
    });
  }

  // ================================================================
  // ВЫЙТИ
  // ================================================================
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.setItem('slaughter_logout', '1');
      window.location.href = 'auth.html';
    });
  }

})();