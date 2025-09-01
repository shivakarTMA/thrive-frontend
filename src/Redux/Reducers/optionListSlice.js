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

    console.log(data,'Options list')

    data = data.filter(item => item.status === "ACTIVE");

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
        ...item,
        label: item.name,
        value: item.name
      })),
    };
  }
);


const optionListSlice = createSlice({
  name: "optionList",
  initialState: {
    lists: {},
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
