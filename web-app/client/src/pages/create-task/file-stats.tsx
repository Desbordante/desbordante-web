import type { GetServerSideProps, NextPage } from 'next';
import { WizardLayout } from '@components/WizardLayout/WizardLayout';
import styles from '@styles/FileStats.module.scss';
import { ColumnCard } from '@components/FileStats/ColumnCard';
import { OverviewCard } from '@components/FileStats/OverviewCard';
import { Group } from '@components/FileStats/Group';
import { StatType } from 'types/fileStats';
import {
  getFileStats,
  getFileStats_datasetInfo_stats as FileStats,
  getFileStatsVariables,
} from '@graphql/operations/queries/__generated__/getFileStats';
import client from '@graphql/client';
import { GET_FILE_STATS } from '@graphql/operations/queries/getFileStats';
import { getOverview } from '@utils/fileStats';

type FileStatsProps = {
  overview: StatType[];
  columns: FileStats[];
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
  });

  const file = data?.datasetInfo;

  if (!file)
    return {
      notFound: true,
    };

  const overview: StatType[] = getOverview(file);

  const columns: FileStats[] = file.stats;

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
          <ColumnCard key={column.columnIndex} column={column} />
        ))}
      </Group>
    </WizardLayout>
  );
};

export default FileStats;
