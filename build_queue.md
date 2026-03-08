# March 2026 Build Staging
## From: Site Architecture Review — March 4, 2026

This document captures every decision from the annotated site review session. Use it to pick up cold in any future Build or Explore session.

---

## Core Framework: 4 Levels of Site Maturity

Each level is self-sufficient. Don't advance until the current level feels done. Build order = level priority. The purpose of this site is to **make money** and **not lose it**. Everything else is extra weight.

**L1 — Reduce Mental Load:** Tax implications documented. Deployment plan locked. Alerts set. "I've thought about this, the system tracks it, I can stop worrying."

**L2 — Functional:** I can see my positions, track MoM performance, navigate easily, add entries, review monthly thoughts. The site works as a tool.

**L3 — Actionable:** The site tells me what to do. Confluence score, kill switch status, exit tiers. Decision support, not just information.

**L4 — Complete:** Full thesis, research, invalidation frameworks. The intellectual archive. Conviction when it wavers.

---

## March Build Queue

### L1 Builds (Weeks 1–2)

**1. Fraxlend Payoff Math — Explore session, 15 min**
- Status: NOT DONE. Flagged for next build session.
- Need: Pull up Fraxlend position on-chain. Answer four questions:
  1. Exact loan balance in FRAX
  2. CRV/CVX price where health ratio hits 1.2 (liquidation)
  3. CRV/CVX price where collateral fully repays loan ("I'm free" number)
  4. Price alert thresholds (yellow warning + red danger)
- Output: Numbers added to position tracker card. Two price alerts set (DeFi Saver or CoinGecko). Then never think about it again unless phone buzzes.
- Greg's note: "I hate owing people money. Get the math done, set alerts, forget it."

**2. Deployment Plan — HTML page, Build session**
- Status: deployment_plan.jsx exists, needs conversion to clean HTML
- Need: One-time reference page. TWAP schedule, allocation splits (BTC 30% / ETH 20% / CRV 30% / CVX 20%), tax timeline with dates, tax reserve amount ($36K–$40.5K).
- Greg's note: "Very important info. I hate looking at it. Collect in one spot, set alerts for when I need to deal with it, set money aside for taxes, then don't think about it until then."
- Tax reference already complete in project knowledge (tax_execution_reference.md). Key numbers: $75K gross, ~$34.5K–$39K deployable, 20% auto-withheld, remaining ~$21–25K due at filing (2027). This is a retirement account rollover, NOT a 401k.
- Family wallet seeds (~$1K each for Dad/Alan/Laura/Chrissi): PARKED. Revisit in a dedicated content session. Do not factor into TWAP yet.

**3. Tax Reserve Yield Setup — Quick Explore + Execute**
- Status: Protocols surveyed, not selected or executed
- Need: Pick a protocol, deposit tax reserve, set calendar reminder to withdraw before filing
- Estimated yield: $920–$1,840 on ~$23K over 12 months. Free money.
- Do after deployment capital lands.

### L2 Builds (Weeks 2–3)

**4. Position Tracker — Build session (MOST IMPORTANT BUILD)**
- Status: NOT BUILT
- Need: Private local HTML (NOT on public repo — OpSec). Holdings, cost basis, health ratio, MoM performance. Fraxlend card (loan balance, health ratio, distance to liquidation — green/yellow/red).
- Greg's note on existing positions.html: "Feels too busy. I want it to be clean and easy to read. Check other portfolio trackers for examples."
- This is the single most operationally important page. You can't manage what you can't see.

**5. positions.html Redesign — Build session**
- Status: LIVE but needs cleanup
- Need: Make it clean and easy to read. Less information density, better hierarchy.
- Look at other portfolio trackers for design inspiration before building.

**6. Ship assets.html — Deploy session**
- Status: BUILT, not deployed
- Need: Just deploy it. It's ready.
- Greg's note: "Should be easy. Easy to add research + state 'completeness', easy to update, easy to use in general. Clean to read and generate action."

**7. March Changelog Entry**
- Continue the monthly practice started in February.

### L3 Builds (Week 4, start only)

**8. Confluence Score Dashboard — Build session**
- The 8-point scoring system. 5.5/8 = patient accumulation. 7+/8 = accelerate TWAP schedule.
- This directly tells you when to buy more aggressively. It makes money.

**9. Exit Tier Dedicated View**
- Currently partial in positions.html. Needs its own clear view.
- "When do I sell, how much, where do proceeds go?"

