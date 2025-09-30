import React, { useEffect, useRef } from "react";
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

const AddNewItemModal = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);
  console.log(user, "user");
  const leadBoxRef = useRef(null);
  const formik = useFormik({
    initialValues: {
      item: "",
      category: null,
      description: "",
      foundAt: null,
      date_time: new Date(),
      loggedBy: "Nitin",
      notes: "",
    },
    validationSchema: Yup.object({
      item: Yup.string().required("Item Name is required"),
      category: Yup.string().required("Category Name is required"),
      description: Yup.string().required("Description is required"),
      foundAt: Yup.string().required("Location is required"),
      date_time: Yup.date().required("Date & Time is required"),
    }),
    onSubmit: (values) => {
      console.log(values, "Lost & found");
      toast.success('Item Successfully Added')
      onClose();
    },
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

  const handleDateTime = (date) => {
    formik.setFieldValue("date_time", date); // Store Date object in Formik
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
          <h2 className="text-xl font-semibold">Add New Lost Item</h2>
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
                <div>
                  <label className="mb-2 block">
                    Item Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="item"
                    value={formik.values.item}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Item Name"
                    className="custom--input w-full"
                  />
                  {formik.touched.item && formik.errors.item && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.item}
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
                    onChange={(option) => formik.setFieldValue("category", option ? option.value : "")} 
                    options={lostCategory}
                    placeholder="Select Category"
                    styles={customStyles}
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
                    name="foundAt"
                    value={
                      foundLocation.find(
                        (option) => option.value === formik.values.foundAt
                      ) || null
                    }
                    onChange={(option) => formik.setFieldValue("foundAt", option ? option.value : "")} 
                    options={foundLocation}
                    placeholder="Select Location"
                    styles={customStyles}
                  />
                  {formik.touched.foundAt && formik.errors.foundAt && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.foundAt}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="custom--date flex-1">
                    <span className="absolute z-[1] mt-[15px] ml-[15px]">
                      <FaCalendarDays />
                    </span>
                    <DatePicker
                      selected={
                        formik.values.date_time
                          ? new Date(formik.values.date_time)
                          : null
                      }
                      onChange={handleDateTime}
                      showTimeSelect
                      timeFormat="hh:mm aa"
                      dateFormat="MM/dd/yyyy hh:mm aa"
                      placeholderText="Select date & time"
                      className="border px-3 py-2 w-full input--icon"
                      maxDate={new Date()}
                    />
                  </div>
                  {formik.touched.date_time && formik.errors.date_time && (
                    <p className="text-sm text-red-500 mt-1">
                      {formik.errors.date_time}
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
                    className="custom--input w-full"
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
                    className="custom--input w-full"
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
                    className="custom--input w-full"
                  />
                </div>
              </div>
            </div>
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewItemModal;
