# Hub Demo

A click-through demo of a personal home hub app: money, homes, cars, utilities, documents and daily tasks, on a phone.

- **Everything is made up.** The household, names, banks, homes, cars and every amount are invented (`data.js`).
- **No server, no database.** Plain HTML / CSS / JS; nothing you tap is saved (a reload resets it).
- **Add to Home Screen** on an iPhone (Share › Add to Home Screen) to open it like an app.

## Files
- `index.html` shell · `app.js` screens and navigation · `data.js` the made-up household
- `style.css` look (copied once from the real app) · `demo.css` demo-only additions
- `tools/leakcheck.py` must pass before every commit / publish

## Run locally
```
python3 -m http.server 8777
```
then open http://localhost:8777
