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
  useFilters,
} from '@components/Filters';
import Pagination from '@components/Pagination/Pagination';
import { GET_TASK_INFO } from '@graphql/operations/queries/getTaskInfo';
import { getTaskInfo } from '@graphql/operations/queries/__generated__/getTaskInfo';
import { OrderBy, PrimitiveType } from 'types/globalTypes';
import client from '@graphql/client';
import { convertDependencies } from '@utils/convertDependencies';
import { TaskContextProvider, useTaskContext } from '@components/TaskContext';
import { NextPageWithLayout } from 'types/pageWithLayout';

import DependencyList from '@components/DependencyList/DependencyList';
import { FormProvider } from 'react-hook-form';

type Props = {
  defaultData?: GetMainTaskDeps;
};

const ReportsDependencies: NextPageWithLayout<Props> = ({ defaultData }) => {
  const { taskInfo, taskID } = useTaskContext();

  const primitive: PrimitiveType | undefined =
    taskInfo?.taskInfo.data.baseConfig.type;
  const methods = useFilters(primitive || PrimitiveType.FD);
  const { watch, register, setValue: setFilterParam } = methods;
  const {
    search,
    page,
    ordering,
    direction,
    mustContainRhsColIndices,
    mustContainLhsColIndices,
  } = watch();

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
          withoutKeys: false,
          filterString: search,
          pagination: { limit: 10, offset: (page - 1) * 10 },
          ...sortingParams,
          orderBy: direction,
          mustContainRhsColIndices: !mustContainRhsColIndices
            ? null
            : mustContainRhsColIndices
                .split(',')
                .map((e) => Number.parseFloat(e)),
          mustContainLhsColIndices: !mustContainLhsColIndices
            ? null
            : mustContainLhsColIndices
                .split(',')
                .map((e) => Number.parseFloat(e)),
        },
      },
    });
  }, [taskID, primitive, search, page, ordering, direction]);

  // todo add loading text/animation, maybe in Pagination component too
  const shownData = (loading ? previousData : data) || defaultData;
  const recordsCount =
    shownData?.taskInfo.data.result?.__typename === 'FDTaskResult' &&
    shownData?.taskInfo.data.result.filteredDeps.filteredDepsAmount;

  const deps = convertDependencies(primitive, shownData);

  return (
    <>
      <FormProvider {...methods}>
        {isOrderingShown && (
          <OrderingWindow
            {...{
              setIsOrderingShown,
              primitive: primitive || PrimitiveType.FD,
            }}
          />
        )}

        {isFilteringShown && (
          <FilteringWindow
            {...{
              setIsFilteringShown,
            }}
          />
        )}
      </FormProvider>

      <h5>Primitive List</h5>

      <div className={styles.filters}>
        <Text
          label="Search"
          placeholder="Attribute name or regex"
          {...register('search')}
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
          onChange={(n) => setFilterParam('page', n)}
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
