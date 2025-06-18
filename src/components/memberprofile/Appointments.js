import React, { useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles } from "../../Helper/helper";

const Appointments = () => {
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState({
    value: "All",
    label: "All",
  });
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const dummyAppointments = [
    {
      id: "APT001",
      name: "Alice",
      appointmentType: "PT",
      activity: "Weight Loss PT Pack",
      centerName: "Downtown Fitness",
      date: "10/4/25",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      assignedStaff: "Trainer Gaurav",
      bookingChannel: "App",
      status: "Completed",
      bookedBy: "Alice",
      remarks: "Great session",
    },
    {
      id: "APT002",
      name: "Ben",
      appointmentType: "Group Class",
      activity: "Zumba",
      centerName: "Active Zone",
      date: "12/4/25",
      startTime: "6:00 PM",
      endTime: "7:00 PM",
      assignedStaff: "Instructor Mira",
      bookingChannel: "CRM",
      status: "Scheduled",
      bookedBy: "Staff Ravi",
      remarks: "",
    },
    {
      id: "APT003",
      name: "Cara",
      appointmentType: "Nutrition",
      activity: "Nutrition Plan Consult",
      centerName: "Health First",
      date: "13/4/25",
      startTime: "2:00 PM",
      endTime: "2:30 PM",
      assignedStaff: "Nutritionist Sneha",
      bookingChannel: "App",
      status: "Missed",
      bookedBy: "Cara",
      remarks: "Client forgot",
    },
    {
      id: "APT004",
      name: "David",
      appointmentType: "Trial",
      activity: "Free PT Trial",
      centerName: "Gym Core",
      date: "15/4/25",
      startTime: "9:00 AM",
      endTime: "10:00 AM",
      assignedStaff: "Trainer Arjun",
      bookingChannel: "App",
      status: "Completed",
      bookedBy: "David",
      remarks: "Interested in full pack",
    },
    {
      id: "APT005",
      name: "Ella",
      appointmentType: "Event",
      activity: "Fitness Challenge",
      centerName: "Downtown Fitness",
      date: "16/4/25",
      startTime: "5:00 PM",
      endTime: "6:30 PM",
      assignedStaff: "Event Host Meera",
      bookingChannel: "CRM",
      status: "Scheduled",
      bookedBy: "Staff Rita",
      remarks: "",
    },
  ];

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

  const filteredAppointments = dummyAppointments.filter((appt) => {
    const [day, month, year] = appt.date.split("/").map(Number);
    const apptDate = new Date(`20${year}`, month - 1, day);

    return (
      (appointmentTypeFilter.value === "All" ||
        appt.appointmentType === appointmentTypeFilter.value) &&
      (!dateFrom || apptDate >= dateFrom) &&
      (!dateTo || apptDate <= dateTo)
    );
  });

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Filters */}
<div className="flex flex-wrap items-center gap-2 mb-4">
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
        if (!date) setDateTo(null); // Clear end date if start date is cleared
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
</div>


      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-3 py-2">Appointment ID</th>
              {/* <th className="border px-3 py-2">Member Name</th> */}
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Appointment Type</th>
              <th className="border px-3 py-2">Service / Activity</th>
              <th className="border px-3 py-2">Center</th>
              <th className="border px-3 py-2">Time Slot</th>
              <th className="border px-3 py-2">Assigned Staff</th>
              <th className="border px-3 py-2">Booking Channel</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Booked By</th>
              <th className="border px-3 py-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{appt.id}</td>
                  {/* <td className="border px-3 py-2">{appt.name}</td> */}
                  <td className="border px-3 py-2">{appt.date}</td>
                  <td className="border px-3 py-2">{appt.appointmentType}</td>
                  <td className="border px-3 py-2">{appt.activity}</td>
                  <td className="border px-3 py-2">{appt.centerName}</td>
                  <td className="border px-3 py-2">{`${appt.startTime} - ${appt.endTime}`}</td>
                  <td className="border px-3 py-2">{appt.assignedStaff}</td>
                  <td className="border px-3 py-2">{appt.bookingChannel}</td>
                  <td className="border px-3 py-2">{appt.status}</td>
                  <td className="border px-3 py-2">{appt.bookedBy}</td>
                  <td className="border px-3 py-2">{appt.remarks || "-"}</td>
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
  );
};

export default Appointments;
