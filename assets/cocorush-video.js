/* ============================================================
   CocoRush video player (homepage + CocoRush product pages)

   Sound
   - The video plays WITH music by default. Browsers only allow that once
     the visitor has interacted with the page, so if the browser blocks it,
     the video starts silently and the music fades in on the visitor's first
     tap, click or key press anywhere on the page.
   - The speaker button mutes/unmutes. If someone mutes it, that choice is
     remembered on their device and respected on every page.

   Not overplaying it
   - After it has played through SOUND_PLAYS times with music, it fades out
     and rests on the CocoRush pack with "Shop now" and a replay button.
   - Within one browsing session the full jingle plays once; on later
     homepage visits in the same session it plays silently unless the
     visitor turns the sound on.
   - It fades out and pauses when scrolled away, when the tab is hidden,
     and while the cart or menu is open, then picks up again.

   Hides itself if the video file is missing.
   ============================================================ */
(function () {
  'use strict';

  const SOUND_PLAYS = 2;          // full plays with music before resting on the pack
  const MAX_VOL     = 0.8;
  const KEY_MUTED   = 't2g_video_muted';   // localStorage: visitor muted it
  const KEY_HEARD   = 't2g_video_heard';   // sessionStorage: jingle already heard this session

  const store = {
    get: (s, k) => { try { return s.getItem(k); } catch (e) { return null; } },
    set: (s, k, v) => { try { v == null ? s.removeItem(k) : s.setItem(k, v); } catch (e) {} },
  };

  function mount(root) {
    if (!root || root.dataset.crReady) return;
    root.dataset.crReady = '1';

    const section = root.closest('.cr-spotlight, .cr-embed') || root;
    const video   = root.querySelector('video');
    const source  = video.querySelector('source');
    const toggle  = root.querySelector('.cr-toggle');
    const soundBt = root.querySelector('.cr-sound');
    const soundLb = root.querySelector('.cr-sound-label');
    const replay  = root.querySelector('.cr-replay');
    const bar     = root.querySelector('.cr-progress i');
    const productAt = parseFloat(root.dataset.productAt || '6.5');

    const userMuted  = store.get(localStorage, KEY_MUTED) === '1';
    const heardAlready = store.get(sessionStorage, KEY_HEARD) === '1';
    let wantSound  = !userMuted && !heardAlready;   // what we're aiming for
    let userPaused = false;
    let ended      = false;
    let visible    = false;
    let covered    = false;    // cart or menu open
    let soundPlays = 0;
    let lastT      = 0;
    let fadeTimer  = null;

    source.addEventListener('error', () => { section.hidden = true; });

    /* ── volume fades ── */
    function fade(to, ms, done) {
      clearInterval(fadeTimer);
      if (video.muted) { video.volume = to; if (done) done(); return; }
      const from = video.volume, steps = Math.max(1, Math.round(ms / 30));
      let n = 0;
      fadeTimer = setInterval(() => {
        n++;
        video.volume = Math.min(1, Math.max(0, from + (to - from) * (n / steps)));
        if (n >= steps) { clearInterval(fadeTimer); if (done) done(); }
      }, 30);
    }

    /* ── UI state ── */
    function sync() {
      const playing = !video.paused;
      const soundOn = !video.muted;
      root.classList.toggle('is-playing', playing);
      root.classList.toggle('has-sound', soundOn);
      root.classList.toggle('is-ended', ended);
      toggle.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
      soundBt.setAttribute('aria-pressed', String(soundOn));
      soundBt.setAttribute('aria-label', soundOn ? 'Mute' : 'Turn sound on');
      if (soundLb) soundLb.textContent = soundOn ? '' : (wantSound ? 'Tap for sound' : 'Sound off');
      soundBt.classList.toggle('show-label', !soundOn && wantSound);
    }

    /* ── play with sound if allowed, otherwise silently ── */
    function start() {
      if (ended || userPaused || !visible || covered || document.hidden) return;
      if (wantSound) {
        video.muted = false;
        video.volume = 0;
        video.play().then(() => fade(MAX_VOL, 700)).catch(() => {
          video.muted = true;                    // browser wants a tap first
          video.play().catch(sync);
          waitForFirstInteraction();
        });
      } else {
        video.muted = true;
        video.play().catch(sync);
      }
    }
    function stopSoftly() {
      if (video.paused) return;
      fade(0, 300, () => { video.pause(); });
    }

    /* First tap/click/key anywhere unlocks sound (the browser allows it then) */
    let waiting = false;
    function waitForFirstInteraction() {
      if (waiting) return;
      waiting = true;
      const unlock = e => {
        if (soundBt.contains(e.target) || toggle.contains(e.target)) return;   // buttons handle themselves
        ['pointerdown', 'keydown', 'touchend'].forEach(t => document.removeEventListener(t, unlock, true));
        waiting = false;
        if (!wantSound) return;
        video.muted = false;
        video.volume = 0;
        if (!video.paused) fade(MAX_VOL, 900);
        sync();
      };
      ['pointerdown', 'keydown', 'touchend'].forEach(t => document.addEventListener(t, unlock, true));
    }

    /* ── count plays with sound, then rest on the pack ── */
    function onTime() {
      const t = video.currentTime;
      if (t + 0.5 < lastT && !video.muted) soundPlays++;          // a full play with music just finished
      lastT = t;
      // during the last play with music, stop looping so it ends on the pack
      if (!ended && !video.muted && soundPlays >= SOUND_PLAYS - 1 && video.duration && t > video.duration - 1.5) finish();
    }
    function finish() {
      if (ended) return;
      ended = true;                                  // stops start() and further counting
      store.set(sessionStorage, KEY_HEARD, '1');
      video.loop = false;                            // let this last play run out on the pack
      root.classList.add('show-chip');
      // fade the music out over the final second; the video then stops by
      // itself on its last frame (the pack), because looping is off
      const left = Math.max(0, ((video.duration || 0) - video.currentTime) / (video.playbackRate || 1));
      setTimeout(() => fade(0, 900), Math.max(0, left * 1000 - 900));
      video.addEventListener('ended', () => { video.volume = MAX_VOL; sync(); }, { once: true });
      sync();
    }

    /* ── progress line + shop tag ── */
    let raf = 0;
    function tick() {
      const d = video.duration || 0;
      if (d && bar) bar.style.transform = `scaleX(${video.currentTime / d})`;
      root.classList.toggle('show-chip', ended || video.currentTime >= productAt);
      raf = video.paused ? 0 : requestAnimationFrame(tick);
    }

    ['play', 'pause', 'volumechange', 'loadeddata'].forEach(ev => video.addEventListener(ev, sync));
    video.addEventListener('play', () => { if (!raf) raf = requestAnimationFrame(tick); });
    video.addEventListener('timeupdate', onTime);

    /* ── buttons ── */
    toggle.addEventListener('click', () => {
      if (video.paused) {
        userPaused = false;
        if (ended) return restart();
        if (!video.muted) { video.volume = 0; video.play().then(() => fade(MAX_VOL, 500)); }
        else video.play().catch(() => {});
      } else {
        userPaused = true;
        stopSoftly();
      }
    });

    soundBt.addEventListener('click', () => {
      if (video.muted) {
        wantSound = true;
        store.set(localStorage, KEY_MUTED, null);
        video.muted = false;
        video.volume = 0;
        if (ended) return restart();
        if (video.paused && !userPaused) video.play().catch(() => {});
        fade(MAX_VOL, 600);
      } else {
        wantSound = false;
        store.set(localStorage, KEY_MUTED, '1');
        fade(0, 250, () => { video.muted = true; video.volume = MAX_VOL; sync(); });
      }
      sync();
    });

    function restart() {
      ended = false;
      video.loop = true;
      soundPlays = 0;
      lastT = 0;
      userPaused = false;
      root.classList.remove('show-chip');
      video.currentTime = 0;
      if (wantSound) { video.muted = false; video.volume = 0; }
      video.play().then(() => { if (!video.muted) fade(MAX_VOL, 600); }).catch(() => {});
      sync();
    }
    if (replay) replay.addEventListener('click', restart);

    /* ── pause when not seen ── */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(e => { visible = e.isIntersecting; if (visible) start(); else stopSoftly(); });
      }, { threshold: 0.3 }).observe(video);
    } else {
      visible = true;
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopSoftly(); else start(); });

    /* Quiet while the cart or menu is open */
    const overlays = ['cart-overlay', 'mobile-menu', 'pm-overlay'].map(id => document.getElementById(id)).filter(Boolean);
    if (overlays.length && 'MutationObserver' in window) {
      const check = () => {
        const nowCovered = overlays.some(el => el.classList.contains('open'));
        if (nowCovered === covered) return;
        covered = nowCovered;
        if (covered) stopSoftly(); else start();
      };
      overlays.forEach(el => new MutationObserver(check).observe(el, { attributes: true, attributeFilter: ['class'] }));
    }

    sync();
    if (!('IntersectionObserver' in window)) start();
  }

  /* Markup for pages that add the video with JavaScript (product pages) */
  function markup(opts) {
    opts = opts || {};
    return `
      <figure class="cr-media" data-product-at="${opts.productAt || 6.5}">
        <video class="cr-video" muted loop playsinline preload="metadata" poster="/assets/img/cocorush-poster.jpg"
          aria-label="Short video with music: a spoonful of CocoRush coconut sugar stirred into coffee at a breakfast table, then the CocoRush coconut sugar pack">
          <source src="/assets/video/cocorush.mp4" type="video/mp4">
        </video>
        ${opts.chip === false ? '' : `<a class="cr-chip" href="/product/cocorush-500g" tabindex="-1" aria-hidden="true"><span class="cr-chip-name">CocoRush 500 g</span><span class="cr-chip-price" data-price-for="cocorush-500g">PHP 190.00</span><span class="cr-chip-cta">Shop now &rarr;</span></a>`}
        ${controlsHtml()}
        <div class="cr-progress" aria-hidden="true"><i></i></div>
      </figure>`;
  }
  function controlsHtml() {
    return `
        <div class="cr-controls">
          <button type="button" class="cr-replay" aria-label="Replay video">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>
            <span>Replay</span>
          </button>
          <button type="button" class="cr-sound" aria-pressed="false" aria-label="Turn sound on">
            <svg class="cr-i-muted" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
            <svg class="cr-i-sound" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
            <span class="cr-sound-label"></span>
          </button>
          <button type="button" class="cr-toggle" aria-label="Pause video">
            <svg class="cr-i-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
            <svg class="cr-i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>
          </button>
        </div>`;
  }

  window.T2GVideo = { mount, markup };
  const auto = () => document.querySelectorAll('.cr-media[data-cr-auto]').forEach(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
