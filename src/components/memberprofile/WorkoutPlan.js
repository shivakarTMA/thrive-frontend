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

  // API: Fetch workout plan when editing
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
                  // Convert group_type and group_id from API to frontend format
                  groupType: exercise.group_type || null,
                  groupId: exercise.group_id || null,
                  notes: exercise.notes || "",
                  isSelected: false,
                  _ui: isRestTime
                    ? {
                        id: exercise.id,
                        type: "rest",
                      }
                    : {
                        id: exercise.id,
                        // Infer capabilities from existing data
                        hasReps:
                          exercise.reps !== null && exercise.reps !== undefined,
                        hasWeight:
                          exercise.weight_kg !== null &&
                          exercise.weight_kg !== undefined,
                        hasDistance:
                          exercise.distance !== null &&
                          exercise.distance !== undefined,
                        hasDuration:
                          exercise.duration !== null &&
                          exercise.duration !== undefined,
                      },
                };
              }) || [],
          })) || [];

        setData({
          plan: {
            id: data?.plan.id || null,
            member_id: data?.plan.member_id || id,
            name: data?.plan.name || "",
            description: data?.plan.description || "",
            workout_type: data?.plan.workout_type || "MULTIDAY",
            no_of_days: data?.plan.no_of_days || null,
            start_date: data?.plan.start_date || "",
            end_date: data?.plan.end_date || "",
            created_by: data?.plan.created_by || createdBy,
            position: data?.plan.position || 1,
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

  const calculateEndDate = (startDate, numDays) => {
    if (!startDate || !numDays) return "";
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(numDays) - 1);
    return endDate.toISOString().split("T")[0];
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

    const generatedDays = Array.from(
      { length: data.plan.no_of_days },
      (_, i) => {
        const dayDate = new Date(data.plan.start_date);
        dayDate.setDate(dayDate.getDate() + i);

        return {
          day_no: i + 1,
          day_date: dayDate.toISOString().split("T")[0],
          is_rest_day: false,
          position: i + 1,
          exercises: [],
        };
      }
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
          distance: exercise.has_distance ? null : null,
          duration: exercise.has_duration ? null : null,
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

  // API: Delete exercise
  const handleDeleteExercise = async (dayIdx, position) => {
    const exerciseToDelete = data.days[dayIdx].exercises.find(
      (ex) => ex.position === position
    );

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
      updatedDays[dayIdx].exercises = updatedDays[dayIdx].exercises
        .filter((ex) => ex.position !== position)
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

  const toggleExerciseSelect = (exIdx) => {
    setData((prev) => {
      const updatedDays = prev.days.map((day, index) => {
        if (index !== activeDayIndex) return day;

        const updatedExercises = day.exercises.map((exercise, i) =>
          i === exIdx
            ? { ...exercise, isSelected: !exercise.isSelected }
            : exercise
        );

        return { ...day, exercises: updatedExercises };
      });

      return { ...prev, days: updatedDays };
    });
  };

  const handleGroupSelected = (type) => {
    setData((previousState) => {
      const updatedDays = [...previousState.days];
      const groupId = `group-${Date.now()}`;
      updatedDays[activeDayIndex].exercises = updatedDays[
        activeDayIndex
      ].exercises.map((ex) =>
        ex.isSelected
          ? { ...ex, groupType: type, groupId, isSelected: false }
          : ex
      );
      return { ...previousState, days: updatedDays };
    });
  };

  const handleUngroup = (groupId) => {
    setData((previousState) => {
      const updatedDays = [...previousState.days];
      updatedDays[activeDayIndex].exercises = updatedDays[
        activeDayIndex
      ].exercises.map((ex) =>
        ex.groupId === groupId ? { ...ex, groupId: null, groupType: null } : ex
      );
      return { ...previousState, days: updatedDays };
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

  const handleCopyDay = (dayIdx) => {
    const dayToCopy = data.days[dayIdx];

    // copy only exercises
    const copiedExercises = JSON.parse(
      JSON.stringify(dayToCopy.exercises || [])
    );

    setCopiedDay(copiedExercises);
    toast.success("Exercises copied successfully!");
  };

  // const handlePasteDay = (dayIdx) => {
  //   if (!copiedDay) return;
  //   setData((prev) => {
  //     const updatedDays = [...prev.days];
  //     updatedDays[dayIdx] = {
  //       ...copiedDay,
  //       day_no: updatedDays[dayIdx].day_no,
  //       day_date: updatedDays[dayIdx].day_date,
  //       position: updatedDays[dayIdx].position,
  //     };
  //     return { ...prev, days: updatedDays };
  //   });
  //   toast.success("Paste Successfully");
  // };

  const handlePasteDay = (dayIdx) => {
    if (!copiedDay) return;

    setData((prev) => {
      const updatedDays = [...prev.days];

      // Replace ONLY exercises
      updatedDays[dayIdx] = {
        ...updatedDays[dayIdx],
        exercises: JSON.parse(JSON.stringify(copiedDay)), // overwrite exercises
      };

      return { ...prev, days: updatedDays };
    });

    toast.success("Exercises pasted successfully!");
  };

  const handleAddRestTime = (dayIndex) => {
    setData((previousState) => {
      const updatedDays = previousState.days.map((day, index) => {
        if (index !== dayIndex) return day;
        return {
          ...day,
          exercises: [
            ...day.exercises,
            {
              name: "Rest Time",
              category: "Rest",
              sets: null,
              reps: null,
              weight_kg: null,
              distance: null,
              duration: null,
              rest_secs: null,
              notes: "",
              position: day.exercises.length + 1,
              isSelected: false,
              _ui: {
                id: `rest-${Date.now()}`,
                type: "rest",
              },
            },
          ],
        };
      });
      return { ...previousState, days: updatedDays };
    });
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
      plan: data.plan,
      days: data.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => {
          const { isSelected, groupType, groupId, _ui, ...cleanEx } = ex;

          // Focus on specific fields: reps, rest_secs, sets, weight_kg
          const cleanedEx = {
            ...cleanEx,
            group_type: groupType || null,
            group_id: groupId || null,
          };

          // Define the fields you want to clean
          const fieldsToClean = ["reps", "rest_secs", "sets", "weight_kg"];

          // Loop through each specific field and clean it
          fieldsToClean.forEach((field) => {
            if (cleanedEx[field] === null || cleanedEx[field] === undefined) {
              // Set to 0 for numbers or leave it out entirely
              cleanedEx[field] = 0; // Use 0 as a default for these numeric fields
            }
          });

          return cleanedEx;
        }),
      })),
    };
  };

  const validateWorkoutPlan = (data) => {
    let errors = {};

    data.days.forEach((day, dayIndex) => {
      if (day.is_rest_day) return;

      day.exercises.forEach((ex, exIndex) => {
        const prefix = `day_${dayIndex}_ex_${exIndex}`;

        // Skip rest block
        if (ex._ui?.type === "rest") {
          if (ex.rest_secs == null || ex.rest_secs === "") {
            errors[`${prefix}_rest_secs`] = "Rest seconds is required";
          }
          return;
        }

        // sets
        if (ex.sets == null || ex.sets === "") {
          errors[`${prefix}_sets`] = "Sets is required";
        }

        // reps
        if (ex._ui?.hasReps && (ex.reps == null || ex.reps === "")) {
          errors[`${prefix}_reps`] = "Reps is required";
        }

        // duration
        if (
          ex._ui?.hasDuration &&
          (ex.duration == null || ex.duration === "")
        ) {
          errors[`${prefix}_duration`] = "Duration is required";
        }

        // distance
        if (
          ex._ui?.hasDistance &&
          (ex.distance == null || ex.distance === "")
        ) {
          errors[`${prefix}_distance`] = "Distance is required";
        }

        // weight
        if (
          ex._ui?.hasWeight &&
          (ex.weight_kg == null || ex.weight_kg === "")
        ) {
          errors[`${prefix}_weight_kg`] = "Weight is required";
        }

        // rest
        if (ex.rest_secs == null || ex.rest_secs === "") {
          errors[`${prefix}_rest_secs`] = "Rest seconds is required";
        }
      });
    });

    return errors;
  };

  // API: Create or Update workout plan
  const handleSaveWorkoutPlan = async () => {
    // if (!data.plan.name || !data.plan.description || !data.plan.start_date) {
    //   toast.error("Please fill in all required fields");
    //   return;
    // }

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

    // NEW VALIDATION
    const errors = validateWorkoutPlan(data);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return; // stop save
    }

    setValidationErrors({});

    const cleanedData = cleanDataForSubmission(data);

    console.log("cleanedData", cleanedData);

    // try {
    //   setLoading(true);
    //   let response;

    //   if (editingId) {
    //     // Update existing workout plan with delete actions
    //     const updatePayload = {
    //       ...cleanedData,
    //       delete_actions: deleteActions,
    //     };

    //     response = await authAxios().put(
    //       `/member/workoutplan/${editingId}`,
    //       updatePayload
    //     );
    //     toast.success("Workout plan updated successfully!");
    //   } else {
    //     // Create new workout plan
    //     response = await authAxios().post(
    //       `/member/workoutplan/create`,
    //       cleanedData
    //     );
    //     toast.success("Workout plan created successfully!");
    //   }

    //   // Reset delete actions after successful save
    //   setDeleteActions({
    //     delete_days: [],
    //     delete_exercises: [],
    //   });

    //   handleCancelWorkout();
    //   handleWorkoutUpdate();
    // } catch (error) {
    //   console.error("Error saving workout plan:", error);
    //   toast.error(
    //     error.response?.data?.message || "Failed to save workout plan"
    //   );
    // } finally {
    //   setLoading(false);
    // }
  };

  const renderGroupedExercises = (groupId, groupType, groupExercises) => {
    return (
      <div key={groupId} className="border p-3 rounded mb-3 bg-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <p className="font-semibold capitalize">{groupType} Set of</p>
            <input
              type="number"
              min={1}
              value={groupExercises[0].sets ?? ""}
              onChange={(e) => {
                const newValue =
                  e.target.value === "" ? null : Number(e.target.value);
                groupExercises.forEach((exercise) =>
                  handleExerciseFieldChange(
                    activeDayIndex,
                    exercise.index,
                    "sets",
                    newValue
                  )
                );
              }}
              className="custom--input max-w-[60px] w-full text-center !px-0"
            />
            <p>{groupType === "circuit" ? "round(s)" : "set(s)"}</p>
          </div>
          <button
            onClick={() => handleUngroup(groupId)}
            className="text-sm text-blue-600 hover:underline"
          >
            Ungroup
          </button>
        </div>

        {groupExercises.map((exercise) =>
          exercise._ui?.type === "rest"
            ? renderRestBlock({ ...exercise, index: exercise.index }, true)
            : renderExercise(exercise, exercise.index, true)
        )}
      </div>
    );
  };

  const sanitizeNumber = (value) => {
    // Allow empty for typing
    if (value === "") return "";

    const num = Number(value);

    // Prevent NaN or negatives
    if (isNaN(num) || num < 0) return 0;

    return num;
  };

  const renderExercise = (exercise, exIdx, isGrouped = false) => (
    <div key={exIdx} className="mb-2 border p-2 px-4 rounded bg-white">
      <div className="flex justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* {!isGrouped && (
            <input
              type="checkbox"
              checked={exercise.isSelected || false}
              onChange={() => toggleExerciseSelect(exIdx)}
            />
          )} */}
          <h3 className="mb-1">
            <strong>Exercise</strong>: {exercise.name}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              handleDeleteExercise(activeDayIndex, exercise.position)
            }
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
                  <input
                    type="number"
                    placeholder="No. of sets"
                    value={exercise.sets ?? ""}
                    // onChange={(e) =>
                    //   handleExerciseFieldChange(
                    //     activeDayIndex,
                    //     exIdx,
                    //     "sets",
                    //     e.target.value === "" ? null : Number(e.target.value)
                    //   )
                    // }

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
                  <input
                    type="number"
                    placeholder="Reps"
                    value={exercise.reps ?? ""}
                    // onChange={(e) =>
                    //   handleExerciseFieldChange(
                    //     activeDayIndex,
                    //     exIdx,
                    //     "reps",
                    //     e.target.value === "" ? null : Number(e.target.value)
                    //   )
                    // }
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
                  <input
                    type="number"
                    placeholder="Duration (sec)"
                    value={exercise.duration ?? ""}
                    // onChange={(e) =>
                    //   handleExerciseFieldChange(
                    //     activeDayIndex,
                    //     exIdx,
                    //     "duration",
                    //     e.target.value === "" ? null : Number(e.target.value)
                    //   )
                    // }
                    onChange={(e) =>
                      handleExerciseFieldChange(
                        activeDayIndex,
                        exIdx,
                        "duration",
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
                  <input
                    type="number"
                    placeholder="Distance (m)"
                    value={exercise.distance ?? ""}
                    // onChange={(e) =>
                    //   handleExerciseFieldChange(
                    //     activeDayIndex,
                    //     exIdx,
                    //     "distance",
                    //     e.target.value === "" ? null : Number(e.target.value)
                    //   )
                    // }
                    onChange={(e) =>
                      handleExerciseFieldChange(
                        activeDayIndex,
                        exIdx,
                        "distance",
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
                  <input
                    type="number"
                    placeholder="Weight (Kg)"
                    value={exercise.weight_kg ?? ""}
                    // onChange={(e) =>
                    //   handleExerciseFieldChange(
                    //     activeDayIndex,
                    //     exIdx,
                    //     "weight_kg",
                    //     e.target.value === "" ? null : Number(e.target.value)
                    //   )
                    // }
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
                  <input
                    type="number"
                    placeholder="Rest(Secs)"
                    value={exercise.rest_secs ?? ""}
                    // onChange={(e) =>
                    //   handleExerciseFieldChange(
                    //     activeDayIndex,
                    //     exIdx,
                    //     "rest_secs",
                    //     e.target.value === "" ? null : Number(e.target.value)
                    //   )
                    // }
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
                  // onChange={(e) =>
                  //   handleExerciseFieldChange(
                  //     activeDayIndex,
                  //     exIdx,
                  //     "notes",
                  //     sanitizeNumber(e.target.value)
                  //   )
                  // }
                  className="custom--input w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRestBlock = (restBlock, isGrouped = false) => (
    <div key={restBlock.index} className="mb-2 border p-3 rounded bg-yellow-50">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {!isGrouped && (
            <input
              type="checkbox"
              checked={restBlock.isSelected || false}
              onChange={() => toggleExerciseSelect(restBlock.index)}
            />
          )}
          <h3 className="text-sm font-semibold text-gray-700">Rest Time</h3>
        </div>
        <button
          onClick={() =>
            handleDeleteExercise(activeDayIndex, restBlock.position)
          }
          className="text-red-600 text-sm"
        >
          Remove
        </button>
      </div>
      <input
        type="number"
        placeholder="Rest (seconds)"
        value={restBlock.rest_secs || ""}
        onChange={(e) =>
          handleExerciseFieldChange(
            activeDayIndex,
            restBlock.index,
            "rest_secs",
            e.target.value === "" ? null : Number(e.target.value)
          )
        }
        className="border p-2 rounded w-full number--appearance-none"
      />
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

  const handleSaveTemplate = () => {
    setSaveTemplate(true);
  };

  const handleAssignFromModal = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    let templateData = null;
    if (selectedTemplate.value === "template1")
      templateData = workoutTemplateWithExercises;
    if (selectedTemplate.value === "template2")
      templateData = workoutTemplatePushDay;
    if (selectedTemplate.value === "template3") templateData = TrainingList;
    if (selectedTemplate.value === "template4")
      templateData = workoutTemplateHIIT;

    setData((prev) => ({
      ...prev,
      plan: {
        ...prev.plan,
        name: templateData.name,
        workout_type: templateData.type,
        no_of_days: templateData.numDays,
        description: templateData.description,
      },
      days: templateData.days,
    }));

    setActiveDayIndex(0);
    setShowConfiguration(true);
    setWorkoutForm(true);
    setShowModal(false);
    toast.success("Template Assigned Successfully!");
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
          <button
            type="button"
            onClick={handleAssignTemplate}
            className="bg-black text-white px-4 py-2 rounded text-sm flex gap-1 items-center"
          >
            <FiPlus /> Assign Template
          </button>
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
                  isDisabled={editingId ? true : false}
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
                    disabled={data.plan.workout_type === "SINGLE"}
                    className={`custom--input w-full ${
                      data.plan.workout_type === "SINGLE"
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
                <div className="flex items-center justify-end gap-3 mb-3">
                  {/* {activeDayIndex !== null && (
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
                  )} */}

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

                      {Object.entries(grouped).map(
                        ([groupId, { type, items }]) =>
                          renderGroupedExercises(groupId, type, items)
                      )}

                      {ungrouped.map((exercise) =>
                        renderExercise(exercise, exercise.index)
                      )}

                      {restBlocks.map((rest) => renderRestBlock(rest))}
                    </>
                  );
                })()}
              </div>
            </>
          )}
          <div className="flex justify-between mt-6">
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
