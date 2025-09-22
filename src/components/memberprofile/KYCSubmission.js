// Importing React and required hooks from React
import React, { useState, useRef } from "react";

const KYCSubmission = () => {
  // State to store uploaded document details
  const [documents, setDocuments] = useState({
    aadharFront: null, // Stores Aadhar Front details
    aadharBack: null, // Stores Aadhar Back details
    corporateId: null, // Stores Corporate ID details
  });

  // State to handle document preview modal
  const [previewing, setPreviewing] = useState(null);

  // State to handle drag-over effect for drop area
  const [dragOver, setDragOver] = useState("");

  // Refs for each file input field
  const fileInputRefs = {
    aadharFront: useRef(null),
    aadharBack: useRef(null),
    corporateId: useRef(null),
  };

  // Document type configuration with labels and accepted file types
  const documentTypes = {
    aadharFront: { label: "Aadhar Card (Front)", accept: "image/*" },
    aadharBack: { label: "Aadhar Card (Back)", accept: "image/*" },
    corporateId: { label: "Corporate ID", accept: "image/*" },
  };

  // Function to handle file selection and preview generation
  const handleFileSelect = (documentType, file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocuments((previous) => ({
          ...previous,
          [documentType]: {
            file: file,
            preview: e.target.result, // Base64 preview
            name: file.name,
            size: file.size,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to handle file drop event
  const handleDrop = (event, documentType) => {
    event.preventDefault();
    setDragOver("");
    const file = event.dataTransfer.files[0];
    handleFileSelect(documentType, file);
  };

  // Function to handle drag-over effect
  const handleDragOver = (event, documentType) => {
    event.preventDefault();
    setDragOver(documentType);
  };

  // Function to reset drag-over effect
  const handleDragLeave = () => {
    setDragOver("");
  };

  // Function to remove a selected document
  const removeDocument = (documentType) => {
    setDocuments((previous) => ({
      ...previous,
      [documentType]: null,
    }));
  };

  // Function to format file size into readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Function to handle document submission
  const handleSubmit = () => {
    console.log("Documents to upload:", documents);
    alert("Documents uploaded successfully! (Check console for details)");
  };

  // Check if all required documents are uploaded before enabling submit button
  const isFormValid =
    documents.aadharFront || documents.aadharBack || documents.corporateId;

  // Function to open file dialog programmatically
  const openFileDialog = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  return (
    <div className="bg-white p-4 rounded-[10px] w-full box--shadow">
      {/* Document Upload Section */}
      <div className="space-y-6">
        <div className="flex gap-3">
          {Object.entries(documentTypes).map(([type, config]) => {
            const document = documents[type];
            const isDragOver = dragOver === type;

            return (
              <div key={type} className="bg-gray-50 rounded-lg p-6">
                {/* Label */}
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  {config.label} *
                </label>

                {/* Drop Zone or Preview */}
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
                    {/* Document Preview */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <img
                            src={document.preview}
                            alt={config.label}
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {document.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(document.size)}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <button
                              type="button"
                              onClick={() => setPreviewing(document)}
                              className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            >
                              <span className="mr-1">👁️</span>
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDocument(type)}
                              className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            >
                              <span className="mr-1">✕</span>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="flex justify-start pt-0">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`px-4 py-2 text-white rounded flex items-center gap-2 ${
              isFormValid
                ? "bg-black"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Upload Documents
          </button>
        </div>
      </div>

      {/* Document Preview Modal */}
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
