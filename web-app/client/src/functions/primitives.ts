import {FunctionalDependency} from "../types/taskInfo";

export const dependencyToAttributeIds = (d: FunctionalDependency) =>
  d.lhs.map(({ index }) => index).concat(d.rhs.index);