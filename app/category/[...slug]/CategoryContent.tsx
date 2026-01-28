'use client'

import { useState, useMemo } from 'react'
import type { Button } from '@/lib/types'
import ButtonCard from '@/components/ui/ButtonCard'
import ButtonModal from '@/components/ui/ButtonModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

type Props = {
  buttons: Button[]
  accentColor?: string
}

export default function CategoryContent({ buttons, accentColor }: Props) {
  const [selectedButton, setSelectedButton] = useState<Button | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('name-asc')

  const sortedButtons = useMemo(() => {
    const sorted = [...buttons]
    switch (sortOption) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price)
      default:
        return sorted
    }
  }, [buttons, sortOption])

  if (buttons.length === 0) {
    return <p className="text-muted-foreground">No buttons available in this category yet.</p>
  }

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex items-center gap-4 rounded-lg border border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-asc">Price Low-High</SelectItem>
              <SelectItem value="price-desc">Price High-Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product circle layout */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10">
        {sortedButtons.map((button) => (
          <ButtonCard
            key={button.id}
            button={button}
            onClick={() => setSelectedButton(button)}
            accentColor={accentColor}
          />
        ))}
      </div>

      {selectedButton && (
        <ButtonModal
          button={selectedButton}
          onClose={() => setSelectedButton(null)}
          accentColor={accentColor}
        />
      )}
    </>
  )
}
