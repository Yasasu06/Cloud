'use client'

import { useState } from 'react'

interface Expert {
  id: string
  name: string
  title: string
  years: number
  rate: number
  rating: number
  reviews: number
  initials: string
  color: string
  available: boolean
  specialties: string[]
  tags: string[]
  bio: string
}

const EXPERTS: Expert[] = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    title: 'AWS Solutions Architect',
    years: 8,
    rate: 150,
    rating: 4.9,
    reviews: 47,
    initials: 'SC',
    color: '#f59e0b',
    available: true,
    specialties: ['AWS'],
    tags: ['EC2', 'EKS', 'Cost Optimization', 'Well-Architected'],
    bio: 'Former AWS Solutions Architect Pro. Helped 30+ startups cut AWS bills by an average of 42%.',
  },
  {
    id: 'marcus',
    name: 'Marcus Johnson',
    title: 'Azure Cloud Architect',
    years: 10,
    rate: 175,
    rating: 4.8,
    reviews: 63,
    initials: 'MJ',
    color: '#3b82f6',
    available: true,
    specialties: ['Azure'],
    tags: ['Azure DevOps', 'AKS', 'Active Directory', 'Enterprise'],
    bio: 'Microsoft MVP. Specializes in enterprise Azure migrations and hybrid cloud architectures.',
  },
  {
    id: 'priya',
    name: 'Priya Patel',
    title: 'FinOps Specialist',
    years: 6,
    rate: 125,
    rating: 5.0,
    reviews: 31,
    initials: 'PP',
    color: '#22c55e',
    available: true,
    specialties: ['FinOps'],
    tags: ['Reserved Instances', 'Spot Fleets', 'Budget Alerts', 'Chargeback'],
    bio: 'FinOps Certified Practitioner. Average client savings: $18k/month. No wasted spend left behind.',
  },
  {
    id: 'david',
    name: 'David Kim',
    title: 'Multi-Cloud Architect',
    years: 12,
    rate: 200,
    rating: 4.9,
    reviews: 89,
    initials: 'DK',
    color: '#8b5cf6',
    available: false,
    specialties: ['AWS', 'Azure', 'GCP'],
    tags: ['Terraform', 'Multi-Cloud', 'DR', 'Security'],
    bio: 'Built cloud infrastructure for 3 unicorn startups. Expert in provider-agnostic architecture and Terraform.',
  },
  {
    id: 'elena',
    name: 'Elena Rodriguez',
    title: 'Healthcare Cloud Specialist',
    years: 7,
    rate: 160,
    rating: 4.8,
    reviews: 28,
    initials: 'ER',
    color: '#ec4899',
    available: true,
    specialties: ['Healthcare', 'AWS'],
    tags: ['HIPAA', 'HITRUST', 'PHI', 'Healthcare IT'],
    bio: 'Former cloud lead at Epic Systems. Guides healthcare orgs through HIPAA-compliant cloud architectures.',
  },
  {
    id: 'james',
    name: 'James Wright',
    title: 'DevOps & Cloud Engineer',
    years: 9,
    rate: 145,
    rating: 4.7,
    reviews: 52,
    initials: 'JW',
    color: '#f97316',
    available: true,
    specialties: ['AWS', 'GCP'],
    tags: ['CI/CD', 'Kubernetes', 'GitOps', 'SRE'],
    bio: 'Reduced deployment times by 10× for Series B companies. Deep Kubernetes and SRE expertise.',
  },
]

const FILTERS = ['All', 'AWS', 'Azure', 'GCP', 'FinOps', 'Healthcare'] as const
type Filter = typeof FILTERS[number]

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: 13 }}>
      {'★'.repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? '½' : ''}
      <span style={{ color: '#555', marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </span>
  )
}

export default function ExpertsPage() {
  const [filter, setFilter] = useState<Filter>('All')

  const visible = filter === 'All'
    ? EXPERTS
    : EXPERTS.filter(e => e.specialties.includes(filter))

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
            EXPERT MARKETPLACE
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 10 }}>
            Vetted cloud experts, on demand
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 520 }}>
            Our AI handles 80% of cloud decisions. For the complex 20%, our vetted experts are here.
          </p>
        </div>

        {/* Zero-commission banner */}
        <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '16px 22px', marginBottom: 36, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22 }}>🤝</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e', marginBottom: 2 }}>Zero commission. Direct booking.</div>
            <div style={{ fontSize: 13, color: '#666' }}>
              AI handles 80% of decisions. For the complex 20%, our vetted experts are here. What you see is what the expert earns — we charge nothing on top.
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: `1px solid ${filter === f ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 20, padding: '6px 16px',
                color: filter === f ? '#818cf8' : '#666',
                fontWeight: filter === f ? 700 : 500,
                fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Expert grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {visible.map(expert => (
            <div
              key={expert.id}
              className="glass-card"
              style={{ padding: '24px', opacity: expert.available ? 1 : 0.7, position: 'relative' }}
            >
              {/* Unavailable ribbon */}
              {!expert.available && (
                <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 800, color: '#555', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 6, letterSpacing: 1 }}>
                  UNAVAILABLE
                </div>
              )}
              {expert.available && (
                <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 800, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', padding: '2px 8px', borderRadius: 6, letterSpacing: 1 }}>
                  AVAILABLE
                </div>
              )}

              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: `${expert.color}22`,
                  border: `2px solid ${expert.color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, color: expert.color, flexShrink: 0,
                }}>
                  {expert.initials}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{expert.name}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 1 }}>{expert.title}</div>
                </div>
              </div>

              {/* Bio */}
              <p style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.55, marginBottom: 14, minHeight: 54 }}>{expert.bio}</p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {expert.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, color: '#555', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 8px' }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <Stars rating={expert.rating} />
                  <span style={{ fontSize: 11, color: '#444', marginLeft: 4 }}>({expert.reviews} reviews)</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>${expert.rate}<span style={{ fontSize: 11, color: '#555', fontWeight: 400 }}>/hr</span></div>
                  <div style={{ fontSize: 11, color: '#555' }}>{expert.years} yrs exp</div>
                </div>
              </div>

              {/* Book button */}
              <a
                href={`mailto:experts@cloudintelligence.app?subject=Booking Request: ${expert.name}&body=Hi, I'd like to book a session with ${expert.name} (${expert.title}).%0A%0APlease share availability.`}
                style={{
                  display: 'block', textAlign: 'center',
                  background: expert.available ? '#6366f1' : 'rgba(255,255,255,0.06)',
                  color: expert.available ? 'white' : '#555',
                  border: expert.available ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '10px 0',
                  fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  pointerEvents: expert.available ? 'auto' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (expert.available) (e.currentTarget as HTMLAnchorElement).style.background = '#4f46e5' }}
                onMouseLeave={e => { if (expert.available) (e.currentTarget as HTMLAnchorElement).style.background = '#6366f1' }}
              >
                {expert.available ? 'Book a Session →' : 'Currently Unavailable'}
              </a>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{ marginTop: 40, padding: '16px 20px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, fontSize: 13, color: '#555', textAlign: 'center' }}>
          All experts are independently vetted. Bookings go direct — no platform fee. Response time typically under 2 hours.
        </div>

      </div>
    </div>
  )
}
