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
import {
  blockInvalidNumberKeys,
  sanitizePositiveInteger,
  selectIcon,
} from "../../Helper/helper";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { PiImageFill } from "react-icons/pi";
import { CiCamera } from "react-icons/ci";

// CreateGallery component
const CreateGallery = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
  clubOptions,
}) => {
  console.log(editingOption, "editingOption");

  const displayPosition = [
    { label: "Top", value: "TOP" },
    { label: "Bottom", value: "BOTTOM" },
    { label: "Both", value: "BOTH" },
  ];

  useEffect(() => {
    if (!editingOption) return;

    const fetchGalleryById = async (id) => {
      try {
        const res = await authAxios().get(`/club/gallery/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          // ✅ Prefill formik fields with fetched data
          formik.setValues({
            id: data.id || "",
            club_id: data.club_id || "",
            title: data.title || "",
            image: data.image || "",
            display_position: data.display_position || "",
            position: data.position || "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch module details");
      }
    };

    fetchGalleryById(editingOption);
  }, [editingOption]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      formik.setFieldValue("image", file); // store actual file
    } else {
      formik.setFieldValue("image", null);
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
        className="min-h-[70vh] w-[95%] max-w-[800px] mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit Gallery" : "Create Gallery"}
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
                <div className="grid grid-cols-3 gap-4">
                  {/* Image Preview */}
                  <div className="row-span-3">
                    <div className="w-full bg-gray-100 h-full rounded-lg mx-auto overflow-hidden relative group">
                      {formik.values?.image ? (
                        <img
                          src={
                            typeof formik.values.image === "string"
                              ? formik.values.image
                              : URL.createObjectURL(formik.values.image)
                          }
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
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.title && formik.errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.title}
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
                              formik.values.club_id?.toString(),
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

                  {/* Type Dropdown */}
                  <div>
                    <label className="mb-2 block">
                      Display Position<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="display_position"
                        value={displayPosition.find(
                          (opt) => opt.value === formik.values.display_position,
                        )}
                        onChange={(option) =>
                          formik.setFieldValue("display_position", option.value)
                        }
                        options={displayPosition}
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.display_position &&
                      formik.errors.display_position && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.display_position}
                        </p>
                      )}
                  </div>

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
                        // onChange={formik.handleChange}
                        onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                        onChange={(e) => {
                          const cleanValue = sanitizePositiveInteger(
                            e.target.value,
                          );
                          formik.setFieldValue("position", cleanValue);
                        }}
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
                className="px-4 py-2 bg-transparent border border-gray-400 text-white rounded max-w-[150px] w-full"
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

export default CreateGallery;
