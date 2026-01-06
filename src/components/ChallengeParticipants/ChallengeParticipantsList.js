import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatText,
} from "../../Helper/helper";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { FaCircle } from "react-icons/fa";


const statusColors = {
  ACCEPTED: "bg-[#E8FFE6] text-[#138808]", // green
  PENDING: "bg-[#e7edfc] text-[#156ec1]", // blue
  REJECTED: "bg-[#FFE4E4] text-[#880808]", // red
  WITHDRAWN: "bg-[#FFF2CC] text-[#AD7B00]", // yellow
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, actionName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-600 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">Confirm Action</h2>
        <p>Are you sure you want to select "{actionName}"?</p>
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-black text-white px-4 py-2 rounded-md"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const ChallengeParticipantsList = () => {
  const { id } = useParams();
  const [challengeData, setChallengeData] = useState([]);
  const [data, setData] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const fetchChallengeById = async () => {
      if (id) {
        try {
          const response = await authAxios().get(`/challenge/${id}`);
          const data = response.data?.data || response.data || null;
          setChallengeData(data);
        } catch (error) {
          toast.error("Failed to fetch challenge data.");
          console.error("Error fetching challenge:", error);
        }

        try {
          const response = await authAxios().get(
            `/challenge/participant/member/list/${id}`
          );
          const data = response.data?.data || response.data || null;
          setData(data);
        } catch (error) {
          toast.error("Failed to fetch participant data.");
          console.error("Error fetching participant:", error);
        }
      }
    };

    fetchChallengeById();
  }, [id]);

  const actionOptions = [
    { value: "Mark 1st", label: "Mark 1st" },
    { value: "Mark 2nd", label: "Mark 2nd" },
    { value: "Mark 3rd", label: "Mark 3rd" },
  ];

  const handleActionChange = (selectedOption, memberId) => {
    setSelectedAction(selectedOption ? selectedOption.label : null);
    setSelectedMember(memberId);
    setModalOpen(true); // Open modal on action selection
  };

  const handleConfirmAction = () => {
    console.log(
      `Action "${selectedAction}" confirmed for member ${selectedMember}`
    );
    // You can perform any logic here like updating the status, etc.
  };

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Finance Reports > ${challengeData?.name} Participants`}
          </p>
          <h1 className="text-3xl font-semibold">
            {challengeData?.name} Participants
          </h1>
        </div>
      </div>

      {/* Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {/* <th className="px-2 py-4 min-w-[50px]">S.No.</th> */}
                <th className="px-2 py-4 min-w-[100px]">Member Id</th>
                <th className="px-2 py-4 min-w-[150px]">Member Name</th>
                <th className="px-2 py-4 min-w-[120px]">Status</th>
                <th className="px-2 py-4 min-w-[150px]">Challenge Joined On</th>
                <th className="px-2 py-4 min-w-[150px]">Challenge Type</th>
                <th className="px-2 py-4 min-w-[150px]">Metric So Far</th>
                <th className="px-2 py-4 min-w-[100px]">Current Rank</th>
                <th className="px-2 py-4 min-w-[130px]">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((item, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    {/* <td className="px-2 py-4">{index + 1}</td> */}
                    <td className="px-2 py-4">{item.member_id}</td>
                    <td className="px-2 py-4">{item.member_name}</td>
                    <td className="px-2 py-4">
                      <span
                        className={`flex items-center gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit 
                                                ${
                                                  statusColors[
                                                    item?.participant_status
                                                  ] || "bg-[#EEEEEE]"
                                                }`}
                      >
                        <FaCircle className="text-[10px]" />
                        {formatText(item?.participant_status) ?? "--"}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      {item.joined_at ? formatAutoDate(item.joined_at) : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {item.challenge_type
                        ? formatText(item.challenge_type)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {item.target_value} {item.target_unit}
                    </td>
                    <td className="px-2 py-4">
                      {item.challenge_type === "Custom"
                        ? "N/A"
                        : item.current_rank
                        ? item.current_rank
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {item.challenge_type === "Custom" ? (
                        <Select
                          options={actionOptions}
                          onChange={(selectedOption) =>
                            handleActionChange(selectedOption, item.memberId)
                          }
                          placeholder="Select Action"
                          styles={customStyles}
                          menuPortalTarget={document.body} // Ensures the dropdown is rendered in the body
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmAction}
        actionName={selectedAction}
      />
    </div>
  );
};

export default ChallengeParticipantsList;
