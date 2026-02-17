import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import CreateExercise from "./CreateExercise";
import { LiaEdit } from "react-icons/lia";
import { RiDeleteBin6Fill } from "react-icons/ri";
import Tooltip from "../common/Tooltip";
import ConfirmPopup from "../common/ConfirmPopup";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import { authAxios } from "../../config/config";
import Pagination from "../common/Pagination";


const columns = [
  // "S.NO",
  "Category Name",
  "Exercise Name",
  "Created By",
  "Position",
  "Action",
];

const ExercisesList = () => {
  const [showModal, setShowModal] = useState(false);
  const [exerciseList, setExercisesList] = useState([]);
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [productCategory, setProductCategory] = useState([]);
  const [productFilter, setProductFilter] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProductCategory = async () => {
    try {
      const res = await authAxios().get("/exercise/category/list");
      let data = res.data?.data || res.data || [];
      const activeOnly = filterActiveItems(data);
      setProductCategory(activeOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch category");
    }
  };

  useEffect(() => {
    fetchProductCategory();
  }, []);

  const productCategoryOptions =
    productCategory
      ?.sort((a, b) => a.position - b.position)
      .map((item) => ({
        label: item.title,
        value: item.title,
        position: item.position,
      })) || [];

  const fetchExercisesList = async (search = "", currentPage = page) => {
    try {
      // Build query parameters dynamically
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        ...(search ? { search } : {}),
      };

      if (productFilter?.value) {
        params.category = productFilter.value;
      }

      // Example: /exercise/list?search=press&category=Shoulders
      const res = await authAxios().get(`/exercise/list`, { params });

      console.log("SHIVAKAR", res.data);

      const data = res.data?.data || [];
      setExercisesList(data);
      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPage || 1);
      setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch exercises");
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchExercisesList(searchTerm, 1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, productFilter]);

  const handleDeleteClick = (exercise) => {
    setExerciseToDelete(exercise);
    setShowConfirmPopup(true);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (exerciseToDelete) {
      try {
        await authAxios().delete(`/exercise/${exerciseToDelete.id}`);
        // const updatedExercises = exerciseList.filter(
        //   (ex) => ex.id !== exerciseToDelete.id
        // );
        // setExercisesList(updatedExercises);
        toast.success("Exercise deleted successfully");
        fetchExercisesList();
      } catch (error) {
        toast.error("Failed to delete exercise.");
        console.error("Error deleting exercise:", error);
      }
    }
    setExerciseToDelete(null);
    setShowConfirmPopup(false);
  };

  // Cancel deletion
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
        <div className="max-w-[200px] w-full">
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
          {/* <Select
            options={exerciseTypeOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            isClearable
            placeholder="All Categories"
            styles={customStyles}
          /> */}
          <Select
            placeholder="Filter by Category"
            options={productCategoryOptions}
            value={productFilter}
            onChange={(option) => setProductFilter(option)}
            isClearable
            styles={customStyles}
          />
        </div>
      </div>

      {/* Table */}
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-2 py-4">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exerciseList.length > 0 ? (
                exerciseList.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="group bg-white border-b hover:bg-gray-50 transition duration-700 relative"
                  >
                    {/* <td className="px-2 py-4">{idx + 1}</td> */}
                    <td className="px-2 py-4">{row?.category}</td>
                    <td className="px-2 py-4">{row?.name}</td>
                    <td className="px-2 py-4">Admin</td>
                    <td className="px-2 py-4">
                      {row?.position ? row?.position : "--"}
                    </td>
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-4 text-gray-500"
                  >
                    No exercises found.
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
          currentDataLength={exerciseList.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchExercisesList(searchTerm, newPage);
          }}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <CreateExercise
          setShowModal={setShowModal}
          editingExercise={editingExercise}
          onExerciseCreated={fetchExercisesList}
          productCategoryOptions={productCategoryOptions}
        />
      )}

      {/* Confirm Delete */}
      {showConfirmPopup && exerciseToDelete && (
        <ConfirmPopup
          message={`Are you sure you want to delete <br /> "${exerciseToDelete?.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default ExercisesList;
