import React, { useEffect, useRef, useState } from "react";
import { IoClose, IoCloseCircle } from "react-icons/io5";
import { authAxios } from "../../config/config";
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
  memberStatusId,
}) => {
  const leadBoxRef = useRef();
  const [kycDocumentData, setKycDocumentData] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [kycUpdateDocument, setKycUpdateDocument] = useState({
    status: "",
    remarks: "",
  });
  const [previewFile, setPreviewFile] = useState({
    url: "",
    type: "",
  });
  const [historySortOrder, setHistorySortOrder] = useState("oldest");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [kycHistoryData, setKycHistoryData] = useState(null);

  const documents = kycDocumentData?.data || [];
  const idProof = documents.find((doc) => doc.document_type === "ID_PROOF");
  const photoProof = documents.find((doc) => doc.document_type === "PHOTO");
  const corporateProof = documents.find(
    (doc) => doc.document_type === "CORPORATE_ID",
  );

  const documentHistory = kycHistoryData?.history || [];

  const statusConfig = {
  APPROVED: {
    text: "Approved",
    className: "bg-[#E8FFE6] text-[#138808]",
  },
  REJECTED: {
    text: "Rejected",
    className: "bg-red-100 text-red-600",
  },
  RESUBMITTED: {
    text: "Re-submitted",
    className: "bg-blue-100 text-blue-600",
  },
  PENDING_REVIEW: {
    text: "Pending review",
    className: "bg-orange-100 text-orange-700",
  },
  PENDING: {
    text: "Pending",
    className: "bg-yellow-100 text-yellow-700",
  },
  FREEZED: {
    text: "Freezed",
    className: "bg-gray-200 text-gray-700",
  },
};
const getStatusAction = (status) => {
  switch (status) {
    case "REJECTED":
      return "Rejection";
    case "APPROVED":
      return "Approval";
    default:
      return formatText(status);
  }
};

const currentStatus = statusConfig[kycHistoryData?.kyc_status] || statusConfig.PENDING;
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

  useEffect(() => {
    if (memberKycDocuments) {
      const fetchKycHistory = async () => {
        try {
          const res = await authAxios().get(
            `/kyc/document/history/${memberKycDocuments}`,
          );
          setKycHistoryData(res.data || null);
        } catch (err) {
          console.error(err);
        }
      };

      fetchKycHistory();
    }
  }, [memberKycDocuments]);

  const getPreview = (value) => {
    if (!value) return null;

    // Existing file from API
    if (typeof value === "string") {
      const extension = value.split(".").pop().toLowerCase();

      return {
        url: value,
        type: extension === "pdf" ? "pdf" : "image",
      };
    }

    // Newly uploaded file
    if (value instanceof File) {
      return {
        url: URL.createObjectURL(value),
        type: value.type === "application/pdf" ? "pdf" : "image",
      };
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

  const isPdf = (file) => {
    if (!file) return false;

    // File object (new upload)
    if (file instanceof File) {
      return file.type === "application/pdf";
    }

    // URL from API
    return file.toLowerCase().includes(".pdf");
  };
  const DocumentPreview = ({ file, alt }) => {
    if (!file) return null;

    return isPdf(file) ? (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
        <div className="text-5xl leading-none">📄</div>
        {/* <p className="text-sm font-medium mt-2">PDF Document</p> */}
      </div>
    ) : (
      <img src={file} alt={alt} className="h-full w-full object-cover" />
    );
  };

  const DocumentCard = ({ file, title, subtitle, alt }) => {
    if (!file) return null;
    return (
      <button
        type="button"
        onClick={() => {
          setPreviewFile(getPreview(file));
          setShowPreviewModal(true);
        }}
        className="overflow-hidden rounded-[12px] border border-[#dedede] bg-white text-left transition hover:border-[#bdbdbd]"
      >
        <div className="h-[138px] overflow-hidden bg-[#f7f7f7]">
          <DocumentPreview file={file} alt={alt} />
        </div>
        <div className="px-[14px] py-[11px]">
          <h3 className="text-[15px] font-semibold uppercase leading-5 text-[#222]">
            {title}
          </h3>
          <p className="mt-[1px] text-[14px] leading-5 text-[#858585]">
            {subtitle}
          </p>
        </div>
      </button>
    );
  };

  const HistoryThumbnails = ({ item }) => {

    console.log(item,"itemitem")
    const historyDocuments = item?.documents || [];
    const files = Array.isArray(historyDocuments)
      ? historyDocuments
          .flatMap((document) =>
            typeof document === "string"
              ? [document]
              : [document?.document_front_file, document?.document_back_file],
          )
          .filter(Boolean)
      : [];

    if (!files.length) return null;

    return (
      <div className="mt-3 flex gap-2">
        {files.slice(0, 4).map((file, index) => (
          <button
            type="button"
            key={`${file}-${index}`}
            onClick={() => {
              setPreviewFile(getPreview(file));
              setShowPreviewModal(true);
            }}
            className="h-[52px] w-[72px] overflow-hidden rounded-[8px] border border-[#e4e4e4] bg-[#f7f7f7]"
          >
            <DocumentPreview
              file={file}
              alt={`History document ${index + 1}`}
            />
          </button>
        ))}
      </div>
    );
  };
  // API returns history oldest first, so reverse only for "newest first" order
  const sortedDocumentHistory =
    historySortOrder === "oldest"
      ? documentHistory
      : [...documentHistory].reverse();
  return (
    <>
      <div
        className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[22] w-full bg-black bg-opacity-60 h-full"
        onClick={handleOverlayClick}
      >
        <div
          className="mx-auto my-2 flex min-h-[calc(100vh-16px)] w-[calc(100%-8px)] max-w-[1280px] flex-col overflow-hidden1 rounded-[20px] bg-white shadow-2xl lg:my-8 lg:min-h-[calc(100vh-64px)]"
          ref={leadBoxRef}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#e8e8e8] bg-white px-5 py-6 md:px-8 rounded-t-[20px]">
            <div>
              <h2 className="text-[24px] font-semibold text-[#202020]">
                {kycDocumentData?.member_name}
              </h2>
              <p className="mt-1 text-[14px] text-[#707070] ">
                Membership ID: {kycDocumentData?.membership_number}
              </p>
              <p className="mt-1 text-[14px] text-[#707070] ">
                Membership Plan: {kycDocumentData?.subscription_title }
              </p>
            </div>
            <div className="flex items-center gap-4">
             <span
  className={`flex min-h-[34px] items-center gap-2 rounded-full px-4 text-[14px] font-semibold ${currentStatus.className}`}
>
  <FaCircle className="text-[9px]" />
  {currentStatus.text}
</span>
              <button
                type="button"
                aria-label="Close"
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#171717] text-white transition hover:bg-black"
                onClick={() => {
                  setMemberKycDocuments(null);
                  setShowModal(false);
                }}
              >
                <IoClose className="text-[22px]" />
              </button>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] bg-white rounded-b-[20px]">
            <main className="px-5 py-7 md:px-8 lg:border-r lg:border-[#e8e8e8]">
              <div className="sticky top-5">
              <h2 className="mb-4 text-[14px] uppercase tracking-[0.07em] text-[#000000]">
                Current submission -<span className="font-bold"> Attempt {kycDocumentData?.attempts}</span>
               
              </h2>

              <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-3">
                <DocumentCard
                  file={idProof?.document_front_file}
                  title="Aadhaar Card Front"
                  subtitle="ID proof front"
                  alt="Aadhaar Front"
                />
                <DocumentCard
                  file={idProof?.document_back_file}
                  title="Aadhaar Card Back"
                  subtitle="ID proof back"
                  alt="Aadhaar Back"
                />
                <DocumentCard
                  file={photoProof?.document_front_file}
                  title="Passport Photo"
                  subtitle="Photo document"
                  alt="Passport Photograph"
                />
                <DocumentCard
                  file={corporateProof?.document_front_file}
                  title="Corporate ID"
                  subtitle="Corporate document"
                  alt="Corporate ID"
                />
              </div>

              <div className="mt-7 border-t border-[#e8e8e8] pt-6">
                <div>
                  <label className="mb-2 block text-[14px] uppercase tracking-[0.07em] text-[#000000]">
                    Reviewer remarks<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      name="remarks"
                      value={kycUpdateDocument.remarks}
                      onChange={handleRemarksChange}
                      onPaste={handleRemarksPaste}
                      placeholder="Enter remarks"
                     className={`custom--input w-full resize-none rounded-[13px] border border-[#dedede] px-4 py-3 text-[16px] outline-none focus:border-[#999] ${
  (idProof?.status === "PENDING" ||
    kycHistoryData?.kyc_status === "RESUBMITTED")
    ? "bg-white"
    : "!bg-[#fafafa] text-[#555]"
}`}
                     disabled={
  idProof?.status !== "PENDING" &&
  kycHistoryData?.kyc_status !== "RESUBMITTED"
}
                    />
                  </div>
                </div>
              </div>

              {(idProof?.status === "PENDING" ||
  kycHistoryData?.kyc_status === "RESUBMITTED") && (
                <div className="mt-4 flex flex-col gap-3 xl:flex-row">
                  {/* <div className="flex-1 rounded-[7px] bg-[#f3f3f3] px-3 py-3">
                    <p className="mb-0 text-sm text-[#949494] flex items-center gap-2">
                      <AiOutlineInfoCircle />
                      <span>
                        Disclaimer: Decision applies to all 4 documents at once.
                      </span>
                    </p>
                  </div> */}
                  <div className="flex w-full items-center gap-2 xl:max-w-[300px]">
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
            </main>

            <aside className="px-3 py-4">
              <div className="mb-4 flex items-center justify-between gap-3 px-2">
                <h2 className="text-[14px] uppercase text-[#000000]">
                  Document history
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    setHistorySortOrder((currentOrder) =>
                      currentOrder === "oldest" ? "newest" : "oldest",
                    );
                  }}
                  className="cursor-pointer border-0 bg-transparent p-0 text-[12px] text-[#000000] hover:underline"
                >
                  {historySortOrder === "oldest"
                    ? "Oldest first"
                    : "Newest first"}
                </button>
              </div>

              <div>
                {sortedDocumentHistory.map((item, index) => {
                  const type = item?.type || "PENDING";

                  const dotColor =
                    type === "APPROVED"
                      ? "bg-[#168348]"
                      : type === "REJECTED"
                        ? "bg-[#df2b20]"
                        : type === "UPLOAD"
                          ? "bg-[#3538cd]"
                          : "bg-[#d68238]";

                  return (
                    <div
                      key={index}
                      className="relative pb-4 pl-9 last:pb-0"
                    >
                      {index < sortedDocumentHistory.length - 1 && (
                        <span className="absolute left-[11px] top-4 h-[calc(100%-8px)] w-px bg-[#e2e2e2]" />
                      )}

                      <span
                        className={`absolute left-[5px] top-[5px] h-[14px] w-[14px] rounded-full ${dotColor}`}
                      />
                      <div className="flex justify-between ">
                      <h3 className="text-[14px] font-semibold text-[#202020]">
                        {item?.title || formatText(type)}
                      </h3>
                      
                      <p className="text-[12px] font-semibold text-[#202020] pr-3">
                      (Source : {item?.source})
                      </p>

                        </div>

                      {(item?.date || item?.attempt) && (
                        <p className="text-[12px] text-[#929292]">
                          {item?.date}
                          {item?.attempt ? ` · Attempt ${item.attempt}` : ""}
                        </p>
                      )}

                      {item?.remarks && (
                        <p className="text-[14px] text-[#565656]">
                          {item.remarks}
                        </p>
                      )}

                      <HistoryThumbnails item={item} />
                    </div>
                  );
                })}
              </div>
            </aside>
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

            {previewFile.type === "pdf" ? (
              <iframe
                src={previewFile.url}
                title="PDF Preview"
                className="w-full h-[80vh] rounded"
              />
            ) : (
              <img
                src={previewFile.url}
                alt="Preview"
                className="w-full max-h-[80vh] object-contain rounded"
              />
            )}
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-3">
              Confirm {getStatusAction(selectedStatus)}
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-semibold">
          {
  selectedStatus === "APPROVED"
    ? "Approve"
    : selectedStatus === "REJECTED"
    ? "Reject"
    : formatText(selectedStatus)
}
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
  : selectedStatus === "APPROVED"
    ? "Yes, Approve"
    : selectedStatus === "REJECTED"
      ? "Yes, Reject"
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
