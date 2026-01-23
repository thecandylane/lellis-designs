export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  tags: { tag: string }[] | null
  aliases: { alias: string }[] | null
  parent_id: string | null
  sort_order: number
  active: boolean
  featured: boolean
  color_primary: string | null    // Hex color for primary (e.g., "#6B2D5B" for purple)
  color_secondary: string | null  // Hex color for secondary/accent
  background_image: string | null // URL to background image for category page
}

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[]
}

export type CategoryWithAncestors = Category & {
  ancestors: Category[]
}

export type BreadcrumbItem = {
  name: string
  href: string
}

export type Button = {
  id: string
  category_id: string | null
  name: string
  description: string | null
  tags: { tag: string }[] | null
  image_url: string
  price: number
  lead_time_days: number
  customization: 'as_is' | 'customizable'
  active: boolean
  featured: boolean
  sku: string | null
}

export type CartItem = {
  buttonId: string
  name: string
  imageUrl: string
  price: number
  quantity: number
  personName?: string
  personNumber?: string
  notes?: string
}

export type Order = {
  id: string
  stripe_session_id: string | null
  customer_email: string
  customer_name: string | null
  customer_phone: string | null
  shipping_method: 'pickup' | 'ups' | null
  shipping_address: Record<string, unknown> | null
  shipping_cost: number
  needed_by_date: string | null
  production_deadline: string | null
  subtotal: number
  total: number
  items: CartItem[]
  status: 'pending' | 'paid' | 'production' | 'ready' | 'shipped' | 'completed'
  notes: string | null
  ambassador_code?: string | null  // Optional - add column if using ambassadors
  created_at: string
}

export type Ambassador = {
  id: string
  name: string
  code: string
  email: string | null
  active: boolean
  created_at: string
}

export type CustomRequest = {
  id: string
  customer_email: string
  customer_name: string
  customer_phone: string | null
  description: string
  quantity: number
  needed_by_date: string
  event_type: string | null
  reference_images: string[] | null
  status: 'new' | 'quoted' | 'approved' | 'declined'
  quoted_price: number | null
  notes: string | null
  created_at: string
}

// Keep ContactRequest for simpler contact form if needed
export type ContactRequest = {
  id: string
  name: string
  email: string
  message: string
  status: 'new' | 'responded'
  created_at: string
}
