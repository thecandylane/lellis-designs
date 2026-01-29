'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

type MediaValue = {
  id: string | number
  url: string
  alt?: string
  filename?: string
} | null

type ImageUploadProps = {
  value?: MediaValue
  onChange: (mediaId: string | null) => void
  label: string
  description?: string
  accept?: string
  maxSize?: number // in MB
}

export default function ImageUpload({
  value,
  onChange,
  label,
  description,
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
  maxSize = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = accept.split(',').map(t => t.trim())
    if (!acceptedTypes.some(type => file.type.match(type.replace('*', '.*')))) {
      return `Invalid file type. Accepted: ${accept}`
    }

    // Check file size
    const maxBytes = maxSize * 1024 * 1024
    if (file.size > maxBytes) {
      return `File too large. Maximum size: ${maxSize}MB`
    }

    return null
  }

  const uploadFile = async (file: File) => {
    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      onChange(data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    await uploadFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    await uploadFile(file)
  }

  const handleRemove = () => {
    onChange(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {value ? (
        // Preview with image
        <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <div className="aspect-video relative">
            <img
              src={value.url}
              alt={value.alt || 'Uploaded image'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 truncate">
                {value.filename || 'Image uploaded'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // Upload area
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP up to {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
