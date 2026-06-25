'use client'

import { Client, Deal, Member, Task, Activity, STAGES, STAGE_COLORS } from '@/types'

interface Props {
  clients: Client[]
  deals: any[]
  members: Member[]
  tasks: any[]
  activities: any[]
}

function fmtMoney(v?: number | null) {
  if (!v) return '—'
  return v.toLocaleString('ja-JP') + '円'
}
function fmtDate(v?: string | null) {
  return v ? v.slice(0, 10) : '—'
}

export default function DashboardContent({ clients, deals, members, tasks, activities }: Props) {
  const activeDeals = deals.filter(d => d.stage !== '失注')
  const wonDeals = deals.filter(d => d.stage === '契約')
  const wonAmount = wonDeals.reduce((s, d) => s + (d.amount || 0), 0)
  const pipeAmount = activeDeals.filter(d => d.stage !== '契約').reduce((s, d) => s + (d.amount || 0), 0)
  const overdueTasks = tasks.filter((t: any) => t.status !== '完了' && t.due_date && new Date(t.due_date) < new Date())

  const stageCounts: Record<string, number> = {}
  STAGES.forEach(s => stageCounts[s] = 0)
  deals.forEach(d => { if (stageCounts[d.stage] !== undefined) stageCounts[d.stage]++ })
  const maxCount = Math.max(...Object.values(stageCounts), 1)

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Good morning, B FORCE! 👋</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>今日も数字を動かしていこう</div>
        </div>
        <a href="/deals/new" className="btn btn-primary">＋ 新規案件</a>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '総顧客数', value: clients.length, sub: '登録企業', accent: 'linear-gradient(90deg,#1a1a1a,#e8001c)' },
          { label: '進行中案件', value: activeDeals.length, sub: fmtMoney(pipeAmount), accent: 'linear-gradient(90deg,#e8001c,#ff4d1c)' },
          { label: '新規接触数', value: stageCounts['新規接触'], sub: '今月累計', accent: 'linear-gradient(90deg,#333,#1a1a1a)' },
          { label: '契約MRR', value: fmtMoney(wonAmount), sub: `${wonDeals.length}社契約`, accent: 'linear-gradient(90deg,#e8001c,#ff3333)', red: true },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '16px 16px 0 0', background: s.accent }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: typeof s.value === 'string' ? 18 : 34, fontWeight: 800, letterSpacing: -1, color: s.red ? 'var(--red)' : 'var(--text)', lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Funnel + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14, marginBottom: 14 }}>
        {/* Funnel */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14 }}>セールスファネル</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {STAGES.filter(s => s !== '失注').map(stage => {
              const count = stageCounts[stage]
              const pct = Math.max((count / maxCount) * 100, count ? 3 : 0)
              const col = STAGE_COLORS[stage]
              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 68, fontSize: 11, color: 'var(--text2)', textAlign: 'right', flexShrink: 0, fontWeight: 600 }}>{stage}</span>
                  <div className="funnel-bar-wrap">
                    <div className="funnel-bar" style={{ width: `${pct}%`, background: col.bar }}>
                      {count > 0 && <span style={{ fontSize: 10, color: 'rgba(255,255,255,.9)', fontWeight: 700 }}>{count}</span>}
                    </div>
                  </div>
                  <span style={{ width: 28, fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14 }}>最近の活動</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activities.length === 0 && <p style={{ fontSize: 12, color: 'var(--text3)' }}>活動はまだありません</p>}
            {activities.map((a: any, i: number) => (
              <div key={a.id} style={{ display: 'flex', gap: 10, paddingBottom: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', marginTop: 5, boxShadow: '0 0 0 2px rgba(232,0,28,.2)' }} />
                  {i < activities.length - 1 && <div style={{ flex: 1, width: 1, background: 'var(--border)', marginTop: 4 }} />}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{a.subject}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                    {a.type} · {fmtDate(a.activity_date)} · {a.member?.name || '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="card">
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14 }}>案件カンバン</div>
        <div className="kanban">
          {STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage)
            const col = STAGE_COLORS[stage]
            return (
              <div key={stage} className="kanban-col">
                <div className="kanban-col-header" style={{ borderTopColor: col.bar, color: col.text }}>
                  {stage} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>{stageDeals.length}</span>
                </div>
                <div className="kanban-cards">
                  {stageDeals.map(d => (
                    <a key={d.id} href={`/deals/${d.id}`} className="kanban-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{d.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text2)', marginBottom: 7 }}>{d.client?.name || '—'}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                        {d.amount && <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{d.amount.toLocaleString()}円</span>}
                        {d.sc && <span className="role-SC">SC</span>}
                        {d.cd && <span className="role-CD">CD</span>}
                        {d.pm && <span className="role-PM">PM</span>}
                        {d.bo && <span className="role-BO">BO</span>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
