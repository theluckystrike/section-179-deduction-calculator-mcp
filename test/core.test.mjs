// Fixtures: expected values come from IRS worked examples (cited) or hand-checked arithmetic
// on Form 4562 Part I, Rev. Proc. 2025-32 sec. 4.24, Rev. Proc. 2025-16 / 2026-15 and Notice 2026-11.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateSection179 as s179, calculateBonusDepreciation as bonus, getVehicleLimits as vehicle,
  calculateAssetLoan as loan, InputError,
} from "../dist/core.js";

test("T1 Pub. 946 example (Jane Ash): 2025 cost $4,050,000 -> limit $2,450,000", () => {
  const r = s179({ tax_year: 2025, total_section_179_property_cost: 4050000 });
  assert.equal(r.reduction, 50000);
  assert.equal(r.dollar_limit_after_phase_out, 2450000);
});

test("T2 Pub. 946: 2025 cost $6,500,000 or more -> no section 179", () => {
  const r = s179({ tax_year: 2025, total_section_179_property_cost: 6500000 });
  assert.equal(r.dollar_limit_after_phase_out, 0);
  assert.equal(r.fully_phased_out_at, 6500000);
});

test("T3 Rev. Proc. 2025-32 sec. 4.24: 2026 cost $4,190,000 -> $2,560,000 - $100,000 = $2,460,000; zero at $6,650,000", () => {
  const r = s179({ tax_year: 2026, total_section_179_property_cost: 4190000 });
  assert.equal(r.dollar_limit_after_phase_out, 2460000);
  assert.equal(r.fully_phased_out_at, 6650000);
});

test("T4 under the threshold: 2026 $120,000 machine -> $120,000", () => {
  assert.equal(s179({ tax_year: 2026, total_section_179_property_cost: 120000 }).deduction, 120000);
});

test("T5 business income limit: elect $100,000, income $60,000 -> $60,000 now, $40,000 carryover", () => {
  const r = s179({ tax_year: 2026, total_section_179_property_cost: 100000, elected_cost: 100000, business_taxable_income: 60000 });
  assert.equal(r.deduction, 60000);
  assert.equal(r.carryover_to_next_year, 40000);
});

test("T6 Pub. 946 example: $2,500,000 machinery + $25,000 saw in 2025 -> maximum $2,500,000", () => {
  assert.equal(s179({ tax_year: 2025, total_section_179_property_cost: 2525000 }).deduction, 2500000);
});

test("T7 2027 limits not published -> helpful error", () => {
  assert.throws(() => s179({ tax_year: 2027, total_section_179_property_cost: 1000 }), /not published/);
});

test("T8 OBBBA: acquired 2025-03-01, in service 2025-06-01 -> 100%", () => {
  const r = bonus({ acquired_date: "2025-03-01", placed_in_service_date: "2025-06-01", depreciable_basis: 100000 });
  assert.equal(r.bonus_rate, 1);
  assert.equal(r.special_depreciation_allowance, 100000);
});

test("T9 168(k)(10) election in first tax year after Jan 19, 2025: 40%, long production 60%", () => {
  assert.equal(bonus({ acquired_date: "2025-03-01", placed_in_service_date: "2025-06-01", depreciable_basis: 100000, elect_reduced_rate: true }).special_depreciation_allowance, 40000);
  assert.equal(bonus({ acquired_date: "2025-03-01", placed_in_service_date: "2025-06-01", depreciable_basis: 100000, elect_reduced_rate: true, long_production_or_aircraft: true }).special_depreciation_allowance, 60000);
  assert.throws(() => bonus({ acquired_date: "2025-03-01", placed_in_service_date: "2026-02-01", depreciable_basis: 100000, elect_reduced_rate: true }), InputError);
});

test("T10 boundary: acquired 2025-01-19 -> TCJA 40%; acquired 2025-01-20 -> 100%", () => {
  assert.equal(bonus({ acquired_date: "2025-01-19", placed_in_service_date: "2025-02-01", depreciable_basis: 100000 }).bonus_rate, 0.4);
  assert.equal(bonus({ acquired_date: "2025-01-20", placed_in_service_date: "2025-02-01", depreciable_basis: 100000 }).bonus_rate, 1);
});

test("T11 Notice 2026-11 sec. 2.01 TCJA phase-down: pre-Jan 20 2025 property in service 2025 40% (LPP 60%), 2024 60%, 2026 20%, 2027 0% (LPP 20%)", () => {
  const rate = (acq, pis, lpp = false) => bonus({ acquired_date: acq, placed_in_service_date: pis, depreciable_basis: 1000, long_production_or_aircraft: lpp }).bonus_rate;
  assert.equal(rate("2024-12-15", "2025-02-01"), 0.4);
  assert.equal(rate("2024-06-01", "2025-08-01", true), 0.6);
  assert.equal(rate("2024-01-10", "2024-03-01"), 0.6);
  assert.equal(rate("2024-11-01", "2026-03-01"), 0.2);
  assert.equal(rate("2024-11-01", "2027-03-01"), 0);
  assert.equal(rate("2024-11-01", "2027-03-01", true), 0.2);
});

