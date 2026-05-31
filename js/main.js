// Проверка: если зашли на index.html напрямую — го на интро
if (!sessionStorage.getItem('intro_done') && window.location.pathname.indexOf('intro.html') === -1) {
    window.location.href = 'intro.html';
}
(function() {
    'use strict';

    // ============================================
    //  PAGE TRANSITIONS
    // ============================================
    function initTransitions() {
        var transition = document.querySelector('.page-transition');
        if (!transition) return;

        setTimeout(function() {
            transition.classList.remove('active');
        }, 100);

        document.querySelectorAll('a[href]').forEach(function(link) {
            var href = link.getAttribute('href');
            if (href && href.endsWith('.html') && !href.startsWith('http')) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    transition.classList.add('active');
                    setTimeout(function() {
                        window.location.href = href;
                    }, 400);
                });
            }
        });
    }

    // ============================================
    //  HAMBURGER
    // ============================================
    function initHamburger() {
        var hamburger = document.querySelector('.hamburger');
        var navLinks = document.querySelector('.nav-links');
        if (!hamburger || !navLinks) return;

        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }

    // ============================================
    //  PARTICLES (HOME)
    // ============================================
    function createParticles() {
        var container = document.querySelector('.hero-particles');
        if (!container) return;

        for (var i = 0; i < 80; i++) {
            var p = document.createElement('div');
            p.className = 'particle';
            var size = Math.random() * 3 + 1;
            p.style.cssText =
                'left:' + (Math.random() * 100) + '%;' +
                'bottom:-10px;' +
                'width:' + size + 'px;' +
                'height:' + size + 'px;' +
                'animation-duration:' + (Math.random() * 8 + 6) + 's;' +
                'animation-delay:' + (Math.random() * 8) + 's;';
            container.appendChild(p);
        }
    }

    // ============================================
    //  COUNTER ANIMATION (HOME)
    // ============================================
    function animateCounters() {
        var counters = document.querySelectorAll('.stat-num[data-target]');
        counters.forEach(function(counter) {
            var target = parseInt(counter.getAttribute('data-target'));
            var duration = 2000;
            var step = target / (duration / 16);
            var current = 0;

            function update() {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            }

            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        update();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            observer.observe(counter);
        });
    }

    // ============================================
    //  SCROLL REVEAL
    // ============================================
    function initScrollReveal() {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.feat-card, .price-card, .server-row, .update-item, .req-card').forEach(function(el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(25px)';
            el.style.transition = 'all 0.5s cubic-bezier(0.77,0,0.175,1)';
            observer.observe(el);
        });
    }

    // ============================================
    //  PARALLAX (HOME)
    // ============================================
    function initParallax() {
        var hero = document.querySelector('.hero');
        if (!hero) return;

        document.addEventListener('mousemove', function(e) {
            var x = (e.clientX / window.innerWidth - 0.5) * 15;
            var y = (e.clientY / window.innerHeight - 0.5) * 15;
            var content = hero.querySelector('.hero-content');
            if (content) {
                content.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                content.style.transition = 'transform 0.08s ease-out';
            }
        });
    }

    // ============================================
    //  STATUS TIME UPDATE
    // ============================================
    function updateStatusTime() {
        var el = document.getElementById('lastCheck');
        if (!el) return;
        el.textContent = new Date().toLocaleTimeString();
        setInterval(function() {
            el.textContent = new Date().toLocaleTimeString();
        }, 30000);
    }

    // ============================================
    //  INIT
    // ============================================
    function init() {
        initTransitions();
        initHamburger();
        createParticles();
        animateCounters();
        initScrollReveal();
        initParallax();
        updateStatusTime();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
        sessionStorage.setItem('intro_done', '1');
    }
})();