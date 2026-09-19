'use strict';

function matchesPrompt(record, query, category) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return (category === 'all' || record.category === category) && words.every(word => record.search.includes(word));
}
const promptCards = [...document.querySelectorAll('[data-prompt-card]')].map(element => ({
  element, category: element.dataset.category,
  title: element.querySelector('h2').textContent,
  shortcut: element.querySelector('[data-shortcut]').textContent.trim(),
  text: element.querySelector('[data-prompt-text]').textContent.trim(),
  source: element.querySelector('[data-prompt-source]'),
  search: element.textContent.toLocaleLowerCase()
}));
const categoryNames = {writing: 'Writing', work: 'Work', code: 'Code', research: 'Research', image: 'Images', video: 'Video', audio: 'Audio', learning: 'Learning', everyday: 'Everyday'};
function serializeZiptypeGroup(cards, groupPath = []) {
  const group = groupPath.length ? '\n' + groupPath.map(name => name.replace(/\\/g, '\\\\').replace(/\//g, '\\/')).join(' / ') + ':\n' : '';
  return group + cards.map(card => card.shortcut + ' →\n' + card.text).join('\n\n');
}
function serializeZiptypePresets(cards, groupName = '') {
  return '─ Ziptype presets ─\n' + serializeZiptypeGroup(cards, groupName ? [groupName] : []);
}
function serializeZiptypeLibrary(cards) {
  const groups = Object.entries(categoryNames).flatMap(([category, name]) => {
    const matches = cards.filter(card => card.category === category);
    return matches.length ? [serializeZiptypeGroup(matches, ['Prompt library', name])] : [];
  });
  return '─ Ziptype presets ─\n\nPrompt library:\n' + groups.join('\n');
}
const promptSearch = document.querySelector('#prompt-search');
const categoryFilters = [...document.querySelectorAll('[data-filter]')];
const validCategories = new Set(categoryFilters.map(button => button.dataset.filter));
const initialCategory = new URLSearchParams(location.search).get('category');
let activeCategory = validCategories.has(initialCategory) ? initialCategory : 'all';
const pageSize = 24;
let currentPage = 1;
let filteredCards = [];
function renderPromptFilters(resetPage = true) {
  if (resetPage !== false) currentPage = 1;
  filteredCards = promptCards.filter(card => matchesPrompt(card, promptSearch.value, activeCategory));
  const count = filteredCards.length;
  const pages = Math.max(1, Math.ceil(count / pageSize));
  currentPage = Math.min(currentPage, pages);
  const visible = new Set(filteredCards.slice((currentPage - 1) * pageSize, currentPage * pageSize));
  promptCards.forEach(card => { card.element.hidden = !visible.has(card); });
  document.querySelector('.catalog-pagination').hidden = count <= pageSize;
  document.querySelector('#previous-page').disabled = currentPage === 1;
  document.querySelector('#next-page').disabled = currentPage === pages;
  document.querySelector('#page-summary').textContent = count ? 'Page ' + currentPage + ' of ' + pages + ' · ' + count + ' prompts' : 'No prompts';
  categoryFilters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeCategory)));
  document.querySelector('#prompt-count').textContent = count + (count === 1 ? ' prompt' : ' prompts');
  document.querySelector('#prompt-empty').hidden = count > 0;
  const copyVisible = document.querySelector('#copy-visible');
  copyVisible.disabled = count === 0;
  const groupName = categoryNames[activeCategory];
  copyVisible.setAttribute('aria-label', count ? 'Copy ' + (groupName ? groupName + ' group' : 'Prompt library with category subfolders') + ' (' + count + ' presets) to Ziptype' : 'No presets to copy');
  copyVisible.textContent = count ? (groupName ? 'Copy group (' : 'Copy all (') + count + ')' : 'No matches';
}
function updateCategory(category) {
  activeCategory = validCategories.has(category) ? category : 'all';
  renderPromptFilters();
  const url = new URL(location.href);
  if (activeCategory === 'all') url.searchParams.delete('category');
  else url.searchParams.set('category', activeCategory);
  history.replaceState(null, '', url);
}
categoryFilters.forEach(button => button.addEventListener('click', () => updateCategory(button.dataset.filter)));
promptSearch.addEventListener('input', renderPromptFilters);
document.querySelector('#clear-filters').addEventListener('click', () => {
  promptSearch.value = '';
  updateCategory('all');
  promptSearch.focus();
});
const copyStatus = document.querySelector('#copy-status');
const copyDialog = document.querySelector('#copy-fallback');
const manualCopy = document.querySelector('#manual-copy-text');
let toastTimer;
let copyGeneration = 0;
async function copyPromptValue(text, kind, button, groupLabel = '') {
  const isPreset = kind === 'preset' || kind === 'library';
  const importHint = kind === 'library'
    ? 'Paste into the extension’s library. Mac: Settings → Import from text, review, then import the folders.'
    : 'Paste into the extension’s library. Mac: Settings → Import from text, review, then import.';
  const generation = ++copyGeneration;
  button.disabled = true;
  clearTimeout(toastTimer);
  copyStatus.classList.remove('is-visible');
  document.querySelector('#reader-status').textContent = '';
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    if (generation !== copyGeneration) return;
    copyStatus.textContent = isPreset ? (groupLabel ? groupLabel + ' copied. ' : 'Copied for Ziptype. ') + importHint : kind === 'prompt' ? 'Prompt text copied.' : 'Shortcut copied.';
    if (promptReader.open) document.querySelector('#reader-status').textContent = copyStatus.textContent;
    copyStatus.classList.add('is-visible');
    toastTimer = setTimeout(() => copyStatus.classList.remove('is-visible'), 6500);
  } catch {
    if (generation !== copyGeneration) return;
    copyStatus.textContent = '';
    manualCopy.value = text;
    document.querySelector('#manual-copy-hint').textContent = isPreset ? 'Copy the full text below. ' + importHint + ' Use an empty area of the library, not its search box.' : 'Your browser couldn’t access the clipboard. Select the text below and use your usual copy command.';
    if (!copyDialog.open) copyDialog.showModal();
    manualCopy.focus();
    manualCopy.select();
  } finally {
    button.disabled = false;
    if (button === document.querySelector('#copy-visible')) renderPromptFilters(false);
  }
}
promptCards.forEach(card => card.element.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', () => copyPromptValue(button.dataset.copy === 'preset' ? serializeZiptypePresets([card]) : button.dataset.copy === 'shortcut' ? card.shortcut : card.text, button.dataset.copy, button));
}));
document.querySelector('#copy-visible').addEventListener('click', event => {
  const matches = filteredCards; // Copy all matching pages, preserving the category hierarchy.
  if (!matches.length) return;
  const groupName = categoryNames[activeCategory];
  const payload = groupName ? serializeZiptypePresets(matches, groupName) : serializeZiptypeLibrary(matches);
  const label = groupName ? groupName + ' group' : 'Prompt library with category subfolders';
  return copyPromptValue(payload, groupName ? 'preset' : 'library', event.currentTarget, label);
});
// Keep the complete text in each native disclosure for no-JavaScript access.
// With JavaScript, a shared reader avoids expanding/reflowing the card grid.
const promptReader = document.querySelector('#prompt-reader');
let readerCard = null;
promptCards.forEach(card => card.element.querySelector('.prompt-preview summary').addEventListener('click', event => {
  if (typeof promptReader.showModal !== 'function') return;
  event.preventDefault();
  readerCard = card;
  document.querySelector('#reader-title').textContent = card.title;
  document.querySelector('#reader-category').textContent = categoryNames[card.category];
  document.querySelector('#reader-shortcut').textContent = card.shortcut;
  document.querySelector('#reader-status').textContent = '';
  const readerText = document.querySelector('#reader-text');
  readerText.textContent = card.text;
  readerText.scrollTop = 0;
  const source = document.querySelector('#reader-source');
  source.hidden = !card.source;
  source.textContent = card.source ? card.source.textContent : '';
  if (card.source?.href) source.setAttribute('href', card.source.href);
  else source.removeAttribute('href');
  promptReader.showModal();
}));
document.querySelector('#reader-copy-text').addEventListener('click', event => {
  if (readerCard) return copyPromptValue(readerCard.text, 'prompt', event.currentTarget);
});
document.querySelector('#reader-copy-preset').addEventListener('click', event => {
  if (readerCard) return copyPromptValue(serializeZiptypePresets([readerCard]), 'preset', event.currentTarget);
});
promptReader.addEventListener('click', event => {
  if (event.target !== promptReader) return;
  const bounds = promptReader.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) promptReader.close();
});
document.querySelector('#select-copy-text').addEventListener('click', () => { manualCopy.focus(); manualCopy.select(); });
renderPromptFilters();
function changePromptPage(delta) {
  const pages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
  currentPage = Math.max(1, Math.min(pages, currentPage + delta));
  renderPromptFilters(false);
  const results = document.querySelector('#catalog-results');
  results.focus({preventScroll:true});
  results.scrollIntoView({block:'start', behavior:'instant'});
}
document.querySelector('#previous-page').addEventListener('click', () => changePromptPage(-1));
document.querySelector('#next-page').addEventListener('click', () => changePromptPage(1));
