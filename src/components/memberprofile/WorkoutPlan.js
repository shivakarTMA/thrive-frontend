import React, { useEffect, useState } from "react";
import AllExerciseList from "../WorkoutPlan/AllExerciseList";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { useParams } from "react-router-dom";
import {
  TrainingList,
  workoutTemplateHIIT,
  workoutTemplatePushDay,
  workoutTemplateWithExercises,
} from "../../DummyData/DummyData";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { FiPlus } from "react-icons/fi";
import AssignTemplateModal from "./AssignTemplateModal";
import SaveWorkoutTemplate from "./SaveWorkoutTemplate";
import { useSelector } from "react-redux";
import axios from "axios";
import { authAxios } from "../../config/config";

const workoutTypeOptions = [
  { value: "MULTIDAY", label: "Workout Plan (Multiple Days)" },
  { value: "SINGLE", label: "Workout (One Day)" },
];

const WorkoutPlan = ({
  handleCancelWorkout,
  editingId,
  handleWorkoutUpdate,
}) => {
  console.log(editingId, "editingId");
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const createdBy = user?.id;

  const [deleteActions, setDeleteActions] = useState({
    delete_days: [],
    delete_exercises: [],
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isFromTemplate, setIsFromTemplate] = useState(false);

  const [data, setData] = useState({
    plan: {
      id: null,
      member_id: id,
      name: "",
      description: "",
      workout_type: "MULTIDAY",
      no_of_days: null,
      start_date: "",
      end_date: "",
      created_by: createdBy,
      position: 1,
    },
    days: [],
  });

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [showExercises, setShowExercises] = useState(false);
  const [copiedDay, setCopiedDay] = useState(null);
  const [errors, setErrors] = useState({});
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [workoutForm, setWorkoutForm] = useState(true);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  /* -------------------------------------------------------
     HELPERS
  ------------------------------------------------------- */

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const num = Number(value);
    // Return integer if it's a whole number, otherwise return with decimals
    return num % 1 === 0 ? Math.floor(num) : num;
  };

  const sanitizeNumber = (value) => {
    if (value === "") return "";
    const num = Number(value);
    if (isNaN(num) || num < 0) return "";
    return Number.isInteger(num) ? num : num;
  };

  const normalizeNumber = (val) =>
    val === "" || val === undefined ? null : val;

  const calculateEndDate = (startDate, numDays) => {
    if (!startDate || !numDays) return null;
    const end = new Date(startDate);
    end.setDate(end.getDate() + Number(numDays) - 1);
    return end.toISOString().split("T")[0];
  };

  // API: Fetch workout plan when editing - UPDATED WITH FIX 3
  const fetchWorkoutPlan = async (workoutId) => {
    try {
      setLoading(true);
      const response = await authAxios().get(
        `/member/workoutplan/${workoutId}`
      );

      let data = response.data?.data || response.data || [];

      console.log(data?.days, "data fetchWorkoutPlan");

      if (data) {
        // Process days and exercises to add _ui metadata
        const processedDays =
          data?.days?.map((day) => ({
            ...day,
            exercises:
              day.exercises?.map((exercise) => {
                // Determine _ui flags based on existing values
                const isRestTime =
                  exercise.category === "Rest" || exercise.name === "Rest Time";

                return {
                  ...exercise,
                  // FIX 3: FORMAT NUMBERS HERE
                  sets: formatNumber(exercise.sets),
                  reps: formatNumber(exercise.reps),
                  weight_kg: formatNumber(exercise.weight_kg),
                  distance_mts: formatNumber(exercise.distance_mts),
                  duration_mins: formatNumber(exercise.duration_mins),
                  rest_secs: formatNumber(exercise.rest_secs),
                  // Convert group_type and group_id from API to frontend format
                  groupType: exercise.group_type || null,
                  groupId: exercise.group_id || null,
                  notes: exercise.notes || "",
                  isSelected: false,
                  _ui: isRestTime
                    ? {
                        id: exercise.id || `rest-${Date.now()}`,
                        type: "rest",
                      }
                    : {
                        id: exercise.id || `ex-${Date.now()}`,
                        // Infer capabilities from existing data
                        hasReps:
                          exercise.reps !== null && exercise.reps !== undefined,
                        hasWeight:
                          exercise.weight_kg !== null &&
                          exercise.weight_kg !== undefined,
                        hasDistance:
                          exercise.distance_mts !== null &&
                          exercise.distance_mts !== undefined,
                        hasDuration:
                          exercise.duration_mins !== null &&
                          exercise.duration_mins !== undefined,
                      },
                };
              }) || [],
          })) || [];

        setData({
          plan: {
            member_id: data?.plan.member_id || id,
            name: data?.plan.name || "",
            description: data?.plan.description || "",
            workout_type: data?.plan.workout_type || "MULTIDAY",
            no_of_days: data?.plan.no_of_days || null,
            start_date: data?.plan.start_date || null,
            end_date: data?.plan.end_date || null,
          },
          days: processedDays,
        });
        setWorkoutForm(false);
        setShowConfiguration(true);
      }
    } catch (error) {
      console.error("Error fetching workout plan:", error);
      toast.error("Failed to load workout plan");
    } finally {
      setLoading(false);
    }
  };

  const generateDaysWithDates = (startDate, noOfDays, existingDays = []) => {
    if (!startDate || !noOfDays) return [];

    return Array.from({ length: noOfDays }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);

      const existingDay = existingDays[i];

      return {
        id: existingDay?.id, // ✅ PRESERVE day.id
        day_no: i + 1,
        day_date: d.toISOString().split("T")[0],
        is_rest_day: existingDay?.is_rest_day ?? false,
        position: i + 1,
        exercises: existingDay?.exercises ?? [],
      };
    });
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!data.plan.start_date) newErrors.start_date = "Start Date is required.";
    if (!data.plan.name.trim()) newErrors.name = "Workout name is required.";
    if (!data.plan.no_of_days || data.plan.no_of_days < 1)
      newErrors.no_of_days = "Number of days is required.";
    if (!data.plan.description.trim())
      newErrors.description = "Description is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const endDate = calculateEndDate(
      data.plan.start_date,
      data.plan.no_of_days
    );

    const generatedDays = generateDaysWithDates(
      data.plan.start_date,
      data.plan.no_of_days,
      data.days // ✅ preserve IDs if any
    );

    setData((prev) => ({
      ...prev,
      plan: {
        ...prev.plan,
        end_date: endDate,
      },
      days: generatedDays,
    }));

    setErrors({});
    setShowConfiguration(true);
  };

  const handleExerciseAdd = (exercise) => {
    setData((prev) => {
      const updatedDays = prev.days.map((day, index) => {
        if (index !== activeDayIndex) return day;

        const newExercise = {
          name: exercise.name,
          category: exercise.category || "",
          sets: null,
          reps: exercise.has_reps ? null : null,
          weight_kg: exercise.has_weight ? null : null,
          distance_mts: exercise.has_distance ? null : null,
          duration_mins: exercise.has_duration ? null : null,
          rest_secs: null,
          notes: "",
          position: day.exercises.length + 1,
          groupType: null,
          groupId: null,
          isSelected: false,
          _ui: {
            id: exercise.id,
            hasReps: exercise.has_reps,
            hasWeight: exercise.has_weight,
            hasDistance: exercise.has_distance,
            hasDuration: exercise.has_duration,
          },
        };

        return {
          ...day,
          exercises: [...day.exercises, newExercise],
        };
      });

      return { ...prev, days: updatedDays };
    });
  };

  // FIX 2: Delete exercise - UPDATED to accept exercise object
  const handleDeleteExercise = async (dayIdx, exerciseToDelete) => {
    // If exercise has an id (saved to backend), track it for deletion
    if (exerciseToDelete?.id && editingId) {
      setDeleteActions((prev) => ({
        ...prev,
        delete_exercises: [...prev.delete_exercises, exerciseToDelete.id],
      }));
    }

    // Update local state
    setData((prev) => {
      const updatedDays = [...prev.days];

      // Filter out the specific exercise and recalculate positions
      updatedDays[dayIdx].exercises = updatedDays[dayIdx].exercises
        .filter((ex) => {
          // Use multiple criteria for matching
          if (ex.id && exerciseToDelete.id) {
            return ex.id !== exerciseToDelete.id;
          }
          // For new exercises without IDs, use position and UI id
          return !(
            ex.position === exerciseToDelete.position &&
            ex._ui?.id === exerciseToDelete._ui?.id
          );
        })
        .map((ex, idx) => ({ ...ex, position: idx + 1 }));

      return { ...prev, days: updatedDays };
    });
  };

  const handleExerciseFieldChange = (dayIdx, exIdx, field, value) => {
    setData((prev) => {
      const updatedDays = prev.days.map((day, idx) => {
        if (idx !== dayIdx) return day;

        const updatedExercises = day.exercises.map((ex, i) =>
          i === exIdx ? { ...ex, [field]: value } : ex
        );

        return { ...day, exercises: updatedExercises };
      });

      return { ...prev, days: updatedDays };
    });
  };

  const handleClearDay = (dayIdx) => {
    const dayToClear = data.days[dayIdx];

    // Track exercises for deletion if editing
    if (editingId && dayToClear.exercises.length > 0) {
      const exerciseIdsToDelete = dayToClear.exercises
        .filter((ex) => ex.id)
        .map((ex) => ex.id);

      setDeleteActions((prev) => ({
        ...prev,
        delete_exercises: [...prev.delete_exercises, ...exerciseIdsToDelete],
      }));
    }

    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIdx] = {
        ...updatedDays[dayIdx],
        is_rest_day: false,
        exercises: [],
      };
      return { ...prev, days: updatedDays };
    });
  };

  // FIX 1: Copy Day - UPDATED to remove IDs
  const handleCopyDay = (dayIdx) => {
    const dayToCopy = data.days[dayIdx];

    // Deep clone exercises and remove IDs to avoid conflicts
    const copiedExercises = JSON.parse(
      JSON.stringify(dayToCopy.exercises || [])
    ).map((ex) => {
      // Remove id field to treat as new exercises
      const { id, ...exerciseWithoutId } = ex;
      return exerciseWithoutId;
    });

    setCopiedDay(copiedExercises);
    toast.success("Exercises copied successfully!");
  };

  // FIX 1: Paste Day - UPDATED to regenerate IDs and positions
  const handlePasteDay = (dayIdx) => {
    if (!copiedDay) return;

    setData((prev) => {
      const updatedDays = [...prev.days];

      // Deep clone and recalculate positions
      const pastedExercises = JSON.parse(JSON.stringify(copiedDay)).map(
        (ex, idx) => ({
          ...ex,
          position: idx + 1,
          // Generate new unique IDs for UI
          _ui:
            ex._ui?.type === "rest"
              ? { ...ex._ui, id: `rest-${Date.now()}-${idx}` }
              : { ...ex._ui, id: `${ex._ui?.id || "ex"}-${Date.now()}-${idx}` },
        })
      );

      updatedDays[dayIdx] = {
        ...updatedDays[dayIdx],
        exercises: pastedExercises,
      };

      return { ...prev, days: updatedDays };
    });

    toast.success("Exercises pasted successfully!");
  };

  const handleToggleRestDay = (dayIdx, isRest) => {
    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIdx] = {
        ...updatedDays[dayIdx],
        is_rest_day: isRest,
        exercises: isRest ? [] : updatedDays[dayIdx].exercises,
      };
      return { ...prev, days: updatedDays };
    });
  };

  const cleanDataForSubmission = (data) => {
    return {
      plan: {
        id: editingId || undefined, // ✅ required for update
        member_id: data.plan.member_id,
        name: data.plan.name,
        description: data.plan.description,
        workout_type: data.plan.workout_type,
        no_of_days: Number(data.plan.no_of_days),
        start_date: data.plan.start_date,
        end_date: data.plan.end_date,
      },
      days: data.days.map((day) => {
        const cleanDay = {
          day_no: day.day_no,
          day_date: day.day_date,
          is_rest_day: day.is_rest_day,
          position: day.position,
          exercises: day.exercises.map((ex) => {
            const { isSelected, groupType, groupId, _ui, ...cleanEx } = ex;

            const cleanedExercise = {
              ...cleanEx,
              sets: normalizeNumber(cleanEx.sets),
              reps: normalizeNumber(cleanEx.reps),
              weight_kg: normalizeNumber(cleanEx.weight_kg),
              distance_mts: normalizeNumber(cleanEx.distance_mts),
              duration_mins: normalizeNumber(cleanEx.duration_mins),
              rest_secs: normalizeNumber(cleanEx.rest_secs),
              group_type: groupType || null,
              group_id: groupId || null,
            };

            // ✅ KEEP exercise.id ONLY during update
            if (editingId && ex.id) {
              cleanedExercise.id = ex.id;
            }

            return cleanedExercise;
          }),
        };

        // ✅ KEEP day.id ONLY during update
        if (editingId && day.id) {
          cleanDay.id = day.id;
        }

        return cleanDay;
      }),
    };
  };

  const validateWorkoutPlan = (data) => {
    const errs = {};

    data.days.forEach((day, dIdx) => {
      if (day.is_rest_day) return;

      day.exercises.forEach((ex, eIdx) => {
        const key = `day_${dIdx}_ex_${eIdx}`;

        if (ex.sets == null) errs[`${key}_sets`] = "Sets required";

        if (ex._ui?.hasReps && ex.reps == null)
          errs[`${key}_reps`] = "Reps required";

        if (ex._ui?.hasWeight && ex.weight_kg == null)
          errs[`${key}_weight`] = "Weight required";

        if (ex.rest_secs == null) errs[`${key}_rest`] = "Rest required";
      });
    });

    return errs;
  };

  const handleSaveWorkoutPlan = async () => {
    try {
      console.log("Saving workout plan…", data);

      const formErrors = {};
      if (!data.plan.name.trim()) formErrors.name = "Name required";
      if (!data.plan.start_date) formErrors.start_date = "Start date required";
      if (!data.plan.no_of_days || data.plan.no_of_days < 1)
        formErrors.no_of_days = "Days required";

      if (Object.keys(formErrors).length) {
        console.error("❌ Form validation errors:", formErrors);
        setErrors(formErrors);
        return;
      }

      const exErrors = validateWorkoutPlan(data);
      if (Object.keys(exErrors).length) {
        console.error("❌ Exercise validation errors:", exErrors);
        setValidationErrors(exErrors);
        return;
      }

      const payload = {
        ...cleanDataForSubmission(data),
        delete_actions: editingId ? deleteActions : undefined,
      };

      // console.log("📦 Final payload:", payload);
      // console.log(
      //   "🧪 Day IDs:",
      //   data.days.map((d) => ({ day_no: d.day_no, id: d.id }))
      // );
      setLoading(true);

      if (editingId) {
        const missingIds = data.days.filter((d) => !d.id);
        if (missingIds.length) {
          console.error("❌ Missing day IDs:", missingIds);
          toast.error("Internal error: day IDs missing");
          return;
        }
        await authAxios().put(`/member/workoutplan/${editingId}`, payload);
        toast.success("Workout updated");
      } else {
        await authAxios().post(`/member/workoutplan/create`, payload);
        toast.success("Workout created");
      }

      handleCancelWorkout();
      handleWorkoutUpdate();
    } catch (err) {
      console.error("❌ Save failed:", err);
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const renderExercise = (exercise, exIdx, isGrouped = false) => (
    <div key={exIdx} className="mb-2 border p-2 px-4 rounded bg-white">
      <div className="flex justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="mb-1">
            <strong>Exercise</strong>: {exercise.name}
          </h3>
        </div>
        <div className="flex gap-2">
          {/* FIX 2: Pass exercise object instead of position */}
          <button
            onClick={() => handleDeleteExercise(activeDayIndex, exercise)}
            className="text-red-600 text-sm"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-3 items-baseline">
            <div className="grid grid-cols-4 gap-3">
              {!isGrouped && (
                <div className="w-full">
                  {/* FIX 3: Apply formatNumber to display */}
                  <label className="mb-2 block">
                    No. of sets<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="No. of sets"
                    value={formatNumber(exercise.sets)}
                    onChange={(e) =>
                      handleExerciseFieldChange(
                        activeDayIndex,
                        exIdx,
                        "sets",
                        sanitizeNumber(e.target.value)
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                  {validationErrors[
                    `day_${activeDayIndex}_ex_${exIdx}_sets`
                  ] && (
                    <p className="text-red-600 text-sm mt-1">
                      {
                        validationErrors[
                          `day_${activeDayIndex}_ex_${exIdx}_sets`
                        ]
                      }
                    </p>
                  )}
                </div>
              )}
              {exercise._ui?.hasReps && (
                <div>
                  {/* FIX 3: Apply formatNumber to display */}
                  <label className="mb-2 block">
                    Reps<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Reps"
                    value={formatNumber(exercise.reps)}
                    onChange={(e) =>
                      handleExerciseFieldChange(
                        activeDayIndex,
                        exIdx,
                        "reps",
                        sanitizeNumber(e.target.value)
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                  {validationErrors[
                    `day_${activeDayIndex}_ex_${exIdx}_reps`
                  ] && (
                    <p className="text-red-600 text-sm mt-1">
                      {
                        validationErrors[
                          `day_${activeDayIndex}_ex_${exIdx}_reps`
                        ]
                      }
                    </p>
                  )}
                </div>
              )}
              {exercise._ui?.hasDuration && (
                <div>
                  {/* FIX 3: Apply formatNumber to display */}
                  <label className="mb-2 block">
                    Duration (minutes)<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={formatNumber(exercise.duration_mins)}
                    onChange={(e) =>
                      handleExerciseFieldChange(
                        activeDayIndex,
                        exIdx,
                        "duration_mins",
                        sanitizeNumber(e.target.value)
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                  {validationErrors[
                    `day_${activeDayIndex}_ex_${exIdx}_duration`
                  ] && (
                    <p className="text-red-600 text-sm mt-1">
                      {
                        validationErrors[
                          `day_${activeDayIndex}_ex_${exIdx}_duration`
                        ]
                      }
                    </p>
                  )}
                </div>
              )}
              {exercise._ui?.hasDistance && (
                <div>
                  {/* FIX 3: Apply formatNumber to display */}
                  <label className="mb-2 block">
                    Distance (meter)<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Distance (meter)"
                    value={formatNumber(exercise.distance_mts)}
                    onChange={(e) =>
                      handleExerciseFieldChange(
                        activeDayIndex,
                        exIdx,
                        "distance_mts",
                        sanitizeNumber(e.target.value)
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                  {validationErrors[
                    `day_${activeDayIndex}_ex_${exIdx}_distance`
                  ] && (
                    <p className="text-red-600 text-sm mt-1">
                      {
                        validationErrors[
                          `day_${activeDayIndex}_ex_${exIdx}_distance`
                        ]
                      }
                    </p>
                  )}
                </div>
              )}
              {exercise._ui?.hasWeight && (
                <div>
                  {/* FIX 3: Apply formatNumber to display */}
                  <label className="mb-2 block">
                    Weight (Kg)<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Weight (Kg)"
                    value={formatNumber(exercise.weight_kg)}
                    onChange={(e) =>
                      handleExerciseFieldChange(
                        activeDayIndex,
                        exIdx,
                        "weight_kg",
                        sanitizeNumber(e.target.value)
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                  {validationErrors[
                    `day_${activeDayIndex}_ex_${exIdx}_weight_kg`
                  ] && (
                    <p className="text-red-600 text-sm mt-1">
                      {
                        validationErrors[
                          `day_${activeDayIndex}_ex_${exIdx}_weight_kg`
                        ]
                      }
                    </p>
                  )}
                </div>
              )}
              {!isGrouped && (
                <div>
                  {/* FIX 3: Apply formatNumber to display */}
                  <label className="mb-2 block">
                    Rest (Secs)<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Rest (Secs)"
                    value={formatNumber(exercise.rest_secs)}
                    onChange={(e) =>
                      handleExerciseFieldChange(
                        activeDayIndex,
                        exIdx,
                        "rest_secs",
                        sanitizeNumber(e.target.value)
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                  {validationErrors[
                    `day_${activeDayIndex}_ex_${exIdx}_rest_secs`
                  ] && (
                    <p className="text-red-600 text-sm mt-1">
                      {
                        validationErrors[
                          `day_${activeDayIndex}_ex_${exIdx}_rest_secs`
                        ]
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="block">
              <div className="w-full">
                <label className="mb-2 block">Notes</label>
                <input
                  type="text"
                  placeholder="Notes"
                  value={exercise.notes || ""}
                  onChange={(e) =>
                    handleExerciseFieldChange(
                      activeDayIndex,
                      exIdx,
                      "notes",
                      e.target.value
                    )
                  }
                  className="custom--input w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (editingId) {
      fetchWorkoutPlan(editingId);
    }
  }, [editingId]);

  const handleAssignTemplate = () => {
    setShowModal(true);
  };
  const handleAssignFromModal = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Fetch full workout plan
      const res = await authAxios().get(
        `/workoutplan/${selectedTemplate.value}`
      );

      console.log("Template full data:", res.data);

      const apiData = res.data?.data;
      if (!apiData) {
        toast.error("Invalid template data");
        return;
      }

      // 2️⃣ Decide start date
      // If user already selected a start date → use it
      // Otherwise default to today
      const startDate =
        data.plan.start_date || new Date().toISOString().split("T")[0];

      // 3️⃣ Generate days based on start_date
      const processedDays = generateDaysWithDates(
        startDate,
        apiData.plan.no_of_days,
        apiData.days.map((day) => ({
          is_rest_day: day.is_rest_day,
          exercises: day.exercises.map((ex, exIdx) => ({
            name: ex.name,
            category: ex.category,
            sets: ex.sets ?? null,
            reps: ex.reps ?? null,
            weight_kg: ex.weight_kg ?? null,
            duration_mins: ex.duration_mins ?? null,
            distance_mts: ex.distance_mts ?? null,
            rest_secs: ex.rest_secs ?? null,
            notes: ex.notes || "",
            position: exIdx + 1,
            groupType: null,
            groupId: null,
            isSelected: false,
            _ui: {
              id: `ex-${Date.now()}-${exIdx}`,
              hasReps: ex.reps !== null,
              hasWeight: ex.weight_kg !== null,
              hasDistance: ex.distance_mts !== null,
              hasDuration: ex.duration_mins !== null,
            },
          })),
        }))
      );

      // 4️⃣ Update state
      setData((prev) => ({
        ...prev,
        plan: {
          ...prev.plan,
          member_id: id, // ✅ important (fixes member_id null error)
          name: apiData.plan.name,
          description: apiData.plan.description,
          workout_type: apiData.plan.workout_type,
          no_of_days: apiData.plan.no_of_days,
          start_date: startDate,
          end_date: calculateEndDate(startDate, apiData.plan.no_of_days),
        },
        days: processedDays,
      }));

      setIsFromTemplate(true);

      setActiveDayIndex(0);
      setShowConfiguration(true);
      setWorkoutForm(true);
      setShowModal(false);

      toast.success("Template assigned successfully!");
    } catch (err) {
      console.error("❌ Assign template failed:", err);
      toast.error("Failed to assign template");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplateModal = () => {
    handleCancelWorkout();
    toast.success("Template Saved Successfully!");
  };

  useEffect(() => {
    const newErrors = {};

    if (data.plan.name.trim() !== "" && errors.name) {
      newErrors.name = "";
    }

    if (data.plan.description.trim() !== "" && errors.description) {
      newErrors.description = "";
    }

    if (data.plan.start_date && errors.start_date) {
      newErrors.start_date = "";
    }

    if (data.plan.no_of_days > 0 && errors.no_of_days) {
      newErrors.no_of_days = "";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
    }
  }, [
    data.plan.name,
    data.plan.description,
    data.plan.start_date,
    data.plan.no_of_days,
  ]);

  useEffect(() => {
    if (!data.plan.start_date || !data.plan.no_of_days) return;

    setData((prev) => ({
      ...prev,
      days: generateDaysWithDates(
        prev.plan.start_date,
        prev.plan.no_of_days,
        prev.days // ✅ keep IDs
      ),
    }));
  }, [data.plan.start_date]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-0">
      <div className="flex justify-end items-end gap-2 mb-3 w-full">
        {workoutForm && (
          <div className="flex justify-end items-end gap-2 mb-3 w-full">
            <button
              type="button"
              onClick={handleAssignTemplate}
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            >
              <FiPlus /> Assign Template
            </button>
          </div>
        )}
      </div>

      {workoutForm && (
        <form onSubmit={handleNextClick} className="space-y-4 mb-6">
          <div className="flex gap-3">
            <div className="w-full grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2">
                  Workout/Program Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.plan.name}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      plan: { ...prev.plan, name: e.target.value },
                    }))
                  }
                  className="custom--input w-full"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block mb-2">Workout Type</label>
                <Select
                  options={workoutTypeOptions}
                  value={workoutTypeOptions.find(
                    (opt) => opt.value === data.plan.workout_type
                  )}
                  onChange={(selectedOption) => {
                    setData((prev) => ({
                      ...prev,
                      plan: {
                        ...prev.plan,
                        workout_type: selectedOption.value,
                        no_of_days:
                          selectedOption.value === "SINGLE"
                            ? 1
                            : prev.plan.no_of_days,
                      },
                    }));
                  }}
                  isDisabled={editingId || selectedTemplate ? true : false}
                  styles={customStyles}
                />
              </div>
              <div>
                <label className="block mb-2">
                  Start Date<span className="text-red-500">*</span>
                </label>
                <div className="custom--date relative">
                  <DatePicker
                    selected={
                      data.plan.start_date
                        ? new Date(data.plan.start_date)
                        : null
                    }
                    onChange={(date) => {
                      setData((prev) => ({
                        ...prev,
                        plan: {
                          ...prev.plan,
                          start_date: date
                            ? date.toISOString().split("T")[0]
                            : "",
                          end_date: calculateEndDate(
                            date,
                            prev.plan.no_of_days
                          ),
                        },
                      }));
                    }}
                    dateFormat="dd MMM yyyy"
                    placeholderText="Start date"
                    className="custom--input w-full"
                    minDate={new Date()}
                  />
                </div>
                {errors.start_date && (
                  <p className="text-red-500 text-sm">{errors.start_date}</p>
                )}
              </div>
              <div>
                <label className="block mb-2">
                  No. of Days<span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2 items-center">
                  {editingId && <p className="w-full max-w-fit">45 days +</p>}
                  <input
                    type="number"
                    min={0}
                    value={data.plan.no_of_days ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setData((prev) => ({
                          ...prev,
                          plan: { ...prev.plan, no_of_days: "" },
                        }));
                        return;
                      }

                      const parsedValue = parseInt(value, 10);
                      setData((prev) => ({
                        ...prev,
                        plan: {
                          ...prev.plan,
                          no_of_days: isNaN(parsedValue) ? "" : parsedValue,
                          end_date: calculateEndDate(
                            prev.plan.start_date,
                            parsedValue
                          ),
                        },
                      }));
                    }}
                    disabled={
                      data.plan.workout_type === "SINGLE" || selectedTemplate
                    }
                    className={`custom--input w-full ${
                      data.plan.workout_type === "SINGLE" || selectedTemplate
                        ? "cursor-not-allowed pointer-events-none !bg-gray-100"
                        : ""
                    }`}
                  />
                </div>

                {errors.no_of_days && (
                  <p className="text-red-500 text-sm">{errors.no_of_days}</p>
                )}
              </div>
            </div>

            <div className="max-w-[500px] w-full">
              <label className="block mb-2">
                Workout description<span className="text-red-500">*</span>
              </label>
              <textarea
                rows="5"
                value={data.plan.description}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    plan: { ...prev.plan, description: e.target.value },
                  }))
                }
                className="custom--input w-full"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
            </div>
          </div>

          {selectedTemplate && selectedTemplate ? null : (
            <>
              <div className="flex gap-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 border border-black"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={handleCancelWorkout}
                  className="px-4 py-2 bg-white text-black rounded flex items-center gap-2 border border-black"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {showConfiguration && data.days.length > 0 && (
        <div className="w-full">
          {data.days.length > 0 && (
            <>
              <div className="w-full mb-4">
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {data.days.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveDayIndex(idx)}
                        className={`px-4 py-2 border rounded text-center ${
                          activeDayIndex === idx ? "bg-blue-200" : ""
                        }`}
                      >
                        Day {day.day_no}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded p-0 mb-6">
                <div
                  className={`flex items-center ${
                    data.days?.length === 1 ? "justify-end" : "justify-between"
                  } gap-3 mb-3`}
                >
                  {data.days?.length === 1 ? null : (
                    <>
                      {!data.days[activeDayIndex]?.is_rest_day && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyDay(activeDayIndex)}
                            className="text-sm text-white px-3 py-1 rounded-[5px] bg-blue-500"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => handlePasteDay(activeDayIndex)}
                            disabled={!copiedDay}
                            className={`text-sm text-white px-3 py-1 rounded-[5px] bg-green-500 ${
                              !copiedDay ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            Paste
                          </button>
                          <button
                            onClick={() => handleClearDay(activeDayIndex)}
                            className="text-sm text-white px-3 py-1 rounded-[5px] bg-red-500"
                          >
                            Clear All
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {!data.days[activeDayIndex]?.is_rest_day && (
                    <div className="flex items-center gap-1">
                      {/* <button
                        type="button"
                        onClick={() => handleAddRestTime(activeDayIndex)}
                        className="bg-white text-black px-4 py-2 rounded text-sm border border-black"
                      >
                        + Add Rest
                      </button> */}
                      <button
                        onClick={() => setShowExercises(true)}
                        className="bg-black text-white px-4 py-2 rounded text-sm"
                      >
                        + Add Exercise
                      </button>
                    </div>
                  )}
                </div>

                {(() => {
                  const currentDay = data.days[activeDayIndex];

                  if (currentDay?.is_rest_day) {
                    return (
                      <div className="p-4 border rounded bg-yellow-50 text-center">
                        <p className="text-gray-700 font-semibold mb-2">
                          Marked as Rest Day
                        </p>
                        <button
                          onClick={() =>
                            handleToggleRestDay(activeDayIndex, false)
                          }
                          className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                          Remove Rest Day
                        </button>
                      </div>
                    );
                  }

                  const grouped = {};
                  const ungrouped = [];
                  const restBlocks = [];

                  currentDay?.exercises.forEach((exercise, index) => {
                    const item = { ...exercise, index };
                    if (exercise.groupId) {
                      if (!grouped[exercise.groupId]) {
                        grouped[exercise.groupId] = {
                          type: exercise.groupType,
                          items: [],
                        };
                      }
                      grouped[exercise.groupId].items.push(item);
                    } else if (exercise._ui?.type === "rest") {
                      restBlocks.push(item);
                    } else {
                      ungrouped.push(item);
                    }
                  });

                  const isDayEmpty = currentDay?.exercises.length === 0;

                  return (
                    <>
                      {isDayEmpty && (
                        <div className="text-center py-4 bg-gray-100 rounded">
                          <button
                            onClick={() =>
                              handleToggleRestDay(activeDayIndex, true)
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                          >
                            Mark as Rest Day
                          </button>
                        </div>
                      )}

                      {ungrouped.map((exercise) =>
                        renderExercise(exercise, exercise.index)
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                handleCancelWorkout();
              }}
              className="bg-white text-black border border-black px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveWorkoutPlan}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Workout"
                : "Save Workout"}
            </button>
          </div>
        </div>
      )}

      <AllExerciseList
        isOpen={showExercises}
        onClose={() => setShowExercises(false)}
        onSelectExercise={(ex) => handleExerciseAdd(ex)}
      />
      <AssignTemplateModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAssign={handleAssignFromModal}
        selectedWorkoutType={selectedWorkoutType}
        setSelectedWorkoutType={setSelectedWorkoutType}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
      />

      <SaveWorkoutTemplate
        onAssign={handleSaveTemplateModal}
        open={saveTemplate}
        onClose={() => setSaveTemplate(false)}
      />
    </div>
  );
};

export default WorkoutPlan;
