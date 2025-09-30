import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { FaAngleLeft, FaAngleRight, FaClone } from "react-icons/fa";
import { toast } from "react-toastify";
// import CreateExercise from "./CreateExercise";
import { LiaEdit } from "react-icons/lia";
import { RiDeleteBin6Fill } from "react-icons/ri";
import Tooltip from "../common/Tooltip";
import ConfirmPopup from "../common/ConfirmPopup";
import { Link } from "react-router-dom";
import { workoutPlansList } from "../../DummyData/DummyData";

const WorkoutPlanList = () => {
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [data, setData] = useState(workoutPlansList);

  // ✅ Handle Clone
  const handleClone = (exercise) => {
    const clonedExercise = {
      ...exercise,
      id: Date.now(),
      workoutName: exercise.workoutName + " (Clone)", // <- This was missing before
    };

    setData((prevData) => {
      const index = prevData.findIndex((item) => item.id === exercise.id);
      const newData = [...prevData];
      newData.splice(index + 1, 0, clonedExercise); // Insert right after
      return newData;
    });
  };

  // ✅ Handle Delete
  const handleDeleteClick = (exercise) => {
    setExerciseToDelete(exercise);
    setShowConfirmPopup(true);
  };

  const handleConfirmDelete = () => {
    if (exerciseToDelete) {
      setData((prev) => prev.filter((e) => e.id !== exerciseToDelete.id));
      toast.success("Exercise deleted successfully");
    }
    setExerciseToDelete(null);
    setShowConfirmPopup(false);
  };

  const handleCancelDelete = () => {
    setExerciseToDelete(null);
    setShowConfirmPopup(false);
  };

  // ✅ Filtered + Paginated Data
  const filteredData = data.filter((ex) =>
    ex.workoutName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    setPage(1); // Reset page on search
  }, [searchTerm]);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Workout Plans`}</p>
          <h1 className="text-3xl font-semibold">All Workout Plans</h1>
        </div>
        <Link
          to="/create-workout-plan"
          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
        >
          <FiPlus /> Add Exercise
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <label className="block text-sm font-medium mb-1">Search</label>
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by workout name"
            className="custom--input w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">S.NO</th>
                <th className="px-2 py-4">Workout Name</th>
                <th className="px-2 py-4">No of Days</th>
                <th className="px-2 py-4">Created Date</th>
                <th className="px-2 py-4">Center Name</th>
                <th className="px-2 py-4">Created By</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr
                  key={row.id}
                  className="group bg-white border-b hover:bg-gray-50 transition duration-700 relative"
                >
                  <td className="px-2 py-4">
                    {(page - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="px-2 py-4">{row?.workoutName}</td>
                  <td className="px-2 py-4">{row?.numberOfDays}</td>
                  <td className="px-2 py-4">{row?.createdDate}</td>
                  <td className="px-2 py-4">{row?.centerName}</td>
                  <td className="px-2 py-4">{row?.createdBy}</td>
                  <td className="px-2 py-4">
                    <div className="flex gap-2 items-center">
                      <Tooltip
                        content="Edit Workout"
                        id={`edit-workout-${row.id}`}
                        place="top"
                      >
                        <div className="p-1 cursor-pointer">
                          <Link
                            to={`/create-workout-plan/${row.id}`}
                            className="p-0"
                          >
                            <LiaEdit className="text-[25px] text-black" />
                          </Link>
                        </div>
                      </Tooltip>

                      <Tooltip
                        content="Clone Workout"
                        id={`clone-workout-${row.id}`}
                        place="top"
                      >
                        <div
                          onClick={() => handleClone(row)}
                          className="p-1 cursor-pointer"
                        >
                          <FaClone className="text-[20px] text-black" />
                        </div>
                      </Tooltip>

                      <Tooltip
                        content="Delete Workout"
                        id={`delete-workout-${row.id}`}
                        place="top"
                      >
                        <div
                          onClick={() => handleDeleteClick(row)}
                          className="p-1 cursor-pointer"
                        >
                          <RiDeleteBin6Fill className="text-[20px] text-black" />
                        </div>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 gap-2">
        <p className="text-gray-700">
          Showing {filteredData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}{" "}
          to {Math.min(page * rowsPerPage, filteredData.length)} of{" "}
          {filteredData.length} entries
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            <FaAngleLeft />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  page === i + 1 ? "bg-gray-200" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            <FaAngleRight />
          </button>
        </div>
      </div>

      {/* Confirm Delete Popup */}
      {showConfirmPopup && exerciseToDelete && (
        <ConfirmPopup
          message={`Are you sure you want to delete "${exerciseToDelete.workoutName}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default WorkoutPlanList;
