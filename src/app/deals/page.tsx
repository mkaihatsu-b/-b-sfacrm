import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import DealsContent from '@/components/pages/DealsContent'
export const revalidate = 0
export default async function DealsPage() {
  const [{ data: deals }, { data: clients }, { data: members }] = await Promise.all([
    supabase.from('deals').select('*, client:clients(name), sc:members!deals_sc_id_fkey(name), cd:members!deals_cd_id_fkey(name), pm:members!deals_pm_id_fkey(name), bo:members!deals_bo_id_fkey(name)').order('created_at', { ascending: false }),
    supabase.from('clients').select('id,name').order('name'),
    supabase.from('members').select('id,name,role').eq('is_active', true).order('name'),
  ])
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-wrap">
        <DealsContent deals={deals || []} clients={clients || []} members={members || []} />
      </main>
    </div>
  )
}
