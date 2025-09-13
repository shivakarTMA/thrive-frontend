import React, { useState } from "react";
// import { ChevronLeft, ChevronRight, Check, Calendar, ChevronDown } from 'lucide-react';
import {
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import { CiCalendar } from "react-icons/ci";

const WorkoutApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [completedExercises, setCompletedExercises] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  // Exercise data organized by categories
  const exerciseProgram = {
    0: {
      // Sunday - Rest Day
      theme: "Recovery",
      categories: [
        {
          name: "Recovery",
          count: 3,
          exercises: [
            { id: 1, name: "Gentle Stretching", sets: 1, reps: "10 min" },
            { id: 2, name: "Meditation", sets: 1, reps: "15 min" },
            { id: 3, name: "Foam Rolling", sets: 1, reps: "5 min" },
          ],
        },
      ],
    },
    1: {
      // Monday - Push Day
      theme: "Push",
      categories: [
        {
          name: "Shoulders",
          count: 4,
          exercises: [
            { id: 4, name: "Dumbbell Lateral Raise", sets: 3, reps: 12 },
            { id: 5, name: "Arnold Press", sets: 2, reps: 10 },
            { id: 6, name: "Front Raise", sets: 2, reps: 15 },
            { id: 7, name: "Reverse Flyes", sets: 3, reps: 12 },
          ],
        },
        {
          name: "Chest",
          count: 3,
          exercises: [
            { id: 8, name: "Push-ups", sets: 3, reps: 12 },
            { id: 9, name: "Chest Press", sets: 3, reps: 10 },
            { id: 10, name: "Chest Flyes", sets: 2, reps: 12 },
          ],
        },
        {
          name: "Triceps",
          count: 2,
          exercises: [
            { id: 11, name: "Tricep Dips", sets: 3, reps: 8 },
            { id: 12, name: "Overhead Extension", sets: 2, reps: 10 },
          ],
        },
      ],
    },
    2: {
      // Tuesday - Pull Day
      theme: "Pull",
      categories: [
        {
          name: "Back",
          count: 5,
          exercises: [
            { id: 13, name: "Pull-ups", sets: 2, reps: 15 },
            { id: 14, name: "Lat Pulldown", sets: 2, reps: 15 },
            { id: 15, name: "Seated Row", sets: 2, reps: 15 },
            { id: 16, name: "Face Pulls", sets: 2, reps: 12 },
            { id: 17, name: "Superman", sets: 3, reps: 10 },
          ],
        },
        {
          name: "Biceps",
          count: 3,
          exercises: [
            { id: 18, name: "Bicep Curls", sets: 3, reps: 12 },
            { id: 19, name: "Hammer Curls", sets: 2, reps: 10 },
            { id: 20, name: "21s Curls", sets: 2, reps: "21" },
          ],
        },
      ],
    },
    3: {
      // Wednesday - Legs
      theme: "Legs",
      categories: [
        {
          name: "Quadriceps",
          count: 4,
          exercises: [
            { id: 21, name: "Squats", sets: 4, reps: 15 },
            { id: 22, name: "Lunges", sets: 3, reps: "12 each" },
            {
              id: 23,
              name: "Bulgarian Split Squats",
              sets: 2,
              reps: "10 each",
            },
            { id: 24, name: "Wall Sits", sets: 3, reps: "30 sec" },
          ],
        },
        {
          name: "Hamstrings",
          count: 3,
          exercises: [
            { id: 25, name: "Romanian Deadlifts", sets: 3, reps: 12 },
            { id: 26, name: "Glute Bridges", sets: 3, reps: 15 },
            { id: 27, name: "Single-Leg Deadlifts", sets: 2, reps: "8 each" },
          ],
        },
        {
          name: "Calves",
          count: 2,
          exercises: [
            { id: 28, name: "Calf Raises", sets: 4, reps: 20 },
            { id: 29, name: "Seated Calf Raises", sets: 3, reps: 15 },
          ],
        },
      ],
    },
    4: {
      // Thursday - Cardio
      theme: "Cardio",
      categories: [
        {
          name: "Cardio",
          count: 4,
          exercises: [
            { id: 30, name: "Running", sets: 1, reps: "30 min" },
            { id: 31, name: "High Knees", sets: 3, reps: "30 sec" },
            { id: 32, name: "Mountain Climbers", sets: 3, reps: "20 each" },
            { id: 33, name: "Jumping Jacks", sets: 3, reps: 20 },
          ],
        },
      ],
    },
    5: {
      // Friday - Full Body
      theme: "Full Body",
      categories: [
        {
          name: "Upper Body",
          count: 3,
          exercises: [
            { id: 34, name: "Push-ups", sets: 3, reps: 10 },
            { id: 35, name: "Pike Push-ups", sets: 2, reps: 8 },
            { id: 36, name: "Arm Circles", sets: 2, reps: "20 each" },
          ],
        },
        {
          name: "Lower Body",
          count: 2,
          exercises: [
            { id: 37, name: "Bodyweight Squats", sets: 3, reps: 15 },
            {
              id: 38,
              name: "Single-Leg Glute Bridges",
              sets: 2,
              reps: "10 each",
            },
          ],
        },
      ],
    },
    6: {
      // Saturday - Core
      theme: "Core",
      categories: [
        {
          name: "Abs",
          count: 4,
          exercises: [
            { id: 39, name: "Crunches", sets: 3, reps: 15 },
            { id: 40, name: "Bicycle Crunches", sets: 3, reps: 20 },
            { id: 41, name: "Reverse Crunches", sets: 2, reps: 12 },
            { id: 42, name: "V-ups", sets: 2, reps: 10 },
          ],
        },
        {
          name: "Core Stability",
          count: 3,
          exercises: [
            { id: 43, name: "Plank", sets: 3, reps: "60 sec" },
            { id: 44, name: "Side Plank", sets: 2, reps: "30 sec each" },
            { id: 45, name: "Bird Dog", sets: 2, reps: "8 each" },
          ],
        },
      ],
    },
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const getExercisesForDate = (date) => {
    if (!date) return { theme: "", categories: [] };
    const dayOfWeek = date.getDay();
    return exerciseProgram[dayOfWeek] || { theme: "", categories: [] };
  };

  const toggleCategoryExpansion = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const isCategoryExpanded = (categoryName) => {
    return expandedCategories[categoryName] || false;
  };

  const getDateKey = (date) => {
    if (!date) return "";
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
      .toISOString()
      .split("T")[0];
  };

  const toggleExerciseCompletion = (date, exerciseId) => {
    const dateKey = getDateKey(date);
    setCompletedExercises((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [exerciseId]: !prev[dateKey]?.[exerciseId],
      },
    }));
  };

  const isExerciseCompleted = (date, exerciseId) => {
    const dateKey = getDateKey(date);
    return completedExercises[dateKey]?.[exerciseId] || false;
  };

  const getCompletionStats = (date) => {
    const dayExercises = getExercisesForDate(date);
    const dateKey = getDateKey(date);

    console.log("Stats for", dateKey, completedExercises[dateKey]);

    if (
      !dayExercises ||
      !dayExercises.categories ||
      dayExercises.categories.length === 0
    ) {
      return { completed: 0, total: 0 };
    }

    let totalExercises = 0;
    let completedExercisesCount = 0;

    dayExercises.categories.forEach((category) => {
      if (category && category.exercises && Array.isArray(category.exercises)) {
        totalExercises += category.exercises.length;
        completedExercisesCount += category.exercises.filter(
          (exercise) => exercise && isExerciseCompleted(date, exercise.id)
        ).length;
      }
    });

    return { completed: completedExercisesCount, total: totalExercises };
  };

  const days = getDaysInMonth(currentDate);
  const selectedDayExercises = getExercisesForDate(selectedDate);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Calendar Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-16"></div>;
              }

              const stats = getCompletionStats(date);
              const completionPercentage =
                stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`h-16 p-1 border rounded-lg transition-all hover:shadow-md ${
                    isSelected(date)
                      ? "bg-blue-500 text-white border-blue-500"
                      : isToday(date)
                      ? "bg-blue-100 border-blue-300"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-sm font-medium">{date.getDate()}</div>
                  {stats.total > 0 && (
                    <div className="mt-1">
                      <div
                        className={`w-full h-1 rounded-full ${
                          isSelected(date) ? "bg-blue-200" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`h-1 rounded-full transition-all ${
                            completionPercentage === 100
                              ? "bg-green-400"
                              : completionPercentage > 0
                              ? "bg-yellow-400"
                              : isSelected(date)
                              ? "bg-blue-300"
                              : "bg-gray-300"
                          }`}
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercise Details Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <CiCalendar className="w-6 h-6 mr-3 text-blue-500" />
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              {/* {selectedDayExercises.theme && (
                <p className="text-blue-600 font-medium">
                  {selectedDayExercises.theme} Day
                </p>
              )} */}
            </div>
          </div>

          {!selectedDayExercises ||
          !selectedDayExercises.categories ||
          selectedDayExercises.categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😴</div>
              <h4 className="text-lg font-medium text-gray-600 mb-2">
                No Workout for Today!
              </h4>
              <p className="text-gray-500">
                Recovery fuels progress. Enjoy your rest day!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayExercises.categories
                .map((category, categoryIndex) => {
                  if (
                    !category ||
                    !category.exercises ||
                    !Array.isArray(category.exercises)
                  ) {
                    return null;
                  }

                  const isExpanded = isCategoryExpanded(category.name);
                  const categoryStats = {
                    completed: category.exercises.filter(
                      (ex) => ex && isExerciseCompleted(selectedDate, ex.id)
                    ).length,
                    total: category.exercises.length,
                  };

                  return (
                    <div
                      key={categoryIndex}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Category Header - Shows category name and count */}
                      <button
                        onClick={() => toggleCategoryExpansion(category.name)}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-semibold text-gray-800">
                              {category.name}
                            </h4>
                            {/* <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                              {category.count} Sets
                            </span>
                            <span className="text-sm text-gray-500">
                              {categoryStats.total} Reps
                            </span> */}
                          </div>
                          <FaChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Exercise List - Shows when expanded */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 divide-y divide-gray-100">
                          {category.exercises.map((exercise) => {
                            if (!exercise || !exercise.id) return null;

                            const isCompleted = isExerciseCompleted(
                              selectedDate,
                              exercise.id
                            );
                            return (
                              <div
                                key={exercise.id}
                                className={`p-4 flex items-center justify-between transition-all ${
                                  isCompleted
                                    ? "bg-green-50"
                                    : "bg-white hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex-1">
                                  <h5
                                    className={`font-medium ${
                                      isCompleted
                                        ? "text-green-800 line-through"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {exercise.name || "Unnamed Exercise"}
                                  </h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {exercise.sets || 1} Sets ×{" "}
                                    {exercise.reps || "10"} Reps
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    toggleExerciseCompletion(
                                      selectedDate,
                                      exercise.id
                                    )
                                  }
                                  className={`p-2 rounded-full transition-all ${
                                    isCompleted
                                      ? "bg-green-500 text-white hover:bg-green-600"
                                      : "bg-gray-200 text-gray-400 hover:bg-green-100 hover:text-green-600"
                                  }`}
                                >
                                  <FaCheck className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
                .filter(Boolean)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutApp;
