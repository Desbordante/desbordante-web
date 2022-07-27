import React, { useCallback, useContext } from "react";
import { Col, Row } from "react-bootstrap";
import PieChartFull from "./PieChartFull/PieChartFull";
import { TaskContext } from "../../TaskContext";
import { setFilterParams } from "../../../constants/primitives";

const Charts = () => {
  const { pieChartData, intersectionFilter, setIntersectionFilter } =
    useContext(TaskContext)!;

  const { mustContainLhsColIndices, mustContainRhsColIndices } = intersectionFilter;

  const setSelectedAttributesLHS = useCallback(
    (n: number[]) =>
      setIntersectionFilter(setFilterParams({ mustContainLhsColIndices: n})),
    []
  );

  const setSelectedAttributesRHS = useCallback(
    (n: number[]) =>
      setIntersectionFilter(setFilterParams({ mustContainRhsColIndices: n})),
    []
  );

  const getAttributes = (side: "lhs" | "rhs") => {
    if (pieChartData?.__typename === "FDTaskResult") {
      return pieChartData.FD.withoutPatterns[side];
    }
    return [];
  }

  return (
    <Row className="w-100 flex-grow-1 justify-content-evenly">
      <Col xl={6} className="mt-5">
        <PieChartFull
          title="Left-hand side"
          attributes={getAttributes("lhs")}
          selectedAttributeIndices={mustContainLhsColIndices || []}
          setSelectedAttributeIndices={setSelectedAttributesLHS}
        />
      </Col>
      <Col xl={6} className="mt-5">
        <PieChartFull
          title="Right-hand side"
          attributes={getAttributes("rhs")}
          maxItemsSelected={4}
          selectedAttributeIndices={mustContainRhsColIndices || []}
          setSelectedAttributeIndices={setSelectedAttributesRHS}
        />
      </Col>
    </Row>
  );
};

export default Charts;
