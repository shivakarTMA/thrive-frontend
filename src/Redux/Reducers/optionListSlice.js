import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchOptionList = createAsyncThunk(
  "optionList/fetchOptionList",
  async (optionListType) => {
    const res = await axios.get(
      `${process.env.REACT_APP_BASEURL}/option-list/get`,
      {
        params: { optionListType },
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    let data = res.data?.data || [];

    data = data.filter(item => item.status === "ACTIVE");

    // Sort: position ASC if exists, otherwise by name
    // data = data.sort((a, b) => {
    //   if (a.position != null && b.position != null) {
    //     return a.position - b.position;
    //   }
    //   return a.name.localeCompare(b.name);
    // });
     data = data.sort((a, b) => {
      const aHasPosition = a.position && a.position > 0;
      const bHasPosition = b.position && b.position > 0;

      if (!aHasPosition && !bHasPosition) {
        return a.name.localeCompare(b.name); // Both no position → alphabetical
      }
      if (!aHasPosition) return 1; // A to bottom
      if (!bHasPosition) return -1; // B to bottom
      return a.position - b.position; // Both have position → sort ascending
    });

    return {
      type: optionListType,
      options: data.map(item => ({
        label: item.name,
        value: item.name
      })),
    };
  }
);


const optionListSlice = createSlice({
  name: "optionList",
  initialState: {
    lists: {}, // { "List Type 1": [...], "Status List": [...] }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOptionList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOptionList.fulfilled, (state, action) => {
        state.loading = false;
        state.lists[action.payload.type] = action.payload.options;
      })
      .addCase(fetchOptionList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default optionListSlice.reducer;
