// AgenIT docs — light interactions for the linear doc layout
// (was: splash + panel swapping; the dashboard layout was retired
//  in favour of a single scrollable document with a side nav.)
(() => {
  // ─── Mobile sidebar toggle ───
  const sidebar = document.getElementById('doc-side-nav');
  const toggle  = document.querySelector('.doc-nav-toggle');
  if (sidebar && toggle) {
    toggle.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    sidebar.addEventListener('click', e => {
      if (e.target.tagName === 'A') sidebar.classList.remove('open');
    });
  }

  // ─── Use-case filter chips ───
  const ucChips = document.querySelectorAll('.uc-chip[data-uc-filter]');
  const ucCards = document.querySelectorAll('.uc-card');
  ucChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.ucFilter;
      ucChips.forEach(c => c.classList.toggle('active', c === chip));
      ucCards.forEach(card => {
        const tags = (card.dataset.ucTags || '').split(/\s+/);
        card.hidden = f !== 'all' && !tags.includes(f);
      });
    });
  });

  // ─── Highlight active top-nav link as you scroll ───
  // Strategy: pick the section whose top is closest to (but above) a
  // fixed offset just under the sticky nav. More reliable than an
  // IntersectionObserver band, which leaves gaps when sections are
  // shorter than the band.
  const links = Array.from(document.querySelectorAll('.doc-nav a[href^="#"]'));
  const pairs = links
    .map(a => ({ a, el: document.getElementById(a.getAttribute('href').slice(1)) }))
    .filter(p => p.el);

  if (pairs.length) {
    const OFFSET = 80;  // px under the top of the viewport
    let lastId = null;

    function update() {
      const y = window.scrollY + OFFSET;
      let activeId = pairs[0].el.id;
      for (const p of pairs) {
        if (p.el.offsetTop <= y) activeId = p.el.id;
        else break;
      }
      // If we're near the bottom of the page, force the last link to
      // win so short final sections still highlight.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        activeId = pairs[pairs.length - 1].el.id;
      }
      if (activeId === lastId) return;
      lastId = activeId;
      links.forEach(a => a.classList.toggle('active',
        a.getAttribute('href') === '#' + activeId));
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    // Smooth click + immediate highlight
    links.forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - 56;
        window.scrollTo({ top, behavior: 'smooth' });
        history.replaceState(null, '', '#' + id);
        links.forEach(l => l.classList.toggle('active', l === a));
      });
    });
  }
})();
