import React, { useState } from "react";
import IsLoadingHOC from "./IsLoadingHOC";
import Logo from "../../assets/images/DLF-Thrive-New-Logo-1-White.png";
import { IoIosMail } from "react-icons/io";

const ForgotPassword = (props) => {
  // const { setLoading } = props;

  const [data, setData] = useState({ email: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(data, "Submitted data");
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
        {/* <h2 className="text-center tracking-tight heading--login">Forgot Password</h2> */}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm login--form--admin">
        <form onSubmit={handleSubmit} className="space-y-3 !pt-[20px]">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              Email Id
            </label>
            <div className="mt-2">
              <div className="filter--input--search flex items-center bg-white rounded-[5px] h-[45px] border border-bordergray px-[15px]">
                <span className="input--icon border-r border-bordergray pr-[15px]">
                  <IoIosMail className="text-xl" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={data.email}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 focus:outline-none sm:text-sm number--appearance-none"
                  placeholder="Enter your email id"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center bg-buttonbg text-white py-2 px-4 h-[45px] rounded-[5px] hover:bg-transparent hover:text-textcolor border border-buttonbg font-semibold"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IsLoadingHOC(ForgotPassword);
