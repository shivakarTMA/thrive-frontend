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
  const { accessToken, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!accessToken || !user?.id) return;

    const handleLogout = () => {
      dispatch(logout());
      persistor.purge();
    };

    const validateUser = async () => {
      try {
        const res = await authAxios().get(`/staff/${user.id}`);

        const staff = res?.data?.data;

        console.log("staff", staff);

        // ✅ User is not staff (ADMIN or API returned nothing)
        if (!staff) {
          console.warn("User is not a staff member — skipping staff validation");
          return;
        }

        // ❌ Soft delete check
        if (staff.is_deleted === 1) {
          console.log("Staff soft-deleted → logout");
          handleLogout();
          return;
        }

        // ❌ Status check
        if (staff.status !== "ACTIVE") {
          console.log("Staff inactive → logout");
          handleLogout();
          return;
        }

      } catch (error) {
        // ❗ Optional: logout only if staff API returns 404/401
        if (error.response?.status === 404) {
          console.warn("Staff not found → logout");
          handleLogout();
        }
        console.error("Staff validation failed:", error);
      }
    };

    validateUser();
  }, [accessToken, user?.id, location.pathname, dispatch]);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <PrivateLayout>{children}</PrivateLayout>;
}
