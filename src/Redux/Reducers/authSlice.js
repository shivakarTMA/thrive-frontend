import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    accessToken: '',
    user: {},
    isAuthenticated: false,
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
        
        logout: (state, action) => {
            state.user = {}
            state.accessToken = ''
            state.isAuthenticated=false
        },
    },
});

export const { setAccessToken,  setuser ,setIsAuthenticated , logout  } = authSlice.actions;

export default authSlice.reducer;