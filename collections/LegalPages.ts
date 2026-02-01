import { CollectionConfig } from 'payload'

export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug (e.g., "terms", "privacy")',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'lastUpdated',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'Last updated date shown to users',
      },
    },
    {
      name: 'icon',
      type: 'select',
      options: [
        { label: 'File Text', value: 'file-text' },
        { label: 'Shield', value: 'shield' },
        { label: 'Scale', value: 'scale' },
      ],
      defaultValue: 'file-text',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Legal document content with full formatting',
      },
    },
    {
      name: 'sections',
      type: 'array',
      admin: {
        description: 'Optional: structured sections for organization',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
      ],
    },
  ],
}
