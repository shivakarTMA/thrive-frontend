import React, { useEffect, useState } from "react";
import AllExerciseList from "../WorkoutPlan/AllExerciseList";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { useParams } from "react-router-dom";
import {
  TrainingList,
  workoutPlansList,
  workoutTemplateHIIT,
  workoutTemplatePushDay,
  workoutTemplateWithExercises,
} from "../../DummyData/DummyData";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { FiPlus } from "react-icons/fi";
import AssignTemplateModal from "./AssignTemplateModal";
import SaveWorkoutTemplate from "./SaveWorkoutTemplate";

const workoutTypeOptions = [
  { value: "MULTIDAY", label: "Workout Plan (Multiple Days)" },
  { value: "SINGLE", label: "Workout (One Day)" },
];

const WorkoutPlan = ({ handleCancelWorkout, editingId }) => {
  const { id } = useParams();
  const workoutPlan = workoutPlansList.find((item) => item.id === parseInt(id));

  const [data, setData] = useState({
    plan: {
      member_id: id,
      name: "",
      description: "",
      workout_type: "MULTIDAY",
      no_of_days: null,
      start_date: "",
      end_date: "",
      created_by: null, // Add your user ID here
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

  const [showModal, setShowModal] = useState(false);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleExtendDays = () => {
    setWorkoutForm(true);
    setShowConfiguration(false);
    setData((prev) => ({
      ...prev,
      days: [],
    }));
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

    // Validate required fields
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

    // Calculate end date
    const endDate = calculateEndDate(
      data.plan.start_date,
      data.plan.no_of_days
    );

    // Generate days with proper structure
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
          weight: exercise.has_weight ? null : null,
          distance: exercise.has_distance ? null : null,
          duration: exercise.has_duration ? null : null,
          rest_secs: null,
          notes: "",
          position: day.exercises.length + 1,
          groupType: null,
          groupId: null,
          isSelected: false,
          // Keep UI metadata temporarily
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

  const handleDeleteExercise = (dayIdx, position) => {
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
    setCopiedDay(JSON.parse(JSON.stringify(dayToCopy)));
    toast.success("Copy Successfully");
  };

  const handlePasteDay = (dayIdx) => {
    if (!copiedDay) return;
    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIdx] = {
        ...copiedDay,
        day_no: updatedDays[dayIdx].day_no,
        day_date: updatedDays[dayIdx].day_date,
        position: updatedDays[dayIdx].position,
      };
      return { ...prev, days: updatedDays };
    });
    toast.success("Paste Successfully");
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
              weight: null,
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
    // Remove UI-only fields before submission
    return {
      plan: data.plan,
      days: data.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => {
          const { isSelected, groupType, groupId, _ui, ...cleanEx } = ex;
          return cleanEx;
        }),
      })),
    };
  };

  // Group with ID

  // const cleanDataForSubmission = (data) => {
  //   // Remove UI-only fields before submission, but keep group info
  //   return {
  //     plan: data.plan,
  //     days: data.days.map((day) => ({
  //       ...day,
  //       exercises: day.exercises.map((ex) => {
  //         const { isSelected, _ui, ...cleanEx } = ex;
  //         // Keep groupType and groupId if they exist
  //         return {
  //           ...cleanEx,
  //           group_type: ex.groupType || null,
  //           group_id: ex.groupId || null,
  //         };
  //       }),
  //     })),
  //   };
  // };

  const handleSaveWorkoutPlan = () => {
    if (!data.plan.name || !data.plan.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const cleanedData = cleanDataForSubmission(data);
    console.log("Submitting workout plan:", cleanedData);
    toast.success("Workout plan saved successfully!");
    // handleCancelWorkout();
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

  const renderExercise = (exercise, exIdx, isGrouped = false) => (
    <div key={exIdx} className="mb-2 border p-2 px-4 rounded bg-white">
      <div className="flex justify-between mb-3">
        <div className="flex items-center gap-2">
          {!isGrouped && (
            <input
              type="checkbox"
              checked={exercise.isSelected || false}
              onChange={() => toggleExerciseSelect(exIdx)}
            />
          )}
          <h3 className="font-medium mb-1">{exercise.name}</h3>
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
                    onChange={(e) =>
                      handleExerciseFieldChange(
                        activeDayIndex,
                        exIdx,
                        "sets",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                </div>
              )}
              {exercise._ui?.hasReps && (
                <input
                  type="number"
                  placeholder="Reps"
                  value={exercise.reps ?? ""}
                  onChange={(e) =>
                    handleExerciseFieldChange(
                      activeDayIndex,
                      exIdx,
                      "reps",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="custom--input number--appearance-none w-full"
                />
              )}
              {exercise._ui?.hasDuration && (
                <input
                  type="number"
                  placeholder="Duration (sec)"
                  value={exercise.duration ?? ""}
                  onChange={(e) =>
                    handleExerciseFieldChange(
                      activeDayIndex,
                      exIdx,
                      "duration",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="custom--input number--appearance-none w-full"
                />
              )}
              {exercise._ui?.hasDistance && (
                <input
                  type="number"
                  placeholder="Distance (m)"
                  value={exercise.distance ?? ""}
                  onChange={(e) =>
                    handleExerciseFieldChange(
                      activeDayIndex,
                      exIdx,
                      "distance",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="custom--input number--appearance-none w-full"
                />
              )}
              {exercise._ui?.hasWeight && (
                <input
                  type="number"
                  placeholder="Weight (Kg)"
                  value={exercise.weight ?? ""}
                  onChange={(e) =>
                    handleExerciseFieldChange(
                      activeDayIndex,
                      exIdx,
                      "weight",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="custom--input number--appearance-none w-full"
                />
              )}
              {!isGrouped && (
                <input
                  type="number"
                  placeholder="Rest(Secs)"
                  value={exercise.rest_secs ?? ""}
                  onChange={(e) =>
                    handleExerciseFieldChange(
                      activeDayIndex,
                      exIdx,
                      "rest_secs",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="custom--input number--appearance-none w-full"
                />
              )}
            </div>
            <div className="block">
              <div className="w-full">
                <input
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
            Number(e.target.value)
          )
        }
        className="border p-2 rounded w-full number--appearance-none"
      />
    </div>
  );

  useEffect(() => {
    if (editingId) {
      setWorkoutForm(false);
      setShowConfiguration(true);
      const selectedWorkout = TrainingList.find(
        (item) => item.id === editingId
      );

      if (selectedWorkout) {
        console.log(selectedWorkout, "selectedWorkout");
        // Handle both old and new data structures
        const isNewStructure = selectedWorkout.plan !== undefined;

        if (isNewStructure) {
          // New structure: already has plan and days
          setData({
            plan: {
              member_id: selectedWorkout.plan.member_id || id,
              name: selectedWorkout.plan.name || "",
              description: selectedWorkout.plan.description || "",
              workout_type: selectedWorkout.plan.workout_type || "MULTIDAY",
              no_of_days: selectedWorkout.plan.no_of_days || null,
              start_date: selectedWorkout.plan.start_date || "",
              end_date: selectedWorkout.plan.end_date || "",
              created_by: selectedWorkout.plan.created_by || null,
              position: selectedWorkout.plan.position || 1,
            },
            days: selectedWorkout.days || [],
          });
        } else {
          // Old structure: needs conversion
          setData({
            plan: {
              member_id: id,
              name: selectedWorkout.workoutName || selectedWorkout.name || "",
              description: selectedWorkout.description || "",
              workout_type: selectedWorkout.workoutType || "",
              no_of_days:
                selectedWorkout.noOfDays || selectedWorkout.numDays || null,
              start_date: selectedWorkout.startDate || "",
              end_date: calculateEndDate(
                selectedWorkout.startDate,
                selectedWorkout.noOfDays || selectedWorkout.numDays
              ),
              created_by: null,
              position: 1,
            },
            days: selectedWorkout.days || [],
          });
        }
      }
    }
  }, [editingId, id]);

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

    // Clear name error
    if (data.plan.name.trim() !== "" && errors.name) {
      newErrors.name = "";
    }

    // Clear description error
    if (data.plan.description.trim() !== "" && errors.description) {
      newErrors.description = "";
    }

    // Clear start date error
    if (data.plan.start_date && errors.start_date) {
      newErrors.start_date = "";
    }

    // Clear no_of_days error
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

  return (
    <div className="p-0">
      <div className="flex justify-end items-end gap-2 mb-3 w-full">
        {!workoutForm ? // <button
        //   type="button"
        //   onClick={handleExtendDays}
        //   className="bg-black text-white px-4 py-2 rounded text-sm flex gap-1 items-center border border-black"
        // >
        //   <FiPlus /> Extend Days
        // </button>
        null : (
          <button
            type="button"
            onClick={handleAssignTemplate}
            className="bg-black text-white px-4 py-2 rounded text-sm flex gap-1 items-center"
          >
            <FiPlus /> Assign Template
          </button>
        )}

        {showConfiguration &&
          data.days.length > 0 &&
          // <button
          //   type="button"
          //   onClick={handleSaveTemplate}
          //   className="bg-white text-black px-4 py-2 rounded text-sm flex gap-1 items-center border border-black"
          // >
          //   <FiPlus /> Save as Template
          // </button>
          null}
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
                <div className="flex items-center justify-between gap-3 mb-3">
                  {activeDayIndex !== null && (
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
                  {/* <div className="flex gap-2">
                    <button
                      onClick={() => handleGroupSelected("superset")}
                      className="bg-black text-white px-3 py-1 rounded text-sm"
                    >
                      Superset
                    </button>
                    <button
                      onClick={() => handleGroupSelected("giant")}
                      className="bg-black text-white px-3 py-1 rounded text-sm"
                    >
                      Giant Set
                    </button>
                    <button
                      onClick={() => handleGroupSelected("circuit")}
                      className="bg-black text-white px-3 py-1 rounded text-sm"
                    >
                      Circuit
                    </button>
                  </div> */}

                  {!data.days[activeDayIndex]?.is_rest_day && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAddRestTime(activeDayIndex)}
                        className="bg-white text-black px-4 py-2 rounded text-sm border border-black"
                      >
                        + Add Rest
                      </button>
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

                  // If the day is marked as a rest day
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

                  // Check if there are no exercises
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
                      {/* Show "Mark as Rest Day" button if nothing exists */}
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
              className="bg-black text-white px-4 py-2 rounded text-sm"
            >
              Save Workout
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
