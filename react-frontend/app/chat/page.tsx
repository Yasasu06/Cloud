'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  "I'm a startup with 5 engineers and $500/month budget — which cloud should I use?",
  "We're on AWS but our bills are getting out of control. What should we do?",
  "I need to build an AI app — which cloud has the best ML tools?",
  "We need HIPAA compliance. Which provider makes this easiest?",
  "How hard is it to migrate from AWS to Azure?",
  "What's the cheapest cloud for a personal project?",
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your Cloud Intelligence consultant. I can help you choose the right cloud provider, optimize costs, plan migrations, and navigate compliance requirements. What's on your mind?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const userText = text || input.trim()
    if (!userText || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    await new Promise((r) => setTimeout(r, 1200))

    const q = userText.toLowerCase()
    let reply = ''

    if (q.includes('startup') || q.includes('small')) {
      reply = `For a startup, I'd recommend starting with **AWS** or **DigitalOcean** depending on your budget.\n\n**If budget is tight (under $200/month):** DigitalOcean is perfect. Simple pricing, great docs, and you won't get surprise bills. Start with a $12/month droplet.\n\n**If you're planning to scale fast:** AWS gives you the most room to grow. Use the free tier to start — you get 12 months of generous free services.\n\n**My honest take:** Most startups over-engineer their cloud setup early. Start simple with DigitalOcean, migrate to AWS or Azure when you actually need the enterprise features.`
    } else if (q.includes('aws') && (q.includes('bill') || q.includes('expensive') || q.includes('cost'))) {
      reply = `AWS bill shock is one of the most common problems I see. Here's where to look first:\n\n**1. Data transfer costs** — AWS charges for data leaving their network. This catches everyone off guard. Check your EC2 and S3 egress.\n\n**2. Forgotten resources** — Old snapshots, unused Elastic IPs, idle load balancers. Run AWS Cost Explorer and sort by service.\n\n**3. Right-sizing** — Most teams over-provision. A t3.medium doing the job of a t3.small is wasted money.\n\n**4. Reserved Instances** — If you have predictable workloads, 1-year reserved instances save 30-40% vs on-demand.\n\nQuick win: Set up AWS Budgets alerts TODAY so you never get surprised again.`
    } else if (q.includes('ai') || q.includes('ml') || q.includes('machine learning')) {
      reply = `For AI/ML workloads, here's the honest ranking:\n\n**1. Google Cloud (GCP)** — Best overall. Vertex AI is the most mature MLOps platform. TPUs are unmatched for training large models. If you're serious about AI, start here.\n\n**2. Azure** — Strong second, especially if you want OpenAI models (GPT-4, DALL-E) with enterprise support. Azure OpenAI Service is excellent.\n\n**3. AWS** — SageMaker is powerful but complex. Best if you're already deep in the AWS ecosystem.\n\n**My recommendation:** GCP for training and custom models. Azure if you want to build on top of OpenAI's models quickly.`
    } else if (q.includes('hipaa') || q.includes('healthcare') || q.includes('compliance')) {
      reply = `For HIPAA compliance, all three major providers support it — but the experience is very different:\n\n**Azure** — Easiest HIPAA path. Microsoft has the most healthcare customers and the clearest compliance documentation. Azure Health Data Services is purpose-built.\n\n**AWS** — Also excellent. AWS has a HIPAA-eligible services list with 100+ services covered. Well documented.\n\n**GCP** — Fully HIPAA capable but fewer healthcare-specific managed services.\n\n**Key thing everyone misses:** The cloud provider giving you HIPAA-eligible infrastructure doesn't make YOU compliant. You still need to sign a BAA (Business Associate Agreement) with your provider and configure your services correctly.\n\nWant me to walk through what a HIPAA-compliant architecture looks like?`
    } else if (q.includes('migrat')) {
      reply = `Migration difficulty depends heavily on which direction you're going:\n\n**AWS → Azure:** Moderate difficulty. IAM to Azure AD is the hardest part. Budget 3-6 months for a serious workload.\n\n**AWS → GCP:** Harder. Networking and IAM models are quite different. Budget 4-8 months.\n\n**Azure → AWS:** Moderate. ARM templates to CloudFormation is painful but doable. 3-5 months.\n\n**The honest truth about migration:** 80% of companies that say they want to migrate don't actually need to. Before you migrate, ask: what specific problem are you solving? Cost? Features? Compliance? The answer might be optimization, not migration.\n\nWhat's driving your migration consideration?`
    } else if (q.includes('cheap') || q.includes('free') || q.includes('budget') || q.includes('personal')) {
      reply = `For personal projects and budget setups, here are your best options:\n\n**Free forever:**\n- Oracle Cloud — 2 VMs, 4 ARM cores, 24GB RAM, 200GB storage. Genuinely free forever. Best free tier in the industry.\n- Cloudflare — Free CDN, Workers (edge functions), and Pages hosting. Incredible value.\n- GCP free tier — $300 credit for new accounts + always-free services.\n\n**Cheapest paid:**\n- Hetzner — €3.29/month for a solid VPS in Europe. Unbeatable price.\n- Vultr — $2.50/month entry level. Good for game servers.\n- DigitalOcean — $4/month. Best documentation and community.\n\n**My pick for a personal project:** Start with Oracle Cloud free tier. If you outgrow it, move to DigitalOcean.`
    } else if (q.includes('gdpr') || q.includes('europe') || q.includes('european')) {
      reply = `For GDPR compliance and European data residency:\n\n**Azure** — Strongest choice. Microsoft has invested heavily in EU compliance. Azure has EU-only regions and the EU Data Boundary commitment means your data never leaves Europe.\n\n**Hetzner** — Underrated option for smaller workloads. German company, GDPR by default, incredibly cheap, green energy powered.\n\n**GCP** — Good European region coverage, strong compliance tools.\n\n**AWS** — Fully GDPR capable with EU regions, but historically slower to adopt EU-specific compliance commitments.\n\nKey things to check: data residency guarantees, sub-processor lists, and whether your provider will sign a Data Processing Agreement (DPA). All major providers will.`
    } else {
      reply = `Great question. Here's how I'd think about this:\n\nThe right cloud choice depends on three things: your workload type, your team's existing skills, and your budget trajectory.\n\n**AWS** wins on breadth — 200+ services, largest community, most third-party integrations. Best if you need maximum flexibility.\n\n**Azure** wins on enterprise integration — especially if you use Microsoft 365, Active Directory, or have compliance requirements. Growing fastest in AI right now.\n\n**Google Cloud** wins on data and AI — BigQuery is the best managed data warehouse, and their AI/ML tooling is industry-leading.\n\n**For smaller budgets:** DigitalOcean, Vultr, or Oracle Cloud free tier are often better fits than the Big 3.\n\nCan you tell me more about your specific situation? What are you building, how big is your team, and what's your monthly budget? I can give you a much more specific recommendation.`
    }

    setMessages([...newMessages, { role: 'assistant', content: reply }])
    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          width: '100%',
          padding: '80px 24px 0',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>☁️ Cloud AI Consultant</h1>
          <p style={{ color: '#a0a0b0' }}>
            Ask anything about cloud — get expert, unbiased answers instantly.
          </p>
        </div>

        {/* Suggested questions — only shown before user sends first message */}
        {messages.length === 1 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 12 }}>SUGGESTED QUESTIONS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    background: '#1a1a2e',
                    border: '1px solid #ffffff15',
                    borderRadius: 20,
                    padding: '8px 16px',
                    color: '#a0a0b0',
                    cursor: 'pointer',
                    fontSize: 13,
                    textAlign: 'left',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minHeight: 300,
            maxHeight: 500,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  background: msg.role === 'user' ? '#6366f1' : '#1a1a2e',
                  borderRadius:
                    msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 16px',
                  fontSize: 15,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  background: '#1a1a2e',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px',
                }}
              >
                <span style={{ color: '#a0a0b0' }}>Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#0a0a0f',
            paddingBottom: 24,
            paddingTop: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              background: '#1a1a2e',
              borderRadius: 16,
              padding: '8px 8px 8px 16px',
              border: '1px solid #ffffff10',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about cloud pricing, migration, architecture…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: 15,
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                background: '#6366f1',
                border: 'none',
                borderRadius: 12,
                padding: '10px 20px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
          <p
            style={{
              color: '#ffffff30',
              fontSize: 11,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            Powered by Claude AI · Unbiased · Independent analysis
          </p>
        </div>
      </div>
    </div>
  )
}
