'use client'
import { useState } from 'react'
import { Member } from '@/types'

const ROLES = ['SC', 'CD', 'PM', 'BO']

export default function MembersContent({ members: initial }: { members: Member[] }) {
  const [members, setMembers] = useState(initial)
  const [modal, setModal] = useState<Member | null | 'new'>(null)
  const [form, setForm] = useState<any>({})

  const openNew = () => { setForm({ role: 'SC', is_active: true }); setModal('new') }
  const openEdit = (m: Member) => { setForm({ ...m }); setModal(m) }

  const save = async () => {
    const isNew = modal === 'new'
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isNew ? form : { ...form, id: (modal as Member).id }),
    })
    const saved = await res.json()
    if (isNew) setMembers(p => [...p, saved].sort((a,b) => a.name.localeCompare(b.name)))
    else setMembers(p => p.map(m => m.id === saved.id ? saved : m))
    setModal(null)
  }

  const del = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await fetch('/api/members', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setMembers(p => p.filter(m => m.id !== id))
  }

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:-.4 }}>メンバー管理</div>
          <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>SC / CD / PM / BO の登録・管理</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>＋ メンバー追加</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {ROLES.map(role => {
          const count = members.filter(m => m.role === role && m.is_active).length
          return (
            <div key={role} className="stat-card">
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, borderRadius:'16px 16px 0 0', background: role==='SC'?'linear-gradient(90deg,#1a1a1a,#e8001c)':'linear-gradient(90deg,#333,#555)' }} />
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:.7, marginBottom:6 }}><span className={`role-${role}`}>{role}</span></div>
              <div style={{ fontSize:32, fontWeight:800, letterSpacing:-1 }}>{count}</div>
              <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>アクティブ</div>
            </div>
          )
        })}
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>氏名</th><th>ロール</th><th>メール</th><th>ステータス</th><th>操作</th></tr></thead>
          <tbody>
            {members.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text3)', padding:48 }}>メンバーが登録されていません</td></tr>}
            {members.map(m => (
              <tr key={m.id}>
                <td><strong>{m.name}</strong></td>
                <td><span className={`role-${m.role}`}>{m.role}</span></td>
                <td style={{ color:'var(--text2)' }}>{m.email || '—'}</td>
                <td><span className={`badge ${m.is_active ? 'badge-dark' : 'badge-gray'}`}>{m.is_active ? 'アクティブ' : '非アクティブ'}</span></td>
                <td><div style={{ display:'flex', gap:4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>編集</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(m.id)}>削除</button>
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
              <h2 style={{ fontSize:18, fontWeight:800 }}>{modal === 'new' ? 'メンバー追加' : 'メンバーを編集'}</h2>
              <button onClick={() => setModal(null)} style={{ fontSize:18, color:'var(--text3)', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px 24px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">氏名 *</label>
                  <input className="form-input" value={form.name || ''} onChange={e => setForm((p:any) => ({...p, name:e.target.value}))} placeholder="山田 太郎" />
                </div>
                <div>
                  <label className="form-label">ロール *</label>
                  <select className="form-select" value={form.role || 'SC'} onChange={e => setForm((p:any) => ({...p, role:e.target.value}))}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">メールアドレス</label>
                  <input className="form-input" type="email" value={form.email || ''} onChange={e => setForm((p:any) => ({...p, email:e.target.value}))} />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                    <input type="checkbox" checked={form.is_active !== false} onChange={e => setForm((p:any) => ({...p, is_active:e.target.checked}))} />
                    <span className="form-label" style={{ margin:0 }}>アクティブ</span>
                  </label>
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
