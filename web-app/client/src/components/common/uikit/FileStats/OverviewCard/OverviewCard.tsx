import { FC } from 'react';
import { useToggle } from '@components/common/uikit//FileStats/hooks';
import { ModeButton } from '@components/common/uikit//FileStats/ModeButton';
import { Paper } from '@components/common/uikit//FileStats/Paper';
import { StatsBlock } from '@components/common/uikit//FileStats/StatsBlock';
import { StatType } from 'types/fileStats';
import styles from './OverviewCard.module.scss';

type OverflowCardProps = {
  stats: StatType[];
};

export const OverviewCard: FC<OverflowCardProps> = ({
  stats,
}: OverflowCardProps) => {
  const [tableMode, toggleMode] = useToggle(false);

  return (
    <Paper className={styles.wrapper}>
      <StatsBlock stats={stats} tableMode={tableMode} size="xl" />
      <ModeButton tableMode={tableMode} onClick={toggleMode} />
    </Paper>
  );
};
