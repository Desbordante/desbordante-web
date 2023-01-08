import _ from 'lodash';
import { useRouter } from 'next/router';
import React, {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import EyeIcon from '@assets/icons/eye.svg?component';
import OrderingIcon from '@assets/icons/ordering.svg?component';
import { MFDHighlight } from '@atoms/MFDTaskAtom';
import Button from '@components/Button';

import { ControlledSelect } from '@components/Inputs/Select';
import ListPropertiesModal from '@components/ListPropertiesModal';
import Pagination from '@components/Pagination/Pagination';
import ReportsLayout from '@components/ReportsLayout';

import Table, {
  Row,
  ScrollDirection,
  TableProps,
} from '@components/ScrollableNodeTable';
import { MFDTable } from '@components/ScrollableNodeTable/implementations/MFDTable';
import useMFDHighlight from '@hooks/useMFDHighlight';
import useMFDTask from '@hooks/useMFDTask';
import styles from '@styles/MetricDependencies.module.scss';

import { MFDSortBy, OrderBy, PrimitiveType } from 'types/globalTypes';

import { NextPageWithLayout } from 'types/pageWithLayout';

type InsertedRow =
  | {
      position: number;
      data: MFDHighlight;
    }
  | undefined;

const ReportsMFD: NextPageWithLayout = () => {
  const defaultLimit = 150;
  const defaultOffsetDifference = 50;

  const router = useRouter();
  const taskID = router.query.taskID as string;

  const [scrollingEnabled, setScrollingEnabled] = useState(true);
  const [clusterIndex, setClusterIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(defaultLimit);
  const [sortBy, setSortBy] = useState(MFDSortBy.FURTHEST_POINT_INDEX);
  // TODO: Add direction of sorting

  const { data, loading, error } = useMFDTask(
    taskID,
    clusterIndex,
    offset,
    limit,
    sortBy
  );

  useEffect(() => {
    if (!loading && !error && data) {
      setScrollingEnabled(true);
    }
  }, [data, error, loading]);

  const [isOrderingShown, setIsOrderingShown] = useState(false);
  const [showFullValue, setShowFullValue] = useState(false);

  const [isInserted, setIsInserted] = useState(false);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const [RowIndex, setRowIndex] = useState(0);
  const [furthestData, setFurthestData] = useState(undefined as InsertedRow);

  const [
    loadMFDHighlight,
    { loading: highlightLoading, error: highlightError, data: highlightData },
  ] = useMFDHighlight();

  useEffect(() => {
    if (isInserted) {
      if (
        highlightData &&
        highlightData?.taskInfo?.data.__typename === 'SpecificTaskData' &&
        highlightData?.taskInfo.data.result?.__typename === 'MFDTaskResult' &&
        highlightData.taskInfo.data.result.__typename === 'MFDTaskResult' &&
        highlightData.taskInfo.data.result.cluster &&
        highlightData.taskInfo.data.result.cluster.highlights.length > 0
      ) {
        const highlight =
          highlightData.taskInfo.data.result.cluster.highlights[0];

        setFurthestData({
          position: RowIndex,
          data: {
            index: highlight.index,
            rowIndex: data.cluster.highlightsTotalCount + 1,
            withinLimit: highlight.withinLimit,
            maximumDistance: highlight.maximumDistance,
            furthestPointIndex: highlight.furthestPointIndex,
            value: highlight.value,
          },
        });
      } else {
        setFurthestData(undefined);
      }
    } else {
      setFurthestData(undefined);
    }
  }, [
    isInserted,
    highlightData,
    RowIndex,
    furthestIndex,
    data.cluster.highlightsTotalCount,
  ]);

  const insertRow = useCallback(
    (furthestIndex: number, rowIndex: number) => {
      setFurthestIndex(furthestIndex);
      setRowIndex(rowIndex);
      setIsInserted(true);
      loadMFDHighlight({
        // TODO: Wait for backend to implement getting highlight by index
        variables: { taskID, clusterIndex, pointIndex: furthestIndex },
      });
    },
    [loadMFDHighlight, taskID, clusterIndex]
  );

  const closeInsertedRow = useCallback(() => {
    setIsInserted(false);
  }, []);

  // TEST DATA
  const tableData: MFDHighlight[] = [...Array(150)].map(
    (_, i) =>
      ({
        index: i + offset,
        rowIndex: i + offset,
        withinLimit: !!(i % 2),
        maximumDistance: 1,
        furthestPointIndex: 1,
        value: '' + i,
      } as MFDHighlight)
  );

  console.log(offset);

  // console.log(tableData);
  // TODO: test this with test data
  // we have buffer of 150 rows, and we offset by 50 rows
  const onScroll = useCallback(
    (direction: ScrollDirection) => {
      if (scrollingEnabled) {
        console.log(scrollingEnabled, direction);
        // forbid scrolling until data is loaded
        setScrollingEnabled(false);
        // if direction is 'up'
        if (direction === 'up') {
          // and offset is bigger than 50
          if (offset - defaultOffsetDifference > 0) {
            // decrease offset by 50
            setOffset((offset) => offset - defaultOffsetDifference);
          }
          // and offset is less than 50
          else {
            // snap to the top
            setOffset(0);
          }
        }
        // if direction is 'down'
        if (direction === 'down') {
          // and offset + 150 don't exceed the total number of rows
          if (offset + defaultLimit < data.cluster.highlightsTotalCount) {
            // increase offset by 50
            setOffset((offset) => offset + defaultOffsetDifference);
          }
          // and if offset + 150 exceed the total number of rows we do nothing because we already have buffer of 150 rows
        }
      }
    },
    [data.cluster.highlightsTotalCount, offset, scrollingEnabled]
  );

  // console.log(data);

  return (
    <>
      {isOrderingShown && (
        <OrderingWindow
          setIsOrderingShown={setIsOrderingShown}
          setSortBy={setSortBy}
        />
      )}

      {/* If data is not loaded yet show template */}
      {data.result === undefined && <ReportFiller title={'Loading'} />}
      {/* If data is loaded yet show actual data */}
      {data.result !== undefined && (
        <>
          {data.result && (
            <ReportFiller
              title={'No clusters have been discovered'}
              description={
                'This indicates that the metric dependency holds. Try restarting the task with different parameters'
              }
            />
          )}
          {!data.result && (
            <div className={styles.clustersContainer}>
              <h5>Clusters</h5>

              <div className={styles.filters}>
                <div className={styles.buttons}>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<OrderingIcon />}
                    onClick={() => setIsOrderingShown(true)}
                  >
                    Ordering
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<EyeIcon />}
                    onClick={() => setShowFullValue((e) => !e)}
                  >
                    {showFullValue ? 'Hide' : 'Show'} full value
                  </Button>
                </div>
              </div>

              <h6>Cluster value: {data.cluster.value || 'loading'}</h6>

              <MFDTable
                totalCount={data.clustersTotalCount}
                highlights={data.cluster.highlights}
                onScroll={onScroll}
                isFullValueShown={showFullValue}
                insertedRow={furthestData}
                insertRow={insertRow}
                closeInsertedRow={closeInsertedRow}
                className={styles.table}
              />

              {data.clustersTotalCount && (
                <Pagination
                  count={data.clustersTotalCount}
                  current={clusterIndex + 1}
                  onChange={(page) => {
                    setClusterIndex(page - 1);
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

ReportsMFD.getLayout = function getLayout(page: ReactElement) {
  return <ReportsLayout>{page}</ReportsLayout>;
};

type ReportFillerProps = {
  title: string;
  description?: string;
};

const ReportFiller: FC<ReportFillerProps> = ({ title, description }) => {
  return (
    <div className={styles.container}>
      <div className={styles.filler}>
        <h6>{title}</h6>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
};

type OrderingProps = {
  setIsOrderingShown: (arg: boolean) => void;
  setSortBy: (arg: MFDSortBy) => void;
};

type SortingProps = {
  ordering: MFDSortBy;
};

const OrderingWindow: FC<OrderingProps> = ({
  setIsOrderingShown,
  setSortBy,
}) => {
  const orderingOptions = [
    { value: MFDSortBy.FURTHEST_POINT_INDEX, label: 'Furthest point index' },
    { value: MFDSortBy.POINT_INDEX, label: 'Point index' },
    { value: MFDSortBy.MAXIMUM_DISTANCE, label: 'Maximum distance' },
  ];

  // const directionOptions = {
  //   [OrderBy.ASC]: { value: OrderBy.ASC, label: 'Ascending' },
  //   [OrderBy.DESC]: { value: OrderBy.DESC, label: 'Descending' },
  // };

  const { control, watch, reset } = useForm<SortingProps>({
    defaultValues: {
      ordering: MFDSortBy.FURTHEST_POINT_INDEX,
      // direction: baseForm.watch('direction'),
    },
  });

  const { ordering } = watch();

  // TODO: Fix "value.match..." error when changing form parameter (this error is present on deployed version, btw)
  return (
    <ListPropertiesModal
      name="Ordering"
      onClose={() => {
        reset();
        setIsOrderingShown(false);
      }}
      onApply={() => {
        setSortBy(ordering);
        // baseForm.setValue('direction', direction);
        setIsOrderingShown(false);
      }}
    >
      <ControlledSelect
        control={control}
        controlName="ordering"
        label="Order by"
        options={_.values(orderingOptions)}
      />
    </ListPropertiesModal>
  );
};

export default ReportsMFD;
