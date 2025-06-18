import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { toast } from "react-toastify";
import CreateExercise from "./CreateExercise";
import { LiaEdit } from "react-icons/lia";
import { RiDeleteBin6Fill } from "react-icons/ri";
import Tooltip from "../common/Tooltip";
import ConfirmPopup from "../common/ConfirmPopup";
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
  { value: "others", label: "Others" },
];

const ExercisesList = () => {
  const [showModal, setShowModal] = useState(false);
  const [submittedExercises, setSubmittedExercises] = useState([]);
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Reset page on filter or search
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory]);

  // Filtered data
  const filteredData = submittedExercises.filter((ex) => {
    const matchesSearch = ex.exerciseName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? ex.exerciseCategory === selectedCategory.value
      : true;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [submittedExercises]);

  const handleExerciseCreated = (exerciseData) => {
    if (editingExercise) {
      setSubmittedExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseData.id ? { ...ex, ...exerciseData } : ex
        )
      );
      toast.success("Exercise updated successfully!");
    } else {
      const newExercise = { id: Date.now(), ...exerciseData };
      setSubmittedExercises((prev) => [...prev, newExercise]);
      toast.success("Exercise added successfully!");
    }
    setShowModal(false);
    setEditingExercise(null);
  };

  const handleDeleteClick = (exercise) => {
    setExerciseToDelete(exercise);
    setShowConfirmPopup(true);
  };

  const handleConfirmDelete = () => {
    if (exerciseToDelete) {
      const updatedExercises = submittedExercises.filter(
        (ex) => ex.id !== exerciseToDelete.id
      );
      setSubmittedExercises(updatedExercises);
      toast.success("Exercise deleted successfully");
    }
    setExerciseToDelete(null);
    setShowConfirmPopup(false);
  };

  const handleCancelDelete = () => {
    setExerciseToDelete(null);
    setShowConfirmPopup(false);
  };

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Exercises`}</p>
          <h1 className="text-3xl font-semibold">All Exercises</h1>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          onClick={() => {
            setEditingExercise(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Exercise
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {/* Search Input */}
          <label className="block text-sm font-medium mb-1">Search</label>
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by exercise name"
             className="custom--input w-full"
          />
        </div>

        {/* Category Filter */}
        <div>
          <Select
            options={exerciseTypeOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            isClearable
            placeholder="All Categories"
            styles={customStyles}
          />
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto mt-6">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-2 py-4">S.NO</th>
              <th className="px-2 py-4">Category Name</th>
              <th className="px-2 py-4">Exercise Image</th>
              <th className="px-2 py-4">Exercise Name</th>
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
                <td className="px-2 py-4">{row.exerciseCategory}</td>
                <td className="px-2 py-4">
                  {row.exerciseImage ? (
                    <img
                      src={
                        typeof row.exerciseImage === "string"
                          ? row.exerciseImage
                          : URL.createObjectURL(row.exerciseImage)
                      }
                      alt="Exercise"
                      className="w-[40px] h-[40px] object-cover rounded"
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-2 py-4">{row.exerciseName}</td>
                <td className="px-2 py-4">Admin</td>
                <td className="px-2 py-4">
                  <div className="flex">
                    <Tooltip
                      id={`edit-exercise-${row.id}`}
                      content="Edit Exercise"
                      place="top"
                    >
                      <div
                        onClick={() => {
                          setEditingExercise(row);
                          setShowModal(true);
                        }}
                        className="p-1 cursor-pointer"
                      >
                        <LiaEdit className="text-[25px] text-black" />
                      </div>
                    </Tooltip>
                    <Tooltip
                      id={`delete-exercise-${row.id}`}
                      content="Delete Exercise"
                      place="top"
                    >
                      <div
                        onClick={() => handleDeleteClick(row)}
                        className="p-1 cursor-pointer"
                      >
                        <RiDeleteBin6Fill className="text-[25px] text-black" />
                      </div>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 gap-2">
        <p className="text-gray-700">
          Showing{" "}
          {filteredData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} to{" "}
          {Math.min(page * rowsPerPage, filteredData.length)} of{" "}
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

      {/* Modal */}
      {showModal && (
        <CreateExercise
          setShowModal={setShowModal}
          onExerciseCreated={handleExerciseCreated}
          initialData={editingExercise}
        />
      )}

      {/* Confirm Delete */}
      {showConfirmPopup && exerciseToDelete && (
        <ConfirmPopup
          message={`Are you sure you want to delete "${exerciseToDelete.exerciseName}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default ExercisesList;
