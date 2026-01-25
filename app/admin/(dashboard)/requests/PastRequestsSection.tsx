'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import RequestActions from './RequestActions'

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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  quoted: { label: 'Quoted', color: 'bg-purple-100 text-purple-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  production: { label: 'In Production', color: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800' },
}

const FONT_LABELS: Record<string, string> = {
  none: 'No preference',
  bold: 'Bold/Block',
  script: 'Script/Cursive',
  playful: 'Fun/Playful',
  elegant: 'Elegant/Formal',
  modern: 'Modern/Clean',
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

type PastRequestsSectionProps = {
  requests: CustomRequest[]
}

export default function PastRequestsSection({ requests }: PastRequestsSectionProps) {
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())

  const toggleRequest = (id: string) => {
    setExpandedRequests((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (requests.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-muted-foreground">Past Requests</h2>
      {requests.map((request) => {
        const isExpanded = expandedRequests.has(request.id)
        const status = STATUS_LABELS[request.status] || STATUS_LABELS.new

        return (
          <div
            key={request.id}
            className="bg-card rounded-xl shadow-sm border border-border overflow-hidden"
          >
            {/* Collapsed Header - Always visible, clickable */}
            <div
              onClick={() => toggleRequest(request.id)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
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

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-border">
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
                        <p className="text-foreground/80">
                          <a href={`mailto:${request.customerEmail}`} className="hover:text-primary">
                            {request.customerEmail}
                          </a>
                        </p>
                        <p className="text-foreground/80">
                          <a href={`tel:${request.customerPhone}`} className="hover:text-primary">
                            {request.customerPhone}
                          </a>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Prefers {request.preferredContact}
                        </p>
                      </div>
                    </div>

                    {/* Design Details */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Design Vision
                      </h3>
                      <p className="text-foreground/90 whitespace-pre-wrap">
                        {request.designDetails.description}
                      </p>
                      {request.designDetails.eventType && (
                        <p className="text-foreground/80 mt-3">
                          For: {request.designDetails.eventType}
                        </p>
                      )}
                      {request.designDetails.colorPreferences && (
                        <p className="text-foreground/80 mt-2">
                          Colors: {request.designDetails.colorPreferences}
                        </p>
                      )}
                    </div>

                    {/* Text Options */}
                    {request.textOptions.wantsText !== 'no' && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Text on Button
                        </h3>
                        <div className="space-y-2">
                          <p className="text-foreground/80">
                            {request.textOptions.wantsText === 'yes'
                              ? 'Has specific text'
                              : 'Needs help with text'}
                          </p>
                          {request.textOptions.textContent && (
                            <p className="bg-muted rounded-lg p-3 text-foreground/90 italic">
                              &ldquo;{request.textOptions.textContent}&rdquo;
                            </p>
                          )}
                          {request.textOptions.fontPreference &&
                            request.textOptions.fontPreference !== 'none' && (
                              <p className="text-sm text-muted-foreground">
                                Font style: {FONT_LABELS[request.textOptions.fontPreference]}
                              </p>
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Order Details */}
                  <div className="space-y-6">
                    {/* Order Details */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Order Details
                      </h3>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/80">Quantity</span>
                          <span className="font-semibold text-foreground">
                            {request.orderDetails.quantity} buttons
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/80">Date flexibility</span>
                          <span className="text-foreground">
                            {FLEXIBILITY_LABELS[request.orderDetails.isFlexibleDate]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/80">Delivery</span>
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
                        <p className="text-foreground/80 bg-muted/50 rounded-lg p-3">
                          {request.additionalInfo}
                        </p>
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

                    {/* Quoted Price */}
                    {request.adminSection?.quotedPrice && (
                      <div className="text-sm">
                        <span className="font-medium">Quoted:</span> $
                        {request.adminSection.quotedPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions for Past Requests */}
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
                    isPastRequest={true}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
