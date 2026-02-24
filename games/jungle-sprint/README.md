# Jungle Sprint

A hyper-casual HTML5 canvas game. Sprint through the jungle, slash vines, dodge rocks, and collect idols to build your combo!

## Play Live

**[https://balinti.github.io/jungle-sprint/](https://balinti.github.io/jungle-sprint/)**

## Controls

| Input | Action |
|-------|--------|
| **Tap / Click** | Slash + cycle lane (1→2→3→1) |
| **Space / Enter** | Slash + cycle lane |

## How to Play

- You auto-sprint down a 3-lane jungle trail.
- **Tap** to slash vines — but only when you're in the right lane and within the **green cut window** marker.
- **Rocks** are unslashable — cycle to a different lane before they reach you.
- **Gold Idols** give bonus points — run into them to collect.
- Build a **combo** by cutting vines and collecting idols consecutively.
- Combo multipliers: x1 (0–2), x2 (3–6), x3 (7–11), x5 (12+)
- **Near-miss bonus** when a rock passes close in an adjacent lane.

## Scoring

| Action | Points |
|--------|--------|
| Vine cut (perfect) | 100 × multiplier |
| Gold vine cut | 180 × multiplier |
| Idol pickup | 120 × multiplier |
| Near miss (rock) | 25 × multiplier |

## Tech

- Single `index.html` — zero dependencies, zero build step.
- HTML5 Canvas 2D rendering, Vanilla JS ES6.
- High-DPI canvas scaling, localStorage high score.
- Mobile-first responsive layout.

## License

MIT
