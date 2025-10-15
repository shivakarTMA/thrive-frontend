// Import React and useState hook for managing state
import React, { useEffect, useState } from "react";
import { apiAxios } from "../../config/config";
import { toast } from "react-toastify";
import { formatAutoDate } from "../../Helper/helper";

// Functional component HealthProfile
const HealthProfile = ({ details }) => {
  // State to manage active tab selection
  const [activeTab, setActiveTab] = useState("steps");
  const [memberSteps, setMemberSteps] = useState([]);

  const fetchMemberSteps = async () => {
    try {
      // Make the API call with query parameters
      const res = await apiAxios().get(`/member/health/profile/${details?.id}`);
      const data = res.data?.data || [];
      setMemberSteps(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch coins");
    }
  };

  useEffect(() => {
    fetchMemberSteps();
  }, []);

  console.log(memberSteps,'memberSteps')

  // Dummy data for Weight tab
  const weightData = [
    { date: "10/4/25", weightKg: 70, weightLb: 154 },
    { date: "11/4/25", weightKg: 69.5, weightLb: 153 },
  ];

  // Dummy data for Muscle Mass tab
  const muscleMassData = [
    { date: "10/4/25", massKg: 28, massLb: 61.7 },
    { date: "11/4/25", massKg: 28.2, massLb: 62.1 },
  ];

  // Dummy data for Body Fat tab
  const bodyFatData = [
    { date: "10/4/25", bodyFat: "20%" },
    { date: "11/4/25", bodyFat: "19.8%" },
  ];

  // Function to render table based on selected tab
  const renderTable = () => {
    switch (activeTab) {
      case "steps":
        return (
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Steps</th>
                <th className="border px-3 py-2">Distance</th>
                <th className="border px-3 py-2">Calories Burnt</th>
              </tr>
            </thead>
            <tbody>
              {memberSteps.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{formatAutoDate(row?.created_at)}</td>
                  <td className="border px-3 py-2">{row?.steps !== null ? row?.steps : '--'}</td>
                  <td className="border px-3 py-2">{row?.distance}</td>
                  <td className="border px-3 py-2">{row?.calories_burned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "weight":
        return (
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Weight (Kg)</th>
                <th className="border px-3 py-2">Weight (lb)</th>
              </tr>
            </thead>
            <tbody>
              {weightData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{row.date}</td>
                  <td className="border px-3 py-2">{row.weightKg}</td>
                  <td className="border px-3 py-2">{row.weightLb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "muscle":
        return (
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Muscle Mass (Kg)</th>
                <th className="border px-3 py-2">Muscle Mass (lb)</th>
              </tr>
            </thead>
            <tbody>
              {muscleMassData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{row.date}</td>
                  <td className="border px-3 py-2">{row.massKg}</td>
                  <td className="border px-3 py-2">{row.massLb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "bodyfat":
        return (
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Body Fat (%)</th>
              </tr>
            </thead>
            <tbody>
              {bodyFatData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{row.date}</td>
                  <td className="border px-3 py-2">{row.bodyFat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  // Rendering tabs and tables
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex gap-3 w-full justify-between items-center mb-4">
        {/* Tab navigation */}
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "steps" ? "bg-black text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("steps")}
          >
            Steps
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "weight" ? "bg-black text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("weight")}
          >
            Weight
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "muscle" ? "bg-black text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("muscle")}
          >
            Muscle Mass
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "bodyfat" ? "bg-black text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("bodyfat")}
          >
            Body Fat
          </button>
        </div>
        <div>
          <p>Last Updated : October 4, 2025, 4:30 PM</p>
        </div>
      </div>

      {/* Render table based on active tab */}
      <div className="overflow-auto">{renderTable()}</div>
    </div>
  );
};

// Exporting component for usage in other files
export default HealthProfile;
