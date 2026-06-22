'use client'

import { useState, useMemo } from 'react'
import ToolShell from '@/components/ToolShell'

const INDUSTRIES = ['Healthcare', 'Finance', 'Government', 'Education', 'SaaS', 'Other'] as const
const PROVIDERS = ['AWS', 'Azure', 'GCP'] as const

type Industry = typeof INDUSTRIES[number]
type Provider = typeof PROVIDERS[number]

interface ComplianceInfo {
  frameworks: string[]
  requirements: string[]
  services: string[]
  extraCost: string
  severity: 'critical' | 'high' | 'medium'
  summary: string
}

const DATA: Partial<Record<`${Industry}|${Provider}`, ComplianceInfo>> = {
  'Healthcare|AWS': {
    frameworks: ['HIPAA', 'HITECH'],
    severity: 'critical',
    summary: 'AWS offers HIPAA-eligible services but requires a signed Business Associate Agreement (BAA) before storing PHI.',
    requirements: [
      'Sign AWS HIPAA Business Associate Agreement (BAA)',
      'Encrypt all PHI at rest using AES-256 (KMS)',
      'Encrypt all PHI in transit using TLS 1.2+',
      'Enable CloudTrail audit logging on all regions',
      'Enforce IAM MFA for all users with PHI access',
      'Enable Amazon Macie for PHI discovery',
      'Configure VPC with private subnets for PHI workloads',
    ],
    services: ['AWS KMS', 'CloudTrail', 'AWS Config', 'GuardDuty', 'Amazon Macie', 'AWS Security Hub'],
    extraCost: '$200–400/month',
  },
  'Finance|AWS': {
    frameworks: ['PCI DSS Level 1', 'SOX', 'GLBA'],
    severity: 'critical',
    summary: 'Financial workloads on AWS require PCI DSS scoping, data residency controls, and annual third-party penetration testing.',
    requirements: [
      'Scope and segment cardholder data environment (CDE)',
      'Enable PCI DSS-compliant logging via CloudTrail + Config',
      'Implement SOX change-management controls via AWS Config',
      'Enforce data residency with AWS Organizations SCPs',
      'Schedule annual third-party penetration testing',
      'Enable AWS Shield Advanced for DDoS protection',
      'Deploy WAF rules for OWASP Top 10',
    ],
    services: ['AWS Shield Advanced', 'AWS WAF', 'AWS Config', 'Security Hub', 'CloudTrail', 'AWS Organizations'],
    extraCost: '$400–800/month',
  },
  'Healthcare|Azure': {
    frameworks: ['HIPAA', 'HITECH', 'ISO 27001'],
    severity: 'critical',
    summary: 'Azure includes a HIPAA BAA automatically in the Online Services Terms. Microsoft Defender and Azure Policy are your primary enforcement tools.',
    requirements: [
      'Confirm HIPAA BAA coverage via Azure Online Services Terms',
      'Apply Azure Policy for healthcare compliance initiative',
      'Enable Microsoft Defender for Cloud (all plans)',
      'Store PHI encryption keys in Azure Key Vault',
      'Enable Diagnostic Settings and Azure Monitor for audit logs',
      'Restrict PHI regions using Azure Policy deny assignments',
      'Deploy Private Endpoints for all PaaS services handling PHI',
    ],
    services: ['Microsoft Defender for Cloud', 'Azure Key Vault', 'Azure Policy', 'Azure Monitor', 'Microsoft Sentinel'],
    extraCost: '$150–350/month',
  },
  'Finance|Azure': {
    frameworks: ['PCI DSS', 'SOX', 'MiFID II'],
    severity: 'critical',
    summary: 'Azure Financial Services blueprint provides PCI DSS scaffolding. MiFID II requires transaction record retention for 7 years.',
    requirements: [
      'Deploy Azure PCI DSS blueprint for CDE isolation',
      'Enable Azure Immutable Storage for 7-year log retention',
      'Configure Azure DDoS Protection Standard',
      'Enforce Just-In-Time VM access via Defender for Cloud',
      'Enable SOX-aligned change tracking with Azure DevOps audit logs',
      'Deploy Azure Firewall Premium with IDPS signatures',
      'Configure Conditional Access policies for privileged accounts',
    ],
    services: ['Azure DDoS Protection', 'Azure Firewall Premium', 'Microsoft Defender for Cloud', 'Azure Immutable Storage', 'Entra ID'],
    extraCost: '$350–700/month',
  },
  'Government|AWS': {
    frameworks: ['FedRAMP High', 'FISMA', 'NIST 800-53'],
    severity: 'critical',
    summary: 'Government workloads require FedRAMP-authorized services and deployment in AWS GovCloud (US) regions.',
    requirements: [
      'Deploy exclusively in AWS GovCloud (US-East/West) regions',
      'Use only FedRAMP High-authorized AWS services',
      'Implement NIST 800-53 Rev 5 controls via AWS Config rules',
      'Enable continuous monitoring via AWS Security Hub NIST standard',
      'Enforce PIV/CAC authentication via AWS IAM Identity Center',
      'Conduct annual FISMA assessment and POA&M tracking',
      'Encrypt all data with FIPS 140-2 validated modules',
    ],
    services: ['AWS GovCloud', 'AWS Config', 'Security Hub', 'IAM Identity Center', 'CloudTrail', 'AWS KMS (FIPS)'],
    extraCost: '$600–1,200/month',
  },
  'Government|Azure': {
    frameworks: ['FedRAMP High', 'FISMA', 'CMMC 2.0'],
    severity: 'critical',
    summary: 'Azure Government cloud provides FedRAMP High authorization. CMMC 2.0 compliance is required for DoD contractors.',
    requirements: [
      'Deploy in Azure Government (US Gov Virginia/Texas) regions',
      'Use Azure Government FedRAMP High service catalog only',
      'Enable CMMC 2.0 Level 2 controls via Azure Policy initiative',
      'Configure Azure Sentinel for continuous SIEM monitoring',
      'Enforce FIPS 140-2 encryption for all storage and compute',
      'Implement Privileged Identity Management for just-in-time access',
      'Conduct CUI data discovery and classification with Purview',
    ],
    services: ['Azure Government', 'Microsoft Sentinel', 'Azure Purview', 'Privileged Identity Management', 'Azure Policy'],
    extraCost: '$500–1,000/month',
  },
  'SaaS|AWS': {
    frameworks: ['SOC 2 Type II', 'ISO 27001', 'GDPR'],
    severity: 'high',
    summary: 'SaaS products targeting enterprise customers need SOC 2 Type II. GDPR applies if you have EU users.',
    requirements: [
      'Implement SOC 2 Trust Services Criteria via AWS Security Hub',
      'Enable CloudTrail + Config for availability and integrity evidence',
      'Deploy data deletion workflows for GDPR right-to-erasure',
      'Configure AWS Backup with tested restore procedures',
      'Enable GuardDuty and Security Hub for threat detection',
      'Document vendor management process for sub-processors',
      'Implement incident response runbook with <72hr breach notification',
    ],
    services: ['AWS Security Hub', 'GuardDuty', 'AWS Backup', 'CloudTrail', 'AWS Config', 'Amazon Macie'],
    extraCost: '$100–250/month',
  },
  'SaaS|Azure': {
    frameworks: ['SOC 2 Type II', 'ISO 27001', 'GDPR'],
    severity: 'high',
    summary: 'Azure provides ISO 27001 and SOC 2 attestations you can leverage. Microsoft DPA covers GDPR sub-processing automatically.',
    requirements: [
      'Review Microsoft DPA to confirm GDPR sub-processor coverage',
      'Enable Microsoft Defender for Cloud for SOC 2 evidence collection',
      'Configure Azure Backup with geo-redundant restore testing',
      'Implement Azure AD Conditional Access for availability controls',
      'Deploy Entra ID Access Reviews for quarterly user recertification',
      'Enable Azure Monitor alerts for 99.9% SLA commitment tracking',
      'Document data flow map for all personal data in Azure regions',
    ],
    services: ['Microsoft Defender for Cloud', 'Entra ID', 'Azure Monitor', 'Azure Backup', 'Microsoft Purview'],
    extraCost: '$80–200/month',
  },
  'Education|AWS': {
    frameworks: ['FERPA', 'COPPA', 'CIPA'],
    severity: 'medium',
    summary: 'Educational institutions must protect student records under FERPA and restrict content under CIPA for K-12.',
    requirements: [
      'Sign AWS FERPA data processing addendum',
      'Restrict student PII to US regions using SCPs',
      'Enable S3 Object Lock for immutable FERPA record retention',
      'Implement CIPA-compliant content filtering at network edge',
      'Configure IAM roles with least-privilege for student data access',
      'Enable CloudTrail for all student data access events',
    ],
    services: ['AWS Organizations', 'S3 Object Lock', 'AWS Shield', 'CloudTrail', 'AWS WAF'],
    extraCost: '$50–150/month',
  },
  'Education|Azure': {
    frameworks: ['FERPA', 'COPPA'],
    severity: 'medium',
    summary: 'Microsoft 365 Education includes FERPA compliance. Azure for Education provides student data protections by default.',
    requirements: [
      'Enable Azure for Education tenant configuration',
      'Apply Azure Policy for student data regional restriction',
      'Configure Microsoft Purview for student PII classification',
      'Enable audit logging for all student record access',
      'Implement Entra ID conditional access for staff and students',
      'Configure data retention policies aligned to FERPA 5-year minimum',
    ],
    services: ['Azure for Education', 'Microsoft Purview', 'Entra ID', 'Azure Policy', 'Azure Monitor'],
    extraCost: '$40–120/month',
  },
  'SaaS|GCP': {
    frameworks: ['SOC 2 Type II', 'ISO 27001', 'GDPR'],
    severity: 'high',
    summary: 'GCP provides SOC 2 and ISO 27001 attestations. Cloud Data Loss Prevention is your primary GDPR tool.',
    requirements: [
      'Enable Security Command Center for SOC 2 evidence',
      'Configure Cloud DLP to discover and classify personal data',
      'Set up VPC Service Controls around sensitive data perimeters',
      'Enable Cloud Audit Logs for all data access events',
      'Deploy Cloud Armor WAF with OWASP rules',
      'Implement GDPR deletion workflows using Cloud Workflows',
      'Configure Binary Authorization for supply chain integrity',
    ],
    services: ['Security Command Center', 'Cloud DLP', 'VPC Service Controls', 'Cloud Audit Logs', 'Cloud Armor'],
    extraCost: '$90–220/month',
  },
  'Healthcare|GCP': {
    frameworks: ['HIPAA', 'HITECH'],
    severity: 'critical',
    summary: 'GCP offers a HIPAA BAA for eligible services. Cloud Healthcare API is purpose-built for HL7 and FHIR workloads.',
    requirements: [
      'Sign GCP HIPAA Business Associate Agreement',
      'Use Cloud Healthcare API for FHIR/HL7 data exclusively',
      'Enable CMEK with Cloud KMS for all PHI storage',
      'Configure Cloud Audit Logs with Data Access log types enabled',
      'Deploy VPC Service Controls around PHI data perimeter',
      'Enable Security Command Center Premium for threat detection',
      'Restrict PHI to US regions via Organization Policy constraints',
    ],
    services: ['Cloud Healthcare API', 'Cloud KMS', 'Security Command Center', 'VPC Service Controls', 'Cloud Audit Logs'],
    extraCost: '$180–380/month',
  },
}

