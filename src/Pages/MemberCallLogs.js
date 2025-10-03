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
import ContactHistory from "./ContactHistory";
import { FaCalendarDays } from "react-icons/fa6";
import { format } from "date-fns";
import { BsExclamationCircle } from "react-icons/bs";

const callDataList = [
  {
    callType: "Renewal Call",
    createdOn: "16 Aug, 2025",
    scheduledBy: "Auto",
    scheduledFor: "Swati Singh",
    scheduledOn: "23 Aug, 2025; 10:00am",
    callStatus: "Upcoming",
    updatedBy: "Swati Singh",
    updatedOn: "24 Aug, 2025; 09:00am",
    remarks:
      "not responding to the calls, msg sent for renew, follow up on monday not responding to the calls, msg sent for renew, follow up on monday",
  },
  {
    callType: "Renewal Call",
    createdOn: "17 Aug, 2025",
    scheduledBy: "Auto",
    scheduledFor: "Swati Singh",
    scheduledOn: "25 Aug, 2025; 02:00pm",
    callStatus: "Upcoming",
    updatedBy: "Swati Singh",
    updatedOn: "25 Aug, 2025; 01:30pm",
    remarks: "client confirmed availability, call at scheduled time",
  },
];

// Validation schema with conditional required fields
const validationSchema = Yup.object().shape({
  calledBy: Yup.string().required("Call by is required"),
  callType: Yup.string().required("Call Type is required"),
  callStatus: Yup.string().required("Lead Status is required"),
  discussion: Yup.string().required("Discussion is required"),
  notInterested: Yup.string()
    .nullable()
    .when(["callType", "callStatus"], {
      is: (callType, callStatus) =>
        callType === "Cross-sell Call" && callStatus === "Not Interested",
      then: (schema) => schema.required("Not Interested Reason is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  schedule_date_time: Yup.string().required("Date & Time is required"),
});

const MemberCallLogs = () => {
  // const { id } = useParams();
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const action = queryParams.get("action");

  // const dataSource = action === "add-follow-up" ? assignedLeadsData : mockData;

  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredCallStatus, setFilteredCallStatus] = useState([]);
  const [activeTab, setActiveTab] = useState("Member Logs");
  const [staffList, setStaffList] = useState([]);
  const [editData, setEditData] = useState(null);

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

  const formik = useFormik({
    initialValues: {
      calledBy: "Nitin",
      callType: "",
      callStatus: "",
      notInterested: "",
      schedule_date_time: null,
      discussion: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      // const newEntry = {
      //   ...values,
      //   createdAt: new Date(),
      //   updatedBy: "Rajat Sharma",
      //   leadSource: "Passing By",
      // };
      resetForm({
        values: {
          calledBy: "Nitin",
          callType: "",
          callStatus: "",
          notInterested: "",
          schedule_date_time: null,
          discussion: "",
        },
      });
      setEditData(null);
    },
  });

  // Function to handle edit and set data inside form
  const handleEditLog = (log) => {
    setActiveTab("Member Logs"); // Switch tab to Member Logs
    setEditData(log); // Store selected log
    formik.setValues({
      calledBy: "Nitin", // Example value, could be dynamic
      callType: log.callType,
      callStatus: log.callStatus,
      notInterested: log.notInterested || "",
      schedule_date_time: log.schedule_date_time || null,
      discussion: log.remarks || "",
    });
  };

  const filteredData = callDataList.filter((item) => {
    const matchesType =
      !filterStatus || filterStatus?.value === ""
        ? true
        : item.callType === filterStatus?.value;

    const createdDate = new Date(item.createdOn);
    const matchesStartDate = startDate ? createdDate >= startDate : true;
    const matchesEndDate = endDate ? createdDate <= endDate : true;

    return matchesType && matchesStartDate && matchesEndDate;
  });

  useEffect(() => {
    let filtered = [];

    if (!formik.values?.callType) {
      // No call type selected → show nothing
      filtered = [];
      formik.setFieldValue("callStatus", "");
    } else if (formik.values?.callType === "Cross-sell Call") {
      // ✅ Show ALL statuses including cross-sell-specific ones
      filtered = callStatusOption.filter(
        (status) => status.name !== "Successful"
      );
    } else if (
      formik.values?.callType === "Welcome Call" ||
      formik.values?.callType === "Induction Call" ||
      formik.values?.callType === "Upgrade Call" ||
      formik.values?.callType === "Courtesy Call" ||
      formik.values?.callType === "Birthday Call" ||
      formik.values?.callType === "Payment Call" ||
      formik.values?.callType === "Feedback call" ||
      formik.values?.callType === "Assessment Call" ||
      formik.values?.callType === "Anniversary Call" ||
      formik.values?.callType === "Irregular Member"
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

    // ✅ Reset callStatus if current value no longer valid
    if (!filtered.some((opt) => opt.name === formik.values?.callStatus)) {
      formik.setFieldValue("callStatus", "");
    }
  }, [formik.values?.callType]);

  const statusesNeedingSchedule = [
    "Callback",
    "No Answer",
    "Switched-off/Out of Reach",
    "Busy Tone",
    "Future Prospect",
  ];

  // Show schedule fields only if both callType and callStatus match
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
    (formik.values?.callType === "Cross-sell Call" &&
      formik.values?.callStatus === "Cross-sales trial scheduled") ||
    (scheduleCallTypes.includes(formik.values?.callType) &&
      statusesNeedingSchedule.includes(formik.values?.callStatus));

  const showNotInterestedTypes = ["Cross-sell Call", "Renewal Call"];
  const showNotInterestedField =
    showNotInterestedTypes.includes(formik.values?.callType) &&
    formik.values?.callStatus === "Not Interested";

  // Function to handle setting formatted date
  const handleDateChange = (date) => {
    formik.setFieldValue("schedule_date_time", date); // Store Date object in Formik
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
                        name="callType"
                        value={callTypeOption.find(
                          (opt) => opt.value === formik.values?.callType
                        )}
                        onChange={(option) => {
                          formik.setFieldValue("callType", option.value);
                          formik.setFieldValue("callStatus", ""); // Reset callStatus when callType changes
                        }}
                        options={callTypeOption}
                        styles={customStyles}
                        // isDisabled={isDisabled}
                      />
                      {formik.errors?.callType && formik.touched?.callType && (
                        <div className="text-red-500 text-sm">
                          {formik.errors?.callType}
                        </div>
                      )}
                    </div>

                    {/* Call Status */}
                    <div>
                      <label className="mb-2 block">
                        Call Status<span className="text-red-500">*</span>
                      </label>
                      <Select
                        name="callStatus"
                        value={
                          formik.values?.callStatus
                            ? filteredCallStatus.find(
                                (opt) => opt.name === formik.values?.callStatus
                              )
                            : null
                        } // Only show a value if callStatus is not empty
                        onChange={(option) =>
                          formik.setFieldValue("callStatus", option.name)
                        }
                        options={filteredCallStatus.map((opt) => ({
                          label: opt.name,
                          value: opt.name,
                          name: opt.name,
                        }))}
                        styles={customStyles}
                        // isDisabled={isDisabled}
                      />
                      {formik.errors?.callStatus &&
                        formik.touched?.callStatus && (
                          <div className="text-red-500 text-sm">
                            {formik.errors?.callStatus}
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
                          name="notInterested"
                          value={notInterestedOption.find(
                            (opt) => opt.name === formik.values?.notInterested
                          )}
                          onChange={(option) =>
                            formik.setFieldValue("notInterested", option.name)
                          }
                          options={notInterestedOption.map((opt) => ({
                            label: opt.name,
                            value: opt.name,
                            name: opt.name,
                          }))}
                          styles={customStyles}
                          // isDisabled={isDisabled}
                        />
                        {formik.errors?.notInterested &&
                          formik.touched?.notInterested && (
                            <div className="text-red-500 text-sm">
                              {formik.errors?.notInterested}
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
                            selected={formik.values.schedule_date_time}
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

                        {formik.errors?.schedule_date_time &&
                          formik.touched?.schedule_date_time && (
                            <div className="text-red-500 text-sm">
                              {formik.errors?.schedule_date_time}
                            </div>
                          )}
                      </div>
                    )}

                    {/* Staff Name */}
                    <div>
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
                    </div>
                  </div>

                  {/* Discussion */}
                  <div className="mb-3 mt-3">
                    <label className="mb-2 block">
                      Discussion Details<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="discussion"
                      placeholder="Discussion (max 1800 characters)"
                      maxLength={1800}
                      value={formik.values?.discussion}
                      onChange={formik.handleChange}
                      className="custom--input w-full"
                      rows={4}
                      // disabled={isDisabled ? true : false}
                    />
                    {formik.errors?.discussion &&
                      formik.touched?.discussion && (
                        <div className="text-red-500 text-sm">
                          {formik.errors?.discussion}
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
                value="+918700704309"
                international
                defaultCountry="IN"
                countryCallingCodeEditable={false}
                readOnly={true}
                disabled={true}
                className="disable--phone px-0 text-right font-[500]"
              />
            </div>
          </div>

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

          {filteredData.length > 0 ? (
            filteredData.map((filteredLogs, index) => (
              <>
                <ContactHistory
                  key={index}
                  filteredLogs={filteredLogs}
                  handleEditLog={handleEditLog}
                />
              </>
            ))
          ) : (
            <p className="text-center text-gray-500">No records found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberCallLogs;
