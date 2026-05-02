export default function PrivacyPage() {
  const sections = [
    {
      title: '1. What We Collect',
      items: [
        { label: 'Account data', detail: 'Email address and password (hashed) when you create an account.' },
        { label: 'Cloud spend inputs', detail: 'Text descriptions of your cloud situation, uploaded bill files, and any credentials you connect. Used only to generate your analysis.' },
        { label: 'Saved analyses', detail: 'AI-generated analyses and recommendations you choose to save to your dashboard.' },
        { label: 'Usage data', detail: 'Pages visited, features used, and session timestamps — used to improve the product. Never tied to your cloud data.' },
        { label: 'Billing data', detail: 'Payment method and transaction history if you subscribe — processed by Stripe, not stored on our servers.' },
      ],
    },
    {
      title: '2. What We Never Do',
      items: [
        { label: 'Never sell your data', detail: 'We do not sell, rent, or trade your personal data or cloud spend data to any third party, ever.' },
        { label: 'Never share with cloud providers', detail: 'Your data is never shared with AWS, Azure, Google Cloud, or any cloud vendor. We are vendor neutral and have no referral agreements.' },
        { label: 'Never use your data to train models', detail: 'Your cloud descriptions and bill data are not used to train or fine-tune any AI model.' },
        { label: 'Never share with advertisers', detail: 'We do not run targeted advertising and do not share data with ad networks.' },
      ],
    },
    {
      title: '3. How We Use Your Data',
      body: [
        'We use your data exclusively to provide the service: generating your cloud analysis, saving your recommendations, and sending you requested digests or alerts.',
        'Anonymised, aggregated statistics (e.g. "32% of users overspend on EC2") may be used in our public-facing content. This data cannot be traced back to any individual user.',
      ],
    },
    {
      title: '4. Data Storage & Security',
      items: [
        { label: 'Encrypted at rest', detail: 'All data — including uploaded bills, credentials, and analyses — is encrypted at rest using AES-256.' },
        { label: 'Encrypted in transit', detail: 'All data transmitted between your browser and our servers uses TLS 1.3.' },
        { label: 'Credential handling', detail: 'Cloud access keys are encoded before storage and only decrypted in-memory during analysis. We recommend using read-only IAM roles.' },
        { label: 'Infrastructure', detail: 'Hosted on Supabase (Postgres) with row-level security policies. Your data is isolated from other users at the database level.' },
      ],
    },
    {
      title: '5. Your Rights',
      items: [
        { label: 'Access', detail: 'Request a copy of all data we hold about you at any time.' },
        { label: 'Deletion', detail: 'Delete your account and all associated data from your dashboard. Deletion is permanent and processed within 30 days.' },
        { label: 'Correction', detail: 'Update your email, preferences, or any saved data at any time.' },
        { label: 'Portability', detail: 'Export your saved analyses as JSON or PDF from your dashboard.' },
        { label: 'Opt-out', detail: 'Unsubscribe from emails at any time using the link in any email, or from your account settings.' },
      ],
    },
    {
      title: '6. GDPR Compliance',
      body: [
        'If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR). Our lawful basis for processing your data is contract performance (to provide the service you signed up for) and legitimate interests (product improvement using anonymised analytics).',
        'You may lodge a complaint with your local supervisory authority if you believe your data has been processed unlawfully. To exercise any GDPR right, email privacy@cloudintelligence.ai.',
      ],
    },
    {
      title: '7. Data Retention',
      body: [
        'We retain your account data for as long as your account is active. If you delete your account, all personal data is permanently deleted within 30 days, except where retention is required by law (e.g. payment records, which Stripe retains per financial regulations).',
        'Uploaded bill files are automatically deleted after 90 days unless you save the associated analysis.',
      ],
    },
    {
      title: '8. Cookies',
      body: [
        'We use only functional cookies necessary for authentication and session management. We do not use tracking cookies, advertising cookies, or third-party analytics cookies.',
        'You can disable cookies in your browser settings, but this will prevent login from working.',
      ],
    },
    {
      title: '9. Changes to This Policy',
      body: [
        'We will notify you by email at least 14 days before any material change to this policy takes effect. The current version is always available at this URL, with a last-updated date at the top.',
      ],
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20, padding: '6px 16px',
            fontSize: 12, color: '#818cf8', fontWeight: 700,
            marginBottom: 16, letterSpacing: 1,
          }}>
            LEGAL
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, marginBottom: 12 }}>
            Privacy Policy
          </h1>
          <p style={{ color: '#555', fontSize: 14 }}>
            Last updated: May 1, 2026 · GDPR compliant
          </p>
        </div>

        <div style={{
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 48,
        }}>
          <p style={{ fontSize: 14, color: '#86efac', margin: 0, lineHeight: 1.6 }}>
            <strong>Plain English summary:</strong> We collect only what we need to run the service.
            We never sell your data. We never share it with cloud providers.
            You can delete everything at any time. Your billing data is encrypted and read-only.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {sections.map(section => (
            <div key={section.title}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {section.title}
              </h2>
              {'items' in section && section.items ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {section.items.map(item => (
                    <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', minWidth: 160, flexShrink: 0, paddingTop: 2 }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.65 }}>
                        {item.detail}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {section.body?.map((para, i) => (
                    <p key={i} style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.75, margin: 0 }}>
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: '#6366f1', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
            Terms of Service →
          </a>
          <a href="mailto:privacy@cloudintelligence.ai" style={{ color: '#555', fontSize: 14, textDecoration: 'none' }}>
            Questions? privacy@cloudintelligence.ai
          </a>
        </div>
      </div>
    </div>
  )
}
