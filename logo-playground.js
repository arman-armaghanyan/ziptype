'use strict';
(() => {
  const board = document.querySelector('#logo-playground');
  const tiles = [...document.querySelectorAll('.warp-tile')];
  const toggle = document.querySelector('#logo-motion-toggle');
  if (!board || !tiles.length || !toggle) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false, visible = true;
  let hoveredTile = null;
  const hoverBuffer = 20;
  function clearHover() {
    if (hoveredTile) hoveredTile.classList.toggle('is-hovered', false);
    hoveredTile = null;
    board.classList.toggle('is-hovering', false);
  }
  // Enter on the real icon. Leave only beyond both its base and lifted surface.
  // This hysteresis keeps the visual steady without enlarging every click target.
  tiles.forEach(tile => tile.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || reduced.matches || drag?.active) return;
    clearHover();
    hoveredTile = tile;
    tile.classList.toggle('is-hovered', true);
    board.classList.toggle('is-hovering', true);
  }));
  document.addEventListener('pointermove', event => {
    if (!hoveredTile) return;
    const base = hoveredTile.getBoundingClientRect();
    const raised = hoveredTile.querySelector('.tile-surface').getBoundingClientRect();
    const left = Math.min(base.left, raised.left) - hoverBuffer;
    const right = Math.max(base.right, raised.right) + hoverBuffer;
    const top = Math.min(base.top, raised.top) - hoverBuffer;
    const bottom = Math.max(base.bottom, raised.bottom) + hoverBuffer;
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) clearHover();
  });
  document.addEventListener('pointerleave', clearHover);
  window.addEventListener('blur', clearHover);
  function refresh() {
    if (reduced.matches || document.hidden || !visible) clearHover();
    if (reduced.matches && browsing) { browsing = false; board.classList.toggle('is-browsing', false); }
    board.classList.toggle('is-running', !paused && !reduced.matches && !document.hidden && visible);
    board.classList.toggle('is-static', reduced.matches);
    toggle.disabled = reduced.matches;
    toggle.textContent = reduced.matches ? 'Motion reduced' : paused ? 'Play logos' : 'Pause logos';
    toggle.setAttribute('aria-pressed', String(paused || reduced.matches));
  }
  tiles.forEach(tile => tile.addEventListener('click', () => {
    tiles.forEach(item => {
      const selected = item.dataset.appName === tile.dataset.appName;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    document.querySelector('#app-name').textContent = tile.dataset.appName;
    document.querySelector('#app-shortcut').textContent = tile.dataset.shortcut;
    document.querySelector('#app-description').textContent = tile.dataset.description;
    document.querySelector('#app-prompt-link').href = 'prompts.html?category=' + encodeURIComponent(tile.dataset.category);
  }));
  const tracks = [...board.querySelectorAll('.logo-track')];
  let browsing = false;
  let offsets = [];
  function browse(delta) {
    clearHover();
    if (reduced.matches) {
      board.scrollBy({left:delta, behavior:'auto'});
      return;
    }
    if (!browsing) offsets = tracks.map(track => {
      const matrix = getComputedStyle(track).transform;
      return matrix === 'none' ? 0 : -new DOMMatrixReadOnly(matrix).m41;
    });
    offsets = tracks.map((track, index) => {
      const width = track.querySelector('.logo-set').offsetWidth;
      if (!width) return offsets[index] || 0;
      const offset = ((offsets[index] + delta) % width + width) % width;
      track.style.setProperty('--browse-offset', -offset + 'px');
      return offset;
    });
    browsing = true;
    paused = true;
    board.classList.toggle('is-browsing', true);
    refresh();
  }
  function resumeDrift() {
    if (!browsing) return;
    tracks.forEach((track,index) => {
      const width = track.querySelector('.logo-set').offsetWidth;
      const seconds = parseFloat(getComputedStyle(track).getPropertyValue('--duration')) || 60;
      track.style.animationDelay = -(offsets[index] / width * seconds) + 's';
    });
    browsing = false;
    board.classList.toggle('is-browsing', false);
  }
  document.querySelector('#logo-previous').addEventListener('click', () => browse(-280));
  document.querySelector('#logo-next').addEventListener('click', () => browse(280));
  board.addEventListener('keydown', event => {
    if (event.target !== board || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    browse(event.key === 'ArrowRight' ? 140 : -140);
  });
  board.addEventListener('wheel', event => {
    if (reduced.matches) return;
    const delta = event.shiftKey ? event.deltaY || event.deltaX : event.deltaX;
    if (!delta || (!event.shiftKey && Math.abs(event.deltaY) >= Math.abs(event.deltaX))) return;
    event.preventDefault();
    browse(delta);
  }, {passive:false});
  let drag = null, suppressClick = false;
  board.addEventListener('pointerdown', event => {
    if (event.button !== 0 || reduced.matches) return;
    drag = {id:event.pointerId, x:event.clientX, y:event.clientY, lastX:event.clientX, active:false};
    suppressClick = false;
  });
  board.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx=event.clientX-drag.x, dy=event.clientY-drag.y;
    if (!drag.active && Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>8) { drag=null; return; }
    if (!drag.active && Math.abs(dx)<8) return;
    drag.active=true;
    board.setPointerCapture(event.pointerId);
    board.classList.toggle('is-dragging', true);
    browse(drag.lastX-event.clientX);
    drag.lastX=event.clientX;
  });
  function finishDrag() {
    suppressClick=!!drag?.active;
    drag=null;
    board.classList.toggle('is-dragging', false);
  }
  board.addEventListener('pointerup', finishDrag);
  board.addEventListener('pointercancel', finishDrag);
  board.addEventListener('click', event => {
    if (!suppressClick) return;
    suppressClick=false;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  toggle.addEventListener('click', () => { paused = !paused; if (!paused) resumeDrift(); refresh(); });
  reduced.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; refresh(); }).observe(board);
  }
  refresh();
})();
