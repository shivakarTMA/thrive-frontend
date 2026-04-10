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
import { useSelector } from "react-redux";

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

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRank, setSelectedRank] = useState(null);

  const fetchParticipants = async () => {
    try {
      const response = await authAxios().get(
        `/challenge/participant/member/list/${id}`,
      );
      const data = response.data?.data || response.data || [];
      setData(data);
    } catch (error) {
      console.error("Error fetching participant:", error);
    }
  };

  useEffect(() => {
    const fetchChallengeById = async () => {
      if (id) {
        try {
          const response = await authAxios().get(`/challenge/${id}`);
          const data = response.data?.data || response.data || null;
          setChallengeData(data);
        } catch (error) {
          console.error("Error fetching challenge:", error);
        }

        await fetchParticipants(); // ✅ reuse here
      }
    };

    fetchChallengeById();
  }, [id]);

  const actionOptions = [
    { value: 1, label: "Mark 1st" },
    { value: 2, label: "Mark 2nd" },
    { value: 3, label: "Mark 3rd" },
  ];

  const handleActionChange = (selectedOption, challengeId) => {
    if (!selectedOption) return;

    setSelectedAction(selectedOption.label);
    setSelectedMember(challengeId);
    setSelectedRank(selectedOption.value); // ✅ store rank
    setModalOpen(true); // open modal only
  };

  const handleConfirmAction = async () => {
    try {
      const response = await authAxios().put(
        `/challenge/participant/${selectedMember}`,
        {
          rank: selectedRank, // ✅ correct payload
        },
      );

      await fetchParticipants(); // ✅ refresh list after update
      setModalOpen(false); // close modal after success
      setSelectedRank(null); // close modal after success
      toast.success("Challenge participant rank updated");
    } catch (error) {
      console.error("Error updating rank:", error);
      toast.error(error.response?.data?.errors);
    }
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
                {(userRole === "CLUB_MANAGER" ||
                  userRole === "FITNESS_MANAGER" ||
                  userRole === "ADMIN") && (
                  <th className="px-2 py-4 min-w-[130px]">Action</th>
                )}
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
                    <td className="px-2 py-4">{item?.membership_number}</td>
                    <td className="px-2 py-4">{item?.member_name}</td>
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
                      {item?.joined_at ? formatAutoDate(item?.joined_at) : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {item?.challenge_type
                        ? formatText(item?.challenge_type)
                        : "--"}
                    </td>
                    <td className="px-2 py-4">
                      {item?.target_value} {item?.target_unit}
                    </td>
                    <td className="px-2 py-4">
                      {item?.challenge_type === "CUSTOM"
                        ? item?.rank === 0
                          ? "N/A"
                          : item?.rank
                        : item?.current_rank}
                    </td>
                    {(userRole === "CLUB_MANAGER" ||
                      userRole === "FITNESS_MANAGER" ||
                      userRole === "ADMIN") && (
                      <td className="px-2 py-4">
                        {item?.challenge_type === "CUSTOM" ? (
                          <Select
                            options={actionOptions}
                            onChange={(selectedOption) =>
                              handleActionChange(selectedOption, item?.id)
                            }
                            placeholder="Select Action"
                            styles={customStyles}
                            menuPortalTarget={document.body} // Ensures the dropdown is rendered in the body
                            isDisabled={item?.rank !== 0}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                    )}
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
