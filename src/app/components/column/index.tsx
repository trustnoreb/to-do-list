"use client";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { ReactNode } from "react";
import css from "./column.module.css";

const columnTitles = {
  toDo: "To Do",
  doing: "Doing",
  done: "Done",
};

type columnKey = keyof typeof columnTitles;

interface Props {
  id: columnKey;
  tasksIds: string[];
  children: ReactNode;
}

function Column({ id, tasksIds, children }: Props) {
  const { setNodeRef } = useDroppable({
    id: id,
    // data: {
    //   type: "Column",
    //   column,
    // },
  });

  return (
    <div className={css.column}>
      <h1 className={css.heading}>{columnTitles[id]}</h1>
      <div className={css.tasksContainer} ref={setNodeRef}>
        <SortableContext items={tasksIds}>{children}</SortableContext>
      </div>
    </div>
  );
}

export default Column;
