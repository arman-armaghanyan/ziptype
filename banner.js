'use strict';
(() => {
  const banner = document.querySelector('#prompt-banner');
  const toggle = document.querySelector('#banner-motion-toggle');
  const visual = document.querySelector('.banner-visual');
  const typed = document.querySelector('#banner-typed');
  if (!banner || !toggle || !visual || !typed) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const trigger = '--polish';
  const duration = 10600;
  let paused = false, visible = true, running = false;
  let frame = null, elapsed = 0, lastTime = null;
  const ease = value => { const t = Math.max(0, Math.min(1, value)); return t*t*(3-2*t); };
  function render(time, still = false) {
    const t = time % duration;
    const lift = still ? 1 : ease((t-700)/650) * (1-ease((t-9350)/650));
    const open = still ? 1 : ease((t-2600)/750) * (1-ease((t-8600)/650));
    const reveal = still ? 1 : ease((t-2900)/500) * (1-ease((t-8250)/350));
    const done = still ? 1 : ease((t-3400)/400) * (1-ease((t-8250)/350));
    const typing = !still && t >= 1400 && t < 2600;
    visual.dataset.phase = still || open > .98 ? 'expanded' : typing ? 'typing' : lift > .01 ? 'lifting' : 'rest';
    typed.textContent = typing ? trigger.slice(0, Math.min(trigger.length, Math.floor((t-1400)/130))) : trigger;
    visual.style.setProperty('--card-lift', lift.toFixed(4));
    visual.style.setProperty('--card-open', open.toFixed(4));
    visual.style.setProperty('--copy-reveal', reveal.toFixed(4));
    visual.style.setProperty('--ready-reveal', done.toFixed(4));
  }
  function tick(now) {
    frame = null;
    if (!running) return;
    if (lastTime !== null) elapsed += Math.min(now-lastTime, 80);
    lastTime = now;
    render(elapsed);
    frame = requestAnimationFrame(tick);
  }
  function refresh() {
    running = !paused && !reduced.matches && !document.hidden && visible;
    banner.classList.toggle('is-running', running);
    toggle.hidden = reduced.matches;
    toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    toggle.setAttribute('aria-pressed', String(paused));
    if (reduced.matches) { elapsed = 0; render(0, true); }
    else render(elapsed);
    if (!running) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      lastTime = null;
    } else if (frame === null) {
      lastTime = null;
      frame = requestAnimationFrame(tick);
    }
  }
  toggle.addEventListener('click', () => { paused = !paused; refresh(); });
  reduced.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; refresh(); }).observe(banner);
  }
  refresh();
})();
