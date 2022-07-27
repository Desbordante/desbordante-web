import { TaskState } from "./TaskState";
import taskConfigs from "./configs";
import taskResults from "./results";

export const TaskData = { TaskState, ...taskResults, ...taskConfigs };
