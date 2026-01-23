import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

type CustomRequestCTAProps = {
  variant?: 'default' | 'compact' | 'banner'
  className?: string
}

export function CustomRequestCTA({ variant = 'default', className = '' }: CustomRequestCTAProps) {
  if (variant === 'compact') {
    return (
      <Link
        href="/custom-request"
        className={`inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors ${className}`}
      >
        <Sparkles className="w-4 h-4" />
        <span>Request a Custom Design</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    )
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Don&apos;t see what you&apos;re looking for?</p>
                <p className="text-sm text-muted-foreground">We create custom buttons for any occasion!</p>
              </div>
            </div>
            <Link
              href="/custom-request"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-md"
            >
              Request Custom Design
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Default variant - card style
  return (
    <div className={`bg-gradient-to-br from-primary/10 via-card to-secondary/10 rounded-2xl p-6 text-center border border-border shadow-lg ${className}`}>
      <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md border border-border">
        <Sparkles className="w-7 h-7 text-secondary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Don&apos;t See What You&apos;re Looking For?
      </h3>
      <p className="text-muted-foreground mb-5 max-w-md mx-auto text-sm">
        We love creating custom buttons! Whether it&apos;s for a wedding, graduation, team event, or
        anything else - tell us your vision and we&apos;ll make it happen.
      </p>
      <Link
        href="/custom-request"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-md"
      >
        <Sparkles className="w-4 h-4" />
        Request a Custom Design
        <ArrowRight className="w-4 h-4" />
      </Link>
      <p className="text-xs text-muted-foreground mt-4">
        We&apos;ll get back to you within 24-48 hours with a quote
      </p>
    </div>
  )
}
