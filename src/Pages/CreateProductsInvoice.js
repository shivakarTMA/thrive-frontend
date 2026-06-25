import React, { useEffect, useRef, useState, useCallback } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { useFormik } from "formik";
import Select from "react-select";
import { useSelector } from "react-redux";
import { RiDiscountPercentFill } from "react-icons/ri";
import { FaListCheck } from "react-icons/fa6";
import {
  allowLettersAndNumbers,
  blockNonLettersAndNumbers,
  customStyles,
  formatIndianNumber,
  sanitizeAlphaNumeric,
  selectIcon,
} from "../Helper/helper";
import { toast } from "react-toastify";
import { authAxios } from "../config/config";

const paymentMethodOptions = [
  { value: "NET_BANKING", label: "Net Banking" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "UPI_ICICI", label: "UPI" },
];

// ── Helper: create a blank item row ──────────────────────────────────────────
let _tempIdCounter = 0;
const createEmptyItem = () => ({
  tempId: ++_tempIdCounter,
  product_category_id: null,
  service_name: "",
  product_id: null,
  quantity: 1,
  productData: null,
});

const CreateProductsInvoice = ({
  setProductInvoiceModal,
  selectedLeadMember,
  clubId,
  memberProfile,
  onMemberUpdate,
}) => {
  const { user } = useSelector((state) => state.auth);

  // ── Core data ─────────────────────────────────────────────────────────────
  const [service, setService] = useState([]); // product categories
  const [productList, setProductList] = useState([]); // all active products

  // ── Multi-item state ──────────────────────────────────────────────────────
  const [items, setItems] = useState([createEmptyItem()]);

  // ── Delivery schedule ─────────────────────────────────────────────────────
  const [deliveryDate, setDeliveryDate] = useState(null); // TODAY | TOMORROW | DAY_AFTER
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [clubTiming, setClubTiming] = useState([]);

  // ── Voucher ───────────────────────────────────────────────────────────────
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherStatus, setVoucherStatus] = useState(null); // null | loading | success | error
  const [voucherMessage, setVoucherMessage] = useState("");

  // ── Payment modal ─────────────────────────────────────────────────────────
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [clubGstType, setClubGstType] = useState("");

  // ── Offline payment ───────────────────────────────────────────────────────
  const [offlinePaymentDetails, setOfflinePaymentDetails] = useState({
    method: null,
    transactionId: "",
  });
  const [offlineErrors, setOfflineErrors] = useState({
    method: "",
    transactionId: "",
  });

  // ── GST ───────────────────────────────────────────────────────────────────
  const [showGstDetails, setShowGstDetails] = useState(false);
  const initialGstState = {
    gst_registration_number: "",
    gst_registered_company_name: "",
    gst_registered_company_address: "",
  };
  const [customerGstData, setCustomerGstData] = useState(initialGstState);
  const [gstErrors, setGstErrors] = useState({
    gst_registration_number: "",
    gst_registered_company_name: "",
    gst_registered_company_address: "",
  });
  const [savedGstData, setSavedGstData] = useState(initialGstState);

  const paymentModeRef = useRef("ONLINE");
  const leadBoxRef = useRef(null);
  const [itemErrors, setItemErrors] = useState([]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Items helpers
  // ═══════════════════════════════════════════════════════════════════════════

  const addItem = () => {
    const hasIncompleteRow = items.some(
      (item) => !item.product_category_id || !item.product_id,
    );

    if (hasIncompleteRow) {
      toast.error("Please select Product Category and Item Name first");
      return;
    }

    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (tempId) => {
    if (items.length === 1) return; // always keep at least one row
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  const updateItem = (tempId, updates) =>
    setItems((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, ...updates } : i)),
    );

  /**
   * Return react-select options for products that belong to a given category.
   * Filters productList (already fetched) by product_category_id.
   */
  // const getFilteredProducts = (categoryId) => {
  //   if (!categoryId) return [];
  //   return productList
  //     .filter((p) => p.product_category_id === categoryId)
  //     .map((p) => ({ label: p.name, value: p.id, data: p }));
  // };
  const getFilteredProducts = (categoryId, currentTempId) => {
    if (!categoryId) return [];

    console.log("Selected Category ID:", categoryId);

    // selected products except current row
    const selectedProductIds = items
      .filter(
        (item) =>
          item.tempId !== currentTempId &&
          item.product_id
      )
      .map((item) => item.product_id);

    // console.log("Selected Product IDs:", selectedProductIds);

    // IMPORTANT FIX
    let filteredProducts = [];

    // category 1 means ALL
    if (Number(categoryId) === 1) {
      filteredProducts = productList.filter(
        (p) => !selectedProductIds.includes(p.id)
      );
    } else {
      filteredProducts = productList.filter(
        (p) =>
          Number(p.product_category_id) === Number(categoryId) &&
          !selectedProductIds.includes(p.id)
      );
    }

    // console.log("Filtered Products:", filteredProducts);

    return filteredProducts.map((p) => ({
      label: p.name,
      value: p.id,
      data: p,
    }));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Price calculation
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Aggregates totals across all item rows.
   * @param {number} discountAmount  – coupon discount already applied
   */

  const computeTotals = useCallback(
    (discountAmount = 0) => {
      let originalAmount = 0;
      let subtotalAmount = 0;
      let baseGstAmount = 0;

      items.forEach((item) => {
        if (item.productData) {
          const qty = item.quantity || 1;

          const itemAmount =
            parseFloat(item.productData.amount || 0) * qty;

          const itemTotalAmount =
            parseFloat(item.productData.total_amount || 0) * qty;

          const gstPercent =
            Number(item.productData.gst || 0);

          originalAmount += itemAmount;
          subtotalAmount += itemTotalAmount;

          console.log(itemTotalAmount,'itemTotalAmount');

          let gstAmount = 0;

          if (clubGstType === "IGST") {
            gstAmount =
              (itemTotalAmount * gstPercent) / 100;
          } else {
            const cgstAmount =
            Math.round(
              ((itemTotalAmount * (gstPercent / 2)) / 100) * 100
            ) / 100;

          const sgstAmount =
            Math.round(
              ((itemTotalAmount * (gstPercent / 2)) / 100) * 100
            ) / 100;

            gstAmount = cgstAmount + sgstAmount;
          }

          baseGstAmount += gstAmount;
        }
      });

      const discounted = Math.max(
        0,
        subtotalAmount - discountAmount
      );
      let adjustedGst = 0;
      const gstPercent =  Number(items?.[0]?.productData?.gst || 0);

      if (clubGstType === "IGST") {
        adjustedGst = (discounted * gstPercent) / 100;
      } else {
        const cgstAmount =
          Math.round(
            ((discounted * (gstPercent / 2)) / 100) * 100
          ) / 100;

        const sgstAmount =
          Math.round(
            ((discounted * (gstPercent / 2)) / 100) * 100
          ) / 100;

        adjustedGst = cgstAmount + sgstAmount;
      }

      const grandTotal = discounted + adjustedGst;

      return {
        originalAmount,
        subtotalAmount,
        gstAmount: adjustedGst,
        grandTotal,
      };
    },
    [items, clubGstType]
  );

  // Sync totals into formik whenever items change (coupon excluded – handled in applyCoupon)
  useEffect(() => {
    const discount = formik.values.discountAmount || 0;
    const { originalAmount, subtotalAmount, gstAmount, grandTotal } =
      computeTotals(discount);

      console.log(originalAmount,'originalAmount')

    formik.setValues(
      {
        ...formik.values,
        productDetails: {
          ...formik.values.productDetails,
          amount: originalAmount,
          total_amount: subtotalAmount,
          gst_amount: gstAmount,
        },
        final_amount: grandTotal,
        amount_pay: grandTotal,
      },
      false, // skip validation on this synthetic update
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // ═══════════════════════════════════════════════════════════════════════════
  // GST
  // ═══════════════════════════════════════════════════════════════════════════

  const handleGstCheckbox = (e) => {
    const checked = e.target.checked;
    setShowGstDetails(checked);
    if (!checked) {
      setCustomerGstData(initialGstState);
      setGstErrors({
        gst_registration_number: "",
        gst_registered_company_name: "",
        gst_registered_company_address: "",
      });
    } else {
      setCustomerGstData(savedGstData);
    }
  };

  const validateGstFields = () => {
    const errors = {};
    if (showGstDetails) {
      if (!customerGstData.gst_registration_number.trim())
        errors.gst_registration_number = "GST Number is required";
      if (!customerGstData.gst_registered_company_name.trim())
        errors.gst_registered_company_name = "Company Name is required";
      if (!customerGstData.gst_registered_company_address.trim())
        errors.gst_registered_company_address = "Company Address is required";
    }
    setGstErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Payload builder
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Returns a date string (YYYY-MM-DD) offset from today.
   * TODAY → +0, TOMORROW → +1, DAY_AFTER → +2
   */
  const getDateByKey = (key) => {
    const d = new Date();
    if (key === "TOMORROW") d.setDate(d.getDate() + 1);
    if (key === "DAY_AFTER") d.setDate(d.getDate() + 2);
    // Format as YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  /**
   * Combines a date key + a time string (HH:mm) into the API datetime format:
   * "YYYY-MM-DD HH:mm:00.000"
   */
  const buildDateTime = (dateKey, timeStr) => {
    // If delivery not selected → use current datetime
    if (!dateKey || !timeStr) {
      const now = new Date();

      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");

      const hh = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}.000`;
    }

    // Selected delivery date
    const dateStr = getDateByKey(dateKey);

    // HH:mm
    const timePart = timeStr.slice(0, 5);

    return `${dateStr} ${timePart}:00.000`;
  };

  const buildPaymentPayload = ({ values }) => {
    const validItems = items.filter((i) => i.product_id && i.productData);

    const payload = {
      order_type: "PRODUCT",
      // ✅ "products" array with id + quantity as required by the API
      products: validItems.map((i) => ({
        id: i.product_id,
        quantity: i.quantity,
      })),
      applicable_ids: validItems.map((i) => i.product_id),
      member_id: values.member_id || user?.id,
      paymentMode: paymentModeRef.current,
      // ✅ Computed datetime strings from delivery date key + time slot times
      delivery_start_date_time: buildDateTime(
        deliveryDate,
        selectedTimeSlot?.start_time || null,
      ),
      delivery_end_date_time: buildDateTime(
        deliveryDate,
        selectedTimeSlot?.end_time || null,
      ),
    };

    // Optional fields — only include when present
    if (values.coupon) payload.coupon_code = values.coupon;
    if (values.coins > 0) payload.coins = values.coins;
    if (offlinePaymentDetails.method?.value)
      payload.mode_of_payment = offlinePaymentDetails.method.value;
    if (offlinePaymentDetails.transactionId)
      payload.transaction_id = offlinePaymentDetails.transactionId;

    if (showGstDetails) {
      payload.gst_registration_number = customerGstData.gst_registration_number;
      payload.gst_registered_company_name =
        customerGstData.gst_registered_company_name;
      payload.gst_registered_company_address =
        customerGstData.gst_registered_company_address;
    }

    return payload;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Formik
  // ═══════════════════════════════════════════════════════════════════════════

  const initialValues = {
    member_id: null,
    club_id: null,
    coupon: "",
    discountAmount: 0,
    final_amount: 0,
    amount_pay: 0,
    coins: 0,
    productDetails: {
      amount: 0,
      total_amount: 0,
      gst_amount: 0,
    },
  };

  // ── Item + delivery validation ──────────────────────────────────────────────
  /**
   * Rules:
   *  1. Every added row must have BOTH category AND item (no half-filled rows)
   *  2. At least one complete row must exist
   *  3. A delivery time slot must be chosen
   */
  const validateItems = () => {
    let errors = [];

    items.forEach((item, index) => {
      let rowError = {};

      if (!item.product_category_id) {
        rowError.product_category_id = "Product category is required";
      }

      if (!item.product_id) {
        rowError.product_id = "Item name is required";
      }

      if (!item.quantity || item.quantity < 1) {
        rowError.quantity = "Quantity is required";
      }

      errors[index] = rowError;
    });

    setItemErrors(errors);

    const hasErrors = errors.some((err) => Object.keys(err).length > 0);

    if (hasErrors) {
      toast.error("Please fill all required fields");
      return false;
    }

    if (deliveryDate && !selectedTimeSlot) {
      toast.error("Please select delivery time slot");
      return false;
    }

    return true;
  };

  const validateOfflinePayment = () => {
    const errors = { method: "", transactionId: "" };
    if (paymentModeRef.current === "OFFLINE") {
      if (!offlinePaymentDetails.method?.value)
        errors.method = "Payment method is required";
      if (!offlinePaymentDetails.transactionId)
        errors.transactionId = "Transaction ID is required";
    }
    setOfflineErrors(errors);
    return !errors.method && !errors.transactionId;
  };

  const resetAllStates = () => {
    formik.resetForm();
    setItems([createEmptyItem()]);
    setDeliveryDate(null);
    setSelectedTimeSlot(null);
    setVoucherInput("");
    setVoucherStatus(null);
    setVoucherMessage("");
    setOfflinePaymentDetails({ method: null, transactionId: "" });
    setOfflineErrors({ method: "", transactionId: "" });
    paymentModeRef.current = "ONLINE";
    setPaymentModalOpen(false);
    setPaymentUrl("");
    setOrderNo("");
    setShowGstDetails(false);
    setGstErrors({
      gst_registration_number: "",
      gst_registered_company_name: "",
      gst_registered_company_address: "",
    });
  };

  const resetAllStatesOnline = () => {
    formik.resetForm();
    setItems([createEmptyItem()]);
    setDeliveryDate(null);
    setSelectedTimeSlot(null);
    setVoucherInput("");
    setVoucherStatus(null);
    setVoucherMessage("");
    setOfflinePaymentDetails({ method: null, transactionId: "" });
    setOfflineErrors({ method: "", transactionId: "" });
    paymentModeRef.current = "ONLINE";
    // setPaymentModalOpen(false);
    // setPaymentUrl("");
    // setOrderNo("");
    setShowGstDetails(false);
    setGstErrors({
      gst_registration_number: "",
      gst_registered_company_name: "",
      gst_registered_company_address: "",
    });
  };

  const formik = useFormik({
    initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, helpers) => {
      if (!validateItems()) return;
      if (showGstDetails && !validateGstFields()) return;

      try {
        if (paymentModeRef.current === "OFFLINE") {
          if (!validateOfflinePayment()) {
            toast.error("Please fill all offline payment details");
            return;
          }
        }

        const payload = buildPaymentPayload({ values });
        console.log("Payment payload:", payload);

        const res = await authAxios().post("/payment/proceed", payload);

        if (res.data?.status) {
          if (paymentModeRef.current === "ONLINE") {
            const { paymentUrl, order_no } = res.data.response || {};
            setPaymentUrl(paymentUrl);
            setOrderNo(order_no);
            setPaymentModalOpen(true);
            resetAllStatesOnline();
            toast.success("Order placed successfully!");
          }

          if (paymentModeRef.current === "OFFLINE") {
            toast.success("Order placed with offline payment!");
            resetAllStates();
            setProductInvoiceModal(false);
            onMemberUpdate();
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Something went wrong");
        console.error(err.response?.data?.message);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const handleFinalSubmit = async (mode) => {
    paymentModeRef.current = mode;
    if (!validateItems()) return;
    if (showGstDetails && !validateGstFields()) return;

    if (mode === "OFFLINE") {
      setPaymentModalOpen(true); // open offline details modal
    } else {
      formik.handleSubmit();
    }
  };

  useEffect(() => {
    if (!formik.values.club_id) return;

    authAxios()
      .get(`/club/${formik.values.club_id}`)
      .then((res) => {
        const data = res.data?.data?.gsttyp;
        // console.log("Club data:", data);
        setClubGstType(data);
      })
      .catch(() => toast.error("Failed to fetch club"));
  }, [formik.values.club_id]);

  // ═══════════════════════════════════════════════════════════════════════════
  // API calls
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchClubTimingAPI = async () => {
    try {
      if (!formik.values.club_id) return;
      const res = await authAxios().get(
        `/club/fetch/timing/${formik.values.club_id}`,
      );
      const timings = res.data?.data?.time || [];

      const formattedSlots = timings.map((time) => {
        const [hour, minute] = time.split(":").map(Number);

        const start = new Date();
        start.setHours(hour, minute);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 30);

        const formatTime = (date) => {
          return date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        };

        return {
          start_time: time,
          end_time: `${String(end.getHours()).padStart(2, "0")}:${String(
            end.getMinutes(),
          ).padStart(2, "0")}`,

          label: `${formatTime(start)} - ${formatTime(end)}`,
        };
      });

      setClubTiming(formattedSlots);
    } catch (err) {
      console.error("Club timing error:", err);
      setClubTiming([]);
    }
  };

  useEffect(() => {
    if (formik.values.club_id) fetchClubTimingAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.club_id]);

  // Fetch member info when modal opens
  useEffect(() => {
    if (!selectedLeadMember) return;

    authAxios()
      .get(`/member/${selectedLeadMember}`)
      .then((res) => {
        const data = res.data?.data || res.data || null;
        if (data) {
          formik.setFieldValue("member_id", data.id || null);
          formik.setFieldValue("club_id", data.club_id || null);

          const gstData = {
            gst_registration_number: data.gst_registration_number || "",
            gst_registered_company_name: data.gst_registered_company_name || "",
            gst_registered_company_address:
              data.gst_registered_company_address || "",
          };
          setSavedGstData(gstData);
          setCustomerGstData(gstData);
        }
      })
      .catch(() => toast.error("Failed to fetch member"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeadMember]);

  const fetchService = async (cId = null) => {
    try {
      const params = cId ? { club_id: cId } : {};
      const res = await authAxios().get("/product/category/list", { params });
      const data = res.data?.data || [];
      setService(data.filter((i) => i.status === "ACTIVE"));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProductList = async (cId = null) => {
    try {
      const params = cId ? { club_id: cId } : {};
      const res = await authAxios().get("/product/list", { params });
      const data = res.data?.data || [];
      setProductList(data.filter((i) => i.status === "ACTIVE"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchService(clubId);
    fetchProductList(clubId);
  }, [clubId]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Coupon
  // ═══════════════════════════════════════════════════════════════════════════

  const applyCoupon = async () => {
    if (!voucherInput.trim()) return;

    const validItems = items.filter((i) => i.product_id);
    if (!validItems.length) {
      toast.error("Please select a product before applying a coupon");
      return;
    }

    try {
      setVoucherStatus("loading");

      const payload = {
        coupon: voucherInput.trim(),
        applicable_ids: validItems.map((i) => i.product_id),
        applicable_type: "PRODUCT",
        amount: formik.values.productDetails?.total_amount,
        club_id: formik.values.club_id,
        member_id: selectedLeadMember,
      };

      const res = await authAxios().post("/coupon/applicable", payload);
      const response = res.data;

      if (!response?.status)
        throw new Error(response?.message || "Invalid coupon");

      const couponDiscount = Number(response?.data?.discountAmount) || 0;
      const { originalAmount, subtotalAmount, gstAmount, grandTotal } =
        computeTotals(couponDiscount);

      setVoucherStatus("success");
      setVoucherMessage(response?.message);

      formik.setValues({
        ...formik.values,
        coupon: voucherInput,
        discountAmount: couponDiscount,
        productDetails: {
          ...formik.values.productDetails,
          amount: originalAmount,
          total_amount: subtotalAmount,
          gst_amount: gstAmount,
        },
        final_amount: grandTotal,
        amount_pay: grandTotal,
      });
    } catch (err) {
      setVoucherStatus("error");
      setVoucherMessage(err?.message || "Invalid or expired coupon");

      const { originalAmount, subtotalAmount, gstAmount, grandTotal } =
        computeTotals(0);

      formik.setValues({
        ...formik.values,
        coupon: "",
        discountAmount: 0,
        productDetails: {
          ...formik.values.productDetails,
          amount: originalAmount,
          total_amount: subtotalAmount,
          gst_amount: gstAmount,
        },
        final_amount: grandTotal,
        amount_pay: grandTotal,
      });
    }
  };

  const resetVoucher = () => {
    setVoucherInput("");
    setVoucherStatus(null);
    setVoucherMessage("");
    formik.setFieldValue("coupon", "");
    formik.setFieldValue("discountAmount", 0);
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setProductInvoiceModal(false);
    }
  };

  const handleCloseModal = () => {
    formik.resetForm();
    resetVoucher();
    setPaymentModalOpen(false);
  };

  // ── Derived options ───────────────────────────────────────────────────────
  const productTypeOptions = service.map((item) => ({
    label: item.title,
    value: item.id,
  }));

  const isPastTimeSlot = (startTime) => {
    if (deliveryDate !== "TODAY") return false;

    const now = new Date();

    const [hours, minutes] = startTime.split(":").map(Number);

    const slotTime = new Date();

    slotTime.setHours(hours);
    slotTime.setMinutes(minutes);
    slotTime.setSeconds(0);

    return slotTime < now;
  };

  // Each option carries start_time + end_time so buildDateTime can use them
  const timeSlotOptions = clubTiming.map((t) => ({
    label: t.label,
    value: `${t.start_time}-${t.end_time}`,
    start_time: t.start_time,
    end_time: t.end_time,
    isDisabled: isPastTimeSlot(t.start_time),
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      <div
        className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
        onClick={handleOverlayClick}
      >
        <div
          className="min-h-[70vh] w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
          ref={leadBoxRef}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Modal header ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
            <h2 className="text-xl font-semibold">Buy Products</h2>
            <div
              className="close--lead cursor-pointer"
              onClick={() => setProductInvoiceModal(false)}
            >
              <IoCloseCircle className="text-3xl" />
            </div>
          </div>

          <div className="flex-1">
            <form onSubmit={formik.handleSubmit}>
              <div className="flex bg-white rounded-b-[10px]">
                <div className="p-6 flex-1">
                  {/* ══════════════════════════════════════════════════════════
                      ITEMS SECTION
                  ══════════════════════════════════════════════════════════ */}
                  <div className="mb-6">
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold">Items</h3>
                      <button
                        type="button"
                        onClick={addItem}
                        className="px-4 py-2 bg-black text-white text-sm font-semibold rounded"
                      >
                        Add More Items
                      </button>
                    </div>

                    {/* Item rows */}
                    <div className="border rounded-[10px] overflow-hidden">
                      {items.map((item, idx) => {
                        // Filter products for this row's selected category
                        // const filteredProducts = getFilteredProducts(
                        //   item.product_category_id,
                        // );
                        const filteredProducts = getFilteredProducts(
                          item.product_category_id,
                          item.tempId
                        );

                        // Row-level amount: booking_amount (total_amount + gst) × qty
                        const rowAmt = item.productData
                          ? parseFloat(item.productData.amount || 0) *
                            item.quantity
                          : 0;

                        return (
                          <div
                            key={item.tempId}
                            className={`p-4 ${
                              idx !== items.length - 1 ? "border-b" : ""
                            }`}
                          >
                            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 items-start">
                              {/* Product Category */}
                              <div>
                                <label className="text-sm mb-2 block">
                                  Product Category
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                                    <FaListCheck />
                                  </span>
                                  <Select
                                    options={productTypeOptions}
                                    value={
                                      productTypeOptions.find(
                                        (o) =>
                                          o.value === item.product_category_id,
                                      ) || null
                                    }
                                    onChange={(option) => {
                                      console.log("Selected Category Option:", option);
                                      updateItem(item.tempId, {
                                        product_category_id: option.value,
                                        service_name: option.label,
                                        product_id: null,
                                        productData: null,
                                        quantity: 1,
                                      });
                                      // Clear validation error
                                      setItemErrors((prev) => {
                                        const updated = [...prev];

                                        if (updated[idx]) {
                                          updated[idx].product_category_id = "";
                                        }

                                        return updated;
                                      });

                                      resetVoucher();
                                    }}
                                    styles={{
                                      ...selectIcon,
                                      menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                      }),
                                    }}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    placeholder="Select category"
                                  />
                                </div>
                                {itemErrors[idx]?.product_category_id && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {itemErrors[idx]?.product_category_id}
                                  </p>
                                )}
                              </div>

                              {/* Item Name – filtered by category */}
                              <div>
                                <label className="text-sm mb-2 block">
                                  Item Name
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                                    <FaListCheck />
                                  </span>
                                  <Select
                                    options={filteredProducts}
                                    value={
                                      filteredProducts.find(
                                        (o) => o.value === item.product_id,
                                      ) || null
                                    }
                                    onChange={(option) => {
                                      updateItem(item.tempId, {
                                        product_id: option.value,
                                        productData: option.data,
                                        quantity: 1,
                                      });
                                      // Clear validation error
                                      setItemErrors((prev) => {
                                        const updated = [...prev];

                                        if (updated[idx]) {
                                          updated[idx].product_id = "";
                                        }

                                        return updated;
                                      });
                                      resetVoucher();
                                    }}
                                    isDisabled={!item.product_category_id}
                                    placeholder="Select item"
                                    styles={{
                                      ...selectIcon,
                                      menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                      }),
                                    }}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                  />
                                </div>
                                {itemErrors[idx]?.product_id && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {itemErrors[idx]?.product_id}
                                  </p>
                                )}
                              </div>

                              {/* Quantity + amount */}
                              <div>
                                <label className="text-sm mb-2 block">Quantity</label>
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    className="w-[30px] h-[35px] rounded-l border flex items-center justify-center font-bold text-lg leading-none"
                                    onClick={() =>
                                      updateItem(item.tempId, {
                                        quantity: Math.max(
                                          1,
                                          item.quantity - 1,
                                        ),
                                      })
                                    }
                                  >
                                    −
                                  </button>
                                  <span className="text-center font-semibold border w-[45px] h-[35px] flex items-center justify-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    className="w-[30px] h-[35px] rounded-r border flex items-center justify-center font-bold text-lg leading-none"
                                    onClick={() =>
                                      updateItem(item.tempId, {
                                        quantity: item.quantity + 1,
                                      })
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                                {itemErrors[idx]?.quantity && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {itemErrors[idx]?.quantity}
                                  </p>
                                )}
                              </div>

                              {/* Remove row */}
                              <div className="pb-1">
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.tempId)}
                                  disabled={items.length === 1}
                                  className={`text-red-400 hover:text-red-600 text-2xl ${
                                    items.length === 1
                                      ? "opacity-30 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <IoCloseCircle />
                                </button>
                              </div>
                            </div>
                            <div className="text-sm font-bold mt-1 text-right">
                              Amount: ₹{formatIndianNumber(rowAmt) ?? 0}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ══════════════════════════════════════════════════════════
                      DELIVERY SCHEDULE
                  ══════════════════════════════════════════════════════════ */}
                  <div className="mb-6 border rounded-[10px] p-4">
                    <h3 className="text-base font-semibold mb-3">
                      Delivery Schedule
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Delivery date quick-pick */}
                      <div>
                        <label className="text-sm mb-2 block">
                          Delivery Date
                        </label>
                        <div className="flex gap-2">
                          {[
                            { key: "TODAY", label: "Today" },
                            { key: "TOMORROW", label: "Tomorrow" },
                            { key: "DAY_AFTER", label: "Day After" },
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                setDeliveryDate(key);
                                setSelectedTimeSlot(null);
                              }}
                              className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                                deliveryDate === key
                                  ? "bg-black text-white border-black"
                                  : "bg-white text-black border-gray-300 hover:border-black"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time slot */}
                      <div>
                        <label className="text-sm mb-2 block">
                          Time Slot
                        </label>
                        <Select
                          options={timeSlotOptions}
                          value={selectedTimeSlot}
                          onChange={setSelectedTimeSlot}
                          placeholder="Select time slot"
                          styles={customStyles}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ══════════════════════════════════════════════════════════
                      VOUCHER CODE
                  ══════════════════════════════════════════════════════════ */}
                  <div className="mb-4">
                    <label className="mb-2 block">Voucher Code</label>
                    <div className="flex gap-0 relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[12px] z-[1]">
                        <RiDiscountPercentFill className="text-xl" />
                      </span>
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        placeholder="Enter voucher code"
                        className={`input--icon !rounded-r-[0px] custom--input w-full ${
                          voucherStatus === "success"
                            ? "border-green-500"
                            : voucherStatus === "error"
                              ? "border-red-500"
                              : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={voucherStatus === "loading"}
                        className="px-4 py-2 bg-black text-white rounded-r-[10px] hover:bg-gray-800 disabled:opacity-50"
                      >
                        {voucherStatus === "loading" ? "..." : "Apply"}
                      </button>
                    </div>

                    {voucherStatus === "success" && (
                      <p className="text-green-600 text-sm mt-1">
                        {voucherMessage}
                      </p>
                    )}
                    {voucherStatus === "error" && (
                      <p className="text-red-600 text-sm mt-1">
                        {voucherMessage}
                      </p>
                    )}
                  </div>

                  {/* ══════════════════════════════════════════════════════════
                      GST DETAILS
                  ══════════════════════════════════════════════════════════ */}
                  <div className="mt-3 flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={showGstDetails}
                      onChange={handleGstCheckbox}
                    />
                    <label>Add GST Details</label>
                  </div>

                  {showGstDetails && (
                    <>
                      <h3 className="text-2xl font-semibold mb-2 mt-4">
                        Add GST Details
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {/* GST Number */}
                        <div>
                          <label className="mb-2 block">
                            GST Number<span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="GST Number"
                            className="custom--input w-full"
                            maxLength={15}
                            value={customerGstData.gst_registration_number}
                            onKeyDown={(e) => {
                              const allowed = [
                                "Backspace",
                                "Delete",
                                "ArrowLeft",
                                "ArrowRight",
                                "Tab",
                              ];
                              if (
                                !/^[a-zA-Z0-9]$/.test(e.key) &&
                                !allowed.includes(e.key)
                              )
                                e.preventDefault();
                            }}
                            onChange={(e) => {
                              const cleaned = sanitizeAlphaNumeric(
                                e.target.value.toUpperCase(),
                              );
                              if (cleaned.length <= 15) {
                                setCustomerGstData({
                                  ...customerGstData,
                                  gst_registration_number: cleaned,
                                });
                                setGstErrors({
                                  ...gstErrors,
                                  gst_registration_number: "",
                                });
                              }
                            }}
                          />
                          {gstErrors.gst_registration_number && (
                            <p className="text-red-500 text-sm mt-1">
                              {gstErrors.gst_registration_number}
                            </p>
                          )}
                        </div>

                        {/* Company Name */}
                        <div>
                          <label className="mb-2 block">
                            Company Name<span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Company Name"
                            className="custom--input w-full"
                            value={customerGstData.gst_registered_company_name}
                            onKeyDown={blockNonLettersAndNumbers}
                            onChange={(e) =>
                              setCustomerGstData({
                                ...customerGstData,
                                gst_registered_company_name:
                                  allowLettersAndNumbers(e.target.value),
                              })
                            }
                          />
                          {gstErrors.gst_registered_company_name && (
                            <p className="text-red-500 text-sm mt-1">
                              {gstErrors.gst_registered_company_name}
                            </p>
                          )}
                        </div>

                        {/* Company Address */}
                        <div>
                          <label className="mb-2 block">
                            Company Address
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Company Address"
                            className="custom--input w-full"
                            value={
                              customerGstData.gst_registered_company_address
                            }
                            onKeyDown={blockNonLettersAndNumbers}
                            onChange={(e) =>
                              setCustomerGstData({
                                ...customerGstData,
                                gst_registered_company_address:
                                  allowLettersAndNumbers(e.target.value),
                              })
                            }
                          />
                          {gstErrors.gst_registered_company_address && (
                            <p className="text-red-500 text-sm mt-1">
                              {gstErrors.gst_registered_company_address}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ══════════════════════════════════════════════════════════
                      PRICE CALCULATION
                  ══════════════════════════════════════════════════════════ */}
                  <div className="mt-5 bg-[#f7f7f7] p-[20px] rounded-[10px]">
                    <h3 className="text-2xl font-semibold">
                      Price Calculation
                    </h3>
                    <div className="price--calculation2 my-5">
                      <div className="price--item">
                        <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                          Total:{" "}
                          <span className="font-bold flex items-center gap-2">
                            <span>
                              ₹
                              {formatIndianNumber(
                                formik.values.productDetails?.total_amount,
                              ) ?? 0}
                            </span>
                          </span>
                        </p>
                      </div>
                      <div className="price--item">
                        <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                          Discount Code Applied:{" "}
                          <span className="font-bold">
                            ₹
                            {formatIndianNumber(formik.values.discountAmount) ??
                              0}
                          </span>
                        </p>
                      </div>
                      <div className="price--item">
                        <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                          GST:{" "}
                          <span className="font-bold">
                            ₹
                            {formatIndianNumber(
                              formik.values.productDetails?.gst_amount,
                            ) ?? 0}
                          </span>
                        </p>
                      </div>
                      <div className="price--item">
                        <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                          Grand Total:{" "}
                          <span className="font-bold">
                            ₹
                            {formatIndianNumber(formik.values.final_amount) ??
                              0}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-semibold flex items-center gap-2 justify-between pb-2">
                      To Pay:{" "}
                      <span className="font-bold">
                        ₹{formatIndianNumber(formik.values.amount_pay) ?? 0}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Action buttons ────────────────────────────────────────── */}
              <div className="flex gap-4 py-5 justify-end px-0">
                <button
                  type="button"
                  className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                  onClick={() => {
                    resetAllStates();
                    setProductInvoiceModal(false);
                  }}
                >
                  Cancel
                </button>

                <div className="flex gap-2 items-center justify-end flex-1">
                  <button
                    type="button"
                    disabled={formik.isSubmitting}
                    onClick={() => handleFinalSubmit("ONLINE")}
                    className="px-4 py-2 bg-black text-white font-semibold rounded max-w-[150px] w-full"
                  >
                    Pay Online
                  </button>
                  <button
                    type="button"
                    disabled={formik.isSubmitting}
                    onClick={() => handleFinalSubmit("OFFLINE")}
                    className="px-4 py-2 border bg-white text-black font-semibold rounded max-w-[150px] w-full"
                  >
                    Pay Offline
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          PAYMENT MODAL (Online / Offline)
      ════════════════════════════════════════════════════════════════════ */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg w-[500px] p-6">
            {/* Online */}
            {paymentModeRef.current === "ONLINE" && (
              <>
                <h2 className="text-lg font-semibold mb-2">
                  Complete Your Payment
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  Order No: <span className="font-medium">{orderNo}</span>
                </p>
                <textarea
                  readOnly
                  value={paymentUrl}
                  className="w-full h-[120px] border rounded p-2 text-sm"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentUrl);
                      toast.success("Payment URL copied");
                    }}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {/* Offline */}
            {paymentModeRef.current === "OFFLINE" && (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  Offline Payment Details
                </h2>

                <Select
                  options={paymentMethodOptions}
                  value={offlinePaymentDetails.method}
                  onChange={(option) => {
                    setOfflinePaymentDetails({
                      ...offlinePaymentDetails,
                      method: option,
                    });
                    setOfflineErrors((prev) => ({ ...prev, method: "" }));
                  }}
                  placeholder="Select Payment Method"
                  className="mb-3"
                  styles={{
                    ...customStyles,
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                {offlineErrors.method && (
                  <p className="text-red-500 text-sm">{offlineErrors.method}</p>
                )}

                <input
                  type="text"
                  placeholder="Enter Transaction ID"
                  className="custom--input w-full mb-3"
                  value={offlinePaymentDetails.transactionId}
                  onChange={(e) => {
                    setOfflinePaymentDetails({
                      ...offlinePaymentDetails,
                      transactionId: sanitizeAlphaNumeric(e.target.value),
                    });
                    setOfflineErrors((prev) => ({
                      ...prev,
                      transactionId: "",
                    }));
                  }}
                />
                {offlineErrors.transactionId && (
                  <p className="text-red-500 text-sm">
                    {offlineErrors.transactionId}
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setPaymentModalOpen(false)}
                    disabled={formik.isSubmitting}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => formik.handleSubmit()}
                    disabled={formik.isSubmitting}
                    className={`px-4 py-2 rounded text-white ${
                      formik.isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-black"
                    }`}
                  >
                    {formik.isSubmitting ? "Processing..." : "Submit Payment"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CreateProductsInvoice;
