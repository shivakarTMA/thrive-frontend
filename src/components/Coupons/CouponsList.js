// CouponsList.jsx
import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { LiaEdit } from "react-icons/lia";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import Pagination from "../common/Pagination";
import CreateCoupon from "./CreateCoupon";
import { authAxios } from "../../config/config";
import { RiDeleteBin6Line } from "react-icons/ri";
import ConfirmPopup from "../common/ConfirmPopup";
import { customStyles, formatAutoDate, formatText } from "../../Helper/helper";
import { FaCircle } from "react-icons/fa6";
import Select from "react-select";

const CouponsList = () => {
  const [showModal, setShowModal] = useState(false);
  const [couponsList, setCouponsList] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [originalApplicableRules, setOriginalApplicableRules] = useState([]);
  const leadBoxRef = useRef(null);

  const fetchCoupons = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        ...(statusFilter?.value && { status: statusFilter.value }),
      };

      const response = await authAxios().get("/coupon/list", { params });
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

  useEffect(() => {
    fetchCoupons(1); // reset to first page when filter changes
  }, [statusFilter]);

  const handleOverlayClick = (event) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(event.target)) {
      setShowModal(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      coupon: {
        club_id: null,
        code: "",
        description: "",
        discount_type: "",
        discount_value: "",
        max_usage: "",
        per_user_limit: "",
        start_date: "",
        end_date: "",
        position: "",
        status: "",
      },
      applicable_rules: [
        {
          applicable_type: "ALL",
          applicable_id: null,
        },
      ],
    },
    validationSchema: Yup.object({
      coupon: Yup.object({
        club_id: Yup.number()
          .typeError("Club Name must be a number")
          .required("Club Name is required"),

        code: Yup.string().required("Code is required"),

        description: Yup.string().required("Description is required"),

        discount_type: Yup.string().required("Discount type is required"),

        discount_value: Yup.string().required("Discount value is required"),

        max_usage: Yup.string().required("Max Usage is required"),

        per_user_limit: Yup.string().required("Per User Limit is required"),

        start_date: Yup.date()
          .typeError("Start date is invalid")
          .required("Start date is required"),

        end_date: Yup.date()
          .typeError("End date is invalid")
          .min(Yup.ref("start_date"), "End date cannot be before start date")
          .required("End date is required"),

        position: Yup.string().required("Position is required"),
      }),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const couponPayload = { ...values.coupon };

        if (editingOption) {
          const current = Array.isArray(values.applicable_rules)
            ? values.applicable_rules
            : [];
          const original = Array.isArray(originalApplicableRules)
            ? originalApplicableRules
            : [];

          const mapById = (arr) => {
            const m = new Map();
            arr.forEach((r) => {
              if (r && r.id != null) m.set(Number(r.id), r);
            });
            return m;
          };

          const originalById = mapById(original);
          const currentById = mapById(current);

          const add = [];
          const update = [];
          const deleteIds = [];

          current.forEach((r) => {
            const itemBase = {
              applicable_type: r.applicable_type,
              applicable_id:
                r.applicable_type === "ALL"
                  ? null
                  : r.applicable_id == null
                  ? null
                  : Number(r.applicable_id),
            };

            if (r.id == null) {
              add.push(itemBase);
            } else {
              const orig = originalById.get(Number(r.id));
              const origType = orig?.applicable_type ?? "";
              const origId =
                orig && orig.applicable_id != null
                  ? String(orig.applicable_id)
                  : null;
              const currId =
                r && r.applicable_id != null ? String(r.applicable_id) : null;

              const changed =
                origType !== (r.applicable_type ?? "") || origId !== currId;

              if (changed) {
                update.push({ id: Number(r.id), ...itemBase });
              }
            }
          });

          for (const orig of original) {
            if (orig && orig.id != null) {
              if (!currentById.has(Number(orig.id))) {
                deleteIds.push(Number(orig.id));
              }
            }
          }

          const payload = {
            coupon: couponPayload,
            applicable_rules: {
              add,
              update,
              delete: deleteIds,
            },
          };

          await authAxios().put(`/coupon/update/${editingOption}`, payload);
          toast.success("Updated Successfully");
        } else {
          const payload = {
            coupon: couponPayload,
            applicable_rules: Array.isArray(values.applicable_rules)
              ? values.applicable_rules.map((r) => ({
                  applicable_type: r.applicable_type,
                  applicable_id:
                    r.applicable_type === "ALL"
                      ? null
                      : r.applicable_id == null
                      ? null
                      : Number(r.applicable_id),
                }))
              : [],
          };

          await authAxios().post("/coupon/create", payload);
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
      setOriginalApplicableRules([]);
    },
  });

  const handleDeleteClick = (exercise) => {
    setCouponToDelete(exercise);
    setShowConfirmPopup(true);
  };

  const handleConfirmDelete = async () => {
    if (couponToDelete) {
      try {
        await authAxios().delete(`/coupon/${couponToDelete.id}`);
        const updatedCoupons = couponsList.filter(
          (ex) => ex.id !== couponToDelete.id
        );
        setCouponsList(updatedCoupons);
        toast.success("Coupon deleted successfully");
      } catch (error) {
        toast.error("Failed to delete coupon.");
        console.error("Error deleting coupon:", error);
      }
    }
    setCouponToDelete(null);
    setShowConfirmPopup(false);
  };

  const handleCancelDelete = () => {
    setCouponToDelete(null);
    setShowConfirmPopup(false);
  };

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Discount Coupons`}</p>
          <h1 className="text-3xl font-semibold">Discount Coupons</h1>
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

      {/* Search and Filter Section */}
      <div className="flex gap-3 mb-4">
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Status"
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
              { label: "Expired", value: "EXPIRED" },
            ]}
            value={statusFilter}
            onChange={(option) => setStatusFilter(option)}
            isClearable
            styles={customStyles}
          />
        </div>
      </div>

      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">Club Name</th>
                <th className="px-2 py-4">Code</th>
                <th className="px-2 py-4 min-w-[200px]">Description</th>
                <th className="px-2 py-4">Type</th>
                <th className="px-2 py-4">Value</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4 text-center">Position</th>
                <th className="px-2 py-4 text-center">Start Date</th>
                <th className="px-2 py-4 text-center">End Date</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {couponsList.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                couponsList.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 transition duration-700"
                  >
                    <td className="px-2 py-4">
                      {item?.club_name ? item?.club_name : "--"}
                    </td>
                    <td className="px-2 py-4">{item?.code}</td>
                    <td className="px-2 py-4">{item?.description}</td>
                    <td className="px-2 py-4">
                      {formatText(item?.discount_type)}
                    </td>
                    <td className="px-2 py-4">
                      {item?.discount_type === "FIXED" && ("₹")}
                      {item?.discount_value}
                      {item?.discount_type === "PERCENTAGE" && ("%")}
                      </td>
                    <td className="px-2 py-4">
                      <span
                        className={`flex items-center justify-between gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit ${
                          item?.status === "ACTIVE"
                            ? "bg-[#E8FFE6] text-[#138808]"
                            : item?.status === "INACTIVE"
                            ? "bg-[#EEEEEE] text-[#666666]"
                            : item?.status === "EXPIRED"
                            ? "bg-[#FFE8E8] text-[#D32F2F]"
                            : ""
                        }
                        `}
                      >
                        <FaCircle className="text-[10px]" />{" "}
                        {formatText(item?.status)}
                      </span>
                    </td>
                    <td className="px-2 py-4 text-center">{item?.position}</td>
                    <td className="px-2 py-4 text-center">
                      {formatAutoDate(item?.start_date)}
                    </td>
                    <td className="px-2 py-4 text-center">
                      {formatAutoDate(item?.end_date)}
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex items-center">
                        <div className="w-fit">
                          <Tooltip
                            id={`tooltip-edit-${item?.id}`}
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
                        {/* 
                        <div className="w-fit ml-2">
                          <Tooltip
                            id={`tooltip-delete-${item?.id}`}
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

      {showModal && (
        <CreateCoupon
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          setOriginalApplicableRules={setOriginalApplicableRules}
        />
      )}

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
