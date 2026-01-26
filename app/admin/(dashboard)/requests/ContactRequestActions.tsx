'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'

type ContactRequestActionsProps = {
  requestId: string
  currentStatus: string
  customerEmail: string
}

export default function ContactRequestActions({
  requestId,
  currentStatus,
  customerEmail,
}: ContactRequestActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMarkResponded = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/contact-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'responded' }),
      })

      if (!response.ok) {
        throw new Error('Failed to update contact request')
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating contact request:', error)
      alert('Failed to update contact request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus === 'responded') {
    return (
      <div className="flex items-center gap-3">
        <a
          href={`mailto:${customerEmail}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors"
        >
          <Mail className="w-4 h-4" />
          Send Follow-up
        </a>
        <span className="text-sm text-muted-foreground">Already responded</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <a
        href={`mailto:${customerEmail}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors"
      >
        <Mail className="w-4 h-4" />
        Reply via Email
      </a>
      <button
        onClick={handleMarkResponded}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        Mark as Responded
      </button>
    </div>
  )
}
