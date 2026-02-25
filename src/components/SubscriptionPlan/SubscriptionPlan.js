import React, { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Tooltip from "../common/Tooltip";
import { LiaEdit } from "react-icons/lia";
import { FaCircle } from "react-icons/fa6";
import CreateSubscriptionPlan from "./CreateSubscriptionPlan";
import { authAxios } from "../../config/config";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import Pagination from "../common/Pagination";
import { useSelector } from "react-redux";

const SubscriptionPlan = () => {
  const [showModal, setShowModal] = useState(false);
  const [module, setModule] = useState([]);
  const [club, setClub] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const leadBoxRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [planTypeFilter, setPlanTypeFilter] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchClub = async (search = "") => {
    try {
      const res = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      if (statusFilter?.value) {
        data = data.filter((item) => item.status === statusFilter.value);
      }
      const activeOnly = filterActiveItems(data);
      setClub(activeOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  const fetchSubscription = async (search = searchTerm, currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      // Search param
      if (search) params.search = search;

      if (statusFilter?.value) {
        params.status = statusFilter.value;
      }
      if (planTypeFilter?.value) {
        params.plan_type = planTypeFilter.value;
      }
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      const res = await authAxios().get("/subscription-plan/list", { params });
      const responseData = res.data;
      let data = res.data?.data || res.data || [];

      setModule(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch subscription");
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchClub();
  }, []);

  const clubOptions =
    club?.map((item) => ({
      label: item.name, // Show club name
      value: item.id, // Store club_id as ID
    })) || [];

  // Fetch packages again when search or service filter changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSubscription(searchTerm, 1);
      setPage(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter, clubFilter, planTypeFilter]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      club_id: "",
      duration_type: "",
      duration_value: "",
      booking_type: "",
      plan_type: "",
      hsn_sac_code: "",
      amount: "",
      discount: "",
      gst: "",
      earn_coin: "",
      is_spouse_plan: "",
      status: "",
      position: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      club_id: Yup.string().required("Club is required"),
      duration_type: Yup.string().required("Duration Type is required"),
      // duration_value: Yup.string().required("Duration Value is required"),
      duration_value: Yup.number()
        .typeError("Duration must be a number")
        .required("Duration is required")
        .min(1, "Duration must be greater than 0"),
      // booking_type: Yup.string().required("Booking Type is required"),
      plan_type: Yup.string().required("Plan Type is required"),
      // amount: Yup.string().required("Amount is required"),
      // discount: Yup.string().required("Discount is required"),
      amount: Yup.number()
        .typeError("Amount must be a number")
        .required("Amount is required")
        .min(0, "Amount cannot be negative"),

      discount: Yup.number()
        .typeError("Discount must be a number")
        .min(0, "Discount cannot be negative")
        .when("amount", (amount, schema) => {
          if (amount === 0) {
            return schema.test(
              "no-discount-when-zero",
              "Discount is not allowed when amount is 0",
              (value) => !value || value === 0,
            );
          }

          return schema
            .required("Discount is required")
            .max(amount, "Discount cannot be greater than amount");
        }),
      gst: Yup.number()
        .typeError("GST must be a number")
        .required("GST is required")
        .min(2, "GST cannot be less than 2%")
        .max(40, "GST cannot be greater than 40%"),
      earn_coin: Yup.string().required("Earn Coins is required"),
      is_spouse_plan: Yup.string().required("Is Spouse Plan is required"),
      status: Yup.string().required("Status is required"),
      position: Yup.number().required("Position is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = { ...values };

        if (editingOption) {
          await authAxios().put(`/subscription-plan/${editingOption}`, payload);
          toast.success("Updated Successfully");
        } else {
          await authAxios().post("/subscription-plan/create", payload);
          toast.success("Created Successfully");
        }

        fetchSubscription();
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error("Failed to save onboarding");
      }

      resetForm();
      setEditingOption(null);
      setShowModal(false);
    },
  });

  useEffect(() => {
    if (club.length > 0 && !clubFilter) {
      setClubFilter({
        label: club[0].name,
        value: club[0].id,
      });
    }
  }, [club]);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > Membership Plans`}</p>
          <h1 className="text-3xl font-semibold">Membership Plans</h1>
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
            <FiPlus /> Create Plan
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
              placeholder="Search plan..."
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
        <div className="w-full max-w-[200px]">
          <Select
            placeholder="Filter by Plan Type"
            options={[
              { value: "DLF", label: "DLF" },
              { value: "NONDLF", label: "Non-DLF" },
            ]}
            value={planTypeFilter}
            onChange={(option) => setPlanTypeFilter(option)}
            isClearable
            styles={customStyles}
          />
        </div>
        <div className="w-fit min-w-[180px]">
          <Select
            placeholder="Filter by club"
            options={clubOptions}
            value={clubFilter}
            onChange={setClubFilter}
            isClearable={userRole === "ADMIN" ? true : false}
            styles={customStyles}
          />
        </div>
      </div>
      <div className="box--shadow bg-white rounded-[15px] p-4">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4 min-w-[130px]">Title</th>
                <th className="px-2 py-4 min-w-[150px]">Description</th>
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">Duration</th>
                {/* <th className="px-2 py-4 min-w-[110px]">Booking Type</th> */}
                <th className="px-2 py-4 min-w-[100px]">Amount</th>
                <th className="px-2 py-4 min-w-[100px]">Discount</th>
                <th className="px-2 py-4 min-w-[110px]">Total Amount</th>
                <th className="px-2 py-4 min-w-[90px]">GST</th>
                <th className="px-2 py-4 min-w-[100px]">GST Amount</th>
                <th className="px-2 py-4 min-w-[110px]">Final Amount</th>
                <th className="px-2 py-4 min-w-[100px]">Plan Type</th>
                <th className="px-2 py-4 min-w-[100px]">Status</th>
                <th className="px-2 py-4 min-w-[80px] text-center">Position</th>
                <th className="px-2 py-4 min-w-[80px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {module.length === 0 ? (
                <tr>
                  <td colSpan="15" className="text-center py-4">
                    No membership plans found.
                  </td>
                </tr>
              ) : (
                module.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group bg-white border-b hover:bg-gray-50 relative transition duration-700"
                  >
                    {/* <td className="px-2 py-4">{item?.id || "—"}</td> */}
                    <td className="px-2 py-4">{item?.title}</td>
                    <td className="px-2 py-4">
                      {item?.description ? item?.description : "--"}
                    </td>
                    <td className="px-2 py-4">{item?.club_name}</td>
                    <td className="px-2 py-4">
                      {item?.duration_value} {item?.duration_type}
                    </td>
                    {/* <td className="px-2 py-4">{item?.booking_type}</td> */}
                    <td className="px-2 py-4">₹{item?.amount}</td>
                    <td className="px-2 py-4">₹{item?.discount}</td>
                    <td className="px-2 py-4">₹{item?.total_amount}</td>
                    <td className="px-2 py-4">{item?.gst}%</td>
                    <td className="px-2 py-4">₹{item?.gst_amount}</td>
                    <td className="px-2 py-4">₹{item?.final_amount}</td>
                    <td className="px-2 py-4">{item?.plan_type}</td>
                    <td className="px-2 py-4">
                      <div
                        className={`flex gap-1 items-center ${item?.status === "ACTIVE"
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
                    <td className="px-2 py-4 text-center">{item?.position}</td>
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
                              setEditingOption(item?.id);
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
          currentDataLength={module.length}
          onPageChange={(newPage) => {
            setPage(newPage);
            fetchSubscription(searchTerm, newPage);
          }}
        />
      </div>

      {showModal && (
        <CreateSubscriptionPlan
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

export default SubscriptionPlan;
