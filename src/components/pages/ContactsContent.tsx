'use client'
import { useState } from 'react'

export default function ContactsContent({ contacts: initial, clients }: { contacts: any[], clients: any[] }) {
  const [contacts, setContacts] = useState(initial)
  const [modal, setModal] = useState<any>(null)
  const [form, setForm] = useState<any>({})

  const clientName = (id: string) => clients.find(c => c.id === id)?.name || '—'
  const openNew = () => { setForm({ is_primary: false }); setModal('new') }
  const openEdit = (c: any) => { setForm({ ...c }); setModal(c) }

  const save = async () => {
    const isNew = modal === 'new'
    const { client, ...rest } = form
    const res = await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(isNew ? rest : { ...rest, id: modal.id }) })
    const saved = await res.json()
    if (isNew) setContacts(p => [saved, ...p])
    else setContacts(p => p.map(c => c.id === saved.id ? saved : c))
    setModal(null)
  }

  const del = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await fetch('/api/contacts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setContacts(p => p.filter(c => c.id !== id))
  }

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div><div style={{ fontSize:22, fontWeight:800, letterSpacing:-.4 }}>コンタクト管理</div><div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>{contacts.length}名登録済み</div></div>
        <button className="btn btn-primary" onClick={openNew}>＋ 新規コンタクト</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>氏名</th><th>顧客</th><th>役職</th><th>メール</th><th>電話</th><th>操作</th></tr></thead>
          <tbody>
            {contacts.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text3)', padding:48 }}>コンタクトがいません</td></tr>}
            {contacts.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong>{c.is_primary && <span className="badge badge-dark" style={{ marginLeft:6, fontSize:10 }}>主担当</span>}</td>
                <td style={{ color:'var(--text2)' }}>{c.client?.name || clientName(c.client_id)}</td>
                <td style={{ color:'var(--text2)' }}>{c.title || '—'}</td>
                <td style={{ color:'var(--text2)' }}>{c.email || '—'}</td>
                <td style={{ color:'var(--text2)' }}>{c.phone || '—'}</td>
                <td><div style={{ display:'flex', gap:4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>編集</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(c.id)}>削除</button>
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
              <h2 style={{ fontSize:18, fontWeight:800 }}>{modal==='new'?'新規コンタクト':'コンタクトを編集'}</h2>
              <button onClick={() => setModal(null)} style={{ fontSize:18, color:'var(--text3)', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px 24px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div style={{ gridColumn:'1/-1' }}><label className="form-label">氏名 *</label><input className="form-input" value={form.name||''} onChange={e => setForm((p:any)=>({...p,name:e.target.value}))} /></div>
                <div><label className="form-label">顧客</label><select className="form-select" value={form.client_id||''} onChange={e => setForm((p:any)=>({...p,client_id:e.target.value}))}><option value="">選択</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="form-label">役職</label><input className="form-input" value={form.title||''} onChange={e => setForm((p:any)=>({...p,title:e.target.value}))} /></div>
                <div><label className="form-label">メール</label><input className="form-input" type="email" value={form.email||''} onChange={e => setForm((p:any)=>({...p,email:e.target.value}))} /></div>
                <div><label className="form-label">電話</label><input className="form-input" value={form.phone||''} onChange={e => setForm((p:any)=>({...p,phone:e.target.value}))} /></div>
                <div style={{ gridColumn:'1/-1' }}><label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}><input type="checkbox" checked={!!form.is_primary} onChange={e => setForm((p:any)=>({...p,is_primary:e.target.checked}))} /><span className="form-label" style={{ margin:0 }}>主担当コンタクト</span></label></div>
                <div style={{ gridColumn:'1/-1' }}><label className="form-label">メモ</label><textarea className="form-textarea" value={form.notes||''} onChange={e => setForm((p:any)=>({...p,notes:e.target.value}))} /></div>
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
