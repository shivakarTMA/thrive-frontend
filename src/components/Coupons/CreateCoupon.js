// CreateCoupon.jsx
import React, { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaListUl } from "react-icons/fa6";
import Select from "react-select";
import {
  blockInvalidNumberKeys,
  blockNonLettersAndNumbers,
  durationValueInteger,
  filterActiveItems,
  sanitizePositiveInteger,
  sanitizeTextWithNumbers,
  selectIcon,
} from "../../Helper/helper";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { LuCalendar, LuPlug } from "react-icons/lu";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const discountType = [
  { label: "Percentage", value: "PERCENTAGE" },
  { label: "Fixed", value: "FIXED" },
];

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const applicableTypeOptions = [
  { label: "Subscription", value: "SUBSCRIPTION" },
  { label: "Package", value: "PACKAGE" },
  { label: "Product", value: "PRODUCT" },
  { label: "All", value: "ALL" },
];

const parseDate = (v) => (v ? new Date(v) : null);

const CreateCoupon = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
  setOriginalApplicableRules,
}) => {
  const [club, setClub] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [products, setProducts] = useState([]);
  const [checkCouponStatus, setCheckCouponStatus] = useState("");

  const [loadingLists, setLoadingLists] = useState({
    subscriptions: false,
    packages: false,
    products: false,
  });

  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || response.data || [];
      const activeOnly = filterActiveItems(data);
      setClub(activeOnly);
    } catch (error) {
      console.log(error)
    }
  };

  const fetchSubscriptions = async (clubId) => {
    try {
      if (!clubId) return; // No club selected

      setLoadingLists((s) => ({ ...s, subscriptions: true }));

      const response = await authAxios().get("/subscription-plan/list", {
        params: { club_id: clubId }, // send club_id as query param if API supports it
      });

      const raw = response.data?.data || response.data || [];

      // Filter active & PAID
      const activeOnly = (Array.isArray(raw) ? raw : []).filter(
        (item) =>
          String(item.status || "").toUpperCase() === "ACTIVE" &&
          String(item.booking_type || "").toUpperCase() === "PAID" &&
          Number(item.club_id) === Number(clubId), // filter by club
      );

      setSubscriptions(activeOnly);
      setLoadingLists((s) => ({ ...s, subscriptions: false }));
    } catch (error) {
      console.log(error)
      setLoadingLists((s) => ({ ...s, subscriptions: false }));
    }
  };

  const fetchPackages = async (clubId) => {
    try {
      if (!clubId) return;

      setLoadingLists((s) => ({ ...s, packages: true }));

      const response = await authAxios().get("/package/list", {
        params: { club_id: clubId },
      });

      const raw = response.data?.data || response.data || [];

      const activeOnly = (Array.isArray(raw) ? raw : []).filter(
        (item) =>
          String(item.status || "").toUpperCase() === "ACTIVE" &&
          String(item.booking_type || "").toUpperCase() === "PAID" &&
          Number(item.club_id) === Number(clubId),
      );

      setPackages(activeOnly);
      setLoadingLists((s) => ({ ...s, packages: false }));
    } catch (error) {
      console.log(error)
      setLoadingLists((s) => ({ ...s, packages: false }));
    }
  };

  const fetchProducts = async (clubId) => {
  try {
    if (!clubId) return; // No club selected

    setLoadingLists((s) => ({ ...s, products: true }));

    const response = await authAxios().get("/product/list", {
      params: { club_id: clubId }, // send club_id as query param if API supports it
    });

    const raw = response.data?.data || response.data || [];

    // Filter only ACTIVE products for the selected club
    const activeOnly = (Array.isArray(raw) ? raw : []).filter(
      (item) =>
        String(item.status || "").toUpperCase() === "ACTIVE" &&
        Number(item.club_id) === Number(clubId)
    );

    setProducts(activeOnly);
    setLoadingLists((s) => ({ ...s, products: false }));
  } catch (error) {
    console.log(error)
    setLoadingLists((s) => ({ ...s, products: false }));
  }
};

  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const subscriptionOptions =
    subscriptions?.map((item) => ({
      label: item.title || item.name || `${item.id}`,
      value: item.id,
      plan_type: item.plan_type,
      club_id: item.club_id,
    })) || [];

  const packageOptions =
    packages?.map((item) => ({
      label: item.name || `${item.id}`,
      value: item.id,
      club_id: item.club_id,
    })) || [];

  const productOptions =
    products?.map((item) => ({
      label: item.name || `${item.id}`,
      value: item.id,
      club_id: item.club_id,
    })) || [];

