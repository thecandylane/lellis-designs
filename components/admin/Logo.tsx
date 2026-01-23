'use client'

import Image from 'next/image'

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="L. Ellis Designs"
        width={50}
        height={50}
        className="rounded-lg"
        priority
      />
      <div className="flex flex-col">
        <span className="text-lg font-bold text-white">L. Ellis Designs</span>
        <span className="text-xs text-white/70">Admin Portal</span>
      </div>
    </div>
  )
}
