import { serializeLexical } from '@payloadcms/richtext-lexical/react'

export async function renderRichText(richTextData: any) {
  if (!richTextData) return null
  return await serializeLexical({ editorState: richTextData })
}
