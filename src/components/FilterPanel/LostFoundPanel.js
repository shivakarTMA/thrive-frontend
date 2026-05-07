import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoClose, IoTriangle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import { customStyles, formatAutoDate } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { format } from "date-fns";

function isValidDate(value) {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

const StatusOptions = [
  { value: "AVAILABLE", label: "Available" },
  { value: "RETURNED", label: "Returned" },
];

export default function LostFoundPanel({
  filterCategory,
  filterLocation,
  filterStatus,

  formik,
  setFilterValue,
  appliedFilters, // ✅ Receive from parent
  setAppliedFilters, // ✅ Receive from parent
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);

  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("FOUND_LOCATION"));
    dispatch(fetchOptionList("LOST_CATEGORY"));
  }, [dispatch]);

  // Extract Redux lists
  const foundLocation = lists["FOUND_LOCATION"] || [];
  const lostCategory = lists["LOST_CATEGORY"] || [];

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
      category: formik.values.filterCategory,
      found_at_location: formik.values.filterLocation,
      status: formik.values.filterStatus,
    });

    setShowFilters(false);
  };

  // ✅ Remove filter chip - update both parent state and formik
  const handleRemoveFilter = (key) => {
    const keyMap = {
      category: "filterCategory",
      found_at_location: "filterLocation",
      status: "filterStatus",
    };

    // Update parent's applied filters
    setAppliedFilters((prev) => ({ ...prev, [key]: null }));

    // Update formik
    if (keyMap[key]) {
      setFilterValue(keyMap[key], null);
    }
  };

  // ✅ Get display labels for filter chips
  const getFilterLabel = (key, value) => {
    if (!value) return "";

    if (key === "category") {
      const category = lostCategory.find((opt) => opt.value === value);
      return category ? category.label : value;
    }

    if (key === "found_at_location") {
      const location = foundLocation.find((opt) => opt.value === value);
      return location ? location.label : value;
    }

    if (key === "status") {
      const status = StatusOptions.find((opt) => opt.value === value);
      return status ? status.label : value;
    }

    return String(value);
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
              {/* Status */}
              <div>
                <label className="block mb-1 text-sm font-medium">Status</label>
                <Select
                  value={
                    StatusOptions.find((opt) => opt.value === filterStatus) ||
                    null
                  }
                  onChange={(option) =>
                    setFilterValue("filterStatus", option ? option.value : null)
                  }
                  options={StatusOptions}
                  placeholder="Select Status"
                  styles={customStyles}
                />
              </div>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  value={
                    lostCategory.find((opt) => opt.value === filterCategory) ||
                    null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterCategory",
                      option ? option.value : null,
                    )
                  }
                  options={lostCategory}
                  placeholder="Select Category"
                  styles={customStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Found Location
                </label>
                <Select
                  value={
                    foundLocation.find((opt) => opt.value === filterLocation) ||
                    null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterLocation",
                      option ? option.value : null,
                    )
                  }
                  options={foundLocation}
                  placeholder="Select Location"
                  styles={customStyles}
                />
              </div>

              {/* Gym Floor */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gym Floor
                </label>
                <Select
                  value={itemFloor}
                  onChange={setItemFloor}
                  options={gymFloor}
                  placeholder="Select Floor"
                  styles={customStyles}
                />
              </div> */}

              {/* {itemStatus?.value === "AVAILABLE" && (
                <>
                 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Found From
                    </label>
                    <div className="custom--date flex-1">
                      <DatePicker
                        selected={itemFoundFrom}
                        onChange={(date) => {
                          setItemFoundFrom(date);
                          // If end date is before new start date, clear or adjust it
                          if (itemFoundTo && date && itemFoundTo < date) {
                            setItemFoundTo(null);
                          }
                        }}
                        placeholderText="Select start date"
                        className="w-full"
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                      />
                    </div>
                  </div>

                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Found To
                    </label>
                    <div className="custom--date flex-1">
                      <DatePicker
                        selected={itemFoundTo}
                        onChange={(date) => setItemFoundTo(date)}
                        placeholderText="Select end date"
                        className="w-full"
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                        minDate={itemFoundFrom || null}
                        disabled={!itemFoundFrom}
                      />
                    </div>
                  </div>
                </>
              )}

              {itemStatus?.value === "RETURNED" && (
                <>
          
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Returned From
                    </label>
                    <div className="custom--date flex-1">
                      <DatePicker
                        selected={itemReturnedFrom}
                        onChange={(date) => {
                          setItemReturnedFrom(date);
                          // If end date is before new start date, clear or adjust it
                          if (itemReturnedTo && date && itemReturnedTo < date) {
                            setItemReturnedTo(null);
                          }
                        }}
                        placeholderText="Select start date"
                        className="w-full"
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                      />
                    </div>
                  </div>

              
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Returned To
                    </label>
                    <div className="custom--date flex-1">
                      <DatePicker
                        selected={itemReturnedTo}
                        onChange={(date) => setItemReturnedTo(date)}
                        placeholderText="Select end date"
                        className="w-full"
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                        minDate={itemReturnedFrom || null}
                        disabled={!itemReturnedFrom}
                      />
                    </div>
                  </div>
                </>
              )} */}
            </div>

            {/* Apply Button */}
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

      {/* ✅ Applied Filters Chips - using parent's appliedFilters */}
      {Object.values(appliedFilters).some((v) => v) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(appliedFilters).map(([key, value]) => {
            if (!value || key === "club_id") return null;

            const displayValue = getFilterLabel(key, value);

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
