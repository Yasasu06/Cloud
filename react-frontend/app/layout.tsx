import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import LiveTicker from '@/components/LiveTicker'
import { JourneyProvider } from '@/lib/journeyContext'

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <LiveTicker />
        <JourneyProvider>
          <main>{children}</main>
        </JourneyProvider>
      </body>
    </html>
  )
}
