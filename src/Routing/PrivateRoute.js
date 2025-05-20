import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import PrivateLayout from "../Layout/PrivateLayout";

export default function PrivateRoute({ children }) {
  // const accessToken = useSelector((state) => state.auth.accessToken);
  const {accessToken}=useSelector((state)=>state.auth)

  // const accessToken = "true"

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <PrivateLayout children={children} />;
}
