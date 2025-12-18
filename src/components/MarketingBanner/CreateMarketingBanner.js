import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { PiImageFill } from "react-icons/pi";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { customStyles } from "../../Helper/helper";
import Select from "react-select";

const CreateMarketingBanner = ({
  setShowModal,
  editingClub,
  formik,
  handleOverlayClick,
  leadBoxRef,
}) => {
  // State to store preview URL for banner image
  const [bannerPreview, setBannerPreview] = useState(null);
  // State to store list of clubs fetched from API
  const [club, setClub] = useState([]);
  // State to store list of content items (rules/features)
  const [conditionList, setConditionList] = useState([]);
  // State to store temporary input for adding a new content item
  const [tempCondition, setTempCondition] = useState("");

  // Function to fetch clubs from the backend with optional search parameter
  const fetchClub = async (search = "") => {
    try {
      // Call API to get club list, sending search param if provided
      const res = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      // Normalize response data to an array
      const data = res.data?.data || res.data || [];
      // Save clubs in local state
      setClub(data);
    } catch (err) {
      // Log error in console for debugging
      console.error(err);
      // Show error toast to user
      toast.error("Failed to fetch clubs");
    }
  };

  // Fetch clubs when component mounts
  useEffect(() => {
    fetchClub();
  }, []);

  // Map clubs to react-select options
  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  // Watch Formik banner_image value to update image preview
  useEffect(() => {
    const value = formik.values.banner_image;

    // If value is a File, create a preview URL
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setBannerPreview(url);
      // Cleanup previous object URL when value changes
      return () => URL.revokeObjectURL(url);
    }

    // If value is a string URL, use it directly
    if (typeof value === "string" && value) {
      setBannerPreview(value);
    } else {
      // Otherwise clear preview
      setBannerPreview(null);
    }
  }, [formik.values.banner_image]);

  // Helper to safely normalize content from API to an array of strings
  const normalizeContent = (contentFromApi) => {
    // If already an array (like ["Boost stamina","Boost stamina"]), return as is
    if (Array.isArray(contentFromApi)) {
      return contentFromApi;
    }

    // If it is a non-empty string, try to parse as JSON
    if (typeof contentFromApi === "string" && contentFromApi.trim() !== "") {
      try {
        const parsed = JSON.parse(contentFromApi);
        // If parsed result is an array, return it
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // If JSON.parse fails, fall through to empty array
        console.error("Failed to parse content JSON:", e);
      }
    }

    // Fallback to empty array
    return [];
  };

  // Fetch existing banner when editing
  useEffect(() => {
    // If not editing, do nothing
    if (!editingClub) return;

    // Function to fetch a single banner by its ID
    const fetchBannerById = async (id) => {
      try {
        // Call API to get banner details
        const res = await authAxios().get(`/marketingbanner/${id}`);
        // Normalize response data
        const data = res.data?.data || res.data || null;

        // If data exists, populate Formik values and local state
        if (data) {
          // Normalize content from backend into array
          const normalizedContent = normalizeContent(data.content);

          // Set all fields in Formik, including content as array
          formik.setValues({
            club_id: data.club_id ?? null,
            banner_image: data.banner_image || null, // string URL for preview
            banner_heading: data.banner_heading || "",
            banner_subheading: data.banner_subheading || "",
            button_text: data.button_text || "",
            external_url: data.external_url || "",
            description_heading: data.description_heading || "",
            description_subheading: data.description_subheading || "",
            caption: data.caption || "",
            content: normalizedContent, // always an array here
            position: data.position ?? "",
            status: data.status ?? "ACTIVE",
          });

          // Also keep local list in sync for UI display
          setConditionList(normalizedContent);
        }
      } catch (err) {
        // Log error for debugging
        console.error(err);
        // Show error toast to user
        toast.error("Failed to fetch banner details");
      }
    };

    // Call function with current editingClub ID
    fetchBannerById(editingClub);
  }, [editingClub]);

  // Keep local conditionList in sync when content in Formik changes (for create mode)
  useEffect(() => {
    if (!editingClub) {
      // Only auto-sync when not editing an existing banner
      const normalized = Array.isArray(formik.values.content)
        ? formik.values.content
        : normalizeContent(formik.values.content);
      setConditionList(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.content, editingClub]);

  // Handler for banner image file selection
  const handleBannerImageChange = (event) => {
    // Get the first selected file
    const file = event.target.files?.[0];
    // If file is present, set it in Formik
    if (file) {
      formik.setFieldValue("banner_image", file); // File will be handled in onSubmit
    }
  };

  // (Optional) Textarea helpers if you ever go back to multi-line string input
  const contentAsText =
    Array.isArray(formik.values.content) && formik.values.content.length > 0
      ? formik.values.content.join("\n")
      : "";

  const handleContentChange = (event) => {
    // Split textarea by line and trim each line
    const lines = event.target.value.split("\n").map((line) => line.trim());
    // Filter out empty lines
    const filtered = lines.filter((line) => line.length > 0);
    // Store as array in Formik
    formik.setFieldValue("content", filtered);
    // Keep local list in sync
    setConditionList(filtered);
  };

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header section with title and close button */}
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingClub ? "Edit Marketing Banner" : "Create Marketing Banner"}
          </h2>
          <div
            className="close--lead cursor-pointer"
            onClick={() => {
              // Reset form on close
              formik.resetForm();
              // Hide modal
              setShowModal(false);
            }}
          >
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        {/* Form body */}
        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid md:grid-cols-4 grid-cols-1 lg:gap-4 gap-2">
                  {/* Banner Image Preview */}
                  <div className="md:row-span-2">
                    <div className="bg-gray-100 rounded-lg w-full h-[160px] overflow-hidden p-4">
                      {bannerPreview ? (
                        <img
                          src={bannerPreview}
                          className="w-full h-full object-contain"
                          alt="Banner"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <PiImageFill className="text-gray-300 text-7xl" />
                          <span className="text-gray-500 text-sm">
                            Upload Banner Image
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner Image Upload Input */}
                  <div>
                    <label className="mb-2 block">
                      Banner Image<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageChange}
                      onBlur={() =>
                        formik.setFieldTouched("banner_image", true)
                      }
                      className="custom--input w-full"
                    />
                    {formik.touched.banner_image &&
                      formik.errors.banner_image && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.banner_image}
                        </p>
                      )}
                  </div>

                  {/* Club Select */}
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
                      />
                    </div>
                    {formik.touched.club_id && formik.errors.club_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.club_id}
                      </p>
                    )}
                  </div>

                  {/* Banner Heading */}
                  <div>
                    <label className="mb-2 block">
                      Banner Heading<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="banner_heading"
                      value={formik.values.banner_heading}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                    {formik.touched.banner_heading &&
                      formik.errors.banner_heading && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.banner_heading}
                        </p>
                      )}
                  </div>

                  {/* Banner Subheading */}
                  <div>
                    <label className="mb-2 block">Banner Subheading<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="banner_subheading"
                      value={formik.values.banner_subheading}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                    {formik.touched.banner_subheading &&
                      formik.errors.banner_subheading && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.banner_subheading}
                        </p>
                      )}
                  </div>

                  {/* Button Text */}
                  <div>
                    <label className="mb-2 block">Button Text<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="button_text"
                      value={formik.values.button_text}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                    {formik.touched.button_text &&
                      formik.errors.button_text && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.button_text}
                        </p>
                      )}
                  </div>

                  {/* Description Heading */}
                  <div>
                    <label className="mb-2 block">Description Heading<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="description_heading"
                      value={formik.values.description_heading}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                    {formik.touched.description_heading &&
                      formik.errors.description_heading && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.description_heading}
                        </p>
                      )}
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="mb-2 block">Caption<span className="text-red-500">*</span></label>
                    <input
                      name="caption"
                      value={formik.values.caption}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                    {formik.touched.caption && formik.errors.caption && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.caption}
                      </p>
                    )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="mb-2 block">
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formik.values.position}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                    {formik.touched.position && formik.errors.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.position}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  {editingClub && editingClub && (
                    <div>
                      <label className="mb-2 block">
                        Status
                      </label>
                      <div className="relative">
                        <Select
                          name="status"
                          value={
                            formik.values.status
                              ? {
                                  label: formik.values.status,
                                  value: formik.values.status,
                                }
                              : null
                          }
                          options={[
                            { label: "Active", value: "ACTIVE" },
                            { label: "Inactive", value: "INACTIVE" },
                          ]}
                          onChange={(option) =>
                            formik.setFieldValue("status", option.value)
                          }
                          onBlur={() => formik.setFieldTouched("status", true)}
                          styles={customStyles}
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

                  {/* Description Subheading */}
                  <div className="md:col-span-4">
                    <label className="mb-2 block">External URL</label>
                    <input
                      type="text"
                      name="external_url"
                      value={formik.values.external_url}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                  </div>
                  {/* Description Subheading */}
                  <div className="md:col-span-4">
                    <label className="mb-2 block">Description Subheading<span className="text-red-500">*</span></label>
                    <textarea
                      rows={2}
                      name="description_subheading"
                      value={formik.values.description_subheading}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                    />
                    {formik.touched.description_subheading &&
                      formik.errors.description_subheading && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.description_subheading}
                        </p>
                      )}
                  </div>

                  {/* Content as list of rules/features */}
                  <div className="md:col-span-4">
                    <label className="mb-2 block">
                      Content<span className="text-red-500">*</span>
                    </label>

                    {/* Input to add new content item */}
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tempCondition}
                        onChange={(event) =>
                          setTempCondition(event.target.value)
                        }
                        className="custom--input flex-1"
                        placeholder="Add a content item..."
                      />

                      <button
                        type="button"
                        className="px-3 py-2 bg-blue-500 text-white rounded"
                        onClick={() => {
                          // Do nothing if input is empty
                          if (!tempCondition.trim()) return;

                          // Build updated array
                          const updated = [
                            ...conditionList,
                            tempCondition.trim(),
                          ];

                          // Update local list for UI
                          setConditionList(updated);

                          // Save array directly in Formik
                          formik.setFieldValue("content", updated);

                          // Clear temporary input
                          setTempCondition("");
                        }}
                      >
                        Add
                      </button>
                    </div>

                    {/* Display list of content items with remove buttons */}
                    <ul className="space-y-1">
                      {conditionList.map((rule, index) => (
                        <li
                          key={index}
                          className="flex justify-between bg-gray-100 p-2 rounded gap-2"
                        >
                          <span className="text-sm">{rule}</span>
                          <button
                            type="button"
                            className="text-red-500 text-sm"
                            onClick={() => {
                              // Filter out item by index
                              const updated = conditionList.filter(
                                (_, i) => i !== index
                              );
                              // Update local list
                              setConditionList(updated);
                              // Update Formik value as array
                              formik.setFieldValue("content", updated);
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Optional: textarea version for bulk editing (kept here if needed) */}
                    {/* 
                    <textarea
                      rows={4}
                      value={contentAsText}
                      onChange={handleContentChange}
                      onBlur={() => formik.setFieldTouched("content", true)}
                      className="custom--input w-full mt-2"
                      placeholder="One item per line"
                    />
                    */}

                    {formik.touched.content && formik.errors.content && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  // Reset form and close modal when cancel is clicked
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
                {editingClub ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMarketingBanner;
