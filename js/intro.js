(function() {
    'use strict';

    // ============================================
    //  AUDIO
    // ============================================
    var audioCtx = null;

    function playDrone() {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(30, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(15, audioCtx.currentTime + 4);
            gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 1);
            gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 3.5);
            gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 4);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 4);
        } catch(e) {}
    }

    function playBassHit() {
        if (!audioCtx) return;
        try {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.4);
        } catch(e) {}
    }

    function playGlitchSound() {
        if (!audioCtx) return;
        try {
            var bufferSize = audioCtx.sampleRate * 0.15;
            var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            var data = buffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.3;
            }
            var source = audioCtx.createBufferSource();
            var gain = audioCtx.createGain();
            source.buffer = buffer;
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            source.connect(gain);
            gain.connect(audioCtx.destination);
            source.start(audioCtx.currentTime);
        } catch(e) {}
    }

    // ============================================
    //  CREATE INTRO
    // ============================================
    function createIntro() {
        var intro = document.createElement('div');
        intro.className = 'intro-overlay';

        intro.innerHTML = 
            '<div class="intro-shake">' +
                '<div class="intro-pulse"></div>' +
                '<div class="intro-flash"></div>' +
                '<div class="intro-content">' +
                    '<div class="intro-text-stage">' +
                        '<svg class="intro-svg" viewBox="0 0 1200 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
                            '<defs>' +
                                '<filter id="glow">' +
                                    '<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b1"/>' +
                                    '<feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b2"/>' +
                                    '<feMerge>' +
                                        '<feMergeNode in="b2"/>' +
                                        '<feMergeNode in="b1"/>' +
                                        '<feMergeNode in="SourceGraphic"/>' +
                                    '</feMerge>' +
                                '</filter>' +
                                '<filter id="glitchDistort">' +
                                    '<feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="1" result="noise"/>' +
                                    '<feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G">' +
                                        '<animate attributeName="scale" values="0;0;15;0;0;25;0" dur="2.5s" begin="0.3s"/>' +
                                    '</feDisplacementMap>' +
                                '</filter>' +
                                '<linearGradient id="blood" x1="0%" y1="0%" x2="0%" y2="100%">' +
                                    '<stop offset="0%" stop-color="#ff0000" stop-opacity="0">' +
                                        '<animate attributeName="stop-opacity" values="0;1" dur="0.4s" fill="freeze" begin="1.6s"/>' +
                                    '</stop>' +
                                    '<stop offset="30%" stop-color="#ff1a1a" stop-opacity="0">' +
                                        '<animate attributeName="stop-opacity" values="0;1" dur="0.4s" fill="freeze" begin="1.6s"/>' +
                                    '</stop>' +
                                    '<stop offset="100%" stop-color="#8b0000" stop-opacity="0">' +
                                        '<animate attributeName="stop-opacity" values="0;1" dur="0.4s" fill="freeze" begin="1.6s"/>' +
                                    '</stop>' +
                                '</linearGradient>' +
                                '<radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">' +
                                    '<stop offset="0%" stop-color="#ff0000" stop-opacity="0.2"/>' +
                                    '<stop offset="100%" stop-color="#ff0000" stop-opacity="0"/>' +
                                '</radialGradient>' +
                            '</defs>' +
                            '<ellipse cx="600" cy="140" rx="500" ry="90" fill="url(#bgGlow)" opacity="0">' +
                                '<animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" begin="1.8s"/>' +
                                '<animate attributeName="rx" values="500;560;500" dur="1.5s" repeatCount="indefinite" begin="1.8s"/>' +
                            '</ellipse>' +
                            '<text x="600" y="140" text-anchor="middle" dominant-baseline="central" ' +
                                  'font-size="160" font-weight="900" font-family="Inter,Arial Black,sans-serif" ' +
                                  'letter-spacing="16" fill="none" stroke="#ff0000" stroke-width="2.5" ' +
                                  'stroke-dasharray="1600" stroke-dashoffset="1600" filter="url(#glow)">' +
                                'SLAUGHTER' +
                                '<animate attributeName="stroke-dashoffset" from="1600" to="0" ' +
                                         'dur="1.4s" fill="freeze" begin="0.3s" calcMode="spline" ' +
                                         'keySplines="0.42 0 0.58 1" keyTimes="0;1"/>' +
                                '<animate attributeName="stroke-width" values="2.5;5;1;4;2.5" ' +
                                         'dur="0.2s" repeatCount="indefinite" begin="1.7s"/>' +
                            '</text>' +
                            '<text x="600" y="140" text-anchor="middle" dominant-baseline="central" ' +
                                  'font-size="160" font-weight="900" font-family="Inter,Arial Black,sans-serif" ' +
                                  'letter-spacing="16" fill="none" stroke="#00ffff" stroke-width="1" ' +
                                  'stroke-dasharray="1600" stroke-dashoffset="1600" opacity="0" filter="url(#glitchDistort)">' +
                                'SLAUGHTER' +
                                '<animate attributeName="stroke-dashoffset" from="1600" to="0" ' +
                                         'dur="1.4s" fill="freeze" begin="0.3s" calcMode="spline" ' +
                                         'keySplines="0.42 0 0.58 1" keyTimes="0;1"/>' +
                                '<animate attributeName="opacity" values="0;0;0.6;0;0.4;0;0.7;0" dur="2.5s" begin="1s"/>' +
                            '</text>' +
                            '<text x="600" y="140" text-anchor="middle" dominant-baseline="central" ' +
                                  'font-size="160" font-weight="900" font-family="Inter,Arial Black,sans-serif" ' +
                                  'letter-spacing="16" fill="url(#blood)" opacity="0">' +
                                'SLAUGHTER' +
                                '<animate attributeName="opacity" from="0" to="1" dur="0.01s" fill="freeze" begin="1.6s"/>' +
                            '</text>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="intro-client-wrap">' +
                        '<p class="intro-client-text">CLIENT</p>' +
                        '<div class="intro-client-line"></div>' +
                    '</div>' +
                    '<div class="intro-spiral-wrap">' +
                        '<div class="intro-spiral-ring ring-1"></div>' +
                        '<div class="intro-spiral-ring ring-2"></div>' +
                        '<div class="intro-spiral-ring ring-3"></div>' +
                        '<div class="intro-spiral-ring ring-4"></div>' +
                        '<div class="intro-spiral-ring ring-5"></div>' +
                        '<div class="intro-spiral-core"></div>' +
                        '<div class="intro-spiral-parts"></div>' +
                    '</div>' +
                    '<p class="intro-init-text">INITIALIZING SYSTEM</p>' +
                '</div>' +
            '</div>' +
            '<div class="intro-shrapnel"></div>' +
            '<div class="intro-blood-bg"></div>' +
            '<div class="intro-drips"></div>' +
            '<div class="intro-vignette"></div>' +
            '<div class="intro-scanlines"></div>' +
            '<div class="intro-corner c-tl"></div>' +
            '<div class="intro-corner c-tr"></div>' +
            '<div class="intro-corner c-bl"></div>' +
            '<div class="intro-corner c-br"></div>';

        document.body.appendChild(intro);
        return intro;
    }

    function createBloodBg() {
        var container = document.querySelector('.intro-blood-bg');
        if (!container) return;
        for (var i = 0; i < 150; i++) {
            var p = document.createElement('div');
            p.className = 'blood-particle';
            var size = 1.5 + Math.random() * 5;
            var x = Math.random() * 100;
            var y = Math.random() * 100;
            var dx = (Math.random() - 0.5) * 400;
            var dy = (Math.random() - 0.5) * 400;
            var dur = 2 + Math.random() * 4;
            var delay = Math.random() * 3;
            p.style.cssText = 'width:' + size + 'px;height:' + (size * 1.7) + 'px;left:' + x + '%;top:' + y + '%;--dx:' + dx + 'px;--dy:' + dy + 'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's;';
            container.appendChild(p);
        }
    }

    function createDrips() {
        var container = document.querySelector('.intro-drips');
        if (!container) return;
        for (var i = 0; i < 35; i++) {
            (function(idx) {
                setTimeout(function() {
                    var drip = document.createElement('div');
                    drip.className = 'blood-drip';
                    var x = 3 + Math.random() * 94;
                    var h = 15 + Math.random() * 100;
                    var w = 1.5 + Math.random() * 3;
                    var dur = 0.5 + Math.random() * 1.5;
                    var del = Math.random() * 0.6;
                    drip.style.cssText = 'left:' + x + '%;top:10%;width:' + w + 'px;height:' + h + 'px;animation-duration:' + dur + 's;animation-delay:' + del + 's;';
                    container.appendChild(drip);
                    setTimeout(function() {
                        if (drip.parentNode) drip.parentNode.removeChild(drip);
                    }, (dur + del) * 1000 + 300);
                }, idx * 55);
            })(i);
        }
    }

    function createSpiral() {
        var container = document.querySelector('.intro-spiral-parts');
        if (!container) return;
        var count = 80;
        for (var i = 0; i < count; i++) {
            var part = document.createElement('div');
            part.className = 'spiral-part';
            var angle = (i / count) * Math.PI * 2 * 5;
            var radius = 3 + (i / count) * 140;
            var delay = i * 0.014;
            var size = 3.5 - (i / count) * 2.8;
            part.style.cssText = 'width:' + size + 'px;height:' + size + 'px;--a:' + angle + 'rad;--r:' + radius + 'px;animation-delay:' + delay + 's;';
            container.appendChild(part);
        }
    }

    function createShrapnel() {
        var container = document.querySelector('.intro-shrapnel');
        if (!container) return;
        for (var i = 0; i < 50; i++) {
            var shard = document.createElement('div');
            shard.className = 'shard';
            var size = 2 + Math.random() * 6;
            var x = 40 + Math.random() * 20;
            var y = 40 + Math.random() * 20;
            var angle = Math.random() * 360;
            var dist = 100 + Math.random() * 300;
            var dur = 0.6 + Math.random() * 1.2;
            var delay = Math.random() * 0.3;
            shard.style.cssText = 'width:' + size + 'px;height:' + (size * 0.4) + 'px;left:' + x + '%;top:' + y + '%;--angle:' + angle + 'deg;--dist:' + dist + 'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's;animation-fill-mode:forwards;';
            container.appendChild(shard);
        }
    }

    function screenShake() {
        var shake = document.querySelector('.intro-shake');
        if (!shake) return;
        shake.classList.add('shaking');
        setTimeout(function() { shake.classList.remove('shaking'); }, 400);
    }

    function triggerFlash() {
        var flash = document.querySelector('.intro-flash');
        if (!flash) return;
        flash.classList.add('active');
        setTimeout(function() { flash.classList.remove('active'); }, 300);
    }

    function goToSite() {
        window.location.href = 'index.html';
    }

    // ============================================
    //  INIT
    // ============================================
    function init() {
        var intro = createIntro();
        createBloodBg();
        createSpiral();
        playDrone();

        setTimeout(function() {
            triggerFlash();
            screenShake();
            playBassHit();
        }, 1700);

        setTimeout(function() {
            screenShake();
            playGlitchSound();
            createShrapnel();
        }, 2000);

        setTimeout(createDrips, 1700);

        // Редирект на сайт после интро
        setTimeout(function() {
            intro.classList.add('fade-out');
            setTimeout(goToSite, 700);
        }, 4200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();