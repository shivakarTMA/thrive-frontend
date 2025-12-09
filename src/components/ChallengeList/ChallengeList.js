import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import ChallengeForm from "./ChallengeForm";
import { formatDateTimeLead, formatText } from "../../Helper/helper";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import Pagination from "../common/Pagination";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaCircle } from "react-icons/fa";

const statusColors = {
  ACTIVE: "bg-[#D1FADF] text-[#027A48]", // green
  COMPLETED: "bg-[#E8FFE6] text-[#138808]", // darker green
  INACTIVE: "bg-[#FFE4E4] text-[#880808]", // red
  ONGOING: "bg-[#FFF2CC] text-[#AD7B00]", // yellow
  UPCOMING: "bg-[#e7edfc] text-[#156ec1]", // blue
};

const ChallengeList = () => {
  const [showModal, setShowModal] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [editingOption, setEditingOption] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchChallengeList = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      const res = await authAxios().get(`/challenge/list`, { params });
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

  const formik = useFormik({
    initialValues: {
      club_id: "",
      name: "",
      caption: "",
      image: "",
      condition: "[]",
      description: "",
      challenge_type: "",
      start_date_time: "",
      duration_days: "",
      end_date_time: "",
      frequency: "",
      target_value: "",
      target_unit: "",
      reward_first: "",
      reward_second: "",
      reward_third: "",
      about_challenge: "",
      join_in_between: null,
      position: "",
      // status: "UPCOMING",
    },

    validationSchema: Yup.object({
      club_id: Yup.string().required("Club is required"),
      image: Yup.string().required("Image is required"),
      name: Yup.string().required("Challenge Name is required"),
      caption: Yup.string().required("Caption is required"),
      condition: Yup.string()
  .test("is-json-array", "Please add at least one rule", (value) => {
    try {
      const arr = JSON.parse(value);
      return Array.isArray(arr) && arr.length > 0;
    } catch {
      return false;
    }
  })
  .required("Terms of play is required"),
      description: Yup.string().required("Description is required"),
      challenge_type: Yup.string().required("Challenge Type is required"),
      start_date_time: Yup.date().required("Start date & time is required"),
      end_date_time: Yup.date()
        .min(Yup.ref("start_date_time"), "End date cannot be before start date")
        .required("End date & time is required"),
      frequency: Yup.string().required("Frequency is required"),
      target_value: Yup.string().required("Target value is required"),
      target_unit: Yup.string().required("Target unit is required"),
      reward_first: Yup.number()
        .positive()
        .required("First reward is required"),
      reward_second: Yup.number()
        .positive()
        .required("Second reward is required"),
      reward_third: Yup.number()
        .positive()
        .required("Third reward is required"),
      about_challenge: Yup.string().required(
        "Challenge Essentials is required"
      ),
      position: Yup.string().required("Position is required"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        // Append every field correctly
        Object.keys(values).forEach((key) => {
          if (key === "imageFile") {
            // file upload
            if (values.imageFile instanceof File) {
              formData.append("image", values.imageFile);
            }
          } else if (typeof values[key] === "boolean") {
            formData.append(key, values[key] ? "true" : "false");
          } else {
            formData.append(key, values[key]);
          }
        });

        if (editingOption) {
          await authAxios().put(`/challenge/${editingOption}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Challenge updated successfully!");
        } else {
          await authAxios().post("/challenge/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Challenge created successfully!");
        }

        resetForm();
        setShowModal(false);
        fetchChallengeList();
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Error submitting form:", error.response || error);
      }
    },
  });

  useEffect(() => {
    const { start_date_time, end_date_time } = formik.values;

    if (start_date_time && end_date_time) {
      const start = new Date(start_date_time);
      const end = new Date(end_date_time);

      const diffMs = end - start;
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Auto-set duration_days
      if (!isNaN(days)) {
        formik.setFieldValue("duration_days", days);
      }
    }
  }, [formik.values.start_date_time, formik.values.end_date_time]);

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
                {/* <th className="px-2 py-4">ID</th> */}
                <th className="px-2 py-4">Image</th>
                <th className="px-2 py-4">Name</th>
                <th className="px-2 py-4">Challenge Type</th>
                <th className="px-2 py-4">Start Dates</th>
                <th className="px-2 py-4">End Dates</th>
                <th className="px-2 py-4">Duration</th>
                <th className="px-2 py-4">Status</th>
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
                    {/* <td className="px-2 py-4">{index + 1}</td> */}
                    <td className="px-2 py-4">
                      <div className="bg-black rounded-lg w-14 h-14 overflow-hidden">
                        <img
                          src={item?.image}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-4">{item?.name}</td>
                    <td className="px-2 py-4">
                      {formatText(item?.challenge_type)}
                    </td>
                    <td className="px-2 py-4">
                      {formatDateTimeLead(item.start_date_time)}
                    </td>
                    <td className="px-2 py-4">
                      {formatDateTimeLead(item.end_date_time)}
                    </td>
                    <td className="px-2 py-4">{item?.duration_days} Days</td>
                    <td className="px-2 py-4">
                      <span
                        className={`flex items-center gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit 
                          ${statusColors[item?.status] || "bg-[#EEEEEE]"}`}
                      >
                        <FaCircle className="text-[10px]" />
                        {formatText(item?.status) ?? "--"}
                      </span>
                    </td>
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
          formik={formik}
        />
      )}
    </div>
  );
};

export default ChallengeList;
