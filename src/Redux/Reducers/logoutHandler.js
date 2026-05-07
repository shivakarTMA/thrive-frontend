import { persistor } from "../store";
import { logoutUser } from "../thunks/authThunk";

export const performLogout = (dispatch) => {
  dispatch(logoutUser());
  persistor.purge();
  window.location.href = "/login";
};