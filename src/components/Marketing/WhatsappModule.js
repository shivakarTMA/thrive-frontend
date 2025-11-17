import React from "react";
import { Formik, Form, Field } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { customStyles } from "../../Helper/helper";

const clubOptions = [
  { value: "club1", label: "Sports Club" },
  { value: "club2", label: "Fitness Club" },
];

// dropdown sample data
const ageGroupOptions = [
  { value: "15-20", label: "15-20" },
  { value: "21-30", label: "21-30" },
  { value: "31-40", label: "31-40" },
  { value: "41-50", label: "41-50" },
  { value: "51+", label: "51+" },
  { value: "Not Mentioned", label: "Not Mentioned" },
];
const serviceOptions = [
  { value: "personal-training", label: "Personal Training" },
  { value: "group-classes", label: "Group Classes" },
];
const serviceVariationOptions = [
  { value: "basic", label: "Basic Package" },
  { value: "premium", label: "Premium Package" },
];
const emailTemplateOptions = [
  { value: "welcome", label: "Welcome" },
  { value: "renewal", label: "Renewal" },
];
const templateMessages = {
  welcome: "Welcome to our club! We are excited to have you as a member.",
  renewal: "Your membership is expiring soon. Please renew.",
};

const WhatsappModule = () => {
  return (
    <Formik
      initialValues={{
        club: "",
        module: "",
        // toggles
        validityEnabled: false,
        genderEnabled: false,
        ageGroupEnabled: false,
        leadSourceEnabled: false,
        serviceCategoryEnabled: false,
        serviceEnabled: false,
        behaviourEnabled: false,
        membershipExpiryEnabled: false,
        dateRangeEnabled: false,
        leadTypeEnabled: false,
        leadStatusEnabled: false,
        lastCallStatusEnabled: false,
        // actual field values
        validity: "",
        gender: "",
        ageGroup: "",
        leadSource: "",
        serviceCategory: "",
        service: "",
        serviceVariation: "",
        behaviour: "",
        membershipFrom: null,
        membershipTo: null,
        dateRangeFrom: null,
        dateRangeTo: null,
        leadType: "",
        leadStatus: "",
        lastCallStatus: "",
        emailTemplate: "",
        subject: "",
        message: "",
        attachment: null,
        sendCopy: false,
      }}
      onSubmit={(values) => {
        console.log("Submitted:", values);
        alert("Submitted! Check console for values.");
      }}
    >
      {({ values, setFieldValue }) => (
        <Form className="max-w-4xl mx-auto p-6 space-y-6 bg-white shadow rounded">
          {/* Club */}
          <div>
            <label className="block mb-2">Choose Club</label>
            <Select
              options={clubOptions}
              value={clubOptions.find((o) => o.value === values.club)}
              onChange={(opt) => setFieldValue("club", opt.value)}
              styles={customStyles}
            />
          </div>

          {/* Module */}
          <div>
            <label className="block mb-2">Modules</label>
            <div className="flex gap-4">
              <label className="block mb-2">
                <Field type="radio" name="module" value="member" /> Member
              </label>
              <label className="block mb-2">
                <Field type="radio" name="module" value="enquiries" /> Enquiries
              </label>
            </div>
          </div>

          {/* MEMBER FIELDS */}
          {values.module === "member" && (
            <>
              {/* Validity */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="validityEnabled" /> Validity
                </label>
                {values.validityEnabled && (
                  <div className="flex gap-4">
                    <label className="block mb-2">
                      <Field type="radio" name="validity" value="all" /> All Members
                    </label>
                    <label className="block mb-2">
                      <Field type="radio" name="validity" value="active" />{" "}
                      Active Members
                    </label>
                    <label className="block mb-2">
                      <Field type="radio" name="validity" value="inactive" />{" "}
                      Inactive Members
                    </label>
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="genderEnabled" /> Gender
                </label>
                {values.genderEnabled && (
                  <div className="flex gap-4">
                    <label className="block mb-2">
                      <Field type="radio" name="gender" value="all" /> All
                    </label>
                    <label className="block mb-2">
                      <Field type="radio" name="gender" value="male" /> Male
                    </label>
                    <label className="block mb-2">
                      <Field type="radio" name="gender" value="female" /> Female
                    </label>
                    <label className="block mb-2">
                      <Field type="radio" name="gender" value="not-specified" />{" "}
                      Not-specified
                    </label>
                  </div>
                )}
              </div>

              {/* Age Group */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="ageGroupEnabled" /> Age Group
                </label>
                {values.ageGroupEnabled && (
                  <Select
                    options={ageGroupOptions}
                    value={ageGroupOptions.find(
                      (o) => o.value === values.ageGroup
                    )}
                    onChange={(opt) => setFieldValue("ageGroup", opt.value)}
                    styles={customStyles}
                  />
                )}
              </div>

            {/* Lead Source */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="leadSourceEnabled" /> Lead Source
                </label>
                {values.leadSourceEnabled && (
                  <Select
                    options={serviceVariationOptions}
                    value={serviceVariationOptions.find(
                      (o) => o.value === values.leadSource
                    )}
                    onChange={(opt) => setFieldValue("leadSource", opt.value)}
                    styles={customStyles}
                  />
                )}
              </div>

              {/* Service Category */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="serviceCategoryEnabled" /> Service Category
                </label>
                {values.serviceCategoryEnabled && (
                  <Select
                    options={serviceVariationOptions}
                    value={serviceVariationOptions.find(
                      (o) => o.value === values.serviceCategory
                    )}
                    onChange={(opt) => setFieldValue("serviceCategory", opt.value)}
                    styles={customStyles}
                  />
                )}
              </div>

              {/* Service */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="serviceEnabled" /> Service
                </label>
                {values.serviceEnabled && (
                  <>
                    <Select
                      options={serviceOptions}
                      value={serviceOptions.find(
                        (o) => o.value === values.service
                      )}
                      onChange={(opt) => setFieldValue("service", opt.value)}
                      styles={customStyles}
                    />
                    {values.service && (
                      <div className="mt-4">
                        <label className="block mb-2">Service Variations </label>
                        <Select
                          options={serviceVariationOptions}
                          value={serviceVariationOptions.find(
                            (o) => o.value === values.serviceVariation
                          )}
                          onChange={(opt) =>
                            setFieldValue("serviceVariation", opt.value)
                          }
                          styles={customStyles}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Behaviour */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="behaviourEnabled" /> Behaviour
                </label>
                {values.behaviourEnabled && (
                  <div className="flex gap-4">
                    <label className="block mb-2">
                      <Field type="radio" name="behaviour" value="Irregular members" />{" "}
                      Irregular members
                    </label>
                    <label className="block mb-2">
                      <Field type="radio" name="behaviour" value="Referrers" />{" "}
                      Referrers
                    </label>
                    <label className="block mb-2">
                      <Field type="radio" name="behaviour" value="One time purchasers" />{" "}
                      One time purchasers
                    </label>
                  </div>
                )}
              </div>

              {/* Membership Expiry */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="membershipExpiryEnabled" />{" "}
                  Membership Expiry
                </label>
                {values.membershipExpiryEnabled && (
                  <div className="flex gap-4">
                    <DatePicker
                      selected={values.membershipFrom}
                      onChange={(d) => setFieldValue("membershipFrom", d)}
                      placeholderText="From"
                    />
                    <DatePicker
                      selected={values.membershipTo}
                      onChange={(d) => setFieldValue("membershipTo", d)}
                      placeholderText="To"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ENQUIRIES FIELDS */}
          {values.module === "enquiries" && (
            <>
              <div>
                <label className="block mb-2">Validity</label>
                <div className="flex gap-4">
                  <label className="block mb-2">
                    <Field type="radio" name="validity" value="all" /> All Enquiries
                  </label>
                  <label className="block mb-2">
                    <Field type="radio" name="validity" value="open" /> Open Enquiries
                  </label>
                  <label className="block mb-2">
                    <Field type="radio" name="validity" value="lost" /> Lost Enquiries
                  </label>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="dateRangeEnabled" /> Date Range
                </label>
                {values.dateRangeEnabled && (
                  <div className="flex gap-4">
                    <DatePicker
                      selected={values.dateRangeFrom}
                      onChange={(d) => setFieldValue("dateRangeFrom", d)}
                      placeholderText="From"
                    />
                    <DatePicker
                      selected={values.dateRangeTo}
                      onChange={(d) => setFieldValue("dateRangeTo", d)}
                      placeholderText="To"
                    />
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="genderEnabled" /> Gender
                </label>
                {values.genderEnabled && (
                  <div className="flex gap-4">
                    <label className="block mb-2">
                      <Field type="radio" name="gender" value="all" /> All
                    </label>
                    <label className="block mb-2">
                      <Field type="radio" name="gender" value="male" /> Male
                    </label>
                    <label className="block mb-2">
                      <Field type="radio" name="gender" value="female" /> Female
                    </label>
                    <label className="block mb-2">
                      <Field type="radio" name="gender" value="not-specified" />{" "}
                      Not-specified
                    </label>
                  </div>
                )}
              </div>

              

              {/* Service Category */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="serviceCategoryEnabled" /> Service Category
                </label>
                {values.serviceCategoryEnabled && (
                  <Select
                    options={serviceVariationOptions}
                    value={serviceVariationOptions.find(
                      (o) => o.value === values.serviceCategory
                    )}
                    onChange={(opt) => setFieldValue("serviceCategory", opt.value)}
                    styles={customStyles}
                  />
                )}
              </div>

              {/* Lead Source */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="leadSourceEnabled" /> Lead Source
                </label>
                {values.leadSourceEnabled && (
                  <Select
                    options={serviceVariationOptions}
                    value={serviceVariationOptions.find(
                      (o) => o.value === values.leadSource
                    )}
                    onChange={(opt) => setFieldValue("leadSource", opt.value)}
                    styles={customStyles}
                  />
                )}
              </div>

              {/* Lead Type */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="leadTypeEnabled" /> Lead Type
                </label>
                {values.leadTypeEnabled && (
                  <Select
                    options={serviceVariationOptions}
                    value={serviceVariationOptions.find(
                      (o) => o.value === values.leadType
                    )}
                    onChange={(opt) => setFieldValue("leadType", opt.value)}
                    styles={customStyles}
                  />
                )}
              </div>

              {/* Lead Status */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="leadStatusEnabled" /> Lead Status
                </label>
                {values.leadStatusEnabled && (
                  <Select
                    options={[
                      { value: "new", label: "New" },
                      { value: "converted", label: "Converted" },
                    ]}
                    value={values.leadStatus}
                    onChange={(opt) => setFieldValue("leadStatus", opt.values)}
                    styles={customStyles}
                  />
                )}
              </div>

              {/* Last Call Status */}
              <div>
                <label className="block mb-2">
                  <Field type="checkbox" name="lastCallStatusEnabled" /> Last
                  Call Status
                </label>
                {values.lastCallStatusEnabled && (
                  <Select
                    options={[
                      { value: "answered", label: "Answered" },
                      { value: "no-answer", label: "No Answer" },
                    ]}
                    value={values.lastCallStatus}
                    onChange={(opt) =>
                      setFieldValue("lastCallStatus", opt.value)
                    }
                    styles={customStyles}
                  />
                )}
              </div>
            </>
          )}

          {/* Email Template */}
          <div>
            <label className="block mb-2">Choose Email Template</label>
            <Select
              options={emailTemplateOptions}
              value={emailTemplateOptions.find(
                (o) => o.value === values.emailTemplate
              )}
              onChange={(opt) => {
                setFieldValue("emailTemplate", opt.value);
                if (templateMessages[opt.value]) {
                  setFieldValue("message", templateMessages[opt.value]);
                }
              }}
              styles={customStyles}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block mb-2">Subject</label>
            <Field
              name="subject"
              type="text"
              className="w-full border px-3 py-2"
              placeholder="Enter subject"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block mb-2">Message</label>
            {/* <CKEditor
              editor={ClassicEditor}
              data={values.message}
              onChange={(event, editor) =>
                setFieldValue("message", editor.getData())
              }
            /> */}
          </div>

          {/* Attachment */}
          <div>
            <label className="block mb-2">Attachment</label>
            <input
              type="file"
              onChange={(e) => setFieldValue("attachment", e.target.files[0])}
            />
          </div>

          {/* Send Copy */}
          <div>
            <label className="block mb-2">
              <Field type="checkbox" name="sendCopy" /> Send a copy to me
            </label>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          >
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default WhatsappModule;
