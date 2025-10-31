// Import React and hooks
import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { LiaEdit } from "react-icons/lia";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import Pagination from "../common/Pagination";
import CreateCoupon from "./CreateCoupon";
import { apiAxios } from "../../config/config";
import { RiDeleteBin6Line } from "react-icons/ri";
import ConfirmPopup from "../common/ConfirmPopup";

// Define the main GalleryList component
const CouponsList = () => {
  // Component state management
  const [showModal, setShowModal] = useState(false);
  const [couponsList, setCouponsList] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const leadBoxRef = useRef(null);

  // Function to fetch gallery list with filters applied
  const fetchCoupons = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // API request to get filtered gallery data
      const response = await apiAxios().get("/coupon/list", { params });

      const data = response.data?.data || [];
      setCouponsList(data);
      setPage(response.data?.currentPage || 1);
      setTotalPages(response.data?.totalPage || 1);
      setTotalCount(response.data?.totalCount || data.length);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch coupon list");
    }
  };

  // Fetch clubs and gallery list on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Overlay click handler to close modal
  const handleOverlayClick = (event) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(event.target)) {
      setShowModal(false);
    }
  };

  // Formik setup for form validation and submission
  const formik = useFormik({
    initialValues: {
      code: "",
      description: "",
      discount_type: "",
      discount_value: null,
      min_order_amt: null,
      max_user_limit: null,
      start_date: "",
      end_date: "",
      position: null,
    },
    validationSchema: Yup.object({
      code: Yup.string().required("Code is required"),
      description: Yup.string().required("Description is required"),
      discount_type: Yup.string().required("Discount type is required"),
      discount_value: Yup.number().required("Discount value is required"),
      start_date: Yup.date().required("Start date is required"),
      end_date: Yup.date()
        .min(Yup.ref("start_date"), "End date cannot be before start date")
        .required("End date is required"),
      // min_order_amt: Yup.number().required("Min order amount is required"),
      // max_user_limit: Yup.number().required("Max user limit is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = { ...values };

        if (editingOption && editingOption) {
          // Update
          await apiAxios().put(`/coupon/${editingOption}`, payload);
          toast.success("Updated Successfully");
        } else {
          // Create
          await apiAxios().post("/coupon/create", payload);
          toast.success("Created Successfully");
        }

        fetchCoupons();
      } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        toast.error("Failed to save coupon item");
      }

      resetForm();
      setEditingOption(null);
      setShowModal(false);
    },
  });

  const handleDeleteClick = (exercise) => {
    setCouponToDelete(exercise);
    setShowConfirmPopup(true);
  };

  console.log(couponToDelete, "couponToDelete");

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (couponToDelete) {
      try {
        await apiAxios().delete(`/coupon/${couponToDelete.id}`);
        const updatedCoupons = couponsList.filter(
          (ex) => ex.id !== couponToDelete.id
        );
        setCouponsList(updatedCoupons);
        toast.success("Exercise deleted successfully");
      } catch (error) {
        toast.error("Failed to delete exercise.");
        console.error("Error deleting exercise:", error);
      }
    }
    setCouponToDelete(null);
    setShowConfirmPopup(false);
  };

    // Cancel deletion
  const handleCancelDelete = () => {
    setCouponToDelete(null);
    setShowConfirmPopup(false);
  };

  // Component render
  return (
    <div className="page--content">
      {/* Header section */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Coupons`}</p>
          <h1 className="text-3xl font-semibold">Coupons</h1>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            onClick={() => {
              setEditingOption(null);
              formik.resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Create Coupon
          </button>
        </div>
      </div>

      {/* Table section */}
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">Code</th>
                <th className="px-2 py-4">Description</th>
                <th className="px-2 py-4">Type</th>
                <th className="px-2 py-4">Value</th>
                <th className="px-2 py-4">Position</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {couponsList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No Gallery items found.
                  </td>
                </tr>
              ) : (
                couponsList.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 transition duration-700"
                  >
                    <td>{item.code}</td>
                    <td className="px-2 py-4">{item?.description}</td>
                    <td className="px-2 py-4">{item?.discount_type}</td>
                    <td className="px-2 py-4">{item?.discount_value}</td>
                    <td className="px-2 py-4">{item?.position}</td>
                    <td className="px-2 py-4">
                      <div className="flex items-center">
                        <div className="w-fit">
                          <Tooltip
                            id={`tooltip-edit-${item.id}`}
                            content="Edit Coupon"
                            place="left"
                          >
                            <div
                              className="p-1 cursor-pointer"
                              onClick={() => {
                                setEditingOption(item?.id);
                                setShowModal(true);
                              }}
                            >
                              <LiaEdit className="text-[25px] text-black" />
                            </div>
                          </Tooltip>
                        </div>
                        {/* <div className="w-fit">
                          <Tooltip
                            id={`tooltip-delete-${item.id}`}
                            content="Delete Coupon"
                            place="left"
                          >
                            <div
                              className="p-1 cursor-pointer"
                              onClick={() => handleDeleteClick(item)}
                            >
                              <RiDeleteBin6Line className="text-[25px] text-black" />
                            </div>
                          </Tooltip>
                        </div> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Component */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={couponsList.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchCoupons(newPage);
          }}
        />
      </div>

      {/* Modal Component */}
      {showModal && (
        <CreateCoupon
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
        />
      )}

            {/* Confirm Delete */}
      {showConfirmPopup && couponToDelete && (
        <ConfirmPopup
          message={`Are you sure you want to delete <br /> "${couponToDelete?.code}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default CouponsList;
