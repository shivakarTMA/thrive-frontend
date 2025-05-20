import React, { useState } from "react";
import IsLoadingHOC from "./IsLoadingHOC";
import Logo from "../../assets/images/DLF-Thrive-New-Logo-1-White.png";
import { RiLockPasswordFill } from "react-icons/ri";
import { toast } from "react-toastify";

const ResetPassword = (props) => {
  // const { setLoading } = props;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // You can send the password and token to the backend here
    console.log("New Password:", password);
    console.log("Confirm Password:", confirmPassword);
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
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm login--form--admin">
        <form onSubmit={handleSubmit} className="space-y-3 !pt-[20px]">
          {/* New Password Field */}
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-900"
            >
              New Password
            </label>
            <div className="mt-2">
              <div className="filter--input--search flex items-center bg-white rounded-[5px] h-[45px] border border-bordergray px-[15px]">
                <span className="input--icon border-r border-bordergray pr-[15px]">
                  <RiLockPasswordFill className="text-xl" />
                </span>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  placeholder="New password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 focus:outline-none sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-900"
            >
              Confirm Password
            </label>
            <div className="mt-2">
              <div className="filter--input--search flex items-center bg-white rounded-[5px] h-[45px] border border-bordergray px-[15px]">
                <span className="input--icon border-r border-bordergray pr-[15px]">
                  <RiLockPasswordFill className="text-xl" />
                </span>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 focus:outline-none sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center bg-buttonbg text-white py-2 px-4 h-[45px] rounded-[5px] hover:bg-transparent hover:text-textcolor border border-buttonbg font-semibold"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IsLoadingHOC(ResetPassword);
