# Co-Design Bench project page

Static project page for *Co-Design Bench: Multimodal Collaborative Coding Evaluation for Agentic Models*. Plain HTML, CSS and JavaScript: no build step, no framework, no third-party requests at runtime. Colours follow the paper's figure palette.

## Preview locally

```bash
python3 -m http.server 8000      # run inside this folder, then open http://localhost:8000/
```

Opening `index.html` directly from disk also works.

## Publish on GitHub Pages

For organization setup and deployment steps in Chinese, see [DEPLOY.md](DEPLOY.md).

Copy **the contents of this folder** (including the hidden `.nojekyll` and `.github/`) to the root of a repository, then either:

- **GitHub Actions (recommended):** *Settings → Pages → Build and deployment → Source: GitHub Actions*, then push to `main`. The bundled workflow `.github/workflows/pages.yml` publishes only the site files.
- **Deploy from a branch:** *Source: Deploy from a branch → `main` / root*. Delete `.github/workflows/pages.yml` in that case.

A repository named `<account>.github.io` serves at `https://<account>.github.io/`; any other name, e.g. `co-design-bench`, serves at `https://<account>.github.io/co-design-bench/`. All paths are relative, so both work unchanged.

## What is on the page

| Section | Source |
| --- | --- |
| Leaderboard (overall, ME, RE; completion and rollout views) | Tables 2 and 5 |
| Rank shift, delivery gap, breakdown explorer | Table 2, Table 5, Figure 4, Figure 9, Table 6 |
| Taxonomy, comparison table, pipeline | Figure 8, Table 1, Figure 2 (rebuilt in HTML) |
| Saturation chart | Figure 1(a) and Table 4 |
| Three example tasks with evaluator targets | Receipt and audit cases from Figure 5; title-animation task `7d7953f8` from the public ME set |
| Per-task scores and model outputs | Frozen qwen3.8-max-0902 runs for all three example tasks |
| Agent run | Archived qwen3.8-max-0902 trajectory for title-animation task `7d7953f8` (Track 1 only) |
| Evaluation pipeline | Figure 3 |

Leaderboard, chart, task and run data live in `data/site-data.json` (mirrored as `data/site-data.js` so the page also works from `file://`); headline figures in the prose are written directly in `index.html`. Completion values keep the paper's 0–1 scale in the data; the page displays them as percentages.

The video example features qwen3.8-max-0902 alongside the original six-second text-animation reference and annotated page from the 2026-10-21 public release. Its final workspace was matched to the frozen paper job through the archive ledger and solve-trace SHA-256. The screenshot and recording show the unchanged archived application at a 1440 × 900 viewport; the recording visits the hero, routine title and quotation in order. Timeline images are actual observations decoded from the matching transcript. The run passes all six criteria. Videos have playback controls and do not autoplay.

## Before publishing — please check

- **Repository.** Use a new, dedicated repository; do not enable Pages on the paper repository.
- **Link previews.** `og:image` and `twitter:image` use `https://codesignbench.github.io/assets/social.png`. Update both if the deployment domain changes.
- **Authors.** The author list and affiliations are written in `index.html`. The BibTeX block there is empty for now; the Copy button appears once it has text.
- **Paper PDF.** `paper/co-design-bench.pdf` is the arXiv PDF (2026-10-16). It contains the paper's Repository Editing examples (Figure 1b, Figure 6); the page itself shows only aggregate RE results.
- **Code and dataset links.** None are shown yet. Add buttons in the hero once public URLs exist.
- **Task material.** All three displayed tasks (`f725ea72`, `b0e36f34`, `7d7953f8`) belong to the 96-task public ME release. The agent-run section uses `7d7953f8`. The public release has 521 criteria; the paper's aggregate results still cover the full 273-task evaluation set. The bundled paper is the published version, with its original figures.

## Files

| Path | Purpose |
| --- | --- |
| `index.html`, `style.css`, `app.js` | Page, styles, interactive views |
| `data/site-data.{js,json}` | Leaderboard, chart, task and run data |
| `assets/` | Logo, model marks, task screenshots and renders, original text-animation video, final-output recordings, agent-run observations, Figure 3 |
| `vendor/` | DM Sans and DM Serif Display (SIL Open Font License 1.1) |
| `paper/` | The paper PDF |
