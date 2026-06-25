'use client'
import { useState } from 'react'

const TYPES = ['電話','メール','訪問','オンライン会議','その他']

export default function ActivitiesContent({ activities: initial, clients, members, deals }: { activities: any[], clients: any[], members: any[], deals: any[] }) {
  const [activities, setActivities] = useState(initial)
  const [modal, setModal] = useState<any>(null)
  const [form, setForm] = useState<any>({})

  const openNew = () => { setForm({ type: 'メール', activity_date: new Date().toISOString().slice(0,10) }); setModal('new') }
  const openEdit = (a: any) => { setForm({ ...a }); setModal(a) }

  const save = async () => {
    const isNew = modal === 'new'
    const { member, client, ...rest } = form
    const res = await fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(isNew ? rest : { ...rest, id: modal.id }) })
    const saved = await res.json()
    if (isNew) setActivities(p => [saved, ...p])
    else setActivities(p => p.map(a => a.id === saved.id ? saved : a))
    setModal(null)
  }

  const del = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await fetch('/api/activities', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setActivities(p => p.filter(a => a.id !== id))
  }

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div><div style={{ fontSize:22, fontWeight:800, letterSpacing:-.4 }}>活動履歴</div><div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>{activities.length}件記録済み</div></div>
        <button className="btn btn-primary" onClick={openNew}>＋ 活動を記録</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>種別</th><th>件名</th><th>顧客</th><th>担当者</th><th>日付</th><th>操作</th></tr></thead>
          <tbody>
            {activities.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text3)', padding:48 }}>活動はありません</td></tr>}
            {activities.map(a => (
              <tr key={a.id}>
                <td><span className="badge badge-gray">{a.type || '—'}</span></td>
                <td><strong>{a.subject}</strong></td>
                <td style={{ color:'var(--text2)' }}>{a.client?.name || '—'}</td>
                <td style={{ color:'var(--text2)' }}>{a.member?.name || '—'}</td>
                <td style={{ color:'var(--text2)' }}>{a.activity_date ? a.activity_date.slice(0,10) : '—'}</td>
                <td><div style={{ display:'flex', gap:4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>編集</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>削除</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:18, fontWeight:800 }}>{modal==='new'?'活動を記録':'活動を編集'}</h2>
              <button onClick={() => setModal(null)} style={{ fontSize:18, color:'var(--text3)', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px 24px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div><label className="form-label">種別</label><select className="form-select" value={form.type||'メール'} onChange={e => setForm((p:any)=>({...p,type:e.target.value}))}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                <div><label className="form-label">活動日</label><input className="form-input" type="date" value={form.activity_date||''} onChange={e => setForm((p:any)=>({...p,activity_date:e.target.value}))} /></div>
                <div style={{ gridColumn:'1/-1' }}><label className="form-label">件名 *</label><input className="form-input" value={form.subject||''} onChange={e => setForm((p:any)=>({...p,subject:e.target.value}))} /></div>
                <div><label className="form-label">顧客</label><select className="form-select" value={form.client_id||''} onChange={e => setForm((p:any)=>({...p,client_id:e.target.value}))}><option value="">選択</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="form-label">案件</label><select className="form-select" value={form.deal_id||''} onChange={e => setForm((p:any)=>({...p,deal_id:e.target.value}))}><option value="">選択</option>{deals.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></div>
                <div style={{ gridColumn:'1/-1' }}><label className="form-label">担当者</label><select className="form-select" value={form.member_id||''} onChange={e => setForm((p:any)=>({...p,member_id:e.target.value}))}><option value="">選択</option>{members.map(m=><option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}</select></div>
                <div style={{ gridColumn:'1/-1' }}><label className="form-label">内容</label><textarea className="form-textarea" value={form.body||''} onChange={e => setForm((p:any)=>({...p,body:e.target.value}))} /></div>
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
