import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaListOl, FaListUl } from "react-icons/fa6";
import { LuPlug } from "react-icons/lu";
import Select from "react-select";
import { selectIcon } from "../../Helper/helper";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";

const CreateOption = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
  optionTypes = [],
}) => {
  const [availableTags, setAvailableTags] = useState(optionTypes);

  useEffect(() => {
    setAvailableTags(optionTypes); // update when parent prop changes
  }, [optionTypes]);

  // useEffect(() => {
  //   if (
  //     formik.values.option_list_type &&
  //     !availableTags.some(opt => opt.value === formik.values.option_list_type)
  //   ) {
  //     setAvailableTags(prev => [
  //       ...prev,
  //       {
  //         value: formik.values.option_list_type,
  //         label: formik.values.option_list_type
  //       }
  //     ]);
  //   }
  // }, [formik.values.option_list_type, availableTags]);

const handleTagChange = (newValue, actionMeta) => {
  if (actionMeta.action === "create-option") {
    // Transform: "employee category" -> "EMPLOYEE_CATEGORY"
    const formattedValue = newValue.label
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

    const newTag = {
      label: newValue.label, // Keep the user-friendly label
      value: formattedValue, // Store uppercase underscore version
    };

    setAvailableTags((prev) => [...prev, newTag]);
    formik.setFieldValue("option_list_type", newTag.value);
  } else {
    formik.setFieldValue("option_list_type", newValue ? newValue.value : "");
  }
};


  console.log(formik.values, "formik");

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit Option" : "Create Option"}
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

        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {/* Option Name */}
                  <div>
                    <label className="mb-2 block">
                      Option List Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Type of List */}
                  <div>
                    <label className="mb-2 block">
                      Type of List<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <CreatableSelect
                        options={availableTags}
                        value={
                          formik.values.option_list_type
                            ? availableTags.find(
                                (opt) =>
                                  opt.value === formik.values.option_list_type
                              )
                            : null
                        }
                        onChange={handleTagChange}
                        styles={selectIcon}
                        isClearable
                        isDisabled={editingOption ? true : false}
                      />
                    </div>
                    {formik.touched.option_list_type &&
                      formik.errors.option_list_type && (
                        <p className="text-red-500 text-sm mt-1">
                          Type of List is required
                        </p>
                      )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="mb-2 block">Postion</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListOl />
                      </span>
                      <input
                        type="number"
                        name="position"
                        value={formik.values.position}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.position && formik.errors.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.position}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block">
                      Club Status<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <LuPlug />
                      </span>
                      <Select
                        name="status"
                        value={{
                          label: formik.values.status,
                          value: formik.values.status,
                        }}
                        options={[
                          { label: "Active", value: "ACTIVE" },
                          { label: "Inactive", value: "INACTIVE" },
                        ]}
                        onChange={(option) =>
                          formik.setFieldValue("status", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("status", true)}
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.status && formik.errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.status}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 py-5 justify-end">
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
    </div>
  );
};

export default CreateOption;
