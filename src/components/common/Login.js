import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import IsLoadingHOC from "./IsLoadingHOC";
import { useDispatch, useSelector } from "react-redux";
import {
  setAccessToken,
  setIsAuthenticated,
  setuser,
} from "../../Redux/Reducers/authSlice";
import { FaPhoneAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import Logo from "../../assets/images/DLF-Thrive-New-Logo-1-White.png";

// Dummy user data
const dummyUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@gmail.com",
    number: "1234567890",
    password: "admin123",
    userType: "ADMIN",
    otp: "1234",
    token: "admin-token",
  },
  {
    id: 2,
    name: "FOH User",
    email: "foh@gmail.com",
    number: "1111111111",
    password: "foh123",
    userType: "FOH",
    otp: "1111",
    token: "foh-token",
  },
  {
    id: 3,
    name: "PT User",
    email: "pt@gmail.com",
    number: "2222222222",
    password: "pt123",
    userType: "PT",
    otp: "2222",
    token: "pt-token",
  },
  {
    id: 4,
    name: "GT User",
    email: "gt@gmail.com",
    number: "3333333333",
    password: "gt123",
    userType: "GT",
    otp: "3333",
    token: "gt-token",
  },
  {
    id: 5,
    name: "Nutritionist",
    email: "nutritionist@gmail.com",
    number: "4444444444",
    password: "nutri123",
    userType: "NUTRITION",
    otp: "4444",
    token: "nutrition-token",
  },
];

const Login = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const { setLoading } = props;

  const [data, setData] = useState({ number: "", password: "", otp: "" });
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (accessToken) {
      navigate("/");
    }
  }, [accessToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (step === 1) {
      const foundUser = dummyUsers.find(
        (user) => user.number === data.number && user.password === data.password
      );
      if (foundUser) {
        setCurrentUser(foundUser);
        toast.success(`OTP sent to ${foundUser.name}`);
        setStep(2);
      } else {
        toast.error("Invalid number or password");
      }
    } else if (step === 2) {
      if (data.otp === currentUser.otp) {
        dispatch(setAccessToken(currentUser.token));
        dispatch(setuser(currentUser));
        dispatch(setIsAuthenticated(true));
        toast.success(`Welcome ${currentUser.userType}`);
        navigate("/");
      } else {
        toast.error("Invalid OTP");
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
            <>
              {/* Phone Number */}
              <div>
                <label
                  htmlFor="number"
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
                      id="number"
                      name="number"
                      type="tel"
                      value={data.number}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 focus:outline-none sm:text-sm number--appearance-none"
                      placeholder="Enter your number"
                      pattern="[0-9]{10}"
                      minLength={10}
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2">
                  <div className="filter--input--search flex items-center bg-white rounded-[5px] h-[45px] border border-bordergray px-[15px]">
                    <span className="border-r border-bordergray pr-[15px]">
                      <RiLockPasswordFill />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={data.password}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 focus:outline-none sm:text-sm"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Link to="/forgot-password" className="text-sm underline">
                  Forgot Password
                </Link>
              </div>
            </>
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
                    minLength={4}
                    maxLength={4}
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
