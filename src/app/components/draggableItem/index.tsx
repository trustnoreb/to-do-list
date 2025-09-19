"use client";
import { columnIds, TaskType } from "@/app/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Task from "../task";
import css from "./task.module.css";
interface Props {
  task: TaskType;
  column: columnIds;
}

function DraggableItem({ task, column }: Props) {
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
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging && css.dragging}`}
    >
      <Task key={task.id} task={task} isDragging={isDragging} />
    </div>
  );
}
export default DraggableItem;
