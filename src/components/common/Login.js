// Import necessary React and utility libraries
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
import { FaPhoneAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import Logo from "../../assets/images/DLF-Thrive-New-Logo-1-White.png";
import { authAxios } from "../../config/config";
import {jwtDecode} from "jwt-decode";

// Login component
const Login = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const { setLoading } = props;

  const [data, setData] = useState({ identifier: "", otp: "" });
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  // Redirect to home if already logged in
  useEffect(() => {
    if (accessToken) {
      navigate("/");
    }
  }, [accessToken]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit for login and OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      try {
        setLoading(true);
        // Send request to /staff/login with mobile
        const response = await authAxios().post("staff/login", {
          mobile: data.identifier,
        });

        if (response.data.status) {
          setCurrentUser({ mobile: data.identifier });
          toast.success(response.data.message || "OTP sent successfully");
          setStep(2);
        } else {
          toast.error(response.data.message || "Failed to send OTP");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Invalid phone number or email",
        );
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      try {
        setLoading(true);
        // Send request to /staff/verify-otp with mobile and OTP
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
          // ✅ Store expiry in milliseconds
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

  return (
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
          {step === 1 && (
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-900"
              >
                Phone Number
              </label>
              <div className="mt-2">
                <div className="filter--input--search flex items-center bg-white rounded-[5px] h-[45px] border border-bordergray px-[15px]">
                  <span className="border-r border-bordergray pr-[15px]">
                    <FaPhoneAlt />
                  </span>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    value={data.identifier}
                    onChange={handleChange}
                    required
                    minLength={10} // Minimum 10 characters
                    maxLength={10} // Maximum 10 characters
                    pattern="\d{10}" // Only allow digits
                    title="Phone number must be exactly 10 digits"
                    className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 focus:outline-none sm:text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>
          )}

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
                    type="text"
                    value={data.otp}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 focus:outline-none sm:text-sm"
                    placeholder="Enter your OTP"
                    minLength={6}
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center bg-buttonbg text-white py-2 px-4 h-[45px] rounded-[5px] hover:bg-transparent hover:text-textcolor border border-buttonbg font-semibold"
            >
              {step === 1 ? "Next" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IsLoadingHOC(Login);
