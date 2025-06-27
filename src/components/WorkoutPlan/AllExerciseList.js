import React from "react";
import { FiX } from "react-icons/fi";

const exerciseList = [
  {
    id: 1,
    name: "Barbell Squat",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
  },
  {
    id: 2,
    name: "Treadmill Run",
    resps: false,
    duration: true,
    distance: true,
    weight: false,
  },
  {
    id: 3,
    name: "Rowing Machine",
    resps: false,
    duration: true,
    distance: true,
    weight: true,
  },
  {
    id: 4,
    name: "Barbell Bench Press",
    resps: true,
    duration: false,
    distance: false,
    weight: true,
  },
];

const AllExerciseList = ({ isOpen, onClose, onSelectExercise }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black bg-opacity-40">
      <div className="w-full max-w-md ml-auto bg-white p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Exercise Library</h2>
          <button onClick={onClose}>
            <FiX size={22} />
          </button>
        </div>

        <div className="space-y-4">
          {exerciseList.map((exercise) => (
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
                    exercise.weight && "Rest",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <button
                onClick={() => onSelectExercise(exercise)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllExerciseList;
