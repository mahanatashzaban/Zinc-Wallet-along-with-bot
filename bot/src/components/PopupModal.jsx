// src/components/PopupModal.jsx
import React from "react";

const PopupModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
        <p className="text-gray-800 text-lg mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-[#FF7A59] text-white px-4 py-2 rounded hover:bg-[#e46848]"
        >
          تایید
        </button>
      </div>
    </div>
  );
};

export default PopupModal;
