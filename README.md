# Ziptype

The static website for [ziptype.app](https://ziptype.app): text shortcuts, reusable AI prompts and everyday writing workflows.

## Website

- `index.html` — homepage with an interactive, local-only shortcut demo.
- `prompts.html` — 524 reusable prompt templates, search and grouped preset copying.
- `support.html` — branded Mac setup guide and compact support disclosures.
- `privacy-policy.html` — the existing published policy, preserved unchanged by this website update. Its local-only scope needs review before public account/sync rollout.
- `terms.html` — terms draft, clearly labeled and excluded from search indexing.
- `assets/` and `fonts/` — self-hosted images, icons and Geist fonts.

This is plain HTML, CSS and JavaScript; no installation or build is needed to serve it. Publish the repository root. The current repository is connected to Vercel; hosting settings and domain routing are managed separately.

For a local preview:

```sh
python3 -m http.server 8088 --bind 127.0.0.1
```

Open http://127.0.0.1:8088/.

Run the deployable-file checks with Node.js:

```sh
node scripts/check-site.cjs
```

## Mac download

[Download Ziptype for Mac](downloads/Ziptype.dmg) — version 1.0.6 (7), macOS 13+, Apple Silicon and Intel. Developer ID signed and Apple notarized. The compact drag-and-drop installer and app are unchanged; only the download name and website labels have changed.

The owner has confirmed real-world functionality. Google sign-in/sync remains limited to configured test accounts. See [installation and compatibility notes](downloads/Ziptype-notes.txt) and [SHA-256 checksums](downloads/SHA256SUMS.txt).

Website download buttons link directly to the installer, with setup help available separately. The original installer URL is preserved for existing links.

This repository includes the approved installer, not the native app source, signing keys, credentials, user libraries or internal test builds. The Chrome extension is distributed separately through its existing Web Store listing.

## Attribution

See `ASSET-SOURCES.md`, `PROMPT-SOURCES.md`, `PROMPTS-CC0.txt` and the license files inside `assets/` and `fonts/`. Those licenses apply to their respective assets, not automatically to the entire project.

The website does not silently add presets to an extension, send demo text to AI services or collect analytics. Users copy and import the presets themselves. Named third-party applications are example workflows; editor compatibility varies.
