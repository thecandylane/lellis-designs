import { getPayload } from '@/lib/payload'
import ContactForm from './ContactForm'
import { Footer } from '@/components/home/Footer'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  let backgroundImageUrl: string | null = null
  let contactSubjectOptions: any[] | undefined = undefined
  let contactSuccessTitle: string | undefined = undefined
  let contactSuccessMessage: string | undefined = undefined
  let footerSettings = {
    businessDescription: 'Handcrafted 3-inch buttons made with love in Baton Rouge.',
    footerEmail: 'hello@lellisdesigns.com',
    footerLocation: 'Baton Rouge, LA',
    footerNavigation: undefined as any,
    businessInstagram: 'https://instagram.com/lellisdesigns',
  }

  try {
    const payload = await getPayload()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })

    if (typeof settings.contactBackgroundImage === 'object' && settings.contactBackgroundImage?.url) {
      backgroundImageUrl = settings.contactBackgroundImage.url
    }

    contactSubjectOptions = settings.contactSubjectOptions
    contactSuccessTitle = settings.contactSuccessTitle
    contactSuccessMessage = settings.contactSuccessMessage

    footerSettings = {
      businessDescription: settings.businessDescription ?? 'Handcrafted 3-inch buttons made with love in Baton Rouge.',
      footerEmail: settings.footerEmail ?? 'hello@lellisdesigns.com',
      footerLocation: settings.footerLocation ?? 'Baton Rouge, LA',
      footerNavigation: settings.footerNavigation?.length ? settings.footerNavigation : undefined,
      businessInstagram: settings.businessInstagram ?? 'https://instagram.com/lellisdesigns',
    }
  } catch (error) {
    console.error('Failed to fetch site settings:', error)
  }

  return (
    <>
      <ContactForm
        backgroundImageUrl={backgroundImageUrl}
        contactSubjectOptions={contactSubjectOptions}
        contactSuccessTitle={contactSuccessTitle}
        contactSuccessMessage={contactSuccessMessage}
      />
      <Footer
        businessDescription={footerSettings.businessDescription}
        footerEmail={footerSettings.footerEmail}
        footerLocation={footerSettings.footerLocation}
        footerNavigation={footerSettings.footerNavigation}
        businessInstagram={footerSettings.businessInstagram}
      />
    </>
  )
}
