import type { NextPage } from "next";
import { WizardLayout } from "@components/WizardLayout/WizardLayout";
import styles from "@styles/FileStats.module.scss";
import { ColumnCard } from "@components/FileStats/ColumnCard";
import { OverviewCard } from "@components/FileStats/OverviewCard";
import { Group } from "@components/FileStats/Group";

const FileStats: NextPage = () => {
  const header = (
    <>
      <h2 className={styles.title}>EpicMeds.csv</h2>
    </>
  );
  return (
    <WizardLayout header={header} footer={<></>}>
      <Group header="Overview" className={styles.overview}>
        <OverviewCard
          stats={[
            { name: "Number of columns", value: 12 },
            { name: "Numeric", value: 5 },
            { name: "Categorical", value: 7 },
          ]}
        />
      </Group>
      <Group header="Columns" className={styles.columns}>
        {[...Array(10)].map((value, index) => (
          <ColumnCard
            key={index}
            column={{
              __typename: "FileStats",
              fileID: "test",
              columnIndex: index,
              columnName: "Column A",
              distinct: 256,
              isCategorical: true,
              count: 1281731,
              avg: "9706.470388",
              STD: "7451.165309",
              skewness: "0.637135",
              kurtosis: "2.329082",
              min: "0",
              max: "28565",
              sum: "12441083997",
              quantile25: "3318",
              quantile50: "7993",
              quantile75: "14948",
            }}
          />
        ))}
      </Group>
    </WizardLayout>
  );
};

export default FileStats;
