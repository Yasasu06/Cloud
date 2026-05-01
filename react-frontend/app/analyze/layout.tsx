import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Cloud Analyzer | Cloud Intelligence',
  description: 'Get expert cloud cost analysis in plain English. Free AI-powered FinOps consultant for AWS, Azure and GCP. Identify waste and cut your bill in 30 seconds.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
