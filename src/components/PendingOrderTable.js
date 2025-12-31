import React, { useState } from "react";
import Switch from "react-switch";
import ConfirmPopup from "./common/ConfirmPopup";

const PendingOrderTable = ({orders, setOrders}) => {
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
  const [transactionId, setTransactionId] = useState('');

  // Handle toggle for marking the order as done
  const handleToggleAttempt = (index) => {
    setSelectedOrderIndex(index);
    setShowConfirmPopup(true);
  };

  // Handle confirm payment and transaction ID submission
  const handleConfirmPayment = (transactionId) => {
    const updatedOrders = [...orders];
    updatedOrders[selectedOrderIndex].isDone = true; // Mark the order as done
    updatedOrders[selectedOrderIndex].transactionId = transactionId; // Store the transaction ID
    setOrders(updatedOrders); // Update the orders in the parent component
    setShowConfirmPopup(false); // Close the confirmation popup
    setTransactionId(''); // Reset the transaction ID field
  };

  // Handle cancel action for the confirmation
  const handleCancel = () => {
    setShowConfirmPopup(false); // Close the popup without updating
    setTransactionId(''); // Reset transaction ID if user cancels
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-[#F1F1F1]">
          <tr>
            <th className="p-2">Order Id</th>
            <th className="p-2">Member Id</th>
            <th className="p-2">Member Name</th>
            <th className="p-2">Category</th>
            <th className="p-2">Product Name</th>
            <th className="p-2">Final Amount</th>
            <th className="p-2">Stock Pending</th>
            <th className="p-2">Placed On</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id} className="border-t">
              <td className="p-2">{order.id}</td>
              <td className="p-2">{order.member_id}</td>
              <td className="p-2">{order.member_name}</td>
              <td className="p-2">{order.category}</td>
              <td className="p-2">{order.product_name}</td>
              <td className="p-2">₹{order.final_amount}</td>
              <td className="p-2">{order.stock_pending}</td>
              <td className="p-2">{order.placedOn}</td>
              <td className="p-2">
                <div className="flex items-center gap-2">
                  <Switch
                    onChange={() => handleToggleAttempt(index)}
                    checked={order.isDone}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    onColor="#000"
                    offColor="#e5e7eb"
                    handleDiameter={22}
                    height={25}
                    width={50}
                    className="custom-switch"
                  />
                  Mark as done
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

       {showConfirmPopup && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-[350px]">
            <h3 className="text-lg mb-4 text-center">Have you received the payment?</h3>
            <input
              type="text"
              placeholder="Enter Transaction ID"
              className="custom--input w-full text-center mb-3"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <div className="flex justify-center gap-4">
              <button
                className="bg-black text-white px-4 py-2 rounded"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="bg-black text-white px-4 py-2 rounded"
                onClick={handleConfirmPayment}
                disabled={!transactionId}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default PendingOrderTable;
