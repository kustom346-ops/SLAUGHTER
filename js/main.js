// Основные функции SLAUGHTER

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Состояние авторизации =====
    let isAuthenticated = false;
    let currentUser = null;
    
    // ===== Статичный инвайт-код =====
    const STATIC_INVITE_CODE = 'SLAUGHTER-2026';
    
    // ===== База данных =====
    let usersDB = loadFromStorage('slaughter_users', []);
    
    // ===== Инициализация =====
    initSplashScreen();
    createCustomCursor();
    initScrollAnimations();
    initEventHandlers();
    initAuthModal();
    checkAutoLogin();
    
    // ===== Загрузка из localStorage =====
    function loadFromStorage(key, defaultValue) {
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Ошибка загрузки ' + key + ':', e);
                return defaultValue;
            }
        }
        return defaultValue;
    }
    
    // ===== Сохранение в localStorage =====
    function saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    
    // ===== Функции для работы с пользователями =====
    function findUser(username) {
        return usersDB.find(user => user.username.toLowerCase() === username.toLowerCase());
    }
    
    function findUserById(userId) {
        return usersDB.find(user => user.id === userId);
    }
    
    function addUser(username, password) {
        const newUser = {
            id: Date.now(),
            username: username,
            password: password,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            downloads: 0,
            status: 'active'
        };
        
        usersDB.push(newUser);
        saveToStorage('slaughter_users', usersDB);
        return newUser;
    }
    
    function updateUser(userId, updates) {
        const userIndex = usersDB.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            usersDB[userIndex] = { ...usersDB[userIndex], ...updates };
            saveToStorage('slaughter_users', usersDB);
            return usersDB[userIndex];
        }
        return null;
    }
    
    // ===== Проверка инвайт-кода =====
    function validateInviteCode(code) {
        return code.trim().toUpperCase() === STATIC_INVITE_CODE;
    }
    
    // ===== Проверка автологина =====
    function checkAutoLogin() {
        const savedSession = localStorage.getItem('slaughter_session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                const user = findUserById(session.userId);
                if (user) {
                    currentUser = user;
                    isAuthenticated = true;
                    
                    const splashScreen = document.getElementById('splashScreen');
                    const authModal = document.getElementById('authModal');
                    
                    if (splashScreen) {
                        splashScreen.classList.add('hidden');
                    }
                    if (authModal) {
                        authModal.classList.remove('show');
                    }
                    
                    showMainContent();
                    showNotification('С возвращением, ' + user.username);
                } else {
                    localStorage.removeItem('slaughter_session');
                }
            } catch (e) {
                console.error('Ошибка автологина:', e);
                localStorage.removeItem('slaughter_session');
            }
        }
    }
    
    // ===== Сохранение сессии =====
    function saveSession(userId, remember) {
        const session = {
            userId: userId,
            loginTime: new Date().toISOString()
        };
        
        if (remember) {
            localStorage.setItem('slaughter_session', JSON.stringify(session));
        } else {
            sessionStorage.setItem('slaughter_session', JSON.stringify(session));
        }
    }
    
    // ===== Очистка сессии =====
    function clearSession() {
        localStorage.removeItem('slaughter_session');
        sessionStorage.removeItem('slaughter_session');
    }
    
    // ===== Инициализация заставки =====
    function initSplashScreen() {
        const splashScreen = document.getElementById('splashScreen');
        const progressFill = document.getElementById('progressFill');
        const percentage = document.getElementById('percentage');
        const statusText = document.getElementById('statusText');
        const mainContent = document.getElementById('mainContent');
        
        if (!splashScreen || !progressFill || !percentage || !statusText || !mainContent) {
            if (mainContent) {
                mainContent.classList.add('visible');
            }
            return;
        }
        
        createParticles();
        
        const statuses = [
            'Инициализация...',
            'Загрузка модулей...',
            'Подключение к серверу...',
            'Проверка обновлений...',
            'Загрузка ресурсов...',
            'Завершение...'
        ];
        
        let progress = 0;
        let statusIndex = 0;
        let loadingInterval;
        
        function finishSplash() {
            clearInterval(loadingInterval);
            progress = 100;
            progressFill.style.width = '100%';
            percentage.textContent = '100%';
            statusText.textContent = 'Готово';
            
            setTimeout(() => {
                splashScreen.classList.add('hidden');
                
                if (!isAuthenticated) {
                    showAuthModal();
                } else {
                    showMainContent();
                }
            }, 500);
        }
        
        loadingInterval = setInterval(() => {
            const increment = Math.random() * 5 + 1;
            progress += increment;
            
            if (progress >= 100) {
                finishSplash();
                return;
            }
            
            progressFill.style.width = progress + '%';
            percentage.textContent = Math.floor(progress) + '%';
            
            if (progress > (statusIndex + 1) * (100 / statuses.length)) {
                statusIndex = Math.min(statusIndex + 1, statuses.length - 1);
                statusText.textContent = statuses[statusIndex];
            }
        }, 100);
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                if (!splashScreen.classList.contains('hidden')) {
                    finishSplash();
                }
            }
        });
        
        splashScreen.addEventListener('click', function() {
            if (!splashScreen.classList.contains('hidden')) {
                finishSplash();
            }
        });
    }
    
    // ===== Создание частиц =====
    function createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;
        
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 10;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                box-shadow: 0 0 ${size * 3}px rgba(192, 57, 43, 0.3);
            `;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    // ===== Создание кастомного курсора =====
    function createCustomCursor() {
        const cursorDot = document.getElementById('cursorDot');
        const cursorRing = document.getElementById('cursorRing');
        
        if (!cursorDot || !cursorRing) return;
        
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) {
            cursorDot.style.display = 'none';
            cursorRing.style.display = 'none';
            document.body.style.cursor = 'auto';
            return;
        }
        
        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;
        
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });
        
        function animateRing() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            
            requestAnimationFrame(animateRing);
        }
        
        animateRing();
        
        document.addEventListener('mouseover', function(e) {
            if (e.target.closest('button, a, .btn, .feature-card, .download-card, input')) {
                cursorRing.classList.add('hover');
            }
        });
        
        document.addEventListener('mouseout', function(e) {
            if (e.target.closest('button, a, .btn, .feature-card, .download-card, input')) {
                cursorRing.classList.remove('hover');
            }
        });
    }
    
    // ===== Инициализация модального окна авторизации =====
    function initAuthModal() {
        const authModal = document.getElementById('authModal');
        const authModalClose = document.getElementById('authModalClose');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authToggleLink = document.getElementById('authToggleLink');
        const authToggleText = document.getElementById('authToggleText');
        const authModalTitle = document.getElementById('authModalTitle');
        
        if (!authModal || !loginForm || !registerForm) return;
        
        authModalClose.addEventListener('click', function() {
            if (!isAuthenticated) {
                showNotification('Необходимо авторизоваться для доступа к сайту');
            }
        });
        
        function toggleForms(e) {
            if (e) e.preventDefault();
            
            loginForm.classList.toggle('hidden');
            registerForm.classList.toggle('hidden');
            
            if (loginForm.classList.contains('hidden')) {
                authModalTitle.textContent = 'Регистрация';
                authToggleText.innerHTML = 'Уже есть аккаунт? <a href="#" id="authToggleLink">Войти</a>';
            } else {
                authModalTitle.textContent = 'Авторизация';
                authToggleText.innerHTML = 'Нет аккаунта? <a href="#" id="authToggleLink">Зарегистрироваться</a>';
            }
            
            const newToggleLink = document.getElementById('authToggleLink');
            if (newToggleLink) {
                newToggleLink.addEventListener('click', toggleForms);
            }
        }
        
        authToggleLink.addEventListener('click', toggleForms);
        
        // Обработка формы входа
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            const user = findUser(username);
            
            if (!user) {
                showNotification('Пользователь с таким логином не найден');
                return;
            }
            
            if (user.password !== password) {
                showNotification('Неверный пароль');
                return;
            }
            
            if (user.status === 'banned') {
                showNotification('Ваш аккаунт заблокирован');
                return;
            }
            
            currentUser = user;
            isAuthenticated = true;
            
            updateUser(user.id, { lastLogin: new Date().toISOString() });
            saveSession(user.id, rememberMe);
            
            loginForm.reset();
            
            hideAuthModal();
            showMainContent();
            showNotification('Добро пожаловать, ' + user.username);
        });
        
        // Обработка формы регистрации
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('registerUsername').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const inviteCode = document.getElementById('registerInviteCode').value.trim();
            
            // Валидация
            if (username.length < 3) {
                showNotification('Логин должен быть не менее 3 символов');
                return;
            }
            
            if (username.length > 20) {
                showNotification('Логин не должен превышать 20 символов');
                return;
            }
            
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                showNotification('Логин может содержать только буквы, цифры и знак подчеркивания');
                return;
            }
            
            if (password.length < 8) {
                showNotification('Пароль должен быть не менее 8 символов');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Пароли не совпадают');
                return;
            }
            
            if (findUser(username)) {
                showNotification('Пользователь с таким логином уже существует');
                return;
            }
            
            // Проверка инвайт-кода
            if (!inviteCode) {
                showNotification('Введите инвайт-код');
                return;
            }
            
            if (!validateInviteCode(inviteCode)) {
                showNotification('Неверный инвайт-код');
                return;
            }
            
            // Создание нового пользователя
            const newUser = addUser(username, password);
            
            currentUser = newUser;
            isAuthenticated = true;
            
            saveSession(newUser.id, true);
            
            registerForm.reset();
            
            hideAuthModal();
            showMainContent();
            showNotification('Аккаунт создан. Добро пожаловать, ' + username);
        });
    }
    
    // ===== Показ модального окна =====
    function showAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // ===== Скрытие модального окна =====
    function hideAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    // ===== Показ основного контента =====
    function showMainContent() {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.classList.add('visible');
            setTimeout(() => {
                animateHeroElements();
            }, 100);
        }
        
        updateNavigation();
    }
    
    // ===== Обновление навигации =====
    function updateNavigation() {
        const navAuth = document.querySelector('.nav-auth');
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');
        
        if (!navAuth) return;
        
        // Убираем все кнопки кроме logout
        const buttons = navAuth.querySelectorAll('.btn-outline, .btn-primary');
        buttons.forEach(btn => {
            if (btn.id !== 'logoutBtn') {
                btn.remove();
            }
        });
        
        if (isAuthenticated && currentUser) {
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
            }
            
            if (userInfo) {
                userInfo.textContent = currentUser.username;
                userInfo.style.display = 'inline-block';
                userInfo.title = 'ID: ' + currentUser.id + '\nЗарегистрирован: ' + new Date(currentUser.createdAt).toLocaleDateString();
            }
        }
    }
    
    // ===== Анимации при прокрутке =====
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.feature-card, .download-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
    
    // ===== Анимация hero-элементов =====
    function animateHeroElements() {
        const heroElements = document.querySelectorAll('.hero-content h1, .tagline, .hero-description, .hero-actions');
        
        heroElements.forEach((element, index) => {
            element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }
    
    // ===== Обработчики событий =====
    function initEventHandlers() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                isAuthenticated = false;
                currentUser = null;
                clearSession();
                
                showNotification('Вы вышли из системы');
                
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    mainContent.classList.remove('visible');
                }
                
                setTimeout(() => {
                    showAuthModal();
                }, 500);
            });
        }
    }
    
    // ===== Показ уведомлений =====
    function showNotification(message) {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});