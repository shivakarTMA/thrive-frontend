import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateOnBoardingScreen from "./CreateOnBoardingScreen";
import { authAxios } from "../../config/config";
import { customStyles } from "../../Helper/helper";
import Select from "react-select";

const OnBoardingScreen = () => {
  const [showModal, setShowModal] = useState(false);
  const [module, setModule] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const leadBoxRef = useRef(null);

  const fetchOnBoardingScreen = async (search = "") => {
    try {
      const params = {
        ...(search ? { search } : {}),
      };
      if (statusFilter) {
        params.status = statusFilter.value;
      }

      const res = await authAxios().get("/onboarding-screen/list", { params });
      let data = res.data?.data || res.data || [];
      setModule(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchOnBoardingScreen();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOnBoardingScreen(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      screen_image: "",
      position: null,
      status: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      screen_image: Yup.string().required("Screen image is required"),
      position: Yup.number().required("Position is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("position", values.position);
        formData.append("status", values.status);

        // if file exists, append it (instead of just file name)
        if (values.screen_imageFile instanceof File) {
          formData.append("file", values.screen_imageFile);
        }

        if (editingOption && editingOption.id) {
          // Update
          await authAxios().put(
            `/onboarding-screen/${editingOption.id}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
          toast.success("Updated Successfully");
        } else {
          // Create
          await authAxios().post("/onboarding-screen/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        fetchOnBoardingScreen();
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error("Failed to save onboarding");
      }

      resetForm();
      setEditingOption(null);
      setShowModal(false);
    },
  });

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > All On Boarding`}</p>
          <h1 className="text-3xl font-semibold">All On Boarding</h1>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            onClick={() => {
              setEditingOption(null);
              formik.resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Create On Boarding
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or mobile"
            className="custom--input w-full max-w-[210px]"
          />
          <div className="w-full max-w-[200px]">
            <Select
              placeholder="Filter by status"
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
              ]}
              value={statusFilter}
              onChange={(option) => setStatusFilter(option)}
              isClearable
              styles={customStyles}
            />
          </div>
        </div>
      </div>

      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {/* <th className="px-2 py-4">Module ID</th> */}
                <th className="px-2 py-4">Image</th>
                <th className="px-2 py-4">Title</th>
                <th className="px-2 py-4">Position</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {module.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No boarding added yet.
                  </td>
                </tr>
              ) : (
                module.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    {/* <td className="px-2 py-4">{item?.id || "—"}</td> */}
                    <td className="px-2 py-4">
                      <div className="bg-black rounded-lg w-14 h-14 overflow-hidden">
                        {item.screen_image ? (
                          <img
                            src={item.screen_image}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          "--"
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-4">{item?.title}</td>
                    <td className="px-2 py-4">{item.position}</td>
                    <td className="px-2 py-4">
                      <div
                        className={`flex gap-1 items-center ${
                          item?.status === "ACTIVE"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <FaCircle />
                        {item?.status
                          ? item.status.charAt(0) +
                            item.status.slice(1).toLowerCase()
                          : ""}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <div className="w-fit">
                        <Tooltip
                          id={`tooltip-edit-${item.id || index}`}
                          content="Edit Club"
                          place="left"
                        >
                          <div
                            className="p-1 cursor-pointer"
                            onClick={() => {
                              setEditingOption(item);
                              formik.setValues(item);
                              setShowModal(true);
                            }}
                          >
                            <LiaEdit className="text-[25px] text-black" />
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
      </div>

      {showModal && (
        <CreateOnBoardingScreen
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
        />
      )}
    </div>
  );
};

export default OnBoardingScreen;
