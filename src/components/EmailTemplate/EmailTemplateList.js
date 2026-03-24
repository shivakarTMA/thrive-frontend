import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { authAxios } from "../../config/config";
import { Link } from "react-router-dom";
import editIcon from "../../assets/images/icons/edit.svg";
import deleteIcon from "../../assets/images/icons/delete.svg";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
} from "../../Helper/helper";
import { useSelector } from "react-redux";
import Pagination from "../common/Pagination";
import Select from "react-select";

const EmailTemplateList = () => {
  const [emailTemplateData, setEmailTemplateData] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Function to fetch club list
  const fetchClub = async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClubList(activeOnly);
    } catch (error) {
      console.log(error)
    }
  };
  // Function to fetch role list

  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const fetchEmailTemplate = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      const response = await authAxios().get("/emailtemplate/list", { params });
      const data = response.data?.data || [];
      setEmailTemplateData(data);
      setPage(response.data?.currentPage || 1);
      setTotalPages(response.data?.totalPage || 1);
      setTotalCount(response.data?.totalCount || data.length);
    } catch (err) {
      console.error(err);
    }
  };

  // Initial fetch
  useEffect(() => {
    setPage(1);
    fetchEmailTemplate(1);
  }, [clubFilter]);

  const handleConfirmDelete = async () => {
    const exerciesID = selectedDeleteId?.id;
    if (!exerciesID) return;

    try {
      await authAxios().delete(`/emailtemplate/${exerciesID}`);
      toast.success("Email template deleted successfully");
      fetchEmailTemplate();
    } catch (error) {
      console.error(error);
    } finally {
      setShowDeleteModal(false);
      setSelectedDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setSelectedDeleteId(null);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="page--content">
        <div className="flex items-end justify-between gap-2 mb-6">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home >  Marketing >  Templates > Email Templates`}</p>
            <h1 className="text-3xl font-semibold">Email Templates</h1>
          </div>
          <div className="flex items-end gap-2">
            <Link
              to="/email-template"
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            >
              <FiPlus /> Create Template
            </Link>
          </div>
        </div>

        {/* Filter section */}
        <div className="flex gap-3 mb-4">
          <div className="w-full max-w-[200px]">
            <Select
              placeholder="Filter by Club"
              value={clubFilter}
              options={clubOptions}
              onChange={(option) => setClubFilter(option)}
              styles={customStyles}
              isClearable={userRole === "ADMIN" ? true : false}
            />
          </div>
        </div>

        <div className="box--shadow bg-white rounded-[15px] p-4">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-2 py-4">Club Name</th>
                  <th className="px-2 py-4">Template Name</th>
                  <th className="px-2 py-4">Subject</th>
                  <th className="px-2 py-4">Date Created</th>
                  <th className="px-2 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {emailTemplateData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No added yet.
                    </td>
                  </tr>
                ) : (
                  emailTemplateData.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                    >
                      <td className="px-2 py-4">{item?.clubname}</td>
                      <td className="px-2 py-4">{item?.name}</td>
                      <td className="px-2 py-4">{item?.subject}</td>
                      <td className="px-2 py-4">
                        {formatAutoDate(item?.createdAt)}
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex">
                          <Tooltip
                            id={`tooltip-edit-${item.id}`}
                            content="Edit Template"
                            place="left"
                          >
                            <Link
                              to={`/email-template/${item?.id}`}
                              className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-l-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                            >
                              <img src={editIcon} />
                            </Link>
                          </Tooltip>
                          <Tooltip
                            id={`tooltip-delete-${item.id}`}
                            content="Delete Template"
                            place="left"
                          >
                            <div
                              className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-r-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer`}
                              onClick={() => {
                                setSelectedDeleteId(item);
                                setShowDeleteModal(true);
                              }}
                            >
                              <img src={deleteIcon} />
                            </div>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            currentDataLength={emailTemplateData.length}
            onPageChange={(newPage) => {
              setPage(newPage);
              fetchEmailTemplate(newPage);
            }}
          />
        </div>
      </div>
      {showDeleteModal && selectedDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 py-6 rounded shadow-lg text-center max-w-md w-full">
            <p className="mb-2 text-lg font-semibold">
              Are you sure you want to delete this email template?
            </p>
            <p className="mb-4 text-[12px] font-[500]">
              This email template will be permanently removed.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmDelete}
                className="bg-black text-white px-4 py-2 rounded max-w-[100px] w-full"
              >
                Yes
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-300 text-black px-4 py-2 rounded max-w-[100px] w-full"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailTemplateList;
