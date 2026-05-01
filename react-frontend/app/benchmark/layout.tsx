import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cloud Spend Benchmark — Compare to Industry Averages | Cloud Intelligence',
  description: 'See how your monthly cloud spend compares to companies your size in your industry. Free benchmark tool covering SaaS, Healthcare, Finance, Gaming, and more.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
