/* Site behaviour: the home-page project player and the project-page table of contents.
   Everything works without it: playlist items are plain links, pages are plain HTML. */
(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Home: project player. Clicking a playlist item loads that project's film. ---- */
  var player = document.getElementById('player');
  if (player) {
    var items = Array.prototype.slice.call(document.querySelectorAll('.list a'));
    var title = document.getElementById('now-title');
    var when = document.getElementById('now-when');
    var sum = document.getElementById('now-sum');
    var link = document.getElementById('now-link');
    var show = function (a, play) {
      items.forEach(function (i) { i.setAttribute('aria-current', i === a ? 'true' : 'false'); });
      player.poster = a.dataset.poster;
      player.src = a.dataset.film;
      title.textContent = a.querySelector('b').textContent;
      when.textContent = a.dataset.when;
      sum.textContent = a.dataset.sum;
      link.href = a.getAttribute('href');
      if (play) { player.play().catch(function () {}); }
    };
    items.forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let people open the page in a new tab
        e.preventDefault();
        show(a, true);
      });
    });
    // When a film ends, move on to the next one.
    player.addEventListener('ended', function () {
      var i = items.findIndex(function (a) { return a.getAttribute('aria-current') === 'true'; });
      show(items[(i + 1) % items.length], true);
    });
    if (!calm) { player.muted = true; player.play().catch(function () {}); }
  }

  /* ---- Project pages: cover loops only play when motion is welcome. ---- */
  if (calm) {
    Array.prototype.forEach.call(document.querySelectorAll('video[autoplay]'), function (v) {
      v.removeAttribute('autoplay'); v.pause(); v.controls = true;
    });
  }

  /* ---- Project pages: table of contents built from h2/h3 headings. ---- */
  var toc = document.getElementById('toc');
  var prose = document.querySelector('.prose');
  if (!toc || !prose) return;
  var heads = Array.prototype.slice.call(prose.querySelectorAll('h2[id], h3[id]'));
  if (heads.length < 2) { toc.hidden = true; return; }

  var root = document.createElement('ol');
  var currentSub = null, currentItem = null, links = {}, parentOf = {};
  heads.forEach(function (h) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.trim();
    li.appendChild(a);
    links[h.id] = a;
    if (h.tagName === 'H2' || !currentItem) {
      root.appendChild(li); currentItem = li; currentSub = null; parentOf[h.id] = li;
    } else {
      if (!currentSub) { currentSub = document.createElement('ol'); currentItem.appendChild(currentSub); currentItem.classList.add('has-sub'); }
      li.className = 'sub'; currentSub.appendChild(li); parentOf[h.id] = currentItem;
    }
  });
  toc.appendChild(root);

  var active = null;
  function setActive(id) {
    if (!id || id === active) return;
    if (active) { links[active].classList.remove('active'); parentOf[active].classList.remove('open'); }
    active = id; links[id].classList.add('active'); parentOf[id].classList.add('open');
  }
  function onScroll() {
    var line = 120, current = heads[0].id;
    for (var i = 0; i < heads.length; i++) {
      if (heads[i].getBoundingClientRect().top - line <= 0) current = heads[i].id; else break;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = heads[heads.length - 1].id;
    setActive(current);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
