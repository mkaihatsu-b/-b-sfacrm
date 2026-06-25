'use client'
import { useState } from 'react'

const STATUSES = ['未着手','進行中','完了','保留']
const PRIORITIES = ['高','中','低']

export default function TasksContent({ tasks: initial, clients, members }: { tasks: any[], clients: any[], members: any[] }) {
  const [tasks, setTasks] = useState(initial)
  const [modal, setModal] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [filter, setFilter] = useState('')

  const filtered = filter ? tasks.filter(t => t.status === filter) : tasks
  const openNew = () => { setForm({ status: '未着手', priority: '中' }); setModal('new') }
  const openEdit = (t: any) => { setForm({ ...t }); setModal(t) }

  const save = async () => {
    const isNew = modal === 'new'
    const { assignee, client, ...rest } = form
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(isNew ? rest : { ...rest, id: modal.id }) })
    const saved = await res.json()
    if (isNew) setTasks(p => [saved, ...p])
    else setTasks(p => p.map(t => t.id === saved.id ? saved : t))
    setModal(null)
  }

  const del = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await fetch('/api/tasks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setTasks(p => p.filter(t => t.id !== id))
  }

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div><div style={{ fontSize:22, fontWeight:800, letterSpacing:-.4 }}>タスク管理</div><div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>{tasks.length}件登録済み</div></div>
        <button className="btn btn-primary" onClick={openNew}>＋ 新規タスク</button>
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        {['', ...STATUSES].map(s => <button key={s} className={`btn ${filter===s?'btn-primary':'btn-ghost'}`} onClick={() => setFilter(s)}>{s||'すべて'}</button>)}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>タスク名</th><th>担当者</th><th>顧客</th><th>期限</th><th>優先度</th><th>ステータス</th><th>操作</th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text3)', padding:48 }}>タスクがありません</td></tr>}
            {filtered.map(t => {
              const over = t.status !== '完了' && t.due_date && new Date(t.due_date) < new Date()
              return (
                <tr key={t.id}>
                  <td><strong>{t.title}</strong></td>
                  <td style={{ color:'var(--text2)' }}>{t.assignee?.name || '—'}</td>
                  <td style={{ color:'var(--text2)' }}>{t.client?.name || '—'}</td>
                  <td><span className={`badge ${over?'badge-red':'badge-gray'}`}>{t.due_date ? t.due_date.slice(0,10) : '—'}</span></td>
                  <td><span className={`badge ${t.priority==='高'?'badge-red':t.priority==='中'?'badge-orange':'badge-gray'}`}>{t.priority}</span></td>
                  <td><span className={`badge ${t.status==='完了'?'badge-dark':t.status==='進行中'?'badge-red':'badge-gray'}`}>{t.status}</span></td>
                  <td><div style={{ display:'flex', gap:4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>編集</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(t.id)}>削除</button>
                  </div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:18, fontWeight:800 }}>{modal==='new'?'新規タスク':'タスクを編集'}</h2>
              <button onClick={() => setModal(null)} style={{ fontSize:18, color:'var(--text3)', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'20px 24px 24px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div style={{ gridColumn:'1/-1' }}><label className="form-label">タスク名 *</label><input className="form-input" value={form.title||''} onChange={e => setForm((p:any)=>({...p,title:e.target.value}))} /></div>
                <div><label className="form-label">担当者</label><select className="form-select" value={form.assignee_id||''} onChange={e => setForm((p:any)=>({...p,assignee_id:e.target.value}))}><option value="">選択</option>{members.map(m=><option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}</select></div>
                <div><label className="form-label">顧客</label><select className="form-select" value={form.client_id||''} onChange={e => setForm((p:any)=>({...p,client_id:e.target.value}))}><option value="">選択</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="form-label">期限</label><input className="form-input" type="date" value={form.due_date||''} onChange={e => setForm((p:any)=>({...p,due_date:e.target.value}))} /></div>
                <div><label className="form-label">優先度</label><select className="form-select" value={form.priority||'中'} onChange={e => setForm((p:any)=>({...p,priority:e.target.value}))}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></div>
                <div style={{ gridColumn:'1/-1' }}><label className="form-label">ステータス</label><select className="form-select" value={form.status||'未着手'} onChange={e => setForm((p:any)=>({...p,status:e.target.value}))}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
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
