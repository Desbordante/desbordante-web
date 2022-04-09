import React, { useContext } from "react";

import FDAlgorithmProps from "./FDAlgorithmProps";
import CFDAlgorithmProps from "./CFDAlgorithmProps";
import ARAlgorithmProps from "./ARAlgorithmProps";
import EDPAlgorithmProps from "./EDPAlgorithmProps";
import { FileFormContext } from "../../FileFormContext";
import { PrimitiveType } from "../../../types/globalTypes";

const ChooseAlgorithmProps = () => {
  const { primitiveType } = useContext(FileFormContext)!;

  return (
    <>
      {primitiveType === PrimitiveType.FD && <FDAlgorithmProps />}
      {primitiveType === PrimitiveType.CFD && <CFDAlgorithmProps />}
      {primitiveType === PrimitiveType.AR && <ARAlgorithmProps />}
      {primitiveType === PrimitiveType.TypoFD && <EDPAlgorithmProps />}
    </>
  );
};

export default ChooseAlgorithmProps;
