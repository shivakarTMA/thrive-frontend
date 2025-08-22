import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaListOl, FaListUl } from "react-icons/fa6";
import { LuPlug } from "react-icons/lu";
import Select from "react-select";
import { selectIcon } from "../../Helper/helper";
import CreatableSelect from "react-select/creatable";

const tagOptions = [
  { value: "admin", label: "Admin" },
  { value: "foh", label: "FOH" },
  { value: "pt", label: "PT" },
  { value: "gt", label: "GT" },
];

const CreateRole = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
  optionTypes = [],
}) => {
  const [availableTags, setAvailableTags] = useState(optionTypes);

  // useEffect(() => {
  //   if (
  //     formik.values.name &&
  //     !availableTags.some((opt) => opt.value === formik.values.name)
  //   ) {
  //     setAvailableTags((prev) => [
  //       ...prev,
  //       {
  //         value: formik.values.name,
  //         label: formik.values.name,
  //       },
  //     ]);
  //   }
  // }, [formik.values.name, availableTags]);

  useEffect(() => {
    setAvailableTags(optionTypes); // update when parent prop changes
  }, [optionTypes]);

  const handleTagChange = (newValue, actionMeta) => {
    if (actionMeta.action === "create-option") {
      const newTag = {
        label: newValue.label,
        value: newValue.label,
      };
      setAvailableTags((prev) => [...prev, newTag]);
      formik.setFieldValue("name", newTag.value);
    } else {
      formik.setFieldValue("name", newValue ? newValue.value : "");
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
            {editingOption ? "Edit Role" : "Create Role"}
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
                  {/* Role Name */}
                  <div>
                    <label className="mb-2 block">
                      Role Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <CreatableSelect
                        options={availableTags}
                        value={
                          formik.values.name
                            ? availableTags.find(
                                (opt) => opt.value === formik.values.name
                              )
                            : null
                        }
                        onChange={handleTagChange}
                        styles={selectIcon}
                        isClearable
                      />
                    </div>
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        Role Name is required
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block">
                      Role Status<span className="text-red-500">*</span>
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

                  {/* description */}
                  <div className="col-span-2">
                    <label className="mb-2 block">Description</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
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

export default CreateRole;
