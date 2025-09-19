"use client";
import { TaskType } from "@/app/types";
import css from "./task.module.css";
interface Props {
  task?: TaskType | undefined;
  isDragging?: boolean;
  numberOfDrag?: number;
}

function MultipleTask({ task, isDragging, numberOfDrag }: Props) {
  return (
    <div className={css.container}>
      <div className={css.multipleTask}>
        {!isDragging && <span>{task?.name}</span>}
      </div>
      <div className={css.taskCounter}>{numberOfDrag}</div>
      <div className={css.bottomMultipleTask}></div>
    </div>
  );
}
export default MultipleTask;
