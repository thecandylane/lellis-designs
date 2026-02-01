import { getPayload } from '@/lib/payload'
import CustomRequestForm from './CustomRequestForm'
import { Footer } from '@/components/home/Footer'

export const dynamic = 'force-dynamic'

export default async function CustomRequestPage() {
  let backgroundImageUrl: string | null = null
  let customRequestFontOptions: any[] | undefined = undefined
  let customRequestTextOptions: any[] | undefined = undefined
  let customRequestDeliveryOptions: any[] | undefined = undefined
  let customRequestDateFlexibility: any[] | undefined = undefined
  let customRequestSuccessTitle: string | undefined = undefined
  let customRequestSuccessMessage: string | undefined = undefined
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

    if (typeof settings.customRequestBackgroundImage === 'object' && settings.customRequestBackgroundImage?.url) {
      backgroundImageUrl = settings.customRequestBackgroundImage.url
    }

    customRequestFontOptions = settings.customRequestFontOptions
    customRequestTextOptions = settings.customRequestTextOptions
    customRequestDeliveryOptions = settings.customRequestDeliveryOptions
    customRequestDateFlexibility = settings.customRequestDateFlexibility
    customRequestSuccessTitle = settings.customRequestSuccessTitle
    customRequestSuccessMessage = settings.customRequestSuccessMessage

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
      <CustomRequestForm
        backgroundImageUrl={backgroundImageUrl}
        customRequestFontOptions={customRequestFontOptions}
        customRequestTextOptions={customRequestTextOptions}
        customRequestDeliveryOptions={customRequestDeliveryOptions}
        customRequestDateFlexibility={customRequestDateFlexibility}
        customRequestSuccessTitle={customRequestSuccessTitle}
        customRequestSuccessMessage={customRequestSuccessMessage}
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
