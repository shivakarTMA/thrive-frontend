import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import ChallengeForm from "./ChallengeForm";
import { formatAutoDate } from "../../Helper/helper";
import { apiAxios } from "../../config/config";
import { toast } from "react-toastify";
import Pagination from "../common/Pagination";

const ChallengeList = () => {
  const [showModal, setShowModal] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [editingOption, setEditingOption] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchChallengeList = async () => {
    try {
      const res = await apiAxios().get(`/challenge/list`);
      const data = res.data?.data || [];
      setChallenges(data);
      setPage(res.data?.currentPage || 1);
      setTotalPages(res.data?.totalPage || 1);
      setTotalCount(res.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch exercises");
    }
  };

  useEffect(() => {
    fetchChallengeList();
  }, []);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All Challenges`}</p>
          <h1 className="text-3xl font-semibold">All Challenges</h1>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          onClick={() => {
            setEditingOption(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Create Challenge
        </button>
      </div>
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">ID</th>
                <th className="px-2 py-4">Image</th>
                <th className="px-2 py-4">Name</th>
                <th className="px-2 py-4">Goal</th>
                <th className="px-2 py-4">Start Dates</th>
                <th className="px-2 py-4">End Dates</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {challenges.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No challenge added yet.
                  </td>
                </tr>
              ) : (
                challenges.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{index + 1}</td>
                    <td className="px-2 py-4">
                      <div className="bg-black rounded-lg w-14 h-14 overflow-hidden">
                        <img
                          src={item?.image}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-4">{item?.title}</td>
                    <td className="px-2 py-4">{item?.goal}</td>
                    <td className="px-2 py-4">{formatAutoDate(item.start_date)}</td>
                    <td className="px-2 py-4">{formatAutoDate(item.end_date)}</td>
                    <td className="px-2 py-4">
                      <Tooltip
                        id={`tooltip-edit-${item.id}`}
                        content="Edit Challenge"
                        place="left"
                      >
                        <div
                          className="p-1 cursor-pointer"
                          onClick={() => {
                            setEditingOption(item.id);
                            setShowModal(true);
                          }}
                        >
                          <LiaEdit className="text-[25px] text-black" />
                        </div>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          currentDataLength={challenges.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchChallengeList(newPage);
          }}
        />
      </div>

      {showModal && (
        <ChallengeForm
          setShowModal={setShowModal}
          editingOption={editingOption}
          onChallengeCreated={fetchChallengeList}
        />
      )}
    </div>
  );
};

export default ChallengeList;
