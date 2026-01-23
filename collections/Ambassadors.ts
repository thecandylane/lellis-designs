import type { CollectionConfig } from 'payload'

export const Ambassadors: CollectionConfig = {
  slug: 'ambassadors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'email', 'active', 'createdAt'],
  },
  access: {
    read: () => true, // Allow public read for code validation
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique referral code (e.g., "JANE2024")',
      },
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
