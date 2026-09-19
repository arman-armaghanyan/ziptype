'use strict';

const examples = {
  intro: { trigger: '/intro', title: 'The start of something good.', context: 'Your next great introduction', text: 'Hey Alex,\n\nSo nice to meet you! I’d love to hear more about what you’re working on and see how we could make something great together.\n\nLet’s find a time to chat.' },
  prompt: { trigger: '/polish', title: 'A better starting point.', context: 'Your best prompt, ready to reuse', text: 'Rewrite the text below for clarity and flow. Keep my natural voice, use plain language, and make every sentence earn its place.\n\nHere’s the text:\n' },
  signature: { trigger: '/sig', title: 'Leave a good last impression.', context: 'Your sign-off, sorted', text: 'All the best,\nAlex Morgan\nProduct Designer\n\nThoughtful work. Good company.' }
};
const editor = document.querySelector('#demo-editor');
const reset = document.querySelector('#demo-reset');
const status = document.querySelector('#demo-status');
const snippets = [...document.querySelectorAll('[data-example]')];
let activeExample = 'prompt';
const ghost = document.querySelector('#demo-ghost');
const ghostBefore = document.querySelector('#ghost-before');
const ghostText = document.querySelector('#ghost-text');
const ghostAfter = document.querySelector('#ghost-after');
const acceptSuggestion = document.querySelector('#accept-suggestion');
const editorCard = document.querySelector('.message-card');
let suggestion = null;
let composing = false;
function getSuggestion() {
  if (composing || editor.selectionStart !== editor.selectionEnd) return null;
  const cursor = editor.selectionStart;
  const match = editor.value.slice(0, cursor).match(/(?:^|\s)(\/[a-z]+)$/);
  if (!match) return null;
  const token = match[1];
  const key = Object.keys(examples).find(name => examples[name].trigger.startsWith(token));
  return key ? {key, token, start:cursor-token.length, end:cursor} : null;
}
function clearSuggestion() {
  suggestion = null;
  ghost.hidden = true;
  editor.style.height = '';
  acceptSuggestion.hidden = true;
  editorCard.classList.toggle('has-suggestion', false);
}
function previewSuggestion(expandComplete = false) {
  const next = getSuggestion();
  if (!next) { clearSuggestion(); status.textContent = ''; return; }
  const changed = !suggestion || suggestion.key !== next.key;
  suggestion = next;
  const example = examples[next.key];
  if (next.token === example.trigger) {
    if (expandComplete) insertSuggestion();
    else clearSuggestion();
    return;
  }
  // Mirror only the typed prefix; the faint suffix completes the shortcut, not its expansion.
  ghostBefore.textContent = editor.value.slice(0, next.end);
  ghostText.textContent = example.trigger.slice(next.token.length);
  ghostAfter.textContent = editor.value.slice(next.end);
  ghost.hidden = false;
  acceptSuggestion.hidden = false;
  editorCard.classList.toggle('has-suggestion', true);
  ghost.scrollTop = editor.scrollTop;
  if (changed) {
    updateExampleUI(next.key);
    status.textContent = examples[next.key].trigger + ' autocomplete available. Press Tab to insert, keep typing to expand, or Escape to dismiss.';
  }
}
function insertSuggestion() {
  // Re-check the cursor and value: a stale preview must never replace unrelated text.
  const current = getSuggestion();
  if (!suggestion || !current || current.key !== suggestion.key) return false;
  const example = examples[current.key];
  editor.setRangeText(example.text, current.start, current.end, 'end');
  updateExampleUI(current.key);
  clearSuggestion();
  reset.hidden = false;
  editorCard.classList.toggle('is-inserted', true);
  status.textContent = 'Prompt inserted. You can keep editing.';
  return true;
}
function updateExampleUI(key) {
  activeExample = key;
  const example = examples[key];
  snippets.forEach(button => {
    const selected = button.dataset.example === key;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('#demo-title').textContent = 'How can I help?';
  document.querySelector('#demo-context').textContent = example.context;
  const shortcut = document.createElement('kbd');
  shortcut.textContent = example.trigger;
  document.querySelector('#demo-hint').replaceChildren('Try ', shortcut);
  editor.placeholder = 'Type ' + example.trigger + ' to try Ziptype…';
}
function selectExample(key) {
  updateExampleUI(key);
  editor.value = '';
  clearSuggestion();
  editorCard.classList.toggle('is-inserted', false);
  reset.hidden = true;
  status.textContent = '';
}
snippets.forEach(button => button.addEventListener('click', () => selectExample(button.dataset.example)));

const extensionToggle = document.querySelector('#extension-toggle');
const extensionPopup = document.querySelector('#extension-popup');
const extensionMore = document.querySelector('#extension-more');
const extensionMenu = document.querySelector('#extension-menu');
function closeExtensionMenu() {
  extensionMenu.hidden = true;
  extensionMore.setAttribute('aria-expanded', 'false');
}
extensionMore.addEventListener('click', () => {
  extensionMenu.hidden = !extensionMenu.hidden;
  extensionMore.setAttribute('aria-expanded', String(!extensionMenu.hidden));
});
let extensionOpen = true;
let extensionHideTimer = null;
const demoMotion = matchMedia('(prefers-reduced-motion: reduce)');
function toggleExtension(open, returnFocus = false) {
  closeExtensionMenu();
  clearTimeout(extensionHideTimer);
  extensionOpen = open;
  extensionPopup.inert = !open;
  extensionPopup.setAttribute('aria-hidden', String(!open));
  if (open) {
    extensionPopup.hidden = false;
    void extensionPopup.offsetWidth; // Establish the closed frame before reversing the transition.
  }
  extensionPopup.classList.toggle('is-closed', !open);
  extensionToggle.setAttribute('aria-expanded', String(open));
  extensionToggle.setAttribute('aria-label', (open ? 'Close' : 'Open') + ' Ziptype extension demo');
  document.querySelector('.chrome-page').classList.toggle('extension-collapsed', !open);
  if (!open) {
    if (demoMotion.matches) extensionPopup.hidden = true;
    else extensionHideTimer = setTimeout(() => { if (!extensionOpen) extensionPopup.hidden = true; }, 300);
  }
  if (returnFocus) extensionToggle.focus();
}
extensionToggle.addEventListener('click', () => toggleExtension(!extensionOpen));
document.querySelector('#extension-close').addEventListener('click', () => toggleExtension(false, true));
extensionPopup.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); toggleExtension(false, true); }
});
document.querySelector('#snippet-search').addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase();
  let count = 0;
  snippets.forEach(button => {
    const example = examples[button.dataset.example];
    const matches = (button.textContent + ' ' + example.trigger + ' ' + example.context + ' ' + example.text).toLowerCase().includes(query);
    button.hidden = !matches;
    if (matches) count++;
  });
  document.querySelector('#snippet-empty').hidden = count !== 0;
  document.querySelector('#snippet-count').textContent = count + (query ? ' found' : ' saved');
});
editor.addEventListener('input', event => {
  editorCard.classList.toggle('is-inserted', false);
  if (!event.isComposing && !composing) previewSuggestion(true);
});
editor.addEventListener('compositionstart', () => { composing = true; clearSuggestion(); });
editor.addEventListener('compositionend', () => { composing = false; previewSuggestion(true); });
editor.addEventListener('click', () => previewSuggestion());
editor.addEventListener('select', () => { if (editor.selectionStart !== editor.selectionEnd) clearSuggestion(); });
editor.addEventListener('keyup', event => { if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) previewSuggestion(); });
editor.addEventListener('scroll', () => { ghost.scrollTop = editor.scrollTop; ghost.scrollLeft = editor.scrollLeft; });
editor.addEventListener('keydown', event => {
  if (event.isComposing || composing) return;
  if (event.key === 'Escape' && suggestion) { event.preventDefault(); clearSuggestion(); status.textContent = 'Preview dismissed.'; }
  if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && insertSuggestion()) event.preventDefault();
});
acceptSuggestion.addEventListener('click', () => { if (insertSuggestion()) editor.focus(); });

