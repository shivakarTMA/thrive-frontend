import React from "react";

const TrialUserCard = ({ user, onStatusChange }) => {
  return (
    <div className="flex flex-wrap gap-y-2 items-center justify-between bg-gray-100 p-3 rounded mb-2">
      <div className="flex items-center gap-2">
        <div className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center text-white">
          👤
        </div>
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-gray-500">Contact: {user.contact}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">{user.time}</div>
        {user.statusOptions && (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={user.selectedStatus || ""}
            onChange={(e) => onStatusChange(user.id, e.target.value)}
          >
            <option value="">Status</option>
            {user.statusOptions.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default TrialUserCard;
