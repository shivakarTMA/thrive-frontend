import React, { useEffect, useState } from "react";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { authAxios } from "../../config/config";

const workoutTypeOptions = [
  { value: "MULTIDAY", label: "Workout Plan (Multiple Days)" },
  { value: "SINGLE", label: "Workout (One Day)" },
];

const AssignTemplateModal = ({
  open,
  onClose,
  onAssign,
  selectedTemplate,
  setSelectedTemplate,
}) => {
  const [templates, setTemplates] = useState([]);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const res = await authAxios().get("/workoutplan/list");
        console.log("Workout template list:", res.data);
        setTemplates(res.data?.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch workout templates", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [open]);

  // 🔧 Filter templates by workout type
  const filteredTemplates = selectedWorkoutType
    ? templates.filter(
        (t) => t.workout_type === selectedWorkoutType.value
      )
    : [];

  const templateOptions = filteredTemplates.map((t) => ({
    value: t.id,
    label: `${t.name} (${t.no_of_days} days)`,
  }));

  const handleClose = () => {
    setSelectedWorkoutType(null);
    setSelectedTemplate(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[420px] shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Assign Template</h2>

        {/* Workout Type */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Workout Type
          </label>
          <Select
            options={workoutTypeOptions}
            value={selectedWorkoutType}
            onChange={(val) => {
              setSelectedWorkoutType(val);
              setSelectedTemplate(null); // reset template
            }}
            styles={customStyles}
            placeholder="Select workout type"
          />
        </div>

        {/* Template */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Template
          </label>
          <Select
            options={templateOptions}
            value={selectedTemplate}
            onChange={setSelectedTemplate}
            styles={customStyles}
            isDisabled={!selectedWorkoutType}
            isLoading={loading}
            placeholder={
              selectedWorkoutType
                ? "Select template"
                : "Select workout type first"
            }
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onAssign}
            disabled={!selectedTemplate}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTemplateModal;
