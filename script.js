// AgenIT — landing-page interactions.
// The source repository is private; the public webpage is published
// from a sibling repo (see .github/workflows/publish-webpage.yml in the
// private repo). The live release/commit feed was intentionally removed
// when the source repo went private.

// ───────────── Demo tabs ─────────────
document.querySelectorAll('.demo-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.target;
    document.querySelectorAll('.demo-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.demo-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(targetId);
    if (panel) panel.classList.add('active');
  });
});

// ───────────── Copy buttons ─────────────
document.querySelectorAll('.copy-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copyTarget || '';
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add('copied');
      const label = btn.querySelector('.copy-label');
      const original = label?.textContent;
      if (label) label.textContent = 'Copied';
      setTimeout(() => {
        btn.classList.remove('copied');
        if (label && original) label.textContent = original;
      }, 1600);
    } catch (e) {
      btn.querySelector('.copy-label').textContent = 'Press Ctrl-C';
    }
  });
});
