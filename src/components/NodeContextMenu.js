// components/NodeContextMenu.jsx
import React from 'react';

const NodeContextMenu = ({ x, y, onClose, options }) => {
  return (
    <div
      className="fixed bg-gray-800 rounded shadow-lg border border-gray-700 py-1 z-50"
      style={{ left: x, top: y }}
    >
      {options.map((option, index) => (
        <button
          key={index}
          className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700"
          onClick={() => {
            option.action();
            onClose();
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default NodeContextMenu;