"use client";
import { Provider } from "react-redux";
import KanbanBoard from "./components/kanbanBoard";
import store from "./store";

export default function Home() {
  return (
    <Provider store={store}>
      <KanbanBoard />
    </Provider>
  );
}
