import React, { useEffect, useState } from "react";
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
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";

const PackagesList = () => {
  const [showModal, setShowModal] = useState(false);
  const [packages, setPackages] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const [service, setService] = useState([]);
  const [serviceFilter, setServiceFilter] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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

  const serviceOptions =
    service?.map((item) => ({
      label: item.name,
      value: item.id,
      service_type: item.service_type,
    })) || [];

  const fetchPackagesList = async (search = searchTerm, currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      // Search param
      if (search) params.search = search;

      if (serviceFilter?.value) {
        params.service_id = serviceFilter.value;
      }

      const res = await apiAxios().get("/package/list", { params });
      const responseData = res.data;
      const data = responseData?.data || [];

      setPackages(data);

      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Package not found");
    }
  };

  // Fetch packages again when search or service filter changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPackagesList(searchTerm, 1);
      setPage(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, serviceFilter]);

  // Initial fetch
  useEffect(() => {
    fetchPackagesList();
    fetchService();
  }, []);

  const getServiceType = (service_id, serviceOptions) => {
    const service = serviceOptions.find((s) => s.value === service_id);
    return service?.service_type || null;
  };

  const getValidationSchema = (serviceOptions) =>
    Yup.lazy((values) => {
      const service_type = getServiceType(values.service_id, serviceOptions);

      let schema = {
        image: Yup.mixed()
          .required("Image is required")
          .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
            if (!value || typeof value === "string") return true;
            return ["image/jpeg", "image/png", "image/webp"].includes(
              value.type
            );
          })
          .test("fileSize", "Max file size is 2 MB", (value) => {
            if (!value || typeof value === "string") return true;
            return value.size <= 2 * 1024 * 1024;
          }),
        service_id: Yup.number().required("Service is required"),
        name: Yup.string().required("Name is required"),
        caption: Yup.string().required("Caption is required"),
        tags: Yup.string().required("Tags is required"),
        studio_id: Yup.string().required("Studio is required"),
        start_date: Yup.string().required("Start Date is required"),
        start_time: Yup.string().required("Start Time is required"),
        booking_type: Yup.string().required("Booking Type is required"),
        trainer_id: Yup.string().required("Staff is required"),
        hsn_sac_code: Yup.string().required("HSC SAC Code is required"),
        position: Yup.string().required("Position is required"),
        status: editingOption
          ? Yup.string() // not required if editing
          : Yup.string().required("Status is required"),
        description: Yup.string().required("Description is required"),
      };

      if (service_type === "CLASS") {
        schema = {
          ...schema,
          package_category_id: Yup.number().required("Category is required"),
        };

        if (values.booking_type === "Yes") {
          schema.amount = Yup.number().required("Amount is required");
          schema.gst = Yup.number().required("GST is required");
          schema.thrive_coins = Yup.number().required("Thrive coins required");
        }
      }

      // if (service_type === "SESSION") {
      //   schema = {
      //     ...schema,
      //     number_of_session: Yup.string().required(
      //       "Number of session is required"
      //     ),
      //     session_duration: Yup.number().required(
      //       "Session duration is required"
      //     ),
      //     session_level: Yup.string().required("Session level is required"),
      //     session_validity: Yup.number().required("Validity is required"),
      //     session_list: Yup.array().of(
      //       Yup.object().shape({
      //         no_of_sessions: Yup.number().required("No of sessions").min(1),
      //         session_duration: Yup.number()
      //           .required("Duration required")
      //           .min(1),
      //         amount: Yup.number().required("Amount required").min(0),
      //         thrive_coins: Yup.number()
      //           .required("Thrive coins required")
      //           .min(0),
      //         gst: Yup.number().required("GST required").min(0),
      //       })
      //     ),
      //   };
      // }

      return Yup.object(schema);
    });

  const initialValues = {
    name: "",
    service_id: "",
    studio_id: null,
    package_category_id: "",
    caption: "",
    description: "",
    image: null,
    session_level: null,
    no_of_sessions: "",
    session_duration: "",
    session_validity: "",
    start_date: "",
    start_time: "",
    end_time: "",
    max_capacity: "",
    waitlist_capacity: "",
    tags: "",
    amount: "",
    discount: "",
    booking_type: "",
    gst: "",
    position: "",
    hsn_sac_code: "",
    is_featured: "",
    trainer_id: null,
    status: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(serviceOptions),
    validateOnChange: true,
    validateOnBlur: true,
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

        if (editingOption && editingOption) {
          // Update
          await authAxios().put(`/package/${editingOption}`, formData, {
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

  useEffect(() => {
    formik.validateForm();
  }, [formik.values.service_id]);


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
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="mb-4 w-full max-w-[250px]">
          <div className="relative">
            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
              <IoSearchOutline />
            </span>
            <input
              type="text"
              placeholder="Search Package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom--input w-full input--icon"
            />
          </div>
        </div>
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Service"
            options={serviceOptions}
            value={serviceFilter}
            onChange={(option) => setServiceFilter(option)}
            isClearable
            styles={customStyles}
          />
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
                          id={`tooltip-edit-${item.id}`}
                          content="Edit Club"
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
      </div>
      {showModal && (
        <CreatePackage
          setShowModal={setShowModal}
          editingOption={editingOption}
          serviceOptions={serviceOptions}
          formik={formik}
        />
      )}
    </div>
  );
};

export default PackagesList;
