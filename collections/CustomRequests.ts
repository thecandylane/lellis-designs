import type { CollectionConfig } from 'payload'

export const CustomRequests: CollectionConfig = {
  slug: 'custom-requests',
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'customerEmail', 'status', 'isRush', 'createdAt'],
  },
  defaultSort: '-createdAt',
  access: {
    create: () => true, // Public can submit requests
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    // Customer Contact Info (top-level for Payload admin compatibility)
    {
      type: 'row',
      fields: [
        {
          name: 'customerName',
          label: 'Full Name',
          type: 'text',
          required: true,
        },
        {
          name: 'customerEmail',
          label: 'Email',
          type: 'email',
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customerPhone',
          label: 'Phone Number',
          type: 'text',
          required: true,
          admin: {
            description: 'Best number to reach you',
          },
        },
        {
          name: 'preferredContact',
          label: 'Preferred Contact Method',
          type: 'select',
          defaultValue: 'email',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Phone Call', value: 'phone' },
            { label: 'Text Message', value: 'text' },
          ],
        },
      ],
    },

    // Status (admin sidebar)
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true, // Index for faster status-based filtering in admin
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Approved', value: 'approved' },
        { label: 'In Production', value: 'production' },
        { label: 'Completed', value: 'completed' },
        { label: 'Declined', value: 'declined' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    // Rush indicator (admin sidebar)
    {
      name: 'isRush',
      label: 'Rush Order',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Needs expedited production',
      },
    },

    // Design Details
    {
      name: 'designDetails',
      type: 'group',
      label: 'Design Details',
      fields: [
        {
          name: 'description',
          label: 'Describe Your Vision',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Tell us about your button design - colors, theme, style, etc.',
          },
        },
        {
          name: 'eventType',
          label: 'What\'s the Occasion?',
          type: 'text',
          admin: {
            description: 'e.g., Wedding, Graduation, Birthday, Corporate Event, Sports Team',
          },
        },
        {
          name: 'colorPreferences',
          label: 'Color Preferences',
          type: 'text',
          admin: {
            description: 'Specific colors or color scheme you want',
          },
        },
      ],
    },

    // Text on Button
    {
      name: 'textOptions',
      type: 'group',
      label: 'Text on Button',
      fields: [
        {
          name: 'wantsText',
          label: 'Include Text on Button?',
          type: 'select',
          defaultValue: 'no',
          options: [
            { label: 'No text needed', value: 'no' },
            { label: 'Yes, I have specific text', value: 'yes' },
            { label: 'Help me come up with text', value: 'help' },
          ],
        },
        {
          name: 'textContent',
          label: 'What Text Do You Want?',
          type: 'textarea',
          admin: {
            condition: (data) => data?.textOptions?.wantsText === 'yes' || data?.textOptions?.wantsText === 'help',
            description: 'Enter the exact text or describe what you\'re looking for',
          },
        },
        {
          name: 'fontPreference',
          label: 'Font Style Preference',
          type: 'select',
          options: [
            { label: 'No preference', value: 'none' },
            { label: 'Bold/Block letters', value: 'bold' },
            { label: 'Script/Cursive', value: 'script' },
            { label: 'Fun/Playful', value: 'playful' },
            { label: 'Elegant/Formal', value: 'elegant' },
            { label: 'Modern/Clean', value: 'modern' },
          ],
          admin: {
            condition: (data) => data?.textOptions?.wantsText !== 'no',
          },
        },
      ],
    },

    // Images/Content
    {
      name: 'referenceImages',
      label: 'Reference Images & Logos',
      type: 'array',
      maxRows: 10,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            description: 'What is this image? (e.g., "Our logo", "Color inspiration")',
          },
        },
      ],
      admin: {
        description: 'Upload logos, inspiration images, or any visuals that help explain your vision (max 10)',
      },
    },

    // Order Details
    {
      name: 'orderDetails',
      type: 'group',
      label: 'Order Details',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'quantity',
              label: 'How Many Buttons?',
              type: 'number',
              required: true,
              min: 5,
              admin: {
                description: 'Minimum 5 buttons per custom order',
              },
            },
            {
              name: 'neededByDate',
              label: 'When Do You Need Them?',
              type: 'date',
              required: true,
            },
          ],
        },
        {
          name: 'isFlexibleDate',
          label: 'Is this date flexible?',
          type: 'select',
          defaultValue: 'somewhat',
          options: [
            { label: 'Yes, very flexible', value: 'flexible' },
            { label: 'Somewhat flexible (within a week)', value: 'somewhat' },
            { label: 'No, this is a hard deadline', value: 'firm' },
          ],
        },
        {
          name: 'deliveryPreference',
          label: 'Delivery Preference',
          type: 'select',
          defaultValue: 'either',
          options: [
            { label: 'Local Pickup (Baton Rouge area)', value: 'pickup' },
            { label: 'Ship to me', value: 'ship' },
            { label: 'Either works', value: 'either' },
          ],
        },
      ],
    },

    // Additional Info
    {
      name: 'additionalInfo',
      label: 'Anything Else We Should Know?',
      type: 'textarea',
      admin: {
        description: 'Special requests, questions, or additional context',
      },
    },

    // Conversion tracking
    {
      name: 'convertedOrderId',
      type: 'relationship',
      relationTo: 'orders',
      admin: {
        description: 'Link to the order created from this request',
        readOnly: true,
      },
    },

    // Admin-only fields
    {
      name: 'adminSection',
      type: 'group',
      label: 'Admin Notes',
      admin: {
        description: 'Internal use only - not visible to customers',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'quotedPrice',
              label: 'Quoted Price',
              type: 'number',
              min: 0,
              admin: {
                description: 'Total quoted price for the order',
              },
            },
            {
              name: 'rushFee',
              label: 'Rush Fee',
              type: 'number',
              min: 0,
              defaultValue: 0,
              admin: {
                description: 'Additional fee for rush orders',
              },
            },
          ],
        },
        {
          name: 'notes',
          label: 'Internal Notes',
          type: 'textarea',
          admin: {
            description: 'Notes for your reference (customer won\'t see this)',
          },
        },
        {
          name: 'followUpDate',
          label: 'Follow-up Reminder',
          type: 'date',
          admin: {
            description: 'Set a reminder to follow up with customer',
          },
        },
      ],
    },
  ],
}
