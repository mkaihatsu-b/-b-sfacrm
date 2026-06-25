import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import TasksContent from '@/components/pages/TasksContent'
export const revalidate = 0
export default async function TasksPage() {
  const [{ data: tasks }, { data: clients }, { data: members }] = await Promise.all([
    supabase.from('tasks').select('*, assignee:members(name), client:clients(name)').order('due_date', { ascending: true }),
    supabase.from('clients').select('id,name').order('name'),
    supabase.from('members').select('id,name,role').eq('is_active', true).order('name'),
  ])
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-wrap">
        <TasksContent tasks={tasks || []} clients={clients || []} members={members || []} />
      </main>
    </div>
  )
}
