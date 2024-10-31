import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight/lib/core';
import 'prismjs/themes/prism-tomorrow.css';

// Import specific languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import { FontSize } from './extensions/FontSize';

// Register the languages
lowlight.registerLanguage('javascript', javascript);
lowlight.registerLanguage('typescript', typescript);
lowlight.registerLanguage('html', html);
lowlight.registerLanguage('css', css);
lowlight.registerLanguage('python', python);
lowlight.registerLanguage('java', java);

const EnhancedEditor = ({ content, onUpdate }) => {
  const [linkUrl, setLinkUrl] = React.useState('');
  const [showLinkMenu, setShowLinkMenu] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
      }),
      Youtube.configure({
        width: 480,
        height: 320,
      }),
      FontSize,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        editor.chain().focus().setImage({ src: imageUrl }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          e.preventDefault();
          const file = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (e) => {
            editor.chain().focus().setImage({ src: e.target.result }).run();
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };
  // components/EnhancedEditor.jsx - PART 2
  const handleYoutubeLink = () => {
    const url = prompt('Enter YouTube URL:');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const toggleList = (type) => {
    if (type === 'bullet') {
      editor.chain().focus().toggleBulletList().run();
    } else if (type === 'ordered') {
      editor.chain().focus().toggleOrderedList().run();
    }
  };

  const addCodeBlock = (language = 'javascript') => {
    editor.chain().focus().setCodeBlock({ language }).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full h-full bg-gray-800 text-white">
      <div className="flex flex-wrap gap-2 p-2 border-b border-gray-700">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`editor-btn ${editor.isActive('bold') ? 'active' : ''}`}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`editor-btn ${editor.isActive('italic') ? 'active' : ''}`}
        >
          <em>I</em>
        </button>
        
        {/* Font Size */}
        <select
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          className="editor-select"
        >
          <option value="12px">Small</option>
          <option value="16px">Normal</option>
          <option value="20px">Large</option>
          <option value="24px">Huge</option>
        </select>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-600 mx-2"></div>

        {/* Lists */}
        <button
          onClick={() => toggleList('bullet')}
          className={`editor-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => toggleList('ordered')}
          className={`editor-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="Numbered List"
        >
          1.
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-600 mx-2"></div>

        {/* Code Block */}
        <div className="relative">
          <button
            onClick={() => addCodeBlock()}
            className={`editor-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
            title="Insert Code Block"
          >
            &lt;/&gt;
          </button>
          <select
            onChange={(e) => {
              if (editor.isActive('codeBlock')) {
                editor.chain().focus().setCodeBlock({ language: e.target.value }).run();
              } else {
                addCodeBlock(e.target.value);
              }
            }}
            className="editor-select ml-1"
            value={editor.isActive('codeBlock') ? editor.getAttributes('codeBlock').language : 'javascript'}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-600 mx-2"></div>

        {/* Table Controls */}
        <button
          onClick={addTable}
          className="editor-btn"
          title="Insert Table"
        >
          ⊞
        </button>
        <button
          onClick={() => editor.chain().focus().deleteTable().run()}
          className="editor-btn"
          title="Delete Table"
          disabled={!editor.isActive('table')}
        >
          ⊟
        </button>
        {/* Table Row/Column Controls */}
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          className="editor-btn"
          disabled={!editor.isActive('table')}
          title="Add Column Before"
        >
          ←|
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          className="editor-btn"
          disabled={!editor.isActive('table')}
          title="Add Column After"
        >
          |→
        </button>
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          className="editor-btn"
          disabled={!editor.isActive('table')}
          title="Add Row Before"
        >
          ↑—
        </button>
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          className="editor-btn"
          disabled={!editor.isActive('table')}
          title="Add Row After"
        >
          —↓
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-600 mx-2"></div>

        {/* Media Controls */}
        <label className="editor-btn cursor-pointer" title="Upload Image">
          📷
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>

        <button
          onClick={handleYoutubeLink}
          className="editor-btn"
          title="Insert YouTube Video"
        >
          📺
        </button>

        {/* Link Control */}
        <button
          onClick={() => setShowLinkMenu(!showLinkMenu)}
          className={`editor-btn ${editor.isActive('link') ? 'active' : ''}`}
          title="Insert Link"
        >
          🔗
        </button>
      </div>

      {/* Link Menu */}
      {showLinkMenu && (
        <div className="p-2 border-b border-gray-700">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL"
            className="bg-gray-700 text-white p-1 rounded mr-2"
          />
          <button
            onClick={() => {
              editor.chain().focus().setLink({ href: linkUrl }).run();
              setShowLinkMenu(false);
              setLinkUrl('');
            }}
            className="editor-btn"
          >
            Add Link
          </button>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="p-4 h-[calc(100%-4rem)] overflow-auto prose prose-invert max-w-none"
        onPaste={handlePaste}
      />

      <style>{`
        .editor-btn {
          padding: 0.5rem;
          border-radius: 0.25rem;
          background-color: #374151;
          transition: background-color 0.2s;
          min-width: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .editor-btn:hover:not(:disabled) {
          background-color: #4B5563;
        }

        .editor-btn.active {
          background-color: #6B7280;
        }

        .editor-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .editor-select {
          padding: 0.5rem;
          border-radius: 0.25rem;
          background-color: #374151;
          color: white;
          border: none;
        }

        .ProseMirror {
          min-height: 100px;
          padding: 1rem;
          border-radius: 0.375rem;
          background-color: rgba(31, 41, 55, 0.5);
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 0.375rem;
        }

        .ProseMirror iframe {
          margin: 1rem 0;
          border-radius: 0.375rem;
          max-width: 100%;
        }

        .ProseMirror table {
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }

        .ProseMirror td,
        .ProseMirror th {
          border: 2px solid #374151;
          box-sizing: border-box;
          min-width: 1em;
          padding: 3px 5px;
          position: relative;
          vertical-align: top;
        }

        .ProseMirror th {
          background-color: #374151;
          font-weight: bold;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
        }

        .ProseMirror ul li {
          list-style-type: disc;
        }

        .ProseMirror ol li {
          list-style-type: decimal;
        }

        .ProseMirror pre {
          background: #2d2d2d;
          border-radius: 0.5rem;
          color: #ccc;
          font-family: 'JetBrains Mono', monospace;
          padding: 0.75rem 1rem;
          margin: 1rem 0;
        }

        .ProseMirror pre code {
          background: none;
          color: inherit;
          font-size: 0.9rem;
          padding: 0;
        }

        .ProseMirror a {
          color: #60A5FA;
          text-decoration: underline;
        }

        .ProseMirror a:hover {
          color: #93C5FD;
        }

        .ProseMirror blockquote {
          border-left: 3px solid #4B5563;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
        }

        .code-block-wrapper {
          position: relative;
        }

        .copy-button {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: #374151;
          border: none;
          border-radius: 0.25rem;
          color: #fff;
          font-size: 0.8rem;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .code-block-wrapper:hover .copy-button {
          opacity: 1;
        }

        .copy-button:hover {
          background: #4B5563;
        }
      `}</style>
    </div>
  );
};

export default EnhancedEditor;