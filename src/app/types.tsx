export type Columns = {
  id: string;
  title: string;
};

export type columnIds = "toDo" | "doing" | "done";

export type TaskList = Record<columnIds, TaskType[]>;

export type TaskType = {
  id: string;
  name: string;
  status: "todo" | "doing" | "done";
};