const SEVERITY_COLOR: Record<ComplianceInfo['severity'], string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#22c55e',
}
const SEVERITY_BG: Record<ComplianceInfo['severity'], string> = {
  critical: 'rgba(239,68,68,0.1)', high: 'rgba(245,158,11,0.1)', medium: 'rgba(34,197,94,0.1)',
}

const selectStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(10,10,22,0.7)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10, padding: '12px 16px', color: 'white', fontSize: 15,
  outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
}

export default function CompliancePage() {
  const [industry, setIndustry] = useState<Industry>('Healthcare')
  const [provider, setProvider] = useState<Provider>('AWS')
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const key = `${industry}|${provider}` as `${Industry}|${Provider}`
  const data = DATA[key] ?? null

  const score = useMemo(() => {
    if (!data) return 20
    return Math.min(100, 60 + checked.size * 10)
  }, [data, checked])

  const scoreColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const scoreLabel = score >= 80 ? 'Good' : score >= 50 ? 'Needs Work' : 'At Risk'

  function toggleReq(i: number) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function handleChange(newIndustry: Industry, newProvider: Provider) {
    setChecked(new Set())
    setIndustry(newIndustry)
    setProvider(newProvider)
  }

  return (
    <ToolShell label="Compliance Checker">
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 88px' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px',
            fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 18, letterSpacing: 1,
          }}>COMPLIANCE CHECKER</div>
          <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 52px)', fontWeight: 900, marginBottom: 14, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Are you <span className="shimmer-text">actually compliant?</span>
          </h1>
          <p style={{ color: '#b4b4c4', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
            Select your industry and cloud provider to see exactly what you need — frameworks, controls, services, and cost.
          </p>
        </div>

        <div className="glass-premium" style={{ padding: '24px', marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>INDUSTRY</label>
              <select value={industry} onChange={e => handleChange(e.target.value as Industry, provider)} style={selectStyle}>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>CLOUD PROVIDER</label>
              <select value={provider} onChange={e => handleChange(industry, e.target.value as Provider)} style={selectStyle}>
                {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {!data && (
          <div className="glass-premium" style={{ padding: '32px 28px' }}>
            <div style={{ fontSize: 30, marginBottom: 12, textAlign: 'center' }}>🛡️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
              No framework-specific data for {industry} on {provider} — but the universal baseline still applies
            </h3>
            <p style={{ color: '#a0a0b0', fontSize: 14, maxWidth: 460, margin: '0 auto 22px', textAlign: 'center' }}>
              Almost every {industry} workload on {provider} should have these foundational controls in place:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560, margin: '0 auto' }}>
              {[
                'Encrypt data at rest (AES-256) and in transit (TLS 1.2+)',
                'Enforce multi-factor authentication on every privileged account',
                'Turn on full audit logging (CloudTrail / Azure Monitor / Cloud Audit Logs)',
                'Apply least-privilege IAM roles — no standing admin access',
                'Automate encrypted backups and test your restores',
                'Restrict data to the regions you actually operate in',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ flexShrink: 0, marginTop: 1, width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>✓</span>
                  <span style={{ fontSize: 14, color: '#d0d0e0', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }}>
              <div className="glass-premium" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>COMPLIANCE SCORE</p>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: `conic-gradient(${scoreColor} ${score * 3.6}deg, #1a1a2e 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</span>
                    <span style={{ fontSize: 9, color: '#555', fontWeight: 700 }}>/ 100</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor, background: `rgba(${scoreColor === '#22c55e' ? '34,197,94' : scoreColor === '#f59e0b' ? '245,158,11' : '239,68,68'},0.1)`, padding: '4px 10px', borderRadius: 8 }}>
                  {scoreLabel}
                </span>
              </div>

              <div className="glass-premium" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: SEVERITY_COLOR[data.severity], background: SEVERITY_BG[data.severity], padding: '3px 10px', borderRadius: 6, letterSpacing: 0.5 }}>
                    {data.severity.toUpperCase()} RISK
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {data.frameworks.map(f => (
                    <span key={f} style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8 }}>{f}</span>
                  ))}
                </div>
                <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{data.summary}</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                  <p style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>ESTIMATED COMPLIANCE OVERHEAD</p>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>{data.extraCost}</span>
                  <span style={{ color: '#555', fontSize: 12, marginLeft: 6 }}>additional/month</span>
                </div>
              </div>
            </div>

            <div className="glass-premium" style={{ padding: '28px', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Requirements Checklist</h2>
              <p style={{ color: '#555', fontSize: 13, marginBottom: 20 }}>Check off requirements you have implemented. Each confirmed control raises your score by 10 points.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.requirements.map((req, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 12, border: `1px solid ${checked.has(i) ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`, background: checked.has(i) ? 'rgba(34,197,94,0.04)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <input type="checkbox" checked={checked.has(i)} onChange={() => toggleReq(i)} style={{ marginTop: 2, accentColor: '#22c55e', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }} />
                    <span style={{ fontSize: 14, color: checked.has(i) ? '#a0a0b0' : '#e0e0e0', textDecoration: checked.has(i) ? 'line-through' : 'none', lineHeight: 1.5 }}>{req}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="glass-premium" style={{ padding: '24px 28px', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Key Services to Enable</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.services.map(s => (
                  <span key={s} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e0e0e0', fontSize: 13, padding: '6px 14px', borderRadius: 8 }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.08))', borderRadius: 16, padding: '24px 28px', border: '1px solid rgba(99,102,241,0.3)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 12, color: '#a5b4fc', marginBottom: 6, letterSpacing: 1, fontWeight: 700 }}>✅ YOUR COMPLIANCE BASELINE</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{data.frameworks.join(' · ')} for {industry} on {provider}</h3>
              <p style={{ color: '#a0a0b0', fontSize: 13, lineHeight: 1.6 }}>
                Work through the {data.requirements.length} controls above and enable the listed services. Re-run this for each provider you use — requirements differ across AWS, Azure, and GCP. Budget about <strong style={{ color: '#f59e0b' }}>{data.extraCost}/month</strong> for the extra tooling.
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  )
}
