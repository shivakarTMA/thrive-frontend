import React from "react";

const ConfirmPopup = ({ message, onConfirm, onCancel,loading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm w-full">
        <p className="mb-4 text-lg font-semibold" >{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`bg-black text-white px-4 py-2 rounded min-w-[100px] w-full${
                   loading
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}>
            Yes
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-black px-4 py-2 rounded max-w-[100px] w-full"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
