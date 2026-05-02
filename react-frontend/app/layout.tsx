import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import LiveTicker from '@/components/LiveTicker'
import { JourneyProvider } from '@/lib/journeyContext'
import { TooltipProvider } from '@/components/ui/tooltip'

import PostHogProvider from '@/components/PostHogProvider'
import PageTracker from '@/components/PageTracker'
import PersonalHeader from '@/components/PersonalHeader'
import Breadcrumbs from '@/components/Breadcrumbs'
import BackToDashboard from '@/components/BackToDashboard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Cloud Intelligence Platform — AWS vs Azure vs GCP Comparison',
    template: '%s | Cloud Intelligence Platform',
  },
  description:
    'The definitive cloud computing resource. Compare AWS, Azure, and Google Cloud with real financial data, AI-powered recommendations, cost projections, and migration planning tools.',
  keywords: [
    'cloud computing',
    'AWS vs Azure',
    'Google Cloud comparison',
    'cloud cost calculator',
    'cloud migration',
    'cloud advisor',
    'AWS pricing',
    'Azure pricing',
    'GCP pricing',
  ],
  authors: [{ name: 'Yasaswi Dutta' }],
  openGraph: {
    title: 'Cloud Intelligence Platform',
    description:
      'Compare AWS, Azure, and GCP with real data. Get personalized recommendations, cost projections, and migration plans.',
    type: 'website',
    siteName: 'Cloud Intelligence Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cloud Intelligence Platform',
    description: 'The definitive AWS vs Azure vs GCP comparison tool.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={inter.className} style={{ background: '#050508' }}>
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.4,
        }} />
        <Navbar />
        <LiveTicker />
        <JourneyProvider>
          <TooltipProvider>
          <PostHogProvider>
          <PageTracker />
          <PersonalHeader />
          <main>
            <Breadcrumbs />
            <BackToDashboard />
            <div className="page-enter">{children}</div>
          </main>
          <footer style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '60px 24px 0',
            background: '#050508',
          }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 48,
                marginBottom: 48,
              }}>
                {/* Brand */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10, color: 'white' }}>
                    ☁️ Cloud Intelligence
                  </div>
                  <p style={{ color: '#555', fontSize: 13, lineHeight: 1.7 }}>
                    The cloud advisor for teams that need cloud expertise on demand.
                  </p>
                </div>

                {/* Tools */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: 2, color: '#444', marginBottom: 14 }}>TOOLS</div>
                  {[
                    { label: 'AI Analyze', href: '/analyze' },
                    { label: 'Instant Audit', href: '/instant-audit' },
                    { label: 'Cloud Advisor', href: '/advisor' },
                    { label: 'Bill Upload', href: '/bill-upload' },
                    { label: 'Report Card', href: '/report-card' },
                    { label: 'Sanity Check', href: '/sanity-check' },
                    { label: 'What We Replace', href: '/replaces' },
                    { label: 'Glossary', href: '/cloud-glossary' },
                  ].map(l => (
                    <a key={l.href} href={l.href} style={{ display: 'block', color: '#555', fontSize: 13, marginBottom: 8, textDecoration: 'none' }}>
                      {l.label}
                    </a>
                  ))}
                </div>

                {/* Company */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: 2, color: '#444', marginBottom: 14 }}>COMPANY</div>
                  {[
                    { label: 'Pricing', href: '/pricing' },
                    { label: 'What We Replace', href: '/replaces' },
                    { label: 'Experts', href: '/experts' },
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Weekly Digest', href: '/weekly-digest' },
                    { label: 'Changelog', href: '/changelog' },
                    { label: 'White Label', href: '/white-label' },
                    { label: 'Sign In', href: '/auth' },
                    { label: 'Terms of Service', href: '/terms' },
                    { label: 'Privacy Policy', href: '/privacy' },
                  ].map(l => (
                    <a key={l.href} href={l.href} style={{ display: 'block', color: '#555', fontSize: 13, marginBottom: 8, textDecoration: 'none' }}>
                      {l.label}
                    </a>
                  ))}
                </div>

                {/* Data */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: 2, color: '#444', marginBottom: 14 }}>DATA</div>
                  {[
                    'Powered by Llama 3.3 70B',
                    'Data from SEC filings & earnings reports',
                    'Vendor neutral — no sponsorships',
                  ].map(line => (
                    <p key={line} style={{ color: '#555', fontSize: 13, marginBottom: 8 }}>{line}</p>
                  ))}
                </div>
              </div>

              {/* Bottom bar */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '20px 0',
                textAlign: 'center',
                color: '#333',
                fontSize: 12,
              }}>
                © 2026 Cloud Intelligence. Built for founders, not enterprises.
              </div>
            </div>
          </footer>
          </PostHogProvider>
          </TooltipProvider>
        </JourneyProvider>
      </body>
    </html>
  )
}
