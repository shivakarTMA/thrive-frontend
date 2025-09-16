import React, { useState } from "react";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { IoCloseCircleOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import CreateWorkoutPlan from "../WorkoutPlan/CreateWorkoutplan";
import { FiPlus } from "react-icons/fi";

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
  const [workoutTable, setWorkoutTable] = useState(true);
  const [addWorkout, setAddWorkout] = useState(false);

  // 🔹 Handle view/edit button click
  const handleViewEdit = (id) => {
    setAddWorkout(true);
    setWorkoutTable(false);
  };

  // 🔹 Handle Cancel add workout
  const handleCancelWorkout = (id) => {
    setAddWorkout(false);
    setWorkoutTable(true);
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
    <div className="w-full">
      {workoutTable && (
        <div className="flex justify-end items-end gap-2 mb-3 w-full">
          <button
            type="button"
            onClick={handleViewEdit}
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
                workouts.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{appt.id}</td>
                    <td className="border px-3 py-2">{appt.workoutName}</td>
                    <td className="border px-3 py-2">{appt.noOfDays}</td>
                    <td className="border px-3 py-2">{appt.startDate}</td>
                    <td className="border px-3 py-2">{appt.endDate}</td>
                    <td className="border px-3 py-2">{appt.followUpDate}</td>
                    <td className="border px-3 py-2">{appt.status}</td>
                    <td className="border px-3 py-2">
                      <div className="flex gap-0">
                        <Tooltip
                          id={`tooltip-edit-${appt.id}`}
                          content="View/Edit"
                          place="top"
                        >
                          <div
                            onClick={() => handleViewEdit(appt.id)}
                            className="p-1 cursor-pointer"
                          >
                            <LiaEdit className="text-[25px] text-black" />
                          </div>
                        </Tooltip>

                        <Tooltip
                          id={`tooltip-edit-${appt.id}`}
                          content="Cancel"
                          place="top"
                        >
                          <div
                            onClick={() => handleCancel(appt.id)}
                            className="p-1 cursor-pointer"
                          >
                            <IoCloseCircleOutline className="text-[25px] text-black" />
                          </div>
                        </Tooltip>

                        <Tooltip
                          id={`tooltip-edit-${appt.id}`}
                          content="Delete"
                          place="top"
                        >
                          <div
                            onClick={() => handleDelete(appt.id)}
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

      {addWorkout && (
        <CreateWorkoutPlan handleCancelWorkout={handleCancelWorkout} />
      )}
    </div>
  );
};

export default WorkoutApp;
