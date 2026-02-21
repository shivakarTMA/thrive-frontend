import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  customStyles,
  formatAutoDate,
  formatText,
  formatTimeAppointment,
} from "../../Helper/helper";
import { FiPlus } from "react-icons/fi";
import CreateMemberAppointment from "../Appointment/CreateMemberAppointment";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { addYears, format, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Pagination from "../common/Pagination";

const Appointments = ({ details }) => {
  const [services, setServices] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [appointmentList, setAppointmentList] = useState([]);
  const clubId = details?.club_id;

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(""); // e.g., "CANCELLED"
  const [remarks, setRemarks] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAppointmentsList = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        member_id: details?.id,
      };

      if (selectedType?.value) {
        if (selectedType.filterKey === "appointment_type") {
          params.appointment_type = selectedType.value;
        } else {
          params.service_type = selectedType.value;
        }
      }
      if (dateFrom && dateTo) {
        params.startDate = format(dateFrom, "yyyy-MM-dd");
        params.endDate = format(dateTo, "yyyy-MM-dd");
      }

      const res = await authAxios().get(`/appointment/fetch/list`, { params });
      const responseData = res.data;
      let data = res.data?.data || res?.data || [];

      setAppointmentList(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  useEffect(() => {
    setPage(1);
    // ✅ If one date selected but not both → do nothing
    if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) {
      return;
    }

    fetchAppointmentsList(1);
  }, [selectedType, dateFrom, dateTo]);

  const fetchService = async (clubId = null) => {
    try {
      const params = {};
      if (clubId) params.club_id = clubId;
      const res = await authAxios().get("/service/list", { params });
      let data = res.data?.data || res?.data || [];
      const activeService = data?.filter((item) => item?.status === "ACTIVE");
      setServices(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  useEffect(() => {
    // Fetch services and staff based on clubId if provided
    fetchService(clubId);
  }, [clubId]); // <-- dependency added

  console.log(services,'asdfasdfasd')

  const appointmentTypeOptions = [
    {
      label: "Club",
      value: "CLUB",
      filterKey: "appointment_type",
    },
    ...(services
      ?.filter((item) => item.type !== "PRODUCT" && item.type !== "GROUP_CLASS")
      ?.map((item) => ({
        label: item.name,
        value: item.name,
        filterKey: "service_type",
      })) || []),
  ];

  console.log(appointmentTypeOptions,'appointmentTypeOptions')

  const handleCancelAppointment = async () => {
    if (!remarks.trim()) {
      toast.error("Please enter remarks");
      return;
    }

    try {
      await authAxios().put(`/appointment/${pendingAppointment?.id}`, {
        booking_status: pendingStatus,
        remarks,
      });

      toast.success("Appointment status cancelled successfully!");
      setShowConfirmModal(false);
      setRemarks("");
      fetchAppointmentsList(page); // Refresh the table
    } catch (err) {
      console.error(err);
      toast.error("Failed to update appointment status");
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex gap-3 justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[200px]">
            <Select
              options={appointmentTypeOptions}
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Filter by Type"
              styles={customStyles}
              className="w-full"
              isClearable
            />
          </div>
          <div className="custom--date dob-format">
            <span className="absolute z-[1] mt-[11px] ml-[15px]">
              <FaCalendarDays />
            </span>
            <DatePicker
              isClearable
              selected={dateFrom}
              onChange={(date) => {
                setDateFrom(date);
                setDateTo(null);
              }}
              showMonthDropdown
              showYearDropdown
              maxDate={new Date()}
              dateFormat="dd MMM yyyy"
              dropdownMode="select"
              placeholderText="From date"
              className="custom--input w-full input--icon"
            />
          </div>
          <div className="custom--date dob-format">
            <span className="absolute z-[1] mt-[11px] ml-[15px]">
              <FaCalendarDays />
            </span>
            <DatePicker
              isClearable
              selected={dateTo}
              onChange={(date) => setDateTo(date)}
              showMonthDropdown
              showYearDropdown
              minDate={dateFrom || subYears(new Date(), 20)}
              maxDate={addYears(new Date(), 0)}
              dateFormat="dd MMM yyyy"
              dropdownMode="select"
              placeholderText="To date"
              className="custom--input w-full input--icon"
              disabled={!dateFrom}
            />
          </div>
        </div>
        <div>
          <div
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 cursor-pointer"
            onClick={() => setAppointmentModal(true)}
          >
            <FiPlus /> Add Appointment
          </div>
        </div>
      </div>

      <div className="table--data--bottom w-full">
        <div className="relative overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 text-left">
              <tr>
                {/* <th className="border px-3 py-2">Appointment ID</th> */}
                <th className="border px-3 py-2 min-w-[180px]">BOOKING DATE</th>
                <th className="border px-3 py-2 min-w-[200px]">BOOKING TYPE</th>
                <th className="border px-3 py-2 min-w-[200px]">SERVICE TYPE</th>
                <th className="border px-3 py-2 min-w-[200px]">SERVICE NAME</th>
                <th className="border px-3 py-2 min-w-[150px]">
                  VARIATION NAME
                </th>
                <th className="border px-3 py-2 min-w-[130px]">SESSION NAME</th>
                <th className="border px-3 py-2 min-w-[170px]">SCHEDULED AT</th>
                <th className="border px-3 py-2 min-w-[150px]">TRAINER NAME</th>
                <th className="border px-3 py-2 min-w-[150px]">
                  CURRENT STATUS
                </th>
                <th className="border px-3 py-2 min-w-[100px]">VAS Rating</th>
                <th className="border px-3 py-2 min-w-[100px]">Rating</th>
                <th className="border px-3 py-2 min-w-[100px]">Action</th>
                <th className="border px-3 py-2 min-w-[100px]">remarks</th>
              </tr>
            </thead>
            <tbody>
              {appointmentList.length > 0 ? (
                appointmentList.map((appt, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {/* <td className="border px-3 py-2">{appt?.id}</td> */}
                    <td className="border px-3 py-2">
                      {formatAutoDate(appt?.createdAt)}{" "}
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.appointment_category
                        ? formatText(appt?.appointment_category)
                        : "--"}
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.appointment_type === "CLUB"
                        ? "Trial/test"
                        : appt?.service_name}
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.package_name
                        ? formatText(appt?.package_name)
                        : "--"}
                    </td>

                    <td className="border px-3 py-2">
                      {appt?.package_variation_name
                        ? formatText(appt?.package_variation_name)
                        : "--"}
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.session_name
                        ? formatText(appt?.session_name)
                        : "--"}
                    </td>
                    <td className="border px-3 py-2">
                      {formatAutoDate(appt?.start_date)}{" "}
                      {formatTimeAppointment(appt?.start_time)}
                    </td>

                    <td className="border px-3 py-2">
                      {appt.assigned_staff_name
                        ? appt.assigned_staff_name
                        : "--"}
                    </td>
                    {/* <td className="border px-3 py-2">
                        {appt.staff_name ? appt.staff_name : "--"}
                      </td> */}
                    <td className="border px-3 py-2">
                      {formatText(
                        appt?.booking_status === "ACTIVE"
                          ? "Upcoming"
                          : appt?.booking_status,
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.vas_rating ? appt?.vas_rating : "--"}
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.rating ? appt?.rating : "--"}
                    </td>

                    <td className="border px-3 py-2">
                      <button
                        onClick={() => {
                          setPendingAppointment(appt);
                          setPendingStatus("CANCELLED");
                          setShowConfirmModal(true);
                        }}
                        className={` rounded py-2 px-2 ${appt?.booking_status === "CANCELLED" || appt?.booking_status === "COMPLETED" ? "opacity-[0.5] pointer-events-none cursor-not-allowed bg-gray-300 text-gray-800" : "bg-black text-white"}`}
                      >
                        Cancel
                      </button>
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.remarks ? appt?.remarks : "--"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center py-4 text-gray-500">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={appointmentList.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchAppointmentsList(newPage);
          }}
        />
      </div>

      {appointmentModal && (
        <CreateMemberAppointment
          setAppointmentModal={setAppointmentModal}
          memberID={details?.id}
          handleUpdate={fetchAppointmentsList}
          clubId={details?.club_id}
        />
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[10px] w-[400px] shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Confirm Status Update
            </h3>

            <p className="text-center mb-4">
              Are you sure you want to mark this appointment as
              <span className="font-bold ml-1">
                {formatText(pendingStatus)}
              </span>
              ?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Remarks <span className="text-red-500">*</span>
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter cancellation reason"
                rows="4"
                className="w-full border border-gray-300 rounded-[5px] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>

            <div className="flex justify-between gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setRemarks("");
                }}
                className="w-1/2 border border-gray-400 rounded py-2 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCancelAppointment}
                className="w-1/2 bg-black text-white rounded py-2 hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
