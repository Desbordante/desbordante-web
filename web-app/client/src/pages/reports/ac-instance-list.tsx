import OrderingIcon from '@assets/icons/ordering.svg?component';
import ACAtom, { ACAtomDefaultValuesWithParams } from '@atoms/ACTaskAtom';
import Button from '@components/Button';
import { OrderingWindow, useFilters } from '@components/Filters';
import { Text } from '@components/Inputs';
import Pagination from '@components/Pagination/Pagination';
import ReportsLayout from '@components/ReportsLayout';
import { TaskContextProvider } from '@components/TaskContext';
import Intervals from '@components/АС/Intervals/Intervals';
import { GetMainTaskDeps } from '@graphql/operations/queries/__generated__/GetMainTaskDeps';
import styles from '@styles/Dependencies.module.scss';
import { useAtom } from 'jotai';
import { ReactElement, useEffect, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import {
  ACSortBy,
  OrderBy,
  PrimitiveType,
} from 'types/globalTypes';
import { NextPageWithLayout } from 'types/pageWithLayout';

type Props = {
  defaultData?: GetMainTaskDeps;
};

const ReportsAlgebraicConstraints: NextPageWithLayout = () => {
  const myData: GetMainTaskDeps = {
    taskInfo: {
      __typename: 'TaskInfo',
      taskID: '22fcfc02-de6e-4e4b-b75d-16e3881f68ad',
      data: {
        __typename: 'ACTaskData',
        operation: 'ADDITION',
        result: {
          __typename: 'ACTaskResult',
          taskID: '22fcfc02-de6e-4e4b-b75d-16e3881f68ad',
          pairsAttributesAmount: 6,
          ACs: [
            {
              __typename: 'AC',
              attributes: {
                __typename: 'Attributes',
                attr1: 'Coffee',
                attr2: 'Milk',
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
                attr1: 'Milk',
                attr2: 'Chocolate',
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
                attr1: 'Coffee',
                attr2: 'Chocolate',
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
                attr1: 'Tea',
                attr2: 'Milk',
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
                attr1: 'Tea',
                attr2: 'Chocolate',
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
                attr1: 'Tea',
                attr2: 'Coffee',
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
  const [isOrderingShown, setIsOrderingShown] = useState(false);

  const primitive = PrimitiveType.AC;
  const methods = useFilters(primitive || PrimitiveType.FD);
  const { register, setValue: setFilterParam } = methods;
  /*const { search, page, ordering, direction } = watch();

  const [getDeps, { loading, data, previousData }] = useLazyQuery<
    GetMainTaskDeps,
    GetMainTaskDepsVariables
  >(GET_MAIN_TASK_DEPS);

  const [sortBy, setSortBy] = useState(ACSortBy.NUMBER_OF_INTERVALS);
  const [orderBy, setOrderBy] = useState(OrderBy.ASC);

  const filter = useMemo<IntersectionFilter>(() => {
    const sortingParams = {
      [PrimitiveType.AC + 'SortBy']: ordering,
    };

    return {
      filterString: search,
      pagination: { limit: 6, offset: (page - 1) * 6 },
      ...sortingParams,
      orderBy: direction,
    };
  }, [
    primitive,
    search,
    page,
    ordering,
    direction,
  ]);
  
  useEffect(() => {
    if (!primitive) return;

    getDeps({
      variables: {
        taskID,
        filter,
      },
    });
  }, [taskID, primitive, getDeps, filter]);*/

  // todo add loading text/animation, maybe in Pagination component too
  //const shownData = (loading ? previousData : data) || myData;
  const shownData = myData;
  const ACs =
    (shownData.taskInfo.data.result &&
      'ACs' in shownData.taskInfo.data.result &&
      shownData.taskInfo.data.result.ACs) ||
    [];
  const operation =
    ('operation' in shownData.taskInfo.data &&
      shownData.taskInfo.data.operation) ||
    'ADDITION';
  const recordsCount =
    shownData?.taskInfo.data.result &&
    'pairsAttributesAmount' in shownData?.taskInfo.data.result &&
    shownData?.taskInfo.data.result.pairsAttributesAmount;

  const [atom, setAtom] = useAtom(ACAtom);

  useEffect(() => {
    setAtom({
      ...ACAtomDefaultValuesWithParams(
        shownData.taskInfo.taskID,
        atom.instanceSelected,
      ),
    });
  }, [shownData.taskInfo.taskID]);
  return (
    <>
      <FormProvider {...methods}>
        {isOrderingShown && (
          <OrderingWindow
            {...{
              setIsOrderingShown,
              primitive: PrimitiveType.AC,
            }}
          />
        )}
      </FormProvider>

      <h5>Instance List</h5>

      <div className={styles.filters}>
        <Text
          label="Search"
          placeholder="Attribute name or regex"
          className={styles.search}
          {...register('search')}
        />
        <div className={styles.buttons}>
          <Button
            variant="secondary"
            size="md"
            icon={<OrderingIcon />}
            onClick={() => setIsOrderingShown(true)}
          >
            Ordering
          </Button>
          {/*primitive && <DownloadResult filter={filter} disabled={false} />*/}
        </div>
      </div>

      <div className={styles.rows}>
        {ACs.map((value, index) => (
          <Intervals
            key={index}
            attributes={value.attributes}
            operation={operation}
            intervals={value.intervals}
            outliers={value.outliers}
          />
        ))}
      </div>

      <div className={styles.pagination}>
        <Pagination
          onChange={(n) => setFilterParam('page', n)}
          current={1}
          count={Math.ceil((recordsCount || 6) / 6)}
        />
      </div>
    </>
  );
};

ReportsAlgebraicConstraints.getLayout = function getLayout(page: ReactElement) {
  return (
    <TaskContextProvider>
      <ReportsLayout>{page}</ReportsLayout>
    </TaskContextProvider>
  );
};

export default ReportsAlgebraicConstraints;
