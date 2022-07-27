import { gql } from "@apollo/client";
import {AR, CFD, COLUMN, FD, Item} from "../fragments";

export const GET_MAIN_TASK_DEPS = gql`
    ${AR}
    ${CFD}
    ${FD}
    ${Item}
    ${COLUMN}
    query GetMainTaskDeps($taskID: ID! $filter: IntersectionFilter!){
        taskInfo(taskID: $taskID) {
            ...on SpecificTaskInfo {
                data {
                    ...on SpecificTaskData {
                        result {
                            taskID
                        }
                    }
                }
            }
            taskID
            ...on TaskInfo {
                data {
                    result {
                        taskID
                        __typename
                        ...on TaskWithDepsResult {
                            __typename
                            depsAmount
                            filteredDeps(filter: $filter) {
                                __typename
                                filteredDepsAmount
                                ...on FilteredDepsBase {
                                    __typename
                                    filteredDepsAmount
                                }
                                ...on FilteredARs {
                                    ARs: deps {
                                        ...AR
                                    }
                                }
                                ...on FilteredFDs {
                                    FDs: deps {
                                        ...FD
                                    }
                                }
                                ...on FilteredCFDs {
                                    CFDs: deps {
                                        ...CFD
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`
