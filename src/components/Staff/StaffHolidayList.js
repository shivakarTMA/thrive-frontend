import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import { authAxios } from "../../config/config";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import {
  customStyles,
  formatAutoDate,
  formatText,
  formatClubTime,
  filterActiveItems,
} from "../../Helper/helper";
import Pagination from "../common/Pagination";
import { useSelector } from "react-redux";
import CreateStaffHoliday from "./CreateStaffHoliday";
import { useLocation } from "react-router-dom";
import ConfirmPopup from "../common/ConfirmPopup";
import deleteIcon from "../../assets/images/icons/delete.svg";
import editIcon from "../../assets/images/icons/edit.svg";

const statusColors = {
  ACTIVE: "bg-[#D1FADF] text-[#027A48]", // green
  INACTIVE: "bg-[#FFE4E4] text-[#880808]", // red
};

const workingColor = {
  true: "bg-[#D1FADF] text-[#027A48]",
  false: "bg-[#efefef] text-[#939393]",
};

const StaffHolidayList = () => {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [staffHoliday, setStaffHoliday] = useState([]);
  const [editingStaffHoliday, setEditingStaffHoliday] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const leadBoxRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [staff, setStaff] = useState([]);
  const [staffFilter, setStaffFilter] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;
  const canManage = userRole === "ADMIN" || userRole === "MARKETING_MANAGER";

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStaffHoliday = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      if (statusFilter) {
        params.status = statusFilter.value;
      }
      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      if (staffFilter?.value) {
        params.staff_id = staffFilter.value;
      }

      const res = await authAxios().get("/staff/holiday/list", { params });

      let data = res.data?.data || [];
      setStaffHoliday(data);
      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPage || 1);
      setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message);
    }
  };

  // Function to fetch club list
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClub();
  }, []);

  const fetchStaff = async (clubId) => {
  try {
    // Don't call API if no club is selected
    if (!clubId) {
      setStaff([]);
      return;
    }

    const roles = ["TRAINER", "FITNESS_MANAGER", "ASS_FITNESS_MANAGER"];

    const res = await authAxios().get("/staff/list", {
      params: {
        club_id: clubId,
        role: roles.join(","),
      },
    });

    const data = res.data?.data || res.data || [];
    const activeOnly = filterActiveItems(data);
    setStaff(activeOnly);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchStaff(clubFilter?.value);
  setStaffFilter(null); // previous staff may not belong to the newly selected club
}, [clubFilter?.value]);

const roleLabels = {
  TRAINER: "Trainer",
  FITNESS_MANAGER: "Fitness Manager",
  ASS_FITNESS_MANAGER: "Assistant Fitness Manager",
};

