// components/Notes.jsx
import * as React from 'react';  // Change the import to this
import EnhancedEditor from './EnhancedEditor';

const Notes = ({ setActiveNoteId, noteText, setNoteText, node, saveNote }) => {
  const notePopupRef = React.useRef(null);  // Use React.useRef instead of useRef

  React.useEffect(() => {    // Use React.useEffect instead of useEffect
    const handleClickOutside = (event) => {
      if (notePopupRef.current && !notePopupRef.current.contains(event.target)) {
        setActiveNoteId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setActiveNoteId]);

  return (
    <foreignObject x={node.x + 50} y={node.y - 100} width="1000" height="1000">
      <div
        ref={notePopupRef}
        className="bg-gray-800 p-4 rounded border border-gray-600 shadow-xl h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: '25px' }} // Adjust font size if needed

      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold text-lg"
          >Notes for {node.label}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveNoteId(null);
            }}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="flex-grow overflow-hidden">
          <EnhancedEditor
            content={noteText}
            onUpdate={setNoteText}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={saveNote}
          >
            Save
          </button>
        </div>
      </div>
    </foreignObject>
  );
};

export default Notes;