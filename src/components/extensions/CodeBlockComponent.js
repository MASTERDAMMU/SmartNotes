// components/extensions/CodeBlockComponent.jsx
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import React from 'react'

export default function CodeBlockComponent({ node, updateAttributes }) {
  const [copied, setCopied] = React.useState(false)

  const copyCode = () => {
    const code = node.textContent
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block-header">
        <select
          contentEditable={false}
          defaultValue={node.attrs.language}
          onChange={(event) => updateAttributes({ language: event.target.value })}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <button className="copy-button" onClick={copyCode}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}