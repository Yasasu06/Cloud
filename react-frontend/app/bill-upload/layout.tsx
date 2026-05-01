import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cloud Bill Analyzer — Upload & Understand Your Bill | Cloud Intelligence',
  description: 'Upload your AWS, Azure, or GCP bill and get a plain-English breakdown of every charge. Identify hidden fees, waste, and exactly where your money is going.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
