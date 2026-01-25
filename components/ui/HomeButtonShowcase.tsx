'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import type { Button as ButtonType } from '@/lib/types'
import ButtonCard from './ButtonCard'
import ButtonModal from './ButtonModal'
import { Button } from './button'
import { cn } from '@/lib/utils'

type Props = {
  buttons: ButtonType[]
}

export default function HomeButtonShowcase({ buttons }: Props) {
  const [selectedButton, setSelectedButton] = useState<ButtonType | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Customer Favorites</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Featured Buttons
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our most popular custom 3&quot; buttons loved by teams and families
          </p>
        </div>

        {/* Button Grid/Carousel */}
        {buttons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No buttons available.
          </div>
        ) : (
          <div className="relative">
            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {buttons.slice(0, 10).map((button, index) => (
                <div
                  key={button.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'backwards' }}
                >
                  <ButtonCard
                    button={button}
                    onClick={() => setSelectedButton(button)}
                    featured={button.featured}
                  />
                </div>
              ))}
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden relative">
              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {buttons.map((button) => (
                  <div
                    key={button.id}
                    className="flex-shrink-0 w-[70vw] max-w-[280px] snap-center"
                  >
                    <ButtonCard
                      button={button}
                      onClick={() => setSelectedButton(button)}
                      featured={button.featured}
                    />
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => scroll('left')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => scroll('right')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View All Link */}
        {buttons.length > 5 && (
          <div className="text-center mt-8">
            <Button variant="outline" asChild className="group">
              <a href="#categories">
                View All Designs
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
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
