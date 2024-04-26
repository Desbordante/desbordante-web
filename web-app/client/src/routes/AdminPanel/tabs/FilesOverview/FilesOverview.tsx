import { Moment } from 'moment';
import moment from 'moment';
import { FC } from 'react';
import DatasetItem from '@components/DatasetItem';
import TabLayout from '@components/TabLayout';
import {
  getDatasetsInfo,
  getDatasetsInfoVariables,
  getDatasetsInfo_datasets_data,
} from '@graphql/operations/queries/__generated__/getDatasetsInfo';
import { GET_DATASETS_INFO } from '@graphql/operations/queries/getDatasetsInfo';
import { formatToRange } from '@utils/formatToRange';
import {
  DatasetsQueryFilters,
  DatasetsQueryOrderingParameter,
  OrderDirection,
} from 'types/globalTypes';
import FiltersModal from './components/FiltersModal';
import OrderingModal from './components/OrderingModal';

export type Filters = {
  searchString?: string;
  fileSize: [number | undefined, number | undefined];
  period: [Moment | undefined, Moment | undefined];
  includeDeleted: boolean;
  includeBuiltIn: boolean;
};

const defaultFilters: Filters = {
  searchString: undefined,
  fileSize: [undefined, undefined],
  period: [undefined, undefined],
  includeDeleted: false,
  includeBuiltIn: true,
};

export type Ordering = {
  parameter: DatasetsQueryOrderingParameter;
  direction: OrderDirection;
};

const defaultOrdering: Ordering = {
  parameter: DatasetsQueryOrderingParameter.CREATION_TIME,
  direction: OrderDirection.DESC,
};

const filtersToApi = (filters: Filters): DatasetsQueryFilters => ({
  ...filters,
  searchString: filters.searchString || undefined,
  fileSize: formatToRange(filters.fileSize, (value) => value * 2 ** 20),
  period: formatToRange(filters.period, (value) => value.toISOString()),
});

const FilesOverview: FC = () => (
  <TabLayout<
    Filters,
    Ordering,
    getDatasetsInfo,
    getDatasetsInfoVariables,
    getDatasetsInfo_datasets_data
  >
    title="Files Overview"
    query={GET_DATASETS_INFO}
    filters={{
      defaultValues: defaultFilters,
      valuesToApi: filtersToApi,
      storageToValues: {
        period: (value) =>
          value.map((v?: string) => (v ? moment(v) : undefined)),
        fileSize: (value) => value.map((v?: number) => v ?? undefined),
      },
      modal: FiltersModal,
    }}
    ordering={{
      defaultValues: defaultOrdering,
      modal: OrderingModal,
    }}
    getData={(result) => result?.datasets}
    itemRenderer={(item) => (
      <DatasetItem data={item} key={item.fileID} displayUserName />
    )}
  />
);

export default FilesOverview;