reset.addEventListener('click', () => { selectExample(activeExample); editor.focus(); });

const useCases = {
  email: { category: 'Gmail', trigger: '/followup', text: 'Hey Alex,\n\nJust a quick follow-up on our conversation. Let me know if you have any questions — happy to help.\n\nLooking forward to hearing what you think!' },
  ai: { category: 'ChatGPT', trigger: '/clarify', text: 'Act as a thoughtful editor.\n\nMake the following text clearer and more concise. Keep the original meaning and my tone of voice. Avoid jargon.\n\nExplain your three most important changes.' },
  details: { category: 'Google Docs', trigger: '/contact', text: 'Alex Morgan\nProduct Designer\n\nalex@example.com\nAvailable Monday–Friday, 9am–5pm.\n\nLet’s make something thoughtful.' }
};
const useTabs = [...document.querySelectorAll('[data-use]')];
function selectUse(button) {
  const example = useCases[button.dataset.use];
  useTabs.forEach(tab => { const active = tab === button; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
  document.querySelector('#use-panel').setAttribute('aria-labelledby', button.id);
  document.querySelector('#use-category').textContent = example.category;
  document.querySelector('#use-trigger').textContent = example.trigger;
  document.querySelector('#use-text').textContent = example.text;
  document.querySelectorAll('.app-preview').forEach(preview => { preview.hidden = preview.dataset.motionScene !== button.dataset.use; });
  refreshMotion(true);
}
useTabs.forEach((button, index) => {
  button.addEventListener('click', () => selectUse(button));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % useTabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + useTabs.length - 1) % useTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = useTabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectUse(useTabs[next]);
    useTabs[next].focus();
  });
});


