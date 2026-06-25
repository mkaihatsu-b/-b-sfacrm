import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import PerformanceContent from '@/components/pages/PerformanceContent'
export const revalidate = 0
export default async function PerformancePage() {
  const [{ data: performance }, { data: members }] = await Promise.all([
    supabase.from('performance').select('*, member:members(name,role)').order('date', { ascending: false }),
    supabase.from('members').select('id,name,role').eq('is_active', true).order('name'),
  ])
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-wrap">
        <PerformanceContent performance={performance || []} members={members || []} />
      </main>
    </div>
  )
}
