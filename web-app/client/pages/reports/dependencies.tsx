import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_MAIN_TASK_DEPS } from '@graphql/operations/queries/getDeps';
import {
  GetMainTaskDeps,
  GetMainTaskDepsVariables,
} from '@graphql/operations/queries/__generated__/GetMainTaskDeps';
import ReportsLayout from '@components/ReportsLayout';
import { ReactElement, useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { Text } from '@components/Inputs';
import Button from '@components/Button';
import styles from '@styles/Dependencies.module.scss';
import filterIcon from '@assets/icons/filter.svg';
import orderingIcon from '@assets/icons/ordering.svg';
import eyeIcon from '@assets/icons/eye.svg';
import { Column } from '@graphql/operations/fragments/__generated__/Column';
import {
  FilteringWindow,
  getSortingParams,
  OrderingWindow,
  Sorting,
  useFilters,
} from '@components/Filters/Filters';
import Pagination from '@components/Pagination/Pagination';
import { GET_TASK_INFO } from '@graphql/operations/queries/getTaskInfo';
import { getTaskInfo } from '@graphql/operations/queries/__generated__/getTaskInfo';
import { OrderBy, PrimitiveType } from 'types/globalTypes';
import client from '@graphql/client';
import { convertDependencies } from '@utils/convertDependencies';
import { TaskContextProvider, useTaskContext } from '@components/TaskContext';
import { NextPageWithLayout } from 'types/pageWithLayout';

import DependencyList from '@components/DependencyList/DependencyList';

type GeneralColumn = {
  column: Column;
  pattern?: string;
};

type Props = {
  defaultData?: GetMainTaskDeps;
};

const ReportsDependencies: NextPageWithLayout<Props> = ({ defaultData }) => {
  const {
    taskInfo,
    taskID,
    dependenciesFilter: {
      rhs: mustContainRhsColIndices,
      lhs: mustContainLhsColIndices,
    },
  } = useTaskContext();

  const primitive: PrimitiveType | undefined =
    taskInfo?.taskInfo.data.baseConfig.type;
  const {
    fields: { search, page, ordering, direction, showKeys },
    setFilterField,
    setFilterFields,
  } = useFilters(primitive || PrimitiveType.FD);
  const [infoVisible, setInfoVisible] = useState(true);
  const [getDeps, { loading, data, called, previousData }] = useLazyQuery<
    GetMainTaskDeps,
    GetMainTaskDepsVariables
  >(GET_MAIN_TASK_DEPS);
  const [isOrderingShown, setIsOrderingShown] = useState(false);
  const [isFilteringShown, setIsFilteringShown] = useState(false);

  useEffect(() => {
    if (!primitive) return;
    const sortingParams = {
      [(primitive === PrimitiveType.TypoFD ? PrimitiveType.FD : primitive) +
      'SortBy']: ordering,
    };

    getDeps({
      variables: {
        taskID: taskID,
        filter: {
          withoutKeys: showKeys,
          filterString: search,
          pagination: { limit: 10, offset: (page - 1) * 10 },
          ...sortingParams,
          orderBy: direction,
          mustContainRhsColIndices: mustContainRhsColIndices.length
            ? mustContainRhsColIndices
            : null,
          mustContainLhsColIndices: mustContainLhsColIndices.length
            ? mustContainLhsColIndices
            : null,
        },
      },
    });
  }, [taskID, primitive, search, page, ordering, direction]);

  // todo add loading text/animation, maybe in Pagination component too
  const shownData = (loading ? previousData : data) || defaultData;
  const recordsCount =
    shownData?.taskInfo.data.result &&
    'filteredDeps' in shownData?.taskInfo.data.result &&
    shownData?.taskInfo.data.result.filteredDeps.filteredDepsAmount;

  const deps = convertDependencies(primitive, shownData);

  return (
    <>
      {isOrderingShown && (
        <OrderingWindow
          {...{
            setIsOrderingShown,
            primitive: primitive || PrimitiveType.FD,
            sortingParams: { ordering, direction },
          }}
          setSortingParams={(ordering: Sorting, direction: OrderBy) => {
            setFilterFields({ ordering, direction });
          }}
        />
      )}

      {isFilteringShown && (
        <FilteringWindow
          {...{
            setIsFilteringShown,
            showKeys,
            setShowKeys: (showKeys) => setFilterFields({ showKeys }),
          }}
        />
      )}

      <h5>Primitive List</h5>

      <div className={styles.filters}>
        <Text
          label="Search"
          placeholder="Attribute name or regex"
          value={search}
          onChange={(e) => setFilterField('search', e.currentTarget.value)}
        />
        <div className={styles.buttons}>
          <Button
            variant="secondary"
            size="md"
            icon={filterIcon}
            onClick={() => setIsFilteringShown(true)}
          >
            Filters
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={orderingIcon}
            onClick={() => setIsOrderingShown(true)}
          >
            Ordering
          </Button>
          {primitive &&
            [PrimitiveType.AR, PrimitiveType.CFD].includes(primitive) && (
              <Button
                variant="secondary"
                size="md"
                icon={eyeIcon}
                onClick={() => setInfoVisible((e) => !e)}
              >
                Visibility
              </Button>
            )}
        </div>
      </div>

      <div className={styles.rows}>
        <DependencyList {...{ deps, infoVisible }} />
      </div>

      <div className={styles.pagination}>
        <Pagination
          onChange={(n) => setFilterField('page', n)}
          current={page}
          count={Math.ceil((recordsCount || 10) / 10)}
        />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.query.taskID) {
    const { data } = await client.query<getTaskInfo>({
      query: GET_TASK_INFO,
      variables: { taskID: context.query.taskID },
    });

    const sortingParams = getSortingParams(data.taskInfo.data.baseConfig.type);

    const { data: taskDeps } = await client.query<GetMainTaskDeps>({
      query: GET_MAIN_TASK_DEPS,
      variables: {
        taskID: context.query.taskID,
        filter: {
          withoutKeys: false,
          filterString: '',
          pagination: { limit: 10, offset: 0 },
          ...sortingParams,
          orderBy: OrderBy.ASC,
        },
      },
    });
    return {
      props: {
        defaultData: taskDeps,
      },
    };
  }

  return {
    props: {},
  };
};

ReportsDependencies.getLayout = function getLayout(page: ReactElement) {
  return (
    <TaskContextProvider>
      <ReportsLayout>{page}</ReportsLayout>
    </TaskContextProvider>
  );
};

export default ReportsDependencies;
