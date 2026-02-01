import { convertLexicalNodesToJSX } from '@payloadcms/richtext-lexical/react'

export function renderRichText(richTextData: any) {
  if (!richTextData) return null

  try {
    return convertLexicalNodesToJSX({
      nodes: richTextData?.root?.children || [],
    })
  } catch (error) {
    console.error('Failed to render rich text:', error)
    return null
  }
}
