import React from 'react'

/**
 * Simple rich text renderer for Lexical content from Payload CMS
 * Converts Lexical JSON to React elements
 */
export function renderRichText(richTextData: any): React.ReactNode {
  if (!richTextData) return null

  // If richTextData has a root property, extract children
  const nodes = richTextData?.root?.children || richTextData

  if (!Array.isArray(nodes)) return null

  try {
    return renderNodes(nodes)
  } catch (error) {
    console.error('Failed to render rich text:', error)
    return null
  }
}

function renderNodes(nodes: any[]): React.ReactNode {
  return nodes.map((node, index) => {
    // Handle text nodes
    if (node.type === 'text') {
      let text = node.text || ''

      // Apply text formatting
      if (node.format & 1) { // Bold
        text = <strong key={index}>{text}</strong>
      }
      if (node.format & 2) { // Italic
        text = <em key={index}>{text}</em>
      }
      if (node.format & 4) { // Strikethrough
        text = <s key={index}>{text}</s>
      }
      if (node.format & 8) { // Underline
        text = <u key={index}>{text}</u>
      }

      return <React.Fragment key={index}>{text}</React.Fragment>
    }

    // Handle paragraph nodes
    if (node.type === 'paragraph') {
      return (
        <p key={index}>
          {node.children && renderNodes(node.children)}
        </p>
      )
    }

    // Handle heading nodes
    if (node.type === 'heading') {
      const tag = `h${node.tag || 2}`
      return React.createElement(
        tag,
        { key: index },
        node.children && renderNodes(node.children)
      )
    }

    // Handle list nodes
    if (node.type === 'list') {
      const ListTag = node.listType === 'number' ? 'ol' : 'ul'
      return (
        <ListTag key={index}>
          {node.children && renderNodes(node.children)}
        </ListTag>
      )
    }

    // Handle list item nodes
    if (node.type === 'listitem') {
      return (
        <li key={index}>
          {node.children && renderNodes(node.children)}
        </li>
      )
    }

    // Handle link nodes
    if (node.type === 'link') {
      return (
        <a key={index} href={node.url} target={node.newTab ? '_blank' : undefined} rel={node.newTab ? 'noopener noreferrer' : undefined}>
          {node.children && renderNodes(node.children)}
        </a>
      )
    }

    // Handle linebreak nodes
    if (node.type === 'linebreak') {
      return <br key={index} />
    }

    // Default: try to render children if they exist
    if (node.children) {
      return <React.Fragment key={index}>{renderNodes(node.children)}</React.Fragment>
    }

    return null
  })
}
