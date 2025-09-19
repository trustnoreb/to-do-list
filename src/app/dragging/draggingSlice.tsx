import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DraggingState {
  draggingTaskId: string | null;
}

const initialState: DraggingState = { draggingTaskId: "" };

export const DraggingSlice = createSlice({
  name: "dragging",
  initialState,
  reducers: {
    toggleDraggingId(state, action: PayloadAction<string | null>) {
      state.draggingTaskId = action.payload;
    },
  },
});

export const { toggleDraggingId } = DraggingSlice.actions;

export default DraggingSlice.reducer;
