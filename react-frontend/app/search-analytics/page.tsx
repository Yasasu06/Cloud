export default function SearchAnalyticsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
            SEARCH ANALYTICS
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: 10 }}>
            Search query tracking
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 520 }}>
            See what users are searching for across the platform.
          </p>
        </div>

        {/* Setup notice */}
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>SETUP REQUIRED</div>
          <p style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.6, margin: 0 }}>
            Run the SQL in <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>supabase-migrations.sql</code> first to create the <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>search_queries</code> table and enable search tracking.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {[
            { step: '1', title: 'Open Supabase SQL Editor', desc: 'Go to your project → SQL Editor in the Supabase dashboard.' },
            { step: '2', title: 'Run the migration', desc: 'Copy the CREATE TABLE statement from supabase-migrations.sql and run it.' },
            { step: '3', title: 'View live data', desc: 'Queries typed in the ⌘K search will appear in the table within 800ms of typing.' },
          ].map(s => (
            <div key={s.step} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#818cf8', flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table schema preview */}
        <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 14 }}>TABLE SCHEMA — search_queries</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { col: 'id', type: 'uuid', note: 'Primary key' },
              { col: 'query', type: 'text', note: 'What the user typed' },
              { col: 'result_found', type: 'boolean', note: 'Whether any tools matched' },
              { col: 'clicked_result', type: 'text', note: 'Tool title if user clicked a result' },
              { col: 'user_id', type: 'uuid', note: 'Linked to auth.users if logged in' },
              { col: 'created_at', type: 'timestamp', note: 'When the query was saved' },
            ].map(r => (
              <div key={r.col} style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13 }}>
                <code style={{ color: '#818cf8', fontFamily: 'monospace', minWidth: 140 }}>{r.col}</code>
                <code style={{ color: '#22c55e', fontFamily: 'monospace', minWidth: 100 }}>{r.type}</code>
                <span style={{ color: '#555' }}>{r.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>
          Once the table exists, view data at: Supabase Dashboard → Table Editor → search_queries
        </div>
      </div>
    </div>
  )
}
