import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { IoClose, IoTriangle } from "react-icons/io5";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";

const BillTypeOptions = [
  { value: "New", label: "New" },
  { value: "Renewal", label: "Renewal" },
];

export default function TrialAppointmentPanel({

  formik,
  filterClub,
  filterTrainer,
  filterBookingStatus,
  setFilterValue,
  appliedFilters, // ✅ Receive from parent
  setAppliedFilters, // ✅ Receive from parent
  filteredStatusOptions,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);
  const [clubList, setClubList] = useState([]);

  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      if (activeOnly.length === 1) {
        setFilterValue("filterClub", activeOnly[0].id);
      }
      setClubList(activeOnly);
    } catch (error) {
      toast.error("Failed to fetch clubs");
    }
  };

  const clubOptions =
    clubList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  useEffect(() => {
    fetchClub();
  }, []);

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

  // ✅ Apply button - update parent's appliedFilters
  const handleApply = () => {
    setAppliedFilters({
      club_id: formik.values.filterClub,
      trainer_name: formik.values.filterTrainer,
      booking_status: formik.values.filterBookingStatus,
    });

    setShowFilters(false);
  };

  // ✅ Remove filter chip - update both parent state and formik
  const handleRemoveFilter = (key) => {
    const keyMap = {
      club_id: "filterClub",
      trainer_name: "filterTrainer",
      booking_status: "filterBookingStatus",
    };

    // Update parent's applied filters
    setAppliedFilters((prev) => ({ ...prev, [key]: null }));

    // Update formik
    if (keyMap[key]) {
      setFilterValue(keyMap[key], null);
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
                <label className="block mb-1 text-sm font-medium">Club</label>
                <Select
                  value={
                    clubOptions.find((opt) => opt.value === filterClub) || null
                  }
                  onChange={(option) =>
                    setFilterValue("filterClub", option ? option.value : null)
                  }
                  options={clubOptions}
                  placeholder="Select Club"
                  styles={customStyles}
                  isClearable
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Status
                </label>
                <Select
                  value={
                    filteredStatusOptions.find(
                      (opt) => opt.value === filterBookingStatus
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterBookingStatus",
                      option ? option.value : null
                    )
                  }
                  options={filteredStatusOptions}
                  placeholder="Select Status"
                  styles={customStyles}
                  isClearable
                />
              </div>
            </div>

            {/* Reset */}
            <div className="flex justify-between pt-3">
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 cursor-pointer ml-auto"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      {Object.values(appliedFilters).some((v) => v) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(appliedFilters).map(([key, value]) => {
            if (!value) return null;

            let options;
            if (key === "club_id") options = clubOptions;
            if (key === "trainer_name") options = BillTypeOptions;
            if (key === "booking_status") options = filteredStatusOptions;
      

            let displayValue = "";
            if (value instanceof Date) {
              displayValue = value.toLocaleDateString();
            } else if (options) {
              const matched = options.find((opt) => opt.value === value);
              displayValue = matched ? matched.label : String(value);
            } else {
              displayValue = String(value);
            }

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-1 border rounded-full bg-[#EEEEEE] min-h-[30px] px-3 text-sm"
              >
                <span>{displayValue}</span>
                <IoClose
                  onClick={() => handleRemoveFilter(key)}
                  className="cursor-pointer text-xl"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
