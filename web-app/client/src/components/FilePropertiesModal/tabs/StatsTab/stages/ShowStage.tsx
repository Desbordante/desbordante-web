import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import Button from '@components/Button';
import { ColumnCard } from '@components/FileStats/ColumnCard';
import { Select } from '@components/Inputs';
import { getFileStats_datasetInfo } from '@graphql/operations/queries/__generated__/getFileStats';
import { ColumnOption } from 'types/fileStats';
import styles from '../StatsTab.module.scss';
import { Menu } from './Menu';
import { Option } from './Option';
import { Overview } from './Overview';
import { Stage } from './Stage';

type ShowStageProps = {
  datasetInfo: getFileStats_datasetInfo;
};

export const ShowStage: FC<ShowStageProps> = ({
  datasetInfo,
}: ShowStageProps) => {
  const router = useRouter();
  const [selectedColumn, setSelectedColumn] = useState(-1);

  const fileStats = datasetInfo.statsInfo.stats;

  const options: ColumnOption[] = [
    { value: -1, label: 'Overview' },
    ...fileStats.map((item) => ({
      value: item.column.index,
      label: item.column.name,
      type: item.type,
      isCategorical: !!item.isCategorical,
    })),
  ];

  const overview = <Overview datasetInfo={datasetInfo} />;

  return (
    <Stage
      buttons={
        <Button
          onClick={() =>
            router.push(`/create-task/file-stats?fileID=${datasetInfo.fileID}`)
          }
        >
          Show More
        </Button>
      }
    >
      <div className={styles.headerWithSelect}>
        <h5>Columns</h5>
        <Select
          isSearchable={false}
          value={options.find((option) => option.value === selectedColumn)}
          onChange={(e) => setSelectedColumn((e as ColumnOption).value)}
          options={options}
          components={{ Option, Menu }}
        />
      </div>

      {selectedColumn === -1 && overview}

      {selectedColumn !== -1 && (
        <ColumnCard
          data-testid="column-card"
          columnStats={
            fileStats.find((column) => column.column.index === selectedColumn)!
          }
          compact
        />
      )}
    </Stage>
  );
};