test("T12 bonus runs on basis left after section 179: $150,000 - $50,000 -> $100,000 bonus, $0 MACRS", () => {
  const r = bonus({ acquired_date: "2025-02-01", placed_in_service_date: "2025-04-01", depreciable_basis: 150000, section_179_deduction: 50000 });
  assert.equal(r.special_depreciation_allowance, 100000);
  assert.equal(r.remaining_basis_for_macrs, 0);
  assert.equal(r.first_year_section_179_plus_bonus, 150000);
});

test("T13 Rev. Proc. 2026-15 / 2025-16 tables: passenger auto year 1 $20,300 / $12,300 (2026), $20,200 / $12,200 (2025)", () => {
  assert.equal(vehicle({ tax_year: 2026, gvwr_lbs: 4500 }).first_year_maximum_deduction, 20300);
  assert.equal(vehicle({ tax_year: 2026, gvwr_lbs: 4500, bonus_eligible: false }).first_year_maximum_deduction, 12300);
  assert.equal(vehicle({ tax_year: 2025, gvwr_lbs: 6000 }).first_year_maximum_deduction, 20200);
  assert.equal(vehicle({ tax_year: 2025, gvwr_lbs: 6000, bonus_eligible: false }).first_year_maximum_deduction, 12200);
});

test("T14 280F limits scale by business use: 60% -> $12,180 year 1, $11,880 year 2 (2026)", () => {
  const r = vehicle({ tax_year: 2026, gvwr_lbs: 4000, business_use_percent: 60 });
  assert.equal(r.passenger_auto_limits_by_year.year_1, 12180);
  assert.equal(r.passenger_auto_limits_by_year.year_2, 11880);
});

test("T15 heavy SUV $80,000: 2026 cap $32,000 + bonus $48,000 = $80,000; no bonus -> $32,000; 2025 cap $31,300", () => {
  const r = vehicle({ tax_year: 2026, gvwr_lbs: 6500, cost: 80000 });
  assert.equal(r.section_179_cap, 32000);
  assert.equal(r.first_year_maximum_deduction, 80000);
  assert.equal(vehicle({ tax_year: 2026, gvwr_lbs: 6500, cost: 80000, bonus_eligible: false }).first_year_maximum_deduction, 32000);
  assert.equal(vehicle({ tax_year: 2025, gvwr_lbs: 7000, cost: 80000 }).section_179_cap, 31300);
});

test("T16 50% business use or less -> no 179 or bonus", () => {
  const r = vehicle({ tax_year: 2026, gvwr_lbs: 6500, cost: 80000, business_use_percent: 50 });
  assert.equal(r.qualifies_for_179_and_bonus, false);
  assert.equal(r.first_year_maximum_deduction, null);
});

test("T17 over 14,000 lb or exempt design: no vehicle cap", () => {
  assert.equal(vehicle({ tax_year: 2026, gvwr_lbs: 26000, cost: 150000 }).first_year_maximum_deduction, 150000);
  assert.equal(vehicle({ tax_year: 2026, gvwr_lbs: 7000, cost: 70000, exempt_from_suv_cap: true }).first_year_maximum_deduction, 70000);
});

test("T18 amortization: $100,000 at 6% for 60 months -> $1,933.28 a month", () => {
  const r = loan({ price: 100000, apr_percent: 6, term_months: 60 });
  assert.equal(r.monthly_payment, 1933.28);
  assert.ok(Math.abs(r.total_interest - 15996.8) < 0.05);
});

test("T19 0% APR: $10,000 over 10 months -> $1,000, no interest", () => {
  const r = loan({ price: 12000, down_payment: 2000, apr_percent: 0, term_months: 10 });
  assert.equal(r.monthly_payment, 1000);
  assert.equal(r.total_interest, 0);
});

test("T20 after-tax: $50,000 at 0% for 12 months, fully expensed at 30% -> saving $15,000, net $35,000", () => {
  const r = loan({ price: 50000, apr_percent: 0, term_months: 12, business_use_percent: 100, marginal_tax_rate: 0.3 });
  assert.equal(r.after_tax.first_year_tax_saving, 15000);
  assert.equal(r.after_tax.first_year_net_cash, 35000);
  assert.equal(r.after_tax.after_tax_total_cost, 35000);
});
