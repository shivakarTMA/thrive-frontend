import React, { useState } from "react"; // Import React and useState hook

// Component to render individual call card details
export default function ContactHistory({ filteredLogs, handleEditLog }) {
  console.log(filteredLogs,'filteredLogs')
  const [isExpanded, setIsExpanded] = useState(false); // State to manage remarks expand/collapse

  // Function to toggle remarks between view more and view less
  const toggleRemarks = () => {
    setIsExpanded((prevState) => !prevState);
  };

  return (
    <div className="bg-white shadow-md rounded-2xl w-full border border-[#D4D4D4] overflow-hidden mb-4">
      {/* Header with call type and created date */}
      <div className="flex justify-between items-center border-b pb-2 mb-3 p-4 bg-[#F1F1F1]">
        <h2 className="text-lg font-semibold">
          Call Type: {filteredLogs?.callStatus}
        </h2>
        <span className="text-gray-500 text-sm">
          Created on: {filteredLogs?.createdOn}
        </span>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-5">
          {/* Left side details */}
          <div className="space-y-2">
            <p className="text-sm flex gap-2">
              <span>Scheduled By:</span> {filteredLogs?.scheduledBy}
            </p>
            <p className="text-sm flex gap-2">
              <span>Scheduled For:</span> {filteredLogs?.scheduledFor}
            </p>
            <p className="text-sm flex gap-2">
              <span>Scheduled On:</span> {filteredLogs?.scheduledOn}
            </p>
          </div>

          {/* Right side details */}
          <div className="space-y-2">
            <p className="text-sm flex gap-2">
              <span>Call Status:</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                {filteredLogs?.callStatus}
              </span>
            </p>
            <p className="text-sm flex gap-2">
              <span>Updated By:</span> {filteredLogs?.updatedBy}
            </p>
            <p className="text-sm flex gap-2">
              <span>Updated On:</span> {filteredLogs?.updatedOn}
            </p>
          </div>
        </div>

        {/* Remarks section */}
        <div className="mt-3 border-t p-2 border border-[#D4D4D4] rounded-[5px] bg-[#F7F7F7]">
          <div className="flex gap-3 justify-between pb-2 border-b border-b-[#D4D4D4] mb-2">
            <strong className="block ">Remarks:</strong>
            {filteredLogs?.remarks?.length > 50 && (
              <button
                onClick={toggleRemarks}
                className="text-blue-500 text-xs mt-1 underline"
              >
                {isExpanded ? "View Less" : "View More"}
              </button>
            )}
          </div>
          <div className="flex gap-3 justify-between">
            <p className="text-sm text-black flex-1">
              {isExpanded
                ? filteredLogs?.remarks
                : `${filteredLogs?.remarks.slice(0, 50)}${
                    filteredLogs?.remarks?.length > 50 ? "..." : ""
                  }`}
            </p>
            <p className="text-sm text-[#6F6F6F]">Marked By: Swati Singh</p>
          </div>
        </div>

        {/* Update button */}
        <button className="mt-3 bg-black text-white py-1 px-4 rounded-[5px] hover:bg-gray-800" onClick={() => handleEditLog(filteredLogs)}>
          Update
        </button>
      </div>
    </div>
  );
}
