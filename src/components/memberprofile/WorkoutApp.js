import React, { useState } from "react";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { IoCloseCircleOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { FiPlus } from "react-icons/fi";
import WorkoutPlan from "./WorkoutPlan";
import { toast } from "react-toastify";

const AssignedWorkout = [
  {
    id: 1,
    workoutName: "HYPERTROPHY",
    noOfDays: 45,
    startDate: "17-08-2024",
    endDate: "-",
    followUpDate: "30-09-2024",
    status: "On-Going",
  },
];

const WorkoutApp = () => {
  // 🔹 Local state to manage workouts dynamically (for delete/cancel)
  const [workouts, setWorkouts] = useState(AssignedWorkout);
  const [editingId, setEditingId] = useState(null);
  const [workoutTable, setWorkoutTable] = useState(true);
  const [workoutModal, setWorkoutModal] = useState(false);

  // 🔹 Handle view/edit button click
  const handleAddWorkout = () => {
    // const lastWorkoutStatus =
    //   AssignedWorkout[AssignedWorkout.length - 1]?.status;

    // if (lastWorkoutStatus !== "Cancelled" && lastWorkoutStatus !== "Expired") {
    //    toast.error(
    //     "Cannot add workout: Last workout is either Cancelled or Expired"
    //   );
    // } else {
    //   setWorkoutModal(true);
    //   setWorkoutTable(false);
    // }
    setWorkoutModal(true);
      setWorkoutTable(false);
  };
  // 🔹 Handle view/edit button click
  const handleViewEdit = (id) => {
    setEditingId(id);
    setWorkoutModal(true);
    setWorkoutTable(false);
  };

  // 🔹 Handle Cancel add workout
  const handleCancelWorkout = () => {
    setWorkoutModal(false);
    setWorkoutTable(true);
    setEditingId(null);
  };

  // 🔹 Handle cancel button click
  const handleCancel = (id) => {
    const updated = workouts.map((w) =>
      w.id === id ? { ...w, status: "Cancelled" } : w
    );
    setWorkouts(updated);
    alert(`Workout ID: ${id} has been cancelled`);
  };

  // 🔹 Handle delete button click
  const handleDelete = (id) => {
    const updated = workouts.filter((w) => w.id !== id);
    setWorkouts(updated);
    alert(`Workout ID: ${id} has been deleted`);
  };

  return (
    <div className="p-4 bg-white rounded shadow relative">
      {workoutTable && (
        <div className="flex justify-end items-end gap-2 mb-3 w-full">
          <button
            type="button"
            onClick={handleAddWorkout}
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          >
            <FiPlus /> Add Workout
          </button>
        </div>
      )}

      {workoutTable && (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-3 py-2">S.No</th>
                <th className="border px-3 py-2">Workout Name</th>
                <th className="border px-3 py-2">No Of Days</th>
                <th className="border px-3 py-2">Start Date</th>
                <th className="border px-3 py-2">End Date</th>
                <th className="border px-3 py-2">Follow-up Date</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {workouts.length > 0 ? (
                workouts.map((workout) => (
                  <tr key={workout.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{workout.id}</td>
                    <td className="border px-3 py-2">{workout.workoutName}</td>
                    <td className="border px-3 py-2">{workout.noOfDays}</td>
                    <td className="border px-3 py-2">{workout.startDate}</td>
                    <td className="border px-3 py-2">{workout.endDate}</td>
                    <td className="border px-3 py-2">{workout.followUpDate}</td>
                    <td className="border px-3 py-2">{workout.status}</td>
                    <td className="border px-3 py-2">
                      <div className="flex gap-0">
                        <Tooltip
                          id={`tooltip-edit-${workout.id}`}
                          content="View/Edit"
                          place="top"
                        >
                          <div
                            onClick={() => handleViewEdit(workout.id)}
                            className="p-1 cursor-pointer"
                          >
                            <LiaEdit className="text-[25px] text-black" />
                          </div>
                        </Tooltip>

                        <Tooltip
                          id={`tooltip-edit-${workout.id}`}
                          content="Cancel"
                          place="top"
                        >
                          <div
                            onClick={() => handleCancel(workout.id)}
                            className="p-1 cursor-pointer"
                          >
                            <IoCloseCircleOutline className="text-[25px] text-black" />
                          </div>
                        </Tooltip>

                        <Tooltip
                          id={`tooltip-edit-${workout.id}`}
                          content="Delete"
                          place="top"
                        >
                          <div
                            onClick={() => handleDelete(workout.id)}
                            className="p-1 cursor-pointer"
                          >
                            <AiOutlineDelete className="text-[25px] text-black" />
                          </div>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-gray-500">
                    No workout found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {workoutModal && (
        <WorkoutPlan
          handleCancelWorkout={handleCancelWorkout}
          editingId={editingId}
        />
      )}
    </div>
  );
};

export default WorkoutApp;
