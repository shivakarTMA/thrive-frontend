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

const CalendarView = () => {
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());

  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Sample events data
  const events = [
    {
      id: 1,
      title: "Fitness Class",
      start: new Date(2026, 0, 3, 7, 0), // Jan 3, 2026
      end: new Date(2026, 0, 3, 8, 0),
      trainer: "Abhinav Sharma",
      type: "fitness",
      bookings: 12,
      waiting: 3,
      cancellations: 2,
    },
    {
      id: 2,
      title: "Stretching",
      start: new Date(2026, 0, 10, 10, 0), // Jan 10, 2026
      end: new Date(2026, 0, 10, 11, 0),
      trainer: "Mansi Kundra",
      type: "stretching",
      bookings: 8,
      waiting: 1,
      cancellations: 0,
    },
    {
      id: 3,
      title: "Crossfit",
      start: new Date(2026, 0, 10, 8, 0),
      end: new Date(2026, 0, 10, 9, 0),
      trainer: "Khushi Rawat",
      type: "crossfit",
      bookings: 15,
      waiting: 5,
      cancellations: 1,
    },
    {
      id: 4,
      title: "Fitness Class",
      start: new Date(2026, 0, 15, 14, 0), // Jan 15, 2026
      end: new Date(2026, 0, 15, 15, 0),
      trainer: "Arsh Mittal",
      type: "fitness",
      bookings: 10,
      waiting: 2,
      cancellations: 1,
    },
    {
      id: 5,
      title: "Fitness Class",
      start: new Date(2026, 0, 20, 9, 0), // Jan 20, 2026
      end: new Date(2026, 0, 20, 10, 0),
      trainer: "Akash Solanki",
      type: "fitness",
      bookings: 14,
      waiting: 4,
      cancellations: 3,
    },
    {
      id: 6,
      title: "Crossfit",
      start: new Date(2026, 0, 20, 13, 0),
      end: new Date(2026, 0, 20, 14, 0),
      trainer: "Grovy Batra",
      type: "crossfit",
      bookings: 11,
      waiting: 2,
      cancellations: 0,
    },
    {
      id: 7,
      title: "Crossfit",
      start: new Date(2026, 1, 2, 7, 0), // Feb 2, 2026
      end: new Date(2026, 1, 2, 8, 0),
      trainer: "Shivam Sharma",
      type: "crossfit",
      bookings: 13,
      waiting: 3,
      cancellations: 1,
    },
    {
      id: 8,
      title: "Fitness Class",
      start: new Date(2026, 1, 5, 12, 0), // Feb 5, 2026
      end: new Date(2026, 1, 5, 13, 0),
      trainer: "Bhavya Garg",
      type: "fitness",
      bookings: 16,
      waiting: 6,
      cancellations: 2,
    },
    {
      id: 9,
      title: "Fitness Class",
      start: new Date(2026, 1, 5, 15, 0),
      end: new Date(2026, 1, 5, 16, 0),
      trainer: "Sayash Agarwal",
      type: "fitness",
      bookings: 7,
      waiting: 0,
      cancellations: 1,
    },
    {
      id: 10,
      title: "Crossfit",
      start: new Date(2026, 1, 5, 16, 0),
      end: new Date(2026, 1, 5, 17, 0),
      trainer: "Shruti Bansal",
      type: "crossfit",
      bookings: 12,
      waiting: 4,
      cancellations: 0,
    },
    {
      id: 11,
      title: "Stretching",
      start: new Date(2026, 1, 10, 10, 0), // Feb 10, 2026
      end: new Date(2026, 1, 10, 11, 0),
      trainer: "Sonakshi Sharma",
      type: "stretching",
      bookings: 6,
      waiting: 1,
      cancellations: 1,
    },
    {
      id: 12,
      title: "Yoga Flow",
      start: new Date(2026, 1, 3, 6, 30), // Feb 3, 2026
      end: new Date(2026, 1, 3, 7, 30),
      trainer: "Ritika Malhotra",
      type: "yoga",
      bookings: 9,
      waiting: 2,
      cancellations: 0,
    },
    {
      id: 13,
      title: "HIIT",
      start: new Date(2026, 1, 3, 18, 0),
      end: new Date(2026, 1, 3, 19, 0),
      trainer: "Rohan Mehta",
      type: "fitness",
      bookings: 14,
      waiting: 5,
      cancellations: 1,
    },
    {
      id: 14,
      title: "Stretching",
      start: new Date(2026, 1, 4, 9, 0), // Feb 4, 2026
      end: new Date(2026, 1, 4, 10, 0),
      trainer: "Neha Kapoor",
      type: "stretching",
      bookings: 7,
      waiting: 1,
      cancellations: 0,
    },
    {
      id: 15,
      title: "Crossfit",
      start: new Date(2026, 1, 4, 17, 0),
      end: new Date(2026, 1, 4, 18, 0),
      trainer: "Aman Verma",
      type: "crossfit",
      bookings: 16,
      waiting: 4,
      cancellations: 2,
    },
    {
      id: 16,
      title: "Fitness Class",
      start: new Date(2026, 1, 6, 7, 0), // Feb 6, 2026
      end: new Date(2026, 1, 6, 8, 0),
      trainer: "Pooja Singh",
      type: "fitness",
      bookings: 11,
      waiting: 2,
      cancellations: 1,
    },
    {
      id: 17,
      title: "Yoga Flow",
      start: new Date(2026, 1, 7, 10, 0), // Feb 7, 2026
      end: new Date(2026, 1, 7, 11, 0),
      trainer: "Kunal Arora",
      type: "yoga",
      bookings: 10,
      waiting: 3,
      cancellations: 0,
    },
    {
      id: 18,
      title: "Crossfit",
      start: new Date(2026, 1, 8, 16, 0), // Feb 8, 2026
      end: new Date(2026, 1, 8, 17, 0),
      trainer: "Nikhil Jain",
      type: "crossfit",
      bookings: 15,
      waiting: 5,
      cancellations: 1,
    },
    {
      id: 22,
      title: "Stretching",
      start: new Date(2026, 0, 15, 10, 0), // Jan 15, 2026
      end: new Date(2026, 0, 15, 11, 0),
      trainer: "Neha Kapoor",
      type: "stretching",
      bookings: 6,
      waiting: 1,
      cancellations: 0,
    },
    
    {
      id: 24,
      title: "Fitness Class",
      start: new Date(2026, 0, 17, 9, 0), // Jan 17, 2026
      end: new Date(2026, 0, 17, 10, 0),
      trainer: "Pooja Singh",
      type: "fitness",
      bookings: 11,
      waiting: 2,
      cancellations: 1,
    },
    {
      id: 25,
      title: "Crossfit",
      start: new Date(2026, 0, 18, 16, 0), // Jan 18, 2026 (Sun)
      end: new Date(2026, 0, 18, 17, 0),
      trainer: "Nikhil Jain",
      type: "crossfit",
      bookings: 14,
      waiting: 3,
      cancellations: 0,
    },
  ];

  const eventStyleGetter = useCallback(
    (event) => {
      let backgroundColor = "#E1F3E6";
      let borderColor = "#059669";

      if (event.type === "crossfit") {
        backgroundColor = "#E7F0FF";
        borderColor = "#5892F1";
      } else if (event.type === "stretching") {
        backgroundColor = "#E1F3E6";
        borderColor = "#059669";
      }

      return {
        style: {
          backgroundColor,
          borderLeft: `4px solid ${borderColor}`,
          borderRadius: "0px",
          opacity: 0.9,
          color: "black",
          display: "block",
          width: "100%",
          fontSize: "70%",
          padding: `${view === "month" ? "5px" : "8px"}`,
        },
      };
    },
    [view]
  );

  const CustomEvent = ({ event }) => {
    const formatTime = (date) => {
      return moment(date).format("h:mm A");
    };

    const handleMouseEnter = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setHoveredEvent(event);
    };

    const handleMouseLeave = () => {
      setHoveredEvent(null);
    };

    return (
      <div
        className="h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {view === "month" ? (
          <div className="font-medium text-xs truncate !text-[#000000]">
            {event.title}
          </div>
        ) : (
          <>
            <div className="font-[500] text-sm !text-[#000000]  mb-2">
              {event.title}
            </div>
            <div className="text-[10px] mt-0.5 !text-[#6F6F6F]">
              {formatTime(event.start)} - {formatTime(event.end)}
            </div>
            <div className="text-[10px] mt-0.5 !text-[#6F6F6F]">
              {event.trainer}
            </div>
          </>
        )}
      </div>
    );
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const navigatePrevious = () => {
    let newDate = new Date(date);
    if (view === "month") {
      newDate.setMonth(date.getMonth() - 1);
    } else if (view === "week") {
      newDate.setDate(date.getDate() - 7);
    } else if (view === "day") {
      newDate.setDate(date.getDate() - 1);
    }
    setDate(newDate);
  };

  const navigateNext = () => {
    let newDate = new Date(date);
    if (view === "month") {
      newDate.setMonth(date.getMonth() + 1);
    } else if (view === "week") {
      newDate.setDate(date.getDate() + 7);
    } else if (view === "day") {
      newDate.setDate(date.getDate() + 1);
    }
    setDate(newDate);
  };

  const getViewLabel = () => {
    if (view === "week") return "This Week";
    if (view === "day") return moment(date).format("MMMM D, YYYY"); // Example: November 2, 2025
    return "This Month";
  };

  return (
    <div className=" rounded-[15px] p-4 box--shadow bg-white mt-3">
      {/* Header */}
      <div className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">My Calendar</h2>
          <div className="flex items-center gap-3">
            <LuCalendarDays className="w-5 h-5 text-gray-600" />
            <div className="w-40">
              <Select
                placeholder="Select"
                options={viewOptions}
                value={viewOptions.find((opt) => opt.value === view)}
                onChange={(selected) => handleViewChange(selected.value)}
                styles={customStyles}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-600 min-w-24 text-center">
              {getViewLabel()}
            </span>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FaChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-black">
            {moment(date).format("MMMM YYYY")}
          </h2>
        </div>
      </div>

      {/* Calendar */}
      <div className={`relative active--${view}`}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={handleNavigate}
          eventPropGetter={eventStyleGetter}
          components={{
            event: CustomEvent,
            header: ({ date }) => (
              <div className="text-left">
                <div className="text-[#6F6F6F] uppercase text-[12px]">
                  {moment(date).format("ddd")}
                </div>
                {view !== "month" && (
                  <div className="text-[#000000] text-xl">
                    {moment(date).format("DD")}
                  </div>
                )}
              </div>
            ),
          }}
          min={new Date(2025, 9, 21, 7, 0, 0)}
          max={new Date(2025, 9, 21, 18, 0, 0)}
          step={60}
          timeslots={1}
          defaultView="week"
          views={["month", "week", "day"]}
          toolbar={false}
        />

        {/* Disable current time indicator for all views */}
        <style>
          {`
          .rbc-current-time-indicator {
            display: none !important;
          }
        `}
        </style>
        {/* Custom Tooltip */}
        {/* {hoveredEvent && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-64">
              {view === "month" ? (
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-base">
                    {hoveredEvent.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {hoveredEvent.trainer}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {moment(hoveredEvent.start).format("h:mm A")} -{" "}
                    {moment(hoveredEvent.end).format("h:mm A")}
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Number of Bookings
                  </span>
                  <span className="font-semibold text-gray-800">
                    {hoveredEvent.bookings}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Number of Waiting
                  </span>
                  <span className="font-semibold text-gray-800">
                    {hoveredEvent.waiting}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Number of Cancellations
                  </span>
                  <span className="font-semibold text-gray-800">
                    {hoveredEvent.cancellations}
                  </span>
                </div>
              </div>


              <div
                className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: "8px solid white",
                }}
              ></div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default CalendarView;
