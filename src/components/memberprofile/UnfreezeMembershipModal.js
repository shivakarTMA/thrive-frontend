import React from "react";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";

const UnfreezeMembershipModal = ({
  setUnfreezeMembership,
  membershipData,
  fetchMemberServiceCard,
  fetchMemberById,
  fetchPurchasedMemberships,
  details,
}) => {
  const handleUnfreeze = async () => {
    try {
      const payload = {
        member_id: membershipData?.member_id,
        subscription_booking_id:
          membershipData?.subscription_booking_id,
      };

      const response = await authAxios().put(
        "/membership/unfreeze",
        payload
      );

      toast.success(response?.data?.message);

      await fetchMemberServiceCard();
      await fetchMemberById(details?.id);
      await fetchPurchasedMemberships();

        setUnfreezeMembership(false);
    } catch (error) {
      toast.error(
        error.response?.data?.errors ||
          error.response?.data?.message
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-sm p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">
          Unfreeze Membership
        </h2>

        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to unfreeze this membership?
        </p>

        <div className="flex justify-center gap-2">
          <button
            onClick={() => setUnfreezeMembership(false)}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleUnfreeze}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Yes, Unfreeze
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnfreezeMembershipModal;