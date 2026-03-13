import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { IoClose, IoTriangle } from "react-icons/io5";
import DatePicker from "react-datepicker";
import { customStyles, filterActiveItems } from "../../Helper/helper";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { LuCalendar } from "react-icons/lu";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";

const ageGroupOptions = [
  { value: "15-20", label: "15-20" },
  { value: "21-30", label: "21-30" },
  { value: "31-40", label: "31-40" },
  { value: "41-50", label: "41-50" },
  { value: "51+", label: "51+" },
  { value: "Not Mentioned", label: "Not Mentioned" },
];

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NOTDISCLOSE", label: "Prefer Not To Say" },
];

const validityMemberOptions = [
  { value: "All Members", label: "All Members" },
  { value: "ACTIVE", label: "Active Members" },
  { value: "INACTIVE", label: "Inactive Members" },
];

const validityEnquireOptions = [
  { value: "All Enquiries", label: "All Enquiries" },
  { value: "Open Enquiries", label: "Open Enquiries" },
  { value: "Lost Enquiries", label: "Lost Enquiries" },
];

const MemberEmailFilterPanel = ({
  formik,
  filterClub,
  filterMemberValidity,
  filterLeadValidity,
  filterAgeGroup,
  filterGender,
  filterServiceType,
  filterServiceName,
  filterLeadSource,
  filterExpiryFrom,
  filterExpiryTo,
  setFilterValue,
  onMemberIdsFetched,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const panelRef = useRef(null);

  const [serviceList, setServiceList] = useState([]);
  const [servicesType, setServicesType] = useState([]);
  const [clubList, setClubList] = useState([]);

  // Draft state — only committed on Apply
  const [draft, setDraft] = useState({
    filterClub: null,
    filterMemberValidity: null,
    filterLeadValidity: null,
    filterAgeGroup: null,
    filterGender: null,
    filterServiceType: null,
    filterServiceName: null,
    filterLeadSource: null,
    filterExpiryFrom: null,
    filterExpiryTo: null,
  });

  // ─── Fetch helpers — always RETURN data so callers don't depend on state ────

  const fetchService = async (clubId) => {
    if (!clubId) { setServiceList([]); return []; }
    try {
      const res = await authAxios().get(`/service/list?club_id=${clubId}`);
      const data = filterActiveItems(res.data?.data || res?.data || []);
      setServiceList(data);
      return data; // ✅ return raw array, not state
    } catch {
      toast.error("Failed to fetch services");
      return [];
    }
  };

  const fetchServiceNames = async (serviceId) => {
    if (!serviceId) { setServicesType([]); return []; }
    try {
      const res = await authAxios().get(
        `/package/list?page=1&limit=10&service_id=${serviceId}`,
      );
      const options = filterActiveItems(res.data?.data || []).map((item) => ({
        label: item.name,
        value: item.id, // ✅ this is a number from the API
      }));
      setServicesType(options);
      return options; // ✅ return options, not state
    } catch {
      toast.error("Failed to fetch service names");
      return [];
    }
  };

  const fetchClub = async () => {
    try {
      const res = await authAxios().get("/club/list");
      setClubList(filterActiveItems(res.data?.data || []));
    } catch {
      toast.error("Failed to fetch clubs");
    }
  };

  // ─── Initial loads ──────────────────────────────────────────────────────────

  const dispatch = useDispatch();
  const { lists } = useSelector((state) => state.optionList);
  useEffect(() => { dispatch(fetchOptionList("LEAD_SOURCE")); }, [dispatch]);
  useEffect(() => { fetchClub(); }, []);

  // ─── Sync chips when GET prefill arrives ────────────────────────────────────
  //
  // KEY FIX: We use the DATA RETURNED by fetchService/fetchServiceNames directly
  // instead of reading state — because setState is async and the state won't be
  // updated by the time we build the chip options in the same tick.
  //
  // KEY FIX 2: service_type / service_name from the API are STRING IDs (e.g. "13").
  // The options list has numeric IDs. We coerce with Number() before matching.
  //
  useEffect(() => {
    const hasAny =
      filterClub || filterMemberValidity || filterLeadValidity ||
      filterAgeGroup || filterGender || filterServiceType ||
      filterServiceName || filterLeadSource || filterExpiryFrom || filterExpiryTo;

    if (!hasAny) return;

    const syncChips = async () => {
      // Build service options from returned data (not state)
      let resolvedServiceOptions = [];
      if (filterClub) {
        const raw = await fetchService(filterClub);
        resolvedServiceOptions = raw
          .map((i) => ({ label: i.name, value: i.id, type: i.type }))
          .filter((i) => i.type !== "PRODUCT");
      }

      // Build package options from returned data (not state)
      let resolvedPackageOptions = [];
      if (filterServiceType) {
        // ✅ Coerce string ID → number to match the API's numeric package IDs
        resolvedPackageOptions = await fetchServiceNames(Number(filterServiceType));
      }

      setAppliedFilters({
        club_id:         filterClub          || null,
        member_validity: filterMemberValidity || null,
        lead_validity:   filterLeadValidity   || null,
        ageGroup:        filterAgeGroup       || null,
        gender:          filterGender         || null,
        service_type:    filterServiceType    || null,
        service_name:    filterServiceName    || null,
        leadSource:      filterLeadSource     || null,
        expiry_from:     filterExpiryFrom     || null,
        expiry_to:       filterExpiryTo       || null,
        // ✅ Stash resolved lists so getChipLabel can use them immediately
        _serviceOptions: resolvedServiceOptions,
        _packageOptions: resolvedPackageOptions,
      });
    };

    syncChips();
  }, [
    filterClub, filterMemberValidity, filterLeadValidity,
    filterAgeGroup, filterGender, filterServiceType,
    filterServiceName, filterLeadSource, filterExpiryFrom, filterExpiryTo,
  ]);

  // ─── Draft panel fetches ────────────────────────────────────────────────────

  useEffect(() => {
    if (draft.filterClub) fetchService(draft.filterClub);
    else { setServiceList([]); setServicesType([]); }
  }, [draft.filterClub]);

  useEffect(() => {
    if (draft.filterServiceType) fetchServiceNames(Number(draft.filterServiceType));
    else setServicesType([]);
  }, [draft.filterServiceType]);

  // ─── Panel open / close ─────────────────────────────────────────────────────

  const handleOpenPanel = () => {
    setDraft({
      filterClub, filterMemberValidity, filterLeadValidity,
      filterAgeGroup, filterGender, filterServiceType,
      filterServiceName, filterLeadSource, filterExpiryFrom, filterExpiryTo,
    });
    setShowFilters(true);
  };

  const handleClosePanel = () => setShowFilters(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) handleClosePanel();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateDraft = (field, value) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  // ─── Derived options (for the filter panel dropdowns) ───────────────────────

  const leadSourceOptions = lists["LEAD_SOURCE"] || [];
  const serviceOptions = serviceList
    .map((item) => ({ label: item.name, value: item.id, type: item.type }))
    .filter((item) => item.type !== "PRODUCT");
  const clubOptions = clubList.map((item) => ({ label: item.name, value: item.id }));

  // ─── Apply ──────────────────────────────────────────────────────────────────

  const handleApply = async () => {
    Object.entries(draft).forEach(([field, value]) => setFilterValue(field, value));

    const keyMap = {
      club_id:         "filterClub",
      member_validity: "filterMemberValidity",
      lead_validity:   "filterLeadValidity",
      ageGroup:        "filterAgeGroup",
      gender:          "filterGender",
      leadSource:      "filterLeadSource",
      service_type:    "filterServiceType",
      service_name:    "filterServiceName",
      expiry_from:     "filterExpiryFrom",
      expiry_to:       "filterExpiryTo",
    };
    Object.entries(keyMap).forEach(([, formikKey]) => {
      formik.setFieldValue(formikKey, draft[formikKey], false);
      formik.setFieldTouched(formikKey, false, false);
    });

    // After Apply, serviceOptions/servicesType are already populated from draft fetches
    setAppliedFilters({
      club_id:         draft.filterClub          || null,
      member_validity: draft.filterMemberValidity || null,
      lead_validity:   draft.filterLeadValidity   || null,
      ageGroup:        draft.filterAgeGroup       || null,
      gender:          draft.filterGender         || null,
      service_type:    draft.filterServiceType    || null,
      service_name:    draft.filterServiceName    || null,
      leadSource:      draft.filterLeadSource     || null,
      expiry_from:     draft.filterExpiryFrom     || null,
      expiry_to:       draft.filterExpiryTo       || null,
      _serviceOptions: serviceOptions,
      _packageOptions: servicesType,
    });

    setShowFilters(false);
    if (!draft.filterClub) return;

    try {
      const entityType = formik?.values?.module === "Member" ? "MEMBER" : "LEAD";
      const params = new URLSearchParams();
      params.append("club_id", draft.filterClub);
      params.append("entity_type", entityType);
      if (draft.filterAgeGroup)       params.append("age_group",       draft.filterAgeGroup);
      if (draft.filterGender)         params.append("gender",          draft.filterGender);
      if (draft.filterServiceType)    params.append("service_id",      draft.filterServiceType);
      if (draft.filterServiceName)    params.append("package_id",      draft.filterServiceName);
      if (draft.filterLeadSource)     params.append("lead_source",     draft.filterLeadSource);
      if (draft.filterMemberValidity) params.append("member_validity", draft.filterMemberValidity);
      if (draft.filterLeadValidity)   params.append("lead_validity",   draft.filterLeadValidity);
      if (draft.filterExpiryFrom)
        params.append("expiry_from", draft.filterExpiryFrom.toISOString().slice(0, 10));
      if (draft.filterExpiryTo)
        params.append("expiry_to",   draft.filterExpiryTo.toISOString().slice(0, 10));

      const res = await authAxios().post(
        `/emailCampaign/filter/member/list?${params.toString()}`,
      );
      const members = res.data?.data || [];

      if (members.length === 0) {
        toast.warning(
          formik?.values?.module === "Member"
            ? "No members found for the selected criteria. Please adjust your filters."
            : "No enquiries found for the selected criteria. Please adjust your filters.",
        );
        onMemberIdsFetched([]);
        return;
      }

      const ids = members.map((m) => m.id);
      onMemberIdsFetched(ids);
      toast.success(
        `${ids.length} ${formik?.values?.module === "Member" ? "member(s)" : "enquiry(ies)"} found.`,
      );
    } catch {
      toast.error("Failed to fetch member list");
      onMemberIdsFetched([]);
    }
  };

  // ─── Remove chip ────────────────────────────────────────────────────────────

  const handleRemoveFilter = (key) => {
    const keyMap = {
      club_id:         "filterClub",
      member_validity: "filterMemberValidity",
      lead_validity:   "filterLeadValidity",
      ageGroup:        "filterAgeGroup",
      gender:          "filterGender",
      leadSource:      "filterLeadSource",
      service_type:    "filterServiceType",
      service_name:    "filterServiceName",
      expiry_from:     "filterExpiryFrom",
      expiry_to:       "filterExpiryTo",
    };
    setAppliedFilters((prev) => ({ ...prev, [key]: null }));
    if (keyMap[key]) {
      setFilterValue(keyMap[key], null);
      formik.setFieldTouched(keyMap[key], false);
    }
    onMemberIdsFetched([]);
  };

  // ─── Chip label resolver ────────────────────────────────────────────────────
  //
  // Uses _serviceOptions / _packageOptions stashed inside appliedFilters at the
  // time chips were built — so labels are always correct even if state differs.
  // Also coerces string IDs to numbers before matching (API quirk).
  //
  const getChipLabel = (key, value) => {
    if (value instanceof Date) return value.toLocaleDateString();

    // ✅ Coerce string "13" → 13 for ID-based lookups
    const numericValue = isNaN(Number(value)) ? value : Number(value);

    const optionsMap = {
      club_id:         clubOptions,
      member_validity: validityMemberOptions,
      lead_validity:   validityEnquireOptions,
      ageGroup:        ageGroupOptions,
      gender:          genderOptions,
      service_type:    appliedFilters._serviceOptions || serviceOptions,
      service_name:    appliedFilters._packageOptions || servicesType,
      leadSource:      leadSourceOptions,
    };

    const options = optionsMap[key];
    if (!options) return String(value);

    // Try string match first, then numeric match
    const matched =
      options.find((o) => o.value === value) ||
      options.find((o) => o.value === numericValue);

    return matched ? matched.label : String(value);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const chipKeys = [
    "club_id", "member_validity", "lead_validity", "ageGroup",
    "gender", "service_type", "service_name", "leadSource",
    "expiry_from", "expiry_to",
  ];

  return (
    <div className="relative max-w-fit w-full" ref={panelRef}>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={handleOpenPanel}
          className="w-[34px] h-[30px] bg-white text-black rounded-[5px] flex items-center justify-center border-[#D4D4D4] border-[2px]"
        >
          <HiOutlineAdjustmentsHorizontal className="text-lg" />
        </button>
        <span className="text-md">Criteria</span>
      </div>

      {showFilters && (
        <div className="absolute top-[100%] mt-4 z-[333] bg-white border rounded-lg shadow-md animate-fade-in">
          <div className="absolute top-[-15px] left-[20px]"><IoTriangle /></div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 min-w-[500px]">

              {/* Club */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Club<span className="text-red-500">*</span>
                </label>
                <Select
                  value={clubOptions.find((o) => o.value === draft.filterClub) || null}
                  onChange={(option) => {
                    updateDraft("filterClub", option?.value || null);
                    updateDraft("filterServiceType", null);
                    updateDraft("filterServiceName", null);
                    setServicesType([]);
                  }}
                  options={clubOptions}
                  placeholder="Select Club"
                  styles={customStyles}
                />
              </div>

              {/* Member Validity */}
              {formik?.values?.module === "Member" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Validity<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={validityMemberOptions.find((o) => o.value === draft.filterMemberValidity) || null}
                    onChange={(option) => updateDraft("filterMemberValidity", option?.value || null)}
                    options={validityMemberOptions}
                    placeholder="Select Validity"
                    styles={customStyles}
                  />
                </div>
              )}

              {/* Enquiries Validity */}
              {formik?.values?.module === "Enquiries" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Validity<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={validityEnquireOptions.find((o) => o.value === draft.filterLeadValidity) || null}
                    onChange={(option) => updateDraft("filterLeadValidity", option?.value || null)}
                    options={validityEnquireOptions}
                    placeholder="Select Validity"
                    styles={customStyles}
                  />
                </div>
              )}

              {/* Age Group */}
              <div>
                <label className="block mb-1 text-sm font-medium">Age Group</label>
                <Select
                  value={ageGroupOptions.find((o) => o.value === draft.filterAgeGroup) || null}
                  onChange={(option) => updateDraft("filterAgeGroup", option?.value || null)}
                  options={ageGroupOptions}
                  placeholder="Select Age Group"
                  styles={customStyles}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block mb-1 text-sm font-medium">Gender</label>
                <Select
                  value={genderOptions.find((o) => o.value === draft.filterGender) || null}
                  onChange={(option) => updateDraft("filterGender", option?.value || null)}
                  options={genderOptions}
                  placeholder="Select Gender"
                  styles={customStyles}
                />
              </div>

              {formik?.values?.module === "Member" && (
                <>
                  {/* Service Type */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">Service Type</label>
                    <Select
                      // ✅ Coerce to number for matching against API numeric IDs
                      value={serviceOptions.find((o) => o.value === Number(draft.filterServiceType)) || null}
                      onChange={(option) => {
                        updateDraft("filterServiceType", option?.value || null);
                        updateDraft("filterServiceName", null);
                        if (!option) setServicesType([]);
                      }}
                      options={serviceOptions}
                      placeholder="Select Service"
                      styles={customStyles}
                      isDisabled={!draft.filterClub}
                    />
                  </div>

                  {/* Service Name */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">Service Name</label>
                    <Select
                      // ✅ Coerce to number for matching
                      value={servicesType.find((o) => o.value === Number(draft.filterServiceName)) || null}
                      onChange={(option) => updateDraft("filterServiceName", option?.value || null)}
                      options={servicesType}
                      placeholder="Select Category"
                      styles={customStyles}
                      isDisabled={!draft.filterServiceType}
                    />
                  </div>
                </>
              )}

              {/* Lead Source */}
              {formik?.values?.module === "Enquiries" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">Lead Source</label>
                  <Select
                    value={leadSourceOptions.find((o) => o.value === draft.filterLeadSource) || null}
                    onChange={(option) => updateDraft("filterLeadSource", option?.value || null)}
                    options={leadSourceOptions}
                    placeholder="Select Lead Source"
                    styles={customStyles}
                  />
                </div>
              )}

              {formik?.values?.module === "Member" && (
                <>
                  {/* Expiry From */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">Membership Expiry</label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]"><LuCalendar /></span>
                      <DatePicker
                        selected={draft.filterExpiryFrom}
                        onChange={(date) => {
                          updateDraft("filterExpiryFrom", date);
                          if (draft.filterExpiryTo && date && draft.filterExpiryTo < date)
                            updateDraft("filterExpiryTo", null);
                        }}
                        placeholderText="From"
                        className="input--icon"
                        dateFormat="dd/MM/yyyy"
                      />
                    </div>
                  </div>

                  {/* Expiry To */}
                  <div>
                    <label className="block mb-1 text-sm font-medium opacity-0">Membership Expiry</label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]"><LuCalendar /></span>
                      <DatePicker
                        selected={draft.filterExpiryTo}
                        onChange={(date) => updateDraft("filterExpiryTo", date)}
                        placeholderText="To"
                        className="input--icon"
                        dateFormat="dd/MM/yyyy"
                        minDate={draft.filterExpiryFrom || null}
                        disabled={!draft.filterExpiryFrom}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button type="button" onClick={handleApply} className="px-4 py-2 bg-black text-white rounded">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applied Filter Chips */}
      {chipKeys.some((k) => appliedFilters[k]) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {chipKeys.map((key) => {
            const value = appliedFilters[key];
            if (!value) return null;
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-1 border rounded-full bg-[#EEEEEE] min-h-[30px] px-3 text-sm"
              >
                <span>{getChipLabel(key, value)}</span>
                <IoClose onClick={() => handleRemoveFilter(key)} className="cursor-pointer text-xl" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemberEmailFilterPanel;