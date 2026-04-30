import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import LiveTicker from '@/components/LiveTicker'
import { JourneyProvider } from '@/lib/journeyContext'
import { TooltipProvider } from '@/components/ui/tooltip'

import PostHogProvider from '@/components/PostHogProvider'

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
      <body className={inter.className}>
        <Navbar />
        <LiveTicker />
        <JourneyProvider>
          <TooltipProvider>
          <PostHogProvider>
          <main><div className="page-transition">{children}</div></main>
          <footer style={{
            borderTop: '1px solid #ffffff08',
            padding: '40px 24px',
            background: '#0a0a0f',
          }}>
            <div style={{
              maxWidth: 900,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 40,
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12, color: 'white' }}>
                  ☁️ Cloud Intelligence
                </div>
                <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                  The definitive vendor-neutral cloud intelligence platform.
                  Built for founders, developers, and IT leaders making
                  cloud decisions.
                </p>
                <p style={{ color: '#666', fontSize: 12 }}>
                  © 2026 Cloud Intelligence Platform. All rights reserved.
                </p>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: 'white' }}>PLATFORM</div>
                {[
                  { label: 'Cloud Advisor', href: '/advisor' },
                  { label: 'Cost Planner', href: '/planner' },
                  { label: 'Deployment Roadmap', href: '/roadmap' },
                  { label: 'Exit Analyzer', href: '/repatriation' },
                  { label: 'Migration Tool', href: '/migration' },
                  { label: 'Multi-Cloud', href: '/multicloud' },
                  { label: 'Alternatives', href: '/others' },
                ].map(l => (
                  <a key={l.href} href={l.href} style={{
                    display: 'block',
                    color: '#a0a0b0',
                    fontSize: 14,
                    marginBottom: 8,
                    textDecoration: 'none',
                  }}>{l.label}</a>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: 'white' }}>RESOURCES</div>
                {[
                  { label: 'Intelligence Feed', href: '/intelligence' },
                  { label: 'Executive Report', href: '/executive' },
                  { label: 'Ask AI', href: '/chat' },
                  { label: 'Start Here', href: '/start' },
                ].map(l => (
                  <a key={l.href} href={l.href} style={{
                    display: 'block',
                    color: '#a0a0b0',
                    fontSize: 14,
                    marginBottom: 8,
                    textDecoration: 'none',
                  }}>{l.label}</a>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: 'white' }}>COMPANY</div>
                {[
                  { label: 'About', href: '#' },
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Contact Us', href: '#' },
                ].map(l => (
                  <a key={l.label} href={l.href} style={{
                    display: 'block',
                    color: '#a0a0b0',
                    fontSize: 14,
                    marginBottom: 8,
                    textDecoration: 'none',
                  }}>{l.label}</a>
                ))}
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
