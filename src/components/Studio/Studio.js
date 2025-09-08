import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateStudio from "./CreateStudio";
import { apiAxios } from "../../config/config";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";

const Studio = () => {
  const [showModal, setShowModal] = useState(false);
  const [module, setModule] = useState([]);
  const [club, setClub] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const [file, setFile] = useState(null);

  const fetchClub = async (search = "") => {
    try {
      const res = await apiAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      if (statusFilter?.value) {
        data = data.filter((item) => item.status === statusFilter.value);
      }
      setClub(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  const fetchStudio = async (search = "") => {
    try {
      const res = await apiAxios().get("/studio/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      if (statusFilter?.value) {
        data = data.filter((item) => item.status === statusFilter.value);
      }
      setModule(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchStudio();
    fetchClub();
  }, []);

  const clubOptions = club?.map(item => ({
    label: item.name,  // Show club name
    value: item.id     // Store club_id as ID
  })) || [];

  console.log(clubOptions,'clubOptions')


  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStudio(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  console.log(searchTerm, "searchTerm");

  const formik = useFormik({
    initialValues: {
      name: "",
      club_id: "",
      position: null,
      status: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Title is required"),
      club_id: Yup.string().required("Club is required"),
      position: Yup.number().required("Position is required"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {

        const payload = { ...values };

       if (editingOption && editingOption.id) {
            await apiAxios().put(`/studio/${editingOption.id}`, payload);
            toast.success("Updated Successfully");
          } else {
            await apiAxios().post("/studio/create", payload);
            toast.success("Created Successfully");
          }

        fetchStudio();
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
          <p className="text-sm">{`Home > All Studio`}</p>
          <h1 className="text-3xl font-semibold">All Studio</h1>
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
              <FiPlus /> Create Studio
            </button>
          </div>
        
      </div>

      <div className="flex gap-3 mb-4">
        <div className="mb-4 w-full max-w-[250px]">
          <div className="relative">
            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
              <IoSearchOutline />
            </span>
            <input
              type="text"
              placeholder="Search on Splash Screen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom--input w-full input--icon"
            />
          </div>
        </div>
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Status"
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

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {/* <th className="px-2 py-4">Module ID</th> */}
              <th className="px-2 py-4">Club Name</th>
              <th className="px-2 py-4">Name</th>
              <th className="px-2 py-4">Position</th>
              <th className="px-2 py-4">Status</th>
              <th className="px-2 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {module.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No Studio added yet.
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
                    {item?.club_name}
                  </td>
                  <td className="px-2 py-4">{item?.name}</td>
                  <td>{item.position}</td>
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

      {showModal && (
        <CreateStudio
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          clubOptions={clubOptions}
        />
      )}
    </div>
  );
};

export default Studio;
