// redux/thunks/authThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { logout } from "../Reducers/authSlice";
import { authAxios } from "../../config/config";


export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      // Call your API
      await authAxios().get("/staff/expires/token");

      // Then clear redux state
      dispatch(logout());

    } catch (error) {
      // Even if API fails → still logout (important)
      dispatch(logout());
    }
  }
);