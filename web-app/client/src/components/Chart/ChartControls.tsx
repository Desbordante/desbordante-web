import { FC } from 'react';
import collapseChartIcon from '@assets/icons/collapse-chart.svg';
import Button from '@components/Button';
import { Text } from '@components/Inputs';
import styles from './ChartControls.module.scss';

type Props = {
  depth: number;
  setDepth: (depth: number) => void;
  search: string;
  setSearch: (s: string) => void;
};

export const ChartControls: FC<Props> = ({
  depth,
  setDepth,
  search,
  setSearch,
}) => {
  return (
    <div className={styles.controls}>
      <Text
        label="Search"
        placeholder="Attribute name or index"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      {depth > 0 && (
        <Button
          variant="secondary"
          size="sm"
          icon={collapseChartIcon}
          onClick={() => setDepth(Math.max(0, depth - 1))}
        >
          Collapse this layer
        </Button>
      )}
    </div>
  );
};