useEffect(() => {
  if (!editingOption) return;

  const fetchCouponById = async (id) => {
    try {
      const res = await authAxios().get(`/coupon/${id}`);
      const data = res.data?.data || res.data || null;

      if (data) {
        const couponData = data?.coupon || data;
        setCheckCouponStatus(couponData?.status || "");

        const clubId = couponData?.club_id;

        // ✅ FIRST set club
        formik.setFieldValue("coupon.club_id", clubId, false);

        // ✅ THEN fetch dependent lists
        await fetchSubscriptions(clubId);
        await fetchPackages(clubId);
        await fetchProducts(clubId);

        // ✅ THEN set rest of fields
        const coupon = {
          id: couponData?.id || "",
          club_id: clubId,
          code: couponData?.code || "",
          description: couponData?.description || "",
          discount_type: couponData?.discount_type || "",
          discount_value: couponData?.discount_value || "",
          max_usage: couponData?.max_usage || "",
          per_user_limit: couponData?.per_user_limit || "",
          start_date: couponData?.start_date || "",
          end_date: couponData?.end_date || "",
          position: couponData?.position || "",
          status: couponData?.status || "",
        };

        Object.entries(coupon).forEach(([k, v]) => {
          formik.setFieldValue(`coupon.${k}`, v, false);
        });

        const rules =
          Array.isArray(data?.applicable_rules) &&
          data.applicable_rules.length
            ? data.applicable_rules.map((r) => ({
                id: r.id,
                applicable_type: r.applicable_type || "",
                applicable_id: r.applicable_id ?? null,
              }))
            : [{ applicable_type: "ALL", applicable_id: null }];

        formik.setFieldValue("applicable_rules", rules, false);

        if (typeof setOriginalApplicableRules === "function") {
          setOriginalApplicableRules(JSON.parse(JSON.stringify(rules)));
        }
      }
    } catch (err) {
      console.log(err)
    }
  };

  fetchCouponById(editingOption);
}, [editingOption]);

