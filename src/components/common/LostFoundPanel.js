import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoClose, IoTriangle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import { customStyles } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { format } from "date-fns";

const StatusOptions = [
  { value: "Available", label: "Available" },
  { value: "Returned", label: "Returned" },
  { value: "Claimed Pending", label: "Claimed Pending" },
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
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);

  const [appliedFilters, setAppliedFilters] = useState({
    status: itemStatus,
    category: itemCategory,
    location: itemLocation,
    floor: itemFloor,
    found_from: itemFoundFrom,
    found_to: itemFoundTo,
    returned_from: itemReturnedFrom,
    returned_to: itemReturnedTo,
  });

  console.log(appliedFilters, "appliedFilters");

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
    const filters = {
      status: itemStatus?.value,
      category: itemCategory?.value,
      location: itemLocation?.value,
      floor: itemFloor?.value,
      found_from: itemFoundFrom ? format(itemFoundFrom, "MM/dd/yyyy") : null,
      found_to: itemFoundTo ? format(itemFoundTo, "MM/dd/yyyy") : null,
      returned_from: itemReturnedFrom
        ? format(itemReturnedFrom, "MM/dd/yyyy")
        : null,
      returned_to: itemReturnedTo ? format(itemReturnedTo, "MM/dd/yyyy") : null,
    };

    setAppliedFilters(filters); // ✅ Only update on click
    console.log(filters, "✅ Submitted Filters");
    setShowFilters(false);
  };

  const removeFilter = (filter) => {
    if (filter === "status") {
      setItemStatus(null);
      setAppliedFilters((prev) => ({ ...prev, status: null }));
    } else if (filter === "category") {
      setItemCategory(null);
      setAppliedFilters((prev) => ({ ...prev, category: null }));
    } else if (filter === "location") {
      setItemLocation(null);
      setAppliedFilters((prev) => ({ ...prev, location: null }));
    } else if (filter === "floor") {
      setItemFloor(null);
      setAppliedFilters((prev) => ({ ...prev, floor: null }));
    } else if (filter === "found_from") {
      setItemFoundFrom(null);
      setAppliedFilters((prev) => ({ ...prev, found_from: null }));
    } else if (filter === "found_to") {
      setItemFoundTo(null);
      setAppliedFilters((prev) => ({ ...prev, found_to: null }));
    } else if (filter === "returned_from") {
      setItemReturnedFrom(null);
      setAppliedFilters((prev) => ({ ...prev, returned_from: null }));
    } else if (filter === "returned_to") {
      setItemReturnedTo(null);
      setAppliedFilters((prev) => ({ ...prev, returned_to: null }));
    }
  };

  // Reset dates whenever the itemStatus changes
  useEffect(() => {
    // Reset all dates when the status changes
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

              {itemStatus?.value === "Available" ||
              itemStatus?.value === "Claimed Pending" ? (
                <>
                  {/* Found From Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Found From
                    </label>
                    <div className="custom--date flex-1">
                      <DatePicker
                        selected={itemFoundFrom}
                        onChange={(date) => setItemFoundFrom(date)}
                        placeholderText="Select start date"
                        className="w-full"
                        dateFormat="MM/dd/yyyy"
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
                        dateFormat="MM/dd/yyyy"
                        maxDate={new Date()}
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {itemStatus?.value === "Returned" ||
              itemStatus?.value === "Claimed Pending" ? (
                <>
                  {/* Returned From Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Returned From
                    </label>
                    <div className="custom--date flex-1">
                      <DatePicker
                        selected={itemReturnedFrom}
                        onChange={(date) => setItemReturnedFrom(date)}
                        placeholderText="Select start date"
                        className="w-full"
                        dateFormat="MM/dd/yyyy"
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
                        dateFormat="MM/dd/yyyy"
                        maxDate={new Date()}
                      />
                    </div>
                  </div>
                </>
              ) : null}
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
