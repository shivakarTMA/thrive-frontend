import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import PrivateLayout from "../Layout/PrivateLayout";
import { authAxios } from "../config/config";
import { persistor } from "../Redux/store";
import { logoutUser } from "../Redux/thunks/authThunk";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import { selectAuthFromToken } from "../Redux/Reducers/authSlice";
import { hasRouteAccess } from "./RolePermissions";

export default function PrivateRoute({ children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { accessToken, tokenExpiry } = useSelector((state) => state.auth);
  const authFromToken = useSelector(selectAuthFromToken);

  const [showPopup, setShowPopup] = useState(false);
  const isLoggingOut = useRef(false);

  // ✅ CENTRAL LOGOUT HANDLER (API ALWAYS CALLED)
  const logoutAndRedirect = async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    try {
      // ✅ ALWAYS call API manually
      await authAxios().get("/staff/expires/token");
    } catch (e) {
      // ignore error
    }

    try {
      await dispatch(logoutUser()).unwrap(); // optional (keeps consistency)
    } catch {}

    persistor.purge();
    navigate("/login", { replace: true });
  };

  const handleLogout = () => {
    toast.dismiss();
    logoutAndRedirect();
  };

  /* =========================
     1️⃣ JWT EXPIRY HANDLER
  ========================== */
  useEffect(() => {
    if (!tokenExpiry) return;

    const remainingTime = tokenExpiry - Date.now();

    if (remainingTime <= 0) {
      toast.dismiss();
      logoutAndRedirect();
      return;
    }

    const timer = setTimeout(() => {
      toast.dismiss();
      logoutAndRedirect();
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [tokenExpiry]);

  /* =========================
     2️⃣ STAFF VALIDATION
  ========================== */
  useEffect(() => {
    if (!accessToken || !authFromToken?.id) return;

    const validateUser = async () => {
      try {
        const res = await authAxios().get(`/staff/${authFromToken.id}`);
        const staff = res?.data?.data;

        if (!staff) return;

        if (staff.is_deleted === 1 || staff.status !== "ACTIVE") {
          toast.dismiss();
          logoutAndRedirect();
        }
      } catch (error) {
        if ([401, 404].includes(error.response?.status)) {
          toast.dismiss();
          logoutAndRedirect();
        }
      }
    };

    validateUser();
  }, [accessToken, authFromToken?.id, location.pathname]);

  /* =========================
     3️⃣ SESSION VALIDATION
  ========================== */
  useEffect(() => {
    if (!accessToken) return;

    let isCancelled = false;

    const checkSession = async () => {
      try {
        await authAxios().get("/staff/check/active");
      } catch (error) {
        if (!isCancelled && error?.response?.status === 401) {
          setShowPopup(true);
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 10000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [accessToken]);

  /* =========================
     4️⃣ STORAGE TAMPER DETECTION
  ========================== */
useEffect(() => {
  const handleStorageChange = () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      logoutAndRedirect();
      return;
    }

    try {
      const parsed = JSON.parse(atob(token.split(".")[1]));

      // ❌ invalid structure
      if (!parsed?.id || !parsed?.role) {
        logoutAndRedirect();
      }
    } catch (e) {
      // ❌ corrupted token
      logoutAndRedirect();
    }
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);

  /* =========================
     5️⃣ TAB FOCUS VALIDATION
  ========================== */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!authFromToken) {
          logoutAndRedirect();
          return;
        }

        if (!hasRouteAccess(authFromToken.role, location.pathname)) {
          logoutAndRedirect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [authFromToken, location.pathname]);

  /* =========================
     6️⃣ INITIAL GUARD (FIXED)
  ========================== */
  useEffect(() => {
    if (!accessToken) {
      logoutAndRedirect();
      return;
    }

    if (tokenExpiry && Date.now() > tokenExpiry) {
      logoutAndRedirect();
      return;
    }

    if (!authFromToken) {
      logoutAndRedirect();
      return;
    }

    if (!hasRouteAccess(authFromToken.role, location.pathname)) {
      logoutAndRedirect();
    }
  }, [accessToken, tokenExpiry, authFromToken, location.pathname]);

  return (
    <>
      <PrivateLayout>{children}</PrivateLayout>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 py-6 rounded shadow-lg text-center max-w-[300px] w-full relative">
            <button
              onClick={handleLogout}
              className="absolute top-[-5px] right-[-5px] bg-white rounded-full"
            >
              <IoCloseCircle className="text-2xl" />
            </button>

            <p className="mb-2 text-lg font-semibold">Session Ended</p>

            <p className="mb-4 text-[12px] font-[500]">
              You have been logged out since you have logged in from another
              computer.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-black text-white px-4 py-2 rounded max-w-[100px] w-full"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}