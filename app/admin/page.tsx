import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'

export default async function AdminPage() {
  const user = await getUser()

  if (user) {
    redirect('/admin/orders')
  } else {
    redirect('/admin/login')
  }
}
