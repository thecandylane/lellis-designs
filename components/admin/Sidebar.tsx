'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ClipboardList, Upload, Grid3X3, FolderOpen, Sparkles, Settings } from 'lucide-react'

const navItems = [
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: ClipboardList,
    description: 'View & fulfill orders'
  },
  {
    href: '/admin/requests',
    label: 'Custom Requests',
    icon: Sparkles,
    description: 'Quote custom orders'
  },
  {
    href: '/admin/upload',
    label: 'Add Buttons',
    icon: Upload,
    description: 'Upload new designs'
  },
  {
    href: '/admin/buttons',
    label: 'My Buttons',
    icon: Grid3X3,
    description: 'Manage listings'
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    icon: FolderOpen,
    description: 'Organize buttons'
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Business settings'
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <Link href="/admin/orders" className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
            <Image
              src="/logo.png"
              alt="L. Ellis Designs"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-bold text-gray-900">L. Ellis Designs</span>
            <span className="block text-xs text-gray-500">Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin/orders' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                  <div>
                    <span className="block">{item.label}</span>
                    <span className={`text-xs ${isActive ? 'text-teal-600' : 'text-gray-400'}`}>
                      {item.description}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Live Site
        </Link>
      </div>
    </aside>
  )
}
