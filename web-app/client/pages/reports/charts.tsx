import { ReactElement, useContext, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  getPieChartData,
  getPieChartDataVariables,
} from '@graphql/operations/queries/__generated__/getPieChartData';
import { GET_PIE_CHART_DATA } from '@graphql/operations/queries/getPieChartData';
import { ReportsLayout } from '@components/ReportsLayout/ReportsLayout';
import LayeredChart from '@components/Chart/LayeredChart';
import { TaskContextProvider, useTaskContext } from '@components/TaskContext';
import { NextPageWithLayout } from '@pages/_app';
import styles from 'styles/Charts.module.scss';

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
  const { taskID } = useTaskContext();

  const { loading, data, error } = useQuery<
    getPieChartData,
    getPieChartDataVariables
  >(GET_PIE_CHART_DATA, { variables: { taskID } });

  const { lhs, rhs } = getChartData(data);

  const [selectedLeftAttributeIndices, setSelectedLeftAttributeIndices] =
    useState<number[]>([]);

  const [selectedRightAttributeIndices, setSelectedRightAttributeIndices] =
    useState<number[]>([]);

  return (
    <div className={styles.container}>
      {loading && <h5>Loading..</h5>}
      <LayeredChart
        title="Left-hand side"
        attributes={lhs}
        displayAttributes={lhs}
        {...{
          selectedAttributeIndices: selectedLeftAttributeIndices,
          setSelectedAttributeIndices: setSelectedLeftAttributeIndices,
        }}
      />

      <LayeredChart
        title="Right-hand side"
        attributes={rhs}
        displayAttributes={rhs}
        {...{
          selectedAttributeIndices: selectedRightAttributeIndices,
          setSelectedAttributeIndices: setSelectedRightAttributeIndices,
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
