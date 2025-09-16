import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreatePackage from "./CreatePackage";
import { apiAxios, authAxios } from "../../config/config";
import { IoIosSearch } from "react-icons/io";
import Pagination from "../common/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";


const validationSchema = Yup.object({
  studio_id: Yup.string().required("Studio is required"),
  service_id: Yup.string().required("Service is required"),
  staff_id: Yup.string().required("Staff is required"),
  name: Yup.string().required("Name is required"),
  package_type: Yup.string().required("Package type is required"),
  booking_type: Yup.string().required("Booking type is required"),
  status: Yup.string().required("Status is required"),
});

const PackagesList = () => {
  const [showModal, setShowModal] = useState(false);
  const [packages, setPackages] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);
  const [service, setService] = useState([]);
  const [studio, setStudio] = useState([]);
  const [packageCategory, setPackageCategory] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

    // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("SESSION_LEVEL"));
  }, [dispatch]);

  // Extract Redux lists
  const sessionLevel = lists["SESSION_LEVEL"] || [];

  const fetchStaff = async (search = "") => {
    try {
      const res = await apiAxios().get("/staff/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      setStaffList(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };
  const fetchClub = async (search = "") => {
    try {
      const res = await apiAxios().get("/studio/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      setStudio(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };
  const fetchService = async (search = "") => {
    try {
      const res = await apiAxios().get("/service/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      setService(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch service");
    }
  };
  const fetchPackageCategory = async (search = "") => {
    try {
      const res = await apiAxios().get("/package-category/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      // filter only ACTIVE categories
      const activeCategories = data.filter((item) => item.status === "ACTIVE");
      setPackageCategory(activeCategories);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch package category");
    }
  };

  const fetchPackagesList = async (search = searchTerm, currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      // Search param
      if (search) params.search = search;

      const res = await apiAxios().get("/package/list", { params });
      const responseData = res.data;
      const data = responseData?.data || [];
      setPackages(data);

      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchPackagesList();
    fetchService();
    fetchClub();
    fetchStaff();
    fetchPackageCategory();
  }, []);

  const staffListOptions =
    staffList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];
  const studioOptions =
    studio?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];
  const serviceOptions =
    service?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];
  const packageCategoryOptions =
    packageCategory?.map((item) => ({
      label: item.title,
      value: item.id,
    })) || [];

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const initialValues = {
      studio_id: "", // done
      service_id: "", // done
      staff_id: "", // done
      package_category_id: "", // done
      name: "", // done
      caption: "", // done
      description: "", // done
      image: "", // done
      package_type: "", // done
      session_level: "", // done
      no_of_sessions: "", // done
      session_duration: "", // done
      session_validity: "", // done
      start_date: "", // done
      start_time: "", // done
      end_time: "", // done
      max_capacity: "",
      waitlist_capacity: "",
      tags: "", // done
      amount: "", // done
      discount: "", // done
      gst: "", // done
      position: "", // done
      trainer_id: "", // done
      booking_type: "", // done
      status: "ACTIVE", // done
    }

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
          const formData = new FormData();
          Object.keys(values).forEach((key) => {

            // ✅ Skip image key if it is just a string (URL from DB)
            if (key === "image" && typeof values.image === "string") return;

            formData.append(key, values[key]);
          });

        // if file exists, append it (instead of just file name)
        if (values.image instanceof File) {
          formData.append("file", values.image);
        }

        if (editingOption && editingOption.id) {
          // Update
          await authAxios().put(`/package/${editingOption.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Updated Successfully");
        } else {
          // Create
          await authAxios().post("/package/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Created Successfully");
        }

        fetchPackagesList();
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error("Failed to save package");
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
          <p className="text-sm">{`Home > All Packages`}</p>
          <h1 className="text-3xl font-semibold">All Packages</h1>
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
            <FiPlus /> Create Package
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
        <div className="flex items-center gap-2 border rounded-[50px] px-2 bg-white">
          <IoIosSearch className="text-xl" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border-none rounded-[50px] focus:outline-none"
          />
        </div>
      </div>

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
            {packages.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No packages added yet.
                </td>
              </tr>
            ) : (
              packages.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                >
                  {/* <td className="px-2 py-4">{item?.id || "—"}</td> */}
                  <td>
                    <div className="bg-black rounded-lg w-14 h-14 overflow-hidden">
                      <img
                        src={item.image}
                        className="w-full h-full object-contain"
                      />
                    </div>
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
      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        currentDataLength={packages.length}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchPackagesList(searchTerm, newPage);
        }}
      />

      {showModal && (
        <CreatePackage
          setShowModal={setShowModal}
          editingOption={editingOption}
          formik={formik}
          handleOverlayClick={handleOverlayClick}
          leadBoxRef={leadBoxRef}
          serviceOptions={serviceOptions}
          studioOptions={studioOptions}
          staffListOptions={staffListOptions}
          sessionLevel={sessionLevel}
          packageCategoryOptions={packageCategoryOptions}
        />
      )}
    </div>
  );
};

export default PackagesList;
