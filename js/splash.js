// Заставка SLAUGHTER

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Создание частиц =====
    createParticles();
    
    // ===== Создание кастомного курсора =====
    createCustomCursor();
    
    // ===== Анимация загрузки =====
    animateLoading();
    
    // ===== Создание частиц =====
    function createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Случайные параметры
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 10;
            const opacity = Math.random() * 0.5 + 0.3;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                opacity: ${opacity};
                box-shadow: 0 0 ${size * 3}px var(--accent-glow);
            `;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    // ===== Создание кастомного курсора =====
    function createCustomCursor() {
        // Точка
        const cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        document.body.appendChild(cursorDot);
        
        // Кольцо
        const cursorRing = document.createElement('div');
        cursorRing.className = 'cursor-ring';
        document.body.appendChild(cursorRing);
        
        // Позиционирование
        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;
        
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Точка следует мгновенно
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });
        
        // Кольцо следует с задержкой
        function animateRing() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            
            requestAnimationFrame(animateRing);
        }
        
        animateRing();
        
        // Эффект при наведении на интерактивные элементы
        document.addEventListener('mouseover', function(e) {
            if (e.target.closest('button, a, .splash-content, input')) {
                cursorRing.classList.add('hover');
            }
        });
        
        document.addEventListener('mouseout', function(e) {
            if (e.target.closest('button, a, .splash-content, input')) {
                cursorRing.classList.remove('hover');
            }
        });
    }
    
    // ===== Анимация загрузки =====
    function animateLoading() {
        const progressFill = document.getElementById('progressFill');
        const percentage = document.getElementById('percentage');
        const statusText = document.getElementById('statusText');
        const splashContainer = document.querySelector('.splash-container');
        
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
        
        const loadingInterval = setInterval(() => {
            // Увеличиваем прогресс
            const increment = Math.random() * 5 + 1;
            progress += increment;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                
                // Завершение загрузки
                statusText.textContent = 'Готово';
                
                // Запускаем выход из заставки
                setTimeout(() => {
                    splashContainer.classList.add('exit');
                    
                    // Переход на главную страницу
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                }, 500);
            }
            
            // Обновляем прогресс-бар
            progressFill.style.width = progress + '%';
            percentage.textContent = Math.floor(progress) + '%';
            
            // Обновляем статус
            if (progress > (statusIndex + 1) * (100 / statuses.length)) {
                statusIndex = Math.min(statusIndex + 1, statuses.length - 1);
                statusText.textContent = statuses[statusIndex];
            }
        }, 100);
    }
    
    // ===== Обработка клавиш =====
    document.addEventListener('keydown', function(e) {
        // Пропуск заставки по нажатию клавиши
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
            skipSplash();
        }
    });
    
    // ===== Пропуск заставки =====
    function skipSplash() {
        const splashContainer = document.querySelector('.splash-container');
        
        if (!splashContainer.classList.contains('exit')) {
            splashContainer.classList.add('exit');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }
    
    // ===== Запрет на выделение текста =====
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
    });
    
    // ===== Запрет контекстного меню =====
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
});