# BTC Thesis Research Site

Personal investment thesis tracking and research site, hosted on GitHub Pages.

## Setup (3 steps)

1. Create a new GitHub repository named `btc-thesis` (or any name)
2. Upload all files from this folder to the repository root
3. Go to: Repository Settings → Pages → Source: "Deploy from branch" → Branch: `main` → `/root` → Save

Your site will be live at: `https://[your-username].github.io/btc-thesis`

Takes ~2 minutes to go live after saving.

## Structure

```
index.html          ← Main site (all sections)
README.md           ← This file
```

## Sections

| Section | Status | Description |
|---|---|---|
| Invalidation Tracker | ✅ Live | SOFR spike → WALCL → M2 → BTC timeline |
| Geo Catalysts | ✅ Live | China deal, Ukraine peace, tariff risk |
| Core Thesis | 🚧 TODO | Debt/BTC correlation, mechanism chain |
| Liquidity Framework | 🚧 TODO | RRP monitor, Fed balance sheet, M2 overlay |
| My Positions | 🚧 TODO | Portfolio tracker, hardware wallet |
| Exit Plan | 🚧 TODO | CRV/CVX targets, MVRV exit signals |
| Family Accounts | 🚧 TODO | Separate family portfolio tracking |
| Market Structure | 🚧 TODO | BTC price memory, HTF analysis |
| Sentiment | 🚧 TODO | MVRV Z-Score, LTH supply |
| Nuclear Thesis | 🚧 TODO | SMR pipeline, URA/NLR/OKLO |

## How to update

**Via GitHub web editor (easiest):**
1. Open `index.html` in GitHub
2. Click the pencil (edit) icon
3. Make changes
4. Click "Commit changes"
5. Site updates automatically in ~60 seconds

**Via local editor:**
1. Clone repo: `git clone https://github.com/[username]/btc-thesis`
2. Edit files in VS Code
3. `git add . && git commit -m "update" && git push`

## Weekly workflow

1. Open the site
2. Go to "Invalidation Tracker"
3. If SOFR spike has occurred: toggle to YES, enter date
4. Follow the checklist for the current window
5. Update kill switch statuses as conditions change

## Data sources

| Metric | Source | Frequency |
|---|---|---|
| SOFR spread | [NY Fed](https://www.newyorkfed.org/markets/reference-rates/sofr) | Daily 8am ET |
| RRP balance | [FRED RRPONTSYD](https://fred.stlouisfed.org/series/RRPONTSYD) | Daily |
| WALCL | [FRED WALCL](https://fred.stlouisfed.org/series/WALCL) | Thursday 4:30pm ET |
| Core PCE | [FRED PCEPILFE](https://fred.stlouisfed.org/series/PCEPILFE) | Monthly, last Friday |
| M2 | [FRED M2SL](https://fred.stlouisfed.org/series/M2SL) | Monthly |
