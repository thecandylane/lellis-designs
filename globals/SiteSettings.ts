import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true, // Public read for theme settings
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand Colors',
          description: 'Default brand colors (used when no seasonal theme is active)',
          fields: [
            {
              name: 'primaryColor',
              type: 'text',
              defaultValue: '#14B8A6',
              admin: {
                description: 'Primary brand color (hex, e.g., #14B8A6 teal)',
              },
            },
            {
              name: 'secondaryColor',
              type: 'text',
              defaultValue: '#EC4899',
              admin: {
                description: 'Secondary brand color (hex, e.g., #EC4899 pink)',
              },
            },
            {
              name: 'accentColor',
              type: 'text',
              defaultValue: '#84CC16',
              admin: {
                description: 'Accent color for highlights (hex, e.g., #84CC16 lime)',
              },
            },
          ],
        },
        {
          label: 'Seasonal Themes',
          description: 'Create and manage seasonal color themes',
          fields: [
            {
              name: 'activeTheme',
              type: 'text',
              admin: {
                description: 'Enter the name of the theme to activate (leave empty to use default brand colors)',
              },
            },
            {
              name: 'seasonalThemes',
              type: 'array',
              admin: {
                description: 'Create custom seasonal themes that can be activated anytime',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Theme name (e.g., "Christmas", "Mardi Gras", "LSU Game Day")',
                  },
                },
                {
                  name: 'primaryColor',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Primary color for this theme (hex)',
                  },
                },
                {
                  name: 'secondaryColor',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Secondary color for this theme (hex)',
                  },
                },
                {
                  name: 'accentColor',
                  type: 'text',
                  admin: {
                    description: 'Accent color (optional, defaults to secondary)',
                  },
                },
                {
                  name: 'heroStyle',
                  type: 'select',
                  defaultValue: 'ballpit',
                  options: [
                    { label: 'Ballpit (3D Animation)', value: 'ballpit' },
                    { label: 'Gradient', value: 'gradient' },
                    { label: 'Solid Color', value: 'solid' },
                  ],
                  admin: {
                    description: 'Hero section background style',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  admin: {
                    description: 'Optional notes about when to use this theme',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Appearance',
          description: 'Additional visual customization options',
          fields: [
            {
              name: 'heroStyle',
              type: 'select',
              defaultValue: 'ballpit',
              options: [
                { label: 'Ballpit (3D Animation)', value: 'ballpit' },
                { label: 'Gradient', value: 'gradient' },
                { label: 'Solid Color', value: 'solid' },
              ],
              admin: {
                description: 'Default hero section background style',
              },
            },
            {
              name: 'cardStyle',
              type: 'select',
              defaultValue: 'shadow',
              options: [
                { label: 'Shadow', value: 'shadow' },
                { label: 'Border', value: 'border' },
                { label: 'Flat', value: 'flat' },
              ],
              admin: {
                description: 'Product and category card style',
              },
            },
            {
              name: 'buttonStyle',
              type: 'select',
              defaultValue: 'rounded',
              options: [
                { label: 'Rounded', value: 'rounded' },
                { label: 'Pill', value: 'pill' },
                { label: 'Square', value: 'square' },
              ],
              admin: {
                description: 'Button corner style throughout the site',
              },
            },
            {
              name: 'animationIntensity',
              type: 'select',
              defaultValue: 'full',
              options: [
                { label: 'None (Accessibility)', value: 'none' },
                { label: 'Subtle', value: 'subtle' },
                { label: 'Full', value: 'full' },
              ],
              admin: {
                description: 'Control animation intensity site-wide',
              },
            },
          ],
        },
        {
          label: 'Business Info',
          fields: [
            {
              name: 'businessName',
              type: 'text',
              defaultValue: 'L. Ellis Designs',
            },
            {
              name: 'tagline',
              type: 'text',
              defaultValue: 'Custom 3" Buttons for Every Occasion',
            },
            {
              name: 'pickupAddress',
              type: 'textarea',
              admin: {
                description: 'Pickup address revealed when order is ready',
              },
            },
            {
              name: 'businessInstagram',
              type: 'text',
              defaultValue: 'https://instagram.com/lellisdesigns',
              admin: {
                description: 'Instagram URL (e.g., https://instagram.com/lellisdesigns)',
              },
            },
          ],
        },
        {
          label: 'Pricing',
          fields: [
            {
              name: 'singlePrice',
              type: 'number',
              defaultValue: 5,
              admin: {
                description: 'Price per single button (under 100 quantity)',
              },
            },
            {
              name: 'tier1Price',
              type: 'number',
              defaultValue: 4.5,
              admin: {
                description: 'Price per button for 100-199 quantity',
              },
            },
            {
              name: 'tier1Threshold',
              type: 'number',
              defaultValue: 100,
              admin: {
                description: 'Minimum quantity for tier 1 pricing',
              },
            },
            {
              name: 'tier2Price',
              type: 'number',
              defaultValue: 4,
              admin: {
                description: 'Price per button for 200+ quantity',
              },
            },
            {
              name: 'tier2Threshold',
              type: 'number',
              defaultValue: 200,
              admin: {
                description: 'Minimum quantity for tier 2 pricing',
              },
            },
            {
              name: 'shippingCost',
              type: 'number',
              defaultValue: 8,
              admin: {
                description: 'Flat rate UPS shipping cost',
              },
            },
          ],
        },
        {
          label: 'Page Backgrounds',
          description: 'Upload custom background images for different pages',
          fields: [
            {
              name: 'homepageFeaturedBackgroundImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Background for the Featured Buttons section on homepage (section-specific)',
              },
            },
            {
              name: 'aboutHeroBackgroundImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Background for the About page hero section (section-specific)',
              },
            },
            {
              name: 'customRequestBackgroundImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Background for the entire Custom Request page (full-page)',
              },
            },
            {
              name: 'contactBackgroundImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Background for the entire Contact page (full-page)',
              },
            },
          ],
        },
        {
          label: 'About Page',
          description: 'Content for the About page and gallery',
          fields: [
            {
              name: 'aboutTitle',
              type: 'text',
              defaultValue: 'About L. Ellis Designs',
              admin: {
                description: 'Title for the about page hero section',
              },
            },
            {
              name: 'aboutSubtitle',
              type: 'text',
              defaultValue: 'Handcrafted buttons made with love in Baton Rouge',
              admin: {
                description: 'Subtitle/tagline for the about page',
              },
            },
            {
              name: 'ownerName',
              type: 'text',
              admin: {
                description: 'Name of the business owner',
              },
            },
            {
              name: 'ownerPhoto',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Photo of the owner for the story section',
              },
            },
            {
              name: 'aboutStory',
              type: 'textarea',
              admin: {
                description: 'The story behind the business - personal narrative about how it started, what you love about it, etc.',
                rows: 8,
              },
            },
            {
              name: 'galleryImages',
              type: 'array',
              admin: {
                description: 'Images for the gallery section - showcase your work, events, happy customers',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  admin: {
                    description: 'Optional caption for this image',
                  },
                },
              ],
            },
            {
              name: 'instagramUrl',
              type: 'text',
              admin: {
                description: 'Instagram profile URL (e.g., https://instagram.com/lellisdesigns)',
              },
            },
            {
              name: 'aboutValueCards',
              type: 'array',
              maxRows: 3,
              admin: {
                description: 'Value proposition cards below hero',
              },
              defaultValue: [
                { title: 'Handmade with Love', description: 'Every button is crafted with care and attention to detail', icon: 'heart', colorClass: 'bg-primary/10 text-primary' },
                { title: 'Local to Baton Rouge', description: 'Proudly serving Louisiana and shipping nationwide', icon: 'map-pin', colorClass: 'bg-secondary/10 text-secondary' },
                { title: 'Quality Materials', description: 'Premium 3-inch buttons built to last', icon: 'award', colorClass: 'bg-accent/10 text-accent' },
              ],
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'icon',
                  type: 'select',
                  options: [
                    { label: 'Heart', value: 'heart' },
                    { label: 'Map Pin', value: 'map-pin' },
                    { label: 'Award', value: 'award' },
                    { label: 'Star', value: 'star' },
                  ],
                },
                {
                  name: 'colorClass',
                  type: 'text',
                  admin: {
                    description: 'Tailwind classes (e.g., "bg-primary/10 text-primary")',
                  },
                },
              ],
            },
            {
              name: 'aboutCtaHeading',
              type: 'text',
              defaultValue: 'Ready to Create Something Special?',
              admin: {
                description: 'CTA section heading on about page',
              },
            },
            {
              name: 'aboutCtaButton1Text',
              type: 'text',
              defaultValue: 'Browse Buttons',
              admin: {
                description: 'First CTA button text',
              },
            },
            {
              name: 'aboutCtaButton2Text',
              type: 'text',
              defaultValue: 'Custom Order',
              admin: {
                description: 'Second CTA button text',
              },
            },
          ],
        },
        {
          label: 'Social Proof',
          description: 'Customer ratings and trust indicators',
          fields: [
            {
              name: 'customerRating',
              type: 'number',
              defaultValue: 5.0,
              min: 0,
              max: 5,
              admin: {
                step: 0.1,
                description: 'Customer rating shown in trust strip (0-5 stars)',
              },
            },
            {
              name: 'customerCount',
              type: 'text',
              defaultValue: '500+',
              admin: {
                description: 'Number of customers (e.g., "500+", "1000+")',
              },
            },
            {
              name: 'businessDescription',
              type: 'textarea',
              defaultValue: 'Handcrafted 3-inch buttons made with love in Baton Rouge. Perfect for sports teams, schools, and special celebrations.',
              admin: {
                description: 'Short business description shown in footer',
              },
            },
          ],
        },
        {
          label: 'Footer',
          description: 'Footer contact info and navigation structure',
          fields: [
            {
              name: 'footerEmail',
              type: 'email',
              defaultValue: 'hello@lellisdesigns.com',
              admin: {
                description: 'Email address shown in footer',
              },
            },
            {
              name: 'footerLocation',
              type: 'text',
              defaultValue: 'Baton Rouge, LA',
              admin: {
                description: 'Location shown in footer',
              },
            },
            {
              name: 'footerNavigation',
              type: 'array',
              admin: {
                description: 'Footer navigation sections (Shop, Support, Company)',
              },
              defaultValue: [
                {
                  sectionTitle: 'Shop',
                  links: [
                    { label: 'All Buttons', href: '#categories' },
                    { label: 'Sports', href: '/category/sports' },
                    { label: 'Schools', href: '/category/schools' },
                    { label: 'Custom Request', href: '/custom-request' },
                  ],
                },
                {
                  sectionTitle: 'Support',
                  links: [
                    { label: 'Contact Us', href: '/contact' },
                    { label: 'Shipping Info', href: '/shipping' },
                    { label: 'FAQ', href: '/faq' },
                  ],
                },
                {
                  sectionTitle: 'Company',
                  links: [
                    { label: 'About Us', href: '/about' },
                    { label: 'Our Story', href: '/about#story' },
                  ],
                },
              ],
              fields: [
                {
                  name: 'sectionTitle',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'links',
                  type: 'array',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'href',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Shipping & Fulfillment',
          description: 'Shipping methods and processing times',
          fields: [
            {
              name: 'shippingMethodTitle',
              type: 'text',
              defaultValue: 'UPS Ground Shipping',
              admin: {
                description: 'Title for shipping method',
              },
            },
            {
              name: 'shippingMethodDescription',
              type: 'text',
              defaultValue: 'Standard delivery within 3-5 business days',
              admin: {
                description: 'Description for shipping method',
              },
            },
            {
              name: 'localPickupTitle',
              type: 'text',
              defaultValue: 'Local Pickup',
              admin: {
                description: 'Title for local pickup option',
              },
            },
            {
              name: 'localPickupDescription',
              type: 'text',
              defaultValue: 'Free pickup in Baton Rouge, LA',
              admin: {
                description: 'Description for local pickup',
              },
            },
            {
              name: 'standardProcessingDays',
              type: 'text',
              defaultValue: '2-3 business days',
              admin: {
                description: 'Standard order processing time',
              },
            },
            {
              name: 'bulkProcessingDays',
              type: 'text',
              defaultValue: '3-5 business days',
              admin: {
                description: 'Bulk order (50+) processing time',
              },
            },
            {
              name: 'customProcessingDays',
              type: 'text',
              defaultValue: '5-7 business days (includes design approval)',
              admin: {
                description: 'Custom order processing time',
              },
            },
            {
              name: 'pickupAvailability',
              type: 'text',
              defaultValue: 'Monday through Friday',
              admin: {
                description: 'When pickup orders are available',
              },
            },
          ],
        },
        {
          label: 'Forms',
          description: 'Form options and success messages',
          fields: [
            // Contact Form
            {
              name: 'contactSubjectOptions',
              type: 'array',
              admin: {
                description: 'Contact form subject dropdown options',
              },
              defaultValue: [
                { value: 'order', label: 'Question about an order' },
                { value: 'custom', label: 'Custom button inquiry' },
                { value: 'pricing', label: 'Pricing or bulk orders' },
                { value: 'general', label: 'General question' },
                { value: 'other', label: 'Something else' },
              ],
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'contactSuccessTitle',
              type: 'text',
              defaultValue: 'Message Sent!',
              admin: {
                description: 'Success message title for contact form',
              },
            },
            {
              name: 'contactSuccessMessage',
              type: 'textarea',
              defaultValue: 'Thanks for reaching out! We\'ll get back to you as soon as possible, usually within 24 hours.',
              admin: {
                description: 'Success message text for contact form',
              },
            },
            // Custom Request Form
            {
              name: 'customRequestFontOptions',
              type: 'array',
              admin: {
                description: 'Font preference dropdown options',
              },
              defaultValue: [
                { value: 'none', label: 'No preference' },
                { value: 'bold', label: 'Bold/Block' },
                { value: 'script', label: 'Script/Cursive' },
                { value: 'playful', label: 'Fun/Playful' },
                { value: 'elegant', label: 'Elegant/Formal' },
                { value: 'modern', label: 'Modern/Clean' },
              ],
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'customRequestTextOptions',
              type: 'array',
              admin: {
                description: 'Text preference dropdown options',
              },
              defaultValue: [
                { value: 'no', label: 'No text needed' },
                { value: 'yes', label: 'Yes, I have text' },
                { value: 'help', label: 'Help me decide' },
              ],
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'customRequestDeliveryOptions',
              type: 'array',
              admin: {
                description: 'Delivery preference dropdown options',
              },
              defaultValue: [
                { value: 'pickup', label: 'Local Pickup' },
                { value: 'ship', label: 'Ship to Me' },
                { value: 'either', label: 'Either Works' },
              ],
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'customRequestDateFlexibility',
              type: 'array',
              admin: {
                description: 'Date flexibility dropdown options',
              },
              defaultValue: [
                { value: 'flexible', label: 'Very flexible' },
                { value: 'somewhat', label: 'Within a week' },
                { value: 'firm', label: 'Hard deadline' },
              ],
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'customRequestSuccessTitle',
              type: 'text',
              defaultValue: 'Request Submitted!',
              admin: {
                description: 'Success message title for custom request form',
              },
            },
            {
              name: 'customRequestSuccessMessage',
              type: 'textarea',
              defaultValue: 'Thank you for your custom button request! We\'ll review your details and get back to you within 24-48 hours with a quote.',
              admin: {
                description: 'Success message text for custom request form',
              },
            },
          ],
        },
        {
          label: 'Homepage Features',
          description: 'Feature cards shown on homepage',
          fields: [
            {
              name: 'featuresHeading',
              type: 'text',
              defaultValue: 'Why Choose L. Ellis Designs?',
              admin: {
                description: 'Main heading for features section',
              },
            },
            {
              name: 'featuresSubheading',
              type: 'textarea',
              defaultValue: 'We\'re passionate about creating buttons that celebrate your team, your school, and your special moments.',
              admin: {
                description: 'Subheading text below main heading',
              },
            },
            {
              name: 'featureItems',
              type: 'array',
              maxRows: 6,
              admin: {
                description: 'Feature cards (max 6 for best layout)',
              },
              defaultValue: [
                { title: 'Handcrafted with Love', description: 'Every button is carefully made in Baton Rouge with attention to detail and quality materials.', icon: 'heart', colorClass: 'bg-primary/10 text-primary' },
                { title: 'Fast Turnaround', description: 'Quick production times so you get your buttons when you need them for game day or events.', icon: 'clock', colorClass: 'bg-secondary/10 text-secondary' },
                { title: 'Bulk Discounts', description: 'The more you order, the more you save. Perfect for teams, schools, and large events.', icon: 'shopping-bag', colorClass: 'bg-accent/10 text-accent' },
                { title: 'Custom Designs', description: 'Personalize with names, numbers, photos, and team colors. Make each button unique!', icon: 'palette', colorClass: 'bg-purple-500/10 text-purple-500' },
                { title: 'Quality Guaranteed', description: 'Durable, vibrant 3-inch buttons that last through every game and celebration.', icon: 'shield', colorClass: 'bg-blue-500/10 text-blue-500' },
                { title: 'Flexible Delivery', description: 'Local pickup in Baton Rouge or fast UPS shipping anywhere in the country.', icon: 'truck', colorClass: 'bg-orange-500/10 text-orange-500' },
              ],
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Heart', value: 'heart' },
                    { label: 'Clock', value: 'clock' },
                    { label: 'Shopping Bag', value: 'shopping-bag' },
                    { label: 'Palette', value: 'palette' },
                    { label: 'Shield', value: 'shield' },
                    { label: 'Truck', value: 'truck' },
                  ],
                },
                {
                  name: 'colorClass',
                  type: 'text',
                  admin: {
                    description: 'Tailwind classes (e.g., "bg-primary/10 text-primary")',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'CTA Sections',
          description: 'Call-to-action section content',
          fields: [
            {
              name: 'homepageCtaHeading',
              type: 'text',
              defaultValue: 'Have a Special Design in Mind?',
              admin: {
                description: 'Main heading for homepage CTA section',
              },
            },
            {
              name: 'homepageCtaSubtext',
              type: 'textarea',
              defaultValue: 'We love bringing your ideas to life! Whether it\'s custom names, photos, or unique designs - we\'re here to help create something special.',
              admin: {
                description: 'Subtext below heading',
              },
            },
            {
              name: 'homepageCtaButton1Text',
              type: 'text',
              defaultValue: 'Request Custom Design',
              admin: {
                description: 'First button text',
              },
            },
            {
              name: 'homepageCtaButton2Text',
              type: 'text',
              defaultValue: 'Browse Existing Designs',
              admin: {
                description: 'Second button text',
              },
            },
          ],
        },
        {
          label: 'FAQ',
          description: 'Frequently Asked Questions page content',
          fields: [
            {
              name: 'faqPageTitle',
              type: 'text',
              defaultValue: 'Frequently Asked Questions',
              admin: {
                description: 'Main page title',
              },
            },
            {
              name: 'faqPageSubtitle',
              type: 'text',
              defaultValue: 'Common questions about our buttons',
              admin: {
                description: 'Page subtitle',
              },
            },
            {
              name: 'faqIntroText',
              type: 'textarea',
              defaultValue: 'Here are answers to the most common questions we receive. Can\'t find what you\'re looking for? Feel free to contact us.',
              admin: {
                description: 'Intro text before FAQ items',
              },
            },
            {
              name: 'faqItems',
              type: 'array',
              admin: {
                description: 'FAQ questions and answers (drag to reorder)',
              },
              defaultValue: [
                { question: 'What size are the buttons?', answer: 'All our buttons are 3 inches in diameter - the perfect size for visibility at events, games, and celebrations.', order: 1 },
                { question: 'How do I place a custom order?', answer: 'Visit our Custom Request page to submit your design idea. You can upload an image or describe what you\'re looking for, and we\'ll work with you to create the perfect button.', order: 2 },
                { question: 'What\'s the turnaround time for orders?', answer: 'Standard orders ship within 2-3 business days. Bulk orders (50+ buttons) may take 3-5 business days. Custom designs typically take 5-7 business days, which includes time for design approval.', order: 3 },
                { question: 'Do you offer bulk discounts?', answer: 'Yes! We offer tiered pricing for larger orders. Orders of 100-199 buttons receive a discount, and orders of 200+ buttons receive an even better rate. Check our pricing on any product page.', order: 4 },
                { question: 'Can I pick up my order locally?', answer: 'Absolutely! We offer free local pickup in Baton Rouge, Louisiana. Just select the pickup option at checkout, and we\'ll email you when your order is ready.', order: 5 },
                { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure checkout powered by Stripe.', order: 6 },
                { question: 'Can I see a proof before my custom order is made?', answer: 'Yes! For custom orders, we\'ll send you a digital proof to approve before we start production. We want to make sure you\'re 100% happy with the design.', order: 7 },
                { question: 'What if I\'m not satisfied with my order?', answer: 'Your satisfaction is important to us. If there\'s an issue with your order, please contact us within 7 days of receiving it, and we\'ll work to make it right.', order: 8 },
                { question: 'Do you ship outside of Louisiana?', answer: 'Yes, we ship nationwide via UPS Ground. Shipping is a flat rate of $8.00 regardless of order size.', order: 9 },
                { question: 'Can I order buttons for a school or team?', answer: 'Definitely! We specialize in buttons for schools, sports teams, and organizations. Check out our Sports and Schools categories for popular designs, or submit a custom request for your specific needs.', order: 10 },
              ],
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'answer',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'order',
                  type: 'number',
                  admin: {
                    description: 'Display order (lower numbers appear first)',
                  },
                },
              ],
            },
            {
              name: 'faqContactPrompt',
              type: 'text',
              defaultValue: 'Still Have Questions?',
              admin: {
                description: 'Heading for contact prompt at bottom',
              },
            },
            {
              name: 'faqContactDescription',
              type: 'text',
              defaultValue: 'We\'re here to help! Reach out and we\'ll get back to you as soon as possible.',
              admin: {
                description: 'Description text for contact prompt',
              },
            },
          ],
        },
      ],
    },
  ],
}
