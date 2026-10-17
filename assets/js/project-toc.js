/* Shared left-side table of contents for /projects/* pages.
   Built from the page's own h2 (and nested h3) headings, so every page stays consistent.
   Active section is highlighted with IntersectionObserver. Hidden on narrow screens via CSS. */
(function () {
  var main = document.querySelector('main');
  if (!main) return;
  var heads = Array.prototype.slice.call(main.querySelectorAll('h2[id], h3[id]'));
  if (heads.length < 2) return;

  var nav = document.createElement('nav');
  nav.className = 'page-toc';
  nav.setAttribute('aria-label', 'Contents');
  var home = document.createElement('a');
  home.className = 'toc-home';
  home.href = '/';
  home.textContent = '\u2190 Back to home';
  nav.appendChild(home);
  var label = document.createElement('div');
  label.className = 'toc-label';
  label.textContent = 'Contents';
  nav.appendChild(label);

  var root = document.createElement('ol');
  var currentSub = null, currentItem = null;
  var links = {}, parentOf = {};

  heads.forEach(function (h) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.trim();
    li.appendChild(a);
    links[h.id] = a;
    if (h.tagName === 'H2' || !currentItem) {
      root.appendChild(li);
      currentItem = li; currentSub = null;
      parentOf[h.id] = li;
    } else {
      if (!currentSub) {
        currentSub = document.createElement('ol');
        currentItem.appendChild(currentSub);
        currentItem.classList.add('has-sub');
      }
      li.className = 'sub';
      currentSub.appendChild(li);
      parentOf[h.id] = currentItem;
    }
  });
  nav.appendChild(root);
  document.body.appendChild(nav);

  var active = null;
  function setActive(id) {
    if (!id || id === active) return;
    if (active) {
      links[active].classList.remove('active');
      parentOf[active].classList.remove('open');
    }
    active = id;
    links[id].classList.add('active');
    parentOf[id].classList.add('open');
  }

  // Active section = last heading above a line near the top of the viewport.
  // After a click, the clicked entry stays active while the smooth scroll runs (lock),
  // and at the page bottom (where later headings cannot reach the top) it stays active too.
  var lock = 0, clicked = null;
  function atBottom() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  }
  function update() {
    if (Date.now() < lock) return;
    if (atBottom()) {
      if (clicked) { setActive(clicked); return; }
      // No click: highlight the last heading that is on screen.
      var vis = null;
      for (var j = 0; j < heads.length; j++) {
        if (heads[j].getBoundingClientRect().top < window.innerHeight) vis = heads[j].id;
      }
      if (vis) { setActive(vis); return; }
    }
    var line = Math.min(120, window.innerHeight * 0.2);
    if (clicked) {
      var ct = document.getElementById(clicked).getBoundingClientRect().top;
      if (ct >= -5 && ct <= line) { setActive(clicked); return; }
    }
    clicked = null;
    var pick = heads[0].id;
    for (var i = 0; i < heads.length; i++) {
      if (heads[i].getBoundingClientRect().top <= line) pick = heads[i].id; else break;
    }
    setActive(pick);
  }

  // Smooth scroll comes from CSS scroll-behavior.
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    clicked = a.getAttribute('href').slice(1);
    setActive(clicked);
    lock = Date.now() + 1200;
  });
  window.addEventListener('scrollend', function () { lock = 0; update(); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(update, { threshold: [0, 1] });
    heads.forEach(function (h) { io.observe(h); });
  }
  window.addEventListener('scroll', update, { passive: true });
  setActive(heads[0].id);
  update();
})();
