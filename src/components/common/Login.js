import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import IsLoadingHOC from "./IsLoadingHOC";
import { useDispatch, useSelector } from "react-redux";
import {
  setAccessToken,
  setIsAuthenticated,
  setTokenExpiry,
  setuser,
} from "../../Redux/Reducers/authSlice";
import { RiLockPasswordFill } from "react-icons/ri";
import Logo from "../../assets/images/DLF-Thrive-New-Logo-1-White.png";
import { authAxios } from "../../config/config";
import { jwtDecode } from "jwt-decode";

// ✅ Phone input
import PhoneInput, {
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";

const Login = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const { setLoading } = props;

  const [data, setData] = useState({
    identifier: "", // now stores full phone number (+91...)
    otp: "",
  });

  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [timer, setTimer] = useState(0);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");
  const [pendingLogin, setPendingLogin] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (accessToken) {
      navigate("/");
    }
  }, [accessToken]);

  // ✅ Common numeric input handler
  const handleNumericInput = (e, maxLength) => {
    const { name, value } = e.target;

    // Remove everything except digits
    const numericValue = value.replace(/\D/g, "");

    // Limit length
    if (numericValue.length <= maxLength) {
      setData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    }
  };

  const blockInvalidKeys = (e) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  const validatePhone = (value) => {
    if (!value) return "Phone number is required";

    try {
      const phone = parsePhoneNumber(value);

      if (!phone || !phone.isValid()) {
        return "Invalid phone number";
      }

      const nationalNumber = phone.nationalNumber;

      // 🇮🇳 Apply only for India
      if (phone.country === "IN") {
        if (!/^[6-9]\d{9}$/.test(nationalNumber)) {
          // return "Phone number must start with 6-9";
          return "Invalid phone number";
        }

        if (/^(\d)\1+$/.test(nationalNumber)) {
          // return "Invalid repeated digits";
          return "Invalid phone number";
        }

        if (
          nationalNumber === "1234567890" ||
          nationalNumber === "0123456789"
        ) {
          // return "Invalid sequence number";
          return "Invalid phone number";
        }
      }

      return null;
    } catch (err) {
      return "Invalid phone number";
    }
  };

  const submitLoginAPI = async (nationalNumber) => {
    try {
      setLoading(true);
      const response = await authAxios().post("staff/login", {
        mobile: nationalNumber,
      });

      if (response.data.status) {
        setCurrentUser({
          mobile: nationalNumber,
          fullPhone: data.identifier,
        });
        toast.success(response.data.message || "OTP sent successfully");
        setStep(2);
        setTimer(30);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      // ✅ Validate phone number
      const error = validatePhone(data.identifier);

      if (error) {
        setErrors({ identifier: error });
        setTouched({ identifier: true });
        toast.error(error);
        return;
      }

      try {
        setLoading(true);

        // 👉 Extract national number if backend needs it
        const phone = parsePhoneNumber(data.identifier);
        const nationalNumber = phone?.nationalNumber;

        // --- 1️⃣ Call session API first ---
        const sessionResponse = await authAxios().post("/staff/session", {
          mobile: nationalNumber,
        });

        if (sessionResponse.data.status === false) {
          // Show confirmation modal
          setSessionMessage(sessionResponse.data.message);
          setShowSessionModal(true);
          setPendingLogin(true); // store that login is pending after confirmation
          return; // stop execution here
        }

        // If session API passes or no modal needed, proceed to login API
        await submitLoginAPI(nationalNumber);
      } catch (error) {
        toast.error(error.response?.data?.message || "Invalid phone number");
      } finally {
        setLoading(false);
      }
    }

    // ✅ OTP Verification
    else if (step === 2) {
      try {
        setLoading(true);

        const response = await authAxios().post("staff/verify-otp", {
          mobile: currentUser.mobile,
          otp: data.otp,
        });

        if (response.data.status) {
          const result = response.data.data;
          const token = result.token;
          const decoded = jwtDecode(token);

          dispatch(setAccessToken(token));
          dispatch(setuser(result));
          dispatch(setIsAuthenticated(true));
          dispatch(setTokenExpiry(decoded.exp * 1000));

          toast.success(response.data.message || "Login successful");
          navigate("/");
        } else {
          toast.error(response.data.message || "Invalid OTP");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Invalid OTP");
      } finally {
        setLoading(false);
      }
    }
  };

  // ✅ Resend OTP
  const handleResendOtp = async () => {
    try {
      setLoading(true);

      const response = await authAxios().post("staff/login", {
        mobile: currentUser.mobile,
      });

      if (response.data.status) {
        toast.success("OTP resent successfully");
        setTimer(30);
      } else {
        toast.error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Timer logic
  useEffect(() => {
    let interval = null;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (touched.identifier) {
      const error = validatePhone(data.identifier);

      setErrors((prev) => ({
        ...prev,
        identifier: error,
      }));
    }
  }, [data.identifier]);

  return (
    <>
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm z-[3]">
          <div className="logo--login">
            <img
              src={Logo}
              alt="logo"
              width={150}
              height={30}
              className="brightness-[0] invert-[0]"
            />
          </div>
          <h2 className="text-center tracking-tight heading--login">Sign in</h2>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-sm login--form--admin">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* ✅ STEP 1 - PHONE INPUT */}
            {step === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Phone Number
                </label>

                <div className="mt-2 bg-white rounded-[5px] h-[45px] border border-bordergray px-[10px] flex items-center">
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="IN"
                    value={data.identifier}
                    onChange={(value) =>
                      setData((prev) => ({
                        ...prev,
                        identifier: value,
                      }))
                    }
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, identifier: true }));

                      const error = validatePhone(data.identifier);

                      setErrors((prev) => ({
                        ...prev,
                        identifier: error,
                      }));
                    }}
                    className="w-full custom--phone"
                  />
                </div>

                {/* ✅ Inline validation */}
                {touched.identifier && errors.identifier && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.identifier}
                  </p>
                )}
              </div>
            )}

            {/* ✅ STEP 2 - OTP */}
            {step === 2 && (
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-900"
                >
                  OTP
                </label>
                <div className="mt-2">
                  <div className="filter--input--search flex items-center bg-white rounded-[5px] h-[45px] border border-bordergray px-[15px]">
                    <span className="border-r border-bordergray pr-[15px]">
                      <RiLockPasswordFill />
                    </span>

                    <input
                      id="otp"
                      name="otp"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={data.otp}
                      onChange={(e) => handleNumericInput(e, 6)}
                      onKeyDown={blockInvalidKeys}
                      required
                      className="number--appearance-none block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 focus:outline-none sm:text-sm"
                      placeholder="Enter 6 digit OTP"
                      autocomplete="off"
                    />
                  </div>
                </div>

                {/* Timer / Resend */}
                <div className="mt-2">
                  {timer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Didn’t receive the code? Resend OTP in{" "}
                      <span className="font-semibold">{timer}s</span>
                    </p>
                  ) : (
                    <p className="text-sm">
                      <span className="text-gray-400">
                        Didn’t receive the code?
                      </span>{" "}
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-sm font-medium hover:underline"
                      >
                        Resend OTP
                      </button>
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center bg-buttonbg text-white py-2 px-4 h-[45px] rounded-[5px] border border-buttonbg font-semibold"
            >
              {step === 1 ? "Next" : "Login"}
            </button>
          </form>

          {/* Change number */}
          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setData({ identifier: "", otp: "" });
                setCurrentUser(null);
              }}
              className="w-full text-sm text-gray-600 font-medium mt-3 relative z-[1]"
            >
              ← Change phone number
            </button>
          )}
        </div>
      </div>

      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 py-6 rounded shadow-lg text-center max-w-md w-full">
            <p className="mb-2 text-lg font-semibold">
              This account is currently logged in.
            </p>
            <p className="mb-4 text-[12px] font-[500]">
              Do you wish to sign out the current user and login?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  setShowSessionModal(false);
                  if (pendingLogin) {
                    const phone = parsePhoneNumber(data.identifier);
                    const nationalNumber = phone?.nationalNumber;
                    await submitLoginAPI(nationalNumber);
                    setPendingLogin(false);
                  }
                }}
                className="bg-black text-white px-4 py-2 rounded max-w-[100px] w-full"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowSessionModal(false);
                  setPendingLogin(false);
                }}
                className="bg-gray-300 text-black px-4 py-2 rounded max-w-[100px] w-full"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IsLoadingHOC(Login);
