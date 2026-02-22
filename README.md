# Daily Light Tarot (Static HTML/CSS/JS)

A happy & light mystical tarot experience:
Landing → shuffle animation → 3-card draw (flip) → individual + combined reading → copy/share.

## Quick start
Just open `index.html` locally, or deploy to GitHub Pages.

## Add your 78-card images
Place images in `assets/cards/`.

Default expected filenames (recommended):
- Majors: `maj_00_the_fool.webp` ... `maj_21_the_world.webp`
- Minors: `min_wands_ace.webp` ... `min_pentacles_king.webp`

If your images are named differently, you can map them by creating `custom-deck.js`
and loading it before `deck.js` in `index.html`.

## GitHub Pages
Settings → Pages → Deploy from branch → `main` / root.
