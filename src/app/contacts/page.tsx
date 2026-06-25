import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import ContactsContent from '@/components/pages/ContactsContent'
export const revalidate = 0
export default async function ContactsPage() {
  const [{ data: contacts }, { data: clients }] = await Promise.all([
    supabase.from('contacts').select('*, client:clients(name)').order('created_at', { ascending: false }),
    supabase.from('clients').select('id,name').order('name'),
  ])
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-wrap">
        <ContactsContent contacts={contacts || []} clients={clients || []} />
      </main>
    </div>
  )
}
