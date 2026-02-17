import React, { useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import {
  blockInvalidNumberKeys,
  sanitizePositiveInteger,
  selectIcon,
} from "../../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import { FaListCheck } from "react-icons/fa6";
import Switch from "react-switch";
import { TbGymnastics } from "react-icons/tb";
import { CgGym } from "react-icons/cg";
import { authAxios } from "../../config/config";

// Validation schema using Yup
const validationSchema = Yup.object({
  category: Yup.string().required("Category is required"),
  name: Yup.string().required("Exercise name is required"),
});

const CreateExercise = ({
  setShowModal,
  editingExercise,
  onExerciseCreated,
  productCategoryOptions,
}) => {
  console.log(editingExercise?.id, "editingExercise");

  const leadBoxRef = useRef(null);

  // Formik configuration
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      category: "",
      name: "",
      description: "",
      position: "",
      has_reps: false,
      has_weight: false,
      has_duration: false,
      has_distance: false,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        // Append all fields to FormData
        Object.keys(values).forEach((key) => {
          formData.append(key, values[key]);
        });

        if (editingExercise?.id) {
          // Update existing exercise
          await authAxios().put(`/exercise/${editingExercise.id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success("Exercise updated successfully!");
        } else {
          // Create new exercise
          await authAxios().post("/exercise/create", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success("Exercise created successfully!");
        }

        if (onExerciseCreated) {
          await onExerciseCreated();
        }
        resetForm();
        setShowModal(false);
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Error submitting form:", error);
      }
    },
  });

  // Fetch exercise by ID when editingExercise changes
  useEffect(() => {
    const fetchExerciseById = async () => {
      if (editingExercise?.id) {
        try {
          const response = await authAxios().get(
            `/exercise/${editingExercise.id}`,
          );
          const exerciseData = response.data?.data || response.data || null;

          // Set form values from fetched data
          formik.setValues({
            category: exerciseData.category || "",
            name: exerciseData.name || "",
            description: exerciseData.description || "",
            position: exerciseData.position || "",
            has_reps: exerciseData.has_reps || false,
            has_weight: exerciseData.has_weight || false,
            has_duration: exerciseData.has_duration || false,
            has_distance: exerciseData.has_distance || false,
          });
        } catch (error) {
          toast.error("Failed to fetch exercise data.");
          console.error("Error fetching exercise:", error);
        }
      }
    };

    fetchExerciseById();
  }, [editingExercise]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const handleLeadModal = () => {
    setShowModal(false);
  };

  return (
    <div
      className="overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full bg--blur"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-2xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">Create an Exercise</h2>
          <div className="close--lead cursor-pointer" onClick={handleLeadModal}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1">
          <form onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-b-[10px]">
              {/* Category */}
              <div>
                <label className="mb-2 block">
                  Category<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                    <CgGym />
                  </span>
                  <Select
                    options={productCategoryOptions}
                    value={productCategoryOptions.find(
                      (option) => option.value === formik.values.category,
                    )}
                    onChange={(option) =>
                      formik.setFieldValue("category", option?.value)
                    }
                    onBlur={() => formik.setFieldTouched("category", true)}
                    styles={selectIcon}
                  />
                </div>
                {formik.touched.category && formik.errors.category && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.category}
                  </p>
                )}
              </div>

              {/* Exercise Name */}
              <div>
                <label className="mb-2 block">
                  Exercise Name<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                    <TbGymnastics />
                  </span>
                  <input
                    type="text"
                    name="name"
                    className="custom--input w-full input--icon"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.name}
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
                    onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                    onChange={(e) => {
                      const cleanValue = sanitizePositiveInteger(
                        e.target.value,
                      );
                      formik.setFieldValue("position", cleanValue);
                    }}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block">Description</label>
                <textarea
                  name="description"
                  className="custom--input w-full"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={1}
                />
              </div>

              {/* Toggles */}
              <div className="col-span-2">
                <label className="mb-2 block">
                  Select the training dimensions for this exercise:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "has_reps", label: "Has Reps?" },
                    { key: "has_weight", label: "Has Weight?" },
                    { key: "has_duration", label: "Has Duration?" },
                    { key: "has_distance", label: "Has Distance?" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Switch
                        onChange={(checked) =>
                          formik.setFieldValue(key, checked)
                        }
                        checked={formik.values[key]}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onColor="#000"
                        offColor="#e5e7eb"
                        handleDiameter={22}
                        height={25}
                        width={50}
                        className="custom-switch"
                      />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                onClick={() => {
                  formik.resetForm();
                  setShowModal(false);
                }}
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

export default CreateExercise;
