import React, { useState } from "react";
import Switch from "react-switch";
import ConfirmPopup from "./common/ConfirmPopup";

const PendingOrderTable = ({orders, setOrders}) => {
  
  const [popupData, setPopupData] = useState({ show: false, index: null });

  const handleToggleAttempt = (index) => {
    setPopupData({ show: true, index });
  };

  const confirmToggle = () => {
    const updatedOrders = [...orders];
    updatedOrders[popupData.index].isDone =
      !updatedOrders[popupData.index].isDone;
    setOrders(updatedOrders);
    setPopupData({ show: false, index: null });
  };

  const cancelToggle = () => {
    setPopupData({ show: false, index: null });
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Order ID</th>
            <th className="p-2">Member</th>
            <th className="p-2">Items</th>
            <th className="p-2">Placed On</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id} className="border-t">
              <td className="p-2">{order.id}</td>
              <td className="p-2">{order.member}</td>
              <td className="p-2">{order.items}</td>
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

      {popupData.show && (
        <ConfirmPopup
          message="Are you sure you want to mark this order as done?"
          onConfirm={confirmToggle}
          onCancel={cancelToggle}
        />
      )}
    </div>
  );
};

export default PendingOrderTable;
