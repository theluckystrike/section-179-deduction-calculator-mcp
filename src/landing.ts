// GET / page for the hosted Worker.
const TOOLS: Array<[string, string]> = [
  ["calculate_section_179", "Section 179 deduction with the $2,500,000 (2025) and $2,560,000 (2026) limits, the dollar-for-dollar phase-out above $4,000,000 / $4,090,000 and the business income limit."],
  ["calculate_bonus_depreciation", "Bonus depreciation rate by acquisition and placed-in-service date: 100% after January 19, 2025, the 40% / 60% election, and the phase-down for earlier property."],
  ["get_vehicle_depreciation_limits", "Heavy SUV Section 179 cap ($31,300 / $32,000), passenger auto caps ($20,300 first year with bonus for 2026) and the over-50% business use rule."],
  ["calculate_asset_loan_payment", "Monthly payment, total and first-year interest for an equipment, truck, RV, land or other asset loan, plus first-year and lifetime after-tax cost."],
];

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function landingPage(origin: string): string {
  const mcp = `${origin}/mcp`;
  const rows = TOOLS.map(([n, d]) => `<tr><td><code>${n}</code></td><td>${esc(d)}</td></tr>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Section 179 Deduction MCP</title>
<meta name="description" content="MCP server for the Section 179 deduction, 100% bonus depreciation, heavy SUV limits and asset loan payments, with 2025 and 2026 IRS limits.">
<style>:root{--bg:#fff;--fg:#1a1a1a;--muted:#555;--line:#ddd;--code:#f4f4f4}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#eee;--muted:#aaa;--line:#333;--code:#222}}
body{background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif;max-width:760px;margin:0 auto;padding:24px 16px}
code,pre{background:var(--code);border-radius:4px;font-size:14px}pre{padding:10px;overflow-x:auto}code{padding:1px 4px}
table{border-collapse:collapse;width:100%}td{border-top:1px solid var(--line);padding:8px 6px;vertical-align:top}p.small{color:var(--muted);font-size:14px}a{color:inherit}</style></head>
<body><h1>Section 179 Deduction MCP server</h1>
<p>Gives an AI assistant the business write-off rules changed by the One Big Beautiful Bill Act (P.L. 119-21): the higher Section 179 limits for 2025 and 2026, permanent 100% bonus depreciation for property acquired after January 19, 2025, the heavy SUV and passenger auto caps, and asset loan math, with every limit copied from irs.gov.</p>
<h2>Connect</h2>
<p>Hosted endpoint (Streamable HTTP, no sign-in, no token). Paste it into Claude.ai custom connectors or ChatGPT developer mode.</p>
<pre>${esc(mcp)}</pre>
<p>Claude Code</p><pre>claude mcp add --transport http section-179-deduction ${esc(mcp)}</pre>
<p>Local (stdio)</p><pre>npx -y github:theluckystrike/section-179-deduction-calculator-mcp</pre>
<h2>Tools</h2><table>${rows}</table>
<p>Calculators for people: <a href="https://assetloancalculator.com/section-179-deduction-calculator/?utm_source=mcp&amp;utm_medium=section-179-deduction-calculator-mcp">assetloancalculator.com</a>.
Source: <a href="https://github.com/theluckystrike/section-179-deduction-calculator-mcp">github.com/theluckystrike/section-179-deduction-calculator-mcp</a>.</p>
<p class="small">Results are estimates, not tax advice. Part of the Zovo MCP collection: <a href="https://mcp.zovo.one">mcp.zovo.one</a>.</p>
</body></html>`;
}
