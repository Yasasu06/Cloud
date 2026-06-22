import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { JourneyProvider } from '@/lib/journeyContext'
import { TooltipProvider } from '@/components/ui/tooltip'

import PostHogProvider from '@/components/PostHogProvider'
import PageTracker from '@/components/PageTracker'
import Breadcrumbs from '@/components/Breadcrumbs'
import BackToDashboard from '@/components/BackToDashboard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AWS vs Azure vs Google Cloud — Segment Revenue Trend',
  description:
    'A multi-quarter look at total cloud segment revenue for AWS, Azure, and Google Cloud — with an explicit crossover projection, sensitivity, and a stated uncertainty band for the analyst-estimated Azure figure.',
  openGraph: {
    title: 'AWS vs Azure vs Google Cloud — Segment Revenue Trend',
    description:
      'A multi-quarter look at total cloud segment revenue for AWS, Azure, and Google Cloud.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AWS vs Azure vs Google Cloud — Segment Revenue Trend',
    description:
      'A multi-quarter look at total cloud segment revenue for AWS, Azure, and Google Cloud.',
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
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.4,
        }} />
        <Navbar />
        <JourneyProvider>
          <TooltipProvider>
          <PostHogProvider>
          <PageTracker />
          <main id="main-content">
            <Breadcrumbs />
            <BackToDashboard />
            <div className="page-enter">{children}</div>
          </main>
          <footer
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              padding: '24px',
              background: '#050508',
              textAlign: 'center',
              color: '#444',
              fontSize: 12,
            }}
          >
            © 2026 Cloud Intelligence.
          </footer>
          </PostHogProvider>
          </TooltipProvider>
        </JourneyProvider>
      </body>
    </html>
  )
}
