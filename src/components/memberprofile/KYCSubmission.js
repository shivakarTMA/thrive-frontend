import React, { useState, useRef, useEffect } from "react";
import { authAxios } from "../../config/config";
import { IoEyeOutline } from "react-icons/io5";
import { RxUpdate } from "react-icons/rx";
import { toast } from "react-toastify";

const KYCSubmission = ({ details }) => {
  const memberId = details?.id;
  const [errors, setErrors] = useState({});

  const [documents, setDocuments] = useState({
    aadharFront: null,
    aadharBack: null,
    corporateId: null,
  });
  const [previewing, setPreviewing] = useState(null);
  const [dragOver, setDragOver] = useState("");

  const fileInputRefs = {
    aadharFront: useRef(null),
    aadharBack: useRef(null),
    corporateId: useRef(null),
  };

  const documentTypes = {
    aadharFront: { label: "Aadhar Card (Front)", accept: "image/*" },
    aadharBack: { label: "Aadhar Card (Back)", accept: "image/*" },
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

  // Fetch existing KYC data
  useEffect(() => {
    const fetchKycDocuments = async () => {
      try {
        const response = await authAxios().get(`/kyc/document/list/${memberId}`);
        if (response.data.status && response.data.data) {
          const data = response.data.data;
          const aadhar = data.find((d) => d.document_type === "ID_PROOF");
          const corp = data.find((d) => d.document_type === "PHOTO");

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
            corporateId: corp
              ? {
                  preview: corp.document_front_file,
                  name: "Corporate ID (Uploaded)",
                  id: corp.id,
                  uploaded: true,
                  status: corp.status,
                  type: "PHOTO",
                }
              : null,
          });
        }
      } catch (error) {
        console.error("Error fetching KYC documents:", error);
      }
    };

    fetchKycDocuments();
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

  // Handle submit for all documents
  const handleSubmit = async () => {
    let hasError = false;
    const newErrors = {};

    // Validate Aadhar Front
    if (
      !documents.aadharFront?.file &&
      !documents.aadharFront?.document_front_file
    ) {
      newErrors.aadharFront = "Please upload your Aadhar Front image.";
      hasError = true;
    }

    // Validate Aadhar Back
    if (
      !documents.aadharBack?.file &&
      !documents.aadharBack?.document_back_file
    ) {
      newErrors.aadharBack = "Please upload your Aadhar Back image.";
      hasError = true;
    }

    // Validate Corporate ID
    if (
      !documents.corporateId?.file &&
      !documents.corporateId?.document_front_file
    ) {
      newErrors.corporateId = "Please upload your Corporate ID image.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Clear previous errors before upload
    setErrors({});

    try {
      // --- Aadhar (ID_PROOF) ---
      if (documents.aadharFront || documents.aadharBack) {
        const formData = new FormData();
        formData.append("member_id", memberId);
        formData.append("document_type", "ID_PROOF");
        if (documents.aadharFront?.file)
          formData.append("document_front_file", documents.aadharFront.file);
        if (documents.aadharBack?.file)
          formData.append("document_back_file", documents.aadharBack.file);

        const id = documents.aadharFront?.id || documents.aadharBack?.id;
        if (id) {
          await authAxios().put(`/kyc/document/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await authAxios().post(`/kyc/document/create`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }

      // --- Corporate ID (PHOTO) ---
      if (documents.corporateId) {
        const formData = new FormData();
        formData.append("member_id", memberId);
        formData.append("document_type", "PHOTO");
        if (documents.corporateId?.file)
          formData.append("document_front_file", documents.corporateId.file);

        if (documents.corporateId?.id) {
          await authAxios().put(
            `/kyc/document/${documents.corporateId.id}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
        } else {
          await authAxios().post(`/kyc/document/create`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }

      toast.success("Documents submitted successfully!");
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Upload failed. Check console for details.");
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

  return (
    <div className="bg-white p-4 rounded-[10px] w-full box--shadow">
      <div className="space-y-6">
        {/* Document Cards */}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(documentTypes).map(([type, config]) => {
            const document = documents[type];
            const isDragOver = dragOver === type;

            return (
              <div key={type} className="bg-gray-50 rounded-lg p-6 w-full">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  {config.label} *
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
                        <img
                          src={document.preview}
                          alt={config.label}
                          className="w-full h-full object-cover rounded border"
                        />
                        <div
                          className={`absolute -top-1 -right-1 rounded-full w-6 h-6 flex items-center justify-center ${
                            document.status === "APPROVED"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          <span className="text-white text-xs">✓</span>
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
                          <button
                            type="button"
                            onClick={() => fileInputRefs[type].current.click()}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            <RxUpdate />
                          </button>
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
        <div className="flex justify-start pt-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-black hover:bg-gray-800 rounded flex items-center gap-2"
          >
            Upload / Update Documents
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewing && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
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

export default KYCSubmission;
