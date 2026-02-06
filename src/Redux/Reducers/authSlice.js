import { createSlice } from '@reduxjs/toolkit';


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

export const { setAccessToken,  setuser ,setIsAuthenticated , setTokenExpiry, logout  } = authSlice.actions;

export default authSlice.reducer;