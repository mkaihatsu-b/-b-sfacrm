import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'
import MembersContent from '@/components/pages/MembersContent'
export const revalidate = 0
export default async function MembersPage() {
  const { data: members } = await supabase.from('members').select('*').order('name')
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-wrap">
        <MembersContent members={members || []} />
      </main>
    </div>
  )
}
