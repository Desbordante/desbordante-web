import {
  GetMainTaskDeps,
  Operation,
} from '@graphql/operations/queries/__generated__/GetMainTaskDeps';

export const myData: GetMainTaskDeps = {
  taskInfo: {
    __typename: 'TaskInfo',
    taskID: '22fcfc02-de6e-4e4b-b75d-16e3881f68ad',
    data: {
      __typename: 'ACTaskData',
      operation: Operation.ADDITION,
      result: {
        __typename: 'ACTaskResult',
        taskID: '22fcfc02-de6e-4e4b-b75d-16e3881f68ad',
        pairsAttributesAmount: 6,
        ACs: [
          {
            __typename: 'AC',
            attributes: {
              __typename: 'Attributes',
              attribute1: 'Coffee',
              attribute2: 'Milk',
            },
            intervals: {
              __typename: 'Intervals',
              amount: 5,
              intervals: [
                [0, 1],
                [2, 3],
                [4, 5],
                [6, 7],
                [8, 9],
              ],
            },
            outliers: {
              __typename: 'Outliers',
              amount: 17,
              outliers: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
              ],
            },
          },
          {
            __typename: 'AC',
            attributes: {
              __typename: 'Attributes',
              attribute1: 'Milk',
              attribute2: 'Chocolate',
            },
            intervals: {
              __typename: 'Intervals',
              amount: 2,
              intervals: [
                [0, 1],
                [4, 5],
              ],
            },
            outliers: {
              __typename: 'Outliers',
              amount: 3,
              outliers: [3, 4, 5],
            },
          },
          {
            __typename: 'AC',
            attributes: {
              __typename: 'Attributes',
              attribute1: 'Coffee',
              attribute2: 'Chocolate',
            },
            intervals: {
              __typename: 'Intervals',
              amount: 6,
              intervals: [
                [980, 1010],
                [1012, 1019],
                [1110, 1140],
                [1200, 1228],
                [1245, 1260],
                [1280, 1320],
              ],
            },
            outliers: {
              __typename: 'Outliers',
              amount: 12,
              outliers: [
                100, 104, 108, 112, 113, 114, 115, 116, 117, 118, 119, 120,
              ],
            },
          },
          {
            __typename: 'AC',
            attributes: {
              __typename: 'Attributes',
              attribute1: 'Tea',
              attribute2: 'Milk',
            },
            intervals: {
              __typename: 'Intervals',
              amount: 5,
              intervals: [
                [0, 1],
                [2, 3],
                [4, 5],
                [6, 7],
                [8, 9],
              ],
            },
            outliers: {
              __typename: 'Outliers',
              amount: 17,
              outliers: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
              ],
            },
          },
          {
            __typename: 'AC',
            attributes: {
              __typename: 'Attributes',
              attribute1: 'Tea',
              attribute2: 'Chocolate',
            },
            intervals: {
              __typename: 'Intervals',
              amount: 6,
              intervals: [
                [980, 1010],
                [1012, 1019],
                [1110, 1140],
                [1200, 1228],
                [1245, 1260],
                [1280, 1320],
              ],
            },
            outliers: {
              __typename: 'Outliers',
              amount: 12,
              outliers: [
                100, 104, 108, 112, 113, 114, 115, 116, 117, 118, 119, 120,
              ],
            },
          },
          {
            __typename: 'AC',
            attributes: {
              __typename: 'Attributes',
              attribute1: 'Tea',
              attribute2: 'Coffee',
            },
            intervals: {
              __typename: 'Intervals',
              amount: 2,
              intervals: [
                [0, 1],
                [4, 5],
              ],
            },
            outliers: {
              __typename: 'Outliers',
              amount: 3,
              outliers: [3, 4, 5],
            },
          },
        ],
      },
    },
  },
};
