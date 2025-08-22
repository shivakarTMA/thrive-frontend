import axios from "axios";
import { store } from '../Redux/store';


export const withoutAuthAxios = () => {
  return axios.create({
    baseURL: `http://thrivecrmapi.themarcomavenue.in/crm/api/v1`
  });
};

export const apiAxios = () => {
  return axios.create({
    baseURL: process.env.REACT_APP_BASEURL,
    headers: {
      "x-api-key": process.env.REACT_APP_API_KEY,
      "Content-Type": "application/json",
    },
  });
};


export const authAxios = () => {
  let token = store.getState().auth.accessToken;
  return axios.create({
    baseURL: `${process.env.REACT_APP_BASEURL}`,
    headers: {
      'Authorization': `${token ? `${token}` : null}`,
    },
  });
};