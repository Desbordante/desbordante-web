import { GetServerSideProps } from 'next';
import { ReactElement } from 'react';
import { ReportsLayout } from '@components/ReportsLayout/ReportsLayout';
import { TaskContextProvider } from '@components/TaskContext';
import client from '@graphql/client';
import {
  getDataset,
  getDataset_taskInfo_dataset_snippet,
  getDatasetVariables,
} from '@graphql/operations/queries/__generated__/getDataset';
import { GET_DATASET } from '@graphql/operations/queries/getDataset';
import { NextPageWithLayout } from 'types/pageWithLayout';

type Snippet = getDataset_taskInfo_dataset_snippet;

interface Props {
  dataset?: Snippet;
}

const ReportsSnippet: NextPageWithLayout<Props> = ({ dataset }) => {
  console.log(dataset);

  return <div></div>;
};

ReportsSnippet.getLayout = function getLayout(page: ReactElement) {
  return (
    <TaskContextProvider>
      <ReportsLayout>{page}</ReportsLayout>
    </TaskContextProvider>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const taskID = context.query.taskID;
  if (!taskID || typeof taskID !== 'string') {
    return {
      notFound: true,
    };
  }

  const { data } = await client.query<getDataset, getDatasetVariables>({
    query: GET_DATASET,
    variables: {
      taskID,
      pagination: {
        offset: 0,
        limit: 60,
      },
    },
  });

  return {
    props: {
      dataset: data.taskInfo.dataset?.snippet,
    },
  };
};

export default ReportsSnippet;
