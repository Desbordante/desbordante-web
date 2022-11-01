import { Column } from '@graphql/operations/fragments/__generated__/Column';
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { animated } from 'react-spring';
import classNames from 'classnames';
import { Chart as ChartJs, ArcElement } from 'chart.js';
import { ChartControls } from './ChartControls';
import styles from './LayeredChart.module.scss';
import { DepAttribute } from '@components/TaskContext';
ChartJs.register(ArcElement);

/* eslint-disable no-unused-vars */
export interface Props {
  attributes: DepAttribute[];
  selectedAttributeIndices: number[];
  setSelectedAttributeIndices: (n: number[]) => void;
  maxItemsShown?: number;
  title: string;
}

export const useControls = () => {
  const [depth, setDepth] = useState(0);
  const [search, setSearch] = useState('');
  return { depth, setDepth, search, setSearch };
};

// Get how much px is one rem, later used in chart dimensions
const rem =
  typeof window !== 'undefined'
    ? parseFloat(window.getComputedStyle(document.documentElement).fontSize)
    : 18;

const AnimatedDoughnut = animated(Doughnut);

/* eslint-enable no-unused-vars */

const Chart: React.FC<Props> = ({
  attributes,
  selectedAttributeIndices,
  setSelectedAttributeIndices,
  maxItemsShown = 4,
  title,
}) => {
  const [depth, setDepth] = useState(0);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [displayAttributes, setDisplayAttributes] = useState(attributes);

  const maxItemsSelected = 9;

  const selectAttribute = (attr: DepAttribute) =>
    setSelectedAttributeIndices(
      selectedAttributeIndices.concat(attr.column.index)
    );

  const removeAttribute = (attr: DepAttribute) =>
    setSelectedAttributeIndices(
      selectedAttributeIndices.filter((index) => index !== attr.column.index)
    );

  useEffect(() => {
    // filtering and splitting dataset into layers
    const foundAttributes = attributes
      .filter((attr) => attr.column.name.includes(search))
      .filter((attr) => !selectedAttributeIndices.includes(attr.column.index))
      .sort((a, b) => b.value - a.value);

    const newDisplayAttributes = foundAttributes.slice(
      maxItemsShown * depth,
      maxItemsShown * (depth + 1)
    );

    const newOtherValue = foundAttributes
      .slice(maxItemsShown * (depth + 1))
      .reduce((sum, attr) => sum + attr.value, 0);

    if (foundAttributes.length > maxItemsShown * (depth + 1)) {
      newDisplayAttributes.push({
        column: {
          name: 'Other',
          index: -1,
          __typename: 'Column',
        },
        value: newOtherValue,
      });
    }
    setDisplayAttributes(newDisplayAttributes);
  }, [search, depth, attributes.length, selectedAttributeIndices]);

  const handleSelect = (_: any, item: Column[]) => {
    if (!item.length) {
      return;
    }
    if (item[0].index === maxItemsShown) {
      setDepth(depth + 1);
    } else if (selectedAttributeIndices.length < maxItemsSelected) {
      selectAttribute(displayAttributes[item[0].index]);
    }
  };

  return (
    <div className={styles.container}>
      <h5>{title}</h5>
      <ChartControls {...{ depth, setDepth, search, setSearch }} />
      <div className={styles.chart}>
        <ul className={styles.labels}>
          {displayAttributes
            .filter((attr) => attr.value)
            .map((attr, index) => (
              <li
                key={index}
                className={classNames(index === highlightIndex && styles.hover)}
              >
                {attr.column.name}
              </li>
            ))}
        </ul>
        <div
          onMouseOut={() => setHighlightIndex(null)}
          className="chart-canvas"
          style={{ height: 'min(40vh, 20rem)', width: 'min(40vh, 20rem)' }}
        >
          <AnimatedDoughnut
            style={{
              position: 'absolute',
              backgroundColor: '#00000000',
            }}
            data={{
              labels: displayAttributes.map((attr) => attr.column.name),
              datasets: [
                {
                  data: displayAttributes.map((attr) => attr.value),
                  backgroundColor: displayAttributes.map((attr) =>
                    attr.column.name === 'Other'
                      ? styles.otherSectionColor
                      : styles.standardSectionColor
                  ),
                  hoverBackgroundColor: styles.hoverSectionColor,

                  borderColor: '#ffffff',
                  hoverBorderColor: '#ffffff',
                  borderWidth: 0.2 * rem,
                  hoverOffset: 1 * rem,
                },
              ],
            }}
            options={{
              onClick: handleSelect,
              onHover: (e: any) => {
                setHighlightIndex(
                  e?.chart?._active?.length ? e.chart._active[0].index : null
                );
              },
              maintainAspectRatio: false,
              responsive: true,
              cutout: '50%',
              // @ts-ignore
              cutoutPercentage: 10,
              layout: {
                padding: 1 * rem,
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  displayColors: false,
                  cornerRadius: 1 * rem,
                  backgroundColor: '#e5e5e5',
                  titleColor: '#000000',
                  titleAlign: 'center',
                  titleFont: {
                    family: "'Roboto', sans-serif",
                    size: 1 * rem,
                    weight: '600',
                  },
                  bodyColor: '#000000',
                  bodyAlign: 'center',
                  bodyFont: {
                    family: "'Roboto', sans-serif",
                    size: 1 * rem,
                    weight: '400',
                  },
                  titleMarginBottom: 0.5 * rem,
                  padding: 1 * rem,
                  callbacks: {
                    label: (tooltipItem: any) => tooltipItem.label,
                  },
                },
              },
              animation: {
                animateRotate: false,
              },
            }}
          />
        </div>
      </div>
      <div className={styles.selectedAttributes}>
        {selectedAttributeIndices.map((attributeIndex) => {
          const attr = attributes.find(
            (e) => e.column.index === attributeIndex
          );
          return (
            attr && (
              <span key={attributeIndex} onClick={() => removeAttribute(attr)}>
                {attr.column.name}
              </span>
            )
          );
        })}
      </div>
    </div>
  );
};

export default Chart;
