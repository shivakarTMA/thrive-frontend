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

const Appointments = ({ details }) => {
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState({
    value: "All",
    label: "All",
  });
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [appointmentList, setAppointmentList] = useState([]);

  const fetchAppointmentsList = async (search = "") => {
    try {
      const res = await authAxios().get(`/appointment/list/${details?.id}`);
      let data = res.data?.data || res?.data || [];

      setAppointmentList(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  useEffect(() => {
    fetchAppointmentsList();
  }, []);

  const appointmentTypeOptions = [
    { value: "All", label: "All" },
    { value: "Trial", label: "Trial" },
    { value: "Tour", label: "Tour" },
    { value: "PT", label: "PT" },
    { value: "Group Class", label: "Group Class" },
    { value: "Event", label: "Event" },
    { value: "Nutrition", label: "Nutrition" },
    { value: "BCA", label: "BCA" },
    { value: "Sports", label: "Sports" },
  ];

  // const filteredAppointments = appointmentList.filter((appt) => {
  //   const [day, month, year] = appt.date.split("/").map(Number);
  //   const apptDate = new Date(`20${year}`, month - 1, day);

  //   return (
  //     (appointmentTypeFilter.value === "All" ||
  //       appt.appointmentType === appointmentTypeFilter.value) &&
  //     (!dateFrom || apptDate >= dateFrom) &&
  //     (!dateTo || apptDate <= dateTo)
  //   );
  // });

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex gap-3 justify-between mb-4">
        {/* <div className="flex flex-wrap items-center gap-2">
          <Select
            options={appointmentTypeOptions}
            value={appointmentTypeFilter}
            onChange={setAppointmentTypeFilter}
            placeholder="Select Appointment Type"
            styles={customStyles}
            className="w-40"
          />
          <div className="custom--date dob-format">
            <DatePicker
              selected={dateFrom}
              onChange={(date) => {
                setDateFrom(date);
                if (!date) setDateTo(null);
              }}
              isClearable
              showMonthDropdown
              showYearDropdown
              maxDate={new Date()}
              dateFormat="dd MMM yyyy"
              dropdownMode="select"
              placeholderText="From date"
              className="custom--input w-full"
            />
          </div>
          <div className="custom--date dob-format">
            <DatePicker
              selected={dateTo}
              onChange={(date) => setDateTo(date)}
              isClearable
              minDate={dateFrom || null}
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dateFormat="dd MMM yyyy"
              dropdownMode="select"
              placeholderText="End date"
              className="custom--input w-full"
            />
          </div>
        </div> */}
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
            <thead className="bg-gray-100 text-left">
              <tr>
                {/* <th className="border px-3 py-2">Appointment ID</th> */}
                <th className="border px-3 py-2 min-w-[180px]">
                  Appointment Date
                </th>
                <th className="border px-3 py-2 min-w-[200px]">
                  Appointment Category
                </th>
                <th className="border px-3 py-2 min-w-[200px]">Name</th>
                <th className="border px-3 py-2 min-w-[200px]">Service Name</th>
                <th className="border px-3 py-2 min-w-[200px]">Service/Appointment Name</th>
                <th className="border px-3 py-2 min-w-[100px]">Type</th>
                <th className="border px-3 py-2 min-w-[130px]">Trainer Name</th>
                <th className="border px-3 py-2 min-w-[130px]">Scheduled By</th>
                <th className="border px-3 py-2 min-w-[100px]">Status</th>
                <th className="border px-3 py-2 min-w-[100px]">Payment</th>
                <th className="border px-3 py-2 min-w-[100px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointmentList.length > 0 ? (
                appointmentList.map((appt, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {/* <td className="border px-3 py-2">{appt?.id}</td> */}
                    <td className="border px-3 py-2">
                      {formatAutoDate(appt?.start_date)}{" "}
                      {formatTimeAppointment(appt?.start_time)}
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.appointment_category
                        ? formatText(appt?.appointment_category)
                        : "--"}
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.package_name ? formatText(appt?.package_name) : "--"}
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.service_name ? formatText(appt?.service_name) : "--"}
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.package_name ? formatText(appt?.package_name) : "--"}
                    </td>
                    <td className="border px-3 py-2">
                      {appt?.package_type ? formatText(appt?.package_type) : "--"}
                    </td>
                    <td className="border px-3 py-2">{appt.assigned_staff_name ? appt.assigned_staff_name : "--"}</td>
                    <td className="border px-3 py-2">{appt.staff_name ? appt.staff_name : "--"}</td>
                    <td className="border px-3 py-2">
                      {formatText(appt?.booking_status)}
                    </td>
                    <td className="border px-3 py-2">
                      {formatText(appt?.payment_status)}
                    </td>
                    <td className="border px-3 py-2">
                      <p
                        onClick={() =>
                          toast.success("Appointment cancelled successfully")
                        }
                        className={`text-[#009EB2] underline text-sm cursor-pointer`}
                      >
                        Cancel
                      </p>
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
      </div>

      {appointmentModal && (
        <CreateMemberAppointment
          setAppointmentModal={setAppointmentModal}
          memberID={details?.id}
          handleUpdate={fetchAppointmentsList}
        />
      )}
    </div>
  );
};

export default Appointments;
