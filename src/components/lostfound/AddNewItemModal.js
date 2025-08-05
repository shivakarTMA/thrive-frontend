import React, { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoCloseCircle } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";

const AddNewItemModal = ({ item, onClose, onSubmit }) => {
  const { user } = useSelector((state) => state.auth);
  const leadBoxRef = useRef(null);
  const formik = useFormik({
    initialValues: {
      item: "",
      date: new Date(),
      description: "",
      location: "",
      image: null,
      clubName: "",
    },
    validationSchema: Yup.object({
      item: Yup.string().required("Item Name is required"),
      date: Yup.date().required("Date is required"),
      description: Yup.string().required("Description is required"),
      clubName: Yup.string().required("Club Name is required"),
    }),
    onSubmit: (values) => {
      const newItem = {
        id: Date.now(),
        item: values.item,
        date: values.date.toISOString().split("T")[0],
        description: values.description,
        location: values.location,
        itemImage: values.image ? URL.createObjectURL(values.image) : null,
        foundBy: user?.name,
        clubName: values.clubName,
        status: "Lost",
      };

      console.log(newItem, "newItem");

      onSubmit(newItem);
    },
  });

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
                    Date<span className="text-red-500">*</span>
                  </label>
                  <div className="custom--date relative">
                    <DatePicker
                      selected={formik.values.date}
                      onChange={(date) => formik.setFieldValue("date", date)}
                    />
                  </div>
                  {formik.touched.date && formik.errors.date && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.date}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Location"
                    className="custom--input w-full"
                  />
                </div>
                <div>
                  <label className="mb-2 block">Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={(event) =>
                      formik.setFieldValue(
                        "image",
                        event.currentTarget.files[0]
                      )
                    }
                    className="custom--input w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block">
                    Club Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="clubName"
                    value={formik.values.clubName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Club Name"
                    className="custom--input w-full"
                  />
                  {formik.touched.clubName && formik.errors.clubName && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.clubName}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block">Description</label>

                  <textarea
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    placeholder="Description"
                    className="custom--input w-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 py-5 pt-0 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-black border border-black text-white font-semibold rounded max-w-[150px] w-full"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewItemModal;
