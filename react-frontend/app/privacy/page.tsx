const sections = [
  {
    title: 'Information you provide',
    body: 'If you create an account, Supabase Auth handles your email and password. The app accepts cloud cost descriptions and compatible CSV bill data. Do not include access keys or other secrets in those inputs; direct AWS account connection is not enabled.',
  },
  {
    title: 'Analysis and storage',
    body: 'The app parses supported bill files and calculates service-level totals from supplied rows. Text or summarized bill data may be sent through a server route to Groq to generate explanations and suggestions. If you choose to save an analysis, the app writes it to Supabase for your account. Database access depends on the deployed row-level security policies.',
  },
  {
    title: 'Email and billing',
    body: 'An authenticated account holder may request an estimated savings report by email. Account holders may also opt in to analysis recaps; those emails require an administrator to trigger delivery and have no automatic weekly schedule. The public demo does not offer paid checkout.',
  },
  {
    title: 'Account controls',
    body: 'You can change your digest preference in dashboard settings. Contact the project owner for questions about stored account data or deletion; the public demo does not provide a verified self-service account deletion flow.',
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 80px' }}>
        <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>DATA HANDLING</p>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, marginBottom: 12 }}>Privacy and data handling</h1>
        <p style={{ color: '#a0a0b0', lineHeight: 1.7, marginBottom: 36 }}>
          This overview describes behavior visible in the project code. It does not verify a deployed database configuration or external provider settings.
        </p>
        {sections.map(section => (
          <section key={section.title} style={{ marginBottom: 30 }}>
            <h2 style={{ fontSize: 18, marginBottom: 10 }}>{section.title}</h2>
            <p style={{ color: '#a0a0b0', lineHeight: 1.7 }}>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
