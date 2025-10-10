import React, { useState } from "react";
import { formatAutoDate, formatDateTimeLead } from "../Helper/helper";

export default function LeadContactHistory({
  handleEditLog,
  filteredData,
}) {
  console.log(filteredData, "filteredData");
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleRemarks = () => {
    setIsExpanded((prevState) => !prevState);
  };

  return (
    <div className="bg-white shadow-md rounded-2xl w-full border border-[#D4D4D4] overflow-hidden mb-4">
      {/* Header with call type and created date */}
      <div className="flex justify-between items-center border-b pb-2 mb-3 p-4 bg-[#F1F1F1]">
        <h2 className="text-lg font-semibold">
          Call Status: {filteredData?.call_status}
        </h2>
        <span className="text-gray-500 text-sm">
          Created on: {formatDateTimeLead(filteredData?.createdAt)}
        </span>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* Left side details */}
         
            <p className="text-sm flex gap-2">
              <span>Scheduled By:</span> {filteredData?.scheduled_by}
            </p>

            {filteredData?.training_by && (
              <p className="text-sm flex gap-2">
                <span>Scheduled For:</span> {filteredData?.training_by}
              </p>
            )}
            {filteredData?.trial_tour_datetime && (
              <p className="text-sm flex gap-2">
                <span>Scheduled On:</span>{" "}
                {formatDateTimeLead(filteredData?.trial_tour_datetime)}
              </p>
            )}

            {filteredData?.follow_up_datetime &&
            filteredData?.schedule_for ? null : (
              <>
                {filteredData?.follow_up_datetime && (
                  <p className="text-sm flex gap-2">
                    <span>Scheduled On:</span>{" "}
                    {formatDateTimeLead(filteredData?.follow_up_datetime)}
                  </p>
                )}
              </>
            )}

            {filteredData?.not_interested_reason && (
              <p className="text-sm flex gap-2">
                <span>Reason:</span>{" "}
                {filteredData?.not_interested_reason}
              </p>
            )}
           
             {filteredData?.closure_date && (
              <p className="text-sm flex gap-2">
                <span>Date of Closure:</span>{" "}
                {formatAutoDate(filteredData?.closure_date)}
              </p>
            )}
     

          {/* Right side details */}
        
            {filteredData?.follow_up_datetime && filteredData?.schedule_for && (
              <>
                {filteredData?.schedule_for && (
                  <p className="text-sm flex gap-2">
                    <span>Assign Staff:</span> {filteredData?.schedule_for}
                  </p>
                )}
                {filteredData?.follow_up_datetime && (
                  <p className="text-sm flex gap-2">
                    <span>Assign Date:</span>{" "}
                    {formatDateTimeLead(filteredData?.follow_up_datetime)}
                  </p>
                )}
              </>
            )}
            {filteredData?.updatedAt && (
              <p className="text-sm flex gap-2">
                <span>Updated On:</span>{" "}
                {formatDateTimeLead(filteredData?.updatedAt)}
              </p>
            )}

             {filteredData?.amount && (
              <p className="text-sm flex gap-2">
                <span>Amount:</span>{" "}
                ₹{filteredData?.amount}
              </p>
            )}
         
        </div>

        {/* Remarks section */}
        <div className="mt-3 border-t p-2 border border-[#D4D4D4] rounded-[5px] bg-[#F7F7F7]">
          <div className="flex gap-3 justify-between pb-2 border-b border-b-[#D4D4D4] mb-2">
            <strong className="block ">Remarks:</strong>
            {filteredData?.remark?.length > 50 && (
              <button
                onClick={toggleRemarks}
                className="text-[#009EB2] text-xs mt-1 underline"
              >
                {isExpanded ? "View Less" : "View More"}
              </button>
            )}
          </div>
          <div className="flex gap-3 justify-between">
            <p className="text-sm text-black flex-1">
              {isExpanded
                ? filteredData?.remark
                : `${filteredData?.remark.slice(0, 50)}${
                    filteredData?.remark?.length > 50 ? "..." : ""
                  }`}
            </p>
            {/* <p className="text-sm text-[#6F6F6F]">Marked By: Swati Singh</p> */}
          </div>
        </div>

        {/* Update button */}
        {/* <button className="mt-3 bg-black text-white py-1 px-4 rounded-[5px] hover:bg-gray-800" onClick={() => handleEditLog(filteredLogs)}>
          Update
        </button> */}
      </div>
    </div>
  );
}
