'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Upload, Loader2 } from 'lucide-react'
import { usePricing } from '@/lib/usePricing'

type Category = {
  id: string
  name: string
  parent?: { id: string } | string | null
}

type Props = {
  categories: Category[]
}

export default function AddButtonForm({ categories }: Props) {
  const router = useRouter()
  const { pricing } = usePricing()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: String(pricing.singlePrice),
    categoryId: '',
  })

  useEffect(() => {
    setFormData(prev => ({ ...prev, price: String(pricing.singlePrice) }))
  }, [pricing.singlePrice])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      alert('Please select an image')
      return
    }

    setLoading(true)

    try {
      const uploadData = new FormData()
      uploadData.append('buttons', JSON.stringify([{
        name: formData.name,
        filename: file.name,
        categoryId: formData.categoryId || null,
      }]))
      uploadData.append(`file-${file.name}`, file)

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: uploadData,
      })

      if (!response.ok) throw new Error('Failed to upload')

      const result = await response.json()

      if (result.results?.[0]?.success) {
        // If we have additional fields like description and custom price, update the button
        // For now, the bulk upload creates with default price
        // We'd need to update after creation if price differs

        setShowModal(false)
        setFormData({ name: '', description: '', price: String(pricing.singlePrice), categoryId: '' })
        setFile(null)
        setPreview(null)
        router.refresh()
      } else {
        alert('Failed to create button: ' + (result.results?.[0]?.error || 'Unknown error'))
      }
    } catch (err) {
      console.error(err)
      alert('Failed to create button')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', price: String(pricing.singlePrice), categoryId: '' })
    setFile(null)
    setPreview(null)
    setShowModal(false)
  }

  // Build category tree for hierarchical display
  const getCategoryLabel = (cat: Category): string => {
    const parentId = typeof cat.parent === 'object' ? cat.parent?.id : cat.parent
    if (parentId) {
      const parent = categories.find(c => c.id === parentId)
      if (parent) {
        return `${parent.name} > ${cat.name}`
      }
    }
    return cat.name
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors min-h-[44px]"
      >
        <Plus className="w-5 h-5" />
        Add Button
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Button</h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Image *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                    preview ? 'border-primary' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-40 object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                          setPreview(null)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload image</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Purple Tiger Stripe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Optional description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !file || !formData.name}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Button
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
