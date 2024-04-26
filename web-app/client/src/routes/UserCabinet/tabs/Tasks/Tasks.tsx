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

const secondsToMilliseconds = (s: number) => s * 1e3;

const filtersToApi = (filters: Filters): TasksQueryFilters => ({
  ...filters,
  searchString: filters.searchString || undefined,
  elapsedTime: formatToRange(filters.elapsedTime, secondsToMilliseconds),
  period: formatToRange(filters.period, (value) => value.toISOString()),
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
