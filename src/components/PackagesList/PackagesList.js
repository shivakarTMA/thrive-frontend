import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreatePackage from "./CreatePackage";
import { authAxios } from "../../config/config";
import { IoIosSearch } from "react-icons/io";
import Pagination from "../common/Pagination";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import { customStyles, formatText } from "../../Helper/helper";

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
      const res = await authAxios().get("/service/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      console.log(activeService, "activeService");
      setService(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch service");
    }
  };

  const serviceOptions =
    service
      ?.map((item) => ({
        label: item.name,
        value: item.id,
        type: item.type,
      }))
      .filter((item) => item.type !== "PRODUCT") || [];

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

      const res = await authAxios().get("/package/list", { params });
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
    return service?.type || null;
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
          }),
        service_id: Yup.number().required("Service is required"),
        club_id: Yup.number().required("Club is required"),
        session_level: Yup.string().required("Level is required"),
        name: Yup.string().required("Name is required"),
        caption:
          formik.values.service_id === 1
            ? Yup.string() // not required if editing
            : Yup.string().required("Caption is required"),
        tags: Yup.string().required("Tags is required"),

        // trainer_id: Yup.string().required("Staff is required"),
        position: Yup.string().required("Position is required"),
        // status: editingOption
        //   ? Yup.string() // not required if editing
        //   : Yup.string().required("Status is required"),
        description: Yup.string().required("Description is required"),
      };

      if (service_type === "GROUP_CLASS") {
        schema = {
          ...schema,
          package_category_id: Yup.number().required("Category is required"),
          start_date: Yup.string().required("Start Date is required"),
          start_time: Yup.string().required("Start Time is required"),
          end_time: Yup.string().required("End Time is required"),
          max_capacity: Yup.string().required("Max Capacity is required"),
          earn_coin: Yup.number()
            .typeError("Earn Coins must be a number")
            .required("Earn Coins is required"),
          waitlist_capacity: Yup.string().required(
            "Waitlist Capacity is required"
          ),
          is_featured: Yup.string().required("Featured Event is required"),
        };
      }

      if (service_type !== "RECOVERY") {
        schema = {
          ...schema,

          booking_type: Yup.string()
            .oneOf(["PAID", "FREE"])
            .required("Booking Type is required"),

          amount: Yup.number()
            .typeError("Amount must be a number")
            .when("booking_type", {
              is: "PAID",
              then: (schema) => schema.required("Amount is required"),
              otherwise: (schema) => schema.nullable(),
            }),

          discount: Yup.number()
            .typeError("Discount must be a number")
            .when("booking_type", {
              is: "PAID",
              then: (schema) => schema.required("Discount is required"),
              otherwise: (schema) => schema.nullable(),
            }),

          gst: Yup.number()
            .typeError("GST must be a number")
            .when("booking_type", {
              is: "PAID",
              then: (schema) => schema.required("GST is required"),
              otherwise: (schema) => schema.nullable(),
            }),
        };
      }

      if (
        service_type === "RECREATION" ||
        service_type === "PERSONAL_TRAINER"
      ) {
        schema = {
          ...schema,
          session_duration: Yup.number().required(
            "Session duration is required"
          ),
          session_validity: Yup.number().required("Validity is required"),
          no_of_sessions: Yup.number().required("No. of Sessions is required"),
        };
      }
      if (service_type === "RECOVERY" || service_type === "GROUP_CLASS") {
        schema = {
          ...schema,
          studio_id: Yup.string().required("Studio is required"),
        };
      }
      if (service_type === "PERSONAL_TRAINER") {
        schema = {
          ...schema,
          buddy_pt: Yup.string().required("PT Type is required"),
          earn_coin: Yup.number()
            .typeError("Earn Coins must be a number")
            .required("Earn Coins is required"),
        };
      }

      if (service_type === "RECOVERY") {
        schema = {
          ...schema,
          variation: Yup.array().of(
            Yup.object({
              name: Yup.string().required("Name is required"),
              image: Yup.mixed()
                .required("Image is required")
                .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
                  if (!value || typeof value === "string") return true;
                  return ["image/jpeg", "image/png", "image/webp"].includes(
                    value.type
                  );
                }),
              recovery_goals: Yup.string().required(
                "Recovery Goals are required"
              ),
              caption: Yup.string().required("Caption is required"),
              description: Yup.string().required("Description is required"),
              no_of_sessions: Yup.number()
                .typeError("No. of Sessions must be a number")
                .required("No. of Sessions is required"),
              session_duration: Yup.number()
                .typeError("Session Duration must be a number")
                .required("Session Duration is required"),
              amount: Yup.number()
                .typeError("Amount must be a number")
                .required("Amount is required"),
              discount: Yup.number()
                .typeError("Discount must be a number")
                .required("Discount is required"),
              gst: Yup.number()
                .typeError("GST must be a number")
                .required("GST is required"),
              earn_coin: Yup.number()
                .typeError("Earn Coins must be a number")
                .required("Earn Coins is required"),
              session_validity: Yup.string().required("Validity is required"),
              position: Yup.number()
                .typeError("Position must be a number")
                .required("Position is required"),
            })
          ),
        };
      }

      return Yup.object(schema);
    });

  const initialValues = {
    name: "",
    service_id: "",
    buddy_pt: "",
    club_id: null,
    studio_id: null,
    package_category_id: "",
    caption: "",
    description: "",
    image: null,
    session_level: "",
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
    earn_coin: "",
    position: "",
    hsn_sac_code: "",
    is_featured: "",
    equipment: "",
    status: "",
    variation: [
      {
        name: "",
        image: "",
        recovery_goals: "",
        caption: "",
        description: "",
        no_of_sessions: "",
        session_duration: "",
        session_validity: "",
        amount: "",
        discount: "",
        gst: "",
        earn_coin: "",
        position: "",
      },
    ],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(serviceOptions),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      console.log(values, "values");
      try {
        const formData = new FormData();

        Object.keys(values).forEach((key) => {
          if (key === "image" && typeof values.image === "string") return;
          if (key === "variation") return; // IMPORTANT → variation handled separately
          formData.append(key, values[key]);
        });

        if (values.image instanceof File) {
          formData.append("file", values.image);
        }

        // Auto set booking type
        if (getServiceType(values.service_id, serviceOptions) === "RECOVERY") {
          formik.setFieldValue("booking_type", "PAID");
        }

        let packageId = editingOption;

        // -------------------------------------
        // ✅ CREATE PACKAGE
        // -------------------------------------
        if (!editingOption) {
          const res = await authAxios().post("/package/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          packageId = res.data?.data?.id;

          // CREATE ALL VARIATIONS
          for (const v of values.variation) {
            await createPackageVariation(packageId, v);
          }

          toast.success("Package Created Successfully");
        }

        // -------------------------------------
        // ✅ UPDATE PACKAGE
        // -------------------------------------
        else {
          await authAxios().put(`/package/${editingOption}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          // UPDATE ALL VARIATIONS
          for (const v of values.variation) {
            if (v.id) {
              await updatePackageFeature(editingOption, v);
            } else {
              await createPackageVariation(editingOption, v);
            }
          }

          toast.success("Package Updated Successfully");
        }

        fetchPackagesList();
        resetForm();
        setEditingOption(null);
        setShowModal(false);
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error(err.response?.data.message);
      }
    },
  });

  const createPackageVariation = async (packageId, variation) => {
    const fd = new FormData();

    fd.append("package_id", packageId);
    fd.append("name", variation.name || "");
    fd.append("recovery_goals", variation.recovery_goals || "");
    fd.append("caption", variation.caption || "");
    fd.append("description", variation.description || "");
    fd.append("no_of_sessions", variation.no_of_sessions || "");
    fd.append("session_duration", variation.session_duration || "");
    fd.append("session_validity", variation.session_validity || "");
    fd.append("amount", variation.amount || "");
    fd.append("discount", variation.discount || "");
    fd.append("gst", variation.gst || "");
    fd.append("position", variation.position || "");
    fd.append("earn_coin", variation.earn_coin || "");

    if (variation.imageFile instanceof File) {
      fd.append("image", variation.imageFile);
    }

    return authAxios().post("/package/variation/create", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const updatePackageFeature = async (packageId, variation) => {
    const fd = new FormData();

    fd.append("package_id", packageId);
    fd.append("name", variation.name || "");
    fd.append("recovery_goals", variation.recovery_goals || "");
    fd.append("caption", variation.caption || "");
    fd.append("description", variation.description || "");
    fd.append("no_of_sessions", variation.no_of_sessions || "");
    fd.append("session_duration", variation.session_duration || "");
    fd.append("session_validity", variation.session_validity || "");
    fd.append("amount", variation.amount || "");
    fd.append("discount", variation.discount || "");
    fd.append("gst", variation.gst || "");
    fd.append("position", variation.position || "");
    fd.append("earn_coin", variation.earn_coin || "");

    if (variation.imageFile instanceof File) {
      fd.append("image", variation.imageFile);
    }

    return authAxios().put(`/package/variation/${variation.id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  useEffect(() => {
    const type = getServiceType(formik.values.service_id, serviceOptions);

    // Common fields reset for both GROUP_CLASS & RECOVERY
    if (type === "RECOVERY") {
      formik.setValues({
        ...formik.values,
        buddy_pt: "",
        no_of_sessions: "",
        session_duration: "",
        session_validity: "",
        booking_type: "PAID",
        amount: "",
        discount: "",
        start_date: "",
        start_time: "",
        end_time: "",
        max_capacity: "",
        waitlist_capacity: "",
        gst: "",
        earn_coin: "",
        // RESET VARIATION ONLY WHEN RECOVERY
        variation:
          type === "RECOVERY"
            ? [
                {
                  name: "",
                  image: "",
                  recovery_goals: "",
                  caption: "",
                  description: "",
                  no_of_sessions: "",
                  session_duration: "",
                  session_validity: "",
                  amount: "",
                  discount: "",
                  gst: "",
                  earn_coin: "",
                  position: "",
                },
              ]
            : formik.values.variation, // keep existing variation for GROUP_CLASS
      });
    }

    if (type === "PERSONAL_TRAINER") {
      formik.setValues({
        ...formik.values,
        studio_id: "",
        package_category_id: "",
        start_date: "",
        start_time: "",
        end_time: "",
        max_capacity: "",
        waitlist_capacity: "",
        is_featured: "",
        variation:
          type === "PERSONAL_TRAINER"
            ? [
                {
                  name: "",
                  image: "",
                  recovery_goals: "",
                  caption: "",
                  description: "",
                  no_of_sessions: "",
                  session_duration: "",
                  session_validity: "",
                  amount: "",
                  discount: "",
                  gst: "",
                  earn_coin: "",
                  position: "",
                },
              ]
            : formik.values.variation,
      });
    }

    if (type === "GROUP_CLASS") {
      formik.setValues({
        ...formik.values,
        buddy_pt: "",
        session_duration: "",
        session_validity: "",
        variation:
          type === "GROUP_CLASS"
            ? [
                {
                  name: "",
                  image: "",
                  recovery_goals: "",
                  caption: "",
                  description: "",
                  no_of_sessions: "",
                  session_duration: "",
                  session_validity: "",
                  amount: "",
                  discount: "",
                  gst: "",
                  earn_coin: "",
                  position: "",
                },
              ]
            : formik.values.variation,
      });
    }
  }, [formik.values.service_id]);

  useEffect(() => {
    if (formik.values.booking_type !== "PAID") {
      formik.setValues({
        ...formik.values,
        amount: "",
        discount: "",
        gst: "",
      });
    }
  }, [formik.values.booking_type]);

  useEffect(() => {
    formik.validateForm();
  }, [formik.values.service_id]);

  // console.log(formik.values, "SHIVAKAR values");
  console.log(formik.errors, "SHIVAKAR ERRORS");
  // console.log(formik.values, "SHIVAKAR values");

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
              placeholder="Search package..."
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
                <th className="px-2 py-4">Booking Type</th>
                <th className="px-2 py-4">Service</th>
                <th className="px-2 py-4 text-center">Position</th>
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
                    <td className="px-2 py-4">{formatText(item?.booking_type)}</td>
                    <td className="px-2 py-4">{formatText(item?.service_name)}</td>
                    <td className="px-2 py-4 text-center">{item.position}</td>
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
