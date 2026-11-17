# Film and avatar sources

- `lines.tsv`: narration with full niqqud (Ariel's voice, cloned locally with `tools/voice/clone.py` in the design studio; approved by Ariel 2026-11-17). `captions.tsv`: the same text in full spelling, split into caption chunks.
- `vo/picks.json`: chosen takes after back-transcription screening.
- `scripts/fetch-clips.sh`: product moments from the official Google Workspace YouTube channel (credited on screen).
- `scripts/build-timeline.mjs` → `src/timeline.json`; `npm run render` → `out/film.mp4`, then compressed into `../public/media/film.mp4` (see docs/DECISIONS.md).
- Avatar: SadTalker (local) on `../public/media/avatar-poster.png` over green, then `scripts/stack-avatar.sh` → stacked-alpha MP4, poster and VTT in `../public/media/`. Labelled "אווטאר וקול שנוצרו ב-AI" on the site.
- `art/`: hero illustration (Gemini, inside Ariel's subscription) and its prompt.
