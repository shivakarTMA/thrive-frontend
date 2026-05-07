import { createSlice, createSelector } from '@reduxjs/toolkit';
import { getAuthFromToken } from '../../utils/authUtils';


const initialState = {
    accessToken: '',
    user: {},
    isAuthenticated: false,
    tokenExpiry: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAccessToken: (state, action) => {
            state.accessToken = action.payload;
        },
        
        setuser: (state, action) => {
            state.user = action.payload;
        },
        
        setIsAuthenticated:(state,action)=>{
         state.isAuthenticated=action.payload
        },

        setTokenExpiry: (state, action) => {
            state.tokenExpiry = action.payload;
        },
        
        logout: (state, action) => {
            state.user = {};
            state.accessToken = '';
            state.isAuthenticated=false;
            state.tokenExpiry = null;
        },
    },
});

// ✅ Add this — derives role/id from JWT, not localStorage
export const selectAuthFromToken = createSelector(
  (state) => state.auth.accessToken,
  (accessToken) => getAuthFromToken(accessToken)
);

export const { setAccessToken,  setuser ,setIsAuthenticated , setTokenExpiry, logout  } = authSlice.actions;

export default authSlice.reducer;