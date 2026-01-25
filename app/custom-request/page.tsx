'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Clock,
  Palette,
  Type,
  Image as ImageIcon,
  Package,
  User,
  Send,
} from 'lucide-react'

type ImageUpload = {
  file: File
  preview: string
  description: string
}

export default function CustomRequestPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    preferredContact: 'email',
    description: '',
    eventType: '',
    colorPreferences: '',
    wantsText: 'no',
    textContent: '',
    fontPreference: 'none',
    quantity: '',
    neededByDate: '',
    isFlexibleDate: 'somewhat',
    deliveryPreference: 'either',
    additionalInfo: '',
    isRush: false,
  })

  const [images, setImages] = useState<ImageUpload[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = 10 - images.length

    if (files.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more image(s)`)
      return
    }

    const newImages: ImageUpload[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      description: '',
    }))

    setImages((prev) => [...prev, ...newImages])
    setError('')

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const updateImageDescription = (index: number, description: string) => {
    setImages((prev) => {
      const newImages = [...prev]
      newImages[index].description = description
      return newImages
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const submitData = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, String(value))
      })

      // Add images
      images.forEach((img) => {
        submitData.append('images', img.file)
        submitData.append('imageDescriptions', img.description)
      })

      const response = await fetch('/api/custom-request', {
        method: 'POST',
        body: submitData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // Check if date is less than 7 days away
  const isRushDate = () => {
    if (!formData.neededByDate) return false
    const selectedDate = new Date(formData.neededByDate)
    const today = new Date()
    const diffDays = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays < 7
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-glow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-3">Request Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your custom button request! We&apos;ll review your details and get back to
            you within 24-48 hours with a quote.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Back to Shop
            </Link>
            <button
              onClick={() => {
                setSubmitted(false)
                setFormData({
                  customerName: '',
                  customerEmail: '',
                  customerPhone: '',
                  preferredContact: 'email',
                  description: '',
                  eventType: '',
                  colorPreferences: '',
                  wantsText: 'no',
                  textContent: '',
                  fontPreference: 'none',
                  quantity: '',
                  neededByDate: '',
                  isFlexibleDate: 'somewhat',
                  deliveryPreference: 'either',
                  additionalInfo: '',
                  isRush: false,
                })
                setImages([])
              }}
              className="block w-full text-muted-foreground py-3 px-4 rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-glow">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Custom Button Request</h1>
            <p className="text-sm text-muted-foreground">Tell us exactly what you need</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact Information */}
          <section className="bg-card rounded-xl shadow-md border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Contact Information</h2>
                <p className="text-xs text-muted-foreground">How can we reach you?</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Preferred Contact Method
                </label>
                <select
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="text">Text Message</option>
                </select>
              </div>
            </div>
          </section>

          {/* Design Details */}
          <section className="bg-card rounded-xl shadow-md border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Design Details</h2>
                <p className="text-xs text-muted-foreground">Tell us about your vision</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Describe Your Button Design <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  placeholder="Describe what you're looking for in as much detail as possible. What's the theme? What should it look like? Any specific elements you want included?"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    What&apos;s the Occasion?
                  </label>
                  <input
                    type="text"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Wedding, Graduation, Birthday..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Color Preferences
                  </label>
                  <input
                    type="text"
                    name="colorPreferences"
                    value={formData.colorPreferences}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Purple and gold, pastels, etc."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Text Options */}
          <section className="bg-card rounded-xl shadow-md border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <Type className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Text on Button</h2>
                <p className="text-xs text-muted-foreground">Do you want text on your button?</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Include Text?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'no', label: 'No text needed' },
                    { value: 'yes', label: 'Yes, I have text' },
                    { value: 'help', label: 'Help me decide' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.wantsText === option.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="wantsText"
                        value={option.value}
                        checked={formData.wantsText === option.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-center">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.wantsText !== 'no' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {formData.wantsText === 'yes' ? 'What text do you want?' : 'What are you thinking?'}
                    </label>
                    <textarea
                      name="textContent"
                      value={formData.textContent}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                      placeholder={formData.wantsText === 'yes'
                        ? "Enter the exact text you want on the button"
                        : "Describe what kind of message or phrase you're looking for"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Font Style Preference
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        { value: 'none', label: 'No preference' },
                        { value: 'bold', label: 'Bold/Block' },
                        { value: 'script', label: 'Script/Cursive' },
                        { value: 'playful', label: 'Fun/Playful' },
                        { value: 'elegant', label: 'Elegant/Formal' },
                        { value: 'modern', label: 'Modern/Clean' },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center justify-center p-2.5 border rounded-lg cursor-pointer transition-all ${
                            formData.fontPreference === option.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="fontPreference"
                            value={option.value}
                            checked={formData.fontPreference === option.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Reference Images */}
          <section className="bg-card rounded-xl shadow-md border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Reference Images & Logos</h2>
                <p className="text-xs text-muted-foreground">
                  Upload logos, inspiration, or any visuals (max 10)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
                        <img
                          src={img.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        value={img.description}
                        onChange={(e) => updateImageDescription(index, e.target.value)}
                        placeholder="What's this? (optional)"
                        className="mt-2 w-full px-2 py-1.5 text-xs border border-border rounded focus:ring-1 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              )}

              {images.length < 10 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-medium">Click to upload</span> or drag and
                    drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB each</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </section>

          {/* Order Details */}
          <section className="bg-card rounded-xl shadow-md border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Order Details</h2>
                <p className="text-xs text-muted-foreground">Quantity and timeline</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    How Many Buttons? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="5"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Minimum 5 buttons"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    When Do You Need Them? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="neededByDate"
                    value={formData.neededByDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {isRushDate() && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      This is a rush order (less than 7 days)
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Rush orders may include an additional fee depending on complexity. We&apos;ll
                      include this in your quote.
                    </p>
                    <label className="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        name="isRush"
                        checked={formData.isRush}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <span className="text-sm text-amber-800">
                        I understand this may be a rush order
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Is this date flexible?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'flexible', label: 'Very flexible' },
                    { value: 'somewhat', label: 'Within a week' },
                    { value: 'firm', label: 'Hard deadline' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.isFlexibleDate === option.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="isFlexibleDate"
                        value={option.value}
                        checked={formData.isFlexibleDate === option.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Delivery Preference
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'pickup', label: 'Local Pickup' },
                    { value: 'ship', label: 'Ship to Me' },
                    { value: 'either', label: 'Either Works' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.deliveryPreference === option.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryPreference"
                        value={option.value}
                        checked={formData.deliveryPreference === option.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Additional Info */}
          <section className="bg-card rounded-xl shadow-md border border-border p-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Anything Else We Should Know?
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                placeholder="Special requests, questions, or any other details..."
              />
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Request
              </>
            )}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            We&apos;ll review your request and get back to you within 24-48 hours with a quote.
          </p>
        </form>
      </main>
    </div>
  )
}
