import { getPayload } from 'payload'
import config from '@payload-config'
import { formatDistanceToNow, format } from 'date-fns'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'
import Image from 'next/image'
import Link from 'next/link'
import RequestActions from './RequestActions'
import PastRequestsSection from './PastRequestsSection'
import ContactRequestCard from './ContactRequestCard'
import SearchBar from '@/components/admin/SearchBar'

type SearchParams = Promise<{ q?: string; tab?: string }>
import {
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Package,
  Palette,
  Type,
  Truck,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react'

type CustomRequest = {
  id: string
  createdAt: string
  status: string
  isRush: boolean
  customerName: string
  customerEmail: string
  customerPhone: string
  preferredContact: string
  designDetails: {
    description: string
    eventType?: string
    colorPreferences?: string
  }
  textOptions: {
    wantsText: string
    textContent?: string
    fontPreference?: string
  }
  referenceImages?: Array<{
    image: {
      id: string
      url: string
      alt?: string
      filename: string
    }
    description?: string
  }>
  orderDetails: {
    quantity: number
    neededByDate: string
    isFlexibleDate: string
    deliveryPreference: string
  }
  additionalInfo?: string
  adminSection?: {
    quotedPrice?: number
    rushFee?: number
    notes?: string
    followUpDate?: string
  }
  convertedOrderId?: string | { id: string }
}

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
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  quoted: { label: 'Quoted', color: 'bg-purple-100 text-purple-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  production: { label: 'In Production', color: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800' },
}

const CONTACT_ICONS: Record<string, typeof Mail> = {
  email: Mail,
  phone: Phone,
  text: MessageSquare,
}

const FLEXIBILITY_LABELS: Record<string, string> = {
  flexible: 'Very flexible',
  somewhat: 'Within a week',
  firm: 'Hard deadline',
}

const DELIVERY_LABELS: Record<string, string> = {
  pickup: 'Local Pickup',
  ship: 'Ship to me',
  either: 'Either works',
}

const FONT_LABELS: Record<string, string> = {
  none: 'No preference',
  bold: 'Bold/Block',
  script: 'Script/Cursive',
  playful: 'Fun/Playful',
  elegant: 'Elegant/Formal',
  modern: 'Modern/Clean',
}

