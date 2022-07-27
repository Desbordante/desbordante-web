import React, { useContext } from "react";

import FDAlgorithmProps from "./FDAlgorithmProps";
import CFDAlgorithmProps from "./CFDAlgorithmProps";
import ARAlgorithmProps from "./ARAlgorithmProps";
import EDPAlgorithmProps from "./EDPAlgorithmProps";
import { FileFormContext } from "../../FileFormContext";
import { PrimitiveType } from "../../../types/globalTypes";

const ChooseAlgorithmProps = () => {
  const { primitiveType } = useContext(FileFormContext)!;

  const is = (type: `${PrimitiveType}`) => primitiveType === type;

  return (
    <>
      {is("FD") && <FDAlgorithmProps />}
      {is("CFD") && <CFDAlgorithmProps />}
      {is("AR") && <ARAlgorithmProps />}
      {is("TypoFD") && <EDPAlgorithmProps />}
    </>
  );
};

export default ChooseAlgorithmProps;
