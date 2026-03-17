import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAxios } from "../../config/config";



// Thunk — fetch club and derive timing
export const fetchClubTiming = createAsyncThunk(
  "clubTiming/fetch",
  async (clubId, { rejectWithValue }) => {
    try {
      const res = await authAxios().get(`/club/${clubId}`);
      const club = res.data?.data || res.data || {};

      const parseToMinutes = (timeStr) => {
        if (!timeStr) return null;
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m; // store as plain minutes — serializable ✓
      };

      const openMinutes  = parseToMinutes(club.open_time);   // e.g. 360  (06:00)
      const closeMinutes = parseToMinutes(club.close_time);  // e.g. 1320 (22:00)
      const trialMins    = club.trial_duration ?? 30;        // e.g. 120

      return {
        clubId,
        openMinutes,
        closeMinutes,
        // last bookable slot = close − trial_duration
        maxBookableMinutes: closeMinutes != null ? closeMinutes - trialMins : null,
        timeIntervals: trialMins,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const clubTimingSlice = createSlice({
  name: "clubTiming",
  initialState: {
    data: null,       // { clubId, openMinutes, closeMinutes, maxBookableMinutes, timeIntervals }
    status: "idle",   // "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {
    resetClubTiming: (state) => {
      state.data   = null;
      state.status = "idle";
      state.error  = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClubTiming.pending, (state) => {
        state.status = "loading";
        state.error  = null;
      })
      .addCase(fetchClubTiming.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data   = action.payload;
      })
      .addCase(fetchClubTiming.rejected, (state, action) => {
        state.status = "failed";
        state.error  = action.payload;
      });
  },
});

export const { resetClubTiming } = clubTimingSlice.actions;
export default clubTimingSlice.reducer;