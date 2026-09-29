import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { JourneyProvider } from '@/lib/journeyContext'
import { TooltipProvider } from '@/components/ui/tooltip'

import PostHogProvider from '@/components/PostHogProvider'
import PageTracker from '@/components/PageTracker'
import Breadcrumbs from '@/components/Breadcrumbs'
import BackToDashboard from '@/components/BackToDashboard'

export const metadata: Metadata = {
  title: 'Cloud Intelligence — Cloud Cost Exploration Demo',
  description:
    'Explore compatible cloud billing CSVs, service-level costs, selected compute prices, and estimated optimization opportunities.',
  openGraph: {
    title: 'Cloud Intelligence — Cloud Cost Exploration Demo',
    description:
      'Explore cloud billing CSVs and selected compute prices.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cloud Intelligence — Cloud Cost Exploration Demo',
    description:
      'Explore cloud billing CSVs and selected compute prices.',
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
      <body style={{ background: '#050508', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
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
