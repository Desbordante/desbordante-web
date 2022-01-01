import {QueryResolvers} from "../types/types";
import merge from "lodash/merge"
import FDAResultResolvers from "./TaskInfo/resolvers";

// const NumberResolvers: QueryResolvers = {
//     numberSix: async (obj, { }, context) => {
//         return 6;
//     },
//     numberSeven: async (obj, { }, context) => {
//         return 7;
//     }
// }

const resolvers = merge(
    // NumberResolvers,
    FDAResultResolvers
);


export = resolvers;
