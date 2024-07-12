import React from 'react';

export default function Modal({ isVisible, onClose, children }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl relative modal-content">
        <button
          className="absolute top-4 right-4 text-red-600 font-bold"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
}
