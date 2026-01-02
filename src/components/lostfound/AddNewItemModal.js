import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoCloseCircle } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import { customStyles } from "../../Helper/helper";
import Select from "react-select";
import { FaCalendarDays } from "react-icons/fa6";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";

const AddNewItemModal = ({
  onClose,
  onSuccess,
  clubOptions,
  editingOption,
}) => {
  const leadBoxRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      club_id: null,
      item_name: "",
      category: null,
      description: "",
      found_at_location: null,
      found_date_time: new Date(),
      loggedBy: user?.name,
      notes: "",
      status: "AVAILABLE",
    },
    validationSchema: Yup.object({
      item_name: Yup.string().required("Item Name is required"),
      category: Yup.string().required("Category Name is required"),
      found_at_location: Yup.string().required("Location is required"),
      found_date_time: Yup.date().required("Date & Time is required"),
      description: Yup.string().required("Description is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await authAxios().post("/lost/found/create", values);
        toast.success("Item Successfully Added");

        // Reset form and close modal
        resetForm();
        // Trigger parent to refresh data BEFORE closing
        if (onSuccess) {
          onSuccess();
        }
        // Close modal after refresh
        onClose();

        // Trigger the parent component to fetch updated item list
        // handleUpdateCoins();
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Error submitting form:", error);
      }
    },
  });

  useEffect(() => {
    const fetchProductById = async (id) => {
      try {
        const res = await authAxios().get(`/lost/found/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          formik.setValues({
            club_id: data?.club_id || null,
            item_name: data?.item_name || "",
            category: data?.category || null,
            description: data?.description || "",
            found_at_location: data?.found_at_location || null,
            found_date_time: data?.found_date_time || new Date(),
            loggedBy: data?.loggedBy || user?.name,
            notes: data?.notes || "",
            status: data?.status || "AVAILABLE",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch item details");
      }
    };

    if (editingOption) {
      fetchProductById(editingOption);
    }
  }, [editingOption]);

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

  const handleDateTime = (date) => {
    formik.setFieldValue("found_date_time", date); // Store Date object in Formik
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh]  w-[95%] max-w-xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "View Lost Item" : "Add Lost Item"}
          </h2>
          <div className="close--lead cursor-pointer" onClick={onClose}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>
        <div className="flex-1s flexs ">
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col gap-3 mt-0"
          >
            <div className="p-6 flex-1 bg-white rounded-b-[10px]">
              <div className="grid grid-cols-2 gap-4">
                {/* Club Dropdown */}
                <div>
                  <label className="mb-2 block">
                    Club<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Select
                      name="club_id"
                      value={
                        clubOptions.find(
                          (option) =>
                            option.value.toString() ===
                            formik.values.club_id?.toString()
                        ) || null
                      }
                      options={clubOptions}
                      onChange={(option) =>
                        formik.setFieldValue("club_id", option.value)
                      }
                      onBlur={() => formik.setFieldTouched("club_id", true)}
                      styles={customStyles}
                      className="!capitalize"
                      isDisabled={editingOption}
                    />
                  </div>
                  {formik.touched.club_id && formik.errors.club_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.club_id}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block">
                    Item Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    value={formik.values.item_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Item Name"
                    className={`custom--input w-full ${
                      editingOption
                        ? "!bg-gray-100 pointer-events-none text-gray-500"
                        : ""
                    }`}
                    disabled={editingOption}
                  />
                  {formik.touched.item_name && formik.errors.item_name && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.item_name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block">
                    Category<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="category"
                    value={
                      lostCategory.find(
                        (option) => option.value === formik.values.category
                      ) || null
                    }
                    onChange={(option) =>
                      formik.setFieldValue(
                        "category",
                        option ? option.value : ""
                      )
                    }
                    options={lostCategory}
                    placeholder="Select Category"
                    styles={customStyles}
                    isDisabled={editingOption}
                  />
                  {formik.touched.category && formik.errors.category && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.category}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block">
                    Found At (Location)<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="found_at_location"
                    value={
                      foundLocation.find(
                        (option) =>
                          option.value === formik.values.found_at_location
                      ) || null
                    }
                    onChange={(option) =>
                      formik.setFieldValue(
                        "found_at_location",
                        option ? option.value : ""
                      )
                    }
                    options={foundLocation}
                    placeholder="Select Location"
                    styles={customStyles}
                    isDisabled={editingOption}
                  />
                  {formik.touched.found_at_location &&
                    formik.errors.found_at_location && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.found_at_location}
                      </div>
                    )}
                </div>
                <div>
                  <label className="mb-2 block">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="custom--date flex-1">
                    <span className="absolute z-[1] mt-[11px] ml-[15px]">
                      <FaCalendarDays />
                    </span>
                    <DatePicker
                      selected={
                        formik.values.found_date_time
                          ? new Date(formik.values.found_date_time)
                          : null
                      }
                      onChange={handleDateTime}
                      showTimeSelect
                      timeFormat="hh:mm aa"
                      dateFormat="dd/MM/yyyy hh:mm aa"
                      placeholderText="Select date & time"
                      className="border px-3 py-2 w-full input--icon"
                      maxDate={new Date()}
                      disabled={editingOption}
                    />
                  </div>
                  {formik.touched.found_date_time &&
                    formik.errors.found_date_time && (
                      <p className="text-sm text-red-500 mt-1">
                        {formik.errors.found_date_time}
                      </p>
                    )}
                </div>
                <div>
                  <label className="mb-2 block">Logged By</label>
                  <input
                    name="loggedBy"
                    type="text"
                    value={formik.values.loggedBy}
                    disabled={true}
                    className="custom--input w-full !bg-gray-100 pointer-events-none text-gray-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block">
                    Description<span className="text-red-500">*</span>
                  </label>

                  <input
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    placeholder="Description"
                    disabled={editingOption}
                    className={`custom--input w-full ${
                      editingOption
                        ? "!bg-gray-100 pointer-events-none text-gray-500"
                        : ""
                    }`}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.description}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block">Notes</label>

                  <textarea
                    name="notes"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    placeholder="Any additional remarks"
                    className={`custom--input w-full ${
                      editingOption
                        ? "!bg-gray-100 pointer-events-none text-gray-500"
                        : ""
                    }`}
                    disabled={editingOption}
                  />
                </div>
              </div>
            </div>
            {!editingOption && (
              <div className="flex gap-4 py-5 pt-0 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
                >
                  Submit
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewItemModal;
