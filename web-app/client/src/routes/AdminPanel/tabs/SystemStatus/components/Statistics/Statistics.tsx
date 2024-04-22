import { useQuery } from '@apollo/client';
import { FC } from 'react';
import colors from '@constants/colors';
import { getStatistics } from '@graphql/operations/queries/__generated__/getStatistics';
import { GET_STATISTICS } from '@graphql/operations/queries/getStatistics';
import UsageChart from '../UsageChart';
import styles from './Statistics.module.scss';

const toGigabytes = (bytes: number) => +(bytes / 2 ** 30).toFixed(2);

const Statistics: FC = () => {
  const { data } = useQuery<getStatistics>(GET_STATISTICS);

  const statistics = data?.statistics;

  if (!statistics) {
    return null;
  }

  return (
    <section className={styles.statistics}>
      <h5 className={styles.title}>Statistics</h5>
      <div className={styles.charts}>
        <UsageChart
          title="Disk usage (GiB)"
          defaultSelectedKey="used"
          items={[
            {
              key: 'used',
              label: 'Used',
              value: toGigabytes(statistics.space?.used ?? 0),
              color: colors.primary[100],
            },
          ]}
          capacity={statistics.space?.all}
        />
        <UsageChart
          title="Files"
          defaultSelectedKey="uploaded"
          items={[
            {
              key: 'uploaded',
              label: 'Uploaded',
              value: statistics.files?.builtIn ?? 0,
              color: colors.primary[100],
            },
          ]}
          capacity={statistics.files?.all}
        />
        <UsageChart
          title="Tasks"
          defaultSelectedKey="completed"
          items={[
            {
              key: 'completed',
              label: 'Completed',
              value: statistics.tasks?.completed ?? 0,
              color: colors.success[100],
            },
            {
              key: 'failed',
              label: 'Failed',
              value: statistics.tasks?.failed ?? 0,
              color: colors.error[100],
            },
            {
              key: 'queued',
              label: 'Queued',
              value: statistics.tasks?.queued ?? 0,
              color: colors.info[100],
            },
            {
              key: 'in-progress',
              label: 'In progress',
              value: statistics.tasks?.inProgress ?? 0,
              color: colors.primary[100],
            },
          ]}
        />
        <UsageChart
          title="Users"
          defaultSelectedKey="active"
          items={[
            {
              key: 'active',
              label: 'Active',
              value: statistics.users?.active ?? 0,
              color: colors.primary[100],
            },
          ]}
          capacity={statistics.users?.all}
        />
      </div>
    </section>
  );
};

export default Statistics;
