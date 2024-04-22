import { Moment } from 'moment';
import moment from 'moment';
import { FC } from 'react';
import TabLayout from '@components/TabLayout';
import TaskItem from '@components/TaskItem';
import {
  getOwnTasks,
  getOwnTasksVariables,
  getOwnTasks_user_tasks_data,
} from '@graphql/operations/queries/__generated__/getOwnTasks';
import { GET_OWN_TASKS } from '@graphql/operations/queries/getOwnTasks';
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
};

const defaultFilters: Filters = {
  searchString: undefined,
  elapsedTime: [undefined, undefined],
  period: [undefined, undefined],
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

const Tasks: FC = () => (
  <TabLayout<
    Filters,
    Ordering,
    getOwnTasks,
    getOwnTasksVariables,
    getOwnTasks_user_tasks_data
  >
    title="Tasks"
    query={GET_OWN_TASKS}
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
    getData={(result) => result?.user?.tasks}
    itemRenderer={(item) => <TaskItem data={item} key={item.taskID} />}
  />
);

export default Tasks;
