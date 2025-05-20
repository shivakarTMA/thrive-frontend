import axios from "axios";
import { store } from '../Redux/store';


export const withoutAuthAxios = () => {
  return axios.create({
    baseURL: `${process.env.REACT_APP_BASEURL}/api`
  });
};


export const authAxios = () => {
  let token = store.getState().auth.accessToken;
  return axios.create({
    baseURL: `${process.env.REACT_APP_BASEURL}/api`,
    headers: {
      'Authorization': `${token ? `${token}` : null}`,
    },
  });
};