'use client'

import { useState } from 'react'
import type { Button } from '@/lib/types'
import ButtonCard from '@/components/ui/ButtonCard'
import ButtonModal from '@/components/ui/ButtonModal'

type Props = {
  buttons: Button[]
  accentColor?: string
}

export default function CategoryContent({ buttons, accentColor }: Props) {
  const [selectedButton, setSelectedButton] = useState<Button | null>(null)

  if (buttons.length === 0) {
    return <p className="text-muted-foreground">No buttons available in this category yet.</p>
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {buttons.map((button) => (
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
