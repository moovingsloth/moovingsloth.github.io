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

  // Keep URL hash in sync without jumping; smooth scroll comes from CSS scroll-behavior.
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    setActive(a.getAttribute('href').slice(1));
  });

  if (!('IntersectionObserver' in window)) { setActive(heads[0].id); return; }
  var visible = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
    // Active = last heading above the 35% line of the viewport.
    var line = window.innerHeight * 0.35, pick = heads[0].id;
    for (var i = 0; i < heads.length; i++) {
      if (heads[i].getBoundingClientRect().top <= line) pick = heads[i].id; else break;
    }
    setActive(pick);
  }, { rootMargin: '0px 0px -65% 0px', threshold: [0, 1] });
  heads.forEach(function (h) { io.observe(h); });
  window.addEventListener('scroll', function () {
    var line = window.innerHeight * 0.35, pick = heads[0].id;
    for (var i = 0; i < heads.length; i++) {
      if (heads[i].getBoundingClientRect().top <= line) pick = heads[i].id; else break;
    }
    setActive(pick);
  }, { passive: true });
  setActive(heads[0].id);
})();
