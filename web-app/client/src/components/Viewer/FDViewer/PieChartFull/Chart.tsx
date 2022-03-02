import React from "react";
import { Doughnut } from "react-chartjs-2";
import { animated } from "react-spring";

import "./PieChartFull.scss";
import AttributeLabel from "../../../AttributeLabel/AttributeLabel";
import SelectedAttribute from "../../../SelectedAttribute/SelectedAttribute";
import { FDAttribute } from "../../../../types/taskInfo";
import colors from "../../../../colors";

/* eslint-disable no-unused-vars */
interface Props {
  displayAttributes: FDAttribute[];
  onSelect: (a: any, b: any) => void;
  selectedAttributes?: FDAttribute[];
  setSelectedAttributes: React.Dispatch<React.SetStateAction<FDAttribute[]>>;
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
                labelColor={colors.chart[index]}
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
                  backgroundColor: colors.chart,
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
