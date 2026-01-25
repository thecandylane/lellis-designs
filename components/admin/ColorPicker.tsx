'use client'

import { useState, useRef } from 'react'
import { Copy, Check } from 'lucide-react'

type ColorPickerProps = {
  value: string
  onChange: (color: string) => void
  label?: string
}

const presets = [
  { name: 'Teal', color: '#14B8A6' },
  { name: 'Pink', color: '#EC4899' },
  { name: 'Lime', color: '#84CC16' },
  { name: 'Purple (LSU)', color: '#461D7C' },
  { name: 'Gold (LSU)', color: '#FDD023' },
  { name: 'White', color: '#FFFFFF' },
  { name: 'Black', color: '#000000' },
  { name: 'Gray', color: '#6B7280' },
]

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isValidHex = (hex: string) => /^#[0-9A-Fa-f]{6}$/.test(hex)

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value
    // Auto-add # if missing
    if (hex && !hex.startsWith('#')) {
      hex = '#' + hex
    }
    // Uppercase for consistency
    hex = hex.toUpperCase()
    onChange(hex)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openColorPicker = () => {
    inputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Main color display and inputs */}
      <div className="flex items-center gap-3">
        {/* Color swatch (clickable) */}
        <button
          type="button"
          onClick={openColorPicker}
          className="relative w-14 h-14 rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
          style={{ backgroundColor: isValidHex(value) ? value : '#FFFFFF' }}
          title="Click to pick color"
        >
          {/* Hidden native color input */}
          <input
            ref={inputRef}
            type="color"
            value={isValidHex(value) ? value : '#FFFFFF'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          {/* Checkered background for light colors */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage: `repeating-conic-gradient(#E5E7EB 0% 25%, transparent 0% 50%)`,
              backgroundSize: '8px 8px',
            }}
          />
        </button>

        {/* Hex input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={handleHexChange}
            placeholder="#000000"
            maxLength={7}
            className={`w-full px-3 py-2.5 border rounded-lg font-mono text-sm uppercase ${
              value && !isValidHex(value)
                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                : 'border-gray-300 focus:ring-teal-500/20 focus:border-teal-500'
            } focus:ring-2 transition-colors`}
          />
          {value && !isValidHex(value) && (
            <p className="absolute -bottom-5 left-0 text-xs text-red-500">
              Enter a valid hex color (e.g., #14B8A6)
            </p>
          )}
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!isValidHex(value)}
          className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <Copy className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.color}
            type="button"
            onClick={() => onChange(preset.color)}
            className={`group relative w-8 h-8 rounded-md border-2 transition-all ${
              value === preset.color
                ? 'border-teal-500 ring-2 ring-teal-500/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ backgroundColor: preset.color }}
            title={preset.name}
          >
            {/* Checkered background for white */}
            {preset.color === '#FFFFFF' && (
              <div
                className="absolute inset-0 rounded-md -z-10"
                style={{
                  backgroundImage: `repeating-conic-gradient(#E5E7EB 0% 25%, transparent 0% 50%)`,
                  backgroundSize: '6px 6px',
                }}
              />
            )}
            {/* Selection indicator */}
            {value === preset.color && (
              <Check
                className={`w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                  ['#FFFFFF', '#FDD023', '#84CC16'].includes(preset.color)
                    ? 'text-gray-800'
                    : 'text-white'
                }`}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
