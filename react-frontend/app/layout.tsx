import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { JourneyProvider } from '@/lib/journeyContext'

export const metadata: Metadata = {
  title: 'Cloud Intelligence Platform',
  description: 'The definitive platform for AWS, Azure, and Google Cloud analysis, cost modeling, and strategic recommendations.',
  keywords: ['AWS', 'Azure', 'Google Cloud', 'cloud computing', 'cloud comparison', 'TCO calculator'],
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
        <JourneyProvider>
          <main>{children}</main>
        </JourneyProvider>
      </body>
    </html>
  )
}
