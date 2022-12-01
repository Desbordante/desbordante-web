import { useLazyQuery } from '@apollo/client';
import { GetServerSideProps } from 'next';
import { ReactElement, useMemo, useRef, useState } from 'react';
import { ReportsLayout } from '@components/ReportsLayout/ReportsLayout';
import ScrollableTable from '@components/ScrollableTable';
import { TaskContextProvider, useTaskContext } from '@components/TaskContext';
import client from '@graphql/client';
import {
  getDataset,
  getDataset_taskInfo_dataset_snippet,
  getDatasetVariables,
} from '@graphql/operations/queries/__generated__/getDataset';
import { GET_DATASET } from '@graphql/operations/queries/getDataset';
import styles from '@styles/Snippet.module.scss';
import { NextPageWithLayout } from 'types/pageWithLayout';

type Snippet = getDataset_taskInfo_dataset_snippet;

interface Props {
  snippet: Snippet;
}

const paginationLimit = 30;
const ReportsSnippet: NextPageWithLayout<Props> = ({ snippet }) => {
  const { taskID, selectedDependency } = useTaskContext();
  const paginationOffset = useRef(0);
  const [getDataset] = useLazyQuery<getDataset, getDatasetVariables>(
    GET_DATASET
  );
  const [rows, setRows] = useState<string[][]>(snippet.rows);

  const handleScrollToBottom = async () => {
    paginationOffset.current += paginationLimit;
    const { data } = await getDataset({
      variables: {
        taskID,
        pagination: {
          offset: paginationOffset.current,
          limit: paginationLimit,
        },
      },
    });
    const newRows = data?.taskInfo.dataset?.snippet.rows;
    newRows && setRows((prev) => prev.concat(newRows));
  };

  const highlightedColumnIndices = useMemo(
    () => selectedDependency.map((attribute) => attribute.column.index),
    [selectedDependency]
  );

  return (
    <>
      <h5 className={styles.header}>Dataset Snippet</h5>
      <ScrollableTable
        className={styles.table}
        header={snippet.header}
        data={rows}
        highlightColumnIndices={highlightedColumnIndices}
        onScroll={handleScrollToBottom}
      />
    </>
  );
};

ReportsSnippet.getLayout = function getLayout(page: ReactElement) {
  return (
    <TaskContextProvider>
      <ReportsLayout pageClass={styles.page} containerClass={styles.container}>
        {page}
      </ReportsLayout>
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
        limit: paginationLimit,
      },
    },
  });

  const snippet = data.taskInfo.dataset?.snippet;

  if (!snippet) {
    return { notFound: true };
  }

  return {
    props: {
      snippet,
    },
  };
};

export default ReportsSnippet;
