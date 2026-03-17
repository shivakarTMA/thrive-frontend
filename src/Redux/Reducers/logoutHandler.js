import { persistor } from "../store";
import { logout } from "./authSlice";

export const performLogout = (dispatch) => {
  dispatch(logout());
  persistor.purge();
  window.location.href = "/login";
};