import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { IoClose, IoTriangle } from "react-icons/io5";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";

const BookingTypeOption = [
  { value: "FREE", label: "Free" },
  { value: "PAID", label: "Paid" },
];

export default function GroupClassPanel({
  filterCategory,
  filterBookingType,
  filterTrainer,

  formik,
  setFilterValue,
  appliedFilters, // ✅ Receive from parent
  setAppliedFilters, // ✅ Receive from parent
  userRole,
  clubId,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);
  const [trainerList, setTrainerList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  // Fetch staff list from API
  const fetchTrainer = async (club_id = null) => {
    try {
      const params = { role: "TRAINER" };

      // ✅ If club_id is provided, filter by club, otherwise show all
      if (club_id) {
        params.club_id = club_id;
      }

      const response = await authAxios().get("/staff/list", { params });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setTrainerList(activeOnly);
    } catch (error) {
      console.error("Failed to fetch trainers:", error);
      toast.error("Failed to fetch trainers");
    }
  };

  const fetchCategoryClass = async (club_id = null) => {
    try {
      const params = {};
      if (club_id) {
        params.club_id = club_id;
      }
      const response = await authAxios().get("/package-category/list", {
        params,
      });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setCategoryList(activeOnly);
    } catch (error) {
      console.error("Failed to fetch category:", error);
      toast.error("Failed to fetch category");
    }
  };

  // useEffect(() => {
  //   if (clubId) {
  //     fetchTrainer(clubId);
  //     fetchCategoryClass(clubId);

  //     setFilterValue("filterTrainer", null);
  //     setFilterValue("filterCategory", null);
  //     setCategoryList([]);
  //   }
  // }, [clubId]);

  useEffect(() => {
    if (clubId) {
      fetchTrainer(clubId);
      fetchCategoryClass(clubId);
    }

    // ✅ Reset Formik filter values
    setFilterValue("filterCategory", null);
    setFilterValue("filterBookingType", null);
    setFilterValue("filterTrainer", null);

    // ✅ Reset parent applied filters
    setAppliedFilters({
      package_category_id: null,
      booking_type: null,
      trainer_id: null,
    });

    // ✅ Optional: clear local lists while loading new club data
    setTrainerList([]);
    setCategoryList([]);
  }, [clubId]);

  const trainerOptions =
    trainerList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const CategoryOptions =
    categoryList?.map((item) => ({
      label: item.title,
      value: item.id,
    })) || [];

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
      package_category_id: formik.values.filterCategory,
      booking_type: formik.values.filterBookingType,
      trainer_id: formik.values.filterTrainer,
    });

    setShowFilters(false);
  };

  // ✅ Remove filter chip - update both parent state and formik
  const handleRemoveFilter = (key) => {
    const keyMap = {
      package_category_id: "filterCategory",
      booking_type: "filterBookingType",
      trainer_id: "filterTrainer",
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

    if (key === "package_category_id") {
      const category = CategoryOptions.find((opt) => opt.value === value);
      return category ? category.label : value;
    }

    if (key === "booking_type") {
      const bookingType = BookingTypeOption.find((opt) => opt.value === value);
      return bookingType ? bookingType.label : value;
    }

    if (key === "trainer_id") {
      const trainerId = trainerOptions.find((opt) => opt.value === value);
      return trainerId ? trainerId.label : value;
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
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Category
                </label>
                <Select
                  value={
                    CategoryOptions.find(
                      (opt) => opt.value === filterCategory,
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterCategory",
                      option ? option.value : null,
                    )
                  }
                  options={CategoryOptions}
                  placeholder="Select Category"
                  styles={customStyles}
                  // isClearable
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Booking Type
                </label>
                <Select
                  value={
                    BookingTypeOption.find(
                      (opt) => opt.value === filterBookingType,
                    ) || null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterBookingType",
                      option ? option.value : null,
                    )
                  }
                  options={BookingTypeOption}
                  placeholder="Select Booking Type"
                  styles={customStyles}
                  // isClearable
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Trainer Name
                </label>
                <Select
                  value={
                    trainerOptions.find((opt) => opt.value === filterTrainer) ||
                    null
                  }
                  onChange={(option) =>
                    setFilterValue(
                      "filterTrainer",
                      option ? option.value : null,
                    )
                  }
                  options={trainerOptions}
                  placeholder="Select trainer"
                  styles={customStyles}
                  // isClearable
                />
              </div>
            </div>

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