useEffect(() => {
  const rules = formik.values?.applicable_rules || [];
  const clubId = formik.values?.coupon?.club_id;

  if (!rules.length || !clubId) return;

  const types = new Set(rules.map((r) => r?.applicable_type).filter(Boolean));

  if (types.has("SUBSCRIPTION")) fetchSubscriptions(clubId);
  if (types.has("PACKAGE")) fetchPackages(clubId);
  if (types.has("PRODUCT")) fetchProducts(clubId);
}, [formik.values?.applicable_rules, formik.values?.coupon?.club_id]);


  const addApplicableRule = () => {
    const current = Array.isArray(formik.values.applicable_rules)
      ? [...formik.values.applicable_rules]
      : [];

    current.push({ applicable_type: "", applicable_id: null });

    formik.setFieldValue("applicable_rules", current);
  };

  const removeApplicableRule = (index) => {
    const current = Array.isArray(formik.values.applicable_rules)
      ? [...formik.values.applicable_rules]
      : [];

    if (current.length <= 1) {
      formik.setFieldValue("applicable_rules", [
        { applicable_type: "ALL", applicable_id: null },
      ]);
      return;
    }

    current.splice(index, 1);

    formik.setFieldValue("applicable_rules", current);
  };

  const handleApplicableTypeChange = async (index, option) => {
    const type = option?.value ?? "";

    const current = [...formik.values.applicable_rules];

    current[index] = {
      ...current[index],
      applicable_type: type,
      applicable_id: null,
    };

    formik.setFieldValue("applicable_rules", current);

    if (type === "SUBSCRIPTION") await fetchSubscriptions();
    if (type === "PACKAGE") await fetchPackages();
    if (type === "PRODUCT") await fetchProducts();
  };

  const handleApplicableIdChange = (index, option) => {
  const id = option?.value ?? null;
  const current = [...formik.values.applicable_rules];
  const currentType = current[index]?.applicable_type;

  // ✅ If "All" selected
  if (Number(id) === 0) {
    const filtered = current.filter(
      (rule, idx) =>
        idx === index || rule?.applicable_type !== currentType
    );

    filtered[index] = {
      ...filtered[index],
      applicable_id: 0,
    };

    formik.setFieldValue("applicable_rules", filtered);
    return;
  }

  // Normal selection
  current[index] = {
    ...current[index],
    applicable_id: id,
  };

  formik.setFieldValue("applicable_rules", current);
};

  const getSelectedApplicableIds = (excludeIndex = null) => {
    return (formik.values.applicable_rules || [])
      .filter((_, idx) => idx !== excludeIndex)
      .map((rule) => rule?.applicable_id)
      .filter(Boolean);
  };

  const getApplicableOptions = (type, ruleIndex = null) => {
    const clubId = formik.values?.coupon?.club_id;

    let list = [];

    switch (type) {
      case "SUBSCRIPTION":
        list = subscriptionOptions
          .filter((opt) => (!clubId ? true : opt.club_id === clubId))
          .map((opt) => ({
            ...opt,
            label: `${opt.label} (${opt.plan_type})`,
          }));
        break;

      case "PACKAGE":
        list = packageOptions.filter((opt) =>
          !clubId ? true : opt.club_id === clubId,
        );
        break;

      case "PRODUCT":
        list = productOptions.filter((opt) =>
          !clubId ? true : opt.club_id === clubId,
        );
        break;

      default:
        return [];
    }

    const selectedIds = getSelectedApplicableIds(ruleIndex);

    // return list.filter((opt) => !selectedIds.includes(opt.value));
      let filteredList = list.filter((opt) => !selectedIds.includes(opt.value));

      // ✅ ADD "All" option (value = 0)
      filteredList = [{ label: "All", value: 0 }, ...filteredList];

      return filteredList;
  };

  const getSelectedApplicableOption = (type, id) => {
    if (!type) return null;

    // ✅ handle "All"
    // if (Number(id) === 0) {
    //   return { label: "All", value: 0 };
    // }
    if (id === 0) {
      return { label: "All", value: 0 };
    }

    if (!id) return null; // 🔥 IMPORTANT (prevents auto-select)

    let list = [];

    switch (type) {
      case "SUBSCRIPTION":
        list = subscriptionOptions.map((opt) => ({
          ...opt,
          label: `${opt.label} (${opt.plan_type})`,
        }));
        break;

      case "PACKAGE":
        list = packageOptions;
        break;

      case "PRODUCT":
        list = productOptions;
        break;

      default:
        return null;
    }

    return list.find((opt) => String(opt.value) === String(id)) || null;
  };

  // ADD THIS FUNCTION ABOVE return()

