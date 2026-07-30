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
import CreateClubOperatingHours from "./CreateClubOperatingHours";
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

const ClubOperatingHoursList = () => {
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

      const res = await authAxios().get("/club/operating/hours/list", {
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
  }, [statusFilter, clubFilter, weekdayFilter]);

  const initialValues = {
    club_id: "",
    weekday: "",
    open_time: "",
    close_time: "",
    is_closed: "",
    status: "",
    position: "",
  };

  const validationSchema = Yup.object({
    club_id: Yup.mixed().required("Club is required"),
    weekday: Yup.string().required("Weekday is required"),
    is_closed: Yup.mixed().required("This field is required"),
    open_time: Yup.string().when("is_closed", {
      is: false,
      then: (schema) => schema.required("Open time is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    close_time: Yup.string().when("is_closed", {
      is: false,
      then: (schema) => schema.required("Close time is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
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
          weekday: values.weekday,
          is_closed: values.is_closed,
          open_time: values.is_closed ? null : values.open_time,
          close_time: values.is_closed ? null : values.close_time,
          position: Number(values.position),
          status: values.status,
        };

        if (editingOperatingHours) {
          await authAxios().put(
            `/club/operating/hours/${editingOperatingHours}`,
            payload,
          );
          toast.success("Operating hours updated successfully");
        } else {
          await authAxios().post("/club/operating/hours/create", payload);
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
        await authAxios().delete(`/club/operating/hours/${itemToDelete.id}`);
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
          <h1 className="text-3xl font-semibold">Club Operating Hours</h1>
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
                <th className="px-2 py-4 min-w-[100px]">Weekday</th>
                <th className="px-2 py-4 min-w-[100px] text-center">Closed</th>
                <th className="px-2 py-4 min-w-[100px]">Open Time</th>
                <th className="px-2 py-4 min-w-[100px]">Close Time</th>
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
                    <td className="px-2 py-4">
                      {formatText(item?.weekday) || "--"}
                    </td>
                    <td className="px-2 py-4 text-center">
                      <span
                        className={`flex items-center gap-1 rounded-full min-h-[30px] px-3 mx-auto text-sm w-fit 
                          ${closedColor[!!item?.is_closed] || "bg-[#EEEEEE]"}`}
                      >
                        <FaCircle className="text-[10px]" />
                        {item?.is_closed === true ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      {formatClubTime(item?.open_time)}
                    </td>
                    <td className="px-2 py-4">
                      {formatClubTime(item?.close_time)}
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
        <CreateClubOperatingHours
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
              Are you sure you want to delete
              <br />"{itemToDelete?.weekday}"?
            </>
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default ClubOperatingHoursList;
