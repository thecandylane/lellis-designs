'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Upload, X, Check, AlertCircle, Loader2 } from 'lucide-react'

type CategoryOption = {
  id: string
  name: string
  depth: number
}

type CategoryWithChildren = {
  id: string
  name: string
  children?: CategoryWithChildren[]
}

type PendingButton = {
  id: string
  file: File
  name: string
  preview: string
}

type UploadResult = {
  success: boolean
  name: string
  error?: string
}

// Convert filename to readable name
function filenameToName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ')   // Replace dashes/underscores with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()) // Title case
    .trim()
}

export default function BulkUploadPage() {
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [pendingButtons, setPendingButtons] = useState<PendingButton[]>([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<UploadResult[] | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch categories on mount
  useState(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.docs) {
          // Build flat list with depth indicator
          const flatList: CategoryOption[] = []
          const buildList = (cats: CategoryWithChildren[], depth = 0) => {
            for (const cat of cats) {
              flatList.push({ id: cat.id, name: cat.name, depth })
              if (cat.children?.length) {
                buildList(cat.children, depth + 1)
              }
            }
          }
          buildList(data.docs)
          setCategories(flatList)
        }
      })
      .catch(console.error)
  })

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newButtons: PendingButton[] = []
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) continue

      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const preview = URL.createObjectURL(file)
      const name = filenameToName(file.name)

      newButtons.push({ id, file, name, preview })
    }

    setPendingButtons((prev) => [...prev, ...newButtons])
    setResults(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      if (e.dataTransfer.files?.length) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const updateButtonName = (id: string, newName: string) => {
    setPendingButtons((prev) =>
      prev.map((btn) => (btn.id === id ? { ...btn, name: newName } : btn))
    )
  }

  const removeButton = (id: string) => {
    setPendingButtons((prev) => {
      const removed = prev.find((btn) => btn.id === id)
      if (removed) URL.revokeObjectURL(removed.preview)
      return prev.filter((btn) => btn.id !== id)
    })
  }

  const handleUpload = async () => {
    if (pendingButtons.length === 0) return

    setUploading(true)
    setResults(null)

    try {
      const formData = new FormData()

      // Add button metadata
      const buttonsData = pendingButtons.map((btn) => ({
        name: btn.name,
        filename: btn.file.name,
        categoryId: selectedCategory || null,
      }))
      formData.append('buttons', JSON.stringify(buttonsData))

      // Add files
      for (const btn of pendingButtons) {
        formData.append(`file-${btn.file.name}`, btn.file)
      }

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResults(data.results)

      // Clear successful uploads
      const successNames = data.results
        .filter((r: UploadResult) => r.success)
        .map((r: UploadResult) => r.name)

      setPendingButtons((prev) =>
        prev.filter((btn) => !successNames.includes(btn.name))
      )
    } catch (error) {
      console.error('Upload error:', error)
      setResults([
        {
          success: false,
          name: 'All',
          error: error instanceof Error ? error.message : 'Upload failed',
        },
      ])
    } finally {
      setUploading(false)
    }
  }

  const clearAll = () => {
    pendingButtons.forEach((btn) => URL.revokeObjectURL(btn.preview))
    setPendingButtons([])
    setResults(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Buttons</h1>
        <p className="text-gray-600 mt-1">
          Drag and drop multiple button images to upload them all at once
        </p>
      </div>

      {/* Category Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category (optional)
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">No category (uncategorized)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {'  '.repeat(cat.depth)}
              {cat.depth > 0 ? '└ ' : ''}
              {cat.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">
          All uploaded buttons will be added to this category
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`bg-white rounded-lg shadow p-8 mb-6 border-2 border-dashed transition-colors ${
          dragActive
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload
            className={`w-12 h-12 mx-auto mb-4 ${
              dragActive ? 'text-teal-500' : 'text-gray-400'
            }`}
          />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {dragActive ? 'Drop images here!' : 'Drag & drop button images here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">PNG, JPG, or WEBP images</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Pending Buttons Preview */}
      {pendingButtons.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Ready to Upload ({pendingButtons.length} buttons)
            </h2>
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pendingButtons.map((btn) => (
              <div
                key={btn.id}
                className="relative bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <button
                  onClick={() => removeButton(btn.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-white">
                  <Image
                    src={btn.preview}
                    alt={btn.name}
                    fill
                    className="object-contain"
                  />
                </div>

                <input
                  type="text"
                  value={btn.name}
                  onChange={(e) => updateButtonName(btn.id, e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Button name"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading || pendingButtons.length === 0}
              className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload {pendingButtons.length} Button{pendingButtons.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {results && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Results
          </h2>
          <div className="space-y-2">
            {results.map((result, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  result.success ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {result.success ? (
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span
                  className={
                    result.success ? 'text-green-700' : 'text-red-700'
                  }
                >
                  <strong>{result.name}</strong>
                  {result.success ? ' - Created successfully' : ` - ${result.error}`}
                </span>
              </div>
            ))}
          </div>

          {results.every((r) => r.success) && (
            <div className="mt-4 p-4 bg-teal-50 rounded-lg">
              <p className="text-teal-700 font-medium">
                All buttons uploaded successfully!
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => {
                    setResults(null)
                    setPendingButtons([])
                  }}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Upload More Buttons
                </button>
                <Link
                  href="/admin/dashboard"
                  className="bg-white text-teal-700 border border-teal-300 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {pendingButtons.length === 0 && !results && (
        <div className="text-center py-12 text-gray-500">
          <p>No images selected yet. Drag and drop or browse to get started!</p>
        </div>
      )}
    </div>
  )
}
