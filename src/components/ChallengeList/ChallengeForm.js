// Import required libraries and components
import React, { useEffect, useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaListUl, FaHashtag } from "react-icons/fa";
import { LuCalendar } from "react-icons/lu";
import { FiImage } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RiMedalLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { FaListCheck } from "react-icons/fa6";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";

// Define the ChallengeForm component
const ChallengeForm = ({ setShowModal, editingOption, formik }) => {
  const leadBoxRef = useRef();

  // Fetch exercise by ID when editingExercise changes
  useEffect(() => {
    const fetchChallengeById = async () => {
      if (editingOption) {
        try {
          const response = await authAxios().get(`/challenge/${editingOption}`);
          const exerciseData = response.data?.data || response.data || null;

          console.log(exerciseData,'exerciseData')

          // Set form values from fetched data
          formik.setValues({
            title: exerciseData?.title,
            caption: exerciseData?.caption,
            description: exerciseData?.description,
            image: exerciseData?.image,
            goal: exerciseData?.goal,
            start_date: exerciseData?.start_date,
            end_date: exerciseData?.end_date,
            condition: exerciseData?.condition,
            reward_first: exerciseData?.reward_first,
            reward_second: exerciseData?.reward_second,
            reward_third: exerciseData?.reward_third,
            about_challenge: exerciseData?.about_challenge,
            position: exerciseData?.position,
            status: exerciseData?.status || "UPCOMING",
            join_in_between: exerciseData?.join_in_between || null,
          });
        } catch (error) {
          toast.error("Failed to fetch exercise data.");
          console.error("Error fetching exercise:", error);
        }
      }
    };

    fetchChallengeById();
  }, [editingOption]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit Challenge" : "Create Challenge"}
          </h2>
          <IoCloseCircle
            className="text-3xl cursor-pointer"
            onClick={() => {
              formik.resetForm({ values: formik.initialValues });
              setShowModal(false);
            }}
          />
        </div>

        {/* Form Section */}
        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid grid-cols-3 gap-4">
                  {/* Image Upload Field */}
                  <div>
                    <label className="mb-2 block">
                      Image<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FiImage />
                      </span>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(e) =>
                          formik.setFieldValue(
                            "image",
                            e.currentTarget.files[0]
                          )
                        }
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.image && formik.errors.image && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.image}
                      </p>
                    )}
                  </div>

                  {/* Title Field */}
                  <div>
                    <label className="mb-2 block">
                      Title<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaListUl className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                      <input
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.title && formik.errors.title && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.title}
                      </p>
                    )}
                  </div>

                  {/* Caption Field */}
                  <div>
                    <label className="mb-2 block">
                      Caption<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaListUl className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                      <input
                        name="caption"
                        value={formik.values.caption}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.caption && formik.errors.caption && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.caption}
                      </p>
                    )}
                  </div>

                  {/* Goal Field */}
                  <div>
                    <label className="mb-2 block">
                      Goal<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaListUl className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                      <input
                        name="goal"
                        value={formik.values.goal}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.goal && formik.errors.goal && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.goal}
                      </p>
                    )}
                  </div>

                  {/* Start Date Field */}
                  <div>
                    <label className="mb-2 block">
                      Start Date<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.start_date
                            ? new Date(formik.values.start_date)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "start_date",
                            date ? date.toISOString() : ""
                          )
                        }
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()}
                        className="input--icon"
                      />
                    </div>
                    {formik.touched.start_date && formik.errors.start_date && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.start_date}
                      </p>
                    )}
                  </div>

                  {/* End Date Field */}
                  <div>
                    <label className="mb-2 block">
                      End Date<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.end_date
                            ? new Date(formik.values.end_date)
                            : null
                        }
                        onChange={(date) =>
                          formik.setFieldValue(
                            "end_date",
                            date ? date.toISOString() : ""
                          )
                        }
                        dateFormat="yyyy-MM-dd"
                        minDate={
                          formik.values.start_date
                            ? new Date(formik.values.start_date)
                            : new Date()
                        }
                        className="input--icon"
                      />
                    </div>
                    {formik.touched.end_date && formik.errors.end_date && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.end_date}
                      </p>
                    )}
                  </div>

                  {/* Rewards Fields */}
                  <div className="col-span-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label>First Prize Coins *</label>
                        <div className="relative">
                          <RiMedalLine className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                          <input
                            type="number"
                            name="reward_first"
                            value={formik.values.reward_first}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full input--icon"
                          />
                        </div>
                        {formik.touched.reward_first &&
                          formik.errors.reward_first && (
                            <p className="text-red-500 text-sm">
                              {formik.errors.reward_first}
                            </p>
                          )}
                      </div>

                      <div>
                        <label>
                          Second Prize Coins
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <RiMedalLine className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                          <input
                            type="number"
                            name="reward_second"
                            value={formik.values.reward_second}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full input--icon"
                          />
                        </div>
                        {formik.touched.reward_second &&
                          formik.errors.reward_second && (
                            <p className="text-red-500 text-sm">
                              {formik.errors.reward_second}
                            </p>
                          )}
                      </div>

                      <div>
                        <label>
                          Third Prize Coins
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <RiMedalLine className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                          <input
                            type="number"
                            name="reward_third"
                            value={formik.values.reward_third}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full input--icon"
                          />
                        </div>
                        {formik.touched.reward_third &&
                          formik.errors.reward_third && (
                            <p className="text-red-500 text-sm">
                              {formik.errors.reward_third}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Condition Field */}
                  <div>
                    <label className="mb-2 block">
                      Condition<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaListUl className="absolute top-[50%] translate-y-[-50%] left-[15px]" />
                      <input
                        name="condition"
                        value={formik.values.condition}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.condition && formik.errors.condition && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.condition}
                      </p>
                    )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="mb-2 block">Position</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>

                      <input
                        type="number"
                        name="position"
                        className="custom--input w-full input--icon"
                        value={formik.values.position}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block">
                      Join In Between<span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="join_in_between"
                      value={
                        formik.values.join_in_between
                          ? { value: true, label: "Yes" }
                          : { value: false, label: "No" }
                      }
                      onChange={(option) =>
                        formik.setFieldValue("join_in_between", option.value)
                      }
                      options={[
                        { value: true, label: "Yes" },
                        { value: false, label: "No" },
                      ]}
                      classNamePrefix="custom--select"
                      styles={customStyles}
                    />
                  </div>

                  {/* description Field */}
                  <div className="col-span-3">
                    <label className="mb-2 block">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaListUl className="absolute top-[15px] left-[15px]" />
                      <textarea
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.description &&
                      formik.errors.description && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.description}
                        </p>
                      )}
                  </div>
                  {/* About Challenge Field */}
                  <div className="col-span-3">
                    <label className="mb-2 block">
                      About Challenge<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaListUl className="absolute top-[15px] left-[15px]" />
                      <textarea
                        name="about_challenge"
                        value={formik.values.about_challenge}
                        onChange={formik.handleChange}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.about_challenge &&
                      formik.errors.about_challenge && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.about_challenge}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  formik.resetForm({ values: formik.initialValues });
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

// Export the ChallengeForm component
export default ChallengeForm;