export default async function RequestsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const searchQuery = params.q || ''
  const activeTab = params.tab || 'custom'
  const payload = await getPayload({ config })

  // Build where clause for custom requests search
  let customWhereClause: Where | undefined
  if (searchQuery) {
    customWhereClause = {
      or: [
        { customerName: { contains: searchQuery } },
        { customerEmail: { contains: searchQuery } },
      ],
    }
  }

  // Build where clause for contact requests search
  let contactWhereClause: Where | undefined
  if (searchQuery) {
    contactWhereClause = {
      or: [
        { name: { contains: searchQuery } },
        { email: { contains: searchQuery } },
        { subject: { contains: searchQuery } },
      ],
    }
  }

  // Fetch both collections
  const [customRequestsResult, contactRequestsResult] = await Promise.all([
    payload.find({
      collection: 'custom-requests',
      where: customWhereClause,
      sort: '-createdAt',
      limit: 100,
      depth: 2,
    }),
    payload.find({
      collection: 'contact-requests',
      where: contactWhereClause,
      sort: '-createdAt',
      limit: 100,
    }),
  ])

  const customRequests = customRequestsResult.docs as unknown as CustomRequest[]
  const contactRequests = contactRequestsResult.docs as unknown as ContactRequest[]

  const activeCustomRequests = customRequests.filter(
    (r) => !['completed', 'declined'].includes(r.status)
  )
  const completedCustomRequests = customRequests.filter((r) =>
    ['completed', 'declined'].includes(r.status)
  )

  const newContactRequests = contactRequests.filter((r) => r.status === 'new')
  const respondedContactRequests = contactRequests.filter((r) => r.status === 'responded')

  // Count badges
  const customCount = activeCustomRequests.length
  const contactCount = newContactRequests.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage custom button requests and contact messages
          </p>
        </div>
        <div className="w-full sm:w-64">
          <SearchBar placeholder="Search requests..." />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-4" aria-label="Tabs">
          <Link
            href={`/admin/requests?tab=custom${searchQuery ? `&q=${searchQuery}` : ''}`}
            className={`relative py-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'custom'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              Custom Requests
              {customCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                  {customCount}
                </span>
              )}
            </span>
            {activeTab === 'custom' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </Link>
          <Link
            href={`/admin/requests?tab=contact${searchQuery ? `&q=${searchQuery}` : ''}`}
            className={`relative py-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'contact'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              Contact Messages
              {contactCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                  {contactCount}
                </span>
              )}
            </span>
            {activeTab === 'contact' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </Link>
        </nav>
      </div>

      {/* Custom Requests Tab */}
      {activeTab === 'custom' && (
        <>
          {activeCustomRequests.length === 0 && completedCustomRequests.length === 0 ? (
            <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No custom requests yet</h3>
              <p className="text-muted-foreground">
                When customers submit custom button requests, they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Active Requests */}
              {activeCustomRequests.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Active Requests</h2>
                  {activeCustomRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}

              {/* Completed/Declined Requests */}
              {completedCustomRequests.length > 0 && (
                <PastRequestsSection requests={completedCustomRequests} />
              )}
            </>
          )}
        </>
      )}

      {/* Contact Messages Tab */}
      {activeTab === 'contact' && (
        <>
          {contactRequests.length === 0 ? (
            <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No contact messages yet</h3>
              <p className="text-muted-foreground">
                When customers submit the contact form, their messages will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* New Messages */}
              {newContactRequests.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    New Messages ({newContactRequests.length})
                  </h2>
                  {newContactRequests.map((request) => (
                    <ContactRequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}

              {/* Responded Messages */}
              {respondedContactRequests.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-muted-foreground">
                    Responded ({respondedContactRequests.length})
                  </h2>
                  {respondedContactRequests.map((request) => (
                    <ContactRequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function RequestCard({ request, collapsed = false }: { request: CustomRequest; collapsed?: boolean }) {
  const status = STATUS_LABELS[request.status] || STATUS_LABELS.new
  const ContactIcon = CONTACT_ICONS[request.preferredContact] || Mail
  const neededByDate = new Date(request.orderDetails.neededByDate)
  const isOverdue = neededByDate < new Date() && !['completed', 'declined'].includes(request.status)
  const daysUntilDue = Math.ceil((neededByDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  if (collapsed) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 opacity-75">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
            <span className="font-medium text-foreground">{request.customerName}</span>
            <span className="text-muted-foreground text-sm">
              {request.orderDetails.quantity} buttons
            </span>
          </div>
          <span className="text-sm text-muted-foreground/70">
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
          {request.isRush && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Rush
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            Submitted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600' : daysUntilDue <= 7 ? 'text-amber-600' : 'text-muted-foreground'}`}>
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>
            {isOverdue ? 'OVERDUE - ' : ''}
            Needed by {format(neededByDate, 'MMM d, yyyy')}
            {!isOverdue && daysUntilDue <= 7 && ` (${daysUntilDue} days)`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Contact & Design */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Contact
            </h3>
            <div className="space-y-2">
              <p className="font-medium text-foreground text-lg">{request.customerName}</p>
              <div className="flex items-center gap-2 text-foreground/80">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${request.customerEmail}`} className="hover:text-primary">
                  {request.customerEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-foreground/80">
                <Phone className="w-4 h-4" />
                <a href={`tel:${request.customerPhone}`} className="hover:text-primary">
                  {request.customerPhone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ContactIcon className="w-4 h-4" />
                <span>Prefers {request.preferredContact}</span>
              </div>
            </div>
          </div>

          {/* Design Details */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Design Vision
            </h3>
            <p className="text-foreground/90 whitespace-pre-wrap">{request.designDetails.description}</p>
            {request.designDetails.eventType && (
              <div className="flex items-center gap-2 text-foreground/80 mt-3">
                <Calendar className="w-4 h-4" />
                <span>For: {request.designDetails.eventType}</span>
              </div>
            )}
            {request.designDetails.colorPreferences && (
              <div className="flex items-center gap-2 text-foreground/80 mt-2">
                <Palette className="w-4 h-4" />
                <span>Colors: {request.designDetails.colorPreferences}</span>
              </div>
            )}
          </div>

          {/* Text Options */}
          {request.textOptions.wantsText !== 'no' && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Text on Button
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground/80">
                  <Type className="w-4 h-4" />
                  <span>
                    {request.textOptions.wantsText === 'yes'
                      ? 'Has specific text'
                      : 'Needs help with text'}
                  </span>
                </div>
                {request.textOptions.textContent && (
                  <p className="bg-muted rounded-lg p-3 text-foreground/90 italic">
                    &ldquo;{request.textOptions.textContent}&rdquo;
                  </p>
                )}
                {request.textOptions.fontPreference && request.textOptions.fontPreference !== 'none' && (
                  <p className="text-sm text-muted-foreground">
                    Font style: {FONT_LABELS[request.textOptions.fontPreference]}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Images & Order Details */}
        <div className="space-y-6">
          {/* Reference Images */}
          {request.referenceImages && request.referenceImages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                Reference Images ({request.referenceImages.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {request.referenceImages.map((ref, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      <Image
                        src={ref.image.url}
                        alt={ref.description || `Reference ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                        unoptimized
                      />
                    </div>
                    {ref.description && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center p-2">
                        <span className="text-white text-xs text-center">{ref.description}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Details */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Order Details
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground/80">
                  <Package className="w-4 h-4" />
                  <span>Quantity</span>
                </div>
                <span className="font-semibold text-foreground">
                  {request.orderDetails.quantity} buttons
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground/80">
                  <Clock className="w-4 h-4" />
                  <span>Date flexibility</span>
                </div>
                <span className="text-foreground">
                  {FLEXIBILITY_LABELS[request.orderDetails.isFlexibleDate]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground/80">
                  {request.orderDetails.deliveryPreference === 'pickup' ? (
                    <MapPin className="w-4 h-4" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                  <span>Delivery</span>
                </div>
                <span className="text-foreground">
                  {DELIVERY_LABELS[request.orderDetails.deliveryPreference]}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {request.additionalInfo && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Additional Notes
              </h3>
              <p className="text-foreground/80 bg-muted/50 rounded-lg p-3">{request.additionalInfo}</p>
            </div>
          )}

          {/* Admin Notes */}
          {request.adminSection?.notes && (
            <div>
              <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
                Your Notes
              </h3>
              <p className="text-foreground/80 bg-accent/10 border border-accent/20 rounded-lg p-3">
                {request.adminSection.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border/50 bg-muted/50">
        <RequestActions
          requestId={request.id}
          currentStatus={request.status}
          customerEmail={request.customerEmail}
          customerPhone={request.customerPhone}
          quotedPrice={request.adminSection?.quotedPrice}
          convertedOrderId={
            typeof request.convertedOrderId === 'object'
              ? request.convertedOrderId?.id
              : request.convertedOrderId
          }
          deliveryPreference={request.orderDetails.deliveryPreference}
        />
      </div>
    </div>
  )
}
