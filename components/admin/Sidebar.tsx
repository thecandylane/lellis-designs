'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ClipboardList, Upload, Grid3X3, FolderOpen, Sparkles, Settings, Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type SidebarStats = {
  orders: { active: number }
  requests: { pending: number }
  buttons: { active: number; featured: number }
  categories: { active: number }
  contacts: { unread: number }
} | null

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

// Reusable sidebar content component
function SidebarContent({ onNavigate, stats }: { onNavigate?: () => void; stats: SidebarStats }) {
  const pathname = usePathname()

  // Get badge count for each nav item
  const getBadge = (href: string): number | null => {
    if (!stats) return null
    switch (href) {
      case '/admin/orders':
        return stats.orders.active > 0 ? stats.orders.active : null
      case '/admin/requests':
        return stats.requests.pending > 0 ? stats.requests.pending : null
      case '/admin/buttons':
        return stats.buttons.active > 0 ? stats.buttons.active : null
      case '/admin/categories':
        return stats.categories.active > 0 ? stats.categories.active : null
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border bg-muted/50">
        <Link
          href="/admin/orders"
          className="flex items-center gap-3"
          onClick={onNavigate}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-background">
            <Image
              src="/logo.png"
              alt="L. Ellis Designs"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-bold text-foreground">L. Ellis Designs</span>
            <span className="block text-xs text-muted-foreground">Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin/orders' && pathname.startsWith(item.href))
            const badge = getBadge(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground/70'}`} />
                  <div className="flex-1">
                    <span className="block">{item.label}</span>
                    <span className={`text-xs ${isActive ? 'text-primary/80' : 'text-muted-foreground/70'}`}>
                      {item.description}
                    </span>
                  </div>
                  {badge !== null && (
                    <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium flex items-center justify-center ${
                      item.href === '/admin/orders' || item.href === '/admin/requests'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Link
          href="/"
          target="_blank"
          onClick={onNavigate}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Live Site
        </Link>
      </div>
    </div>
  )
}

// Hook to fetch sidebar stats
function useSidebarStats(): SidebarStats {
  const [stats, setStats] = useState<SidebarStats>(null)
  const pathname = usePathname()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch sidebar stats:', error)
      }
    }

    fetchStats()

    // Refetch on navigation
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [pathname])

  return stats
}

// Desktop sidebar - hidden on mobile
export default function Sidebar() {
  const stats = useSidebarStats()

  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-border min-h-screen flex-col">
      <SidebarContent stats={stats} />
    </aside>
  )
}

// Mobile sidebar trigger component for use in AdminHeader
export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false)
  const stats = useSidebarStats()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-card">
        <SheetHeader className="sr-only">
          <SheetTitle>Admin Navigation</SheetTitle>
        </SheetHeader>
        <SidebarContent onNavigate={() => setOpen(false)} stats={stats} />
      </SheetContent>
    </Sheet>
  )
}
