/* Sets the timeline placement and motion flag before first paint. */
(function boot() {
  var root = document.documentElement;
  var params;
  try {
    params = new URLSearchParams(window.location.search);
  } catch (error) {
    params = new URLSearchParams();
  }
  var timeline = params.get('timeline');
  if (timeline !== 'a' && timeline !== 'b' && timeline !== 'c') timeline = 'b';
  root.dataset.timeline = timeline;

  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (error) {
    reduce = false;
  }
  try {
    if (window.localStorage.getItem('cm.v2.motion') === 'reduce') reduce = true;
  } catch (error) {
    /* storage may be blocked */
  }
  if (params.get('motion') === 'reduce') reduce = true;
  if (params.get('motion') === 'full') reduce = false;
  if (reduce) root.dataset.motion = 'reduce';

  function markPlacement() {
    var mode = root.dataset.timeline || 'b';
    var links = document.querySelectorAll('[data-placement]');
    for (var i = 0; i < links.length; i += 1) {
      if (links[i].getAttribute('data-placement') === mode) links[i].setAttribute('aria-current', 'true');
      else links[i].removeAttribute('aria-current');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markPlacement);
  else markPlacement();
}());
