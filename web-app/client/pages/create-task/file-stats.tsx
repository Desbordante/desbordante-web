import type { GetServerSideProps, NextPage } from "next";
import { WizardLayout } from "@components/WizardLayout/WizardLayout";
import styles from "@styles/FileStats.module.scss";
import { ColumnCard } from "@components/FileStats/ColumnCard";
import { OverviewCard } from "@components/FileStats/OverviewCard";
import { Group } from "@components/FileStats/Group";
import { StatType } from "@/types/fileStats";
import { getFileStats_fileStats } from "@graphql/operations/queries/__generated__/getFileStats";

type FileStatsProps = {
  overview: StatType[];
  columns: getFileStats_fileStats[];
  name: string;
};

type FileStatsQuery = {
  fileId: string;
};

export const getServerSideProps: GetServerSideProps<
  FileStatsProps,
  FileStatsQuery
> = async (context) => {
  const overview: StatType[] = [
    { name: "Number of columns", value: 12 },
    { name: "Numeric", value: 5 },
    { name: "Categorical", value: 7 },
  ];

  const columns: getFileStats_fileStats[] = [...Array(10)].map((_, index) => ({
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
  }));

  return {
    props: {
      overview,
      columns,
      name: `EpicMeds.csv ${(context.query as FileStatsQuery).fileId}`,
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
