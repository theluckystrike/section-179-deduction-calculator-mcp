# section-179-deduction-calculator-mcp

An MCP server that calculates the Section 179 deduction, bonus depreciation, heavy SUV and passenger auto limits, and asset loan payments with after-tax cost, using the 2025 and 2026 IRS limits after the One Big Beautiful Bill Act (P.L. 119-21).

Hosted endpoint, no sign-in and no token:

```
https://section-179-deduction-calculator-mcp.lipmichal.workers.dev/mcp
```

## Tools

| Tool | What it does |
|---|---|
| `calculate_section_179` | Section 179 deduction with the $2,500,000 (2025) and $2,560,000 (2026) limits, the dollar-for-dollar phase-out above $4,000,000 / $4,090,000, the business income limit and the carryover. |
| `calculate_bonus_depreciation` | Bonus depreciation rate from the acquisition and placed-in-service dates: 100% for property acquired after January 19, 2025, the 40% / 60% election, and the phase-down for property acquired earlier. Applies it after Section 179. |
| `get_vehicle_depreciation_limits` | First-year limits by gross vehicle weight: passenger auto caps ($20,300 with bonus for 2026), heavy SUV Section 179 cap ($31,300 / $32,000), no cap over 14,000 lb, and the over-50% business use rule. |
| `calculate_asset_loan_payment` | Monthly payment, total and first-year interest for an equipment, truck, tractor, RV, land, manufactured home, ATV, pontoon or other asset loan, plus first-year net cash and lifetime after-tax cost for business use. |

Every result has structured JSON, a plain-English summary, `as_of`, `source` (the irs.gov document) and `more` (a calculator page on assetloancalculator.com).

## What it knows that your model does not

- The One Big Beautiful Bill Act raised the Section 179 limit to $2,500,000 for 2025. Rev. Proc. 2025-32 set $2,560,000 and a $4,090,000 phase-out start for 2026.
- Bonus depreciation is 100% again, permanently, for property acquired after January 19, 2025. The acquisition date is the date of a written binding contract, not delivery.
- Property acquired on or before January 19, 2025 and placed in service in 2025 gets 40%, not 100% (60% for long production property).
- In the first tax year ending after January 19, 2025 you can elect 40% instead of 100%.
- The 2026 heavy SUV cap is $32,000, and the 2026 first-year cap on a car of 6,000 lb or less is $20,300 with bonus (Rev. Proc. 2026-15).
- The IRS has not published the 2027 limits yet (checked 2026-11-02). The tools say so instead of guessing.

## Install

### Claude.ai custom connector or ChatGPT developer mode

Add a custom connector and paste the URL. No token is needed.

```
https://section-179-deduction-calculator-mcp.lipmichal.workers.dev/mcp
```

### Claude Code

```
claude mcp add --transport http section-179-deduction https://section-179-deduction-calculator-mcp.lipmichal.workers.dev/mcp
```

Or run it locally:

```
claude mcp add section-179-deduction -- npx -y github:theluckystrike/section-179-deduction-calculator-mcp
```

### Claude Desktop

Add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "section-179-deduction": {
      "command": "npx",
      "args": ["-y", "github:theluckystrike/section-179-deduction-calculator-mcp"]
    }
  }
}
```

### Cursor

Add this to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "section-179-deduction": {
      "url": "https://section-179-deduction-calculator-mcp.lipmichal.workers.dev/mcp"
    }
  }
}
```

### VS Code

Add this to `.vscode/mcp.json`:

```json
{
  "servers": {
    "section-179-deduction": {
      "type": "http",
      "url": "https://section-179-deduction-calculator-mcp.lipmichal.workers.dev/mcp"
    }
  }
}
```

Node 20 or newer is needed for the local `npx` version.

## Example prompts

- "We placed $4.19 million of equipment in service in 2026. What is our Section 179 limit?"
- "I signed the contract for a CNC machine in December 2024 and it arrived in March 2025. Do I get 100% bonus depreciation?"
- "Can I write off a 6,500 lb SUV that costs $80,000 and that I use 90% for business in 2026?"
- "What is the first-year depreciation cap on a 4,500 lb sedan placed in service in 2026?"
- "I am financing a $120,000 excavator with $20,000 down at 6% for 60 months. What is the payment and the after-tax cost at a 30% rate?"

## Data sources

All limits come from irs.gov documents fetched on 2026-11-02: Rev. Proc. 2025-32, the 2025 Instructions for Form 4562, Pub. 946 (2025), Notice 2026-11, Rev. Proc. 2025-16 and Rev. Proc. 2026-15. See [DATA_SOURCES.md](DATA_SOURCES.md) for each item and URL.

## Limitations

