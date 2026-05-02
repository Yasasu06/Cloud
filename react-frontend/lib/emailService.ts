// Add RESEND_API_KEY to Vercel: Project Settings → Environment Variables → RESEND_API_KEY

const BASE_URL = 'https://cloud-psx9.vercel.app'

export async function sendWasteReport(
  toEmail: string,
  userName: string,
  wasteAmount: number,
  topWasteItems: string[]
) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Cloud Intelligence <alerts@cloudintelligence.app>',
      to: toEmail,
      subject: `Your Weekly Cloud Waste Report — $${wasteAmount.toLocaleString()} identified`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#6366f1;padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:24px">☁️ Cloud Intelligence</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Weekly Waste Report</p>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px">
            <h2 style="color:#1a1a2e">Hi ${userName || 'there'},</h2>
            <p>We identified <strong style="color:#ef4444">$${wasteAmount.toLocaleString()}/month</strong> in potential cloud savings.</p>
            <h3>Top waste items this week:</h3>
            <ul>
              ${topWasteItems.map(item => `<li style="margin-bottom:8px">${item}</li>`).join('')}
            </ul>
            <a href="${BASE_URL}/waste-report"
              style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
              View Full Report →
            </a>
            <p style="color:#999;font-size:12px;margin-top:24px">Cloud Intelligence · Unsubscribe</p>
          </div>
        </div>
      `,
    }),
  })
  return res.json()
}

export async function sendWelcomeEmail(toEmail: string) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Cloud Intelligence <hello@cloudintelligence.app>',
      to: toEmail,
      subject: 'Welcome to Cloud Intelligence 🎉',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#6366f1;padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0">Welcome aboard! ☁️</h1>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px">
            <p>You now have access to 42+ cloud intelligence tools.</p>
            <h3>Start here:</h3>
            <ul>
              <li><a href="${BASE_URL}/analyze">AI Analyze — explain your cloud situation</a></li>
              <li><a href="${BASE_URL}/savings">Savings Calculator — find your savings</a></li>
              <li><a href="${BASE_URL}/report-card">Report Card — grade your setup</a></li>
            </ul>
            <a href="${BASE_URL}/dashboard"
              style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
              Go to Dashboard →
            </a>
          </div>
        </div>
      `,
    }),
  })
}
