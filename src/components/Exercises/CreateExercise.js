import React, { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { selectIcon } from "../../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import { FaImage, FaListCheck } from "react-icons/fa6";
import Switch from "react-switch";

// Options
const exerciseTypeOptions = [
  { value: "shoulders", label: "Shoulders" },
  { value: "triceps", label: "Triceps" },
  { value: "biceps", label: "Biceps" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "legs", label: "Legs" },
  { value: "abs", label: "Abs" },
  { value: "cardio", label: "Cardio" },
  { value: "warmup", label: "Warmup" },
  { value: "others", label: "Others" },
];
// Validation Schema
const validationSchema = Yup.object({
  exerciseCategory: Yup.string().required("Exercise Category is required"),
  exerciseName: Yup.string().required("Exercise Name is required"),
});

const CreateExercise = ({ setShowModal, onExerciseCreated, initialData }) => {
  console.log(initialData,'initialData')
  const leadBoxRef = useRef(null);

  const formik = useFormik({
    enableReinitialize: true, // Required to re-run on initialData change
    initialValues: {
      exerciseCategory: initialData?.exerciseCategory || "",
      exerciseName: initialData?.exerciseName || "",
      exerciseImage: initialData?.exerciseImage || "",
      exerciseDescription: initialData?.exerciseDescription || "",
      hasReps: initialData?.hasReps || false,
      hasWeight: initialData?.hasWeight || false,
      hasDuration: initialData?.hasDuration || false,
      hasDistance: initialData?.hasDistance || false,
    },
    validationSchema,
    onSubmit: (values) => {
      const dataToSend = {
        ...values,
        id: initialData?.id || Date.now(), // Preserve ID for edit mode
      };
      onExerciseCreated(dataToSend);
      setShowModal(false);
      // toast.success(
      //   initialData ? "Updated successfully" : "Created successfully"
      // );
    },
  });

  const handleImageUpload = (event) => {
    const file = event.currentTarget.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width === 150 && img.height === 150) {
        formik.setFieldValue("exerciseImage", file);
      } else {
        toast.error("Please choose an image of size exactly 150px by 80px.");
        event.target.value = "";
        formik.setFieldValue("exerciseImage", "");
      }
    };
    img.onerror = () => {
      toast.error("Invalid image file.");
      event.target.value = "";
      formik.setFieldValue("exerciseImage", "");
    };
  };

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
        className="min-h-[70vh]  w-[95%] max-w-2xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">Create a Exercise</h2>
          <div className="close--lead cursor-pointer" onClick={handleLeadModal}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>
        <div className="flex-1s flexs">
          <form onSubmit={formik.handleSubmit}>
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {/* Product Type (React Select) */}
                  <div>
                    <label className="mb-2 block">
                      Exercise Category<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <Select
                        options={exerciseTypeOptions}
                        value={exerciseTypeOptions.find(
                          (option) =>
                            option.value === formik.values.exerciseCategory
                        )}
                        onChange={(option) =>
                          formik.setFieldValue(
                            "exerciseCategory",
                            option?.value
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("exerciseCategory", true)
                        }
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.exerciseCategory &&
                      formik.errors.exerciseCategory && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.exerciseCategory}
                        </p>
                      )}
                  </div>

                  {/* Exercise Name */}
                  <div>
                    <label className="mb-2 block">
                      Exercise<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <input
                        type="text"
                        name="exerciseName"
                        className="custom--input w-full input--icon"
                        value={formik.values.exerciseName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.exerciseName &&
                      formik.errors.exerciseName && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.exerciseName}
                        </p>
                      )}
                  </div>

                  {/* Product Image */}
                  <div>
                    <label className="mb-2 block">
                      Exercise Image (150 (width) x 150 (height))
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaImage />
                      </span>
                      <input
                        type="file"
                        name="exerciseImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                  </div>

                  {/* Exercise Description */}
                  <div>
                    <label className="mb-2 block">Exercise Description</label>
                    <textarea
                      name="exerciseDescription"
                      className="custom--input w-full"
                      value={formik.values.exerciseDescription}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.exerciseDescription &&
                      formik.errors.exerciseDescription && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.exerciseDescription}
                        </p>
                      )}
                  </div>

                  <div className="col-span-2">
                    <label className="mb-2 block">
                      Select the training dimensions for this exercise:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          onChange={(checked) =>
                            formik.setFieldValue("hasReps", checked)
                          }
                          checked={formik.values.hasReps}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          onColor="#000"
                          offColor="#e5e7eb"
                          handleDiameter={22}
                          height={25}
                          width={50}
                          className="custom-switch"
                        />
                        <span>Has Reps?</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          onChange={(checked) =>
                            formik.setFieldValue("hasWeight", checked)
                          }
                          checked={formik.values.hasWeight}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          onColor="#000"
                          offColor="#e5e7eb"
                          handleDiameter={22}
                          height={25}
                          width={50}
                          className="custom-switch"
                        />
                        <span>Has Weight?</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          onChange={(checked) =>
                            formik.setFieldValue("hasDuration", checked)
                          }
                          checked={formik.values.hasDuration}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          onColor="#000"
                          offColor="#e5e7eb"
                          handleDiameter={22}
                          height={25}
                          width={50}
                          className="custom-switch"
                        />
                        <span>Has Duration?</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          onChange={(checked) =>
                            formik.setFieldValue("hasDistance", checked)
                          }
                          checked={formik.values.hasDistance}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          onColor="#000"
                          offColor="#e5e7eb"
                          handleDiameter={22}
                          height={25}
                          width={50}
                          className="custom-switch"
                        />
                        <span>Has Distance?</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Submit Button */}
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
