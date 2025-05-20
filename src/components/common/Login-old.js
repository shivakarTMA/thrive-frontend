import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { withoutAuthAxios } from "../../config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "./IsLoadingHOC";
import { useDispatch, useSelector } from "react-redux";
import { setAccessToken, setIsAuthenticated, setuser } from "../../Redux/Reducers/authSlice";
import { FaPhoneAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import Logo from "../../assets/images/DLF-Thrive-New-Logo-1-White.png"

const Login = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth)

  useEffect(() => {
    if (accessToken) {
      navigate("/")
    }
  }, [accessToken])
  const { setLoading } = props;

  const [data, setdata] = useState({
    number: "",
    otp: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = data;

    console.log(payload,'payload')

    // setLoading(true);
    // await withoutAuthAxios()
    //   .post("/users/login", payload)
    //   .then((response) => {
    //     const resData = response.data;

    //     setLoading(false);

    //     if (resData.status == 1) {
    //       if (resData.data.userType == "ADMIN") {
    //         toast.success(resData.message);
    //         dispatch(setAccessToken(resData.data.token));
    //         dispatch(setuser(resData.data));
    //         dispatch(setIsAuthenticated(true));
    //         navigate("/")
    //       } else {
    //         toast.error("You Don't Have Authorization  Access")
    //       }
    //     } else {
    //       toast.error("Invalid Credentails");
    //     }
    //   })
    //   .catch((error) => {

    //     setLoading(false);
    //     toast.error(error.response.data.message);
    //   });
  };


  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm z-[3]">
        <div className="logo--login">
          <img src={Logo} alt="logo" width={150} height={30} className="brightness-[0] invert-[0]" />
        </div>
        <h2 className="text-center tracking-tight heading--login">
          Sign in
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm login--form--admin">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="number"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Phone Number
            </label>
            <div className="mt-2">
              <div className="filter--input--search flex items-center bg-white rounded-[5px] h-[45px] border border-bordergray mr-[5px] auto--fill--none px-[15px]">

                <span className="input--icon border-r border-bordergray pr-[15px]">
                  <FaPhoneAlt />
                </span>

                <input
                  id="number"
                  name="number"
                  type="number"
                  value={data.number}
                  onChange={handleChange}
                  autoComplete="number"
                  required
                  className="number--appearance-none block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm autofill:bg-white placeholder:text-gray-400 focus:shadow-[none] focus-visible:border-none focus-visible:shadow-[none] focus-visible:outline-0 sm:text-sm sm:leading-6"
                  placeholder="Enter your number"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              OTP
            </label>
            <div className="mt-2">
              <div className="filter--input--search flex items-center bg-white rounded-[5px] h-[45px] border border-bordergray mr-[5px] auto--fill--none px-[15px]">

                <span className="input--icon border-r border-bordergray pr-[15px]">
                  <RiLockPasswordFill />
                </span>
                <div className="relative w-full">
                  <input
                    id="otp"
                    name="otp"
                    value={data.otp}
                    onChange={handleChange}
                    type="text"
                    autoComplete="current-otp"
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm autofill:bg-white placeholder:text-gray-400 focus:shadow-[none] focus-visible:border-none focus-visible:shadow-[none] focus-visible:outline-0 sm:text-sm sm:leading-6 "
                    placeholder="Enter your OTP"
                  />
                  
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex items-center border border-buttonbg w-full justify-center bg-buttonbg text-white py-[8px] px-[15px] h-[39px] rounded-[5px] duration-[0.3s] hover:bg-transparent hover:text-textcolor h-[45px] font-[600]"
            >
              Login
            </button>
          </div>
        </form>
        

        
        {/* <div className="flex items-center justify-between mt-5 relative z-[999]">
          <p className="text-sm text-black">
            Not a member?{" "}
            <Link
              to="/signup"
              className="font-semibold leading-6 text-black hover:text-indigo-500"
            >
              Signup
            </Link>
          </p>
          <div className="text-sm">
            <a
              href="#"
              className="font-semibold text-black hover:text-indigo-500"
            >
              Forgot password?
            </a>
          </div>
        </div> */}
       

      </div>
    </div>
  );
};

export default IsLoadingHOC(Login);
