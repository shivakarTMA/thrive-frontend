// Import React and useState hook for managing state
import React, { useEffect, useState } from "react";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { formatAutoDate } from "../../Helper/helper";

// Functional component HealthProfile
const HealthProfile = ({ details }) => {
  // State to manage active tab selection
  const [memberSteps, setMemberSteps] = useState([]);
  const columns = ["Date", "Steps", "Weight", "SMM", "PDF"];

  const fetchMemberSteps = async () => {
    try {
      // Make the API call with query parameters
      const res = await authAxios().get(
        `/member/health/profile/${details?.id}`,
      );
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

  // Rendering tabs and tables
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col} className="border px-3 py-2 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {memberSteps.length ? (
              memberSteps.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">{formatAutoDate(item.datetime)}</td>
                  <td className="border px-3 py-2">
                    {item.steps}
                  </td>
                  <td className="border px-3 py-2">
                    {item.weight}
                  </td>
                  <td className="border px-3 py-2">{item.smm}</td>
                  <td className="border px-3 py-2">{item.pbf}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-gray-500"
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Exporting component for usage in other files
export default HealthProfile;
