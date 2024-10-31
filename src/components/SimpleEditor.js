// components/SimpleEditor.jsx
import React from 'react';

const SimpleEditor = ({ content, onUpdate }) => {
  return (
    <textarea
      value={content}
      onChange={(e) => onUpdate(e.target.value)}
      className="w-full h-full bg-gray-700 text-white p-2 rounded resize-none custom-scrollbar"
      placeholder="Add your notes here..."
    />
  );
};

export default SimpleEditor;