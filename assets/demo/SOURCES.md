# Agent edit highlights

`agent-edit-highlights.mp4` is a 28-second edited summary of the archived
qwen3.8-max-0902 run for public ME task `7d7953f8`. It combines designed title
cards containing archival excerpts, actual images received by the agent, and
the existing recording of its final application. It is not a live screen
recording of the agent operating its tools. There is no simulated typing,
cursor, terminal session, elapsed-time counter or reconstructed execution.

All factual material comes from `../../data/site-data.json`, under
`runs.tasks["7d7953f8"]` and the run in `runs.runs` whose `task` is `7d7953f8`.
The source run matches the frozen paper result, as documented in the project
page's `../../README.md`.

| Segment | Seconds | Source |
| --- | --- | --- |
| Request and page preview | 0–3.75 | Exact sentence from the task request; final-render hero image used as a labelled task preview |
| Read the motion | 3.75–7.75 | Step 1: 120 extracted frames; step 2's actual 900 × 750 reference montage; the source reference MP4 is 6 seconds at 20 fps |
| Edit | 7.75–11.25 | Exact Edit-step excerpt; animation names printed by the final diagnostic |
| Check and repair | 11.25–14.25 | Actual archived observations 188 and 218, shown whole; repair excerpt shortened with an ellipsis |
| Final page recording | 14.25–28 | Existing 13.75-second `../cases/outputs/7d7953f8-qwen3.8-max-0902.mp4`, rescaled proportionally from 960 × 600 to 920 × 575, with no changes to the recorded application |

The recording visits the hero, routine title and quotation in that order.
The strict 6/6 result comes from this individual task's frozen evaluation;
it is not a benchmark-wide score. Timing of the editorial segments does not
represent the duration of the original run. No audio is added.

Supporting files: `poster.webp`, `captions-en.vtt`, and `build-demo.cjs`.
The generated video is H.264, 1280 × 720, 20 fps, with a fast-start MP4 container.
Its panels use the project's existing local DM Sans and DM Serif Display fonts.

Rebuild with `node build-demo.cjs`. The script uses system `ffmpeg`, local
Playwright, and Chromium; set `DEMO_PLAYWRIGHT` and `DEMO_CHROMIUM` to replace
the documented local executable paths. Intermediate review frames are written
to a newly created temporary directory and reported on completion.
