(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var allowed = { canopy: 1, market: 1, ice: 1, amber: 1, paper: 1 };
  try {
    var theme = localStorage.getItem('cml-theme-v2');
    if (theme && allowed[theme]) root.setAttribute('data-theme', theme);
  } catch (error) {
    /* Storage can be blocked. The default theme stays. */
  }
  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (error) {
    reduce = false;
  }
  var paused = reduce;
  try {
    var stored = localStorage.getItem('cml-motion');
    if (stored === 'paused') paused = true;
    if (stored === 'play') {
      paused = false;
      if (reduce) root.classList.add('allow-motion');
    }
  } catch (error) {
    /* Ignore storage failures. */
  }
  if (paused) root.classList.add('is-paused');
})();
