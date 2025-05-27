import React, { useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { customStyles } from "../../Helper/helper";

const Appointments = () => {
  const [trainerTypeFilter, setTrainerTypeFilter] = useState({ value: "All", label: "All" });
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const dummyAppointments = [
    { name: "Alice", trainer: "Alish", appointment: "Personal Training with Gaurav", trainerType: "PT", date: "10/4/25", status: "Completed" },
    { name: "Ben", trainer: "Ravi", appointment: "Group Training with Ravi", trainerType: "GT", date: "12/4/25", status: "Scheduled" },
    { name: "Cara", trainer: "Sneha", appointment: "Yoga Session with Sneha", trainerType: "Yoga", date: "13/4/25", status: "Missed" },
    { name: "David", trainer: "Arjun", appointment: "Personal Training with Arjun", trainerType: "PT", date: "15/4/25", status: "Completed" },
    { name: "Ella", trainer: "Mira", appointment: "Zumba Class with Mira", trainerType: "Group", date: "16/4/25", status: "Scheduled" },
    { name: "Farhan", trainer: "Neha", appointment: "Strength Training with Neha", trainerType: "PT", date: "18/4/25", status: "Cancelled" },
    { name: "Grace", trainer: "Amit", appointment: "Cardio Blast with Amit", trainerType: "Group", date: "19/4/25", status: "Completed" },
    { name: "Hassan", trainer: "Sara", appointment: "Pilates with Sara", trainerType: "Yoga", date: "20/4/25", status: "Scheduled" },
    { name: "Ivy", trainer: "Raj", appointment: "Functional Training with Raj", trainerType: "PT", date: "21/4/25", status: "Missed" },
    { name: "Jack", trainer: "Divya", appointment: "HIIT with Divya", trainerType: "Group", date: "22/4/25", status: "Completed" },
  ];

  const trainerTypeOptions = [
    { value: "All", label: "All" },
    { value: "PT", label: "PT" },
    { value: "Buddy PT", label: "Buddy PT" },
    { value: "NC", label: "NC" },
    { value: "GX", label: "GX" },
    { value: "GT", label: "GT" },
    { value: "Yoga", label: "Yoga" },
    { value: "Group", label: "Group" },
  ];

  const filteredAppointments = dummyAppointments.filter((appt) => {
    const [day, month, year] = appt.date.split("/").map(Number);
    const apptDate = new Date(`20${year}`, month - 1, day);

    return (
      (trainerTypeFilter.value === "All" || appt.trainerType === trainerTypeFilter.value) &&
      (!dateFrom || apptDate >= dateFrom) &&
      (!dateTo || apptDate <= dateTo)
    );
  });

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Select
          options={trainerTypeOptions}
          value={trainerTypeFilter}
          onChange={setTrainerTypeFilter}
          placeholder="Select Trainer Type"
          styles={customStyles}
          className="w-40"
        />
        <div className="custom--date">
          <DatePicker
            selected={dateFrom}
            onChange={(date) => setDateFrom(date)}
            className="border px-3 py-2 rounded"
            placeholderText="From date"
          />
        </div>
        <span>to</span>
        <div className="custom--date">
          <DatePicker
            selected={dateTo}
            onChange={(date) => setDateTo(date)}
            className="border px-3 py-2 rounded"
            placeholderText="To date"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Client Name</th>
              <th className="border px-3 py-2">Trainer</th>
              <th className="border px-3 py-2">Appointment</th>
              <th className="border px-3 py-2">Trainer Type</th>
              <th className="border px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appt, idx) => (
              <tr key={idx}>
                <td className="border px-3 py-2">{appt.date}</td>
                <td className="border px-3 py-2">{appt.name}</td>
                <td className="border px-3 py-2">{appt.trainer}</td>
                <td className="border px-3 py-2">{appt.appointment}</td>
                <td className="border px-3 py-2">{appt.trainerType}</td>
                <td className="border px-3 py-2">{appt.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAppointments.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No appointments found.</p>
        )}
      </div>
    </div>
  );
};

export default Appointments;
