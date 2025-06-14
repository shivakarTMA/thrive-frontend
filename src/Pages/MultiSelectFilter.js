import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { FaFilter } from "react-icons/fa";
import { RiResetLeftFill } from "react-icons/ri";
import { IoTriangle } from "react-icons/io5";
import { customStyles } from "../Helper/helper";

export default function FiltersPanel({
  selectedLeadSource,
  setSelectedLeadSource,
  selectedLeadStage,
  selectedLastCallType,
  setSelectedLeadStage,
  selectedLeadStatus,
  setSelectedLeadStatus,
  selectedCallTag,
  setSelectedCallTag,
  setSelectedLastCallType,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  const leadStatusOptions = [
    { label: "Open", value: "Open" },
    { label: "In Progress", value: "In Progress" },
    { label: "Closed", value: "Closed" },
    { label: "Lost", value: "Lost" },
  ];

  const leadSourceOptions = [
    { label: "Website", value: "Website" },
    { label: "Referral", value: "Referral" },
    { label: "Social Media", value: "Social Media" },
    { label: "Email Campaign", value: "Email Campaign" },
    { label: "LinkedIn", value: "LinkedIn" },
    { label: "Google Ads", value: "Google Ads" },
    { label: "Facebook Ads", value: "Facebook Ads" },
    { label: "Direct Visit", value: "Direct Visit" },
    { label: "Cold Call", value: "Cold Call" },
    { label: "Trade Show", value: "Trade Show" },
  ];

  const leadStageOptions = [
    { label: "Enquiry", value: "Enquiry" },
    { label: "Trial Scheduled", value: "Trial Scheduled" },
    { label: "Post Trial", value: "Post Trial" },
    { label: "Won", value: "Won" },
    { label: "Lost", value: "Lost" },
  ];

  const lastCallStatusOptions = [
    { label: "New", value: "New" },
    { label: "Trial Scheduled", value: "Trial Scheduled" },
    { label: "Won", value: "Won" },
    { label: "Post Trial Follow-up", value: "Post Trial Follow-up" },
    { label: "Not Interested", value: "Not Interested" },
    { label: "Follow-up", value: "Follow-up" },
    { label: "Busy Tone", value: "Busy Tone" },
    {
      label: "Switched Off/ Out of Reach",
      value: "Switched Off/ Out of Reach",
    },
    { label: "Future Prospect", value: "Future Prospect" },
    { label: "No Answer", value: "No Answer" },
  ];

  const leadOwnerOptions = [
    { label: "Alice Johnson", value: "Alice Johnson" },
    { label: "Bob Thompson", value: "Bob Thompson" },
    { label: "Cara White", value: "Cara White" },
    { label: "Derek Miles", value: "Derek Miles" },
    { label: "Emily Watson", value: "Emily Watson" },
    { label: "Nina Brown", value: "Nina Brown" },
    { label: "Zack Lee", value: "Zack Lee" },
    { label: "Linda Marks", value: "Linda Marks" },
    { label: "Raj Mehta", value: "Raj Mehta" },
    { label: "Sofia Green", value: "Sofia Green" },
  ];

  const resetFilters = () => {
    setSelectedLeadSource(null);
    setSelectedLeadStage(null);
    setSelectedLeadStatus(null);
    setSelectedCallTag(null);
  };

  return (
    <div className="relative max-w-[145px] w-full" ref={panelRef}>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 w-full"
      >
        <FaFilter />
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {showFilters && (
        <div className="absolute top-[100%] mt-4 z-[333] bg-white border rounded-lg shadow-md animate-fade-in">
          <div className="absolute top-[-15px] left-[20px]">
            <IoTriangle />
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 min-w-[500px]">
              {/* Lead Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Source
                </label>
                <Select
                  value={selectedLeadSource}
                  onChange={setSelectedLeadSource}
                  options={leadSourceOptions}
                  // isClearable
                  placeholder="Select Lead Source"
                  styles={customStyles}
                />
              </div>
              {/* Lead Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Status
                </label>
                <Select
                  value={selectedLeadStatus}
                  onChange={setSelectedLeadStatus}
                  options={leadStatusOptions}
                  // isClearable
                  placeholder="Select Lead Status"
                  styles={customStyles}
                />
              </div>

              {/* Lead Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Stage
                </label>
                <Select
                  value={selectedLeadStage}
                  onChange={setSelectedLeadStage}
                  options={leadStageOptions}
                  // isClearable
                  placeholder="Select Lead Type"
                  styles={customStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Call Status
                </label>
                <Select
                  value={selectedLastCallType}
                  onChange={setSelectedLastCallType}
                  options={lastCallStatusOptions}
                  // isClearable
                  placeholder="Select Lead Type"
                  styles={customStyles}
                />
              </div>

              {/* Lead Owner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Owner
                </label>
                <Select
                  value={selectedCallTag}
                  onChange={setSelectedCallTag}
                  options={leadOwnerOptions}
                  // isClearable
                  placeholder="Select Lead Owner"
                  styles={customStyles}
                />
              </div>
            </div>

            {/* Reset */}
            <div className="pt-3">
              <button
                onClick={resetFilters}
                className="text-[12px] flex items-center gap-1 justify-end ml-auto bg-black text-white p-1 rounded-[5px]"
              >
                <RiResetLeftFill className="mt-[1px]" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
