import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaListUl, FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";

const FreezeMembershipModal = ({ 
  setFreezeMembership,
  membershipData,
  fetchMemberServiceCard,
  fetchMemberById,
  fetchPurchasedMemberships,
  details,
 }) => {
  // Prevent invalid keys in number input
  const blockInvalidNumberKeys = (e) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  const formik = useFormik({
    initialValues: {
      no_of_days: "",
      member_id: membershipData?.member_id,
      subscription_booking_id: membershipData?.subscription_booking_id,
    },

    validationSchema: Yup.object({
      no_of_days: Yup.number()
        .typeError("Extension days must be a number")
        .required("Extension days is required")
        .positive("Must be greater than 0")
        .integer("Only whole numbers are allowed")
        .min(7, "Minimum 7 days are required")
        .max(90, "Maximum 90 days are allowed"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          no_of_days: values.no_of_days,
          member_id: values.member_id,
          subscription_booking_id: values.subscription_booking_id,
        };

        const response = await authAxios().put( "/membership/freeze", payload);
        toast.success(response?.data?.message)
        await fetchMemberServiceCard();
        await fetchMemberById(details?.id);
        await fetchPurchasedMemberships();

        setFreezeMembership(false);
        resetForm();

      } catch (error) {
        toast.error(
          error.response?.data?.errors || error.response?.data?.message,
        );
      }
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="max-w-sm w-full">
        <form onSubmit={formik.handleSubmit}>
          <div className="bg-white p-6 rounded-t shadow-lg">
            {/* Extension Days */}
            <div>
              <label className="mb-2 block">
                Number of freeze days
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
                  onChange={formik.handleChange}
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
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 bg-white px-2 py-3 border-t rounded-b">
            <button
              type="button"
              onClick={() => setFreezeMembership(false)}
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

export default FreezeMembershipModal;
