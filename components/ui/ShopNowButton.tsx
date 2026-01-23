'use client'

import { ShoppingBag } from 'lucide-react'

export default function ShopNowButton() {
  const scrollToCategories = () => {
    const categoriesSection = document.getElementById('categories')
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <button
      onClick={scrollToCategories}
      className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
    >
      <ShoppingBag className="w-5 h-5" />
      Shop Now
    </button>
  )
}
