// components/RichTextEditor.jsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const RichTextEditor = ({ content, onUpdate }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const MenuBar = () => {
    return (
      <div className="flex flex-wrap gap-2 p-2 border-b border-gray-700">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('bold') ? 'bg-gray-600' : 'bg-gray-700'
          } hover:bg-gray-600 transition-colors`}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('italic') ? 'bg-gray-600' : 'bg-gray-700'
          } hover:bg-gray-600 transition-colors`}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('bulletList') ? 'bg-gray-600' : 'bg-gray-700'
          } hover:bg-gray-600 transition-colors`}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('orderedList') ? 'bg-gray-600' : 'bg-gray-700'
          } hover:bg-gray-600 transition-colors`}
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('codeBlock') ? 'bg-gray-600' : 'bg-gray-700'
          } hover:bg-gray-600 transition-colors`}
        >
          {'</>'}
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-gray-800 text-white">
      <MenuBar />
      <EditorContent 
        editor={editor} 
        className="p-4 h-[calc(100%-4rem)] overflow-auto prose prose-invert max-w-none"
      />
      <style>{`
        .ProseMirror {
          min-height: 100px;
          padding: 1rem;
          border-radius: 0.375rem;
          background-color: rgba(31, 41, 55, 0.5);
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror > * + * {
          margin-top: 0.75em;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding: 0 1rem;
        }
        .ProseMirror code {
          background-color: #374151;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;