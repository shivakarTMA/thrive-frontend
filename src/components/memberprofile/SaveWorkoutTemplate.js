import React from "react";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";

const SaveWorkoutTemplate = ({ open, onClose, onAssign }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Save as Template</h2>

        {/* Workout Type Select */}
        <div className="mb-4">
          <label className="block mb-2">Template Name</label>
          <input
            type="text"
            className="custom--input w-full"
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
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveWorkoutTemplate;
