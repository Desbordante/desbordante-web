import React, { useCallback, useContext } from "react";
import { Col, Row } from "react-bootstrap";
import PieChartFull from "./PieChartFull/PieChartFull";
import { TaskContext } from "../../TaskContext";

const Charts = () => {
  const { pieChartData, primitiveFilter, setPrimitiveFilter } =
    useContext(TaskContext)!;

  const { mustContainLhsColIndices, mustContainRhsColIndices } =
    primitiveFilter.FD;

  const setSelectedAttributesLHS = useCallback(
    (n: number[]) =>
      setPrimitiveFilter((prev) => {
        const newFilter = { ...prev };
        newFilter.FD.mustContainLhsColIndices = n;
        return newFilter;
      }),
    []
  );

  const setSelectedAttributesRHS = useCallback(
    (n: number[]) =>
      setPrimitiveFilter((prev) => {
        const newFilter = { ...prev };
        newFilter.FD.mustContainRhsColIndices = n;
        return newFilter;
      }),
    []
  );

  return (
    <Row className="w-100 flex-grow-1 justify-content-evenly">
      <Col xl={6} className="mt-5">
        <PieChartFull
          title="Left-hand side"
          attributes={pieChartData!.FD!.lhs}
          selectedAttributeIndices={mustContainLhsColIndices || []}
          setSelectedAttributeIndices={setSelectedAttributesLHS}
        />
      </Col>
      <Col xl={6} className="mt-5">
        <PieChartFull
          title="Right-hand side"
          attributes={pieChartData!.FD!.rhs}
          maxItemsSelected={4}
          selectedAttributeIndices={mustContainRhsColIndices || []}
          setSelectedAttributeIndices={setSelectedAttributesRHS}
        />
      </Col>
    </Row>
  );
};

export default Charts;
