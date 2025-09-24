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
import { columnIds, TaskList, TaskType } from "@/app/types";
import customCollisionDetection from "@/app/utils/customCollisionDetection";
import { arrayMove } from "@dnd-kit/sortable";
import { cloneDeep } from "lodash-es";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Column from "../column";
import DraggableItem from "../draggableItem";
import MultipleTask from "../multipleTask";
import Task from "../task";
import css from "./kanbanBoard.module.css";

export function findColumn(tasks: TaskList, item: TaskType) {
  for (const column in tasks) {
    if (tasks[column as columnIds].find((t) => t.id == item.id)) {
      return column;
    }
  }
}

function KanbanBoard() {
  const allTask: TaskList = {
    todo: [
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
    ],
    doing: [
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
    ],
    done: [
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
    ],
  };

  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [tasks, setTasks] = useState(allTask);
  const selectedTask: TaskType[] = grabAllSelectedTasks();

  function grabAllSelectedTasks() {
    const selectedTasks = [...Object.values(tasks).flat()].filter(
      (task) => task.selected
    );
    return selectedTasks;
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

    if (active.id === over.id) return;

    setTasks((prevTasksState) => {
      let copyState = cloneDeep(prevTasksState);

      const oldColumn = findColumn(copyState, active.data.current?.task);

      // STIAMO DROPPANDO SU UN CONTAINER
      if (Object.keys(copyState).includes(over.id as string)) {
        const isSameContainer = oldColumn === over.id;

        // NON STIAMO CAMBIANDO COLONNA
        if (isSameContainer) {
          const oldIndex = copyState[oldColumn as columnIds].findIndex(
            (i) => i.id === active.id
          );
          copyState = {
            ...copyState,
            [oldColumn as columnIds]: arrayMove(
              copyState[oldColumn as columnIds],
              oldIndex,
              copyState[oldColumn as columnIds].length
            ),
          };
          return copyState;
        }
        // STIAMO CAMBIANDO COLONNA
        copyState = {
          ...copyState,
          [oldColumn as columnIds]: copyState[oldColumn as columnIds].filter(
            (task) => task.id !== active.id
          ),
        };
        copyState[over.id as columnIds].push(active.data.current?.task);
        return copyState;
      }

      // STIAMO DROPPANDO SU UN ITEM

      const newColumn = findColumn(copyState, over.data.current?.task);
      const newIndex = copyState[newColumn as columnIds].findIndex(
        (i) => i.id === over.id
      );
      const isSameContainer = oldColumn === newColumn;

      // NON STIAMO CAMBIANDO COLONNA
      if (isSameContainer) {
        const oldIndex = copyState[oldColumn as columnIds].findIndex(
          (i) => i.id === active.id
        );

        copyState = {
          ...copyState,
          [oldColumn as columnIds]: arrayMove(
            copyState[newColumn as columnIds],
            oldIndex,
            newIndex
          ),
        };
        return copyState;
      }

      // STIAMO CAMBIANDO COLONNA

      copyState = {
        ...copyState,
        [oldColumn as columnIds]: copyState[oldColumn as columnIds].filter(
          (task) => task.id !== active.id
        ),
      };

      copyState[newColumn as columnIds].splice(
        newIndex,
        0,
        active.data.current?.task
      );

      return copyState;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    if (multiDragging) {
      setTasks((prevTasksState) => {
        let copyState = cloneDeep(prevTasksState);

        const tasksToUpdate = selectedTask.filter((t) => t.id !== active.id);

        for (const task of tasksToUpdate) {
          const columnTask = findColumn(copyState, task);
          copyState = {
            ...copyState,
            [columnTask as columnIds]: copyState[
              columnTask as columnIds
            ].filter((t) => t.id !== task.id),
          };
        }

        // STIAMO DROPPANDO SU UN CONTAINER
        if (Object.keys(copyState).includes(over.id as string)) {
          copyState[over.id as columnIds].push(...tasksToUpdate);

          return copyState;
        }

        // STIAMO DROPPANDO SU UN ITEM

        const targetColumn = findColumn(copyState, over.data.current?.task);
        const targetIndex = copyState[targetColumn as columnIds].findIndex(
          (i) => i.id === over.id
        );

        const newColumnTasks = [
          ...copyState[targetColumn as columnIds].slice(0, targetIndex + 1),
          ...tasksToUpdate,
          ...copyState[targetColumn as columnIds].slice(targetIndex + 1),
        ];

        copyState = {
          ...copyState,
          [targetColumn as columnIds]: newColumnTasks,
        };
        return copyState;
      });
    }
  }

  // if (typeof window === "undefined") {
  //   // Evita di renderizzare elementi drag-n-drop sul server
  //   return null;
  // }
  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={customCollisionDetection}
      sensors={sensors}
    >
      <div className={css.container}>
        {Object.keys(tasks).map((column) => {
          const columnTasks = tasks[column as columnIds];
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
