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
import { arrayMove } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Column from "../column";
import DraggableItem from "../draggableItem";
import MultipleTask from "../multipleTask";
import Task from "../task";
import css from "./kanbanBoard.module.css";

function KanbanBoard() {
  const allTask: TaskList = {
    toDo: [
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
    const selectedT = [];
    for (const column in tasks) {
      for (const task of tasks[column as columnIds]) {
        if (task.selected) selectedT.push(task);
      }
    }

    return selectedT;
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
      // STIAMO DROPPANDO SU UN CONTAINER
      if (Object.keys(prevTasksState).includes(over.id as columnIds)) {
        // STIAMO DROPPANDO L'ITEM IN FONDO ALLO STESSO CONTAINER
        if (active.data.current?.column === over.id) {
          let columnContent = [
            ...prevTasksState[active.data.current?.column as columnIds],
          ];

          const oldIndex = columnContent.findIndex((i) => i.id === active.id);

          columnContent = arrayMove(
            columnContent,
            oldIndex,
            columnContent.length - 1
          );
          const newTasksState = {
            ...prevTasksState,
            [active.data.current?.column]: columnContent,
          };

          return newTasksState;
        }

        // STIAMO DROPPANDO L'ITEM IN FONDO AD UN CONTAINER DIVERSO
        let activeColumnContent = [
          ...prevTasksState[active.data.current?.column as columnIds],
        ];

        activeColumnContent = activeColumnContent.filter(
          (task) => task.id !== active.id
        );

        const overColumnContent = [...prevTasksState[over.id as columnIds]];

        overColumnContent.push(active.data.current?.task);

        return {
          ...prevTasksState,
          [active.data.current?.column]: activeColumnContent,
          [over.id]: overColumnContent,
        };
      }

      // STIAMO DROPPANDO SU UN ALTRO ITEM
      const isSameList: boolean =
        active.data.current?.column === over.data.current?.column;

      // Caso in cui riordino la stessa lista
      if (isSameList) {
        let columnContent = [
          ...prevTasksState[active.data.current?.column as columnIds],
        ];

        const oldIndex = columnContent.findIndex((i) => i.id === active.id);
        const newIndex = columnContent.findIndex((i) => i.id === over.id);

        columnContent = arrayMove(columnContent, oldIndex, newIndex);
        const newTasksState = {
          ...prevTasksState,
          [active.data.current?.column]: columnContent,
        };

        return newTasksState;
      }

      // Caso in cui cambio la lista ad un item
      let activeColumnContent = [
        ...prevTasksState[active.data.current?.column as columnIds],
      ];

      activeColumnContent = activeColumnContent.filter(
        (task) => task.id !== active.id
      );

      const overColumnContent = [
        ...prevTasksState[over.data.current?.column as columnIds],
      ];

      const newIndex = overColumnContent.findIndex((i) => i.id === over.id);

      overColumnContent.splice(newIndex, 0, active.data.current?.task);

      const newTasksState = {
        ...prevTasksState,
        [active.data.current?.column]: activeColumnContent,
        [over.data.current?.column]: overColumnContent,
      };

      return newTasksState;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    console.log(multiDragging);
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className={css.container}>
        {Object.keys(tasks).map((column) => (
          <Column
            key={column}
            id={column as columnIds}
            tasksIds={tasks[column as columnIds].map((task) => task.id)}
          >
            {tasks[column as columnIds].map((task) =>
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
        ))}
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
