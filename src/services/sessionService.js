import { authAxios } from "../config/config";

export const checkSession = async (mobile) => {
  const res = await authAxios().post("/staff/session", { mobile });
  return res.data;
};