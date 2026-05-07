import React from "react";

const BookingSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
        <h2 className="text-xl font-semibold mb-4 text-green-600">Booking Successful!</h2>
        <p className="mb-4">Your booking has been recorded. You can check the console for full details.</p>
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BookingSuccessModal;
