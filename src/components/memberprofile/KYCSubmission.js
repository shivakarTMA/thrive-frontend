import React, { useState, useRef, useEffect } from "react";
import { authAxios } from "../../config/config";
import { IoEyeOutline, IoTimeOutline } from "react-icons/io5";
import { RxCross2, RxUpdate } from "react-icons/rx";
import { toast } from "react-toastify";
import { FiDownload, FiUpload } from "react-icons/fi";
import { MdModeEdit, MdOutlineFileDownload } from "react-icons/md";
import IsLoadingHOC from "../common/IsLoadingHOC";
import { useSelector } from "react-redux";
import { FaCheck } from "react-icons/fa6";

const KYCSubmission = ({ details, setLoading }) => {
  const memberId = details?.id;
  const corporateId = details?.is_corporate_id;
  const [errors, setErrors] = useState({});
  const [memberKycStatus, setMemberKycStatus] = useState('')

  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [documents, setDocuments] = useState({
    aadharFront: null,
    aadharBack: null,
    passportPhoto: null,
    corporateId: null,
  });
  const [previewing, setPreviewing] = useState(null);
  const [dragOver, setDragOver] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const fileInputRefs = {
    aadharFront: useRef(null),
    aadharBack: useRef(null),
    passportPhoto: useRef(null),
    corporateId: useRef(null),
  };

  const documentTypes = {
    aadharFront: { label: "Aadhar Card (Front)", accept: "image/*" },
    aadharBack: { label: "Aadhar Card (Back)", accept: "image/*" },
    passportPhoto: { label: "Passport Photo", accept: "image/*" },
    corporateId: { label: "Corporate ID", accept: "image/*" },
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const fetchMemberById = async () => {
  try {
    const res = await authAxios().get(`/member/${memberId}`);

    const data = res.data?.data || res.data || null;

    const latestStatus = data?.kyc_status || "";

    setMemberKycStatus(latestStatus);

    return latestStatus;
  } catch (err) {
    console.error(err);
    return "";
  }
};

const fetchKycDocuments = async (status) => {
  try {
    const response = await authAxios().get(
      `/kyc/document/list/${memberId}`,
      {
        params: {
          status,
        },
      }
    );

    if (response.data.status && response.data.data) {
      const data = response.data.data;

      const aadhar = data.find(
        (d) => d.document_type === "ID_PROOF"
      );

      const passport = data.find(
        (d) => d.document_type === "PHOTO"
      );

      const corporateId = data.find(
        (d) => d.document_type === "CORPORATE_ID"
      );

      setDocuments({
        aadharFront: aadhar
          ? {
              preview: aadhar.document_front_file,
              name: "Aadhar Front (Uploaded)",
              id: aadhar.id,
              uploaded: true,
              status: aadhar.status,
              type: "ID_PROOF",
            }
          : null,

        aadharBack: aadhar
          ? {
              preview: aadhar.document_back_file,
              name: "Aadhar Back (Uploaded)",
              id: aadhar.id,
              uploaded: true,
              status: aadhar.status,
              type: "ID_PROOF",
            }
          : null,

        passportPhoto: passport
          ? {
              preview: passport.document_front_file,
              name: "Passport Photo (Uploaded)",
              id: passport.id,
              uploaded: true,
              status: passport.status,
              type: "PHOTO",
            }
          : null,

        corporateId: corporateId
          ? {
              preview: corporateId.document_front_file,
              name: "Corporate ID (Uploaded)",
              id: corporateId.id,
              uploaded: true,
              status: corporateId.status,
              type: "CORPORATE_ID",
            }
          : null,
      });
    }
  } catch (error) {
    console.error("Error fetching KYC documents:", error);
  }
};

useEffect(() => {
  const initializeData = async () => {
    const latestStatus = await fetchMemberById();

    if (latestStatus) {
      await fetchKycDocuments(latestStatus);
    }
  };

  if (memberId) {
    initializeData();
  }
}, [memberId]);

  // Handle file selection (just preview change)
  const handleFileSelect = (documentType, file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocuments((previous) => ({
          ...previous,
          [documentType]: {
            ...previous[documentType],
            file,
            preview: e.target.result,
            name: file.name,
            size: file.size,
            uploaded: false, // mark as modified
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditDocuments = () => {
    setIsEditMode(true);

    // Clear all existing documents
    setDocuments({
      aadharFront: null,
      aadharBack: null,
      passportPhoto: null,
      corporateId: null,
    });

    // Clear validation errors
    setErrors({});
  };

  console.log(memberKycStatus, "memberKycStatus");

  // Handle submit for all documents
  const handleSubmit = async () => {
    let hasError = false;
    const newErrors = {};

    // Validation for Aadhar Front and Back using uploaded flag or preview
    if (
      (!documents.aadharFront?.file && !documents.aadharFront?.uploaded) ||
      !documents.aadharFront?.preview
    ) {
      newErrors.aadharFront = "Please upload your Aadhar Front image.";
      hasError = true;
    }

    if (
      (!documents.aadharBack?.file && !documents.aadharBack?.uploaded) ||
      !documents.aadharBack?.preview
    ) {
      newErrors.aadharBack = "Please upload your Aadhar Back image.";
      hasError = true;
    }

    // Validation for Passport Photo
    if (
      (!documents.passportPhoto?.file && !documents.passportPhoto?.uploaded) ||
      !documents.passportPhoto?.preview
    ) {
      newErrors.passportPhoto = "Please upload your Passport Photo image.";
      hasError = true;
    }

    // Validation for Corporate ID (only if is_corporate_id is true)
    if (corporateId) {
      if (
        (!documents.corporateId?.file && !documents.corporateId?.uploaded) ||
        !documents.corporateId?.preview
      ) {
        newErrors.corporateId = "Please upload your Corporate ID";
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      // Upload or update Aadhar documents (ID_PROOF)
      if (documents.aadharFront || documents.aadharBack) {
        const formData = new FormData();
        formData.append("member_id", memberId);
        formData.append("document_type", "ID_PROOF");

        if (documents.aadharFront?.file)
          formData.append("document_front_file", documents.aadharFront.file);
        if (documents.aadharBack?.file)
          formData.append("document_back_file", documents.aadharBack.file);

        // Use existing id if available (prefer aadharFront id first)
        const id = documents.aadharFront?.id || documents.aadharBack?.id;
        
        if (memberKycStatus === "APPROVED") {
          await authAxios().put(`/kyc/document/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await authAxios().post(`/kyc/document/create`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }

      // Upload or update Passport Photo (PHOTO)
      if (documents.passportPhoto) {
        const formData = new FormData();

        formData.append("member_id", memberId);
        formData.append("document_type", "PHOTO");

        if (documents.passportPhoto?.file) {
          formData.append(
            "document_front_file",
            documents.passportPhoto.file
          );
        }

        if (
          memberKycStatus === "APPROVED" &&
          documents.passportPhoto?.id
        ) {
          await authAxios().put(
            `/kyc/document/${documents.passportPhoto.id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          await authAxios().post(
            `/kyc/document/create`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
      }
      if (documents.corporateId) {
        const formData = new FormData();

        formData.append("member_id", memberId);
        formData.append("document_type", "CORPORATE_ID");

        if (documents.corporateId?.file) {
          formData.append(
            "document_front_file",
            documents.corporateId.file
          );
        }

        if (
          memberKycStatus === "APPROVED" &&
          documents.corporateId?.id
        ) {
          await authAxios().put(
            `/kyc/document/${documents.corporateId.id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          await authAxios().post(
            `/kyc/document/create`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
      }

      toast.success("Documents submitted successfully!");
      const latestStatus = await fetchMemberById();
      await fetchKycDocuments(latestStatus);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error uploading documents:", error);
    }
  };

  const handleDrop = (event, documentType) => {
    event.preventDefault();
    setDragOver("");
    const file = event.dataTransfer.files[0];
    handleFileSelect(documentType, file);
  };

  const handleDragOver = (event, documentType) => {
    event.preventDefault();
    setDragOver(documentType);
  };

  const handleDragLeave = () => setDragOver("");

  const openFileDialog = (ref) => {
    if (ref.current) ref.current.click();
  };

  const downloadAndOpenParqForm = async () => {
    try {
      setLoading(true);

      // Fetch the file as a blob
      const res = await authAxios().post(
        `/member/parqform/download/${details?.id}`,
        {},
        { responseType: "blob" }, // important for binary PDF
      );

      // Create a Blob URL
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // ✅ 1. Trigger automatic download
      const link = document.createElement("a");
      link.href = url;
      link.download = "PAR-Q.pdf"; // filename for download
      document.body.appendChild(link);
      link.click();
      link.remove();

      // ✅ 2. Open PDF in new tab for viewing
      window.open(url, "_blank");

      // Optional cleanup after some time
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);

      toast.success("PAR-Q file downloaded successfully");
    } catch (error) {
      console.error("Failed to download and open PAR-Q form:", error);
      toast.error('Parq does not exist.')
    } finally {
      setLoading(false);
    }
  };

  const downloadAndOpenTerms = async () => {
    try {
      setLoading(true);

      // Fetch the file as a blob
      const res = await authAxios().post(
        `/member/terms/condition/download/${details?.id}`,
        {},
        { responseType: "blob" }, // important for binary PDF
      );

      // Create a Blob URL
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // ✅ 1. Trigger automatic download
      const link = document.createElement("a");
      link.href = url;
      link.download = "T&C.pdf"; // filename for download
      document.body.appendChild(link);
      link.click();
      link.remove();

      // ✅ 2. Open PDF in new tab for viewing
      window.open(url, "_blank");

      // Optional cleanup after some time
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);

      toast.success("T&C file downloaded successfully");
    } catch (error) {
      console.error("Failed to download T&C form:", error.response);
      toast.error("Term And Condition does not exist.")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-[10px] w-full box--shadow">
      <div className="flex gap-2 justify-between">
      
        {memberKycStatus === "REJECTED" && !isEditMode && (
          <div className="w-full">
            <button
              onClick={handleEditDocuments}
              className="px-4 py-2 text-white bg-black border border-black rounded flex items-center gap-2"
            >
              <span>Edit Documents</span>
              <MdModeEdit />
            </button>
          </div>
        )}

        <div className="flex items-center w-full justify-end mb-5 gap-3">
          <button
            type="button"
            onClick={downloadAndOpenTerms}
            className="px-4 py-2 text-black bg-white border border-black rounded flex items-center gap-2"
          >
            <span>Download T&C</span> <FiDownload />
          </button>
          <button
            type="button"
            onClick={downloadAndOpenParqForm}
            className="px-4 py-2 text-white bg-black border border-black rounded flex items-center gap-2"
          >
            <span>Download PAR-Q</span> <FiDownload />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Document Cards */}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(documentTypes).map(([type, config]) => {
            const document = documents[type];
            const isDragOver = dragOver === type;

            return (
              <div key={type} className="bg-gray-50 rounded-lg p-6 w-full">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  {config.label}{" "}
                  {type === "corporateId" && !corporateId ? "" : "*"}
                </label>

                {/* Upload Box or Preview */}
                {!document ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-2 text-center transition-colors ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDrop={(e) => handleDrop(e, type)}
                    onDragOver={(e) => handleDragOver(e, type)}
                    onDragLeave={handleDragLeave}
                  >
                    <p className="text-gray-600 mb-2 text-sm">
                      Drag and drop your {config.label.toLowerCase()} here, or{" "}
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => openFileDialog(fileInputRefs[type])}
                      >
                        browse files
                      </button>
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports: JPG, PNG, JPEG
                    </p>
                    <input
                      ref={fileInputRefs[type]}
                      type="file"
                      accept={config.accept}
                      className="hidden"
                      onChange={(e) =>
                        handleFileSelect(type, e.target.files[0])
                      }
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start space-x-4">
                      <div className="relative w-[100px] h-[80px]">
                        {/* <img
                          src={document.preview}
                          alt={config.label}
                          className="w-full h-full object-cover rounded border"
                        /> */}
                        {document.preview ? (
                          <img
                            src={document.preview}
                            alt={config.label}
                            className="w-full h-full object-cover rounded border"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center border rounded text-xs text-gray-400">
                            No File Uploaded
                          </div>
                        )}
                        <div
                          className={`absolute -top-1 -right-1 rounded-full w-6 h-6 flex items-center justify-center ${
                            document.status === "APPROVED"
                              ? "bg-green-500"
                              : document.status === "REJECTED"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        >
                          <span className="text-white text-xs">
                            {document.status === "REJECTED" ? (
                              <RxCross2 />
                            ) : document.status === "APPROVED" ?  <FaCheck /> : <IoTimeOutline />}
                          </span>
                        </div>
                      </div>
                      <div className="">
                        <h4 className="font-medium text-gray-900">
                          {document.file
                            ? document.file.name // show newly selected file name
                            : document.name || "Uploaded File"}
                        </h4>
                        {document.size && (
                          <p className="text-sm text-gray-500">
                            {formatFileSize(document.size)}
                          </p>
                        )}
                        {/* {document.status && (
                          <p
                            className={`text-sm font-medium mt-1 ${
                              document.status === "APPROVED"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            Status: {document.status}
                          </p>
                        )} */}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setPreviewing(document)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            <IoEyeOutline />
                          </button>
                          {(userRole === "FOH" ||
                            userRole === "CLUB_MANAGER" ||
                            userRole === "ADMIN") && (
                            // <button
                            //   type="button"
                            //   onClick={() => fileInputRefs[type].current.click()}
                            //   className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            // >
                            //   <FiUpload />
                            // </button>
                            <>
                              {(memberKycStatus === "APPROVED" || memberKycStatus === "NONE" ||
                                (memberKycStatus === "REJECTED" &&
                                  isEditMode)) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    fileInputRefs[type].current.click()
                                  }
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                >
                                  <FiUpload />
                                </button>
                              )}
                            </>
                          )}
                          <input
                            ref={fileInputRefs[type]}
                            type="file"
                            accept={config.accept}
                            className="hidden"
                            onChange={(e) =>
                              handleFileSelect(type, e.target.files[0])
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {errors[type] && (
                  <p className="text-sm text-red-500 mt-2">{errors[type]}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button (Always Visible) */}
        {(userRole === "FOH" ||
          userRole === "CLUB_MANAGER" ||
          userRole === "ADMIN") &&
          memberKycStatus !== "PENDING" && (
            <div className="flex justify-start pt-4">
              {/* <button
                onClick={handleSubmit}
                className="px-4 py-2 text-white bg-black hover:bg-gray-800 rounded flex items-center gap-2"
              >
                Upload / Update Documents
              </button> */}
              {/* APPROVED */}
              {memberKycStatus === "APPROVED" && (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-white bg-black hover:bg-gray-800 rounded flex items-center gap-2"
                >
                  Update Documents
                </button>
              )}
              {/* REJECTED + EDIT MODE */}
              {memberKycStatus === "REJECTED" && isEditMode && (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-white bg-black hover:bg-gray-800 rounded"
                >
                  Upload Documents
                </button>
              )}
              {memberKycStatus === "NONE" && (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-white bg-black hover:bg-gray-800 rounded"
                >
                  Upload Documents
                </button>
              )}
            </div>
          )}
      </div>

      {/* Preview Modal */}
      {previewing && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex gap-5 items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Document Preview
              </h3>
              <button
                onClick={() => setPreviewing(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewing.preview}
                alt="Document preview"
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IsLoadingHOC(KYCSubmission);
