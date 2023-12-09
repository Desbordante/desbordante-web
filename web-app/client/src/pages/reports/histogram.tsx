import { Operation } from '@graphql/operations/queries/__generated__/GetMainTaskDeps';
import { ReactElement, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { NextPageWithLayout } from 'types/pageWithLayout';

import styles from '@styles/Histogram.module.scss';
import { colors } from '@styles/common/variables';

import { operationIcons } from '@components/ACInstance/ACInstance';
import Button from '@components/Button';
import { NumberInput } from '@components/Inputs';
import { NumberInputProps } from '@components/Inputs/NumberInput/NumberInput';
import { ReportsLayout } from '@components/ReportsLayout/ReportsLayout';
import { TaskContextProvider } from '@components/TaskContext';

import { myData } from './ACFakeData/data4Histogram';
import NumberInputWithButton from '@components/NumberInputWithButton';

const CustomTooltip = (props: any) => {
  const { payload } = props;
  if (payload && payload.length) {
    const { associatedInterval, range, option, valuesInRange } =
      payload[0].payload;
    return (
      <div className={styles.customTooltip}>
        <p>{`Range: [${range[0]}, ${range[1]}]`}</p>
        <p>{'Values in range: ' + valuesInRange}</p>
        {option === 'default' && (
          <p>{`Associated interval: [${associatedInterval[0]}, ${associatedInterval[1]}]`}</p>
        )}
      </div>
    );
  }
};

const renderActiveBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  const color =
    payload.option === 'default' ? colors.primary[100] : colors.black[50];

  return (
    <Rectangle
      x={Number(x)}
      y={Number(y)}
      width={width}
      height={height}
      fill={color}
    />
  );
};

interface shownDataType {
  range: number[];
  mediana: number;
  valuesInRange: number;
  option: 'default' | 'outlier';
  associatedInterval: number[];
}

const ReportsHistogram: NextPageWithLayout = () => {
  const [activeInterval, setActiveInterval] = useState(null);
  const { operation, histogramData } = myData.taskInfo.data;
  const { attributes, granularity } = histogramData;

  const OperationIcon = operationIcons[operation as Operation];

  const numberProps: NumberInputProps = {
    defaultNum: granularity,
    min: 1,
    includingMin: true,
    numbersAfterDot: 0,
  };

  const data = myData.taskInfo.data.histogramData.data.map(
    (elem) =>
      ({
        range: elem.range,
        mediana: (elem.range[0] + elem.range[1]) / 2,
        valuesInRange: elem.valuesInRange,
        option: elem.option,
        associatedInterval: elem.associatedInterval,
      }) as shownDataType,
  );

  const fillActiveBar = (entry: shownDataType) => {
    if (
      activeInterval &&
      entry.associatedInterval &&
      entry.associatedInterval[0] === activeInterval[0] &&
      entry.associatedInterval[1] === activeInterval[1]
    ) {
      return colors.primary[75];
    }
    if (entry.option === 'default') {
      return colors.black[75];
    }
    return colors.black[25];
  };

  return (
    <>
      <div className={styles.header}>
        <NumberInputWithButton numberProps={numberProps} buttonText='Change' label='Granularity' />
        <div className={styles.attributes}>
          <div className={styles.attribute}>{attributes.attribute1}</div>
          <OperationIcon className={styles.icons}/>
          <div className={styles.attribute}>{attributes.attribute2}</div>
        </div>
      </div>

      <div className={styles.histogramContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart barCategoryGap={2} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="mediana"
              type="number"
              domain={([dataMin, dataMax]) => [
                Math.floor(dataMin),
                Math.ceil(dataMax),
              ]}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              onMouseEnter={(props) =>
                setActiveInterval(props.associatedInterval)
              }
              onMouseLeave={() => setActiveInterval(null)}
              dataKey="valuesInRange"
              activeBar={renderActiveBar}
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.mediana}`}
                  fill={fillActiveBar(entry)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

ReportsHistogram.getLayout = function getLayout(page: ReactElement) {
  return (
    <TaskContextProvider>
      <ReportsLayout>{page}</ReportsLayout>
    </TaskContextProvider>
  );
};

export default ReportsHistogram;
