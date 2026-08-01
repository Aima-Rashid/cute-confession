# Proud of You 

A full-screen canvas animation — a Matrix-style rain intro that reveals top to bottom, a glowing countdown (3 → 2 → 1), and a message that assembles itself out of the falling code before bursting into rainbow colors and confetti.

## Live demo

If hosted via GitHub Pages: `https://your-username.github.io/your-repo-name/`

## Running locally

No build step needed — it's plain HTML/CSS/JS.

1. Clone the repo
2. Open `index.html` in a browser (or use a local server, e.g. `npx serve` or the VS Code "Live Server" extension)

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure, links the CSS and JS |
| `style.css` | Canvas and restart-button styling |
| `script.js` | All animation logic — rain, particle text, countdown, burst/confetti |

## How it works

- The background is a canvas-based "digital rain" effect where every column continuously spells out hidden words.
- On load, a reveal sweeps down the screen with a soft highlight flash.
- A countdown (3, 2, 1) forms out of glowing particle clusters, then scatters into tiny background specks.
- Those specks snap back together to spell out the final message, word by word.
- The reveal ends with a freeze-frame beat, then a zoom pulse, a flip to rainbow coloring, and a confetti + glitter burst.
- The whole sequence loops automatically. Click "Restart ↻" to replay it anytime.

## Customizing

Open `script.js` — the key things to tweak are grouped near the top and in the `STAGE_LEN` object:

- `finalWords` — the word-by-word message at the end
- `words` — the words spelled out in the background rain
- `STAGE_LEN` — how long each stage (countdown, pause, hold, etc.) lasts
- `fontSize`, rain colors, and confetti/glitter counts are further down in their respective functions
