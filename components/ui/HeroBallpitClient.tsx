'use client'

import dynamic from 'next/dynamic'

// Code-split 3D component to reduce initial bundle size (~200KB+ savings)
// This client component wrapper allows us to use ssr: false with dynamic import
const HeroBallpit = dynamic(() => import('./HeroBallpit'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] md:h-[600px] bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl" />
  ),
})

export default HeroBallpit
