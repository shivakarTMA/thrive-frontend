import { jwtDecode } from "jwt-decode";

export const getAuthFromToken = (accessToken) => {
  if (!accessToken) return null;

  try {
    const decoded = jwtDecode(accessToken);

    // Token expired?
    if (decoded.exp * 1000 < Date.now()) return null;

    return {
      id: decoded.id,
      role: decoded.role,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
};