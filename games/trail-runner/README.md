# Trail Runner: Ink Bridge

A hyper-casual HTML5 canvas game where you draw ink bridges to cross gaps and dodge obstacles.

## 🎮 Description

An auto-running dot races across platforms separated by gaps. You control a limited ink supply — hold to draw a solid ink bridge ahead of the runner, release to stop drawing and let your ink regenerate. Pass through the safe openings in spike/wall gates. Survive as long as possible and rack up combo bonuses!

## 🕹️ Controls

| Action | Input |
|--------|-------|
| Draw ink bridge | Hold mouse / tap and hold |
| Stop drawing | Release mouse / lift finger |
| Start / Retry | Tap, click, Space, or Enter |

## 🏆 Scoring

- **Distance**: Points accumulate automatically as you run
- **Perfect Bridge**: Efficiently cross a gap with minimal ink → combo + bonus
- **Near Miss**: Pass within 6px of a gate edge → combo + bonus
- **Combo**: Chain bonuses to multiply rewards

## ⚠️ Fail Conditions

- Fall into a gap (no ground and no ink to bridge it)
- Run into a gate spike/wall (miss the opening)
- Run out of ink while over a gap (bridge ends)

## 🔗 Play Online

**[https://balinti.github.io/trail-runner/](https://balinti.github.io/trail-runner/)**

## 📁 Tech Stack

- Single `index.html` file — no dependencies, no build step
- HTML5 Canvas 2D rendering
- Vanilla JavaScript ES6
- localStorage for high score persistence
- High-DPI canvas scaling (devicePixelRatio)
