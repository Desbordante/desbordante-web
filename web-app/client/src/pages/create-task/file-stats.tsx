import type { GetServerSideProps, NextPage } from 'next';
import { ColumnCard } from '@components/FileStats/ColumnCard';
import { Group } from '@components/FileStats/Group';
import { OverviewCard } from '@components/FileStats/OverviewCard';
import { WizardLayout } from '@components/WizardLayout/WizardLayout';
import client from '@graphql/client';
import {
  getFileStats,
  getFileStats_datasetInfo_statsInfo_stats as ColumnStats,
  getFileStatsVariables,
} from '@graphql/operations/queries/__generated__/getFileStats';
import { GET_FILE_STATS } from '@graphql/operations/queries/getFileStats';
import styles from '@styles/FileStats.module.scss';
import { getOverview } from '@utils/fileStats';
import { StatType } from 'types/fileStats';

type FileStatsProps = {
  overview: StatType[];
  columns: ColumnStats[];
  name: string;
};

type FileStatsQuery = {
  fileID: string;
};

export const getServerSideProps: GetServerSideProps<
  FileStatsProps,
  FileStatsQuery
> = async (context) => {
  const { data } = await client.query<getFileStats, getFileStatsVariables>({
    query: GET_FILE_STATS,
    variables: {
      fileID: (context.query as FileStatsQuery).fileID,
    },
    errorPolicy: 'all',
    context: {
      headers: context.req.headers,
    },
  });

  const file = data?.datasetInfo;

  if (!file)
    return {
      notFound: true,
    };

  const overview: StatType[] = getOverview(file);

  const columns: ColumnStats[] = file.statsInfo.stats;

  return {
    props: {
      overview,
      columns,
      name: file.fileName,
    },
  };
};

const FileStats: NextPage<FileStatsProps> = ({
  name,
  overview,
  columns,
}: FileStatsProps) => {
  const header = (
    <>
      <h2 className={styles.title}>{name}</h2>
    </>
  );
  return (
    <WizardLayout header={header} footer={<></>}>
      <Group header="Overview" className={styles.overview}>
        <OverviewCard stats={overview} />
      </Group>
      <Group header="Columns" className={styles.columns}>
        {columns.map((column) => (
          <ColumnCard key={column.column.index} columnStats={column} />
        ))}
      </Group>
    </WizardLayout>
  );
};

export default FileStats;
