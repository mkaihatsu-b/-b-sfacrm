'use client'
import { useState } from 'react'
import { Client } from '@/types'

const INDUSTRIES = ['IT・テクノロジー','金融・保険','製造','小売・EC','医療・ヘルスケア','不動産','教育','物流','その他']
const STATUSES = ['見込み','アクティブ','非アクティブ']

export default function ClientsContent({ clients: initial, deals }: { clients: Client[], deals: any[] }) {
  const [clients, setClients] = useState(initial)
  const [modal, setModal] = useState<Client | null | 'new'>(null)
  const [form, setForm] = useState<any>({})
  const [search, setSearch] = useState('')

  const dealCount = (id: string) => deals.filter(d => d.client_id === id).length

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => { setForm({ status: '見込み' }); setModal('new') }
  const openEdit = (c: Client) => { setForm({ ...c }); setModal(c) }

  const save = async () => {
    const isNew = modal === 'new'
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isNew ? form : { ...form, id: (modal as Client).id }),
    })
    const saved = await res.json()
    if (isNew) setClients(p => [saved, ...p])
    else setClients(p => p.map(c => c.id === saved.id ? saved : c))
    setModal(null)
  }

  const del = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await fetch('/api/clients', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setClients(p => p.filter(c => c.id !== id))
  }

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:-.4 }}>顧客管理</div>
          <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>{clients.length}社登録済み</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>＋ 新規顧客</button>
      </div>

      <input className="form-input" style={{ marginBottom:16, maxWidth:320 }} placeholder="顧客名・業種で検索..." value={search} onChange={e => setSearch(e.target.value)} />

      <div className="table-wrap">
        <table>
          <thead><tr><th>顧客名</th><th>業種</th><th>電話</th><th>ステータス</th><th>案件数</th><th>操作</th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text3)', padding:48 }}>顧客が登録されていません</td></tr>}
            {filtered.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td style={{ color:'var(--text2)' }}>{c.industry || '—'}</td>
                <td style={{ color:'var(--text2)' }}>{c.phone || '—'}</td>
                <td><span className={`badge ${c.status === 'アクティブ' ? 'badge-dark' : c.status === '見込み' ? 'badge-red' : 'badge-gray'}`}>{c.status || '—'}</span></td>
                <td style={{ color:'var(--text2)' }}>{dealCount(c.id)}件</td>
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
              <h2 style={{ fontSize:18, fontWeight:800 }}>{modal === 'new' ? '新規顧客' : '顧客を編集'}</h2>
              <button onClick={() => setModal(null)} style={{ fontSize:18, color:'var(--text3)', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px 24px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">顧客名 *</label>
                  <input className="form-input" value={form.name || ''} onChange={e => setForm((p:any) => ({...p, name:e.target.value}))} placeholder="株式会社〇〇" />
                </div>
                <div>
                  <label className="form-label">業種</label>
                  <select className="form-select" value={form.industry || ''} onChange={e => setForm((p:any) => ({...p, industry:e.target.value}))}>
                    <option value="">選択</option>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">ステータス</label>
                  <select className="form-select" value={form.status || '見込み'} onChange={e => setForm((p:any) => ({...p, status:e.target.value}))}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">電話</label>
                  <input className="form-input" value={form.phone || ''} onChange={e => setForm((p:any) => ({...p, phone:e.target.value}))} placeholder="03-0000-0000" />
                </div>
                <div>
                  <label className="form-label">Webサイト</label>
                  <input className="form-input" value={form.website || ''} onChange={e => setForm((p:any) => ({...p, website:e.target.value}))} placeholder="https://" />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">住所</label>
                  <input className="form-input" value={form.address || ''} onChange={e => setForm((p:any) => ({...p, address:e.target.value}))} />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">メモ</label>
                  <textarea className="form-textarea" value={form.notes || ''} onChange={e => setForm((p:any) => ({...p, notes:e.target.value}))} />
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
