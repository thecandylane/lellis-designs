import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent', 'active', 'sortOrder'],
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
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier (e.g., "lsu", "baton-rouge")',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description for search results and SEO',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Keywords for search and filtering (e.g., "football", "greek life", "sorority")',
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
      name: 'aliases',
      type: 'array',
      admin: {
        description: 'Alternative names or abbreviations (e.g., "Chi Omega" could have alias "Chi-O")',
      },
      fields: [
        {
          name: 'alias',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      admin: {
        description: 'Parent category (leave empty for root categories)',
      },
    },
    {
      name: 'colorPrimary',
      type: 'text',
      admin: {
        description: 'Primary color (hex, e.g., #461D7C)',
      },
    },
    {
      name: 'colorSecondary',
      type: 'text',
      admin: {
        description: 'Secondary/accent color (hex, e.g., #FDD023)',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional background image for category page header',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order within parent (lower numbers appear first)',
      },
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
        description: 'Show this category prominently on the homepage',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        // Validate unique slug per parent
        if (data?.slug && req.payload) {
          const existing = await req.payload.find({
            collection: 'categories',
            where: {
              slug: { equals: data.slug },
              parent: data.parent ? { equals: data.parent } : { exists: false },
            },
          })

          // If editing, exclude current document
          const filtered =
            operation === 'update'
              ? existing.docs.filter((doc) => doc.id !== data.id)
              : existing.docs

          if (filtered.length > 0) {
            throw new Error(
              `A category with slug "${data.slug}" already exists under this parent`
            )
          }
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        // Before deleting a category, reassign its children and buttons to the parent
        const category = await req.payload.findByID({
          collection: 'categories',
          id,
        })

        if (!category) return

        const parentId = typeof category.parent === 'object'
          ? category.parent?.id
          : category.parent

        // Reassign child categories to the deleted category's parent
        const childCategories = await req.payload.find({
          collection: 'categories',
          where: { parent: { equals: id } },
          limit: 1000,
        })

        for (const child of childCategories.docs) {
          await req.payload.update({
            collection: 'categories',
            id: child.id,
            data: { parent: parentId || null },
          })
        }

        // Reassign buttons to the deleted category's parent (or leave uncategorized)
        const buttons = await req.payload.find({
          collection: 'buttons',
          where: { category: { equals: id } },
          limit: 1000,
        })

        for (const button of buttons.docs) {
          await req.payload.update({
            collection: 'buttons',
            id: button.id,
            data: { category: parentId || null },
          })
        }
      },
    ],
  },
}
