import React, { useState } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { IoCameraOutline, IoClose } from "react-icons/io5";
import { LuUpload } from "react-icons/lu";
import { FaCircleCheck, FaRegBuilding } from "react-icons/fa6";

const KYCSubmission = () => {
  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);
  const [corporateId, setCorporateId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitStatus, setSubmitStatus] = useState(null);

  const [activeStep, setActiveStep] = useState(1);

  const handleFileUpload = (file, type) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === "front") {
          setAadharFront({ file, preview: e.target.result });
        } else {
          setAadharBack({ file, preview: e.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type) => {
    if (type === "front") {
      setAadharFront(null);
    } else {
      setAadharBack(null);
    }
  };

  const handleAadharSubmit = async () => {
    if (!aadharFront || !aadharBack) {
      alert("Please upload both front and back of Aadhar card");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("aadhar_success");
      setActiveStep(2);
    }, 2000);
  };

  const handleCorporateSubmit = async () => {
    if (!corporateId.trim()) {
      alert("Please enter Corporate ID");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("corporate_success");
      setActiveStep(3);
    }, 1500);
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full">
        <div className="flex w-full gap-5 justify-between items-center">
          {/* Main Content */}
          <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Step 1: Aadhar Card Upload */}
            {activeStep === 1 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <IoCameraOutline className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Upload Aadhar Card
                  </h2>
                  <p className="text-gray-600">
                    Please upload clear images of both sides of your Aadhar card
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Front Side */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Aadhar Card - Front Side
                    </label>
                    <div className="relative">
                      {aadharFront ? (
                        <div className="relative group">
                          <img
                            src={aadharFront.preview}
                            alt="Aadhar Front"
                            className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                          />
                          <button
                            onClick={() => removeFile("front")}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-[999]"
                          >
                            <IoClose className="w-4 h-4" />
                          </button>
                          <div className="absolute inset-0 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                            <FaCircleCheck className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <LuUpload className="w-8 h-8 mb-4 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">
                                Click to upload
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG up to 10MB
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e.target.files[0], "front")
                            }
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Back Side */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Aadhar Card - Back Side
                    </label>
                    <div className="relative">
                      {aadharBack ? (
                        <div className="relative group">
                          <img
                            src={aadharBack.preview}
                            alt="Aadhar Back"
                            className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                          />
                          <button
                            onClick={() => removeFile("back")}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-[999]"
                          >
                            <IoClose className="w-4 h-4" />
                          </button>
                          <div className="absolute inset-0 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                            <FaCircleCheck className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <LuUpload className="w-8 h-8 mb-4 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">
                                Click to upload
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG up to 10MB
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e.target.files[0], "back")
                            }
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conditional message after file upload */}
                {(aadharFront || aadharBack) && (
                  <p className="text-green-600 text-center mb-4 font-medium">
                    ✅ You have successfully uploaded your document(s).
                  </p>
                )}

                <button
                  onClick={handleAadharSubmit}
                  disabled={!aadharFront || !aadharBack || isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform "
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Uploading Aadhar...
                    </div>
                  ) : (
                    "Submit Aadhar Card"
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Corporate ID */}
            {activeStep === 2 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                    <FaRegBuilding className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Corporate ID Verification
                  </h2>
                  <p className="text-gray-600">
                    Enter your corporate identification number
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Corporate ID Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={corporateId}
                      onChange={(e) => setCorporateId(e.target.value)}
                      placeholder="Enter your Corporate ID"
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
                    />
                    <FaRegBuilding className="absolute right-3 top-4 w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    This should be your official corporate identification number
                  </p>

                  <button
                    onClick={handleCorporateSubmit}
                    disabled={!corporateId.trim() || isSubmitting}
                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform "
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Verifying ID...
                      </div>
                    ) : (
                      "Submit Corporate ID"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {activeStep === 3 && (
              <div className="p-8 text-center">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                    <FaCircleCheck className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Verification Complete!
                  </h2>
                  <p className="text-gray-600 text-lg mb-8">
                    Your KYC documents have been successfully submitted and are
                    under review.
                  </p>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                    <div className="flex items-start space-x-4">
                      <AiOutlineExclamationCircle className="w-6 h-6 text-green-600 mt-0.5" />
                      <div className="text-left">
                        <h3 className="font-semibold text-green-800 mb-2">
                          What's Next?
                        </h3>
                        <ul className="text-green-700 space-y-1 text-sm">
                          <li>
                            • Your documents are being reviewed by our team
                          </li>
                          <li>
                            • You'll receive an email confirmation within 24
                            hours
                          </li>
                          <li>
                            • Verification typically completes within 2-3
                            business days
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCSubmission; // Export component
