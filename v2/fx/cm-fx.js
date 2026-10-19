/* CMFX entry. Classic script so Agent A can load it with defer. */
(function cmfxBoot() {
  const script = document.currentScript;
  const base = new URL('.', (script && script.src) || '/v2/fx/cm-fx.js');

  function ensureCss() {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    for (let i = 0; i < links.length; i += 1) {
      if (links[i].href.indexOf('/v2/fx/fx.css') !== -1 || links[i].dataset.cmfxCss) {
        if (links[i].sheet) return Promise.resolve();
        return new Promise((resolve) => {
          links[i].addEventListener('load', () => resolve(), { once: true });
          links[i].addEventListener('error', () => resolve(), { once: true });
        });
      }
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('fx.css', base).href;
    link.dataset.cmfxCss = '1';
    const pending = new Promise((resolve) => {
      link.addEventListener('load', () => resolve(), { once: true });
      link.addEventListener('error', () => resolve(), { once: true });
    });
    document.head.appendChild(link);
    return pending;
  }

  let api = null;
  const ready = ensureCss().then(() => import(new URL('runtime.js', base).href)).then((mod) => {
    api = mod.createApi();
    return api;
  });

  function lazyHandle(promise) {
    return {
      ready: promise,
      destroy() { promise.then((handle) => handle && handle.destroy && handle.destroy()); },
      pause() { promise.then((handle) => handle && handle.pause && handle.pause()); },
      resume() { promise.then((handle) => handle && handle.resume && handle.resume()); },
      set(next) { promise.then((handle) => handle && handle.set && handle.set(next)); },
    };
  }

  function call(name, args) {
    if (api) return api[name].apply(api, args);
    return lazyHandle(ready.then((live) => live[name].apply(live, args)));
  }

  const cmfx = {
    ready,
    aurora(canvas, options) { return call('aurora', [canvas, options]); },
    particles(canvas, options) { return call('particles', [canvas, options]); },
    globe3d(container, options) { return call('globe3d', [container, options]); },
    tiltCards(selector) { return call('tiltCards', [selector]); },
    cursorTrail() { return call('cursorTrail', []); },
    sound: {
      init() { return api ? api.sound.init() : ready.then((live) => live.sound.init()); },
      toggle() { return api ? api.sound.toggle() : ready.then((live) => live.sound.toggle()); },
      ping(kind) { return api ? api.sound.ping(kind) : ready.then((live) => live.sound.ping(kind)); },
      isOn() { return api ? api.sound.isOn() : false; },
    },
  };

  Object.defineProperty(cmfx, 'reducedMotion', {
    enumerable: true,
    get() {
      if (api) return api.reducedMotion;
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
  });

  window.CMFX = cmfx;
}());
