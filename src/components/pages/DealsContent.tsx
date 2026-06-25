'use client'
import { useState } from 'react'
import { Deal, STAGES, STAGE_COLORS } from '@/types'

const CHANNELS = ['メール','電話','Web問い合わせ','SNS','紹介','セミナー/イベント','広告','その他']

export default function DealsContent({ deals: initial, clients, members }: { deals: any[], clients: any[], members: any[] }) {
  const [deals, setDeals] = useState(initial)
  const [modal, setModal] = useState<any | null | 'new'>(null)
  const [form, setForm] = useState<any>({})
  const [view, setView] = useState<'kanban'|'list'>('kanban')

  const mByRole = (role: string) => members.filter(m => m.role === role)
  const clientName = (id: string) => clients.find(c => c.id === id)?.name || '—'

  const openNew = () => { setForm({ stage: '新規接触', channels: '' }); setModal('new') }
  const openEdit = (d: any) => { setForm({ ...d, client_id: d.client_id, sc_id: d.sc_id, cd_id: d.cd_id, pm_id: d.pm_id, bo_id: d.bo_id }); setModal(d) }

  const save = async () => {
    const isNew = modal === 'new'
    const { client, sc, cd, pm, bo, ...rest } = form
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isNew ? rest : { ...rest, id: modal.id }),
    })
    const saved = await res.json()
    if (isNew) setDeals((p: any[]) => [saved, ...p])
    else setDeals((p: any[]) => p.map(d => d.id === saved.id ? { ...saved, client: d.client, sc: d.sc, cd: d.cd, pm: d.pm, bo: d.bo } : d))
    setModal(null)
  }

  const del = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await fetch('/api/deals', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setDeals((p: any[]) => p.filter(d => d.id !== id))
  }

  const toggleChannel = (ch: string) => {
    const current = (form.channels || '').split(',').map((s:string) => s.trim()).filter(Boolean)
    const next = current.includes(ch) ? current.filter((c:string) => c !== ch) : [...current, ch]
    setForm((p: any) => ({ ...p, channels: next.join(',') }))
  }

  const selectedChannels = (form.channels || '').split(',').map((s:string) => s.trim()).filter(Boolean)

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:-.4 }}>案件管理</div>
          <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>{deals.length}件登録済み</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button className={`btn ${view==='kanban'?'btn-primary':'btn-ghost'}`} onClick={() => setView('kanban')}>カンバン</button>
          <button className={`btn ${view==='list'?'btn-primary':'btn-ghost'}`} onClick={() => setView('list')}>リスト</button>
          <button className="btn btn-primary" onClick={openNew}>＋ 新規案件</button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="kanban">
          {STAGES.map(stage => {
            const col = STAGE_COLORS[stage]
            const stageDeals = deals.filter(d => d.stage === stage)
            return (
              <div key={stage} className="kanban-col">
                <div className="kanban-col-header" style={{ borderTopColor: col.bar, color: col.text }}>
                  {stage} <span style={{ color:'var(--text3)', fontWeight:400 }}>{stageDeals.length}</span>
                </div>
                <div className="kanban-cards">
                  {stageDeals.map(d => (
                    <div key={d.id} className="kanban-card" onClick={() => openEdit(d)}>
                      <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{d.title}</div>
                      <div style={{ fontSize:11.5, color:'var(--text2)', marginBottom:7 }}>{d.client?.name || clientName(d.client_id)}</div>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap', alignItems:'center' }}>
                        {d.amount && <span style={{ fontSize:11, fontWeight:700, fontFamily:'monospace' }}>{Number(d.amount).toLocaleString()}円</span>}
                        {(d.sc || d.sc_id) && <span className="role-SC">SC</span>}
                        {(d.cd || d.cd_id) && <span className="role-CD">CD</span>}
                        {(d.pm || d.pm_id) && <span className="role-PM">PM</span>}
                        {(d.bo || d.bo_id) && <span className="role-BO">BO</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>プロダクト名</th><th>顧客</th><th>ステージ</th><th>金額</th><th>担当</th><th>操作</th></tr></thead>
            <tbody>
              {deals.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text3)', padding:48 }}>案件がありません</td></tr>}
              {deals.map(d => {
                const col = STAGE_COLORS[d.stage as keyof typeof STAGE_COLORS]
                return (
                  <tr key={d.id}>
                    <td><strong>{d.title}</strong></td>
                    <td style={{ color:'var(--text2)' }}>{d.client?.name || clientName(d.client_id)}</td>
                    <td><span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:col?.bg, color:col?.text }}>{d.stage}</span></td>
                    <td style={{ fontFamily:'monospace', fontWeight:700 }}>{d.amount ? Number(d.amount).toLocaleString()+'円' : '—'}</td>
                    <td><div style={{ display:'flex', gap:3 }}>
                      {d.sc_id && <span className="role-SC">SC</span>}
                      {d.cd_id && <span className="role-CD">CD</span>}
                      {d.pm_id && <span className="role-PM">PM</span>}
                      {d.bo_id && <span className="role-BO">BO</span>}
                    </div></td>
                    <td><div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>編集</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(d.id)}>削除</button>
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:18, fontWeight:800 }}>{modal === 'new' ? '新規案件' : '案件を編集'}</h2>
              <button onClick={() => setModal(null)} style={{ fontSize:18, color:'var(--text3)', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px 24px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">プロダクト名 *</label>
                  <input className="form-input" value={form.title || ''} onChange={e => setForm((p:any) => ({...p, title:e.target.value}))} />
                </div>
                <div>
                  <label className="form-label">顧客</label>
                  <select className="form-select" value={form.client_id || ''} onChange={e => setForm((p:any) => ({...p, client_id:e.target.value}))}>
                    <option value="">選択</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">ステージ</label>
                  <select className="form-select" value={form.stage || '新規接触'} onChange={e => setForm((p:any) => ({...p, stage:e.target.value}))}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">金額 (円)</label>
                  <input className="form-input" type="number" value={form.amount || ''} onChange={e => setForm((p:any) => ({...p, amount:e.target.value}))} />
                </div>
                <div>
                  <label className="form-label">確度 (%)</label>
                  <input className="form-input" type="number" min="0" max="100" value={form.probability || ''} onChange={e => setForm((p:any) => ({...p, probability:e.target.value}))} />
                </div>
                <div>
                  <label className="form-label">クローズ予定日</label>
                  <input className="form-input" type="date" value={form.expected_close_date || ''} onChange={e => setForm((p:any) => ({...p, expected_close_date:e.target.value}))} />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">チャネル（複数選択可）</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
                    {CHANNELS.map(ch => (
                      <label key={ch} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, border:`1px solid ${selectedChannels.includes(ch)?'var(--red)':'rgba(0,0,0,.12)'}`, background:selectedChannels.includes(ch)?'rgba(232,0,28,.08)':'#fff', color:selectedChannels.includes(ch)?'#c0001a':'var(--text2)', fontSize:12, cursor:'pointer' }}>
                        <input type="checkbox" style={{ display:'none' }} checked={selectedChannels.includes(ch)} onChange={() => toggleChannel(ch)} />{ch}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn:'1/-1', background:'var(--bg)', borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:.5, marginBottom:12 }}>チームアサイン</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {(['SC','CD','PM','BO'] as const).map(role => (
                      <div key={role}>
                        <label className="form-label"><span className={`role-${role}`}>{role}</span></label>
                        <select className="form-select" value={form[`${role.toLowerCase()}_id`] || ''} onChange={e => setForm((p:any) => ({...p, [`${role.toLowerCase()}_id`]:e.target.value}))}>
                          <option value="">未アサイン</option>
                          {mByRole(role).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">メモ</label>
                  <textarea className="form-textarea" value={form.description || ''} onChange={e => setForm((p:any) => ({...p, description:e.target.value}))} />
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
