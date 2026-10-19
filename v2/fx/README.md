# CMFX

Effect library for the CypherMonkey Labs v2 preview. Load one script. Everything else stays on this origin.

```html
<link rel="stylesheet" href="/v2/fx/fx.css">
<div class="cmfx-stage"><canvas id="aurora"></canvas></div>
<div class="cmfx-stage"><canvas id="dust"></canvas></div>
<div id="globe"></div>
<script src="/v2/fx/cm-fx.js" defer></script>
```

```js
window.CMFX.ready.then((fx) => {
  fx.aurora(document.querySelector('#aurora'), {
    palette: ['#7c5cff', '#3ee0c5', '#24144a'],
    intensity: 0.8,
  });
  fx.particles(document.querySelector('#dust'), { count: 120, mouse: true });
  const globe = fx.globe3d(document.querySelector('#globe'), {
    nodes: [
      { id: 'python', label: 'Python', url: 'https://cyphermonkeylabs.com/python-lab-free-university-mesmerizing/' },
    ],
  });
  fx.tiltCards('.door');
  fx.cursorTrail();
  fx.sound.init();
  return globe.ready;
});
```

`window.CMFX` is:

| Member | Role |
| --- | --- |
| `ready` | Promise that resolves when the runtime is up. three.js is not loaded yet. |
| `reducedMotion` | Live boolean for `prefers-reduced-motion`. |
| `aurora(canvas, {palette, intensity})` | Shader background. `palette` is hex colors. `intensity` is 0 to 1. |
| `particles(canvas, {count, mouse})` | Drifting field. `mouse: false` disables the pull. |
| `globe3d(container, {nodes})` | Nodes are `{id, label, url}`. This call loads three.js. |
| `tiltCards(selector)` | Fine-pointer tilt. |
| `cursorTrail()` | One fixed canvas. Ignored for touch-only and reduced motion. |
| `sound.init()` | Mounts the toggle. Does not start audio. |
| `sound.toggle()` | Flips sound. Returns the new state after `ready`. |
| `sound.ping(kind)` | `tap`, `hover`, `ok`, `nav`, or `warn`. Silent while sound is off. |
| `sound.isOn()` | `false` until a click on the toggle. |

Each effect returns `{ ready, destroy, pause, resume, set }`. Give aurora, particle, and globe parents a height (the `cmfx-stage` class does this) so the canvas does not collapse.

Open `demo.html` in this folder to see every effect.

## Sound

Sound is off when the page loads. The library adds a fixed button, "Sound off". The first click is the user gesture that starts the AudioContext. The bed is two quiet sine tones a fifth apart, a slow filter, and generated noise. Reduced motion keeps the pings and skips the bed. Hiding the tab suspends the context.

## Motion, phones, and WebGL

- `prefers-reduced-motion: reduce` freezes the aurora and the particles, stops globe spin (drag and arrow keys still redraw), skips tilt and the trail, and skips the ambient bed.
- Loops stop while the tab is hidden or the canvas is off screen.
- Device pixel ratio is capped at 2, and at 1.5 on phones. Phones also use fewer particles and a 30fps ceiling on the globe and the field.
- Save-Data lowers the particle count.
- No WebGL: the aurora is a 2D gradient, particles stay on canvas 2D (their normal path), and the globe becomes an SVG circle plus the same link list.
- A failed shader hides the WebGL canvas and shows a CSS gradient.

Globe URLs are limited to this origin, `cyphermonkeylabs.com`, `github.com/CypherMonkeyLabs`, and `linktr.ee/CypherMonkey`. Anything else is shown as text without a link.

## Weight

`cm-fx.js` is small. `globe3d()` is what fetches `vendor/three/three.module.js` (three.js r186, about 590KB raw). Call it when the globe is near the viewport, not during first paint. Aurora and particles do not import three.js.

## Licenses

Third-party code is listed in `LICENSES.md`. `NOTE-FOR-LUCKY.md` is the paragraph to add under `privacy.html#licenses`. This folder does not edit that page.
