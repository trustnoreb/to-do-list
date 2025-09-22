"use client";
import { columnIds, TaskType } from "@/app/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cloneDeep } from "lodash-es";
import { Dispatch, SetStateAction } from "react";
import MultipleTask from "../multipleTask";
import Task from "../task";
import css from "./task.module.css";
interface Props {
  task: TaskType;
  column: columnIds;
  setTasks: Dispatch<SetStateAction<TaskType[]>>;
  disabled: boolean;
  multiDragging: boolean;
}

function DraggableItem({
  task,
  column,
  setTasks,
  disabled,
  multiDragging,
}: Props) {
  const {
    setNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      column: column,
      task,
    },
    disabled: disabled,
  });

  function handleTaskClick() {
    setTasks((prevSelectedTasks) => {
      const copiedState = cloneDeep(prevSelectedTasks);
      const taskToInvertSelected = copiedState.find((t) => t.id === task.id);
      if (taskToInvertSelected) {
        taskToInvertSelected.selected = !taskToInvertSelected.selected;
      }

      return copiedState;
    });
  }
  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging && css.dragging}`}
      onClick={handleTaskClick}
    >
      {multiDragging && isDragging ? (
        <MultipleTask isDragging={isDragging}></MultipleTask>
      ) : (
        <Task key={task.id} task={task} isDragging={isDragging} />
      )}
    </div>
  );
}
export default DraggableItem;
