import React, { useEffect, useState } from "react";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { IoCloseCircleOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { FiPlus } from "react-icons/fi";
import WorkoutPlan from "./WorkoutPlan";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { formatAutoDate, formatText } from "../../Helper/helper";

const WorkoutApp = ({ member }) => {
  const memberId = member?.id;
  const [workouts, setWorkouts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [workoutTable, setWorkoutTable] = useState(true);
  const [workoutModal, setWorkoutModal] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    id: null,
    action: null, // delete / cancel
  });

  const handleAddWorkout = () => {
    setWorkoutModal(true);
    setWorkoutTable(false);
  };

  const handleViewEdit = (id) => {
    setEditingId(id);
    setWorkoutModal(true);
    setWorkoutTable(false);
  };

  const handleCancelWorkout = () => {
    setWorkoutModal(false);
    setWorkoutTable(true);
    setEditingId(null);
  };

  // Fire modal (instead of directly deleting/canceling)
  const confirmAction = (id, action) => {
    setConfirmModal({
      show: true,
      id,
      action, // "delete" or "cancel"
    });
  };

  const fetchWorkouts = async () => {
    try {
      const res = await authAxios().get("/member/workoutplan/list", {
        params: { member_id: memberId },
      });

      let data = res.data?.data || res.data || [];
      setWorkouts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch workout plans");
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Execute the confirmed action
  const handleConfirmAction = async () => {
    const { id, action } = confirmModal;

    try {
      if (action === "delete") {
        await authAxios().delete(`/member/workoutplan/${id}`);
        toast.success(`Workout ID: ${id} has been deleted`);
        fetchWorkouts(); // refresh list
      }

      if (action === "cancel") {
        // ❗ If cancel also needs API, add here
        setWorkouts(
          workouts.map((w) => (w.id === id ? { ...w, status: "Cancelled" } : w))
        );
        toast.info(`Workout ID: ${id} has been cancelled`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    }

    // Close modal
    setConfirmModal({ show: false, id: null, action: null });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ show: false, id: null, action: null });
  };

  return (
    <div className="p-4 bg-white rounded shadow relative">
      {/* ---------------- CONFIRMATION MODAL ---------------- */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-[350px]">
            <h2 className="text-lg font-semibold mb-3">
              {confirmModal.action === "delete"
                ? "Delete Workout?"
                : "Cancel Workout?"}
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              {confirmModal.action === "delete"
                ? "This action will permanently delete the workout. Continue?"
                : "This will mark the workout as cancelled. Continue?"}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                No
              </button>

              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ---------------------------------------------------- */}

      {workoutTable && workouts.length === 0 && (
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
                <th className="border px-3 py-2">Workout Name</th>
                <th className="border px-3 py-2">Workout Type</th>
                <th className="border px-3 py-2">No Of Days</th>
                <th className="border px-3 py-2">Start Date</th>
                <th className="border px-3 py-2">End Date</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {workouts.length > 0 ? (
                workouts.map((workout) => (
                  <tr key={workout.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{workout?.name}</td>
                    <td className="border px-3 py-2">
                      {formatText(workout?.workout_type)}
                    </td>
                    <td className="border px-3 py-2">{workout?.no_of_days}</td>
                    <td className="border px-3 py-2">
                      {formatAutoDate(workout?.start_date)}
                    </td>
                    <td className="border px-3 py-2">
                      {formatAutoDate(workout?.end_date)}
                    </td>
                    <td className="border px-3 py-2">
                      {formatText(workout?.status)}
                    </td>

                    <td className="border px-3 py-2">
                      <div className="flex gap-0">
                        <Tooltip content="View/Edit" place="top">
                          <div
                            onClick={() => handleViewEdit(workout.id)}
                            className="p-1 cursor-pointer"
                          >
                            <LiaEdit className="text-[25px] text-black" />
                          </div>
                        </Tooltip>

                        {/* <Tooltip content="Cancel" place="top">
                          <div
                            onClick={() => confirmAction(workout.id, "cancel")}
                            className="p-1 cursor-pointer"
                          >
                            <IoCloseCircleOutline className="text-[25px] text-black" />
                          </div>
                        </Tooltip> */}

                        <Tooltip content="Delete" place="top">
                          <div
                            onClick={() => confirmAction(workout.id, "delete")}
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
          handleWorkoutUpdate={fetchWorkouts}
        />
      )}
    </div>
  );
};

export default WorkoutApp;
