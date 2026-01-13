import React, { useEffect, useState } from "react";
import { FiEdit, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";

import { addYears, subYears } from "date-fns";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import { FaCalendarDays } from "react-icons/fa6";
import { LiaEdit } from "react-icons/lia";
import Tooltip from "../../common/Tooltip";
import { BsEye } from "react-icons/bs";
import MultiSelect from "react-multi-select-component";
import { FaCircle } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";

// Dummy data
const initialRules = [
  {
    id: 1,
    ruleName: "Trainer PT Commission – Summit Plaza",
    club: "Summit Plaza",
    staffCategory: "Trainer",
    incentiveBasis: "Sessions",
    calculationMode: "Progressive",
    effectiveFrom: "01-Jan-2026",
    effectiveTo: "Ongoing",
    status: "Active",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    createdBy: "Prerna",
    lastUpdatedBy: "Prerna",
    slabs: [
      {
        from: 1,
        to: 10,
        commission: 500,
        serviceTypes: ["PT pack"],
        includeComplementary: false,
      },
      {
        from: 11,
        to: 20,
        commission: 600,
        serviceTypes: ["PT pack"],
        includeComplementary: false,
      },
    ],
  },
  {
    id: 2,
    ruleName: "FOH Revenue Incentive – Summit Plaza",
    club: "Summit Plaza",
    staffCategory: "FOH",
    incentiveBasis: "Revenue vs Target",
    calculationMode: "Actual Revenue",
    effectiveFrom: "01-Jan-2026",
    effectiveTo: "Ongoing",
    status: "Active",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    createdBy: "Prerna",
    lastUpdatedBy: "Prerna",
    slabs: [
      { from: 80, to: 90, commissionRate: 2 },
      { from: 91, to: 100, commissionRate: 3 },
    ],
  },
];

const clubOptions = [
  { value: "Summit Plaza", label: "Summit Plaza" },
  { value: "Green Park", label: "Green Park" },
];

const staffCategoryOptions = [
  { value: "Trainer", label: "Trainer" },
  { value: "FOH", label: "FOH" },
];

const serviceTypeOptions = [
  { value: "PT pack", label: "PT pack" },
  { value: "Pilates pack", label: "Pilates pack" },
  { value: "Recovery pack", label: "Recovery pack" },
];
const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Draft", label: "Draft" },
  { value: "Archived", label: "Archived" },
];

