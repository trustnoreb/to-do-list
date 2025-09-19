import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tasks } from "../types";

interface InitialState {
  allTasks: Tasks[];
  selectedTasks: Tasks[];
}

const initialState: InitialState = { allTasks: [], selectedTasks: [] };

export const selectedTasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    toggleSelection(state, action: PayloadAction<Tasks>) {
      const task = action.payload;
      const alreadyExist = state.selectedTasks.some(
        (selected) => selected.id === task.id
      );
      if (alreadyExist) {
        state.selectedTasks = state.selectedTasks.filter(
          (t) => t.id !== task.id
        );
      } else {
        state.selectedTasks.push(task);
      }
    },
    toggleTaskStatus(
      state,
      action: PayloadAction<{
        previousStatus: string;
        newStatus: Tasks;
      }>
    ) {
      const prevStatus = state.allTasks.find(
        (task) => task.id === action.payload.previousStatus
      );
      const newStatus = action.payload.newStatus;
      if (!prevStatus) return;
      prevStatus.status = newStatus.status;
    },
    // TODO: quando ci sarà un select all
    allTasks(state, action: PayloadAction<Tasks[]>) {
      state.allTasks = action.payload;
    },
    setSelection(state, action: PayloadAction<Tasks[]>) {
      state.selectedTasks = action.payload;
    },
    clearSelection(state) {
      state.selectedTasks = [];
    },
  },
});

export const {
  toggleSelection,
  allTasks,
  setSelection,
  toggleTaskStatus,
  clearSelection,
} = selectedTasksSlice.actions;

export default selectedTasksSlice.reducer;
