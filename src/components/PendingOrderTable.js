import React, { useState } from "react";
import Switch from "react-switch";
import ConfirmPopup from "./common/ConfirmPopup";
import { formatDateTimeLead, formatText } from "../Helper/helper";
import { authAxios } from "../config/config";

const PendingOrderTable = ({ orders, fetchOrders }) => {
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Open confirmation popup
  const handleMarkDeliveredClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmPopup(true);
  };

  // Cancel popup
  const handleCancel = () => {
    setShowConfirmPopup(false);
    setSelectedOrderId(null);
  };

  // Confirm delivery and call API
  const handleConfirmDelivery = async () => {
    if (!selectedOrderId) return;

    try {
      await authAxios().put(
        `/dashboard/product/pending/order/markdone/${selectedOrderId}`,
      );
      setShowConfirmPopup(false);
      setSelectedOrderId(null);
      fetchOrders(); // Refresh orders after marking delivered
    } catch (error) {
      console.error("Failed to mark delivered:", error);
      alert("Something went wrong while marking the order as delivered.");
    }
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-[#F1F1F1]">
          <tr>
            <th className="p-2 min-w-[100px]">Order ID</th>
            <th className="p-2 min-w-[170px]">Placed On</th>
            <th className="p-2 min-w-[150px]">Club</th>
            <th className="p-2 min-w-[150px]">Member</th>
            <th className="p-2 min-w-[150px]">Items Ordered</th>
            <th className="p-2 min-w-[150px]">Final Amount</th>
            <th className="p-2 min-w-[150px]">Payment Status</th>
            <th className="p-2 min-w-[150px]">Fulfilment Status</th>
            <th className="p-2 min-w-[150px]">Delivered By</th>
            <th className="p-2 min-w-[170px]">Delivered At</th>
            <th className="p-2 min-w-[150px]">Action</th>
          </tr>
        </thead>

        <tbody>
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order, index) => (
              <tr key={order.id} className="border-t">
                <td className="p-2">
                  {order?.order_id ? order?.order_id : "--"}
                </td>
                <td className="p-2">
                  {order?.createdAt
                    ? formatDateTimeLead(order?.createdAt)
                    : "--"}
                </td>
                <td className="p-2">
                  {order?.club_name ? order?.club_name : "--"}
                </td>
                <td className="p-2">
                  {order?.member_name ? order?.member_name : "--"}
                </td>
                <td className="p-2">{order?.name ? order?.name : "--"}</td>
                <td className="p-2">₹{order?.booking_amount ?? 0}</td>
                <td className="p-2">
                  {order?.payment_status
                    ? formatText(order?.payment_status)
                    : "--"}
                </td>
                <td className="p-2">
                  {order?.fulfilment_status
                    ? formatText(order?.fulfilment_status)
                    : "--"}
                </td>
                <td className="p-2">
                  {order?.delivered_by_name ? order?.delivered_by_name : "--"}
                </td>
                <td className="p-2">
                  {order?.delivered_at
                    ? formatDateTimeLead(order?.delivered_at)
                    : "--"}
                </td>
                <td className="p-2">
                  <button
                    className="bg-black text-white px-3 py-1 rounded "
                    onClick={() => handleMarkDeliveredClick(order.id)}
                  >
                    Mark Delivered
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={11} className="text-center p-4">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-[350px] text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Delivery</h3>
            <p className="mb-6">
              Have you verified the correct member before marking this order as
              delivered?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                onClick={handleCancel}
              >
                No
              </button>
              <button
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                onClick={handleConfirmDelivery}
              >
                Mark Delivered
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrderTable;
