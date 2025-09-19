import { configureStore } from "@reduxjs/toolkit";
import draggingReducer from "./dragging/draggingSlice";
import selectedTasksReducer from "./selectedTask/selectedTaskSlice";
const store = configureStore({
  reducer: {
    selected: selectedTasksReducer,
    dragging: draggingReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export default store;