/** Illustrative typing model. Retrieval assumptions are user-editable, not benchmarks. */
function calculateSavings(words, uses, wpm, notesSeconds, clipboardSeconds) {
  const typing = words / wpm * 60;
  const shortcut = 6 / (wpm * 5) * 60;
  const dailySeconds = Math.max(0, typing - shortcut) * uses;
  return { typing, shortcut, notes: notesSeconds, clipboard: clipboardSeconds,
    dailyMinutes: dailySeconds / 60, monthlyHours: dailySeconds * 22 / 3600 };
}
const calculatorFields = ['words', 'uses', 'wpm', 'notes', 'clipboard'].map(name => document.querySelector('#calc-' + name));
function renderSavings() {
  if (calculatorFields.some(field => field.value === '' || !field.validity.valid)) {
    document.querySelector('#calculator-summary').textContent = 'Enter values within the displayed field limits to update the estimate.';
    return;
  }
  const result = calculateSavings(...calculatorFields.map(field => Number(field.value)));
  const format = value => Number(value.toFixed(1)).toLocaleString('en-US') + ' s';
  for (const key of ['typing', 'notes', 'clipboard', 'shortcut']) {
    const output = document.querySelector('#' + key + '-seconds');
    if (key === 'typing' || key === 'shortcut') {
      const unit = document.createElement('span');
      const inMinutes = result[key] >= 600;
      unit.textContent = inMinutes ? ' min' : ' sec';
      output.replaceChildren(Number((result[key] / (inMinutes ? 60 : 1)).toFixed(1)).toLocaleString('en-US'), unit);
    } else output.textContent = format(result[key]);
  }
  document.querySelector('#monthly-hours').textContent = result.monthlyHours.toFixed(1);
  document.querySelector('#calculator-summary').textContent = 'About ' + result.dailyMinutes.toFixed(1) + ' minutes of typing avoided a day.';
}
calculatorFields.forEach(field => field.addEventListener('input', renderSavings));

// Only animate visible scenes. Pause controls are shared; tab changes never steal focus.
// Expanded text remains readable with JavaScript off or reduced motion enabled.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const motionButtons = [...document.querySelectorAll('[data-motion-toggle]')];
const motionExamples = {
  ...useCases,
  thanks: {trigger:'/thanks', text:'Thanks for reaching out. Happy to help!'},
  workflow: {trigger:'/summary', text:'Summarize this in three clear, actionable points.'},
  library: {trigger:'', text:''}
};
let motionPaused = false;
const motionScenes = [...document.querySelectorAll('[data-motion-scene]')].map(element => ({
  element, text: element.querySelector('[data-animate-text]'),
  example: motionExamples[element.dataset.motionScene], visible: false,
  timer: null, generation: 0, step: 0
}));
function stopScene(scene, showExpanded = false) {
  clearTimeout(scene.timer);
  scene.timer = null;
  scene.generation++;
  if (showExpanded) {
    scene.element.dataset.phase = 'expanded';
    if (scene.text) scene.text.textContent = scene.example.text;
  }
}
function startScene(scene) {
  if (scene.timer !== null) return;
  const generation = ++scene.generation;
  scene.step = 0;
  const schedule = (callback, delay) => { scene.timer = setTimeout(() => {
    scene.timer = null;
    if (generation === scene.generation) callback();
  }, delay); };
  function begin() {
    scene.element.dataset.phase = 'idle';
    if (scene.text) scene.text.textContent = '';
    scene.step = 0;
    schedule(type, 650);
  }
  function type() {
    scene.element.dataset.phase = 'typing';
    if (scene.text) scene.text.textContent = scene.example.trigger.slice(0, ++scene.step);
    if (scene.step < scene.example.trigger.length) schedule(type, 110);
    else schedule(expand, 260);
  }
  function expand() {
    scene.element.dataset.phase = 'expanded';
    if (scene.text) scene.text.textContent = scene.example.text;
    schedule(begin, 4200);
  }
  begin();
}
function refreshMotion(restart = false) {
  const reduced = motionPreference.matches;
  motionButtons.forEach(button => {
    button.textContent = reduced ? 'Reduced motion on' : motionPaused ? 'Play animations' : 'Pause animations';
    button.setAttribute('aria-pressed', String(motionPaused || reduced));
    button.disabled = reduced;
  });
  motionScenes.forEach(scene => {
    if (restart) stopScene(scene);
    if (motionPaused || reduced) stopScene(scene, true);
    else if (!scene.visible || scene.element.hidden || document.hidden) stopScene(scene);
    else startScene(scene);
  });
}
motionButtons.forEach(button => button.addEventListener('click', () => { motionPaused = !motionPaused; refreshMotion(); }));
motionPreference.addEventListener('change', () => refreshMotion(true));
document.addEventListener('visibilitychange', () => refreshMotion());
if ('IntersectionObserver' in globalThis) {
  const sceneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const scene = motionScenes.find(item => item.element === entry.target);
      if (scene) scene.visible = entry.isIntersecting;
    });
    refreshMotion();
  }, {threshold:0.15});
  motionScenes.forEach(scene => sceneObserver.observe(scene.element));
}
refreshMotion();
