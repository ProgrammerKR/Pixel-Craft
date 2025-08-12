# Web Pro Editor

A fast, modular, Photoshop-like image editor for the web.

- 100+ professional tools (core implemented + placeholders with lazy loading)
- Layers with blend modes and opacity
- History (undo/redo, jump to state)
- Brush engine (size, hardness, opacity)
- Filters (blur, sharpen, brightness/contrast, hue/saturation) via Web Workers
- AI tools (background removal, inpaint, text-to-image demo) via Worker
- PNG/JPG/SVG import, JSON (PSD-like) save
- Drag & drop, zoom/pan, rulers, timeline frames
- Responsive dark UI with CSS variables

## Run locally

```bash
# from project root
python3 -m http.server 8000 -d .
# open http://localhost:8000/
```

No build step needed. Modern browser required for OffscreenCanvas and blend modes.

## Structure

- `index.html` – UI layout
- `styles.css` – Dark theme and responsive layout
- `app.js` – App bootstrap and wiring
- `canvas/` – Canvas rendering engine
- `core/` – Layers, history, filters, AI, file I/O, utils
- `tools/` – Tool registry and tool implementations
- `workers/` – Web workers for filters and AI

## Notes

- Advanced AI calls are stubbed for demo (can integrate external APIs).
- Many pro tools are placeholders and load a “coming soon” hint while keeping the UI complete.
