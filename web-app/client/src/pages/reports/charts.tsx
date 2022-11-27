import { useQuery } from '@apollo/client';
import { ReactElement } from 'react';
import LayeredChart from '@components/Chart/LayeredChart';
import { ReportsLayout } from '@components/ReportsLayout/ReportsLayout';
import { TaskContextProvider, useTaskContext } from '@components/TaskContext';
import {
  getPieChartData,
  getPieChartDataVariables,
} from '@graphql/operations/queries/__generated__/getPieChartData';
import { GET_PIE_CHART_DATA } from '@graphql/operations/queries/getPieChartData';
import styles from '@styles/Charts.module.scss';
import { NextPageWithLayout } from 'types/pageWithLayout';

const getChartData = (data?: getPieChartData) => {
  if (
    data &&
    'pieChartData' in data.taskInfo.data &&
    data.taskInfo.data.pieChartData
  ) {
    const pieData = data.taskInfo.data.pieChartData;
    if ('FD' in pieData) return pieData.FD.withoutPatterns;
    if ('CFD' in pieData) return pieData.CFD.withoutPatterns;
  }
  return { lhs: [], rhs: [] };
};

const ReportsCharts: NextPageWithLayout = () => {
  const { taskID, dependenciesFilter, setDependenciesFilter } =
    useTaskContext();

  const { loading, data } = useQuery<getPieChartData, getPieChartDataVariables>(
    GET_PIE_CHART_DATA,
    { variables: { taskID } }
  );

  const { lhs, rhs } = getChartData(data);

  return (
    <div className={styles.container}>
      {loading && <h5>Loading..</h5>}
      <LayeredChart
        title="Left-hand side"
        attributes={lhs}
        {...{
          selectedAttributeIndices: dependenciesFilter.lhs,
          setSelectedAttributeIndices: (lhs) =>
            setDependenciesFilter(({ rhs }) => ({ rhs, lhs })),
        }}
      />

      <LayeredChart
        title="Right-hand side"
        attributes={rhs}
        {...{
          selectedAttributeIndices: dependenciesFilter.rhs,
          setSelectedAttributeIndices: (rhs) =>
            setDependenciesFilter(({ lhs }) => ({ rhs, lhs })),
        }}
      />
    </div>
  );
};

ReportsCharts.getLayout = function getLayout(page: ReactElement) {
  return (
    <TaskContextProvider>
      <ReportsLayout>{page}</ReportsLayout>
    </TaskContextProvider>
  );
};

export default ReportsCharts;
