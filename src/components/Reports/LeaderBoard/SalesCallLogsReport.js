import React, { useEffect, useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears, format } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import {
  ALLOWED_ROLES,
  customStyles,
  filterActiveItems,
  formatText,
} from "../../../Helper/helper";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import { authAxios } from "../../../config/config";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../../Redux/Reducers/optionListSlice";
import IsLoadingHOC from "../../../components/common/IsLoadingHOC";
import SalesEnquiryCallLog from "./SalesEnquiryCallLog";
import SalesMemberCallLog from "./SalesMemberCallLog";
import { LuDownload } from "react-icons/lu";

const SalesCallLogsReport = (props) => {
  const { setLoading } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;
  const { lists } = useSelector((state) => state.optionList);

  // ── Tab ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("enquiry");
  const [enquiryDataLength, setEnquiryDataLength] = useState(0);
  const [memberDataLength, setMemberDataLength] = useState(0);

  // ── Common filter state ───────────────────────────────
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [clubFilter, setClubFilter] = useState(null);
  const [leadOwner, setLeadOwner] = useState(null);
  const [pendingLeadOwnerId, setPendingLeadOwnerId] = useState(null);

  // ── Enquiry-specific filter ───────────────────────────
  const [enquiryCallStatus, setEnquiryCallStatus] = useState(null);

  // ── Member-specific filters (chained) ─────────────────
  const [memberCallType, setMemberCallType] = useState(null);
  const [memberCallStatus, setMemberCallStatus] = useState(null);

  // ── Supporting data ───────────────────────────────────
  const [clubList, setClubList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // ── Option lists from Redux ───────────────────────────
  const enquiryCallStatusOptions = lists["LEAD_CALL_STATUS"] || [];
  const memberCallTypeOptions = lists["MEMBER_CALL_TYPE"] || [];
  const memberCallStatusOptions = lists["MEMBER_CALL_STATUS"] || [];
  const notInterestedOptions = lists["NOT_INTERESTED_REASON"] || [];

  useEffect(() => {
    dispatch(fetchOptionList("LEAD_CALL_STATUS"));
    dispatch(fetchOptionList("MEMBER_CALL_TYPE"));
    dispatch(fetchOptionList("MEMBER_CALL_STATUS"));
    dispatch(fetchOptionList("NOT_INTERESTED_REASON"));
  }, [dispatch]);

  // ── Fetch clubs ───────────────────────────────────────
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await authAxios().get("/club/list");
        setClubList(filterActiveItems(res.data?.data || []));
      } catch (err) {
        console.error(err);
      }
    };
    fetchClubs();
  }, []);

  // ── Fetch staff when club changes ─────────────────────
  useEffect(() => {
    if (!clubFilter?.value) return;

    // Reset all filters except dates when club changes
    setLeadOwner(null);
    setEnquiryCallStatus(null);
    setMemberCallType(null);
    setMemberCallStatus(null);

    const fetchStaff = async () => {
      try {
        const res = await authAxios().get("/staff/list", {
          params: {
            role: "ADMIN,FOH,TRAINER,CLUB_MANAGER,ASS_CLUB_MANAGER,FITNESS_MANAGER,ASS_FITNESS_MANAGER",
            club_id: clubFilter.value,
          },
        });
        const data = res.data?.data || [];
        const activeStaff = data.filter(
          (item) =>
            item.status === "ACTIVE" &&
            [
              "ADMIN",
              "FOH",
              "TRAINER",
              "CLUB_MANAGER",
              "ASS_CLUB_MANAGER",
              "FITNESS_MANAGER",
              "ASS_FITNESS_MANAGER",
            ].includes(item.role),
        );
        setStaffList(activeStaff);
        setLeadOwner(null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStaff();
  }, [clubFilter?.value]);

  // ── Initialize filters from URL ───────────────────────
  useEffect(() => {
    if (clubList.length === 0 || filtersInitialized) return;

    const params = new URLSearchParams(location.search);
    const leadOwnerId = params.get("lead_owner");

    if (leadOwnerId) {
      setPendingLeadOwnerId(leadOwnerId);
    }

    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    if (startDate && endDate) {
      setCustomFrom(new Date(startDate));
      setCustomTo(new Date(endDate));
    }

    const clubId = params.get("club_id");
    if (clubId) {
      const club = clubList.find((c) => c.id === Number(clubId));
      if (club) setClubFilter({ label: club.name, value: club.id });
    } else {
      setClubFilter({ label: clubList[0].name, value: clubList[0].id });
    }

    const tab = params.get("tab");
    if (tab === "member") setActiveTab("member");

    setFiltersInitialized(true);
  }, [clubList]);

  // ── Sync URL when filters change ──────────────────────
  useEffect(() => {
    if (!filtersInitialized) return;
    const params = new URLSearchParams();
    if (customFrom && customTo) {
      params.set("startDate", format(customFrom, "yyyy-MM-dd"));
      params.set("endDate", format(customTo, "yyyy-MM-dd"));
    }
    if (clubFilter?.value) params.set("club_id", clubFilter.value);
    if (leadOwner?.value) params.set("lead_owner", leadOwner.value);
    if (activeTab !== "enquiry") params.set("tab", activeTab);
    navigate(`?${params.toString()}`, { replace: true });
  }, [
    filtersInitialized,
    customFrom,
    customTo,
    clubFilter?.value,
    leadOwner?.value,
    activeTab,
  ]);

  // ── Reset tab-specific filters when switching tabs ────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset filters that are tab-specific so they don't
    // bleed across when the user switches
    setEnquiryCallStatus(null);
    setMemberCallType(null);
    setMemberCallStatus(null);
  };

  // ── Member: derive filtered call-status from call-type ─
  // Mirrors your existing useEffect logic, but as a pure
  // derived value so it's always in sync with no extra state.
  const filteredMemberCallStatusOptions = useMemo(() => {
    if (!memberCallType?.value) return [];

    const callTypeName = memberCallType.value;

    if (callTypeName === "Cross-sell Call") {
      // All statuses EXCEPT "Successful"
      return memberCallStatusOptions.filter((s) => s.name !== "Successful");
    }

    if (
      [
        "Welcome Call",
        "Induction Call",
        "Upgrade Call",
        "Courtesy Call",
        "Birthday Call",
        "Payment Call",
        "Feedback call",
        "Assessment Call",
        "Anniversary Call",
        "Irregular Member",
      ].includes(callTypeName)
    ) {
      // Hide Not Interested, Future Prospect, Cross-sales trial scheduled
      return memberCallStatusOptions.filter(
        (s) =>
          s.name !== "Not Interested" &&
          s.name !== "Future Prospect" &&
          s.name !== "Cross-sales trial scheduled",
      );
    }

    // All other call types (Renewal Call etc.) → hide Cross-sales trial scheduled
    return memberCallStatusOptions.filter(
      (s) => s.name !== "Cross-sales trial scheduled",
    );
  }, [memberCallType?.value, memberCallStatusOptions]);

  // Reset call status whenever call type changes and the
  // current selection is no longer in the filtered list
  useEffect(() => {
    if (
      memberCallStatus &&
      !filteredMemberCallStatusOptions.some(
        (o) => o.value === memberCallStatus.value,
      )
    ) {
      setMemberCallStatus(null);
    }
  }, [filteredMemberCallStatusOptions]);

  // ── Derived select options ────────────────────────────
  const clubOptions = clubList.map((c) => ({ label: c.name, value: c.id }));
  const selectedClub =
    clubOptions.find((o) => o.value === clubFilter?.value) || null;

  // const leadOwnerOptions = staffList.map((item) => ({
  //   label: `${item.name} (${formatText(item.role)})`,
  //   value: item.id,
  // }));
  const leadOwnerOptions = useMemo(() => {
    const grouped = {};

    staffList.forEach((item) => {
      const role = formatText(item.role);

      if (!grouped[role]) {
        grouped[role] = [];
      }

      grouped[role].push({
        label: item.name,
        value: item.id,
        role: role,
      });
    });

    return Object.keys(grouped)
      .sort() // optional: alphabetic group order
      .map((role) => ({
        label: role,
        options: grouped[role],
      }));
  }, [staffList]);

  useEffect(() => {
    if (!pendingLeadOwnerId || staffList.length === 0) return;

    const flatOptions = leadOwnerOptions.flatMap((group) => group.options);

    const matched = flatOptions.find(
      (opt) => String(opt.value) === String(pendingLeadOwnerId),
    );

    if (matched) {
      setLeadOwner(matched);
    }
  }, [pendingLeadOwnerId, staffList, leadOwnerOptions]);

  // ── Filters passed to each child ─────────────────────
  const enquiryFilters = {
    customFrom,
    customTo,
    clubFilter,
    leadOwner,
    callStatus: enquiryCallStatus,
  };

  const memberFilters = {
    customFrom,
    customTo,
    clubFilter,
    leadOwner,
    callType: memberCallType,
    callStatus: memberCallStatus,
  };

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      const params = {};

      // Entity Type
      params.entity_type = activeTab === "enquiry" ? "LEAD" : "MEMBER";

      // Common Filters
      if (customFrom && customTo) {
        params.start_date = format(customFrom, "yyyy-MM-dd");
        params.end_date = format(customTo, "yyyy-MM-dd");
      }

      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      if (leadOwner?.value) {
        params.created_by = leadOwner.value;
      }

      // Tab Specific Filters
      if (activeTab === "enquiry") {
        if (enquiryCallStatus?.value) {
          params.call_status = enquiryCallStatus.value;
        }
      } else {
        if (memberCallType?.value) {
          params.call_type = memberCallType.value;
        }

        if (memberCallStatus?.value) {
          params.call_status = memberCallStatus.value;
        }
      }

      const response = await authAxios().get(
        "/leaderboard/sales/calllog/leadmember/download",
        {
          params,
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data]);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download =
        activeTab === "enquiry"
          ? "Sales_Enquiry_Call_Log.xlsx"
          : "Sales_Member_Call_Log.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const isDownloadDisabled =
  activeTab === "enquiry"
    ? enquiryDataLength === 0
    : memberDataLength === 0;

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="w-full">
          <h1 className="text-3xl font-semibold">Call Log Report</h1>
        </div>
        {!ALLOWED_ROLES.includes(userRole) && (
          <div className="w-full">
            <button
              onClick={handleDownloadReport}
              disabled={isDownloadDisabled}
              className={`ms-auto px-4 py-2 rounded flex items-center gap-2 ${
                isDownloadDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              <LuDownload />
              <span>Download Report</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Tab buttons ── */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => handleTabChange("enquiry")}
          className={`px-4 py-2 rounded ${
            activeTab === "enquiry"
              ? "bg--color text-white"
              : "bg-transparent text-gray-600 border border-gray-300"
          }`}
        >
          Enquiry Call Log
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("member")}
          className={`px-4 py-2 rounded ${
            activeTab === "member"
              ? "bg--color text-white"
              : "bg-transparent text-gray-600 border border-gray-300"
          }`}
        >
          Member Call Log
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-3 mb-4 items-center flex-wrap">
        {/* Common: Date range */}
        <div className="custom--date dob-format flex-1 min-w-[120px] max-w-fit">
          <span className="absolute z-[1] mt-[10px] ml-[15px]">
            <FaCalendarDays />
          </span>
          <DatePicker
            selected={customFrom}
            onChange={(date) => {
              setCustomFrom(date);
              setCustomTo(null);
            }}
            placeholderText="From Date"
            className="custom--input w-full input--icon"
            minDate={subYears(new Date(), 20)}
            maxDate={addYears(new Date(), 0)}
            dateFormat="dd-MM-yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </div>
        <div className="custom--date dob-format flex-1 min-w-[120px] max-w-fit">
          <span className="absolute z-[1] mt-[10px] ml-[15px]">
            <FaCalendarDays />
          </span>
          <DatePicker
            selected={customTo}
            onChange={(date) => setCustomTo(date)}
            placeholderText="To Date"
            className="custom--input w-full input--icon"
            minDate={customFrom || subYears(new Date(), 20)}
            maxDate={addYears(new Date(), 0)}
            dateFormat="dd-MM-yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            disabled={!customFrom}
          />
        </div>

        {/* Common: Club */}
        <div className="w-fit min-w-[180px]">
          <Select
            placeholder="Filter by club"
            value={selectedClub}
            options={clubOptions}
            onChange={(opt) => {
              setClubFilter(opt);
              // Reset all dependent filters when club changes
              setLeadOwner(null);
              setEnquiryCallStatus(null);
              setMemberCallType(null);
              setMemberCallStatus(null);
            }}
            isClearable={userRole === "ADMIN"}
            styles={customStyles}
          />
        </div>

        {/* Common: Lead Owner */}
        <div className="w-fit min-w-[200px]">
          <Select
            placeholder="Select Lead Owner"
            value={leadOwner}
            options={leadOwnerOptions}
            onChange={(opt) => setLeadOwner(opt)}
            isClearable
            styles={customStyles}
          />
        </div>

        {/* Enquiry-only: Call Status */}
        {activeTab === "enquiry" && (
          <div className="w-fit min-w-[180px]">
            <Select
              placeholder="Call Status"
              value={enquiryCallStatus}
              options={enquiryCallStatusOptions}
              onChange={(opt) => setEnquiryCallStatus(opt)}
              isClearable
              styles={customStyles}
            />
          </div>
        )}

        {/* Member-only: Call Type → Call Status (chained) */}
        {activeTab === "member" && (
          <>
            <div className="w-fit min-w-[180px]">
              <Select
                placeholder="Call Type"
                value={memberCallType}
                options={memberCallTypeOptions}
                onChange={(opt) => {
                  setMemberCallType(opt);
                  setMemberCallStatus(null); // always reset status when type changes
                }}
                isClearable
                styles={customStyles}
              />
            </div>
            <div className="w-fit min-w-[180px]">
              <Select
                placeholder="Call Status"
                value={memberCallStatus}
                options={filteredMemberCallStatusOptions}
                onChange={(opt) => setMemberCallStatus(opt)}
                isClearable
                isDisabled={!memberCallType} // can't pick status without a type
                styles={customStyles}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Child tables ── */}
      {activeTab === "enquiry" && (
        <SalesEnquiryCallLog
          filters={enquiryFilters}
          onDataLengthChange={setEnquiryDataLength}
        />
      )}
      {activeTab === "member" && (
        <SalesMemberCallLog
          filters={memberFilters}
          onDataLengthChange={setMemberDataLength}
        />
      )}
    </div>
  );
};

export default IsLoadingHOC(SalesCallLogsReport);
