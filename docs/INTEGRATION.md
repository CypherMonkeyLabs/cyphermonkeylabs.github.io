# Integrating the trust modules

The content page owns `index.html`. It should mount the footer and the contact form once:

```html
<div id="contact-root"></div>
<div id="footer-root"></div>
<script type="module">
  import { mountContact, mountFooter } from '/js/trust/index.js';
  mountContact(document.querySelector('#contact-root'));
  mountFooter(document.querySelector('#footer-root'));
</script>
```

`mountFooter` paints the Ground Rules panel first, then repo / rate / comment / help, then the link columns. `mountContact` paints `<section id="contact">`. Do not also ship a second element with that id.

The home page content security policy has to allow the form:

```
script-src 'self' https://challenges.cloudflare.com;
connect-src 'self' https://contact.cyphermonkeylabs.com https://challenges.cloudflare.com;
frame-src https://challenges.cloudflare.com;
form-action https://contact.cyphermonkeylabs.com;
```

Leave `cml-contact-mode` at `fallback` until the Worker in `/worker` is deployed. Settings events use `cm:settings` with `theme`, `lang`, `sound`, and `motion`. The form dispatches `cm:mascot` with `celebrate` or `oops` so the mascot controller can react. This slice does not play sound; the settings owner can listen for the mascot event.

Link targets the footer expects on the home page: `#labs`, `#timeline`, `#gems`, `#about`, `#contact`. `#gems` is not in the current home page yet.
