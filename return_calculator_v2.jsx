import { useState, useMemo } from "react";

const T = {
  bg: "#141620", card: "#1c1e2e", cardHi: "#242840",
  border: "#2e3148", borderHi: "#3d4260",
  text: "#f1f2f6", textMid: "#b8bdd4", textDim: "#8a90ab",
  orange: "#fbbf24", green: "#4ade80", red: "#f87171",
  blue: "#60a5fa", purple: "#c4b5fd", cyan: "#22d3ee",
  btc: "#f7931a", eth: "#849dff", crv: "#fb923c", cvx: "#2dd4bf",
};
const mono = "'JetBrains Mono','Fira Code','SF Mono',monospace";
const sans = "'Inter',-apple-system,sans-serif";
const fmt = (n) => {
  if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (Math.abs(n) >= 1000) return "$" + Math.round(n).toLocaleString();
  if (Math.abs(n) >= 0.01) return "$" + n.toFixed(2);
  return "$" + n.toFixed(4);
};
const pct = (n) => (n >= 0 ? "+" : "") + (n * 100).toFixed(1) + "%";
const mult = (n) => n.toFixed(1) + "×";

// ════════════════════════════════════════════════
// ASSET DEFINITIONS — all from project research
// ════════════════════════════════════════════════
const ASSETS = {
  BTC: {
    label: "Bitcoin", color: T.btc, icon: "₿",
    currentPrice: 68000, ath: 126000,
    upsideRange: "2–3×", riskTier: "Tier 1 — Highest Conviction",
    tiers: [
      { label: "Tier 1", lo: 120000, hi: 130000, sellPct: 0.25, note: "ATH reclaim — first take-profit" },
      { label: "Tier 2", lo: 150000, hi: 170000, sellPct: 0.35, note: "Debt model mid-range — majority off" },
      { label: "Tier 3", lo: 200000, hi: 250000, sellPct: 0.40, note: "Euphoria zone — sell remaining" },
    ],
    core: 0, // no core hold in Phase A — time stop sells 100%
    timeStop: "Dec 31, 2026",
    yieldNote: null,
  },
  ETH: {
    label: "Ethereum", color: T.eth, icon: "⟠",
    currentPrice: 2055, ath: 4900,
    upsideRange: "3–8×", riskTier: "Tier 2 — High Conviction w/ Caveats",
    tiers: [
      { label: "Tier 1", lo: 4000, hi: 5000, sellPct: 0.25, note: "Prior ATH zone — first real exit" },
      { label: "Tier 2", lo: 6000, hi: 8000, sellPct: 0.35, note: "DeFi bull run territory" },
      { label: "Tier 3", lo: 10000, hi: 15000, sellPct: 0.25, note: "Blow-off / gold-parity narrative" },
    ],
    core: 0.15,
    timeStop: "Dec 31, 2026",
    yieldNote: "Stake ETH (~3-5% APR) or provide liquidity. Partially exit into staked ETH positions during Tier 1-2 to keep earning while de-risking.",
  },
  CRV: {
    label: "Curve DAO", color: T.crv, icon: "◈",
    currentPrice: 0.26, ath: 15.37,
    upsideRange: "5–45×", riskTier: "Tier 3 — Speculative with Thesis",
    tiers: [
      { label: "Tier 0 🔑", lo: 0.40, hi: 0.50, sellPct: 0, repay: true, note: "REPAY $5,797 FRAX — eliminate liquidation risk" },
      { label: "Tier 1", lo: 1.00, hi: 2.00, sellPct: 0.25, note: "DeFi recovery confirmed — take real money off · 5–9×" },
      { label: "Tier 2", lo: 3.00, hi: 5.00, sellPct: 0.30, note: "Prior cycle range — serious profit · 14–23×" },
      { label: "Tier 3", lo: 5.00, hi: 10.00, sellPct: 0.30, note: "Approaching ATH — euphoria · 23–45×" },
    ],
    core: 0.15,
    timeStop: "Dec 31, 2026",
    yieldNote: "Lock CRV → veCRV for fee share (currently ~$13.6M/yr distributed). As CRV price rises, yield on locked positions compounds. Consider locking Tier 1 proceeds rather than selling — the flywheel rewards diamond hands.",
  },
  CVX: {
    label: "Convex", color: T.cvx, icon: "◉",
    currentPrice: 1.89, ath: 60.09,
    upsideRange: "3–15×", riskTier: "Tier 4 — High-Risk Derivative",
    tiers: [
      { label: "Tier 0 🔑", lo: 3.50, hi: 4.00, sellPct: 0, repay: true, note: "REPAY $4,268 FRAX — eliminate liquidation risk" },
      { label: "Tier 1", lo: 5, hi: 12, sellPct: 0.25, note: "Conservative recovery — governance premium returns" },
      { label: "Tier 2", lo: 20, hi: 25, sellPct: 0.35, note: "Curve Wars reignite — prior cycle range" },
      { label: "Tier 3", lo: 40, hi: 60, sellPct: 0.30, note: "Approaching ATH — full euphoria" },
    ],
    core: 0.10,
    timeStop: "Dec 31, 2026",
    yieldNote: "Lock CVX → vlCVX to direct Curve gauge emissions. Earns bribes + governance power. During Tier 1-2, consider locking portion into vlCVX — you earn while positioned.",
  },
};

