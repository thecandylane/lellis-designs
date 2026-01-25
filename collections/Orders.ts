import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'customerEmail',
    defaultColumns: ['customerEmail', 'status', 'total', 'shippingMethod', 'createdAt'],
  },
  defaultSort: '-createdAt',
  access: {
    // Webhook creates orders (public create)
    create: () => true,
    // Only admins can read/update
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'orderType',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: 'Standard Order', value: 'standard' },
        { label: 'Custom Order', value: 'custom' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Standard orders come from cart; custom orders from custom requests',
      },
    },
    {
      name: 'customRequestId',
      type: 'relationship',
      relationTo: 'custom-requests',
      admin: {
        condition: (data) => data?.orderType === 'custom',
        description: 'Link to the original custom request',
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'Cash', value: 'cash' },
        { label: 'Venmo', value: 'venmo' },
        { label: 'Check', value: 'check' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
        description: 'How the customer paid',
      },
    },
    {
      name: 'stripeSessionId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customerEmail',
          type: 'email',
          required: true,
        },
        {
          name: 'customerName',
          type: 'text',
        },
        {
          name: 'customerPhone',
          type: 'text',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Production', value: 'production' },
        { label: 'Ready for Pickup', value: 'ready' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'shippingMethod',
      type: 'select',
      defaultValue: 'pickup',
      options: [
        { label: 'Local Pickup', value: 'pickup' },
        { label: 'UPS Shipping', value: 'ups' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'shippingAddress',
      type: 'json',
      admin: {
        description: 'Shipping address (for UPS orders)',
        condition: (data) => data?.shippingMethod === 'ups',
      },
    },
    {
      name: 'trackingNumber',
      type: 'text',
      admin: {
        description: 'UPS tracking number',
        condition: (data) => data?.shippingMethod === 'ups',
      },
    },
    {
      name: 'items',
      type: 'json',
      required: true,
      admin: {
        description: 'Cart items array',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'subtotal',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'shippingCost',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'total',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
    },
    {
      name: 'neededByDate',
      type: 'date',
      admin: {
        description: 'Customer-requested delivery date',
      },
    },
    {
      name: 'productionDeadline',
      type: 'date',
      admin: {
        description: 'Internal deadline for production',
      },
    },
    {
      name: 'ambassadorCode',
      type: 'text',
      admin: {
        description: 'Referral code if used',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes',
      },
    },
  ],
}
