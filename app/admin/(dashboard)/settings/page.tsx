'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import ColorPicker from '@/components/admin/ColorPicker'

type Tab = 'business' | 'colors' | 'appearance' | 'pricing'

type SiteSettings = {
  // Business Info
  businessName: string
  tagline: string
  pickupAddress: string
  // Brand Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  // Appearance
  heroStyle: 'ballpit' | 'gradient' | 'solid'
  cardStyle: 'shadow' | 'border' | 'flat'
  buttonStyle: 'rounded' | 'pill' | 'square'
  animationIntensity: 'none' | 'subtle' | 'full'
  // Pricing
  singlePrice: number
  tier1Price: number
  tier1Threshold: number
  tier2Price: number
  tier2Threshold: number
  shippingCost: number
}

const defaultSettings: SiteSettings = {
  businessName: '',
  tagline: '',
  pickupAddress: '',
  primaryColor: '#14B8A6',
  secondaryColor: '#EC4899',
  accentColor: '#84CC16',
  heroStyle: 'ballpit',
  cardStyle: 'shadow',
  buttonStyle: 'rounded',
  animationIntensity: 'full',
  singlePrice: 5,
  tier1Price: 4.5,
  tier1Threshold: 100,
  tier2Price: 4,
  tier2Threshold: 200,
  shippingCost: 8,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState<Tab>('business')
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
        setSettings({ ...defaultSettings, ...data })
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
        const data = await response.json()
        throw new Error(data.error || 'Failed to save settings')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(error instanceof Error ? error.message : 'Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'business', label: 'Business Info' },
    { id: 'colors', label: 'Brand Colors' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'pricing', label: 'Pricing' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your store configuration</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Business Info Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => updateSettings('businessName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  placeholder="L. Ellis Designs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => updateSettings('tagline', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  placeholder="Custom 3&quot; Buttons for Every Occasion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Pickup Address
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  This address is sent to customers when their pickup order is ready.
                </p>
                <textarea
                  value={settings.pickupAddress}
                  onChange={(e) => updateSettings('pickupAddress', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors resize-none"
                  placeholder="123 Main Street&#10;Baton Rouge, LA 70801"
                />
              </div>
            </div>
          )}

          {/* Brand Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-8">
              {/* Live Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Live Preview
                </label>
                <div
                  className="h-24 rounded-lg flex items-center justify-center gap-3"
                  style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 50%, ${settings.accentColor} 100%)`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                    style={{ backgroundColor: settings.primaryColor }}
                    title="Primary"
                  />
                  <div
                    className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                    style={{ backgroundColor: settings.secondaryColor }}
                    title="Secondary"
                  />
                  <div
                    className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                    style={{ backgroundColor: settings.accentColor }}
                    title="Accent"
                  />
                </div>
              </div>

              <ColorPicker
                label="Primary Color"
                value={settings.primaryColor}
                onChange={(color) => updateSettings('primaryColor', color)}
              />

              <ColorPicker
                label="Secondary Color"
                value={settings.secondaryColor}
                onChange={(color) => updateSettings('secondaryColor', color)}
              />

              <ColorPicker
                label="Accent Color"
                value={settings.accentColor}
                onChange={(color) => updateSettings('accentColor', color)}
              />
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-8">
              {/* Hero Style */}
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
                      onClick={() => updateSettings('heroStyle', option.value as SiteSettings['heroStyle'])}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        settings.heroStyle === option.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-full h-12 rounded mb-2"
                        style={{
                          background:
                            option.value === 'ballpit'
                              ? `radial-gradient(circle at 30% 30%, ${settings.primaryColor} 10%, transparent 30%), radial-gradient(circle at 70% 60%, ${settings.secondaryColor} 10%, transparent 30%), ${settings.primaryColor}`
                              : option.value === 'gradient'
                                ? `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`
                                : settings.primaryColor,
                        }}
                      />
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Card Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'shadow', label: 'Shadow', desc: 'Elevated look' },
                    { value: 'border', label: 'Border', desc: 'Outlined' },
                    { value: 'flat', label: 'Flat', desc: 'Minimal' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateSettings('cardStyle', option.value as SiteSettings['cardStyle'])}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        settings.cardStyle === option.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-full h-12 rounded bg-white mb-2 ${
                          option.value === 'shadow'
                            ? 'shadow-md'
                            : option.value === 'border'
                              ? 'border-2 border-gray-300'
                              : 'bg-gray-100'
                        }`}
                      />
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Button Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'rounded', label: 'Rounded', radius: 'rounded-lg' },
                    { value: 'pill', label: 'Pill', radius: 'rounded-full' },
                    { value: 'square', label: 'Square', radius: 'rounded-none' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateSettings('buttonStyle', option.value as SiteSettings['buttonStyle'])}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        settings.buttonStyle === option.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <div
                          className={`px-4 py-2 text-white text-sm ${option.radius}`}
                          style={{ backgroundColor: settings.primaryColor }}
                        >
                          Button
                        </div>
                      </div>
                      <p className="font-medium text-sm text-center">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Intensity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Animation Intensity
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'none', label: 'None', desc: 'Accessibility' },
                    { value: 'subtle', label: 'Subtle', desc: 'Reduced motion' },
                    { value: 'full', label: 'Full', desc: 'All animations' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateSettings('animationIntensity', option.value as SiteSettings['animationIntensity'])}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        settings.animationIntensity === option.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-12 flex items-center justify-center mb-2">
                        <div
                          className={`w-6 h-6 rounded-full ${
                            option.value === 'full'
                              ? 'animate-bounce'
                              : option.value === 'subtle'
                                ? 'animate-pulse'
                                : ''
                          }`}
                          style={{ backgroundColor: settings.primaryColor }}
                        />
                      </div>
                      <p className="font-medium text-sm text-center">{option.label}</p>
                      <p className="text-xs text-gray-500 text-center">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">
                Configure button pricing tiers and shipping costs.
              </p>

              {/* Single Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Single Button Price
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Price per button for orders under Tier 1 threshold
                </p>
                <div className="relative w-40">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.singlePrice}
                    onChange={(e) => updateSettings('singlePrice', parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Tier 1 */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <h3 className="font-medium text-gray-900">Tier 1 Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settings.tier1Threshold}
                      onChange={(e) => updateSettings('tier1Threshold', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Button
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings.tier1Price}
                        onChange={(e) => updateSettings('tier1Price', parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tier 2 */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <h3 className="font-medium text-gray-900">Tier 2 Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settings.tier2Threshold}
                      onChange={(e) => updateSettings('tier2Threshold', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Button
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings.tier2Price}
                        onChange={(e) => updateSettings('tier2Price', parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flat Rate Shipping
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  UPS shipping cost for all shipped orders
                </p>
                <div className="relative w-40">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.shippingCost}
                    onChange={(e) => updateSettings('shippingCost', parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Pricing Preview */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Pricing Preview</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>1-{settings.tier1Threshold - 1} buttons: ${settings.singlePrice.toFixed(2)} each</p>
                  <p>{settings.tier1Threshold}-{settings.tier2Threshold - 1} buttons: ${settings.tier1Price.toFixed(2)} each</p>
                  <p>{settings.tier2Threshold}+ buttons: ${settings.tier2Price.toFixed(2)} each</p>
                  <p className="pt-2 border-t border-gray-200 mt-2">Shipping: ${settings.shippingCost.toFixed(2)} flat rate</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
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