export default function MultiAssetCalculator() {
  const [method, setMethod] = useState("hybrid");
  const [grossPull, setGrossPull] = useState(65000);
  const [loanPortion, setLoanPortion] = useState(50000);
  const [livingExpense, setLivingExpense] = useState(10000);
  const [fedTaxRate, setFedTaxRate] = useState(0.24);
  const [penaltyRate] = useState(0.10);
  const [cryptoTaxRate, setCryptoTaxRate] = useState(0.24);
  const [activeAsset, setActiveAsset] = useState("BTC");
  const [tab, setTab] = useState("per-asset");
  const [useMidpoint, setUseMidpoint] = useState(true); // use midpoint of tier ranges

  // Allocation weights
  const [weights, setWeights] = useState({ BTC: 40, ETH: 30, CRV: 20, CVX: 10 });
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  // Capital flow
  const loanAmt = method === "loan" ? grossPull : method === "hybrid" ? Math.min(loanPortion, grossPull) : 0;
  const withdrawalAmt = grossPull - loanAmt;
  const taxPenaltyHit = withdrawalAmt * (fedTaxRate + penaltyRate);
  const netAfterTax = grossPull - taxPenaltyHit;
  const deployable = Math.max(0, netAfterTax - livingExpense);

  // Per-asset calculations
  const assetCalcs = useMemo(() => {
    const results = {};
    Object.entries(ASSETS).forEach(([key, asset]) => {
      const w = weights[key] / 100;
      const allocated = deployable * w;
      const qty = allocated / asset.currentPrice;
      const priceFn = (tier) => useMidpoint ? (tier.lo + tier.hi) / 2 : tier.lo;

      let cumulativeNet = 0;
      let cumulativeTax = 0;
      let remainingQty = qty;

      const tierResults = asset.tiers.map((tier) => {
        if (tier.repay) {
          // Tier 0 — loan repayment, no sell %
          const repayAmt = key === "CRV" ? 5797 : 4268;
          const tokensNeeded = repayAmt / priceFn(tier);
          return {
            ...tier, price: priceFn(tier), tokensNeeded, repayAmt,
            grossProceeds: 0, tax: 0, netProceeds: -repayAmt,
            multiplier: priceFn(tier) / asset.currentPrice,
          };
        }

        const sellQty = qty * tier.sellPct;
        const price = priceFn(tier);
        const gross = sellQty * price;
        const costBasis = sellQty * asset.currentPrice;
        const gain = gross - costBasis;
        const tax = gain > 0 ? gain * cryptoTaxRate : 0;
        const net = gross - tax;
        cumulativeNet += net;
        cumulativeTax += tax;
        remainingQty -= sellQty;

        return {
          ...tier, price, sellQty, grossProceeds: gross, costBasis, gain, tax, netProceeds: net,
          cumulativeNet, cumulativeTax,
          multiplier: price / asset.currentPrice,
          returnOnAllocated: allocated > 0 ? (net - costBasis) / allocated : 0,
        };
      });

      // Core hold value at last tier price
      const lastTierPrice = tierResults.filter(t => !t.repay).slice(-1)[0]?.price || asset.currentPrice;
      const coreQty = qty * asset.core;
      const coreValue = coreQty * lastTierPrice;

      // "If all tiers hit" total
      const sellTiers = tierResults.filter(t => !t.repay);
      const totalGross = sellTiers.reduce((s, t) => s + t.grossProceeds, 0);
      const totalTax = sellTiers.reduce((s, t) => s + t.tax, 0);
      const totalNet = sellTiers.reduce((s, t) => s + t.netProceeds, 0);

      // Break-even price
      const breakEvenTarget = allocated; // need to get back what you put in
      // net = qty * price * (1 - taxRate) + qty * entryPrice * taxRate
      // solve for price where net = breakEvenTarget
      const be = qty > 0
        ? (breakEvenTarget - qty * asset.currentPrice * cryptoTaxRate) / (qty * (1 - cryptoTaxRate))
        : Infinity;

      results[key] = {
        allocated, qty, tierResults, coreQty, coreValue,
        totalGross, totalTax, totalNet,
        netProfit: totalNet - allocated,
        breakEvenPrice: be,
        breakEvenMult: be / asset.currentPrice,
        maxMultiple: lastTierPrice / asset.currentPrice,
      };
    });
    return results;
  }, [weights, deployable, cryptoTaxRate, useMidpoint]);

  // Combined portfolio
  const combined = useMemo(() => {
    let totalAllocated = 0, totalNet = 0, totalTax = 0, totalGross = 0;
    Object.values(assetCalcs).forEach(a => {
      totalAllocated += a.allocated;
      totalNet += a.totalNet;
      totalTax += a.totalTax;
      totalGross += a.totalGross;
    });
    return {
      totalAllocated, totalNet, totalTax, totalGross,
      netProfit: totalNet - totalAllocated,
      vsRetirement: totalNet - grossPull,
      returnOnGross: grossPull > 0 ? (totalNet - grossPull) / grossPull : 0,
    };
  }, [assetCalcs, grossPull]);

  // ════ UI HELPERS ════
  const Pill = ({ active, color, children, onClick, small }) => (
    <button onClick={onClick} style={{
      background: active ? (color || T.orange) + "18" : T.bg,
      border: `1px solid ${active ? (color || T.orange) + "55" : T.border}`,
      color: active ? (color || T.orange) : T.textDim,
      borderRadius: 6, padding: small ? "4px 10px" : "6px 14px",
      fontSize: small ? 10 : 11, fontWeight: 700,
      fontFamily: sans, cursor: "pointer", transition: "all 0.15s",
    }}>{children}</button>
  );

  const Card = ({ eyebrow, accent = T.orange, children, style }) => (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
      padding: "16px 18px", ...style,
    }}>
      {eyebrow && <div style={{ color: accent, fontSize: 9, fontWeight: 800, fontFamily: mono,
        letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>{eyebrow}</div>}
      {children}
    </div>
  );

  const Slider = ({ label, value, onChange, min, max, step = 1, fmtFn, sub, color }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ color: T.textMid, fontSize: 11, fontWeight: 600 }}>{label}</span>
        <span style={{ color: color || T.text, fontSize: 12, fontWeight: 700, fontFamily: mono }}>
          {fmtFn ? fmtFn(value) : value}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color || T.orange, height: 4 }} />
      {sub && <div style={{ color: T.textDim, fontSize: 10, marginTop: 1 }}>{sub}</div>}
    </div>
  );

  const A = ASSETS[activeAsset];
  const AC = assetCalcs[activeAsset];

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: sans, minHeight: "100vh", padding: "20px 16px" }}>
      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ color: T.orange, fontSize: 9, fontFamily: mono, fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>
            RETURN CALCULATOR V2 — MULTI-ASSET
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>
            What Do I Actually Take Home?
          </div>
          <div style={{ color: T.textDim, fontSize: 11, lineHeight: 1.5 }}>
            Per-asset exit tiers × allocation weights × tax drag = the real number.
            BTC is a 2× play. CRV is a 45× play. They need different math.
          </div>
        </div>

        {/* ═══ INPUT PANEL (collapsed) ═══ */}
        <Card eyebrow="Capital & Allocation" accent={T.blue} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            <Pill active={method === "loan"} color={T.green} onClick={() => { setMethod("loan"); setGrossPull(50000); }}>Loan Only</Pill>
            <Pill active={method === "hybrid"} color={T.orange} onClick={() => { setMethod("hybrid"); setGrossPull(65000); setLoanPortion(50000); }}>Hybrid</Pill>
            <Pill active={method === "withdrawal"} color={T.red} onClick={() => { setMethod("withdrawal"); setGrossPull(60000); }}>Withdrawal Only</Pill>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Slider label="Gross Pull" value={grossPull} onChange={setGrossPull}
              min={20000} max={100000} step={5000} fmtFn={v => "$" + v.toLocaleString()} />
            {method === "hybrid" && (
              <Slider label="Loan Portion" value={loanPortion}
                onChange={v => setLoanPortion(Math.min(v, grossPull))}
                min={0} max={50000} step={5000} fmtFn={v => "$" + v.toLocaleString()} />
            )}
            <Slider label="Living Reserve" value={livingExpense} onChange={setLivingExpense}
              min={0} max={25000} step={1000} fmtFn={v => "$" + v.toLocaleString()} />
            <Slider label="Tax+Penalty Rate" value={fedTaxRate + penaltyRate}
              onChange={v => {/* read-only display */}} min={0} max={0.5} step={0.01}
              fmtFn={v => (v * 100).toFixed(0) + "% on withdrawal"}
              sub={`Tax hit: ${fmt(taxPenaltyHit)} · Deployable: ${fmt(deployable)}`} />
          </div>

          {/* Allocation weights */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
            <div style={{ color: T.textMid, fontSize: 10, fontWeight: 700, fontFamily: mono, letterSpacing: 1, marginBottom: 8 }}>
              ALLOCATION WEIGHTS {totalWeight !== 100 && <span style={{ color: T.red, marginLeft: 8 }}>⚠ Total: {totalWeight}%</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {Object.entries(ASSETS).map(([key, asset]) => (
                <div key={key} style={{
                  background: T.bg, borderRadius: 6, padding: "8px 10px",
                  border: `1px solid ${asset.color}33`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: asset.color, fontSize: 11, fontWeight: 700 }}>{key}</span>
                    <span style={{ color: T.text, fontSize: 12, fontWeight: 800, fontFamily: mono }}>
                      {weights[key]}%
                    </span>
                  </div>
                  <input type="range" min={0} max={60} step={5} value={weights[key]}
                    onChange={e => setWeights(p => ({ ...p, [key]: Number(e.target.value) }))}
                    style={{ width: "100%", accentColor: asset.color, height: 3 }} />
                  <div style={{ color: T.textDim, fontSize: 9, fontFamily: mono, marginTop: 2 }}>
                    {fmt(deployable * weights[key] / 100)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ═══ CAPITAL FLOW SUMMARY ═══ */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))", gap: 6,
          marginBottom: 12,
        }}>
          {[
            { l: "Gross Pull", v: fmt(grossPull), c: T.text },
            { l: "Tax+Penalty", v: taxPenaltyHit > 0 ? "-" + fmt(taxPenaltyHit) : "$0", c: taxPenaltyHit > 0 ? T.red : T.green },
            { l: "Living", v: "-" + fmt(livingExpense), c: T.textDim },
            { l: "Deployable", v: fmt(deployable), c: T.orange },
            { l: "Break-Even", v: pct(grossPull > 0 ? (grossPull - deployable) / deployable : 0), c: T.red },
          ].map((item, i) => (
            <div key={i} style={{
              background: T.card, borderRadius: 6, padding: "8px 10px",
              border: `1px solid ${T.border}`, textAlign: "center",
            }}>
              <div style={{ color: T.textDim, fontSize: 8, fontFamily: mono, fontWeight: 700, letterSpacing: 0.5 }}>{item.l}</div>
              <div style={{ color: item.c, fontSize: 13, fontWeight: 700, fontFamily: mono }}>{item.v}</div>
            </div>
          ))}
        </div>

        {/* ═══ TAB BAR ═══ */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12, background: T.card, borderRadius: 8, padding: 4 }}>
          {[
            { id: "per-asset", label: "Per-Asset Returns" },
            { id: "combined", label: "Combined Portfolio" },
            { id: "yield", label: "Yield & Exit Notes" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? T.cardHi : "transparent",
              border: tab === t.id ? `1px solid ${T.borderHi}` : "1px solid transparent",
              borderRadius: 6, padding: "7px 12px", cursor: "pointer",
              color: tab === t.id ? T.text : T.textDim, fontSize: 11, fontWeight: 600,
              fontFamily: sans, flex: 1, transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ═══════════════════════════════════════
            TAB: PER-ASSET RETURNS
        ═══════════════════════════════════════ */}
        {tab === "per-asset" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Asset selector */}
            <div style={{ display: "flex", gap: 6 }}>
              {Object.entries(ASSETS).map(([key, asset]) => (
                <button key={key} onClick={() => setActiveAsset(key)} style={{
                  flex: 1, background: activeAsset === key ? asset.color + "18" : T.card,
                  border: `1px solid ${activeAsset === key ? asset.color + "55" : T.border}`,
                  borderRadius: 8, padding: "10px 8px", cursor: "pointer", textAlign: "center",
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{asset.icon}</div>
                  <div style={{ color: activeAsset === key ? asset.color : T.textDim, fontSize: 11, fontWeight: 700 }}>{key}</div>
                  <div style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>{fmt(asset.currentPrice)}</div>
                </button>
              ))}
            </div>

            {/* Asset header */}
            <Card eyebrow={`${A.label} — ${A.riskTier}`} accent={A.color}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 10 }}>
                {[
                  { l: "Current Price", v: fmt(A.currentPrice), c: T.text },
                  { l: "ATH", v: fmt(A.ath), c: T.textMid },
                  { l: "Drawdown", v: pct(A.currentPrice / A.ath - 1), c: T.red },
                  { l: "Allocated", v: fmt(AC.allocated), c: A.color },
                  { l: "Quantity", v: AC.qty < 1 ? AC.qty.toFixed(6) : AC.qty.toFixed(2), c: T.cyan },
                  { l: "Upside Range", v: A.upsideRange, c: T.green },
                ].map((item, i) => (
                  <div key={i} style={{ background: T.bg, borderRadius: 6, padding: "6px 10px", border: `1px solid ${T.border}` }}>
                    <div style={{ color: T.textDim, fontSize: 8, fontFamily: mono, fontWeight: 700 }}>{item.l}</div>
                    <div style={{ color: item.c, fontSize: 13, fontWeight: 700, fontFamily: mono }}>{item.v}</div>
                  </div>
                ))}
              </div>

              {/* Pricing toggle */}
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <Pill active={useMidpoint} color={T.blue} onClick={() => setUseMidpoint(true)} small>Midpoint Prices</Pill>
                <Pill active={!useMidpoint} color={T.purple} onClick={() => setUseMidpoint(false)} small>Conservative (Low)</Pill>
              </div>
            </Card>

            {/* Exit tiers */}
            <Card eyebrow={`Exit Tiers — ${activeAsset}`} accent={A.color}>
              {AC.tierResults.map((tier, i) => {
                const isRepay = tier.repay;
                const tierColor = isRepay ? T.red : i <= 1 ? T.green : i === 2 ? T.orange : T.purple;
                return (
                  <div key={i} style={{
                    background: T.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 8,
                    border: `1px solid ${tierColor}22`, borderLeft: `3px solid ${tierColor}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div>
                        <span style={{ color: tierColor, fontWeight: 800, fontSize: 12, fontFamily: mono }}>
                          {tier.label}
                        </span>
                        <span style={{ color: T.textMid, fontSize: 10, marginLeft: 8 }}>
                          {fmt(tier.lo)}–{fmt(tier.hi)} · {isRepay ? "REPAY" : `Sell ${(tier.sellPct * 100).toFixed(0)}%`}
                        </span>
                      </div>
                      <span style={{
                        color: tierColor, fontSize: 10, fontWeight: 800, fontFamily: mono,
                        background: tierColor + "15", padding: "2px 8px", borderRadius: 3,
                      }}>
                        {mult(tier.multiplier)}
                      </span>
                    </div>
                    <div style={{ color: T.textDim, fontSize: 10, marginBottom: 6, lineHeight: 1.4 }}>
                      {tier.note}
                    </div>

                    {isRepay ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>Repay Amount</div>
                          <div style={{ color: T.red, fontSize: 12, fontWeight: 700, fontFamily: mono }}>{fmt(tier.repayAmt)}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>Tokens Needed</div>
                          <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, fontFamily: mono }}>
                            {tier.tokensNeeded.toFixed(0)} {activeAsset}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                        {[
                          { l: "Sell Qty", v: tier.sellQty < 1 ? tier.sellQty.toFixed(6) : tier.sellQty.toFixed(1), c: T.textMid },
                          { l: "Gross", v: fmt(tier.grossProceeds), c: T.text },
                          { l: "Tax", v: "-" + fmt(tier.tax), c: T.red },
                          { l: "Net", v: fmt(tier.netProceeds), c: T.green },
                        ].map((cell, j) => (
                          <div key={j} style={{ textAlign: "center" }}>
                            <div style={{ color: T.textDim, fontSize: 8, fontFamily: mono }}>{cell.l}</div>
                            <div style={{ color: cell.c, fontSize: 11, fontWeight: 700, fontFamily: mono }}>{cell.v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* All tiers hit summary */}
              <div style={{
                background: T.green + "08", borderRadius: 8, padding: "14px",
                border: `1px solid ${T.green}33`, marginTop: 4,
              }}>
                <div style={{ color: A.color, fontSize: 10, fontWeight: 800, fontFamily: mono, marginBottom: 8 }}>
                  IF ALL {activeAsset} TIERS HIT
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                  {[
                    { l: "Total Net Proceeds", v: fmt(AC.totalNet), c: T.green },
                    { l: "Total Tax Paid", v: fmt(AC.totalTax), c: T.red },
                    { l: "Net Profit", v: fmt(AC.netProfit), c: AC.netProfit > 0 ? T.green : T.red },
                    { l: "Return on Allocated", v: AC.allocated > 0 ? mult(AC.totalNet / AC.allocated) : "—", c: T.cyan },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ color: T.textDim, fontSize: 9, fontFamily: mono, marginBottom: 2 }}>{item.l}</div>
                      <div style={{ color: item.c, fontSize: 15, fontWeight: 800, fontFamily: mono }}>{item.v}</div>
                    </div>
                  ))}
                </div>
                {AC.coreQty > 0 && (
                  <div style={{ color: T.textDim, fontSize: 10, marginTop: 8, borderTop: `1px solid ${T.border}`, paddingTop: 6 }}>
                    <strong style={{ color: T.blue }}>Core hold:</strong> {AC.coreQty.toFixed(AC.coreQty < 1 ? 6 : 1)} {activeAsset} retained (
                    {(A.core * 100).toFixed(0)}%) — value at last tier price: {fmt(AC.coreValue)}
                  </div>
                )}
              </div>

              {/* Break-even */}
              <div style={{
                marginTop: 8, padding: "10px 14px", background: T.bg,
                borderRadius: 8, border: `1px solid ${T.orange}22`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>BREAK-EVEN PRICE</div>
                    <div style={{ color: T.orange, fontSize: 16, fontWeight: 800, fontFamily: mono }}>
                      {AC.breakEvenPrice < Infinity ? fmt(AC.breakEvenPrice) : "N/A"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: T.textDim, fontSize: 9, fontFamily: mono }}>RETURN NEEDED</div>
                    <div style={{ color: T.orange, fontSize: 16, fontWeight: 800, fontFamily: mono }}>
                      {AC.breakEvenPrice < Infinity ? pct(AC.breakEvenMult - 1) : "—"}
                    </div>
                  </div>
                </div>
                <div style={{ color: T.textDim, fontSize: 10, marginTop: 4 }}>
                  {activeAsset} must reach this price for your allocation to break even vs. leaving money in retirement.
                  {AC.breakEvenPrice <= A.ath
                    ? <span style={{ color: T.green }}> ✓ Below ATH — achievable without new highs</span>
                    : <span style={{ color: T.red }}> ✗ Above ATH — requires new price discovery</span>}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB: COMBINED PORTFOLIO
        ═══════════════════════════════════════ */}
        {tab === "combined" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Headline number */}
            <Card eyebrow="If Every Asset Hits All Tiers" accent={T.green}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 14 }}>
                {[
                  { l: "Total Net Proceeds", v: fmt(combined.totalNet), c: T.green, big: true },
                  { l: "Net vs Retirement", v: fmt(combined.vsRetirement), c: combined.vsRetirement > 0 ? T.green : T.red, big: true },
                  { l: "Total Deployed", v: fmt(combined.totalAllocated), c: T.cyan },
                  { l: "Total Tax Paid", v: fmt(combined.totalTax), c: T.red },
                  { l: "Return on Gross Pull", v: pct(combined.returnOnGross), c: combined.returnOnGross > 0 ? T.green : T.red },
                  { l: "Portfolio Multiplier", v: combined.totalAllocated > 0 ? mult(combined.totalNet / combined.totalAllocated) : "—", c: T.purple },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ color: T.textDim, fontSize: 9, fontFamily: mono, marginBottom: 2 }}>{item.l}</div>
                    <div style={{ color: item.c, fontSize: item.big ? 20 : 15, fontWeight: 800, fontFamily: mono }}>{item.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ color: T.textDim, fontSize: 10, lineHeight: 1.5 }}>
                <strong style={{ color: T.text }}>Net vs Retirement</strong> = your total take-home minus what you pulled from the account.
                This is the only number that determines if the trade was worth it.
              </div>
            </Card>

            {/* Per-asset breakdown */}
            <Card eyebrow="Per-Asset Contribution" accent={T.blue}>
              {Object.entries(ASSETS).map(([key, asset]) => {
                const ac = assetCalcs[key];
                const pctOfTotal = combined.totalNet > 0 ? ac.totalNet / combined.totalNet : 0;
                return (
                  <div key={key} style={{
                    display: "grid", gridTemplateColumns: "80px 1fr 100px 100px",
                    alignItems: "center", padding: "10px 0",
                    borderBottom: `1px solid ${T.border}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: asset.color, fontSize: 14 }}>{asset.icon}</span>
                      <span style={{ color: asset.color, fontSize: 12, fontWeight: 700 }}>{key}</span>
                    </div>
                    {/* Bar */}
                    <div style={{ padding: "0 10px" }}>
                      <div style={{ background: T.bg, borderRadius: 3, height: 8, overflow: "hidden" }}>
                        <div style={{
                          background: asset.color, height: "100%", borderRadius: 3,
                          width: `${Math.min(pctOfTotal * 100, 100)}%`, transition: "width 0.3s",
                        }} />
                      </div>
                      <div style={{ color: T.textDim, fontSize: 9, marginTop: 2, fontFamily: mono }}>
                        {fmt(ac.allocated)} in → {fmt(ac.totalNet)} out
                        {ac.maxMultiple > 1 && ` · ${mult(ac.maxMultiple)} max`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: T.green, fontSize: 13, fontWeight: 700, fontFamily: mono }}>{fmt(ac.totalNet)}</div>
                      <div style={{ color: T.textDim, fontSize: 9 }}>net proceeds</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: ac.netProfit > 0 ? T.green : T.red, fontSize: 13, fontWeight: 700, fontFamily: mono }}>
                        {fmt(ac.netProfit)}
                      </div>
                      <div style={{ color: T.textDim, fontSize: 9 }}>profit</div>
                    </div>
                  </div>
                );
              })}
            </Card>

            {/* The honest comparison */}
            <Card eyebrow="The Honest Comparison" accent={T.orange}>
              <div style={{ color: T.textMid, fontSize: 11, lineHeight: 1.7 }}>
                {[
                  {
                    q: "Is the total profit worth the retirement risk?",
                    a: combined.vsRetirement > 20000
                      ? `Yes — ${fmt(combined.vsRetirement)} net profit above your gross pull is meaningful money. But remember: this assumes EVERY asset hits ALL tiers.`
                      : combined.vsRetirement > 0
                      ? `Marginal — ${fmt(combined.vsRetirement)} profit above gross pull is positive but thin. Consider if the risk is proportional.`
                      : `No — at current weights, even full success leaves you ${fmt(Math.abs(combined.vsRetirement))} worse off than leaving money in retirement.`,
                    color: combined.vsRetirement > 20000 ? T.green : combined.vsRetirement > 0 ? T.orange : T.red,
                  },
                  {
                    q: "Where does the real return come from?",
                    a: (() => {
                      const sorted = Object.entries(assetCalcs).sort((a, b) => b[1].netProfit - a[1].netProfit);
                      const top = sorted[0];
                      return `${top[0]} contributes ${fmt(top[1].netProfit)} in profit (${(top[1].netProfit / Math.max(combined.netProfit, 1) * 100).toFixed(0)}% of total). ${
                        top[0] === "CRV" || top[0] === "CVX"
                          ? "The asymmetric upside in DeFi tokens is where the trade pays off — but they're also the highest risk positions."
                          : "BTC/ETH provide the base return while DeFi tokens provide the asymmetric upside."
                      }`;
                    })(),
                    color: T.cyan,
                  },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: T.bg, borderRadius: 8, padding: "10px 14px",
                    border: `1px solid ${item.color}22`, borderLeft: `3px solid ${item.color}`,
                    marginBottom: 8,
                  }}>
                    <div style={{ color: item.color, fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{item.q}</div>
                    <div style={{ color: T.textMid, fontSize: 11, lineHeight: 1.6 }}>{item.a}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB: YIELD & EXIT NOTES
        ═══════════════════════════════════════ */}
        {tab === "yield" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card eyebrow="Yield Opportunities During Exit" accent={T.purple}>
              <div style={{ color: T.textMid, fontSize: 11, lineHeight: 1.6, marginBottom: 14 }}>
                As you scale out of positions, not everything needs to go to cash.
                Some proceeds can rotate into yield-bearing positions that earn during the pandemonium.
                This is how you make money while waiting for the next tier.
              </div>

              {Object.entries(ASSETS).filter(([_, a]) => a.yieldNote).map(([key, asset]) => (
                <div key={key} style={{
                  background: T.bg, borderRadius: 8, padding: "14px 16px", marginBottom: 8,
                  border: `1px solid ${asset.color}22`, borderLeft: `3px solid ${asset.color}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{asset.icon}</span>
                    <span style={{ color: asset.color, fontSize: 13, fontWeight: 700 }}>{asset.label}</span>
                  </div>
                  <div style={{ color: T.textMid, fontSize: 11, lineHeight: 1.7 }}>
                    {asset.yieldNote}
                  </div>
                </div>
              ))}

              {/* General staking strategy */}
              <div style={{
                background: T.purple + "08", borderRadius: 8, padding: "14px",
                border: `1px solid ${T.purple}33`, marginTop: 4,
              }}>
                <div style={{ color: T.purple, fontSize: 10, fontWeight: 800, fontFamily: mono, marginBottom: 6 }}>
                  THE EXIT-TO-YIELD FRAMEWORK (SOLVE LATER)
                </div>
                <div style={{ color: T.textMid, fontSize: 11, lineHeight: 1.7 }}>
                  {[
                    "At Tier 1: Sell 25% → move half to stablecoins, half to staked positions (stETH, veCRV, vlCVX)",
                    "At Tier 2: Sell 30-35% → majority to stablecoins/tax reserve, small portion to yield",
                    "At Tier 3: Sell remaining → cash is king in euphoria. Yield positions are a bear market setup.",
                    "Core holds: These ARE the yield positions. veCRV and vlCVX earn fees passively.",
                  ].map((line, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start",
                    }}>
                      <span style={{ color: T.purple, fontWeight: 800, fontSize: 10, fontFamily: mono, marginTop: 2 }}>
                        {["T1", "T2", "T3", "💎"][i]}
                      </span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Loan repayment reminder */}
            <Card eyebrow="⚠ Tier 0 — Loan Repayment Priority" accent={T.red}>
              <div style={{ color: T.textMid, fontSize: 11, lineHeight: 1.7, marginBottom: 10 }}>
                Before ANY exit tier profit-taking, the Fraxlend loans must be repaid. Liquidation risk
                is existential — a 20% drop when you're at 1.3 health can wipe your entire position.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { asset: "CRV", debt: "$5,797 FRAX", trigger: "CRV @ $0.40–$0.50", health: "1.34 ⚠️", color: T.crv },
                  { asset: "CVX", debt: "$4,268 FRAX", trigger: "CVX @ $3.50–$4.00", health: "1.65 ✓", color: T.cvx },
                ].map((loan, i) => (
                  <div key={i} style={{
                    background: T.bg, borderRadius: 8, padding: "10px 14px",
                    border: `1px solid ${loan.color}22`,
                  }}>
                    <div style={{ color: loan.color, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{loan.asset} Loan</div>
                    <div style={{ color: T.textDim, fontSize: 10, lineHeight: 1.6 }}>
                      <div>Debt: <span style={{ color: T.red }}>{loan.debt}</span></div>
                      <div>Trigger: <span style={{ color: T.textMid }}>{loan.trigger}</span></div>
                      <div>Current Health: <span style={{ color: T.textMid }}>{loan.health}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ color: T.red, fontSize: 10, fontWeight: 700, fontFamily: mono, marginTop: 10 }}>
                TOTAL DEBT: $10,065 · REPAYMENT IS TIER 0 · NON-NEGOTIABLE
              </div>
            </Card>

            {/* Exit money destination */}
            <Card eyebrow="Where Exit Money Goes" accent={T.orange}>
              {[
                { dest: "30–40% → Tax Reserve", note: "Separate savings account. Short-term capital gains on non-retirement funds. Set aside DAY ONE.", color: T.red },
                { dest: "20–30% → Long-term Accumulation", note: "Roll 2026 profits into the Debt Thesis. Feeds Phase B.", color: T.blue },
                { dest: "20–30% → Yield Positions", note: "stETH, veCRV, vlCVX, stablecoin lending. Earning while waiting for Phase B entry.", color: T.purple },
                { dest: "10–20% → Stable Assets", note: "High-yield savings, bonds, uranium (UUUU/ASPI). Solvency buffer for bear market.", color: T.green },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, padding: "8px 0",
                  borderBottom: i < 3 ? `1px solid ${T.border}` : "none",
                }}>
                  <div style={{ color: item.color, fontWeight: 700, fontSize: 11, minWidth: 200 }}>{item.dest}</div>
                  <div style={{ color: T.textDim, fontSize: 10, lineHeight: 1.5 }}>{item.note}</div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 16, padding: "12px 14px", background: T.card,
          borderRadius: 8, border: `1px solid ${T.border}`,
        }}>
          <div style={{ color: T.textDim, fontSize: 10, lineHeight: 1.6 }}>
            <strong style={{ color: T.orange }}>v2 Multi-Asset</strong> — Numbers use {useMidpoint ? "midpoint" : "conservative (low)"} of
            each tier's price range. CRV/CVX tiers include Tier 0 loan repayment before any profit-taking.
            This calculator assumes staged exits — if any asset stalls before reaching all tiers, actual returns
            will be lower. The asymmetric math on CRV (45× potential) is what makes the portfolio work, but it's
            also the highest-risk component. BTC is the anchor, CRV/CVX is the engine.
          </div>
        </div>
      </div>
    </div>
  );
}
