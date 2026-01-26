import { formatDistanceToNow } from 'date-fns'
import { Mail } from 'lucide-react'
import ContactRequestActions from './ContactRequestActions'

type ContactRequest = {
  id: string
  createdAt: string
  name: string
  email: string
  subject?: string
  message: string
  status: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  responded: { label: 'Responded', color: 'bg-green-100 text-green-800' },
}

export default function ContactRequestCard({ request }: { request: ContactRequest }) {
  const status = STATUS_LABELS[request.status] || STATUS_LABELS.new

  return (
    <div className="bg-card rounded-xl shadow-sm border border-indigo-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-indigo-100 bg-indigo-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
          <span className="text-sm text-muted-foreground">
            Received {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Contact Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <p className="font-medium text-foreground text-lg">{request.name}</p>
            <div className="flex items-center gap-2 text-foreground/80 mt-1">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${request.email}`} className="hover:text-indigo-600">
                {request.email}
              </a>
            </div>
          </div>
        </div>

        {/* Subject */}
        {request.subject && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Subject
            </h3>
            <p className="text-foreground font-medium">{request.subject}</p>
          </div>
        )}

        {/* Message */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Message
          </h3>
          <p className="text-foreground/90 whitespace-pre-wrap bg-muted/50 rounded-lg p-4">
            {request.message}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-indigo-100 bg-indigo-50/30">
        <ContactRequestActions
          requestId={request.id}
          currentStatus={request.status}
          customerEmail={request.email}
        />
      </div>
    </div>
  )
}
