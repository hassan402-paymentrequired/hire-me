# Proxideck client design

Exported from the Design canvas "Proxideck Premium Client Pages". This folder is the source of truth for the client-facing UI.

- `screens/` — every artboard as a `.dc.html` file (HTML + inline styles, with a small `Component` class for sample data and interactive states). `SiteNav`, `SiteFooter` and `AccountMenu` are shared components pulled in with `<dc-import>`. `canvas.json` lists every artboard and its size.
- `screenshots/` — a full-page render of each artboard at its canvas size. Files named `Screen--state.png` show interactive states (tabs, dialogs, cancelled booking).
- `_blob/` — the font (Satoshi) and images the designs reference as `/_blob/<id>`.
- `screens/support.js` — the canvas runtime, so the designs render outside the canvas.

## Preview or re-render locally

```bash
cd design && python3 -m http.server 8765
```

Open http://127.0.0.1:8765/screens/Welcome.dc.html (any screen works).

To regenerate every screenshot after editing a screen (needs Google Chrome and Node 22+), keep the server running and run:

```bash
node design/tools/render-designs.mjs http://127.0.0.1:8765 design/screens/canvas.json design/screenshots
```

