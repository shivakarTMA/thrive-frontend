import React, { useCallback, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { LuCalendarDays } from "react-icons/lu";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";

const localizer = momentLocalizer(moment);

const viewOptions = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const EVENT_COLORS = {
  personal: { bg: "#F0FDFA", border: "#0D9488" },
  pilates: { bg: "#F0FDFA", border: "#0D9488" },
  core: { bg: "#F0FDFA", border: "#0D9488" },
  group: { bg: "#F0FDFA", border: "#0D9488" },
  zumba: { bg: "#F0FDFA", border: "#0D9488" },
  yoga: { bg: "#F0FDFA", border: "#0D9488" },
  dance: { bg: "#F0FDFA", border: "#0D9488" },
  strength: { bg: "#F0FDFA", border: "#0D9488" },
  trx: { bg: "#F0FDFA", border: "#0D9488" },
  trial: { bg: "#E7F0FF", border: "#2563EB" },
};

const CalendarView = () => {
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date(2026, 0, 12));

  const events = [
     {
      id: 1,
      title: "Personal Training",
      start: new Date(2026, 0, 3, 7, 0),
      end: new Date(2026, 0, 3, 8, 0),
      trainer: "Nishant Bhatti",
      type: "personal",
    },
    {
      id: 2,
      title: "Pilates Package",
      start: new Date(2026, 0, 5, 10, 0),
      end: new Date(2026, 0, 5, 11, 0),
      trainer: "Nishant Bhatti",
      type: "pilates",
    },
    {
      id: 3,
      title: "THE ATHLETE'S CORE 36",
      start: new Date(2026, 0, 7, 8, 0),
      end: new Date(2026, 0, 7, 9, 0),
      trainer: "PRASHANT",
      type: "core",
    },
    {
      id: 4,
      title: "THE 12 PACK PROGRESS",
      start: new Date(2026, 0, 10, 14, 0),
      end: new Date(2026, 0, 10, 15, 0),
      trainer: "ARYAN TOMAR",
      type: "core",
    },
    {
      id: 5,
      title: "PILATES POWER LINES",
      start: new Date(2026, 0, 12, 9, 0),
      end: new Date(2026, 0, 12, 10, 0),
      trainer: "RAKHI",
      type: "pilates",
    },
    {
      id: 6,
      title: "Group Class Activity",
      start: new Date(2026, 0, 15, 13, 0),
      end: new Date(2026, 0, 15, 14, 0),
      trainer: "ARYAN TOMAR",
      type: "group",
    },
    {
      id: 7,
      title: "Non-Stop Zumba",
      start: new Date(2026, 1, 2, 7, 0),
      end: new Date(2026, 1, 2, 8, 0),
      trainer: "PRASHANT",
      type: "zumba",
    },
    {
      id: 8,
      title: "Hatha Yoga",
      start: new Date(2026, 1, 3, 6, 30),
      end: new Date(2026, 1, 3, 7, 30),
      trainer: "PRASHANT",
      type: "yoga",
    },
    {
      id: 9,
      title: "Step Dance",
      start: new Date(2026, 1, 4, 9, 0),
      end: new Date(2026, 1, 4, 10, 0),
      trainer: "ARYAN TOMAR",
      type: "dance",
    },
    {
      id: 10,
      title: "Flexi Strength",
      start: new Date(2026, 1, 5, 12, 0),
      end: new Date(2026, 1, 5, 13, 0),
      trainer: "ARYAN TOMAR",
      type: "strength",
    },
    {
      id: 11,
      title: "TRX AND BOSU",
      start: new Date(2026, 1, 6, 17, 0),
      end: new Date(2026, 1, 6, 18, 0),
      trainer: "Nishant Bhatti",
      type: "trx",
    },
    {
      id: 12,
      title: "Trial",
      start: new Date(2026, 0, 17, 10, 0),
      end: new Date(2026, 0, 17, 11, 0),
      trainer: "RAKHI",
      type: "trial", // ✅ BLUE
    },
  ];

  const eventStyleGetter = useCallback(
    (event) => {
      const colors = EVENT_COLORS[event.type] || EVENT_COLORS.group;
      return {
        style: {
          backgroundColor: colors.bg,
          borderLeft: `4px solid ${colors.border}`,
          borderRadius: "0px",
          color: "#000",
          padding: "8px",
        },
      };
    },
    []
  );

  const CustomEvent = ({ event }) => {
    const formatTime = (date) => moment(date).format("h:mm A");

    return (
      <div className="h-full">
        {view === "month" ? (
          <div className="text-xs font-medium truncate">{event.title}</div>
        ) : (
          <>
            <div className="font-medium text-[12px] leading-tight mb-1">
              {event.title}
            </div>
            <div className="text-[10px] text-gray-600">
              {formatTime(event.start)} – {formatTime(event.end)}
            </div>
            <div className="text-[10px] text-gray-600 truncate">
              {event.trainer}
            </div>
          </>
        )}
      </div>
    );
  };

  const navigatePrevious = () => {
    const newDate = new Date(date);
    if (view === "month") newDate.setMonth(date.getMonth() - 1);
    else if (view === "week") newDate.setDate(date.getDate() - 7);
    else newDate.setDate(date.getDate() - 1);
    setDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(date);
    if (view === "month") newDate.setMonth(date.getMonth() + 1);
    else if (view === "week") newDate.setDate(date.getDate() + 7);
    else newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  return (
    <div className="rounded-[15px] p-4 bg-white mt-3">
      {/* Header */}
      <div className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">My Calendar</h2>
          <div className="flex items-center gap-3">
            <LuCalendarDays className="w-5 h-5 text-gray-600" />
            <div className="w-40">
              <Select
                options={viewOptions}
                value={viewOptions.find((o) => o.value === view)}
                onChange={(e) => setView(e.value)}
                styles={customStyles}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={navigatePrevious}>
              <FaChevronLeft />
            </button>
            <span className="text-sm font-medium text-gray-600">
              {view === "week" ? "This Week" : ""}
            </span>
            <button onClick={navigateNext}>
              <FaChevronRight />
            </button>
          </div>
          <h2 className="text-xl font-semibold">
            {moment(date).format("MMMM YYYY")}
          </h2>
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        eventPropGetter={eventStyleGetter}
        components={{
          event: CustomEvent,
          header: ({ date }) => (
            <div>
              <div className="text-xs uppercase text-gray-500">
                {moment(date).format("ddd")}
              </div>
              {view !== "month" && (
                <div className="text-lg">{moment(date).format("DD")}</div>
              )}
            </div>
          ),
        }}
        showNow={false}              // ✅ removes green line
        min={new Date(1970, 1, 1, 7, 0)}   // ✅ correct min
        max={new Date(1970, 1, 1, 20, 0)}  // ✅ correct max
        step={60}
        timeslots={1}
        toolbar={false}
        views={["month", "week", "day"]}
      />
    </div>
  );
};

export default CalendarView;
