import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import ChallengeForm from "./ChallengeForm";
import { formatAutoDate } from "../../Helper/helper";
import { apiAxios } from "../../config/config";
import { toast } from "react-toastify";
import Pagination from "../common/Pagination";
import { useFormik } from "formik";
import * as Yup from "yup";

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
      const res = await apiAxios().get(`/challenge/list`, { params });
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
      title: "",
      caption: "",
      description: "",
      image: "",
      goal: "",
      start_date: "",
      end_date: "",
      condition: "",
      reward_first: "",
      reward_second: "",
      reward_third: "",
      about_challenge: "",
      position: "",
      status: "UPCOMING",
      join_in_between: null,
    },

    // Define validation schema using Yup
    validationSchema: Yup.object({
      // image: Yup.mixed().required("Image is required"),
      title: Yup.string().required("Challenge title is required"),
      caption: Yup.string().required("Caption is required"),
      description: Yup.string().required("Description is required"),
      goal: Yup.string().required("Goal is required"),
      start_date: Yup.date().required("Start date is required"),
      end_date: Yup.date()
        .min(Yup.ref("start_date"), "End date cannot be before start date")
        .required("End date is required"),
      condition: Yup.string().required("Condition is required"),
      reward_first: Yup.number()
        .typeError("Must be a number")
        .positive("Must be positive")
        .required("First reward is required"),
      reward_second: Yup.number()
        .typeError("Must be a number")
        .positive("Must be positive")
        .required("Second reward is required"),
      reward_third: Yup.number()
        .typeError("Must be a number")
        .positive("Must be positive")
        .required("Third reward is required"),
      about_challenge: Yup.string().required("About challenge is required"),
      position: Yup.string().required("Position is required"),
    }),

    // Handle form submission
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        // ✅ Convert dates to YYYY-MM-DD format
        const startDate = values.start_date
          ? new Date(values.start_date).toISOString().split("T")[0]
          : "";
        const endDate = values.end_date
          ? new Date(values.end_date).toISOString().split("T")[0]
          : "";

        // ✅ Append all fields safely
        Object.keys(values).forEach((key) => {
          if (key === "image") {
            // append only if it's a File object
            if (values.image instanceof File) {
              formData.append("image", values.image);
            }
          } else if (key === "join_in_between") {
            // boolean -> string for backend
            formData.append(
              "join_in_between",
              values.join_in_between ? "true" : "false"
            );
          } else if (key === "start_date") {
            formData.append("start_date", startDate);
          } else if (key === "end_date") {
            formData.append("end_date", endDate);
          } else {
            formData.append(key, values[key]);
          }
        });

        // ✅ Send to API
        if (editingOption) {
          await apiAxios().put(`/challenge/${editingOption}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Challenge updated successfully!");
        } else {
          await apiAxios().post("/challenge/create", formData, {
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
                <th className="px-2 py-4">Challenge Type</th>
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
                    <td className="px-2 py-4">{item?.name}</td>
                    <td className="px-2 py-4">{item?.challenge_type}</td>
                    <td className="px-2 py-4">
                      {formatAutoDate(item.start_date_time)}
                    </td>
                    <td className="px-2 py-4">
                      {formatAutoDate(item.end_date_time)}
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
