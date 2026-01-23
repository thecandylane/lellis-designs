'use client'

import dynamic from 'next/dynamic'

const Ballpit = dynamic(() => import('./Ballpit'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-primary via-primary to-secondary" />
  )
})

export default function HeroBallpit() {
  return (
    <div className="absolute inset-0">
      <Ballpit
        count={80}
        gravity={0.01}
        friction={0.9975}
        wallBounce={0.95}
        followCursor={true}
        colors={[0x14b8a6, 0xec4899, 0x84cc16, 0xa855f7, 0xf97316]}
        minSize={0.4}
        maxSize={1.2}
      />
    </div>
  )
}
