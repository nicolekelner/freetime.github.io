/* Free Time — scroll reveals + micro-animations */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        /[?&]showall/.test(window.location.search);

    /* --- Scroll reveals --- */
    var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');

    if (reducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('in-view'); });
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { revealObserver.observe(el); });
    }

    /* --- Unscramble puzzle: Z-C-O-Y types out C-O-Z-Y --- */
    var puzzleCard = document.getElementById('puzzleCard');
    if (puzzleCard) {
        var answer = ['C', 'O', 'Z', 'Y'];
        var answerTiles = puzzleCard.querySelectorAll('.tile-row-answer .tile');
        var scrambleTiles = puzzleCard.querySelectorAll('.tile-row-scramble .tile');

        var fillTile = function (i) {
            answerTiles[i].textContent = answer[i];
            answerTiles[i].classList.remove('tile-blank');
            answerTiles[i].classList.add('tile-pop');
            scrambleTiles.forEach(function (t) {
                if (t.dataset.letter === answer[i] && t.style.opacity !== '0.25') {
                    if (!t.dataset.used) {
                        t.style.opacity = '0.25';
                        t.dataset.used = 'true';
                    }
                }
            });
        };

        var resetPuzzle = function () {
            answerTiles.forEach(function (t) {
                t.textContent = '_';
                t.classList.add('tile-blank');
                t.classList.remove('tile-pop');
            });
            scrambleTiles.forEach(function (t) {
                t.style.opacity = '';
                delete t.dataset.used;
            });
        };

        var playPuzzle = function () {
            resetPuzzle();
            answer.forEach(function (_, i) {
                setTimeout(function () { fillTile(i); }, 650 + i * 550);
            });
        };

        if (reducedMotion) {
            answer.forEach(function (_, i) { fillTile(i); });
        } else if ('IntersectionObserver' in window) {
            var puzzleTimer = null;
            var puzzleObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        playPuzzle();
                        puzzleTimer = setInterval(playPuzzle, 6000);
                    } else if (puzzleTimer) {
                        clearInterval(puzzleTimer);
                        puzzleTimer = null;
                    }
                });
            }, { threshold: 0.5 });
            puzzleObserver.observe(puzzleCard);
        }
    }

    /* --- Stats chart line draw --- */
    var chartLine = document.getElementById('chartLine');
    if (chartLine && !reducedMotion && 'IntersectionObserver' in window) {
        var len = chartLine.getTotalLength();
        chartLine.style.strokeDasharray = len;
        chartLine.style.strokeDashoffset = len;
        var dot = document.querySelector('#statsChart .chart-dot');
        var fill = document.querySelector('#statsChart .chart-fill');
        if (dot) { dot.style.opacity = '0'; }
        if (fill) { fill.style.opacity = '0'; }

        var chartObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    chartLine.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    chartLine.style.strokeDashoffset = '0';
                    if (fill) {
                        fill.style.transition = 'opacity 0.8s ease 1s';
                        fill.style.opacity = '1';
                    }
                    if (dot) {
                        dot.style.transition = 'opacity 0.4s ease 1.5s';
                        dot.style.opacity = '1';
                    }
                    chartObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        chartObserver.observe(chartLine.closest('.stats-card') || chartLine);
    }

    /* --- Finale hours count-up --- */
    var hoursEl = document.getElementById('hoursCount');
    if (hoursEl && !reducedMotion && 'IntersectionObserver' in window) {
        var target = parseInt(hoursEl.textContent, 10) || 14;
        hoursEl.textContent = '0';
        var countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) { return; }
                var start = null;
                var duration = 1400;
                var step = function (ts) {
                    if (!start) { start = ts; }
                    var progress = Math.min((ts - start) / duration, 1);
                    var eased = 1 - Math.pow(1 - progress, 3);
                    hoursEl.textContent = Math.round(eased * target);
                    if (progress < 1) { requestAnimationFrame(step); }
                };
                requestAnimationFrame(step);
                countObserver.unobserve(entry.target);
            });
        }, { threshold: 0.5 });
        countObserver.observe(hoursEl);
    }
})();