const getAvailableApplicableTypes = (currentIndex) => {
  const rules = formik.values?.applicable_rules || [];

  const blockedTypes = rules
    .filter(
      (r, idx) =>
        idx !== currentIndex &&
        Number(r?.applicable_id) === 0 && // "All" selected
        r?.applicable_type
    )
    .map((r) => r.applicable_type);

  return applicableTypeOptions.filter(
    (opt) => !blockedTypes.includes(opt.value)
  );
};

  useEffect(() => {
    const maxUsage = Number(formik.values.coupon?.max_usage);
    const perUser = Number(formik.values.coupon?.per_user_limit);

    if (perUser > maxUsage) {
      formik.setFieldValue("coupon.per_user_limit", maxUsage);
    }
  }, [formik.values.coupon?.max_usage]);

  return (
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="hide--overflow w-[95%] max-w-4xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit Coupon" : "Create Coupon"}
          </h2>

          <div
            className="close--lead cursor-pointer"
            onClick={() => {
              formik.resetForm();
              setShowModal(false);
            }}
          >
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="bg-white rounded-b-[10px]">
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  {/* Club Name */}
                  <div>
                    <label className="mb-2 block">
                      Club Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="club_id"
                        value={
                          clubOptions.find(
                            (option) =>
                              option.value?.toString() ===
                              String(formik.values.coupon.club_id),
                          ) || null
                        }
                        options={clubOptions}
                        // onChange={(option) =>
                        //   formik.setFieldValue(
                        //     "coupon.club_id",
                        //     option?.value ?? null,
                        //   )
                        // }
                        onChange={(option) => {
                          const clubId = option?.value ?? null;
                          formik.setFieldValue("coupon.club_id", clubId);

                          // Fetch items for selected club
                          fetchSubscriptions(clubId);
                          fetchPackages(clubId);
                          fetchProducts(clubId);
                        }}
                        onBlur={() =>
                          formik.setFieldTouched("coupon.club_id", true)
                        }
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.coupon?.club_id &&
                      formik.errors.coupon?.club_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.club_id}
                        </p>
                      )}
                  </div>

                  {/* Code */}
                  <div>
                    <label className="mb-2 block">
                      Code<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="coupon.code"
                        value={formik.values.coupon?.code || ""}
                        // onChange={formik.handleChange}
                        onKeyDown={blockNonLettersAndNumbers}
                        onChange={(e) => {
                          const cleaned = sanitizeTextWithNumbers(e.target.value);
                          const uppercased = cleaned.toUpperCase();
                          formik.setFieldValue("coupon.code", uppercased);
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon uppercase"
                      />
                    </div>
                    {formik.touched.coupon?.code &&
                      formik.errors.coupon?.code && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.code}
                        </p>
                      )}
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="mb-2 block">
                      Type<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="coupon.discount_type"
                        value={
                          discountType.find(
                            (option) =>
                              option.value?.toString() ===
                              String(formik.values.coupon?.discount_type),
                          ) || null
                        }
                        options={discountType}
                        // onChange={(option) =>
                        //   formik.setFieldValue(
                        //     "coupon.discount_type",
                        //     option?.value ?? "",
                        //   )
                        // }
                        onChange={(option) => {
                          formik.setFieldValue(
                            "coupon.discount_type",
                            option?.value ?? "",
                          );

                          if (
                            option?.value === "PERCENTAGE" &&
                            formik.values.coupon.discount_value > 100
                          ) {
                            formik.setFieldValue("coupon.discount_value", 100);
                          }
                        }}
                        onBlur={() =>
                          formik.setFieldTouched("coupon.discount_type", true)
                        }
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.coupon?.discount_type &&
                      formik.errors.coupon?.discount_type && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.discount_type}
                        </p>
                      )}
                  </div>

                  {/* Value */}
                  <div>
                    <label className="mb-2 block">
                      Value<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="coupon.discount_value"
                        value={formik.values.coupon?.discount_value || ""}
                        // onChange={formik.handleChange}
                        onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                        // onChange={(e) => {
                        //   const cleanValue = durationValueInteger(
                        //     e.target.value,
                        //   );
                        //   formik.setFieldValue(
                        //     "coupon.discount_value",
                        //     cleanValue,
                        //   );
                        // }}
                        onChange={(e) => {
                          let cleanValue = durationValueInteger(e.target.value);

                          if (
                            formik.values.coupon?.discount_type === "PERCENTAGE"
                          ) {
                            if (Number(cleanValue) > 100) {
                              cleanValue = 100;
                              toast.error(
                                "Percentage discount cannot exceed 100",
                              );
                            }
                          }

                          formik.setFieldValue(
                            "coupon.discount_value",
                            cleanValue,
                          );
                        }}
                        onBlur={formik.handleBlur}
                        min="1"
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.discount_value &&
                      formik.errors.coupon?.discount_value && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.discount_value}
                        </p>
                      )}
                  </div>

                  {/* Max Usage */}
                  <div>
                    <label className="mb-2 block">
                      Max Usage<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="coupon.max_usage"
                        value={formik.values.coupon?.max_usage ?? ""}
                        // onChange={formik.handleChange}
                        onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                        onChange={(e) => {
                          const cleanValue = sanitizePositiveInteger(
                            e.target.value,
                          );
                          formik.setFieldValue("coupon.max_usage", cleanValue);
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon number--appearance-none"
                      />
                    </div>
                    {formik.touched.coupon?.max_usage &&
                      formik.errors.coupon?.max_usage && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.max_usage}
                        </p>
                      )}
                  </div>

                  {/* Per User Limit */}
                  <div>
                    <label className="mb-2 block">
                      Per User Limit<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="coupon.per_user_limit"
                        value={formik.values.coupon?.per_user_limit ?? ""}
                        // onChange={formik.handleChange}
                        onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                        // onChange={(e) => {
                        //   const cleanValue = sanitizePositiveInteger(
                        //     e.target.value,
                        //   );
                        //   formik.setFieldValue(
                        //     "coupon.per_user_limit",
                        //     cleanValue,
                        //   );
                        // }}
                        onChange={(e) => {
                          const cleanValue = sanitizePositiveInteger(
                            e.target.value,
                          );
                          formik.setFieldValue(
                            "coupon.per_user_limit",
                            cleanValue,
                          );
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon number--appearance-none"
                      />
                    </div>
                    {formik.touched.coupon?.per_user_limit &&
                      formik.errors.coupon?.per_user_limit && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon.per_user_limit}
                        </p>
                      )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="mb-2 block">
                      Position<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="coupon.position"
                        value={formik.values.coupon?.position ?? ""}
                        // onChange={formik.handleChange}
                        onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                        onChange={(e) => {
                          const cleanValue = sanitizePositiveInteger(
                            e.target.value,
                          );
                          formik.setFieldValue("coupon.position", cleanValue);
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.position &&
                      formik.errors.coupon?.position && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.coupon?.position}
                        </p>
                      )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="mb-2 block">
                      Start Date<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={parseDate(formik.values.coupon?.start_date)}
                        onChange={(date) =>
                          formik.setFieldValue(
                            "coupon.start_date",
                            date ? date.toISOString() : "",
                          )
                        }
                        dateFormat="dd-MM-yyyy"
                        minDate={new Date()}
                        className="input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.start_date &&
                      formik.errors.coupon?.start_date && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.coupon?.start_date}
                        </p>
                      )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="mb-2 block">
                      End Date<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <LuCalendar />
                      </span>
                      <DatePicker
                        selected={parseDate(formik.values.coupon?.end_date)}
                        onChange={(date) =>
                          formik.setFieldValue(
                            "coupon.end_date",
                            date ? date.toISOString() : "",
                          )
                        }
                        dateFormat="dd-MM-yyyy"
                        minDate={
                          parseDate(formik.values.coupon?.start_date) ||
                          new Date()
                        }
                        className="input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.end_date &&
                      formik.errors.coupon?.end_date && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.coupon?.end_date}
                        </p>
                      )}
                  </div>

                  {/* Status (only on edit) */}
                  {editingOption && (
                    <div>
                      <label className="mb-2 block">Status</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                          <LuPlug />
                        </span>
                        <Select
                          name="coupon.status"
                          value={
                            statusOptions.find(
                              (opt) =>
                                opt.value === formik.values.coupon?.status,
                            ) || null
                          }
                          options={statusOptions}
                          onChange={(option) =>
                            formik.setFieldValue(
                              "coupon.status",
                              option?.value ?? "",
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("coupon.status", true)
                          }
                          styles={selectIcon}
                          className="!capitalize"
                        />
                      </div>
                    </div>
                  )}

                  {/* Description full width */}
                  <div className="col-span-3">
                    <label className="mb-2 block">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaListUl className="absolute top-[15px] left-[15px]" />
                      <textarea
                        name="coupon.description"
                        value={formik.values.coupon?.description || ""}
                        // onChange={formik.handleChange}
                        onKeyDown={blockNonLettersAndNumbers}
                        onChange={(e) => {
                          const cleaned = sanitizeTextWithNumbers(
                            e.target.value,
                          );
                          formik.setFieldValue("coupon.description", cleaned);
                        }}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.coupon?.description &&
                      formik.errors.coupon?.description && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.coupon?.description}
                        </p>
                      )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Applicable Rules</h3>

                    <button
                      type="button"
                      onClick={addApplicableRule}
                      className="px-3 py-1.5 bg-black text-white rounded flex items-center gap-2 text-sm"
                    >
                      <FiPlus /> Add Rule
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(formik.values?.applicable_rules || []).map(
                      (rule, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-[1fr_1fr_auto] gap-4 p-4 border rounded-lg bg-gray-50"
                        >
                          <div>
                            <label className="mb-2 block text-sm">
                              Applicable Type
                            </label>
                            <div className="relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                                <FaListUl />
                              </span>
                              <Select
                                value={
                                  applicableTypeOptions.find(
                                    (opt) =>
                                      opt.value === rule?.applicable_type,
                                  ) || null
                                }
                                // options={applicableTypeOptions}
                                options={getAvailableApplicableTypes(index)}
                                onChange={(option) =>
                                  handleApplicableTypeChange(index, option)
                                }
                                styles={selectIcon}
                                className="!capitalize"
                                isClearable
                              />
                            </div>
                            {formik.touched.applicable_rules?.[index]
                              ?.applicable_type &&
                              formik.errors.applicable_rules?.[index]
                                ?.applicable_type && (
                                <p className="text-red-500 text-sm mt-1">
                                  {
                                    formik.errors.applicable_rules[index]
                                      .applicable_type
                                  }
                                </p>
                              )}
                          </div>

                          <div>
                            <label className="mb-2 block text-sm">
                              Applicable Item
                            </label>
                            <div className="relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                                <FaListUl />
                              </span>
                              <Select
                                value={
                                  rule?.applicable_type !== "ALL"
                                    ? getSelectedApplicableOption(
                                        rule?.applicable_type,
                                        rule?.applicable_id,
                                      )
                                    : null
                                }
                                options={getApplicableOptions(
                                  rule?.applicable_type,
                                  index,
                                )}
                                onChange={(option) =>
                                  handleApplicableIdChange(index, option)
                                }
                                isDisabled={
                                  !rule?.applicable_type ||
                                  rule?.applicable_type === "ALL"
                                }
                                isLoading={
                                  rule?.applicable_type === "SUBSCRIPTION"
                                    ? loadingLists.subscriptions
                                    : rule?.applicable_type === "PACKAGE"
                                      ? loadingLists.packages
                                      : rule?.applicable_type === "PRODUCT"
                                        ? loadingLists.products
                                        : false
                                }
                                placeholder={
                                  rule?.applicable_type === "ALL"
                                    ? "Not applicable"
                                    : !rule?.applicable_type
                                      ? "Choose type first"
                                      : "Select item..."
                                }
                                styles={{
                                  ...selectIcon,
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                className="!capitalize"
                                isClearable
                              />
                            </div>
                            {formik.touched.applicable_rules?.[index]
                              ?.applicable_id &&
                              formik.errors.applicable_rules?.[index]
                                ?.applicable_id && (
                                <p className="text-red-500 text-sm mt-1">
                                  {
                                    formik.errors.applicable_rules[index]
                                      .applicable_id
                                  }
                                </p>
                              )}
                          </div>

                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeApplicableRule(index)}
                              className={`p-2 hover:bg-red-50 rounded ${
                                (formik.values.applicable_rules || [])
                                  .length === 1
                                  ? "cursor-not-allowed pointer-events-none !bg-gray-100 text-gray-500"
                                  : "text-red-500"
                              }`}
                            >
                              <FiTrash2 className="text-xl" />
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
              {checkCouponStatus !== "EXPIRED" && (
                <div className="flex gap-4 py-5 px-6 justify-end bg-white border-t rounded-b-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      formik.resetForm();
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-transparent border border-gray-400 text-black rounded max-w-[150px] w-full"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded max-w-[150px] w-full"
                  >
                    {editingOption ? "Update" : "Submit"}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCoupon;
