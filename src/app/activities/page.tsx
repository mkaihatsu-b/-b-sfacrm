import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import ActivitiesContent from '@/components/pages/ActivitiesContent'
export const revalidate = 0
export default async function ActivitiesPage() {
  const [{ data: activities }, { data: clients }, { data: members }, { data: deals }] = await Promise.all([
    supabase.from('activities').select('*, member:members(name), client:clients(name)').order('created_at', { ascending: false }),
    supabase.from('clients').select('id,name').order('name'),
    supabase.from('members').select('id,name,role').eq('is_active', true).order('name'),
    supabase.from('deals').select('id,title').order('title'),
  ])
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-wrap">
        <ActivitiesContent activities={activities || []} clients={clients || []} members={members || []} deals={deals || []} />
      </main>
    </div>
  )
}
