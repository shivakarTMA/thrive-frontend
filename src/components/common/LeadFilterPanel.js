import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { FaFilter } from "react-icons/fa";
import { RiResetLeftFill } from "react-icons/ri";
import { IoTriangle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import { customStyles } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

export default function LeadFilterPanel({
  selectedLeadSource,
  setSelectedLeadSource,
  selectedLastCallType,
  selectedLeadStatus,
  setSelectedLeadStatus,
  selectedCallTag,
  setSelectedCallTag,
  setSelectedLastCallType,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);

  
  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
  }, [dispatch]);

  // Extract Redux lists
  const leadsSources = lists["LEAD_SOURCE"] || [];

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
  { value: "new", label: "New" },
  { value: "lead", label: "Lead" },
  { value: "opportunity", label: "Opportunity" },
  { value: "won", label: "Won" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
  { value: "future prospect", label: "Future Prospect" },
  ];

  const lastCallStatusOptions = [
{ value: "new", label: "New" },
  { value: "lead", label: "Lead" },
  { value: "opportunity", label: "Opportunity" },
  { value: "won", label: "Won" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
  { value: "future prospect", label: "Future Prospect" },
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
    setSelectedLeadStatus(null);
    setSelectedCallTag(null);
    setSelectedLastCallType(null)
  };

  return (
    <div className="relative max-w-fit w-full" ref={panelRef}>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-12 h-10 bg-black text-white rounded-lg flex items-center justify-center gap-2 min-h-[44px]"
      >
        <HiOutlineAdjustmentsHorizontal className="text-2xl" />
        {/* {showFilters ? "Hide Filters" : "Show Filters"} */}
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
                  options={leadsSources}
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
