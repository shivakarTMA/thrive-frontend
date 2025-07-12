import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import AllExerciseList from "./AllExerciseList";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { useParams } from "react-router-dom";
import { workoutPlansList } from "../../DummyData/DummyData";

const workoutTagOptions = [
  { value: "warmup", label: "Warm-up" },
  { value: "workout", label: "Workout" },
  { value: "cooldown", label: "Cool Down" },
];

const workoutTypeOptions = [
  { value: "multiple", label: "Workout Plan (Multiple Days)" },
  { value: "single", label: "Workout (One Day)" },
];

const CreateWorkoutPlan = () => {
  const { id } = useParams();
  const workoutPlan = workoutPlansList.find((item) => item.id === parseInt(id));

  console.log(workoutPlan, "workoutPlanshviakar");

  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    workoutName: workoutPlan?.workoutName || "",
    description: "",
    workoutType: "multiple",
    numDays: 1,
    days: [],
  });

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [showExercises, setShowExercises] = useState(false);
  const [copiedDay, setCopiedDay] = useState(null);
  const [errors, setErrors] = useState({});

  const handleNextClick = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!data.workoutName.trim()) {
      newErrors.workoutName = "Workout name is required.";
    }
    if (!data.description.trim()) {
      newErrors.description = "Description is required.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setData((prev) => {
      const currentLength = prev.days.length;
      let updatedDays;

      if (currentLength === prev.numDays) return prev;
      if (currentLength < prev.numDays) {
        const additionalDays = Array.from(
          { length: prev.numDays - currentLength },
          (_, i) => ({
            name: `Day ${currentLength + i + 1}`,
            exercises: [],
            isRestDay: false,
          })
        );
        updatedDays = [...prev.days, ...additionalDays];
      } else {
        updatedDays = prev.days.slice(0, prev.numDays);
      }

      return { ...prev, days: updatedDays };
    });
    setErrors({});
    setStep(2);
  };

  const handleExerciseAdd = (exercise) => {
    setData((prev) => {
      const updatedDays = [...prev.days];
      const targetDay = updatedDays[activeDayIndex];
      targetDay.exercises.push({
        ...exercise,
        isSelected: false,
        setExercise: "",
        groupType: null,
        groupId: null,
        workoutTag: "",
        image:
          "https://media.theeverygirl.com/wp-content/uploads/2020/07/little-things-you-can-do-for-a-better-workout-the-everygirl-1.jpg",
        notes: "",
        sets: [
          {
            weight: "",
            reps: "",
            distance: "",
            duration: "",
            rest: "",
            notes: "",
          },
        ],
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleSetChange = (dayIdx, exIdx, setIdx, field, value) => {
    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIdx].exercises[exIdx].sets[setIdx][field] = value;
      return { ...prev, days: updatedDays };
    });
  };

  const handleDeleteExercise = (dayIdx, exId) => {
    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIdx].exercises = updatedDays[dayIdx].exercises.filter(
        (ex) => ex.id !== exId
      );
      return { ...prev, days: updatedDays };
    });
  };

  const handleExerciseFieldChange = (dayIdx, exIdx, field, value) => {
    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIdx].exercises[exIdx][field] = value;
      return { ...prev, days: updatedDays };
    });
  };

  const toggleExerciseSelect = (exIdx) => {
    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[activeDayIndex].exercises[exIdx].isSelected =
        !updatedDays[activeDayIndex].exercises[exIdx].isSelected;
      return { ...prev, days: updatedDays };
    });
  };

  const handleGroupSelected = (type) => {
    setData((prev) => {
      const updatedDays = [...prev.days];
      const selectedExercises = updatedDays[activeDayIndex].exercises.filter(
        (ex) => ex.isSelected
      );
      const groupId = `group-${Date.now()}`;
      updatedDays[activeDayIndex].exercises = updatedDays[
        activeDayIndex
      ].exercises.map((ex) =>
        ex.isSelected
          ? { ...ex, groupType: type, groupId, isSelected: false }
          : ex
      );
      return { ...prev, days: updatedDays };
    });
  };

  const handleUngroup = (groupId) => {
    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[activeDayIndex].exercises = updatedDays[
        activeDayIndex
      ].exercises.map((ex) =>
        ex.groupId === groupId ? { ...ex, groupId: null, groupType: null } : ex
      );
      return { ...prev, days: updatedDays };
    });
  };

  const handleClearDay = (dayIdx) => {
    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIdx] = {
        ...updatedDays[dayIdx],
        isRestDay: false,
        exercises: [],
      };
      return { ...prev, days: updatedDays };
    });
  };

  const handleCopyDay = (dayIdx) => {
    const dayToCopy = data.days[dayIdx];
    setCopiedDay(JSON.parse(JSON.stringify(dayToCopy)));
  };

  const handlePasteDay = (dayIdx) => {
    if (!copiedDay) return;
    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIdx] = {
        ...copiedDay,
        name: updatedDays[dayIdx].name,
      };
      return { ...prev, days: updatedDays };
    });
  };

  const handleAddRestTime = (dayIdx) => {
    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIdx].exercises.push({
        type: "rest",
        duration: 60,
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleToggleRestDay = (dayIdx, isRest) => {
    setData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIdx] = {
        ...updatedDays[dayIdx],
        isRestDay: isRest,
        exercises: isRest ? [] : updatedDays[dayIdx].exercises,
      };
      return { ...prev, days: updatedDays };
    });
  };

  const handleSaveWorkoutPlan = () => {
    if (!data.workoutName || !data.description) return;
    const workoutPayload = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    console.log("Submitting workout plan:", workoutPayload);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!data.workoutName.trim()) {
      newErrors.workoutName = "Workout name is required.";
    }
    if (!data.description.trim()) {
      newErrors.description = "Description is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Generate days inside `data.days` instead of separate `days` state
    const generatedDays = Array.from({ length: data.numDays }, (_, i) => ({
      name: `Day ${i + 1}`,
      exercises: [],
      isRestDay: false,
    }));

    setData((prev) => ({
      ...prev,
      days: generatedDays,
    }));

    setActiveDayIndex(0);
    setErrors({});
    setStep(2); // move to next step
  };

  const renderGroupedExercises = (groupId, groupType, groupExercises) => (
    <div className="border p-3 rounded mb-3 bg-gray-100">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <p className="font-semibold capitalize">{groupType} Set of</p>
          <input
            type="number"
            defaultValue={1}
            className="custom--input max-w-[60px] w-full number--appearance-none text-center"
            min={1}
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

      {groupExercises.map((item, exIdx) => {
        if (item.type === "rest") {
          return renderRestBlock({ ...item, index: exIdx }, true);
        }
        return renderExercise(item, exIdx, true);
      })}
    </div>
  );

  const renderExercise = (exercise, exIdx, isGrouped = false) => (
    <div key={exIdx} className="mb-2 border p-2 px-4 rounded bg-white">
      <div className="flex justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={exercise.isSelected || false}
            onChange={() => toggleExerciseSelect(exIdx)}
          />
          <h3 className="font-medium mb-1">{exercise.name}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDeleteExercise(activeDayIndex, exercise.id)}
            className="text-red-600 text-sm"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="flex items-centerd gap-3">
        <div className="max-w-[100px] w-full">
          <img
            src={exercise.image}
            alt="exercise"
            className="w-[100px] h-[100px] object-cover rounded"
          />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-3 items-baseline">
            <div className="flex flex-col gap-3 mb-3">
              <div className="flex gap-3">
                {!isGrouped && (
                  <div className="w-full">
                    <input
                      type="number"
                      placeholder="No. of set"
                      value={exercise.setExercise || ""}
                      onChange={(e) =>
                        handleExerciseFieldChange(
                          activeDayIndex,
                          exIdx,
                          "setExercise",
                          e.target.value
                        )
                      }
                      className="custom--input number--appearance-none w-full"
                    />
                  </div>
                )}

                <div className="w-full">
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Workout Tag"
                    value={
                      workoutTagOptions.find(
                        (option) => option.value === exercise.workoutTag
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      handleExerciseFieldChange(
                        activeDayIndex,
                        exIdx,
                        "workoutTag",
                        selectedOption?.value || ""
                      )
                    }
                    options={workoutTagOptions}
                    styles={customStyles}
                    isClearable
                  />
                </div>
              </div>
              <div className="w-full">
                <input
                  placeholder="Notes"
                  value={exercise.notes}
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

            {exercise.sets.map((set, setIdx) => (
              <div key={setIdx} className="grid grid-cols-2 gap-3 mb-3">
                {exercise.resps && (
                  <input
                    type="number"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) =>
                      handleSetChange(
                        activeDayIndex,
                        exIdx,
                        setIdx,
                        "reps",
                        e.target.value
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                )}
                {exercise.duration && (
                  <input
                    type="number"
                    placeholder="Duration (sec)"
                    value={set.duration}
                    onChange={(e) =>
                      handleSetChange(
                        activeDayIndex,
                        exIdx,
                        setIdx,
                        "duration",
                        e.target.value
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                )}
                {exercise.distance && (
                  <input
                    type="number"
                    placeholder="Distance (m)"
                    value={set.distance}
                    onChange={(e) =>
                      handleSetChange(
                        activeDayIndex,
                        exIdx,
                        setIdx,
                        "distance",
                        e.target.value
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                )}
                {exercise.weight && (
                  <input
                    type="number"
                    placeholder="Weight (Kg)"
                    value={set.weight}
                    onChange={(e) =>
                      handleSetChange(
                        activeDayIndex,
                        exIdx,
                        setIdx,
                        "weight",
                        e.target.value
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                )}
                {!isGrouped && (
                  <input
                    type="number"
                    placeholder="Rest(Secs)"
                    value={set.rest}
                    onChange={(e) =>
                      handleSetChange(
                        activeDayIndex,
                        exIdx,
                        setIdx,
                        "rest",
                        e.target.value
                      )
                    }
                    className="custom--input number--appearance-none w-full"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRestBlock = (restBlock) => (
    <div key={restBlock.id} className="mb-2 border p-3 rounded bg-yellow-50">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={restBlock.isSelected || false}
            onChange={() => toggleExerciseSelect(restBlock.index)}
          />
          <h3 className="text-sm font-semibold text-gray-700">Rest Time</h3>
        </div>
        <button
          onClick={() => handleDeleteExercise(activeDayIndex, restBlock.id)}
          className="text-red-600 text-sm"
        >
          Remove
        </button>
      </div>
      <input
        type="number"
        placeholder="Rest (seconds)"
        value={restBlock.sets?.[0]?.rest || ""}
        onChange={(e) =>
          handleSetChange(
            activeDayIndex,
            restBlock.index,
            0,
            "rest",
            e.target.value
          )
        }
        className="border p-2 rounded w-full number--appearance-none"
      />
    </div>
  );

  console.log(data, "data");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Workout Plan</h1>
      {step === 1 && (
        <form onSubmit={handleFormSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block mb-2">Workout Name</label>
            <input
              type="text"
              value={data?.workoutName}
              onChange={(e) =>
                setData((prev) => ({ ...prev, workoutName: e.target.value }))
              }
              className="border px-3 py-2 w-full rounded"
            />
            {errors.workoutName && (
              <p className="text-red-500 text-sm">{errors.workoutName}</p>
            )}
          </div>

          <div>
            <label className="block mb-2">Description</label>
            <textarea
              rows="2"
              value={data.description}
              onChange={(e) =>
                setData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="border px-3 py-2 w-full rounded"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block mb-2">Workout Type</label>
            <Select
              options={workoutTypeOptions}
              value={workoutTypeOptions.find(
                (opt) => opt.value === data.workoutType
              )}
              onChange={(selectedOption) => {
                setData((prev) => ({
                  ...prev,
                  workoutType: selectedOption.value,
                  numDays: selectedOption.value === "single" ? 1 : prev.numDays,
                }));
              }}
              styles={customStyles}
            />
          </div>

          <div>
            <label className="block mb-2">No. of Days</label>
            <input
              type="number"
              min={1}
              value={data.numDays}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  numDays: Number(e.target.value),
                }))
              }
              disabled={data.workoutType === "single"}
              className="border px-3 py-2 w-full rounded number--appearance-none"
            />
          </div>

          <button
            type="button"
            onClick={handleNextClick}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Configure Workout
          </button>
        </form>
      )}
      {step === 2 && (
        <>
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
                        {day.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border rounded p-4 mb-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  {/* <h2 className="text-xl font-semibold mb-2">
                    {days[activeDayIndex].name}
                  </h2> */}
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
                        className={`text-sm text-white px-3 py-1 rounded-[5px] bg-green-500`}
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
                  <div className="flex gap-2">
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
                  </div>

                  {!data.days[activeDayIndex].isRestDay && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAddRestTime(activeDayIndex)}
                        className="bg-white text-black px-4 py-2 rounded text-sm"
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

                  // 🛑 If the day is marked as a rest day, just show a message and "Remove" button
                  if (currentDay.isRestDay) {
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

                  // 🧪 Check if there are no exercises
                  const grouped = {};
                  const ungrouped = [];
                  const restBlocks = [];

                  currentDay.exercises.forEach((ex, idx) => {
                    const item = { ...ex, index: idx };

                    if (ex.groupId) {
                      if (!grouped[ex.groupId]) {
                        grouped[ex.groupId] = { type: ex.groupType, items: [] };
                      }
                      grouped[ex.groupId].items.push(item);
                    } else if (ex.type === "rest") {
                      restBlocks.push(item);
                    } else {
                      ungrouped.push(item);
                    }
                  });

                  const isDayEmpty = currentDay.exercises.length === 0;

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

                      {/* Grouped sets */}
                      {Object.entries(grouped).map(([gid, { type, items }]) =>
                        renderGroupedExercises(gid, type, items)
                      )}

                      {/* Ungrouped exercises */}
                      {ungrouped.map((ex) => renderExercise(ex, ex.index))}

                      {/* Rest blocks */}
                      {restBlocks.map((rest) =>
                        renderRestBlock(rest, rest.index)
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-black border border-black px-4 py-2 rounded"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleSaveWorkoutPlan}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          </div>
        </>
      )}

      <AllExerciseList
        isOpen={showExercises}
        onClose={() => setShowExercises(false)}
        onSelectExercise={(ex) => handleExerciseAdd(ex)}
      />
    </div>
  );
};

export default CreateWorkoutPlan;
