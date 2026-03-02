import React, { useState } from "react";
import { formatAutoDate, formatDateTimeLead } from "../Helper/helper";

export default function LeadContactHistory({ handleEditLog, filteredData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleRemarks = () => {
    setIsExpanded((prevState) => !prevState);
  };

  // Get the first child_log remark if it exists
  const childRemark = filteredData?.child_log?.[0]?.remark;

  return (
    <div className="bg-white shadow-md rounded-2xl w-full border border-[#D4D4D4] overflow-hidden mb-4">
      {/* Header with call type and created date */}
      <div className="flex justify-between items-center border-b pb-2 p-4 bg-[#F1F1F1]">
        <h2 className="text-lg font-semibold">{filteredData?.call_status}</h2>
        <span className="text-gray-500 text-sm">
          Created on: {formatDateTimeLead(filteredData?.createdAt)}
        </span>
      </div>

      <div className="p-4">
        <p className="text-sm flex gap-2 mb-3">
          Created by: {filteredData?.created_by_name}
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* Left side details */}

          <p className="text-sm flex gap-2">
            <span>Scheduled By:</span> {filteredData?.scheduled_by}
          </p>

          {filteredData?.training_by_name && (
            <p className="text-sm flex gap-2">
              <span>Scheduled For:</span> {filteredData?.training_by_name}
            </p>
          )}
          {filteredData?.trial_tour_datetime && (
            <p className="text-sm flex gap-2">
              <span>Scheduled On:</span>{" "}
              {formatDateTimeLead(filteredData?.trial_tour_datetime)}
            </p>
          )}

          {filteredData?.follow_up_datetime &&
          filteredData?.schedule_for_name ? null : (
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
              <span>Reason:</span> {filteredData?.not_interested_reason}
            </p>
          )}

          {filteredData?.closure_date && (
            <p className="text-sm flex gap-2">
              <span>Date of Closure:</span>{" "}
              {formatAutoDate(filteredData?.closure_date)}
            </p>
          )}

          {/* Right side details */}

          {filteredData?.call_status === "Won" && filteredData?.amount && (
            <p className="text-sm flex gap-2">
              <span>Amount:</span> ₹{filteredData?.amount}
            </p>
          )}
        </div>

        {filteredData?.follow_up_datetime &&
          filteredData?.schedule_for_name && (
            <div className="border-t p-2 border border-[#D4D4D4] rounded-[5px] bg-[#fff]">
              <div className="flex gap-3 justify-between pb-2 border-b border-b-[#D4D4D4] mb-2">
                <strong className="block ">Schedule Follow UP:</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {filteredData?.follow_up_datetime && (
                  <p className="text-sm flex gap-2">
                    <span>Date & Time:</span>{" "}
                    {formatDateTimeLead(filteredData?.follow_up_datetime)}
                  </p>
                )}
                {filteredData?.schedule_for_name && (
                  <p className="text-sm flex gap-2">
                    <span>Follow UP For :</span>{" "}
                    {filteredData?.schedule_for_name}
                  </p>
                )}
              </div>
            </div>
          )}

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
                : `${filteredData?.remark?.slice(0, 50)}${
                    filteredData?.remark?.length > 50 ? "..." : ""
                  }`}
            </p>
            {/* <p className="text-sm text-[#6F6F6F]">Marked By: Swati Singh</p> */}
          </div>
          {/* Child Remark */}
          {childRemark && (
            <div className="mt-2 p-2 bg-white border border-[#D4D4D4] rounded-md">
              <p className="text-xs text-gray-500 mb-1">Updated Remark:</p>
              <p className="text-sm text-black">{childRemark}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center justify-between mt-2 w-full">
          {/* Update button */}
          {filteredData?.status === "PENDING" && (
            <button
              className="mt-3 bg-black text-white py-1 px-4 rounded-[5px] hover:bg-gray-800"
              onClick={() => handleEditLog(filteredData)}
            >
              Update
            </button>
          )}

          {filteredData?.updatedAt && (
            <p className="text-sm text-[#6F6F6F] flex gap-2 text-right w-full justify-end">
              <span>Updated:</span>{" "}
              {formatDateTimeLead(filteredData?.updatedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
