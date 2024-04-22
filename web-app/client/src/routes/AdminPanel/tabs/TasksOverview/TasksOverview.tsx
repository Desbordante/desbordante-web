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

const filtersToApi = (filters: Filters): TasksQueryFilters => ({
  ...filters,
  searchString: filters.searchString || undefined,
  elapsedTime: filters.elapsedTime.some(Boolean)
    ? {
        from: filters.elapsedTime[0] ?? undefined,
        to: filters.elapsedTime[1] ?? undefined,
      }
    : undefined,
  period: filters.period.some(Boolean)
    ? {
        from: filters.period[0]?.toISOString() ?? undefined,
        to: filters.period[1]?.toISOString() ?? undefined,
      }
    : undefined,
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
