import {FD} from "../graphql/operations/fragments/__generated__/FD";

export const dependencyToAttributeIds = (d: FD) =>
  d.lhs.map(({ index }) => index).concat(d.rhs.index);
