import AiGrowthChart from '@/components/AiGrowthChart'
import { buildProjection } from '@/lib/projections'

function fmtPct(r: number): string {
  return `${(r * 100).toFixed(1)}%`
}
function fmtUSD(n: number): string {
  return `$${n.toFixed(1)}B`
}
function fmtGap(n: number): string {
  const sign = n >= 0 ? '+' : '−'
  return `${sign}$${Math.abs(n).toFixed(1)}B`
}

export const metadata = {
  title: 'AWS vs Azure vs Google Cloud — Segment Revenue Trend',
  description:
    'An honest multi-quarter look at cloud segment revenue for AWS, Azure, and Google Cloud, with an explicit crossover projection, sensitivity, and uncertainty band.',
}

export default function HomePage() {
  const projection = buildProjection()
  const baselineCrossover = projection.baseline.crossoverQuarter ?? 'no crossover within the projection window'
  const minus5Crossover = projection.minus5pp.crossoverQuarter ?? 'no crossover within the projection window'
  const minus10Crossover = projection.minus10pp.crossoverQuarter ?? 'no crossover within the projection window'

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: 'white' }}>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '120px 24px 60px',
          maxWidth: 960,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: '#818cf8',
            fontSize: 12,
            letterSpacing: 2,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          CLOUD SEGMENT REVENUE — Q1 2023 → Q4 2025
        </p>
        <h1
          style={{
            fontSize: 'clamp(34px, 6vw, 64px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: 20,
          }}
        >
          AWS vs Azure vs Google Cloud
        </h1>
        <p
          style={{
            color: '#a0a0b0',
            fontSize: 18,
            lineHeight: 1.6,
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          A multi-quarter look at total cloud segment revenue — with an
          explicit crossover projection, a sensitivity range, and a plain
          statement of what the Azure number actually is (and isn&apos;t).
        </p>
      </section>

      {/* ── TREND CHART ───────────────────────────────────────────────── */}
      <AiGrowthChart />

      {/* ── ANALYSIS ──────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <p
            style={{
              color: '#818cf8',
              fontSize: 12,
              letterSpacing: 2,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            ANALYSIS
          </p>
          <h2
            style={{
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            Does Azure overtake AWS — and when?
          </h2>

          {/* Crossover projection */}
          <div
            style={{
              padding: 28,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
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
              1. Crossover projection
            </h3>

            <div style={{ marginBottom: 16 }}>
              <p
                style={{
                  fontSize: 13,
                  color: '#a0a0b0',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Assumed quarter-over-quarter growth rates (forward projection)
              </p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  color: '#d4d4dc',
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                <li>
                  AWS QoQ growth assumption:{' '}
                  <strong>{fmtPct(projection.awsQoq)}</strong>{' '}
                  (compound rate over Q1 2023 → Q4 2025)
                </li>
                <li>
                  Azure QoQ growth assumption:{' '}
                  <strong>{fmtPct(projection.azureQoq)}</strong>{' '}
                  (band-midpoint compound rate; see uncertainty section)
                </li>
                <li>
                  Google Cloud QoQ growth assumption:{' '}
                  <strong>{fmtPct(projection.gcpQoq)}</strong>{' '}
                  (compound rate over the same window)
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p
                style={{
                  fontSize: 13,
                  color: '#a0a0b0',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Projected quarter-by-quarter (USD billions)
              </p>
              <div
                style={{
                  overflowX: 'auto',
                  border: '1px solid rgba(255,255,255,0.06)',
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
                          color: '#a0a0b0',
                          fontWeight: 600,
                        }}
                      >
                        Quarter
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '10px 14px',
                          color: '#FF9900',
                          fontWeight: 600,
                        }}
                      >
                        AWS
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '10px 14px',
                          color: '#0078D4',
                          fontWeight: 600,
                        }}
                      >
                        Azure (est.)
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '10px 14px',
                          color: '#a0a0b0',
                          fontWeight: 600,
                        }}
                      >
                        Gap (Azure − AWS)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projection.baseline.rows.map((row) => {
                      const isCrossover = row.quarter === projection.baseline.crossoverQuarter
                      return (
                        <tr
                          key={row.quarter}
                          style={{
                            borderTop: '1px solid rgba(255,255,255,0.04)',
                            background: isCrossover ? 'rgba(99,102,241,0.08)' : undefined,
                          }}
                        >
                          <td style={{ padding: '10px 14px', color: '#d4d4dc' }}>
                            {row.quarter}
                            {isCrossover && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  fontSize: 11,
                                  color: '#818cf8',
                                  letterSpacing: 1,
                                }}
                              >
                                CROSSOVER
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: '#d4d4dc' }}>
                            {fmtUSD(row.aws)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: '#d4d4dc' }}>
                            {fmtUSD(row.azureMid)}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'right',
                              color: row.gap >= 0 ? '#34A853' : '#a0a0b0',
                            }}
                          >
                            {fmtGap(row.gap)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <p
              style={{
                color: '#d4d4dc',
                fontSize: 15,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              <strong>Projected crossover quarter:</strong> {baselineCrossover}.
              Under the baseline compound-growth assumptions above (and using
              the Azure band midpoint), this is the first projected quarter in
              which Azure revenue exceeds AWS revenue. If the assumed Azure
              growth spread does not hold, no crossover occurs in the
              projection window — see the sensitivity section below.
            </p>
          </div>

          {/* Sensitivity */}
          <div
            style={{
              padding: 28,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
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
              2. Sensitivity — what if Azure decelerates?
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                color: '#d4d4dc',
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              <li>
                Baseline crossover quarter: <strong>{baselineCrossover}</strong>.
              </li>
              <li>
                If Azure QoQ growth decelerates by <strong>5 points</strong>{' '}
                (from {fmtPct(projection.azureQoq)} to{' '}
                {fmtPct(projection.azureQoq - 0.05)}), crossover shifts to{' '}
                <strong>{minus5Crossover}</strong>.
              </li>
              <li>
                If Azure QoQ growth decelerates by <strong>10 points</strong>{' '}
                (from {fmtPct(projection.azureQoq)} to{' '}
                {fmtPct(projection.azureQoq - 0.1)}), crossover shifts to{' '}
                <strong>{minus10Crossover}</strong>.
              </li>
            </ul>
          </div>

          {/* Uncertainty / Azure re-scoping */}
          <div
            style={{
              padding: 28,
              borderRadius: 16,
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.25)',
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'white',
                marginBottom: 12,
              }}
            >
              3. Uncertainty — the Azure number is not what it looks like
            </h3>
            <p
              style={{
                color: '#d4d4dc',
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              In 2025, Microsoft re-scoped what it counts as &quot;Azure&quot;
              (AI inference workloads were folded into the segment, among
              other shifts). This mechanically inflates the apparent
              Azure trend across that boundary. The line on the chart above
              is not a like-for-like comparison year over year.
            </p>
            <p
              style={{
                color: '#d4d4dc',
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              Because Microsoft does not publish a dollar figure, every Azure
              point is an analyst back-solve from the disclosed growth
              percentage. The honest representation is a band, not a point.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: '#a0a0b0',
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  AZURE Q4 2025 — LOW
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
                  {fmtUSD(projection.azureBandQ4_2025.low)}
                </p>
                <p style={{ fontSize: 12, color: '#a0a0b0', marginTop: 4 }}>
                  Narrower-scope reading of the disclosed band
                </p>
              </div>
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: '#a0a0b0',
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  AZURE Q4 2025 — HIGH
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
                  {fmtUSD(projection.azureBandQ4_2025.high)}
                </p>
                <p style={{ fontSize: 12, color: '#a0a0b0', marginTop: 4 }}>
                  Inclusive reading (AI inference + 2025 re-scoping)
                </p>
              </div>
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: '#a0a0b0',
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  AZURE Q4 2025 — MIDPOINT
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
                  {fmtUSD(projection.azureBandQ4_2025.midpoint)}
                </p>
                <p style={{ fontSize: 12, color: '#a0a0b0', marginTop: 4 }}>
                  Used as the baseline in the projection above
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DATA & METHOD ─────────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          background: '#080810',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <p
            style={{
              color: '#818cf8',
              fontSize: 12,
              letterSpacing: 2,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            DATA &amp; METHOD
          </p>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.5vw, 34px)',
              fontWeight: 800,
              marginBottom: 20,
            }}
          >
            What the numbers actually are
          </h2>
          <ul
            style={{
              color: '#d4d4dc',
              fontSize: 15,
              lineHeight: 1.8,
              paddingLeft: 20,
            }}
          >
            <li>
              <strong>AWS:</strong> Amazon reports an &quot;AWS&quot;
              operating segment in its 10-Q every quarter. The number on the
              chart is that segment&apos;s net sales, in USD.
            </li>
            <li>
              <strong>Google Cloud:</strong> Alphabet reports a &quot;Google
              Cloud&quot; operating segment in its 10-Q every quarter. The
              number on the chart is that segment&apos;s revenue, in USD.
              Note: includes GCP infrastructure plus Google Workspace.
            </li>
            <li>
              <strong>Azure:</strong> Microsoft <em>does not</em> disclose a
              dollar figure for Azure. The company only discloses a year-
              over-year growth percentage on Azure in its earnings
              commentary. Every Azure dollar amount on this page is an
              analyst back-solve from that percentage and is therefore an
              <strong> estimate, not a reported figure</strong>.
            </li>
            <li>
              <strong>2025 re-scoping:</strong> Microsoft changed what counts
              as &quot;Azure&quot; in 2025 (AI inference workloads, among
              other items, are now inside the Azure boundary). This breaks
              clean year-over-year comparison. The trend across the 2025
              boundary should not be read as organic growth alone.
            </li>
          </ul>
        </div>
      </section>

      {/* ── SO WHAT FOR A SALES TEAM ──────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <p
            style={{
              color: '#818cf8',
              fontSize: 12,
              letterSpacing: 2,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            SO WHAT — FOR A SALES TEAM
          </p>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.5vw, 34px)',
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            Three decisions this analysis should change
          </h2>
          <ol
            style={{
              color: '#d4d4dc',
              fontSize: 16,
              lineHeight: 1.8,
              paddingLeft: 22,
            }}
          >
            <li style={{ marginBottom: 14 }}>
              Azure&apos;s projected crossover with AWS in Q3 2026 is real but
              narrow — a $0.4B gap on a $40B base, roughly 1% of quarterly
              revenue. This is not a market reversal; it&apos;s a statistical
              dead heat that becomes a narrative win.
            </li>
            <li style={{ marginBottom: 14 }}>
              Stop selling against AWS on size and start selling on trajectory:
              AWS grew 4.7% QoQ over the last 11 quarters, Azure midpoint grew
              7.5%. The relevant question in a 3-year contract is not who is
              bigger today but whose growth rate compounds in the customer&apos;s
              favor over the term.
            </li>
            <li style={{ marginBottom: 14 }}>
              If Azure&apos;s QoQ growth decelerates by 5 percentage points or
              more in any two consecutive quarters between now and Q2 2026, the
              crossover does not happen in this window — and the thesis breaks.
              Watch the FY26 Q1 and Q2 earnings prints (October 2025, January
              2026) as the falsification gate.
            </li>
          </ol>
        </div>
      </section>

      {/* ── THE FALSIFIABLE THESIS ────────────────────────────────────── */}
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
            The falsifiable thesis
          </h2>
          <p
            style={{
              color: '#d4d4dc',
              fontSize: 16,
              lineHeight: 1.8,
              marginBottom: 32,
            }}
          >
            Most cloud market commentary is unfalsifiable — directional
            claims that can&apos;t be wrong because they can&apos;t be
            tested. This section commits to a dated, specific prediction
            and names the public signals that would invalidate it. The
            thesis is only as strong as its willingness to be specifically
            wrong.
          </p>

          {/* 1. The prediction */}
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
              1. The prediction
            </h3>
            <p
              style={{
                color: '#d4d4dc',
                fontSize: 16,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Azure quarterly revenue (midpoint of the disclosed band) will
              exceed AWS quarterly revenue in Q3 2026, by a margin of
              $0.3B–$0.6B on a base of approximately $41B. The crossover
              persists through Q4 2026 and widens in Q1 2027. This is the
              baseline projection; the conditional clauses below specify
              what must hold for it to be correct.
            </p>
          </div>

          {/* 2. Conditional clauses */}
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
              2. Conditional clauses
            </h3>
            <ul
              style={{
                color: '#d4d4dc',
                fontSize: 16,
                lineHeight: 1.8,
                paddingLeft: 22,
                margin: 0,
              }}
            >
              <li style={{ marginBottom: 14 }}>
                <strong>
                  Azure&apos;s QoQ compound growth rate holds within ±1.5
                  percentage points of 7.5% through Q2 2026.
                </strong>{' '}
                The 7.5% figure is the compounded rate over Q1 2023 → Q4
                2025. A drop to 6.0% or below in any rolling two-quarter
                window invalidates the timing; a rise above 9.0% accelerates
                it by one quarter.
              </li>
              <li style={{ marginBottom: 14 }}>
                <strong>
                  AWS&apos;s QoQ compound growth rate does not exceed 6.0% in
                  any quarter between now and Q3 2026.
                </strong>{' '}
                AWS has compounded at 4.7% over the historical window. A
                re-acceleration to 6%+ — plausibly driven by sustained AI
                workload recapture — defers the crossover by at least two
                quarters.
              </li>
              <li style={{ marginBottom: 14 }}>
                <strong>
                  Microsoft does not narrow the Azure revenue disclosure
                  scope in FY26 reporting.
                </strong>{' '}
                The current band ($30.0B–$36.5B for Q4 2025) reflects
                bundling ambiguity. If Microsoft re-scopes Azure downward
                (excluding bundled AI Copilot revenue, for example), the
                midpoint shifts and the crossover math changes — not because
                Azure shrank, but because the definition did.
              </li>
              <li style={{ marginBottom: 14 }}>
                <strong>
                  No major reclassification by Amazon or Google changes the
                  AWS or GCP segment definition before Q3 2026.
                </strong>{' '}
                Crossover is a comparison across three companies&apos;
                reporting conventions. A reclassification at any of them —
                particularly Amazon&apos;s &quot;AWS&quot; boundary — would
                force a re-baseline.
              </li>
            </ul>
          </div>

          {/* 3. Leading indicators */}
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
              3. Leading indicators
            </h3>
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
                      Indicator
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      Source
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      Threshold for invalidation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      indicator:
                        'Microsoft FY26 Q1 earnings (Oct 2025): reported Azure YoY growth',
                      source: 'Microsoft 8-K, earnings call transcript',
                      threshold:
                        'Below 28% YoY → Azure decelerating; thesis at risk',
                    },
                    {
                      indicator:
                        'Microsoft FY26 Q2 earnings (Jan 2026): two-quarter Azure trend',
                      source: 'Microsoft 8-K, earnings call transcript',
                      threshold:
                        'Two consecutive prints below 28% YoY → crossover defers to 2027',
                    },
                    {
                      indicator:
                        'AWS quarterly QoQ growth (Q4 2025, Q1 2026, Q2 2026)',
                      source: 'Amazon 10-Q',
                      threshold:
                        'Any single quarter above 6.0% QoQ → AWS re-accelerating; thesis defers',
                    },
                    {
                      indicator:
                        'Azure segment disclosure language in any FY26 filing',
                      source: 'Microsoft 10-K, 10-Q, 8-K',
                      threshold:
                        'Any change to Azure scope definition → re-baseline required',
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      <td style={{ padding: '10px 14px', color: '#d4d4dc' }}>
                        {row.indicator}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#d4d4dc' }}>
                        {row.source}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#d4d4dc' }}>
                        {row.threshold}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
