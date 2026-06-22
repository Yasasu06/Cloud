import Link from 'next/link'
import { CAPEX_QUARTERLY } from '@/lib/capex'
import { CLOUD_SEGMENT_REVENUE } from '@/lib/data'
import CapexChart, { type CapexRatioPoint } from '@/components/analysis/CapexChart'

function buildCapexRatios(): CapexRatioPoint[] {
  return CAPEX_QUARTERLY.map((c) => {
    const rev = CLOUD_SEGMENT_REVENUE.find((r) => r.quarter === c.quarter)
    if (
      !rev ||
      rev.aws == null ||
      rev.gcp == null ||
      rev.azureLow == null ||
      rev.azureHigh == null ||
      c.msftCapex == null ||
      c.amznCapex == null ||
      c.googlCapex == null
    ) {
      throw new Error(`Capex or revenue missing for ${c.quarter}`)
    }
    const azureMid = (rev.azureLow + rev.azureHigh) / 2
    return {
      quarter: c.quarter,
      msft: (c.msftCapex / azureMid) * 100,
      amzn: (c.amznCapex / rev.aws) * 100,
      googl: (c.googlCapex / rev.gcp) * 100,
    }
  })
}

export default function CapexPage() {
  const capexRatios = buildCapexRatios()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'white' }}>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '120px 24px 60px',
          maxWidth: 960,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(34px, 6vw, 64px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: 20,
          }}
        >
          Capital Expenditure as a Leading Indicator
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 18,
            lineHeight: 1.6,
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          Hyperscalers can&apos;t grow revenue without first building the
          capacity to serve it. Capex is the 12–18 month leading indicator of
          where the market is headed — and the structural reason the Q3 2026
          crossover prediction isn&apos;t just extrapolation.
        </p>
      </section>

      {/* ── THE SIGNAL (HEADLINE FINDING) ─────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.5vw, 34px)',
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            The signal
          </h2>
          <div
            style={{
              padding: 28,
              borderRadius: 16,
              background: 'var(--bg-card)',
              border: '1px solid var(--accent)',
              boxShadow: '0 0 32px var(--accent-glow)',
            }}
          >
            <p
              style={{
                color: '#d4d4dc',
                fontSize: 18,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Microsoft&apos;s capex intensity hit 89.9% of quarterly revenue
              in Q4 2025 — a $29.9B buildout that markets punished with a 10%
              stock drop — but Amazon&apos;s Q4 2025 intensity (111.0%) was
              even higher, indicating both hyperscalers are in a capacity
              arms race where the winner is determined by revenue conversion
              efficiency, not just buildout scale.
            </p>
          </div>
        </div>
      </section>

      {/* ── CHART: CAPEX-TO-REVENUE RATIO ─────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.5vw, 34px)',
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            Capex-to-revenue ratio, 12 quarters
          </h2>
          <CapexChart data={capexRatios} />
          <p
            style={{
              color: '#d4d4dc',
              fontSize: 15,
              lineHeight: 1.7,
              marginTop: 24,
              marginBottom: 0,
            }}
          >
            Capex-to-revenue ratio is capex as a percentage of quarterly
            revenue. A rising ratio indicates the company is building capacity
            faster than current revenue growth — a bet on future demand.
            Microsoft&apos;s ratio jumped from 61.6% in Q3 2025 to 89.9% in
            Q4 2025, the steepest single-quarter acceleration in the 12-quarter
            window. Amazon&apos;s steady climb from 54.0% in Q3 2023 to 111.0%
            in Q4 2025 suggests sustained aggressive buildout. Google&apos;s
            ratio rose from 125.5% in Q1 2024 to 157.4% in Q4 2025 — the
            highest of the three providers throughout the window, though much
            of Alphabet&apos;s capex funds infrastructure beyond Google Cloud,
            so this ratio is not a like-for-like cloud-segment comparison.
          </p>
        </div>
      </section>

      {/* ── LEAD-LAG TABLE ────────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.5vw, 34px)',
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            The lead-lag: capex at time t, revenue at time t+4 quarters
          </h2>
          <div
            style={{
              overflowX: 'auto',
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 14,
                minWidth: 520,
              }}
            >
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    Provider
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '10px 14px',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    Capex Q4 2024
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '10px 14px',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    Revenue Q4 2025
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { provider: 'MSFT', capex: '$15.8B', revenue: '$33.3B' },
                  { provider: 'AMZN', capex: '$27.8B', revenue: '$35.6B' },
                  { provider: 'GOOGL', capex: '$13.2B', revenue: '$17.7B' },
                ].map((row) => (
                  <tr
                    key={row.provider}
                    style={{
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <td style={{ padding: '10px 14px', color: '#d4d4dc' }}>
                      {row.provider}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        textAlign: 'right',
                        color: '#d4d4dc',
                      }}
                    >
                      {row.capex}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        textAlign: 'right',
                        color: '#d4d4dc',
                      }}
                    >
                      {row.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p
            style={{
              color: '#d4d4dc',
              fontSize: 15,
              lineHeight: 1.7,
              marginTop: 24,
              marginBottom: 0,
            }}
          >
            The table shows capex at time t predicting revenue at time t+4
            quarters (one year later). Microsoft converted $15.8B Q4 2024
            capex into $33.3B Q4 2025 revenue — a 2.1× conversion multiple.
            Amazon converted $27.8B into $35.6B — a 1.3× multiple. Google
            converted $13.2B into $17.7B — a 1.3× multiple. Microsoft&apos;s
            higher conversion efficiency means it extracts more revenue per
            dollar of capex, which is why the Q3 2026 crossover projection
            holds even though Amazon&apos;s raw capex spending (and capex
            intensity) is equal to or higher than Microsoft&apos;s. The
            efficiency gap is the structural advantage.
          </p>
        </div>
      </section>

      {/* ── METHODOLOGY ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.5vw, 34px)',
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            Methodology
          </h2>

          {/* Subsection A */}
          <div
            style={{
              padding: 28,
              borderRadius: 16,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              marginBottom: 24,
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'white',
                marginBottom: 16,
              }}
            >
              Comparability: gross vs. net, cash vs. total
            </h3>
            <p
              style={{
                color: '#d4d4dc',
                fontSize: 15,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              All capex figures are sourced from the consolidated cash flow
              statements of each company&apos;s SEC filings (10-K, 10-Q) —
              specifically, the &quot;Additions to property and equipment&quot;
              line for Microsoft, &quot;Purchases of property and
              equipment&quot; for Amazon, and &quot;Purchases of property and
              equipment&quot; for Google. Three comparability decisions were
              made: (1) Amazon reports both a gross figure (main cash flow
              statement) and a net-of-proceeds figure (free cash flow
              reconciliation). We use the gross figure to maintain
              comparability with Microsoft and Google, both of whom report
              gross capex. The difference is approximately $5B/year for
              Amazon. (2) All three companies acquire assets under finance
              leases in addition to cash capex. Finance lease additions are
              disclosed separately in supplemental lease footnotes and are
              not included in the cash flow statement capex lines. For
              Microsoft in FY26 Q2, cash capex was $29.9B while total capex
              including finance leases was $37.5B. We use cash capex only
              because it is consistently disclosed across all three
              companies. This means our figures understate true capacity
              buildout by approximately 20–25%, but the understatement is
              consistent across providers. (3) All figures are
              calendar-quarter normalized. Microsoft&apos;s fiscal year
              starts July 1; Amazon and Google use calendar years. The
              normalization ensures valid cross-provider comparison.
            </p>
          </div>

          {/* Subsection B */}
          <div
            style={{
              padding: 28,
              borderRadius: 16,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'white',
                marginBottom: 16,
              }}
            >
              Sourcing and verification
            </h3>
            <p
              style={{
                color: '#d4d4dc',
                fontSize: 15,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              All 36 data points (12 quarters × 3 companies) are sourced from
              primary SEC EDGAR filings using the XBRL JSON API. Microsoft:
              us-gaap:PaymentsToAcquirePropertyPlantAndEquipment. Amazon:
              us-gaap:PaymentsToAcquireProductiveAssets. Google:
              us-gaap:PaymentsToAcquirePropertyPlantAndEquipment. Each
              quarterly value in lib/capex.ts includes a citation comment
              with the filing date and accession number. Spot-checks were
              performed on five quarters by manually reading the 10-Q/10-K
              filings and verifying the XBRL-sourced values matched the cash
              flow statement line items verbatim. All five matched to the
              nearest million dollars. Where quarterly values are not
              directly reported (fiscal year-end quarters), single-quarter
              figures are derived by subtracting prior-quarter year-to-date
              totals from full-year totals. Derivation math is shown in the
              citation comments.
            </p>
          </div>
        </div>
      </section>

      {/* ── TIE-BACK TO THE FALSIFIABLE THESIS ────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.5vw, 34px)',
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            Why this supports the Q3 2026 crossover prediction
          </h2>
          <p
            style={{
              color: '#d4d4dc',
              fontSize: 16,
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            The Q4 2024 → Q4 2025 lead-lag relationship shows Microsoft
            achieving a 2.1× capex-to-revenue conversion multiple (spend
            $15.8B, generate $33.3B revenue one year later) while Amazon
            achieved 1.3× ($27.8B capex → $35.6B revenue). If Microsoft
            sustains this efficiency advantage, the Q3 2026 crossover holds
            even with both companies building at near-100% capex intensity.
            The mechanistic argument: Amazon can outspend Microsoft in
            absolute dollars and still lose market position if Microsoft
            converts each dollar of capex into more revenue. The January 29,
            2026 market reaction — a 10% single-day drop in Microsoft&apos;s
            stock price following the FY26 Q2 earnings print — validates
            that markets price in the capex-to-revenue lead-lag relationship.
            Investors punished the $29.9B capex print in the short term, but
            if the 2.1× conversion multiple holds, that capex becomes $62B+
            of annualized revenue capacity by late 2026, directly supporting
            the crossover projection. The falsifiable signal embedded in
            this analysis: if Microsoft&apos;s capex-to-revenue conversion
            multiple drops below 1.8× in any two consecutive quarters
            between now and Q2 2026, the efficiency advantage erodes and the
            crossover timeline extends. This is a testable, observable
            threshold — and it adds a second falsification gate beyond the
            Azure QoQ growth deceleration threshold stated on the main
            analysis page.
          </p>
        </div>
      </section>

      {/* ── BACK LINK ─────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '40px 24px 80px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <Link
            href="/"
            style={{
              color: 'var(--accent-hover)',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            ← Back to main analysis
          </Link>
        </div>
      </section>
    </div>
  )
}
