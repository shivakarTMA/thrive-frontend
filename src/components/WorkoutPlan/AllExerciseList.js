import React, { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { apiAxios } from "../../config/config";
import { toast } from "react-toastify";

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

const AllExerciseList = ({ isOpen, onClose, onSelectExercise }) => {
  const leadBoxRef = useRef(null);
  const [exerciseList, setExercisesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchExercisesList = async () => {
    try {
      // Build query parameters dynamically
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory?.value)
        params.append("category", selectedCategory.value);

      // Example: /exercise/list?search=press&category=Shoulders
      const res = await apiAxios().get(`/exercise/list?${params.toString()}`);

      const data = res.data?.data || [];
      setExercisesList(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch exercises");
    }
  };

  useEffect(() => {
    fetchExercisesList();
  }, [searchTerm, selectedCategory]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleSelect = (exercise) => {
    console.log("Exercise selected:", exercise?.id);
    onSelectExercise(exercise);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black bg-opacity-40"
      onClick={handleOverlayClick}
    >
      <div
        ref={leadBoxRef}
        className="w-full max-w-md ml-auto bg-white p-4 overflow-y-auto"
      >
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          {exerciseList.length ? (
            exerciseList.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between border p-3 rounded"
              >
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-xs text-gray-500">
                    Fields:{" "}
                    {[
                      exercise.has_reps && "Reps",
                      exercise.has_duration && "Duration",
                      exercise.has_distance && "Distance",
                      exercise.has_weight && "Weight",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {/* <p className="text-xs text-gray-400 capitalize">
                    Category: {exercise.category}
                  </p> */}
                </div>
                <button
                  onClick={() => handleSelect(exercise)}
                  className="bg-black text-white px-3 py-1 rounded text-sm"
                >
                  Add
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-gray-500">
              No exercises found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllExerciseList;
