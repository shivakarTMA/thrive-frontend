import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { IoClose, IoTriangle } from "react-icons/io5";
import { customStyles } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

const BillTypeOptions = [
  { value: "New", label: "New" },
  { value: "Renewal", label: "Renewal" },
];

const ServiceTypeOptions = [
  { value: "Membership", label: "Membership" },
  { value: "Package", label: "Package" },
  { value: "Product", label: "Product" },
];

export default function TrialAppointmentPanel({
  itemBillType,
  setItemBillType,
  itemServiceType,
  setItemServiceType,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);

  const [appliedFilters, setAppliedFilters] = useState({
    bill_type: itemBillType,
    service_type: itemServiceType,
  });

  useEffect(() => {
    if (itemBillType || itemServiceType) {
      setAppliedFilters({
        bill_type: itemBillType,
        service_type: itemServiceType,
      });
      console.log("✅ Auto-applied filters from URL:", {
        bill_type: itemBillType,
        service_type: itemServiceType,
      });
    }
  }, [itemBillType, itemServiceType]);

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

  const handleSubmitFilters = () => {
    const filters = {
      bill_type: itemBillType,
      service_type: itemServiceType,
    };

    setAppliedFilters(filters); // ✅ Only update on click
    console.log(filters, "✅ Submitted Filters");
    setShowFilters(false);
  };

  const removeFilter = (filter) => {
    if (filter === "bill_type") {
      setItemBillType(null);
      setAppliedFilters((prev) => ({ ...prev, bill_type: null }));
    } else if (filter === "service_type") {
      setItemServiceType(null);
      setAppliedFilters((prev) => ({ ...prev, service_type: null }));
    }
  };

  return (
    <div className="relative max-w-fit w-full" ref={panelRef}>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-[34px] h-[30px] bg-white text-black rounded-[5px] flex items-center justify-center gap-2 min-h-[30px] border-[#D4D4D4] border-[2px]"
        >
          <HiOutlineAdjustmentsHorizontal className="text-lg" />
        </button>
        <span className="text-md">Filters</span>
      </div>

      {showFilters && (
        <div className="absolute top-[100%] mt-4 z-[333] bg-white border rounded-lg shadow-md animate-fade-in">
          <div className="absolute top-[-15px] left-[20px]">
            <IoTriangle />
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 min-w-[500px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Type
                </label>
                <Select
                  value={itemBillType}
                  onChange={setItemBillType}
                  options={BillTypeOptions}
                  placeholder="Select Type"
                  styles={customStyles}
                />
              </div>
              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <Select
                  value={itemServiceType}
                  onChange={setItemServiceType}
                  options={ServiceTypeOptions}
                  placeholder="Select Type"
                  styles={customStyles}
                />
              </div>
            </div>

            {/* Reset */}
            <div className="flex justify-between pt-3">
              <button
                onClick={handleSubmitFilters}
                className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 cursor-pointer ml-auto"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      {Object.keys(appliedFilters).length > 0 && (
        <div
          className={`gap-2 mt-4 ${
            Object.keys(appliedFilters).some((key) => appliedFilters[key])
              ? "flex"
              : "hidden"
          }`}
        >
          {Object.entries(appliedFilters).map(
            ([key, value]) =>
              value && (
                <div
                  key={key}
                  className="flex items-center justify-between gap-1 border rounded-full bg-[#EEEEEE] min-h-[30px] px-3 text-sm"
                >
                  <span>{value.label || value}</span>
                  <IoClose
                    onClick={() => removeFilter(key)}
                    className="cursor-pointer text-xl"
                  />
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
