# Prompt library sources

Updated September 18, 2026. The library contains **524 prompts**: the existing
24 Ziptype originals plus 500 community prompts from prompts.chat. These are
reusable starting points, not model-benchmarked or guaranteed results. Review
the prompt and its output before use; placeholders need replacing manually.

## Research and reuse decisions

- [prompts.chat](https://github.com/f/prompts.chat) (formerly Awesome ChatGPT
  Prompts): selected for its broad coverage and explicitly reusable prompt data.
  Its [license notice](https://github.com/f/prompts.chat/blob/main/LICENSE)
  distinguishes MIT-licensed software from CC0 prompt data. The imported data
  uses [CC0-1.0](https://github.com/f/prompts.chat/blob/f78a1c5136fa080155d928e0d7e2b4a41ddef03e/LICENSE-CC0).
- [Awesome GPT Image 2 Prompts / Virloom](https://github.com/no-chili/awesome-gpt-image-2-prompts):
  reviewed for image-prompt organization. Its compilation/metadata license does
  not grant blanket rights to third-party prompt texts and images. No content
  was imported from it.
- [Anthropic's prompt library entry point](https://platform.claude.com/docs/en/resources/prompt-library/library)
  now redirects to [Claude prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).
  Consulted as a reference, not copied into the collection.

## Pinned import

- Source: [prompts.csv at the pinned revision](https://github.com/f/prompts.chat/blob/f78a1c5136fa080155d928e0d7e2b4a41ddef03e/prompts.csv)
- Revision: `f78a1c5136fa080155d928e0d7e2b4a41ddef03e`
- Retrieved: September 18, 2026
- CSV SHA-256: `c506bbf29106058a021e5cf85271bb97c9856c2b7fcc9f337421cdc8b00964c6`
- License copy: `PROMPTS-CC0.txt`

The 2,169-row snapshot was filtered for usable English plain-text prompts,
then a title-reviewed shortlist of 697 candidates was made. Further filters
remove duplicates, malformed entries, unsuitable/high-stakes/evasion material,
and prompts incompatible with Ziptype's native text importer. A round-robin
selection keeps smaller categories represented until 500 entries are selected.
This is editorial and automated filtering, not an exhaustive safety or quality
evaluation of every possible model response.

Source text is preserved except surrounding whitespace and CRLF normalization.
Titles and shortcuts are adapted for browsing; prompt bodies are HTML-escaped
and treated as data, never executed. Each imported record retains contributor,
source URL, license, source row, source fingerprint and selection index. The
reading dialog provides source attribution; the page also has a sources/license
disclosure. No external requests or source JSON downloads happen at runtime.

| Category | Prompts |
| --- | ---: |
| Writing | 53 |
| Work | 102 |
| Code | 103 |
| Research | 47 |
| Images | 101 |
| Video | 22 |
| Audio | 14 |
| Learning | 53 |
| Everyday | 29 |
| Total | 524 |

## Validation

This website repository includes the prebuilt catalog and HTML. The import
pipeline and integration tests live in the development workspace, alongside
the extension parser. No build is required to publish these static files.

Run the deployable-file checks with Node.js:

```sh
node scripts/check-site.cjs
```

During preparation, the importer refused unexpected source hashes. Integration
tests round-tripped all 524 presets and all nine category exports through the
actual extension parser, checking names and full text. Candidates whose headings
would be interpreted as unintended groups were excluded without editing their
bodies.

The page renders 24 cards per page with JavaScript, but search and bulk copying
cover the entire filtered collection. All full texts are static HTML for
manual no-JavaScript access. The larger HTML payload should be compressed by
the production server. No ranking or AI-citation improvement is asserted:
reused community material is useful to visitors but is not unique SEO content.
