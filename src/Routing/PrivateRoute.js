import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import PrivateLayout from "../Layout/PrivateLayout";
import { authAxios } from "../config/config";
import { persistor } from "../Redux/store";
import { logout } from "../Redux/Reducers/authSlice";

export default function PrivateRoute({ children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { accessToken, user, tokenExpiry } = useSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    persistor.purge();
  };

  /* =========================
     1️⃣ JWT EXPIRY HANDLER
  ========================== */
  useEffect(() => {
    if (!tokenExpiry) return;

    const remainingTime = tokenExpiry - Date.now();

    if (remainingTime <= 0) {
      handleLogout();
      return;
    }

    const timer = setTimeout(() => {
      handleLogout();
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [tokenExpiry]);

  /* =========================
     2️⃣ STAFF VALIDATION
  ========================== */
  useEffect(() => {
    if (!accessToken || !user?.id) return;

    const validateUser = async () => {
      try {
        const res = await authAxios().get(`/staff/${user.id}`);
        const staff = res?.data?.data;

        // Not staff → allow access (admin, etc.)
        if (!staff) return;

        // Soft deleted
        if (staff.is_deleted === 1) {
          handleLogout();
          return;
        }

        // Inactive staff
        if (staff.status !== "ACTIVE") {
          handleLogout();
          return;
        }
      } catch (error) {
        if ([401, 404].includes(error.response?.status)) {
          handleLogout();
        }
        console.error("Staff validation failed:", error);
      }
    };

    validateUser();
  }, [accessToken, user?.id, location.pathname]);

  /* =========================
     3️⃣ ROUTE PROTECTION
  ========================== */
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Extra safety: expired before render
  if (tokenExpiry && Date.now() > tokenExpiry) {
    handleLogout();
    return <Navigate to="/login" replace />;
  }

  return <PrivateLayout>{children}</PrivateLayout>;
}
