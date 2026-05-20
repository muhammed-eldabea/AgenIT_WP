// AgenIT wiki — live search + category filter
(() => {
  const input      = document.getElementById('wiki-search');
  const chips      = document.querySelectorAll('#cat-filters .chip');
  const cards      = Array.from(document.querySelectorAll('.cmd-card'));
  const cats       = Array.from(document.querySelectorAll('.cat'));
  const resultEl   = document.getElementById('result-count');
  const noResults  = document.getElementById('no-results');
  const clearBtn   = document.getElementById('clear-btn');
  const resetBtn   = document.getElementById('reset-btn');

  let activeCat = 'all';

  // Pre-index each card's searchable text
  cards.forEach(card => {
    const cmd  = (card.dataset.cmd  || '').toLowerCase();
    const keys = (card.dataset.keys || '').toLowerCase();
    const text = card.textContent.toLowerCase();
    card._index = `${cmd} ${keys} ${text}`;
    // store original innerHTML for highlight reset
    card._originalHTML = card.innerHTML;
  });

  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function applyHighlight(card, q) {
    // reset
    card.innerHTML = card._originalHTML;
    if (!q) return;
    const re = new RegExp(`(${escapeRegex(q)})`, 'gi');
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (n.parentElement.closest('mark, script, style')) continue;
      if (re.test(n.nodeValue)) nodes.push(n);
    }
    nodes.forEach(node => {
      const span = document.createElement('span');
      span.innerHTML = node.nodeValue.replace(re, '<mark>$1</mark>');
      node.replaceWith(...span.childNodes);
    });
  }

  function filter() {
    const qRaw = input.value.trim();
    const q    = qRaw.toLowerCase();
    let visible = 0;

    cards.forEach(card => {
      const inCat = activeCat === 'all'
        || card.closest('.cat')?.dataset.cat === activeCat;
      const matches = !q || card._index.includes(q);
      const show = inCat && matches;
      card.hidden = !show;
      if (show) visible++;
      // highlight only when there's a query — keeps DOM cheap
      applyHighlight(card, qRaw && show ? qRaw : '');
    });

    // hide categories with no visible cards
    cats.forEach(cat => {
      const anyVisible = cat.querySelectorAll('.cmd-card:not([hidden])').length > 0;
      cat.hidden = !anyVisible;
    });

    resultEl.textContent = `${visible} command${visible === 1 ? '' : 's'}`;
    noResults.hidden = visible !== 0;
    clearBtn.hidden  = !qRaw && activeCat === 'all';
  }

  // search input
  let raf = 0;
  input.addEventListener('input', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(filter);
  });

  // chip filters
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCat = chip.dataset.cat;
      filter();
      // scroll to top of category if a specific one is picked
      if (activeCat !== 'all') {
        const target = document.querySelector(`.cat[data-cat="${activeCat}"]`);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // clear / reset
  function reset() {
    input.value = '';
    chips.forEach(c => c.classList.remove('active'));
    document.querySelector('.chip[data-cat="all"]').classList.add('active');
    activeCat = 'all';
    filter();
    input.focus();
  }
  clearBtn.addEventListener('click', reset);
  resetBtn?.addEventListener('click', reset);

  // keyboard: `/` focuses search, Esc clears it
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
      input.select();
    } else if (e.key === 'Escape' && document.activeElement === input) {
      if (input.value) {
        input.value = '';
        filter();
      } else {
        input.blur();
      }
    }
  });

  // initial count
  filter();
})();
