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
  formatText,
  formatClubTime,
  filterActiveItems,
} from "../../Helper/helper";
import Pagination from "../common/Pagination";
import { useSelector } from "react-redux";
import CreateStaffOperatingHours from "./CreateStaffOperatingHours";
import deleteIcon from "../../assets/images/icons/delete.svg";
import editIcon from "../../assets/images/icons/edit.svg";
import ConfirmPopup from "../common/ConfirmPopup";
import { useLocation } from "react-router-dom";

const statusColors = {
  ACTIVE: "bg-[#D1FADF] text-[#027A48]", // green
  INACTIVE: "bg-[#FFE4E4] text-[#880808]", // red
};

const closedColor = {
  true: "bg-[#FFE4E4] text-[#880808]",
  false: "bg-[#D1FADF] text-[#027A48]",
};

const weekdayOptions = [
  { label: "Monday", value: "MONDAY" },
  { label: "Tuesday", value: "TUESDAY" },
  { label: "Wednesday", value: "WEDNESDAY" },
  { label: "Thursday", value: "THURSDAY" },
  { label: "Friday", value: "FRIDAY" },
  { label: "Saturday", value: "SATURDAY" },
  { label: "Sunday", value: "SUNDAY" },
];

const StaffOperatingHoursList = () => {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [operatingHours, setOperatingHours] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [editingOperatingHours, setEditingOperatingHours] = useState(null);
  const leadBoxRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [weekdayFilter, setWeekdayFilter] = useState(null);
const [staff, setStaff] = useState([]);
  const [staffFilter, setStaffFilter] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;
  const canManage = userRole === "ADMIN" || userRole === "MARKETING_MANAGER";

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOperatingHours = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      if (statusFilter) {
        params.status = statusFilter.value;
      }
      if (weekdayFilter) {
        params.weekday = weekdayFilter.value;
      }
      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      if (staffFilter?.value) {
        params.staff_id = staffFilter.value;
      }

      const res = await authAxios().get("/staff/operating/hours/list", {
        params,
      });

      let data = res.data?.data || [];
      setOperatingHours(data);
      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPage || 1);
      setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message);
    }
  };

  // Function to fetch club list
  const fetchClub = async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
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

    const roles = ["FOH", "TRAINER", "FITNESS_MANAGER", "ASS_FITNESS_MANAGER"];

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
  FOH: "FOH",
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
    fetchOperatingHours(1);
  }, [statusFilter, clubFilter, weekdayFilter, staffFilter]);

  const initialValues = {
    club_id: "",
    staff_id: "",
    weekday: "",
    available_from: "",
    available_to: "",
    status: "",
    position: "",
  };

  const validationSchema = Yup.object({
    club_id: Yup.mixed().required("Club is required"),
    staff_id: Yup.mixed().required("Staff is required"),
    weekday: Yup.string().required("Weekday is required"),
    available_from: Yup.string().required("Available form is required"),
    available_to: Yup.string().required("Available to is required"),
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
          weekday: values.weekday,
          available_from: values.available_from,
          available_to: values.available_to,
          position: Number(values.position),
          status: values.status,
        };

        if (editingOperatingHours) {
          await authAxios().put(
            `/staff/operating/hours/${editingOperatingHours}`,
            payload,
          );
          toast.success("Operating hours updated successfully");
        } else {
          await authAxios().post("/staff/operating/hours/create", payload);
          toast.success("Operating hours created successfully");
        }

        resetForm();
        setShowModal(false);
        setEditingOperatingHours(null);
        fetchOperatingHours();
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
        await authAxios().delete(`/staff/operating/hours/${itemToDelete.id}`);
        const updatedCoupons = operatingHours.filter(
          (ex) => ex.id !== itemToDelete.id,
        );
        setOperatingHours(updatedCoupons);
        toast.success("Operating hours deleted successfully");
      } catch (error) {
        console.error("Error deleting operating:", error);
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
          <h1 className="text-3xl font-semibold">Staff Operating Hours</h1>
        </div>
        {canManage && (
          <div className="flex items-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
              onClick={() => {
                setEditingOperatingHours(null);
                formik.resetForm();
                setShowModal(true);
              }}
            >
              <FiPlus /> Create Operating Hours
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
        {/* Status filter */}
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
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Weekday"
            options={weekdayOptions}
            value={weekdayFilter}
            onChange={(option) => setWeekdayFilter(option)}
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
                <th className="px-2 py-4 min-w-[150px]">Club</th>
                <th className="px-2 py-4 min-w-[150px]">Staff Name</th>
                <th className="px-2 py-4 min-w-[100px]">Weekday</th>
                <th className="px-2 py-4 min-w-[130px]">Available form</th>
                <th className="px-2 py-4 min-w-[130px]">Available to</th>
                <th className="px-2 py-4 min-w-[100px] text-center">
                  Position
                </th>
                <th className="px-2 py-4 min-w-[100px] text-center">Status</th>
                {canManage && (
                  <th className="px-2 py-4 min-w-[100px]">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {operatingHours.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="text-center py-4">
                    No operating hours found.
                  </td>
                </tr>
              ) : (
                operatingHours.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{item?.club_name || "--"}</td>
                    <td className="px-2 py-4">{item?.staff_name || "--"}</td>
                    <td className="px-2 py-4">
                      {formatText(item?.weekday) || "--"}
                    </td>
                    <td className="px-2 py-4">
                      {formatClubTime(item?.available_from)}
                    </td>
                    <td className="px-2 py-4">
                      {formatClubTime(item?.available_to)}
                    </td>
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
                    {canManage && (
                      <td className="px-2 py-4">
                        <div className="flex">
                          <Tooltip
                            id={`tooltip-edit-${item.id || index}`}
                            content="Edit Weekday"
                            place="top"
                          >
                            <div
                              className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-l-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                setEditingOperatingHours(item?.id);
                                setShowModal(true);
                              }}
                            >
                              <img src={editIcon} />
                            </div>
                          </Tooltip>
                          {userRole === "ADMIN" && (
                            <Tooltip
                              id={`tooltip-delete-${item.id}`}
                              content="Delete Weekday"
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
          currentDataLength={operatingHours.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchOperatingHours(newPage);
          }}
        />
      </div>

      {showModal && (
        <CreateStaffOperatingHours
          setShowModal={setShowModal}
          editingOperatingHours={editingOperatingHours}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
        />
      )}
      {showConfirmPopup && itemToDelete && (
        <ConfirmPopup
          message={
            <>
              Are you sure you want to delete the staff operating hours for {itemToDelete?.weekday}?
            </>
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default StaffOperatingHoursList;
