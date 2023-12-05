import DivisionIcon from '@assets/icons/division.svg?component';
import MinusIcon from '@assets/icons/minus.svg?component';
import MultiplicationIcon from '@assets/icons/multiplication.svg?component';
import PlusIcon from '@assets/icons/plus.svg?component';

import Button from '@components/Button';
import { NumberInput } from '@components/Inputs';
import { NumberInputProps } from '@components/Inputs/NumberInput/NumberInput';
import { ReportsLayout } from '@components/ReportsLayout/ReportsLayout';
import { TaskContextProvider } from '@components/TaskContext';
import styles from '@styles/Histogram.module.scss';
import React from 'react';
import { ReactElement, useState } from 'react';
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { NextPageWithLayout } from 'types/pageWithLayout';

const myData = {
  taskInfo: {
    __typename: 'TaskInfo',
    taskID: '22fcfc02-de6e-4e4b-b75d-16e3881f68ad',
    data: {
      __typename: 'ACTaskData',
      operation: 'ADDITION',
      histogramData: {
        __typename: 'ACHistogramData',
        taskID: '22fcfc02-de6e-4e4b-b75d-16e3881f68ad',
        barsAmount: 6,
        granularity: 10,
        attributes: {
          __typename: 'Attributes',
          attr1: 'Coffee',
          attr2: 'Milk',
        },
        data: [
          {
            __typename: 'ACHistogramBar',
            interval: [0, 1],
            mediana: 0.5,
            value: 3,
            option: 'exception',
            associated: null,
          },
          {
            __typename: 'ACHistogramBar',
            interval: [1, 2],
            mediana: 1.5,
            value: 8,
            option: 'default',
            associated: [1, 4],
          },
          {
            __typename: 'ACHistogramBar',
            interval: [2, 3],
            mediana: 2.5,
            value: 10,
            option: 'default',
            associated: [1, 4],
          },
          {
            __typename: 'ACHistogramBar',
            interval: [3, 4],
            mediana: 3.5,
            value: 9,
            option: 'default',
            associated: [1, 4],
          },
          {
            __typename: 'ACHistogramBar',
            interval: [4, 5],
            mediana: 4.5,
            value: 11,
            option: 'exception',
            associated: null,
          },
          {
            __typename: 'ACHistogramBar',
            interval: [5, 6],
            mediana: 5.5,
            value: null,
            option: 'exception',
            associated: null,
          },
          {
            __typename: 'ACHistogramBar',
            interval: [6, 7],
            mediana: 6.5,
            value: 1,
            option: 'exception',
            associated: null,
          },
          {
            __typename: 'ACHistogramBar',
            interval: [7, 8],
            mediana: 7.5,
            value: 4,
            option: 'default',
            associated: [7, 8],
          },
          {
            __typename: 'ACHistogramBar',
            interval: [8, 9],
            mediana: 8.5,
            value: 2,
            option: 'exception',
            associated: null,
          },
        ],
      },
    },
  },
};

const ReportsHistogram: NextPageWithLayout = () => {
  const [activeInterval, setActiveInterval] = useState(null);

  const renderActiveBar = (props: any) => {
    const { x, y, width, height } = props;
    const color = props.payload.option === 'default' ? '#7600D1' : '#808080';

    return <Rectangle x={x} y={y} width={width} height={height} fill={color} />;
  };

  const CustomTooltip = (props: any) => {
    if (props.payload && props.payload.length) {
      const associated = props.payload[0].payload.associated;
      const interval = props.payload[0].payload.interval;
      return (
        <div className={styles.customTooltip}>
          <p>{`Range: [${interval[0]}, ${interval[1]}]`}</p>
          <p>{'Values in range: ' + props.payload[0].payload.value}</p>
          {props.payload[0].payload.option === 'default' && (
            <p>{`Associated interval: [${associated[0]}, ${associated[1]}]`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const data = myData.taskInfo.data.histogramData.data;
  const operation = myData.taskInfo.data.operation;
  const attributes = myData.taskInfo.data.histogramData.attributes;

  const operationIcon =
    (operation === 'ADDITION' && <PlusIcon className={styles.icons} />) ||
    (operation === 'MULTIPLICATION' && (
      <MultiplicationIcon className={styles.icons} />
    )) ||
    (operation === 'DIVISION' && <DivisionIcon className={styles.icons} />) ||
    (operation === 'SUBTRACTION' && <MinusIcon className={styles.icons} />);

  const numberProps: NumberInputProps = {
    defaultNum: myData.taskInfo.data.histogramData.granularity,
  };

  return (
    <>
      <div className={styles.header}>
        <div>
          Granularity
          <div className={styles.attributes}>
            <NumberInput
              numberProps={numberProps}
              value={myData.taskInfo.data.histogramData.granularity}
              onChange={() => {}}
            />
            <Button variant="secondary">Change</Button>
          </div>
        </div>
        <div className={styles.attributes}>
          <div className={styles.attr}>{attributes.attr1}</div>
          {operationIcon}
          <div className={styles.attr}>{attributes.attr2}</div>
        </div>
      </div>

      <ResponsiveContainer width="80%" height="80%">
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
            onMouseEnter={(props) => setActiveInterval(props.associated)}
            onMouseLeave={() => setActiveInterval(null)}
            dataKey="value"
            activeBar={renderActiveBar}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  activeInterval &&
                  entry.associated &&
                  entry.associated[0] === activeInterval[0] &&
                  entry.associated[1] === activeInterval[1]
                    ? '#9840dd'
                    : entry.option == 'default'
                    ? '#404040'
                    : '#bfbfbf'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
