import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PageBackgroundProps {
  imageUrl?: string | null
  fallbackClass?: string
  overlay?: boolean
  overlayOpacity?: number
  position?: 'fixed' | 'absolute'
  children: React.ReactNode
  className?: string
}

/**
 * A reusable background image component that renders a background image
 * with proper styling and falls back to CSS classes when no image is set.
 */
export function PageBackground({
  imageUrl,
  fallbackClass = 'bg-background',
  overlay = true,
  overlayOpacity = 70,
  position = 'absolute',
  children,
  className,
}: PageBackgroundProps) {
  const hasImage = imageUrl && imageUrl.trim() !== ''

  return (
    <div className={cn('relative', !hasImage && fallbackClass, className)}>
      {hasImage && (
        <>
          {/* Background Image */}
          <div
            className={cn(
              'inset-0 -z-20',
              position === 'fixed' ? 'fixed' : 'absolute'
            )}
          >
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized
            />
          </div>
          {/* Overlay for text legibility */}
          {overlay && (
            <div
              className={cn(
                'inset-0 -z-10',
                position === 'fixed' ? 'fixed' : 'absolute'
              )}
              style={{
                backgroundColor: `rgba(255, 255, 255, ${overlayOpacity / 100})`,
              }}
            />
          )}
        </>
      )}
      {children}
    </div>
  )
}

/**
 * A wrapper for full-page backgrounds that uses fixed positioning.
 * Use this for pages like Contact and Custom Request where the
 * background should stay fixed while content scrolls.
 */
export function FullPageBackground({
  imageUrl,
  fallbackClass = 'bg-glow',
  overlay = true,
  overlayOpacity = 70,
  children,
  className,
}: Omit<PageBackgroundProps, 'position'>) {
  const hasImage = imageUrl && imageUrl.trim() !== ''

  return (
    <div className={cn('min-h-screen', !hasImage && fallbackClass, className)}>
      {hasImage && (
        <>
          {/* Fixed Background Image */}
          <div className="fixed inset-0 -z-20">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized
            />
          </div>
          {/* Fixed Overlay */}
          {overlay && (
            <div
              className="fixed inset-0 -z-10"
              style={{
                backgroundColor: `rgba(255, 255, 255, ${overlayOpacity / 100})`,
              }}
            />
          )}
        </>
      )}
      {children}
    </div>
  )
}

/**
 * A wrapper for section-specific backgrounds.
 * Use this for sections like the Featured Buttons section on homepage.
 */
export function SectionBackground({
  imageUrl,
  fallbackClass = 'bg-background',
  overlay = true,
  overlayOpacity = 70,
  children,
  className,
}: Omit<PageBackgroundProps, 'position'>) {
  const hasImage = imageUrl && imageUrl.trim() !== ''

  return (
    <div className={cn('relative', !hasImage && fallbackClass, className)}>
      {hasImage && (
        <>
          {/* Absolute Background Image within section */}
          <div className="absolute inset-0 -z-20 overflow-hidden">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          {/* Overlay */}
          {overlay && (
            <div
              className="absolute inset-0 -z-10"
              style={{
                backgroundColor: `rgba(255, 255, 255, ${overlayOpacity / 100})`,
              }}
            />
          )}
        </>
      )}
      {children}
    </div>
  )
}
