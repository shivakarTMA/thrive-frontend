import React, { useEffect, useState } from "react";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { formatAutoDate, formatText } from "../../Helper/helper";
import { FaCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import Pagination from "../common/Pagination";
import { RiDeleteBin6Fill } from "react-icons/ri";
import ConfirmPopup from "../common/ConfirmPopup";

const WorkoutPlanList = () => {
  const [workouts, setWorkouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchWorkouts = async (search = "") => {
    try {
      const res = await authAxios().get("/workoutplan/list", {
        params: search ? { search } : {},
      });

      let data = res.data?.data || res.data || [];
      setWorkouts(data);
      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPage || 1);
      setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch workout plans");
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchWorkouts(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleDeleteClick = (exercise) => {
    setWorkoutToDelete(exercise);
    setShowConfirmPopup(true);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (workoutToDelete) {
      try {
        await authAxios().delete(`/workoutplan/${workoutToDelete.id}`);

        toast.success("Workout deleted successfully");
        fetchWorkouts();
      } catch (error) {
        toast.error("Failed to delete exercise.");
        console.error("Error deleting exercise:", error);
      }
    }
    setWorkoutToDelete(null);
    setShowConfirmPopup(false);
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setWorkoutToDelete(null);
    setShowConfirmPopup(false);
  };

  return (
    <>
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
            <FiPlus /> Create Workout
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          <div className="max-w-[250px] w-full">
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
                  <th className="px-2 py-4">Workout Name</th>
                  <th className="px-2 py-4">No of Days</th>
                  <th className="px-2 py-4">Created Date</th>
                  {/* <th className="px-2 py-4">Center Name</th> */}
                  <th className="px-2 py-4">Created By</th>
                  <th className="px-2 py-4">Status</th>
                  <th className="px-2 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {workouts.length ? (
                  workouts.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="group bg-white border-b hover:bg-gray-50 transition duration-700 relative"
                    >
                      <td className="px-2 py-4">{row?.name}</td>
                      <td className="px-2 py-4">{row?.no_of_days} Days</td>
                      <td className="px-2 py-4">
                        {formatAutoDate(row?.createdAt)}
                      </td>
                      {/* <td className="px-2 py-4">{row?.centerName}</td> */}
                      <td className="px-2 py-4">{row?.staff_name}</td>
                      <td className="px-2 py-4">
                        <div
                          className={`flex gap-1 items-center ${
                            row?.status === "ACTIVE"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          <FaCircle />
                          {row?.status ? formatText(row?.status) : "--"}
                        </div>
                      </td>
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
                            id={`delete-workout-${row.id}`}
                            content="Delete Exercise"
                            place="top"
                          >
                            <div
                              onClick={() => handleDeleteClick(row)}
                              className="p-1 cursor-pointer"
                            >
                              <RiDeleteBin6Fill
                                className={`text-[25px] text-black ${
                                  row.id === 4 ? "hidden" : "block"
                                }`}
                              />
                            </div>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-2 py-4">
                      <p className="text-center text-sm text-gray-500">
                        No workout found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            currentDataLength={workouts.length}
            onPageChange={(newPage) => {
              setPage(newPage);
              fetchWorkouts(searchTerm, newPage);
            }}
          />
        </div>
      </div>

      {showConfirmPopup && workoutToDelete && (
        <ConfirmPopup
          message={`Are you sure you want to delete <br /> "${workoutToDelete?.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
};

export default WorkoutPlanList;
