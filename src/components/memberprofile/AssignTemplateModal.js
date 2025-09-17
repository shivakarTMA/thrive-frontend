import React from "react";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";


const AssignTemplateModal = ({ open, onClose, onAssign, selectedWorkoutType, setSelectedWorkoutType, selectedTemplate, setSelectedTemplate }) => {
  const workoutTypeOptions = [
    { value: "multiple", label: "Workout Plan (Multiple Days)" },
    { value: "single", label: "Workout (One Day)" },
  ];

  const templateOptions = [
    { value: "template1", label: "Leg Day + Cardio Mix" },
    { value: "template2", label: "Push Day Strength" },
    { value: "template3", label: "Full Body HIIT" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Assign Template</h2>

        {/* Workout Type Select */}
        <div className="mb-4">
          <label className="block mb-2">Workout Type</label>
          <Select
            options={workoutTypeOptions}
            value={selectedWorkoutType}
            onChange={setSelectedWorkoutType}
            styles={customStyles}
          />
        </div>

        {/* Template Select */}
        <div className="mb-4">
          <label className="block mb-2">Template</label>
          <Select
            options={templateOptions}
            value={selectedTemplate}
            onChange={setSelectedTemplate}
            styles={customStyles}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onAssign}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTemplateModal;
