import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../../Helper/helper";

const convertToInputMonth = (value) => {
  const [mm, yyyy] = value.split("/");
  return `${yyyy}-${mm}`;
};


const SetMonthlyTargetsModal = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
  clubOptions,
  viewOption,
}) => {
  const isViewMode = Boolean(viewOption);
  const [data] = useState([]);
  // Target Type options
  const targetTypeOptions = [
    { label: "Collection", value: "COLLECTION" },
    { label: "Revenue", value: "REVENUE" },
  ];

  // Target Status options
  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  useEffect(() => {
    if (!editingOption) return;

    const selectedData = data.find((item) => item.id === editingOption);

    if (!selectedData) return;

    formik.setValues({
      club_id: selectedData.club_id,
      month: convertToInputMonth(selectedData.month),
      target_type:
        selectedData.target_type === "Revenue" ? "REVENUE" : "COLLECTION",
      target_amount: selectedData.target.replace(/,/g, ""),
      status:
        selectedData.status === "Active"
          ? "ACTIVE"
          : selectedData.status === "Inactive"
          ? "INACTIVE"
          : "LOCKED",
    });
  }, [editingOption]);

  return (
    // Modal overlay
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      {/* Modal container */}
      <div
        className="min-h-[50vh] w-[95%] max-w-[600px] mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit Target" : "Create Target"}
          </h2>
          <div
            className="close--lead cursor-pointer"
            onClick={() => {
              formik.resetForm();
              setShowModal(false);
            }}
          >
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        {/* Modal body */}

        <form onSubmit={formik.handleSubmit}>
          <div className="bg-white flex flex-col gap-4 p-6 rounded-b-[10px]">
            {/* Club Name */}
            <div>
              <label className="mb-2 block font-medium">
                Club Name <span className="text-red-500">*</span>
              </label>
              <Select
                options={clubOptions}
                value={clubOptions.find(
                  (option) => option.value === formik.values.club_id
                )}
                onChange={(option) =>
                  formik.setFieldValue("club_id", option.value)
                }
                styles={customStyles}
                placeholder="Select Club"
                isDisabled={isViewMode}
              />
              {formik.touched.club_name && formik.errors.club_name && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.club_name}
                </p>
              )}
            </div>

            {/* Month */}
            <div>
              <label className="mb-2 block font-medium">
                Month <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                name="month"
                value={formik.values.month}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="custom--input w-full"
                placeholder="Select month"
                min="2020-01"
                max="2030-12"
                disabled={isViewMode}
              />
              {formik.touched.month && formik.errors.month && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.month}
                </p>
              )}
            </div>

            {/* Target Type */}
            <div>
              <label className="mb-2 block font-medium">
                Target Type <span className="text-red-500">*</span>
              </label>
              <Select
                name="target_type"
                options={targetTypeOptions}
                value={targetTypeOptions.find(
                  (option) => option.value === formik.values.target_type
                )}
                onChange={(option) =>
                  formik.setFieldValue("target_type", option.value)
                }
                onBlur={() => formik.setFieldTouched("target_type", true)}
                styles={customStyles}
                className="!capitalize"
                placeholder="Select Target Type"
                isDisabled={isViewMode}
              />
              {formik.touched.target_type && formik.errors.target_type && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.target_type}
                </p>
              )}
            </div>

            {/* Target Amount */}
            <div>
              <label className="mb-2 block font-medium">
                Target Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="target_amount"
                value={formik.values.target_amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="custom--input w-full"
                min={0}
                placeholder="Enter target amount"
                disabled={isViewMode}
              />
              {formik.touched.target_amount && formik.errors.target_amount && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.target_amount}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block font-medium">
                Target Status <span className="text-red-500">*</span>
              </label>
              <Select
                name="status"
                options={statusOptions}
                value={statusOptions.find(
                  (option) => option.value === formik.values.status
                )}
                onChange={(option) =>
                  formik.setFieldValue("status", option.value)
                }
                onBlur={() => formik.setFieldTouched("status", true)}
                styles={customStyles}
                className="!capitalize"
                placeholder="Select Status"
                isDisabled={isViewMode}
              />
              {formik.touched.status && formik.errors.status && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.status}
                </p>
              )}
            </div>
          </div>

          {/* Modal action buttons */}
          <div className={`flex gap-4 py-5 justify-end`}>
            <button
              type="button"
              onClick={() => {
                formik.resetForm();
                setShowModal(false);
              }}
              className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
            >
              {editingOption ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetMonthlyTargetsModal;
