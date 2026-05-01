import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cloud Advisor — Find Your Best Provider | Cloud Intelligence',
  description: 'Get a personalized cloud provider recommendation for AWS, Azure, GCP, DigitalOcean, or Hetzner based on your workload, team size, and budget.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
