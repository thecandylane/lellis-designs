'use client'

import Image from 'next/image'

export default function Icon() {
  return (
    <Image
      src="/logo.png"
      alt="L. Ellis Designs"
      width={32}
      height={32}
      className="rounded-md"
      priority
    />
  )
}
