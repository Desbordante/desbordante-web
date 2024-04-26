import { Moment } from 'moment';
import moment from 'moment';
import { FC } from 'react';
import TabLayout from '@components/TabLayout';
import TaskItem from '@components/TaskItem';
import {
  getTasksInfo,
  getTasksInfoVariables,
  getTasksInfo_tasksInfo_data,
} from '@graphql/operations/queries/__generated__/getTasksInfo';
import { GET_TASKS_INFO } from '@graphql/operations/queries/getTasksInfo';
import { formatToRange } from '@utils/formatToRange';
import {
  OrderDirection,
  TasksQueryFilters,
  TasksQueryOrderingParameter,
} from 'types/globalTypes';
import FiltersModal from './components/FiltersModal';
import OrderingModal from './components/OrderingModal';

export type Filters = {
  searchString?: string;
  elapsedTime: [number | undefined, number | undefined];
  period: [Moment | undefined, Moment | undefined];
  includeDeleted: boolean;
};

const defaultFilters: Filters = {
  searchString: undefined,
  elapsedTime: [undefined, undefined],
  period: [undefined, undefined],
  includeDeleted: false,
};

export type Ordering = {
  parameter: TasksQueryOrderingParameter;
  direction: OrderDirection;
};

const defaultOrdering: Ordering = {
  parameter: TasksQueryOrderingParameter.CREATION_TIME,
  direction: OrderDirection.DESC,
};

const secondsToMilliseconds = (s: number) => s * 1e3;

const filtersToApi = (filters: Filters): TasksQueryFilters => ({
  ...filters,
  searchString: filters.searchString || undefined,
  elapsedTime: formatToRange(filters.elapsedTime, secondsToMilliseconds),
  period: formatToRange(filters.period, (value) => value.toISOString()),
});

const TasksOverview: FC = () => (
  <TabLayout<
    Filters,
    Ordering,
    getTasksInfo,
    getTasksInfoVariables,
    getTasksInfo_tasksInfo_data
  >
    title="Tasks Overview"
    query={GET_TASKS_INFO}
    filters={{
      defaultValues: defaultFilters,
      valuesToApi: filtersToApi,
      storageToValues: {
        period: (value) =>
          value.map((v?: string) => (v ? moment(v) : undefined)),
        elapsedTime: (value) => value.map((v?: number) => v ?? undefined),
      },
      modal: FiltersModal,
    }}
    ordering={{
      defaultValues: defaultOrdering,
      modal: OrderingModal,
    }}
    getData={(result) => result?.tasksInfo}
    itemRenderer={(item) => (
      <TaskItem data={item} key={item.taskID} displayUserName />
    )}
  />
);

export default TasksOverview;
