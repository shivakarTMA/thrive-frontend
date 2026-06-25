import React, { useEffect, useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { authAxios } from "../../config/config";
import { FiEye } from "react-icons/fi";
import { FaCircle } from "react-icons/fa6";
import {
  allowLettersAndNumbers,
  formatText,
  sanitizeTextWithNumbers,
} from "../../Helper/helper";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { toast } from "react-toastify";

const KycDocumentsModal = ({
  setShowModal,
  memberKycDocuments,
  setMemberKycDocuments,
  fetchMemberKycDocuments,
  memberStatusId
}) => {
  const leadBoxRef = useRef();
  const [kycDocumentData, setKycDocumentData] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [kycUpdateDocument, setKycUpdateDocument] = useState({
    status: "",
    remarks: "",
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const documents = kycDocumentData?.data || [];
  const idProof = documents.find((doc) => doc.document_type === "ID_PROOF");
  const photoProof = documents.find((doc) => doc.document_type === "PHOTO");
  const corporateProof = documents.find(
    (doc) => doc.document_type === "CORPORATE_ID",
  );

  useEffect(() => {
    if (memberKycDocuments && memberStatusId) {
      const fetchPackageById = async () => {
        try {
          const res = await authAxios().get(
            `/kyc/document/list/${memberKycDocuments}?status=${memberStatusId}`,
          );
          const data = res.data || [];
          setKycDocumentData(data);
          setKycUpdateDocument({
            remarks: data?.remarks || "",
        });
        } catch (err) {
          console.error(err);
        }
      };

      fetchPackageById();
    }
  }, [memberKycDocuments]);

  const getPreview = (value) => {
    if (!value) return null;

    // ✅ If it's already a URL (API response)
    if (typeof value === "string") {
      return value;
    }

    // ✅ If it's a File (new upload)
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }

    return null;
  };

  const handleRemarksChange = (e) => {
    const sanitizedValue = allowLettersAndNumbers(e.target.value);

    setKycUpdateDocument((prev) => ({
      ...prev,
      remarks: sanitizedValue,
    }));
  };

  const handleRemarksPaste = (e) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text");
    const sanitizedText = sanitizeTextWithNumbers(pastedText);

    setKycUpdateDocument((prev) => ({
      ...prev,
      remarks: prev.remarks + sanitizedText,
    }));
  };

  const handleUpdateKycStatus = async () => {
    try {
      if (!kycUpdateDocument.remarks) {
        toast.error("Remarks is required");
        return;
      }

      setLoading(true);

      const payload = {
        status: selectedStatus,
        remarks: kycUpdateDocument.remarks,
      };

      const res = await authAxios().put(
        `/kyc/document/status/update/${memberKycDocuments}`,
        payload,
      );
      // Close modals
      setShowConfirmModal(false);
      setShowModal(false);
      setMemberKycDocuments(null);
      fetchMemberKycDocuments();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmationModal = (status) => {
    if (!kycUpdateDocument.remarks?.trim()) {
      toast.error("Remarks is required");
      return;
    }

    setSelectedStatus(status);
    setShowConfirmModal(true);
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
      setMemberKycDocuments(null);
    }
  };

  console.log(memberKycDocuments, "memberKycDocuments");
  console.log(kycDocumentData, "kycDocumentData");

  return (
    <>
      <div
        className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[22] w-full bg-black bg-opacity-60 h-full"
        onClick={handleOverlayClick}
      >
        <div
          className="min-h-[70vh] w-[95%] max-w-[1200px] mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
          ref={leadBoxRef}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white rounded-t-[10px] flex gap-3 items-start justify-between py-4 px-4 border-b">
            <div>
              <h2 className="text-xl font-semibold">
                {kycDocumentData?.member_name}
              </h2>
              <p className="text-sm">
                Membership ID: {kycDocumentData?.membership_number}
              </p>
              <p className="text-sm">
                Contact: +{kycDocumentData?.country_code}{" "}
                {kycDocumentData?.mobile}
              </p>
            </div>
            <div
              className="close--lead cursor-pointer"
              onClick={() => {
                setMemberKycDocuments(null);
                setShowModal(false);
              }}
            >
              <IoCloseCircle className="text-3xl" />
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-b-[10px] py-6 px-5">
              <div className="mb-5 flex items-center gap-2 justify-between">
                <h2 className="uppercase text-md">Documents Submitted</h2>

                <span
                  className={`
                    flex items-center justify-between gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit
                    ${
                      idProof?.status === "APPROVED"
                        ? "bg-[#E8FFE6] text-[#138808]"
                        : idProof?.status === "REJECTED"
                          ? "bg-red-100 text-red-600"
                          : "bg-orange-100 text-orange-600"
                    }
                    `}
                >
                  <FaCircle className="text-[10px]" />{" "}
                  {formatText(idProof?.status)}
                </span>
              </div>

              <div className="grid lg:grid-cols-4 grid-cols-2 gap-[20px]">
                {idProof?.document_front_file && (
                  <div className="rounded-2xl bg-white shadow-lg overflow-hidden border border-gray-200">
                    <div className="relative">
                      <img
                        src={idProof.document_front_file}
                        alt="Aadhaar Front"
                        className="w-full h-[170px] object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>

                    <div className="flex items-center justify-between px-3 py-3">
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          Aadhaar Card Front
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                          ID Proof Front
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (!idProof.document_front_file) return;
                          setPreviewImage(
                            getPreview(idProof.document_front_file),
                          );
                          setShowPreviewModal(true);
                        }}
                        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                      >
                        <FiEye className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}
                {idProof?.document_back_file && (
                  <div className="rounded-2xl bg-white shadow-lg overflow-hidden border border-gray-200">
                    <div className="relative">
                      <img
                        src={idProof.document_back_file}
                        alt="Aadhaar Back"
                        className="w-full h-[170px] object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>

                    <div className="flex items-center justify-between px-3 py-3">
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          Aadhaar Card Back
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                          ID Proof Back
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (!idProof.document_back_file) return;
                          setPreviewImage(
                            getPreview(idProof.document_back_file),
                          );
                          setShowPreviewModal(true);
                        }}
                        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                      >
                        <FiEye className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}

                {photoProof?.document_front_file && (
                  <div className="rounded-2xl bg-white shadow-lg overflow-hidden border border-gray-200">
                    <div className="relative">
                      <img
                        src={photoProof.document_front_file}
                        alt="Passport Photograph"
                        className="w-full h-[170px] object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>

                    <div className="flex items-center justify-between px-3 py-3">
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          Passport Photo
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                          Photo Document
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (!photoProof.document_front_file) return;
                          setPreviewImage(
                            getPreview(photoProof.document_front_file),
                          );
                          setShowPreviewModal(true);
                        }}
                        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                      >
                        <FiEye className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}
                {corporateProof?.document_front_file && (
                  <div className="rounded-2xl bg-white shadow-lg overflow-hidden border border-gray-200">
                    <div className="relative">
                      <img
                        src={corporateProof.document_front_file}
                        alt="Corporate ID"
                        className="w-full h-[170px] object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>

                    <div className="flex items-center justify-between px-3 py-3">
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          Corporate ID
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                          Corporate Document
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (!corporateProof.document_front_file) return;
                          setPreviewImage(
                            getPreview(corporateProof.document_front_file),
                          );
                          setShowPreviewModal(true);
                        }}
                        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                      >
                        <FiEye className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div>
                  <label className="mb-2 block">
                    Remarks<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      name="remarks"
                      value={kycUpdateDocument.remarks}
                      onChange={handleRemarksChange}
                      onPaste={handleRemarksPaste}
                      placeholder="Enter remarks"
                      className={`custom--input w-full ${idProof?.status !== "PENDING" ? '!bg-gray-100 text-gray-600' : ''}`}
                      disabled={idProof?.status !== "PENDING" ? true : false}
                    />
                  </div>
                </div>
              </div>

              {idProof?.status !== "PENDING" ? null : (
                <div className="mt-3 flex gap-2">
                    <div className="bg-[#EEEEEE] rounded-[5px] flex-1 px-3 py-3">
                    <p className="mb-0 text-sm text-[#949494] flex items-center gap-2">
                        <AiOutlineInfoCircle />
                        <span>
                        Disclaimer: Decision applies to all 4 documents at once.
                        </span>
                    </p>
                    </div>
                    <div className="flex align-center gap-2 max-w-[300px] w-full">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => openConfirmationModal("REJECTED")}
                        className="px-4 py-2 bg-transparent border border-black text-black font-semibold rounded max-w-[150px] w-full disabled:opacity-50"
                    >
                        Reject KYC
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => openConfirmationModal("APPROVED")}
                        className="px-4 py-2 bg-black text-white font-semibold rounded max-w-[150px] w-full disabled:opacity-50"
                    >
                        Approve KYC
                    </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg relative max-w-3xl w-full">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setShowPreviewModal(false)}
            >
              <IoCloseCircle className="text-3xl" />
            </button>

            {/* Image */}
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-3">
              Confirm {formatText(selectedStatus)}
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-semibold">
                {formatText(selectedStatus)}
              </span>{" "}
              this KYC submission?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleUpdateKycStatus}
                className={`px-4 py-2 rounded-md text-white ${
                  selectedStatus === "APPROVED" ? "bg-green-600" : "bg-red-600"
                } disabled:opacity-50`}
              >
                {loading
                  ? "Please wait..."
                  : `Yes, ${formatText(selectedStatus)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KycDocumentsModal;
