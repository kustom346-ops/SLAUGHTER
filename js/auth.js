// ================================================================
// SLAUGHTER — AUTH SYSTEM
// ================================================================

(function () {
  const STORAGE_KEY = 'slaughter_users';
  const SESSION_KEY = 'slaughter_session';

  // ================================================================
  // ХРАНИЛИЩЕ
  // ================================================================
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

  // ================================================================
  // СЕССИЯ
  // ================================================================
  function setSession(login, remember) {
    const data = {
      login: login,
      time: Date.now(),
      remember: !!remember
    };
    if (remember) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
      localStorage.removeItem(SESSION_KEY);
    }
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

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  window.SlaughterAuth = {
    getUsers: getUsers,
    saveUsers: saveUsers,
    hashPassword: hashPassword,
    setSession: setSession,
    getSession: getSession,
    clearSession: clearSession
  };

  // ================================================================
  // СКРЫТИЕ ЛОАДЕРА
  // ================================================================
  function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 900);
  } else {
    window.addEventListener('load', function () {
      setTimeout(hideLoader, 900);
    });
  }
  setTimeout(hideLoader, 2500);

  // ================================================================
  // WARP TRANSITION
  // ================================================================
  function playWarpTransition(targetUrl) {
    const warp = document.getElementById('warp-transition');

    if (!warp) {
      window.location.href = targetUrl;
      return;
    }

    // 🔥 Флаг что пришли через warp
    sessionStorage.setItem('slaughter_warp', '1');

    warp.classList.add('active');

    setTimeout(function () {
      window.location.href = targetUrl;
    }, 1400);
  }

  // ================================================================
  // AUTH LOGIC — только для auth.html
  // ================================================================
  const authCard = document.getElementById('authCard');
  if (!authCard) return;

  if (getSession()) {
    window.location.href = 'index.html';
    return;
  }

  const tabs = document.querySelectorAll('.auth-tab');
  const tabsWrap = document.querySelector('.auth-tabs');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginError = document.getElementById('loginError');
  const registerError = document.getElementById('registerError');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.dataset.tab;

      tabs.forEach(function (t) {
        t.classList.toggle('active', t === tab);
      });

      if (tabsWrap) tabsWrap.dataset.active = target;

      loginForm.classList.toggle('active', target === 'login');
      registerForm.classList.toggle('active', target === 'register');

      loginError.classList.remove('visible');
      registerError.classList.remove('visible');
    });
  });

  function showError(el, message) {
    if (!el) return;
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(el._timeout);
    el._timeout = setTimeout(function () {
      el.classList.remove('visible');
    }, 4500);
  }

  function markError(input) {
    if (!input) return;
    input.classList.add('error');
    setTimeout(function () {
      input.classList.remove('error');
    }, 600);
  }

  // LOGIN
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const form = e.target;
    const login = form.login.value.trim();
    const password = form.password.value;
    const remember = form.remember.checked;

    if (!login || login.length < 3) {
      showError(loginError, 'ЛОГИН СЛИШКОМ КОРОТКИЙ');
      markError(form.login);
      return;
    }

    if (!password || password.length < 4) {
      showError(loginError, 'ПАРОЛЬ СЛИШКОМ КОРОТКИЙ');
      markError(form.password);
      return;
    }

    const users = getUsers();
    const userKey = login.toLowerCase();

    if (!users[userKey]) {
      showError(loginError, 'ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН');
      markError(form.login);
      return;
    }

    if (users[userKey].password !== hashPassword(password)) {
      showError(loginError, 'НЕВЕРНЫЙ ПАРОЛЬ');
      markError(form.password);
      return;
    }

    setSession(login, remember);
    playWarpTransition('index.html');
  });

  // REGISTER
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const form = e.target;
    const login = form.login.value.trim();
    const password = form.password.value;
    const password2 = form.password2.value;

    if (!login || login.length < 3) {
      showError(registerError, 'ЛОГИН МИНИМУМ 3 СИМВОЛА');
      markError(form.login);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(login)) {
      showError(registerError, 'ТОЛЬКО A-Z, 0-9 И _');
      markError(form.login);
      return;
    }

    if (!password || password.length < 4) {
      showError(registerError, 'ПАРОЛЬ МИНИМУМ 4 СИМВОЛА');
      markError(form.password);
      return;
    }

    if (password !== password2) {
      showError(registerError, 'ПАРОЛИ НЕ СОВПАДАЮТ');
      markError(form.password2);
      return;
    }

    const users = getUsers();
    const userKey = login.toLowerCase();

    if (users[userKey]) {
      showError(registerError, 'ЛОГИН УЖЕ ЗАНЯТ');
      markError(form.login);
      return;
    }

    users[userKey] = {
      login: login,
      password: hashPassword(password),
      created: Date.now()
    };
    saveUsers(users);

    setSession(login, true);
    playWarpTransition('index.html');
  });

  [loginForm, registerForm].forEach(function (f) {
    f.querySelectorAll('input').forEach(function (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const submit = f.querySelector('.auth-submit');
          if (submit) submit.click();
        }
      });
    });
  });

})();