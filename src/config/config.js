import axios from "axios";
import { store } from '../Redux/store';

export const apiAxios = () => {
  return axios.create({
    baseURL: process.env.REACT_APP_BASEURL,
    headers: {
      "x-api-key": process.env.REACT_APP_API_KEY,
      "Content-Type": "application/json",
    },
  });
};

console.log("BaseURL:", process.env.REACT_APP_BASEURL);
console.log("API Key:", process.env.REACT_APP_API_KEY);

export const phoneAxios = axios.create({
  baseURL: process.env.REACT_APP_BASEURL,
  headers: {
    "x-api-key": process.env.REACT_APP_API_KEY,
    "Content-Type": "application/json",
  },
});


export const authAxios = () => {
  const token = store.getState().auth.accessToken; // Get the current access token from Redux

  return axios.create({
    baseURL: process.env.REACT_APP_BASEURL, // Base URL from environment variables
    headers: {
      "x-api-key": process.env.REACT_APP_API_KEY, // API key from environment
      "Content-Type": "application/json", // JSON content type
      ...(token && { Authorization: `Bearer ${token}` }), // Only add Authorization if token exists
    },
  });
};