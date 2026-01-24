'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { MobileSidebarTrigger } from '@/components/admin/Sidebar'

export default function AdminHeader({ email }: { email: string }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between md:justify-end">
      {/* Mobile menu trigger - only visible on mobile */}
      <MobileSidebarTrigger />

      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden sm:block text-sm text-gray-600">{email}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors min-h-[44px] px-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
