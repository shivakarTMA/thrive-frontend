// Import React
import React, { useEffect } from "react";
// Import close icon
import { IoCloseCircle } from "react-icons/io5";
// Import icons for input fields
import { FaListUl } from "react-icons/fa6";
import { LuPlug } from "react-icons/lu";
// Import select component
import Select from "react-select";
// Import custom styles for select input
import { handleTextOnlyChange, selectIcon } from "../../Helper/helper";
import { PiImageFill } from "react-icons/pi";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";

// CreateService component
const RecoveryServices = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
  servicesOptions,
  clubOptions
}) => {


  // Fetch exercise by ID when editingExercise changes
  useEffect(() => {
    const fetchRecoveryServiceById = async () => {
      if (editingOption) {
        try {
          const response = await authAxios().get(
            `/ourservices/${editingOption}`
          );
          const data = response.data?.data || response.data || null;

          // Set form values from fetched data
          formik.setValues({
            club_id: data.club_id || "",
            name: data.name || "",
            service_id: data.service_id || "3",
            image: data.image || null,
            tags: data.tags || "",
            caption: data.caption || "",
            description: data.description || "",
            position: data.position || "",
            status: data.status || "ACTIVE",
          });
        } catch (error) {
          toast.error("Failed to fetch recovery data.");
          console.error("Error fetching recovery:", error);
        }
      }
    };

    fetchRecoveryServiceById();
  }, [editingOption]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);

      formik.setFieldValue("image", previewURL); // for preview
      formik.setFieldValue("imageFile", file); // actual file to upload
    }
  };

  return (
    // Modal overlay
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      {/* Modal container */}
      <div
        className="min-h-[70vh] w-[95%] max-w-[900px] mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit Recovery Service" : "Create Recovery Service"}
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
        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mdgap-y-2">
                  {/* Image Preview */}
                  <div className="row-span-3">
                    <div className="bg-gray-100 rounded-lg w-full h-[200px] overflow-hidden">
                      {formik.values?.image ? (
                        <img
                          src={formik.values?.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <PiImageFill className="text-gray-300 text-7xl" />
                          <span className="text-gray-500 text-sm mt-2">
                            Upload Image
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Image Upload */}
                  <div>
                    <label className="mb-2 block">
                      Image<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleLogoChange}
                        onBlur={() => formik.setFieldTouched("image", true)}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.image && formik.errors.image && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.image}
                      </p>
                    )}
                  </div>

                  {/* Club Dropdown */}
                  <div>
                    <label className="mb-2 block">
                      Club<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
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
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.club_id && formik.errors.club_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.club_id}
                      </p>
                    )}
                  </div>

                  {/* Title Input */}
                  <div>
                    <label className="mb-2 block">
                      Title<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={(e) =>
                          handleTextOnlyChange(e, formik, "name")
                        }
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

                  {/* Tags Input */}
                  <div>
                    <label className="mb-2 block">
                      Tags<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="tags"
                        value={formik.values.tags}
                        onChange={(e) =>
                          handleTextOnlyChange(e, formik, "tags")
                        }
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.tags && formik.errors.tags && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.tags}
                      </p>
                    )}
                  </div>

                  {/* Caption Input */}
                  {/* <div>
                    <label className="mb-2 block">
                      Caption
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="caption"
                        value={formik.values.caption}
                        onChange={(e) =>
                          handleTextOnlyChange(e, formik, "caption")
                        }
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
  
                  </div> */}

                  {/* Service Dropdown */}
                  {/* <div>
                    <label className="mb-2 block">
                      Service<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="service_id"
                        value={
                          servicesOptions.find(
                            (option) =>
                              option.value.toString() ===
                              formik.values.service_id?.toString()
                          ) || null
                        }
                        options={servicesOptions}
                        onChange={(option) =>
                          formik.setFieldValue("service_id", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("service_id", true)
                        }
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.service_id && formik.errors.service_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.service_id}
                      </p>
                    )}
                  </div> */}

                  

                  {/* Position Input */}
                  <div>
                    <label className="mb-2 block">
                      Position<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
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

                  {/* Status Dropdown */}
                  {editingOption && editingOption && (
                    <div>
                      <label className="mb-2 block">Status</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                          <LuPlug />
                        </span>
                        <Select
                          name="status"
                          value={
                            formik.values.status
                              ? {
                                  label: formik.values.status,
                                  value: formik.values.status,
                                }
                              : ""
                          }
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
                  )}

                  {/* Description Input */}
                  <div className="md:col-span-3">
                    <label className="mb-2 block">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.description && formik.errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal action buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  formik.resetForm();
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-transparent border border-gray-400 text-white  rounded max-w-[150px] w-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white  rounded max-w-[150px] w-full"
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

export default RecoveryServices;
