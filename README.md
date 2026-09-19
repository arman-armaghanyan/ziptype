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

## Mac preview download

[Download Ziptype 1.0.6 (7) for Mac](downloads/Ziptype-1.0.6-preview-r2.dmg) — macOS 13+, Apple Silicon and Intel. Developer ID signed and Apple notarized. Installer revision 2 adds the branded drag-to-Applications window; the app itself is unchanged.

**Preview, not a stable release:** real-app text expansion is still being verified; Google sign-in/sync is limited to configured test accounts. Back up an existing library and start with disposable, non-sensitive shortcuts. See [installation and limitations](downloads/Ziptype-1.0.6-preview-r2-notes.txt) and [SHA-256 checksums](downloads/SHA256SUMS.txt).

Website download buttons link directly to the installer, with setup help available separately. The original installer URL is preserved for existing links.

This repository includes the approved preview installer, not the native app source, signing keys, credentials, user libraries or internal test builds. The Chrome extension is distributed separately through its existing Web Store listing.

## Attribution

See `ASSET-SOURCES.md`, `PROMPT-SOURCES.md`, `PROMPTS-CC0.txt` and the license files inside `assets/` and `fonts/`. Those licenses apply to their respective assets, not automatically to the entire project.

The website does not silently add presets to an extension, send demo text to AI services or collect analytics. Users copy and import the presets themselves. Named third-party applications are example workflows; editor compatibility varies.
