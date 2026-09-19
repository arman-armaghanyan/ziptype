'use strict';
// Keep the compact preview disclosure reachable through a direct help link.
const previewDetails = document.getElementById('preview-notes');
function revealLinkedNotes() {
  if (location.hash === '#preview-notes') previewDetails.open = true;
}
window.addEventListener('hashchange', revealLinkedNotes);
document.querySelector('a[href="#preview-notes"]').addEventListener('click', () => {
  previewDetails.open = true;
});
revealLinkedNotes();
