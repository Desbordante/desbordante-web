import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { GET_TASK_INFO } from '@graphql/operations/queries/getTaskInfo';
import {
  getTaskInfo,
  getTaskInfoVariables,
} from '@graphql/operations/queries/__generated__/getTaskInfo';
import { useQuery } from '@apollo/client';
import { Doughnut } from 'react-chartjs-2';
import {
  getPieChartData,
  getPieChartDataVariables,
} from '@graphql/operations/queries/__generated__/getPieChartData';
import { GET_PIE_CHART_DATA } from '@graphql/operations/queries/getPieChartData';

const ReportsCharts: NextPage = () => {
  const router = useRouter();
  const taskID = router.query.taskID as string;

  const { loading, data, error } = useQuery<
    getPieChartData,
    getPieChartDataVariables
  >(GET_PIE_CHART_DATA, { variables: { taskID } });

  console.log(data);

  return <>{/* <Doughnut data={data?.taskInfo.data} /> */}</>;
};
export default ReportsCharts;
