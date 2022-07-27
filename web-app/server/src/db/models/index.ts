import { FileData } from "./FileData";
import { TaskData } from "./TaskData";
import { UserData } from "./UserData";

export const models = { ...FileData, ...TaskData, ...UserData };

export type ModelsType = typeof models;

export default models;
