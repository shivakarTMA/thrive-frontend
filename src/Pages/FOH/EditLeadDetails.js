import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  companies,
  leadsSources,
  leadTypes,
  mockData,
  servicesName,
} from "../../DummyData/DummyData";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import DatePicker from "react-datepicker";
import Select from "react-select";

import "react-phone-number-input/style.css";
import "react-datepicker/dist/react-datepicker.css";
import {
  convertToISODate,
  customStyles,
  formatDateTime,
} from "../../Helper/helper";

const validationSchema = Yup.object({
  personalDetails: Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Name is required"),
    contact: Yup.string()
      .required("Contact number is required")
      .test("is-valid-phone", "Invalid phone number", (value) =>
        isValidPhoneNumber(value || "")
      ),
  }),

  leadInformation: Yup.object({
    leadSource: Yup.string().required("Lead Source is required"),
    leadType: Yup.string().required("Lead Type is required"),
  }),
});

const EditLeadDetails = () => {
  const { id } = useParams();
  const lead = mockData.find((item) => item.id === parseInt(id));
  console.log(lead, "lead");

  const [activeTab, setActiveTab] = useState("personal");

  const formik = useFormik({
    initialValues: {
      personalDetails: {
        name: lead.name || "",
        email: lead.email || "",
        contact: lead.contact || "",
        gender: lead.gender || "",
        dob: lead.dob || null,
        address: lead.address || "",
      },
      leadInformation: {
        enquiryDate: lead.enquiryDate || null,
        service: lead.service || "",
        leadType: lead.leadType || "",
        companyName: lead.company || "",
        leadSource: lead.leadSource || "",
      },
      professionalInfoPrimaryContact: {
        designation: lead.designation || "",
        companyName: lead.companyName || "",
        officialEmail: lead.officialEmail || "",
      },
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Updated Lead:", values);
      console.log("Formik Errors (if any):", formik.errors);
      // TODO: Save or update logic here
    },
  });

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > My Leads > Edit Lead`}</p>
          <h1 className="text-3xl font-semibold">Edit Lead</h1>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 rounded border ${
            activeTab === "personal"
              ? "bg-black text-white"
              : "bg-white text-black"
          }`}
        >
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab("professional")}
          className={`px-4 py-2 rounded border ${
            activeTab === "professional"
              ? "bg-black text-white"
              : "bg-white text-black"
          }`}
        >
          Professional Information
        </button>
      </div>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {activeTab === "personal" && (
          <>
            <h3 className="text-2xl font-semibold">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block">
                  Full Name<span className="text-red-500">*</span>
                </label>
                <input
                  name="personalDetails.name"
                  value={formik.values.personalDetails.name}
                  onChange={formik.handleChange}
                  className="custom--input w-full"
                />
                {formik.errors.personalDetails?.name &&
                  formik.touched.personalDetails?.name && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.personalDetails.name}
                    </div>
                  )}
              </div>

              <div>
                <label className="mb-2 block">
                  Contact<span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  name="personalDetails.contact"
                  value={formik.values.personalDetails.contact}
                  onChange={(value) =>
                    formik.setFieldValue("personalDetails.contact", value)
                  }
                  onBlur={() =>
                    formik.setFieldTouched("personalDetails.contact", true)
                  }
                  international
                  defaultCountry="IN"
                  className="custom--input w-full custom--phone"
                />
                {formik.errors.personalDetails?.contact &&
                  formik.touched.personalDetails?.contact && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.personalDetails.contact}
                    </div>
                  )}
              </div>

              <div>
                <label className="mb-2 block">Email</label>
                <input
                  type="email"
                  name="personalDetails.email"
                  value={formik.values.personalDetails.email}
                  onChange={formik.handleChange}
                  className="custom--input w-full"
                />
              </div>

              <div>
                <label className="mb-2 block">Gender</label>
                <div className="flex gap-2">
                  <label className="custom--radio">
                    Male
                    <input
                      type="radio"
                      name="personalDetails.gender"
                      value="male"
                      checked={formik.values.personalDetails.gender === "male"}
                      onChange={formik.handleChange}
                    />
                    <span className="radio-checkmark"></span>
                  </label>
                  <label className="custom--radio">
                    Female
                    <input
                      type="radio"
                      name="personalDetails.gender"
                      value="female"
                      checked={
                        formik.values.personalDetails.gender === "female"
                      }
                      onChange={formik.handleChange}
                    />
                    <span className="radio-checkmark"></span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block">DOB</label>
                <div className="custom--date dob-format">
                  <DatePicker
                    selected={
                      formik.values.personalDetails.dob
                        ? convertToISODate(formik.values.personalDetails.dob)
                        : null
                    }
                    onChange={(date) => {
                      formik.setFieldValue("personalDetails.dob", date ? formatDateTime(date) : null)
                    }}
                    showMonthDropdown
                    showYearDropdown
                    dateFormat="dd MMM yyyy"
                    dropdownMode="select"
                    placeholderText="Select date"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block">Address</label>
                <input
                  name="personalDetails.address"
                  value={formik.values.personalDetails.address}
                  onChange={formik.handleChange}
                  className="custom--input w-full"
                />
              </div>
            </div>
            <hr />
            <h3 className="text-2xl font-semibold">Lead Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block">Enquiry Date</label>
                <div className="custom--date">
                  <DatePicker
                    selected={
                      formik.values.leadInformation.enquiryDate
                        ? new Date(formik.values.leadInformation.enquiryDate)
                        : null
                    }
                    onChange={(date) =>
                      formik.setFieldValue("leadInformation.enquiryDate", date ? formatDateTime(date) : null)
                    }
                    dateFormat="dd MMM yyyy"
                    placeholderText="Select date"
                  />
                  
                </div>
              </div>

              <div>
                <label className="mb-2 block">Service Name</label>
                <Select
                  name="leadInformation.service"
                  value={servicesName.find(
                    (opt) => opt.value === formik.values.leadInformation.service
                  )}
                  onChange={(option) =>
                    formik.setFieldValue(
                      "leadInformation.service",
                      option.value
                    )
                  }
                  options={servicesName}
                  styles={customStyles}
                />
              </div>

              <div>
                <label className="mb-2 block">
                  Lead Source<span className="text-red-500">*</span>
                </label>
                <Select
                  name="leadInformation.leadSource"
                  value={leadsSources.find(
                    (opt) =>
                      opt.value === formik.values.leadInformation.leadSource
                  )}
                  onChange={(option) =>
                    formik.setFieldValue(
                      "leadInformation.leadSource",
                      option.value
                    )
                  }
                  options={leadsSources}
                  styles={customStyles}
                />
                {formik.errors.leadInformation?.leadSource &&
                  formik.touched.leadInformation?.leadSource && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.leadInformation.leadSource}
                    </div>
                  )}
              </div>

              <div>
                <label className="mb-2 block">
                  Lead Type<span className="text-red-500">*</span>
                </label>
                <Select
                  name="leadInformation.leadType"
                  value={leadTypes.find(
                    (opt) =>
                      opt.value === formik.values.leadInformation.leadType
                  )}
                  onChange={(option) =>
                    formik.setFieldValue(
                      "leadInformation.leadType",
                      option.value
                    )
                  }
                  options={leadTypes}
                  styles={customStyles}
                />
                {formik.errors.leadInformation?.leadType &&
                  formik.touched.leadInformation?.leadType && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.leadInformation.leadType}
                    </div>
                  )}
              </div>

              <div>
                <label className="mb-2 block">Company</label>
                <Select
                  name="leadInformation.companyName"
                  value={companies.find(
                    (opt) =>
                      opt.value === formik.values.leadInformation.companyName
                  )}
                  onChange={(option) =>
                    formik.setFieldValue(
                      "leadInformation.companyName",
                      option.value
                    )
                  }
                  options={companies}
                  styles={customStyles}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === "professional" && (
          <>
            <h3 className="text-2xl font-semibold">
              Professional Information Primary Contact
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block">Company name</label>
                <input
                  name="professionalInfoPrimaryContact.companyName"
                  value={
                    formik.values.professionalInfoPrimaryContact.companyName
                  }
                  onChange={formik.handleChange}
                  className="custom--input w-full"
                />
              </div>
              <div>
                <label className="mb-2 block">Designation</label>
                <input
                  name="professionalInfoPrimaryContact.designation"
                  value={
                    formik.values.professionalInfoPrimaryContact.designation
                  }
                  onChange={formik.handleChange}
                  className="custom--input w-full"
                />
              </div>

              <div>
                <label className="mb-2 block">Official Email</label>
                <input
                  type="email"
                  name="professionalInfoPrimaryContact.officialEmail"
                  value={
                    formik.values.professionalInfoPrimaryContact.officialEmail
                  }
                  onChange={formik.handleChange}
                  className="custom--input w-full"
                />
              </div>
            </div>
          </>
        )}
        <button type="submit" className="px-4 py-2 bg-black text-white rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditLeadDetails;
