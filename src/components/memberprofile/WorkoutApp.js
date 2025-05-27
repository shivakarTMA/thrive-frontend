import React, { useState } from "react";
import { FaAngleDown, FaAngleUp, FaCheckCircle } from "react-icons/fa";

const workoutPlans = {
  Monday: ["warm-up", "dumbbell raises", "deadlifts"],
  Tuesday: ["cardio", "push-ups", "planks"],
  Wednesday: ["stretching", "lunges", "pull-ups"],
  Thursday: ["jump rope", "squats", "shoulder press"],
  Friday: ["rowing", "crunches", "leg press"],
  Saturday: ["cycling", "bicep curls", "burpees"],
};

const progressData = [
  { date: "2025-05-21", calories: 320, steps: 4500, distance: "3.2 km" },
  { date: "2025-05-22", calories: 500, steps: 8200, distance: "6.1 km" },
  { date: "2025-05-23", calories: 410, steps: 6000, distance: "4.5 km" },
];

const WorkoutApp = () => {
  const [activeTab, setActiveTab] = useState("tracker");
  const [visibleDay, setVisibleDay] = useState(null);
  const [completedWorkouts, setCompletedWorkouts] = useState({});

  const handleMarkDone = (day, workout) => {
    setCompletedWorkouts((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), workout],
    }));
  };

  const handleMarkAllDone = (day) => {
    setCompletedWorkouts((prev) => ({
      ...prev,
      [day]: workoutPlans[day],
    }));
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("tracker")}
          className={`px-4 py-2 rounded ${
            activeTab === "tracker" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Workout Tracker
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          className={`px-4 py-2 rounded ${
            activeTab === "progress" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Workout Progress
        </button>
      </div>

      {/* Workout Tracker Tab */}
      {activeTab === "tracker" && (
        <div>
          {Object.keys(workoutPlans).map((day) => (
            <div key={day} className="mb-4">
              <div className="flex justify-between items-center bg-black px-4 py-2 rounded">
                <span className="font-semibold text-white">{day}</span>
                <button
                  className="text-white flex items-center gap-1"
                  onClick={() => setVisibleDay(visibleDay === day ? null : day)}
                >
                  {visibleDay === day ? "Hide Plan" : "View Plan"}

                  {visibleDay === day ? <FaAngleUp /> : <FaAngleDown />}
                </button>
              </div>

              {visibleDay === day && (
                <div className="ml-4 mt-2 space-y-2">
                  <ul>
                    {workoutPlans[day].map((workout, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center mb-2"
                      >
                        <span
                          className={` capitalize text-black`}
                        >
                          {workout}
                        </span>
                        {completedWorkouts[day]?.includes(workout) ? (
                          <button
                            className="text-sm px-2 py-1 bg-green-600 text-white rounded flex items-center gap-2 cursor-default"
                            disabled
                          >
                            <FaCheckCircle className="text-white" />
                            Done
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkDone(day, workout)}
                            className="text-sm px-2 py-1 bg-black text-white rounded hover:bg-gray-800"
                          >
                            Mark as done
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleMarkAllDone(day)}
                    className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Mark all as done
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Workout Progress Tab */}
      {activeTab === "progress" && (
        <div className="overflow-auto mt-4">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Date</th>
                <th className="border px-3 py-2 text-left">Calories Burnt</th>
                <th className="border px-3 py-2 text-left">Steps Walked</th>
                <th className="border px-3 py-2 text-left">Distance Covered</th>
              </tr>
            </thead>
            <tbody>
              {progressData.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">{item.date}</td>
                  <td className="border px-3 py-2">{item.calories}</td>
                  <td className="border px-3 py-2">{item.steps}</td>
                  <td className="border px-3 py-2">{item.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkoutApp;
