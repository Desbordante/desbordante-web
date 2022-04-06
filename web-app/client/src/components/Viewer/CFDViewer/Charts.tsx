import React, { useCallback, useContext, useState } from "react";
import { Col, Row } from "react-bootstrap";
import PieChartFull from "./PieChartFull/PieChartFull";
import { TaskContext } from "../../TaskContext";

const Charts = () => {
  const { pieChartData, primitiveFilter, setPrimitiveFilter } =
    useContext(TaskContext)!;

  // const { mustContainLhsColIndices, mustContainRhsColIndices } =
  //   primitiveFilter.CFD;

  // const setSelectedAttributesLHS = useCallback(
  //   (n: number[]) =>
  //     setPrimitiveFilter((prev) => {
  //       const newFilter = { ...prev };
  //       newFilter.CFD.mustContainLhsColIndices = n;
  //       return newFilter;
  //     }),
  //   []
  // );
  //
  // const setSelectedAttributesRHS = useCallback(
  //   (n: number[]) =>
  //     setPrimitiveFilter((prev) => {
  //       const newFilter = { ...prev };
  //       newFilter.CFD.mustContainRhsColIndices = n;
  //       return newFilter;
  //     }),
  //   []
  // );

  const [mustContainLhsColIndices, setSelectedAttributesLHS] = useState<
    number[]
  >([]);
  const [mustContainRhsColIndices, setSelectedAttributesRHS] = useState<
    number[]
  >([]);

  return (
    <Row className="w-100 flex-grow-1 justify-content-evenly">
      <Col xl={6} className="mt-5">
        <PieChartFull
          title="Left-hand side"
          attributes={pieChartData!.CFD!.withoutPatterns.lhs}
          selectedAttributeIndices={mustContainLhsColIndices || []}
          setSelectedAttributeIndices={setSelectedAttributesLHS}
        />
      </Col>
      <Col xl={6} className="mt-5">
        <PieChartFull
          title="Right-hand side"
          attributes={pieChartData!.CFD!.withoutPatterns.rhs}
          maxItemsSelected={4}
          selectedAttributeIndices={mustContainRhsColIndices || []}
          setSelectedAttributeIndices={setSelectedAttributesRHS}
        />
      </Col>
    </Row>
  );
};

export default Charts;
