"use client";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
// import { SortableContext } from "@dnd-kit/sortable";
import { columnIds, TaskType } from "@/app/types";
import { arrayMove } from "@dnd-kit/sortable";
import { cloneDeep } from "lodash-es";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Column from "../column";
import DraggableItem from "../draggableItem";
import MultipleTask from "../multipleTask";
import Task from "../task";
import css from "./kanbanBoard.module.css";

function KanbanBoard() {
  const columns = ["todo", "doing", "done"];

  const allTask: TaskType[] = [
    {
      id: "task-1",
      name: "Preparare la presentazione settimanale",
      status: "todo",
      selected: false,
    },
    {
      id: "task-4",
      name: "Scrivere il report del progetto X",
      status: "todo",
      selected: false,
    },
    {
      id: "task-8",
      name: "Aggiornare la documentazione tecnica",
      status: "todo",
      selected: false,
    },

    {
      id: "task-2",
      name: "Rivedere il budget mensile",
      status: "doing",
      selected: false,
    },
    {
      id: "task-5",
      name: "Organizzare riunione con il team marketing",
      status: "doing",
      selected: false,
    },
    {
      id: "task-7",
      name: "Preparare le email per la campagna pubblicitaria",
      status: "doing",
      selected: false,
    },
    {
      id: "task-10",
      name: "Creare il piano di formazione per i nuovi assunti",
      status: "doing",
      selected: false,
    },

    {
      id: "task-3",
      name: "Aggiornare il sito web aziendale",
      status: "done",
      selected: false,
    },
    {
      id: "task-6",
      name: "Analizzare i dati di vendita del trimestre",
      status: "done",
      selected: false,
    },
    {
      id: "task-9",
      name: "Testare la nuova funzionalità dell’app",
      status: "done",
      selected: false,
    },
  ];

  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [tasks, setTasks] = useState(allTask);
  const selectedTask: TaskType[] = grabAllSelectedTasks();

  function grabAllSelectedTasks() {
    return tasks.filter((task) => task.selected);
  }

  const multiDragging = useMemo(
    () => selectedTask.length > 1,
    [selectedTask.length]
  );

  const sensors = useSensors(
    // Questa cosa è per l'esempio del tipo perchè
    // deve distinguere tra un bottone e il vero spostamento
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (!active) return;
    setActiveTask(active.data.current?.task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    console.log(over.id);

    if (active.id === over.id) return;

    setTasks((prevTasksState) => {
      let copyState = cloneDeep(prevTasksState);

      // STIAMO DROPPANDO SU UN CONTAINER
      if (columns.includes(over.id as string)) {
        const oldIndex = copyState.findIndex((i) => i.id === active.id);

        copyState[oldIndex].status = over.id as "todo" | "doing" | "done";

        copyState = arrayMove(copyState, oldIndex, copyState.length - 1);

        return copyState;
      }

      // STIAMO DROPPANDO SU UN ITEM
      const oldIndex = copyState.findIndex((i) => i.id === active.id);
      const newIndex = copyState.findIndex((i) => i.id === over.id);

      copyState[oldIndex].status = copyState[newIndex].status;

      copyState = arrayMove(copyState, oldIndex, newIndex);

      console.log("uela");

      return copyState;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    console.log(multiDragging);

    const { active, over } = event;
    if (!over) return;

    setTasks((prevTasksState) => {
      let copyState = cloneDeep(prevTasksState);

      const tasksToUpdate = selectedTask.filter((t) => t.id !== active.id);

      copyState = copyState.filter(
        (t) => !tasksToUpdate.map((task) => task.id).includes(t.id)
      );

      // STIAMO DROPPANDO SU UN CONTAINER
      if (multiDragging) {
        if (columns.includes(over.id as string)) {
          tasksToUpdate.forEach(
            (t) => (t.status = over.id as "todo" | "doing" | "done")
          );
          copyState.push(...tasksToUpdate);

          return copyState;
        }

        // STIAMO DROPPANDO SU UN ITEM
        const newStatus = over?.data?.current?.task?.status;

        tasksToUpdate.forEach(
          (t) => (t.status = newStatus as "todo" | "doing" | "done")
        );

        const targetIndex = copyState.findIndex((i) => i.id === over.id);

        copyState = [
          ...copyState.slice(0, targetIndex + 1),
          ...tasksToUpdate,
          ...copyState.slice(targetIndex + 1),
        ];
      }
      return copyState;
    });
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      // collisionDetection={closestCorners}
      sensors={sensors}
    >
      <div className={css.container}>
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column);
          return (
            <Column
              key={column}
              id={column as columnIds}
              tasksIds={columnTasks.map((task) => task.id)}
            >
              {columnTasks.map((task) =>
                activeTask &&
                multiDragging &&
                selectedTask.find(
                  (t) => t.id === task.id && t.id !== activeTask.id
                ) ? null : (
                  <DraggableItem
                    key={task.id}
                    task={task}
                    column={column as columnIds}
                    setTasks={setTasks}
                    disabled={
                      multiDragging &&
                      selectedTask.find((sTask) => sTask.id === task.id) ===
                        undefined
                    }
                    multiDragging={multiDragging}
                  />
                )
              )}
            </Column>
          );
        })}
      </div>
      {typeof window !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeTask && multiDragging ? (
              <MultipleTask
                task={activeTask}
                numberOfDrag={selectedTask.length}
              />
            ) : (
              <Task task={activeTask} />
            )}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}

export default KanbanBoard;
