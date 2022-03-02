import { FunctionalDependency } from "../types/taskInfo";

export default function parseFunctionalDependency(
  dependencyEncoded: { lhs: number[]; rhs: number },
  attributes: string[]
): FunctionalDependency {
  return {
    lhs: dependencyEncoded.lhs.map((index) => attributes[index]),
    rhs: attributes[dependencyEncoded.rhs],
  };
}
