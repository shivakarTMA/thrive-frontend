// Import React and useState hook
import React, { useState } from "react";

// Define KYC form component without props
export default function KycForm() {
  // Local state to hold uploaded documents
  const [kycDocs, setKycDocs] = useState({
    aadhar: null, // Aadhar card document
    pan: null, // PAN card document
    passport: null, // Passport document
  });

  // Handler for file input change
  const handleFileChange = (e, docType) => {
    const file = e.target.files[0]; // Get selected file
    if (!file) return; // If no file chosen, do nothing
    // Create an object URL to preview the file
    const previewUrl = URL.createObjectURL(file);
    setKycDocs((prev) => ({ ...prev, [docType]: { file, previewUrl } })); // Update state
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    console.log("KYC Documents Submitted:", kycDocs); // Log uploaded docs
    alert("KYC Submitted Successfully!"); // Show confirmation
  };

  return (
    <div className="bg-primarylight p-4 rounded">
      <div className="flex gap-6 flex-col text-sm">
        <form className="kyc-form" onSubmit={handleSubmit}>
          <div className="flex-1 space-y-4">
            {/* KYC Documents */}
            <div className="relative">
              <h3 className="font-semibold mb-3">KYC Documents</h3>
              <div className="grid--profile--details text-sm gap-4">
                {/* Aadhar Upload */}
                <div className="flex flex-col text-sm">
                  <label className="font-semibold mb-2 block capitalize">
                    Aadhar Card:
                  </label>
                  <input
                    type="file"
                    id="aadhar"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, "aadhar")}
                  />
                  {kycDocs.aadhar && (
                    <div className="preview h-[80px] w-[80px]">
                      {/* <p className="file-name">
                        Selected: {kycDocs.aadhar.file.name}
                      </p> */}
                      {kycDocs.aadhar.file.type === "application/pdf" ? (
                        <iframe
                          src={kycDocs.aadhar.previewUrl}
                          title="Aadhar Preview"
                          className="doc-preview h-full mt-2"
                        />
                      ) : (
                        <img
                          src={kycDocs.aadhar.previewUrl}
                          alt="Aadhar Preview"
                          className="doc-preview h-full mt-2"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* PAN Upload */}
                <div className="flex flex-col text-sm">
                  <label htmlFor="pan" className="font-semibold mb-2 block capitalize">PAN Card</label>
                  <input
                    type="file"
                    id="pan"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, "pan")}
                  />
                  {kycDocs.pan && (
                    <div className="preview h-[80px] w-[80px]">
                      {/* <p className="file-name">
                        Selected: {kycDocs.pan.file.name}
                      </p> */}
                      {kycDocs.pan.file.type === "application/pdf" ? (
                        <iframe
                          src={kycDocs.pan.previewUrl}
                          title="PAN Preview"
                          className="doc-preview h-full mt-2"
                        />
                      ) : (
                        <img
                          src={kycDocs.pan.previewUrl}
                          alt="PAN Preview"
                          className="doc-preview h-full mt-2"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Passport Upload */}
                <div className="flex flex-col text-sm">
                  <label htmlFor="passport" className="font-semibold mb-2 block capitalize">Upload Passport</label>
                  <input
                    type="file"
                    id="passport"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, "passport")}
                  />
                  {kycDocs.passport && (
                    <div className="preview h-[80px] w-[80px]">
                      {/* <p className="file-name">
                        Selected: {kycDocs.passport.file.name}
                      </p> */}
                      {kycDocs.passport.file.type === "application/pdf" ? (
                        <iframe
                          src={kycDocs.passport.previewUrl}
                          title="Passport Preview"
                          className="doc-preview h-full mt-2"
                        />
                      ) : (
                        <img
                          src={kycDocs.passport.previewUrl}
                          alt="Passport Preview"
                          className="doc-preview h-full mt-2"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 mt-5">
            Submit KYC
          </button>
        </form>
      </div>
    </div>
  );
}
