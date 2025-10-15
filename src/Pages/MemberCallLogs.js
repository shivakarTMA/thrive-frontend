import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useParams } from "react-router-dom";
import { assignedLeadsData, mockData } from "../DummyData/DummyData";
import PhoneInput from "react-phone-number-input";
import { customStyles } from "../Helper/helper";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../Redux/Reducers/optionListSlice";
import { LuCalendar } from "react-icons/lu";
import { FiClock } from "react-icons/fi";
import { toast } from "react-toastify";
import { apiAxios } from "../config/config";
import MemberContactHistory from "./MemberContactHistory";
import { FaCalendarDays } from "react-icons/fa6";
import { format } from "date-fns";
import { BsExclamationCircle } from "react-icons/bs";
import LeadContactHistory from "./LeadContactHistory";

// Validation schema with conditional required fields
const validationSchema = Yup.object().shape({
  // calledBy: Yup.string().required("Call by is required"),
  call_type: Yup.string().required("Call Type is required"),
  call_status: Yup.string().required("Lead Status is required"),
  remark: Yup.string().required("Discussion is required"),
  not_interested_reason: Yup.string()
    .nullable()
    .when(["call_type", "call_status"], {
      is: (call_type, call_status) =>
        (call_type === "Cross-sell Call" || call_type === "Renewal Call") &&
        call_status === "Not Interested",
      then: (schema) => schema.required("Not Interested Reason is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  follow_up_datetime: Yup.string()
    .nullable()
    .when(["call_type", "call_status"], {
      is: (call_type, call_status) =>
        ([
          "Welcome Call",
          "Induction Call",
          "Upgrade Call",
          "Courtesy Call",
          "Renewal Call",
          "Birthday Call",
          "Payment Call",
          "Cross-sell Call",
          "Feedback call",
          "Assessment Call",
          "Anniversary Call",
          "Irregular Member",
        ].includes(call_type) ||
          call_type === "Cross-sell Call") &&
        [
          "Callback",
          "No Answer",
          "Switched-off/Out of Reach",
          "Busy Tone",
          "Future Prospect",
        ].includes(call_status),
      then: (schema) => schema.required("Date & Time is required"),
      otherwise: (schema) => schema.nullable(),
    }),
});

const MemberCallLogs = () => {
  const { id } = useParams();
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const action = queryParams.get("action");

  // const dataSource = action === "add-follow-up" ? assignedLeadsData : mockData;

  const [filterStatus, setFilterStatus] = useState("");
  const [enquiryfilterStatus, setEnquiryFilterStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredCallStatus, setFilteredCallStatus] = useState([]);
  const [activeTab, setActiveTab] = useState("Member Logs");
  const [memberDetails, setMemberDetails] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [callDataList, setCallDataList] = useState([]);
  const [editData, setEditData] = useState(null);
  const [memberEnquiry, setMemberEnquiry] = useState([]);

  const now = new Date();
  const minTime = new Date();
  minTime.setHours(6, 0, 0, 0); // Earliest selectable time = 6:00 AM

  const maxTime = new Date();
  maxTime.setHours(22, 0, 0, 0);

  const fetchStaff = async (search = "") => {
    try {
      const res = await apiAxios().get("/staff/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res?.data || [];
      const activeService = data?.filter((item) => item?.status === "ACTIVE");
      setStaffList(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  const fetchMemberEnquiery = async (memberId, filters = {}) => {
    try {

      const params = {};

      if (filters.call_status) params.call_status = filters.call_status;
      if (filters.startDate)
        params.startDate = format(filters.startDate, "yyyy-MM-dd");
      if (filters.endDate)
        params.endDate = format(filters.endDate, "yyyy-MM-dd");

      console.log(params, "params");

      // ✅ Correct way to send params — DO NOT add them inside the URL string
      const res = await apiAxios().get(
        `/member/call/log/enquiry/list/${memberId}`,
        { params } // Axios will automatically append ?call_status=...&startDate=... etc.
      );

      // console.log(res.request.responseURL, "Final Request URL"); // 🔍 This will show full correct URL

      const data = res.data?.data || res.data || [];
      setMemberEnquiry(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
    }
  };

  console.log(memberEnquiry, "memberEnquiry");

  useEffect(() => {
    fetchStaff();
  }, []);

  const staffListOptions =
    staffList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const dispatch = useDispatch();
  const { lists } = useSelector((state) => state.optionList);

  useEffect(() => {
    dispatch(fetchOptionList("MEMBER_CALL_TYPE"));
    dispatch(fetchOptionList("MEMBER_CALL_STATUS"));
    dispatch(fetchOptionList("NOT_INTERESTED_REASON"));
  }, []);

  const callTypeOption = lists["MEMBER_CALL_TYPE"] || [];
  const callStatusOption = lists["MEMBER_CALL_STATUS"] || [];
  const notInterestedOption = lists["NOT_INTERESTED_REASON"] || [];

  const fetchMemberCallLogs = async (memberId, filters = {}) => {
    try {
      const params = {};

      if (filters.call_type) params.call_type = filters.call_type;
      if (filters.startDate)
        params.startDate = format(filters.startDate, "yyyy-MM-dd");
      if (filters.endDate)
        params.endDate = format(filters.endDate, "yyyy-MM-dd");

      console.log(params, "params");

      // ✅ Correct way to send params — DO NOT add them inside the URL string
      const res = await apiAxios().get(
        `/member/call/log/list/${memberId}`,
        { params } // Axios will automatically append ?call_type=...&startDate=... etc.
      );

      // console.log(res.request.responseURL, "Final Request URL"); // 🔍 This will show full correct URL

      const data = res.data?.data || res.data || [];
      setCallDataList(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch member call logs");
    }
  };

  const fetchMemberById = async (memberId) => {
    try {
      const res = await apiAxios().get(`/member/${memberId}`);
      const data = res.data?.data || res.data || null;
      console.log(data, "data");
      setMemberDetails(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch member details");
    }
  };

  useEffect(() => {
    if (!id) return;

    fetchMemberById(id);

    const filters = {
      call_type: filterStatus?.value || "",
      startDate,
      endDate,
    };

    const filtersLead = {
      call_status: enquiryfilterStatus?.value || "",
      startDate,
      endDate,
    };

    fetchMemberCallLogs(id, filters);
    fetchMemberEnquiery(id, filtersLead);
  }, [id, filterStatus, startDate, endDate, enquiryfilterStatus]);

  const initialValues = {
    member_id: memberDetails?.id,
    schedule_for: 1,
    call_type: "",
    call_status: "",
    not_interested_reason: "",
    follow_up_datetime: "",
    remark: "",
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      console.log("Form validation errors:", formik.errors);
      console.log(values, "values after submit");

      try {
        await apiAxios().post("/member/call/log/create", values);
        toast.success("Call created successfully!");

        resetForm();
        fetchMemberCallLogs(id);
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Error submitting form:", error);
      }
    },
  });

  // Function to handle edit and set data inside form
  const handleEditLog = (log) => {
    setActiveTab("Member Logs"); // Switch tab to Member Logs
    setEditData(log); // Store selected log
    formik.setValues({
      schedule_for: 1, // Example value, could be dynamic
      call_type: log.call_type,
      call_status: log.call_status,
      not_interested_reason: log.not_interested_reason || "",
      follow_up_datetime: log.follow_up_datetime || "",
      remark: log.remarks || "",
    });
  };

  useEffect(() => {
    let filtered = [];

    if (!formik.values?.call_type) {
      // No call type selected → show nothing
      filtered = [];
      formik.setFieldValue("call_status", "");
    } else if (formik.values?.call_type === "Cross-sell Call") {
      // ✅ Show ALL statuses including cross-sell-specific ones
      filtered = callStatusOption.filter(
        (status) => status.name !== "Successful"
      );
    } else if (
      formik.values?.call_type === "Welcome Call" ||
      formik.values?.call_type === "Induction Call" ||
      formik.values?.call_type === "Upgrade Call" ||
      formik.values?.call_type === "Courtesy Call" ||
      formik.values?.call_type === "Birthday Call" ||
      formik.values?.call_type === "Payment Call" ||
      formik.values?.call_type === "Feedback call" ||
      formik.values?.call_type === "Assessment Call" ||
      formik.values?.call_type === "Anniversary Call" ||
      formik.values?.call_type === "Irregular Member"
    ) {
      // ✅ Hide Not Interested + Future Prospect
      filtered = callStatusOption.filter(
        (status) =>
          status.name !== "Not Interested" &&
          status.name !== "Future Prospect" &&
          status.name !== "Cross-sales trial scheduled"
      );
    } else {
      // ✅ For all other call types → hide cross-sell-specific statuses
      filtered = callStatusOption.filter(
        (status) => status.name !== "Cross-sales trial scheduled"
      );
    }

    setFilteredCallStatus(filtered);

    // ✅ Reset call_status if current value no longer valid
    if (!filtered.some((opt) => opt.name === formik.values?.call_status)) {
      formik.setFieldValue("call_status", "");
    }
  }, [formik.values?.call_type]);

  const statusesNeedingSchedule = [
    "Callback",
    "No Answer",
    "Switched-off/Out of Reach",
    "Busy Tone",
    "Future Prospect",
  ];

  // Show schedule fields only if both call_type and call_status match
  const scheduleCallTypes = [
    "Welcome Call",
    "Induction Call",
    "Upgrade Call",
    "Courtesy Call",
    "Renewal Call",
    "Birthday Call",
    "Payment Call",
    "Cross-sell Call",
    "Feedback call",
    "Assessment Call",
    "Anniversary Call",
    "Irregular Member",
  ];

  const showScheduleFields =
    (formik.values?.call_type === "Cross-sell Call" &&
      formik.values?.call_status === "Cross-sales trial scheduled") ||
    (scheduleCallTypes.includes(formik.values?.call_type) &&
      statusesNeedingSchedule.includes(formik.values?.call_status));

  const showNotInterestedTypes = ["Cross-sell Call", "Renewal Call"];
  const showNotInterestedField =
    showNotInterestedTypes.includes(formik.values?.call_type) &&
    formik.values?.call_status === "Not Interested";

  // Function to handle setting formatted date
  const handleDateChange = (date) => {
    formik.setFieldValue("follow_up_datetime", date); // Store Date object in Formik
  };

  return (
    <div className="">
      <div className="mt-5 flex gap-5">
        <div className="z-[222] relative max-w-[500px] bg-white p-4 rounded-[10px] w-full box--shadow">
          <div className="sticky top-[50px]">
            <div className="tabs flex gap-3 pb-3 mb-3 border-b border-b-[#D4D4D4] justify-between items-center">
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`px-4 py-2 rounded ${
                    activeTab === "Enquiry Logs" ? "bg--color text-white" : ""
                  }`}
                  onClick={() => setActiveTab("Enquiry Logs")}
                >
                  Enquiry Logs
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded ${
                    activeTab === "Member Logs" ? "bg--color text-white" : ""
                  }`}
                  onClick={() => setActiveTab("Member Logs")}
                >
                  Member Logs
                </button>
              </div>
            </div>

            {activeTab === "Enquiry Logs" ? (
              <div className="pt-[150px]">
                <div className="text-center flex flex-col items-center mx-auto max-w-[75%] w-full">
                  <BsExclamationCircle className="text-5xl mb-2 text-[#6F6F6F]" />
                  <h3 className="font-bold text-2xl text-black mb-1">
                    This user is now a member.
                  </h3>
                  <p className="text-md text-[#6F6F6F]">
                    New calls can only be logged under Member Call Log.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={formik.handleSubmit} className="block w-full">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Call Type */}
                    <div>
                      <label className="mb-2 block">
                        Call Type<span className="text-red-500">*</span>
                      </label>
                      <Select
                        name="call_type"
                        value={
                          callTypeOption.find(
                            (opt) => opt.value === formik.values?.call_type
                          ) || ""
                        }
                        onChange={(option) => {
                          formik.setFieldValue("call_type", option.value);
                          formik.setFieldValue("call_status", ""); // Reset call_status when call_type changes
                        }}
                        options={callTypeOption}
                        styles={customStyles}
                      />
                      {formik.errors?.call_type &&
                        formik.touched?.call_type && (
                          <div className="text-red-500 text-sm">
                            {formik.errors?.call_type}
                          </div>
                        )}
                    </div>

                    {/* Call Status */}
                    <div>
                      <label className="mb-2 block">
                        Call Status<span className="text-red-500">*</span>
                      </label>
                      <Select
                        name="call_status"
                        value={
                          formik.values?.call_status
                            ? filteredCallStatus.find(
                                (opt) => opt.name === formik.values?.call_status
                              )
                            : null
                        } // Only show a value if call_status is not empty
                        onChange={(option) =>
                          formik.setFieldValue("call_status", option.name)
                        }
                        options={filteredCallStatus.map((opt) => ({
                          label: opt.name,
                          value: opt.name,
                          name: opt.name,
                        }))}
                        styles={customStyles}
                        // isDisabled={isDisabled}
                      />
                      {formik.errors?.call_status &&
                        formik.touched?.call_status && (
                          <div className="text-red-500 text-sm">
                            {formik.errors?.call_status}
                          </div>
                        )}
                    </div>
                    {/* Conditional Not Interested Reason */}
                    {showNotInterestedField && (
                      <div>
                        <label className="mb-2 block">
                          Not Interested Reason
                          <span className="text-red-500">*</span>
                        </label>
                        <Select
                          name="not_interested_reason"
                          value={notInterestedOption.find(
                            (opt) =>
                              opt.name === formik.values?.not_interested_reason
                          )}
                          onChange={(option) =>
                            formik.setFieldValue(
                              "not_interested_reason",
                              option.name
                            )
                          }
                          options={notInterestedOption.map((opt) => ({
                            label: opt.name,
                            value: opt.name,
                            name: opt.name,
                          }))}
                          styles={customStyles}
                          // isDisabled={isDisabled}
                        />
                        {formik.errors?.not_interested_reason &&
                          formik.touched?.not_interested_reason && (
                            <div className="text-red-500 text-sm">
                              {formik.errors?.not_interested_reason}
                            </div>
                          )}
                      </div>
                    )}

                    {/* Conditional Schedule Date */}
                    {showScheduleFields && (
                      <div>
                        <label className="mb-2 block">
                          Date & Time<span className="text-red-500">*</span>
                        </label>
                        <div className="custom--date flex-1">
                          <span className="absolute z-[1] mt-[15px] ml-[15px]">
                            <FaCalendarDays />
                          </span>
                          <DatePicker
                            selected={
                              formik.values.follow_up_datetime
                                ? new Date(formik.values.follow_up_datetime)
                                : null
                            }
                            onChange={handleDateChange}
                            showTimeSelect
                            timeFormat="hh:mm aa"
                            dateFormat="dd/MM/yyyy hh:mm aa"
                            placeholderText="Select date & time"
                            className="border px-3 py-2 w-full input--icon"
                            minDate={now}
                            minTime={minTime}
                            maxTime={maxTime}
                            // disabled={isDisabled}
                          />
                        </div>

                        {formik.errors?.follow_up_datetime &&
                          formik.touched?.follow_up_datetime && (
                            <div className="text-red-500 text-sm">
                              {formik.errors?.follow_up_datetime}
                            </div>
                          )}
                      </div>
                    )}

                    {/* Staff Name */}
                    {/* <div>
                      <label className="mb-2 block">
                        Assign to<span className="text-red-500">*</span>
                      </label>

                      <Select
                        name="calledBy"
                        value={
                          staffListOptions.find(
                            (opt) => opt.value === formik.values?.calledBy
                          ) || null
                        }
                        options={staffListOptions}
                        onChange={(option) =>
                          formik.setFieldValue("calledBy", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("calledBy", true)}
                        styles={customStyles}
                        // isDisabled={isDisabled}
                      />
                      {formik.errors?.calledBy && formik.touched?.calledBy && (
                        <div className="text-red-500 text-sm">
                          {formik.errors?.calledBy}
                        </div>
                      )}
                    </div> */}
                  </div>

                  {/* Discussion */}
                  <div className="mb-3 mt-3">
                    <label className="mb-2 block">
                      Discussion Details<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="remark"
                      placeholder="Discussion (max 1800 characters)"
                      maxLength={1800}
                      value={formik.values?.remark}
                      onChange={formik.handleChange}
                      className="custom--input w-full"
                      rows={4}
                      // disabled={isDisabled ? true : false}
                    />
                    {formik.errors?.remark && formik.touched?.remark && (
                      <div className="text-red-500 text-sm">
                        {formik.errors?.remark}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      type="submit"
                      // disabled={isDisabled ? true : false}
                      className="px-4 py-2 bg-black text-white rounded"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Contact History */}
        <div className="bg-white p-4 rounded-[10px] w-full box--shadow">
          <div className="flex pt-2 gap-2 items-center pb-3 mb-5 border-b border-b-[#D4D4D4]">
            <h2 className="text-xl font-semibold">Contact History</h2>
            <span className="font-bold">{"-"}</span>
            <div>
              <PhoneInput
                name="text"
                value={
                  "+" + memberDetails?.country_code + memberDetails?.mobile
                }
                international
                defaultCountry="IN"
                countryCallingCodeEditable={false}
                readOnly={true}
                disabled={true}
                className="disable--phone px-0 text-right font-[500]"
              />
            </div>
          </div>

          {activeTab === "Member Logs" ? (
            <>
              <div className="flex gap-2 mb-3">
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    options={[{ value: "", label: "All" }, ...callTypeOption]}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    placeholder="Call Type"
                    styles={customStyles}
                    className="w-full"
                  />
                  <div className="custom--date flex-1">
                    <span className="absolute z-[1] mt-[15px] ml-[15px]">
                      <FaCalendarDays />
                    </span>
                    <DatePicker
                      selected={startDate}
                      onChange={setStartDate}
                      placeholderText="Start Date"
                      className="border px-3 py-2 w-full input--icon"
                      isClearable
                    />
                  </div>
                  <div className="custom--date flex-1">
                    <span className="absolute z-[1] mt-[15px] ml-[15px]">
                      <FaCalendarDays />
                    </span>
                    <DatePicker
                      selected={endDate}
                      onChange={setEndDate}
                      placeholderText="End Date"
                      className="border px-3 py-2 w-full input--icon"
                      isClearable
                    />
                  </div>
                </div>
              </div>

              {callDataList.length > 0 ? (
                callDataList.map((filteredLogs, index) => (
                  <MemberContactHistory
                    key={index}
                    filteredData={filteredLogs}
                    handleEditLog={handleEditLog}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500">No records found</p>
              )}
            </>
          ) : (
            <>
              <div className="flex gap-2 mb-3">
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    options={[{ value: "", label: "All" }, ...callStatusOption]}
                    value={enquiryfilterStatus}
                    onChange={setEnquiryFilterStatus}
                    placeholder="Call Status"
                    styles={customStyles}
                    className="w-full"
                  />
                  <div className="custom--date flex-1">
                    <span className="absolute z-[1] mt-[15px] ml-[15px]">
                      <FaCalendarDays />
                    </span>
                    <DatePicker
                      selected={startDate}
                      onChange={setStartDate}
                      placeholderText="Start Date"
                      className="border px-3 py-2 w-full input--icon"
                      isClearable
                    />
                  </div>
                  <div className="custom--date flex-1">
                    <span className="absolute z-[1] mt-[15px] ml-[15px]">
                      <FaCalendarDays />
                    </span>
                    <DatePicker
                      selected={endDate}
                      onChange={setEndDate}
                      placeholderText="End Date"
                      className="border px-3 py-2 w-full input--icon"
                      isClearable
                    />
                  </div>
                </div>
              </div>

              {memberEnquiry.length > 0 ? (
                memberEnquiry.map((filteredLogs, index) => (
                  <LeadContactHistory key={index} filteredData={filteredLogs} />
                ))
              ) : (
                <p className="text-center text-gray-500">No records found</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberCallLogs;
