"use client";
import { TaskType } from "@/app/types";
import css from "./task.module.css";
interface Props {
  task?: TaskType | null;
  isDragging?: boolean;
}

function Task({ task, isDragging }: Props) {
  return (
    <div className={css.task}>
      {!isDragging && <span>{task?.name}</span>}
      {!isDragging && task?.selected && <span>{"✅"}</span>}
    </div>
  );
}
export default Task;
