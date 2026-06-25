import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import ClientsContent from '@/components/pages/ClientsContent'
export const revalidate = 0
export default async function ClientsPage() {
  const [{ data: clients }, { data: deals }] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('deals').select('client_id'),
  ])
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-wrap">
        <ClientsContent clients={clients || []} deals={deals || []} />
      </main>
    </div>
  )
}
