import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaListUl, FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { blockNonLettersAndNumbers, sanitizePositiveInteger, sanitizeTextWithNumbers } from "../../Helper/helper";

const ExtendServiceModal = ({
  setExtendServiceModal,
  membershipData,
  extendServiceId,
  fetchMemberById,
  fetchMemberServiceCard,
  fetchPurchaseServices,
  details,
}) => {
  // Prevent invalid keys in number input
  const blockInvalidNumberKeys = (e) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  console.log(membershipData?.end_date,'membershipData')

  const formik = useFormik({
    initialValues: {
      member_id: membershipData?.member_id,
      package_booking_id: extendServiceId,
      no_of_days: "",
      remarks: "",
      extension_type: "PACKAGE",
      pdfFile: null,
    },

    validationSchema: Yup.object({
      no_of_days: Yup.number()
      .typeError("Extend days must be a number")
      .required("Extend days is required")
      .positive("Must be greater than 0")
      .integer("Only whole numbers are allowed")
      .test(
        "max-extension-date",
        "Extension days exceed membership expiry date",
        function (value) {
          if (!value || !membershipData?.end_date) return true;

          const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
          };

          // Today's date (local timezone)
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Parse membership end date as local date
          const [year, month, day] = membershipData.end_date.split("-");

          const membershipEndDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
          );

          membershipEndDate.setHours(0, 0, 0, 0);

          // Add entered days to today
          const extendedDate = new Date(today);
          extendedDate.setDate(extendedDate.getDate() + Number(value));

          // console.log("Entered Days:", value);
          // console.log("Today's Date:", formatDate(today));
          // console.log("Membership End Date:", formatDate(membershipEndDate));
          // console.log("Extended Date:", formatDate(extendedDate));

          return extendedDate <= membershipEndDate;
        }
      ),

      remarks: Yup.string()
        .required("Remarks are required"),

      pdfFile: Yup.mixed()
        .required("PDF file is required")
        .test("fileFormat", "Only PDF files are allowed", (value) => {
          if (!value) return false;
          return value.type === "application/pdf";
        }),
    }),

    onSubmit: async (values, { resetForm }) => {

      try {
        const formData = new FormData();

        formData.append("member_id", values.member_id);
        formData.append("package_booking_id",values.package_booking_id);
        formData.append("no_of_days", values.no_of_days);
        formData.append("remarks", values.remarks);
        formData.append("extension_type", values.extension_type);

        // PDF File
        formData.append("pdfFile", values.pdfFile);

        // console.log(formData,'formData')

        const response = await authAxios().put("/extend/service", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success(response?.data?.message);

        await fetchMemberServiceCard();
        await fetchMemberById(details?.id);
        await fetchPurchaseServices();

        setExtendServiceModal(false);

        resetForm();
      } catch (err) {
        console.log(err, "err");

        toast.error(
          err.response?.data?.errors ||
            err.response?.data?.message ||
            "Something went wrong",
        );
      }
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="max-w-sm w-full">
        <form onSubmit={formik.handleSubmit}>
          <div className="bg-white p-6 rounded-t shadow-lg">
            <h2 className="text-xl font-bold text-black mb-2">Extend Service</h2>
            {/* Extension Days */}
            <div>
              <label className="mb-2 block">
                Number of extend days
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                  <FaListUl />
                </span>

                <input
                  type="number"
                  name="no_of_days"
                  value={formik.values.no_of_days}
                  onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                  onChange={(e) => {
                    const cleanValue = sanitizePositiveInteger(e.target.value);
                      formik.setFieldValue("no_of_days", cleanValue, true);
                      // OR explicitly validate
                      formik.validateField("no_of_days");
                  }}
                  onBlur={formik.handleBlur}
                  onKeyDown={blockInvalidNumberKeys}
                  className="custom--input w-full input--icon number--appearance-none"
                  placeholder="Enter extension days"
                />
              </div>

              {formik.touched.no_of_days && formik.errors.no_of_days && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.no_of_days}
                </p>
              )}
            </div>

            {/* Remarks */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-black mb-2">
                Remarks<span className="text-red-500">*</span>
              </label>

              <textarea
                name="remarks"
                value={formik.values.remarks}
                onKeyDown={blockNonLettersAndNumbers}
                onChange={(e) => {
                  const cleaned = sanitizeTextWithNumbers(e.target.value);
                  formik.setFieldValue("remarks", cleaned, true);
                  formik.validateField("remarks");
                }}
                onBlur={formik.handleBlur}
                className="custom--input w-full"
                rows={3}
                placeholder="Add any additional notes..."
              />

              {formik.touched.remarks && formik.errors.remarks && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.remarks}
                </p>
              )}
            </div>

            {/* PDF Upload */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-black mb-2">
                Upload PDF<span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                  <FaFilePdf />
                </span>

                <input
                  type="file"
                  accept=".pdf"
                  onChange={(event) => {
                    formik.setFieldValue(
                      "pdfFile",
                      event.currentTarget.files[0],
                       true
                    );
                    formik.validateField("pdfFile");
                  }}
                  className="custom--input w-full input--icon"
                />
              </div>

              {formik.touched.pdfFile && formik.errors.pdfFile && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.pdfFile}
                </p>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 bg-white px-2 py-3 border-t rounded-b">
            <button
              type="button"
              onClick={() => setExtendServiceModal(false)}
              className="bg-white text-black px-4 py-2 rounded w-full max-w-[100px] border"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded w-full max-w-[100px]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExtendServiceModal;
