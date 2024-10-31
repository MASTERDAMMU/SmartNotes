import * as React from 'react';  // Change the import to this
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import { FontSize } from './extensions/FontSize';

const EnhancedEditor = ({ content, onUpdate }) => {
  const [linkUrl, setLinkUrl] = React.useState('');  // Use React.useState
  const [showLinkMenu, setShowLinkMenu] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
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

  const handleYoutubeLink = () => {
    const url = prompt('Enter YouTube URL:');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
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

        {/* Image Upload */}
        <label className="editor-btn cursor-pointer">
          📷
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>

        {/* YouTube */}
        <button
          onClick={handleYoutubeLink}
          className="editor-btn"
        >
          📺
        </button>

        {/* Link */}
        <button
          onClick={() => setShowLinkMenu(!showLinkMenu)}
          className={`editor-btn ${editor.isActive('link') ? 'active' : ''}`}
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
        }

        .editor-btn:hover {
          background-color: #4B5563;
        }

        .editor-btn.active {
          background-color: #6B7280;
        }

        .editor-select {
          padding: 0.5rem;
          border-radius: 0.25rem;
          background-color: #374151;
          color: white;
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
        }

        .ProseMirror iframe {
          margin: 1rem 0;
          border-radius: 0.375rem;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default EnhancedEditor;