'use client'

import { useState } from 'react'
import type { Button } from '@/lib/types'
import ButtonCard from './ButtonCard'
import ButtonModal from './ButtonModal'

type Props = {
  buttons: Button[]
}

export default function HomeButtonShowcase({ buttons }: Props) {
  const [selectedButton, setSelectedButton] = useState<Button | null>(null)

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="px-4 md:px-8 lg:px-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Featured Buttons
          </h2>
          <p className="text-base text-muted-foreground">
            Our most popular custom 3&quot; buttons
          </p>
        </div>

        {/* Button Grid */}
        {buttons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No buttons available.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {buttons.map((button) => (
              <ButtonCard
                key={button.id}
                button={button}
                onClick={() => setSelectedButton(button)}
                featured={button.featured}
              />
            ))}
          </div>
        )}

        {/* Button Modal */}
        {selectedButton && (
          <ButtonModal
            button={selectedButton}
            onClose={() => setSelectedButton(null)}
          />
        )}
      </div>
    </section>
  )
}
