import type { CollectionConfig } from 'payload'

export const Buttons: CollectionConfig = {
  slug: 'buttons',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'active', 'updatedAt'],
  },
  access: {
    read: () => true, // Public read access
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: false, // Allow uncategorized buttons for flexibility
      hasMany: false,
      admin: {
        description: 'Category for this button. Leave empty for uncategorized.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      maxRows: 20,
      admin: {
        description: 'Additional tags for search (e.g., "gameday", "tailgate", "school spirit")',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      admin: {
        description: 'Optional price override. Leave empty to use the global price from site settings.',
      },
    },
    {
      name: 'leadTimeDays',
      type: 'number',
      defaultValue: 7,
      min: 0,
      admin: {
        description: 'Lead time in days for production',
      },
    },
    {
      name: 'customization',
      type: 'select',
      defaultValue: 'as_is',
      options: [
        { label: 'Sold as-is', value: 'as_is' },
        { label: 'Customizable', value: 'customizable' },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show this button prominently in its category',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order within category (lower numbers appear first)',
      },
    },
    {
      name: 'sku',
      type: 'text',
      unique: true,
      admin: {
        description: 'Optional SKU for inventory tracking',
      },
    },
  ],
}
