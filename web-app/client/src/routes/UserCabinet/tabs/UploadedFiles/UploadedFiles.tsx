import { Moment } from 'moment';
import moment from 'moment';
import { FC } from 'react';
import DatasetItem from '@components/DatasetItem';
import TabLayout from '@components/TabLayout';
import {
  getOwnDatasets,
  getOwnDatasetsVariables,
  getOwnDatasets_user_datasets_data,
} from '@graphql/operations/queries/__generated__/getOwnDatasets';
import { GET_OWN_DATASETS } from '@graphql/operations/queries/getOwnDatasets';
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
};

const defaultFilters: Filters = {
  searchString: undefined,
  fileSize: [undefined, undefined],
  period: [undefined, undefined],
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
  includeBuiltIn: false,
  searchString: filters.searchString || undefined,
  fileSize: formatToRange(filters.fileSize, (value) => value * 2 ** 20),
  period: formatToRange(filters.period, (value) => value.toISOString()),
});

const UploadedFiles: FC = () => (
  <TabLayout<
    Filters,
    Ordering,
    getOwnDatasets,
    getOwnDatasetsVariables,
    getOwnDatasets_user_datasets_data
  >
    title="Uploaded Files"
    query={GET_OWN_DATASETS}
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
    getData={(result) => result?.user?.datasets}
    itemRenderer={(item) => <DatasetItem data={item} key={item.fileID} />}
  />
);

export default UploadedFiles;