### L4 — NOT MARCH
Core Thesis, Liquidity Framework, Market Structure, stablecoin enrichment, toll road data refresh, all stubs. April+.

---

## Page-by-Page Decisions (from annotated review)

### LIVE — Keep and Enhance

| Page | Decision | Greg's Note |
|---|---|---|
| stablecoin-infra.html | Add stablecoin growth/flow monitoring | "Hugely important. I want to monitor stablecoin growth, flows & catalysts. Stablecoins are the backbone of my thesis." |
| toll_road_thesis_v2.html | Update with recent fee/volume/% share data | "Revisit newer chats where we talk about fees/volume/% share etc." |
| btc-risk-analysis.html | No changes noted | Values are hardcoded snapshots — consider periodic manual update or link to external dashboards |
| tracker.html | Reframe intro paragraph | Feels philosophically wrong as "the thesis." It's a tripwire/signal, not the thesis itself. If framed as "the mechanism you're monitoring for a signal" the discomfort resolves. |
| catalysts.html | Simplify dramatically | "Not as important. Reduce/maintain low level of detail. Should be high level thoughts & a news summary so I don't have to keep up w/ politics at all." Goal: 10–20 min intentional read per week, then ignore completely. |
| macro.html | Future automation project | "Automate. Pull transcripts, summarize, send. AI to track the trend over time." Not a build priority now — aspiration for later. |
| positions.html | Redesign for clarity | "Feels too busy. I want it to be clean and easy to read. Check other portfolio trackers for examples." |

### BUILT — Deploy or Convert

| Page | Decision | Notes |
|---|---|---|
| assets.html | DEPLOY | Ready to ship. Greg wants it easy to use and update. |
| deployment_plan.jsx | Convert to HTML, "deal with it once" page | Tax alerts + timeline. Look at it on deployment day, then never again. |
| fed_wave_tracker_v2.jsx + fed_balance_sheet_tracker.jsx | COMBINE into one Liquidity Framework page | "Combine into one page. Idk enough to make it 2. Also, I just want a high level overview of direction." |

### KILL

| Page | Decision | Greg's Note |
|---|---|---|
| geo_catalyst_tracker.jsx | DEAD | Big pink "NO." "I do not want to 'monitor the situation'. My knowing geopolitics won't change the trade. I just want to know if there are major headwinds or tailwinds — the goal here is if I read the news for 10-20 mins INTENTIONALLY per week, then I can ignore it completely the rest of the time." |

### STUBS — Reprioritized (L4, not March)

| Stub | Greg's Note | Level |
|---|---|---|
| Core Thesis | Hugely important — but at some point, not right now | L4 |
| Liquidity Framework | Hugely important — same | L4 |
| Exit Plan | Hugely important — partial L3 work via exit tier view | L3/L4 |
| Market Structure | "Core of my 2026 Trade Execution" — but L4 | L4 |
| Family Accounts | "Huge. Takes up a lot of mental space, having it planned out will feel so much better." | L2 (later) |
| Sentiment | "Medium. Important confluence — important if we get to price discovery." | L3 |
| Nuclear Thesis | "Not as important. I think Nuclear will be huge, but I specialize in crypto this year. I want to keep focused. 'I watch one egg very closely' — Druckenmiller." | L4 (deprioritized) |

### Reference Only

| Page | Notes |
|---|---|
| site_skeleton.jsx | Mine for structural decisions and content that didn't make it into live pages. Don't deploy. |

---

## Open Items (Not March Builds)

- Coinbase Premium indicator system — parked to April (Explore session)
- CRV health metrics framework — absolute revenue, stablecoin swap share, veCRV locked supply, revenue-to-market-cap ratio
- Raoul Pal (Everything Code) + Lyn Alden (fiscal dominance) entries for Influences page
- Burniske allocation comparison implications for deployment percentages
- On-chain yield deep-dive: risk evaluation per protocol, smart contract risk comparison, Pendle fixed-yield assessment, execution steps
- Dad rotation conversation: S&P + COIN → UUUU or ASPI

---

## Reminders for Next Session

- Greg has unpushed site changes — confirm pushed before any build
- return_calculator_v2.jsx needs updating in repo with yield tab changes
- Mid-March: ask how Chat/Code handoff workflow is working
- Fraxlend math is first item in next build session (15 min, need position open on-chain)
