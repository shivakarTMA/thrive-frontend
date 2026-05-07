// redux/thunks/sessionThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { checkSession } from "../../services/sessionService";
import { logout } from "../Reducers/authSlice";


export const validateSession = createAsyncThunk(
  "auth/validateSession",
  async (mobile, { dispatch }) => {
    try {
      const response = await checkSession(mobile);

      // Example response assumption
      // { isActive: true/false }

      if (!response?.isActive) {
        dispatch(logout());
      }

      return response;

    } catch (error) {
      console.error("Session check failed", error);
    }
  }
);