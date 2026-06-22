// ─────────────────────────────────────────────────────────────────────────────
// QUARTERLY CAPEX — Microsoft, Amazon, Google (Q1 2023 → Q4 2025)
//
// Series sources (cash-flow-statement line items, in each company's 10-Q/10-K):
//   msftCapex   = Microsoft: "Additions to property and equipment" on the
//                 consolidated cash flow statement — cash capex only. Finance
//                 lease additions are disclosed separately in the supplemental
//                 cash flow information section under "Right-of-use assets
//                 obtained in exchange for lease obligations: Finance leases"
//                 and are not included in this line. XBRL tag: us-gaap:
//                 PaymentsToAcquirePropertyPlantAndEquipment.
//   amznCapex   = Amazon (CIK 0001018724): "Purchases of property and
//                 equipment" — gross figure from the consolidated cash flow
//                 statement under Investing Activities. XBRL tag: us-gaap:
//                 PaymentsToAcquireProductiveAssets. This is the GAAP figure,
//                 not the non-GAAP "net of proceeds from sales and incentives"
//                 figure that appears in Amazon's free cash flow
//                 reconciliation table.
//   googlCapex  = Google (Alphabet): "Purchases of property and equipment".
//                 XBRL tag: us-gaap:PaymentsToAcquirePropertyPlantAndEquipment.
//
// Units: all figures are USD billions, to three decimal places (e.g. $9,917M
// → 9.917).
//
// Sourcing method:
//   • Direct 3-month rows are used where the filing reports a single-quarter
//     period (typical for non-fiscal-year-end quarters).
//   • Where the filing reports only YTD totals (always the case for Google;
//     fiscal-year-end quarters for Microsoft and Amazon), the single-quarter
//     value is DERIVED as (current YTD) − (prior YTD). Both source filings
//     are cited in the per-row comment.
//   • All values pulled from SEC EDGAR XBRL (data.sec.gov), cross-checked
//     against the underlying 10-Q / 10-K cash-flow statements.
//
// Calendar-quarter normalization: Microsoft's fiscal year starts July 1, so
// Microsoft's filings label quarters differently from the calendar. We
// remap to calendar quarters here:
//   MSFT FY23 Q3 = calendar Q1 2023     MSFT FY24 Q3 = calendar Q1 2024
//   MSFT FY23 Q4 = calendar Q2 2023     MSFT FY24 Q4 = calendar Q2 2024
//   MSFT FY24 Q1 = calendar Q3 2023     MSFT FY25 Q1 = calendar Q3 2024
//   MSFT FY24 Q2 = calendar Q4 2023     MSFT FY25 Q2 = calendar Q4 2024
//                                       MSFT FY25 Q3 = calendar Q1 2025
//                                       MSFT FY25 Q4 = calendar Q2 2025
//                                       MSFT FY26 Q1 = calendar Q3 2025
//                                       MSFT FY26 Q2 = calendar Q4 2025
// Amazon and Alphabet already report on calendar quarters; no remap needed.
//
// COMPARABILITY NOTE — Amazon gross vs. net capex:
// Amazon discloses two capex figures: (1) gross "Purchases of property and
// equipment" on the cash flow statement, and (2) "Purchases of property and
// equipment, net of proceeds from sales and incentives" in the FCF
// reconciliation table. The two differ by ~$5–6B/year. We use the gross
// figure for three reasons: (a) Microsoft and Google report gross capex on
// their cash flow statements, so gross is the only basis on which all three
// can be compared apples-to-apples; (b) the "incentives" component of
// Amazon's net figure consists primarily of state and local government
// incentives for data center construction, which do not reduce the capacity
// Amazon is building — netting them out would understate Amazon's capacity
// buildout; (c) the cash flow statement figure is GAAP and matches the
// standard XBRL tag used by financial data providers, while the net figure
// is an Amazon-specific non-GAAP construct. The same logic applies to
// similar incentive arrangements Microsoft and Google receive, which are
// likewise not netted in their cash flow statements.
//
// COMPARABILITY NOTE — cash capex vs. total capex including finance leases:
// All three companies disclose capex on the consolidated cash flow statement
// as a cash outflow only. Assets acquired under finance leases do not appear
// on the cash flow statement at the time of acquisition — they appear in the
// property and equipment footnote (Note 6 or equivalent) and in supplemental
// lease disclosures. For Microsoft in FY26 Q2, cash capex was approximately
// $29.9B while total capex including finance lease additions was
// approximately $37.5B — a 25% gap. The gap exists for Amazon and Google as
// well, with different magnitudes. We use cash capex only, for the same
// reasons we use gross Amazon capex: it is the GAAP figure from the
// canonical financial statement, it matches standard XBRL tags, and it is
// consistently disclosed across all 36 quarter-company cells in this
// dataset. This means our capex figures understate true capacity buildout —
// but they understate it consistently across all three companies, preserving
// comparability. The /capex analysis page that consumes this data should
// surface this limitation in its methodology section.
// ─────────────────────────────────────────────────────────────────────────────

