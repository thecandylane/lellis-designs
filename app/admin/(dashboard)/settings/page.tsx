'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type SiteSettings = {
  businessName: string
  tagline: string
  pickupAddress: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    businessName: '',
    tagline: '',
    pickupAddress: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          businessName: data.businessName || '',
          tagline: data.tagline || '',
          pickupAddress: data.pickupAddress || '',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your business information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
              placeholder="L. Ellis Designs"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
              placeholder="Custom 3&quot; Buttons for Every Occasion"
            />
          </div>

          {/* Pickup Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Pickup Address
            </label>
            <p className="text-sm text-gray-500 mb-2">
              This address is sent to customers when their pickup order is ready.
            </p>
            <textarea
              value={settings.pickupAddress}
              onChange={(e) => setSettings({ ...settings, pickupAddress: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors resize-none"
              placeholder="123 Main Street&#10;Baton Rouge, LA 70801"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Link
            href="/admin/globals/site-settings"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 transition-colors min-h-[44px]"
          >
            <ExternalLink className="w-4 h-4" />
            Advanced Settings
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