const staffOptions = Object.values(
  staff.reduce((acc, item) => {
    if (!acc[item.role]) {
      acc[item.role] = {
        label: roleLabels[item.role] || item.role,
        options: [],
      };
    }
    acc[item.role].options.push({
      label: item.name,
      value: item.id,
    });
    return acc;
  }, {}),
);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  useEffect(() => {
    if (clubList.length === 0) return;
    const params = new URLSearchParams(location.search);
    const clubId = params.get("club_id");

    if (!clubFilter) {
      if (clubId) {
        const club = clubList.find((c) => c.id === Number(clubId));
        if (club) {
          setClubFilter({ label: club.name, value: club.id });
        }
      } else {
        setClubFilter({
          label: clubList[0].name,
          value: clubList[0].id,
        });
      }
    }
  }, [clubList]);

  useEffect(() => {
    setPage(1);
    fetchStaffHoliday(1);
  }, [statusFilter, clubFilter, staffFilter]);

  const initialValues = {
    club_id: "",
    staff_id: "",
    holiday_date: "",
    start_time: "",
    end_time: "",
    is_working: "",
    reason: "",
    status: "",
    position: "",
  };

  const validationSchema = Yup.object({
    club_id: Yup.mixed().required("Club is required"),
    staff_id: Yup.mixed().required("Staff is required"),
    holiday_date: Yup.string().required("Date is required"),
    is_working: Yup.mixed().required("This field is required"),
    start_time: Yup.string().when("is_working", {
      is: true,
      then: (schema) => schema.required("Start time is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    end_time: Yup.string().when("is_working", {
      is: true,
      then: (schema) => schema.required("End time is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    reason: Yup.string().trim().required("Reason is required"),
    position: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value,
      )
      .typeError("Position must be a number")
      .positive("Position must be positive")
      .integer("Position must be an integer")
      .required("Position is required"),
    status: Yup.string().required("Status is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          club_id:
            typeof values.club_id === "string"
              ? Number(values.club_id)
              : values.club_id,
          staff_id:
            typeof values.staff_id === "string"
              ? Number(values.staff_id)
              : values.staff_id,
          holiday_date: values.holiday_date,
          start_time: values.is_working ? values.start_time : null,
          end_time: values.is_working ? values.end_time : null,
          is_working: values.is_working,
          reason: values.reason,
          position: Number(values.position),
          status: values.status,
        };

        if (editingStaffHoliday) {
          await authAxios().put(
            `/staff/holiday/${editingStaffHoliday}`,
            payload,
          );
          toast.success("Staff holiday updated successfully");
        } else {
          await authAxios().post("/staff/holiday/create", payload);
          toast.success("Staff holiday created successfully");
        }

        resetForm();
        setShowModal(false);
        setEditingStaffHoliday(null);
        fetchStaffHoliday();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Something went wrong");
      }
    },
  });

  const handleDeleteClick = (exercise) => {
    setItemToDelete(exercise);
    setShowConfirmPopup(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await authAxios().delete(`/staff/holiday/${itemToDelete.id}`);
        const updatedCoupons = staffHoliday.filter(
          (ex) => ex.id !== itemToDelete.id,
        );
        setStaffHoliday(updatedCoupons);
        toast.success("Staff holiday deleted successfully");
      } catch (error) {
        console.error("Error deleting holiday:", error);
      }
    }
    setItemToDelete(null);
    setShowConfirmPopup(false);
  };

  const handleCancelDelete = () => {
    setItemToDelete(null);
    setShowConfirmPopup(false);
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <h1 className="text-3xl font-semibold">Staff Holiday</h1>
        </div>
        {canManage && (
          <div className="flex items-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
              onClick={() => {
                setEditingStaffHoliday(null);
                formik.resetForm();
                setShowModal(true);
              }}
            >
              <FiPlus /> Create Staff Holiday
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="w-fit min-w-[200px]">
          <Select
            placeholder="Filter by Club"
            value={clubFilter}
            options={clubOptions}
            onChange={(option) => setClubFilter(option)}
            styles={customStyles}
            isClearable={userRole === "ADMIN" ? true : false}
          />
        </div>
        <div className="w-full max-w-[200px]">
          <Select
            placeholder={clubFilter ? "Filter by Staff" : "Select a club first"}
            value={
              staffOptions
                .flatMap((group) => group.options)
                .find((option) => option.value === staffFilter?.value) || null
            }
            options={staffOptions}
            onChange={(option) => setStaffFilter(option)}
            isClearable
            isDisabled={!clubFilter}
            styles={customStyles}
          />
        </div>
        {/* Status filter */}
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Status"
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
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
                <th className="px-2 py-4 min-w-[130px]">Club</th>
                <th className="px-2 py-4 min-w-[130px]">Staff</th>
                <th className="px-2 py-4 min-w-[120px]">Date</th>
                <th className="px-2 py-4 min-w-[140px] text-center">Working</th>
                <th className="px-2 py-4 min-w-[100px]">Start Time</th>
                <th className="px-2 py-4 min-w-[100px]">End Time</th>
                <th className="px-2 py-4 min-w-[180px]">Reason</th>
                <th className="px-2 py-4 min-w-[100px] text-center">
                  Position
                </th>
                <th className="px-2 py-4 min-w-[100px] text-center">Status</th>
                <th className="px-2 py-4 min-w-[110px]">Created at</th>
                {canManage && (
                  <th className="px-2 py-4 min-w-[100px]">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {staffHoliday.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 11 : 10}
                    className="text-center py-4"
                  >
                    No staff holiday found.
                  </td>
                </tr>
              ) : (
                staffHoliday.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{item?.club_name || "--"}</td>
                    <td className="px-2 py-4">
                      {item?.staff_name || "--"}
                    </td>
                    <td className="px-2 py-4">
                      {formatAutoDate(item?.holiday_date) || "--"}
                    </td>
                    <td className="px-2 py-4 text-center">
                      <span
                        className={`flex items-center gap-1 rounded-full min-h-[30px] px-3 mx-auto text-sm w-fit 
                          ${workingColor[!!item?.is_working] || "bg-[#EEEEEE]"}`}
                      >
                        <FaCircle className="text-[10px]" />
                        {item?.is_working === true ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      {formatClubTime(item?.start_time)}
                    </td>
                    <td className="px-2 py-4">
                      {formatClubTime(item?.end_time)}
                    </td>
                    <td className="px-2 py-4">{item?.reason || "--"}</td>
                    <td className="px-2 py-4 text-center">
                      {item?.position ?? "--"}
                    </td>
                    <td className="px-2 py-4 text-center">
                      <span
                        className={`flex items-center gap-1 rounded-full min-h-[30px] px-3 mx-auto text-sm w-fit 
                          ${statusColors[item?.status] || "bg-[#EEEEEE]"}`}
                      >
                        <FaCircle className="text-[10px]" />
                        {formatText(item?.status) ?? "--"}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      {formatAutoDate(item?.createdAt) || "--"}
                    </td>
                    {canManage && (
                      <td className="px-2 py-4">
                        <div className="flex">
                        <Tooltip
                          id={`tooltip-edit-${item.id || index}`}
                          content="Edit Staff Holiday"
                          place="top"
                        >
                          <div
                            className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-l-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                            onClick={() => {
                              setEditingStaffHoliday(item?.id);
                              setShowModal(true);
                            }}
                          >
                            <img src={editIcon} />
                          </div>
                        </Tooltip>
                        {userRole === "ADMIN" && (
                          <Tooltip
                            id={`tooltip-delete-${item.id}`}
                            content="Delete Staff Holiday"
                            place="left"
                          >
                            <div
                              className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-r-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer`}
                              onClick={() => {
                                setItemToDelete(item);
                                setShowConfirmPopup(true);
                              }}
                            >
                              <img src={deleteIcon} />
                            </div>
                          </Tooltip>
                        )}
                        </div>
                      </td>
                    )}
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
          currentDataLength={staffHoliday.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchStaffHoliday(newPage);
          }}
        />
      </div>

      {showModal && (
        <CreateStaffHoliday
          setShowModal={setShowModal}
          editingStaffHoliday={editingStaffHoliday}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
        />
      )}
      {showConfirmPopup && itemToDelete && (
        <ConfirmPopup
          message={
            <>
              Are you sure you want to delete this holiday for <br />"{itemToDelete?.staff_name}"?
            </>
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default StaffHolidayList;
