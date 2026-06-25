import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import DashboardContent from '@/components/pages/DashboardContent'

export const revalidate = 0

export default async function Home() {
  const [
    { data: clients },
    { data: deals },
    { data: members },
    { data: tasks },
    { data: activities },
  ] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('deals').select('*, client:clients(name), sc:members!deals_sc_id_fkey(name), cd:members!deals_cd_id_fkey(name), pm:members!deals_pm_id_fkey(name), bo:members!deals_bo_id_fkey(name)').order('created_at', { ascending: false }),
    supabase.from('members').select('*').eq('is_active', true).order('name'),
    supabase.from('tasks').select('*, assignee:members(name), client:clients(name)').order('due_date', { ascending: true }),
    supabase.from('activities').select('*, member:members(name), client:clients(name)').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-wrap">
        <DashboardContent
          clients={clients || []}
          deals={deals || []}
          members={members || []}
          tasks={tasks || []}
          activities={activities || []}
        />
      </main>
    </div>
  )
}
