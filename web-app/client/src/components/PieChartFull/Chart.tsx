import React from "react";
import { Doughnut } from "react-chartjs-2";
import { animated } from "react-spring";

import { attribute } from "../../types/types";
import "./PieChartFull.scss";
import AttributeLabel from "../AttributeLabel/AttributeLabel";
import SelectedAttribute from "../SelectedAttribute/SelectedAttribute";
import {
  taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_rhs,
  taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_lhs,
} from "../../graphql/operations/queries/__generated__/taskInfo";

/* eslint-disable no-unused-vars */
interface Props {
  displayAttributes:
    | taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_rhs[]
    | taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_lhs[];
  onSelect: (a: any, b: any) => void;
  selectedAttributes?:
    | taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_rhs[]
    | taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_lhs[];
  setSelectedAttributes: React.Dispatch<React.SetStateAction<attribute[]>>;
}
/* eslint-enable no-unused-vars */

const Chart: React.FC<Props> = ({
  displayAttributes,
  onSelect,
  selectedAttributes,
  setSelectedAttributes,
}) => {
  // Get how much px is one rem, later used in chart dimensions
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

  // Pre-defined colors
  const colors = [
    "#ff5757",
    "#575fff",
    "#4de3a2",
    "#edc645",
    "#d159de",
    "#32bbc2",
    "#ffa857",
    "#8dd44a",
    "#6298d1",
    "#969696",
  ];

  const AnimatedDoughnut = animated(Doughnut);
  return (
    <>
      <div className="d-flex">
        <div className="d-flex flex-column justify-content-center">
          {displayAttributes
            .filter((attr) => attr.value)
            .map((attr, index) => (
              <AttributeLabel
                text={attr.column.name}
                labelColor={colors[index]}
                key={attr.column.name}
              />
            ))}
        </div>
        <div className="chart-canvas">
          <AnimatedDoughnut
            style={{
              position: "absolute",
              backgroundColor: "#00000000",
            }}
            data={{
              labels: displayAttributes.map((attr) => attr.column.name),
              datasets: [
                {
                  data: displayAttributes.map((attr) => attr.value),
                  backgroundColor: colors,
                  borderColor: "#ffffff",
                  hoverBorderColor: "#ffffff",
                  borderWidth: 0.2 * rem,
                  hoverOffset: 1 * rem,
                },
              ],
            }}
            options={{
              onClick: onSelect,
              maintainAspectRatio: false,
              responsive: true,
              cutout: "50%",
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
                  backgroundColor: "#e5e5e5",
                  titleColor: "#000000",
                  titleAlign: "center",
                  titleFont: {
                    family: "'Roboto', sans-serif",
                    size: 1 * rem,
                    weight: "600",
                  },
                  bodyColor: "#000000",
                  bodyAlign: "center",
                  bodyFont: {
                    family: "'Roboto', sans-serif",
                    size: 1 * rem,
                    weight: "400",
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
      <div className="d-flex flex-wrap justify-content-center">
        {selectedAttributes &&
          selectedAttributes.map((attr, index) => (
            <SelectedAttribute
              onClick={() => {
                setSelectedAttributes(
                  selectedAttributes.filter((_, idx) => index !== idx)
                );
              }}
              key={attr.column.name}
              text={attr.column.name}
            />
          ))}
      </div>
    </>
  );
};

export default Chart;