- Results are estimates, not tax advice.
- Federal rules only. Many states do not follow Section 179 or bonus depreciation.
- It does not decide whether an asset is qualified property or compute MACRS tables after year one.
- The after-tax cost uses one flat marginal rate and ignores recapture when you sell.
- Qualified production property (IRC 168(n)) and specified plants are not covered.
- Personal tax breaks such as the car loan interest deduction are in a separate server: [car-loan-interest-deduction-calculator-mcp](https://github.com/theluckystrike/car-loan-interest-deduction-calculator-mcp).

## More

Calculators for people: [assetloancalculator.com](https://assetloancalculator.com/section-179-deduction-calculator/?utm_source=mcp&utm_medium=section-179-deduction-calculator-mcp).

Part of the Zovo MCP collection: https://mcp.zovo.one

## Development

```
npm install
npm run build
npm test
```

`src/core.ts` holds all the rules and has no I/O. `src/stdio.ts` is the local entry and `src/worker.ts` is the Cloudflare Worker entry. Both use the same tool registry in `src/tools.ts`.

## License

MIT

<!-- data-servers:start -->
## More data servers from the same author

Each one is free, needs no API key and has a hosted URL you can paste into Claude or ChatGPT.

| server | tools | hosted URL |
|---|---|---|
| [cups-to-grams-mcp](https://github.com/theluckystrike/cups-to-grams-mcp) | convert_ingredient, search_ingredients, scale_recipe, convert_oven_temperature | `https://cups-to-grams-mcp.lipmichal.workers.dev/mcp` |
| [dscr-loan-calculator-mcp](https://github.com/theluckystrike/dscr-loan-calculator-mcp) | calculate_dscr, max_loan_for_target_dscr, rent_needed_for_target_dscr, compare_scenarios, amortization_summary | `https://dscr-loan-calculator-mcp.lipmichal.workers.dev/mcp` |
| [gold-price-per-gram-mcp](https://github.com/theluckystrike/gold-price-per-gram-mcp) | get_gold_price_per_gram, get_metal_prices, calculate_jewelry_value, convert_gold_units | `https://gold-price-per-gram-mcp.lipmichal.workers.dev/mcp` |
| [lake-level-mcp](https://github.com/theluckystrike/lake-level-mcp) | search_lakes, get_lake_level, get_lake_history, compare_lakes | `https://lake-level-mcp.lipmichal.workers.dev/mcp` |
| [minimum-wage-mcp](https://github.com/theluckystrike/minimum-wage-mcp) | get_minimum_wage, list_upcoming_increases, compare_states, annual_income_at_minimum_wage | `https://minimum-wage-mcp.lipmichal.workers.dev/mcp` |
| [no-tax-on-overtime-mcp](https://github.com/theluckystrike/no-tax-on-overtime-mcp) | calculate_overtime_deduction, calculate_tips_deduction, calculate_senior_deduction, estimate_tax_savings, explain_eligibility | `https://no-tax-on-overtime-mcp.lipmichal.workers.dev/mcp` |
| [paycheck-calculator-mcp](https://github.com/theluckystrike/paycheck-calculator-mcp) | calculate_take_home_pay, compare_states_take_home, salary_to_hourly, hourly_to_salary, get_federal_tax_brackets | `https://paycheck-calculator-mcp.lipmichal.workers.dev/mcp` |
| [uk-income-tax-salary-mcp](https://github.com/theluckystrike/uk-income-tax-salary-mcp) | calculate_uk_take_home, get_uk_tax_bands, compare_salaries, marginal_rate_at_income | `https://uk-income-tax-salary-mcp.lipmichal.workers.dev/mcp` |
| [us-federal-holidays-business-days-mcp](https://github.com/theluckystrike/us-federal-holidays-business-days-mcp) | list_federal_holidays, is_business_day, add_business_days, count_business_days, invoice_due_date | `https://us-federal-holidays-business-days-mcp.lipmichal.workers.dev/mcp` |
| [ab-test-sample-size-calculator-mcp](https://github.com/theluckystrike/ab-test-sample-size-calculator-mcp) | calculate_sample_size, estimate_test_duration, test_ab_significance, fisher_exact_test, check_peeking_risk | `https://ab-test-sample-size-calculator-mcp.lipmichal.workers.dev/mcp` |
| [ap-score-distributions-mcp](https://github.com/theluckystrike/ap-score-distributions-mcp) | get_ap_score_distribution, estimate_ap_percentile, compare_ap_exams, list_ap_exams, estimate_ap_score_from_composite | `https://ap-score-distributions-mcp.lipmichal.workers.dev/mcp` |
| [car-loan-interest-deduction-calculator-mcp](https://github.com/theluckystrike/car-loan-interest-deduction-calculator-mcp) | calculate_car_loan_interest_deduction, calculate_salt_deduction, get_tax_brackets_and_standard_deduction, calculate_child_tax_credit | `https://car-loan-interest-deduction-calculator-mcp.lipmichal.workers.dev/mcp` |
| [recipe-nutrition-calculator-mcp](https://github.com/theluckystrike/recipe-nutrition-calculator-mcp) | lookup_ingredient_nutrition, calculate_recipe_nutrition, round_nutrition_label, scale_recipe_nutrition | `https://recipe-nutrition-calculator-mcp.lipmichal.workers.dev/mcp` |
| [retirement-contribution-limits-2027-mcp](https://github.com/theluckystrike/retirement-contribution-limits-2027-mcp) | get_contribution_limits, calculate_max_contribution, get_social_security_cola, compare_years | `https://retirement-contribution-limits-2027-mcp.lipmichal.workers.dev/mcp` |
| [subdomain-finder-mcp](https://github.com/theluckystrike/subdomain-finder-mcp) | find_subdomains, resolve_subdomains, get_certificate_history, summarize_attack_surface | `https://subdomain-finder-mcp.lipmichal.workers.dev/mcp` |

The paid back-office collection (invoices, VAT, PDFs, spreadsheets) is at https://mcp.zovo.one
<!-- data-servers:end -->
