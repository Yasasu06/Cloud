import AiGrowthChart from '@/components/AiGrowthChart'

// SCAFFOLD ONLY.
// Every figure on this page is a TODO placeholder. Do not fill in any number
// without a hand-verified source. Do not use an LLM/AI tool to estimate.
//
// What still needs to be supplied by hand:
//   - The quarterly time series in lib/data.ts (CLOUD_SEGMENT_REVENUE).
//   - The assumed quarter-over-quarter growth rates for AWS / Azure / GCP
//     used in the crossover projection.
//   - The projected crossover quarter (if any) for Azure vs AWS revenue.
//   - The two sensitivity outcomes (Azure growth − 5pp, − 10pp).
//   - The Azure high/low band reflecting the 2025 re-scoping.

const TODO = '[TODO]'

export const metadata = {
  title: 'AWS vs Azure vs Google Cloud — Segment Revenue Trend',
  description:
    'An honest multi-quarter look at cloud segment revenue for AWS, Azure, and Google Cloud, with an explicit crossover projection, sensitivity, and uncertainty band.',
}

export default function HomePage() {
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
                  AWS QoQ growth assumption: <strong>{TODO}%</strong>
                </li>
                <li>
                  Azure QoQ growth assumption: <strong>{TODO}%</strong>{' '}
                  (analyst-estimated baseline; see uncertainty section)
                </li>
                <li>
                  Google Cloud QoQ growth assumption:{' '}
                  <strong>{TODO}%</strong>
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
                    {['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027'].map(
                      (q) => (
                        <tr
                          key={q}
                          style={{
                            borderTop: '1px solid rgba(255,255,255,0.04)',
                          }}
                        >
                          <td style={{ padding: '10px 14px', color: '#d4d4dc' }}>{q}</td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'right',
                              color: '#d4d4dc',
                            }}
                          >
                            {TODO}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'right',
                              color: '#d4d4dc',
                            }}
                          >
                            {TODO}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'right',
                              color: '#a0a0b0',
                            }}
                          >
                            {TODO}
                          </td>
                        </tr>
                      ),
                    )}
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
              <strong>Projected crossover quarter:</strong> {TODO}. Under the
              baseline assumptions above, the Azure–AWS revenue gap is
              projected to close in this quarter. If the assumed growth
              spread does not hold, no crossover occurs in the projection
              window.
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
                Baseline crossover quarter: <strong>{TODO}</strong>.
              </li>
              <li>
                If Azure QoQ growth decelerates by <strong>5 points</strong>,
                crossover shifts to <strong>{TODO}</strong>.
              </li>
              <li>
                If Azure QoQ growth decelerates by <strong>10 points</strong>,
                crossover shifts to <strong>{TODO}</strong> (or does not
                occur within the projection window — to be confirmed).
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
                  AZURE — LOW
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
                  ${TODO}B
                </p>
                <p style={{ fontSize: 12, color: '#a0a0b0', marginTop: 4 }}>
                  Stricter scope (pre-re-scoping definition)
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
                  AZURE — HIGH
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
                  ${TODO}B
                </p>
                <p style={{ fontSize: 12, color: '#a0a0b0', marginTop: 4 }}>
                  Current Microsoft scope (AI inference included)
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
                  AZURE — MIDPOINT
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
                  ${TODO}B
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
              <strong>Stop quoting &quot;Azure has passed AWS&quot; as a
              fact.</strong> {TODO} — write the concrete sales-team
              implication here (e.g. how to position the talk track when a
              prospect cites a competitive headline).
            </li>
            <li style={{ marginBottom: 14 }}>
              <strong>Use the band, not the point, in pricing
              conversations.</strong> {TODO} — write the concrete
              implication (e.g. which deal sizes / segments are sensitive to
              the Azure scope assumption).
            </li>
            <li style={{ marginBottom: 14 }}>
              <strong>Re-time the &quot;market leader&quot; pitch around the
              sensitivity case, not the baseline.</strong> {TODO} — write
              the concrete implication (e.g. when the −5pp Azure case
              changes the prospect&apos;s buying calculus).
            </li>
          </ol>
        </div>
      </section>
    </div>
  )
}
