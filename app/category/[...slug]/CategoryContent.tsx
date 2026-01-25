'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, Grid3X3, Grid2X2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'
type GridDensity = 'compact' | 'standard' | 'large'

type Props = {
  buttons: Button[]
  accentColor?: string
}

const gridClasses: Record<GridDensity, string> = {
  compact: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  standard: 'grid-cols-2 md:grid-cols-3',
  large: 'grid-cols-2',
}

export default function CategoryContent({ buttons, accentColor }: Props) {
  const [selectedButton, setSelectedButton] = useState<Button | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('name-asc')
  const [gridDensity, setGridDensity] = useState<GridDensity>('compact')

  const color = accentColor || '#461D7C'

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

  const densityButtons: { value: GridDensity; icon: typeof LayoutGrid; label: string }[] = [
    { value: 'compact', icon: LayoutGrid, label: 'Compact (4 columns)' },
    { value: 'standard', icon: Grid3X3, label: 'Standard (3 columns)' },
    { value: 'large', icon: Grid2X2, label: 'Large (2 columns)' },
  ]

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-3">
        {/* Sort dropdown */}
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

        {/* Grid density toggle - hidden on mobile */}
        <div className="hidden items-center gap-1 md:flex">
          <span className="mr-2 text-sm text-muted-foreground">View:</span>
          {densityButtons.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setGridDensity(value)}
              title={label}
              className={cn(
                'rounded-md p-2 transition-colors',
                gridDensity === value
                  ? 'text-white'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
              style={gridDensity === value ? { backgroundColor: color } : undefined}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className={cn('grid gap-6', gridClasses[gridDensity])}>
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
