import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";

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
];

const exerciseList = [
  // Legs
  {
    id: 1,
    name: "Barbell Squat",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "legs",
  },
  {
    id: 2,
    name: "Leg Press",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "legs",
  },

  // Cardio
  {
    id: 3,
    name: "Treadmill Run",
    resps: false,
    duration: true,
    distance: true,
    weight: false,
    category: "cardio",
  },
  {
    id: 4,
    name: "Rowing Machine",
    resps: false,
    duration: true,
    distance: true,
    weight: true,
    category: "cardio",
  },

  // Chest
  {
    id: 5,
    name: "Barbell Bench Press",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "chest",
  },
  {
    id: 6,
    name: "Incline Dumbbell Press",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "chest",
  },

  // Shoulders
  {
    id: 7,
    name: "Overhead Press",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "shoulders",
  },
  {
    id: 8,
    name: "Lateral Raise",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "shoulders",
  },

  // Biceps
  {
    id: 9,
    name: "Barbell Curl",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "biceps",
  },
  {
    id: 10,
    name: "Hammer Curl",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "biceps",
  },

  // Triceps
  {
    id: 11,
    name: "Triceps Pushdown",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "triceps",
  },
  {
    id: 12,
    name: "Overhead Triceps Extension",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "triceps",
  },

  // Back
  {
    id: 13,
    name: "Lat Pulldown",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "back",
  },
  {
    id: 14,
    name: "Deadlift",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
    category: "back",
  },

  // Abs
  {
    id: 15,
    name: "Plank",
    resps: false,
    duration: true,
    distance: false,
    weight: false,
    category: "abs",
  },
  {
    id: 16,
    name: "Crunches",
    resps: true,
    duration: false,
    distance: false,
    weight: false,
    category: "abs",
  },

  // Warmup
  {
    id: 17,
    name: "Jumping Jacks",
    resps: true,
    duration: true,
    distance: false,
    weight: false,
    category: "warmup",
  },
  {
    id: 18,
    name: "Arm Circles",
    resps: true,
    duration: true,
    distance: false,
    weight: false,
    category: "warmup",
  },

];


const AllExerciseList = ({ isOpen, onClose, onSelectExercise }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!isOpen) return null;

  const filteredExercises = exerciseList.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory ? exercise.category === selectedCategory.value : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex bg-black bg-opacity-40">
      <div className="w-full max-w-md ml-auto bg-white p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Exercise Library</h2>
          <button onClick={onClose}>
            <FiX size={22} />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="w-full">
            <input
              type="text"
              placeholder="Search exercise..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="custom--input w-full"
            />
            </div>
               <div className="w-full">
            <Select
              options={exerciseTypeOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              isClearable
              placeholder="Category"
              styles={customStyles}
              className="w-full"
            />
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-4">
          {filteredExercises.length ? (
            filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between border p-3 rounded"
              >
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-xs text-gray-500">
                    Fields:{" "}
                    {[
                      exercise.resps && "Reps",
                      exercise.duration && "Duration",
                      exercise.distance && "Distance",
                      exercise.weight && "Weight",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {/* <p className="text-xs text-gray-400 capitalize">
                    Category: {exercise.category}
                  </p> */}
                </div>
                <button
                  onClick={() => onSelectExercise(exercise)}
                  className="bg-black text-white px-3 py-1 rounded text-sm"
                >
                  Add
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-gray-500">No exercises found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllExerciseList;
