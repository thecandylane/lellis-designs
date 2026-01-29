'use client'

import { Plus, Trash2 } from 'lucide-react'
import ImageUpload from './ImageUpload'

type GalleryImage = {
  image: {
    id: string | number
    url: string
    alt?: string
    filename?: string
  } | null
  caption?: string
}

type GalleryManagerProps = {
  images: GalleryImage[]
  onChange: (images: GalleryImage[]) => void
}

export default function GalleryManager({ images, onChange }: GalleryManagerProps) {
  const addImage = () => {
    onChange([...images, { image: null, caption: '' }])
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const updateImage = (index: number, mediaId: string | null) => {
    const newImages = [...images]
    if (mediaId) {
      // Keep the current image object structure, just update the ID
      // The actual media data will be populated on save/reload
      newImages[index] = {
        ...newImages[index],
        image: { id: mediaId, url: '', alt: '' },
      }
    } else {
      newImages[index] = { ...newImages[index], image: null }
    }
    onChange(newImages)
  }

  const updateCaption = (index: number, caption: string) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], caption }
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Gallery Images
        </label>
        <button
          type="button"
          onClick={addImage}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Image
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Showcase your work, events, and happy customers
      </p>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-3">No gallery images yet</p>
          <button
            type="button"
            onClick={addImage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Image
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {images.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Image {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <ImageUpload
                  value={item.image}
                  onChange={(mediaId) => updateImage(index, mediaId)}
                  label="Image"
                  description="Upload a photo for the gallery"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={item.caption || ''}
                    onChange={(e) => updateCaption(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Describe this photo"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <button
          type="button"
          onClick={addImage}
          className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 rounded-lg font-medium transition-colors"
        >
          + Add Another Image
        </button>
      )}
    </div>
  )
}
