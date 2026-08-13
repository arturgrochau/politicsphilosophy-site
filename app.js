/* Politics & Philosophy — small progressive-enhancement layer. No dependencies. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var on = function (el, ev, fn) { el && el.addEventListener(ev, fn, { passive: true }); };

  /* ---- scroll progress bar ---- */
  var bar = document.querySelector('.progress');
  if (bar) {
    var tick = false;
    var draw = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
      tick = false;
    };
    on(window, 'scroll', function () { if (!tick) { tick = true; requestAnimationFrame(draw); } });
    draw();
  }

  /* ---- scroll reveal ---- */
  var targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) { /* nothing to do */ }
  else if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < targets.length; i++) targets[i].classList.add('in');
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(targets, function (el) {
      // stagger siblings that share a parent group
      var group = el.parentElement && el.parentElement.hasAttribute('data-stagger') ? el.parentElement : null;
      if (group) {
        var idx = Array.prototype.indexOf.call(group.children, el);
        el.style.setProperty('--d', Math.min(idx, 8) * 70 + 'ms');
      }
      io.observe(el);
    });
  }

  /* ---- count-up stats ---- */
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    var fmt = function (n) { return n.toLocaleString('en-US'); };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = parseFloat(el.getAttribute('data-count')),
            pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '',
            t0 = 0, dur = 1100;
        var step = function (t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + fmt(Math.round(end * eased)) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(nums, function (el) { cio.observe(el); });
  }

  /* ---- rotating topic word ---- */
  var rot = document.querySelector('.rot');
  if (rot && !reduce) {
    var words = rot.children, cur = 0;
    // hand the first word over to the .on class, so it fades out like every other one
    rot.classList.add('live');
    words[0].classList.add('on');
    setInterval(function () {
      words[cur].classList.remove('on');
      words[cur].classList.add('out');
      var prev = cur;
      setTimeout(function () { words[prev].classList.remove('out'); }, 420);
      cur = (cur + 1) % words.length;
      words[cur].classList.add('on');
    }, 2600);
  }

  /* ---- pointer spotlight on cards ---- */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.card'), function (card) {
      on(card, 'pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---- duplicate ticker content so the marquee loops seamlessly ---- */
  var track = document.querySelector('.ticker-track');
  if (track && track.children.length === 1) track.appendChild(track.firstElementChild.cloneNode(true));
})();

/* ---- publication extras: reading bar + TOC scrollspy ---- */
(function () {
  'use strict';
  var readbar = document.querySelector('.readbar');
  var prose = document.querySelector('.prose');
  if (readbar && prose) {
    var t = false;
    var draw = function () {
      var r = prose.getBoundingClientRect(), h = r.height - innerHeight;
      var p = h > 0 ? Math.min(Math.max(-r.top / h, 0), 1) : (r.top < 0 ? 1 : 0);
      readbar.style.width = (p * 100) + '%';
      t = false;
    };
    addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(draw); } }, { passive: true });
    draw();
  }
  var links = document.querySelectorAll('.toc a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    Array.prototype.forEach.call(links, function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var heads = document.querySelectorAll('.prose h2[id]');
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        Array.prototype.forEach.call(links, function (a) { a.classList.remove('here'); });
        if (map[e.target.id]) map[e.target.id].classList.add('here');
      });
    }, { rootMargin: '-96px 0px -70% 0px' });
    Array.prototype.forEach.call(heads, function (h) { spy.observe(h); });
  }
})();
