import React, { useContext } from "react";
import { Col, Container, Row } from "react-bootstrap";
import styled from "styled-components";

import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";
import Toggle from "../Toggle/Toggle";
import { FileFormContext } from "../FileFormContext";
import { AlgorithmConfigContext } from "../AlgorithmConfigContext";

const DatasetStats = styled(Col)`
  transition: 0.3s;
`;

interface Props {
  disable: () => void;
}

const BuiltinDatasetSelector: React.FC<Props> = ({ disable }) => {
  const { dataset, setDataset, primitiveType } = useContext(FileFormContext)!;
  const { allowedValues } = useContext(AlgorithmConfigContext)!;

  return (
    <PopupWindowContainer onOutsideClick={disable}>
      <Container className="p-5 bg-dark rounded-3 shadow-lg w-auto">
        {allowedValues.allowedBuiltinDatasets &&
          allowedValues.allowedBuiltinDatasets
            .filter((builtinDataset) =>
              builtinDataset.supportedPrimitives.includes(primitiveType)
            )
            .map((builtinDataset) => (
              <Row className="my-3">
                <Col>
                  <Toggle
                    toggleCondition={builtinDataset === dataset}
                    onClick={() => setDataset(builtinDataset)}
                    key={builtinDataset.fileID}
                    className="mx-2"
                  >
                    {builtinDataset.fileName}
                  </Toggle>
                </Col>
                <DatasetStats
                  className={`
                    ${
                      builtinDataset === dataset ? "text-white" : "text-grey"
                    } d-flex align-items-center
                  `}
                >
                  {builtinDataset.countOfColumns} columns,{" "}
                  {builtinDataset.rowsCount} rows
                </DatasetStats>
              </Row>
            ))}
      </Container>
    </PopupWindowContainer>
  );
};

export default BuiltinDatasetSelector;
