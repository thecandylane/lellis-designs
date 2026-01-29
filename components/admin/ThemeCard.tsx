'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, Check } from 'lucide-react'
import ColorPicker from './ColorPicker'

type SeasonalTheme = {
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  heroStyle: 'ballpit' | 'gradient' | 'solid'
  description?: string
}

type ThemeCardProps = {
  theme: SeasonalTheme
  index: number
  isActive: boolean
  onUpdate: (index: number, theme: SeasonalTheme) => void
  onDelete: (index: number) => void
}

export default function ThemeCard({ theme, index, isActive, onUpdate, onDelete }: ThemeCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedTheme, setEditedTheme] = useState<SeasonalTheme>(theme)

  const handleSave = () => {
    onUpdate(index, editedTheme)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditedTheme(theme)
    setEditing(false)
  }

  const handleDelete = () => {
    if (confirm(`Delete theme "${theme.name}"?`)) {
      onDelete(index)
    }
  }

  const updateField = <K extends keyof SeasonalTheme>(key: K, value: SeasonalTheme[K]) => {
    setEditedTheme(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={`border-2 rounded-lg overflow-hidden transition-colors ${
      isActive ? 'border-teal-500 bg-teal-50/50' : 'border-gray-200 bg-white'
    }`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Color swatches */}
            <div className="flex gap-1">
              <div
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.primaryColor }}
                title={`Primary: ${theme.primaryColor}`}
              />
              <div
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.secondaryColor }}
                title={`Secondary: ${theme.secondaryColor}`}
              />
              {theme.accentColor && (
                <div
                  className="w-8 h-8 rounded border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.accentColor }}
                  title={`Accent: ${theme.accentColor}`}
                />
              )}
            </div>

            {/* Name and info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {theme.name}
                </h3>
                {isActive && (
                  <span className="px-2 py-0.5 bg-teal-600 text-white text-xs font-medium rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {theme.heroStyle} • {theme.description || 'No description'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!editing && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete theme"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-white space-y-6">
          {editing ? (
            // Edit mode
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Name
                </label>
                <input
                  type="text"
                  value={editedTheme.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="e.g., Christmas, Mardi Gras"
                />
              </div>

              <ColorPicker
                label="Primary Color"
                value={editedTheme.primaryColor}
                onChange={(color) => updateField('primaryColor', color)}
              />

              <ColorPicker
                label="Secondary Color"
                value={editedTheme.secondaryColor}
                onChange={(color) => updateField('secondaryColor', color)}
              />

              <ColorPicker
                label="Accent Color (Optional)"
                value={editedTheme.accentColor || ''}
                onChange={(color) => updateField('accentColor', color || undefined)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hero Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'ballpit', label: 'Ballpit', desc: '3D Animation' },
                    { value: 'gradient', label: 'Gradient', desc: 'Smooth blend' },
                    { value: 'solid', label: 'Solid', desc: 'Single color' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('heroStyle', option.value as SeasonalTheme['heroStyle'])}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        editedTheme.heroStyle === option.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-full h-10 rounded mb-2"
                        style={{
                          background:
                            option.value === 'ballpit'
                              ? `radial-gradient(circle at 30% 30%, ${editedTheme.primaryColor} 10%, transparent 30%), radial-gradient(circle at 70% 60%, ${editedTheme.secondaryColor} 10%, transparent 30%), ${editedTheme.primaryColor}`
                              : option.value === 'gradient'
                                ? `linear-gradient(135deg, ${editedTheme.primaryColor}, ${editedTheme.secondaryColor})`
                                : editedTheme.primaryColor,
                        }}
                      />
                      <p className="font-medium text-xs">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={editedTheme.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                  placeholder="Notes about when to use this theme"
                />
              </div>

              {/* Edit actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            // View mode
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Primary Color</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span className="font-mono text-gray-900">{theme.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500">Secondary Color</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                    <span className="font-mono text-gray-900">{theme.secondaryColor}</span>
                  </div>
                </div>
                {theme.accentColor && (
                  <div>
                    <p className="text-gray-500">Accent Color</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      <span className="font-mono text-gray-900">{theme.accentColor}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Hero Style</p>
                  <p className="text-gray-900 mt-1 capitalize">{theme.heroStyle}</p>
                </div>
              </div>
              {theme.description && (
                <div>
                  <p className="text-gray-500">Description</p>
                  <p className="text-gray-900 mt-1">{theme.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
