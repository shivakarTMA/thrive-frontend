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
  schdule_date: Yup.date()
    .nullable()
    .when(["callType", "callStatus"], {
      is: (callType, callStatus) =>
        callType === "Cross-sell Call" &&
        callStatus === "Cross-sales trial follow-up",
      then: (schema) => schema.required("Schedule date is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  schdule_time: Yup.date()
    .nullable()
    .when(["callType", "callStatus"], {
      is: (callType, callStatus) =>
        callType === "Cross-sell Call" &&
        callStatus === "Cross-sales trial follow-up",
      then: (schema) => schema.required("Schedule time is required"),
      otherwise: (schema) => schema.nullable(),
    }),
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

  const isDisabled = activeTab === "Enquiry Logs";

  const formik = useFormik({
    initialValues: {
      calledBy: "Nitin",
      callType: "",
      callStatus: "",
      notInterested: "",
      schdule_date: null,
      schdule_time: null,
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
          schdule_date: null,
          schdule_time: null,
          discussion: "",
        },
      });
    },
  });

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
      filtered = callStatusOption;
    } else if (formik.values?.callType === "Welcome Call") {
      // ✅ Hide Not Interested + Future Prospect
      filtered = callStatusOption.filter(
        (status) =>
          status.name !== "Not Interested" &&
          status.name !== "Future Prospect" &&
          status.name !== "Cross-sales trial scheduled" &&
          status.name !== "Cross-sales trial follow-up"
      );
    } else {
      // ✅ For all other call types → hide cross-sell-specific statuses
      filtered = callStatusOption.filter(
        (status) =>
          status.name !== "Cross-sales trial scheduled" &&
          status.name !== "Cross-sales trial follow-up"
      );
    }

    setFilteredCallStatus(filtered);

    // ✅ Reset callStatus if current value no longer valid
    if (!filtered.some((opt) => opt.name === formik.values?.callStatus)) {
      formik.setFieldValue("callStatus", "");
    }
  }, [formik.values?.callType]);

  // Show schedule fields only if both callType and callStatus match
  const showScheduleFields =
    formik.values?.callType === "Cross-sell Call" &&
    formik.values?.callStatus === "Cross-sales trial follow-up";

  const showNotInterestedField =
    formik.values?.callType === "Cross-sell Call" &&
    formik.values?.callStatus === "Not Interested";

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
                    activeTab === "Member Logs" ? "bg--color text-white" : ""
                  }`}
                  onClick={() => setActiveTab("Member Logs")}
                >
                  Member Logs
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded ${
                    activeTab === "Enquiry Logs" ? "bg--color text-white" : ""
                  }`}
                  onClick={() => setActiveTab("Enquiry Logs")}
                >
                  Enquiry Logs
                </button>
              </div>
            </div>

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
                    isDisabled={isDisabled}
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
                    isDisabled={isDisabled}
                  />
                  {formik.errors?.callStatus && formik.touched?.callStatus && (
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
                      isDisabled={isDisabled}
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
                      Schedule Date<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={formik.values?.schdule_date}
                        onChange={(date) =>
                          formik.setFieldValue("schdule_date", date)
                        }
                        placeholderText="Schedule Date"
                        className="input--icon"
                        disabled={isDisabled ? true : false}
                      />
                    </div>
                    {formik.errors?.schdule_date &&
                      formik.touched?.schdule_date && (
                        <div className="text-red-500 text-sm">
                          {formik.errors?.schdule_date}
                        </div>
                      )}
                  </div>
                )}

                {/* Conditional Schedule Time */}
                {showScheduleFields && (
                  <div>
                    <label className="mb-2 block">
                      Schedule Time<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FiClock />
                      </span>
                      <DatePicker
                        selected={formik.values?.schdule_time}
                        onChange={(time) =>
                          formik.setFieldValue("schdule_time", time)
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        placeholderText="Schedule Time"
                        className="input--icon"
                        disabled={isDisabled ? true : false}
                      />
                    </div>
                    {formik.errors?.schdule_time &&
                      formik.touched?.schdule_time && (
                        <div className="text-red-500 text-sm">
                          {formik.errors?.schdule_time}
                        </div>
                      )}
                  </div>
                )}

                {/* Staff Name */}
                <div>
                  <label className="mb-2 block">
                    Staff Name<span className="text-red-500">*</span>
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
                    isDisabled={isDisabled}
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
                  disabled={isDisabled ? true : false}
                />
                {formik.errors?.discussion && formik.touched?.discussion && (
                  <div className="text-red-500 text-sm">
                    {formik.errors?.discussion}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="submit"
                  disabled={isDisabled ? true : false}
                  className="px-4 py-2 bg-black text-white rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Contact History */}
        <div className="bg-white p-4 rounded-[10px] w-full box--shadow">
          <div className="flex gap-2 justify-between items-center mb-5">
            <h2 className="text-xl font-semibold">Contact History</h2>
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
              <div className="custom--date">
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  placeholderText="Start Date"
                  className="custom--input"
                  isClearable
                />
              </div>
              <div className="custom--date">
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  placeholderText="End Date"
                  className="custom--input"
                  isClearable
                />
              </div>
            </div>
          </div>

          {/* {filteredLogs.length === 0 && (
            <p className="text-gray-500">No call logs found.</p>
          )} */}

          {/* {filteredLogs.map((log, index) => (
            <div
              key={index}
              className="border rounded p-4 w-full mb-3 calllogdetails"
            >
              <div className="grid grid-cols-2 gap-2 mb-3">
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Called by:
                  </span>{" "}
                  {log.calledBy}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Call Type
                  </span>{" "}
                  {log.callType}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Call Status:
                  </span>{" "}
                  {log.callStatus}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="text-sm font-semibold">Remarks:</h3>
                <p>{log.discussion}</p>
              </div>
            </div>
          ))} */}

          {filteredData.length > 0 ? (
            filteredData.map((filteredLogs, index) => (
              <ContactHistory key={index} filteredLogs={filteredLogs} />
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