// Validation Schema
const validationSchema = Yup.object({
  club: Yup.object().nullable().required("Club is required"),
  ruleName: Yup.string().required("Rule name is required"),
  staffCategory: Yup.object().nullable().required("Staff category is required"),
  calculationMode: Yup.object()
    .nullable()
    .required("Calculation mode is required"),
  effectiveFrom: Yup.date().required("Effective from date is required"),
  status: Yup.object().nullable().required("Status is required"),
  slabs: Yup.array().min(1, "At least one slab is required"),
});

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const SetIncentivePolicy = () => {
  const [rules, setRules] = useState(initialRules);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [currentRule, setCurrentRule] = useState(null);

  const [clubFilter, setClubFilter] = useState(null);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const clubOptions = [
    { value: "Summit Plaza", label: "Summit Plaza" },
    { value: "Green Park", label: "Green Park" },
  ];

  const getInitialValues = (rule = null) => {
    if (rule) {
      return {
        club: { value: rule.club, label: rule.club },
        ruleName: rule.ruleName,
        staffCategory: { value: rule.staffCategory, label: rule.staffCategory },
        calculationMode: rule
          ? { value: rule.calculationMode, label: rule.calculationMode }
          : { value: "Progressive", label: "Progressive" },
        effectiveFrom: new Date(rule.effectiveFrom),
        effectiveTo:
          rule.effectiveTo === "Ongoing" ? null : new Date(rule.effectiveTo),
        status: { value: rule.status, label: rule.status },
        slabs: rule.slabs || [],
      };
    }
    return {
      club: null,
      ruleName: "",
      staffCategory: null,
      calculationMode: "Progressive",
      effectiveFrom: new Date(),
      effectiveTo: null,
      status: { value: "Active", label: "Active" },
      slabs: [],
    };
  };

  const handleView = (rule) => {
    setCurrentRule(rule);
    setModalMode("view");
    setShowModal(true);
  };

  const handleEdit = (rule) => {
    setCurrentRule(rule);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleCreate = () => {
    setCurrentRule(null);
    setModalMode("create");
    setShowModal(true);
  };

  const handleSubmit = (values, { setSubmitting }) => {
    console.log("Form submitted:", values);

    // Format the data
    const formattedRule = {
      id: currentRule?.id || Date.now(),
      ruleName: values.ruleName,
      club: values.club.value,
      staffCategory: values.staffCategory.value,
      incentiveBasis:
        values.staffCategory.value === "Trainer"
          ? "Sessions"
          : "Revenue vs Target",
      calculationMode: values.calculationMode.value,
      effectiveFrom: values.effectiveFrom.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      effectiveTo: values.effectiveTo
        ? values.effectiveTo.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Ongoing",
      status: values.status.value,
      createdAt: currentRule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "Prerna",
      lastUpdatedBy: "Prerna",
      slabs: values.slabs,
    };

    if (modalMode === "edit") {
      setRules(rules.map((r) => (r.id === currentRule.id ? formattedRule : r)));
    } else {
      setRules([...rules, formattedRule]);
    }

    setSubmitting(false);
    setShowModal(false);
  };

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Finance Reports > Set Incentive Policy`}
          </p>
          <h1 className="text-3xl font-semibold">Set Incentive Policy</h1>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            onClick={handleCreate}
          >
            <FiPlus /> Create New Rule
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          <div className="max-w-[180px] w-full">
            <Select
              placeholder="Date Filter"
              options={dateFilterOptions}
              value={dateFilter}
              onChange={(selected) => {
                setDateFilter(selected);
                if (selected?.value !== "custom") {
                  setCustomFrom(null);
                  setCustomTo(null);
                }
              }}
              styles={customStyles}
            />
          </div>

          {dateFilter?.value === "custom" && (
            <>
              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={customFrom}
                  onChange={setCustomFrom}
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

              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={customTo}
                  onChange={setCustomTo}
                  placeholderText="To Date"
                  className="custom--input w-full input--icon"
                  minDate={subYears(new Date(), 20)}
                  maxDate={addYears(new Date(), 0)}
                  dateFormat="dd-MM-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
            </>
          )}

          <div className="w-full max-w-[200px]">
            <Select
              placeholder="Filter by club"
              value={clubOptions.find((o) => o.value === clubFilter) || null}
              options={clubOptions}
              onChange={(option) => setClubFilter(option?.value)}
              // isClearable
              styles={customStyles}
            />
          </div>
        </div>
      </div>
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4">Rule Name</th>
                <th className="px-2 py-4">Club</th>
                <th className="px-2 py-4">Staff Category</th>
                <th className="px-2 py-4">Incentive Basis</th>
                <th className="px-2 py-4">Calculation Mode</th>
                <th className="px-2 py-4">Effective From</th>
                <th className="px-2 py-4">Effective To</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="bg-white  border-b hover:bg-gray-50"
                >
                  <td className="px-2 py-4">{rule.ruleName}</td>
                  <td className="px-2 py-4">{rule.club}</td>
                  <td className="px-2 py-4">{rule.staffCategory}</td>
                  <td className="px-2 py-4">{rule.incentiveBasis}</td>
                  <td className="px-2 py-4">{rule.calculationMode}</td>
                  <td className="px-2 py-4">{rule.effectiveFrom}</td>
                  <td className="px-2 py-4">{rule.effectiveTo}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`
                                                flex items-center justify-between gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit
                                              ${
                                                rule.status === "Active"
                                                  ? "bg-[#E8FFE6] text-[#138808]"
                                                  : "bg-[#EEEEEE]"
                                              }
                                              `}
                    >
                      <FaCircle className="text-[10px]" />{" "}
                      {rule.status === "Active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Tooltip
                        id={`tooltip-view-${rule.id}`}
                        content="View Rule"
                        place="left"
                      >
                        <div
                          className="p-1 cursor-pointer"
                          onClick={() => handleView(rule)}
                        >
                          <BsEye className="text-[25px] text-black" />
                        </div>
                      </Tooltip>

                      <Tooltip
                        id={`tooltip-edit-${rule.id}`}
                        content="Edit Rule"
                        place="left"
                      >
                        <div
                          className="p-1 cursor-pointer"
                          onClick={() => handleEdit(rule)}
                        >
                          <LiaEdit className="text-[25px] text-black" />
                        </div>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto hide--overflow">
            <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
              <h2 className="text-xl font-semibold">
                {modalMode === "view"
                  ? "View Rule"
                  : modalMode === "edit"
                  ? "Edit Rule"
                  : "Create New Rule"}
              </h2>
              <div
                className="close--lead cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                <IoCloseCircle className="text-3xl" />
              </div>
            </div>

            {modalMode === "view" ? (
              <div className="bg-white p-6 rounded-b-[10px]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Club
                      </label>
                      <p className="text-gray-800">{currentRule.club}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Rule Name
                      </label>
                      <p className="text-gray-800">{currentRule.ruleName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Staff Category
                      </label>
                      <p className="text-gray-800">
                        {currentRule.staffCategory}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Calculation Mode
                      </label>
                      <p className="text-gray-800">
                        {currentRule.calculationMode}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Effective From
                      </label>
                      <p className="text-gray-800">
                        {currentRule.effectiveFrom}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Effective To
                      </label>
                      <p className="text-gray-800">{currentRule.effectiveTo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Status
                      </label>
                      <p className="text-gray-800">{currentRule.status}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      Slabs
                    </h4>
                    {currentRule.slabs &&
                      currentRule.slabs.map((slab, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg mb-3"
                        >
                          <h5 className="font-medium text-gray-700 mb-2">
                            Slab {index + 1}
                          </h5>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {currentRule.staffCategory === "Trainer" ? (
                              <>
                                <div>
                                  <span className="text-gray-600">
                                    From Session:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {slab.from}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    To Session:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {slab.to || "Ongoing"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Commission:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    ₹{slab.commission}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Service Types:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {slab.serviceTypes?.join(", ")}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Include Complementary:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {slab.includeComplementary ? "Yes" : "No"}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <span className="text-gray-600">
                                    From % Achievement:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {slab.from}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    To % Achievement:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {slab.to}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Commission Rate:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {slab.commissionRate}%
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <Formik
                initialValues={getInitialValues(currentRule)}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                  <Form>
                    <div className="bg-white p-6 rounded-b-[10px]">
                      <div className="">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Rule Header
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-2">
                              Club <span className="text-red-500">*</span>
                            </label>
                            <Select
                              name="club"
                              value={values.club}
                              onChange={(option) =>
                                setFieldValue("club", option)
                              }
                              options={clubOptions}
                              className={
                                errors.club && touched.club
                                  ? "border-red-500"
                                  : ""
                              }
                              styles={customStyles}
                            />
                            {errors.club && touched.club && (
                              <div className="text-red-500 text-xs mt-1">
                                {errors.club}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block mb-2">
                              Rule Name <span className="text-red-500">*</span>
                            </label>
                            <Field
                              name="ruleName"
                              type="text"
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.ruleName && touched.ruleName
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="e.g., Summit Plaza | Trainer PT Commission | Jan 2026"
                            />
                            {errors.ruleName && touched.ruleName && (
                              <div className="text-red-500 text-xs mt-1">
                                {errors.ruleName}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block mb-2">
                              Staff Category{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Select
                              name="staffCategory"
                              value={values.staffCategory}
                              onChange={(option) => {
                                setFieldValue("staffCategory", option);
                                setFieldValue("slabs", []);
                                // Reset calculation mode based on selected staff category
                                setFieldValue(
                                  "calculationMode",
                                  option?.value === "Trainer"
                                    ? "Progressive"
                                    : "Actual Revenue"
                                );
                              }}
                              options={staffCategoryOptions}
                              className={
                                errors.staffCategory && touched.staffCategory
                                  ? "border-red-500"
                                  : ""
                              }
                              styles={customStyles}
                            />
                            {errors.staffCategory && touched.staffCategory && (
                              <div className="text-red-500 text-xs mt-1">
                                {errors.staffCategory}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block mb-2">
                              Calculation Basis{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Select
                              name="calculationMode"
                              value={values.calculationMode}
                              onChange={(option) =>
                                setFieldValue("calculationMode", option)
                              }
                              options={
                                values.staffCategory?.value === "Trainer"
                                  ? [
                                      {
                                        value: "Progressive",
                                        label: "Progressive",
                                      },
                                      { value: "Flat", label: "Flat" },
                                    ]
                                  : [
                                      {
                                        value: "Actual Revenue",
                                        label: "Actual Revenue",
                                      },
                                      {
                                        value: "Target Based",
                                        label: "Target Based",
                                      },
                                    ]
                              }
                              styles={customStyles}
                            />

                            {errors.calculationMode &&
                              touched.calculationMode && (
                                <div className="text-red-500 text-xs mt-1">
                                  {errors.calculationMode}
                                </div>
                              )}
                          </div>

                          <div>
                            <label className="block mb-2">
                              Effective From{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="custom--date">
                              <DatePicker
                                selected={values.effectiveFrom}
                                onChange={(date) =>
                                  setFieldValue("effectiveFrom", date)
                                }
                                dateFormat="dd-MMM-yyyy"
                                className={`custom--input !w-full ${
                                  errors.effectiveFrom && touched.effectiveFrom
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                            </div>
                            {errors.effectiveFrom && touched.effectiveFrom && (
                              <div className="text-red-500 text-xs mt-1">
                                {errors.effectiveFrom}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block mb-2">Effective To</label>
                            <div className="custom--date">
                              <DatePicker
                                selected={values.effectiveTo}
                                onChange={(date) =>
                                  setFieldValue("effectiveTo", date)
                                }
                                dateFormat="dd-MMM-yyyy"
                                isClearable
                                className="custom--input !w-full"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block mb-2">
                              Status <span className="text-red-500">*</span>
                            </label>
                            <Select
                              name="status"
                              value={values.status}
                              onChange={(option) =>
                                setFieldValue("status", option)
                              }
                              options={statusOptions}
                              className={
                                errors.status && touched.status
                                  ? "border-red-500"
                                  : ""
                              }
                              styles={customStyles}
                            />
                            {errors.status && touched.status && (
                              <div className="text-red-500 text-xs mt-1">
                                {errors.status}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className=" mt-4 ">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Rule Type and Slabs
                          </h3>
                        </div>

                        <FieldArray name="slabs">
                          {({ push, remove }) => (
                            <div className="space-y-3">
                              {values.slabs.length === 0 &&
                                values.staffCategory && (
                                  <p className="text-gray-500 text-center py-4">
                                    No slabs added yet. Click "Add Slab" to
                                    create one.
                                  </p>
                                )}

                              {values.staffCategory?.value === "Trainer" ? (
                                values.slabs.map((slab, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg border border-gray-200"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <h4 className="font-medium text-gray-700">
                                        Slab {index + 1}
                                      </h4>
                                      <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                      <div>
                                        <label className="block mb-2">
                                          From Session #
                                        </label>
                                        <Field
                                          name={`slabs.${index}.from`}
                                          type="number"
                                          className="custom--input"
                                        />
                                      </div>
                                      <div>
                                        <label className="block mb-2">
                                          To Session #
                                        </label>
                                        <Field
                                          name={`slabs.${index}.to`}
                                          type="number"
                                          placeholder="Ongoing"
                                          className="custom--input"
                                        />
                                      </div>
                                      <div>
                                        <label className="block mb-2">
                                          Commission (₹)
                                        </label>
                                        <Field
                                          name={`slabs.${index}.commission`}
                                          type="number"
                                          className="custom--input"
                                        />
                                      </div>
                                      <div>
                                        <label className="block mb-2">
                                          Service Type
                                        </label>
                                        <MultiSelect
                                          options={serviceTypeOptions}
                                          value={serviceTypeOptions.filter(
                                            (opt) =>
                                              slab.serviceTypes?.includes(
                                                opt.value
                                              )
                                          )}
                                          onChange={(selectedOptions) => {
                                            const values = selectedOptions.map(
                                              (opt) => opt.value
                                            );
                                            setFieldValue(
                                              `slabs.${index}.serviceTypes`,
                                              values
                                            );
                                          }}
                                          labelledBy="Select..."
                                          hasSelectAll={false}
                                          disableSearch={true}
                                          overrideStrings={{
                                            selectSomeItems:
                                              "Select Service Types",
                                            allItemsAreSelected:
                                              "All Services Selected",
                                          }}
                                          className="custom--input w-full multi--select--new"
                                        />
                                      </div>
                                    </div>
                                    <div className="mt-3">
                                      <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <Field
                                          name={`slabs.${index}.includeComplementary`}
                                          type="checkbox"
                                          className="rounded"
                                        />
                                        Include Complementary
                                      </label>
                                    </div>
                                  </div>
                                ))
                              ) : values.staffCategory?.value === "FOH" ? (
                                values.slabs.map((slab, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg border border-gray-200"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <h4 className="font-medium text-gray-700">
                                        Slab {index + 1}
                                      </h4>
                                      <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                      <div>
                                        <label className="block mb-2">
                                          From % Achievement
                                        </label>
                                        <Field
                                          name={`slabs.${index}.from`}
                                          type="number"
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="block mb-2">
                                          To % Achievement
                                        </label>
                                        <Field
                                          name={`slabs.${index}.to`}
                                          type="number"
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="block mb-2">
                                          Commission Rate (%)
                                        </label>
                                        <Field
                                          name={`slabs.${index}.commissionRate`}
                                          type="number"
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 text-center py-8">
                                  Select a staff category to add slabs
                                </p>
                              )}

                              {errors.slabs &&
                                typeof errors.slabs === "string" && (
                                  <div className="text-red-500 text-sm mt-2">
                                    {errors.slabs}
                                  </div>
                                )}

                              {values.staffCategory && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSlab =
                                      values.staffCategory?.value === "Trainer"
                                        ? {
                                            from: "",
                                            to: "",
                                            commission: "",
                                            serviceTypes: [],
                                            includeComplementary: false,
                                          }
                                        : {
                                            from: "",
                                            to: "",
                                            commissionRate: "",
                                          };
                                    push(newSlab);
                                  }}
                                  className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg  text-sm mb-3"
                                >
                                  <FiPlus /> Add Slab
                                </button>
                              )}
                            </div>
                          )}
                        </FieldArray>
                      </div>
                    </div>

                    <div className={`flex gap-4 py-5 justify-end`}>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
                      >
                        {isSubmitting
                          ? "Saving..."
                          : modalMode === "edit"
                          ? "Update Rule"
                          : "Create Rule"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SetIncentivePolicy;
