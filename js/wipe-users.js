// ================================================================
// SLAUGHTER — РАЗОВЫЙ СНОС ВСЕХ ЮЗЕРОВ
// ⚠️ Этот файл нужен ОДИН РАЗ. После сноса — удали его.
// ================================================================

(function () {
  console.log('%c💥 SLAUGHTER: снос всех юзеров', 'color:#ff2b2b;font-weight:bold;font-size:16px');

  // Список ключей для сноса
  const keys = [
    'slaughter_users',
    'slaughter_session',
    'slaughter_warp',
    'slaughter_app_version',
    'slaughter_redirect_guard',
    'slaughter_auth_loop_guard',
    'slaughter_guard_loop_guard',
    'slaughter_auth_loop',
    'slaughter_logout',
    'slaughter_force_logout',
    'slaughter_data_reset',
  ];

  keys.forEach(function (key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // Страховка — сносим все ключи, начинающиеся с slaughter_
  Object.keys(localStorage).forEach(function (k) {
    if (k.indexOf('slaughter_') === 0) localStorage.removeItem(k);
  });
  Object.keys(sessionStorage).forEach(function (k) {
    if (k.indexOf('slaughter_') === 0) sessionStorage.removeItem(k);
  });

  console.log('%c✅ Все данные снесены', 'color:#2bff6a;font-weight:bold;font-size:14px');
  console.log('👉 Теперь удали файл js/wipe-users.js и убери его подключение из HTML.');

  // Редирект на регистрацию
  if (window.location.pathname.indexOf('auth.html') === -1) {
    setTimeout(function () {
      window.location.href = 'auth.html';
    }, 300);
  }
})();