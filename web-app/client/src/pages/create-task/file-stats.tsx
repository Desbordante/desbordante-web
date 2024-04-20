import { useQuery } from '@apollo/client';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ColumnCard } from '@components/FileStats/ColumnCard';
import { Group } from '@components/FileStats/Group';
import { OverviewCard } from '@components/FileStats/OverviewCard';
import WizardLayout from '@components/WizardLayout/WizardLayout';
import {
  getFileStats,
  getFileStatsVariables,
} from '@graphql/operations/queries/__generated__/getFileStats';
import { GET_FILE_STATS } from '@graphql/operations/queries/getFileStats';
import styles from '@styles/FileStats.module.scss';
import { getOverview } from '@utils/fileStats';
import { StatType } from 'types/fileStats';

const FileStats: NextPage = () => {
  const router = useRouter();
  const { data } = useQuery<getFileStats, getFileStatsVariables>(
    GET_FILE_STATS,
    {
      variables: {
        fileID: router.query.fileID as string,
      },
    },
  );

  if (!data) {
    return null;
  }

  const { datasetInfo: file } = data;
  const {
    originalFileName: name,
    statsInfo: { stats },
  } = file;

  const overview: StatType[] = getOverview(file);

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
        {stats.map((stat) => (
          <ColumnCard key={stat.column.index} columnStats={stat} />
        ))}
      </Group>
    </WizardLayout>
  );
};

export default FileStats;
