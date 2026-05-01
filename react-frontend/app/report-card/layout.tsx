import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cloud Report Card — Grade Your Setup | Cloud Intelligence',
  description: 'Get an A–F grade on your cloud architecture covering cost, security, reliability, and performance. Free cloud health check for AWS, Azure, and GCP.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
