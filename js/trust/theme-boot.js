(function themeBoot() {
  try {
    var raw = localStorage.getItem('cm.settings') || '{}';
    var settings = JSON.parse(raw);
    var root = document.documentElement;
    var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var moreContrast = window.matchMedia('(prefers-contrast: more)').matches;
    var theme = settings.theme || 'dawn';
    if (theme === 'system') theme = dark ? 'starlight' : 'dawn';
    if (moreContrast && !settings.theme) theme = 'contrast';
    var motion = settings.motion || 'system';
    if (motion === 'system') motion = reduce ? 'reduce' : 'full';
    var params = new URLSearchParams(window.location.search);
    var themeOverride = params.get('theme');
    var motionOverride = params.get('motion');
    if (themeOverride === 'dawn' || themeOverride === 'starlight' || themeOverride === 'contrast') theme = themeOverride;
    if (motionOverride === 'reduce' || motionOverride === 'full') motion = motionOverride;
    root.dataset.theme = theme;
    root.dataset.motion = motion;
    if (settings.lang === 'es' || settings.lang === 'en') root.lang = settings.lang;
    var color = document.getElementById('theme-color');
    if (color) {
      var map = { dawn: '#FBF7FF', starlight: '#0F1030', contrast: '#FFFFFF' };
      color.setAttribute('content', map[theme] || map.dawn);
    }
  } catch (error) {
    document.documentElement.dataset.theme = 'dawn';
  }
}());