export interface CapexPoint {
  quarter: string
  msftCapex: number | null   // USD billions, Microsoft 10-Q (FY remapped to calendar)
  amznCapex: number | null   // USD billions, Amazon 10-Q
  googlCapex: number | null  // USD billions, Alphabet 10-Q
}

export const CAPEX_QUARTERLY: CapexPoint[] = [
  // Q1 2023:
  //   MSFT (FY23 Q3): 10-Q filed 2023-04-25 (accn 0000950170-23-014423), "Additions to property and equipment" 3mo col = $6,607M
  //   AMZN: 10-Q filed 2023-04-28 (accn 0001018724-23-000008), "Purchases of property and equipment, net" 3mo col = $14,207M
  //   GOOGL: 10-Q filed 2023-04-26 (accn 0001652044-23-000045), "Purchases of property and equipment" 3mo col (= Q1 YTD) = $6,289M
  { quarter: 'Q1 2023', msftCapex: 6.607, amznCapex: 14.207, googlCapex: 6.289 },

  // Q2 2023:
  //   MSFT (FY23 Q4): Derivation: FY23 10-K (filed 2023-07-27, accn 0000950170-23-035122) 12mo $28,107M − FY23 Q3 10-Q (filed 2023-04-25) 9mo YTD $19,164M = $8,943M
  //   AMZN: 10-Q filed 2023-08-04 (accn 0001018724-23-000012), 3mo col = $11,455M
  //   GOOGL: Derivation: 10-Q filed 2023-07-26 (accn 0001652044-23-000070) 6mo YTD $13,177M − Q1 10-Q (filed 2023-04-26) 3mo $6,289M = $6,888M
  { quarter: 'Q2 2023', msftCapex: 8.943, amznCapex: 11.455, googlCapex: 6.888 },

  // Q3 2023:
  //   MSFT (FY24 Q1): 10-Q filed 2023-10-24 (accn 0000950170-23-054855), "Additions to property and equipment" 3mo col = $9,917M
  //   AMZN: 10-Q filed 2023-10-27 (accn 0001018724-23-000018), 3mo col = $12,479M
  //   GOOGL: Derivation: 10-Q filed 2023-10-25 (accn 0001652044-23-000094) 9mo YTD $21,232M − 6mo YTD $13,177M = $8,055M
  { quarter: 'Q3 2023', msftCapex: 9.917, amznCapex: 12.479, googlCapex: 8.055 },

  // Q4 2023:
  //   MSFT (FY24 Q2): 10-Q filed 2024-01-30 (accn 0000950170-24-008814), "Additions to property and equipment" 3mo col = $9,735M
  //   AMZN: Derivation: FY23 10-K (filed 2024-02-02, accn 0001018724-24-000008) 12mo $52,729M − Q3 10-Q (filed 2023-10-27) 9mo YTD $38,141M = $14,588M
  //   GOOGL: Derivation: FY23 10-K (filed 2024-01-31, accn 0001652044-24-000022) 12mo $32,251M − Q3 10-Q (filed 2023-10-25) 9mo YTD $21,232M = $11,019M
  { quarter: 'Q4 2023', msftCapex: 9.735, amznCapex: 14.588, googlCapex: 11.019 },

  // Q1 2024:
  //   MSFT (FY24 Q3): 10-Q filed 2024-04-25 (accn 0000950170-24-048288), "Additions to property and equipment" 3mo col = $10,952M
  //   AMZN: 10-Q filed 2024-05-01 (accn 0001018724-24-000083), 3mo col = $14,925M
  //   GOOGL: 10-Q filed 2024-04-26 (accn 0001652044-24-000053), 3mo col (= Q1 YTD) = $12,012M
  { quarter: 'Q1 2024', msftCapex: 10.952, amznCapex: 14.925, googlCapex: 12.012 },

  // Q2 2024:
  //   MSFT (FY24 Q4): Derivation: FY24 10-K (filed 2024-07-30, accn 0000950170-24-087843) 12mo $44,477M − FY24 Q3 10-Q (filed 2024-04-25) 9mo YTD $30,604M = $13,873M
  //   AMZN: 10-Q filed 2024-08-02 (accn 0001018724-24-000130), 3mo col = $17,620M
  //   GOOGL: Derivation: 10-Q filed 2024-07-24 (accn 0001652044-24-000079) 6mo YTD $25,198M − Q1 10-Q (filed 2024-04-26) 3mo $12,012M = $13,186M
  { quarter: 'Q2 2024', msftCapex: 13.873, amznCapex: 17.620, googlCapex: 13.186 },

  // Q3 2024:
  //   MSFT (FY25 Q1): 10-Q filed 2024-10-30 (accn 0000950170-24-118967), "Additions to property and equipment" 3mo col = $14,923M
  //   AMZN: 10-Q filed 2024-11-01 (accn 0001018724-24-000161), 3mo col = $22,620M
  //   GOOGL: Derivation: 10-Q filed 2024-10-30 (accn 0001652044-24-000118) 9mo YTD $38,259M − 6mo YTD $25,198M = $13,061M
  { quarter: 'Q3 2024', msftCapex: 14.923, amznCapex: 22.620, googlCapex: 13.061 },

  // Q4 2024:
  //   MSFT (FY25 Q2): 10-Q filed 2025-01-29 (accn 0000950170-25-010491), "Additions to property and equipment" 3mo col = $15,804M
  //   AMZN: Derivation: FY24 10-K (filed 2025-02-07, accn 0001018724-25-000004) 12mo $82,999M − Q3 10-Q (filed 2024-11-01) 9mo YTD $55,165M = $27,834M
  //   GOOGL: Derivation: FY24 10-K (filed 2025-02-05, accn 0001652044-25-000014) 12mo $52,535M − Q3 10-Q (filed 2024-10-30) 9mo YTD $38,259M = $14,276M
  { quarter: 'Q4 2024', msftCapex: 15.804, amznCapex: 27.834, googlCapex: 14.276 },

  // Q1 2025:
  //   MSFT (FY25 Q3): 10-Q filed 2025-04-30 (accn 0000950170-25-061046), "Additions to property and equipment" 3mo col = $16,745M
  //   AMZN: 10-Q filed 2025-05-02 (accn 0001018724-25-000036), 3mo col = $25,019M
  //   GOOGL: 10-Q filed 2025-04-25 (accn 0001652044-25-000043), 3mo col (= Q1 YTD) = $17,197M
  { quarter: 'Q1 2025', msftCapex: 16.745, amznCapex: 25.019, googlCapex: 17.197 },

  // Q2 2025:
  //   MSFT (FY25 Q4): Derivation: FY25 10-K (filed 2025-07-30, accn 0000950170-25-100235) 12mo $64,551M − FY25 Q3 10-Q (filed 2025-04-30) 9mo YTD $47,472M = $17,079M
  //   AMZN: 10-Q filed 2025-08-01 (accn 0001018724-25-000086), 3mo col = $32,183M
  //   GOOGL: Derivation: 10-Q filed 2025-07-24 (accn 0001652044-25-000062) 6mo YTD $39,643M − Q1 10-Q (filed 2025-04-25) 3mo $17,197M = $22,446M
  { quarter: 'Q2 2025', msftCapex: 17.079, amznCapex: 32.183, googlCapex: 22.446 },

  // Q3 2025:
  //   MSFT (FY26 Q1): 10-Q filed 2025-10-29 (accn 0001193125-25-256321), "Additions to property and equipment" 3mo col = $19,394M
  //   AMZN: 10-Q filed 2025-10-31 (accn 0001018724-25-000123), 3mo col = $35,095M
  //   GOOGL: Derivation: 10-Q filed 2025-10-30 (accn 0001652044-25-000091) 9mo YTD $63,596M − 6mo YTD $39,643M = $23,953M
  { quarter: 'Q3 2025', msftCapex: 19.394, amznCapex: 35.095, googlCapex: 23.953 },

  // Q4 2025:
  //   MSFT (FY26 Q2): 10-Q filed 2026-01-28 (accn 0001193125-26-027207), "Additions to property and equipment" 3mo col = $29,876M
  //   AMZN: Derivation: FY25 10-K (filed 2026-02-06, accn 0001018724-26-000004) 12mo $131,819M − Q3 10-Q (filed 2025-10-31) 9mo YTD $92,297M = $39,522M
  //   GOOGL: Derivation: FY25 10-K (filed 2026-02-05, accn 0001652044-26-000018) 12mo $91,447M − Q3 10-Q (filed 2025-10-30) 9mo YTD $63,596M = $27,851M
  { quarter: 'Q4 2025', msftCapex: 29.876, amznCapex: 39.522, googlCapex: 27.851 },
]

export function getCapexForQuarter(quarter: string): CapexPoint | undefined {
  return CAPEX_QUARTERLY.find((row) => row.quarter === quarter)
}
