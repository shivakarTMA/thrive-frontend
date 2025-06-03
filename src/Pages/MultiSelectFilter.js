import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { FaFilter } from "react-icons/fa";
import { RiResetLeftFill } from "react-icons/ri";
import { IoTriangle } from "react-icons/io5";
import { customStyles } from "../Helper/helper";

export default function FiltersPanel({
  selectedLeadSource,
  setSelectedLeadSource,
  selectedLeadType,
  setSelectedLeadType,
  selectedLeadStatus,
  setSelectedLeadStatus,
  selectedCallTag,
  setSelectedCallTag,
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

  const leadSourceOptions = [
    { label: "Hoardings", value: "Hoardings" },
    { label: "Google", value: "Google" },
    { label: "Social Media", value: "Social Media" },
    { label: "Referral", value: "Referral" },
    { label: "Corporate", value: "Corporate" },
    { label: "Word of Mouth", value: "Word of Mouth" },
    { label: "Thrive App", value: "Thrive App" },
    { label: "Website", value: "Website" },
    { label: "Events / Campaigns", value: "Events / Campaigns" },
    { label: "Corporate Outreach", value: "Corporate Outreach" },
    { label: "QR Code", value: "QR Code" },
  ];

  const leadTypeOptions = [
    { label: "Walk-in", value: "walk-in" },
    { label: "Phone", value: "phone" },
    { label: "Email", value: "email" },
    { label: "WhatsApp", value: "whatsApp" },
  ];

  const leadStatusOptions = [
    { label: "New", value: "new" },
    { label: "Lead", value: "lead" },
    { label: "Opportunity", value: "opportunity" },
    { label: "Won", value: "won" },
    { label: "Closed", value: "closed" },
    { label: "Lost", value: "lost" },
  ];

  const staffOptions = [
    { label: "John", value: "John" },
    { label: "Preeti", value: "Preeti" },
  ];

  const resetFilters = () => {
    setSelectedLeadSource(null);
    setSelectedLeadType(null);
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
            <div className="flex flex-col gap-4 min-w-[200px]">
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

              {/* Lead Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Type
                </label>
                <Select
                  value={selectedLeadType}
                  onChange={setSelectedLeadType}
                  options={leadTypeOptions}
                  // isClearable
                  placeholder="Select Lead Type"
                  styles={customStyles}
                />
              </div>

              {/* Staff */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff
                </label>
                <Select
                  value={selectedCallTag}
                  onChange={setSelectedCallTag}
                  options={staffOptions}
                  // isClearable
                  placeholder="Select Staff"
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
