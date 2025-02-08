
import { createSlice } from '@reduxjs/toolkit';
import { AUTH_STATUS } from './types';

const initialState = {
    status: AUTH_STATUS.IDLE,
    user: null,
    error: null,
    otpRequired: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state) => {
            state.status = AUTH_STATUS.LOADING;
            state.error = null;
        },
        setAuthenticated: (state, action) => {
            state.status = AUTH_STATUS.AUTHENTICATED;
            state.user = action.payload;
            state.error = null;
            state.otpRequired = false;
        },
        setNotAuthenticated: (state) => {
            state.status = AUTH_STATUS.NOT_AUTHENTICATED;
            state.user = null;
            state.otpRequired = false;
        },
        setError: (state, action) => {
            state.status = AUTH_STATUS.NOT_AUTHENTICATED;
            state.error = action.payload;
        },
        setOtpRequired: (state) => {
            state.otpRequired = true;
        },
        clearError: (state) => {
            state.error = null;
        }
    }
});

export const {
    setLoading,
    setAuthenticated,
    setNotAuthenticated,
    setError,
    setOtpRequired,
    clearError
} = authSlice.actions;
export default authSlice.reducer;