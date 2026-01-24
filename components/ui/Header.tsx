'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, Home, Sparkles, Mail } from 'lucide-react'
import { useCart } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'

const navLinks = [
  { href: '/', label: 'Shop', icon: Home },
  { href: '/custom-request', label: 'Custom Order', icon: Sparkles },
  { href: '/contact', label: 'Contact', icon: Mail },
]

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const itemCount = useCart((state) => state.getItemCount())

  // Only show cart count after hydration to prevent mismatch
  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  return (
    <header className="bg-primary sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden ring-2 ring-secondary/50 group-hover:ring-secondary transition-all duration-300">
            <Image
              src="/logo.png"
              alt="L. Ellis Designs"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 48px, 56px"
            />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl md:text-2xl font-bold text-primary-foreground group-hover:text-secondary transition-colors duration-200">
              L. Ellis Designs
            </span>
            <span className="block text-xs text-primary-foreground/70">
              Custom 3&quot; Buttons
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-primary-foreground/90 hover:text-secondary font-medium transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Cart and Mobile Menu */}
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className={cn(
              "relative p-2 rounded-lg transition-all duration-200",
              "text-primary-foreground hover:text-secondary hover:bg-primary-foreground/10"
            )}
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Mobile menu with Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 text-primary-foreground hover:text-secondary transition-colors duration-200"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-primary border-primary-foreground/20">
              <SheetHeader className="border-b border-primary-foreground/20 pb-4">
                <SheetTitle className="text-primary-foreground flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-secondary/50">
                    <Image
                      src="/logo.png"
                      alt="L. Ellis Designs"
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <span>L. Ellis Designs</span>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-2 mt-6">
                {navLinks.map((link, index) => {
                  const Icon = link.icon
                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg",
                          "text-primary-foreground hover:text-secondary hover:bg-primary-foreground/10",
                          "font-medium transition-all duration-200",
                          "animate-in slide-in-from-right duration-300"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    </SheetClose>
                  )
                })}

                {/* Cart link in mobile menu */}
                <SheetClose asChild>
                  <Link
                    href="/cart"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg mt-4",
                      "bg-secondary text-secondary-foreground",
                      "font-medium transition-all duration-200 hover:opacity-90",
                      "animate-in slide-in-from-right duration-300"
                    )}
                    style={{ animationDelay: `${navLinks.length * 50}ms` }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    View Cart
                    {mounted && itemCount > 0 && (
                      <span className="ml-auto bg-primary-foreground/20 px-2 py-0.5 rounded-full text-sm">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </SheetClose>
              </nav>

              {/* Bottom section */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-primary-foreground/50 text-xs text-center">
                  Custom 3&quot; Buttons for Every Occasion
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
