import { FC } from 'react';
import CollapseChartIcon from '@assets/icons/collapse-chart.svg?component';
import Button from '@components/common/uikit/Button';
import { Text } from '@components/common/uikit/Inputs';
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
          icon={<CollapseChartIcon />}
          onClick={() => setDepth(Math.max(0, depth - 1))}
        >
          Collapse this layer
        </Button>
      )}
    </div>
  );
};
