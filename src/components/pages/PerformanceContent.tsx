'use client'
import { useState } from 'react'
import { PERF_METRICS } from '@/types'

export default function PerformanceContent({ performance: initial, members }: { performance: any[], members: any[] }) {
  const [records, setRecords] = useState(initial)
  const [modal, setModal] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [selectedDate, setSelectedDate] = useState(() => {
    const dates = [...new Set(initial.map(p => p.date?.slice(0,10)))].sort().reverse()
    return dates[0] || new Date().toISOString().slice(0,10)
  })

  const dates = [...new Set(records.map(p => p.date?.slice(0,10)))].sort().reverse()
  const todayStr = new Date().toISOString().slice(0,10)

  const getRec = (memberId: string, date: string) =>
    records.find(p => p.member_id === memberId && p.date?.slice(0,10) === date) || null

  const getPrev = (memberId: string, date: string) => {
    const memberDates = records.filter(p => p.member_id === memberId && p.date?.slice(0,10) < date).map(p => p.date?.slice(0,10)).sort()
    if (!memberDates.length) return null
    return records.find(p => p.member_id === memberId && p.date?.slice(0,10) === memberDates[memberDates.length - 1]) || null
  }

  const openForm = (memberId: string) => {
    const rec = getRec(memberId, selectedDate) || {}
    setForm({ member_id: memberId, date: selectedDate, ...rec })
    setModal(memberId)
  }

  const save = async () => {
    const { member, ...rest } = form
    const existing = getRec(form.member_id, selectedDate)
    const res = await fetch('/api/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(existing ? { ...rest, id: existing.id } : rest),
    })
    const saved = await res.json()
    if (existing) setRecords(p => p.map(r => r.id === saved.id ? saved : r))
    else {
      setRecords(p => [saved, ...p])
      if (!dates.includes(selectedDate)) setSelectedDate(selectedDate)
    }
    setModal(null)
  }

  const allDatesWithToday = dates.includes(todayStr) ? dates : [todayStr, ...dates]

  // チーム合計
  const totals = PERF_METRICS.map(mt => {
    const sum = members.reduce((s, m) => {
      const rec = getRec(m.id, selectedDate)
      return s + (Number((rec as any)?.[mt.key]) || 0)
    }, 0)
    return { ...mt, sum }
  })

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div><div style={{ fontSize:22, fontWeight:800, letterSpacing:-.4 }}>メンバー別成果</div><div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>日次入力 · 前日比自動計算</div></div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <select className="form-select" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
            {allDatesWithToday.map(d => <option key={d} value={d}>{d}{d===todayStr?'（今日）':''}</option>)}
          </select>
        </div>
      </div>

      {/* チーム合計 */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:.7, marginBottom:12 }}>チーム合計 — {selectedDate}</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {totals.map(mt => (
            <div key={mt.key} style={{ textAlign:'center', padding:'8px 12px', background:'rgba(232,0,28,0.04)', border:'1px solid rgba(232,0,28,0.10)', borderRadius:10, minWidth:80 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:.4, marginBottom:4 }}>{mt.label}</div>
              <div style={{ fontSize:18, fontWeight:800, color:'var(--text)' }}>{mt.isMrr ? (mt.sum ? mt.sum.toLocaleString()+'円' : '—') : (mt.sum || '—')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* メンバーカード */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {members.map(m => {
          const rec = getRec(m.id, selectedDate) as any
          const prev = getPrev(m.id, selectedDate) as any
          const hasRec = !!rec
          return (
            <div key={m.id} className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{m.name}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                    <span className={`role-${m.role}`}>{m.role}</span>
                    <span style={{ fontSize:10, color:'var(--text3)' }}>{prev ? `前日: ${prev.date?.slice(0,10)}` : '前日データなし'}</span>
                  </div>
                </div>
                <button className={`btn btn-sm ${hasRec ? 'btn-ghost' : 'btn-primary'}`} onClick={() => openForm(m.id)}>
                  {hasRec ? '編集' : '＋ 入力'}
                </button>
              </div>
              {PERF_METRICS.map(mt => {
                const val = Number(rec?.[mt.key] || 0)
                const prevVal = Number(prev?.[mt.key] || 0)
                const diff = val - prevVal
                const valStr = mt.isMrr ? (val ? val.toLocaleString()+'円' : '—') : (val || '—')
                return (
                  <div key={mt.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:'0.5px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize:12, color:'var(--text2)' }}>{mt.label}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:13, fontWeight:700 }}>{valStr}</span>
                      {prev && diff !== 0 && (
                        diff > 0
                          ? <span className="diff-up">▲ +{mt.isMrr ? diff.toLocaleString()+'円' : diff}</span>
                          : <span className="diff-down">▼ {mt.isMrr ? diff.toLocaleString()+'円' : diff}</span>
                      )}
                      {prev && diff === 0 && <span className="diff-zero">±0</span>}
                    </span>
                  </div>
                )
              })}
              {rec?.contract_clients && (
                <div style={{ marginTop:8, padding:'8px 10px', background:'rgba(232,0,28,0.05)', border:'1px solid rgba(232,0,28,0.18)', borderRadius:8 }}>
                  <div style={{ fontSize:9.5, fontWeight:700, color:'#c0001a', textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>契約企業</div>
                  {rec.contract_clients.split('\n').filter(Boolean).map((cl: string, i: number) => (
                    <div key={i} style={{ fontSize:11.5, color:'var(--text)' }}>• {cl.trim()}</div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:18, fontWeight:800 }}>{members.find(m=>m.id===modal)?.name} — {selectedDate} 入力</h2>
              <button onClick={() => setModal(null)} style={{ fontSize:18, color:'var(--text3)', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px 24px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {PERF_METRICS.map(mt => (
                  <div key={mt.key}>
                    <label className="form-label">{mt.label}</label>
                    <input className="form-input" type="number" min="0" value={form[mt.key] || ''} onChange={e => setForm((p:any) => ({...p, [mt.key]: e.target.value}))} placeholder="0" />
                  </div>
                ))}
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">契約企業名（1行1社）</label>
                  <textarea className="form-textarea" value={form.contract_clients || ''} onChange={e => setForm((p:any) => ({...p, contract_clients:e.target.value}))} />
                </div>
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)' }}>
                <button className="btn btn-ghost" onClick={() => setModal(null)}>キャンセル</button>
                <button className="btn btn-primary" onClick={save}>保存する</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
