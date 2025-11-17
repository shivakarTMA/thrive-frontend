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
  itemStatus,
  setItemStatus,
  itemCategory,
  setItemCategory,
  itemLocation,
  setItemLocation,
  itemFloor,
  setItemFloor,
  itemFoundFrom,
  setItemFoundFrom,
  itemFoundTo,
  setItemFoundTo,
  itemReturnedFrom,
  setItemReturnedFrom,
  itemReturnedTo,
  setItemReturnedTo,
  onApplyFilters,
  onRemoveFilter,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);

  const [appliedFilters, setAppliedFilters] = useState({
    status: itemStatus,
    category: itemCategory,
    found_at_location: itemLocation,
    floor: itemFloor,
    found_from: itemFoundFrom,
    found_to: itemFoundTo,
    returned_from: itemReturnedFrom,
    returned_to: itemReturnedTo,
  });

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

  const gymFloor = [
    { value: "Ground Floor", label: "Ground Floor" },
    { value: "First Floor", label: "First Floor" },
    { value: "Second Floor", label: "Second Floor" },
  ];

  const handleSubmitFilters = () => {
    const applied = {
      status: itemStatus?.value,
      category: itemCategory?.value,
      found_at_location: itemLocation?.value,
      floor: itemFloor?.value,
      found_from: itemFoundFrom ? format(itemFoundFrom, "yyyy-MM-dd") : null,
      found_to: itemFoundTo ? format(itemFoundTo, "yyyy-MM-dd") : null,
      returned_from: itemReturnedFrom
        ? format(itemReturnedFrom, "yyyy-MM-dd")
        : null,
      returned_to: itemReturnedTo ? format(itemReturnedTo, "yyyy-MM-dd") : null,
    };

    setAppliedFilters(applied);
    setShowFilters(false);

    if (onApplyFilters) {
      onApplyFilters(applied);
    }
  };

  const removeFilter = (filterKey) => {
    // ✅ Fixed: Correct setter map without .value
    const setterMap = {
      status: setItemStatus,
      category: setItemCategory,
      found_at_location: setItemLocation,
      floor: setItemFloor,
      found_from: setItemFoundFrom,
      found_to: setItemFoundTo,
      returned_from: setItemReturnedFrom,
      returned_to: setItemReturnedTo,
    };

    // ✅ Clear value in child state
    setterMap[filterKey]?.(null);

    // ✅ Update applied filters state
    const updatedFilters = { ...appliedFilters, [filterKey]: null };
    setAppliedFilters(updatedFilters);

    // ✅ Tell parent to refetch without this filter
    if (onRemoveFilter) {
      const remaining = Object.fromEntries(
        Object.entries(updatedFilters).filter(
          ([_, v]) => v !== null && v !== undefined
        )
      );
      onRemoveFilter(remaining);
    }
  };

  // Reset dates whenever the itemStatus changes
  useEffect(() => {
    setItemFoundFrom(null);
    setItemFoundTo(null);
    setItemReturnedFrom(null);
    setItemReturnedTo(null);
  }, [itemStatus]);

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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={itemStatus}
                  onChange={setItemStatus}
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
                  value={itemCategory}
                  onChange={setItemCategory}
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
                  value={itemLocation}
                  onChange={setItemLocation}
                  options={foundLocation}
                  placeholder="Select Location"
                  styles={customStyles}
                />
              </div>

              {/* Gym Floor */}
              <div>
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
              </div>

              {itemStatus?.value === "AVAILABLE" && (
                <>
                  {/* Found From Date */}
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

                  {/* Found To Date */}
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
                  {/* Returned From Date */}
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

                  {/* Returned To Date */}
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
              )}
            </div>

            {/* Apply Button */}
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

      {/* Applied Filters Display */}
      {Object.values(appliedFilters).some((value) => value) && (
        <div className="flex gap-2 mt-4 flex-wrap">
          {Object.entries(appliedFilters).map(([key, value]) => {
            if (!value) return null;

            // Format display label
            let displayLabel = value;
            if (
              key === "status" ||
              key === "category" ||
              key === "found_at_location" ||
              key === "floor"
            ) {
              const stateMap = {
                status: itemStatus,
                category: itemCategory,
                found_at_location: itemLocation,
                floor: itemFloor,
              };
              displayLabel = stateMap[key]?.label || value;
            } else if (key.includes("from") || key.includes("to")) {
              // Display dates in readable format
              // displayLabel = value;
                if (isValidDate(value)) {
                  const parsedDate = new Date(value);
                  displayLabel = formatAutoDate(parsedDate);
                }
            }

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-1 border rounded-full bg-[#EEEEEE] min-h-[30px] px-3 text-sm"
              >
                <span>{displayLabel}</span>
                <IoClose
                  onClick={() => removeFilter(key)}
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
